import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const footerLinks = [
  { to: '/strategies',   label: 'Strategies' },
  { to: '/candlesticks', label: 'Candlesticks' },
  { to: '/tools',        label: 'Tools' },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--bg2)',
        padding: '24px 28px',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 24,
              height: 24,
              background: 'var(--green)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={13} color="#080C14" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text3)' }}>
            TradeHub © {new Date().getFullYear()} — For educational purposes only. Not financial advice.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {footerLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                fontSize: 12,
                color: 'var(--text3)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
