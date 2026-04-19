// The Central Source of Truth for Patna Suvidha's "Bespoke" Service Ecosystem.
// These serve as fallbacks and templates for seeding the Firestore database.

export const CATEGORIES = [
  { 
    id: 'plumber', 
    name: 'Plumber', nameHi: 'प्लंबर', 
    icon: 'ph-wrench', 
    color: '#60a5fa', 
    gradient: ['#60a5fa', '#3b82f6'],
    hero: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80',
    title: 'Professional Plumbing Services', titleHi: 'प्रोफेशनल प्लंबिंग सेवा',
    desc: 'Leaky taps, pipe bursts, bathroom renovation, RO installation — our verified plumbers handle it all, fast and affordably.',
    descHi: 'हमारे सत्यापित प्लंबर पटना में आपके दरवाजे पर तेजी और किफायती तरीके से काम करते हैं।',
    stats: { rating: '4.8', bookings: '2k+', experience: '8+ Years' },
    services: [
      { name: 'Tap Repair', price: 149 }, { name: 'Pipe Fitting', price: 249 }, { name: 'Toilet Repair', price: 199 },
      { name: 'Water Tank Cleaning', price: 499 }, { name: 'RO Service', price: 349 }, { name: 'Water Heater Repair', price: 299 },
    ],
    features: [
      { icon: 'ph-shield-check', title: '30-Day Service Warranty' },
      { icon: 'ph-user-check', title: 'Background Verified Experts' },
      { icon: 'ph-clock', title: '60 Min Express Arrival' },
    ],
    faqs: [
      { q: 'Is there any visiting charge?', a: 'We charge a minimal ₹99 as visiting fees which is adjusted in your final bill.' },
      { q: 'What if the issue recurs?', a: 'All our plumbing services come with a 30-day rework warranty.' }
    ]
  },
  { 
    id: 'electrician', 
    name: 'Electrician', nameHi: 'इलेक्ट्रीशियन', 
    icon: 'ph-lightning', 
    color: '#fbbf24', 
    gradient: ['#fbbf24', '#f59e0b'],
    hero: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
    title: 'Certified Electrical Services', titleHi: 'प्रमाणित इलेक्ट्रिकल सेवा',
    desc: 'Fan installation, full-house wiring, MCB repair, inverter setup — our certified electricians solve every issue safely.',
    descHi: 'हमारे प्रमाणित इलेक्ट्रीशियन हर बिजली की समस्या सुरक्षित और समय पर हल करते हैं।',
    stats: { rating: '4.9', bookings: '5k+', experience: '12+ Years' },
    services: [
      { name: 'Fan Installation', price: 199 }, { name: 'House Wiring', price: 999 }, { name: 'Switch Repair', price: 99 },
      { name: 'MCB/Fuse Repair', price: 149 }, { name: 'Inverter Setup', price: 399 },
    ]
  },
  { 
    id: 'ac-repair', 
    name: 'AC Repair', nameHi: 'एसी रिपेयर', 
    icon: 'ph-snowflake', 
    color: '#22d3ee', 
    gradient: ['#22d3ee', '#06b6d4'],
    hero: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1200&q=80',
    title: 'Expert AC Repair & Service', titleHi: 'एक्सपर्ट एसी रिपेयर और सर्विस',
    desc: 'Gas refill, deep cleaning, installation, and all-brand AC repair. Same-day service available across Patna.',
    descHi: 'गैस रिफिल, डीप क्लीनिंग, इंस्टालेशन और सभी ब्रांड एसी मरम्मत।',
    services: [
      { name: 'AC Gas Refill', price: 799 }, { name: 'AC Deep Clean', price: 599 }, { name: 'AC Installation', price: 999 },
      { name: 'AC Repair', price: 449 },
    ]
  },
  { 
    id: 'salon', 
    name: 'Salon & Spa', nameHi: 'सैलून', 
    icon: 'ph-scissors', 
    color: '#e879f9', 
    gradient: ['#e879f9', '#d946ef'],
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    title: 'Premium Salon at Home', titleHi: 'घर पर प्रीमियम सैलून',
    desc: 'Haircuts, facials, bridal makeup, and more. Experienced stylists at your doorstep.',
    services: [
      { name: 'Haircut (Men)', price: 149 }, { name: 'Haircut (Women)', price: 249 }, { name: 'Facial', price: 499 },
      { name: 'Bridal Makeup', price: 2999 },
    ]
  },
  { 
    id: 'cleaning', 
    name: 'Cleaning', nameHi: 'सफाई सेवा', 
    icon: 'ph-broom', 
    color: '#2dd4bf', 
    gradient: ['#2dd4bf', '#14b8a6'],
    hero: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    title: 'Professional Home Cleaning', titleHi: 'प्रोफेशनल होम क्लीनिंग',
    desc: 'Deep cleaning, sofa wash, bathroom sanitization. Eco-safe products used.',
    services: [
      { name: 'Full Home Deep Clean', price: 1499 }, { name: 'Sofa Cleaning', price: 699 }, { name: 'Bathroom Deep Clean', price: 349 },
    ]
  },
  { 
    id: 'doctor', 
    name: 'Doctor', nameHi: 'डॉक्टर', 
    icon: 'ph-first-aid-kit', 
    color: '#f87171', 
    gradient: ['#f87171', '#ef4444'],
    hero: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1200&q=80',
    services: [
      { name: 'General Consultation', price: 299 }, { name: 'Health Checkup', price: 799 },
    ]
  },
  { 
    id: 'packers-movers', 
    name: 'Packers & Movers', nameHi: 'पैकर्स और मूवर्स', 
    icon: 'ph-truck', 
    color: '#94a3b8', 
    gradient: ['#94a3b8', '#64748b'],
    hero: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=1200&q=80',
    services: [
      { name: 'Local Shifting (1BHK)', price: 1999 }, { name: 'Local Shifting (2BHK)', price: 2999 },
    ]
  },
];

export function getCategoryById(id, dynamicCategories = []) {
  const combined = dynamicCategories.length > 0 ? dynamicCategories : CATEGORIES;
  return combined.find(c => c.id === id) || combined[0];
}

export function getCategoryName(category, lang = 'en') {
  if (!category) return '';
  return lang === 'hi' ? (category.nameHi || category.name) : category.name;
}
