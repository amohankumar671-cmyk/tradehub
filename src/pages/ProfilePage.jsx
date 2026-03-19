import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStrategyById, CATEGORIES } from '../data/strategies';

function Avatar({ user, profile, size = 44 }) {
  const initials = (profile?.displayName || user?.email || 'T').slice(0, 2).toUpperCase();
  if (user?.photoURL) {
    return <img src={user.photoURL} alt={initials} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border2)' }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(0,214,143,0.15)', border: '2px solid rgba(0,214,143,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const nav = useNavigate();
  const { user, profile, logout, savedStrategies, unsaveStrategy } = useAuth();

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 14, padding: 40 }}>
        <div style={{ fontSize: 36, opacity: 0.4 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Sign in to view your profile</div>
        <div style={{ fontSize: 14, color: 'var(--text2)' }}>Save strategies, track your progress, and access your dashboard.</div>
        <button onClick={() => nav('/')} style={{ marginTop: 8, padding: '10px 22px', borderRadius: 9, background: 'var(--green)', border: 'none', color: '#080C14', fontWeight: 600, fontSize: 13, fontFamily: 'var(--font)', cursor: 'pointer' }}>
          Go to Home
        </button>
      </div>
    );
  }

  const saved = savedStrategies.map(id => getStrategyById(id)).filter(Boolean);
  const joinDate = profile?.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently';

  async function handleLogout() {
    await logout();
    nav('/');
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px' }}>

      {/* Profile header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Avatar user={user} profile={profile} size={64} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px' }}>{profile?.displayName || 'Trader'}</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 3 }}>{user.email}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Member since {joinDate}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleLogout} style={{ padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)'; }}
          >Sign Out</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Saved Strategies', value: savedStrategies.length, color: 'var(--green)'  },
          { label: 'Markets Covered',  value: [...new Set(saved.flatMap(s => s.markets))].length, color: 'var(--blue)'  },
          { label: 'Categories',       value: [...new Set(saved.map(s => s.category))].length,     color: 'var(--purple)'},
          { label: 'Avg Win Rate',     value: saved.length ? Math.round(saved.filter(s => s.winRate).reduce((a, s) => a + s.winRate, 0) / saved.filter(s => s.winRate).length) + '%' : '—', color: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)', color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Saved strategies */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Saved Strategies</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Your personal strategy library</div>
          </div>
          <button onClick={() => nav('/strategies')} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', background: 'var(--green)', border: 'none', color: '#080C14', transition: 'background 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#00f0a0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--green)'; }}
          >+ Explore More</button>
        </div>

        {saved.length === 0 ? (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.4 }}>📚</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No saved strategies yet</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6, marginBottom: 20 }}>
              Browse the strategy library and tap the bookmark icon to save setups you want to study.
            </div>
            <button onClick={() => nav('/strategies')} style={{ padding: '10px 22px', borderRadius: 9, background: 'var(--green)', border: 'none', color: '#080C14', fontWeight: 600, fontSize: 13, fontFamily: 'var(--font)', cursor: 'pointer' }}>
              Browse Strategies
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
            {saved.map(s => {
              const cat = CATEGORIES[s.category];
              return (
                <div key={s.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, position: 'relative' }}>
                  {/* Remove button */}
                  <button
                    onClick={() => unsaveStrategy(s.id)}
                    title="Remove from saved"
                    style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 4px', borderRadius: 5, transition: 'color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; }}
                  >×</button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{cat.icon}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>{cat.label}</span>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 12 }}>{s.subtitle}</div>

                  <div style={{ display: 'flex', gap: 14, paddingTop: 10, borderTop: '1px solid var(--border)', marginBottom: 12 }}>
                    <div><div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Win Rate</div><div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--green)' }}>{s.winRate ? `${s.winRate}%` : '—'}</div></div>
                    <div><div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>R:R</div><div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--blue)' }}>{s.rr || '—'}</div></div>
                    <div><div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>TF</div><div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{s.timeframe}</div></div>
                  </div>

                  <button onClick={() => nav(`/strategies/${s.id}`)} style={{ width: '100%', padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.color = cat.color; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)'; }}
                  >View Strategy →</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
