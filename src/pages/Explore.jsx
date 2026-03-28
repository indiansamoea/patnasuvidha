import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES, getCategoryById } from '../utils/categories';
import ShareBusinessButton from '../components/ShareBusinessButton';

export default function Explore() {
  const navigate = useNavigate();
  const { category } = useParams();
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, sortBy, setSortBy, filters, setFilters, getFilteredBusinesses, loadMoreBusinesses, hasMore, loadingMore } = useAppContext();

  const filtered = getFilteredBusinesses(category);

  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '5.5rem', color: 'var(--on-surface)' }}>
      
      {/* Search Header */}
      <header className="liquid-glass" style={{
        position: 'sticky', top: 0, zIndex: 50,
        padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--liquid-border)', borderTop: 'none', borderRight: 'none', borderLeft: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '480px', margin: '0 auto' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '0.375rem', cursor: 'pointer' }}>
            <i className="ph-bold ph-arrow-left" style={{ color: 'var(--on-surface)', fontSize: '1.25rem' }}></i>
          </button>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', borderRadius: '0.75rem', padding: '0 0.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <i className="ph-bold ph-magnifying-glass" style={{ color: 'var(--primary)', fontSize: '1rem', marginRight: '0.5rem' }}></i>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search services in Patna..."
              style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Manrope'", fontSize: '0.875rem', color: 'var(--on-surface)', padding: '0.75rem 0', flex: 1 }}
            />
          </div>
        </div>
      </header>
      
      {/* Liquid Blob Backgrounds */}
      <div className="liquid-blob" style={{ top: '-5%', left: '-10%', width: '300px', height: '300px', animationDelay: '0s' }}></div>
      <div className="liquid-blob" style={{ top: '50%', right: '-20%', width: '350px', height: '350px', animationDelay: '-8s', background: 'linear-gradient(135deg, var(--secondary), var(--primary))' }}></div>

      <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.75rem 1.25rem', scrollSnapType: 'x mandatory' }} className="hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); navigate(cat.id === 'all' ? '/explore' : `/explore/${cat.id}`, { replace: true }); }}
              className={(category || selectedCategory) === cat.id ? 'clay-btn' : ''}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.4375rem 0.875rem', borderRadius: '999px', scrollSnapAlign: 'start',
                fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 700,
                background: (category || selectedCategory) === cat.id ? 'var(--primary)' : 'var(--surface-container)',
                color: (category || selectedCategory) === cat.id ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                border: (category || selectedCategory) === cat.id ? 'none' : '1px solid var(--outline-variant)',
                cursor: 'pointer', transition: 'all 200ms',
                whiteSpace: 'nowrap',
              }}>
              <i className={`ph-fill ${cat.icon}`} style={{ fontSize: '0.875rem' }}></i>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filter Chips + Sort */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1.25rem', flexWrap: 'wrap' }}>
          <button className={filters.openNow ? 'clay-btn' : ''} onClick={() => toggleFilter('openNow')} style={{
            padding: '0.3125rem 0.625rem', borderRadius: '999px', fontFamily: "'Plus Jakarta Sans'", fontSize: '0.6875rem', fontWeight: 700,
            background: filters.openNow ? 'var(--clay-bg)' : 'var(--surface-container)',
            color: filters.openNow ? '#138808' : 'var(--on-surface-variant)',
            border: filters.openNow ? 'none' : '1px solid var(--outline-variant)', cursor: 'pointer',
          }}>
            <i className="ph-bold ph-clock" style={{ marginRight: '0.25rem' }}></i>Open Now
          </button>
          <button className={filters.verified ? 'clay-btn' : ''} onClick={() => toggleFilter('verified')} style={{
            padding: '0.3125rem 0.625rem', borderRadius: '999px', fontFamily: "'Plus Jakarta Sans'", fontSize: '0.6875rem', fontWeight: 700,
            background: filters.verified ? 'var(--clay-bg)' : 'var(--surface-container)',
            color: filters.verified ? '#0284c7' : 'var(--on-surface-variant)',
            border: filters.verified ? 'none' : '1px solid var(--outline-variant)', cursor: 'pointer',
          }}>
            <i className="ph-bold ph-seal-check" style={{ marginRight: '0.25rem' }}></i>Verified
          </button>
          {['newest', 'rating', 'distance', 'reviews', 'name'].map(s => (
            <button key={s} className={sortBy === s ? 'clay-btn' : ''} onClick={() => setSortBy(s)} style={{
              padding: '0.3125rem 0.625rem', borderRadius: '999px', fontFamily: "'Plus Jakarta Sans'", fontSize: '0.6875rem', fontWeight: 700,
              background: sortBy === s ? 'var(--clay-bg)' : 'var(--surface-container)',
              color: sortBy === s ? 'var(--primary)' : 'var(--on-surface-variant)',
              border: sortBy === s ? 'none' : '1px solid var(--outline-variant)', cursor: 'pointer', textTransform: 'capitalize',
            }}>
              {s === 'rating' ? '⭐ Top Rated' : s === 'distance' ? '📍 Nearest' : s === 'reviews' ? '💬 Most Reviewed' : s === 'newest' ? '✨ Newest' : '📝 Name A-Z'}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div style={{ padding: '0.5rem 1.25rem' }}>
          <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{filtered.length}</span> services found
            {category && category !== 'all' && ` in ${getCategoryById(category).name}`}
          </p>
        </div>

        {/* Result Cards */}
        <div style={{ padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <i className="ph-bold ph-magnifying-glass" style={{ fontSize: '1.5rem', color: 'var(--on-surface-variant)' }}></i>
              </div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.375rem' }}>No services found</h3>
              <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              {filtered.map((biz, i) => {
                const cat = getCategoryById(biz.category);
                return (
                  <div key={biz.id} onClick={() => navigate(`/business/${biz.id}`)} className="clay-card" style={{
                    display: 'flex', gap: '1rem',
                    padding: 0, cursor: 'pointer', overflow: 'hidden',
                    margin: '0.25rem 0',
                    animation: `fadeUpPlus 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(i, 10) * 0.05}s both`,
                    transition: 'transform 150ms, box-shadow 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
                  >
                    {/* Category Accent Bar */}
                    <div style={{ width: '5px', background: `linear-gradient(180deg, ${cat.gradient[0]}, ${cat.gradient[1]})`, flexShrink: 0, borderTopLeftRadius: '1.25rem', borderBottomLeftRadius: '1.25rem' }}></div>
                    
                    {/* Business Image */}
                    <div style={{ width: '84px', height: '96px', borderRadius: '1rem', overflow: 'hidden', flexShrink: 0, background: 'var(--surface-container-highest)', margin: '1rem 0 1rem -0.375rem', alignSelf: 'center' }}>
                      <img src={biz.image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, padding: '1rem 1rem 1rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.1875rem' }}>
                        <h4 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.name}</h4>
                        {biz.isVerified && <i className="ph-fill ph-seal-check" style={{ color: '#0284c7', fontSize: '0.8125rem', flexShrink: 0 }}></i>}
                        {biz.isFeatured && <i className="ph-fill ph-star" style={{ color: '#fbb423', fontSize: '0.8125rem', flexShrink: 0 }}></i>}
                        {biz.isPromoted && <span style={{ fontSize: '0.5rem', fontWeight: 900, background: '#ff915920', color: '#ff9159', padding: '0.125rem 0.375rem', borderRadius: '4px', marginLeft: 'auto' }}>PROMOTED</span>}
                        {biz.isSponsored && <span style={{ fontSize: '0.5rem', fontWeight: 900, background: 'var(--primary-container)', color: 'var(--primary)', padding: '0.125rem 0.375rem', borderRadius: '4px', marginLeft: 'auto' }}>SPONSORED</span>}
                        {biz.isRecommended && <i className="ph-fill ph-sketch-logo" style={{ color: '#22d3ee', fontSize: '0.8125rem', flexShrink: 0 }}></i>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                        <i className="ph-fill ph-star" style={{ color: '#fbb423', fontSize: '0.6875rem' }}></i>
                        <span style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 700, color: '#ffc562' }}>{biz.rating}</span>
                        <span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>({biz.reviews})</span>
                        <span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: 'var(--outline-variant)' }}>·</span>
                        <span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>{biz.distance || '1.2 km'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: "'Manrope'", fontSize: '0.5625rem', fontWeight: 700, color: cat.color, background: `${cat.color}18`, border: `1px solid ${cat.color}30`, padding: '0.15rem 0.5rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{cat.name}</span>
                          <span style={{ fontFamily: "'Manrope'", fontSize: '0.5625rem', fontWeight: 700, color: biz.isOpen ? '#138808' : '#dc3545', background: biz.isOpen ? 'rgba(19,136,8,0.1)' : 'rgba(220,53,69,0.1)', border: biz.isOpen ? '1px solid rgba(19,136,8,0.2)' : '1px solid rgba(220,53,69,0.2)', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>{biz.isOpen ? 'OPEN' : 'CLOSED'}</span>
                          <div onClick={e => e.stopPropagation()} style={{ marginLeft: 'auto' }}>
                            <ShareBusinessButton business={biz} />
                          </div>
                        </div>
                        {biz.priceRange && <span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{biz.priceRange}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {hasMore && (
                <button 
                  onClick={loadMoreBusinesses} 
                  disabled={loadingMore}
                  style={{
                    width: '100%', padding: '1rem', borderRadius: '1rem', marginTop: '1rem',
                    background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)',
                    color: 'var(--primary)', fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '0.875rem',
                    cursor: loadingMore ? 'not-allowed' : 'pointer', transition: 'all 200ms',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                      Loading...
                    </>
                  ) : (
                    <>Load More Services <i className="ph-bold ph-caret-down"></i></>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
