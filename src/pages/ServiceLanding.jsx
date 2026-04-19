import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { useSmartSlots } from '../hooks/useSmartSlots';

const DEFAULT_META = {
  hero: 'https://images.unsplash.com/photo-1556742400-b5b7a512a36e?auto=format&fit=crop&w=1200&q=80',
  title: 'Professional Services',
  titleHi: 'प्रोफेशनल सेवाएं',
  desc: 'Book verified, trusted professionals in Patna for all your service needs.',
  descHi: 'पटना में सभी सेवा जरूरतों के लिए सत्यापित, विश्वसनीय पेशेवरों को बुक करें।',
  icon: 'ph-gear',
  services: [],
};

const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
  exit: { y: '100%', transition: { ease: 'easeInOut' } }
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

function BookingStep1({ meta, category, isHi, onClose, onProceedToPayment }) {
  const { currentUser, savedAddresses, addAddress } = useAppContext();
  const navigate = useNavigate();
  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('en', { month: 'short' }),
      full: d.toISOString().split('T')[0],
    };
  }), []);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(
    savedAddresses.length > 0 ? savedAddresses[0].id : null
  );
  const [showAddressForm, setShowAddressForm] = useState(savedAddresses.length === 0);
  const [newAddress, setNewAddress] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const handleRetrieveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error(isHi ? "आपका ब्राउज़र लोकेशन सपोर्ट नहीं करता" : "Geolocation is not supported");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`);
          const data = await res.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(', ');
            setNewAddress(parts.slice(0, 5).join(', '));
            toast.success(isHi ? "लोकेशन मिल गया!" : "Location found!");
          }
        } catch (err) {
          toast.error(isHi ? "लोकेशन नहीं मिल पाया" : "Failed to get address");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      () => setIsFetchingLocation(false),
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [isHi]);

  const selectedDateObj = dates[selectedDateIndex];
  const { 
    isSlotUnavailable, isSlotBooked, isSlotPast, isSlotPreferred,
    suggestedSlot, userHistory, isLoading: isLoadingSlots,
    totalSlotsAvailable, activeProvidersCount
  } = useSmartSlots(category, selectedDateObj.full, currentUser);

  useEffect(() => {
    if (suggestedSlot && !selectedSlot) setSelectedSlot(suggestedSlot);
  }, [suggestedSlot]);

  useEffect(() => {
    if (userHistory?.address && !selectedAddressId && savedAddresses.length === 0 && !newAddress) {
      setNewAddress(userHistory.address);
    }
  }, [userHistory]);

  const currentAddress = selectedAddressId
    ? savedAddresses.find(a => a.id === selectedAddressId)?.label
    : null;

  const canProceed = !!(selectedSlot && !isSlotUnavailable(selectedSlot) && (currentAddress || newAddress.trim()));

  const handleSaveAndProceed = async () => {
    if (!canProceed) return;
    let finalAddress = currentAddress;
    if (!currentAddress && newAddress.trim()) {
      setIsSavingAddress(true);
      try {
        await addAddress(newAddress.trim());
        finalAddress = newAddress.trim();
      } catch (e) { console.error(e); } finally { setIsSavingAddress(false); }
    }
    const dateStr = `${selectedDateObj.day}, ${selectedDateObj.date} ${selectedDateObj.month}`;
    onProceedToPayment({ date: dateStr, dateFull: selectedDateObj.full, time: selectedSlot, address: finalAddress });
  };

  const ALL_TIME_SLOTS_DATA = [
    { id: 'm1', label: '9:00 AM' }, { id: 'm2', label: '10:00 AM' }, { id: 'm3', label: '11:00 AM' },
    { id: 'a1', label: '12:00 PM' }, { id: 'a2', label: '2:00 PM' }, { id: 'a3', label: '3:00 PM' },
    { id: 'e1', label: '5:00 PM' }, { id: 'e2', label: '6:00 PM' }, { id: 'e3', label: '7:00 PM' },
  ];

  const categoryName = isHi ? (meta.nameHi || meta.name) : meta.name;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <motion.div initial="hidden" animate="visible" exit="exit" variants={backdropVariants} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
      <motion.div 
        initial="hidden" animate="visible" exit="exit" variants={sheetVariants}
        style={{ position: 'relative', zIndex: 1, background: 'var(--surface)', borderRadius: '2.5rem 2.5rem 0 0', maxHeight: '92vh', overflowY: 'auto', paddingBottom: '3rem', boxShadow: '0 -20px 40px rgba(0,0,0,0.2)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <div style={{ width: '48px', height: '6px', borderRadius: '99px', background: 'var(--outline-variant)', opacity: 0.5 }} />
        </div>
        <div style={{ padding: '0 1.5rem', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>{isHi ? 'समय और पता चुनें' : 'Time & Address'}</h2>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-container-high)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <i className="ph-bold ph-x" style={{ fontSize: '1.25rem' }} />
            </motion.button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ 
              padding: '0.75rem 1rem', borderRadius: '1rem', marginBottom: '1.5rem',
              background: isLoadingSlots ? 'var(--surface-container)' : activeProvidersCount === 0 ? 'hsla(var(--p-h), 100%, 50%, 0.1)' : totalSlotsAvailable > 0 ? 'hsla(142, 76%, 36%, 0.1)' : 'hsla(0, 72%, 51%, 0.1)',
              border: `1px solid ${isLoadingSlots ? 'transparent' : activeProvidersCount === 0 ? 'var(--primary)' : totalSlotsAvailable > 0 ? 'var(--secondary)' : 'var(--error)'}`,
              display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}
          >
            {isLoadingSlots ? (
              <><div className="spinner" style={{ width: '16px', height: '16px' }} /><span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>Analyzing availability...</span></>
            ) : (
              <>
                <i className={`ph-fill ${activeProvidersCount === 0 ? 'ph-rocket-launch' : totalSlotsAvailable > 0 ? 'ph-check-circle' : 'ph-x-circle'}`} 
                   style={{ color: activeProvidersCount === 0 ? 'var(--primary)' : totalSlotsAvailable > 0 ? 'var(--secondary)' : 'var(--error)', fontSize: '1.25rem' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                  {activeProvidersCount > 0 
                    ? (totalSlotsAvailable > 0 ? `${totalSlotsAvailable} slots open today` : 'Experts fully booked today')
                    : (isHi ? `जल्द ही ${categoryName} के लिए आ रहे हैं!` : `Onboarding experts for ${categoryName}...`)}
                </span>
              </>
            )}
          </motion.div>

          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{isHi ? 'तारीख' : 'Select Date'}</h3>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
              {dates.map((d, i) => (
                <motion.button 
                  key={i} whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedDateIndex(i); setSelectedSlot(null); }} 
                  style={{ 
                    flexShrink: 0, width: '68px', padding: '0.75rem 0', borderRadius: '1.25rem', 
                    background: selectedDateIndex === i ? 'var(--gradient-primary)' : 'var(--surface-container)', 
                    color: selectedDateIndex === i ? '#fff' : 'inherit', border: 'none', cursor: 'pointer',
                    boxShadow: selectedDateIndex === i ? 'var(--shadow-md)' : 'none'
                  }}
                >
                  <p style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.8 }}>{d.day}</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>{d.date}</p>
                </motion.button>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{isHi ? 'टाइम' : 'Select Slot'}</h3>
            {activeProvidersCount === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--surface-container-low)', borderRadius: '1.5rem', border: '1px dashed var(--outline-variant)' }}>
                 <p style={{ fontWeight: 800, color: 'var(--primary)' }}>Coming Soon!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {ALL_TIME_SLOTS_DATA.map(slot => {
                  const unavail = isSlotBooked(slot.label) || isSlotPast(slot.label);
                  const isPref = isSlotPreferred(slot.label);
                  const isSelected = selectedSlot === slot.label;
                  return (
                    <motion.button 
                      key={slot.id} disabled={unavail} whileTap={unavail ? {} : { scale: 0.95 }}
                      onClick={() => setSelectedSlot(slot.label)}
                      style={{
                        padding: '1rem 0.5rem', borderRadius: '1rem', position: 'relative',
                        background: isSelected ? 'var(--primary-container)' : isPref ? 'hsla(var(--p-h), 100%, 50%, 0.05)' : 'var(--surface-container)',
                        border: isSelected ? '2px solid var(--primary)' : isPref ? '1px dashed var(--primary)' : '1px solid transparent',
                        opacity: unavail ? 0.4 : 1, cursor: unavail ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: isSelected ? 'var(--primary)' : 'inherit' }}>{slot.label}</span>
                      {isPref && <div style={{ position: 'absolute', top: '-8px', right: '-4px', background: 'var(--primary)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>PRO</div>}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </section>

          {activeProvidersCount > 0 && (
            <>
              <section style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{isHi ? 'पता' : 'Service Address'}</h3>
                {savedAddresses.map(addr => (
                  <motion.button 
                    key={addr.id} whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedAddressId(addr.id); setShowAddressForm(false); }} 
                    style={{ width: '100%', padding: '1.25rem', borderRadius: '1rem', marginBottom: '0.75rem', textAlign: 'left', background: selectedAddressId === addr.id ? 'var(--primary-container)' : 'var(--surface-container-low)', border: selectedAddressId === addr.id ? '1.5px solid var(--primary)' : '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', gap: '1rem' }}
                  >
                    <i className="ph-fill ph-house" style={{ color: selectedAddressId === addr.id ? 'var(--primary)' : 'var(--on-surface-variant)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{addr.label}</span>
                  </motion.button>
                ))}
                <motion.button 
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowAddressForm(true); setSelectedAddressId(null); }} 
                  style={{ width: '100%', padding: '1.25rem', borderRadius: '1rem', border: '2px dashed var(--primary)', background: 'transparent', color: 'var(--primary)', fontWeight: 900, fontSize: '0.9375rem' }}
                >
                  + {isHi ? 'नया पता जोड़ें' : 'Add New Address'}
                </motion.button>
                <AnimatePresence>
                  {showAddressForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: '1rem', position: 'relative', overflow: 'hidden' }}>
                      <input className="input-field" value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Type full address here..." style={{ paddingRight: '3rem', borderRadius: '1rem' }} />
                      <motion.button whileTap={{ scale: 0.8 }} onClick={handleRetrieveLocation} disabled={isFetchingLocation} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--primary)' }}>
                        {isFetchingLocation ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <i className="ph-fill ph-target" style={{ fontSize: '1.25rem' }} />}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSaveAndProceed} disabled={!canProceed || isSavingAddress} 
                style={{ width: '100%', padding: '1.25rem', borderRadius: '1.5rem', background: canProceed ? 'var(--gradient-primary)' : 'var(--surface-container-highest)', color: canProceed ? '#fff' : 'var(--on-surface-variant)', fontWeight: 900, fontSize: '1.125rem', border: 'none', cursor: canProceed ? 'pointer' : 'not-allowed', boxShadow: canProceed ? 'var(--shadow-lg)' : 'none', transition: 'all 0.3s' }}
              >
                {isSavingAddress ? 'Finalizing...' : (isHi ? 'आगे बढ़ें' : 'Confirm & Proceed')}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function BookingStep2({ selectedService, bookingDetails, isHi, onBack, onPayLater, onPayNow, isSubmitting }) {
  const price = selectedService?.price || 0;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <motion.div initial="hidden" animate="visible" exit="exit" variants={backdropVariants} onClick={onBack} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }} />
      <motion.div 
        initial="hidden" animate="visible" exit="exit" variants={sheetVariants}
        style={{ position: 'relative', zIndex: 1, background: 'var(--surface)', borderRadius: '2.5rem 2.5rem 0 0', maxHeight: '90vh', overflowY: 'auto', paddingBottom: '3.5rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}><div style={{ width: '48px', height: '6px', borderRadius: '99px', background: 'var(--outline-variant)', opacity: 0.5 }} /></div>
        <div style={{ padding: '0 1.5rem', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} style={{ border: 'none', background: 'var(--surface-container-high)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="ph-bold ph-arrow-left" /></motion.button>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 900 }}>{isHi ? 'भुगतान का तरीका' : 'Payment Method'}</h2>
          </div>

          <div className="clay-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--primary-container)', border: '1.5px solid var(--primary)' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Summary</p>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 900, marginBottom: '0.25rem' }}>{selectedService?.name}</h4>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>{bookingDetails.date} @ {bookingDetails.time}</p>
            <div style={{ height: '1px', background: 'var(--primary)', opacity: 0.1, margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 800 }}>Total Payable</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>₹{price}</span>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onPayLater} disabled={isSubmitting} 
            style={{ marginBottom: '1rem', width: '100%', padding: '1.5rem', borderRadius: '1.5rem', border: '1.5px solid var(--outline-variant)', background: 'var(--surface)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'all 0.2s' }}
          >
             <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsla(142, 76%, 36%, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ph-fill ph-hand-coins" style={{ fontSize: '1.5rem', color: 'var(--secondary)' }} />
             </div>
             <div>
               <p style={{ fontWeight: 900, fontSize: '1rem' }}>{isHi ? 'काम के बाद नकद' : 'Cash After Service'}</p>
               <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Pay via Cash/UPI to partner</p>
             </div>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onPayNow} disabled={isSubmitting} 
            style={{ width: '100%', padding: '1.5rem', borderRadius: '1.5rem', background: 'var(--gradient-primary)', color: '#fff', textAlign: 'left', border: 'none', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-lg)' }}
          >
             <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ph-fill ph-lightning" style={{ fontSize: '1.5rem' }} />
             </div>
             <div>
               <p style={{ fontWeight: 900, fontSize: '1rem' }}>{isHi ? 'अभी ऑनलाइन पे' : 'Pay Online Now'}</p>
               <p style={{ fontSize: '0.8125rem', fontWeight: 700, opacity: 0.9 }}>100% Secure & Super Fast</p>
             </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ServiceLanding() {
  const { category: categoryId } = useParams();
  const navigate = useNavigate();
  const { lang, addBooking, currentUser, categories, bookingsEnabled, settings } = useAppContext();
  
  const meta = useMemo(() => categories.find(c => c.id === categoryId) || DEFAULT_META, [categories, categoryId]);
  const services = useMemo(() => meta.services || [], [meta]);

  const [selectedService, setSelectedService] = useState(null);
  const [step, setStep] = useState('landing'); 
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (services.length > 0 && !selectedService) setSelectedService(services[0]);
  }, [services]);

  const isHi = lang === 'hi';
  const canBook = bookingsEnabled && !(settings.pausedCategories || []).includes(categoryId);

  const handleProceed = () => {
    if (!selectedService) return;
    if (!currentUser) return navigate('/login');
    setStep('step1');
  };

  const handlePayLater = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const bId = await addBooking({
        ...bookingDetails, service: selectedService.name, amount: selectedService.price,
        paymentMethod: 'pay_later', categoryId, category: meta.name || categoryId,
      });
      navigate(`/booking-success?biz=${encodeURIComponent(isHi ? (meta.nameHi || meta.name) : meta.name)}&service=${encodeURIComponent(selectedService.name)}&date=${encodeURIComponent(bookingDetails.date)}&time=${encodeURIComponent(bookingDetails.time)}&payment=pay_later&id=${bId}`);
    } catch (e) { toast.error("Booking failed"); } finally { setIsSubmitting(false); }
  };

  const handlePayNow = async () => {
     const key = settings.razorpayKey || 'rzp_live_SSIUQLBgFOF2M7';
     const rzpOptions = {
       key, amount: selectedService.price * 100, currency: "INR", name: "Patna Suvidha",
       description: `Booking for ${selectedService.name}`,
       handler: async (res) => {
         const bId = await addBooking({
           ...bookingDetails, service: selectedService.name, amount: selectedService.price,
           paymentMethod: 'pay_now', paymentId: res.razorpay_payment_id, categoryId, category: meta.name || categoryId,
         });
         navigate(`/booking-success?biz=${encodeURIComponent(isHi ? (meta.nameHi || meta.name) : meta.name)}&service=${encodeURIComponent(selectedService.name)}&date=${encodeURIComponent(bookingDetails.date)}&time=${encodeURIComponent(bookingDetails.time)}&payment=pay_now&id=${bId}`);
       },
       prefill: { name: currentUser?.displayName, contact: currentUser?.phoneNumber },
       theme: { color: "#FF8C00" }
     };
     new window.Razorpay(rzpOptions).open();
  };

  const stats = meta.stats || { rating: '4.9', bookings: '1k+', experience: '5+ Years' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ minHeight: '100vh', background: 'var(--surface)', paddingBottom: '12rem' }}>
      
      {/* ─── Immersive Cinema Header ─── */}
      <div style={{ position: 'relative', height: '440px', overflow: 'hidden' }}>
        <motion.img 
          initial={{ scale: 1.15, filter: 'blur(10px)' }} animate={{ scale: 1, filter: 'blur(0px)' }} transition={{ duration: 1.2, ease: "easeOut" }}
          src={meta.hero} alt={meta.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface) 0%, transparent 60%, rgba(0,0,0,0.4) 100%)' }} />
        
        {/* Navigation Actions */}
        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', zInteger: 20 }}>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <i className="ph-bold ph-arrow-left" style={{ fontSize: '1.25rem' }} />
          </motion.button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
             <motion.button whileTap={{ scale: 0.9 }} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="ph-bold ph-share-network" /></motion.button>
          </div>
        </div>

        {/* Hero Meta Content */}
        <div style={{ position: 'absolute', bottom: '3rem', left: '1.5rem', right: '1.5rem' }}>
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: '999px', backdropFilter: 'blur(8px)', border: '1px solid var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'inline-block' }}>
                 Verified Patna Expert
              </span>
              <h1 style={{ fontSize: '3rem', fontWeight: 950, color: '#fff', textShadow: '0 8px 24px rgba(0,0,0,0.5)', marginBottom: '1.25rem', lineHeight: 0.9, fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}>
                 {isHi ? (meta.nameHi || meta.name) : (meta.name || meta.title)}
              </h1>
           </motion.div>
           
           {/* Floating Liquid Stats */}
           <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }} className="hide-scrollbar">
              {[
                { icon: 'ph-star', label: stats.rating, sub: 'Rating', color: '#FFD700' },
                { icon: 'ph-users', label: stats.bookings, sub: 'Booked', color: 'var(--primary)' },
                { icon: 'ph-medal', label: stats.experience, sub: 'Exp', color: 'var(--secondary)' }
              ].map((s, i) => (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }} key={i} className="liquid-glass" style={{ padding: '0.875rem 1.25rem', borderRadius: '1.5rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.875rem', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.1)' }}>
                   <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`ph-fill ${s.icon}`} style={{ color: s.color, fontSize: '1.125rem' }} />
                   </div>
                   <div>
                      <p style={{ fontSize: '1rem', fontWeight: 950, color: '#fff', lineHeight: 1 }}>{s.label}</p>
                      <p style={{ fontSize: '0.625rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginTop: '2px' }}>{s.sub}</p>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </div>

      {/* ─── Content Body ─── */}
      <div style={{ position: 'relative', marginTop: '-3rem', background: 'var(--surface)', borderRadius: '3.5rem 3.5rem 0 0', padding: '3.5rem 1.5rem 5rem', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
        
        {/* Trust & Features Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { icon: 'ph-shield-check', label: '30-Day', sub: 'Warranty', color: 'var(--secondary)' },
            { icon: 'ph-user-check', label: 'Verified', sub: 'Experts', color: 'var(--primary)' },
            { icon: 'ph-clock-afternoon', label: 'Express', sub: 'Booking', color: '#06b6d4' }
          ].map((f, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="clay-card" style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', border: `1px solid ${f.color}30` }}>
                  <i className={`ph-fill ${f.icon}`} style={{ color: f.color, fontSize: '1.25rem' }} />
               </div>
               <p style={{ fontSize: '0.75rem', fontWeight: 900, lineHeight: 1.1, color: 'var(--on-surface)' }}>{f.label}<br/><span style={{ fontWeight: 600, fontSize: '0.625rem', opacity: 0.6 }}>{f.sub}</span></p>
            </motion.div>
          ))}
        </div>

        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
             <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Available Plans</h3>
             <div style={{ flex: 1, height: '2px', background: 'var(--outline-variant)', opacity: 0.3 }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {services.map((s, i) => {
              const isSelected = selectedService?.name === s.name;
              return (
                <motion.button 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => setSelectedService(s)} 
                  className={isSelected ? 'clay-card' : ''}
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.75rem', 
                    borderRadius: '1.75rem', 
                    background: isSelected ? 'var(--primary-container)' : 'var(--surface-container-low)', 
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isSelected ? 'var(--primary)' : 'var(--outline-variant)' }} />
                    <div>
                       <p style={{ fontSize: '1.125rem', fontWeight: 900, color: isSelected ? 'var(--on-primary-container)' : 'var(--on-surface)' }}>{s.name}</p>
                       <p style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--on-surface-variant)' }}>Verified Suvidha Expert</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '1.25rem', fontWeight: 950, color: isSelected ? 'var(--primary)' : 'var(--on-surface)' }}>₹{s.price}</p>
                </motion.button>
              );
            })}
            {services.length === 0 && (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'var(--surface-container-low)', borderRadius: '2rem', border: '1px dashed var(--outline-variant)' }}>
                 <i className="ph-bold ph-warning-circle" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem', display: 'block' }} />
                 <p style={{ fontWeight: 800, color: 'var(--on-surface)' }}>{isHi ? 'कोई सेवा विकल्प उपलब्ध नहीं है' : 'No service options available'}</p>
                 <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>{isHi ? 'कृपया बाद में पुनः प्रयास करें या एडमिन से संपर्क करें।' : 'Please check back later or contact support.'}</p>
              </div>
            )}
          </div>
          </div>
        </section>

        {/* Why Choose Us Redesign */}
        <section style={{ marginBottom: '4rem' }}>
           <div className="clay-card" style={{ padding: '2rem', background: 'var(--surface-container-highest)', border: 'none' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 950, marginBottom: '1.5rem' }}>Why Patna Suvidha?</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {[
                   "Zero hidden charges or prepayments",
                   "Verified professionals with 5+ yrs exp",
                   "Immediate 24-hr re-fix guarantee",
                   "Localized Patna support team"
                 ].map((text, i) => (
                   <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <i className="ph-fill ph-check-circle" style={{ color: 'var(--secondary)', fontSize: '1.25rem' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>{text}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Floating Checkout Bar */}
        <div style={{ 
          position: 'fixed', bottom: '2rem', left: '1.5rem', right: '1.5rem', zIndex: 100,
          background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(32px)',
          padding: '1.25rem', borderRadius: '2.5rem', border: '1px solid rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
        }}>
           <div style={{ marginLeft: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                 {selectedService ? selectedService.name : 'Select a pack'}
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--on-surface)', lineHeight: 1 }}>
                 ₹{selectedService ? selectedService.price : '0'}
              </p>
           </div>
           <motion.button 
             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
             onClick={handleProceed} 
             disabled={!canBook || !selectedService} 
             className="btn-primary animate-pulse-glow" 
             style={{ padding: '1.125rem 2.5rem', borderRadius: '1.75rem', fontSize: '1rem', border: 'none' }}
           >
              {!canBook ? (isHi ? 'बंद है' : 'Paused') : (isHi ? 'बुक करें' : 'Book Now')}
           </motion.button>
        </div>

      {/* Modals Stays Functional */}
      <AnimatePresence>
        {step === 'step1' && (
          <BookingStep1 
            meta={meta} category={categoryId} isHi={isHi} 
            onClose={() => setStep('landing')} 
            onProceedToPayment={(d) => { setBookingDetails(d); setStep('step2'); }} 
          />
        )}
        {step === 'step2' && (
          <BookingStep2 
            meta={meta} selectedService={selectedService} bookingDetails={bookingDetails} isHi={isHi} 
            onBack={() => setStep('step1')} onPayLater={handlePayLater} onPayNow={handlePayNow} isSubmitting={isSubmitting} 
          />
        )}
      </AnimatePresence>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(255, 140, 0, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(255, 140, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 140, 0, 0); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
    </motion.div>
  );
}
