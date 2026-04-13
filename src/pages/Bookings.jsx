import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

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
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}></div>
      <div className="animate-slide-up" style={{
        position: 'relative', width: '100%', maxWidth: '480px',
        background: 'var(--surface)', borderRadius: '24px 24px 0 0',
        padding: '1.5rem 1.25rem 2rem'
      }}>
        <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: 'var(--outline-variant)', margin: '0 auto 1.5rem' }}></div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
          Rate Service
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>
          {booking.service || 'Service Booking'} from {booking.businessName}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}>
              <i className={star <= rating ? "ph-fill ph-star" : "ph ph-star"} 
                 style={{ fontSize: '2.5rem', color: star <= rating ? '#eab308' : 'var(--outline-variant)', transition: 'color 0.2s' }}></i>
            </button>
          ))}
        </div>

        <textarea 
          placeholder="Write a comment about your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          style={{
            width: '100%', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)',
            borderRadius: '12px', padding: '1rem', color: 'var(--on-surface)', fontFamily: 'var(--font-body)',
            fontSize: '0.875rem', marginBottom: '1.5rem', resize: 'none'
          }}
        />

        <button 
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          style={{
            width: '100%', padding: '0.875rem', borderRadius: '16px',
            background: rating > 0 ? 'var(--gradient-primary)' : 'var(--surface-container-high)',
            color: rating > 0 ? 'var(--on-primary)' : 'var(--on-surface-variant)',
            border: 'none', fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 800,
            cursor: rating > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s'
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
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
      const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt || 0).getTime());
      const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt || 0).getTime());
      return dateB - dateA;
    });
  }, [bookings, currentUser]);

  const handleReviewSubmit = async (booking, reviewData) => {
    if (addReview) {
      await addReview(booking, reviewData);
    } else {
      console.warn("addReview function missing in context");
    }
  };

  const t = {
    en: { title: 'Bookings', login: 'Login Required', loginSub: 'Sign in to view your bookings', loginBtn: 'Login / Sign Up', empty: 'No bookings yet', rate: 'Rate Service' },
    hi: { title: 'बुकिंग्स', login: 'लॉगिन करें', loginSub: 'अपनी बुकिंग देखने के लिए साइन इन करें', loginBtn: 'लॉगिन / साइन अप', empty: 'अभी तक कोई बुकिंग नहीं', rate: 'रेटिंग दें' }
  }[lang] || { title: 'Bookings', login: 'Login Required', loginSub: 'Sign in', loginBtn: 'Login', empty: 'No bookings', rate: 'Rate Service' };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '90px', color: 'var(--on-surface)' }}>
      {/* Sticky Header */}
      <header className="liquid-glass" style={{ position: 'sticky', top: 0, zIndex: 10, padding: '1rem 1.25rem', borderBottom: '1px solid var(--liquid-border)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
          {t.title}
        </h1>
      </header>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.25rem' }}>
        {!currentUser ? (
          <div className="clay-card animate-fade-up-plus" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <i className="ph-fill ph-lock-key" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t.login}</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>{t.loginSub}</p>
            <button 
              onClick={() => navigate('/login')}
              style={{ background: 'var(--gradient-primary)', color: 'var(--on-primary)', border: 'none', padding: '0.875rem 1.5rem', borderRadius: '1rem', fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer', width: '100%' }}
            >
              {t.loginBtn}
            </button>
          </div>
        ) : (
          <div className="animate-fade-up-plus delay-1">
            {myBookings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {myBookings.map((b, i) => (
                        <div key={b.id || i} className="clay-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <i className="ph-fill ph-calendar-check" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {b.service || 'Service Booking'}
                                  </p>
                                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                                      {b.businessName}
                                  </p>
                                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>
                                      <i className="ph ph-clock" style={{ verticalAlign: 'middle', marginRight: '0.25rem' }}></i>
                                      {b.date} • {b.time}
                                  </p>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--outline-variant)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6875rem', fontWeight: 800, color: b.status === 'sent_to_whatsapp' || b.status === 'completed' ? '#059669' : 'var(--primary)', background: b.status === 'sent_to_whatsapp' || b.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'var(--primary-container)', padding: '0.375rem 0.625rem', borderRadius: '999px', textTransform: 'uppercase' }}>
                                  {b.status?.replace(/_/g, ' ') || 'Pending'}
                              </span>
                              
                              {b.status === 'completed' && !b.hasReviewed && (
                                <button 
                                  onClick={() => setReviewModalData(b)}
                                  style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  {t.rate}
                                </button>
                              )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="clay-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', opacity: 0.8 }}>
                    <i className="ph-fill ph-calendar-blank" style={{ fontSize: '3rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}></i>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800 }}>{t.empty}</p>
                </div>
            )}
          </div>
        )}
      </div>

      {reviewModalData && (
        <ReviewModal 
          booking={reviewModalData} 
          onClose={() => setReviewModalData(null)} 
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
