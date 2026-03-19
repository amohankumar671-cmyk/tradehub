import { useState } from 'react';

function fmt(n) { return isNaN(n)||!isFinite(n) ? '—' : '₹'+Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}); }

function PositionSizeCalc() {
  const [capital, setCapital] = useState(100000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry,   setEntry]   = useState(1124);
  const [sl,      setSl]      = useState(1064);
  const [broker,  setBroker]  = useState(20);
  const [mkt,     setMkt]     = useState('equity');

  const riskRs    = capital * (riskPct / 100);
  const riskPerU  = Math.abs(entry - sl);
  const shares    = riskPerU > 0 ? Math.floor(riskRs / riskPerU) : 0;
  const capDeploy = shares * entry + broker * 2;
  const capPct    = capital > 0 ? (capDeploy / capital * 100) : 0;
  const unit      = { equity:'shares', fo:'lots', crypto:'units', forex:'units' }[mkt];

  const warnLevel = riskPct > 3 ? 'red' : riskPct > 2 ? 'amber' : capPct > 50 ? 'amber' : 'green';
  const warnText  = riskPct > 3 ? `High risk! ${riskPct}% per trade is aggressive — one bad streak can destroy your account.`
    : riskPct > 2 ? `Moderate risk. ${riskPct}% is acceptable but consider 1–1.5% for consistency.`
    : capPct > 50 ? `Capital concentration: ${capPct.toFixed(0)}% in one trade. Consider a wider stop or smaller size.`
    : `Good risk management. ${riskPct}% risk with ${capPct.toFixed(0)}% capital deployed.`;

  const warnColors = { green:['rgba(0,214,143,0.08)','rgba(0,214,143,0.25)','var(--green)'], amber:['rgba(245,158,11,0.08)','rgba(245,158,11,0.3)','var(--amber)'], red:['rgba(255,77,106,0.08)','rgba(255,77,106,0.25)','var(--red)'] };
  const [wBg, wBdr, wClr] = warnColors[warnLevel];

  const Field = ({ label, value, onChange, prefix='₹', suffix, type='number', children }) => (
    <div>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:7 }}>{label}</label>
      {children || (
        <div style={{ position:'relative' }}>
          {prefix && <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'var(--text2)', fontWeight:600, pointerEvents:'none' }}>{prefix}</span>}
          <input type={type} value={value} onChange={e=>onChange(parseFloat(e.target.value)||0)}
            style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:9, padding:`10px ${suffix?44:14}px 10px ${prefix?28:14}px`, color:'var(--text)', fontSize:14, fontFamily:'var(--mono)', fontWeight:500, outline:'none' }}
            onFocus={e=>{e.target.style.borderColor='var(--green)'}} onBlur={e=>{e.target.style.borderColor='var(--border2)'}}
          />
          {suffix && <span style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'var(--text3)', pointerEvents:'none' }}>{suffix}</span>}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
      <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:'rgba(0,214,143,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        </div>
        <div>
          <div style={{ fontSize:15, fontWeight:700 }}>Position Size Calculator</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>How many shares/lots to buy based on your risk</div>
        </div>
      </div>
      <div style={{ padding:22 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
          <Field label="Account Capital" value={capital} onChange={setCapital} />
          <Field label="Risk Per Trade" value={riskPct} onChange={v=>{setRiskPct(v)}} prefix="" suffix="%" />
        </div>

        {/* Slider */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.4px' }}>Risk % slider</label>
            <span style={{ fontSize:14, fontWeight:700, fontFamily:'var(--mono)', color:'var(--green)' }}>{riskPct.toFixed(1)}%</span>
          </div>
          <input type="range" min="0.1" max="5" step="0.1" value={riskPct} onChange={e=>setRiskPct(parseFloat(e.target.value))} style={{ width:'100%' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text3)', marginTop:4 }}>
            <span>0.1% Conservative</span><span>2.5% Moderate</span><span>5% Aggressive</span>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
          <Field label="Entry Price" value={entry} onChange={setEntry} />
          <Field label="Stop Loss Price" value={sl} onChange={setSl} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
          <Field label="Brokerage (per side)" value={broker} onChange={setBroker} prefix="" suffix="₹" />
          <Field label="Market">
            <select value={mkt} onChange={e=>setMkt(e.target.value)} style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:9, padding:'10px 14px', color:'var(--text2)', fontSize:13, fontFamily:'var(--font)', outline:'none' }}>
              <option value="equity">Equity (Shares)</option>
              <option value="fo">F&O (Lots)</option>
              <option value="crypto">Crypto (Units)</option>
              <option value="forex">Forex (Units)</option>
            </select>
          </Field>
        </div>

        {/* Results */}
        <div style={{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:12, padding:18, marginBottom:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { label:'Max risk amount',   val:fmt(riskRs),             color:'var(--red)',    sub:`${riskPct}% of capital` },
            { label:'Position size',     val:`${shares} ${unit}`,     color:'var(--green)',  sub:`at ${fmt(entry)} entry` },
            { label:'Capital deployed',  val:fmt(capDeploy),          color:'var(--blue)',   sub:`${capPct.toFixed(1)}% of account` },
            { label:'Risk per unit',     val:fmt(riskPerU),           color:'var(--amber)',  sub:'entry − stop loss' },
          ].map(k=>(
            <div key={k.label}>
              <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:6 }}>{k.label}</div>
              <div style={{ fontSize:20, fontWeight:700, fontFamily:'var(--mono)', color:k.color, letterSpacing:'-0.5px' }}>{k.val}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ background:wBg, border:`1px solid ${wBdr}`, borderRadius:10, padding:'11px 14px', fontSize:12, color:wClr, lineHeight:1.6, marginBottom:14, display:'flex', gap:8, alignItems:'flex-start' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:wClr, flexShrink:0, marginTop:4 }} />
          {warnText}
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={()=>{setCapital(100000);setRiskPct(1);setEntry(1124);setSl(1064);setBroker(20);}} style={{ flex:1, padding:10, borderRadius:9, fontSize:13, fontWeight:600, fontFamily:'var(--font)', cursor:'pointer', background:'var(--green)', border:'none', color:'#080C14' }}>Reset</button>
        </div>
      </div>
    </div>
  );
}

