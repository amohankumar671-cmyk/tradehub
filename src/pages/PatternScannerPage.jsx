import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { scanAllPatterns, PATTERN_CATEGORIES, SIGNAL_COLORS } from '../services/patternScanner';

const TYPE_COLORS = {
  trend:    { bg: 'rgba(0,214,143,0.1)',   color: 'var(--green)',  border: 'rgba(0,214,143,0.25)'  },
  breakout: { bg: 'rgba(61,142,240,0.1)',  color: 'var(--blue)',   border: 'rgba(61,142,240,0.25)' },
  momentum: { bg: 'rgba(167,139,250,0.1)', color: 'var(--purple)', border: 'rgba(167,139,250,0.25)'},
  candle:   { bg: 'rgba(45,212,191,0.1)',  color: 'var(--teal)',   border: 'rgba(45,212,191,0.25)' },
  reversal: { bg: 'rgba(245,158,11,0.1)',  color: 'var(--amber)',  border: 'rgba(245,158,11,0.25)' },
};

function AlertRow({ alert, onClick, isExpanded }) {
  const [hov, setHov] = useState(false);
  const sc  = SIGNAL_COLORS[alert.signal] || SIGNAL_COLORS.BULLISH;
  const tc  = TYPE_COLORS[alert.type] || TYPE_COLORS.trend;
  const rowBg = alert.isNew
    ? (alert.signal === 'BULLISH' ? 'rgba(0,214,143,0.06)' : 'rgba(255,77,106,0.06)')
    : hov ? 'rgba(255,255,255,0.03)' : 'transparent';

  return (
    <>
      <tr
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ background: rowBg, cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid var(--border)' }}
      >
        <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--purple)', fontWeight: 600 }}>
          {alert.time}
          {alert.isNew && <span style={{ marginLeft: 6, fontSize: 9, background: '#FF8C00', color: '#fff', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>NEW</span>}
        </td>
        <td style={{ padding: '11px 10px' }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{alert.symbol}</div>
        </td>
        <td style={{ padding: '11px 10px' }}>
          <span style={{ fontSize: 16 }}>{alert.icon}</span>
        </td>
        <td style={{ padding: '11px 10px' }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, whiteSpace: 'nowrap' }}>
            {alert.pattern}
          </span>
        </td>
        <td style={{ padding: '11px 10px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
            {sc.label}
          </span>
        </td>
        <td style={{ padding: '11px 10px', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600 }}>{alert.ltp}</td>
        <td style={{ padding: '11px 10px', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: alert.pctChg >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {alert.pctChg >= 0 ? '+' : ''}{alert.pctChg}%
        </td>
        <td style={{ padding: '11px 10px' }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
            background: alert.strength === 'Strong' ? 'rgba(0,214,143,0.12)' : 'rgba(245,158,11,0.1)',
            color: alert.strength === 'Strong' ? 'var(--green)' : 'var(--amber)',
          }}>
            {alert.strength}
          </span>
        </td>
        <td style={{ padding: '11px 10px', fontSize: 11, color: 'var(--text3)' }}>
          {isExpanded ? '▲' : '▼'}
        </td>
      </tr>
      {isExpanded && (
        <tr style={{ background: alert.signal === 'BULLISH' ? 'rgba(0,214,143,0.03)' : 'rgba(255,77,106,0.03)' }}>
          <td colSpan={9} style={{ padding: '0 14px 14px' }}>
            <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 10 }}>
                  <strong style={{ color: 'var(--text)' }}>{alert.pattern}</strong> on <strong style={{ color: 'var(--green)' }}>{alert.symbol}</strong> — {alert.detail}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={e => { e.stopPropagation(); window.open(`https://www.nseindia.com/get-quotes/equity?symbol=${alert.symbol}`, '_blank'); }}
                    style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)', transition: 'all 0.15s' }}
                  >
                    View on NSE ↗
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, flexShrink: 0 }}>
                {[
                  { label: 'Pattern Type', value: PATTERN_CATEGORIES[alert.type]?.label || alert.type, color: TYPE_COLORS[alert.type]?.color },
                  { label: 'Signal',       value: alert.signal,  color: SIGNAL_COLORS[alert.signal]?.text },
                  { label: 'Strength',     value: alert.strength, color: alert.strength === 'Strong' ? 'var(--green)' : 'var(--amber)' },
                ].map(k => (
                  <div key={k.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{k.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: k.color }}>{k.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '14px 0', flex: 1, borderRight: '1px solid var(--border)' }}>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--mono)', color, letterSpacing: '-0.5px' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

export default function PatternScannerPage() {
  const nav = useNavigate();
  const [alerts,       setAlerts]       = useState([]);
  const [running,      setRunning]      = useState(false);
  const [scanning,     setScanning]     = useState(false);
  const [progress,     setProgress]     = useState('');
  const [lastScan,     setLastScan]     = useState('—');
  const [countdown,    setCountdown]    = useState(300);
  const [filterType,   setFilterType]   = useState('all');
  const [filterSig,    setFilterSig]    = useState('all');
  const [filterStr,    setFilterStr]    = useState('all');
  const [expanded,     setExpanded]     = useState(null);
  const [stocksScanned,setStocksScanned]= useState(0);
  const [dataSource,   setDataSource]   = useState('—');
  const [search,       setSearch]       = useState('');
  const intervalRef = useRef(null);
  const countRef    = useRef(null);

  const runScan = useCallback(async () => {
    setScanning(true);
    setProgress('Starting scan...');
    try {
      const result = await scanAllPatterns(msg => setProgress(msg));
      const fresh = result.alerts.map(a => ({ ...a, isNew: true }));
      setAlerts(prev => {
        const old = prev.map(a => ({ ...a, isNew: false }));
        const combined = [...fresh, ...old].slice(0, 200);
        return combined;
      });
      setStocksScanned(result.stocksScanned);
      setDataSource(result.source);
      const now = new Date();
      setLastScan(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`);
      setCountdown(300);
    } catch (e) {
      setProgress('Scan failed — ' + e.message);
    }
    setScanning(false);
    setProgress('');
  }, []);

  const startScanner = useCallback(() => {
    setRunning(true);
    runScan();
    intervalRef.current = setInterval(runScan, 300000); // every 5 min
    countRef.current    = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 300), 1000);
  }, [runScan]);

  const stopScanner = useCallback(() => {
    setRunning(false);
    clearInterval(intervalRef.current);
    clearInterval(countRef.current);
  }, []);

  useEffect(() => () => { clearInterval(intervalRef.current); clearInterval(countRef.current); }, []);

  // Filter alerts
  const filtered = alerts.filter(a => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterSig !== 'all' && a.signal !== filterSig) return false;
    if (filterStr !== 'all' && a.strength !== filterStr) return false;
    if (search && !a.symbol.toLowerCase().includes(search.toLowerCase()) && !a.pattern.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total:    alerts.length,
    bullish:  alerts.filter(a => a.signal === 'BULLISH').length,
    bearish:  alerts.filter(a => a.signal === 'BEARISH').length,
    strong:   alerts.filter(a => a.strength === 'Strong').length,
    newCount: alerts.filter(a => a.isNew).length,
    unique:   [...new Set(alerts.map(a => a.symbol))].length,
  };

  const BtnStyle = (active, activeColor = 'var(--green)') => ({
    padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 600,
    fontFamily: 'var(--font)', cursor: 'pointer', transition: 'all 0.15s',
    background: active ? `rgba(${activeColor === 'var(--green)' ? '0,214,143' : activeColor === 'var(--red)' ? '255,77,106' : activeColor === 'var(--blue)' ? '61,142,240' : '167,139,250'},0.12)` : 'transparent',
    border: `1px solid ${active ? activeColor : 'var(--border)'}`,
    color: active ? activeColor : 'var(--text2)',
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)' }}>

      {/* Header */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '28px 28px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: 'var(--purple)', padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 600, marginBottom: 10 }}>
                {running && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)', display: 'inline-block', animation: 'pulseDot 1.5s infinite' }} />}
                NSE Pattern Scanner — 12 Strategies · 80+ Stocks
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>Live Pattern Scanner</h1>
              <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 560, lineHeight: 1.6 }}>
                Automatically detects Golden Crossover, Volume Breakout, Candlestick patterns, RSI Divergence and more across NSE F&O stocks every 5 minutes.
              </p>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                  background: dataSource === 'LIVE' ? 'rgba(0,214,143,0.1)' : 'rgba(61,142,240,0.1)',
                  color: dataSource === 'LIVE' ? 'var(--green)' : 'var(--blue)',
                  border: `1px solid ${dataSource === 'LIVE' ? 'rgba(0,214,143,0.25)' : 'rgba(61,142,240,0.25)'}`,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                  {dataSource === 'LIVE' ? 'Live NSE Data' : dataSource === '—' ? 'Not started' : 'Simulation Mode'}
                </span>
                {stocksScanned > 0 && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{stocksScanned} stocks scanned</span>}
                {scanning && <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600 }}>⟳ {progress}</span>}
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={running ? stopScanner : startScanner} style={{
                  padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer',
                  background: running ? 'rgba(255,77,106,0.12)' : 'var(--purple)',
                  border: running ? '1px solid rgba(255,77,106,0.3)' : 'none',
                  color: running ? 'var(--red)' : '#fff', transition: 'all 0.2s',
                }}>
                  {running ? '⏸ Stop Scanner' : '▶ Start Scanner'}
                </button>
                <button onClick={runScan} disabled={scanning} style={{
                  padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: scanning ? 'wait' : 'pointer',
                  background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', opacity: scanning ? 0.5 : 1,
                }}>
                  {scanning ? '⟳ Scanning...' : '⟳ Scan Now'}
                </button>
              </div>
              {running && (
                <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)', textAlign: 'right' }}>
                  Next scan in <span style={{ color: 'var(--purple)', fontWeight: 600 }}>{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2,'0')}</span>
                  {lastScan !== '—' && <><br/>Last scan: <span style={{ color: 'var(--text2)' }}>{lastScan}</span></>}
                </div>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
            <StatCard value={stats.total}    label="Total Alerts"    color="var(--purple)" />
            <StatCard value={stats.bullish}  label="Bullish"         color="var(--green)"  />
            <StatCard value={stats.bearish}  label="Bearish"         color="var(--red)"    />
            <StatCard value={stats.strong}   label="Strong Signals"  color="var(--amber)"  />
            <StatCard value={stats.unique}   label="Stocks Alerted"  color="var(--blue)"   />
            <div style={{ textAlign: 'center', padding: '14px 0', flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--teal)', letterSpacing: '-0.5px' }}>{stats.newCount}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>New This Scan</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 28px' }}>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', marginRight: 4 }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, stroke: 'var(--text3)', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' }} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search symbol or pattern..."
              style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 9, padding: '7px 12px 7px 28px', color: 'var(--text)', fontSize: 12, fontFamily: 'var(--font)', outline: 'none', width: 200 }}
              onFocus={e => { e.target.style.borderColor = 'var(--purple)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border2)'; }}
            />
          </div>

          {/* Type filter */}
          {Object.entries(PATTERN_CATEGORIES).map(([k, v]) => (
            <button key={k} onClick={() => setFilterType(k)} style={BtnStyle(filterType === k, v.color)}>
              {v.label}
            </button>
          ))}

          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

          {/* Signal filter */}
          {[['all','All Signals','var(--text)'],['BULLISH','▲ Bullish','var(--green)'],['BEARISH','▼ Bearish','var(--red)']].map(([k,l,c]) => (
            <button key={k} onClick={() => setFilterSig(k)} style={BtnStyle(filterSig === k, c)}>{l}</button>
          ))}

          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

          {/* Strength filter */}
          {[['all','All Strength'],['Strong','Strong Only']].map(([k,l]) => (
            <button key={k} onClick={() => setFilterStr(k)} style={BtnStyle(filterStr === k, 'var(--amber)')}>{l}</button>
          ))}

          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            {filtered.length}/{alerts.length}
          </span>
        </div>

        {/* Main table */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px' }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>🔍</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Scanner Not Started</div>
              <div style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 400, margin: '0 auto', lineHeight: 1.7, marginBottom: 24 }}>
                Press <strong style={{ color: 'var(--purple)' }}>▶ Start Scanner</strong> to begin scanning NSE stocks for live pattern alerts. Scans every 5 minutes during market hours.
              </div>
              <button onClick={startScanner} style={{ padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', background: 'var(--purple)', border: 'none', color: '#fff' }}>
                ▶ Start Scanner Now
              </button>
              <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text3)' }}>
                Detects: Golden Cross · Death Cross · Volume Breakout · ORB · 52W High · Hammer · Shooting Star · Pin Bar · Doji · RSI Divergence · S/R Breakout · Momentum
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
              <p>No alerts match your filters.</p>
              <button onClick={() => { setFilterType('all'); setFilterSig('all'); setFilterStr('all'); setSearch(''); }}
                style={{ marginTop: 10, color: 'var(--purple)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)' }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {['Time','Symbol','','Pattern','Signal','LTP','Chg%','Strength',''].map((h, i) => (
                      <th key={i} style={{ background: 'rgba(8,12,20,0.8)', color: 'var(--text3)', padding: '9px 10px', textAlign: 'center', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.4px', fontFamily: 'var(--font)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(alert => (
                    <AlertRow
                      key={alert.id}
                      alert={alert}
                      isExpanded={expanded === alert.id}
                      onClick={() => setExpanded(expanded === alert.id ? null : alert.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pattern legend */}
        <div style={{ marginTop: 20, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Patterns Detected</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { icon:'📈', name:'Golden Crossover',    type:'trend',    desc:'50 MA crosses above 200 MA' },
              { icon:'📉', name:'Death Cross',          type:'trend',    desc:'50 MA crosses below 200 MA' },
              { icon:'💥', name:'Volume Breakout',      type:'breakout', desc:'2%+ move with high volume' },
              { icon:'🚀', name:'Opening Range Breakout',type:'breakout',desc:'Break of first 15-min range' },
              { icon:'🏆', name:'52-Week High',          type:'breakout', desc:'Testing or breaking 52W high' },
              { icon:'📊', name:'S/R Breakout',          type:'breakout', desc:'Breaking key support/resistance' },
              { icon:'⚡', name:'Momentum + Volume',     type:'momentum', desc:'Strong move with volume surge' },
              { icon:'🔨', name:'Hammer',                type:'candle',   desc:'Long lower wick at support' },
              { icon:'💫', name:'Shooting Star',         type:'candle',   desc:'Long upper wick at resistance' },
              { icon:'📌', name:'Pin Bar',               type:'candle',   desc:'Wick rejection at key level' },
              { icon:'✚',  name:'Doji at Key Zone',      type:'candle',   desc:'Indecision at S/R level' },
              { icon:'🔄', name:'RSI Divergence',        type:'reversal', desc:'Extreme move — reversal watch' },
            ].map(p => {
              const tc2 = TYPE_COLORS[p.type] || TYPE_COLORS.trend;
              return (
                <div key={p.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: 'var(--bg3)', borderRadius: 9 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: tc2.color, marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 }}>{p.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nav to strategies */}
        <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => nav('/strategies')} style={{ padding: '10px 22px', borderRadius: 9, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', background: 'var(--green)', border: 'none', color: '#080C14' }}>
            Study All 34 Strategies →
          </button>
          <button onClick={() => nav('/signals')} style={{ padding: '10px 22px', borderRadius: 9, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)' }}>
            C+V+C Signal Feed →
          </button>
        </div>
      </div>
    </div>
  );
}
