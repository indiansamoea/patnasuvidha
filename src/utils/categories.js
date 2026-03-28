export const CATEGORIES = [
  { id: 'all', name: 'All Services', nameHi: 'सभी सेवाएं', icon: 'ph-squares-four', color: '#ff9159', gradient: ['#ff9159', '#ff7a2f'] },
  { id: 'electrician', name: 'Electrician', nameHi: 'इलेक्ट्रीशियन', icon: 'ph-lightning', color: '#fbbf24', gradient: ['#fbbf24', '#f59e0b'], customFields: [{ key: 'Experience', value: '' }, { key: 'Callout Fee', value: '' }] },
  { id: 'plumber', name: 'Plumber', nameHi: 'प्लंबर', icon: 'ph-wrench', color: '#60a5fa', gradient: ['#60a5fa', '#3b82f6'], customFields: [{ key: 'Experience', value: '' }, { key: 'Visiting Charge', value: '' }] },
  { id: 'doctor', name: 'Doctor', nameHi: 'डॉक्टर', icon: 'ph-first-aid-kit', color: '#f87171', gradient: ['#f87171', '#ef4444'], customFields: [{ key: 'Speciality', value: '' }, { key: 'Consultation Fee', value: '' }, { key: 'Registration No.', value: '' }] },
  { id: 'salon', name: 'Salon & Spa', nameHi: 'सैलून', icon: 'ph-scissors', color: '#e879f9', gradient: ['#e879f9', '#d946ef'], customFields: [{ key: 'Gender Served', value: 'Unisex' }, { key: 'Home Service', value: 'Yes/No' }] },
  { id: 'ac-repair', name: 'AC Repair', nameHi: 'एसी रिपेयर', icon: 'ph-snowflake', color: '#22d3ee', gradient: ['#22d3ee', '#06b6d4'], customFields: [{ key: 'Service Charge', value: '' }, { key: 'Warranty Provided', value: 'Yes/No' }] },
  { id: 'carpenter', name: 'Carpenter', nameHi: 'बढ़ई', icon: 'ph-hammer', color: '#a78bfa', gradient: ['#a78bfa', '#8b5cf6'], customFields: [{ key: 'Speciality', value: 'Woodwork/Furniture' }] },
  { id: 'tutor', name: 'Tutor', nameHi: 'ट्यूटर', icon: 'ph-book-open', color: '#34d399', gradient: ['#34d399', '#10b981'], customFields: [{ key: 'Subjects Taught', value: '' }, { key: 'Classes/Grades', value: '' }] },
  { id: 'pest-control', name: 'Pest Control', nameHi: 'कीट नियंत्रण', icon: 'ph-bug', color: '#fb923c', gradient: ['#fb923c', '#f97316'], customFields: [{ key: 'Warranty', value: '' }, { key: 'Chemicals Used', value: 'Eco-friendly' }] },
  { id: 'painter', name: 'Painter', nameHi: 'पेंटर', icon: 'ph-paint-roller', color: '#c084fc', gradient: ['#c084fc', '#a855f7'], customFields: [{ key: 'Experience', value: '' }, { key: 'Commercial/Residential', value: 'Both' }] },
  { id: 'cleaning', name: 'Cleaning', nameHi: 'सफाई सेवा', icon: 'ph-broom', color: '#2dd4bf', gradient: ['#2dd4bf', '#14b8a6'], customFields: [{ key: 'Deep Cleaning', value: 'Available' }] },
  { id: 'catering', name: 'Catering', nameHi: 'कैटरिंग', icon: 'ph-cooking-pot', color: '#fb7185', gradient: ['#fb7185', '#f43f5e'], customFields: [{ key: 'Minimum Persons', value: '' }, { key: 'Cuisine Types', value: '' }] },
  { id: 'photography', name: 'Photography', nameHi: 'फोटोग्राफी', icon: 'ph-camera', color: '#818cf8', gradient: ['#818cf8', '#6366f1'], customFields: [{ key: 'Event Types', value: 'Wedding/Corporate/Portraits' }, { key: 'Drone Shot', value: 'Yes/No' }] },
  { id: 'packers-movers', name: 'Packers & Movers', nameHi: 'पैकर्स एंड मूवर्स', icon: 'ph-truck', color: '#4ade80', gradient: ['#4ade80', '#22c55e'], customFields: [{ key: 'Intercity Available', value: 'Yes/No' }, { key: 'Insurance Provided', value: 'Yes/No' }] },
  { id: 'laundry', name: 'Laundry', nameHi: 'लॉन्ड्री', icon: 'ph-t-shirt', color: '#38bdf8', gradient: ['#38bdf8', '#0ea5e9'], customFields: [{ key: 'Dry Cleaning', value: 'Available' }, { key: 'Home Pickup', value: 'Yes/No' }] },
  { id: 'gym-fitness', name: 'Gym & Fitness', nameHi: 'जिम', icon: 'ph-barbell', color: '#f472b6', gradient: ['#f472b6', '#ec4899'], customFields: [{ key: 'Personal Trainer', value: 'Available' }, { key: 'Monthly Fee', value: '' }] },
];

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
}

export function getCategoryName(category, lang = 'en') {
  if (!category) return '';
  return lang === 'hi' ? (category.nameHi || category.name) : category.name;
}
