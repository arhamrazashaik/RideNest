import { useState, useEffect, useContext } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaRoute, FaMoneyBillWave, FaCar, FaCalendarAlt, FaMapMarkedAlt } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AuthContext from './context/AuthContext';
import Alert from './components/common/Alert';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookRide from './pages/BookRide';
import RideDetails from './pages/RideDetails';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import MyRides from './pages/MyRides';
import DriverDashboard from './pages/DriverDashboard';
import JoinRide from './pages/JoinRide';
import SheMode from './pages/SheMode';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import ScrollToTopButton from './components/common/ScrollToTopButton';

function App() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user && !loading && !isAuthPage) {
    return <Navigate to="/register" replace />;
  }

  return (
    <>
      <ScrollToTop />
      <Alert />
      <div className="min-h-screen flex flex-col bg-gray-50">
        {!isAuthPage && <Navbar />}
        <div className={!isAuthPage ? 'pt-20' : ''}>
          <AnimatedRoutes />
        </div>
        {!isAuthPage && <Footer />}
        <ScrollToTopButton />
      </div>
    </>
  );
}

// AnimatedRoutes component for page transitions
function AnimatedRoutes() {
  const location = useLocation();

  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -20
    }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="flex-grow"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book-ride" element={<BookRide />} />
          <Route path="/my-rides" element={<MyRides />} />
          <Route path="/rides/:id" element={<RideDetails />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/join-ride" element={<JoinRide />} />
          <Route path="/shemode" element={<SheMode />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
