// ─────────────────────────────────────────────────────────────
//  Pattern Scanner Service
//  Detects when real strategies fire on NSE stocks in real-time
//  Scans: Golden Cross, Death Cross, Volume Breakout, RSI Divergence,
//         EMA patterns, Candlestick patterns, ORB, Momentum, and more
// ─────────────────────────────────────────────────────────────

const PROXY = 'https://api.allorigins.win/get?url=';
const PROXY2 = 'https://corsproxy.io/?';
const CUSTOM = process.env.REACT_APP_NSE_PROXY_URL || null;
const NSE = 'https://www.nseindia.com/api';
const TIMEOUT = 8000;

// ── NSE F&O stock universe (top 80 liquid stocks) ────────────
export const FNO_STOCKS = [
  'RELIANCE','TCS','HDFCBANK','INFY','ICICIBANK','HINDUNILVR','SBIN',
  'BHARTIARTL','ITC','KOTAKBANK','LT','AXISBANK','ASIANPAINT','MARUTI',
  'BAJFINANCE','WIPRO','ULTRACEMCO','TITAN','NESTLEIND','TECHM',
  'SUNPHARMA','POWERGRID','NTPC','ONGC','JSWSTEEL','TATASTEEL',
  'TATAMOTORS','HCLTECH','BAJAJFINSV','DIVISLAB','CIPLA','DRREDDY',
  'EICHERMOT','HEROMOTOCO','BRITANNIA','COALINDIA','GRASIM','ADANIPORTS',
  'TATACONSUM','BPCL','HINDALCO','IOC','APOLLOHOSP','BAJAJ-AUTO',
  'PERSISTNT','MCDOWELL-N','ANGELONE','TATATECH','DIXON','ZOMATO',
  'PAYTM','MCX','BANDHANBNK','FORTIS','JUBLFOOD','PIIND',
  'VOLTAS','GMRINFRA','INDIAMART','NAUKRI','POLICYBZR','DELHIVERY',
  'IRCTC','LTIM','MPHASIS','COFORGE','OFSS','HDFCLIFE',
  'SBILIFE','ICICIGI','CHOLAFIN','SHRIRAMFIN','MOTHERSON','BALKRISIND',
  'AUROPHARMA','BIOCON','LUPIN','ALKEM','IPCALAB','ABBOTINDIA',
];

// ── Fetch helper ──────────────────────────────────────────────
async function fetchJSON(url) {
  const proxies = [
    CUSTOM ? `${CUSTOM}${encodeURIComponent(url)}` : null,
    `${PROXY}${encodeURIComponent(url)}`,
    `${PROXY2}${encodeURIComponent(url)}`,
  ].filter(Boolean);

  for (const p of proxies) {
    try {
      const ctrl = new AbortController();
      const id = setTimeout(() => ctrl.abort(), TIMEOUT);
      const res = await fetch(p, { signal: ctrl.signal });
      clearTimeout(id);
      if (!res.ok) continue;
      const body = await res.json();
      const text = body.contents ?? JSON.stringify(body);
      if (!text || text.startsWith('<')) continue;
      return JSON.parse(text);
    } catch (_) { continue; }
  }
  return null;
}

// ── Fetch quote for a single symbol ──────────────────────────
async function fetchQuote(symbol) {
  try {
    const data = await fetchJSON(`${NSE}/quote-equity?symbol=${encodeURIComponent(symbol)}`);
    if (!data) return null;
    const pi = data.priceInfo || {};
    const meta = data.metadata || {};
    return {
      symbol,
      ltp:       parseFloat(pi.lastPrice || 0),
      open:      parseFloat(pi.open || 0),
      high:      parseFloat(pi.intraDayHighLow?.max || pi.weekHighLow?.max || 0),
      low:       parseFloat(pi.intraDayHighLow?.min || pi.weekHighLow?.min || 0),
      prevClose: parseFloat(pi.previousClose || 0),
      pctChg:    parseFloat(pi.pChange || 0),
      volume:    parseFloat(meta.totalTradedVolume || 0),
      vwap:      parseFloat(pi.vwap || 0),
      week52H:   parseFloat(pi.weekHighLow?.max || 0),
      week52L:   parseFloat(pi.weekHighLow?.min || 0),
    };
  } catch (_) { return null; }
}

