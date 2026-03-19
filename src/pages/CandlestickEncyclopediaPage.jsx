import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import patterns, { PATTERN_TYPES, filterPatterns } from '../data/candlesticks';

const FILTER_TABS = [
  { val: 'all',  label: 'All patterns', count: 11 },
  { val: 'bull', label: 'Bullish reversal', count: 5 },
  { val: 'bear', label: 'Bearish reversal', count: 4 },
  { val: 'cont', label: 'Continuation', count: 2 },
];

function PatternCard({ pattern, isSelected, onClick }) {
  const [hov, setHov] = useState(false);
  const pt = PATTERN_TYPES[pattern.type];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: isSelected
          ? `${pt.bg}`
          : 'var(--bg2)',
        border: `1px solid ${isSelected ? pt.border : hov ? 'var(--border3)' : 'var(--border)'}`,
        borderRadius: 16,
        padding: 18,
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: hov && !isSelected ? 'translateY(-2px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', marginBottom: 3 }}>
            {pattern.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.4 }}>
            {pattern.shortDesc}
          </div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 100,
          background: pt.bg, color: pt.color, border: `1px solid ${pt.border}`,
          whiteSpace: 'nowrap', marginLeft: 8, flexShrink: 0,
        }}>
          {pt.label}
        </span>
      </div>

      {/* Candle diagram */}
      <div style={{
        background: 'var(--bg3)', borderRadius: 10, padding: '10px 0',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
      }}
        dangerouslySetInnerHTML={{ __html: pattern.previewSVG }}
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        {[
          { label: 'Win Rate', value: `${pattern.winRate}%`, color: 'var(--green)' },
          { label: 'R:R',      value: pattern.rr,            color: 'var(--blue)'  },
          { label: 'TF',       value: pattern.timeframe,     color: 'var(--text2)' },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)', color: s.color, marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailPanel({ pattern }) {
  const nav = useNavigate();

  if (!pattern) {
    return (
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 32,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: 400, textAlign: 'center',
      }}>
        <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.4 }}>🕯️</div>
        <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 6 }}>Select any pattern</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6, maxWidth: 240 }}>
          Click a card to see full details, entry rules, confirmation tips, and stop loss guidance.
        </div>
      </div>
    );
  }

  const pt = PATTERN_TYPES[pattern.type];

  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 16, overflow: 'hidden',
      position: 'sticky', top: 76,
    }}>
      {/* Header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)' }}>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
          background: pt.bg, color: pt.color, border: `1px solid ${pt.border}`,
          display: 'inline-block', marginBottom: 10,
        }}>
          {pt.label}
        </span>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 6 }}>
          {pattern.name}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>
          {pattern.description}
        </p>
      </div>

      {/* Body — scrollable */}
      <div style={{ padding: '16px 20px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>

        {/* Detail SVG chart */}
        <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '14px 10px', marginBottom: 18 }}
          dangerouslySetInnerHTML={{ __html: pattern.detailSVG }}
        />

        {/* KPI tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
          {[
            { label: 'Win Rate',   value: `${pattern.winRate}%`, color: 'var(--green)' },
            { label: 'R:R Ratio',  value: pattern.rr,            color: 'var(--blue)'  },
            { label: 'Timeframe',  value: pattern.timeframe,     color: 'var(--amber)' },
            { label: 'Candles',    value: `${pattern.candles} candle${pattern.candles > 1 ? 's' : ''}`, color: 'var(--purple)' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--mono)', color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Context */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Context</div>
          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 9, padding: '10px 12px', fontSize: 12, color: 'var(--text2)', lineHeight: 1.65 }}>
            {pattern.context}
          </div>
        </div>

        {/* Rules */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Setup Rules</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {pattern.rules.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: pt.color, flexShrink: 0, marginTop: 5 }} />
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Confirmation</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: 5 }} />
            {pattern.confirmation}
          </div>
        </div>

        {/* Stop Loss */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Stop Loss</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', flexShrink: 0, marginTop: 5 }} />
            {pattern.stopLoss}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => nav(`/strategies?cat=candle`)}
          style={{
            width: '100%', padding: 11, borderRadius: 10, fontSize: 13,
            fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer',
            background: pt.color, border: 'none',
            color: pattern.type === 'bull' ? '#080C14' : pattern.type === 'cont' ? '#080C14' : '#fff',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          View {pattern.name} Strategy →
        </button>
      </div>
    </div>
  );
}

export default function CandlestickEncyclopediaPage() {
  const [activeType, setActiveType] = useState('all');
  const [selected,   setSelected]   = useState(null);
  const filtered = filterPatterns(activeType);

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '13px 28px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text3)' }}>
        <span style={{ color: 'var(--text2)' }}>Home</span><span>/</span>
        <span style={{ color: 'var(--teal)' }}>Candlestick Encyclopedia</span>
      </div>

      {/* Page header */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.25)',
              color: 'var(--teal)', padding: '4px 12px', borderRadius: 100,
              fontSize: 11, fontWeight: 600, marginBottom: 10,
            }}>
              🕯 11 patterns documented
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 6 }}>
              Candlestick Encyclopedia
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 540 }}>
              Every pattern explained with hand-drawn diagrams, entry rules, confirmation signals and win-rate data. Click any card for full details.
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {FILTER_TABS.map(tab => {
            const isAct = activeType === tab.val;
            const tabColor = tab.val === 'bull' ? 'var(--green)' : tab.val === 'bear' ? 'var(--red)' : tab.val === 'cont' ? 'var(--amber)' : 'var(--text)';
            const tabBg   = tab.val === 'bull' ? 'rgba(0,214,143,0.1)' : tab.val === 'bear' ? 'rgba(255,77,106,0.1)' : tab.val === 'cont' ? 'rgba(245,158,11,0.1)' : 'var(--bg3)';
            const tabBdr  = tab.val === 'bull' ? 'rgba(0,214,143,0.3)' : tab.val === 'bear' ? 'rgba(255,77,106,0.3)' : tab.val === 'cont' ? 'rgba(245,158,11,0.3)' : 'var(--border2)';
            return (
              <button
                key={tab.val}
                onClick={() => { setActiveType(tab.val); setSelected(null); }}
                style={{
                  padding: '7px 18px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                  fontFamily: 'var(--font)', cursor: 'pointer', transition: 'all 0.15s',
                  background: isAct ? tabBg : 'transparent',
                  border: `1px solid ${isAct ? tabBdr : 'var(--border2)'}`,
                  color: isAct ? tabColor : 'var(--text2)',
                }}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px 48px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>

        {/* Pattern grid */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
            {filtered.map(p => (
              <PatternCard
                key={p.id}
                pattern={p}
                isSelected={selected?.id === p.id}
                onClick={() => setSelected(selected?.id === p.id ? null : p)}
              />
            ))}
          </div>

          {/* Stats row */}
          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Avg Win Rate',   value: '67%',     color: 'var(--green)',  sub: 'Across all 11 patterns' },
              { label: 'Avg R:R',        value: '1 : 2.2', color: 'var(--blue)',   sub: 'Risk to reward average' },
              { label: 'Best Pattern',   value: 'Three White Soldiers', color: 'var(--amber)', sub: '72% win rate' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--mono)', color: s.color, marginBottom: 3 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <DetailPanel pattern={selected} />
      </div>
    </div>
  );
}
