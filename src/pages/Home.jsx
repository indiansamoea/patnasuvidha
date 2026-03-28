import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES, getCategoryById } from '../utils/categories';
import WeatherWidget from '../components/WeatherWidget';
import QuoteWidget from '../components/QuoteWidget';

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
  const { theme, toggleTheme, lang, toggleLang, searchQuery, setSearchQuery, setSelectedCategory, deals, trendingSearches, getTopRated, getFeaturedBusinesses, getSuggestedBusinesses, getPromotedBusinesses, getRecommendedBusinesses, getRecentlyListed, settings } = useAppContext();
  const [showAllCats, setShowAllCats] = useState(false);

  const t = T[lang] || T.en;
  const topRated = getTopRated();
  const featured = getFeaturedBusinesses();
  const suggested = getSuggestedBusinesses();
  const promoted = getPromotedBusinesses();
  const recommended = getRecommendedBusinesses();
  const recentlyListed = getRecentlyListed();

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', color: 'var(--on-surface)' }}>

      {/* Top Bar (Liquid Glass) */}
      <header className="liquid-glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--liquid-border)', borderTop: 'none', borderRight: 'none', borderLeft: 'none' }}>
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

      {/* Single Liquid Blob (Reduced for mobile performance) */}
      <div className="liquid-blob" style={{ top: '10%', right: '-15%', width: '350px', height: '350px', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', opacity: 0.08 }}></div>

      {/* Buddha / Monument Art Background Decoration */}
      <div className="animate-pulse-glow" style={{ 
        position: 'absolute', top: 0, right: 0, opacity: theme === 'dark' ? 0.04 : 0.08, zIndex: 1, pointerEvents: 'none',
        maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)'
      }}>
        {/* Placeholder 2D vector for Bihar Monuments */}
        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Buddha_Statue_in_Bodh_Gaya.jpg" alt="Buddha" style={{ width: '280px', filter: 'grayscale(100%) contrast(150%) brightness(120%) drop-shadow(0 0 10px var(--primary))' }} />
      </div>

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
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => navigate('/explore')} placeholder={t.searchPh}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: '0.9375rem', color: 'var(--on-surface)', padding: '1.125rem 0', flex: 1 }} />
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

        {/* Categories Grid */}
        <section className="animate-fade-up-plus delay-3" style={{ padding: '1rem 1.25rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 className="text-glowing" style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>{t.categories}</h3>
            <button onClick={() => setShowAllCats(!showAllCats)} style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              {showAllCats ? (lang === 'hi' ? 'कम देखें' : 'Show Less') : t.viewAll}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {CATEGORIES.slice(1, showAllCats ? undefined : 9).map(cat => (
              <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); navigate(`/explore/${cat.id}`); }}
                className="clay-btn"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `linear-gradient(135deg, ${cat.gradient[0]}, ${cat.gradient[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <i className={`ph-fill ${cat.icon}`} style={{ fontSize: '1.5rem', color: '#fff' }}></i>
                </div>
                <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.6875rem', fontWeight: 700, color: 'var(--on-surface)', textAlign: 'center', lineHeight: 1.2 }}>
                  {lang === 'hi' && cat.nameHi ? cat.nameHi : cat.name}
                </span>
              </button>
            ))}
          </div>


        </section>

        {/* Hot Deals */}
        {deals.length > 0 && (
          <section className="animate-fade-up-plus delay-4" style={{ padding: '0.5rem 0 2rem' }}>
            <h3 className="text-glowing" style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', color: 'var(--primary)', padding: '0 1.25rem', marginBottom: '1.25rem', textTransform: 'uppercase' }}>{t.hotDeals}</h3>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0 1.25rem 1rem', scrollSnapType: 'x mandatory' }} className="hide-scrollbar">
              {deals.map((deal, i) => {
                const g = Array.isArray(deal.gradient) ? `linear-gradient(135deg, ${deal.gradient[0]}, ${deal.gradient[1]})` : (deal.gradient || 'var(--gradient-primary)');
                return (
                  <div key={deal.id || i} className="liquid-glass" style={{ flexShrink: 0, width: '280px', borderRadius: '1.5rem', overflow: 'hidden', padding: '1.5rem', scrollSnapAlign: 'start', cursor: 'pointer', transform: 'translateZ(0)', position: 'relative' }}
                    onClick={() => navigate(deal.businessId ? `/business/${deal.businessId}` : '/explore')}>
                    <div className="animate-pulse-glow" style={{ position: 'absolute', inset: 0, background: g, opacity: 0.15, zIndex: 0 }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <p style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 900, fontSize: '1.5rem', color: 'var(--primary)', lineHeight: 1.1, marginBottom: '0.5rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{deal.title}</p>
                      {deal.subtitle && <p style={{ fontFamily: "'Manrope'", fontWeight: 800, fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>{deal.subtitle}</p>}
                      {deal.code && <div style={{ display: 'inline-block', background: 'var(--primary)', padding: '0.375rem 0.75rem', borderRadius: '999px', marginTop: '1rem' }}><p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>CODE: {deal.code}</p></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Top Rated */}
        {topRated.length > 0 && (
          <section className="animate-fade-up-plus delay-5" style={{ padding: '0.5rem 0 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.25rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: 'var(--on-surface)' }}>{t.topRated}</h3>
              <button onClick={() => navigate('/explore')} style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>{t.viewAll}</button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0 1.25rem 1rem', scrollSnapType: 'x mandatory' }} className="hide-scrollbar">
              {topRated.map(biz => {
                const cat = getCategoryById(biz.category);
                return (
                  <div key={biz.id} onClick={() => navigate(`/business/${biz.id}`)} className="clay-card"
                    style={{ flexShrink: 0, width: '180px', overflow: 'hidden', cursor: 'pointer', scrollSnapAlign: 'start', margin: '1rem 0 1rem 1rem' }}>
                    <div style={{ height: '120px', overflow: 'hidden', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      {biz.image && <img src={biz.image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />}
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h4 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9375rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                        <i className="ph-fill ph-star" style={{ color: '#fbb423', fontSize: '0.75rem' }}></i>
                        <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)' }}>{biz.rating}</span>
                        <span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>({biz.reviews})</span>
                      </div>
                      <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.5625rem', fontWeight: 800, color: cat?.color || 'var(--primary)', background: `${cat?.color || 'var(--primary)'}15`, padding: '0.25rem 0.5rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lang === 'hi' && cat?.nameHi ? cat.nameHi : cat?.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Suggested for You (Monetized Ads) */}
        {suggested.length > 0 && (
          <section className="animate-fade-up-plus delay-5" style={{ padding: '0.5rem 0 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="ph-fill ph-lightbulb-filaments" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}></i>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 800, color: 'var(--on-surface)' }}>{t.suggested}</h3>
              </div>
              <span style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-container)', padding: '0.25rem 0.625rem', borderRadius: '999px', letterSpacing: '0.05em' }}>{t.sponsored.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0 1.25rem 1rem', scrollSnapType: 'x mandatory' }} className="hide-scrollbar">
              {suggested.map(biz => {
                const cat = getCategoryById(biz.category);
                return (
                  <div key={biz.id} onClick={() => navigate(`/business/${biz.id}`)} className="liquid-glass"
                    style={{ flexShrink: 0, width: '220px', borderRadius: '1.25rem', padding: '1rem', overflow: 'hidden', cursor: 'pointer', scrollSnapAlign: 'start', border: '1px solid var(--primary)' }}>
                    <div style={{ position: 'relative', height: '100px', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '0.75rem' }}>
                      {biz.image && <img src={biz.image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />}
                      <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                         <i className="ph-fill ph-star" style={{ color: '#fbb423', fontSize: '0.625rem' }}></i>
                         <span style={{ color: '#fff', fontSize: '0.625rem', fontWeight: 800 }}>{biz.rating}</span>
                      </div>
                    </div>
                    <h4 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.name}</h4>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: '0.5rem' }}>{lang === 'hi' && cat?.nameHi ? cat.nameHi : cat?.name}</p>
                    <button style={{ width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '0.75rem', fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800 }}>Book Now</button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        {featured.length > 0 && (
          <section className="animate-fade-up-plus delay-6" style={{ padding: '0.5rem 0 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.25rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: 'var(--on-surface)' }}>{t.featured}</h3>
              <button onClick={() => navigate('/explore')} style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>{t.viewAll}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 1.25rem' }}>
              {featured.map(biz => (
                <div key={biz.id} onClick={() => navigate(`/business/${biz.id}`)} className="clay-card"
                  style={{ padding: '0.875rem', cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '1rem', overflow: 'hidden', flexShrink: 0, background: 'var(--surface-container-highest)' }}>
                    {biz.image && <img src={biz.image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <i className="ph-fill ph-star" style={{ color: '#fbb423', fontSize: '0.75rem' }}></i>
                      <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>{biz.rating}</span>
                      <span style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>• {biz.priceRange}</span>
                    </div>
                  </div>
                  <i className="ph-bold ph-caret-right" style={{ color: 'var(--outline-variant)', fontSize: '1.25rem' }}></i>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommended for You */}
        {recommended.length > 0 && (
          <section className="animate-fade-up-plus delay-7" style={{ padding: '0.5rem 0 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="ph-fill ph-sketch-logo" style={{ color: '#22d3ee', fontSize: '1.25rem' }}></i>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 800, color: 'var(--on-surface)' }}>{t.recommended}</h3>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0 1.25rem 1rem', scrollSnapType: 'x mandatory' }} className="hide-scrollbar">
              {recommended.map(biz => {
                const cat = getCategoryById(biz.category);
                return (
                  <div key={biz.id} onClick={() => navigate(`/business/${biz.id}`)} className="clay-card"
                    style={{ flexShrink: 0, width: '200px', borderRadius: '1.25rem', padding: '1rem', overflow: 'hidden', cursor: 'pointer', scrollSnapAlign: 'start' }}>
                    <div style={{ position: 'relative', height: '90px', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '0.75rem' }}>
                      {biz.image && <img src={biz.image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />}
                      <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: '#22d3ee', color: '#000', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.625rem', fontWeight: 900 }}>RECOMMENDED</div>
                    </div>
                    <h4 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.name}</h4>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{biz.rating} ⭐ • {cat?.name}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Promoted Partners */}
        {promoted.length > 0 && (
          <section className="animate-fade-up-plus delay-8" style={{ padding: '0.5rem 0 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="ph-fill ph-rocket-launch" style={{ color: '#ff9159', fontSize: '1.25rem' }}></i>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 800, color: 'var(--on-surface)' }}>{t.promoted}</h3>
              </div>
            </div>
            <div style={{ padding: '0 1.25rem' }}>
              {promoted.map(biz => (
                <div key={biz.id} onClick={() => navigate(`/business/${biz.id}`)} className="liquid-glass"
                  style={{ padding: '1rem', borderRadius: '1.25rem', marginBottom: '1rem', border: '1px solid #ff915930', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '0.75rem', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={biz.image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9375rem', fontWeight: 800, color: 'var(--on-surface)' }}>{biz.name}</h4>
                      <span style={{ fontSize: '0.5rem', fontWeight: 900, background: '#ff915920', color: '#ff9159', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>PROMOTED</span>
                    </div>
                    {biz.promoMessage && <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#ff9159', fontWeight: 800 }}>✨ {biz.promoMessage}</p>}
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{biz.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Minimal Footer (as details moved to Home Services section!) */}
        <footer className="animate-fade-up-plus delay-7" style={{ padding: '2rem 1.5rem 7rem', textAlign: 'center', background: 'transparent' }}>
          <p className="animate-pulse-glow" style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface-variant)', fontWeight: 800, paddingTop: '1.5rem', borderTop: '1px solid var(--liquid-border)' }}>
            Made with ❤️ in Bihar by <span style={{ color: 'var(--primary)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase' }}>PATNA SUVIDHA TEAM</span>.
          </p>
        </footer>

      </div>
    </div>
  );
}