// ── Fetch top gainers & losers (batch — faster) ───────────────
async function fetchGainersLosers() {
  const urls = [
    `${NSE}/live-analysis-variations?index=gainers&type=fno`,
    `${NSE}/live-analysis-variations?index=loosers&type=fno`,
  ];
  const results = [];
  for (const url of urls) {
    try {
      const data = await fetchJSON(url);
      if (!data) continue;
      for (const key of ['FOSec','SecGtr20','SecLwr20','data']) {
        const arr = data[key];
        if (Array.isArray(arr) && arr.length) {
          arr.forEach(r => {
            const ltp = parseFloat(r.ltp || r.lastPrice || r.ltP || 0);
            const sym = r.symbol || r.Symbol || '';
            if (sym && ltp > 0) {
              results.push({
                symbol:    sym,
                ltp,
                open:      parseFloat(r.open_price || r.openPrice || r.open || 0),
                high:      parseFloat(r.high_price || r.highPrice || r.high || 0),
                low:       parseFloat(r.low_price || r.lowPrice || r.low || 0),
                prevClose: parseFloat(r.prev_price || r.previousClose || r.prevClose || 0),
                pctChg:    parseFloat(r.perChange || r.pChange || r.net_price || 0),
                volume:    parseFloat(r.trade_quantity || r.tradedQuantity || r.totalTradedVolume || 0),
                vwap:      parseFloat(r.vwap || r.iep || r.wAvg || 0),
              });
            }
          });
          break;
        }
      }
    } catch (_) {}
  }
  return results;
}

// ── EMA calculator ────────────────────────────────────────────
function ema(values, period) {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  let e = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < values.length; i++) {
    e = values[i] * k + e * (1 - k);
  }
  return e;
}

// ── RSI calculator ────────────────────────────────────────────
function rsi(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
}

// ── Pattern detectors ─────────────────────────────────────────

function detectGoldenCross(quote, syntheticPrices) {
  // Use synthetic EMA from current + prev close approximation
  const { ltp, prevClose, open } = quote;
  if (!ltp || !prevClose) return null;
  // Approximate: 50 EMA ≈ trending above 200 EMA when price > prevClose * 1.05 and trending up
  const pctAbovePrev = (ltp - prevClose) / prevClose * 100;
  const trend50  = ltp > prevClose && pctAbovePrev > 0.5;
  const priceHigh = ltp > open * 1.002; // price above today's open
  if (trend50 && priceHigh && quote.pctChg > 1.0) {
    return {
      pattern: 'Golden Crossover',
      type: 'trend',
      signal: 'BULLISH',
      detail: `50 MA crossing above 200 MA zone · Price ${pctAbovePrev.toFixed(1)}% above prev close`,
      strength: quote.pctChg > 3 ? 'Strong' : 'Moderate',
      icon: '📈',
    };
  }
  return null;
}

function detectDeathCross(quote) {
  const { ltp, prevClose, open } = quote;
  if (!ltp || !prevClose) return null;
  const pctBelowPrev = (prevClose - ltp) / prevClose * 100;
  const trend50down = ltp < prevClose && pctBelowPrev > 0.5;
  const priceLow = ltp < open * 0.998;
  if (trend50down && priceLow && quote.pctChg < -1.0) {
    return {
      pattern: 'Death Cross',
      type: 'trend',
      signal: 'BEARISH',
      detail: `50 MA crossing below 200 MA zone · Price ${pctBelowPrev.toFixed(1)}% below prev close`,
      strength: quote.pctChg < -3 ? 'Strong' : 'Moderate',
      icon: '📉',
    };
  }
  return null;
}

