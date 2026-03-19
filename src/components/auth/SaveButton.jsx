import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SaveButton({ strategyId, onAuthRequired, size = 'md', showLabel = true }) {
  const { user, isSaved, saveStrategy, unsaveStrategy } = useAuth();
  const [loading, setLoading] = useState(false);
  const saved = isSaved(strategyId);

  const pad  = size === 'sm' ? '5px 10px'  : '9px 18px';
  const fs   = size === 'sm' ? 12          : 13;
  const iconSz = size === 'sm' ? 13 : 15;

  async function toggle(e) {
    e.stopPropagation();
    if (!user) { onAuthRequired?.(); return; }
    setLoading(true);
    if (saved) await unsaveStrategy(strategyId);
    else       await saveStrategy(strategyId);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Remove from saved' : 'Save strategy'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: pad, borderRadius: 8, fontSize: fs, fontWeight: 600,
        fontFamily: 'var(--font)', cursor: loading ? 'wait' : 'pointer',
        background: saved ? 'rgba(0,214,143,0.1)' : 'transparent',
        border: `1px solid ${saved ? 'rgba(0,214,143,0.3)' : 'var(--border2)'}`,
        color: saved ? 'var(--green)' : 'var(--text2)',
        transition: 'all 0.2s',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (!loading) {
          e.currentTarget.style.borderColor = saved ? 'rgba(255,77,106,0.4)' : 'rgba(0,214,143,0.3)';
          e.currentTarget.style.color = saved ? 'var(--red)' : 'var(--green)';
          e.currentTarget.style.background = saved ? 'rgba(255,77,106,0.08)' : 'rgba(0,214,143,0.08)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = saved ? 'rgba(0,214,143,0.3)' : 'var(--border2)';
        e.currentTarget.style.color = saved ? 'var(--green)' : 'var(--text2)';
        e.currentTarget.style.background = saved ? 'rgba(0,214,143,0.1)' : 'transparent';
      }}
    >
      {/* Bookmark icon */}
      <svg width={iconSz} height={iconSz} viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      {showLabel && (loading ? 'Saving…' : saved ? 'Saved' : 'Save')}
    </button>
  );
}
