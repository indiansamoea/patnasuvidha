import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES, getCategoryById } from '../utils/categories';
import ImageUpload from '../components/ImageUpload';

const ADMIN_PASS = 'AARADH@2009';

const GRADIENTS = [
  ['#22d3ee', '#0891b2'], ['#f87171', '#dc2626'], ['#e879f9', '#c026d3'],
  ['#34d399', '#059669'], ['#f472b6', '#db2777'], ['#fbb423', '#ff9159'],
  ['#60a5fa', '#2563eb'], ['#a78bfa', '#7c3aed'],
];

export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [tab, setTab] = useState('dashboard');
  const {
    settings, updateSettings,
    allBusinesses, listings, bookings, deals,
    addBusinessFree, approveListing, rejectListing, deleteBusiness, updateBusiness, toggleFeatured, toggleTopRated, toggleSuggested,
    addDeal, removeDeal, seedDatabase
  } = useAppContext();

  const [newBiz, setNewBiz] = useState({ name: '', category: '', phone: '', whatsapp: '', address: '', description: '', priceRange: '', hours: '', image: '', isFeatured: false, isOpen: true, customFields: [] });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newDeal, setNewDeal] = useState({ title: '', subtitle: '', code: '', businessId: '', gradientIdx: 0 });

  if (!authed) return (
    <div style={{ background: '#0a0e13', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#151a20', borderRadius: '1.5rem', padding: '2rem', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ff915915', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <i className="ph-fill ph-lock-simple" style={{ color: '#ff9159', fontSize: '1.5rem' }}></i>
        </div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: '#f4f6fe', marginBottom: '0.5rem' }}>Admin Portal</h2>
        <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: '#72767c', marginBottom: '1.25rem' }}>Enter admin password</p>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" onKeyDown={e => e.key === 'Enter' && pass === ADMIN_PASS && setAuthed(true)}
          style={{ background: '#0a0e13', borderRadius: '0.75rem', padding: '0.875rem 1rem', fontFamily: "'Manrope'", fontSize: '0.875rem', color: '#f4f6fe', width: '100%', border: '2px solid transparent', outline: 'none', marginBottom: '1rem' }}
          onFocus={e => e.target.style.borderColor = '#ff9159'} onBlur={e => e.target.style.borderColor = 'transparent'} />
        <button onClick={() => pass === ADMIN_PASS ? setAuthed(true) : alert('Wrong password!')} style={{ width: '100%', fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, background: 'linear-gradient(135deg, #ff9159, #ff7a2f)', color: '#401500', padding: '0.875rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>Login</button>
      </div>
    </div>
  );

  const totalRevenue = listings.filter(l => l.paidAmount).reduce((sum, l) => sum + (l.paidAmount || 0), 0);
  const pendingListings = allBusinesses.filter(b => b.status === 'pending');
  const approvedListings = allBusinesses.filter(b => b.status !== 'rejected');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ph-chart-bar' },
    { id: 'listings', label: 'Listings', icon: 'ph-storefront' },
    { id: 'bookings', label: 'Bookings', icon: 'ph-calendar-check' },
    { id: 'content', label: 'Content', icon: 'ph-megaphone' },
    { id: 'add-free', label: 'Add Free', icon: 'ph-plus-circle' },
    { id: 'settings', label: 'Settings', icon: 'ph-gear' },
  ];

  const S = {
    card: { background: '#151a20', borderRadius: '1rem', padding: '1rem', marginBottom: '0.75rem' },
    label: { fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 600, color: '#72767c', display: 'block', marginBottom: '0.25rem' },
    input: { background: '#0a0e13', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontFamily: "'Manrope'", fontSize: '0.8125rem', color: '#f4f6fe', width: '100%', border: '1px solid #21262e', outline: 'none' },
    btn: (bg) => ({ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 700, background: bg, color: bg.includes('ff9159') ? '#401500' : bg.includes('34d399') ? '#34d399' : bg.includes('f87171') ? '#f87171' : bg.includes('fbb423') ? '#fbb423' : '#a8abb2', padding: '0.375rem 0.75rem', borderRadius: '999px', border: 'none', cursor: 'pointer' }),
  };

  const startEdit = (biz) => { setEditingId(biz.id); setEditForm({ ...biz }); };
  const saveEdit = () => { updateBusiness(editingId, editForm); setEditingId(null); };

  return (
    <div style={{ background: '#0a0e13', minHeight: '100vh' }}>
      <header style={{ background: '#151a20', padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="ph-fill ph-shield-check" style={{ color: '#ff9159', fontSize: '1.25rem' }}></i>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 800, color: '#ff9159' }}>Admin Portal</h1>
        </div>
        <button onClick={() => navigate('/')} style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 600, color: '#72767c', background: '#21262e', padding: '0.375rem 0.75rem', borderRadius: '999px', border: 'none', cursor: 'pointer' }}>← Back to Site</button>
      </header>

      <div style={{ display: 'flex', gap: '0.25rem', padding: '0.75rem 0.75rem', overflowX: 'auto', borderBottom: '1px solid #21262e' }} className="hide-scrollbar">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flexShrink: 0, padding: '0.5rem 0.875rem', borderRadius: '999px', fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 600, background: tab === t.id ? '#ff9159' : 'transparent', color: tab === t.id ? '#401500' : '#72767c', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}>
            <i className={`ph-fill ${t.icon}`} style={{ fontSize: '0.875rem' }}></i>{t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: '#f4f6fe', marginBottom: '1rem' }}>📊 Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[{ label: 'Total Listings', value: approvedListings.length, icon: 'ph-storefront', color: '#ff9159' }, { label: 'Pending Approval', value: pendingListings.length, icon: 'ph-hourglass', color: '#fbb423' }, { label: 'Total Bookings', value: bookings.length, icon: 'ph-calendar-check', color: '#22d3ee' }, { label: 'Revenue (₹)', value: `₹${totalRevenue.toLocaleString()}`, icon: 'ph-currency-inr', color: '#34d399' }].map((stat, i) => (
                <div key={i} style={{ ...S.card, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <i className={`ph-fill ${stat.icon}`} style={{ color: stat.color, fontSize: '1.125rem' }}></i>
                    <span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 600, color: '#72767c' }}>{stat.label}</span>
                  </div>
                  <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.5rem', fontWeight: 800, color: '#f4f6fe' }}>{stat.value}</p>
                </div>
              ))}
            </div>
            {pendingListings.length > 0 && (
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 700, color: '#fbb423', marginBottom: '0.75rem' }}>⏳ Pending Approval ({pendingListings.length})</h3>
                {pendingListings.map(biz => (
                  <div key={biz.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {biz.image && <img src={biz.image} alt="" style={{ width: '36px', height: '36px', borderRadius: '0.5rem', objectFit: 'cover' }} />}
                      <div>
                        <p style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#f4f6fe' }}>{biz.name}</p>
                        <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#72767c' }}>{biz.category} • {biz.phone} • ₹{biz.paidAmount || 0}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button onClick={() => approveListing(biz.id)} style={S.btn('rgba(52,211,153,0.15)')}>✅</button>
                      <button onClick={() => rejectListing(biz.id)} style={S.btn('rgba(248,113,113,0.15)')}>❌</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LISTINGS */}
        {tab === 'listings' && (
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: '#f4f6fe', marginBottom: '1rem' }}>🏪 All Listings ({allBusinesses.length})</h2>
            {allBusinesses.map(biz => {
              const cat = getCategoryById(biz.category);
              if (editingId === biz.id) return (
                <div key={biz.id} style={{ ...S.card, padding: '1.25rem' }}>
                  <h4 style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#ff9159', marginBottom: '0.75rem' }}>✏️ Edit: {biz.name}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {['name', 'phone', 'address', 'priceRange', 'hours', 'description', 'whatsapp'].map(f => (
                      <div key={f}><label style={S.label}>{f}</label><input value={editForm[f] || ''} onChange={e => setEditForm(p => ({ ...p, [f]: e.target.value }))} style={S.input} /></div>
                    ))}
                    <div><label style={S.label}>Category</label><select value={editForm.category || ''} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} style={{ ...S.input, cursor: 'pointer' }}>{CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id} style={{ background: '#0a0e13' }}>{c.name}</option>)}</select></div>
                    <div style={{ display: 'flex', gap: '0.75rem', gridColumn: 'span 2', marginTop: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}><input type="checkbox" checked={editForm.isFeatured} onChange={e => setEditForm(p => ({ ...p, isFeatured: e.target.checked }))} /><span style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: '#a8abb2' }}>⭐ Featured</span></label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}><input type="checkbox" checked={editForm.isSuggested} onChange={e => setEditForm(p => ({ ...p, isSuggested: e.target.checked }))} /><span style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: '#a8abb2' }}>💡 Suggested</span></label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}><input type="checkbox" checked={editForm.isTopRated} onChange={e => setEditForm(p => ({ ...p, isTopRated: e.target.checked }))} /><span style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: '#a8abb2' }}>🏆 Top Rated</span></label>
                    </div>
                  </div>
                  {/* Edit Custom Fields */}
                  <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#0a0e13', borderRadius: '0.75rem' }}>
                    <label style={S.label}>Extra Details</label>
                    {(editForm.customFields || []).map((cf, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem' }}>
                        <input type="text" value={cf.key} onChange={e => {
                          const newCf = [...(editForm.customFields || [])];
                          newCf[idx].key = e.target.value;
                          setEditForm(p => ({ ...p, customFields: newCf }));
                        }} placeholder="Label" style={{ ...S.input, flex: 1, padding: '0.375rem 0.625rem' }} />
                        <input type="text" value={cf.value} onChange={e => {
                          const newCf = [...(editForm.customFields || [])];
                          newCf[idx].value = e.target.value;
                          setEditForm(p => ({ ...p, customFields: newCf }));
                        }} placeholder="Value" style={{ ...S.input, flex: 2, padding: '0.375rem 0.625rem' }} />
                        <button type="button" onClick={() => {
                          const newCf = (editForm.customFields || []).filter((_, i) => i !== idx);
                          setEditForm(p => ({ ...p, customFields: newCf }));
                        }} style={S.btn('rgba(248,113,113,0.15)')}>🗑️</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setEditForm(p => ({ ...p, customFields: [...(p.customFields || []), { key: '', value: '' }] }))} style={{ ...S.btn('transparent'), color: '#ff9159', padding: 0 }}>+ Add Detail</button>
                  </div>
                  <ImageUpload value={editForm.image} onChange={img => setEditForm(p => ({ ...p, image: img }))} label="Business Photo" />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button onClick={saveEdit} style={{ ...S.btn('linear-gradient(135deg, #ff9159, #ff7a2f)'), padding: '0.5rem 1rem' }}>💾 Save</button>
                    <button onClick={() => setEditingId(null)} style={S.btn('#21262e')}>Cancel</button>
                  </div>
                </div>
              );
              return (
                <div key={biz.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                    {biz.image && <img src={biz.image} alt="" style={{ width: '36px', height: '36px', borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.125rem' }}>
                        <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', fontWeight: 700, color: '#f4f6fe' }}>{biz.name}</p>
                        {biz.isFeatured && <span style={{ fontFamily: "'Manrope'", fontSize: '0.5rem', fontWeight: 700, background: 'linear-gradient(135deg, #fbb423, #ff9159)', color: '#401500', padding: '0.0625rem 0.375rem', borderRadius: '999px' }}>FEATURED</span>}
                        {biz.isTopRated && <span style={{ fontFamily: "'Manrope'", fontSize: '0.5rem', fontWeight: 700, background: '#22d3ee20', color: '#22d3ee', padding: '0.0625rem 0.375rem', borderRadius: '999px' }}>TOP RATED</span>}
                        <span style={{ fontFamily: "'Manrope'", fontSize: '0.5rem', fontWeight: 700, color: biz.status === 'pending' ? '#fbb423' : biz.status === 'rejected' ? '#f87171' : '#34d399', background: biz.status === 'pending' ? '#fbb42315' : biz.status === 'rejected' ? '#f8717115' : '#34d39915', padding: '0.0625rem 0.375rem', borderRadius: '999px' }}>{(biz.status || 'approved').toUpperCase()}</span>
                      </div>
                      <p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', color: '#72767c' }}>{cat?.name} • ⭐{biz.rating} • {biz.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                    <button onClick={() => startEdit(biz)} style={S.btn('#ff915920')} title="Edit">✏️</button>
                    <button onClick={() => toggleFeatured(biz.id)} style={S.btn(biz.isFeatured ? '#fbb42320' : '#21262e')} title="Toggle Featured">⭐</button>
                    <button onClick={() => toggleSuggested(biz.id)} style={S.btn(biz.isSuggested ? '#ff915920' : '#21262e')} title="Toggle Suggested (Ads)">💡</button>
                    <button onClick={() => toggleTopRated(biz.id)} style={S.btn(biz.isTopRated ? '#22d3ee20' : '#21262e')} title="Toggle Top Rated">🏆</button>
                    {biz.status === 'pending' && <button onClick={() => approveListing(biz.id)} style={S.btn('rgba(52,211,153,0.15)')}>✅</button>}
                    <button onClick={() => { if (confirm(`Delete ${biz.name}?`)) deleteBusiness(biz.id); }} style={S.btn('rgba(248,113,113,0.15)')}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BOOKINGS */}
        {tab === 'bookings' && (
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: '#f4f6fe', marginBottom: '1rem' }}>📅 Bookings ({bookings.length})</h2>
            {bookings.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', padding: '2rem' }}><p style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', color: '#72767c' }}>अभी तक कोई बुकिंग नहीं आया बा</p></div>
            ) : (
              [...bookings].reverse().map(bk => (
                <div key={bk.id} style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#f4f6fe' }}>{bk.businessName}</p>
                    <span style={{ fontFamily: "'Manrope'", fontSize: '0.5625rem', fontWeight: 700, background: '#22c55e20', color: '#22c55e', padding: '0.125rem 0.5rem', borderRadius: '999px' }}>WhatsApp</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem' }}>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#a8abb2' }}>📋 {bk.service || 'General'}</p>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#a8abb2' }}>💰 ₹{bk.price?.toLocaleString() || 'N/A'}</p>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#a8abb2' }}>📅 {bk.date}</p>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#a8abb2' }}>🕐 {bk.time}</p>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#a8abb2' }}>👤 {bk.customerName}</p>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#a8abb2' }}>📱 {bk.customerPhone}</p>
                  </div>
                  {bk.customerAddress && <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#72767c', marginTop: '0.25rem' }}>📍 {bk.customerAddress}</p>}
                  <p style={{ fontFamily: "'Manrope'", fontSize: '0.5625rem', color: '#44484e', marginTop: '0.375rem' }}>{new Date(bk.createdAt).toLocaleString('en-IN')}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* CONTENT (Deals, Featured Message, Top Rated) */}
        {tab === 'content' && (
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: '#f4f6fe', marginBottom: '1rem' }}>📢 Content Management</h2>

            {/* Featured Message */}
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#f4f6fe' }}>🌟 Featured Message (Home Page)</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={settings.featuredMessageEnabled} onChange={e => updateSettings({ featuredMessageEnabled: e.target.checked })} />
                  <span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#a8abb2' }}>{settings.featuredMessageEnabled ? 'ON' : 'OFF'}</span>
                </label>
              </div>
              <label style={S.label}>Message Text</label>
              <textarea value={settings.featuredMessage || ''} onChange={e => updateSettings({ featuredMessage: e.target.value })} rows={2} placeholder="e.g., 🎉 Patna Suvidha Grand Launch — सभ सेवा पर 10% OFF!" style={{ ...S.input, resize: 'vertical' }} />
            </div>

            {/* Hot Deals */}
            <div style={S.card}>
              <h3 style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#f4f6fe', marginBottom: '0.75rem' }}>🔥 Hot Deals ({deals.length})</h3>
              {deals.map(deal => (
                <div key={deal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#0a0e13', borderRadius: '0.5rem', marginBottom: '0.375rem' }}>
                  <div>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', fontWeight: 700, color: '#f4f6fe' }}>{deal.title}</p>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', color: '#72767c' }}>{deal.subtitle} {deal.code && `• Code: ${deal.code}`} {deal.businessId && `• Linked: ${allBusinesses.find(b => b.id === deal.businessId)?.name || deal.businessId}`}</p>
                  </div>
                  <button onClick={() => { if (confirm(`Remove deal "${deal.title}"?`)) removeDeal(deal.id); }} style={S.btn('rgba(248,113,113,0.15)')}>🗑️</button>
                </div>
              ))}
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#0a0e13', borderRadius: '0.75rem' }}>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 700, color: '#ff9159', marginBottom: '0.5rem' }}>+ Add New Deal</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.375rem', marginBottom: '0.5rem' }}>
                  <div><label style={S.label}>Title *</label><input value={newDeal.title} onChange={e => setNewDeal(p => ({ ...p, title: e.target.value }))} placeholder="e.g., 30% Off AC Service" style={S.input} /></div>
                  <div><label style={S.label}>Subtitle</label><input value={newDeal.subtitle} onChange={e => setNewDeal(p => ({ ...p, subtitle: e.target.value }))} placeholder="e.g., Cool Care AC" style={S.input} /></div>
                  <div><label style={S.label}>Promo Code</label><input value={newDeal.code} onChange={e => setNewDeal(p => ({ ...p, code: e.target.value }))} placeholder="e.g., COOL30" style={S.input} /></div>
                  <div><label style={S.label}>Link Business (Optional)</label><select value={newDeal.businessId} onChange={e => setNewDeal(p => ({ ...p, businessId: e.target.value }))} style={{ ...S.input, cursor: 'pointer' }}><option value="">None</option>{allBusinesses.map(b => <option key={b.id} value={b.id} style={{ background: '#0a0e13' }}>{b.name}</option>)}</select></div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={S.label}>Color</label>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {GRADIENTS.map((g, i) => (
                        <button key={i} onClick={() => setNewDeal(p => ({ ...p, gradientIdx: i }))} style={{ width: '20px', height: '20px', borderRadius: '50%', background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`, border: newDeal.gradientIdx === i ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer' }}></button>
                      ))}
                    </div>
                  </div>
                </div>
                <button disabled={!newDeal.title} onClick={() => {
                  const g = GRADIENTS[newDeal.gradientIdx];
                  addDeal({ title: newDeal.title, subtitle: newDeal.subtitle, code: newDeal.code, businessId: newDeal.businessId, gradient: g });
                  setNewDeal({ title: '', subtitle: '', code: '', businessId: '', gradientIdx: 0 });
                }} style={{ ...S.btn(!newDeal.title ? '#21262e' : 'linear-gradient(135deg, #ff9159, #ff7a2f)'), padding: '0.5rem 1rem', width: '100%', color: !newDeal.title ? '#72767c' : '#401500' }}>
                  Add Deal
                </button>
              </div>
            </div>

            {/* Top Rated Control */}
            <div style={S.card}>
              <h3 style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#f4f6fe', marginBottom: '0.5rem' }}>🏆 Top Rated Section</h3>
              <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#72767c', marginBottom: '0.75rem' }}>Toggle the 🏆 button in Listings tab to manually select which businesses show in "Top Rated". If none are selected, top-rated is auto-calculated from rating.</p>
              <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: '#22d3ee' }}>
                Currently manually set: {allBusinesses.filter(b => b.isTopRated).length || 'None (auto mode)'}
              </p>
            </div>
          </div>
        )}

        {/* ADD FREE */}
        {tab === 'add-free' && (
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: '#f4f6fe', marginBottom: '1rem' }}>➕ Add Business (Free)</h2>
            <div style={S.card}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {[{ key: 'name', label: 'Business Name *', ph: 'e.g., Sharma AC Service' }, { key: 'phone', label: 'Phone *', ph: '9876543210' }, { key: 'whatsapp', label: 'WhatsApp', ph: 'WhatsApp number' }, { key: 'address', label: 'Address', ph: 'Boring Road, Patna' }, { key: 'priceRange', label: 'Price Range', ph: '₹500 - ₹5,000' }, { key: 'hours', label: 'Operating Hours', ph: 'Mon-Sat: 9AM-8PM' }].map(f => (
                  <div key={f.key}><label style={S.label}>{f.label}</label><input value={newBiz[f.key]} onChange={e => setNewBiz(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={S.input} /></div>
                ))}
                <div><label style={S.label}>Category *</label><select value={newBiz.category} onChange={e => {
                  const catId = e.target.value;
                  const cat = CATEGORIES.find(c => c.id === catId);
                  setNewBiz(p => ({ ...p, category: catId, customFields: cat?.customFields ? JSON.parse(JSON.stringify(cat.customFields)) : [] }));
                }} style={{ ...S.input, cursor: 'pointer' }}><option value="">Select</option>{CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id} style={{ background: '#0a0e13' }}>{c.name}</option>)}</select></div>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={S.label}>Description</label>
                <textarea value={newBiz.description} onChange={e => setNewBiz(p => ({ ...p, description: e.target.value }))} placeholder="Describe the business..." rows={2} style={{ ...S.input, resize: 'vertical' }} />
              </div>
              
              {/* Unified Custom Fields */}
              {newBiz.customFields && newBiz.customFields.length > 0 && (
                <div style={{ padding: '0.75rem', background: '#0a0e13', borderRadius: '0.75rem', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', fontWeight: 700, color: '#f4f6fe', marginBottom: '0.75rem' }}>Extra Details</h4>
                  {newBiz.customFields.map((cf, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input type="text" value={cf.key} onChange={e => {
                        const newCf = [...newBiz.customFields];
                        newCf[idx].key = e.target.value;
                        setNewBiz(p => ({ ...p, customFields: newCf }));
                      }} placeholder="Label" style={{ ...S.input, flex: 1, padding: '0.375rem 0.625rem' }} />
                      <input type="text" value={cf.value} onChange={e => {
                        const newCf = [...newBiz.customFields];
                        newCf[idx].value = e.target.value;
                        setNewBiz(p => ({ ...p, customFields: newCf }));
                      }} placeholder="Value" style={{ ...S.input, flex: 2, padding: '0.375rem 0.625rem' }} />
                      <button type="button" onClick={() => {
                        const newCf = newBiz.customFields.filter((_, i) => i !== idx);
                        setNewBiz(p => ({ ...p, customFields: newCf }));
                      }} style={S.btn('rgba(248,113,113,0.15)')}>🗑️</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setNewBiz(p => ({ ...p, customFields: [...p.customFields, { key: '', value: '' }] }))} style={{ ...S.btn('transparent'), color: '#ff9159', padding: 0 }}>+ Add Detail</button>
                </div>
              )}
              {(!newBiz.customFields || newBiz.customFields.length === 0) && (
                <button type="button" onClick={() => setNewBiz(p => ({ ...p, customFields: [{ key: '', value: '' }] }))} style={{ ...S.btn('transparent'), color: '#ff9159', padding: 0, marginBottom: '0.75rem' }}>+ Add Custom Detail</button>
              )}

              <ImageUpload value={newBiz.image} onChange={img => setNewBiz(p => ({ ...p, image: img }))} label="Business Photo" style={{ marginBottom: '0.75rem' }} />
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}><input type="checkbox" checked={newBiz.isFeatured} onChange={e => setNewBiz(p => ({ ...p, isFeatured: e.target.checked }))} /><span style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: '#a8abb2' }}>⭐ Featured</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}><input type="checkbox" checked={newBiz.isSuggested} onChange={e => setNewBiz(p => ({ ...p, isSuggested: e.target.checked }))} /><span style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: '#a8abb2' }}>💡 Suggested</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}><input type="checkbox" checked={newBiz.isOpen} onChange={e => setNewBiz(p => ({ ...p, isOpen: e.target.checked }))} /><span style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: '#a8abb2' }}>Open Now</span></label>
              </div>
              <button disabled={!newBiz.name || !newBiz.phone || !newBiz.category} onClick={() => {
                addBusinessFree({ ...newBiz, image: newBiz.image || 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80', gallery: [newBiz.image].filter(Boolean) });
                setNewBiz({ name: '', category: '', phone: '', whatsapp: '', address: '', description: '', priceRange: '', hours: '', image: '', isFeatured: false, isOpen: true, customFields: [] });
                alert('✅ Business added!');
              }} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, background: (!newBiz.name || !newBiz.phone || !newBiz.category) ? '#21262e' : 'linear-gradient(135deg, #ff9159, #ff7a2f)', color: (!newBiz.name || !newBiz.phone || !newBiz.category) ? '#72767c' : '#401500', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', cursor: (!newBiz.name || !newBiz.phone || !newBiz.category) ? 'not-allowed' : 'pointer', width: '100%' }}>
                ➕ Add Business (Free)
              </button>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 800, color: '#f4f6fe', marginBottom: '1rem' }}>⚙️ Settings</h2>
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#f4f6fe' }}>🙏 Greeting Popup</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}><input type="checkbox" checked={settings.greetingEnabled} onChange={e => updateSettings({ greetingEnabled: e.target.checked })} /><span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#a8abb2' }}>{settings.greetingEnabled ? 'ON' : 'OFF'}</span></label>
              </div>
              <label style={S.label}>Greeting Text</label>
              <textarea value={settings.greetingText} onChange={e => updateSettings({ greetingText: e.target.value })} rows={3} style={{ ...S.input, resize: 'vertical' }} />
            </div>
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#f4f6fe' }}>📢 Marquee Banner</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}><input type="checkbox" checked={settings.marqueeEnabled} onChange={e => updateSettings({ marqueeEnabled: e.target.checked })} /><span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#a8abb2' }}>{settings.marqueeEnabled ? 'ON' : 'OFF'}</span></label>
              </div>
              <label style={S.label}>Marquee Text</label>
              <input value={settings.marqueeText} onChange={e => updateSettings({ marqueeText: e.target.value })} style={S.input} />
            </div>
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#f4f6fe' }}>💡 Custom Daily Quote</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}><input type="checkbox" checked={settings.customQuoteEnabled} onChange={e => updateSettings({ customQuoteEnabled: e.target.checked })} /><span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#a8abb2' }}>{settings.customQuoteEnabled ? 'ON' : 'OFF'}</span></label>
              </div>
              <label style={S.label}>Quote Text (Overrides Random Hindi Quotes)</label>
              <textarea value={settings.customQuoteText || ''} onChange={e => updateSettings({ customQuoteText: e.target.value })} rows={2} placeholder="e.g., Hard work beats talent..." style={{ ...S.input, resize: 'vertical' }} />
            </div>
            <div style={S.card}>
              <h3 style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#f4f6fe', marginBottom: '0.75rem' }}>💰 Listing Prices</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                <div><label style={S.label}>Normal Listing (₹)</label><input type="number" value={settings.normalListingPrice} onChange={e => updateSettings({ normalListingPrice: parseInt(e.target.value) || 0 })} style={S.input} /></div>
                <div><label style={S.label}>Featured Listing (₹)</label><input type="number" value={settings.featuredListingPrice} onChange={e => updateSettings({ featuredListingPrice: parseInt(e.target.value) || 0 })} style={S.input} /></div>
              </div>
            </div>
            <div style={S.card}>
              <h3 style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#f4f6fe', marginBottom: '0.75rem' }}>🔑 Razorpay</h3>
              <label style={S.label}>Razorpay Key ID</label>
              <input value={settings.razorpayKey} onChange={e => updateSettings({ razorpayKey: e.target.value })} style={S.input} />
            </div>
            <div style={{ ...S.card, border: '1px solid rgba(52,211,153,0.2)', marginBottom: '0.75rem' }}>
              <h3 style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#34d399', marginBottom: '0.75rem' }}>🌱 Database Seeding</h3>
              <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: '#72767c', marginBottom: '0.75rem' }}>If your Firestore is empty, click this to load the 30+ sample businesses and deals automatically.</p>
              <button onClick={() => { if (confirm('Seed database with sample data?')) seedDatabase(); }} style={{ ...S.btn('rgba(52,211,153,0.15)'), color: '#34d399', padding: '0.5rem 1rem' }}>📥 Seed Sample Data</button>
            </div>
            <div style={{ ...S.card, border: '1px solid rgba(248,113,113,0.2)' }}>
              <h3 style={{ fontFamily: "'Manrope'", fontSize: '0.875rem', fontWeight: 700, color: '#f87171', marginBottom: '0.75rem' }}>⚠️ Danger Zone</h3>
              <button onClick={() => { if (confirm('Reset local preferences? (Firestore data is not deleted)')) { localStorage.removeItem('ps_lang'); localStorage.removeItem('ps_favorites'); window.location.reload(); } }} style={{ ...S.btn('rgba(248,113,113,0.15)'), padding: '0.5rem 1rem' }}>🗑️ Reset Local Preferences</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
