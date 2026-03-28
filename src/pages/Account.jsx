import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getCategoryById } from '../utils/categories';

const FAQS = [
  { q: "How do I add my business?", a: "To add your business, tap on the 'Add Free' button in the center of the bottom navigation bar and fill out your details." },
  { q: "Is listing my business free?", a: "Yes! Basic listings are 100% free. We also offer premium placements for better visibility." },
  { q: "How do I edit my business details?", a: "Please contact support through the Feedback section. Our team will verify and update your information." },
  { q: "How do I report an incorrect listing?", a: "You can send us a message via the 'Send Feedback' button below to report any incorrect data." }
];

const LINKS = [
  {
    href: 'https://properties.patnasuvidha.online',
    icon: 'ph-buildings',
    color: '#059669',
    bg: 'rgba(16,185,129,0.15)',
    shadow: 'rgba(16,185,129,0.2)',
    title: 'Buy/Rent Properties',
    subtitle: 'properties.patnasuvidha.online',
    external: true,
  },
];

export default function Account() {
  const { lang, currentUser, logout, bookings, getFavoriteBusinesses } = useAppContext();
  const navigate = useNavigate();
  const [showFaq, setShowFaq] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const favs = getFavoriteBusinesses();
  
  const myBookings = useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter(b => 
      b.userId === currentUser.uid || 
      (b.customerPhone && currentUser.phoneNumber && b.customerPhone.includes(currentUser.phoneNumber.slice(-10)))
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [bookings, currentUser]);

  const handleFeedback = () => {
    const text = encodeURIComponent("Hello Patna Suvidha team! I have some feedback:\n\n");
    window.open(`https://wa.me/917764812598?text=${text}`, '_blank');
  };

  const t = {
    hi: {
      title: 'मेरा खाता',
      hello: 'नमस्ते',
      login: 'लॉगिन / साइन अप',
      manage: 'अपनी बुकिंग और पसंदीदा प्रबंधित करें',
      continue: 'जारी रखें',
      bookings: 'मेरी बुकिंग',
      wishlist: 'मेरी पसंद',
      noBookings: 'अभी तक कोई बुकिंग नहीं',
      noFavs: 'अभी तक कोई पसंदीदा नहीं',
      network: 'हमारा नेटवर्क',
      contact: 'संपर्क करें',
      help: 'फीडबैक और मदद',
      logout: 'लॉगआउट',
    },
    en: {
      title: 'Account',
      hello: 'Hello',
      login: 'Login / Sign Up',
      manage: 'Manage your bookings & favorites',
      continue: 'Continue',
      bookings: 'My Bookings',
      wishlist: 'My Wishlist',
      noBookings: 'No bookings yet',
      noFavs: 'No favorites yet',
      network: 'Our Network',
      contact: 'Get in Touch',
      help: 'Feedback & Help',
      logout: 'Logout',
    }
  }[lang] || { en: {} };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '7rem', color: 'var(--on-surface)' }}>

      {/* Sticky Header */}
      <header className="liquid-glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <i className="ph-fill ph-user-circle" style={{ color: 'var(--primary)', fontSize: '1.5rem' }}></i>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            {t.title}
          </h1>
        </div>
      </header>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.25rem' }}>

        {/* User Profile / Login Card (Personalized Greeting) */}
        <div className="clay-card animate-fade-up-plus" style={{ marginBottom: '1.75rem', padding: '1.5rem', background: 'var(--gradient-subtle)', border: '1px solid var(--primary)' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className="ph-fill ph-user" style={{ color: 'var(--primary)', fontSize: '1.75rem' }}></i>
                  )}
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '0.125rem' }}>
                    {t.hello}, {currentUser.displayName?.split(' ')[0] || 'User'}! 👋
                  </h3>
                  <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 700 }}>
                    {currentUser.email || currentUser.phoneNumber || 'Patna Suvidha Member'}
                  </p>
                </div>
              </div>
              <button 
                onClick={logout}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
                  {t.login}
                </h3>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 700 }}>
                  {t.manage}
                </p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.875rem', fontSize: '0.875rem', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(255,145,89,0.3)' }}
              >
                {t.continue}
              </button>
            </div>
          )}
        </div>

        {/* My Bookings History */}
        {currentUser && (
          <section className="animate-fade-up-plus delay-1" style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t.bookings}
                </h2>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-container)', padding: '0.25rem 0.625rem', borderRadius: '999px' }}>
                    {myBookings.length} Total
                </span>
            </div>
            
            {myBookings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {myBookings.map((b, i) => (
                        <div key={b.id || i} className="liquid-glass" style={{ padding: '1rem', borderRadius: '1.25rem', display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="ph-fill ph-calendar-check" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}></i>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9375rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {b.service || 'Service Booking'}
                                </p>
                                <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>
                                    {b.businessName} • {b.date}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 800, color: b.status === 'sent_to_whatsapp' ? '#059669' : 'var(--primary)', background: b.status === 'sent_to_whatsapp' ? 'rgba(16,185,129,0.1)' : 'var(--primary-container)', padding: '0.25rem 0.5rem', borderRadius: '999px', textTransform: 'uppercase' }}>
                                    {b.status?.replace(/_/g, ' ') || 'Pending'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="clay-card" style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                    <i className="ph ph-calendar-blank" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', fontWeight: 700 }}>{t.noBookings}</p>
                </div>
            )}
          </section>
        )}

        {/* My Wishlist Preview */}
        {currentUser && (
            <section className="animate-fade-up-plus delay-2" style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t.wishlist}
                    </h2>
                    <button onClick={() => navigate('/favorites')} style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        View All →
                    </button>
                </div>

                {favs.length > 0 ? (
                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
                        {favs.slice(0, 5).map((f, i) => {
                             const cat = getCategoryById(f.category);
                             return (
                                <div key={f.id || i} onClick={() => navigate(`/business/${f.id}`)} className="clay-card" style={{ flexShrink: 0, width: '140px', padding: '0.75rem', cursor: 'pointer' }}>
                                    <div style={{ width: '100%', height: '80px', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.625rem' }}>
                                        <img src={f.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.8125rem', fontWeight: 800, color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.125rem' }}>
                                        {f.name}
                                    </p>
                                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 700, color: cat?.color || 'var(--primary)' }}>
                                        {cat?.name}
                                    </p>
                                </div>
                             )
                        })}
                    </div>
                ) : (
                    <div className="clay-card" style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                        <i className="ph ph-heart-break" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                        <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', fontWeight: 700 }}>{t.noFavs}</p>
                    </div>
                )}
            </section>
        )}

        {/* Our Network */}
        <section className="animate-fade-up-plus delay-3" style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', paddingLeft: '0.25rem' }}>
            {t.network}
          </h2>
          {LINKS.map((link, i) => (
            <a
              key={i}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="clay-card"
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.125rem 1.25rem', marginBottom: '0.75rem', textDecoration: 'none', transition: 'transform 150ms' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: link.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${link.shadow}`, flexShrink: 0 }}>
                <i className={`ph-fill ${link.icon}`} style={{ color: link.color, fontSize: '1.375rem' }}></i>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9375rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.125rem' }}>{link.title}</p>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.subtitle}</p>
              </div>
              <i className="ph-bold ph-arrow-up-right" style={{ color: 'var(--on-surface-variant)', fontSize: '1rem', flexShrink: 0, opacity: 0.6 }}></i>
            </a>
          ))}
        </section>

        {/* Contact */}
        <section className="animate-fade-up-plus delay-4" style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', paddingLeft: '0.25rem' }}>
            {t.contact}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <a href="tel:+917764812598" className="clay-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem', padding: '1.25rem 1rem', textDecoration: 'none', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ph-fill ph-phone" style={{ color: 'var(--primary)', fontSize: '1.375rem' }}></i>
              </div>
              <div>
                <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.125rem' }}>Call Us</p>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>+91 77648 12598</p>
              </div>
            </a>
            <a href="mailto:patnasuvidha@gmail.com" className="clay-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem', padding: '1.25rem 1rem', textDecoration: 'none', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(34,211,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ph-fill ph-envelope" style={{ color: '#0284c7', fontSize: '1.375rem' }}></i>
              </div>
              <div>
                <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.125rem' }}>Email</p>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>patnasuvidha@<br />gmail.com</p>
              </div>
            </a>
          </div>
        </section>

        {/* Feedback & Help */}
        <section className="animate-fade-up-plus delay-5">
          <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', paddingLeft: '0.25rem' }}>
            {t.help}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { icon: 'ph-chat-centered-text', color: 'var(--primary)', bg: 'var(--primary-container)', label: 'Send Feedback', sub: 'Via WhatsApp', action: handleFeedback },
              { icon: 'ph-question', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', label: 'Help Center', sub: 'FAQs & support', action: () => setShowFaq(!showFaq) },
            ].map((item, i) => (
              <button key={i} onClick={item.action} className="clay-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem', padding: '1.25rem 1rem', cursor: 'pointer', textAlign: 'center', border: 'none' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ph-fill ${item.icon}`} style={{ color: item.color, fontSize: '1.375rem' }}></i>
                </div>
                <div>
                  <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.125rem' }}>{item.label}</p>
                  <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{item.sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* FAQ Expandable Area */}
          {showFaq && (
            <div className="animate-fade-up-plus delay-1" style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>Frequently Asked Questions</h3>
              {FAQS.map((faq, idx) => (
                <div key={idx} className="clay-card" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                    <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)', paddingRight: '1rem' }}>{faq.q}</span>
                        <i className={`ph-bold ph-caret-${openFaq === idx ? 'up' : 'down'}`} style={{ color: 'var(--primary)', flexShrink: 0 }}></i>
                    </button>
                    {openFaq === idx && (
                        <div className="animate-fade-in" style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--outline-variant)' }}>
                            <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, paddingTop: '0.75rem' }}>{faq.a}</p>
                        </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '2.5rem 0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--surface-container-high)', borderRadius: '999px', padding: '0.5rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--outline-variant)' }}>
            <span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 700, color: 'var(--on-surface)' }}>
              Made with <i className="ph-fill ph-heart" style={{ color: '#ef4444', verticalAlign: 'middle', margin: '0 2px' }}></i> by
            </span>
            <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', textDecoration: 'none', letterSpacing: '0.05em' }}>
              PATNA SUVIDHA TEAM
            </span>
          </div>
          <p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 600, color: 'var(--on-surface-variant)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            v3.5 · Patna Suvidha © 2024
          </p>
        </div>

      </div>
    </div>
  );
}