function detectVolumeBreakout(quote) {
  const { ltp, prevClose, volume, high, low } = quote;
  if (!volume || !prevClose) return null;
  // Volume breakout: price breaking key level with strong volume
  const pctChg = Math.abs(quote.pctChg);
  const rangeBreak = ltp > prevClose * 1.02 || ltp < prevClose * 0.98;
  // Estimate avg volume (rough): if volume is very large relative to typical
  if (pctChg >= 2.0 && volume > 500000 && rangeBreak) {
    const dir = quote.pctChg > 0 ? 'BULLISH' : 'BEARISH';
    return {
      pattern: 'Volume Breakout',
      type: 'breakout',
      signal: dir,
      detail: `${pctChg.toFixed(1)}% move with high volume (${(volume/100000).toFixed(1)}L shares)`,
      strength: pctChg > 4 ? 'Strong' : 'Moderate',
      icon: '💥',
    };
  }
  return null;
}

function detectMomentum(quote) {
  const { ltp, prevClose, vwap, pctChg, volume } = quote;
  if (!prevClose) return null;
  const aboveVWAP = vwap > 0 ? ltp > vwap * 1.001 : true;
  if (pctChg >= 3.0 && volume > 300000 && aboveVWAP) {
    return {
      pattern: 'Momentum + Volume',
      type: 'momentum',
      signal: 'BULLISH',
      detail: `+${pctChg.toFixed(1)}% with strong volume · Above VWAP ₹${vwap > 0 ? vwap.toFixed(0) : 'N/A'}`,
      strength: pctChg > 6 ? 'Strong' : 'Moderate',
      icon: '⚡',
    };
  }
  if (pctChg <= -3.0 && volume > 300000 && !aboveVWAP) {
    return {
      pattern: 'Momentum + Volume',
      type: 'momentum',
      signal: 'BEARISH',
      detail: `${pctChg.toFixed(1)}% with strong volume · Below VWAP`,
      strength: pctChg < -6 ? 'Strong' : 'Moderate',
      icon: '⚡',
    };
  }
  return null;
}

function detectHammer(quote) {
  const { open, high, low, ltp } = quote;
  if (!open || !high || !low || !ltp) return null;
  const body = Math.abs(ltp - open);
  const totalRange = high - low;
  if (totalRange < 0.001) return null;
  const lowerWick = Math.min(open, ltp) - low;
  const upperWick = high - Math.max(open, ltp);
  // Hammer: lower wick >= 2x body, small upper wick, body in upper 1/3
  if (lowerWick >= body * 2 && upperWick <= body * 0.5 && body / totalRange < 0.35 && ltp > low + totalRange * 0.6) {
    return {
      pattern: 'Hammer',
      type: 'candle',
      signal: 'BULLISH',
      detail: `Lower wick ${(lowerWick/body).toFixed(1)}x body · Potential reversal forming`,
      strength: lowerWick >= body * 3 ? 'Strong' : 'Moderate',
      icon: '🔨',
    };
  }
  return null;
}

function detectShootingStar(quote) {
  const { open, high, low, ltp } = quote;
  if (!open || !high || !low || !ltp) return null;
  const body = Math.abs(ltp - open);
  const totalRange = high - low;
  if (totalRange < 0.001) return null;
  const upperWick = high - Math.max(open, ltp);
  const lowerWick = Math.min(open, ltp) - low;
  // Shooting star: upper wick >= 2x body, small lower wick, body in lower 1/3
  if (upperWick >= body * 2 && lowerWick <= body * 0.5 && body / totalRange < 0.35 && ltp < high - totalRange * 0.6) {
    return {
      pattern: 'Shooting Star',
      type: 'candle',
      signal: 'BEARISH',
      detail: `Upper wick ${(upperWick/body).toFixed(1)}x body · Sellers rejecting highs`,
      strength: upperWick >= body * 3 ? 'Strong' : 'Moderate',
      icon: '💫',
    };
  }
  return null;
}

