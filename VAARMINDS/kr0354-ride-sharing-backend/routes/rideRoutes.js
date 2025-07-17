import express from 'express';
import {
  createRide,
  getRides,
  getRideById,
  updateRideStatus,
  updatePassengerStatus,
  cancelRide,
  rateRide,
  getDriverUpcomingRides,
  acceptRide,
  rejectRide,
  joinRide
} from '../controllers/rideController.js';
import { protect, driver } from '../middleware/authMiddleware.js';
import attachMongoUser from '../middleware/attachMongoUser.js';

const router = express.Router();

// Protected routes
router.route('/')
  .post(protect, attachMongoUser, createRide)
  .get(protect, attachMongoUser, getRides);

router.get('/driver/upcoming', protect, attachMongoUser, driver, getDriverUpcomingRides);

router.route('/:id')
  .get(protect, attachMongoUser, getRideById);

router.put('/:id/status', protect, attachMongoUser, driver, updateRideStatus);
router.put('/:id/passengers/:passengerId/status', protect, attachMongoUser, driver, updatePassengerStatus);
router.put('/:id/cancel', protect, attachMongoUser, cancelRide);
router.post('/:id/rate', protect, attachMongoUser, rateRide);
router.put('/:id/accept', protect, attachMongoUser, driver, acceptRide);
router.put('/:id/reject', protect, attachMongoUser, driver, rejectRide);
router.post('/:id/join', protect, attachMongoUser, joinRide);

export default router;
