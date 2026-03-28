import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const HINDI_QUOTES = [
  { q: 'मंजिलें उन्हीं को मिलती हैं, जिनके सपनों में जान होती है। पंखों से कुछ नहीं होता, हौसलों से उड़ान होती है।', a: 'अज्ञात' },
  { q: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।', a: 'भगवद गीता' },
  { q: 'मुश्किलों से भाग जाना आसान होता है, हर पहलू ज़िंदगी का इम्तिहान होता है।', a: 'अज्ञात' },
  { q: 'जब रास्तों पर चलते चलते मंजिल का ख्याल ना आये तो आप सही रास्ते पर है।', a: 'अज्ञात' },
  { q: 'हार जीत तो जिंदगी का हिस्सा है, कोशिश करना हमारा काम है।', a: 'अज्ञात' },
  { q: 'संघर्ष जितना कठिन होगा, जीत उतनी ही शानदार होगी।', a: 'स्वामी विवेकानंद' }
];

export default function QuoteWidget() {
  const { theme, settings } = useAppContext();
  const [quote, setQuote] = useState(HINDI_QUOTES[0].q);
  const [author, setAuthor] = useState(HINDI_QUOTES[0].a);

  useEffect(() => {
    if (settings && settings.customQuoteEnabled && settings.customQuoteText) {
      setQuote(settings.customQuoteText);
      setAuthor('Admin');
    } else {
      const random = HINDI_QUOTES[Math.floor(Math.random() * HINDI_QUOTES.length)];
      setQuote(random.q);
      setAuthor(random.a);
    }
  }, [settings]);

  return (
    <div className="refractive-glass" style={{
      padding: '1rem',
      margin: '0 1.25rem 1rem',
      position: 'relative', overflow: 'hidden'
    }}>
      <i className="ph-fill ph-quotes" style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '5rem', color: 'var(--primary)', opacity: 0.1, zIndex: 0 }}></i>
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div className="clay-btn" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className="ph-fill ph-lightbulb" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}></i>
        </div>
        <div>
          <h4 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            आज का विचार
          </h4>
          <p style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface)', lineHeight: 1.5, marginBottom: '0.375rem' }}>
            "{quote}"
          </p>
          <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: 'var(--on-surface-variant)', textAlign: 'right', fontWeight: 700 }}>
            — {author}
          </p>
        </div>
      </div>
    </div>
  );
}
