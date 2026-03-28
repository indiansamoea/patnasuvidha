import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import BotProtection from './components/BotProtection';
import GreetingPopup from './components/GreetingPopup';
import MarqueeBanner from './components/MarqueeBanner';
import Home from './pages/Home';
import Explore from './pages/Explore';
import BusinessDetails from './pages/BusinessDetails';
import BookService from './pages/BookService';
import BookingSuccess from './pages/BookingSuccess';
import Favorites from './pages/Favorites';
import AddBusiness from './pages/AddBusiness';
import Admin from './pages/Admin';
import Account from './pages/Account';
import Login from './pages/Login';
import AiAssistant from './components/AiAssistant';

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);
  return null;
}

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {/* Global Glowing Tricolour Morphism Background */}
      <div className="liquid-blob" style={{ position: 'fixed', top: '-10%', left: '-20%', width: '400px', height: '400px', animationDelay: '0s', background: 'radial-gradient(circle, rgba(255,153,51,0.5) 0%, transparent 70%)', zIndex: 0, opacity: 1, filter: 'blur(70px)' }}></div>
      <div className="liquid-blob" style={{ position: 'fixed', top: '30%', right: '-30%', width: '500px', height: '500px', animationDelay: '-5s', background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)', zIndex: 0, opacity: 1, filter: 'blur(80px)' }}></div>
      <div className="liquid-blob" style={{ position: 'fixed', bottom: '-10%', left: '10%', width: '450px', height: '450px', animationDelay: '-10s', background: 'radial-gradient(circle, rgba(19,136,8,0.5) 0%, transparent 70%)', zIndex: 0, opacity: 1, filter: 'blur(70px)' }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <BotProtection />
        <GreetingPopup />
        {!isAdmin && <MarqueeBanner />}
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/:category" element={<Explore />} />
        <Route path="/business/:id" element={<BusinessDetails />} />
        <Route path="/book/:id" element={<BookService />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/account" element={<Account />} />
        <Route path="/add-business" element={<AddBusiness />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      {!isAdmin && <AiAssistant />}
      {!isAdmin && <BottomNav />}
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
