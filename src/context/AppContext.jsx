import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, getDocs, 
  query, limit, orderBy, startAfter, serverTimestamp, where
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, storage, auth, functions } from '../firebase';
import { useBusinessSearch } from '../hooks/useBusinessSearch';

const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
};

const AppContext = createContext();

const DEFAULT_SETTINGS = {
  maintenance: false,
  welcomeMessage: "Welcome to Patna Suvidha!",
  supportPhone: "+91 9101019369",
  whatsappSupport: "https://wa.me/919101019369",
  greetingEnabled: true,
  greetingText: "🙏 प्रणाम पटना!\nWelcome to Patna Suvidha — Your city's very own service companion.",
  // Telegram config (filled via Admin → Settings)
  telegramBotToken: '8308616611:AAE67mkACgfA3QpVcb-s1xJgVlym39jC6Cg', // Default from ServiceLanding
  telegramAdminChatId: '6410959760', // Default from ServiceLanding
  telegramCustomChatId: '',
  telegramCustomName: 'Coordinator',
  razorpayKey: 'rzp_live_SSIUQLBgFOF2M7', // Default from ServiceLanding
  pausedCategories: [],
  bookingsEnabled: true,
};

const TRENDING_SEARCHES = ["Plumber", "Electrician", "Salon", "AC Repair", "Cleaning"];

// ─────────────────────────────────────────────────────────────────────────────
// Telegram Notification Utility
// ─────────────────────────────────────────────────────────────────────────────
async function sendTelegramNotification(booking, telegramSettings) {
  const { telegramBotToken, telegramAdminChatId, telegramCustomChatId } = telegramSettings;
  if (!telegramBotToken || !telegramAdminChatId) {
    console.warn("Telegram notification skipped: Missing Token or Admin Chat ID.");
    return;
  }

  const paymentLabel = booking.paymentMethod === 'pay_now'
    ? '💳 Online Payment (Completed)'
    : '💵 Pay After Service (COD)';

  const amountLine = booking.amount
    ? `\n💰 *Amount:* ₹${Number(booking.amount).toLocaleString('en-IN')}`
    : '';

  const msg =
    `🔔 *New Booking Received!*\n` +
    `━━━━━━━━━━━━━━━\n` +
    `🔧 *Service:* ${booking.service || 'N/A'}\n` +
    `📋 *Category:* ${booking.categoryId || booking.category || 'N/A'}\n` +
    `📅 *Date:* ${booking.date || 'N/A'}\n` +
    `🕐 *Time:* ${booking.time || 'N/A'}\n` +
    `📍 *Address:* ${booking.customerAddress || 'N/A'}\n` +
    `👤 *Customer:* ${booking.customerName || 'N/A'}\n` +
    `📱 *Phone:* ${booking.customerPhone || 'N/A'}\n` +
    `${paymentLabel}${amountLine}\n` +
    `━━━━━━━━━━━━━━━\n` +
    `🆔 *Booking ID:* \`${booking.bookingId || 'auto'}\`\n` +
    `⚡ _Patna Suvidha Admin Alert_`;

  const targets = [telegramAdminChatId, telegramCustomChatId].filter(Boolean);
  for (const chatId of targets) {
    try {
      await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' }),
      });
    } catch (e) {
      console.error('Telegram notification failed for', chatId, e);
    }
  }
}

