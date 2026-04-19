import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const ticketVariants = {
  hidden: { y: 100, opacity: 0, scale: 0.8, rotate: -3, filter: 'blur(20px)' },
  visible: { 
    y: 0, opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)',
    transition: { type: 'spring', damping: 22, stiffness: 120, delay: 0.4 } 
  }
};

export default function BookingSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const biz = params.get('biz') || 'Patna Suvidha';
  const service = params.get('service') || 'General Service';
  const date = params.get('date') || 'Today';
  const time = params.get('time') || 'ASAP';
  const payment = params.get('payment') || 'pay_later';
  const bookingId = params.get('id') || 'PS-' + Math.random().toString(36).substr(2, 6).toUpperCase();

  const isPaid = payment === 'pay_now';
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial="hidden" animate="visible" variants={containerVariants}
      style={{
        background: 'var(--surface)',
        minHeight: '100vh', padding: '3.5rem 1.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', overflow: 'hidden'
      }}
    >
      {/* ─── Cinematic Background ─── */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', zIndex: 0 }}>
         <div style={{ position: 'absolute', top: '15%', right: '10%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%' }} />
         <div style={{ position: 'absolute', bottom: '15%', left: '10%', width: '350px', height: '350px', background: 'var(--secondary)', filter: 'blur(120px)', opacity: 0.1, borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        
        {/* Success Badge */}
        <motion.div 
          initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: 'var(--shadow-glow)', border: '4px solid rgba(255,255,255,0.2)' }}
        >
          <i className="ph-fill ph-check-circle" style={{ fontSize: '3rem', color: '#fff' }} />
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 950, color: 'var(--on-surface)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.75rem' }}
        >
          {isPaid ? 'BOOKED!' : 'QUEUED!'}
        </motion.h2>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '3rem', opacity: 0.7 }}>
          Your bespoke service is being orchestrated.
        </p>

        {/* ─── THE FLOATING TICKET ─── */}
        <motion.div 
          variants={ticketVariants}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
            backdropFilter: 'blur(32px)',
            borderRadius: '2.5rem', border: '1px solid rgba(255,255,255,0.1)',
            padding: '2rem', position: 'relative', marginBottom: '3rem',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)'
          }}
        >
          {/* Ticket Cutouts */}
          <div style={{ position: 'absolute', left: '-12px', top: '70%', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface)', borderRight: '1px solid rgba(255,255,255,0.1)', zIndex: 2 }} />
          <div style={{ position: 'absolute', right: '-12px', top: '70%', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface)', borderLeft: '1px solid rgba(255,255,255,0.1)', zIndex: 2 }} />
          <div style={{ position: 'absolute', left: '20px', right: '20px', top: '71.5%', height: '1px', borderBottom: '1.5px dashed rgba(255,255,255,0.15)', zIndex: 1 }} />

          <div style={{ textAlign: 'left', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <div>
                <p style={{ fontSize: '0.625rem', fontWeight: 950, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Service Requisition</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 950, color: '#fff', lineHeight: 1.1 }}>{service}</h3>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>at {biz}</p>
             </div>
             <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.625rem', fontWeight: 950, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Ticket Ref</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 900, color: '#fff', opacity: 0.8 }}>#{bookingId.slice(-6)}</p>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem', textAlign: 'left' }}>
             <div>
                <p style={{ fontSize: '0.625rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>SCHEDULE</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#fff' }}>{date}<br/>{time}</p>
             </div>
             <div>
                <p style={{ fontSize: '0.625rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>SETTLEMENT</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#fff' }}>{isPaid ? 'Prepaid Online' : 'Cash On Door'}</p>
             </div>
          </div>

          {/* Liquid Progress Bar */}
          <div style={{ marginTop: '2.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--secondary)' }}>ORCHESTRATING...</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>40%</span>
             </div>
             <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', padding: '1px' }}>
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
                  style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', boxShadow: '0 0 10px var(--primary)' }} 
                />
             </div>
          </div>
        </motion.div>

        {/* Celebratory Particles */}
        <AnimatePresence>
          {showConfetti && Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{ 
                scale: [0, 1.5, 0], 
                x: Math.cos(i * 30 * Math.PI / 180) * 120, 
                y: Math.sin(i * 30 * Math.PI / 180) * 120 - 150
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                position: 'absolute', top: '20%', left: '50%',
                width: '10px', height: '10px', borderRadius: '3px',
                background: i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)',
                opacity: 0.6, zIndex: 0
              }}
            />
          ))}
        </AnimatePresence>

        {/* Global Action Dock */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
           <motion.button 
             initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
             onClick={() => navigate('/')}
             className="clay-card"
             style={{ padding: '1.25rem', borderRadius: '2rem', border: 'none', background: 'var(--surface-container-high)', color: 'var(--on-surface)', fontWeight: 950, fontSize: '0.875rem', cursor: 'pointer' }}
           >
             HOME
           </motion.button>
           <motion.button 
             initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.3 }}
             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
             onClick={() => navigate('/bookings')}
             style={{ padding: '1.25rem', borderRadius: '2rem', border: 'none', background: 'var(--gradient-primary)', color: '#fff', fontWeight: 950, fontSize: '0.875rem', cursor: 'pointer', boxShadow: 'var(--shadow-glow-small)' }}
           >
             TRACK
           </motion.button>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => {
            const msg = `🎭 I just booked a *${service}* in Patna using *Patna Suvidha*! 

The experience was so Bespoke. Check it out: 
🔗 https://patnasuvidha.com

#PatnaSuvidha #EliteServices #Patna`;
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
          }}
          style={{ width: '100%', padding: '1rem', borderRadius: '1.5rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontWeight: 900, fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <i className="ph ph-share-network" style={{ fontSize: '1.125rem' }}></i>
          SHARE REQUISITION
        </motion.button>
      </div>
    </motion.div>
  );
}
