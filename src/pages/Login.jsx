import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithCustomToken 
} from 'firebase/auth';
import { auth } from '../firebase';
import { syncUserToFirestore } from '../utils/authUtils';

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { type: 'spring', damping: 25, stiffness: 200, staggerChildren: 0.1, delayChildren: 0.2 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 300 } }
};

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);
  const [tcFailed, setTcFailed] = useState(false);

  // Initialize Truecaller SDK
  useEffect(() => {
    const initTruecaller = () => {
      try {
        const partnerKey = import.meta.env.VITE_TRUECALLER_PARTNER_KEY;
        if (!partnerKey) {
          setIsPreparing(false);
          setIsSdkReady(false);
          return;
        }

        if (window.Truecaller) {
          window.Truecaller.init({
            partnerKey: partnerKey,
            partnerName: 'Patna Suvidha',
            callbackUrl: window.location.origin + '/login',
            onSuccess: (profile) => {
              handleTruecallerLogin({ profile, requestId: 'js-sdk-' + Date.now() });
            },
            onFailure: (err) => {
              console.error('Truecaller Failure:', err);
              setTcFailed(true);
              setLoading(false);
              setIsPreparing(false);
            }
          });
          setIsSdkReady(true);
        }
      } catch (err) {
        console.error("Truecaller Crash:", err);
      } finally {
        setIsPreparing(false);
      }
    };

    if (window.Truecaller) {
      initTruecaller();
    } else {
      let attempts = 0;
      const checkScript = setInterval(() => {
        attempts++;
        if (window.Truecaller) {
          initTruecaller();
          clearInterval(checkScript);
        } else if (attempts > 12) { 
          clearInterval(checkScript);
          setIsPreparing(false);
        }
      }, 500);
      return () => clearInterval(checkScript);
    }
  }, []);

  useEffect(() => {
    if (!auth) return;
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          setLoading(true);
          await syncUserToFirestore(result.user, { provider: 'google' });
          navigate('/');
        }
      })
      .catch((err) => {
        setError('Login failed after redirect. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        await syncUserToFirestore(result.user, { provider: 'google' });
        navigate('/');
      } catch (popupErr) {
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/cancelled-popup-request') {
          await signInWithRedirect(auth, provider);
        } else {
          throw popupErr;
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      if (!loading) setLoading(false);
    }
  };

  const handleTruecallerLogin = async (tcPayload) => {
    setLoading(true);
    setError(null);
    try {
      const finalPayload = {
        requestId: tcPayload.requestId || 'js-sdk-' + Date.now(),
        accessToken: tcPayload.accessToken,
        profile: tcPayload.profile,
        signature: tcPayload.signature || tcPayload.profile?.signature,
        signatureAlgorithm: tcPayload.signatureAlgorithm || tcPayload.profile?.signatureAlgorithm || 'SHA256'
      };

      const response = await fetch('/api/auth/truecaller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) throw new Error('Verification failed');

      const result = await response.json();
      const userCredential = await signInWithCustomToken(auth, result.token);
      
      await syncUserToFirestore(userCredential.user, { 
        provider: 'truecaller', name: result.name, phone: result.phone
      });
      
      navigate('/');
    } catch (err) {
      setError('Truecaller failed. Use Google login.');
      setTcFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const triggerTruecaller = () => {
    if (!isSdkReady) return;
    setError(null);
    setLoading(true);
    setTcFailed(false);
    try {
      window.Truecaller.verify();
      setTimeout(() => {
        if (document.hasFocus()) {
          setTcFailed(true);
          setLoading(false);
          setError('TRUECALLER_NOT_RESPONDING');
        }
      }, 5000);
    } catch (e) {
      setLoading(false);
      setTcFailed(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative Orbs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'hsla(var(--p-h), 100%, 50%, 0.1)', filter: 'blur(100px)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '350px', height: '350px', background: 'hsla(142, 76%, 36%, 0.05)', filter: 'blur(100px)', borderRadius: '50%' }} />

      <motion.div 
        initial="hidden" animate="visible" variants={containerVariants}
        className="liquid-glass"
        style={{ width: '100%', maxWidth: '440px', padding: '3rem 2rem', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', zIndex: 1, borderRadius: '2.5rem', boxShadow: '0 32px 64px rgba(0,0,0,0.15)' }}
      >
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--gradient-primary)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)', transform: 'rotate(-5deg)' }}>
            <i className="ph-fill ph-rocket-launch" style={{ color: '#fff', fontSize: '2rem' }} />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            JOIN THE<br/>REVOLUTION
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9375rem', fontWeight: 700 }}>
            Patna's most loved hyperlocal app.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          {/* Truecaller Button */}
          <motion.button 
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,86,210,0.25)' }} whileTap={{ scale: 0.98 }}
            onClick={triggerTruecaller}
            disabled={loading || !isSdkReady}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
              background: '#0056D2', color: '#fff', border: 'none',
              padding: '1.25rem', borderRadius: '1.5rem', fontWeight: 900, fontSize: '1rem',
              cursor: (loading || !isSdkReady) ? 'not-allowed' : 'pointer',
              opacity: (loading || !isSdkReady) ? 0.6 : 1, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {isPreparing ? (
              <div className="spinner" style={{ width: '20px', height: '20px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
            ) : (
              <i className="ph-fill ph-phone" style={{ fontSize: '1.5rem' }} />
            )}
            <span>{isPreparing ? 'SYSTEM CHECK...' : '1-TAP TRUECALLER'}</span>
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--outline-variant)', opacity: 0.5 }} />
            <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.625rem', fontWeight: 900, letterSpacing: '0.1em' }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--outline-variant)', opacity: 0.5 }} />
          </div>

          {/* Google Button */}
          <motion.button 
            whileHover={{ y: -2, background: 'var(--surface-container-highest)' }} whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin} disabled={loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
              background: 'var(--surface-container-high)', color: 'var(--on-surface)',
              border: '1px solid var(--outline-variant)', padding: '1.25rem', borderRadius: '1.5rem', 
              fontWeight: 900, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '22px', height: '22px' }} />
            <span>GOOGLE ACCOUNT</span>
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginTop: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'hsla(0, 72%, 51%, 0.1)', border: '1px solid hsla(0, 72%, 51%, 0.2)', borderRadius: '1.25rem', color: 'var(--error)', fontSize: '0.8125rem', textAlign: 'center', fontWeight: 700, lineHeight: 1.4 }}>
                {error === 'TRUECALLER_NOT_RESPONDING' ? 'Truecaller app not detected. Please use Google login.' : error}
              </div>
            </motion.div>
          )}
          {loading && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '2rem', textAlign: 'center' }}>
                <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>VERIFYING CREDENTIALS...</p>
             </motion.div>
          )}
        </AnimatePresence>

        <motion.p variants={itemVariants} style={{ marginTop: '3rem', fontSize: '0.75rem', color: 'var(--on-surface-variant)', textAlign: 'center', fontWeight: 600, lineHeight: 1.6 }}>
          By continuing, you agree to our <span style={{ color: 'var(--primary)', fontWeight: 800, cursor: 'pointer' }}>Terms</span> & <span style={{ color: 'var(--primary)', fontWeight: 800, cursor: 'pointer' }}>Privacy</span>
        </motion.p>
      </motion.div>
    </div>
  );
}
