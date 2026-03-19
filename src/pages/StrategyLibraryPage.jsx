import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import strategies, { CATEGORIES, filterStrategies } from '../data/strategies';
import SaveButton from '../components/auth/SaveButton';
import AuthModal from '../components/auth/AuthModal';

const CAT_FILTERS = [
  { val: 'all',     label: 'All categories', count: 34 },
  { val: 'trend',   label: 'Trend following', count: 5 },
  { val: 'breakout',label: 'Breakout setups', count: 7 },
  { val: 'reversal',label: 'Reversal setups', count: 6 },
  { val: 'momentum',label: 'Momentum',         count: 4 },
  { val: 'candle',  label: 'Candlestick',      count: 11 },
  { val: 'custom',  label: 'C+V+C',            count: 1 },
];
const MKT_FILTERS  = ['All','Stocks','Crypto','Forex','F&O'];
const TF_FILTERS   = ['All','Scalping','Intraday','Swing','Positional'];
const DIFF_FILTERS = ['All','Beginner','Intermediate','Advanced'];
const SORT_OPTIONS = [
  { val: 'default', label: 'Sort: Default' },
  { val: 'winrate', label: 'Win Rate ↓' },
  { val: 'rr',      label: 'R:R Ratio ↓' },
  { val: 'name',    label: 'Name A–Z' },
];

const CAT_DOT_COLORS = { trend:'#00D68F', breakout:'#3D8EF0', reversal:'#F59E0B', momentum:'#A78BFA', candle:'#2DD4BF', custom:'#FF4D6A', all:'#4A5A74' };

