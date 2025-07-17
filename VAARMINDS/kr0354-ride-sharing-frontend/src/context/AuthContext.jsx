import { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000', { autoConnect: false });

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mongoUserId, setMongoUserId] = useState(null);
  const [mongoUserRole, setMongoUserRole] = useState(null);
  const [mongoUserProfile, setMongoUserProfile] = useState(null);

  // Fetch MongoDB user profile after login/registration
  const fetchMongoProfile = async (firebaseUser) => {
    // Removed API call to /api/users/profile to prevent 401 error
    setMongoUserId(null);
    setMongoUserRole(null);
    setMongoUserProfile(null);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        fetchMongoProfile(firebaseUser);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setMongoUserId(null);
        setMongoUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Register user with Firebase
  const register = async ({ name, email, password, phoneNumber, role }) => {
    if (!email || !password || password.length < 6) {
      setError('Please provide a valid email and a password with at least 6 characters.');
      return { success: false, error: 'Invalid email or password' };
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Optionally update profile with name and phone
      await updateProfile(userCredential.user, { displayName: name, phoneNumber });
      setUser(userCredential.user);
      setIsAuthenticated(true);
      setError(null);
      await fetchMongoProfile(userCredential.user);
      return { success: true };
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already registered. Please log in.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'Registration failed');
      }
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  // Login user with Firebase
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setIsAuthenticated(true);
      setError(null);
      await fetchMongoProfile(userCredential.user);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      return { success: false, error: err.message || 'Invalid credentials' };
    }
  };

  // Logout user
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    setMongoUserId(null);
    setMongoUserRole(null);
  };

  // Clear errors
  const clearError = () => {
    setError(null);
  };

  // Update user profile in MongoDB
  const updateProfile = async (profileData) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        return { success: false, error: 'Not authenticated' };
      }
      const token = await firebaseUser.getIdToken();
      const res = await axios.put('http://localhost:5000/api/users/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Optionally update Firebase displayName and phoneNumber if changed
      if (profileData.name || profileData.phoneNumber) {
        await updateProfile(firebaseUser, {
          displayName: profileData.name || firebaseUser.displayName,
          phoneNumber: profileData.phoneNumber || firebaseUser.phoneNumber,
        });
      }
      // Update local user state (for UI reactivity)
      setUser((prev) => ({ ...prev, ...profileData }));
      await fetchMongoProfile(firebaseUser); // Refresh MongoDB profile
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update profile' };
    }
  };

  useEffect(() => {
    if (user && user._id) {
      socket.connect();
      socket.emit('join-user', user._id);
    } else {
      socket.disconnect();
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
        mongoUserId,
        mongoUserRole,
        mongoUserProfile,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

export { socket };
