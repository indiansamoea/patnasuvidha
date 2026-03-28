import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../utils/categories';
import { useAppContext } from '../context/AppContext';
import ImageUpload from '../components/ImageUpload';

export default function AddBusiness() {
  const navigate = useNavigate();
  const { addBusiness, settings, lang } = useAppContext();
  const [step, setStep] = useState(1); // 1=form, 2=pricing, 3=success
  const [listingType, setListingType] = useState('normal');
  const [form, setForm] = useState({ name: '', category: '', phone: '', whatsapp: '', address: '', description: '', priceRange: '', hours: '', ownerName: '', ownerEmail: '', images: [], customFields: [] });

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleProceedToPricing = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.category || !form.ownerName) return;
    setStep(2);
  };

  const handlePayment = () => {
    const amount = listingType === 'featured' ? settings.featuredListingPrice : settings.normalListingPrice;

    if (typeof window.Razorpay === 'undefined') {
      finishListing();
      return;
    }

    const options = {
      key: settings.razorpayKey,
      amount: amount * 100,
      currency: 'INR',
      name: 'Patna Suvidha',
      description: `${listingType === 'featured' ? 'Featured' : 'Normal'} Business Listing`,
      image: '/logo.jpeg',
      handler: function () { finishListing(); },
      prefill: { name: form.ownerName, email: form.ownerEmail || '', contact: form.phone },
      theme: { color: '#ff9933' },
      modal: { ondismiss: function () {} },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      finishListing();
    }
  };

  const finishListing = () => {
    const defaultImage = 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80';
    addBusiness({
      ...form,
      isFeatured: listingType === 'featured',
      listingType,
      paidAmount: listingType === 'featured' ? settings.featuredListingPrice : settings.normalListingPrice,
      isOpen: true, isVerified: false,
      rating: 0, reviews: 0,
      image: form.images.length > 0 ? form.images[0] : defaultImage,
      gallery: form.images,
      customFields: form.customFields,
      services: [],
    });
    setStep(3);
  };

  const inputStyle = { background: 'var(--surface-container)', borderRadius: '0.75rem', padding: '0.875rem 1rem', fontFamily: "'Manrope'", fontSize: '0.875rem', color: 'var(--on-surface)', width: '100%', border: '1px solid var(--outline-variant)', outline: 'none', transition: 'border-color 150ms' };
  const labelStyle = { fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem' };

  if (step === 3) return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <i className="ph-fill ph-storefront" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}></i>
      </div>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>लिस्टिंग भेज दिया गया! 🎉</h2>
      <p style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '0.375rem' }}><span style={{ color: 'var(--primary)' }}>{form.name}</span> review में बा</p>
      <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>Admin approval के बाद अपना बिजनेस Patna Suvidha पर दिखी।</p>
      <button onClick={() => navigate('/')} style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9375rem', fontWeight: 700, background: 'var(--gradient-primary)', color: 'var(--on-primary)', padding: '0.875rem 2rem', borderRadius: '999px', border: 'none', cursor: 'pointer' }}>
        वापस होम जाईं
      </button>
    </div>
  );

  if (step === 2) return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', paddingBottom: '6rem' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--glass-bg)', backdropFilter: 'blur(25px)', borderBottom: '1px solid var(--glass-border)', padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '480px', margin: '0 auto' }}>
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', padding: '0.375rem', cursor: 'pointer' }}>
            <i className="ph-bold ph-arrow-left" style={{ color: 'var(--on-surface)', fontSize: '1.25rem' }}></i>
          </button>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 700, color: 'var(--on-surface)' }}>Listing Plan चुनीं</h2>
        </div>
      </header>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: 'var(--on-surface)', textAlign: 'center', marginBottom: '0.5rem' }}>अपना Plan चुनीं</h3>
        <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface-variant)', textAlign: 'center', marginBottom: '1.5rem' }}>अपना बिजनेस पटना के हजारों लोगों तक पहुँचाईं!</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => setListingType('normal')} style={{
            background: listingType === 'normal' ? 'var(--primary-container)' : 'var(--surface-container)',
            border: listingType === 'normal' ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
            borderRadius: '1.25rem', padding: '1.25rem', textAlign: 'left', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 700, color: 'var(--on-surface)' }}>Normal Listing</h4>
              <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>₹{settings.normalListingPrice}</span>
            </div>
            <ul style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li>✅ Business directory में listing</li>
              <li>✅ Search results में दिखेगा</li>
              <li>✅ WhatsApp booking enable</li>
              <li>✅ Customer reviews</li>
            </ul>
          </button>

          <button onClick={() => setListingType('featured')} style={{
            background: listingType === 'featured' ? 'var(--primary-container)' : 'var(--surface-container)',
            border: listingType === 'featured' ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
            borderRadius: '1.25rem', padding: '1.25rem', textAlign: 'left', cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'var(--gradient-primary)', padding: '0.125rem 0.5rem', borderRadius: '999px' }}>
              <span style={{ fontFamily: "'Manrope'", fontSize: '0.5625rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>Best Value</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 700, color: 'var(--on-surface)' }}>⭐ Featured Listing</h4>
              <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>₹{settings.featuredListingPrice}</span>
            </div>
            <ul style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li>✅ Normal listing के सब features</li>
              <li>⭐ Home page पर "Featured" section में</li>
              <li>⭐ Trending section में priority</li>
              <li>⭐ Search results में top position</li>
              <li>⭐ Verified badge</li>
            </ul>
          </button>
        </div>

        <button onClick={handlePayment} style={{
          width: '100%', fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 700,
          background: 'var(--gradient-primary)', color: 'var(--on-primary)',
          padding: '1rem', borderRadius: '1rem', border: 'none', cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}>
          ₹{listingType === 'featured' ? settings.featuredListingPrice : settings.normalListingPrice} Pay करीं <i className="ph-bold ph-arrow-right"></i>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '6rem' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--glass-bg)', backdropFilter: 'blur(25px)', borderBottom: '1px solid var(--glass-border)', padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '480px', margin: '0 auto' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '0.375rem', cursor: 'pointer' }}>
            <i className="ph-bold ph-arrow-left" style={{ color: 'var(--on-surface)', fontSize: '1.25rem' }}></i>
          </button>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 700, color: 'var(--on-surface)' }}>
            {lang === 'hi' ? 'अपना बिजनेस लिस्ट करीं' : 'List Your Business'}
          </h2>
        </div>
      </header>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.25rem' }}>
        <div style={{ background: 'var(--surface-container-high)', borderRadius: '1rem', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ph-fill ph-megaphone" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}></i>
          </div>
          <div>
            <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', fontWeight: 700, color: 'var(--on-surface)' }}>हजारों customers तक पहुँचीं! 🚀</p>
            <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>सिर्फ ₹{settings.normalListingPrice} से शुरू</p>
          </div>
        </div>

        <form onSubmit={handleProceedToPricing} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={labelStyle}>मालिक का नाम / Owner Name *</label>
            <input type="text" value={form.ownerName} onChange={e => update('ownerName', e.target.value)} placeholder="e.g., Rajesh Kumar" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
          </div>
          <div>
            <label style={labelStyle}>बिजनेस का नाम / Business Name *</label>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g., Sharma AC Service" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
          </div>
          <div>
            <label style={labelStyle}>कैटेगरी / Category *</label>
            <select value={form.category} onChange={e => {
              const catId = e.target.value;
              const cat = CATEGORIES.find(c => c.id === catId);
              setForm(p => ({ ...p, category: catId, customFields: cat?.customFields ? JSON.parse(JSON.stringify(cat.customFields)) : [] }));
            }} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}>
              <option value="" style={{ background: 'var(--surface-container)' }}>Select Category / कैटेगरी चुनीं</option>
              {CATEGORIES.slice(1).map(c => (<option key={c.id} value={c.id} style={{ background: 'var(--surface-container)' }}>{c.name}</option>))}
            </select>
          </div>

          {/* Dynamic Fields based on Category */}
          {form.category === 'doctor' && (
            <>
              <div>
                <label style={labelStyle}>स्पेशलाइजेशन (Specialization) *</label>
                <input type="text" value={form.specialization || ''} onChange={e => update('specialization', e.target.value)} placeholder="e.g., Dentist, Pediatrician" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
              </div>
              <div>
                <label style={labelStyle}>क्लीनिक की सुविधाएँ (Clinic Facilities)</label>
                <input type="text" value={form.facilities || ''} onChange={e => update('facilities', e.target.value)} placeholder="e.g., X-Ray, Lab, Pharmacy" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
              </div>
            </>
          )}

          {['plumber', 'electrician', 'mechanic', 'carpenter', 'cleaning'].includes(form.category) && (
            <>
              <div>
                <label style={labelStyle}>विज़िटिंग चार्ज (Visiting Charge)</label>
                <input type="text" value={form.visitingCharge || ''} onChange={e => update('visitingCharge', e.target.value)} placeholder="e.g., ₹200 for inspection" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
              </div>
              <div>
                <label style={labelStyle}>आपातकालीन सेवा? (Emergency Service 24/7)</label>
                <select value={form.emergency || 'No'} onChange={e => update('emergency', e.target.value)} style={{...inputStyle, appearance:'none'}} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </>
          )}

          {form.category === 'tutor' && (
            <>
              <div>
                <label style={labelStyle}>कक्षा / विषय (Class / Subjects) *</label>
                <input type="text" value={form.subjects || ''} onChange={e => update('subjects', e.target.value)} placeholder="e.g., Class 10th Maths, ReactJs" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
              </div>
              <div>
                <label style={labelStyle}>पढ़ाने का तरीका (Mode of Teaching)</label>
                <select value={form.mode || 'Home Tuition'} onChange={e => update('mode', e.target.value)} style={{...inputStyle, appearance:'none'}} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}>
                  <option value="Home Tuition">Home Tuition (आपके घर पर)</option>
                  <option value="Online">Online</option>
                  <option value="Coaching Center">Coaching Center</option>
                </select>
              </div>
            </>
          )}

          {form.category === 'salon' && (
            <div>
              <label style={labelStyle}>किनके लिए? (For Whom)</label>
              <select value={form.gender || 'Unisex'} onChange={e => update('gender', e.target.value)} style={{...inputStyle, appearance:'none'}} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}>
                 <option value="Unisex">Unisex (Everyone)</option>
                 <option value="Men Only">Men Only</option>
                 <option value="Women Only">Women Only</option>
              </select>
            </div>
          )}
          {/* Unified Custom Fields */}
          {form.customFields && form.customFields.length > 0 && (
            <div style={{ padding: '1rem', background: 'var(--surface-container-high)', borderRadius: '1rem', border: '1px solid var(--outline-variant)' }}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.75rem' }}>अतिरिक्त विवरण / Extra Details</h4>
              {form.customFields.map((cf, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="text" value={cf.key} onChange={e => {
                    const newCf = [...form.customFields];
                    newCf[idx].key = e.target.value;
                    update('customFields', newCf);
                  }} placeholder="Label (e.g. Warranty)" style={{ ...inputStyle, flex: 1, padding: '0.625rem' }} />
                  <input type="text" value={cf.value} onChange={e => {
                    const newCf = [...form.customFields];
                    newCf[idx].value = e.target.value;
                    update('customFields', newCf);
                  }} placeholder="Value (e.g. 1 Year)" style={{ ...inputStyle, flex: 2, padding: '0.625rem' }} />
                  <button type="button" onClick={() => {
                    const newCf = form.customFields.filter((_, i) => i !== idx);
                    update('customFields', newCf);
                  }} style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', border: 'none', borderRadius: '0.5rem', padding: '0 0.875rem', cursor: 'pointer' }}>
                    <i className="ph-bold ph-trash"></i>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => update('customFields', [...form.customFields, { key: '', value: '' }])} style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                <i className="ph-bold ph-plus"></i> Add More Detail
              </button>
            </div>
          )}
          {(!form.customFields || form.customFields.length === 0) && (
            <button type="button" onClick={() => update('customFields', [{ key: '', value: '' }])} style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
              <i className="ph-bold ph-plus"></i> Add Custom Detail
            </button>
          )}

          <div>
            <label style={labelStyle}>फ़ोन नंबर / Phone Number *</label>
            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="e.g., 9876543210" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp नंबर (Optional)</label>
            <input type="tel" value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} placeholder="WhatsApp number" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
          </div>
          <div>
            <label style={labelStyle}>Email (Optional)</label>
            <input type="email" value={form.ownerEmail} onChange={e => update('ownerEmail', e.target.value)} placeholder="Email" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
          </div>
          <div>
            <label style={labelStyle}>पता (पटना में) / Detailed Address in Patna</label>
            <input type="text" value={form.address} onChange={e => update('address', e.target.value)} placeholder="e.g., Boring Road, Patna - 800001" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
          </div>
          <div>
            <label style={labelStyle}>सेवा का विवरण / Description</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="अपना सेवा के बारे में लिखीं..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
          </div>
          <div>
            <label style={labelStyle}>Price Range</label>
            <input type="text" value={form.priceRange} onChange={e => update('priceRange', e.target.value)} placeholder="e.g., ₹500 - ₹5,000" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
          </div>
          <div>
            <label style={labelStyle}>खुलने का समय / Operating Hours</label>
            <input type="text" value={form.hours} onChange={e => update('hours', e.target.value)} placeholder="e.g., Mon-Sat: 9 AM - 8 PM" style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'} />
          </div>
          
          <ImageUpload multiple={true} value={form.images} onChange={imgs => update('images', imgs)} label="बिजनेस की तस्वीरें / Business Gallery (Up to 5MB)" />
          
          <button type="submit" disabled={!form.name || !form.phone || !form.category || !form.ownerName} style={{
            width: '100%', fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem',
            background: (!form.name || !form.phone || !form.category || !form.ownerName) ? 'var(--surface-container-highest)' : 'var(--gradient-primary)',
            color: (!form.name || !form.phone || !form.category || !form.ownerName) ? 'var(--on-surface-variant)' : 'var(--on-primary)',
            padding: '1rem', borderRadius: '1rem', border: 'none',
            cursor: (!form.name || !form.phone || !form.category || !form.ownerName) ? 'not-allowed' : 'pointer',
            boxShadow: (!form.name || !form.phone || !form.category || !form.ownerName) ? 'none' : 'var(--shadow-lg)',
          }}>
            आगे बढ़ीं — Plan चुनीं <i className="ph-bold ph-arrow-right"></i>
          </button>
        </form>
      </div>
    </div>
  );
}
