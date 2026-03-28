import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const GEMINI_API_KEY = "AIzaSyBUYNd7YWP-samFVs2DPcA8zNzX26p7ttY";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'model', content: 'Namaste! I am your hyper-advanced Suvidha AI powered by Gemini 2.0 Flash. How can I assist you today?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  // We gently draw context from our AppContext to feed the AI!
  const { lang, allBusinesses } = useAppContext();

  useEffect(() => {
    if (isOpen && endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const generateSystemPrompt = () => {
    // We pass dynamic list of businesses to the prompt!
    const bizNames = allBusinesses && allBusinesses.length > 0 ? allBusinesses.map(b => b.name).join(', ') : 'Various premium local businesses';
    
    return `You are "Suvidha AI", an exclusive digital concierge for the Patna Suvidha app (a local business directory in Patna, Bihar). 
    Tone: Helpful, polite, deeply knowledgeable about Patna, very enthusiastic. Speak English and Hindi perfectly (matching the user's language).
    Current businesses listed on the platform include: ${bizNames}. 
    Remind users they can go to the 'Explore' tab to search, or 'Categories' on the Home page.
    Keep answers under 3-4 sentences. Format nicely using markdown if needed, but strictly reply to the user prompt.`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const historyItems = messages.slice(1).map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      
      const payload = {
        system_instruction: {
          parts: [{ text: generateSystemPrompt() }]
        },
        contents: [
          ...historyItems,
          { role: 'user', parts: [{ text: userMsg }] }
        ]
      };

      console.log("Suvidha AI Request:", payload);

      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("Suvidha AI Response:", data);
      
      if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
        setMessages(prev => [...prev, { role: 'model', content: data.candidates[0].content.parts[0].text }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: 'model', content: `API Error (${data.error.code}): ${data.error.message}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: `Trouble connecting to gemini-2.0-flash-exp. Please check console for full error. Raw data: ${JSON.stringify(data).slice(0, 100)}...` }]);
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "A network error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div style={{ position: 'fixed', bottom: '100px', right: '1.25rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="refractive-glass" style={{ width: '320px', height: '400px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, border: '1px solid var(--liquid-border)', boxShadow: 'var(--shadow-glow)' }}>
          {/* Header */}
          <div className="refractive-glass" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--liquid-border)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="ph-fill ph-sparkle text-glowing" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}></i>
                <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>Suvidha AI</span>
             </div>
             <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                <i className="ph-bold ph-x" style={{ fontSize: '1.25rem' }}></i>
             </button>
          </div>
          
          {/* Messages */}
          <div className="hide-scrollbar" style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--surface-container-low)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                 <div style={{ 
                     background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--surface)',
                     color: msg.role === 'user' ? 'var(--on-primary)' : 'var(--on-surface)',
                     padding: '0.75rem 1rem',
                     borderRadius: '1rem',
                     borderBottomRightRadius: msg.role === 'user' ? '4px' : '1rem',
                     borderBottomLeftRadius: msg.role === 'model' ? '4px' : '1rem',
                     fontFamily: "'Manrope'", fontSize: '0.8125rem', fontWeight: 600,
                     boxShadow: msg.role === 'user' ? '0 4px 12px rgba(255,153,51,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                     border: msg.role === 'model' ? '1px solid var(--outline-variant)' : 'none'
                 }}>
                   {msg.content}
                 </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                 <div className="animate-pulse" style={{ background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '1rem', borderBottomLeftRadius: '4px', border: '1px solid var(--outline-variant)', display: 'flex', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animationDelay: '150ms' }}></div>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animationDelay: '300ms' }}></div>
                 </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
          
          {/* Input Area */}
          <div style={{ padding: '0.75rem', background: 'var(--surface)', borderTop: '1px solid var(--liquid-border)', display: 'flex', gap: '0.5rem' }}>
             <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about Patna..." 
                style={{ flex: 1, background: 'var(--surface-container-high)', border: 'none', borderRadius: '999px', padding: '0.75rem 1rem', fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface)', outline: 'none' }} 
             />
             <button onClick={handleSend} disabled={isLoading || !input.trim()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', opacity: (isLoading || !input.trim()) ? 0.5 : 1 }}>
                <i className="ph-fill ph-paper-plane-right" style={{ color: '#fff', fontSize: '1.25rem' }}></i>
             </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button className="clay-btn" onClick={() => setIsOpen(!isOpen)} style={{ 
        width: '56px', height: '56px', borderRadius: '28px', 
        background: 'var(--gradient-primary)', color: 'var(--on-primary)', 
        border: '3px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 0, boxShadow: 'var(--shadow-glow)', transition: 'transform var(--transition-base)'
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <i className={isOpen ? "ph-bold ph-x" : "ph-fill ph-sparkle"} style={{ fontSize: '1.75rem' }}></i>
      </button>

    </div>
  );
}
