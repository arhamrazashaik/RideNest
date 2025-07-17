import express from 'express';
import {
  registerVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  updateVehicleLocation,
  getNearbyVehicles,
  getDriverVehicles
} from '../controllers/vehicleController.js';
import { protect, driver } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getVehicles);
router.get('/nearby', getNearbyVehicles);
router.get('/:id', getVehicleById);

// Protected routes for drivers
router.post('/', protect, driver, registerVehicle);
router.get('/driver/me', protect, driver, getDriverVehicles);
router.route('/:id')
  .put(protect, driver, updateVehicle);
router.put('/:id/location', protect, driver, updateVehicleLocation);

export default router;
