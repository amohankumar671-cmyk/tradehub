import { CATEGORIES } from '../../data/strategies';

/* ── Category Badge ──────────────────────────────────── */
export function CategoryBadge({ category, size = 'sm' }) {
  const cat = CATEGORIES[category];
  if (!cat) return null;
  const pad = size === 'sm' ? '3px 9px' : '4px 12px';
  const fs  = size === 'sm' ? 10 : 11;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: pad, borderRadius: 100,
      fontSize: fs, fontWeight: 600,
      background: cat.bg, color: cat.color, border: `1px solid ${cat.border}`,
    }}>
      {cat.label}
    </span>
  );
}

/* ── Difficulty Badge ───────────────────────────────── */
const DIFF_COLORS = {
  Beginner:     { color: '#00D68F', bg: 'rgba(0,214,143,0.1)',   border: 'rgba(0,214,143,0.25)' },
  Intermediate: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  Advanced:     { color: '#FF4D6A', bg: 'rgba(255,77,106,0.1)',  border: 'rgba(255,77,106,0.25)' },
};
export function DifficultyBadge({ difficulty }) {
  const d = DIFF_COLORS[difficulty] || DIFF_COLORS.Beginner;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 100,
      fontSize: 10, fontWeight: 600,
      background: d.bg, color: d.color, border: `1px solid ${d.border}`,
    }}>
      {difficulty}
    </span>
  );
}

/* ── Stat Card ──────────────────────────────────────── */
export function StatCard({ label, value, color = 'var(--text)', sub }) {
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--mono)', color, letterSpacing: '-0.5px' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

/* ── Section Title ──────────────────────────────────── */
export function SectionTitle({ children, accentColor = 'var(--green)' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px',
      marginBottom: 16,
    }}>
      <div style={{ width: 3, height: 16, borderRadius: 2, background: accentColor, flexShrink: 0 }} />
      {children}
    </div>
  );
}

/* ── Strategy Card ──────────────────────────────────── */
export function StrategyCard({ strategy, onClick }) {
  const cat = CATEGORIES[strategy.category];
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 18,
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border3)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.querySelector('.card-top-bar').style.opacity = '1';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.querySelector('.card-top-bar').style.opacity = '0';
      }}
    >
      {/* Top color bar */}
      <div className="card-top-bar" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: cat?.color, opacity: 0, transition: 'opacity 0.2s',
        borderRadius: '14px 14px 0 0',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: cat?.bg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 16, flexShrink: 0,
        }}>
          {cat?.icon}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <CategoryBadge category={strategy.category} />
          <DifficultyBadge difficulty={strategy.difficulty} />
        </div>
      </div>

      {/* Name + desc */}
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5, letterSpacing: '-0.2px' }}>
        {strategy.name}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55, marginBottom: 14 }}>
        {strategy.subtitle}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 6, paddingTop: 12, borderTop: '1px solid var(--border)',
      }}>
        {[
          { label: 'Win Rate', value: strategy.winRate ? `${strategy.winRate}%` : '—', color: 'var(--green)' },
          { label: 'R:R',      value: strategy.rr || '—',                              color: 'var(--blue)'  },
          { label: 'TF',       value: strategy.timeframe,                              color: 'var(--text2)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)', color }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page Header ────────────────────────────────────── */
export function PageHeader({ badge, title, subtitle }) {
  return (
    <div style={{ marginBottom: 32 }}>
      {badge && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--bbg)', border: '1px solid rgba(61,142,240,0.25)',
          color: 'var(--blue)', padding: '4px 12px', borderRadius: 100,
          fontSize: 11, fontWeight: 600, marginBottom: 10,
        }}>
          {badge}
        </div>
      )}
      <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 6 }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ── Input Field ────────────────────────────────────── */
export function InputField({ label, hint, prefix, suffix, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          display: 'block', fontSize: 12, fontWeight: 600,
          color: 'var(--text3)', textTransform: 'uppercase',
          letterSpacing: '0.4px', marginBottom: 7,
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 13, color: 'var(--text2)', fontWeight: 600, pointerEvents: 'none',
          }}>
            {prefix}
          </span>
        )}
        <input
          {...props}
          style={{
            width: '100%',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: 9,
            padding: `10px ${suffix ? 44 : 14}px 10px ${prefix ? 28 : 14}px`,
            color: 'var(--text)',
            fontSize: 14,
            fontFamily: 'var(--mono)',
            fontWeight: 500,
            outline: 'none',
            transition: 'border-color 0.2s',
            ...props.style,
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--green)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border2)'; }}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
            fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font)', fontWeight: 600, pointerEvents: 'none',
          }}>
            {suffix}
          </span>
        )}
      </div>
      {hint && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
