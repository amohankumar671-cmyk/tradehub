import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import strategies, { CATEGORIES } from '../data/strategies';

const TICKER_DATA = [
  { sym: 'NIFTY',     price: '22,147.90', chg: '+1.24%', up: true },
  { sym: 'BTC/USD',   price: '84,231.50', chg: '+2.87%', up: true },
  { sym: 'EUR/USD',   price: '1.0842',    chg: '-0.31%', up: false },
  { sym: 'RELIANCE',  price: '2,987.45',  chg: '+0.72%', up: true },
  { sym: 'ETH/USD',   price: '3,412.80',  chg: '+3.14%', up: true },
  { sym: 'GOLD',      price: '3,042.30',  chg: '+0.54%', up: true },
  { sym: 'BANKNIFTY', price: '47,820.15', chg: '-0.48%', up: false },
  { sym: 'GBP/USD',   price: '1.2634',    chg: '+0.19%', up: true },
  { sym: 'SOL/USD',   price: '142.60',    chg: '-1.22%', up: false },
  { sym: 'TCS',       price: '4,124.75',  chg: '+1.05%', up: true },
];

const CATEGORY_CARDS = [
  { key: 'trend',    count: 5,  tagline: 'All markets',    desc: 'Golden Cross, EMA Ribbons, Supertrend and more.' },
  { key: 'breakout', count: 7,  tagline: 'High momentum',  desc: 'Volume Breakout, ORB, Flag & Pennant, Triangle.' },
  { key: 'reversal', count: 6,  tagline: 'Counter-trend',  desc: 'Head & Shoulders, Double Top, RSI Divergence.' },
  { key: 'momentum', count: 4,  tagline: 'Fast setups',    desc: 'VWAP Deviation, Relative Strength, 9/21 EMA.' },
  { key: 'candle',   count: 11, tagline: 'Price action',   desc: 'Hammer, Engulfing, Morning Star, Pin Bar, Doji.' },
  { key: 'custom',   count: 1,  tagline: 'Proprietary',    desc: 'CPR + VWAP + Camarilla — your flagship NSE F&O engine.' },
];

const FEATURED = strategies.find(s => s.id === 'golden-crossover');
const TOP_STRATEGIES = ['cvc-setup', 'golden-crossover', 'volume-breakout', 'rsi-divergence', 'bullish-engulfing', 'orb']
  .map(id => strategies.find(s => s.id === id)).filter(Boolean);

