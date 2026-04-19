import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useAppContext();

  const items = [
    { path: '/', label: 'Home', labelHi: 'होम', icon: 'ph ph-house', iconFill: 'ph-fill ph-house' },
    { path: '/services', label: 'Services', labelHi: 'सेवाएं', icon: 'ph ph-grid-four', iconFill: 'ph-fill ph-grid-four' },
    { path: '/updates', label: 'Updates', labelHi: 'अपडेट्स', icon: 'ph ph-bell', iconFill: 'ph-fill ph-bell-ringing', isCenter: true },
    { path: '/bookings', label: 'Bookings', labelHi: 'बुकिंग', icon: 'ph ph-calendar-check', iconFill: 'ph-fill ph-calendar-check' },
    { path: '/account', label: 'Account', labelHi: 'खाता', icon: 'ph ph-user-circle', iconFill: 'ph-fill ph-user-circle' }
  ];

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', left: '1.25rem', right: '1.25rem', zIndex: 100, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <motion.nav 
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{
          pointerEvents: 'auto',
          maxWidth: '440px', width: '100%',
          background: 'rgba(30,30,35,0.8)', backdropFilter: 'blur(24px)',
          padding: '0.625rem', borderRadius: '2.25rem',
          border: '1px solid hsla(var(--p-h), 100%, 50%, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
        }}
      >
        {items.map((item, idx) => {
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          const text = lang === 'hi' ? item.labelHi : item.label;

          if (item.isCenter) {
            return (
              <motion.button 
                key="center"
                whileHover={{ scale: 1.1, y: -4 }} whileTap={{ scale: 0.9 }}
                onClick={() => navigate(item.path)}
                style={{
                  width: '56px', height: '56px', borderRadius: '18px',
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow)',
                  border: 'none', cursor: 'pointer', position: 'relative'
                }}
              >
                <i className={isActive ? item.iconFill : item.icon} style={{ fontSize: '1.5rem', color: '#fff' }}></i>
                {isActive && (
                   <motion.div 
                    layoutId="pill-active"
                    style={{ position: 'absolute', inset: '-4px', borderRadius: '22px', border: '2px solid var(--primary)', opacity: 0.5 }} 
                   />
                )}
              </motion.button>
            );
          }

          return (
            <motion.button 
              key={idx} 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(item.path)} 
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                padding: '0.5rem', borderRadius: '1.25rem', border: 'none',
                background: 'transparent', cursor: 'pointer', flex: 1, position: 'relative'
              }}
            >
              <i className={isActive ? item.iconFill : item.icon} style={{
                fontSize: '1.5rem',
                color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                transform: isActive ? 'translateY(-2px)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}></i>
              <span style={{
                fontSize: '0.625rem', fontWeight: 900,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>{text}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="dot-active"
                  style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)', marginTop: '2px', boxShadow: '0 0 8px var(--primary)' }} 
                />
              )}
            </motion.button>
          );
        })}
      </motion.nav>
    </div>
  );
}
