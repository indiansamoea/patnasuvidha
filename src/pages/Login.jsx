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
        const partnerKey = import.meta.env.NEXT_PUBLIC_TRUECALLER_PARTNER_KEY;
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
      // Calling the new free Vercel API route instead of Firebase Functions
      const response = await fetch('/api/auth/truecaller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tcPayload),
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0e13]">
      <div className="clay-card w-full max-w-md p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-white mb-2 font-['Plus_Jakarta_Sans']">Welcome Back</h1>
        <p className="text-gray-400 mb-8 font-['Manrope'] text-sm text-center">Join 10,000+ users in Patna</p>

        {error && (
          <div className="w-full mb-6 space-y-3">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center">
              {error === 'TRUECALLER_NOT_RESPONDING' 
                ? 'Truecaller app not responding or not found.' 
                : error}
            </div>
            
            {error === 'TRUECALLER_NOT_RESPONDING' && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Troubleshooting</p>
                <ul className="text-[11px] text-gray-400 space-y-2">
                  <li className="flex gap-2">
                    <i className="ph-bold ph-check-circle text-primary"></i>
                    <span>Open <b>Chrome Browser</b> directly (links inside Facebook/Instagram often block deep links).</span>
                  </li>
                  <li className="flex gap-2">
                    <i className="ph-bold ph-check-circle text-primary"></i>
                    <span>Ensure <b>Truecaller app</b> is installed and you are logged into it.</span>
                  </li>
                  <li className="flex gap-2">
                    <i className="ph-bold ph-check-circle text-primary"></i>
                    <span>Check if you are in <b>Incognito Mode</b> (Deep links are often disabled in Incognito).</span>
                  </li>
                </ul>
                <button 
                  onClick={triggerTruecaller}
                  className="w-full py-1.5 mt-2 bg-primary/20 text-primary text-[11px] font-bold rounded-lg hover:bg-primary/30 transition-colors"
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
          className={`w-full flex items-center justify-center gap-3 bg-[#0056D2] hover:bg-[#004bb8] disabled:bg-gray-800 disabled:opacity-50 text-white font-semibold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] mb-4 shadow-lg shadow-blue-900/20 
          ${isPreparing ? 'animate-pulse' : ''}`}
        >
          {isPreparing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.0001 0.444336C5.62763 0.444336 0.44458 5.62739 0.44458 12C0.44458 18.3726 5.62763 23.5557 12.0001 23.5557C18.3727 23.5557 23.5557 18.3726 23.5557 12C23.5557 5.62739 18.3727 0.444336 12.0001 0.444336ZM8.73024 18.8413C7.55562 18.8413 6.64133 17.8533 6.64133 16.6343C6.64133 15.4152 7.55562 14.4272 8.73024 14.4272C9.07008 14.4272 9.38379 14.5055 9.67138 14.6361C8.75635 12.7836 8.3512 11.0366 8.24647 9.38356C8.1942 8.56391 8.3245 7.42777 8.92506 6.57797C9.52561 5.72816 10.3754 5.25745 11.2372 5.06173C11.668 4.97034 12.0991 4.91807 12.5168 4.90491V6.99381C12.3338 6.99381 12.1511 7.00697 11.9682 7.03313C11.511 7.11146 11.132 7.34639 10.8318 7.69894C10.5316 8.05149 10.4533 8.39088 10.4665 8.76916C10.5187 9.87919 10.8841 11.1062 11.6545 12.7109C12.4249 14.3156 12.634 14.9031 12.634 14.9031H12.6343L12.6472 14.9292C12.6472 14.9292 12.8561 14.3417 13.6265 12.7371C14.3969 11.1324 14.7623 9.90547 14.8145 8.79544C14.8277 8.41716 14.7494 8.07777 14.4491 7.72522C14.1489 7.37267 13.7699 7.13774 13.3128 7.05941C13.13 7.03325 12.9472 7.02008 12.7643 7.02008V4.93118C13.1818 4.94424 13.6128 4.99651 14.0436 5.0879C14.9056 5.28362 15.7554 5.75442 16.3559 6.60423C16.9565 7.45404 17.087 8.58988 17.0347 9.40983C16.93 11.0628 16.5248 12.8099 15.6098 14.6624C15.8974 14.5318 16.2111 14.4534 16.5509 14.4534C17.7256 14.4534 18.6398 15.4414 18.6398 16.6605C18.6398 17.8795 17.7256 18.8675 16.5509 18.8675C15.3763 18.8675 14.462 17.8795 14.462 16.6605C14.462 16.3339 14.5273 16.0337 14.6578 15.7594C14.1616 16.7909 13.6261 17.8223 13.2996 18.5275C13.1039 18.9452 12.8427 19.3891 12.5292 19.7416C12.2157 20.0942 11.7847 20.3554 11.2363 20.4599C10.688 20.5644 10.257 20.4599 9.94317 20.251C9.62933 20.0421 9.4336 19.7418 9.27684 19.3499C9.27684 19.3499 8.95048 18.5796 8.53272 17.6525C8.38915 17.979 8.31071 18.3444 8.31071 18.7231H8.73024V18.8413Z"/>
            </svg>
          )}
          <span className="font-['Plus_Jakarta_Sans']">
            {isPreparing ? 'Preparing Truecaller...' : (isSdkReady ? '1-Tap Login with Truecaller' : 'Login with Truecaller')}
          </span>
        </button>

        <div className="w-full flex items-center gap-4 my-4">
          <div className="flex-1 h-[1px] bg-gray-800"></div>
          <span className="text-gray-500 text-xs font-bold font-['Manrope']">OR</span>
          <div className="flex-1 h-[1px] bg-gray-800"></div>
        </div>

        {/* Google Button */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-semibold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] 
          ${tcFailed ? 'ring-4 ring-primary/30 border-2 border-primary animate-pulse' : ''}`}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span className="font-['Plus_Jakarta_Sans']">Continue with Google</span>
        </button>

        {loading && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-xs text-gray-500 font-['Manrope']">Securely authenticating...</span>
          </div>
        )}

        <p className="mt-8 text-[10px] text-gray-600 text-center font-['Manrope']">
          By continuing, you agree to our <span className="text-primary underline cursor-pointer">Terms</span> & <span className="text-primary underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
