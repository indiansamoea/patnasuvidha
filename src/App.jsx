import React, { useEffect, lazy, Suspense, Component } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import BotProtection from './components/BotProtection';
import GreetingPopup from './components/GreetingPopup';
import MarqueeBanner from './components/MarqueeBanner';
import { Toaster } from 'react-hot-toast';
import { usePushNotifications } from './hooks/usePushNotifications';
import { usePageTitle } from './hooks/usePageTitle';
import Home from './pages/Home';
import Services from './pages/Services';
import BookService from './pages/BookService';
import BookingSuccess from './pages/BookingSuccess';
const Admin = lazy(() => import('./pages/Admin'));
import Account from './pages/Account';
import Login from './pages/Login';
import ServiceLanding from './pages/ServiceLanding';
import Bookings from './pages/Bookings';
import Updates from './pages/Updates';
import AiAssistant from './components/AiAssistant';
import InstallPrompt from './components/InstallPrompt';
import NotificationBridge from './components/NotificationBridge';
import Onboarding from './pages/Onboarding';
import { useAppContext } from './context/AppContext';

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);
  return null;
}

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  const isOnboarding = location.pathname === '/onboarding';
  const { userData, currentUser, loading } = useAppContext();
  const { listenForMessages } = usePushNotifications();
  usePageTitle();

  // Onboarding Gate: If user is logged in but profile is incomplete, force onboarding
  useEffect(() => {
    if (!loading && currentUser && userData && userData.onboardingCompleted === false && !isOnboarding) {
      navigate('/onboarding', { replace: true });
    }
  }, [currentUser, userData, loading, isOnboarding]);

  // Start listening for notifications on mount
  useEffect(() => {
    listenForMessages();
  }, [listenForMessages]);

  const isServiceLanding = location.pathname.startsWith('/service/');

  return (
    <>
      <ScrollToTop />
      {/* Global Glowing Tricolour Morphism Background */}
      <div className="liquid-blob" style={{ position: 'fixed', top: '-10%', left: '-20%', width: '400px', height: '400px', animationDelay: '0s', background: 'radial-gradient(circle, rgba(255,153,51,0.5) 0%, transparent 70%)', zIndex: 0, opacity: 1, filter: 'blur(70px)' }}></div>
      <div className="liquid-blob" style={{ position: 'fixed', top: '30%', right: '-30%', width: '500px', height: '500px', animationDelay: '-5s', background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)', zIndex: 0, opacity: 1, filter: 'blur(80px)' }}></div>
      <div className="liquid-blob" style={{ position: 'fixed', bottom: '-10%', left: '10%', width: '450px', height: '450px', animationDelay: '-10s', background: 'radial-gradient(circle, rgba(19,136,8,0.5) 0%, transparent 70%)', zIndex: 0, opacity: 1, filter: 'blur(70px)' }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Toaster position="top-center" reverseOrder={false} />
        <BotProtection />
        <GreetingPopup />
        {!isAdmin && <MarqueeBanner />}
        <Suspense fallback={<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff9159' }}>Loading Patna Suvidha...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Navigate to="/services" replace />} />
            <Route path="/explore/:category" element={<Navigate to="/services" replace />} />
            <Route path="/business/:id" element={<Navigate to="/" replace />} />
            <Route path="/favorites" element={<Navigate to="/account" replace />} />
            
            {/* New Routes */}
            <Route path="/services" element={<Services />} />
            <Route path="/service/:category" element={<ServiceLanding />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/updates" element={<Updates />} />
            
            {/* Kept Routes */}
            <Route path="/book/:id" element={<BookService />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </Suspense>
        {!isAdmin && !isOnboarding && <AiAssistant />}
        {!isAdmin && !isOnboarding && <InstallPrompt />}
        {!isAdmin && !isOnboarding && <NotificationBridge />}
        {!isAdmin && !isOnboarding && !isServiceLanding && <BottomNav />}
      </div>
    </>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#ff9159', background: '#0a0e13', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>💥 Application Crashed</h2>
          <p style={{ color: '#ef4444' }}>{this.state.error?.toString()}</p>
          <pre style={{ background: '#151a20', padding: '1rem', overflowX: 'auto', fontSize: '0.8rem', color: '#a8abb2' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <AppLayout />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
