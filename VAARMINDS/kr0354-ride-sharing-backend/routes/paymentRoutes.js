import express from 'express';
import {
  processRidePayment,
  splitRideFare,
  createSubscription,
  getUserSubscriptions,
  cancelSubscription
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.post('/ride/:id', protect, processRidePayment);
router.post('/ride/:id/split', protect, splitRideFare);

router.route('/subscriptions')
  .post(protect, createSubscription)
  .get(protect, getUserSubscriptions);

router.put('/subscriptions/:id/cancel', protect, cancelSubscription);

export default router;
