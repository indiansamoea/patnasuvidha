import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithCustomToken 
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebase';
import { syncUserToFirestore } from '../utils/authUtils';

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
      console.log("Truecaller: Initialization logic triggered");
      try {
        const partnerKey = import.meta.env.VITE_TRUECALLER_PARTNER_KEY;
        console.log("Truecaller: Checking Key:", partnerKey ? "Key Exists" : "KEY IS MISSING");
        
        if (!partnerKey) {
          console.warn("Truecaller: Partner key is missing from environment variables.");
          setIsPreparing(false);
          setIsSdkReady(false);
          return;
        }

        if (window.Truecaller) {
          console.log("Truecaller: Attempting SDK init...");
          window.Truecaller.init({
            partnerKey: partnerKey,
            partnerName: 'Patna Suvidha',
            callbackUrl: window.location.origin + '/login',
            onSuccess: (profile) => {
              handleTruecallerLogin({ profile, requestId: 'js-sdk-' + Date.now() });
            },
            onFailure: (err) => {
              console.error('Truecaller: SDK onFailure callback:', err);
              setTcFailed(true);
              setLoading(false);
              setIsPreparing(false);
            }
          });
          console.log("Truecaller: SDK init successful");
          setIsSdkReady(true);
        } else {
          console.error("Truecaller: SDK object not found during init call");
          setIsPreparing(false);
        }
      } catch (err) {
        console.error("Truecaller: Silent crash during initialization:", err);
      } finally {
        // Stop the "Preparing" pulse regardless of outcome
        setIsPreparing(false);
      }
    };

    if (window.Truecaller) {
      console.log("Truecaller: SDK already present on mount");
      initTruecaller();
    } else {
      console.log("Truecaller: SDK script not found, starting listener...");
      // Wait for script to load if not already there
      let attempts = 0;
      const checkScript = setInterval(() => {
        attempts++;
        if (window.Truecaller) {
          console.log("Truecaller: SDK script detected after " + attempts + " attempts");
          initTruecaller();
          clearInterval(checkScript);
        } else if (attempts > 10) { // 5 seconds timeout
          clearInterval(checkScript);
          setIsPreparing(false);
          console.warn("Truecaller: SDK script load timeout (5s). Check your internet or ad-blocker.");
        }
      }, 500);
      return () => clearInterval(checkScript);
    }
  }, []);

  // Handle Redirect Result for Google Login
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
        console.error('Redirect result error:', err);
        setError('Login failed after redirect. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [auth]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Add a small delay to avoid race conditions with popup blockers
      try {
        const result = await signInWithPopup(auth, provider);
        await syncUserToFirestore(result.user, { provider: 'google' });
        navigate('/');
      } catch (popupErr) {
        // If popup is blocked or closed, fallback to redirect
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/cancelled-popup-request' || popupErr.code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(auth, provider);
        } else {
          throw popupErr;
        }
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain Unauthorized: Please add "${window.location.hostname}" to your Firebase Console > Authentication > Settings > Authorized domains.`);
      } else {
        setError(`Google login failed: ${err.message}`);
      }
    } finally {
      // Don't set loading to false if we are redirecting
    }
  };

  const handleTruecallerLogin = async (tcPayload) => {
    setLoading(true);
    setError(null);
    try {
      // Flatten the payload if signature/profile are already present
      const finalPayload = {
        requestId: tcPayload.requestId || 'js-sdk-' + Date.now(),
        accessToken: tcPayload.accessToken,
        profile: tcPayload.profile,
        signature: tcPayload.signature || tcPayload.profile?.signature,
        signatureAlgorithm: tcPayload.signatureAlgorithm || tcPayload.profile?.signatureAlgorithm || 'SHA256'
      };

      const response = await fetch('/api/auth/truecaller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      const result = await response.json();
      const customToken = result.token;
      const userCredential = await signInWithCustomToken(auth, customToken);
      
      await syncUserToFirestore(userCredential.user, { 
        provider: 'truecaller',
        name: result.name,
        phone: result.phone
      });
      
      navigate('/');
    } catch (err) {
      console.error('Truecaller login error:', err);
      setError('Truecaller verification failed. Please use Google login.');
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
      
      // Fallback timer if focus doesn't shift
      setTimeout(() => {
        if (document.hasFocus()) {
          setTcFailed(true);
          setLoading(false);
          setError('TRUECALLER_NOT_RESPONDING');
        }
      }, 5000);
    } catch (e) {
      console.error('Verify call failed', e);
      setLoading(false);
      setTcFailed(true);
      setError('Could not open Truecaller.');
    }
  };

  // Handle Truecaller callback from Deep Link (Manual or SDK)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('requestId');
    const accessToken = params.get('accessToken');
    const profile = params.get('profile');
    const signature = params.get('signature');
    const signatureAlgorithm = params.get('signatureAlgorithm');
    
    if (requestId && (accessToken || profile)) {
      handleTruecallerLogin({ 
        requestId, 
        accessToken, 
        profile: profile ? JSON.parse(profile) : null, 
        signature, 
        signatureAlgorithm 
      });
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem', background: 'var(--surface)' }}>
      <div className="clay-card animate-fade-up-plus" style={{ width: '100%', maxWidth: '448px', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid var(--outline-variant)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
          Welcome Back
        </h1>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2.5rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', textAlign: 'center', fontWeight: 600 }}>
          Join 10,000+ users in Patna
        </p>

        {error && (
          <div style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', color: '#dc2626', fontSize: '0.75rem', textAlign: 'center', fontWeight: 600 }}>
              {error === 'TRUECALLER_NOT_RESPONDING' 
                ? 'Truecaller app not responding or not found.' 
                : error}
            </div>
            
            {error === 'TRUECALLER_NOT_RESPONDING' && (
              <div style={{ padding: '1rem', background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>Troubleshooting</p>
                <ul style={{ fontSize: '0.6875rem', color: 'var(--on-surface)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li style={{ display: 'flex', gap: '0.5rem' }}>
                    <i className="ph-bold ph-check-circle" style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}></i>
                    <span>Open <b>Chrome Browser</b> directly (links inside Facebook/Instagram often block deep links).</span>
                  </li>
                  <li style={{ display: 'flex', gap: '0.5rem' }}>
                    <i className="ph-bold ph-check-circle" style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}></i>
                    <span>Ensure <b>Truecaller app</b> is installed and you are logged into it.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '0.5rem' }}>
                    <i className="ph-bold ph-check-circle" style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}></i>
                    <span>Check if you are in <b>Incognito Mode</b> (Deep links are often disabled in Incognito).</span>
                  </li>
                </ul>
                <button 
                  onClick={triggerTruecaller}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', background: 'var(--primary-container)', color: 'var(--primary)', fontSize: '0.6875rem', fontWeight: 800, borderRadius: '8px', cursor: 'pointer', border: 'none' }}
                >
                  Retry Truecaller Login
                </button>
              </div>
            )}
          </div>
        )}

        {/* Truecaller Button */}
        <button 
          onClick={triggerTruecaller}
          disabled={loading || !isSdkReady}
          className={isPreparing ? 'animate-pulse' : ''}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            background: '#0056D2', color: '#ffffff', border: 'none',
            padding: '0.875rem 1rem', borderRadius: '12px', fontWeight: 600,
            transition: 'all 0.2s', cursor: (loading || !isSdkReady) ? 'not-allowed' : 'pointer',
            opacity: (loading || !isSdkReady) ? 0.5 : 1,
            boxShadow: '0 4px 12px rgba(0,86,210,0.2)',
            marginBottom: '1rem'
          }}
        >
          {isPreparing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.0001 0.444336C5.62763 0.444336 0.44458 5.62739 0.44458 12C0.44458 18.3726 5.62763 23.5557 12.0001 23.5557C18.3727 23.5557 23.5557 18.3726 23.5557 12C23.5557 5.62739 18.3727 0.444336 12.0001 0.444336ZM8.73024 18.8413C7.55562 18.8413 6.64133 17.8533 6.64133 16.6343C6.64133 15.4152 7.55562 14.4272 8.73024 14.4272C9.07008 14.4272 9.38379 14.5055 9.67138 14.6361C8.75635 12.7836 8.3512 11.0366 8.24647 9.38356C8.1942 8.56391 8.3245 7.42777 8.92506 6.57797C9.52561 5.72816 10.3754 5.25745 11.2372 5.06173C11.668 4.97034 12.0991 4.91807 12.5168 4.90491V6.99381C12.3338 6.99381 12.1511 7.00697 11.9682 7.03313C11.511 7.11146 11.132 7.34639 10.8318 7.69894C10.5316 8.05149 10.4533 8.39088 10.4665 8.76916C10.5187 9.87919 10.8841 11.1062 11.6545 12.7109C12.4249 14.3156 12.634 14.9031 12.634 14.9031H12.6343L12.6472 14.9292C12.6472 14.9292 12.8561 14.3417 13.6265 12.7371C14.3969 11.1324 14.7623 9.90547 14.8145 8.79544C14.8277 8.41716 14.7494 8.07777 14.4491 7.72522C14.1489 7.37267 13.7699 7.13774 13.3128 7.05941C13.13 7.03325 12.9472 7.02008 12.7643 7.02008V4.93118C13.1818 4.94424 13.6128 4.99651 14.0436 5.0879C14.9056 5.28362 15.7554 5.75442 16.3559 6.60423C16.9565 7.45404 17.087 8.58988 17.0347 9.40983C16.93 11.0628 16.5248 12.8099 15.6098 14.6624C15.8974 14.5318 16.2111 14.4534 16.5509 14.4534C17.7256 14.4534 18.6398 15.4414 18.6398 16.6605C18.6398 17.8795 17.7256 18.8675 16.5509 18.8675C15.3763 18.8675 14.462 17.8795 14.462 16.6605C14.462 16.3339 14.5273 16.0337 14.6578 15.7594C14.1616 16.7909 13.6261 17.8223 13.2996 18.5275C13.1039 18.9452 12.8427 19.3891 12.5292 19.7416C12.2157 20.0942 11.7847 20.3554 11.2363 20.4599C10.688 20.5644 10.257 20.4599 9.94317 20.251C9.62933 20.0421 9.4336 19.7418 9.27684 19.3499C9.27684 19.3499 8.95048 18.5796 8.53272 17.6525C8.38915 17.979 8.31071 18.3444 8.31071 18.7231H8.73024V18.8413Z"/>
            </svg>
          )}
          <span style={{ fontFamily: 'var(--font-display)' }}>
            {isPreparing ? 'Preparing Truecaller...' : (isSdkReady ? '1-Tap Login with Truecaller' : 'Login with Truecaller')}
          </span>
        </button>


        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--outline-variant)' }}></div>
          <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-body)' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--outline-variant)' }}></div>
        </div>

        {/* Google Button */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className={tcFailed ? 'animate-pulse-glow' : ''}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            background: 'var(--surface-container-highest)', color: 'var(--on-surface)',
            border: tcFailed ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
            padding: '0.875rem 1rem', borderRadius: '12px', fontWeight: 800,
            transition: 'all 0.2s', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontFamily: 'var(--font-display)' }}>Continue with Google</span>
        </button>

        {loading && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Securely authenticating...
            </span>
          </div>
        )}

        <p style={{ marginTop: '2rem', fontSize: '0.6875rem', color: 'var(--on-surface-variant)', textAlign: 'center', fontFamily: 'var(--font-body)', fontWeight: 600, lineHeight: 1.5 }}>
          By continuing, you agree to our <span style={{ color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer' }}>Terms</span> & <span style={{ color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
