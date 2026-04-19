import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const sectionVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } }
};

export default function BookService() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const serviceIndex = parseInt(searchParams.get('service') || '0');
  const navigate = useNavigate();
  const { getBusinessById, addBooking, lang, currentUser, bookingsEnabled, pausedCategories } = useAppContext();
  const biz = getBusinessById(id);

  const isCategoryPaused = pausedCategories.includes(biz?.category);
  const canBook = bookingsEnabled && !isCategoryPaused;

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  if (!biz) return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--on-surface-variant)', fontWeight: 800 }}>Service not found</p>
    </div>
  );

  const service = biz.services?.[serviceIndex] || biz.services?.[0];

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), date: d.getDate(), month: d.toLocaleDateString('en', { month: 'short' }), full: d };
  });

  const timeSlots = [
    { id: 'm1', label: '09:00 AM' }, { id: 'm2', label: '10:00 AM' }, { id: 'm3', label: '11:00 AM' },
    { id: 'a1', label: '12:00 PM' }, { id: 'a2', label: '02:00 PM' }, { id: 'a3', label: '03:00 PM' },
    { id: 'e1', label: '05:00 PM' }, { id: 'e2', label: '06:00 PM' }, { id: 'e3', label: '07:00 PM' },
  ];

  const handleBookViaWhatsApp = () => {
    if (!name || !phone || !selectedTime) return;

    const dateStr = `${dates[selectedDate]?.day}, ${dates[selectedDate]?.date} ${dates[selectedDate]?.month}`;
    
    addBooking({
      userId: currentUser?.uid || null,
      businessId: biz.id, businessName: biz.name,
      service: service?.name, price: service?.price,
      date: dateStr, time: selectedTime, 
      customerName: name, customerPhone: phone,
      customerAddress: address, notes,
    });

    const msg = `🙏 नमस्ते! मैं *Patna Suvidha* से बुकिंग कर रहा/रही हूँ।

📋 *बुकिंग डिटेल्स:*
━━━━━━━━━━━━━━
🏢 *सेवा:* ${service?.name || 'General Service'}
💰 *कीमत:* ₹${service?.price?.toLocaleString() || 'N/A'}
📅 *तारीख:* ${dateStr}
🕐 *समय:* ${selectedTime}

👤 *ग्राहक:* ${name}
📱 *फ़ोन:* ${phone}${address ? `\n📍 *पता:* ${address}` : ''}${notes ? `\n📝 *नोट:* ${notes}` : ''}
━━━━━━━━━━━━━━
_Booked via patnasuvidha.com_`;

    const waNumber = biz.whatsapp || biz.phone || '910101936969';
    const waUrl = `https://wa.me/91${waNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    navigate(`/booking-success?biz=${encodeURIComponent(biz.name)}&service=${encodeURIComponent(service?.name || '')}&date=${encodeURIComponent(dateStr)}&time=${encodeURIComponent(selectedTime)}`);
  };

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Bespoke Header */}
      <header className="liquid-glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(30px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '480px', margin: '0 auto' }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} style={{ background: 'var(--surface-container-high)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ph-bold ph-arrow-left" style={{ color: 'var(--on-surface)', fontSize: '1.25rem' }}></i>
          </motion.button>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
            {lang === 'hi' ? 'बुकिंग टिकट' : 'Secure Booking'}
          </h2>
        </div>
      </header>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} style={{ maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        
        {/* Service Ticket Section */}
        <motion.div variants={sectionVariants} className="clay-card" style={{ padding: '1.5rem', marginBottom: '1.75rem', background: 'var(--gradient-primary-soft)', border: '1px solid hsla(var(--p-h), 100%, 50%, 0.1)', position: 'relative', overflow: 'hidden' }}>
          <div className="glass-reflection" />
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', boxShadow: 'var(--shadow-lg)' }}>
              <img src={biz.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=150&q=80'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>{biz.name}</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 950, color: '#fff', marginBottom: '0.25rem' }}>{service?.name || 'Service Package'}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <span style={{ fontSize: '1rem', fontWeight: 950, color: '#fff' }}>₹{service?.price?.toLocaleString() || 'N/A'}</span>
                 <span style={{ fontSize: '0.625rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 800 }}>TRANSPARENT</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Date Selection */}
        <motion.div variants={sectionVariants} style={{ marginBottom: '1.75rem' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <i className="ph-fill ph-calendar-plus" style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
            {lang === 'hi' ? 'तारीख चुनीं' : 'Deployment Date'}
          </h4>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
            {dates.map((d, i) => (
              <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => setSelectedDate(i)} style={{
                flexShrink: 0, width: '72px', padding: '1rem 0', borderRadius: '1.25rem', textAlign: 'center',
                background: selectedDate === i ? 'var(--gradient-primary)' : 'var(--surface-container-low)',
                border: selectedDate === i ? 'none' : '1px solid var(--outline-variant)',
                boxShadow: selectedDate === i ? 'var(--shadow-glow-small)' : 'none',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: selectedDate === i ? '#fff' : 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>{d.day}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 950, color: selectedDate === i ? '#fff' : 'var(--on-surface)' }}>{d.date}</p>
                <p style={{ fontSize: '0.625rem', fontWeight: 800, color: selectedDate === i ? '#fff' : 'var(--on-surface-variant)', opacity: 0.7 }}>{d.month}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Time Selection */}
        <motion.div variants={sectionVariants} style={{ marginBottom: '1.75rem' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <i className="ph-fill ph-clock-countdown" style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
            {lang === 'hi' ? 'समय चुन लीं' : 'Preferred Slot'}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
            {timeSlots.map(slot => (
              <motion.button key={slot.id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedTime(slot.label)} style={{
                padding: '0.875rem 0.5rem', borderRadius: '1rem', textAlign: 'center',
                background: selectedTime === slot.label ? 'var(--gradient-primary)' : 'var(--surface-container-low)',
                border: selectedTime === slot.label ? 'none' : '1px solid var(--outline-variant)',
                boxShadow: selectedTime === slot.label ? 'var(--shadow-glow-small)' : 'none',
                fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 800,
                color: selectedTime === slot.label ? '#fff' : 'var(--on-surface)', cursor: 'pointer', transition: 'all 0.2s'
              }}>{slot.label}</motion.button>
            ))}
          </div>
        </motion.div>

        {/* User Details - Claymorphic Inputs */}
        <motion.div variants={sectionVariants} style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <i className="ph-fill ph-identification-card" style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
            {lang === 'hi' ? 'अपन परिचय' : 'Booking Identity'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1.25rem' }}>
               <i className="ph ph-user" style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
               <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name *" style={{ background: 'none', border: 'none', borderLeft: '1px solid var(--outline-variant)', padding: '1rem 0 1rem 0.75rem', color: '#fff', outline: 'none', flex: 1, fontWeight: 700 }} />
            </div>
            <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1.25rem' }}>
               <i className="ph ph-phone" style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
               <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number *" style={{ background: 'none', border: 'none', borderLeft: '1px solid var(--outline-variant)', padding: '1rem 0 1rem 0.75rem', color: '#fff', outline: 'none', flex: 1, fontWeight: 700 }} />
            </div>
            <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1.25rem' }}>
               <i className="ph ph-map-pin" style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
               <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Patna Address *" style={{ background: 'none', border: 'none', borderLeft: '1px solid var(--outline-variant)', padding: '1rem 0 1rem 0.75rem', color: '#fff', outline: 'none', flex: 1, fontWeight: 700 }} />
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions? (Optional)" rows={2} className="input-field" style={{ padding: '1rem 1.25rem', color: '#fff', outline: 'none', flex: 1, fontWeight: 700, resize: 'none' }} />
          </div>
        </motion.div>

        {/* Global Protection Chip */}
        <motion.div variants={sectionVariants} style={{ background: 'var(--surface-container-high)', borderRadius: '1.25rem', padding: '1rem 1.25rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--outline-variant)' }}>
           <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ph-fill ph-shield-check" style={{ color: '#22c55e', fontSize: '1.5rem' }} />
           </div>
           <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--on-surface)' }}>{lang === 'hi' ? 'सुरक्षित और सत्यापित' : 'Secure & Verified'}</p>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Verified experts. Secure WhatsApp routing.</p>
           </div>
        </motion.div>

        {/* Book Button */}
        <motion.div variants={sectionVariants}>
          {canBook ? (
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleBookViaWhatsApp} 
              disabled={!name || !phone || !address || !selectedTime} 
              style={{
                width: '100%', padding: '1.25rem', borderRadius: '1.5rem',
                background: (!name || !phone || !address || !selectedTime) ? 'var(--surface-container-highest)' : 'var(--gradient-primary)',
                color: (!name || !phone || !address || !selectedTime) ? 'var(--on-surface-variant)' : '#fff',
                border: 'none', fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 950,
                cursor: 'pointer', boxShadow: (!name || !phone || !address || !selectedTime) ? 'none' : 'var(--shadow-glow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
              }}
            >
              <i className="ph-fill ph-whatsapp-logo" style={{ fontSize: '1.5rem' }}></i>
              {lang === 'hi' ? 'WhatsApp पर बुक करीं' : 'Book on WhatsApp'}
            </motion.button>
          ) : (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1.5rem', borderRadius: '1.5rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <i className="ph-fill ph-warning-circle" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}></i>
              <p style={{ fontWeight: 900 }}>{isCategoryPaused ? 'Service Category Paused' : 'Bookings Currently Offline'}</p>
            </div>
          )}
        </motion.div>

      </motion.div>
    </div>
  );
}
