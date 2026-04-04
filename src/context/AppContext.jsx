import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, getDocs, 
  query, limit, orderBy, startAfter, serverTimestamp, where
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, storage, auth, functions } from '../firebase';
import { SAMPLE_BUSINESSES } from '../data/sampleData';
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
};

const SAMPLE_REVIEWS = [
  { id: 1, user: "Amit Singh", rating: 5, comment: "Expert service by the plumber. Highly recommended!", date: "2 days ago" },
  { id: 2, user: "Priya Verma", rating: 4, comment: "Good experience with the cleaning service.", date: "1 week ago" }
];

const TRENDING_SEARCHES = ["Plumber", "Electrician", "Salon", "AC Repair", "Cleaning"];

export function AppProvider({ children }) {
  // Local User Preferences
  const [lang, setLang] = useState(() => loadFromStorage('ps_lang', 'en'));
  const [theme, setTheme] = useState(() => loadFromStorage('ps_theme', 'light'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [favorites, setFavorites] = useState([]); // Default to empty, will be synced from Firestore
  const [filters, setFilters] = useState({ openNow: false, verified: false, nearMe: false });
  const [showGreeting, setShowGreeting] = useState(() => !sessionStorage.getItem('ps_greeting_shown'));

  // Firebase Real-time State
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noDb, setNoDb] = useState(false);

  // Search Logic (with fallback)
  const sourceBusinesses = (allBusinesses && allBusinesses.length > 0) ? allBusinesses : SAMPLE_BUSINESSES;
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

    // 1. Auth Listener
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // 2. Global Settings Listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) setSettings(doc.data());
    });

    // 3. Global Businesses Listener
    const qBiz = query(collection(db, 'businesses'), orderBy('createdAt', 'desc'), limit(businessesPerPage));
    const unsubBiz = onSnapshot(qBiz, (snapshot) => {
      const bizData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
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
      setDeals(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => {
      unsubAuth();
      unsubSettings();
      unsubBiz();
      unsubDeals();
    };
  }, []);

  // User-Specific Real-time Listeners (Wishlist & Bookings)
  useEffect(() => {
    if (!db || !currentUser) {
      setFavorites([]);
      setBookings([]);
      return;
    }

    // 1. User Bookings Listener (Secure & Synchronized)
    const qBookings = query(
      collection(db, 'bookings'), 
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubBookings = onSnapshot(qBookings, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    // 2. User Wishlist Listener (Cross-Device Sync)
    const unsubWishlist = onSnapshot(collection(db, 'users', currentUser.uid, 'wishlist'), (snapshot) => {
      const wishlistIds = snapshot.docs.map(doc => doc.id);
      setFavorites(wishlistIds);
    });

    return () => {
      unsubBookings();
      unsubWishlist();
    };
  }, [currentUser]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleThemeMode = () => toggleTheme();

  const isFavorite = (id) => favorites.includes(id);

  const toggleFavorite = async (id) => {
    if (!currentUser) return; // Must be logged in
    const wishlistRef = doc(db, 'users', currentUser.uid, 'wishlist', id);
    
    if (favorites.includes(id)) {
      await deleteDoc(wishlistRef);
    } else {
      await setDoc(wishlistRef, { 
        businessId: id, 
        addedAt: serverTimestamp() 
      });
    }
  };

  const getFavoriteBusinesses = () => businesses.filter(b => favorites.includes(b.id));

  const addBooking = async (booking) => {
    if (!currentUser) return;
    const newBooking = { 
      ...booking, 
      userId: currentUser.uid, // Tie to current user
      createdAt: serverTimestamp(), // Use server timestamp for reliable sync
      status: 'sent_to_whatsapp' 
    };
    await addDoc(collection(db, 'bookings'), newBooking);
  };

  const addBusiness = async (biz) => {
    const newBiz = { 
      ...biz, 
      ownerId: currentUser?.uid || null,
      createdAt: serverTimestamp(), 
      status: 'pending', 
      isVerified: false, 
      isFeatured: false, 
      rating: 0, 
      reviews: 0 
    };
    await addDoc(collection(db, 'businesses'), newBiz);
  };

  const addBusinessFree = async (biz) => {
    const newBiz = { ...biz, createdAt: serverTimestamp(), status: 'active', isVerified: false, isFeatured: false, rating: 5, reviews: 1 };
    await addDoc(collection(db, 'businesses'), newBiz);
  };

  const updateBusiness = async (id, data) => {
    await updateDoc(doc(db, 'businesses', id), data);
  };

  const deleteBusiness = async (id) => {
    await deleteDoc(doc(db, 'businesses', id));
  };

  const approveListing = async (id) => {
    await updateDoc(doc(db, 'businesses', id), { status: 'active' });
  };

  const rejectListing = async (id) => {
    await updateDoc(doc(db, 'businesses', id), { status: 'rejected' });
  };

  const toggleFeatured = async (id) => {
    const biz = businesses.find(b => b.id === id);
    if (biz) await updateDoc(doc(db, 'businesses', id), { isFeatured: !biz.isFeatured });
  };

  const toggleTopRated = async (id) => {
    const biz = businesses.find(b => b.id === id);
    if (biz) await updateDoc(doc(db, 'businesses', id), { isTopRated: !biz.isTopRated });
  };

  const loadMoreBusinesses = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;
    setLoadingMore(true);
    try {
      let q = query(collection(db, 'businesses'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(businessesPerPage));
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
  };

  const getFilteredBusinesses = (catId) => {
    const targetCat = catId || selectedCategory;
    
    // Use fuzzy search results if there's a query, otherwise use all active businesses
    let filtered = searchQuery ? fuzzyResults : businesses;

    // Always filter by status for privacy/security
    filtered = filtered.filter(b => b.status === 'active' || !b.status);

    if (targetCat !== 'all') {
      filtered = filtered.filter(b => b.category === targetCat);
    }

    if (filters.verified) {
      filtered = filtered.filter(b => b.isVerified);
    }

    if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  };

  const getBusinessById = (id) => sourceBusinesses.find(b => b.id === id);
  const getFeaturedBusinesses = () => businesses.filter(b => b.isFeatured && (b.status === 'active' || !b.status)).slice(0, 10);
  const getSuggestedBusinesses = () => businesses.filter(b => (b.isSuggested || b.isSponsored) && (b.status === 'active' || !b.status)).slice(0, 10);
  const getPromotedBusinesses = () => businesses.filter(b => b.isPromoted && (b.status === 'active' || !b.status)).slice(0, 8);
  const getRecommendedBusinesses = () => businesses.filter(b => b.isRecommended && (b.status === 'active' || !b.status)).slice(0, 8);
  const getTopRated = () => businesses.filter(b => b.status === 'active' || !b.status).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
  const getRecentlyListed = () => businesses.filter(b => b.status === 'active' || !b.status).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  const toggleSuggested = async (id) => {
    const biz = businesses.find(b => b.id === id);
    if (!biz) return;
    await updateDoc(doc(db, 'businesses', id), { isSuggested: !biz.isSuggested });
  };

  const logout = () => signOut(auth);

  if (loading && !noDb) {
    return <div style={{ minHeight: '100vh', background: '#0a0e13', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff9159' }}>Loading Patna Suvidha...</div>;
  }

  const toggleLang = () => setLang(prev => prev === 'hi' ? 'en' : 'hi');

  const contextValue = {
    lang, setLang, toggleLang,
    theme, toggleTheme, toggleThemeMode,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    sortBy, setSortBy,
    filters, setFilters,
    favorites, toggleFavorite, isFavorite, getFavoriteBusinesses,
    bookings, addBooking,
    businesses: businesses,
    allBusinesses, listings: sourceBusinesses.filter(b => b.status === 'pending'),
    deals, addDeal: async (d) => await addDoc(collection(db, 'deals'), d),
    settings, updateSettings: async (s) => await updateDoc(doc(db, 'settings', 'global'), s),
    reviews: SAMPLE_REVIEWS, trendingSearches: TRENDING_SEARCHES,
    getBusinessById,
    getFeaturedBusinesses, getSuggestedBusinesses, getPromotedBusinesses, getRecommendedBusinesses, getTopRated, getRecentlyListed,
    showGreeting, dismissGreeting: () => { setShowGreeting(false); sessionStorage.setItem('ps_greeting_shown', 'true'); },
    loadMoreBusinesses, hasMore, loadingMore,
    getFilteredBusinesses,
    currentUser, logout,
    turnstileToken, setTurnstileToken,
    addDailyOffer: async (offer) => {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await addDoc(collection(db, 'daily_offers'), { ...offer, expiresAt, createdAt: serverTimestamp() });
    },
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
