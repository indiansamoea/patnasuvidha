import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } }
};

function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await onSubmit(booking, { rating, comment });
    setSubmitting(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} 
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} 
      />
      <motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="liquid-glass"
        style={{
          position: 'relative', width: '100%', maxWidth: '440px',
          background: 'var(--glass-bg)', borderRadius: '2.5rem 2.5rem 0 0',
          padding: '1.5rem 1.5rem 3.5rem', border: '1px solid var(--glass-border)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ width: '40px', height: '5px', borderRadius: '99px', background: 'var(--outline-variant)', margin: '0 auto 1.5rem', opacity: 0.5 }}></div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 950, color: 'var(--on-surface)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Share Your Experience
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>
          {booking.service} with {booking.businessName}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button 
              key={star} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
              onClick={() => setRating(star)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <i className={star <= rating ? "ph-fill ph-star" : "ph ph-star"} 
                 style={{ fontSize: '2.75rem', color: star <= rating ? 'hsl(var(--p-h), 100%, 50%)' : 'var(--outline-variant)', transition: 'color 0.2s', filter: star <= rating ? 'drop-shadow(0 0 10px hsla(var(--p-h), 100%, 50%, 0.5))' : 'none' }}></i>
            </motion.button>
          ))}
        </div>

        <textarea 
          placeholder="What did you think of the service?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="3"
          className="input-field"
          style={{ width: '100%', marginBottom: '2rem', padding: '1.25rem', color: 'var(--on-surface)', fontSize: '0.9375rem', fontWeight: 700, resize: 'none' }}
        />

        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          style={{
            width: '100%', padding: '1.25rem', borderRadius: '1.5rem',
            background: rating > 0 ? 'var(--gradient-primary)' : 'var(--surface-container-high)',
            color: rating > 0 ? '#fff' : 'var(--on-surface-variant)',
            border: 'none', fontWeight: 950, fontSize: '1.125rem',
            cursor: rating > 0 ? 'pointer' : 'not-allowed', boxShadow: rating > 0 ? 'var(--shadow-glow)' : 'none'
          }}
        >
          {submitting ? 'SENDING...' : 'PUBLISH REVIEW'}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function Bookings() {
  const { lang, currentUser, bookings, addReview } = useAppContext();
  const navigate = useNavigate();
  const [reviewModalData, setReviewModalData] = useState(null);

  const myBookings = useMemo(() => {
    if (!currentUser) return [];
    return (bookings || []).filter(b => 
      b.userId === currentUser.uid || 
      (b.customerPhone && currentUser.phoneNumber && b.customerPhone.includes(currentUser.phoneNumber.slice(-10)))
    ).sort((a, b) => {
      const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
      const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [bookings, currentUser]);

  const t = {
    en: { title: 'Service History', login: 'Identity Required', loginSub: 'Sign in to track your elite service requests', loginBtn: 'SECURE LOGIN', empty: 'No active bookings', emptySub: 'Start your bespoke service journey today.', rate: 'RATE SERVICE', explore: 'EXPLORE SERVICES' },
    hi: { title: 'मेरी बुकिंग्स', login: 'लॉगिन आवश्यक बा', loginSub: 'अपनी बुकिंग्स ट्रेक करे खातिर लॉगिन करीं', loginBtn: 'लॉगिन करीं', empty: 'अभी कोई बुकिंग नईखे', emptySub: 'आज ही अपन पहिली सर्विस बुक करीं।', rate: 'रिव्यु दीं', explore: 'सेवा देखीं' }
  }[lang] || { title: 'Service History' };

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', paddingBottom: '120px' }}>
      {/* Bespoke Header */}
      <header className="liquid-glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '1.25rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(30px)' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 950, color: 'var(--on-surface)', letterSpacing: '-0.02em', margin: 0 }}>
            {t.title}
          </h1>
        </div>
      </header>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.5rem' }}>
        {!currentUser ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="clay-card" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--surface-container-low)', position: 'relative', overflow: 'hidden' }}>
            <div className="glass-reflection" style={{ opacity: 0.3 }} />
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--gradient-primary-soft)', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)' }}>
              <i className="ph-fill ph-fingerprint" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 950, marginBottom: '0.75rem' }}>{t.login}</h2>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '2.5rem', lineHeight: 1.5 }}>{t.loginSub}</p>
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              style={{ background: 'var(--gradient-primary)', color: '#fff', border: 'none', padding: '1.25rem', borderRadius: '1.5rem', fontWeight: 950, fontSize: '1.125rem', cursor: 'pointer', width: '100%', boxShadow: 'var(--shadow-glow)' }}
            >
              {t.loginBtn}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {myBookings.length > 0 ? myBookings.map((b) => (
              <motion.div key={b.id} variants={itemVariants} className="clay-card liquid-glass" style={{ padding: '1.5rem', background: 'var(--surface-container-low)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--surface-container-high)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <i className="ph-fill ph-sparkle" style={{ fontSize: '2rem', color: 'var(--primary)', filter: 'drop-shadow(0 0 8px hsla(var(--p-h), 100%, 50%, 0.3))' }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 950, marginBottom: '0.25rem' }}>{b.service}</h3>
                      <div style={{ background: b.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(255,145,89,0.1)', padding: '0.375rem 0.75rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: b.status === 'completed' ? '#10b981' : 'var(--primary)', boxShadow: `0 0 6px ${b.status === 'completed' ? '#10b981' : 'var(--primary)'}` }}></div>
                        <span style={{ fontSize: '0.625rem', fontWeight: 950, color: b.status === 'completed' ? '#10b981' : 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {b.status?.replace(/_/g, ' ') || 'PENDING'}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>{b.businessName}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', opacity: 0.6 }}>
                         {b.date} • {b.time}
                       </p>
                       <span style={{ fontSize: '0.625rem', fontWeight: 950, color: 'rgba(255,145,89,0.4)', letterSpacing: '0.05em' }}>ID: #{b.id?.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--outline-variant)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <i className="ph-fill ph-map-pin" style={{ color: 'var(--primary)', fontSize: '1rem' }}></i>
                     <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>Verified Status</span>
                  </div>
                  
                  {b.status === 'completed' && !b.hasReviewed ? (
                    <motion.button 
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setReviewModalData(b)}
                      style={{ background: 'var(--gradient-primary)', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 950, cursor: 'pointer', boxShadow: 'var(--shadow-glow-small)' }}
                    >
                      {t.rate}
                    </motion.button>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                       {[1,2,3,4,5].map(i => <i key={i} className="ph ph-star" style={{ fontSize: '0.75rem', color: 'var(--outline)' }}></i>)}
                    </div>
                  )}
                </div>
              </motion.div>
            )) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '6rem 2rem', textAlign: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--surface-container-high)', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ph-fill ph-calendar-x" style={{ fontSize: '3.5rem', color: 'var(--on-surface-variant)', opacity: 0.3 }}></i>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 950, marginBottom: '0.75rem' }}>{t.empty}</h3>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '2.5rem' }}>{t.emptySub}</p>
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/services')}
                  style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface)', border: '1px solid var(--outline)', padding: '1rem 2rem', borderRadius: '1.5rem', fontWeight: 950, cursor: 'pointer' }}
                >
                  {t.explore}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {reviewModalData && (
          <ReviewModal 
            booking={reviewModalData} 
            onClose={() => setReviewModalData(null)} 
            onSubmit={async (b, data) => {
              await addReview(b, data);
              setReviewModalData(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
