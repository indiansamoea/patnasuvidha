import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { useSmartSlots } from '../hooks/useSmartSlots';

// ─────────────────────────────────────────────────────────
// DEFAULT FALLBACK META
// ─────────────────────────────────────────────────────────
const DEFAULT_META = {
  hero: 'https://images.unsplash.com/photo-1556742400-b5b7a512a36e?auto=format&fit=crop&w=1200&q=80',
  title: 'Professional Services',
  titleHi: 'प्रोफेशनल सेवाएं',
  desc: 'Book verified, trusted professionals in Patna for all your service needs.',
  descHi: 'पटना में सभी सेवा जरूरतों के लिए सत्यापित, विश्वसनीय पेशेवरों को बुक करें।',
  icon: 'ph-gear',
  services: [],
};

// ─────────────────────────────────────────────────────────
// BOOKING STEP 1 SHEET — Date, Time & Address
// ─────────────────────────────────────────────────────────
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

  // ── Smart Slots Integration ──
  const { 
    isSlotUnavailable, isSlotBooked, isSlotPast, isSlotPreferred,
    suggestedSlot, userHistory, isLoading: isLoadingSlots,
    totalSlotsAvailable, activeProvidersCount
  } = useSmartSlots(category, selectedDateObj.full, currentUser);

  // Auto-select the suggested slot when it becomes available
  useEffect(() => {
    if (suggestedSlot && !selectedSlot) {
      setSelectedSlot(suggestedSlot);
    }
  }, [suggestedSlot]);

  // Pre-fill address from user history if none selected
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
      } catch (e) {
        console.error(e);
      } finally {
        setIsSavingAddress(false);
      }
    }
    const dateStr = `${selectedDateObj.day}, ${selectedDateObj.date} ${selectedDateObj.month}`;
    onProceedToPayment({ date: dateStr, dateFull: selectedDateObj.full, time: selectedSlot, address: finalAddress });
  };

  const ALL_TIME_SLOTS_DATA = [
    { id: 'morning1',   label: '9:00 AM',   period: 'Morning' },
    { id: 'morning2',   label: '10:00 AM',  period: 'Morning' },
    { id: 'morning3',   label: '11:00 AM',  period: 'Morning' },
    { id: 'afternoon1', label: '12:00 PM',  period: 'Afternoon' },
    { id: 'afternoon2', label: '2:00 PM',   period: 'Afternoon' },
    { id: 'afternoon3', label: '3:00 PM',   period: 'Afternoon' },
    { id: 'evening1',   label: '5:00 PM',   period: 'Evening' },
    { id: 'evening2',   label: '6:00 PM',   period: 'Evening' },
    { id: 'evening3',   label: '7:00 PM',   period: 'Evening' },
  ];

  const categoryName = isHi ? (meta.nameHi || meta.name) : meta.name;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
      <div className="animate-slide-up" style={{ position: 'relative', zIndex: 1, background: 'var(--surface)', borderRadius: '24px 24px 0 0', maxHeight: '92vh', overflowY: 'auto', paddingBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: 'var(--outline-variant)' }} />
        </div>
        <div style={{ padding: '0 1.25rem', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>{isHi ? 'समय और पता चुनें' : 'Time & Address'}</h2>
            <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-container-high)', border: 'none', cursor: 'pointer' }}>
               <i className="ph-bold ph-x" />
            </button>
          </div>

          {/* Smart Slot Status Banner OR Empty Category State */}
          <div style={{ 
            padding: '0.625rem 1rem', borderRadius: '12px', marginBottom: '1.25rem',
            background: isLoadingSlots ? 'var(--surface-container)' : activeProvidersCount === 0 ? 'rgba(255,145,89,0.1)' : totalSlotsAvailable > 3 ? 'rgba(34,197,94,0.1)' : totalSlotsAvailable > 0 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.1)',
            border: isLoadingSlots ? 'none' : activeProvidersCount === 0 ? '1px dashed var(--primary)' : totalSlotsAvailable > 3 ? '1px solid rgba(34,197,94,0.2)' : totalSlotsAvailable > 0 ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            {isLoadingSlots ? (
              <><div className="spinner" style={{ width: '14px', height: '14px' }} /><span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>Checking availability...</span></>
            ) : (
              <>
                <i className={`ph-fill ${activeProvidersCount === 0 ? 'ph-rocket-launch' : totalSlotsAvailable > 3 ? 'ph-check-circle' : totalSlotsAvailable > 0 ? 'ph-warning' : 'ph-x-circle'}`} 
                  style={{ color: activeProvidersCount === 0 ? 'var(--primary)' : totalSlotsAvailable > 3 ? '#22c55e' : totalSlotsAvailable > 0 ? '#f59e0b' : '#ef4444', fontSize: '1rem' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                  {activeProvidersCount > 0 
                    ? (totalSlotsAvailable > 0 
                        ? `${totalSlotsAvailable} slots available across ${activeProvidersCount} active experts` 
                        : 'All experts are busy for this date')
                    : (isHi ? `हम जल्द ही ${categoryName} के लिए आ रहे हैं!` : `Partnering with more experts for ${categoryName}...`)}
                </span>
              </>
            )}
          </div>

          {/* Date Selector */}
          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem' }}>{isHi ? 'तारीख' : 'Date'}</h3>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }} className="hide-scrollbar">
              {dates.map((d, i) => (
                <button key={i} onClick={() => { setSelectedDateIndex(i); setSelectedSlot(null); }} style={{ flexShrink: 0, width: '60px', padding: '0.6rem 0', borderRadius: '12px', background: selectedDateIndex === i ? 'var(--gradient-primary)' : 'var(--surface-container)', color: selectedDateIndex === i ? '#fff' : 'inherit', border: 'none', cursor: 'pointer' }}>
                  <p style={{ fontSize: '0.625rem' }}>{d.day}</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 800 }}>{d.date}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Time Slots Section */}
          <section className="animate-fade-up-plus delay-3" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {activeProvidersCount > 0 ? (isHi ? 'टाइम चुनें' : 'Available Slots') : (isHi ? 'जल्द आ रहा है' : 'Service Coming Soon')}
              </h3>
            </div>

            {activeProvidersCount === 0 ? (
              <div className="clay-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: 'var(--surface-container-low)', border: '1px dashed var(--outline-variant)' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,145,89,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <i className="ph-fill ph-rocket-launch" style={{ color: 'var(--primary)', fontSize: '2rem' }} />
                </div>
                <h4 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                  {isHi ? 'हम आपके क्षेत्र में आ रहे हैं!' : 'Coming to your area!'}
                </h4>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                  {isHi ? `हम ${categoryName} के लिए बेहतरीन विशेषज्ञों को शामिल कर रहे हैं। जल्द ही यहाँ सर्विस शुरू होगी!` : `We are currently vetting and onboarding the best local experts for ${categoryName}. Check back soon!`}
                </p>
                <button 
                  onClick={() => navigate('/services')}
                  style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 800 }}
                >
                  {isHi ? 'अन्य सेवाएं देखें' : 'Explore Other Services'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {ALL_TIME_SLOTS_DATA.map(slot => {
                  const booked = isSlotBooked(slot.label);
                  const past  = isSlotPast(slot.label);
                  const unavail = booked || past;
                  const isSuggested = slot.label === suggestedSlot;
                  const isSelected = selectedSlot === slot.label;

                  return (
                    <button key={slot.id} disabled={unavail} onClick={() => setSelectedSlot(slot.label)}
                      style={{
                        padding: '0.75rem 0.25rem', borderRadius: '10px', position: 'relative',
                        background: isSelected ? 'var(--primary-container)' : isSuggested ? 'rgba(255,140,0,0.08)' : 'var(--surface-container)',
                        border: isSelected ? '2px solid var(--primary)' : isSuggested ? '1px dashed var(--primary)' : '1px solid transparent',
                        opacity: unavail ? 0.35 : 1,
                        cursor: unavail ? 'not-allowed' : 'pointer',
                        fontSize: '0.8125rem', fontWeight: 700,
                        textDecoration: past ? 'line-through' : 'none',
                        color: booked ? 'var(--on-surface-variant)' : 'inherit'
                      }}>
                      {slot.label}
                      {isSlotPreferred(slot.label) && <div style={{ position: 'absolute', top: '-6px', right: '-4px', background: 'var(--primary)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>EXPERT</div>}
                      {booked && !isSlotPreferred(slot.label) && <span style={{ position: 'absolute', top: '2px', right: '4px', fontSize: '0.5rem', fontWeight: 900, color: '#f59e0b' }}>●</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {activeProvidersCount > 0 && (
            <>
              <section style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem' }}>{isHi ? 'पता' : 'Address'}</h3>
                {savedAddresses.map(addr => (
                  <button key={addr.id} onClick={() => { setSelectedAddressId(addr.id); setShowAddressForm(false); }} style={{ width: '100%', padding: '1rem', borderRadius: '12px', marginBottom: '0.5rem', textAlign: 'left', background: selectedAddressId === addr.id ? 'var(--primary-container)' : 'var(--surface-container)', border: 'none' }}>
                    {addr.label}
                  </button>
                ))}
                <button onClick={() => { setShowAddressForm(true); setSelectedAddressId(null); }} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px dashed var(--primary)', background: 'transparent', color: 'var(--primary)', fontWeight: 800 }}>
                  + {isHi ? 'नया पता' : 'New Address'}
                </button>
                {showAddressForm && (
                  <div style={{ marginTop: '0.75rem', position: 'relative' }}>
                    <input className="input-field" value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Type address..." style={{ paddingRight: '2.5rem' }} />
                    <button onClick={handleRetrieveLocation} disabled={isFetchingLocation} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--primary)' }}>
                      {isFetchingLocation ? <div className="spinner" style={{ width: '14px', height: '14px' }} /> : <i className="ph-fill ph-target" />}
                    </button>
                  </div>
                )}
              </section>

              <button onClick={handleSaveAndProceed} disabled={!canProceed || isSavingAddress} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: canProceed ? 'var(--gradient-primary)' : 'var(--surface-container-high)', color: canProceed ? '#fff' : 'var(--on-surface-variant)', fontWeight: 800, border: 'none', cursor: canProceed ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                {isSavingAddress ? 'Saving...' : (isHi ? 'पुष्टि करें' : 'Confirm & Proceed')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// BOOKING STEP 2 — Payment Sheet
// ─────────────────────────────────────────────────────────
function BookingStep2({ meta, selectedService, bookingDetails, isHi, onBack, onPayLater, onPayNow, isSubmitting }) {
  const servicePrice = selectedService?.price || 0;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onBack} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} />
      <div className="animate-slide-up" style={{ position: 'relative', zIndex: 1, background: 'var(--surface)', borderRadius: '24px 24px 0 0', maxHeight: '90vh', overflowY: 'auto', paddingBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0' }}><div style={{ width: '40px', height: '4px', borderRadius: '99px', background: 'var(--outline-variant)' }} /></div>
        <div style={{ padding: '0 1.25rem', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button onClick={onBack} style={{ border: 'none', background: 'var(--surface-container-high)', width: '36px', height: '36px', borderRadius: '50%' }}><i className="ph-bold ph-arrow-left" /></button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{isHi ? 'भुगतान चुनें' : 'Choose Payment'}</h2>
          </div>

          <div style={{ padding: '1rem', background: 'var(--surface-container)', borderRadius: '16px', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>SUMMARY</p>
            <p style={{ fontSize: '0.875rem' }}>{selectedService?.name} · {bookingDetails.date} · {bookingDetails.time}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', marginTop: '0.5rem' }}>₹{servicePrice.toLocaleString('en-IN')}</p>
          </div>

          <button onClick={onPayLater} disabled={isSubmitting} style={{ marginBottom: '1rem', width: '100%', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <i className="ph-fill ph-hand-coins" style={{ fontSize: '1.5rem', color: 'var(--secondary)' }} />
             <div><p style={{ fontWeight: 800 }}>{isHi ? 'सेवा के बाद भुगतान' : 'Pay After Service'}</p><p style={{ fontSize: '0.75rem' }}>Cash or UPI to worker</p></div>
          </button>

          <button onClick={onPayNow} disabled={isSubmitting} style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', background: 'var(--gradient-primary)', color: '#fff', textAlign: 'left', border: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <i className="ph-fill ph-lightning" style={{ fontSize: '1.5rem' }} />
             <div><p style={{ fontWeight: 800 }}>{isHi ? 'अभी भुगतान करें' : 'Pay Now Online'}</p><p style={{ fontSize: '0.75rem', opacity: 0.9 }}>Securely pay ₹{servicePrice}</p></div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────
function SectionTitle({ title, subtitle, isHi }) {
  return (
    <div style={{ marginBottom: '1.25rem', marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--primary)', letterSpacing: '-0.02em' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{subtitle}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────
export default function ServiceLanding() {
  const { category: categoryId } = useParams();
  const navigate = useNavigate();
  const { lang, addBooking, currentUser, categories, bookingsEnabled, settings } = useAppContext();
  
  const meta = useMemo(() => categories.find(c => c.id === categoryId) || DEFAULT_META, [categories, categoryId]);
  const services = useMemo(() => meta.services || [], [meta]);

  const [selectedService, setSelectedService] = useState(null);
  const [step, setStep] = useState('landing'); // landing, step1, step2
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (services.length > 0 && !selectedService) setSelectedService(services[0]);
  }, [services]);

  const isHi = lang === 'hi';
  const isCategoryPaused = (settings.pausedCategories || []).includes(categoryId);
  const canBook = bookingsEnabled && !isCategoryPaused;

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
        ...bookingDetails,
        service: selectedService.name,
        amount: selectedService.price,
        paymentMethod: 'pay_later',
        categoryId: categoryId,
        category: meta.name || categoryId,
      });
      navigate(`/booking-success?biz=${encodeURIComponent(isHi ? (meta.nameHi || meta.name) : meta.name)}&service=${encodeURIComponent(selectedService.name)}&date=${encodeURIComponent(bookingDetails.date)}&time=${encodeURIComponent(bookingDetails.time)}&payment=pay_later&id=${bId}`);
    } catch (e) {
      toast.error("Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayNow = async () => {
     const key = settings.razorpayKey || 'rzp_live_SSIUQLBgFOF2M7';
     const rzpOptions = {
       key,
       amount: selectedService.price * 100,
       currency: "INR",
       name: "Patna Suvidha",
       description: `Booking for ${selectedService.name}`,
       handler: async (res) => {
         const bId = await addBooking({
           ...bookingDetails,
           service: selectedService.name,
           amount: selectedService.price,
           paymentMethod: 'pay_now',
           paymentId: res.razorpay_payment_id,
           categoryId: categoryId,
           category: meta.name || categoryId,
         });
         navigate(`/booking-success?biz=${encodeURIComponent(isHi ? (meta.nameHi || meta.name) : meta.name)}&service=${encodeURIComponent(selectedService.name)}&date=${encodeURIComponent(bookingDetails.date)}&time=${encodeURIComponent(bookingDetails.time)}&payment=pay_now&id=${bId}`);
       },
       prefill: { name: currentUser?.displayName, contact: currentUser?.phoneNumber },
       theme: { color: "#FF8C00" }
     };
     const rzp = new window.Razorpay(rzpOptions);
     rzp.open();
  };

  const stats = meta.stats || { rating: '4.9', bookings: '1k+', experience: '5+ Years' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', paddingBottom: '10rem' }}>
      {/* Hero Section */}
      <div style={{ position: 'relative', height: '320px', overflow: 'hidden' }}>
        <img src={meta.hero} alt={meta.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface) 5%, transparent 60%, rgba(0,0,0,0.4) 100%)' }} />
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '1rem', left: '1rem', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <i className="ph-bold ph-arrow-left" style={{ fontSize: '1.25rem' }} />
        </button>

        {/* Floating Stat Badges */}
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.25rem', right: '1.25rem' }}>
          <h1 className="animate-fade-in-up" style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.3)', marginBottom: '1rem', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>
             {isHi ? (meta.nameHi || meta.name) : (meta.name || meta.title)}
          </h1>
          
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }} className="hide-scrollbar">
             <div className="liquid-glass" style={{ padding: '0.625rem 0.875rem', borderRadius: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="ph-fill ph-star" style={{ color: '#FFD700' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{stats.rating} Rating</span>
             </div>
             <div className="liquid-glass" style={{ padding: '0.625rem 0.875rem', borderRadius: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="ph-fill ph-users" style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{stats.bookings} Booked</span>
             </div>
             <div className="liquid-glass" style={{ padding: '0.625rem 0.875rem', borderRadius: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="ph-fill ph-medal" style={{ color: '#16A34A' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{stats.experience}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ position: 'relative', marginTop: '-1.5rem', background: 'var(--surface)', borderRadius: '24px 24px 0 0', padding: '2rem 1.25rem' }}>
        
        {/* Trust Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
          <div className="clay-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <i className="ph-fill ph-shield-check" style={{ color: '#16A34A' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>Service Warranty</span>
          </div>
          <div className="clay-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,140,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <i className="ph-fill ph-user-check" style={{ color: '#FF8C00' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>Verified Experts</span>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '0.9375rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          {isHi ? (meta.descHi || meta.desc) : meta.desc}
        </p>

        {/* Services Selection */}
        <section>
          <SectionTitle title={isHi ? 'उपलब्ध सेवाएं' : 'Select Service'} subtitle="Fixed pricing, no hidden costs" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {services.map((s, i) => (
              <button key={i} onClick={() => setSelectedService(s)} 
                className={selectedService?.name === s.name ? "animate-pulse-glow" : ""}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', 
                  borderRadius: '20px', background: selectedService?.name === s.name ? 'var(--primary-container)' : 'var(--surface-container-low)', 
                  border: selectedService?.name === s.name ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                  transition: 'all 0.3s ease'
                }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: 800, fontSize: '1rem' }}>{s.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Professional Quality Guarantee</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 900, fontSize: '1.125rem', color: 'var(--primary)' }}>₹{s.price}</p>
                  <p style={{ fontSize: '0.625rem', letterSpacing: '0.05em', fontWeight: 800 }}>INCL. TAXES</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Features Section */}
        {meta.features && meta.features.length > 0 && (
          <section>
            <SectionTitle title={isHi ? 'हमारी विशेषताएं' : 'Why Patna Suvidha?'} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {meta.features.map((f, i) => (
                <div key={i} className="card-flat" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--surface-container-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <i className={f.icon || 'ph-check-circle'} style={{ fontSize: '1.25rem' }} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{f.title}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How it Works / Process */}
        <section>
          <SectionTitle title={isHi ? 'कैसे काम करता है?' : 'How it works'} />
          <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
            <div style={{ position: 'absolute', left: '4px', top: '10px', bottom: '10px', width: '2px', background: 'var(--outline-variant)', borderStyle: 'dashed' }} />
            {[
              { t: 'Book Session', d: 'Choose your service and schedule time.' },
              { t: 'Expert Arrives', d: 'Background verified pro arrives at doorstep.' },
              { t: 'Service & Smile', d: 'Top quality work with service warranty.' }
            ].map((step, i) => (
              <div key={i} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', border: '3px solid var(--surface)' }} />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800 }}>{step.t}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{step.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews (Feedback) Section */}
        {meta.reviews && meta.reviews.length > 0 && (
          <section>
            <SectionTitle title={isHi ? 'ग्राहकों की राय' : 'Customer Feedback'} subtitle="Real stories from verified customers" />
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }} className="hide-scrollbar">
              {meta.reviews.map((r, i) => (
                <div key={i} className="clay-card" style={{ flexShrink: 0, width: '260px', padding: '1.25rem', background: 'var(--surface-container-low)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 900 }}>
                      {r.user.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{r.user}</p>
                      <div style={{ display: 'flex', color: '#FFD700', fontSize: '0.625rem' }}>
                        {[...Array(5)].map((_, star) => <i key={star} className={star < r.rating ? "ph-fill ph-star" : "ph-star"} />)}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontStyle: 'italic', lineHeight: 1.5 }}>"{r.text}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {meta.faqs && meta.faqs.length > 0 && (
          <section>
            <SectionTitle title={isHi ? 'अक्सर पूछे जाने वाले सवाल' : 'FAQs'} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {meta.faqs.map((f, i) => (
                <div key={i} className="card-flat" style={{ overflow: 'hidden' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{f.q}</span>
                    <i className={openFaq === i ? "ph-bold ph-minus" : "ph-bold ph-plus"} style={{ fontSize: '0.75rem', color: 'var(--primary)' }} />
                  </button>
                  {openFaq === i && (
                    <div className="animate-fade-in" style={{ padding: '0 1rem 1rem 1rem', fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
                       {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Sticky Bottom Booking Bar */}
      <div style={{ position: 'fixed', bottom: 0, width: '100%', maxWidth: '600px', left: '50%', transform: 'translateX(-50%)', padding: '1rem 1.25rem 2.5rem', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--outline-variant)', zIndex: 100, borderRadius: '24px 24px 0 0', boxShadow: '0 -10px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Selected Plan</p>
            <p style={{ fontSize: '0.9375rem', fontWeight: 900 }}>{selectedService ? selectedService.name : '--'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>₹{selectedService ? selectedService.price : '0'}</p>
          </div>
        </div>
        <button onClick={handleProceed} disabled={!canBook || !selectedService} className="btn-primary animate-pulse-glow" style={{ width: '100%', padding: '1.125rem', fontSize: '1rem' }}>
           {!canBook ? (isHi ? 'अस्थायी रूप से बंद' : 'Service Paused') : (isHi ? 'बुक करें' : 'Book Professional Now')}
        </button>
      </div>

      {/* Modals */}
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
    </div>
  );
}
