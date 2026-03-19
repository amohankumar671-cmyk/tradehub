import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLiveSignals } from '../services/nseService';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';

// ── Static data pools ────────────────────────────────────────
const SYMBOLS = [
  { sym: 'ANGELONE',   price: 3847,  sector: 'Finance'   },
  { sym: 'TATATECH',   price: 1124,  sector: 'IT'        },
  { sym: 'BANDHANBNK', price: 162,   sector: 'Banking'   },
  { sym: 'DIXON',      price: 14820, sector: 'Consumer'  },
  { sym: 'PERSISTENT', price: 4210,  sector: 'IT'        },
  { sym: 'ZOMATO',     price: 248,   sector: 'Consumer'  },
  { sym: 'PAYTM',      price: 682,   sector: 'Finance'   },
  { sym: 'INFY',       price: 1876,  sector: 'IT'        },
  { sym: 'RELIANCE',   price: 2987,  sector: 'Energy'    },
  { sym: 'HDFCBANK',   price: 1744,  sector: 'Banking'   },
  { sym: 'TATAMOTORS', price: 882,   sector: 'Auto'      },
  { sym: 'MARUTI',     price: 12840, sector: 'Auto'      },
  { sym: 'BAJFINANCE', price: 7240,  sector: 'Finance'   },
  { sym: 'MCX',        price: 6420,  sector: 'Exchange'  },
  { sym: 'FORTIS',     price: 624,   sector: 'Healthcare'},
];

const CPR_CLASSES  = ['NARROW', 'SEMI', 'WIDE'];
const SIGNAL_TYPES = ['LONG-NARROW', 'SHORT-NARROW', 'LONG-SEMI', 'SHORT-SEMI', 'LONG-MOMENTUM', 'SHORT-MOMENTUM'];

const SIGNAL_STYLE = {
  'LONG-NARROW':    { label: '▲ LONG',   bg: '#00C851', color: '#000',    border: '#00a040' },
  'SHORT-NARROW':   { label: '▼ SHORT',  bg: '#FF3B30', color: '#fff',    border: '#cc2020' },
  'LONG-SEMI':      { label: '▲ LONG ⚠', bg: '#5cb85c', color: '#fff',    border: '#4cae4c' },
  'SHORT-SEMI':     { label: '▼ SHORT ⚠',bg: '#d9534f', color: '#fff',    border: '#c9302c' },
  'LONG-MOMENTUM':  { label: '▲ LONG 🚀', bg: '#FF8C00', color: '#fff',   border: '#cc7000' },
  'SHORT-MOMENTUM': { label: '▼ SHORT 🚀',bg: '#8B0000', color: '#fff',   border: '#600000' },
};

