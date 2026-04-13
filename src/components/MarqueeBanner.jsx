import { useAppContext } from '../context/AppContext';

export default function MarqueeBanner() {
  const { settings = {} } = useAppContext() || {};

  if (!settings.marqueeEnabled || !settings.marqueeText) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #ff7a2f, #fbb423, #ff7a2f)',
      overflow: 'hidden', whiteSpace: 'nowrap',
      padding: '0.4375rem 0',
    }}>
      <div style={{
        display: 'inline-block',
        animation: 'marquee 25s linear infinite',
        fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 700,
        color: '#401500',
        paddingLeft: '100%',
      }}>
        {settings.marqueeText}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
