import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
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
  
  const t = T[lang] || T.en;
  const isHi = lang === 'hi';
  const [isListening, setIsListening] = useState(false);
  
  const activeOffers = serviceOffers.filter(o => o.active);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice Search not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e) => {
      setSearchQuery(e.results[0][0].transcript);
      navigate('/explore');
    };
    recognition.start();
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      style={{ background: 'var(--gradient-mesh)', minHeight: '100vh', color: 'var(--on-surface)' }}
    >
      {/* Top Bar (Liquid Glass) */}
      <motion.header 
        variants={itemVariants}
        className="liquid-glass" 
        style={{ position: 'sticky', top: 0, zIndex: 100, padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--liquid-border)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <motion.img 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              src="/logo.jpeg" alt="Patna Suvidha" className="clay-btn" 
              style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--primary-container)' }} 
            />
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>Patna Suvidha</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.625rem', fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.125rem' }}>Thee Aaradh</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <motion.button 
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={toggleTheme} 
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--outline-variant)' }}
            >
              <i className={theme === 'dark' ? "ph-fill ph-sun" : "ph-fill ph-moon"} style={{ fontSize: '1.25rem', color: 'var(--on-surface)' }}></i>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={toggleLang} 
              style={{
                fontFamily: 'var(--font-body)', fontSize: '0.6875rem', fontWeight: 800,
                background: 'var(--primary-container)', color: 'var(--on-primary-container)',
                padding: '0.375rem 0.75rem', borderRadius: '999px', border: '1px solid var(--outline-variant)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}
            >
              {lang === 'hi' ? '🇮🇳 हिंदी' : '🇮🇳 EN'}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Stories Feed */}
      <motion.div variants={itemVariants}>
        <StoriesFeed />
      </motion.div>

      <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 2 }}>

        {/* Featured Message */}
        <AnimatePresence>
          {settings.featuredMessageEnabled && settings.featuredMessage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{ margin: '1rem 1.25rem 0', padding: '1rem', background: 'var(--gradient-subtle)', borderRadius: '1.5rem', border: '1px solid var(--primary)' }}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--primary)', textAlign: 'center' }}>
                {settings.featuredMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

         {/* Hero Section */}
        <motion.section variants={itemVariants} style={{ padding: '2rem 1.25rem 1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'var(--primary-container)', border: '1px solid var(--outline-variant)', borderRadius: '999px', padding: '0.25rem 0.75rem', marginBottom: '1rem' }}>
            <i className="ph-fill ph-seal-check" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}></i>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.03em' }}>{t.heroBadge}</span>
          </div>
          <h2 className="text-display-md" style={{ color: 'var(--primary)', marginBottom: '0.75rem', whiteSpace: 'pre-line', textTransform: 'uppercase' }}>
            {t.hero}
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '2rem', opacity: 0.8 }}>
            {t.heroSub}
          </p>
          
          {/* Search Box */}
          <motion.div 
            whileFocusWithin={{ scale: 1.02 }}
            className="liquid-glass" 
            style={{ 
              display: 'flex', alignItems: 'center', 
              borderRadius: '1.5rem', padding: '0.5rem 1.25rem',
              border: '2px solid var(--glass-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <i className="ph-bold ph-magnifying-glass" style={{ color: 'var(--primary)', fontSize: '1.375rem', marginRight: '0.75rem' }}></i>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => navigate('/explore')} 
              placeholder={isListening ? (lang === 'hi' ? 'बोलिए...' : 'Listening...') : t.searchPh}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--on-surface)', padding: '1.125rem 0', flex: 1 }} />
            
            {(window.SpeechRecognition || window.webkitSpeechRecognition) && (
              <motion.button 
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); startListening(); }}
                style={{ 
                  width: '44px', height: '44px', borderRadius: '50%', 
                  background: isListening ? 'var(--error)' : 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: '#fff', cursor: 'pointer', marginLeft: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <i className={`${isListening ? 'ph-fill ph-microphone-slash' : 'ph-fill ph-microphone'}`} style={{ fontSize: '1.25rem' }}></i>
              </motion.button>
            )}
          </motion.div>
        </motion.section>

        {/* Trending Chips */}
        <motion.section variants={itemVariants} style={{ padding: '0 1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.625rem', overflowX: 'auto', alignItems: 'center' }} className="hide-scrollbar">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.625rem', fontWeight: 900, color: 'var(--on-surface-variant)', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.trending}</span>
            {trendingSearches.map((s, i) => (
              <motion.button 
                key={i} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setSearchQuery(s); navigate('/explore'); }}
                style={{ flexShrink: 0, fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface)', background: 'var(--surface-container-high)', padding: '0.5rem 1.125rem', borderRadius: '999px', border: '1px solid var(--outline-variant)' }}>
                {s}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Widgets section */}
        <motion.div variants={itemVariants}>
          <WeatherWidget />
          <QuoteWidget />
        </motion.div>

        {/* Categories Grid */}
        <motion.section variants={itemVariants} style={{ padding: '1rem 1.25rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>{t.categories}</h3>
            <motion.button 
              whileHover={{ x: 5 }}
              onClick={() => navigate('/services')} 
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)' }}
            >
              {t.viewAll}
            </motion.button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {(categories.length > 0 ? categories : CATEGORIES.filter(c => c.id !== 'all')).slice(0, 8).map(cat => (
              <motion.button 
                key={cat.id} whileHover={{ y: -5 }} whileTap={{ scale: 0.9 }}
                onClick={() => navigate(`/service/${cat.id}`)}
                className="clay-btn"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 0' }}
              >
                <div style={{ 
                  width: '52px', height: '52px', borderRadius: '1.25rem', 
                  background: cat.gradient ? `linear-gradient(135deg, ${cat.gradient[0]}, ${cat.gradient[1]})` : 'var(--gradient-primary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  boxShadow: 'var(--shadow-md)', color: '#fff'
                }}>
                  <i className={`ph-fill ${cat.icon || 'ph-gear'}`} style={{ fontSize: '1.5rem' }}></i>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--on-surface)', textAlign: 'center', lineHeight: 1.1, padding: '0 0.25rem' }}>
                  {isHi && (cat.nameHi) ? cat.nameHi : cat.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Service Offers */}
        {activeOffers.length > 0 && (
          <motion.section variants={itemVariants} style={{ padding: '0.5rem 0 2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', padding: '0 1.25rem', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
              {isHi ? 'एक्सक्लूसिव ऑफर्स' : 'Exclusive Offers'}
            </h3>
            <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', padding: '0 1.25rem 1rem', scrollSnapType: 'x mandatory' }} className="hide-scrollbar">
              {activeOffers.map((offer, i) => {
                const g = Array.isArray(offer.gradient) ? `linear-gradient(135deg, ${offer.gradient[0]}, ${offer.gradient[1]})` : 'var(--gradient-primary)';
                return (
                  <motion.div 
                    key={offer.id || i}
                    whileHover={{ scale: 1.02 }}
                    className="liquid-glass"
                    style={{ flexShrink: 0, width: '300px', borderRadius: '2rem', overflow: 'hidden', padding: '1.75rem', scrollSnapAlign: 'start', cursor: 'pointer', position: 'relative', border: '2px solid var(--liquid-border)' }}
                    onClick={() => navigate(`/service/${offer.category}`)}
                  >
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: g, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-md)' }}>
                        <i className={`ph-fill ${offer.icon || 'ph-tag'}`} style={{ color: '#fff', fontSize: '1.75rem' }} />
                      </div>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary)', lineHeight: 1.1, marginBottom: '0.25rem' }}>{offer.title}</p>
                        {offer.subtitle && <p style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>{offer.subtitle}</p>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* How it Works */}
        <motion.section variants={itemVariants} style={{ padding: '0.5rem 1.25rem 2.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>
            {isHi ? 'यह कैसे काम करता है?' : 'Easy Booking in 3 Steps'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { icon: 'ph-hand-tap', title: isHi ? 'सेवा चुनें' : 'Choose a Service', desc: isHi ? 'अपनी जरूरत के हिसाब से कैटेगरी सेलेक्ट करें' : 'Pick from carefully vetted local categories' },
              { icon: 'ph-calendar-check', title: isHi ? 'टाइम और बुक करें' : 'Pick Time & Book', desc: isHi ? 'अपना पता और सुविधाजनक समय चुनें' : 'Select a slot that fits your busy schedule' },
              { icon: 'ph-house-line', title: isHi ? 'घर पर सेवा पायें' : 'Get Service at Home', desc: isHi ? 'हमारा प्रोफेशनल आपके घर आकर सेवा देगा' : 'Expert arrives within 60 mins of booking' },
            ].map((step, i) => (
              <motion.div 
                key={i} whileHover={{ x: 10 }}
                className="clay-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ph-fill ${step.icon}`} style={{ color: 'var(--primary)', fontSize: '1.5rem' }} />
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '0.125rem' }}>{step.title}</h4>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Trust Section */}
        <motion.section variants={itemVariants} style={{ padding: '0.5rem 1.25rem 3rem' }}>
          <div style={{
            background: 'var(--surface-container-highest)', borderRadius: '2rem', padding: '2rem',
            border: '2px solid var(--primary-container)', textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <i className="ph-fill ph-shield-check" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '0.75rem' }}>
              {isHi ? '100% सुरक्षित और वेरीफाइड' : 'Bihar\'s Most Trusted'}
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: 700, lineHeight: 1.6 }}>
              {isHi ? 'सभी प्रोफेशनल्स का बैकग्राउंड चेक किया गया है। 7-दिन की सर्विस वारंटी के साथ पूरी शांति।' : 'Verification checks for every partner. 7-day extended warranty on all household services.'}
            </p>
          </div>
        </motion.section>

        <footer style={{ padding: '2rem 1.5rem 8rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 800, letterSpacing: '0.02em' }}>
            PLATFORM BY <span style={{ color: 'var(--primary)', fontWeight: 900 }}>PATNA SUVIDHA TEAM</span>
          </p>
        </footer>

        {/* Cinematic Support Float */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ type: 'spring', damping: 15, delay: 2.5 }}
          whileHover={{ scale: 1.1, y: -5 }} 
          whileTap={{ scale: 0.9 }}
          onClick={() => window.open('https://wa.me/917764812598?text=I need help with a booking on Patna Suvidha.', '_blank')}
          style={{
            position: 'fixed', bottom: '6rem', right: '1.5rem', zIndex: 90,
            width: '60px', height: '60px', borderRadius: '20px',
            background: 'var(--surface)', border: '1px solid var(--outline-variant)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.5)',
            cursor: 'pointer', overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #25D366, #128C7E)', opacity: 0.1 }} />
          <i className="ph-fill ph-whatsapp-logo" style={{ color: '#25D366', fontSize: '2rem', position: 'relative', zIndex: 1 }} />
        </motion.button>

      </div>
    </motion.div>
  );
}
