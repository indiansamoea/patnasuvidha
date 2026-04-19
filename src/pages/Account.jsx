import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { getCategoryById } from '../utils/categories';
import { toast } from 'react-hot-toast';

const FAQS = [
  { q: "How do I book a service?", a: "Simply browse categories, select a service provider, and click 'Book'. You can choose to book via WhatsApp or through our direct booking system." },
  { q: "Are the service providers verified?", a: "Yes, we conduct initial background checks and verification for all service professionals listed on Patna Suvidha for your safety and peace of mind." },
  { q: "How do I pay for the services?", a: "You can pay online through our secure payment gateway at the time of booking, or choose 'Pay After Service' to pay the professional directly in cash." },
  { q: "Can I cancel my booking?", a: "Yes, you can cancel any booking before the service starts. For online payments, cancellations made within the allowed window are eligible for refunds." },
  { q: "How do I contact support?", a: "You can reach us directly via the 'Call Us' or 'Email' buttons below, or send us a message on WhatsApp through the Feedback section." }
];

const LEGAL_CONTENT = {
  privacy: {
    title: "Privacy Policy",
    content: `Effective Date: April 13, 2024\n\n1. Information Collection: We collect your name, phone number, and location only to facilitate service bookings.\n2. Use of Information: Your data is shared only with the service provider you choose to book.\n3. Data Security: We use industry-standard encryption to protect your personal data.\n4. Cookies: We use minimal cookies to maintain your login session and preferences.\n5. Your Rights: You can request deletion of your account and data at any time through our support channel.`
  },
  terms: {
    title: "Terms & Conditions",
    content: `1. Platform Role: Patna Suvidha is a hyperlocal directory facilitator. We connect users with independent service providers.\n2. Service Responsibility: The quality of service is the responsibility of the individual professional. We are not liable for disputes between users and providers.\n3. User Conduct: Users must provide accurate information and respect the service professionals.\n4. Content Ownership: All images and listings are owned by their respective businesses or Patna Suvidha.\n5. Limitation of Liability: We are not responsible for any direct or indirect damages arising from the use of our platform.`
  },
  refund: {
    title: "Refund Policy",
    content: `1. Cancellation: Full refunds are provided for online payments if the booking is cancelled at least 2 hours before the scheduled time.\n2. Failed Services: If a provider fails to show up, a full refund will be initiated to your original payment method within 5-7 working days.\n3. Processing Time: Refunds may take 5-10 business days to reflect in your bank account depending on your bank's policy.\n4. Disputed Services: For unsatisfactory services, please contact support within 24 hours for mediation.\n5. Non-Refundable: Booking fees (if applicable) are non-refundable once the service has been initiated.`
  }
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: 'ph-clock-countdown' },
  confirmed: { label: 'Confirmed', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: 'ph-calendar-check' },
  completed: { label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: 'ph-check-circle' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: 'ph-x-circle' },
  paid: { label: 'Paid', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: 'ph-credit-card' },
  payment_initiated: { label: 'Payment Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: 'ph-credit-card' }
};