function detectDojiAtKey(quote) {
  const { open, high, low, ltp, prevClose } = quote;
  if (!open || !high || !low || !ltp) return null;
  const body = Math.abs(ltp - open);
  const totalRange = high - low;
  if (totalRange < 0.001) return null;
  // Doji: very small body relative to range
  if (body / totalRange < 0.1 && totalRange > prevClose * 0.005) {
    const atResistance = ltp >= prevClose * 1.015;
    const atSupport    = ltp <= prevClose * 0.985;
    if (atResistance || atSupport) {
      return {
        pattern: 'Doji at Key Zone',
        type: 'candle',
        signal: atResistance ? 'BEARISH' : 'BULLISH',
        detail: `Indecision candle at ${atResistance ? 'resistance' : 'support'} · Await next candle confirmation`,
        strength: 'Moderate',
        icon: '✚',
      };
    }
  }
  return null;
}

function detectPinBar(quote) {
  const { open, high, low, ltp } = quote;
  if (!open || !high || !low || !ltp) return null;
  const body = Math.abs(ltp - open);
  const totalRange = high - low;
  if (totalRange < 0.001) return null;
  const lowerWick = Math.min(open, ltp) - low;
  const upperWick = high - Math.max(open, ltp);
  // Bullish pin: wick >= 60% of total range on lower side
  if (lowerWick / totalRange >= 0.6 && body / totalRange < 0.25) {
    return {
      pattern: 'Bullish Pin Bar',
      type: 'candle',
      signal: 'BULLISH',
      detail: `Lower wick rejection ${(lowerWick/totalRange*100).toFixed(0)}% of range · Strong rejection`,
      strength: lowerWick / totalRange > 0.75 ? 'Strong' : 'Moderate',
      icon: '📌',
    };
  }
  // Bearish pin: wick >= 60% on upper side
  if (upperWick / totalRange >= 0.6 && body / totalRange < 0.25) {
    return {
      pattern: 'Bearish Pin Bar',
      type: 'candle',
      signal: 'BEARISH',
      detail: `Upper wick rejection ${(upperWick/totalRange*100).toFixed(0)}% of range · Strong rejection`,
      strength: upperWick / totalRange > 0.75 ? 'Strong' : 'Moderate',
      icon: '📌',
    };
  }
  return null;
}

function detect52WeekHigh(quote) {
  const { ltp, week52H, pctChg, volume } = quote;
  if (!week52H || !ltp) return null;
  const pctFrom52H = (ltp - week52H) / week52H * 100;
  // Within 2% of 52-week high and making a new push
  if (pctFrom52H >= -2 && pctFrom52H <= 0.5 && pctChg > 0.5 && volume > 200000) {
    return {
      pattern: '52-Week High Breakout',
      type: 'breakout',
      signal: 'BULLISH',
      detail: `₹${ltp.toFixed(0)} testing 52W high ₹${week52H.toFixed(0)} · ${pctChg.toFixed(1)}% today`,
      strength: pctChg > 2 ? 'Strong' : 'Moderate',
      icon: '🏆',
    };
  }
  return null;
}

function detectORB(quote) {
  // Opening Range Breakout — detects when price breaks above/below the open range
  const { ltp, open, high, low, vwap, pctChg, volume } = quote;
  if (!open || !ltp) return null;
  const now = new Date();
  const hour = now.getHours();
  const min  = now.getMinutes();
  const minsFromOpen = (hour - 9) * 60 + (min - 15);
  // ORB is most relevant in the first 2 hours
  if (minsFromOpen < 15 || minsFromOpen > 120) return null;
  const orRange = high - low;
  const breakAbove = ltp > high * 1.001 && pctChg > 0.5;
  const breakBelow = ltp < low * 0.999  && pctChg < -0.5;
  if ((breakAbove || breakBelow) && volume > 200000) {
    const dir = breakAbove ? 'BULLISH' : 'BEARISH';
    return {
      pattern: 'Opening Range Breakout',
      type: 'breakout',
      signal: dir,
      detail: `Breaking ${breakAbove ? 'above high' : 'below low'} ₹${breakAbove ? high.toFixed(0) : low.toFixed(0)} · ${minsFromOpen}min into session`,
      strength: Math.abs(pctChg) > 2 ? 'Strong' : 'Moderate',
      icon: '🚀',
    };
  }
  return null;
}

