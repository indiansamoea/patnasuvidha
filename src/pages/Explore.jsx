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
        <div style={{ padding: '0 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', position: 'relative' }}>
          {filteredCategories.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 1.5rem', background: 'var(--surface-container-low)', borderRadius: '2rem', border: '1px dashed var(--outline-variant)' }}>
               <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface-container-high)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <i className="ph-fill ph-magnifying-glass" style={{ fontSize: '1.75rem', color: 'var(--on-surface-variant)', opacity: 0.5 }} />
               </div>
               <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1rem', color: 'var(--on-surface)' }}>No services found</h3>
               <p style={{ marginTop: '0.25rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>Try searching for 'Plumber' or 'Clinic'</p>
            </motion.div>
          ) : (
            filteredCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                onClick={() => navigate(`/service/${cat.id}`)}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -5, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="clay-card liquid-glass"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                  padding: '1.75rem 0.75rem', cursor: 'pointer', background: 'var(--surface-container-low)',
                  border: '1px solid var(--glass-border)'
                }}
              >
                <div style={{
                  width: '64px', height: '64px', borderRadius: '20px',
                  background: cat.gradient ? `linear-gradient(135deg, ${cat.gradient[0]}20, ${cat.gradient[1]}20)` : 'var(--primary-container)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `inset 0 1px 1px rgba(255,255,255,0.4), 0 10px 20px ${cat.gradient ? cat.gradient[0] : 'var(--primary)'}15`
                }}>
                  <i className={`ph-fill ${cat.icon || 'ph-gear'}`} style={{ fontSize: '2rem', color: cat.gradient ? cat.gradient[0] : 'var(--primary)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 950, color: 'var(--on-surface)' }}>
                    {cat.name}
                  </p>
                  <p style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '0.25rem' }}>View Experts</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