export default function HomePage() {
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState(null);

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) nav(`/strategies?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <div>
      {/* ── Ticker Bar ─────────────────────────────── */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '8px 0', overflow: 'hidden' }}>
        <div className="ticker-track" style={{ display: 'flex', gap: 0, width: 'max-content' }}>
          {[...TICKER_DATA, ...TICKER_DATA].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 28px', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{t.sym}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>{t.price}</span>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
                padding: '2px 6px', borderRadius: 4,
                background: t.up ? 'rgba(0,214,143,0.12)' : 'rgba(255,77,106,0.12)',
                color: t.up ? 'var(--green)' : 'var(--red)',
              }}>{t.chg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 28px 56px' }}>
        <div className="fade-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.2)',
          color: 'var(--green)', padding: '5px 12px', borderRadius: 100,
          fontSize: 12, fontWeight: 600, marginBottom: 24,
        }}>
          <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          34 Proven Strategies — All 4 Markets
        </div>

        <h1 className="fade-up-delay-1" style={{ fontSize: 54, fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
          Your Complete<br />
          <span style={{ color: 'var(--green)' }}>Trading Playbook</span><br />
          In One Place
        </h1>

        <p className="fade-up-delay-2" style={{ fontSize: 17, color: 'var(--text2)', maxWidth: 520, lineHeight: 1.7, marginBottom: 36 }}>
          From your personal C+V+C setup to Golden Crossovers and Volume Breakouts — every proven strategy, explained, charted, and backtested.
        </p>

        <div className="fade-up-delay-2" style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
          {[
            { label: 'Explore Strategies', primary: true,  onClick: () => nav('/strategies') },
            { label: 'View C+V+C Setup',   primary: false, onClick: () => nav('/strategies/cvc-setup') },
          ].map(b => (
            <button key={b.label} onClick={b.onClick} style={{
              padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600,
              fontFamily: 'var(--font)', cursor: 'pointer', transition: 'all 0.2s',
              background: b.primary ? 'var(--green)' : 'transparent',
              border: b.primary ? 'none' : '1px solid var(--border2)',
              color: b.primary ? '#080C14' : 'var(--text)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = b.primary ? '#00f0a0' : 'var(--bg3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = b.primary ? 'var(--green)' : 'transparent'; }}
            >{b.label}</button>
          ))}
        </div>

        {/* Search */}
        <form className="fade-up-delay-3" onSubmit={handleSearch} style={{ maxWidth: 560 }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, stroke: 'var(--text3)', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search any strategy — Golden Cross, Hammer, ORB..."
              style={{
                width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)',
                borderRadius: 12, padding: '14px 48px 14px 48px',
                color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--green)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border2)'; }}
            />
            <kbd style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'var(--bg4)', border: '1px solid var(--border)', color: 'var(--text3)', padding: '3px 8px', borderRadius: 5, fontSize: 11, fontFamily: 'var(--mono)' }}>Enter</kbd>
          </div>
        </form>
      </div>

      {/* ── Stats Bar ──────────────────────────────── */}
      <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
          {[
            { num: '34+', label: 'Strategies' },
            { num: '4',   label: 'Markets' },
            { num: '~68%', label: 'Avg Win Rate' },
            { num: '1:2.4', label: 'Avg R:R Ratio' },
            { num: '11',  label: 'Candle Patterns' },
          ].map((s, i) => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 40px', borderRight: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)', letterSpacing: '-0.5px' }}>
                <span style={{ color: 'var(--green)' }}>{s.num.replace(/[^0-9.:~+]/g, '')}</span>
                {s.num.match(/[^0-9.:~+]/g)?.join('')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category Grid ──────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Strategy Categories</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Browse by setup type — pick your style, find your edge</div>
          </div>
          <button onClick={() => nav('/strategies')} style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>View all →</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {CATEGORY_CARDS.map(c => {
            const cat = CATEGORIES[c.key];
            return (
              <div key={c.key}
                onClick={() => nav(`/strategies?cat=${c.key}`)}
                onMouseEnter={() => setHovered(c.key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: 'var(--bg2)', border: `1px solid ${hovered === c.key ? 'var(--border3)' : 'var(--border)'}`,
                  borderRadius: 16, padding: 24, cursor: 'pointer',
                  transition: 'all 0.25s', transform: hovered === c.key ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 20 }}>{cat.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{cat.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 16 }}>{c.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{c.count} {c.count === 1 ? 'strategy' : 'strategies'}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>{c.tagline}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Featured Setup ─────────────────────────── */}
      {FEATURED && (
        <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '56px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 4 }}>Featured Setup of the Week</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 28 }}>Handpicked strategy with high confluence this week</div>

            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 20, padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: 'var(--amber)', padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 600, marginBottom: 16 }}>
                  ⭐ Featured This Week
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 12 }}>
                  <span style={{ color: 'var(--green)' }}>Golden Crossover</span><br />50 MA × 200 MA
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 24 }}>
                  One of the most reliable trend-confirmation setups across all timeframes. When the 50 MA crosses above the 200 MA with volume confirmation, it signals a strong bullish regime shift.
                </p>
                <div style={{ display: 'flex', gap: 24, marginBottom: 28 }}>
                  {[
                    { label: 'Win Rate', value: '71%',    color: 'var(--green)' },
                    { label: 'R:R',      value: '1 : 2.8',color: 'var(--blue)'  },
                    { label: 'Market',   value: 'Stocks', color: 'var(--amber)' },
                    { label: 'TF',       value: 'Daily',  color: 'var(--purple)'},
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--mono)', color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => nav('/strategies/golden-crossover')} style={{ padding: '11px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', background: 'var(--green)', border: 'none', color: '#080C14', transition: 'background 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#00f0a0'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--green)'; }}
                  >View Full Setup →</button>
                  <button onClick={() => nav('/tools')} style={{ padding: '11px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)'; }}
                  >Calculate R:R</button>
                </div>
              </div>

              {/* Mini chart SVG */}
              <div style={{ background: 'var(--bg4)', borderRadius: 14, padding: 20, height: 220 }}>
                <svg viewBox="0 0 400 180" width="100%" height="100%" preserveAspectRatio="none">
                  {[44,88,132].map(y => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#1e2d45" strokeWidth="0.5"/>)}
                  {[[10,120,22],[26,115,26],[42,105,24],[58,100,26],[74,108,22],[90,95,24],[106,90,26],[122,85,22],[138,75,26],[154,70,22],[170,60,24],[186,52,26],[202,45,22],[218,38,26],[234,30,24],[250,25,22],[266,20,24],[282,15,22],[298,10,22],[314,8,20],[330,5,18],[346,4,16],[362,6,14],[378,8,12]].map(([x,y,h],i) => (
                    <rect key={i} x={x} y={y} width={8} height={h} fill={i%3===0?'#FF4D6A':'#00D68F'} rx="1"/>
                  ))}
                  <polyline points="0,155 50,148 100,140 150,128 200,112 250,90 300,65 350,40 400,22" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6,3"/>
                  <polyline points="0,165 50,158 100,145 150,125 180,108 210,80 260,52 310,30 360,14 400,8" fill="none" stroke="#3D8EF0" strokeWidth="2"/>
                  <circle cx="192" cy="93" r="7" fill="none" stroke="#00D68F" strokeWidth="2"/>
                  <line x1="192" y1="10" x2="192" y2="170" stroke="#00D68F" strokeWidth="1" strokeDasharray="4,3" opacity="0.5"/>
                  <text x="340" y="20" fill="#F59E0B" fontSize="9" fontFamily="monospace">200 MA</text>
                  <text x="340" y="10" fill="#3D8EF0" fontSize="9" fontFamily="monospace">50 MA</text>
                  <text x="198" y="8"  fill="#00D68F" fontSize="9" fontFamily="monospace">Cross ↑</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Strategies ─────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 28px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Top Strategies</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Highest win-rate setups across all markets</div>
          </div>
          <button onClick={() => nav('/strategies')} style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>View all 34 →</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {TOP_STRATEGIES.map(s => {
            const cat = CATEGORIES[s.category];
            const isHov = hovered === s.id;
            return (
              <div key={s.id}
                onClick={() => nav(`/strategies/${s.id}`)}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: 'var(--bg2)', border: `1px solid ${isHov ? 'var(--border3)' : 'var(--border)'}`,
                  borderRadius: 14, padding: 20, cursor: 'pointer',
                  transition: 'all 0.2s', transform: isHov ? 'translateY(-1px)' : 'none',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: cat.color, opacity: isHov ? 1 : 0, transition: 'opacity 0.2s', borderRadius: '14px 14px 0 0' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{cat.icon}</div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 100, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>{cat.label}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5, letterSpacing: '-0.2px' }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55, marginBottom: 14 }}>{s.subtitle}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div><div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Win Rate</div><div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--green)' }}>{s.winRate ? `${s.winRate}%` : '—'}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>R:R</div><div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--blue)' }}>{s.rr || '—'}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Market</div><div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{s.markets[0]}</div></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