const CPR_STYLE = {
  NARROW: { label: 'NARROW', bg: 'rgba(0,214,143,0.12)',   color: '#00D68F' },
  SEMI:   { label: 'SEMI ⚠', bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  WIDE:   { label: 'WIDE',   bg: 'rgba(136,136,136,0.12)', color: '#8A9BB5' },
};

// ── Signal generator ─────────────────────────────────────────
let signalIdCounter = 1;

function makePriceBandThreshold(price) {
  if (price < 200)   return 0.20;
  if (price < 500)   return 0.18;
  if (price < 1500)  return 0.15;
  if (price < 5000)  return 0.12;
  return 0.10;
}

function generateSignal(forceNew = false) {
  const sym     = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const baseP   = sym.price;
  const ltp     = parseFloat((baseP * (1 + (Math.random() - 0.45) * 0.08)).toFixed(2));
  const tight   = makePriceBandThreshold(baseP);
  const isWide  = Math.random() > 0.65;
  const cprCls  = isWide ? 'WIDE' : Math.random() > 0.45 ? 'NARROW' : 'SEMI';
  const cprW    = parseFloat((tight * (cprCls === 'NARROW' ? 1.2 : cprCls === 'SEMI' ? 2.1 : 4.5)).toFixed(3));
  const cprWRs  = parseFloat((ltp * cprW / 100).toFixed(2));
  const vwap    = parseFloat((ltp * (1 + (Math.random() - 0.52) * 0.012)).toFixed(2));
  const pctChg  = parseFloat(((ltp - baseP) / baseP * 100).toFixed(2));
  const atr     = parseFloat(((baseP * 0.018)).toFixed(2));

  // Camarilla levels
  const range  = atr / 0.6;
  const r3 = parseFloat((sym.price + range * 1.1 / 4).toFixed(2));
  const r4 = parseFloat((sym.price + range * 1.1 / 2).toFixed(2));
  const r5 = parseFloat((sym.price + range * 1.1 / 1.423).toFixed(2));
  const s3 = parseFloat((sym.price - range * 1.1 / 4).toFixed(2));
  const s4 = parseFloat((sym.price - range * 1.1 / 2).toFixed(2));

  // Signal type
  let sigType;
  const isLong  = ltp > vwap;
  if (cprCls === 'WIDE' && Math.abs(pctChg) >= 2.0 && ltp > r3) {
    sigType = isLong ? 'LONG-MOMENTUM' : 'SHORT-MOMENTUM';
  } else if (cprCls !== 'WIDE') {
    sigType = isLong ? `LONG-${cprCls}` : `SHORT-${cprCls}`;
  } else {
    return null; // WIDE without momentum = no signal
  }

  const isLongSig = sigType.startsWith('LONG');
  const hardSL  = isLongSig ? parseFloat((r4 - atr * 0.5).toFixed(2)) : parseFloat((s4 + atr * 0.5).toFixed(2));
  const tp1     = isLongSig ? r4 : s4;
  const tp2     = isLongSig ? r5 : s4 - (r5 - r4);
  const risk    = Math.abs(ltp - hardSL);
  const rew     = Math.abs(tp1 - ltp);
  const rr      = risk > 0 ? parseFloat((rew / risk).toFixed(2)) : 0;

  if (rr < 1.5) return null;

  const now = new Date();
  const hh  = String(now.getHours()).padStart(2, '0');
  const mm  = String(now.getMinutes()).padStart(2, '0');

  return {
    id:        signalIdCounter++,
    sym:       sym.sym,
    sector:    sym.sector,
    signal:    sigType,
    cprCls,
    cprW:      `${cprW}%`,
    cprWRs:    `₹${cprWRs}`,
    ltp:       `₹${ltp.toLocaleString('en-IN')}`,
    ltpRaw:    ltp,
    pctChg,
    vwap:      `₹${vwap.toLocaleString('en-IN')}`,
    r3:        `₹${r3.toLocaleString('en-IN')}`,
    s3:        `₹${s3.toLocaleString('en-IN')}`,
    hardSL:    `₹${hardSL.toLocaleString('en-IN')}`,
    tp1:       `₹${tp1.toLocaleString('en-IN')}`,
    tp2:       `₹${tp2.toLocaleString('en-IN')}`,
    rr,
    size:      cprCls === 'SEMI' ? '0.5×' : '1.0×',
    time:      `${hh}:${mm}`,
    isNew:     forceNew,
  };
}

function generateInitialSignals(n = 8) {
  const results = [];
  let attempts = 0;
  while (results.length < n && attempts < 60) {
    const s = generateSignal(false);
    if (s) results.push(s);
    attempts++;
  }
  // Stagger times for realism
  const base = new Date();
  return results.map((s, i) => {
    const t = new Date(base.getTime() - (results.length - i) * 4 * 60 * 1000);
    return { ...s, time: `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`, isNew: false };
  });
}

// ── Sub-components ───────────────────────────────────────────
function SignalBadge({ type, size = 'md' }) {
  const st = SIGNAL_STYLE[type];
  if (!st) return null;
  const pad = size === 'sm' ? '2px 8px' : '4px 12px';
  const fs  = size === 'sm' ? 10 : 11;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:pad, borderRadius:5, fontSize:fs, fontWeight:700, background:st.bg, color:st.color, border:`1px solid ${st.border}`, letterSpacing:'0.3px', whiteSpace:'nowrap' }}>
      {st.label}
    </span>
  );
}

function CprBadge({ cls }) {
  const cs = CPR_STYLE[cls];
  if (!cs) return null;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 7px', borderRadius:4, fontSize:10, fontWeight:600, background:cs.bg, color:cs.color, whiteSpace:'nowrap' }}>
      {cs.label}
    </span>
  );
}