function PolicyModal({ type, onClose }) {
  const policy = LEGAL_CONTENT[type];
  if (!policy) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}></div>
      <div className="clay-card animate-scale-up" style={{ 
        position: 'relative', width: '100%', maxWidth: '500px', maxHeight: '80vh',
        background: 'var(--surface)', padding: '2rem', overflowY: 'auto',
        border: '1px solid var(--primary-container)', borderRadius: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>
            {policy.title}
          </h3>
          <button onClick={onClose} style={{ border: 'none', background: 'var(--surface-container-high)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <i className="ph-bold ph-x" />
          </button>
        </div>
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: "'Manrope'", fontSize: '0.875rem', color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>
          {policy.content}
        </div>
        <button onClick={onClose} style={{ width: '100%', marginTop: '2rem', padding: '1rem', borderRadius: '16px', background: 'var(--gradient-primary)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
          I Understand
        </button>
      </div>
    </div>
  );
}

function ProfileEditModal({ user, onClose, onSave, isHi }) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || (phone && phone.length < 10)) {
       toast.error(isHi ? "कृपया सही जानकारी भरें" : "Please enter valid details");
       return;
    }
    setLoading(true);
    try {
      await onSave({ name, phone });
      toast.success(isHi ? "प्रोफ़ाइल अपडेट हो गई!" : "Profile updated!");
      onClose();
    } catch (err) {
      toast.error(isHi ? "अपडेट विफल रहा" : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}></div>
      <div className="clay-card animate-scale-up" style={{ 
        position: 'relative', width: '100%', maxWidth: '400px', 
        background: 'var(--surface)', padding: '1.75rem',
        border: '1px solid var(--primary-container)', borderRadius: '24px'
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>
          {isHi ? "प्रोफ़ाइल संपादित करें" : "Edit Profile"}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)', marginBottom: '0.375rem', display: 'block' }}>{isHi ? "नाम" : "Name"}</label>
            <input 
              type="text" value={name} onChange={e => setName(e.target.value)} 
              className="input-field" style={{ width: '100%' }} placeholder={isHi ? "पूरा नाम" : "Full Name"} 
            />
          </div>
          <div className="input-group">
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)', marginBottom: '0.375rem', display: 'block' }}>{isHi ? "फोन नंबर" : "Phone Number"}</label>
            <input 
              type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
              className="input-field" style={{ width: '100%' }} placeholder={isHi ? "10 अंकों का नंबर" : "10-digit phone number"} 
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--surface-container-high)', border: 'none', color: 'var(--on-surface)', fontWeight: 800, cursor: 'pointer' }}>
            {isHi ? "बंद करें" : "Cancel"}
          </button>
          <button onClick={handleSave} disabled={loading} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--gradient-primary)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? (isHi ? "हो रहा है..." : "Saving...") : (isHi ? "सुरक्षित करें" : "Save Changes")}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddressEditModal({ address, onClose, onSave, isHi }) {
  const [label, setLabel] = useState(address?.label || '');
  const [text, setText] = useState(address?.label || address?.text || '');
  const [loading, setLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const handleRetrieveLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          if (data && data.display_name) {
            const readable = data.display_name.split(', ').slice(0, 5).join(', ');
            setText(readable);
          }
        } catch (e) { console.error(e); } finally { setIsFetchingLocation(false); }
      },
      () => setIsFetchingLocation(false),
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  const handleSave = async () => {
    if (!text) { toast.error(isHi ? "पता लिखें" : "Please enter address"); return; }
    setLoading(true);
    try {
      await onSave({ label: text, type: 'home', updatedAt: new Date().toISOString() });
      toast.success(isHi ? "पता सुरक्षित हो गया!" : "Address saved!");
      onClose();
    } catch (err) {
      toast.error(isHi ? "त्रुटि" : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}></div>
      <div className="clay-card animate-scale-up" style={{ 
        position: 'relative', width: '100%', maxWidth: '400px', 
        background: 'var(--surface)', padding: '1.75rem',
        border: '1px solid var(--primary-container)', borderRadius: '24px'
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>
          {address ? (isHi ? "पता संपादित करें" : "Edit Address") : (isHi ? "नया पता जोड़ें" : "Add New Address")}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group relative">
            <textarea 
              value={text} onChange={e => setText(e.target.value)} 
              className="input-field" style={{ width: '100%', minHeight: '100px', paddingTop: '1rem', paddingRight: '3rem' }} 
              placeholder={isHi ? "अपना पूरा पता लिखें..." : "Enter full address..."} 
            />
            <button
              onClick={handleRetrieveLocation}
              disabled={isFetchingLocation}
              style={{ position: 'absolute', right: '10px', bottom: '10px', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-container)', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {isFetchingLocation ? <div className="spinner" style={{ width: '14px', height: '14px' }} /> : <i className="ph-fill ph-target" style={{ fontSize: '1.2rem' }} />}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--surface-container-high)', border: 'none', color: 'var(--on-surface)', fontWeight: 800, cursor: 'pointer' }}>
            {isHi ? "रद्द करें" : "Cancel"}
          </button>
          <button onClick={handleSave} disabled={loading} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--gradient-primary)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {isHi ? "सुरक्षित करें" : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
}

const LINKS = [
  {
    href: 'https://properties.patnasuvidha.online',
    icon: 'ph-buildings',
    color: '#059669',
    bg: 'rgba(16,185,129,0.15)',
    shadow: 'rgba(16,185,129,0.2)',
    title: 'Buy/Rent Properties',
    subtitle: 'properties.patnasuvidha.online',
    external: true,
  },
];

export default function Account() {
  const { 
    lang, currentUser, logout, bookings, 
    userData, completeOnboarding, savedAddresses, addAddress, updateAddress, deleteAddress
  } = useAppContext();
  const { requestPermission } = usePushNotifications();
  const navigate = useNavigate();
  const [showFaq, setShowFaq] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [activePolicy, setActivePolicy] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isNotifLoading, setIsNotifLoading] = useState(false);

  const isHi = lang === 'hi';
  
  const myBookings = useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter(b => 
      b.userId === currentUser.uid || 
      (b.customerPhone && currentUser.phoneNumber && b.customerPhone.includes(currentUser.phoneNumber.slice(-10)))
    ).sort((a, b) => {
      const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt || 0).getTime());
      const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt || 0).getTime());
      return dateB - dateA;
    });
  }, [bookings, currentUser]);

  const handleNotificationOptIn = async () => {
    setIsNotifLoading(true);
    try {
      await requestPermission();
    } catch (e) {
      console.error(e);
    } finally {
      setIsNotifLoading(false);
    }
  };

  const handleFeedback = () => {
    const text = encodeURIComponent("Hello Patna Suvidha team! I have some feedback:\n\n");
    window.open(`https://wa.me/917764812598?text=${text}`, '_blank');
  };

  const t = {
    hi: {
      title: 'मेरा खाता',
      hello: 'नमस्ते',
      login: 'लॉगिन / साइन अप',
      manage: 'अपनी बुकिंग और पसंदीदा प्रबंधित करें',
      continue: 'जारी रखें',
      bookings: 'मेरी बुकिंग',
      noBookings: 'अभी तक कोई बुकिंग नहीं',
      network: 'हमारा नेटवर्क',
      contact: 'संपर्क करें',
      help: 'फीडबैक और मदद',
      logout: 'लॉगआउट',
      service: 'सेवा',
      date: 'तारीख',
      price: 'कीमत',
      status: 'स्थिति',
      manageAddresses: 'सहेजे गए पते',
      addAddress: 'नया पता जोड़ें',
      edit: 'संपादित करें',
      delete: 'हटाएं'
     },
       en: {
         title: 'Account',
         hello: 'Hello',
         login: 'Login / Sign Up',
         manage: 'Manage your bookings & favorites',
         continue: 'Continue',
         bookings: 'My Bookings',
         noBookings: 'No bookings yet',
         network: 'Our Network',
         contact: 'Get in Touch',
         help: 'Feedback & Help',
         logout: 'Logout',
         service: 'Service',
         date: 'Date',
         price: 'Price',
         status: 'Status',
         manageAddresses: 'Saved Addresses',
         addAddress: 'Add New Address',
         edit: 'Edit',
         delete: 'Delete'
       }
    }[lang] || {
        title: 'Account',
        hello: 'Hello',
        login: 'Login / Sign Up',
        manage: 'Manage your bookings & favorites',
        continue: 'Continue',
        bookings: 'My Bookings',
        wishlist: 'My Wishlist',
        noBookings: 'No bookings yet',
        noFavs: 'No favorites yet',
        network: 'Our Network',
        contact: 'Get in Touch',
        help: 'Feedback & Help',
        legal: 'Legal & Policies',
        privacy: 'Privacy',
        terms: 'Terms',
        refund: 'Refunds',
        logout: 'Logout',
    };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '7rem', color: 'var(--on-surface)' }}>

      {/* Sticky Header */}
      <header className="liquid-glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <i className="ph-fill ph-user-circle" style={{ color: 'var(--primary)', fontSize: '1.5rem' }}></i>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            {t.title}
          </h1>
        </div>
      </header>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.25rem' }}>

        {/* User Profile / Login Card (Personalized Greeting) */}
        <div className="clay-card animate-fade-up-plus" style={{ 
          marginBottom: '1.75rem', padding: '1.75rem', 
          background: 'var(--surface-container)', 
          border: '1.5px solid var(--primary-container)',
          boxShadow: 'var(--shadow-glow)'
        }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className="ph-fill ph-user" style={{ color: 'var(--primary)', fontSize: '1.75rem' }}></i>
                  )}
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '0.125rem' }}>
                    {t.hello}, {userData?.name?.split(' ')[0] || currentUser.displayName?.split(' ')[0] || 'User'}! 👋
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 700 }}>
                      {userData?.phone || currentUser.phoneNumber || currentUser.email || 'Member'}
                    </p>
                    <button onClick={() => setShowEditProfile(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <i className="ph ph-pencil-simple" style={{ fontSize: '1rem' }}></i>
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={logout}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '0.5rem 0.875rem', borderRadius: '0.75rem', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.125rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
                  {t.login}
                </h3>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 700 }}>
                  {t.manage}
                </p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.875rem', fontSize: '0.875rem', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(255,145,89,0.3)' }}
              >
                {t.continue}
              </button>
            </div>
          )}
        </div>

        {/* Preferences / Notifications */}
        {currentUser && (
          <section className="animate-fade-up-plus delay-1" style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', paddingLeft: '0.25rem' }}>
              {isHi ? 'प्राथमिकताएं' : 'Preferences'}
            </h2>
            <div className="clay-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,145,89,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ph-fill ph-bell-ringing" style={{ color: 'var(--primary)', fontSize: '1.125rem' }}></i>
                </div>
                <div>
                  <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface)' }}>{isHi ? 'पुश नोटिफिकेशन' : 'Push Notifications'}</p>
                  <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                    {Notification.permission === 'granted' ? (isHi ? 'चालू है' : 'Enabled') : (isHi ? 'बंद है' : 'Disabled')}
                  </p>
                </div>
              </div>
              {Notification.permission !== 'granted' && (
                <button 
                  onClick={handleNotificationOptIn}
                  disabled={isNotifLoading}
                  style={{ 
                    padding: '0.5rem 1rem', borderRadius: '0.75rem', 
                    background: 'var(--primary)', color: 'white', 
                    fontSize: '0.75rem', fontWeight: 800, border: 'none', cursor: 'pointer' 
                  }}
                >
                  {isNotifLoading ? '...' : (isHi ? 'चालू करें' : 'Enable')}
                </button>
              )}
            </div>
          </section>
        )}

        {/* My Bookings Section */}
        {currentUser && (
          <section className="animate-fade-up-plus delay-2" style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t.bookings}
              </h2>
            </div>

            {myBookings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myBookings.map((b, i) => {
                  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                  const isCompleted = b.status === 'completed';
                  return (
                    <div key={b.id || i} className="clay-card" style={{ padding: '1.25rem', border: isCompleted ? '1px solid var(--primary)20' : '1px solid transparent' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9375rem', fontWeight: 900, color: 'var(--primary)' }}>{b.service}</p>
                          <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>{b.date} · {b.time}</p>
                        </div>
                        <div style={{
                          padding: '0.3rem 0.65rem', borderRadius: '999px', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase',
                          display: 'flex', alignItems: 'center', gap: '0.25rem',
                          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`
                        }}>
                          <i className={`ph-fill ${cfg.icon}`} />
                          {isHi ? (b.status === 'pending' ? 'प्रतीक्षा में' : b.status === 'confirmed' ? 'पुष्टि' : b.status === 'completed' ? 'पूर्ण' : 'रद्द') : cfg.label}
                        </div>
                      </div>

                      {/* Provider Info */}
                      {(b.providerName || b.providerPhone) && (
                        <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '12px', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="ph-fill ph-user-gear" style={{ color: 'var(--primary)', fontSize: '1rem' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your Expert</p>
                            <p style={{ fontSize: '0.8125rem', fontWeight: 900 }}>{b.providerName || (isHi ? 'विशेषज्ञ' : 'Expert')}</p>
                          </div>
                          {b.providerPhone && (
                             <a href={`tel:${b.providerPhone}`} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                               <i className="ph-fill ph-phone" />
                             </a>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.875rem', borderTop: '1px solid var(--outline-variant)' }}>
                        <div>
                          <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--on-surface)' }}>₹{b.amount || '---'}</p>
                          <p style={{ fontSize: '0.625rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{b.paymentMethod === 'pay_now' ? 'Paid Online' : 'Pay After Service'}</p>
                        </div>
                        
                        {isCompleted && !b.hasReviewed ? (
                          <button onClick={() => navigate(`/service/${b.categoryId}?review=${b.id}`)} style={{ 
                            padding: '0.5rem 0.875rem', borderRadius: '0.75rem', background: 'var(--gradient-primary)', 
                            color: 'white', border: 'none', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(255,140,0,0.2)'
                          }}>
                            {isHi ? 'रेट करें' : 'Rate Service'}
                          </button>
                        ) : (
                          <p style={{ fontSize: '0.625rem', color: 'var(--on-surface-variant)', fontWeight: 700, letterSpacing: '0.02em' }}>ID: {b.id?.slice(-8).toUpperCase()}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="clay-card" style={{ padding: '2.5rem', textAlign: 'center', opacity: 0.6 }}>
                <i className="ph ph-calendar-blank" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', fontWeight: 700 }}>{t.noBookings}</p>
              </div>
            )}
          </section>
        )}

        {/* Saved Addresses Manager */}
        {currentUser && (
          <section className="animate-fade-up-plus delay-2" style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t.manageAddresses}
              </h2>
              <button 
                onClick={() => setShowAddAddress(true)}
                style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-container)', border: 'none', padding: '0.375rem 0.75rem', borderRadius: '99px', cursor: 'pointer' }}
              >
                + {isHi ? "नया" : "Add"}
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {savedAddresses.length > 0 ? (
                savedAddresses.map((addr) => (
                  <div key={addr.id} className="clay-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="ph-fill ph-map-pin" style={{ color: 'var(--primary)', fontSize: '1.125rem' }}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.8125rem', fontWeight: 800, color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {addr.label}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setEditingAddress(addr)} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                        <i className="ph ph-pencil-simple" style={{ fontSize: '1.125rem' }}></i>
                      </button>
                      <button onClick={() => { if(confirm(isHi ? "क्या आप वाकई हटाना चाहते हैं?" : "Delete address?")) deleteAddress(addr.id) }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <i className="ph ph-trash" style={{ fontSize: '1.125rem' }}></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', color: 'var(--on-surface-variant)', textAlign: 'center', padding: '1rem', background: 'var(--surface-container-low)', borderRadius: '1rem', border: '1px dashed var(--outline-variant)' }}>
                  {isHi ? "अभी तक कोई पता नहीं बचाया गया" : "No addresses saved yet"}
                </p>
              )}
            </div>
          </section>
        )}
        <section className="animate-fade-up-plus delay-3" style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', paddingLeft: '0.25rem' }}>
            {t.network}
          </h2>
          {LINKS.map((link, i) => (
            <a
              key={i}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="clay-card"
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.125rem 1.25rem', marginBottom: '0.75rem', textDecoration: 'none', transition: 'transform 150ms' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: link.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${link.shadow}`, flexShrink: 0 }}>
                <i className={`ph-fill ${link.icon}`} style={{ color: link.color, fontSize: '1.375rem' }}></i>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9375rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.125rem' }}>{link.title}</p>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.subtitle}</p>
              </div>
              <i className="ph-bold ph-arrow-up-right" style={{ color: 'var(--on-surface-variant)', fontSize: '1rem', flexShrink: 0, opacity: 0.6 }}></i>
            </a>
          ))}

          {/* Bespoke Partner Hub CTA */}
          <div className="clay-card liquid-glass" style={{ 
            marginTop: '1.5rem', padding: '1.5rem', 
            background: 'var(--gradient-primary-soft)', 
            border: '1px solid hsla(var(--p-h), 100%, 50%, 0.1)',
            position: 'relative', overflow: 'hidden' 
          }}>
             <div className="glass-reflection" style={{ opacity: 0.2 }} />
             <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <i className="ph-fill ph-handshake" style={{ fontSize: '1.5rem' }} />
                   </div>
                   <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 950, color: '#fff' }}>Partner with Us</h3>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Join Patna's most elite directory.</p>
                   </div>
                </div>
                <motion.button 
                   whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                   onClick={() => window.open('https://wa.me/917764812598?text=Hello! I want to list my business on Patna Suvidha.', '_blank')}
                   style={{ width: '100%', padding: '0.875rem', borderRadius: '1rem', background: '#fff', color: 'var(--primary)', border: 'none', fontWeight: 950, fontSize: '0.8125rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                >
                   LIST YOUR BUSINESS
                </motion.button>
             </div>
          </div>
        </section>

        {/* Contact */}
        <section className="animate-fade-up-plus delay-4" style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', paddingLeft: '0.25rem' }}>
            {t.contact}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <a href="tel:+917764812598" className="clay-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem', padding: '1.25rem 1rem', textDecoration: 'none', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ph-fill ph-phone" style={{ color: 'var(--primary)', fontSize: '1.375rem' }}></i>
              </div>
              <div>
                <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.125rem' }}>Call Us</p>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>+91 77648 12598</p>
              </div>
            </a>
            <a href="mailto:patnasuvidha@gmail.com" className="clay-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem', padding: '1.25rem 1rem', textDecoration: 'none', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(34,211,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ph-fill ph-envelope" style={{ color: '#0284c7', fontSize: '1.375rem' }}></i>
              </div>
              <div>
                <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.125rem' }}>Email</p>
                <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>patnasuvidha@<br />gmail.com</p>
              </div>
            </a>
          </div>
        </section>

        {/* Feedback & Help */}
        <section className="animate-fade-up-plus delay-5">
          <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', paddingLeft: '0.25rem' }}>
            {t.help}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { icon: 'ph-chat-centered-text', color: 'var(--primary)', bg: 'var(--primary-container)', label: 'Send Feedback', sub: 'Via WhatsApp', action: handleFeedback },
              { icon: 'ph-question', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', label: 'Help Center', sub: 'FAQs & support', action: () => setShowFaq(!showFaq) },
            ].map((item, i) => (
              <button key={i} onClick={item.action} className="clay-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem', padding: '1.25rem 1rem', cursor: 'pointer', textAlign: 'center', border: 'none' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ph-fill ${item.icon}`} style={{ color: item.color, fontSize: '1.375rem' }}></i>
                </div>
                <div>
                  <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.125rem' }}>{item.label}</p>
                  <p style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{item.sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* FAQ Expandable Area */}
          {showFaq && (
            <div className="animate-fade-up-plus delay-1" style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.9rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>Frequently Asked Questions</h3>
              {FAQS.map((faq, idx) => (
                <div key={idx} className="clay-card" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                    <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)', paddingRight: '1rem' }}>{faq.q}</span>
                        <i className={`ph-bold ph-caret-${openFaq === idx ? 'up' : 'down'}`} style={{ color: 'var(--primary)', flexShrink: 0 }}></i>
                    </button>
                    {openFaq === idx && (
                        <div className="animate-fade-in" style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--outline-variant)' }}>
                            <p style={{ fontFamily: "'Manrope'", fontSize: '0.8125rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, paddingTop: '0.75rem' }}>{faq.a}</p>
                        </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Legal Sections */}
        <section className="animate-fade-up-plus delay-6" style={{ marginTop: '1.75rem' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', paddingLeft: '0.25rem' }}>
            {t.legal || 'Legal & Policies'}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { type: 'privacy', label: t.privacy || 'Privacy', icon: 'ph-shield-check' },
              { type: 'terms', label: t.terms || 'Terms', icon: 'ph-file-text' },
              { type: 'refund', label: t.refund || 'Refunds', icon: 'ph-receipt' }
            ].map((p, i) => (
              <button 
                key={i} 
                onClick={() => setActivePolicy(p.type)}
                className="clay-card" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '0.75rem 0.5rem', border: 'none', cursor: 'pointer' }}
              >
                <i className={`ph-bold ${p.icon}`} style={{ color: 'var(--primary)', fontSize: '1rem' }}></i>
                <span style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface)' }}>{p.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '2.5rem 0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--surface-container-high)', borderRadius: '999px', padding: '0.5rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--outline-variant)' }}>
            <span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', fontWeight: 700, color: 'var(--on-surface)' }}>
              Made with <i className="ph-fill ph-heart" style={{ color: '#ef4444', verticalAlign: 'middle', margin: '0 2px' }}></i> by
            </span>
            <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', textDecoration: 'none', letterSpacing: '0.05em' }}>
              PATNA SUVIDHA TEAM
            </span>
          </div>
          <p style={{ fontFamily: "'Manrope'", fontSize: '0.625rem', fontWeight: 600, color: 'var(--on-surface-variant)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            v3.5 · Patna Suvidha © 2024
          </p>
        </div>

      </div>

      {/* Policy Modal Overlay */}
      {activePolicy && (
        <PolicyModal type={activePolicy} onClose={() => setActivePolicy(null)} />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <ProfileEditModal 
          user={userData || currentUser} 
          isHi={isHi} 
          onClose={() => setShowEditProfile(false)} 
          onSave={completeOnboarding} 
        />
      )}

      {/* Add Address Modal */}
      {showAddAddress && (
        <AddressEditModal 
          isHi={isHi} 
          onClose={() => setShowAddAddress(false)} 
          onSave={addAddress} 
        />
      )}

      {/* Edit Address Modal */}
      {editingAddress && (
        <AddressEditModal 
          address={editingAddress}
          isHi={isHi} 
          onClose={() => setEditingAddress(null)} 
          onSave={(data) => updateAddress(editingAddress.id, data)} 
        />
      )}
    </div>
  );
}
