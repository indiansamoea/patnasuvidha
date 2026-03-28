import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const NAV_ITEMS = [
  { path: '/', label: 'Home', labelHi: 'होम', icon: 'ph ph-house', iconFill: 'ph-fill ph-house' },
  { path: '/explore', label: 'Explore', labelHi: 'खोजें', icon: 'ph ph-compass', iconFill: 'ph-fill ph-compass' },
  { path: '/add-business', label: 'Add Free', labelHi: 'जोड़ें', icon: 'ph ph-plus', iconFill: 'ph-bold ph-plus', isCenter: true },
  { path: '/favorites', label: 'Saved', labelHi: 'सेव', icon: 'ph ph-heart', iconFill: 'ph-fill ph-heart' },
  { path: '/account', label: 'Account', labelHi: 'खाता', icon: 'ph ph-user-circle', iconFill: 'ph-fill ph-user-circle' }
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useAppContext();

  return (
    <nav className="liquid-glass" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', borderLeft: 'none', borderRight: 'none', borderBottom: 'none'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        maxWidth: '480px', margin: '0 auto', padding: '0.75rem 0.5rem 0.5rem',
        position: 'relative'
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          const text = lang === 'hi' ? item.labelHi : item.label;

          // The center FLOATING Action Button
          if (item.isCenter) {
            return (
              <div key={item.path} style={{ position: 'relative', width: '64px', display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => navigate(item.path)} style={{
                  position: 'absolute', bottom: '-10px',
                  width: '58px', height: '58px', borderRadius: '20px',
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(255,153,51,0.45)',
                  border: '3px solid var(--surface)',
                  transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                >
                  <i className={item.icon} style={{ fontSize: '1.5rem', color: 'var(--on-primary)', fontWeight: 'bold' }}></i>
                </button>
              </div>
            );
          }

          // Standard Nav Items
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
              padding: '0.5rem 1rem', background: isActive ? 'var(--primary-container)' : 'transparent',
              borderRadius: '20px', border: 'none',
              transition: 'all var(--transition-fast)',
              flex: 1, maxWidth: '80px',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
            }}>
              <i className={isActive ? item.iconFill : item.icon} style={{
                fontSize: '1.375rem',
                color: isActive ? 'var(--primary)' : 'var(--on-surface)',
                opacity: isActive ? 1 : 0.65,
                transition: 'color var(--transition-fast)',
              }}></i>
              <span style={{
                fontSize: '0.625rem', fontWeight: isActive ? 800 : 600,
                color: isActive ? 'var(--primary)' : 'var(--on-surface)',
                opacity: isActive ? 1 : 0.65,
                fontFamily: "'Manrope', sans-serif",
                letterSpacing: '0.02em',
              }}>{text}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
