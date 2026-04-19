import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { getCategoryById } from '../utils/categories';
import BookingModal from '../components/BookingModal';

export default function BusinessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBusinessById, isFavorite, toggleFavorite, reviews, updateBusiness, currentUser, lang } = useAppContext();
  const biz = getBusinessById(id);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '', userName: '' });
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);

  const isHi = lang === 'hi';

  if (!biz) return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="spinner" />
    </div>
  );

  const cat = getCategoryById(biz.category);
  const fav = isFavorite(biz.id);
  const bizReviews = [...(biz.userReviews || []), ...reviews.slice(0, 3)];

  const stars = (rating, interactive=false, onSelect=null) => {
    const full = Math.floor(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} onClick={() => interactive && onSelect(i+1)} className="ph-fill ph-star" 
         style={{ fontSize: '1rem', color: i < full ? '#FFD700' : 'var(--outline-variant)', cursor: interactive ? 'pointer' : 'default', transition: 'color 150ms' }}></i>
    ));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.userName || !reviewForm.text) return;
    const newRev = {
      id: Date.now().toString(),
      userName: reviewForm.userName,
      rating: reviewForm.rating,
      text: reviewForm.text,
      date: new Date().toLocaleDateString('en-GB'),
      avatar: reviewForm.userName.charAt(0).toUpperCase()
    };
    const updatedReviews = [newRev, ...(biz.userReviews || [])];
    const newRating = ((biz.rating * biz.reviews) + reviewForm.rating) / (biz.reviews + 1);
    await updateBusiness(biz.id, { userReviews: updatedReviews, rating: parseFloat(newRating.toFixed(1)), reviews: biz.reviews + 1 });
    setShowReviewForm(false);
    setReviewForm({ rating: 5, text: '', userName: '' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'var(--surface)', minHeight: '100vh', paddingBottom: '10rem', color: 'var(--on-surface)' }}>
      
      {/* ─── Immersive Cinema Hero ─── */}
      <div style={{ position: 'relative', height: '340px', overflow: 'hidden' }}>
        <motion.img 
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }}
          src={biz.image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface) 0%, transparent 60%, rgba(0,0,0,0.3) 100%)' }}></div>
        
        {/* Top Glass Actions */}
        <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', right: '1.25rem', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
          <motion.button 
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} 
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <i className="ph-bold ph-arrow-left" style={{ color: '#fff', fontSize: '1.25rem' }}></i>
          </motion.button>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={() => { if (!currentUser) return navigate('/login'); toggleFavorite(biz.id); }} 
              style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <i className={fav ? 'ph-fill ph-heart' : 'ph-bold ph-heart'} style={{ color: fav ? '#f87171' : '#fff', fontSize: '1.25rem' }}></i>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={() => {
                if (navigator.share) navigator.share({ title: biz.name, url: window.location.href });
                else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
              }} 
              style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <i className="ph-bold ph-share-network" style={{ color: '#fff', fontSize: '1.25rem' }}></i>
            </motion.button>
          </div>
        </div>

        {/* Floating Trust Badges */}
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxWidth: '90%' }}>
          {biz.isVerified && (
            <motion.span initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="liquid-glass" style={{ fontSize: '0.625rem', fontWeight: 900, color: '#fff', padding: '0.5rem 0.875rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.375rem', border: '1px solid rgba(255,255,255,0.2)' }}>
              <i className="ph-fill ph-seal-check" style={{ fontSize: '0.875rem', color: '#10b981' }}></i>
              PATNA VERIFIED
            </motion.span>
          )}
          {biz.isPromoted && (
            <motion.span initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="liquid-glass" style={{ fontSize: '0.625rem', fontWeight: 900, color: '#fff', padding: '0.5rem 0.875rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.375rem', border: '1px solid rgba(255,255,255,0.2)' }}>
              <i className="ph-fill ph-rocket-launch" style={{ fontSize: '0.875rem', color: 'var(--primary)' }}></i>
              FEATURED
            </motion.span>
          )}
          <span style={{ fontSize: '0.625rem', fontWeight: 950, background: biz.isOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(220, 53, 69, 0.2)', color: biz.isOpen ? '#34d399' : '#f87171', padding: '0.5rem 0.875rem', borderRadius: '999px', backdropFilter: 'blur(10px)', border: `1px solid ${biz.isOpen ? '#34d39940' : '#f8717140'}` }}>
            {biz.isOpen ? '● LIVE NOW' : '● CLOSED'}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* Core Info Section */}
        <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ paddingTop: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
             <span style={{ fontSize: '0.625rem', fontWeight: 950, color: 'var(--primary)', border: '1.5px solid var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cat?.name}</span>
             <div style={{ flex: 1, height: '1.5px', background: 'var(--outline-variant)', opacity: 0.2 }} />
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '2.25rem', fontWeight: 950, color: 'var(--on-surface)', marginBottom: '0.75rem', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {biz.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div className="liquid-glass" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.75rem', border: 'none' }}>
              <i className="ph-fill ph-star" style={{ color: '#FFD700', fontSize: '1rem' }} />
              <span style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--on-surface)' }}>{biz.rating}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 700 }}>({biz.reviews})</span>
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <i className="ph-bold ph-map-pin" style={{ color: 'var(--primary)', fontSize: '1.125rem' }}></i>
              {biz.address}
            </p>
          </div>
          
          {biz.promoMessage && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="clay-card" style={{ padding: '1rem 1.25rem', background: 'rgba(255,145,89,0.1)', border: '1px solid hsla(var(--p-h), 100%, 50%, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ fontSize: '1.5rem' }}>✨</div>
               <p style={{ fontFamily: "var(--font-display)", fontSize: '0.9375rem', fontWeight: 900, color: 'var(--primary)' }}>{biz.promoMessage}</p>
            </motion.div>
          )}
        </motion.section>

        {/* Tactile Details Grid */}
        <section style={{ marginBottom: '2.5rem' }}>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Specialization', val: biz.specialization, icon: 'ph-student' },
                { label: 'Experience', val: '5+ Years', icon: 'ph-medal' },
                { label: 'Booking Charge', val: biz.visitingCharge || '₹0', icon: 'ph-wallet', color: 'var(--primary)' },
                { label: 'Emergency', val: biz.emergency || 'No', icon: 'ph-first-aid' }
              ].map((item, i) => item.val && (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }} className="clay-card" style={{ padding: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <i className={`ph-fill ${item.icon}`} style={{ color: item.color || 'var(--secondary)', opacity: 0.7 }} />
                      <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>{item.label}</span>
                   </div>
                   <p style={{ fontSize: '0.875rem', fontWeight: 900, color: item.color || 'inherit' }}>{item.val}</p>
                </motion.div>
              ))}
           </div>
        </section>

        {/* About Section */}
        <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="clay-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: 'none' }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: '1.125rem', fontWeight: 950, marginBottom: '1rem' }}>Expert Biography</h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--on-surface-variant)', lineHeight: 1.7, fontWeight: 600 }}>{biz.description}</p>
          {biz.hours && (
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--surface-container-high)', borderRadius: '1.25rem' }}>
              <i className="ph-fill ph-clock-countdown" style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
              <p style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Available: <span style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>{biz.hours}</span></p>
            </div>
          )}
        </motion.section>

        {/* Gallery Scroll */}
        {biz.gallery && biz.gallery.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: '0.875rem', fontWeight: 950, marginBottom: '1rem', textTransform: 'uppercase', opacity: 0.6 }}>Work Showcase</h3>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }} className="hide-scrollbar">
              {biz.gallery.map((img, i) => (
                <motion.img 
                  key={i} whileHover={{ scale: 1.05 }}
                  src={img} alt={`Work ${i}`} 
                  style={{ width: '180px', height: '130px', borderRadius: '1.5rem', objectFit: 'cover', flexShrink: 0, boxShadow: 'var(--shadow-md)' }} 
                />
              ))}
            </div>
          </section>
        )}

        {/* Services / Plans */}
        {biz.services && biz.services.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: '1.25rem', fontWeight: 950, marginBottom: '1.5rem' }}>Service Menu</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {biz.services.map((svc, i) => (
                <motion.div key={i} whileHover={{ x: 5 }} className="clay-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 900, fontSize: '1.0625rem' }}>{svc.name}</p>
                    <p style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--primary)' }}>₹{svc.price.toLocaleString()}</p>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => { setSelectedServiceIndex(i); setIsBookingModalOpen(true); }}
                    className="btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem' }}
                  >Book</motion.button>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section Overhaul */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: '1.25rem', fontWeight: 950 }}>Client Love</h3>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowReviewForm(!showReviewForm)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', border: 'none', background: 'var(--primary-container)', color: 'var(--primary)' }}>
              {showReviewForm ? 'Close' : 'Add Review'}
            </motion.button>
          </div>

          <AnimatePresence>
            {showReviewForm && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                onSubmit={submitReview} className="clay-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'var(--surface-container-low)' }}
              >
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.375rem' }}>
                  {stars(reviewForm.rating, true, (r) => setReviewForm(prev => ({ ...prev, rating: r })))}
                </div>
                <input className="input-field" placeholder="Full Name" value={reviewForm.userName} onChange={e => setReviewForm(prev => ({ ...prev, userName: e.target.value }))} style={{ marginBottom: '0.75rem' }} />
                <textarea className="input-field" placeholder="Share your experience with Patna Suvidha..." rows={3} value={reviewForm.text} onChange={e => setReviewForm(prev => ({ ...prev, text: e.target.value }))} style={{ marginBottom: '1rem' }} />
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Post Expert Review</button>
              </motion.form>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bizReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}><p>No reviews yet. Be the first!</p></div>
            ) : bizReviews.map(review => (
              <motion.div key={review.id} className="clay-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--surface-container-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 950, boxShadow: 'var(--shadow-sm)' }}>
                    {review.avatar}
                  </div>
                  <div>
                    <p style={{ fontWeight: 900, fontSize: '0.9375rem' }}>{review.userName}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>{stars(review.rating)}</div>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, opacity: 0.5 }}>{review.date}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>"{review.text}"</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Fixed Quick Action Dock ─── */}
        <div style={{ 
          position: 'fixed', bottom: '2rem', left: '1.5rem', right: '1.5rem', zIndex: 100, 
          display: 'flex', gap: '0.75rem', alignItems: 'center'
        }}>
           <motion.a 
             href={`tel:${biz.phone}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
             style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
           >
              <i className="ph-fill ph-phone" style={{ fontSize: '1.75rem', color: '#10b981' }} />
           </motion.a>
           
           <motion.button 
             onClick={() => setIsBookingModalOpen(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
             className="btn-primary animate-pulse-glow" 
             style={{ flex: 1, padding: '1.25rem', borderRadius: '24px', fontSize: '1.125rem', border: 'none', background: 'var(--gradient-primary)' }}
           >
              Book Specialist
           </motion.button>

           <motion.a 
             href={`https://maps.google.com/?q=${encodeURIComponent(biz.address)}`} target="_blank" rel="noreferrer"
             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
             style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
           >
              <i className="ph-fill ph-map-pin-line" style={{ fontSize: '1.75rem', color: '#06b6d4' }} />
           </motion.a>
        </div>

        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
          business={biz}
          selectedServiceIndex={selectedServiceIndex}
        />
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
