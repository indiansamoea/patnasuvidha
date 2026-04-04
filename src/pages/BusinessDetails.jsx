import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getCategoryById } from '../utils/categories';
import BookingModal from '../components/BookingModal';

export default function BusinessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBusinessById, isFavorite, toggleFavorite, reviews, updateBusiness } = useAppContext();
  const biz = getBusinessById(id);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '', userName: '' });
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);

  if (!biz) return (
    <div style={{ background: 'transparent', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--on-surface-variant)', fontFamily: "'Manrope'" }}>Service not found</p>
    </div>
  );

  const cat = getCategoryById(biz.category);
  const fav = isFavorite(biz.id);
  // Merge static reviews with any submitted reviews
  const bizReviews = [...(biz.userReviews || []), ...reviews.slice(0, 3)];

  const stars = (rating, interactive=false, onSelect=null) => {
    const full = Math.floor(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} onClick={() => interactive && onSelect(i+1)} className={`ph-fill ph-star`} style={{ fontSize: '1rem', color: i < full ? '#fbb423' : 'var(--outline-variant)', cursor: interactive ? 'pointer' : 'default', transition: 'color 150ms' }}></i>
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
    await updateBusiness(biz.id, { userReviews: updatedReviews, rating: newRating.toFixed(1), reviews: biz.reviews + 1 });
    setShowReviewForm(false);
    setReviewForm({ rating: 5, text: '', userName: '' });
  };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '6rem', color: 'var(--on-surface)' }}>
      
      {/* Hero Image */}
      <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
        <img src={biz.image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface) 0%, transparent 60%)' }}></div>
        {/* Top Actions */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
          <button onClick={() => navigate(-1)} style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
          }}>
            <i className="ph-bold ph-arrow-left" style={{ color: '#fff', fontSize: '1.125rem' }}></i>
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => {
              if (!currentUser) return navigate('/login');
              toggleFavorite(biz.id);
            }} style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
            }}>
              <i className={fav ? 'ph-fill ph-heart' : 'ph-bold ph-heart'} style={{ color: fav ? '#f87171' : '#fff', fontSize: '1.125rem' }}></i>
            </button>
            <button onClick={() => {
              if (navigator.share) {
                navigator.share({ title: biz.name, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Profile link copied to clipboard!');
              }
            }} style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
            }}>
              <i className="ph-bold ph-share-network" style={{ color: '#fff', fontSize: '1.125rem' }}></i>
            </button>
          </div>
        </div>
        {/* Badges on Image */}
        <div style={{ position: 'absolute', bottom: '1rem', left: '1.25rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap', maxWidth: '80%' }}>
          {biz.isVerified && (
            <span style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 700, background: 'rgba(2, 132, 199, 0.8)', color: '#fff', padding: '0.25rem 0.625rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.25rem', backdropFilter: 'blur(10px)' }}>
              <i className="ph-fill ph-seal-check" style={{ fontSize: '0.75rem' }}></i>Verified
            </span>
          )}
          {biz.isPromoted && (
            <span style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 700, background: 'rgba(255, 145, 89, 0.8)', color: '#fff', padding: '0.25rem 0.625rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.25rem', backdropFilter: 'blur(10px)' }}>
              <i className="ph-fill ph-rocket-launch" style={{ fontSize: '0.75rem' }}></i>Promoted
            </span>
          )}
          {biz.isSponsored && (
            <span style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 700, background: 'var(--primary)', color: '#fff', padding: '0.25rem 0.625rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.25rem', backdropFilter: 'blur(10px)' }}>
              <i className="ph-fill ph-megaphone" style={{ fontSize: '0.75rem' }}></i>Sponsored
            </span>
          )}
          {biz.isRecommended && (
            <span style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 700, background: 'rgba(34, 211, 238, 0.8)', color: '#000', padding: '0.25rem 0.625rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.25rem', backdropFilter: 'blur(10px)' }}>
              <i className="ph-fill ph-sketch-logo" style={{ fontSize: '0.75rem' }}></i>Recommended
            </span>
          )}
          <span style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 700, background: biz.isOpen ? 'rgba(19, 136, 8, 0.8)' : 'rgba(220, 53, 69, 0.8)', color: '#fff', padding: '0.25rem 0.625rem', borderRadius: '999px', backdropFilter: 'blur(10px)' }}>
            {biz.isOpen ? '● Open Now' : '● Closed'}
          </span>
          {biz.promoMessage && (
            <div style={{ width: '100%', marginTop: '0.5rem' }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(0,0,0,0.6)', padding: '0.375rem 0.75rem', borderRadius: '0.75rem', backdropFilter: 'blur(5px)', border: '1px solid var(--primary)' }}>
                ✨ {biz.promoMessage}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* Business Info */}
        <section style={{ paddingTop: '0.5rem', marginBottom: '1.25rem' }}>
          <span style={{ fontFamily: "'Manrope'", fontSize: '0.5625rem', fontWeight: 700, color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.125rem 0.625rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {cat?.name}
          </span>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.625rem', fontWeight: 800, color: 'var(--on-surface)', marginTop: '0.375rem', marginBottom: '0.375rem', lineHeight: 1.15 }}>
            {biz.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {stars(biz.rating)}
              <span style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#ffc562', marginLeft: '0.25rem' }}>{biz.rating}</span>
            </div>
            <span style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>({biz.reviews} reviews)</span>
          </div>
          <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <i className="ph-bold ph-map-pin" style={{ color: 'var(--primary)' }}></i>{biz.address}
            <span style={{ color: 'var(--outline-variant)' }}>•</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{biz.distance || '1.1 km'}</span>
          </p>
        </section>

        {/* Multi-Image Gallery */}
        {biz.gallery && biz.gallery.length > 1 && (
          <section style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
            {biz.gallery.map((img, i) => (
              <img key={i} src={img} alt={`Gallery ${i}`} style={{ width: '120px', height: '90px', borderRadius: '0.75rem', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--outline-variant)' }} />
            ))}
          </section>
        )}

        {/* Quick Actions */}
        <section style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
          {[
            { icon: 'ph-phone', label: 'Call', color: '#138808', href: `tel:${biz.phone}` },
            { icon: 'ph-calendar-plus', label: 'Book Now', color: '#ff9159', action: () => setIsBookingModalOpen(true) },
            { icon: 'ph-map-trifold', label: 'Directions', color: '#0284c7', href: `https://maps.google.com/?q=${encodeURIComponent(biz.address)}` },
            { icon: 'ph-share-network', label: 'Share', color: '#8b5cf6', action: () => {
              if (navigator.share) {
                navigator.share({ title: biz.name, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Profile link copied to clipboard!');
              }
            } },
          ].map((action, i) => {
            const Wrapper = action.action ? 'button' : 'a';
            return (
            <Wrapper key={i} href={action.href || undefined} target={action.href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" onClick={action.action} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem',
              textDecoration: 'none', flex: 1, background: 'none', border: 'none', cursor: 'pointer'
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 150ms, box-shadow 150ms', boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <i className={`ph-fill ${action.icon}`} style={{ color: action.color, fontSize: '1.25rem' }}></i>
              </div>
              <span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 600, color: 'var(--on-surface)' }}>{action.label}</span>
            </Wrapper>
            );
          })}
        </section>

        {/* dynamic fields (Specific Details)  */}
        {(biz.specialization || biz.facilities || biz.visitingCharge || biz.emergency || biz.subjects || biz.mode || biz.gender || (biz.customFields && biz.customFields.length > 0)) && (
          <section style={{ background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', borderRadius: '1.25rem', padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.875rem' }}>{cat?.name} Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.75rem' }}>
              {biz.specialization && <div style={{ minWidth: 0, wordBreak: 'break-word' }}><p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Specialization</p><p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface)', fontWeight: 700 }}>{biz.specialization}</p></div>}
              {biz.facilities && <div style={{ minWidth: 0, wordBreak: 'break-word' }}><p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Facilities</p><p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface)', fontWeight: 700 }}>{biz.facilities}</p></div>}
              {biz.visitingCharge && <div style={{ minWidth: 0, wordBreak: 'break-word' }}><p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Visiting Charge</p><p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>{biz.visitingCharge}</p></div>}
              {biz.emergency && <div style={{ minWidth: 0, wordBreak: 'break-word' }}><p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>24/7 Emergency</p><p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: biz.emergency === 'Yes' ? '#138808' : '#dc3545', fontWeight: 700 }}>{biz.emergency}</p></div>}
              {biz.subjects && <div style={{ minWidth: 0, wordBreak: 'break-word' }}><p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Subjects</p><p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface)', fontWeight: 700 }}>{biz.subjects}</p></div>}
              {biz.mode && <div style={{ minWidth: 0, wordBreak: 'break-word' }}><p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Teaching Mode</p><p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface)', fontWeight: 700 }}>{biz.mode}</p></div>}
              {biz.gender && <div style={{ minWidth: 0, wordBreak: 'break-word' }}><p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Salon For</p><p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface)', fontWeight: 700 }}>{biz.gender}</p></div>}
              
              {/* Render dynamic custom fields */}
              {(biz.customFields || []).map((cf, idx) => cf.key.trim() && (
                <div key={`cf-${idx}`} style={{ minWidth: 0, wordBreak: 'break-word' }}><p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{cf.key}</p><p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface)', fontWeight: 700 }}>{cf.value || '-'}</p></div>
              ))}
            </div>
          </section>
        )}

        {/* About */}
        <section style={{ background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', borderRadius: '1.25rem', padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.625rem' }}>About</h3>
          <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{biz.description}</p>
          {biz.hours && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem', background: 'var(--surface-container-high)', borderRadius: '0.75rem' }}>
              <i className="ph-bold ph-clock" style={{ color: 'var(--primary)', fontSize: '1rem' }}></i>
              <div>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 700, color: 'var(--on-surface)' }}>Operating Hours</p>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>{biz.hours}</p>
              </div>
            </div>
          )}
        </section>

        {/* Services & Pricing */}
        {biz.services && biz.services.length > 0 && (
          <section style={{ background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', borderRadius: '1.25rem', padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.875rem' }}>Services & Pricing</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {biz.services.map((svc, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem', background: 'var(--surface-container-high)', borderRadius: '0.875rem',
                  border: '1px solid var(--outline-variant)'
                }}>
                  <div>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>{svc.name}</p>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)' }}>₹{typeof svc.price === 'number' ? svc.price.toLocaleString() : svc.price}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedServiceIndex(i); setIsBookingModalOpen(true); }} style={{
                    fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 700,
                    background: 'var(--gradient-primary)', color: 'var(--on-primary)',
                    padding: '0.5rem 1rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
                    transition: 'transform 150ms, box-shadow 150ms', boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >Book Now</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section style={{ background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', borderRadius: '1.25rem', padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>Reviews</h3>
            <button onClick={() => setShowReviewForm(!showReviewForm)} style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-container)', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--primary)', cursor: 'pointer' }}>
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={submitReview} style={{ background: 'var(--surface-container-high)', padding: '1rem', borderRadius: '1rem', marginBottom: '1rem', border: '1px solid var(--outline-variant)' }}>
               <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.25rem' }}>
                 {stars(reviewForm.rating, true, (r) => setReviewForm(prev => ({ ...prev, rating: r })))}
               </div>
               <input type="text" placeholder="Your Name" value={reviewForm.userName} onChange={e => setReviewForm(prev => ({ ...prev, userName: e.target.value }))} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)', padding: '0.625rem', borderRadius: '0.5rem', marginBottom: '0.5rem', outline: 'none', fontFamily: "'Manrope'", fontSize: '0.8125rem' }} />
               <textarea placeholder="Write your experience..." rows={3} value={reviewForm.text} onChange={e => setReviewForm(prev => ({ ...prev, text: e.target.value }))} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)', padding: '0.625rem', borderRadius: '0.5rem', marginBottom: '0.5rem', outline: 'none', fontFamily: "'Manrope'", fontSize: '0.8125rem' }} />
               <button type="submit" style={{ width: '100%', background: 'var(--primary)', color: 'var(--on-primary)', padding: '0.625rem', borderRadius: '0.5rem', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: "'Manrope'", fontSize: '0.8125rem' }}>Submit Review</button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {bizReviews.length === 0 ? (
              <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>No reviews yet.</p>
            ) : bizReviews.map(review => (
              <div key={review.id} style={{ padding: '0.875rem', background: 'var(--surface-container-high)', borderRadius: '0.875rem', border: '1px solid var(--outline-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-container-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800 }}>
                    {review.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', fontWeight: 700, color: 'var(--on-surface)' }}>{review.userName}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <div style={{ display: 'flex', gap: '0.125rem' }}>{stars(review.rating)}</div>
                      <span style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', color: 'var(--on-surface-variant)' }}>{review.date}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{review.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Price Range & CTA */}
        <div style={{ padding: '0.5rem 0 1rem' }}>
          <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)', textAlign: 'center', marginBottom: '0.75rem' }}>
            Price range: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{biz.priceRange}</span>
          </p>
          <button onClick={() => setIsBookingModalOpen(true)} style={{
            width: '100%', fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 700,
            background: 'var(--gradient-primary)', color: 'var(--on-primary)',
            padding: '1rem', borderRadius: '1rem', border: 'none', cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            transition: 'transform 150ms, box-shadow 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          >
            <i className="ph-bold ph-calendar-check" style={{ marginRight: '0.5rem' }}></i>Book a Service
          </button>
        </div>

        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
          business={biz}
          selectedServiceIndex={selectedServiceIndex}
        />
      </div>
    </div>
  );
}
