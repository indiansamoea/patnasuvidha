import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getCategoryById, CATEGORIES } from '../utils/categories';
import WeatherWidget from '../components/WeatherWidget';
import QuoteWidget from '../components/QuoteWidget';
import StoriesFeed from '../components/StoriesFeed';

const T = {
  en: {
    hero: 'Apki sari Jarurtoon\nka ek Samadhan.',
    heroSub: '🏙️ पटना की हर जरूरत · हर सर्विस · एक जगह',
    heroBadge: 'Trusted by Patna',
    searchPh: 'Search anything in Patna...',
    trending: 'TRENDING',
    categories: 'Service Categories',
    viewAll: 'View All →',
    hotDeals: '🔥 Exclusives',
    topRated: 'Top Rated Near You',
    featured: '⭐ Featured',
    suggested: '💡 Suggested for You',
    promoted: '🚀 Promoted Partners',
    recommended: '💎 Hand-Picked for You',
    sponsored: 'Sponsored',
    recent: 'Recently Listed',
  },
  hi: {
    hero: 'आपकी सारी जरूरतों\nका एक समाधान।',
    heroSub: '🏙️ पटना की हर जरूरत · हर सर्विस · एक जगह',
    heroBadge: 'पटना का भरोसा',
    searchPh: 'पटना में कुछ भी खोजें...',
    trending: 'ट्रेंडिंग',
    categories: 'सेवा कैटेगरी',
    viewAll: 'सब देखीं →',
    hotDeals: '🔥 खास ऑफर',
    topRated: 'नजदीक के बेस्ट',
    featured: '⭐ फीचर्ड',
    suggested: '💡 आपके लिए सुझाव',
    promoted: '🚀 प्रोमोटेड पार्टनर्स',
    recommended: '💎 आपके लिए विशेष',
    sponsored: 'प्रायोजित',
    recent: 'नया लिस्टिंग',
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { 
    theme, toggleTheme, lang, toggleLang, 
    searchQuery, setSearchQuery, 
    trendingSearches, settings,
    serviceOffers = [],
    categories = []
  } = useAppContext();
  
  const [showAllCats, setShowAllCats] = useState(false);

  const t = T[lang] || T.en;
  const isHi = lang === 'hi';
  const [isListening, setIsListening] = useState(false);
  
  const activeOffers = serviceOffers.filter(o => o.active);

  // Speech Recognition Logic
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice Search not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      navigate('/explore');
    };

    recognition.start();
  };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', color: 'var(--on-surface)' }}>

      {/* Top Bar (Liquid Glass) */}
      <header className="liquid-glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--liquid-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.jpeg" alt="Patna Suvidha" className="clay-btn" style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--primary-container)' }} />
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>Patna Suvidha</h1>
              <p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.125rem' }}>Thee Aaradh</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={toggleTheme} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--outline-variant)' }}>
              <i className={theme === 'dark' ? "ph-fill ph-sun" : "ph-fill ph-moon"} style={{ fontSize: '1.25rem', color: 'var(--on-surface)' }}></i>
            </button>
            <button onClick={toggleLang} style={{
              fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 800,
              background: 'var(--primary-container)', color: 'var(--on-primary-container)',
              padding: '0.375rem 0.75rem', borderRadius: '999px', border: '1px solid var(--outline-variant)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
            }}>
              {lang === 'hi' ? '🇮🇳 हिंदी' : '🇮🇳 EN'}
            </button>
          </div>
        </div>
      </header>

      {/* Single Liquid Blob */}
      <div className="liquid-blob" style={{ top: '10%', right: '-15%', width: '350px', height: '350px', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', opacity: 0.08 }}></div>

      {/* Stories Feed */}
      <StoriesFeed />

      <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 2 }}>

        {/* Featured Message */}
        {settings.featuredMessageEnabled && settings.featuredMessage && (
           <div className="animate-fade-up-plus delay-1" style={{ margin: '1rem 1.25rem 0', padding: '1rem', background: 'var(--gradient-subtle)', borderRadius: '1rem', border: '1px solid var(--primary)' }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9375rem', fontWeight: 800, color: 'var(--primary)', textAlign: 'center' }}>
              {settings.featuredMessage}
            </p>
          </div>
        )}

         {/* Hero Section */}
        <section className="animate-fade-up-plus delay-1" style={{ padding: '2rem 1.25rem 1.5rem' }}>
          <div className="animate-fade-up-plus" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'var(--primary-container)', border: '1px solid var(--outline-variant)', borderRadius: '999px', padding: '0.25rem 0.75rem', marginBottom: '0.875rem' }}>
            <i className="ph-fill ph-seal-check" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}></i>
            <span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.03em' }}>{t.heroBadge}</span>
          </div>
          <h2 className="text-display-md text-glowing" style={{ color: 'var(--primary)', marginBottom: '0.625rem', whiteSpace: 'pre-line', textTransform: 'uppercase' }}>
            {t.hero}
          </h2>
          <p style={{ fontFamily: "'Manrope'", fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '1.75rem' }}>
            {t.heroSub}
          </p>
          <div className="liquid-glass" style={{ 
            display: 'flex', alignItems: 'center', 
            borderRadius: '1.25rem', padding: '0.5rem 1.25rem',
            border: '1px solid var(--glass-border)',
          }}>
            <i className="ph-bold ph-magnifying-glass" style={{ color: 'var(--primary)', fontSize: '1.375rem', marginRight: '0.75rem' }}></i>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => navigate('/explore')} 
              placeholder={isListening ? (lang === 'hi' ? 'बोलिए...' : 'Listening...') : t.searchPh}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: '0.9375rem', color: 'var(--on-surface)', padding: '1.125rem 0', flex: 1 }} />
            
            {(window.SpeechRecognition || window.webkitSpeechRecognition) && (
              <button 
                onClick={(e) => { e.stopPropagation(); startListening(); }}
                className={`${isListening ? 'animate-pulse' : ''}`}
                style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', 
                  background: isListening ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface-container-high)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  border: '1px solid var(--outline-variant)', cursor: 'pointer',
                  marginLeft: '0.5rem', transition: 'all 0.3s ease'
                }}
              >
                <i className={`${isListening ? 'ph-fill ph-microphone-slash' : 'ph-fill ph-microphone'}`} 
                   style={{ fontSize: '1.25rem', color: isListening ? '#ef4444' : 'var(--primary)' }}></i>
              </button>
            )}
          </div>
        </section>

        {/* Trending Chips */}
        <section className="animate-fade-up-plus delay-2" style={{ padding: '0 1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', alignItems: 'center' }} className="hide-scrollbar">
            <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.625rem', fontWeight: 800, color: 'var(--on-surface-variant)', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.trending}</span>
            {trendingSearches.map((s, i) => (
              <button key={i} onClick={() => { setSearchQuery(s); navigate('/explore'); }}
                style={{ flexShrink: 0, fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface)', background: 'var(--surface-container-high)', padding: '0.4375rem 1rem', borderRadius: '999px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all var(--transition-fast)' }}>
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Widgets section */}
        <div className="animate-fade-up-plus delay-3">
          <WeatherWidget />
          <QuoteWidget />
        </div>

        {/* Categories Grid (Top row only) */}
        <section className="animate-fade-up-plus delay-3" style={{ padding: '1rem 1.25rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 className="text-glowing" style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>{t.categories}</h3>
            <button onClick={() => navigate('/services')} style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              {t.viewAll}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {(categories.length > 0 ? categories : CATEGORIES.filter(c => c.id !== 'all')).slice(0, 8).map(cat => (
              <button key={cat.id} id={`cat-chip-${cat.id}`} onClick={() => navigate(`/service/${cat.id}`)}
                className="clay-btn"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', padding: '0.75rem 0', cursor: 'pointer' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: cat.gradient ? `linear-gradient(135deg, ${cat.gradient[0]}, ${cat.gradient[1]})` : 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <i className={`ph-fill ${cat.icon || 'ph-gear'}`} style={{ fontSize: '1.25rem', color: '#fff' }}></i>
                </div>
                <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.625rem', fontWeight: 700, color: 'var(--on-surface)', textAlign: 'center', lineHeight: 1.2 }}>
                  {isHi && (cat.nameHi) ? cat.nameHi : cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Admin Service Offers Carousel ── */}
        {activeOffers.length > 0 && (
          <section className="animate-fade-up-plus delay-4" style={{ padding: '0.5rem 0 2rem' }}>
            <h3 className="text-glowing" style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', color: 'var(--primary)', padding: '0 1.25rem', marginBottom: '1.25rem', textTransform: 'uppercase' }}>
              {isHi ? 'एक्सक्लूसिव ऑफर्स' : 'Exclusive Offers'}
            </h3>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0 1.25rem 1rem', scrollSnapType: 'x mandatory' }} className="hide-scrollbar">
              {activeOffers.map((offer, i) => {
                const g = Array.isArray(offer.gradient) ? `linear-gradient(135deg, ${offer.gradient[0]}, ${offer.gradient[1]})` : 'var(--gradient-primary)';
                return (
                  <div key={offer.id || i} className="liquid-glass"
                    style={{ flexShrink: 0, width: '280px', borderRadius: '1.5rem', overflow: 'hidden', padding: '1.5rem', scrollSnapAlign: 'start', cursor: 'pointer', transform: 'translateZ(0)', position: 'relative' }}
                    onClick={() => navigate(`/service/${offer.category}`)}
                  >
                    <div className="animate-pulse-glow" style={{ position: 'absolute', inset: 0, background: g, opacity: 0.15, zIndex: 0 }}></div>
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: g, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`ph-fill ${offer.icon || 'ph-tag'}`} style={{ color: '#fff', fontSize: '1.5rem' }} />
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 900, fontSize: '1.125rem', color: 'var(--primary)', lineHeight: 1.1, marginBottom: '0.25rem' }}>{offer.title}</p>
                        {offer.subtitle && <p style={{ fontFamily: "'Manrope'", fontWeight: 800, fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{offer.subtitle}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── How it Works ── */}
        <section className="animate-fade-up-plus delay-5" style={{ padding: '0.5rem 1.25rem 2rem' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '1.25rem' }}>
            {isHi ? 'यह कैसे काम करता है?' : 'How Patna Suvidha Works'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: 'ph-hand-tap', title: isHi ? 'सेवा चुनें' : 'Choose a Service', desc: isHi ? 'अपनी जरूरत के हिसाब से कैटेगरी सेलेक्ट करें' : 'Pick from our wide range of professional services' },
              { icon: 'ph-calendar-check', title: isHi ? 'टाइम और बुक करें' : 'Pick Time & Book', desc: isHi ? 'अपना पता और सुविधाजनक समय चुनें' : 'Select your address and a convenient time slot' },
              { icon: 'ph-house-line', title: isHi ? 'घर पर सेवा पायें' : 'Get Service at Home', desc: isHi ? 'हमारा प्रोफेशनल आपके घर आकर सेवा देगा' : 'Our verified professional arrives at your doorstep' },
            ].map((step, i) => (
              <div key={i} className="clay-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,140,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ph-fill ${step.icon}`} style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
                </div>
                <div>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.125rem' }}>{step.title}</h4>
                  <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trust Section ── */}
        <section className="animate-fade-up-plus delay-6" style={{ padding: '0.5rem 1.25rem 2rem' }}>
          <div style={{
            background: 'var(--primary-container)', borderRadius: '1.25rem', padding: '1.5rem',
            border: '1px solid rgba(255,140,0,0.3)', textAlign: 'center'
          }}>
            <i className="ph-fill ph-shield-check" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
              {isHi ? '100% सुरक्षित और वेरीफाइड' : '100% Safe & Verified'}
            </h3>
            <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
              {isHi ? 'सभी प्रोफेशनल्स का बैकग्राउंड चेक किया गया है। 7-दिन की सर्विस वारंटी के साथ पूरी शांति।' : 'All professionals undergo strict background checks. Complete peace of mind with our 7-day service warranty.'}
            </p>
          </div>
        </section>

        <footer style={{ padding: '2rem 1.5rem 7rem', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface-variant)', fontWeight: 800 }}>
            Made with ❤️ in Bihar by <span style={{ color: 'var(--primary)', fontWeight: 900 }}>PATNA SUVIDHA TEAM</span>.
          </p>
        </footer>

      </div>
    </div>
  );
}
