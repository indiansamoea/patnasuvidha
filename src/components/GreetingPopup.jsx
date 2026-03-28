import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function GreetingPopup() {
  const navigate = useNavigate();
  const { showGreeting, dismissGreeting, settings = {}, currentUser } = useAppContext() || {};

  if (!showGreeting || !settings.greetingEnabled) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', animation: 'fadeIn 0.3s ease-out',
    }} onClick={dismissGreeting}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(145deg, #151a20, #0f1419)',
        borderRadius: '1.75rem', padding: '2rem 1.5rem', maxWidth: '360px', width: '100%',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        border: '1px solid rgba(255,145,89,0.15)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,145,89,0.08)',
        animation: 'fadeInUp 0.4s ease-out',
      }}>
        {/* Decorative glow */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,145,89,0.08)', filter: 'blur(30px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(251,180,35,0.06)', filter: 'blur(25px)' }}></div>

        {/* Logo */}
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.25rem', overflow: 'hidden', border: '3px solid rgba(255,145,89,0.3)', boxShadow: '0 0 20px rgba(255,145,89,0.15)' }}>
          <img src="/logo.jpeg" alt="Patna Suvidha" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
          {(settings.greetingText || '').split('\n').map((line, i) => (
            <p key={i} style={{
              fontFamily: i === 0 ? "'Plus Jakarta Sans'" : "'Manrope'",
              fontSize: i === 0 ? '1.5rem' : '0.9375rem',
              fontWeight: i === 0 ? 800 : 500,
              color: i === 0 ? '#ff9159' : '#a8abb2',
              marginBottom: i === 0 ? '0.5rem' : '0.25rem',
              lineHeight: 1.4,
            }}>{line}</p>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,145,89,0.3), transparent)', margin: '0.75rem 0', position: 'relative', zIndex: 1 }}></div>

        {/* Tagline */}
        <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: '#72767c', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
          by Thee Aaradh | पटना की अपनी सेवा
        </p>

        {/* CTA Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', position: 'relative', zIndex: 1 }}>
          <button onClick={dismissGreeting} style={{
            fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9375rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #ff9159, #ff7a2f)', color: '#401500',
            padding: '0.875rem 2rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
            width: '100%',
            boxShadow: '0 8px 25px rgba(255,122,47,0.3)',
            transition: 'transform 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            चलीं शुरू करीं! 🚀
          </button>

          {!currentUser && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ height: '1px', flex: 1, background: 'rgba(255,145,89,0.15)' }}></div>
                <span style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', color: '#72767c', fontWeight: 700, textTransform: 'uppercase' }}>or</span>
                <div style={{ height: '1px', flex: 1, background: 'rgba(255,145,89,0.15)' }}></div>
              </div>
              
              <button onClick={() => { dismissGreeting(); navigate('/login'); }} style={{
                fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800,
                color: '#ff9159', background: 'rgba(255,145,89,0.08)',
                padding: '0.75rem', borderRadius: '999px', border: '1px solid rgba(255,145,89,0.2)',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}>
                Login / Register for Best Deals
              </button>
              
              <button onClick={dismissGreeting} style={{
                fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 700,
                color: '#72767c', border: 'none', background: 'none', cursor: 'pointer',
                textDecoration: 'underline'
              }}>
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