export default function StrategyLibraryPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [cat,  setCat]  = useState(params.get('cat') || 'all');
  const [mkt,  setMkt]  = useState('All');
  const [tf,   setTf]   = useState('All');
  const [diff, setDiff] = useState('All');
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState(params.get('q') || '');
  const [view,  setView]  = useState('grid');
  const [hov,   setHov]   = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  let results = filterStrategies({
    category:   cat  === 'all' ? undefined : cat,
    market:     mkt  === 'All' ? undefined : mkt,
    timeframe:  tf   === 'All' ? undefined : tf,
    difficulty: diff === 'All' ? undefined : diff,
    search,
  });
  if (sort === 'winrate') results = [...results].sort((a,b) => (b.winRate||0)-(a.winRate||0));
  if (sort === 'rr')      results = [...results].sort((a,b) => {
    const rv = s => s.rr ? parseFloat(s.rr.split(':')[1]) : 0;
    return rv(b) - rv(a);
  });
  if (sort === 'name')    results = [...results].sort((a,b) => a.name.localeCompare(b.name));

  const activePills = [
    cat  !== 'all' && { key:'cat',  label:`Category: ${cat}`,  clear:()=>setCat('all') },
    mkt  !== 'All' && { key:'mkt',  label:`Market: ${mkt}`,    clear:()=>setMkt('All') },
    tf   !== 'All' && { key:'tf',   label:`TF: ${tf}`,         clear:()=>setTf('All')  },
    diff !== 'All' && { key:'diff', label:`Difficulty: ${diff}`,clear:()=>setDiff('All')},
  ].filter(Boolean);

  function clearAll() { setCat('all'); setMkt('All'); setTf('All'); setDiff('All'); setSearch(''); }

  const SideFilter = ({ label, options, active, setActive, type='simple' }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {options.map(opt => {
          const val  = typeof opt === 'string' ? opt : opt.val;
          const lbl  = typeof opt === 'string' ? opt : opt.label;
          const cnt  = typeof opt === 'object' ? opt.count : null;
          const isAct = active === val;
          const dotC = CAT_DOT_COLORS[val] || 'var(--text3)';
          return (
            <div key={val} onClick={() => setActive(val)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 9, cursor: 'pointer',
              border: '1px solid transparent',
              background: isAct ? 'var(--bg3)' : 'transparent',
              borderColor: isAct ? 'var(--border2)' : 'transparent',
              transition: 'all 0.15s',
              color: isAct ? 'var(--text)' : 'var(--text2)',
            }}
              onMouseEnter={e => { if(!isAct){ e.currentTarget.style.background='var(--bg3)'; e.currentTarget.style.color='var(--text)'; }}}
              onMouseLeave={e => { if(!isAct){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text2)'; }}}
            >
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background: dotC, flexShrink:0 }} />
                <span style={{ fontSize: 13 }}>{lbl}</span>
              </div>
              {cnt !== null && <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily:'var(--mono)' }}>{cnt}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', minHeight:'calc(100vh - 56px - 72px)' }}>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {/* Sidebar */}
      <div style={{ borderRight:'1px solid var(--border)', padding:'24px 18px', background:'var(--bg2)' }}>
        <SideFilter label="Category"   options={CAT_FILTERS}  active={cat}  setActive={setCat} />
        <div style={{ height:1, background:'var(--border)', margin:'4px 0 20px' }} />
        <SideFilter label="Market"     options={MKT_FILTERS}  active={mkt}  setActive={setMkt} />
        <div style={{ height:1, background:'var(--border)', margin:'4px 0 20px' }} />
        <SideFilter label="Timeframe"  options={TF_FILTERS}   active={tf}   setActive={setTf}  />
        <div style={{ height:1, background:'var(--border)', margin:'4px 0 20px' }} />
        <SideFilter label="Difficulty" options={DIFF_FILTERS} active={diff} setActive={setDiff}/>
      </div>

      {/* Main */}
      <div style={{ padding: 28 }}>
        {/* Header row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.3px' }}>Strategy Library</h1>
            <p style={{ fontSize:13, color:'var(--text2)', marginTop:3 }}>All 34 proven setups — filter, explore, and master each one</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Search */}
            <div style={{ position:'relative' }}>
              <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:14, height:14, stroke:'var(--text3)', fill:'none', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round' }} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search strategies…"
                style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:9, padding:'9px 12px 9px 30px', color:'var(--text)', fontSize:13, fontFamily:'var(--font)', outline:'none', width:210 }}
                onFocus={e=>{e.target.style.borderColor='var(--green)'}}
                onBlur={e=>{e.target.style.borderColor='var(--border2)'}}
              />
            </div>
            {/* Sort */}
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:9, padding:'9px 12px', color:'var(--text2)', fontSize:13, fontFamily:'var(--font)', outline:'none', cursor:'pointer' }}>
              {SORT_OPTIONS.map(o=><option key={o.val} value={o.val}>{o.label}</option>)}
            </select>
            {/* View toggle */}
            <div style={{ display:'flex', border:'1px solid var(--border2)', borderRadius:9, overflow:'hidden' }}>
              {['grid','list'].map(v=>(
                <button key={v} onClick={()=>setView(v)} style={{ background: view===v ? 'var(--bg3)' : 'transparent', border:'none', padding:'9px 11px', cursor:'pointer', color: view===v ? 'var(--green)' : 'var(--text3)', transition:'all 0.15s' }}>
                  {v==='grid'
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  }
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filter pills */}
        {activePills.length > 0 && (
          <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontSize:12, color:'var(--text3)' }}>Filters:</span>
            {activePills.map(p=>(
              <div key={p.key} onClick={p.clear} style={{ display:'flex', alignItems:'center', gap:5, background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:100, padding:'4px 10px', fontSize:12, color:'var(--text2)', cursor:'pointer' }}>
                <span style={{ fontSize:14 }}>×</span>{p.label}
              </div>
            ))}
            <span onClick={clearAll} style={{ fontSize:12, color:'var(--text3)', cursor:'pointer', textDecoration:'underline' }}>Clear all</span>
          </div>
        )}

        {/* Results count */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, paddingBottom:14, borderBottom:'1px solid var(--border)' }}>
          <span style={{ fontSize:13, color:'var(--text2)' }}>Showing <strong style={{ color:'var(--text)' }}>{results.length}</strong> of 34 strategies</span>
        </div>

        {/* Grid / List */}
        {results.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
            <p style={{ fontSize:14, marginBottom:6 }}>No strategies match your filters.</p>
            <button onClick={clearAll} style={{ color:'var(--green)', background:'none', border:'none', cursor:'pointer', fontSize:13, fontFamily:'var(--font)' }}>Clear filters</button>
          </div>
        ) : view === 'grid' ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:14 }}>
            {results.map(s => {
              const cat2 = CATEGORIES[s.category];
              const isHov2 = hov === s.id;
              return (
                <div key={s.id} onClick={()=>nav(`/strategies/${s.id}`)}
                  onMouseEnter={()=>setHov(s.id)} onMouseLeave={()=>setHov(null)}
                  style={{ background:'var(--bg2)', border:`1px solid ${isHov2?'var(--border3)':'var(--border)'}`, borderRadius:14, padding:18, cursor:'pointer', transition:'all 0.2s', transform:isHov2?'translateY(-2px)':'none', position:'relative', overflow:'hidden' }}
                >
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:cat2.color, opacity:isHov2?1:0, transition:'opacity 0.2s', borderRadius:'14px 14px 0 0' }} />
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:cat2.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>{cat2.icon}</div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                      <span style={{ fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:100, background:cat2.bg, color:cat2.color, border:`1px solid ${cat2.border}` }}>{cat2.label}</span>
                      <span style={{ fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:100, border:'1px solid var(--border2)', color:s.difficulty==='Beginner'?'var(--green)':s.difficulty==='Advanced'?'var(--red)':'var(--amber)' }}>{s.difficulty}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:5 }}>{s.name}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.55, marginBottom:14 }}>{s.subtitle}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                    <div><div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.3px' }}>Win Rate</div><div style={{ fontSize:12, fontWeight:700, fontFamily:'var(--mono)', color:'var(--green)' }}>{s.winRate?`${s.winRate}%`:'—'}</div></div>
                    <div><div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.3px' }}>R:R</div><div style={{ fontSize:12, fontWeight:700, fontFamily:'var(--mono)', color:'var(--blue)' }}>{s.rr||'—'}</div></div>
                    <div><div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.3px' }}>TF</div><div style={{ fontSize:12, fontWeight:600, fontFamily:'var(--mono)', color:'var(--text2)' }}>{s.timeframe}</div></div>
                  </div>
                  <div style={{ marginTop:10, display:'flex', justifyContent:'flex-end' }} onClick={e=>e.stopPropagation()}>
                    <SaveButton strategyId={s.id} onAuthRequired={()=>setShowAuth(true)} size="sm" showLabel={false} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {results.map(s => {
              const cat2 = CATEGORIES[s.category];
              return (
                <div key={s.id} onClick={()=>nav(`/strategies/${s.id}`)}
                  onMouseEnter={()=>setHov(s.id)} onMouseLeave={()=>setHov(null)}
                  style={{ background:'var(--bg2)', border:`1px solid ${hov===s.id?'var(--border3)':'var(--border)'}`, borderRadius:12, padding:'14px 18px', cursor:'pointer', display:'flex', alignItems:'center', gap:16, transition:'all 0.15s' }}
                >
                  <div style={{ width:34, height:34, borderRadius:9, background:cat2.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{cat2.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700 }}>{s.name}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.subtitle}</div>
                  </div>
                  <div style={{ display:'flex', gap:20, flexShrink:0 }}>
                    <div style={{ textAlign:'center' }}><div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.3px' }}>Win Rate</div><div style={{ fontSize:13, fontWeight:700, fontFamily:'var(--mono)', color:'var(--green)' }}>{s.winRate?`${s.winRate}%`:'—'}</div></div>
                    <div style={{ textAlign:'center' }}><div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.3px' }}>R:R</div><div style={{ fontSize:13, fontWeight:700, fontFamily:'var(--mono)', color:'var(--blue)' }}>{s.rr||'—'}</div></div>
                    <div style={{ textAlign:'center' }}><div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.3px' }}>TF</div><div style={{ fontSize:13, fontWeight:700, fontFamily:'var(--mono)', color:'var(--text2)' }}>{s.timeframe}</div></div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:100, background:cat2.bg, color:cat2.color, border:`1px solid ${cat2.border}`, flexShrink:0 }}>{cat2.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
