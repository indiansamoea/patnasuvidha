import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithCustomToken 
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebase';
import { syncUserToFirestore } from '../utils/authUtils';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await syncUserToFirestore(result.user, { provider: 'google' });
      navigate('/');
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const triggerTruecaller = () => {
    // Truecaller Mobile Web Deep Link / Intent
    // Format: truecallersdk://truereferral/v1/getprofile?requestId=[...]&callback=[...]&partnerKey=[...]
    const partnerKey = import.meta.env.VITE_TRUECALLER_PARTNER_KEY || 'YOUR_PARTNER_KEY';
    const requestId = Math.random().toString(36).substring(7);
    const callbackUrl = window.location.origin + '/login'; // Handle return in useEffect or separate route
    
    // Check if mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      const deepLink = `truecallersdk://truereferral/v1/getprofile?partnerKey=${partnerKey}&partnerName=PatnaSuvidha&requestId=${requestId}&callback=${encodeURIComponent(callbackUrl)}&skipOption=false`;
      window.location.href = deepLink;
      
      // Fallback if Truecaller is not installed
      setTimeout(() => {
        if (document.hasFocus()) {
           setError('Truecaller app not found. Please try Google login.');
        }
      }, 2500);
    } else {
      setError('Truecaller Login is optimized for mobile devices. Please use Google Login on desktop.');
    }
  };

  // Handle Truecaller callback from Deep Link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('requestId');
    const accessToken = params.get('accessToken');
    
    if (requestId && accessToken) {
      // Send to Cloud Function for verification
      handleTruecallerLogin({ requestId, accessToken });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0e13]">
      <div className="clay-card w-full max-w-md p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-white mb-2 font-['Plus_Jakarta_Sans']">Welcome Back</h1>
        <p className="text-gray-400 mb-8 font-['Manrope'] text-sm text-center">Join 10,000+ users in Patna</p>

        {error && (
          <div className="w-full p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center">
            {error}
          </div>
        )}

        {/* Truecaller Button */}
        <button 
          onClick={triggerTruecaller}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-[#0056D2] hover:bg-[#004bb8] text-white font-semibold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] mb-4 shadow-lg shadow-blue-900/20"
        >
          <img src="https://www.truecaller.com/auth/static/images/logo-white.svg" alt="TC" className="w-5 h-5" />
          <span className="font-['Plus_Jakarta_Sans']">1-Tap Login with Truecaller</span>
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
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-semibold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98]"
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
