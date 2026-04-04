import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import StoryModal from './StoryModal';

export default function StoriesFeed() {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    if (!db) return;
    const now = new Date().toISOString();
    const q = query(
      collection(db, 'daily_offers'),
      where('expiresAt', '>', now)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Unique businesses only
      const unique = data.reduce((acc, current) => {
        const x = acc.find(item => item.businessId === current.businessId);
        if (!x) return acc.concat([current]);
        return acc;
      }, []);
      setOffers(unique);
    });

    return () => unsubscribe();
  }, []);

  if (offers.length === 0) return null;

  return (
    <div style={{ padding: '1rem 0 0.5rem' }}>
      <div 
        style={{ 
          display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0 1.25rem',
          scrollbarWidth: 'none', msOverflowStyle: 'none'
        }}
        className="hide-scrollbar"
      >
        {offers.map(offer => (
          <button 
            key={offer.id}
            onClick={() => setSelectedOffer(offer)}
            style={{ 
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0
            }}
          >
            <div style={{ 
              width: '68px', height: '68px', borderRadius: '50%', padding: '3px',
              background: 'linear-gradient(45deg, #f09433, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ 
                width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #0a0e13', 
                overflow: 'hidden', background: '#151a20' 
              }}>
                <img 
                  src={offer.businessImage || '/logo.jpeg'} 
                  alt="" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            </div>
            <span style={{ 
              fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 700, 
              color: 'var(--on-surface-variant)', width: '68px', textAlign: 'center',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {offer.businessName?.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      {selectedOffer && (
        <StoryModal 
          offer={selectedOffer} 
          onClose={() => setSelectedOffer(null)} 
        />
      )}
    </div>
  );
}
