import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  if (!biz) return (
    <div style={{ background: '#0a0e13', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#72767c' }}>Service not found</p>
    </div>
  );

  const service = biz.services?.[serviceIndex] || biz.services?.[0];

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), date: d.getDate(), month: d.toLocaleDateString('en', { month: 'short' }), full: d };
  });

  const timeSlots = [
    { id: 'morning1', label: '9:00 AM' }, { id: 'morning2', label: '10:00 AM' }, { id: 'morning3', label: '11:00 AM' },
    { id: 'afternoon1', label: '12:00 PM' }, { id: 'afternoon2', label: '2:00 PM' }, { id: 'afternoon3', label: '3:00 PM' },
    { id: 'evening1', label: '5:00 PM' }, { id: 'evening2', label: '6:00 PM' }, { id: 'evening3', label: '7:00 PM' },
  ];

  const handleBookViaWhatsApp = () => {
    if (!name || !phone || !selectedTime) return;

    // Save booking record
    addBooking({
      userId: currentUser?.uid || null,
      businessId: biz.id, businessName: biz.name,
      service: service?.name, price: service?.price,
      date: `${dates[selectedDate]?.day}, ${dates[selectedDate]?.date} ${dates[selectedDate]?.month}`,
      time: selectedTime, customerName: name, customerPhone: phone,
      customerAddress: address, notes,
    });

    // Build WhatsApp message
    const dateStr = `${dates[selectedDate]?.day}, ${dates[selectedDate]?.date} ${dates[selectedDate]?.month}`;
    const msg = `🙏 नमस्ते! मैं *Patna Suvidha* से बुकिंग कर रहा/रही हूँ।

📋 *बुकिंग डिटेल्स:*
━━━━━━━━━━━━━━
🏢 *सेवा:* ${service?.name || 'General Service'}
💰 *कीमत:* ₹${service?.price?.toLocaleString() || 'N/A'}
📅 *तारीख:* ${dateStr}
🕐 *समय:* ${selectedTime}

👤 *ग्राहक का नाम:* ${name}
📱 *फ़ोन:* ${phone}${address ? `\n📍 *पता:* ${address}` : ''}${notes ? `\n📝 *नोट:* ${notes}` : ''}
━━━━━━━━━━━━━━
_यह बुकिंग Patna Suvidha (patnasuvidha.com) से की गई है_`;

    const waNumber = biz.whatsapp || biz.phone;
    const waUrl = `https://wa.me/91${waNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    // Navigate to success
    navigate(`/booking-success?biz=${encodeURIComponent(biz.name)}&service=${encodeURIComponent(service?.name || '')}&date=${encodeURIComponent(dateStr)}&time=${encodeURIComponent(selectedTime)}`);
  };

  return (
    <div style={{ background: '#0a0e13', minHeight: '100vh', paddingBottom: '6rem' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,14,19,0.9)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(68,72,78,0.15)', padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '480px', margin: '0 auto' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '0.375rem', cursor: 'pointer' }}>
            <i className="ph-bold ph-arrow-left" style={{ color: '#f4f6fe', fontSize: '1.25rem' }}></i>
          </button>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 700, color: '#f4f6fe' }}>
            {lang === 'hi' ? 'सेवा बुक करीं' : 'Book Service'}
          </h2>
        </div>
      </header>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1rem 1.25rem' }}>
        {/* Service Card */}
        <div style={{ background: '#151a20', borderRadius: '1rem', padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '0.75rem', overflow: 'hidden', flexShrink: 0 }}>
            <img src={biz.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: '#72767c' }}>{biz.name}</p>
            <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9375rem', fontWeight: 700, color: '#f4f6fe' }}>{service?.name || 'General Service'}</p>
            <p style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#ff9159' }}>₹{service?.price?.toLocaleString() || 'N/A'}</p>
          </div>
        </div>

        {/* Date Selection */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 700, color: '#f4f6fe', marginBottom: '0.75rem' }}>
            <i className="ph-bold ph-calendar" style={{ color: '#ff9159', marginRight: '0.5rem' }}></i>
            {lang === 'hi' ? 'तारीख चुनीं' : 'Select Date'}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }} className="hide-scrollbar">
            {dates.map((d, i) => (
              <button key={i} onClick={() => setSelectedDate(i)} style={{
                flexShrink: 0, width: '60px', padding: '0.625rem 0', borderRadius: '0.875rem', textAlign: 'center',
                background: selectedDate === i ? 'linear-gradient(135deg, #ff9159, #ff7a2f)' : '#151a20',
                border: 'none', cursor: 'pointer',
              }}>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 600, color: selectedDate === i ? '#401500' : '#72767c', marginBottom: '0.125rem' }}>{d.day}</p>
                <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: selectedDate === i ? '#401500' : '#f4f6fe' }}>{d.date}</p>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.5625rem', fontWeight: 600, color: selectedDate === i ? '#401500' : '#72767c' }}>{d.month}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 700, color: '#f4f6fe', marginBottom: '0.75rem' }}>
            <i className="ph-bold ph-clock" style={{ color: '#ff9159', marginRight: '0.5rem' }}></i>
            {lang === 'hi' ? 'समय चुनीं' : 'Select Time'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {timeSlots.map(slot => (
              <button key={slot.id} onClick={() => setSelectedTime(slot.label)} style={{
                padding: '0.625rem', borderRadius: '0.75rem', textAlign: 'center',
                background: selectedTime === slot.label ? 'linear-gradient(135deg, #ff9159, #ff7a2f)' : '#151a20',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Manrope'", fontSize: '0.8125rem', fontWeight: 600,
                color: selectedTime === slot.label ? '#401500' : '#a8abb2',
              }}>{slot.label}</button>
            ))}
          </div>
        </div>

        {/* Your Details */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 700, color: '#f4f6fe', marginBottom: '0.75rem' }}>
            <i className="ph-bold ph-user" style={{ color: '#ff9159', marginRight: '0.5rem' }}></i>
            {lang === 'hi' ? 'अपना डिटेल्स भरीं' : 'Your Details'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { val: name, set: setName, ph: lang === 'hi' ? 'अपना नाम *' : 'Your Name *', type: 'text' },
              { val: phone, set: setPhone, ph: lang === 'hi' ? 'फ़ोन नंबर *' : 'Phone Number *', type: 'tel' },
              { val: address, set: setAddress, ph: lang === 'hi' ? 'पटना में अपना पता' : 'Your Address in Patna', type: 'text' },
            ].map((f, i) => (
              <input key={i} type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                style={{ background: '#151a20', borderRadius: '0.75rem', padding: '0.875rem 1rem', fontFamily: "'Manrope'", fontSize: '0.875rem', color: '#f4f6fe', border: '2px solid transparent', outline: 'none', transition: 'border-color 150ms' }}
                onFocus={e => e.target.style.borderColor = '#ff9159'} onBlur={e => e.target.style.borderColor = 'transparent'} />
            ))}
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={lang === 'hi' ? 'कुछ खास बात (वैकल्पिक)' : 'Special instructions (optional)'} rows={2}
              style={{ background: '#151a20', borderRadius: '0.75rem', padding: '0.875rem 1rem', fontFamily: "'Manrope'", fontSize: '0.875rem', color: '#f4f6fe', border: '2px solid transparent', outline: 'none', resize: 'vertical', transition: 'border-color 150ms' }}
              onFocus={e => e.target.style.borderColor = '#ff9159'} onBlur={e => e.target.style.borderColor = 'transparent'} />
          </div>
        </div>

        {/* WhatsApp info */}
        <div style={{ background: '#151a2080', borderRadius: '1rem', padding: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ph-fill ph-whatsapp-logo" style={{ color: '#22c55e', fontSize: '1.25rem' }}></i>
          </div>
          <div>
            <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', fontWeight: 700, color: '#f4f6fe' }}>
              {lang === 'hi' ? 'WhatsApp से बुक होई' : 'Booking via WhatsApp'}
            </p>
            <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#72767c' }}>
              {lang === 'hi' ? 'अपना सब डिटेल सीधे सेवा प्रदाता के WhatsApp पर जाई' : 'Your details will be sent directly to the service provider on WhatsApp'}
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
          {[{ icon: 'ph-shield-check', label: 'Verified' }, { icon: 'ph-lock-simple', label: 'Safe' }, { icon: 'ph-headset', label: '24/7 Support' }].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <i className={`ph-fill ${b.icon}`} style={{ fontSize: '0.875rem', color: '#34d399' }}></i>
              <span style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 600, color: '#72767c' }}>{b.label}</span>
            </div>
          ))}
        </div>

        {/* Book via WhatsApp CTA */}
        {canBook ? (
          <button onClick={handleBookViaWhatsApp} disabled={!name || !phone || !selectedTime} style={{
            width: '100%', fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 700,
            background: (!name || !phone || !selectedTime) ? '#21262e' : 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: (!name || !phone || !selectedTime) ? '#72767c' : '#fff',
            padding: '1rem', borderRadius: '1rem', border: 'none',
            cursor: (!name || !phone || !selectedTime) ? 'not-allowed' : 'pointer',
            boxShadow: (!name || !phone || !selectedTime) ? 'none' : '0 8px 25px rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}>
            <i className="ph-fill ph-whatsapp-logo" style={{ fontSize: '1.25rem' }}></i>
            {lang === 'hi' ? 'WhatsApp पर बुक करीं' : 'Book on WhatsApp'}
          </button>
        ) : (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1.25rem', borderRadius: '1.25rem', textAlign: 'center', fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.2)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)' }}>
            <i className="ph-fill ph-warning-circle" style={{ fontSize: '1.75rem', marginBottom: '0.5rem', display: 'block' }}></i>
            {isCategoryPaused 
               ? (lang === 'hi' ? 'ई सेवा अभी बंद बा। कृपया बाद में प्रयास करीं।' : 'This service category is currently paused.')
               : (lang === 'hi' ? 'बुकिंग अभी बंद है। कृपया बाद में प्रयास करें।' : 'Bookings are currently paused. Please try again later.')
            }
          </div>
        )}
      </div>
    </div>
  );
}
