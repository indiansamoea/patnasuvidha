import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Updates() {
  const { lang, serviceOffers, notifications } = useAppContext();
  const navigate = useNavigate();

  const t = {
    en: { title: 'Updates', empty: 'No new updates right now', tags: { offer: 'OFFER', alert: 'ALERT' } },
    hi: { title: 'अपडेट्स', empty: 'अभी कोई नया अपडेट नहीं है', tags: { offer: 'ऑफर', alert: 'अलर्ट' } }
  }[lang] || { title: 'Updates', empty: 'No updates', tags: { offer: 'OFFER', alert: 'ALERT' } };

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

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '90px', color: 'var(--on-surface)' }}>
      {/* Sticky Header */}
      <header className="liquid-glass" style={{ position: 'sticky', top: 0, zIndex: 10, padding: '1rem 1.25rem', borderBottom: '1px solid var(--liquid-border)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
          {t.title}
        </h1>
      </header>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.25rem' }}>
        {allUpdates.length > 0 ? (
          <div className="animate-fade-up-plus delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {allUpdates.map((item, i) => {
              const isOffer = item.type === 'offer';
              const g = isOffer && Array.isArray(item.gradient) ? item.gradient : ['#3b82f6', '#2563eb'];
              const icon = isOffer ? (item.icon || 'ph-tag') : (item.icon || 'ph-bell-ringing');

              return (
                <div 
                  key={item.id || i}
                  onClick={() => isOffer && navigate(`/service/${item.category}`)}
                  className="clay-card"
                  style={{
                    padding: '1.25rem', borderRadius: '1.25rem', display: 'flex', gap: '1rem',
                    cursor: isOffer ? 'pointer' : 'default', position: 'relative', overflow: 'hidden'
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                    background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className={`ph-fill ${icon}`} style={{ fontSize: '1.5rem', color: '#fff' }}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)' }}>
                        {item.title}
                      </p>
                      <span style={{ 
                        fontSize: '0.625rem', fontWeight: 800, padding: '0.125rem 0.375rem', borderRadius: '4px',
                        background: isOffer ? 'rgba(234,179,8,0.15)' : 'rgba(59,130,246,0.15)',
                        color: isOffer ? '#eab308' : '#3b82f6', letterSpacing: '0.05em'
                      }}>
                        {isOffer ? t.tags.offer : t.tags.alert}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="clay-card animate-fade-up-plus" style={{ padding: '3rem 1.5rem', textAlign: 'center', opacity: 0.8 }}>
            <i className="ph-fill ph-bell-z" style={{ fontSize: '3rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}></i>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800 }}>{t.empty}</p>
          </div>
        )}
      </div>
    </div>
  );
}
