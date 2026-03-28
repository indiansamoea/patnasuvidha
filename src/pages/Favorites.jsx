import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getCategoryById } from '../utils/categories';

export default function Favorites() {
  const navigate = useNavigate();
  const { getFavoriteBusinesses } = useAppContext();
  const favs = getFavoriteBusinesses();

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '7rem' }}>
      <header className="refractive-glass" style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--liquid-border)', padding: '0.875rem 1.25rem' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2 className="animate-flash text-glowing" style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            <i className="ph-fill ph-heart" style={{ marginRight: '0.5rem' }}></i>Saved Services
          </h2>
        </div>
      </header>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.25rem' }}>
        {favs.length === 0 ? (
          <div className="refractive-glass animate-fade-up-plus delay-1" style={{ textAlign: 'center', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface-container-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.05)' }}>
              <i className="ph-fill ph-heart" style={{ fontSize: '2rem', color: 'var(--on-surface-variant)' }}></i>
            </div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>No saved services yet</h3>
            <p style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>Tap the heart icon on any service to save it here</p>
            <button className="clay-btn" onClick={() => navigate('/explore')} style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)', padding: '0.75rem 1.5rem', width: 'auto' }}>
              Explore Services
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {favs.map((biz, i) => {
              const cat = getCategoryById(biz.category);
              return (
                <div key={biz.id} className="refractive-glass delay-2 animate-fade-up-plus" onClick={() => navigate(`/business/${biz.id}`)} style={{
                  display: 'flex', gap: '1rem', padding: '1rem', cursor: 'pointer', alignItems: 'center', animationDelay: `${i * 0.1}s`
                }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '1rem', overflow: 'hidden', flexShrink: 0, background: 'var(--surface-container-highest)' }}>
                    <img src={biz.image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                      <i className="ph-fill ph-star" style={{ color: '#fbb423', fontSize: '0.875rem' }}></i>
                      <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)' }}>{biz.rating}</span>
                      <span style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>• {cat?.name}</span>
                    </div>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.address}</p>
                  </div>
                  <i className="ph-bold ph-caret-right" style={{ color: 'var(--outline-variant)', fontSize: '1.25rem', marginLeft: 'auto' }}></i>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
