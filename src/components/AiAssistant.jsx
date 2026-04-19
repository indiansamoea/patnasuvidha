import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const chatVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.92, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', damping: 25, stiffness: 300 } }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, x: -20 },
  visible: { opacity: 1, scale: 1, x: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
};

export default function AiAssistant() {
  const { lang, businesses = [], categories = [] } = useAppContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([
    { role: 'assistant', text: lang === 'hi' ? 'प्रणाम! मैं आपका "पटना सुविधा सुपीरियर" सहायक हूँ। आज शहर की किस सेवा में आपकी मदद कर सकता हूँ?' : 'Pranaam! I am your Patna Suvidha Elite Concierge. How can I assist you with our premium city services today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chat, loading]);

  const quickActions = useMemo(() => [
    { id: '1', label: lang === 'hi' ? 'एसी रिपेयर?' : 'AC Repair?', query: 'I want to book AC service' },
    { id: '2', label: lang === 'hi' ? 'प्लबंर खोजें' : 'Find Plumber', query: 'Find me the best plumber' },
    { id: '3', label: lang === 'hi' ? 'सफाई' : 'Cleaning', query: 'Need home cleaning expert' },
  ], [lang]);

  // Proactive Intelligence: Detect Category Mentions
  const detectCategoryLink = (text) => {
    const t = text.toLowerCase();
    const match = categories.find(c => t.includes(c.id) || t.includes(c.name.toLowerCase()));
    return match ? match.id : null;
  };

  const handleSend = async (textOverride) => {
    const userMsg = textOverride || msg;
    if (!userMsg.trim() || loading) return;
    
    setMsg('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const bizContext = businesses.slice(0, 15).map(b => `${b.name} (${b.category})`).join(', ');
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context: bizContext })
      });
      
      if (!res.ok) throw new Error('Network error');

      const data = await res.json();
      const aiText = data.response;
      const catLink = detectCategoryLink(userMsg + " " + aiText);

      setChat(prev => [
        ...prev, 
        { role: 'assistant', text: aiText || (lang === 'hi' ? 'क्षमा करें, रिस्पॉन्स में देरी हो रही है।' : 'Apologies, I am having trouble responding.'), link: catLink }
      ]);
    } catch (e) {
      setChat(prev => [...prev, { role: 'assistant', text: lang === 'hi' ? 'कनेक्शन थोड़ा कमज़ोर है। फिर से पूछें?' : 'Connection is a bit weak. Shall we try again?' }]);
    } finally {
      setLoading(false);
    }
  };

  const isServiceLanding = location.pathname.startsWith('/service/');

  return (
    <div style={{ position: 'fixed', bottom: isServiceLanding ? '140px' : '96px', right: '1.25rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* ─── Premium Chat Window ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial="hidden" animate="visible" exit="hidden"
            variants={chatVariants}
            style={{ 
              width: '360px', height: '580px', marginBottom: '1.5rem',
              borderRadius: '2.5rem', border: '1px solid hsla(var(--p-h), 100%, 50%, 0.15)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden', 
              boxShadow: '0 32px 80px rgba(0,0,0,0.5)', 
              background: 'linear-gradient(135deg, rgba(30,30,35,0.85), rgba(15,15,20,0.95))', 
              backdropFilter: 'blur(40px)'
            }}
          >
            {/* Elite Header */}
            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
                  <i className="ph-fill ph-sparkle" style={{ color: '#fff', fontSize: '1.5rem' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 950, color: '#fff', fontSize: '1rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Suvidha Elite</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                    <p style={{ fontSize: '0.625rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Superior Concierge</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                <i className="ph-bold ph-caret-down" style={{ fontSize: '1.25rem' }} />
              </button>
            </div>
            
            {/* Dynamic Conversation Area */}
            <div ref={scrollRef} style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="hide-scrollbar">
              {chat.map((c, i) => (
                <div key={i} style={{ alignSelf: c.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                   <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    style={{ 
                      background: c.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      padding: '1rem 1.25rem', borderRadius: '1.5rem', fontSize: '0.9375rem', fontWeight: 600,
                      lineHeight: 1.62, borderBottomRightRadius: c.role === 'user' ? '0.25rem' : '1.5rem',
                      borderBottomLeftRadius: c.role === 'assistant' ? '0.25rem' : '1.5rem',
                      boxShadow: c.role === 'user' ? 'var(--shadow-glow-small)' : 'none',
                      border: c.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}
                  >
                    {c.text}
                  </motion.div>

                  {/* Proactive Smart Card */}
                  {c.link && (
                    <motion.button 
                      variants={cardVariants} initial="hidden" animate="visible"
                      onClick={() => navigate(`/service/${c.link}`)}
                      style={{ 
                        marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: '1rem', 
                        background: 'rgba(255,255,255,0.1)', border: '1px solid var(--primary)',
                        display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', textAlign: 'left', width: '100%'
                      }}
                    >
                       <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <i className="ph-fill ph-rocket-launch" style={{ color: '#fff', fontSize: '1rem' }} />
                       </div>
                       <div>
                         <p style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase' }}>Smart Link</p>
                         <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.8125rem' }}>Open {c.link} category</p>
                       </div>
                    </motion.button>
                  )}
                </div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '0.625rem', paddingLeft: '0.5rem', alignItems: 'center' }}>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderColor: 'var(--primary)', borderTopColor: 'transparent', borderWidth: '3px' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>ORCHESTRATING...</span>
                </motion.div>
              )}
            </div>

            {/* Premium Control Bar */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
               {/* Contextual Quick Actions */}
               <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.25rem' }} className="hide-scrollbar">
                {quickActions.map(act => (
                  <motion.button 
                    key={act.id} whileHover={{ y: -3, background: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(act.query)}
                    style={{ flexShrink: 0, padding: '0.625rem 1.125rem', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', fontWeight: 800, color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {act.label}
                  </motion.button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.875rem' }}>
                <input 
                  value={msg} onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={lang === 'hi' ? 'पटना सुविधा से पूछें...' : 'Ask Patna Suvidha Elite...'}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem 1.5rem', borderRadius: '1.5rem', color: '#fff', fontSize: '0.9375rem', fontWeight: 600, outline: 'none' }}
                />
                <motion.button 
                  whileHover={{ scale: 1.1, boxShadow: 'var(--shadow-glow)' }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleSend()}
                  style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--gradient-primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
                >
                  <i className="ph-bold ph-paper-plane-right" style={{ color: '#fff', fontSize: '1.375rem' }} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Floating Elite Trigger (FAB) ─── */}
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 2 }} whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '72px', height: '72px', borderRadius: '24px', 
          background: 'var(--gradient-primary)', 
          border: 'none', boxShadow: '0 12px 32px rgba(255,140,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          color: '#fff', position: 'relative'
        }}
      >
        <i className={isOpen ? 'ph-bold ph-x' : 'ph-fill ph-sparkle'} style={{ fontSize: '2rem' }} />
        {!isOpen && (
          <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#22c55e', padding: '0.375rem 0.625rem', borderRadius: '99px', fontSize: '0.625rem', fontWeight: 950, border: '3px solid var(--surface)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            LIVE
          </div>
        )}
      </motion.button>

      <style>{`
        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
        .pulse-dot { animation: pulse 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
}
