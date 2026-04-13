import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { currentUser, completeOnboarding, lang } = useAppContext();
  const [step, setStep] = useState(1);
  const isHi = lang === 'hi';

  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    phone: '',
    address: '',
    referral: ''
  });

  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reusing the GPS logic
  const handleRetrieveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error(isHi ? "आपका ब्राउज़र लोकेशन सपोर्ट नहीं करता" : "Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingLocation(true);
    const loadingToast = toast.loading(isHi ? "लोकेशन ढूँढ रहे हैं..." : "Retrieving location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          
          if (data && data.display_name) {
            const parts = data.display_name.split(', ');
            const readableAddress = parts.slice(0, 5).join(', ');
            setFormData(prev => ({ ...prev, address: readableAddress }));
            toast.success(isHi ? "लोकेशन मिल गया!" : "Location retrieved!", { id: loadingToast });
          } else {
            throw new Error("No address found");
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          toast.error(isHi ? "लोकेशन की जानकारी नहीं मिली" : "Could not determine address", { id: loadingToast });
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        setIsFetchingLocation(false);
        toast.dismiss(loadingToast);
        toast.error(isHi ? "लोकेशन नहीं मिल पाया" : "Error retrieving location");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [isHi]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error(isHi ? "कृपया सभी जानकारी भरें" : "Please fill in all details");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Mark onboarding as complete in user profile
      await completeOnboarding({
        name: formData.name,
        phone: formData.phone,
        referral: formData.referral,
        profileUpdated: new Date().toISOString()
      });

      // 2. Also save this as their first permanent address for bookings
      await addAddress({
        label: formData.address,
        isPrimary: true,
        type: 'home',
        createdAt: new Date().toISOString()
      });

      toast.success(isHi ? "प्रोफाइल अपडेट हो गई! 🎉" : "Profile completed! 🎉");
      navigate('/');
    } catch (err) {
      console.error("Onboarding failed:", err);
      toast.error(isHi ? "कुछ गलत हुआ" : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: isHi ? "आपका नाम क्या है?" : "What's your name?",
      subtitle: isHi ? "आपके प्रोफाइल के लिए" : "Let's personalize your experience",
      icon: "ph-fill ph-user-circle",
      content: (
        <div className="space-y-4">
          <input
            type="text"
            className="input-field"
            placeholder={isHi ? "पूरा नाम लिखें" : "Enter your full name"}
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            autoFocus
          />
        </div>
      )
    },
    {
      title: isHi ? "आपका नंबर?" : "Your phone number?",
      subtitle: isHi ? "बुकिंग अपडेट के लिए" : "For booking updates and 1-tap connect",
      icon: "ph-fill ph-phone",
      content: (
        <div className="space-y-4">
          <input
            type="tel"
            className="input-field"
            placeholder={isHi ? "10 अंकों का नंबर" : "10-digit mobile number"}
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            autoFocus
          />
        </div>
      )
    },
    {
      title: isHi ? "आपका पता?" : "Where do you live?",
      subtitle: isHi ? "पटना में आपकी सेवा के लिए" : "To provide faster service in your area",
      icon: "ph-fill ph-map-pin",
      content: (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              className="input-field min-h-[100px] pt-3 pr-12"
              placeholder={isHi ? "पटना में अपना पूरा पता लिखें..." : "Enter your full address in Patna..."}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              autoFocus
            />
            <button
              onClick={handleRetrieveLocation}
              disabled={isFetchingLocation}
              className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-primary-container border border-outline-variant text-primary flex items-center justify-center active:scale-95 transition-all"
            >
              {isFetchingLocation 
                ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                : <i className="ph-fill ph-target text-xl" />
              }
            </button>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[step - 1];

  return (
    <div className="min-h-screen bg-[#0a0e13] flex flex-col p-6 items-center justify-center relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary opacity-[0.05] blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-secondary opacity-[0.05] blur-[80px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Progress bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 
              ${step >= i ? 'bg-primary shadow-[0_0_10px_rgba(255,145,89,0.3)]' : 'bg-white/5'}`} 
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="clay-card p-8 text-center"
          >
            <div className="w-20 h-20 bg-primary-container rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <i className={`${currentStepData.icon} text-4xl text-primary animate-pulse-glow`} />
            </div>

            <h1 className="text-2xl font-black text-white mb-2 font-['Plus_Jakarta_Sans']">
              {currentStepData.title}
            </h1>
            <p className="text-gray-400 text-sm font-['Manrope'] mb-8">
              {currentStepData.subtitle}
            </p>

            {currentStepData.content}

            <div className="mt-10 flex gap-4">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="flex-1 py-4 clay-btn text-gray-400 font-bold"
                >
                  {isHi ? "पीछे" : "Back"}
                </button>
              )}
              <button
                onClick={step === 3 ? handleSubmit : nextStep}
                disabled={isSubmitting || (step === 3 && isFetchingLocation)}
                className="flex-[2] py-4 bg-gradient-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting 
                  ? (isHi ? "हो रहा है..." : "Processing...") 
                  : (step === 3 ? (isHi ? "शुरू करें!" : "Start Exploring") : (isHi ? "आगे बढ़ें" : "Continue"))
                }
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="mt-8 text-center text-[10px] text-gray-600 font-['Manrope']">
          PATNA SUVIDHA · LOCAL · SECURE · SMART
        </p>
      </div>
    </div>
  );
}
