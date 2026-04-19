import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../utils/categories';
import { useAppContext } from '../context/AppContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, opacity: 1, scale: 1, 
    transition: { type: 'spring', damping: 20, stiffness: 100 } 
  }
};

export default function Services() {
  const navigate = useNavigate();
  const { lang, categories = [] } = useAppContext();
  const isHi = lang === 'hi';

  const allCats = categories.length > 0 ? categories : CATEGORIES.filter(c => c.id !== 'all');

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', paddingBottom: '120px' }}>
      
      {/* ─── Cinematic Header ─── */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ 
          padding: '2.5rem 1.5rem', 
          background: 'linear-gradient(to bottom, var(--surface) 0%, transparent 100%)',
          position: 'sticky', top: 0, zIndex: 10,
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid hsla(var(--p-h), 100%, 50%, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '4px', height: '20px', background: 'var(--primary)', borderRadius: '99px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 950, color: 'var(--on-surface)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {isHi ? 'सेवाएं खोजें' : 'Browse Services'}
          </h1>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: 600, opacity: 0.7 }}>
          {isHi ? 'पटना के सबसे विश्वसनीय प्रोफेशनल यहाँ हैं' : 'Handpicked experts at your doorstep in Patna'}
        </p>
      </motion.header>

      {/* ─── Category Grid ─── */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}
      >
        {allCats.map((cat) => (
          <motion.button
            key={cat.id}
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(`/service/${cat.id}`)}
            className="clay-card"
            style={{
              position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              gap: '1.25rem', padding: '2.5rem 1.5rem', cursor: 'pointer', border: 'none', 
              background: 'var(--surface-container-low)', borderRadius: '2.25rem',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {/* Background Accent */}
            <div style={{ 
              position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', 
              background: cat.color ? `${cat.color}10` : 'hsla(var(--p-h), 100%, 50%, 0.05)', 
              borderRadius: '50%', filter: 'blur(30px)', zIndex: 0 
            }} />

            <div style={{
              position: 'relative', zIndex: 1,
              width: '72px', height: '72px', borderRadius: '24px',
              background: cat.gradient ? `linear-gradient(135deg, ${cat.gradient[0]}, ${cat.gradient[1]})` : 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              border: '4px solid rgba(255,255,255,0.2)'
            }}>
              <i className={`ph-fill ${cat.icon || 'ph-gear'}`} style={{ fontSize: '2.25rem', color: '#fff' }}></i>
            </div>

            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
               <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 950, color: 'var(--on-surface)', display: 'block', lineHeight: 1.1, marginBottom: '0.25rem' }}>
                 {isHi && cat.nameHi ? cat.nameHi : cat.name}
               </span>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified</span>
               </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <style>{`
        .clay-card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255,255,255,0.4), transparent, rgba(0,0,0,0.05));
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
