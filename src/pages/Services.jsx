import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../utils/categories';
import { useAppContext } from '../context/AppContext';

export default function Services() {
  const navigate = useNavigate();
  const { lang, categories = [] } = useAppContext();

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '90px', color: 'var(--on-surface)', fontFamily: 'var(--font-body)' }}>
      {/* Sticky Liquid Header */}
      <header className="liquid-glass" style={{ padding: '1rem 1.25rem', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--liquid-border)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
          {lang === 'hi' ? 'सभी सेवाएं' : 'All Services'}
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', fontWeight: 600, marginTop: '0.125rem' }}>
          {lang === 'hi' ? 'प्रोफ़ेशनल बुक करने के लिए कैटेगरी चुनें' : 'Select a category to book a professional'}
        </p>
      </header>

      <div className="animate-fade-up-plus" style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {(categories.length > 0 ? categories : CATEGORIES.filter(c => c.id !== 'all')).map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/service/${cat.id}`)}
            className="clay-card"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              padding: '1.25rem 1rem', cursor: 'pointer', border: 'none', background: 'var(--surface)'
            }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: cat.gradient ? `linear-gradient(135deg, ${cat.gradient[0]}20, ${cat.gradient[1]}20)` : 'rgba(255,140,0,0.1)',
              border: `1px solid ${cat.gradient ? cat.gradient[0] : 'var(--primary)'}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <i className={`ph-fill ${cat.icon || 'ph-gear'}`} style={{ fontSize: '2rem', color: cat.color || 'var(--primary)' }}></i>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface)', textAlign: 'center' }}>
              {lang === 'hi' && cat.nameHi ? cat.nameHi : cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
