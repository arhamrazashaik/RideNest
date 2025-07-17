import Ride from '../models/rideModel.js';
import User from '../models/userModel.js';
import Subscription from '../models/subscriptionModel.js';
import { splitFareByDistance } from '../utils/distanceCalculator.js';

// Note: In a real application, you would integrate with Stripe or Razorpay
// For this demo, we'll simulate payment processing

// @desc    Process ride payment
// @route   POST /api/payments/ride/:id
// @access  Private
const processRidePayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Find the passenger in the ride
    const passengerIndex = ride.passengers.findIndex(p => p.user.toString() === req.user._id.toString());
    
    if (passengerIndex === -1) {
      return res.status(401).json({ message: 'You are not a passenger in this ride' });
    }
    
    const passenger = ride.passengers[passengerIndex];
    
    // Check if payment is already made
    if (passenger.fare.paid) {
      return res.status(400).json({ message: 'Payment already processed for this ride' });
    }
    
    // Simulate payment processing
    const paymentId = `PAY_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    // Update passenger fare details
    passenger.fare.paid = true;
    passenger.fare.paymentMethod = paymentMethod;
    passenger.fare.paymentId = paymentId;
    
    ride.passengers[passengerIndex] = passenger;
    
    await ride.save();
    
    res.json({
      message: 'Payment processed successfully',
      paymentId,
      amount: passenger.fare.total,
      currency: passenger.fare.currency
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Split fare for a ride
// @route   POST /api/payments/ride/:id/split
// @access  Private
const splitRideFare = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('passengers.user', 'name email phoneNumber');
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Check if user is a passenger or the ride creator
    const isPassenger = ride.passengers.some(p => p.user._id.toString() === req.user._id.toString());
    
    if (!isPassenger) {
      return res.status(401).json({ message: 'Not authorized to split fare for this ride' });
    }
    
    // Calculate distances for each passenger
    const passengersWithDistance = ride.passengers.map(passenger => {
      // Calculate distance between pickup and dropoff
      const pickupLat = passenger.pickupLocation.coordinates[1];
      const pickupLng = passenger.pickupLocation.coordinates[0];
      const dropoffLat = passenger.dropoffLocation.coordinates[1];
      const dropoffLng = passenger.dropoffLocation.coordinates[0];
      
      // Use Haversine formula to calculate distance
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(dropoffLat - pickupLat);
      const dLon = deg2rad(dropoffLng - pickupLng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(pickupLat)) * Math.cos(deg2rad(dropoffLat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in km
      
      return {
        ...passenger.toObject(),
        distance
      };
    });
    
    // Calculate total fare
    const totalFare = ride.passengers.reduce((sum, passenger) => sum + passenger.fare.total, 0);
    
    // Split fare based on distance
    const fareShares = splitFareByDistance(passengersWithDistance.map(p => ({
      ...p,
      totalFare
    })));
    
    res.json({
      totalFare,
      currency: ride.passengers[0].fare.currency,
      fareShares: fareShares.map(share => ({
        user: {
          _id: share.user._id,
          name: share.user.name
        },
        distance: share.distance.toFixed(2),
        fareShare: share.fareShare,
        percentage: ((share.fareShare / totalFare) * 100).toFixed(2)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Helper function for Haversine formula
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// @desc    Create a subscription
// @route   POST /api/payments/subscriptions
// @access  Private
const createSubscription = async (req, res) => {
  try {
    const {
      plan,
      groupId,
      frequency,
      days,
      time,
      origin,
      destination,
      vehiclePreference,
      paymentMethod,
      amount,
      billingCycle
    } = req.body;
    
    // Calculate start and end dates
    const startDate = new Date();
    let endDate;
    
    switch (billingCycle) {
      case 'weekly':
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarterly':
        endDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
      default:
        endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    
    // Simulate payment processing
    const paymentId = `SUB_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    // Create subscription
    const subscription = await Subscription.create({
      user: req.user._id,
      group: groupId,
      plan,
      status: 'active',
      startDate,
      endDate,
      autoRenew: true,
      frequency,
      days,
      time,
      origin,
      destination,
      vehiclePreference: vehiclePreference || {},
      payment: {
        amount,
        method: paymentMethod,
        billingCycle,
        nextBillingDate: endDate,
        paymentId,
        invoices: [{
          invoiceId: `INV_${Date.now()}`,
          amount,
          date: new Date(),
          status: 'paid'
        }]
      }
    });
    
    // Add subscription to user's subscriptions
    await User.findByIdAndUpdate(req.user._id, {
      $push: { subscriptions: subscription._id }
    });
    
    res.status(201).json({
      subscription,
      message: 'Subscription created successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user subscriptions
// @route   GET /api/payments/subscriptions
// @access  Private
const getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate('group', 'name type');
    
    res.json(subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Cancel subscription
// @route   PUT /api/payments/subscriptions/:id/cancel
// @access  Private
const cancelSubscription = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to cancel this subscription' });
    }
    
    // Update subscription status
    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    subscription.cancellation = {
      reason,
      cancelledAt: Date.now()
    };
    
    await subscription.save();
    
    res.json({
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export {
  processRidePayment,
  splitRideFare,
  createSubscription,
  getUserSubscriptions,
  cancelSubscription
};