function SignalRow({ signal, isExpanded, onToggle }) {
  const isLong = signal.signal.startsWith('LONG');
  const rowBg  = signal.isNew
    ? (isLong ? 'rgba(0,200,81,0.07)' : 'rgba(255,59,48,0.07)')
    : signal.signal.includes('MOMENTUM')
      ? 'rgba(255,140,0,0.05)'
      : isLong ? 'rgba(0,214,143,0.04)' : 'rgba(255,77,106,0.04)';

  return (
    <>
      <tr
        onClick={onToggle}
        style={{ background: rowBg, cursor: 'pointer', transition: 'filter 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
      >
        <td style={{ padding:'10px 14px', fontFamily:'var(--mono)', fontSize:11, color:'var(--purple)', fontWeight:600 }}>
          {signal.time}
          {signal.isNew && <span style={{ marginLeft:6, fontSize:9, background:'#FF8C00', color:'#fff', padding:'1px 5px', borderRadius:3, fontWeight:700 }}>NEW</span>}
        </td>
        <td style={{ padding:'10px 10px' }}><strong style={{ fontSize:13 }}>{signal.sym}</strong><div style={{ fontSize:10, color:'var(--text3)' }}>{signal.sector}</div></td>
        <td style={{ padding:'10px 10px' }}><SignalBadge type={signal.signal} /></td>
        <td style={{ padding:'10px 10px' }}><CprBadge cls={signal.cprCls} /></td>
        <td style={{ padding:'10px 10px', fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)' }}>{signal.cprW}</td>
        <td style={{ padding:'10px 10px', fontFamily:'var(--mono)', fontSize:13, fontWeight:600 }}>{signal.ltp}</td>
        <td style={{ padding:'10px 10px', fontFamily:'var(--mono)', fontSize:12, fontWeight:700, color: signal.pctChg >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {signal.pctChg >= 0 ? '+' : ''}{signal.pctChg}%
        </td>
        <td style={{ padding:'10px 10px', fontFamily:'var(--mono)', fontSize:11, color:'var(--text2)' }}>{signal.vwap}</td>
        <td style={{ padding:'10px 10px', fontFamily:'var(--mono)', fontSize:11, color:'var(--red)', fontWeight:600 }}>{signal.hardSL}</td>
        <td style={{ padding:'10px 10px', fontFamily:'var(--mono)', fontSize:11, color:'var(--green)' }}>{signal.tp1}</td>
        <td style={{ padding:'10px 10px', fontFamily:'var(--mono)', fontSize:11, color:'var(--purple)' }}>{signal.tp2}</td>
        <td style={{ padding:'10px 10px', fontFamily:'var(--mono)', fontSize:12, fontWeight:700, color:'var(--amber)' }}>{signal.rr}</td>
        <td style={{ padding:'10px 10px', fontSize:11, color:'var(--text2)' }}>{signal.size}</td>
        <td style={{ padding:'10px 10px', fontSize:12, color:'var(--text3)' }}>{isExpanded ? '▲' : '▼'}</td>
      </tr>
      {isExpanded && (
        <tr style={{ background: isLong ? 'rgba(0,214,143,0.03)' : 'rgba(255,77,106,0.03)' }}>
          <td colSpan={14} style={{ padding:'0 14px 14px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, paddingTop:12, borderTop:'1px solid var(--border)' }}>
              {[
                { label:'R3 Level',    val:signal.r3,    color:'var(--green)' },
                { label:'S3 Level',    val:signal.s3,    color:'var(--red)' },
                { label:'CPR Width',   val:signal.cprWRs, color:'var(--amber)' },
                { label:'Position Size', val:signal.size, color:'var(--blue)' },
              ].map(d => (
                <div key={d.label} style={{ background:'var(--bg3)', borderRadius:9, padding:'10px 12px' }}>
                  <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:4 }}>{d.label}</div>
                  <div style={{ fontSize:14, fontWeight:700, fontFamily:'var(--mono)', color:d.color }}>{d.val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:10, fontSize:12, color:'var(--text3)', lineHeight:1.6 }}>
              <strong style={{ color:'var(--text2)' }}>Trade plan:</strong> Entry near {signal.ltp} · Hard SL at {signal.hardSL} (R4 − ATR×0.5) ·
              Book 50% at TP1 {signal.tp1} · Trail remainder with 9 EMA to TP2 {signal.tp2} ·
              R:R = 1:{signal.rr} — {signal.rr >= 2 ? '✓ Strong setup' : '✓ Meets 1.5 minimum'}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function BreakoutCard({ signal }) {
  const isLong = signal.signal.startsWith('LONG');
  const borderColor = isLong ? 'rgba(0,214,143,0.25)' : 'rgba(255,77,106,0.25)';
  const bg = isLong ? 'rgba(0,214,143,0.06)' : 'rgba(255,77,106,0.06)';
  return (
    <div style={{ background:'var(--bg2)', border:`1px solid ${borderColor}`, borderRadius:12, padding:'14px 16px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <div>
          <span style={{ fontSize:15, fontWeight:700 }}>{signal.sym}</span>
          <span style={{ fontSize:11, color:'var(--text3)', marginLeft:8 }}>{signal.sector}</span>
        </div>
        <SignalBadge type={signal.signal} size="sm" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
        {[
          { label:'LTP',      val:signal.ltp,    color:'var(--text)' },
          { label:'Hard SL',  val:signal.hardSL, color:'var(--red)'  },
          { label:'TP1',      val:signal.tp1,    color:'var(--green)'},
        ].map(d => (
          <div key={d.label} style={{ background:'var(--bg3)', borderRadius:8, padding:'8px 10px' }}>
            <div style={{ fontSize:10, color:'var(--text3)', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.3px' }}>{d.label}</div>
            <div style={{ fontSize:13, fontWeight:700, fontFamily:'var(--mono)', color:d.color }}>{d.val}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <CprBadge cls={signal.cprCls} />
        <span style={{ fontFamily:'var(--mono)', fontSize:12, fontWeight:700, color:'var(--amber)' }}>R:R 1:{signal.rr}</span>
        <span style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>{signal.time}</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function LiveSignalsPage() {
  const nav    = useNavigate();
  const [signals,     setSignals]     = useState(generateInitialSignals(8));
  const [running,     setRunning]     = useState(false);
  const [lastUpdate,  setLastUpdate]  = useState('—');
  const [filterSig,   setFilterSig]   = useState('all');
  const [filterCpr,   setFilterCpr]   = useState('all');
  const [expanded,    setExpanded]    = useState(null);
  const [activeTab,   setActiveTab]   = useState('feed');
  const [countdown,   setCountdown]   = useState(30);
  const [newCount,    setNewCount]    = useState(0);
  const [dataSource,  setDataSource]  = useState('SIM');  // 'LIVE' | 'SIM' | 'ERR'
  const [fetchError,  setFetchError]  = useState(null);
  const [showAuth,    setShowAuth]    = useState(false);
  const { user } = useAuth();
  const intervalRef = useRef(null);
  const countRef    = useRef(null);

  const tick = useCallback(async () => {
    // Try live NSE data first
    try {
      const result = await fetchLiveSignals();
      if (result?.signals?.length) {
        const fresh = result.signals.map(s => ({ ...s, isNew: true }));
        setSignals(prev => [...fresh, ...prev.map(s => ({...s, isNew: false}))].slice(0, 60));
        setNewCount(n => n + fresh.length);
        setDataSource('LIVE');
        setFetchError(null);
        const now = new Date();
        setLastUpdate(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`);
        setCountdown(30);
        return;
      }
      // NSE returned no signals — fall through to simulation
      setDataSource('SIM');
      setFetchError('NSE returned no data — showing simulated signals');
    } catch (err) {
      setDataSource('ERR');
      setFetchError('NSE API unavailable — showing simulated signals');
    }

    // Simulation fallback
    let added = 0;
    for (let i = 0; i < 12 && added < 3; i++) {
      const sig = generateSignal(true);
      if (sig) { setSignals(prev => [sig, ...prev].slice(0, 60)); added++; }
    }
    if (added > 0) setNewCount(n => n + added);
    const now = new Date();
    setLastUpdate(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`);
    setCountdown(30);
  }, []);

  const startFeed = useCallback(() => {
    setRunning(true);
    tick();
    intervalRef.current = setInterval(tick, 30000);
    countRef.current    = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 30), 1000);
  }, [tick]);

  const stopFeed = useCallback(() => {
    setRunning(false);
    clearInterval(intervalRef.current);
    clearInterval(countRef.current);
  }, []);

  useEffect(() => () => { clearInterval(intervalRef.current); clearInterval(countRef.current); }, []);

  const filtered = signals.filter(s => {
    if (filterSig !== 'all' && s.signal !== filterSig) return false;
    if (filterCpr !== 'all' && s.cprCls !== filterCpr) return false;
    return true;
  });

  const stats = {
    total:    signals.length,
    long:     signals.filter(s => s.signal.startsWith('LONG')).length,
    short:    signals.filter(s => s.signal.startsWith('SHORT')).length,
    narrow:   signals.filter(s => s.cprCls === 'NARROW').length,
    semi:     signals.filter(s => s.cprCls === 'SEMI').length,
    momentum: signals.filter(s => s.signal.includes('MOMENTUM')).length,
  };

  const TH = ({ children, style }) => (
    <th style={{ background:'rgba(8,12,20,0.8)', color:'var(--text3)', padding:'8px 10px', textAlign:'center', fontSize:10, whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'0.4px', fontFamily:'var(--font)', fontWeight:600, ...style }}>
      {children}
    </th>
  );

  return (
    <div style={{ minHeight:'calc(100vh - 56px)' }}>

      {/* Hero header */}
      <div style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'28px 28px 0' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(0,214,143,0.08)', border:'1px solid rgba(0,214,143,0.2)', color:'var(--green)', padding:'4px 12px', borderRadius:100, fontSize:11, fontWeight:600, marginBottom:10 }}>
                <span className="pulse-dot" style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', display:'inline-block' }} />
                NSE F&O · C+V+C Strategy Engine
              </div>
              <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.5px', marginBottom:6 }}>Live Signal Feed</h1>
              <p style={{ fontSize:14, color:'var(--text2)', maxWidth:520, lineHeight:1.6 }}>
                Real-time CPR + VWAP + Camarilla signals for NSE top gainers and losers. Two-gate architecture: NARROW/SEMI CPR coil breakouts and WIDE CPR momentum trades.
              </p>
              {/* Data source badge */}
              <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:100, fontSize:11, fontWeight:600,
                  background: dataSource==='LIVE' ? 'rgba(0,214,143,0.1)' : dataSource==='ERR' ? 'rgba(245,158,11,0.1)' : 'rgba(61,142,240,0.1)',
                  color: dataSource==='LIVE' ? 'var(--green)' : dataSource==='ERR' ? 'var(--amber)' : 'var(--blue)',
                  border: `1px solid ${dataSource==='LIVE' ? 'rgba(0,214,143,0.25)' : dataSource==='ERR' ? 'rgba(245,158,11,0.25)' : 'rgba(61,142,240,0.25)'}`,
                }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor', display:'inline-block' }} />
                  {dataSource==='LIVE' ? 'Live NSE Data' : dataSource==='ERR' ? 'NSE Unavailable' : 'Simulation Mode'}
                </span>
                {fetchError && <span style={{ fontSize:11, color:'var(--amber)' }}>{fetchError}</span>}
                {!user && (
                  <button onClick={() => setShowAuth(true)} style={{ fontSize:11, color:'var(--green)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font)', fontWeight:600, textDecoration:'underline' }}>
                    Sign in to save signals →
                  </button>
                )}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
              <div style={{ display:'flex', gap:10 }}>
                <button
                  onClick={running ? stopFeed : startFeed}
                  style={{
                    padding:'10px 22px', borderRadius:10, fontSize:13, fontWeight:600, fontFamily:'var(--font)', cursor:'pointer', transition:'all 0.2s',
                    background: running ? 'rgba(255,77,106,0.12)' : 'var(--green)',
                    border: running ? '1px solid rgba(255,77,106,0.3)' : 'none',
                    color: running ? 'var(--red)' : '#080C14',
                  }}
                >
                  {running ? '⏸ Pause Feed' : '▶ Start Feed'}
                </button>
                <button
                  onClick={() => { setSignals(generateInitialSignals(8)); setNewCount(0); }}
                  style={{ padding:'10px 16px', borderRadius:10, fontSize:13, fontWeight:600, fontFamily:'var(--font)', cursor:'pointer', background:'transparent', border:'1px solid var(--border2)', color:'var(--text2)', transition:'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; }}
                >
                  Reset
                </button>
              </div>
              {running && (
                <div style={{ fontSize:12, color:'var(--text3)', fontFamily:'var(--mono)', textAlign:'right' }}>
                  Next scan in <span style={{ color:'var(--green)', fontWeight:600 }}>{countdown}s</span>
                  {lastUpdate !== '—' && <><br />Last updated: <span style={{ color:'var(--text2)' }}>{lastUpdate}</span></>}
                </div>
              )}
              {!running && (
                <div style={{ fontSize:12, color:'var(--text3)' }}>
                  Feed paused — {signals.length} signals loaded
                </div>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ display:'flex', gap:0, borderTop:'1px solid var(--border)' }}>
            {[
              { val:stats.total,    label:'Total signals', color:'var(--purple)' },
              { val:stats.long,     label:'LONG',          color:'var(--green)'  },
              { val:stats.short,    label:'SHORT',         color:'var(--red)'    },
              { val:stats.narrow,   label:'NARROW CPR',    color:'var(--teal)'   },
              { val:stats.semi,     label:'SEMI CPR',      color:'var(--amber)'  },
              { val:stats.momentum, label:'MOMENTUM 🚀',   color:'var(--orange)' },
              { val:newCount,       label:'New this session',color:'var(--blue)' },
            ].map((s, i) => (
              <div key={s.label} style={{ flex:1, padding:'14px 0', textAlign:'center', borderRight: i < 6 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--mono)', color:s.color }}>{s.val}</div>
                <div style={{ fontSize:10, color:'var(--text3)', marginTop:2, textTransform:'uppercase', letterSpacing:'0.4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 28px' }}>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:4, width:'fit-content', marginBottom:24 }}>
          {[
            { key:'feed',     label:'Signal Feed' },
            { key:'active',   label:'Active Breakouts' },
            { key:'guide',    label:'Strategy Guide' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding:'8px 20px', borderRadius:9, fontSize:13, fontWeight:600, fontFamily:'var(--font)', cursor:'pointer', border:'none', transition:'all 0.15s',
              background: activeTab === t.key ? 'var(--bg3)' : 'transparent',
              color: activeTab === t.key ? 'var(--text)' : 'var(--text2)',
              boxShadow: activeTab === t.key ? '0 0 0 1px var(--border2)' : 'none',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── TAB: Signal Feed ── */}
        {activeTab === 'feed' && (
          <div>
            {/* Filters */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18, flexWrap:'wrap' }}>
              <span style={{ fontSize:12, color:'var(--text3)' }}>Filter:</span>
              <div style={{ display:'flex', gap:6 }}>
                {[
                  { val:'all',            label:'All signals' },
                  { val:'LONG-NARROW',    label:'Long Narrow' },
                  { val:'SHORT-NARROW',   label:'Short Narrow' },
                  { val:'LONG-MOMENTUM',  label:'Long Momentum' },
                  { val:'SHORT-MOMENTUM', label:'Short Momentum' },
                  { val:'LONG-SEMI',      label:'Long Semi' },
                  { val:'SHORT-SEMI',     label:'Short Semi' },
                ].map(f => (
                  <button key={f.val} onClick={() => setFilterSig(f.val)} style={{
                    padding:'5px 13px', borderRadius:100, fontSize:11, fontWeight:600, fontFamily:'var(--font)', cursor:'pointer', transition:'all 0.15s',
                    background: filterSig === f.val ? 'var(--bg3)' : 'transparent',
                    border: `1px solid ${filterSig === f.val ? 'var(--border2)' : 'var(--border)'}`,
                    color: filterSig === f.val ? 'var(--text)' : 'var(--text2)',
                  }}>{f.label}</button>
                ))}
              </div>
              <div style={{ display:'flex', gap:6, marginLeft:8 }}>
                {['all','NARROW','SEMI','WIDE'].map(c => (
                  <button key={c} onClick={() => setFilterCpr(c)} style={{
                    padding:'5px 12px', borderRadius:100, fontSize:11, fontWeight:600, fontFamily:'var(--font)', cursor:'pointer', transition:'all 0.15s',
                    background: filterCpr === c ? (c==='NARROW'?'rgba(0,214,143,0.1)':c==='SEMI'?'rgba(245,158,11,0.1)':c==='WIDE'?'rgba(136,136,136,0.1)':'var(--bg3)') : 'transparent',
                    border: `1px solid ${filterCpr === c ? (c==='NARROW'?'rgba(0,214,143,0.3)':c==='SEMI'?'rgba(245,158,11,0.3)':c==='WIDE'?'rgba(136,136,136,0.3)':'var(--border2)') : 'var(--border)'}`,
                    color: filterCpr === c ? (c==='NARROW'?'var(--green)':c==='SEMI'?'var(--amber)':c==='WIDE'?'var(--text2)':'var(--text)') : 'var(--text2)',
                  }}>{c === 'all' ? 'All CPR' : c}</button>
                ))}
              </div>
              <span style={{ marginLeft:'auto', fontSize:12, color:'var(--text3)', fontFamily:'var(--mono)' }}>
                {filtered.length} / {signals.length} signals
              </span>
            </div>

            {/* Table */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr>
                      <TH>Time</TH>
                      <TH>Symbol</TH>
                      <TH>Signal</TH>
                      <TH>CPR</TH>
                      <TH>Width%</TH>
                      <TH>LTP</TH>
                      <TH>Chg%</TH>
                      <TH>VWAP</TH>
                      <TH>Hard SL</TH>
                      <TH>TP1 (50%)</TH>
                      <TH>TP2 Trail</TH>
                      <TH>R:R</TH>
                      <TH>Size</TH>
                      <TH></TH>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={14} style={{ textAlign:'center', padding:'40px 20px', color:'var(--text3)', fontSize:14 }}>
                          No signals match the current filters. {!running && 'Press ▶ Start Feed to begin scanning.'}
                        </td>
                      </tr>
                    ) : (
                      filtered.map(s => (
                        <SignalRow
                          key={s.id}
                          signal={s}
                          isExpanded={expanded === s.id}
                          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div style={{ marginTop:16, display:'flex', gap:16, flexWrap:'wrap', fontSize:12, color:'var(--text3)', alignItems:'center' }}>
              <strong style={{ color:'var(--text2)' }}>Legend:</strong>
              <span style={{ color:'var(--green)' }}>NARROW CPR</span> = coiled stock, trade normally (1×)
              <span style={{ color:'var(--amber)' }}>SEMI CPR</span> = coiled but weaker, half size (0.5×)
              <span style={{ color:'var(--orange)' }}>MOMENTUM 🚀</span> = WIDE CPR + ≥2% change + R3 break
              <span>· Click any row to expand trade plan</span>
            </div>
          </div>
        )}

        {/* ── TAB: Active Breakouts ── */}
        {activeTab === 'active' && (
          <div>
            <div style={{ marginBottom:18 }}>
              <h2 style={{ fontSize:17, fontWeight:700, marginBottom:4 }}>Active Breakouts</h2>
              <p style={{ fontSize:13, color:'var(--text2)' }}>Stocks currently above R3 (longs) or below S3 (shorts) — sorted by most recent signal.</p>
            </div>
            {signals.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px', color:'var(--text3)' }}>
                <div style={{ fontSize:28, marginBottom:12 }}>📡</div>
                <p>No breakouts yet. Press ▶ Start Feed to begin scanning.</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:14 }}>
                {signals.slice(0, 12).map(s => <BreakoutCard key={s.id} signal={s} />)}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Strategy Guide ── */}
        {activeTab === 'guide' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
            {/* Gate A */}
            <div style={{ background:'rgba(0,214,143,0.05)', border:'1px solid rgba(0,214,143,0.15)', borderRadius:14, padding:22 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--green)', marginBottom:4 }}>Gate A — NARROW / SEMI CPR</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:14 }}>Coiled stock: yesterday was a quiet day</div>
              {[
                'CPR width < tight% × 2 = NARROW (full size, 1.0×)',
                'CPR width < tight% × 3 = SEMI (half size, 0.5×)',
                'LTP breaks R3 cleanly (+0.1% buffer)',
                'LTP above VWAP (±0.05% tolerance)',
                '% change ≥ 0.3% directional (filters flat stocks)',
                'R:R ≥ 1.5 confirmed before signal fires',
              ].map((r,i) => (
                <div key={i} style={{ display:'flex', gap:8, fontSize:12, color:'var(--text2)', marginBottom:8, lineHeight:1.5 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--green)', flexShrink:0, marginTop:5 }} />{r}
                </div>
              ))}
            </div>

            {/* Gate B */}
            <div style={{ background:'rgba(255,140,0,0.05)', border:'1px solid rgba(255,140,0,0.2)', borderRadius:14, padding:22 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--orange)', marginBottom:4 }}>Gate B — WIDE CPR Momentum</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:14 }}>Trending day: yesterday was a big-range day</div>
              {[
                'CPR wide → CPR filter REPLACED by momentum',
                '% change ≥ 2.0% (strong gap or trend)',
                'LTP cleanly above R3 (+0.1% buffer)',
                'LTP above VWAP — confirms direction',
                'R:R ≥ 1.5 confirmed',
                'Output: LONG-MOMENTUM / SHORT-MOMENTUM 🚀',
              ].map((r,i) => (
                <div key={i} style={{ display:'flex', gap:8, fontSize:12, color:'var(--text2)', marginBottom:8, lineHeight:1.5 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--orange)', flexShrink:0, marginTop:5 }} />{r}
                </div>
              ))}
            </div>

            {/* Exit system */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:22 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:14 }}>3-Layer Exit System</div>
              {[
                { label:'Hard SL',  desc:'R4/S4 ± ATR×0.5. Momentum (LTP>R4): max(VWAP,R3) − ATR×0.3', color:'var(--red)'   },
                { label:'TP1 50%',  desc:'Book 50% at Camarilla R4 (or R5 if already past R4)',           color:'var(--green)' },
                { label:'TP2 Trail',desc:'Trail remaining with 9 EMA → final target R5/S5',               color:'var(--purple)'},
              ].map(e => (
                <div key={e.label} style={{ display:'flex', gap:10, marginBottom:12 }}>
                  <div style={{ width:60, flexShrink:0, fontSize:11, fontWeight:700, color:e.color, paddingTop:1 }}>{e.label}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>{e.desc}</div>
                </div>
              ))}
            </div>

            {/* Price bands */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:22 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:14 }}>Price-Band CPR Thresholds</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  { range:'₹0 – 200',     tight:'0.20%' },
                  { range:'₹200 – 500',   tight:'0.18%' },
                  { range:'₹500 – 1,500', tight:'0.15%' },
                  { range:'₹1,500 – 5k',  tight:'0.12%' },
                  { range:'₹5,000+',      tight:'0.10%' },
                ].map(b => (
                  <div key={b.range} style={{ background:'var(--bg3)', borderRadius:8, padding:'9px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'var(--text2)' }}>{b.range}</span>
                    <span style={{ fontSize:13, fontWeight:700, fontFamily:'var(--mono)', color:'var(--amber)' }}>{b.tight}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12, fontSize:11, color:'var(--text3)', lineHeight:1.6 }}>
                NARROW = tight×2 · SEMI = tight×3 · WIDE = ≥tight×3
              </div>
            </div>

            {/* CTA */}
            <div style={{ gridColumn:'1/-1', background:'rgba(167,139,250,0.06)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:14, padding:22, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Want the full C+V+C strategy code?</div>
                <div style={{ fontSize:13, color:'var(--text2)' }}>View the complete strategy page with all parameters, modules, and the Python source file.</div>
              </div>
              <button onClick={() => nav('/strategies/cvc-setup')} style={{ padding:'11px 24px', borderRadius:10, fontSize:13, fontWeight:600, fontFamily:'var(--font)', cursor:'pointer', background:'var(--purple)', border:'none', color:'#fff', flexShrink:0, marginLeft:20, transition:'opacity 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.opacity='0.85'}}
                onMouseLeave={e=>{e.currentTarget.style.opacity='1'}}
              >View C+V+C Strategy →</button>
            </div>
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
