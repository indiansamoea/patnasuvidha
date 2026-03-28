import { useNavigate, useSearchParams } from 'react-router-dom';

export default function BookingSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const biz = params.get('biz') || '';
  const service = params.get('service') || '';
  const date = params.get('date') || '';
  const time = params.get('time') || '';

  return (
    <div style={{ background: '#0a0e13', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', animation: 'fadeInUp 0.5s ease-out' }}>
        <i className="ph-fill ph-whatsapp-logo" style={{ fontSize: '2.5rem', color: '#22c55e' }}></i>
      </div>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.5rem', fontWeight: 800, color: '#f4f6fe', marginBottom: '0.5rem' }}>
        बुकिंग भेज दिया गया! 🎉
      </h2>
      <p style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', color: '#a8abb2', marginBottom: '0.25rem' }}>
        {service && <><span style={{ color: '#ff9159' }}>{service}</span> at </>}
        <span style={{ color: '#ff9159' }}>{biz}</span>
      </p>
      {date && time && (
        <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: '#72767c', marginBottom: '1rem' }}>
          {date} • {time}
        </p>
      )}
      <div style={{ background: '#151a20', borderRadius: '1rem', padding: '1rem', marginBottom: '1.5rem', maxWidth: '320px' }}>
        <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: '#a8abb2', lineHeight: 1.6 }}>
          अपना बुकिंग रिक्वेस्ट WhatsApp पर भेज दिया गया बा। सेवा प्रदाता जल्दी से संपर्क करिहें। 🙏
        </p>
      </div>
      <button onClick={() => navigate('/')} style={{
        fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9375rem', fontWeight: 700,
        background: 'linear-gradient(135deg, #ff9159, #ff7a2f)', color: '#401500',
        padding: '0.875rem 2rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
        boxShadow: '0 8px 25px rgba(255,122,47,0.3)',
      }}>
        वापस होम जाईं
      </button>
    </div>
  );
}
