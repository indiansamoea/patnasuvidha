import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function AiAssistant() {
  const { lang, businesses } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([{ role: 'assistant', text: lang === 'hi' ? 'नमस्कार! मैं पटना सुविधा सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?' : 'Hello! I am the Patna Suvidha Assistant. How can I help you today?' }]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat]);

  const handleSend = async () => {
    if (!msg.trim() || loading) return;
    const userMsg = msg;
    setMsg('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Create context: only use top 50 businesses to keep payload safe
      const context = businesses.slice(0, 50).map(b => `${b.name} (${b.category}) in ${b.address}`).join(', ');
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context })
      });
      
      if (!res.ok) {
        throw new Error(lang === 'hi' ? 'सर्वर से संपर्क नहीं हो पाया' : 'Could not reach server');
      }

      const data = await res.json();
      setChat(prev => [...prev, { role: 'assistant', text: data.response || (lang === 'hi' ? 'माफ़ करें, मुझे समझ नहीं आया' : 'Sorry, I am having trouble connecting.') }]);
    } catch (e) {
      setChat(prev => [...prev, { role: 'assistant', text: lang === 'hi' ? 'माफ़ करें, अभी सहायक उपलब्ध नहीं है। कृपया थोड़ी देर बाद प्रयास करें।' : 'Sorry, the assistant is temporarily unavailable. Please try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();
  const isServiceLanding = location.pathname.startsWith('/service/');

  return (
    <div style={{ position: 'fixed', bottom: isServiceLanding ? '180px' : '90px', right: '20px', zIndex: 1000 }}>
      {/* FAB */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '60px', height: '60px', borderRadius: '50%', 
          background: 'linear-gradient(135deg, #ff9159, #ff7a2f)', 
          border: 'none', boxShadow: '0 8px 32px rgba(255,122,47,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          color: '#fff', fontSize: '24px'
        }}
      >
        <i className={isOpen ? 'ph-bold ph-x' : 'ph-fill ph-chat-circle-dots'}></i>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{ 
          position: 'absolute', bottom: '75px', right: '0', width: '320px', height: '450px',
          background: '#151a20', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.5)'
        }}>
          <div style={{ background: '#ff9159', padding: '1rem', color: '#401500', fontWeight: 800, fontSize: '0.9rem' }}>
            Patna AI Assistant
          </div>
          
          <div ref={scrollRef} style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chat.map((c, i) => (
              <div key={i} style={{ 
                alignSelf: c.role === 'user' ? 'flex-end' : 'flex-start',
                background: c.role === 'user' ? '#ff9159' : '#21262e',
                color: c.role === 'user' ? '#401500' : '#f4f6fe',
                padding: '0.75rem', borderRadius: '1rem', maxWidth: '85%', fontSize: '0.8125rem',
                borderBottomRightRadius: c.role === 'user' ? '0' : '1rem',
                borderBottomLeftRadius: c.role === 'assistant' ? '0' : '1rem'
              }}>
                {c.text}
              </div>
            ))}
            {loading && <div style={{ alignSelf: 'flex-start', color: '#ff9159', fontSize: '0.75rem' }}>Thinking...</div>}
          </div>

          <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem' }}>
            <input 
              value={msg} onChange={e => setMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              style={{ flex: 1, background: '#21262e', border: '1px solid rgba(255,255,255,0.12)', padding: '0.625rem 1rem', borderRadius: '999px', color: '#f4f6fe', fontSize: '0.8125rem', outline: 'none' }}
            />
            <button onClick={handleSend} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ff9159', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <i className="ph-bold ph-paper-plane-right" style={{ color: '#401500' }}></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
