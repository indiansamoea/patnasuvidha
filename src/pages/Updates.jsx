import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, opacity: 1, scale: 1, 
    transition: { type: 'spring', damping: 20, stiffness: 100 } 
  }
};

export default function Updates() {
  const { lang, serviceOffers, notifications } = useAppContext();
  const navigate = useNavigate();
  const isHi = lang === 'hi';

  const t = {
    en: { title: 'Newsroom', empty: 'Stay tuned for Patna specials.', tags: { offer: 'DEAL', alert: 'NEWS' } },
    hi: { title: 'न्यूज़रूम', empty: 'पटना के स्पेशल ऑफर्स का इंतज़ार करें।', tags: { offer: 'ऑफर', alert: 'अलर्ट' } }
  }[lang] || { title: 'Newsroom', empty: 'No updates', tags: { offer: 'DEAL', alert: 'NEWS' } };

  const allUpdates = [
    ...(serviceOffers || []).filter(o => o?.active).map(o => ({
      ...o,
      type: 'offer',
      sortDate: o.createdAt?.seconds ? o.createdAt.seconds * 1000 : (o.createdAt instanceof Date ? o.createdAt.getTime() : Date.now())
    })),
    ...(notifications || []).map(n => ({
      ...n,
      type: 'alert',
      sortDate: n.createdAt?.seconds ? n.createdAt.seconds * 1000 : (n.createdAt instanceof Date ? n.createdAt.getTime() : Date.now())
    }))
  ].sort((a, b) => b.sortDate - a.sortDate);

  const featured = allUpdates[0];
  const remaining = allUpdates.slice(1);

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', paddingBottom: '140px' }}>
      
      {/* ─── Cinematic Sticky Header ─── */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ 
          padding: '2rem 1.5rem', 
          background: 'linear-gradient(to bottom, var(--surface) 0%, transparent 100%)',
          position: 'sticky', top: 0, zIndex: 10,
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid hsla(var(--p-h), 100%, 50%, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <div style={{ width: '4px', height: '18px', background: 'var(--primary)', borderRadius: '99px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 950, color: 'var(--on-surface)', letterSpacing: '-0.03em' }}>
            {t.title}
          </h1>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6 }}>
          {isHi ? 'शहर की ताज़ा हलचल' : 'Exclusive Specials • Patna'}
        </p>
      </motion.header>

      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        style={{ padding: '0 1.5rem' }}
      >
        {/* ─── FEATURED BANNER ─── */}
        {featured ? (
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            onClick={() => featured.type === 'offer' && navigate(`/service/${featured.category}`)}
            style={{
              position: 'relative', overflow: 'hidden',
              background: 'var(--surface-container-highest)', borderRadius: '2.5rem',
              padding: '2.5rem 2rem', marginBottom: '2.5rem', cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.3)'
            }}
          >
            {/* Background Gradient/Pattern */}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${featured.gradient?.[0] || 'var(--primary)'}20, transparent)`, zIndex: 0 }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
               <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 950, background: 'var(--primary)', color: '#fff', padding: '0.375rem 0.75rem', borderRadius: '99px', letterSpacing: '0.1em' }}>FEATURED</span>
                  <span style={{ fontSize: '0.625rem', fontWeight: 950, background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.375rem 0.75rem', borderRadius: '99px', letterSpacing: '0.1em' }}>NEW</span>
               </div>
               <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 950, color: '#fff', lineHeight: 1, marginBottom: '0.75rem' }}>{featured.title}</h2>
               <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, lineHeight: 1.5, marginBottom: '2rem', maxWidth: '80%' }}>{featured.subtitle}</p>
               
               <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ph-bold ph-arrow-right" style={{ color: 'var(--primary)', fontSize: '1.5rem' }} />
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} style={{ padding: '6rem 2rem', textAlign: 'center', background: 'var(--surface-container-low)', borderRadius: '2.5rem', border: '1px dashed var(--outline-variant)' }}>
             <i className="ph ph-sparkle" style={{ fontSize: '3rem', color: 'var(--primary)', opacity: 0.3, marginBottom: '1rem' }} />
             <p style={{ fontWeight: 800, color: 'var(--on-surface-variant)' }}>{t.empty}</p>
          </motion.div>
        )}

        {/* ─── REMAINING UPDATES ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
           {remaining.map((item, i) => {
              const isOffer = item.type === 'offer';
              const icon = isOffer ? (item.icon || 'ph-tag') : (item.icon || 'ph-bell-ringing');
              const g = isOffer && Array.isArray(item.gradient) ? item.gradient : ['#3b82f6', '#2563eb'];

              return (
                <motion.div 
                  key={item.id || i}
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => isOffer && navigate(`/service/${item.category}`)}
                  className="clay-card"
                  style={{
                    padding: '1.25rem', borderRadius: '1.75rem', display: 'flex', gap: '1.25rem',
                    cursor: isOffer ? 'pointer' : 'default', background: 'var(--surface-container-low)',
                    border: '1px solid var(--outline-variant)'
                  }}
                >
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
                    background: isOffer ? `linear-gradient(135deg, ${g[0]}, ${g[1]})` : 'var(--surface-container-high)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isOffer ? 'var(--shadow-glow-small)' : 'none'
                  }}>
                    <i className={`ph-fill ${icon}`} style={{ fontSize: '1.75rem', color: isOffer ? '#fff' : 'var(--primary)' }}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.625rem', fontWeight: 950, color: isOffer ? 'var(--primary)' : 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                      {isOffer ? t.tags.offer : t.tags.alert}
                    </p>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 950, color: 'var(--on-surface)', marginBottom: '0.125rem' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', fontWeight: 600, opacity: 0.7 }}>{item.subtitle}</p>
                  </div>
                </motion.div>
              );
           })}
        </div>
      </motion.div>
    </div>
  );
}
