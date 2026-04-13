import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES, getCategoryById } from '../utils/categories';
import ShareBusinessButton from '../components/ShareBusinessButton';

export default function Explore() {
  const navigate = useNavigate();
  const { category } = useParams();
  const { searchQuery, setSearchQuery, categories = [] } = useAppContext();
  
  const allAvailableCategories = [...(categories.length > 0 ? categories : CATEGORIES.filter(c => c.id !== 'all'))];

  const filteredCategories = allAvailableCategories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (cat.nameHi && cat.nameHi.includes(searchQuery)) ||
    (cat.id.includes(searchQuery.toLowerCase()))
  );


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
        

        {/* Results Count */}
        <div style={{ padding: '0.5rem 1.25rem' }}>
          <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
            Found <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{filteredCategories.length}</span> service categories
          </p>
        </div>

        {/* Result Cards */}
        <div style={{ padding: '0 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {filteredCategories.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
               <i className="ph-bold ph-magnifying-glass" style={{ fontSize: '2rem', opacity: 0.3 }} />
               <p style={{ marginTop: '0.5rem', fontWeight: 800 }}>No categories found</p>
            </div>
          ) : (
            filteredCategories.map((cat, i) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/service/${cat.id}`)}
                className="clay-card"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  padding: '1.25rem 0.75rem', cursor: 'pointer',
                  animation: `fadeUpPlus 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(i, 8) * 0.05}s both`
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: cat.gradient ? `linear-gradient(135deg, ${cat.gradient[0]}15, ${cat.gradient[1]}15)` : 'var(--primary-container)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <i className={`ph-fill ${cat.icon || 'ph-gear'}`} style={{ fontSize: '1.75rem', color: cat.gradient ? cat.gradient[0] : 'var(--primary)' }} />
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.8125rem', fontWeight: 900, textAlign: 'center' }}>
                  {cat.name}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
