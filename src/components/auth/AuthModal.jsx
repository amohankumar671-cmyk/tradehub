import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const G = 'var(--green)';
const inp = {
  width: '100%',
  background: 'var(--bg3)',
  border: '1px solid var(--border2)',
  borderRadius: 9,
  padding: '11px 14px',
  color: 'var(--text)',
  fontSize: 14,
  fontFamily: 'var(--font)',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export default function AuthModal({ onClose }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, authError, setAuthError } = useAuth();
  const [mode,     setMode]     = useState('login');   // 'login' | 'signup'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [localErr, setLocalErr] = useState('');

  const error = localErr || authError;

  function switchMode(m) {
    setMode(m);
    setLocalErr('');
    setAuthError(null);
    setEmail(''); setPassword(''); setName('');
  }

  async function handleGoogle() {
    setLoading(true);
    setLocalErr('');
    const res = await signInWithGoogle();
    setLoading(false);
    if (res.success) onClose();
  }

  async function handleEmail(e) {
    e.preventDefault();
    if (!email || !password) { setLocalErr('Please fill in all fields.'); return; }
    if (mode === 'signup' && !name.trim()) { setLocalErr('Please enter your name.'); return; }
    if (mode === 'signup' && password.length < 6) { setLocalErr('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setLocalErr('');
    const res = mode === 'login'
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password, name.trim());
    setLoading(false);
    if (res.success) onClose();
  }

  return (
    // Overlay
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 20, width: '100%', maxWidth: 420,
        overflow: 'hidden', animation: 'fadeUp 0.3s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>
              {mode === 'login' ? 'Sign in to access your saved strategies' : 'Join TradeHub — save strategies, track progress'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 20, cursor: 'pointer', padding: '4px 6px', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '24px 28px 28px' }}>
          {/* Google sign-in */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font)', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.15s', opacity: loading ? 0.6 : 1, marginBottom: 20,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = 'var(--border3)'; e.currentTarget.style.background = 'var(--bg4)'; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg3)'; }}
          >
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Signing in…' : `Continue with Google`}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>or use email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleEmail}>
            {mode === 'signup' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 7 }}>Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inp}
                  onFocus={e => { e.target.style.borderColor = G; }} onBlur={e => { e.target.style.borderColor = 'var(--border2)'; }}
                />
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 7 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inp}
                onFocus={e => { e.target.style.borderColor = G; }} onBlur={e => { e.target.style.borderColor = 'var(--border2)'; }}
              />
            </div>

            <div style={{ marginBottom: error ? 14 : 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 7 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'} style={inp}
                onFocus={e => { e.target.style.borderColor = G; }} onBlur={e => { e.target.style.borderColor = 'var(--border2)'; }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>⚠</span>{error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 600,
                fontFamily: 'var(--font)', cursor: loading ? 'not-allowed' : 'pointer',
                background: G, border: 'none', color: '#080C14',
                opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#00f0a0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = G; }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Switch mode */}
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text3)' }}>
            {mode === 'login' ? (
              <>Don't have an account? <button onClick={() => switchMode('signup')} style={{ background: 'none', border: 'none', color: G, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13 }}>Sign up free</button></>
            ) : (
              <>Already have an account? <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: G, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13 }}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