function RRCalc() {
  const [entry, setEntry] = useState(1124);
  const [sl,    setSl]    = useState(1064);
  const [tp1,   setTp1]   = useState(1244);
  const [tp2,   setTp2]   = useState(1380);
  const [dir,   setDir]   = useState('long');

  const risk  = Math.abs(entry - sl);
  const rew1  = Math.abs(tp1 - entry);
  const rew2  = Math.abs(tp2 - entry);
  const rr1   = risk > 0 ? rew1 / risk : 0;
  const rr2   = risk > 0 ? rew2 / risk : 0;
  const minWR = rr1 > 0 ? Math.round(100 / (1 + rr1)) : 0;

  const verdict = rr1 >= 2 ? { title:'Excellent — take it', sub:`R:R of 1:${rr1.toFixed(1)} is strong. Win ${minWR}% to be profitable.`, bg:'var(--gbg)', bdr:'var(--gbdr)', clr:'var(--green)', icon:'✓' }
    : rr1 >= 1.5 ? { title:'Good — take it', sub:`R:R of 1:${rr1.toFixed(1)} meets the 1:1.5 minimum. Win ${minWR}% to stay profitable.`, bg:'var(--gbg)', bdr:'var(--gbdr)', clr:'var(--green)', icon:'✓' }
    : rr1 >= 1   ? { title:'Marginal — caution', sub:`R:R of 1:${rr1.toFixed(1)} is below 1:1.5. Move target or tighten stop.`, bg:'rgba(245,158,11,0.08)', bdr:'rgba(245,158,11,0.3)', clr:'var(--amber)', icon:'~' }
    : { title:'Skip this trade', sub:`R:R of 1:${rr1.toFixed(1)} is too low. Need >50% win rate just to break even.`, bg:'rgba(255,77,106,0.08)', bdr:'rgba(255,77,106,0.25)', clr:'var(--red)', icon:'✗' };

  const allP = [sl, entry, tp1, tp2].filter(Boolean);
  const lo = Math.min(...allP), hi = Math.max(...allP);
  const range = hi - lo || 1;
  const pct = p => ((p - lo) / range * 80 + 10);

  const riskBarW = risk + rew1 > 0 ? Math.round(risk / (risk + rew1) * 100) : 30;

  const InpF = ({ label, value, onChange, hint }) => (
    <div>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:7 }}>{label}</label>
      <div style={{ position:'relative' }}>
        <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'var(--text2)', fontWeight:600, pointerEvents:'none' }}>₹</span>
        <input type="number" value={value} onChange={e=>onChange(parseFloat(e.target.value)||0)}
          style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:9, padding:'10px 14px 10px 28px', color:'var(--text)', fontSize:14, fontFamily:'var(--mono)', fontWeight:500, outline:'none' }}
          onFocus={e=>{e.target.style.borderColor='var(--purple)'}} onBlur={e=>{e.target.style.borderColor='var(--border2)'}}
        />
      </div>
      {hint && <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>{hint}</div>}
    </div>
  );

  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
      <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:'rgba(167,139,250,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
        </div>
        <div>
          <div style={{ fontSize:15, fontWeight:700 }}>Risk : Reward Calculator</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>Is this trade worth taking? Check before entry.</div>
        </div>
      </div>
      <div style={{ padding:22 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          <InpF label="Entry Price" value={entry} onChange={setEntry} />
          <InpF label="Stop Loss"   value={sl}    onChange={setSl} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          <InpF label="Target 1 (TP1)" value={tp1} onChange={setTp1} hint="Book 50% here" />
          <InpF label="Target 2 (TP2)" value={tp2} onChange={setTp2} hint="Trail 9 EMA → R5" />
        </div>

        {/* Direction toggle */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>Direction</label>
          <div style={{ display:'flex', gap:8 }}>
            {['long','short'].map(d=>(
              <button key={d} onClick={()=>setDir(d)} style={{ flex:1, padding:'9px', borderRadius:8, fontSize:12, fontWeight:700, fontFamily:'var(--font)', cursor:'pointer', transition:'all 0.15s',
                background: dir===d ? (d==='long'?'rgba(0,214,143,0.1)':'rgba(255,77,106,0.1)') : 'transparent',
                border: dir===d ? `1px solid ${d==='long'?'rgba(0,214,143,0.3)':'rgba(255,77,106,0.3)'}` : '1px solid var(--border2)',
                color: dir===d ? (d==='long'?'var(--green)':'var(--red)') : 'var(--text3)',
              }}>{d === 'long' ? '▲ LONG' : '▼ SHORT'}</button>
            ))}
          </div>
        </div>

        {/* R:R bar */}
        <div style={{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:12, padding:18, marginBottom:14 }}>
          <div style={{ height:32, background:'var(--bg4)', borderRadius:8, overflow:'hidden', display:'flex', marginBottom:12 }}>
            <div style={{ width:`${riskBarW}%`, background:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', fontFamily:'var(--mono)', transition:'width 0.4s', minWidth:0 }}>
              {riskBarW > 15 ? 'RISK' : ''}
            </div>
            <div style={{ flex:1, background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#080C14', fontFamily:'var(--mono)' }}>
              {(100-riskBarW) > 20 ? 'REWARD' : ''}
            </div>
          </div>

          {/* Price line */}
          <div style={{ position:'relative', height:56, margin:'16px 0 10px' }}>
            <div style={{ position:'absolute', top:'50%', left:0, right:0, height:3, background:'var(--border2)', transform:'translateY(-50%)', borderRadius:2 }} />
            <div style={{ position:'absolute', top:'50%', left:`${Math.min(pct(entry),pct(sl))}%`, width:`${Math.abs(pct(entry)-pct(sl))}%`, height:3, background:'var(--red)', transform:'translateY(-50%)' }} />
            <div style={{ position:'absolute', top:'50%', left:`${pct(entry)}%`, width:`${pct(tp1)-pct(entry)}%`, height:3, background:'var(--green)', transform:'translateY(-50%)' }} />
            {[
              { p:sl,    col:'var(--red)',    lbl:'SL',    pos:'bot' },
              { p:entry, col:'var(--blue)',   lbl:'Entry', pos:'top' },
              { p:tp1,   col:'var(--green)',  lbl:'TP1',   pos:'bot' },
              { p:tp2,   col:'var(--green)',  lbl:'TP2',   pos:'top' },
            ].map(dot=>(
              <div key={dot.lbl} style={{ position:'absolute', left:`${pct(dot.p)}%`, top:'50%', transform:'translate(-50%,-50%)' }}>
                <div style={{ width: dot.lbl==='Entry'?14:10, height:dot.lbl==='Entry'?14:10, borderRadius:'50%', background:dot.col, border:'2px solid var(--bg)', position:'relative', zIndex:2 }} />
                <div style={{ position:'absolute', [dot.pos==='top'?'bottom':'top']:'100%', left:'50%', transform:'translateX(-50%)', [dot.pos==='top'?'marginBottom':'marginTop']:4, fontSize:10, fontFamily:'var(--mono)', fontWeight:600, color:dot.col, whiteSpace:'nowrap' }}>{dot.lbl}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--text2)' }}>
            {[['var(--red)','Risk zone'],['var(--green)','Reward zone'],['var(--blue)','Entry']].map(([c,l])=>(
              <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:10, height:10, borderRadius: l==='Entry'?'50%':3, background:c }} />{l}
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div style={{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:12, padding:18, marginBottom:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { label:'R:R to TP1',         val:`1 : ${rr1.toFixed(1)}`,  color:'var(--purple)' },
            { label:'R:R to TP2',         val:`1 : ${rr2.toFixed(1)}`,  color:'var(--purple)' },
            { label:'Risk per unit',      val:fmt(risk),                 color:'var(--red)'    },
            { label:'Min win rate needed',val:`${minWR}%`,               color:'var(--amber)'  },
          ].map(k=>(
            <div key={k.label}>
              <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:6 }}>{k.label}</div>
              <div style={{ fontSize:20, fontWeight:700, fontFamily:'var(--mono)', color:k.color, letterSpacing:'-0.5px' }}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div style={{ background:verdict.bg, border:`1px solid ${verdict.bdr}`, borderRadius:12, padding:'13px 16px', display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:`rgba(0,0,0,0.1)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16, color:verdict.clr, fontWeight:700 }}>{verdict.icon}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:verdict.clr, marginBottom:2 }}>{verdict.title}</div>
            <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.5 }}>{verdict.sub}</div>
          </div>
        </div>

        <button onClick={()=>{setEntry(1124);setSl(1064);setTp1(1244);setTp2(1380);setDir('long');}} style={{ width:'100%', padding:10, borderRadius:9, fontSize:13, fontWeight:600, fontFamily:'var(--font)', cursor:'pointer', background:'var(--purple)', border:'none', color:'#fff' }}>Reset</button>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 28px' }}>
      <div style={{ marginBottom:32 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(61,142,240,0.1)', border:'1px solid rgba(61,142,240,0.25)', color:'var(--blue)', padding:'4px 12px', borderRadius:100, fontSize:11, fontWeight:600, marginBottom:10 }}>
          2 calculators — fully interactive
        </div>
        <h1 style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.4px', marginBottom:6 }}>Trading Calculators</h1>
        <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.6 }}>Calculate your position size and risk:reward before every trade. Never risk more than you plan.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <PositionSizeCalc />
        <RRCalc />
      </div>
    </div>
  );
}
