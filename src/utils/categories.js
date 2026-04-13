// These serve as fallbacks/templates. 
// The actual categories will be fetched from Firestore.
export const CATEGORIES = [
  { id: 'all', name: 'All Services', nameHi: 'सभी सेवाएं', icon: 'ph-squares-four', color: '#ff9159', gradient: ['#ff9159', '#ff7a2f'] },
  { id: 'electrician', name: 'Electrician', nameHi: 'इलेक्ट्रीशियन', icon: 'ph-lightning', color: '#fbbf24', gradient: ['#fbbf24', '#f59e0b'] },
  { id: 'plumber', name: 'Plumber', nameHi: 'प्लंबर', icon: 'ph-wrench', color: '#60a5fa', gradient: ['#60a5fa', '#3b82f6'] },
  { id: 'ac-repair', name: 'AC Repair', nameHi: 'एसी रिपेयर', icon: 'ph-snowflake', color: '#22d3ee', gradient: ['#22d3ee', '#06b6d4'] },
  { id: 'salon', name: 'Salon & Spa', nameHi: 'सैलून', icon: 'ph-scissors', color: '#e879f9', gradient: ['#e879f9', '#d946ef'] },
  { id: 'cleaning', name: 'Cleaning', nameHi: 'सफाई सेवा', icon: 'ph-broom', color: '#2dd4bf', gradient: ['#2dd4bf', '#14b8a6'] },
];

export function getCategoryById(id, dynamicCategories = []) {
  const combined = dynamicCategories.length > 0 ? dynamicCategories : CATEGORIES;
  return combined.find(c => c.id === id) || combined[0];
}

export function getCategoryName(category, lang = 'en') {
  if (!category) return '';
  return lang === 'hi' ? (category.nameHi || category.name) : category.name;
}