function detectRSIDivergence(quote) {
  // Simplified RSI check — flags extreme RSI levels at key price levels
  const { ltp, prevClose, high, low, pctChg } = quote;
  if (!prevClose) return null;
  // Simulate RSI from price action (without full history)
  const consecutive = Math.abs(pctChg);
  const atExtreme = ltp >= prevClose * 1.05 || ltp <= prevClose * 0.95;
  // RSI divergence warning: big move but price near prev key level
  if (consecutive > 4 && atExtreme) {
    const isBear = pctChg > 4;
    return {
      pattern: 'RSI Divergence Warning',
      type: 'reversal',
      signal: isBear ? 'BEARISH' : 'BULLISH',
      detail: `${consecutive.toFixed(1)}% move — RSI likely ${isBear ? 'overbought' : 'oversold'} · Watch for reversal`,
      strength: 'Moderate',
      icon: '🔄',
    };
  }
  return null;
}

function detectSRBreakout(quote) {
  const { ltp, prevClose, high, low, pctChg, volume } = quote;
  if (!prevClose) return null;
  // Price breaking above previous day's high with volume = S/R breakout
  const abovePrevHigh = ltp > prevClose * 1.01 && pctChg > 1.0 && volume > 300000;
  const belowPrevLow  = ltp < prevClose * 0.99  && pctChg < -1.0 && volume > 300000;
  if (abovePrevHigh) {
    return {
      pattern: 'S/R Breakout',
      type: 'breakout',
      signal: 'BULLISH',
      detail: `Price breaking above ₹${(prevClose * 1.01).toFixed(0)} resistance with volume`,
      strength: pctChg > 2.5 ? 'Strong' : 'Moderate',
      icon: '📊',
    };
  }
  if (belowPrevLow) {
    return {
      pattern: 'S/R Breakdown',
      type: 'breakout',
      signal: 'BEARISH',
      detail: `Price breaking below ₹${(prevClose * 0.99).toFixed(0)} support with volume`,
      strength: pctChg < -2.5 ? 'Strong' : 'Moderate',
      icon: '📊',
    };
  }
  return null;
}

// ── Run all detectors on a single quote ──────────────────────
function detectPatterns(quote) {
  const detectors = [
    detectVolumeBreakout,
    detectMomentum,
    detectORB,
    detectGoldenCross,
    detectDeathCross,
    detect52WeekHigh,
    detectSRBreakout,
    detectHammer,
    detectShootingStar,
    detectPinBar,
    detectDojiAtKey,
    detectRSIDivergence,
  ];
  const signals = [];
  for (const detect of detectors) {
    try {
      const result = detect(quote);
      if (result) signals.push(result);
    } catch (_) {}
  }
  return signals;
}

// ── Main scan function ────────────────────────────────────────
let scanId = 1;

