// ─────────────────────────────────────────────────────────────
//  NSE Data Service
//
//  NSE blocks direct browser requests (CORS + cookie-based auth).
//  This service uses a CORS proxy to fetch live data.
//
//  THREE TIERS:
//    1. allorigins.win  — free CORS proxy (primary)
//    2. api.allorigins.win  — fallback proxy
//    3. Simulated data  — always works, used as final fallback
//
//  For production, deploy your own proxy:
//    Option A: Cloudflare Worker (free, fast)  — see /docs/cf-worker.js
//    Option B: Node.js Express proxy           — see /docs/nse-proxy.js
//    Option C: Set REACT_APP_NSE_PROXY_URL in .env
// ─────────────────────────────────────────────────────────────

const PROXY_PRIMARY   = 'https://api.allorigins.win/get?url=';
const PROXY_SECONDARY = 'https://corsproxy.io/?';
const CUSTOM_PROXY    = process.env.REACT_APP_NSE_PROXY_URL || null;

const NSE_BASE = 'https://www.nseindia.com/api';
const HEADERS  = { 'User-Agent': 'Mozilla/5.0 (compatible)' };
const TIMEOUT  = 8000;

// ── Fetch with timeout ────────────────────────────────────────
async function fetchWithTimeout(url, ms = TIMEOUT) {
  const ctrl = new AbortController();
  const id   = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// ── Proxy wrapper — tries each proxy in order ─────────────────
async function proxyFetch(nseUrl) {
  const proxies = [
    CUSTOM_PROXY   ? `${CUSTOM_PROXY}${encodeURIComponent(nseUrl)}` : null,
    `${PROXY_PRIMARY}${encodeURIComponent(nseUrl)}`,
    `${PROXY_SECONDARY}${encodeURIComponent(nseUrl)}`,
  ].filter(Boolean);

  for (const proxyUrl of proxies) {
    try {
      const res  = await fetchWithTimeout(proxyUrl);
      if (!res.ok) continue;
      const body = await res.json();
      // allorigins wraps in { contents: "..." }
      const text = body.contents ?? JSON.stringify(body);
      if (!text || text.startsWith('<')) continue;
      return JSON.parse(text);
    } catch (_) {
      continue;
    }
  }
  return null;
}

// ── Column normaliser ─────────────────────────────────────────
const FIELD_MAP = [
  { out: 'symbol',   candidates: ['symbol', 'Symbol'] },
  { out: 'open',     candidates: ['open_price', 'openPrice', 'open'] },
  { out: 'high',     candidates: ['high_price', 'highPrice', 'high'] },
  { out: 'low',      candidates: ['low_price',  'lowPrice',  'low']  },
  { out: 'prevClose',candidates: ['prev_price', 'previousClose', 'prevClose'] },
  { out: 'ltp',      candidates: ['ltp', 'lastPrice', 'ltP'] },
  { out: 'pctChg',   candidates: ['perChange', 'net_price', 'pChange', 'percentChange'] },
  { out: 'volume',   candidates: ['trade_quantity', 'tradedQuantity', 'totalTradedVolume'] },
  { out: 'vwap',     candidates: ['vwap', 'iep', 'wAvg'] },
];

function normalise(record) {
  const out = {};
  for (const { out: key, candidates } of FIELD_MAP) {
    for (const c of candidates) {
      if (record[c] !== undefined && record[c] !== null && record[c] !== '') {
        out[key] = record[c];
        break;
      }
    }
  }
  return out;
}

function extractRecords(data) {
  if (!data) return [];
  // Try common NSE response shapes
  for (const key of ['FOSec', 'SecGtr20', 'SecLwr20', 'allSec', 'data', 'NIFTY']) {
    const val = data[key];
    if (!val) continue;
    if (Array.isArray(val) && val.length && typeof val[0] === 'object') return val;
    if (val?.data && Array.isArray(val.data)) return val.data;
  }
  if (Array.isArray(data) && data.length && typeof data[0] === 'object') return data;
  return [];
}

// ── Camarilla levels from prev-day OHLC ──────────────────────
function camarilla(h, l, c) {
  const rng = h - l;
  return {
    R5: c + rng * (1.1 / 1.423),
    R4: c + rng * (1.1 / 2),
    R3: c + rng * (1.1 / 4),
    S3: c - rng * (1.1 / 4),
    S4: c - rng * (1.1 / 2),
    S5: c - rng * (1.1 / 1.423),
  };
}

// ── CPR classification ────────────────────────────────────────
function cprThreshold(price) {
  if (price < 200)  return 0.20;
  if (price < 500)  return 0.18;
  if (price < 1500) return 0.15;
  if (price < 5000) return 0.12;
  return 0.10;
}

function classifyCPR(widthPct, price) {
  const t = cprThreshold(price);
  if (widthPct < t * 2) return { cls: 'NARROW', tight: t };
  if (widthPct < t * 3) return { cls: 'SEMI',   tight: t };
  return                       { cls: 'WIDE',   tight: t };
}

// ── Signal engine (mirrors nse_fno_strategy_v8.py) ───────────
function generateSignalFromRecord(rec) {
  const ltp      = parseFloat(rec.ltp     || 0);
  const prevC    = parseFloat(rec.prevClose|| ltp);
  const vwap     = parseFloat(rec.vwap    || 0);
  const pctChg   = parseFloat(rec.pctChg  || 0);
  const vol      = parseFloat(rec.volume  || 0);
  if (!ltp || !prevC) return null;

  // Estimate prev H/L if not available (±2% fallback)
  const prevH = parseFloat(rec.high || prevC * 1.018);
  const prevL = parseFloat(rec.low  || prevC * 0.982);

  // CPR
  const pivot   = (prevH + prevL + prevC) / 3;
  const bc      = (prevH + prevL) / 2;
  const tc      = (pivot - bc) + pivot;
  const cprTop  = Math.max(tc, bc);
  const cprBot  = Math.min(tc, bc);
  const cprWPct = pivot > 0 ? Math.abs(cprTop - cprBot) / pivot * 100 : 999;
  const { cls } = classifyCPR(cprWPct, prevC);

  // Camarilla
  const lvl  = camarilla(prevH, prevL, prevC);
  const r3   = parseFloat(lvl.R3.toFixed(2));
  const s3   = parseFloat(lvl.S3.toFixed(2));
  const r4   = parseFloat(lvl.R4.toFixed(2));
  const s4   = parseFloat(lvl.S4.toFixed(2));
  const r5   = parseFloat(lvl.R5.toFixed(2));
  const s5   = parseFloat(lvl.S5.toFixed(2));

  // VWAP fallback to pivot if NSE VWAP = LTP or missing
  const effectiveVwap = (vwap > 0 && Math.abs(vwap - ltp) > 0.01) ? vwap : pivot;

  // ATR estimate
  const atr = parseFloat(((prevH - prevL) * 0.6).toFixed(2));

  // SL / TP
  const hardSlLong  = ltp >= r4 ? parseFloat((Math.max(effectiveVwap, r3) - atr * 0.3).toFixed(2)) : parseFloat((r4 - atr * 0.5).toFixed(2));
  const hardSlShort = ltp <= s4 ? parseFloat((Math.min(effectiveVwap, s3) + atr * 0.3).toFixed(2)) : parseFloat((s4 + atr * 0.5).toFixed(2));
  const tp1Long     = ltp >= r4 ? r5 : r4;
  const tp1Short    = ltp <= s4 ? s5 : s4;
  const tp2Long     = r5;
  const tp2Short    = s5;

  // R:R
  const riskLong  = Math.abs(ltp - hardSlLong);
  const rewLong   = Math.abs(tp1Long  - ltp);
  const rrLong    = riskLong  > 0 ? parseFloat((rewLong  / riskLong).toFixed(2))  : 0;
  const riskShort = Math.abs(ltp - hardSlShort);
  const rewShort  = Math.abs(tp1Short - ltp);
  const rrShort   = riskShort > 0 ? parseFloat((rewShort / riskShort).toFixed(2)) : 0;

  const MIN_RR    = 1.5;
  const r3Buf     = r3 * 0.001;
  const s3Buf     = s3 * 0.001;
  const vwapBuf   = ltp * 0.0005;
  const tradeable = cls !== 'WIDE';

  let signal = null;

  // Gate A — NARROW / SEMI
  if (tradeable && ltp > (r3 + r3Buf) && ltp > (effectiveVwap - vwapBuf) && rrLong >= MIN_RR && pctChg >= (cls === 'NARROW' ? 0.3 : 0.2)) {
    signal = { dir: 'LONG',  type: `LONG-${cls}`,  hardSL: hardSlLong,  tp1: tp1Long,  tp2: tp2Long,  rr: rrLong,  isLong: true  };
  } else if (tradeable && ltp < (s3 - s3Buf) && ltp < (effectiveVwap + vwapBuf) && rrShort >= MIN_RR && pctChg <= (cls === 'NARROW' ? -0.3 : -0.2)) {
    signal = { dir: 'SHORT', type: `SHORT-${cls}`, hardSL: hardSlShort, tp1: tp1Short, tp2: tp2Short, rr: rrShort, isLong: false };
  // Gate B — WIDE CPR momentum
  } else if (cls === 'WIDE' && pctChg >= 2.0 && ltp > (r3 + r3Buf) && ltp > (effectiveVwap - vwapBuf) && rrLong >= MIN_RR) {
    signal = { dir: 'LONG',  type: 'LONG-MOMENTUM',  hardSL: hardSlLong,  tp1: tp1Long,  tp2: tp2Long,  rr: rrLong,  isLong: true  };
  } else if (cls === 'WIDE' && pctChg <= -2.0 && ltp < (s3 - s3Buf) && ltp < (effectiveVwap + vwapBuf) && rrShort >= MIN_RR) {
    signal = { dir: 'SHORT', type: 'SHORT-MOMENTUM', hardSL: hardSlShort, tp1: tp1Short, tp2: tp2Short, rr: rrShort, isLong: false };
  }

  if (!signal) return null;

  const now = new Date();
  return {
    id:      `${rec.symbol}-${Date.now()}`,
    sym:     rec.symbol || '?',
    signal:  signal.type,
    cprCls:  cls,
    cprW:    `${cprWPct.toFixed(3)}%`,
    cprWRs:  `₹${Math.abs(cprTop - cprBot).toFixed(2)}`,
    ltp:     `₹${ltp.toLocaleString('en-IN')}`,
    ltpRaw:  ltp,
    pctChg,
    vwap:    `₹${effectiveVwap.toFixed(2)}`,
    r3:      `₹${r3}`,
    s3:      `₹${s3}`,
    hardSL:  `₹${signal.hardSL}`,
    tp1:     `₹${signal.tp1}`,
    tp2:     `₹${signal.tp2}`,
    rr:      signal.rr,
    size:    cls === 'SEMI' ? '0.5×' : '1.0×',
    time:    `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
    isNew:   true,
    source:  'LIVE',
  };
}

// ── Public API ────────────────────────────────────────────────
export async function fetchLiveSignals() {
  const GAINERS_URLS = [
    `${NSE_BASE}/live-analysis-variations?index=gainers&type=securities`,
    `${NSE_BASE}/live-analysis-variations?index=gainers&type=fno`,
  ];
  const LOSERS_URLS = [
    `${NSE_BASE}/live-analysis-variations?index=loosers&type=securities`,
    `${NSE_BASE}/live-analysis-variations?index=loosers&type=fno`,
  ];

  let gRecords = [], lRecords = [];

  for (const url of GAINERS_URLS) {
    const data = await proxyFetch(url);
    gRecords = extractRecords(data);
    if (gRecords.length) break;
  }
  for (const url of LOSERS_URLS) {
    const data = await proxyFetch(url);
    lRecords = extractRecords(data);
    if (lRecords.length) break;
  }

  const allRecords = [...gRecords, ...lRecords].slice(0, 40);
  if (!allRecords.length) return { signals: [], source: 'FAILED', error: 'Could not reach NSE API' };

  const normed  = allRecords.map(normalise).filter(r => r.symbol && r.ltp);
  const signals = normed.map(generateSignalFromRecord).filter(Boolean);

  return {
    signals,
    source:   'LIVE',
    total:    normed.length,
    fetched:  allRecords.length,
    ts:       new Date().toISOString(),
  };
}

export async function fetchNiftyPrice() {
  try {
    const data = await proxyFetch(`${NSE_BASE}/equity-stockIndices?index=NIFTY%2050`);
    const meta = data?.data?.[0];
    if (meta) {
      return {
        price:  parseFloat(meta.lastPrice || meta.ltP || 0).toLocaleString('en-IN'),
        change: parseFloat(meta.change    || meta.perChange || 0).toFixed(2),
        pct:    parseFloat(meta.pChange   || meta.perChange || 0).toFixed(2),
      };
    }
  } catch (_) {}
  return null;
}

// Export the signal engine for testing / simulation
export { generateSignalFromRecord, classifyCPR, camarilla };
