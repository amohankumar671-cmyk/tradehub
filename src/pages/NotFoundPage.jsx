import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, padding: 40 }}>
      <div style={{ fontSize: 48, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>404</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Page not found</div>
      <div style={{ fontSize: 14, color: 'var(--text2)' }}>The strategy you're looking for doesn't exist — yet.</div>
      <Link to="/" style={{
        marginTop: 8, padding: '10px 22px', borderRadius: 9,
        background: 'var(--green)', color: '#080C14', fontWeight: 600,
        fontSize: 13, textDecoration: 'none',
      }}>
        Back to Home
      </Link>
    </div>
  );
}