export function AppProvider({ children }) {
  // Local User Preferences
  const [lang, setLang] = useState(() => loadFromStorage('ps_lang', 'en'));
  const [theme, setTheme] = useState(() => loadFromStorage('ps_theme', 'light'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({ openNow: false, verified: false, nearMe: false });
  const [showGreeting, setShowGreeting] = useState(() => !sessionStorage.getItem('ps_greeting_shown'));
  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState(() => loadFromStorage('ps_addresses', []));

  // Firebase Real-time State
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]); // admin: all bookings
  const [deals, setDeals] = useState([]);
  const [serviceOffers, setServiceOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noDb, setNoDb] = useState(false);

  // Search Logic (with fallback)
  const sourceBusinesses = allBusinesses || [];
  const businesses = sourceBusinesses.filter(b => b.status === 'active' || !b.status);
  const fuzzyResults = useBusinessSearch(sourceBusinesses, searchQuery);
  const [turnstileToken, setTurnstileToken] = useState(null);

  // Pagination State
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const businessesPerPage = 15;

  useEffect(() => { saveToStorage('ps_lang', lang); }, [lang]);
  useEffect(() => { saveToStorage('ps_theme', theme); }, [theme]);
  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  // Auth & Global Real-time Listeners
  useEffect(() => {
    if (!auth || !db) {
      setNoDb(true);
      setLoading(false);
      return;
    }

    // 1. Auth & User Data Listener
    let unsubUser = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous user listener if it exists
      if (unsubUser) {
        unsubUser();
        unsubUser = null;
      }

      setCurrentUser(user);
      if (user) {
        // Sync full profile data in real-time
        unsubUser = onSnapshot(doc(db, 'users', user.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setUserData(data);
            setCurrentUserRole(data.role || 'user');
          } else {
            setUserData(null);
            setCurrentUserRole(null);
          }
        });
      } else {
        setUserData(null);
        setCurrentUserRole(null);
      }
    });

    // 2. Global Settings Listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) setSettings(prev => ({ ...DEFAULT_SETTINGS, ...snap.data() }));
    });

    // 3. Global Businesses Listener
    const qBiz = query(collection(db, 'businesses'), orderBy('createdAt', 'desc'), limit(businessesPerPage));
    const unsubBiz = onSnapshot(qBiz, (snapshot) => {
      const bizData = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      setAllBusinesses(bizData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === businessesPerPage);
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setNoDb(true);
      setLoading(false);
    });

    // 4. Global Deals Listener
    const unsubDeals = onSnapshot(collection(db, 'deals'), (snapshot) => {
      setDeals(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    // 5. Service Offers Listener (admin-controlled)
    const qOffers = query(collection(db, 'service_offers'), orderBy('createdAt', 'desc'));
    const unsubOffers = onSnapshot(qOffers, (snapshot) => {
      setServiceOffers(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    }, () => {
      setServiceOffers([]);
    });

    // 6. Notifications Listener
    const qNotifs = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubNotifs = onSnapshot(qNotifs, (snapshot) => {
      setNotifications(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    // 7. Categories Metadata Listener
    const unsubCats = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    return () => {
      unsubAuth();
      unsubSettings();
      unsubBiz();
      unsubDeals();
      unsubOffers();
      unsubNotifs();
      unsubCats();
    };
  }, []);

  // User-Specific Listeners
  useEffect(() => {
    if (!db || !currentUser) {
      setFavorites([]);
      setBookings([]);
      return;
    }

    // 1. User Bookings
    const qBookings = query(
      collection(db, 'bookings'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubBookings = onSnapshot(qBookings, (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    // 2. User Addresses
    const qAddresses = collection(db, 'users', currentUser.uid, 'addresses');
    const unsubAddresses = onSnapshot(qAddresses, (snapshot) => {
      const firestoreAddresses = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      if (firestoreAddresses.length > 0) {
        setSavedAddresses(firestoreAddresses);
        saveToStorage('ps_addresses', firestoreAddresses);
      }
    });

    return () => {
      unsubBookings();
      unsubAddresses();
    };
  }, [currentUser]);

  // Admin: listen to ALL bookings
  useEffect(() => {
    if (!db || !currentUser) return;
    // Only set up all-bookings listener after we know the role
    if (currentUserRole !== 'admin') return;

    const qAll = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(qAll, (snapshot) => {
      setAllBookings(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    
    // Listen to ALL providers (internal)
    const unsubProviders = onSnapshot(collection(db, 'businesses'), (snapshot) => {
      setProviders(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    return () => {
      unsub();
      unsubProviders();
    };
  }, [currentUser, currentUserRole]);

  const isAdmin = useCallback(() => currentUserRole === 'admin', [currentUserRole]);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'light' ? 'dark' : 'light'), []);
  const toggleThemeMode = useCallback(() => toggleTheme(), [toggleTheme]);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback(async (id) => {
    if (!currentUser || !db) return;
    const wishlistRef = doc(db, 'users', currentUser.uid, 'wishlist', id);
    if (favorites.includes(id)) {
      await deleteDoc(wishlistRef).catch(console.error);
    } else {
      await setDoc(wishlistRef, { businessId: id, addedAt: serverTimestamp() }).catch(console.error);
    }
  }, [currentUser, favorites]);

  const getFavoriteBusinesses = useCallback(() => businesses.filter(b => favorites.includes(b.id)), [businesses, favorites]);

  // ─── Booking System ───────────────────────────────────────────────────────
  const addBooking = useCallback(async (booking) => {
    if (!currentUser || !db) return;
    const newBooking = {
      ...booking,
      userId: currentUser.uid,
      customerName: currentUser.displayName || booking.customerName || '',
      customerPhone: currentUser.phoneNumber || booking.customerPhone || '',
      createdAt: serverTimestamp(),
      status: booking.paymentMethod === 'pay_now' ? 'payment_initiated' : 'pending',
      paymentMethod: booking.paymentMethod || 'pay_later',
    };
    const docRef = await addDoc(collection(db, 'bookings'), newBooking);

    // Fire Telegram notification asynchronously
    sendTelegramNotification(
      { ...newBooking, bookingId: docRef.id, createdAt: new Date().toISOString() },
      settings
    ).catch(console.error);

    return docRef.id;
  }, [currentUser, settings]);

  const updateBookingStatus = useCallback(async (id, status, extra = {}) => {
    if (!db) return;
    const updateData = {
      status,
      ...extra,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(db, 'bookings', id), updateData).catch(console.error);
  }, []);

  const addReview = useCallback(async (booking, reviewData) => {
    if (!currentUser || !db || !booking?.id) return;
    await updateDoc(doc(db, 'bookings', booking.id), {
      hasReviewed: true,
      review: reviewData,
      updatedAt: serverTimestamp()
    });
    // Record review on business
    if (booking.businessId) {
      await addDoc(collection(db, 'businesses', booking.businessId, 'reviews'), {
        ...reviewData,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'User',
        createdAt: serverTimestamp()
      });
    }
  }, [currentUser]);

  const getReviews = useCallback(async (businessId) => {
    if (!db || !businessId) return [];
    try {
      const q = query(collection(db, 'businesses', businessId, 'reviews'), orderBy('createdAt', 'desc'), limit(10));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (e) {
      console.error("GetReviews Error:", e);
      return [];
    }
  }, []);

  // ─── Service Offers & Notifications ─────────────────────────────────────
  const addServiceOffer = useCallback(async (offer) => {
    if (!isAdmin() || !db) return;
    await addDoc(collection(db, 'service_offers'), {
      ...offer,
      active: offer.active ?? true,
      createdAt: serverTimestamp(),
    });
  }, [isAdmin]);

  const updateServiceOffer = useCallback(async (id, data) => {
    if (!isAdmin() || !db) return;
    await updateDoc(doc(db, 'service_offers', id), { ...data, updatedAt: serverTimestamp() });
  }, [isAdmin]);

  const deleteServiceOffer = useCallback(async (id) => {
    if (!isAdmin() || !db) return;
    await deleteDoc(doc(db, 'service_offers', id));
  }, [isAdmin]);

  const addNotification = useCallback(async (n) => {
    if (!isAdmin() || !db) return;
    await addDoc(collection(db, 'notifications'), { 
      ...n, 
      createdAt: serverTimestamp() 
    });
  }, [isAdmin]);

  // ─── Category Master Functions ──────────────────────────────────────────
  const addCategory = useCallback(async (cat) => {
    if (!isAdmin() || !db) return;
    await setDoc(doc(db, 'categories', cat.id), {
      ...cat,
      createdAt: serverTimestamp(),
    });
  }, [isAdmin]);

  const updateCategory = useCallback(async (id, data) => {
    if (!isAdmin() || !db) return;
    await updateDoc(doc(db, 'categories', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }, [isAdmin]);

  const deleteCategory = useCallback(async (id) => {
    if (!isAdmin() || !db) return;
    await deleteDoc(doc(db, 'categories', id));
  }, [isAdmin]);

  // ─── Business helpers ──────────────────────────────────────────────────
  const addBusiness = useCallback(async (biz) => {
    if (!db) return;
    const newBiz = {
      ...biz,
      ownerId: currentUser?.uid || null,
      createdAt: serverTimestamp(),
      status: (currentUserRole === 'admin') ? 'active' : 'pending',
      isVerified: (currentUserRole === 'admin'),
      isFeatured: false,
      rating: 0,
      reviews: 0
    };
    await addDoc(collection(db, 'businesses'), newBiz);
  }, [currentUser, currentUserRole]);

  const updateBusiness = useCallback(async (id, data) => {
    if (!isAdmin() || !db) return;
    await updateDoc(doc(db, 'businesses', id), data);
  }, [isAdmin]);

  const deleteBusiness = useCallback(async (id) => {
    if (!isAdmin() || !db) return;
    await deleteDoc(doc(db, 'businesses', id));
  }, [isAdmin]);

  const loadMoreBusinesses = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc || !db) return;
    setLoadingMore(true);
    try {
      const q = query(collection(db, 'businesses'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(businessesPerPage));
      const snapshot = await getDocs(q);
      const newBiz = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      setAllBusinesses(prev => [...prev, ...newBiz]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === businessesPerPage);
    } catch (e) {
      console.error('Error loading more:', e);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastDoc]);

  const getFilteredBusinesses = useCallback((catId) => {
    const targetCat = catId || selectedCategory;
    let filtered = searchQuery ? fuzzyResults : businesses;
    filtered = filtered.filter(b => b.status === 'active' || !b.status);
    if (targetCat !== 'all') filtered = filtered.filter(b => b.category === targetCat);
    if (filters.verified) filtered = filtered.filter(b => b.isVerified);
    if (sortBy === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [selectedCategory, searchQuery, fuzzyResults, businesses, filters, sortBy]);

  const getBusinessById = useCallback((id) => sourceBusinesses.find(b => b.id === id), [sourceBusinesses]);
  const getFeaturedBusinesses = useCallback(() => businesses.filter(b => b.isFeatured && (b.status === 'active' || !b.status)).slice(0, 10), [businesses]);
  const getSuggestedBusinesses = useCallback(() => businesses.filter(b => (b.isSuggested || b.isSponsored) && (b.status === 'active' || !b.status)).slice(0, 10), [businesses]);
  const getPromotedBusinesses = useCallback(() => businesses.filter(b => b.isPromoted && (b.status === 'active' || !b.status)).slice(0, 8), [businesses]);
  const getRecommendedBusinesses = useCallback(() => businesses.filter(b => b.isRecommended && (b.status === 'active' || !b.status)).slice(0, 8), [businesses]);
  const getTopRated = useCallback(() => businesses.filter(b => b.status === 'active' || !b.status).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8), [businesses]);
  const getRecentlyListed = useCallback(() => businesses.filter(b => b.status === 'active' || !b.status).sort((a, b) => {
    const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
    const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
    return dateB - dateA;
  }).slice(0, 8), [businesses]);

  const addAddress = useCallback(async (addressData) => {
    if (!currentUser || !db) return;
    const addrRef = collection(db, 'users', currentUser.uid, 'addresses');
    await addDoc(addrRef, addressData);
  }, [currentUser]);

  const updateAddress = useCallback(async (addressId, addressData) => {
    if (!currentUser || !db) return;
    const addrRef = doc(db, 'users', currentUser.uid, 'addresses', addressId);
    await updateDoc(addrRef, addressData);
  }, [currentUser]);

  const deleteAddress = useCallback(async (addressId) => {
    if (!currentUser || !db) return;
    const addrRef = doc(db, 'users', currentUser.uid, 'addresses', addressId);
    await deleteDoc(addrRef);
  }, [currentUser]);

  const completeOnboarding = useCallback(async (profileData) => {
    if (!currentUser || !db) return;
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, {
      ...profileData,
      onboardingCompleted: true,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }, [currentUser]);

  const logout = useCallback(() => signOut(auth), []);
  const toggleLang = useCallback(() => setLang(prev => prev === 'hi' ? 'en' : 'hi'), []);
  const dismissGreeting = useCallback(() => { setShowGreeting(false); sessionStorage.setItem('ps_greeting_shown', 'true'); }, []);

  if (loading && !noDb) {
    return <div style={{ minHeight: '100vh', background: '#0a0e13', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff9159' }}>Loading Patna Suvidha...</div>;
  }

  const contextValue = {
    lang, setLang, toggleLang,
    theme, toggleTheme, toggleThemeMode,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    sortBy, setSortBy,
    filters, setFilters,
    favorites, toggleFavorite, isFavorite, getFavoriteBusinesses,
    // Booking system
    bookings, allBookings, addBooking, updateBookingStatus, addReview, getReviews,
    bookingsEnabled: settings.bookingsEnabled !== false,
    // Addresses
    savedAddresses, addAddress, updateAddress, deleteAddress,
    // Service Offers and Notifications
    serviceOffers, addServiceOffer, updateServiceOffer, deleteServiceOffer,
    addNotification,
    // Category Master
    categories, addCategory, updateCategory, deleteCategory,
    // Providers (Internal)
    providers,
    // Businesses (repurposed for providers)
    businesses, allBusinesses,
    listings: sourceBusinesses.filter(b => b.status === 'pending'),
    deals, addDeal: async (d) => await addDoc(collection(db, 'deals'), d),
    settings, updateSettings: async (s) => {
      await updateDoc(doc(db, 'settings', 'global'), s);
    },
    updateCategoryAvailability: async (catId, enabled) => {
      const current = settings.pausedCategories || [];
      const updated = enabled 
        ? current.filter(id => id !== catId)
        : [...new Set([...current, catId])];
      await updateDoc(doc(db, 'settings', 'global'), { pausedCategories: updated });
    },
    trendingSearches: TRENDING_SEARCHES,
    getBusinessById,
    getFeaturedBusinesses, getSuggestedBusinesses, getPromotedBusinesses,
    getRecommendedBusinesses, getTopRated, getRecentlyListed,
    showGreeting, dismissGreeting,
    loadMoreBusinesses, hasMore, loadingMore,
    getFilteredBusinesses,
    addBusiness, updateBusiness, deleteBusiness,
    currentUser, currentUserRole, userData, logout, isAdmin, completeOnboarding,
    turnstileToken, setTurnstileToken,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
