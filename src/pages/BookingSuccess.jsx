import { useNavigate, useSearchParams } from 'react-router-dom';

export default function BookingSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const biz = params.get('biz') || '';
  const service = params.get('service') || '';
  const date = params.get('date') || '';
  const time = params.get('time') || '';
  const payment = params.get('payment') || 'pay_later'; // 'pay_now' | 'pay_later'

  const isPaid = payment === 'pay_now';

  return (
    <div style={{
      background: 'transparent',
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2.5rem 1.25rem', textAlign: 'center',
    }}>

      {/* Icon */}
      <div style={{
        width: '100px', height: '100px', borderRadius: '50%',
        background: isPaid ? 'rgba(255,140,0,0.1)' : 'rgba(34,197,94,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.75rem',
        animation: 'bounceIn 0.65s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: isPaid ? '0 0 40px rgba(255,140,0,0.15)' : '0 0 40px rgba(34,197,94,0.15)',
        border: `2px solid ${isPaid ? 'rgba(255,140,0,0.2)' : 'rgba(34,197,94,0.2)'}`,
      }}>
        <i
          className={isPaid ? 'ph-fill ph-seal-check' : 'ph-fill ph-check-circle'}
          style={{ fontSize: '3rem', color: isPaid ? 'var(--primary)' : '#22c55e' }}
        />
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily: "'Plus Jakarta Sans'", fontSize: '1.75rem', fontWeight: 900,
        color: 'var(--on-surface)', marginBottom: '0.5rem',
      }}>
        {isPaid ? 'Booking Confirmed! 🎉' : 'Booking Received! 🎉'}
      </h2>

      {/* Subtitle */}
      <p style={{ fontFamily: "'Manrope'", fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '0.375rem' }}>
        {service && <><span style={{ color: 'var(--primary)' }}>{service}</span> at </>}
        <span style={{ color: 'var(--primary)' }}>{biz}</span>
      </p>
      {date && time && (
        <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface-variant)', opacity: 0.7, marginBottom: '1.5rem' }}>
          {date} • {time}
        </p>
      )}

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        background: isPaid ? 'var(--primary-container)' : 'var(--secondary-container)',
        border: `1px solid ${isPaid ? 'var(--primary)' : 'var(--secondary)'}33`,
        borderRadius: '999px', padding: '0.5rem 1.25rem', marginBottom: '1.5rem',
      }}>
        <i
          className={isPaid ? 'ph-fill ph-lightning' : 'ph-fill ph-hand-coins'}
          style={{ color: isPaid ? 'var(--primary)' : 'var(--secondary)', fontSize: '0.875rem' }}
        />
        <span style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 800, color: isPaid ? 'var(--primary)' : 'var(--secondary)' }}>
          {isPaid ? 'Payment Initiated' : 'Pay After Service'}
        </span>
      </div>

      <div className="clay-card" style={{
        padding: '1.5rem', marginBottom: '2rem',
        maxWidth: '340px', width: '100%',
        background: 'var(--surface-container-high)',
      }}>
        <p style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>
          {isPaid
            ? 'Your payment is being processed. Our team will contact you shortly. 🙏'
            : 'Your booking is confirmed! Our team will reach out to you shortly to schedule the service. 🙏'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem', maxWidth: '300px', width: '100%', textAlign: 'left' }}>
        {[
          { icon: 'ph-check-circle', text: 'Booking confirmed', done: true },
          { icon: isPaid ? 'ph-lightning' : 'ph-phone-call', text: isPaid ? 'Payment initiated' : 'Provider will call you', done: isPaid },
          { icon: 'ph-wrench', text: 'Service at your doorstep', done: false },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: step.done ? 'var(--secondary-container)' : 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i
                className={`ph-fill ${step.icon}`}
                style={{ fontSize: '0.875rem', color: step.done ? 'var(--secondary)' : 'var(--on-surface-variant)', opacity: step.done ? 1 : 0.4 }}
              />
            </div>
            <span style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: step.done ? 800 : 600, color: step.done ? 'var(--on-surface)' : 'var(--on-surface-variant)', opacity: step.done ? 1 : 0.6 }}>
              {step.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', width: '100%', maxWidth: '340px' }}>
        <button
          id="booking-success-home-btn"
          onClick={() => navigate('/')}
          className="clay-btn"
          style={{
            fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 800,
            background: 'var(--gradient-primary)', color: 'var(--on-primary)',
            padding: '1.125rem 2.5rem', borderRadius: '1.25rem', border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(255,140,0,0.3)',
          }}
        >
          Back to Home
        </button>
        <button
          id="booking-success-account-btn"
          onClick={() => navigate('/account')}
          style={{
            fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800,
            color: 'var(--primary)', background: 'transparent',
            padding: '0.75rem', border: 'none', cursor: 'pointer',
          }}
        >
          My Bookings →
        </button>
      </div>

      <style>{`
        @keyframes bounceIn {
          0%   { opacity: 0; transform: scale(0.4); }
          60%  { opacity: 1; transform: scale(1.1); }
          80%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