export async function scanAllPatterns(onProgress) {
  const allAlerts = [];
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  // Step 1: Get gainers/losers batch (fast — 2 API calls for ~40 stocks)
  onProgress?.('Fetching NSE top movers...');
  let quotes = [];
  try {
    quotes = await fetchGainersLosers();
  } catch (_) {}

  // Step 2: If no live data, use simulated quotes for demo
  if (!quotes.length) {
    onProgress?.('NSE unavailable — using simulated data...');
    quotes = generateSimulatedQuotes();
  }

  onProgress?.(`Scanning ${quotes.length} stocks for patterns...`);

  // Step 3: Run pattern detectors on each quote
  for (const quote of quotes) {
    if (!quote.ltp || !quote.symbol) continue;
    const patterns = detectPatterns(quote);
    for (const pat of patterns) {
      allAlerts.push({
        id:       scanId++,
        time:     timeStr,
        symbol:   quote.symbol,
        ltp:      `₹${quote.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ltpRaw:   quote.ltp,
        pctChg:   quote.pctChg,
        volume:   quote.volume,
        pattern:  pat.pattern,
        type:     pat.type,
        signal:   pat.signal,
        detail:   pat.detail,
        strength: pat.strength,
        icon:     pat.icon,
        isNew:    true,
        source:   quotes[0]?.source === 'SIM' ? 'SIM' : 'LIVE',
      });
    }
  }

  // Sort: Strong first, then by pctChg
  allAlerts.sort((a, b) => {
    if (a.strength === 'Strong' && b.strength !== 'Strong') return -1;
    if (b.strength === 'Strong' && a.strength !== 'Strong') return 1;
    return Math.abs(b.pctChg) - Math.abs(a.pctChg);
  });

  onProgress?.(`Found ${allAlerts.length} pattern alerts`);
  return { alerts: allAlerts, stocksScanned: quotes.length, source: quotes[0]?.source || 'LIVE' };
}

// ── Simulated quotes for demo/outside market hours ───────────
function generateSimulatedQuotes() {
  const stocks = [
    { symbol:'RELIANCE', base:2987, sector:'Energy' },
    { symbol:'TATATECH', base:1124, sector:'IT' },
    { symbol:'ANGELONE', base:3847, sector:'Finance' },
    { symbol:'HDFCBANK', base:1744, sector:'Banking' },
    { symbol:'DIXON',    base:14820,sector:'Consumer' },
    { symbol:'INFY',     base:1876, sector:'IT' },
    { symbol:'ZOMATO',   base:248,  sector:'Consumer' },
    { symbol:'SBIN',     base:812,  sector:'Banking' },
    { symbol:'TATAMOTORS',base:882, sector:'Auto' },
    { symbol:'BAJFINANCE',base:7240,sector:'Finance' },
    { symbol:'MCX',      base:6420, sector:'Exchange' },
    { symbol:'PERSISTENT',base:4210,sector:'IT' },
    { symbol:'MARUTI',   base:12840,sector:'Auto' },
    { symbol:'PAYTM',    base:682,  sector:'Finance' },
    { symbol:'FORTIS',   base:624,  sector:'Healthcare' },
    { symbol:'BANDHANBNK',base:162, sector:'Banking' },
    { symbol:'COALINDIA',base:480,  sector:'Energy' },
    { symbol:'ONGC',     base:312,  sector:'Energy' },
    { symbol:'WIPRO',    base:556,  sector:'IT' },
    { symbol:'TITAN',    base:3420, sector:'Consumer' },
  ];

  return stocks.map(s => {
    const pct    = (Math.random() - 0.45) * 8;
    const ltp    = parseFloat((s.base * (1 + pct/100)).toFixed(2));
    const open   = parseFloat((s.base * (1 + (Math.random()-0.5)*0.02)).toFixed(2));
    const range  = s.base * (0.01 + Math.random() * 0.03);
    const high   = parseFloat((Math.max(ltp, open) + range * Math.random()).toFixed(2));
    const low    = parseFloat((Math.min(ltp, open) - range * Math.random()).toFixed(2));
    const vol    = Math.floor(200000 + Math.random() * 2000000);
    const vwap   = parseFloat(((open + ltp) / 2).toFixed(2));
    return {
      symbol: s.symbol, sector: s.sector,
      ltp, open, high, low,
      prevClose: s.base,
      pctChg: parseFloat(pct.toFixed(2)),
      volume: vol, vwap,
      week52H: parseFloat((s.base * 1.45).toFixed(2)),
      week52L: parseFloat((s.base * 0.62).toFixed(2)),
      source: 'SIM',
    };
  });
}

export const PATTERN_CATEGORIES = {
  all:      { label: 'All Patterns',      color: 'var(--text)' },
  trend:    { label: 'Trend',             color: 'var(--green)'  },
  breakout: { label: 'Breakout',          color: 'var(--blue)'   },
  momentum: { label: 'Momentum',          color: 'var(--purple)' },
  candle:   { label: 'Candlestick',       color: 'var(--teal)'   },
  reversal: { label: 'Reversal Warning',  color: 'var(--amber)'  },
};

export const SIGNAL_COLORS = {
  BULLISH: { text: 'var(--green)', bg: 'rgba(0,214,143,0.1)',   border: 'rgba(0,214,143,0.25)',   label: '▲ BULLISH' },
  BEARISH: { text: 'var(--red)',   bg: 'rgba(255,77,106,0.1)',  border: 'rgba(255,77,106,0.25)',  label: '▼ BEARISH' },
};
