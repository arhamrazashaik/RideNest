import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaUserCircle, FaBell } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would be from auth context in a real app
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();

  // Check if user is scrolled down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  const toggleNotificationsDropdown = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  return (
    <motion.nav
      className="fixed w-full z-50 transition-all duration-300 bg-white shadow-md py-2"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-primary-600">
            RideNest
          </span>
          <span className="ml-2 text-sm font-medium text-gray-500">
            Ride Sharing
          </span>
        </Link>

        {/* She Mode Button */}
        <Link
          to="/shemode"
          className="ml-6 px-4 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold shadow transition-colors duration-200"
          style={{ fontSize: '1rem', letterSpacing: '0.05em' }}
        >
          She Mode
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" label="Home" />
          {user && user.role === 'driver' ? (
            <>
              <NavLink to="/driver" label="My Rides" />
              <NavLink to="/groups" label="Groups" />
              <NavLink to="/profile" label="My Profile" />
              <button onClick={logout} className="text-gray-700 hover:text-primary-600 font-medium ml-4">Logout</button>
            </>
          ) : user ? (
            <>
              <NavLink to="/book-ride" label="Book a Ride" />
              <NavLink to="/join-ride" label="Join an Existing Ride" />
              <NavLink to="/my-rides" label="My Rides" />
              <NavLink to="/groups" label="Groups" />
              <NavLink to="/profile" label="My Profile" />
              <button onClick={logout} className="text-gray-700 hover:text-primary-600 font-medium ml-4">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/book-ride" label="Book a Ride" />
              <NavLink to="/groups" label="Groups" />
              <Link to="/login" className={location.pathname !== '/' ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-white/80'}>Login</Link>
              <Link to="/register" className={`px-4 py-2 rounded-md ${location.pathname !== '/' ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-white hover:bg-white/90 text-primary-600'}`}>Sign Up</Link>
            </>
          )}

          {user && user.role === 'driver' && (
            <li>
              <NavLink to="/driver" className={({ isActive }) => isActive ? 'text-primary-600 font-semibold' : 'text-gray-700'}>
                Driver Dashboard
              </NavLink>
            </li>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <FaTimes className="text-primary-600" />
          ) : (
            <FaBars className="text-primary-600" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 py-3 space-y-1">
            <MobileNavLink to="/" label="Home" />
            <MobileNavLink to="/book-ride" label="Book a Ride" />
            <MobileNavLink to="/my-rides" label="My Rides" />
            <MobileNavLink to="/groups" label="Groups" />

            {isLoggedIn ? (
              <>
                <MobileNavLink to="/dashboard" label="Dashboard" />
                <MobileNavLink to="/profile" label="Profile" />
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

// Desktop Navigation Link
const NavLink = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const linkColor = isActive
    ? 'text-primary-600'
    : 'text-gray-700 hover:text-primary-600';

  return (
    <Link to={to} className={`relative ${linkColor}`}>
      {label}
      {isActive && (
        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600"
          layoutId="navbar-underline"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
};

// Mobile Navigation Link
const MobileNavLink = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`block px-4 py-2 rounded-md ${
        isActive
          ? 'bg-primary-50 text-primary-600 font-medium'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  );
};

export default Navbar;
