import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from '@phosphor-icons/react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('installPromptDismissed');
      const dismissedTime = localStorage.getItem('installPromptDismissedTime');
      
      if (!dismissed || (dismissedTime && Date.now() - parseInt(dismissedTime) > 7 * 24 * 60 * 60 * 1000)) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
    localStorage.setItem('installPromptDismissedTime', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 200, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        style={{ 
          position: 'fixed', bottom: '1.25rem', left: '1.25rem', right: '1.25rem', 
          maxWidth: '440px', margin: '0 auto', zIndex: 1100 
        }}
        className="liquid-glass clay-card"
      >
        <div style={{ position: 'relative', padding: '1.5rem', borderRadius: '28px', border: '1px solid var(--primary-container)', background: 'var(--surface)' }}>
          <button
            onClick={handleDismiss}
            style={{ 
              position: 'absolute', top: '0.75rem', right: '0.75rem', 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: 'var(--surface-container-high)', border: 'none', 
              color: 'var(--on-surface-variant)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
            }}
          >
            <X size={18} weight="bold" />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ 
              width: '4.5rem', height: '4.5rem', borderRadius: '22px', 
              background: 'var(--gradient-primary)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', 
              boxShadow: 'var(--shadow-glow)', flexShrink: 0 
            }}>
              <Download size={32} weight="fill" style={{ color: 'white' }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                Install Patna Suvidha
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: 600, lineHeight: 1.4 }}>
                Experience a faster, better way to book home services.
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              onClick={handleDismiss}
              style={{ 
                flex: 1, padding: '0.875rem', borderRadius: '16px', 
                background: 'var(--surface-container-highest)', 
                color: 'var(--on-surface-variant)', border: 'none', 
                fontWeight: 800, fontSize: '0.9375rem', cursor: 'pointer' 
              }}
            >
              Maybe Later
            </button>
            <button
              onClick={handleInstall}
              style={{ 
                flex: 1, padding: '0.875rem', borderRadius: '16px', 
                background: 'var(--gradient-primary)', color: 'white', 
                border: 'none', fontWeight: 900, fontSize: '1rem', 
                cursor: 'pointer', boxShadow: 'var(--shadow-glow)' 
              }}
            >
              Install Now
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
