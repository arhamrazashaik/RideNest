import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  addSavedLocation,
  addPaymentMethod,
  getUsers
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import attachMongoUser from '../middleware/attachMongoUser.js';

const router = express.Router();

// Registration and login are now handled by Firebase Authentication.
// Removed: router.post('/', registerUser);
// Removed: router.post('/login', loginUser);

// Protected routes
router.route('/profile')
  .get(protect, attachMongoUser, getUserProfile)
  .put(protect, attachMongoUser, updateUserProfile);

router.post('/locations', protect, attachMongoUser, addSavedLocation);
router.post('/payment-methods', protect, attachMongoUser, addPaymentMethod);

// Admin routes
router.get('/', protect, attachMongoUser, admin, getUsers);

export default router;
