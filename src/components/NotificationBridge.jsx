import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function NotificationBridge() {
  const { permissionStatus, requestBrowserPermission } = usePushNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show bridge only if they haven't made a choice yet
    // And don't show it immediately - wait for engagement
    const timer = setTimeout(() => {
      if (permissionStatus === 'default' && !sessionStorage.getItem('ps_notif_bridge_dismissed')) {
        setIsVisible(true);
      }
    }, 4000); // 4 seconds delay for better engagement
    
    return () => clearTimeout(timer);
  }, [permissionStatus]);

  const handleAllow = async () => {
    const granted = await requestBrowserPermission();
    if (granted) setIsVisible(false);
  };

  const handleLater = () => {
    setIsVisible(false);
    sessionStorage.setItem('ps_notif_bridge_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1.5rem', pointerEvents: 'none' }}>
          
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', pointerEvents: 'auto' }}
            onClick={handleLater}
          />

          {/* Liquid Glass Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'relative', maxWidth: '440px', width: '100%',
              background: 'rgba(25,25,30,0.85)', backdropFilter: 'blur(40px)',
              padding: '2.5rem 1.75rem', borderRadius: '2.5rem',
              border: '1px solid hsla(var(--p-h), 100%, 50%, 0.15)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)',
              textAlign: 'center', pointerEvents: 'auto'
            }}
          >
            {/* Animated Icon Container */}
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1.5rem' }}>
               <motion.div 
                 animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                 transition={{ duration: 4, repeat: Infinity }}
                 style={{ width: '100%', height: '100%', borderRadius: '24px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}
               >
                 <i className="ph-fill ph-bell-simple-ringing" style={{ fontSize: '2.5rem', color: '#fff' }} />
               </motion.div>
               
               {/* Pulsing Dots */}
               <div style={{ position: 'absolute', top: -5, right: -5, width: '16px', height: '16px', borderRadius: '50%', background: 'var(--secondary)', border: '3px solid #1a1a1f' }} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 950, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
               Don't miss a beat!
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, lineHeight: 1.5, marginBottom: '2.5rem' }}>
               Get real-time updates on your expert's arrival, exclusive Bihar deals, and booking confirmations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleAllow}
                style={{ width: '100%', padding: '1.25rem', borderRadius: '1.5rem', background: 'var(--gradient-primary)', border: 'none', color: '#fff', fontWeight: 950, fontSize: '1rem', cursor: 'pointer', boxShadow: 'var(--shadow-glow-small)' }}
              >
                Enable Notifications
              </motion.button>
              
              <button
                onClick={handleLater}
                style={{ width: '100%', padding: '1rem', borderRadius: '1.5rem', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
