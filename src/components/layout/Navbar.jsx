import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';

const navLinks = [
  { to: '/',             label: 'Home'            },
  { to: '/strategies',   label: 'Strategies'      },
  { to: '/candlesticks', label: 'Candlesticks'    },
  { to: '/scanner',      label: 'Pattern Scanner' },
  { to: '/signals',      label: 'Live Signals'    },
  { to: '/tools',        label: 'Tools'           },
];

function Avatar({ user, profile, size = 30 }) {
  const initials = (profile?.displayName || user?.email || 'T').slice(0, 2).toUpperCase();
  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={initials}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,214,143,0.4)' }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(0,214,143,0.15)', border: '2px solid rgba(0,214,143,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: 'var(--green)', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function Navbar() {
  const nav = useNavigate();
  const { user, profile, logout } = useAuth();
  const [showAuth,    setShowAuth]    = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
      <nav style={{
        background: 'rgba(8,12,20,0.97)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 28px',
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            <div style={{ width: 30, height: 30, background: 'var(--green)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={16} color="#080C14" strokeWidth={2.5} />
            </div>
            Trade<span style={{ color: 'var(--green)' }}>Hub</span>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                style={({ isActive }) => ({
                  padding: '6px 13px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? 'var(--green)' : 'var(--text2)',
                  background: isActive ? 'rgba(0,214,143,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(0,214,143,0.2)' : '1px solid transparent',
                  transition: 'all 0.15s',
                })}
              >{label}</NavLink>
            ))}
          </div>

          {/* Auth area */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(d => !d)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid var(--border2)', borderRadius: 9, padding: '5px 12px 5px 6px', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; }}
                >
                  <Avatar user={user} profile={profile} size={26} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.displayName?.split(' ')[0] || 'Profile'}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>

                {showDropdown && (
                  <div
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      background: 'var(--bg2)', border: '1px solid var(--border2)',
                      borderRadius: 12, padding: 6, minWidth: 180, zIndex: 200,
                    }}
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{profile?.displayName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{user.email}</div>
                    </div>
                    {[
                      { label: 'My Saved Strategies', icon: '🔖', action: () => { nav('/profile'); setShowDropdown(false); }},
                      { label: 'Tools & Calculators',  icon: '🧮', action: () => { nav('/tools');   setShowDropdown(false); }},
                    ].map(item => (
                      <button key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', borderRadius: 8, color: 'var(--text2)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)', transition: 'all 0.12s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text2)'; }}
                      >
                        <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
                      </button>
                    ))}
                    <div style={{ height: 1, background: 'var(--border)', margin: '4px 6px' }} />
                    <button onClick={() => { logout(); setShowDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', borderRadius: 8, color: 'var(--red)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)', transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,106,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      <span style={{ fontSize: 14 }}>↩</span>Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowAuth(true)}
                  style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)'; }}
                >Log In</button>
                <button
                  onClick={() => setShowAuth(true)}
                  style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', background: 'var(--green)', border: 'none', color: '#080C14', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#00f0a0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--green)'; }}
                >Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}


