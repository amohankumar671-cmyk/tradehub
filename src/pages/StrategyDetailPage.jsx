import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStrategyById, getRelatedStrategies, CATEGORIES } from '../data/strategies';
import SaveButton from '../components/auth/SaveButton';
import AuthModal from '../components/auth/AuthModal';

export default function StrategyDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const s = getStrategyById(id);
  const [showAuth, setShowAuth] = useState(false);

  // Mini R:R calculator state
  const [rrEntry, setRrEntry] = useState(s?.winRate ? 1000 : 1000);
  const [rrSL,    setRrSL]    = useState(s?.winRate ? 940  : 940);
  const [rrTP,    setRrTP]    = useState(s?.winRate ? 1120 : 1120);

  if (!s) return (
    <div style={{ padding:40, textAlign:'center', color:'var(--text2)' }}>
      <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
      <p>Strategy not found.</p>
      <button onClick={()=>nav('/strategies')} style={{ marginTop:16, padding:'10px 22px', borderRadius:9, background:'var(--green)', border:'none', color:'#080C14', fontWeight:600, fontSize:13, fontFamily:'var(--font)', cursor:'pointer' }}>Back to Library</button>
    </div>
  );

  const cat = CATEGORIES[s.category];
  const related = getRelatedStrategies(s.relatedIds || []);

  // Mini R:R calc
  const rrRisk = Math.abs(rrEntry - rrSL);
  const rrRew  = Math.abs(rrTP   - rrEntry);
  const rrVal  = rrRisk > 0 ? (rrRew / rrRisk).toFixed(1) : '—';
  const rrOk   = parseFloat(rrVal) >= 1.5;

  const RuleList = ({ items, color }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {items.map((r,i) => (
        <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color:'var(--text2)', lineHeight:1.55 }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:color, flexShrink:0, marginTop:6 }} />
          {r}
        </div>
      ))}
    </div>
  );

  const miniInp = {
    width:'100%', background:'var(--bg4)', border:'1px solid var(--border2)',
    borderRadius:7, padding:'8px 10px 8px 24px', color:'var(--text)',
    fontSize:13, fontFamily:'var(--mono)', fontWeight:500, outline:'none',
  };

  return (
    <div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Breadcrumb */}
      <div style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'13px 28px', display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text3)' }}>
        <Link to="/" style={{ color:'var(--text2)', textDecoration:'none' }}>Home</Link><span>/</span>
        <Link to="/strategies" style={{ color:'var(--text2)', textDecoration:'none' }}>Strategies</Link><span>/</span>
        <span style={{ color:'var(--green)' }}>{s.name}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', maxWidth:1200, margin:'0 auto' }}>
        {/* Main */}
        <div style={{ padding:28, borderRight:'1px solid var(--border)' }}>

          {/* Hero */}
          <div style={{ marginBottom:28 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                <div style={{ width:52, height:52, borderRadius:14, background:cat.bg, border:`1px solid ${cat.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{cat.icon}</div>
                <div>
                  <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.5px', marginBottom:8 }}>{s.name}</h1>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {[
                      { label:cat.label,    bg:cat.bg,  color:cat.color,  border:cat.border },
                      { label:s.markets.join(' / '), bg:'var(--bbg)', color:'var(--blue)', border:'rgba(61,142,240,0.25)' },
                      { label:`${s.timeframe} · ${s.difficulty}`, bg:'rgba(245,158,11,0.08)', color:'var(--amber)', border:'rgba(245,158,11,0.25)' },
                    ].map(p => (
                      <span key={p.label} style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:100, background:p.bg, color:p.color, border:`1px solid ${p.border}` }}>{p.label}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <button onClick={()=>nav('/tools')} style={{ padding:'9px 18px', borderRadius:9, fontSize:13, fontWeight:600, fontFamily:'var(--font)', cursor:'pointer', background:'transparent', border:'1px solid var(--border2)', color:'var(--text2)', transition:'all 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--purple)';e.currentTarget.style.color='var(--purple)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--text2)'}}
                >Calc R:R</button>
                <SaveButton
                  strategyId={s.id}
                  onAuthRequired={() => setShowAuth(true)}
                />
              </div>
            </div>

            {/* KPI row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              {[
                { label:'Win Rate',   val: s.winRate ? `${s.winRate}%` : '—',  color:'var(--green)',  sub:'Based on backtest' },
                { label:'R:R Ratio',  val: s.rr || '—',                        color:'var(--blue)',   sub:'Risk to reward' },
                { label:'Avg Hold',   val: s.avgHold || '—',                   color:'var(--amber)',  sub:'Typical duration' },
                { label:'Trades',     val: s.trades || '—',                    color:'var(--text)',   sub:'Backtest sample' },
              ].map(k => (
                <div key={k.label} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:16 }}>
                  <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>{k.label}</div>
                  <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--mono)', color:k.color, letterSpacing:'-0.5px' }}>{k.val}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>{k.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Overview */}
          <div style={{ marginBottom:28 }}>
            <div className="sec-title" style={{ marginBottom:14 }}>Overview</div>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:20, fontSize:14, color:'var(--text2)', lineHeight:1.8 }}>{s.description}</div>
          </div>

          {/* Rules grid */}
          <div style={{ marginBottom:28 }}>
            <div className="sec-title" style={{ marginBottom:16 }}>Setup Rules</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[
                { title:'▲ Entry Conditions', items:s.entryRules, bg:'rgba(0,214,143,0.05)', border:'rgba(0,214,143,0.15)', color:'var(--green)' },
                { title:'▼ Exit Conditions',  items:s.exitRules,  bg:'rgba(255,77,106,0.05)',border:'rgba(255,77,106,0.15)',color:'var(--red)' },
                { title:'⚠ Stop Loss',        items:[s.stopLoss], bg:'rgba(245,158,11,0.05)', border:'rgba(245,158,11,0.15)', color:'var(--amber)' },
                { title:'◎ Targets',          items:s.targets,    bg:'rgba(61,142,240,0.05)', border:'rgba(61,142,240,0.15)', color:'var(--blue)' },
              ].map(card => (
                <div key={card.title} style={{ borderRadius:12, padding:18, background:card.bg, border:`1px solid ${card.border}` }}>
                  <div style={{ fontSize:12, fontWeight:700, color:card.color, marginBottom:12 }}>{card.title}</div>
                  <RuleList items={card.items} color={
                    card.color==='var(--green)'?'#00D68F':
                    card.color==='var(--red)'?'#FF4D6A':
                    card.color==='var(--amber)'?'#F59E0B':'#3D8EF0'
                  } />
                </div>
              ))}
            </div>
          </div>

          {/* Backtest summary */}
          {s.winRate && (
            <div style={{ marginBottom:28 }}>
              <div className="sec-title" style={{ marginBottom:16 }}>Backtest Summary</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
                {[
                  { label:'Win Rate',     val:`${s.winRate}%`,                                       color:'var(--green)' },
                  { label:'R:R Ratio',    val:s.rr||'—',                                             color:'var(--blue)'  },
                  { label:'Total Trades', val:s.trades||'—',                                          color:'var(--text)'  },
                  { label:'Avg Win',      val:`+${((parseFloat(s.rr?.split(':')[1]||2))*6).toFixed(1)}%`, color:'var(--green)' },
                  { label:'Avg Loss',     val:'-6.0%',                                                color:'var(--red)'   },
                  { label:'Max Drawdown', val:'-14%',                                                 color:'var(--amber)' },
                ].map(k=>(
                  <div key={k.label} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px' }}>
                    <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:4 }}>{k.label}</div>
                    <div style={{ fontSize:18, fontWeight:700, fontFamily:'var(--mono)', color:k.color }}>{k.val}</div>
                  </div>
                ))}
              </div>
              {/* Equity curve SVG */}
              <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:12, color:'var(--text3)', marginBottom:10 }}>Equity curve — ₹1,00,000 starting capital</div>
                <svg viewBox="0 0 600 100" width="100%" height="100" preserveAspectRatio="none">
                  <defs><clipPath id="eq"><rect x="0" y="0" width="600" height="100"/></clipPath></defs>
                  {[20,40,60,80].map(y=><line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#1e2d45" strokeWidth="0.5"/>)}
                  <polyline clipPath="url(#eq)"
                    points="0,88 55,82 110,74 160,68 210,72 260,60 310,50 360,42 410,48 460,32 520,20 580,14"
                    fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="round"
                  />
                  <polyline clipPath="url(#eq)"
                    points="0,88 55,82 110,74 160,68 210,72 260,60 310,50 360,42 410,48 460,32 520,20 580,14 580,100 0,100"
                    fill="rgba(0,214,143,0.07)" stroke="none"
                  />
                  {[['0','₹1.0L'],['300','₹1.8L'],['580','₹2.9L']].map(([x,l])=>(
                    <text key={l} x={x} y="98" fill="#4A5A74" fontSize="8" fontFamily="monospace" textAnchor={x==='0'?'start':x==='580'?'end':'middle'}>{l}</text>
                  ))}
                </svg>
              </div>
            </div>
          )}

          {/* Mistakes */}
          <div style={{ marginBottom:28 }}>
            <div className="sec-title" style={{ marginBottom:16 }}>Common Mistakes to Avoid</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {s.mistakes.map((m,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, background:'rgba(255,77,106,0.04)', border:'1px solid rgba(255,77,106,0.12)', borderRadius:10, padding:14 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:'rgba(255,77,106,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:13, color:'var(--red)', fontWeight:700 }}>✗</div>
                  <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>{m}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div>
              <div className="sec-title" style={{ marginBottom:16 }}>Related Strategies</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
                {related.map(r => (
                  <div key={r.id} onClick={()=>nav(`/strategies/${r.id}`)} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:14, cursor:'pointer', transition:'all 0.2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border3)';e.currentTarget.style.transform='translateY(-1px)'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='none'}}
                  >
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>{r.name}</div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>{CATEGORIES[r.category]?.label} · {r.timeframe}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ padding:'24px 18px', background:'var(--bg2)' }}>
          <SaveButton
            strategyId={s.id}
            onAuthRequired={() => setShowAuth(true)}
            showLabel={true}
          />
          <div style={{ height:8 }} />
          <button onClick={()=>nav('/tools')} style={{ width:'100%', padding:11, borderRadius:10, fontSize:13, fontWeight:600, fontFamily:'var(--font)', cursor:'pointer', background:'transparent', border:'1px solid var(--border2)', color:'var(--text2)', marginBottom:20, transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--blue)';e.currentTarget.style.color='var(--blue)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--text2)'}}
          >Open Full Calculator ↗</button>

          {/* Embedded mini R:R calc */}
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:16, marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>Quick R:R Check</div>
            {[
              { label:'Entry (₹)',  val:rrEntry, set:setRrEntry },
              { label:'Stop Loss',  val:rrSL,    set:setRrSL   },
              { label:'Target',     val:rrTP,    set:setRrTP   },
            ].map(f=>(
              <div key={f.label} style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:5 }}>{f.label}</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'var(--text3)', pointerEvents:'none' }}>₹</span>
                  <input type="number" value={f.val} onChange={e=>f.set(parseFloat(e.target.value)||0)} style={miniInp}
                    onFocus={e=>{e.target.style.borderColor='var(--purple)'}}
                    onBlur={e=>{e.target.style.borderColor='var(--border2)'}}
                  />
                </div>
              </div>
            ))}
            <div style={{ marginTop:14, padding:'12px 14px', borderRadius:9, background: rrOk?'rgba(0,214,143,0.08)':'rgba(255,77,106,0.08)', border:`1px solid ${rrOk?'rgba(0,214,143,0.2)':'rgba(255,77,106,0.2)'}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, color:'var(--text2)' }}>R:R Ratio</span>
              <span style={{ fontSize:16, fontWeight:700, fontFamily:'var(--mono)', color: rrOk?'var(--green)':'var(--red)' }}>
                {rrVal === '—' ? '—' : `1 : ${rrVal}`}
              </span>
            </div>
            <div style={{ marginTop:8, fontSize:11, color: rrOk?'var(--green)':'var(--red)', textAlign:'center', fontWeight:600 }}>
              {rrVal === '—' ? '' : rrOk ? '✓ Good — meets 1:1.5 minimum' : '✗ Below 1:1.5 — adjust levels'}
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:16, marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:14 }}>Quick Stats</div>
            {[
              { k:'Category',    v:cat.label,              c:'var(--green)' },
              { k:'Win Rate',    v:s.winRate?`${s.winRate}%`:'—', c:'var(--green)' },
              { k:'R:R Ratio',   v:s.rr||'—',              c:'var(--blue)' },
              { k:'Timeframe',   v:s.timeframe,            c:'var(--amber)' },
              { k:'Difficulty',  v:s.difficulty,           c:'var(--text2)' },
              { k:'Markets',     v:s.markets.join(', '),   c:'var(--text2)' },
            ].map(row=>(
              <div key={row.k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:12, color:'var(--text3)' }}>{row.k}</span>
                <span style={{ fontSize:12, fontWeight:700, fontFamily:'var(--mono)', color:row.c }}>{row.v}</span>
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:16 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>Indicators Required</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {s.indicators.map((ind,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:i===0?'var(--green)':i===1?'var(--amber)':i===2?'var(--blue)':i===3?'var(--purple)':'var(--text3)', flexShrink:0 }} />
                  <span style={{ color:'var(--text2)' }}>{ind}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

