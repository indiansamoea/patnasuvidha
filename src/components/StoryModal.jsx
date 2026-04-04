import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StoryModal({ offer, onClose }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          onClose();
          return 100;
        }
        return p + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div style={{ 
      position: 'fixed', inset: 0, zIndex: 9999, background: '#000',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Progress Bar */}
      <div style={{ 
        position: 'absolute', top: '10px', left: '10px', right: '10px', height: '2px', 
        background: 'rgba(255,255,255,0.3)', borderRadius: '999px', overflow: 'hidden' 
      }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#fff', transition: 'width 0.05s linear' }}></div>
      </div>

      {/* Header */}
      <div style={{ 
        position: 'absolute', top: '25px', left: '1rem', right: '1rem', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={offer.businessImage || '/logo.jpeg'} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #fff' }} />
          <span style={{ color: '#fff', fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '0.9rem' }}>{offer.businessName}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}>
          <i className="ph-bold ph-x" style={{ fontSize: '1.5rem' }}></i>
        </button>
      </div>

      {/* Story Image */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <img 
          src={offer.offerImageURL} 
          alt="Offer" 
          style={{ width: '100%', maxHeight: '100vh', objectFit: 'contain' }} 
        />
      </div>

      {/* Footer CTA */}
      <div style={{ 
        position: 'absolute', bottom: '2rem', left: '1.25rem', right: '1.25rem', zIndex: 10 
      }}>
        <button 
          onClick={() => { onClose(); navigate(`/business/${offer.businessId}`); }}
          style={{ 
            width: '100%', background: '#fff', color: '#000', border: 'none', 
            padding: '1rem', borderRadius: '1rem', fontFamily: "'Plus Jakarta Sans'", 
            fontWeight: 800, fontSize: '0.9375rem' 
          }}
        >
          View Shop
        </button>
      </div>
    </div>
  );
}
