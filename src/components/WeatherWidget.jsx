import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export default function WeatherWidget() {
  const { lang } = useAppContext();
  const [data, setData] = useState({ weather: null, aqi: null });

  useEffect(() => {
    // Patna coordinates: 25.6093° N, 85.1376° E
    Promise.all([
      fetch('https://api.open-meteo.com/v1/forecast?latitude=25.6093&longitude=85.1376&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FKolkata').then(r => r.json()),
      fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=25.6093&longitude=85.1376&current=european_aqi&timezone=Asia%2FKolkata').then(r => r.json())
    ])
    .then(([weatherRes, aqiRes]) => {
      setData({
        weather: weatherRes.current || null,
        aqi: aqiRes.current?.european_aqi || null
      });
    })
    .catch(() => {});
  }, []);

  if (!data.weather) return null;

  const temp = Math.round(data.weather.temperature_2m);
  const humidity = data.weather.relative_humidity_2m;
  const code = data.weather.weather_code;
  const aqi = data.aqi;

  // Weather code to emoji/label
  const getWeather = (c) => {
    if (c === 0) return { emoji: '☀️', en: 'Clear Sky', hi: 'साफ आसमान' };
    if (c <= 3) return { emoji: '⛅', en: 'Partly Cloudy', hi: 'कुछ बादल' };
    if (c <= 49) return { emoji: '🌫️', en: 'Foggy', hi: 'कोहरा' };
    if (c <= 59) return { emoji: '🌧️', en: 'Drizzle', hi: 'बूंदा बांदी' };
    if (c <= 69) return { emoji: '🌧️', en: 'Rain', hi: 'बारिश' };
    if (c <= 79) return { emoji: '🌨️', en: 'Snow', hi: 'बर्फबारी' };
    if (c <= 99) return { emoji: '⛈️', en: 'Thunderstorm', hi: 'आंधी-तूफान' };
    return { emoji: '🌤️', en: 'Fair', hi: 'ठीक' };
  };

  const getAQILabel = (val) => {
    if (!val) return { label: '', color: 'var(--on-surface-variant)' };
    if (val <= 50) return { label: 'Good', hi: 'अच्छा', color: '#138808' }; // Green
    if (val <= 100) return { label: 'Moderate', hi: 'सामान्य', color: '#fbb423' }; // Yellow
    if (val <= 150) return { label: 'Poor', hi: 'खराब', color: '#f97316' }; // Orange
    return { label: 'Bad', hi: 'बहुत खराब', color: '#dc2626' }; // Red
  };

  const w = getWeather(code);
  const aqiInfo = getAQILabel(aqi);

  return (
    <div style={{
      background: 'var(--surface-container)',
      borderRadius: '1rem', padding: '0.75rem 1rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      margin: '0 1.25rem 0.75rem',
      border: '1px solid var(--outline-variant)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <span style={{ fontSize: '1.75rem' }}>{w.emoji}</span>
        <div>
          <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 800, color: 'var(--on-surface)', lineHeight: 1 }}>
            {temp}°C
          </p>
          <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
            {lang === 'hi' ? w.hi : w.en}
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 700, color: 'var(--primary)' }}>
          {lang === 'hi' ? 'पटना' : 'Patna'} <i className="ph-fill ph-map-pin"></i>
        </p>
        <p style={{ fontFamily: "'Manrope'", fontSize: '0.5625rem', color: 'var(--on-surface-variant)', marginTop: '0.125rem' }}>
          💧 {humidity}% {lang === 'hi' ? 'नमी' : 'Humidity'}
        </p>
        {aqi && (
          <p style={{ fontFamily: "'Manrope'", fontSize: '0.5625rem', color: aqiInfo.color, fontWeight: 700, marginTop: '0.125rem' }}>
            AQI: {aqi} ({lang === 'hi' ? aqiInfo.hi : aqiInfo.label})
          </p>
        )}
      </div>
    </div>
  );
}
