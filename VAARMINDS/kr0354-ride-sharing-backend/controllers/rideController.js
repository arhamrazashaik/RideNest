import Ride from '../models/rideModel.js';
import User from '../models/userModel.js';
import Vehicle from '../models/vehicleModel.js';
import Group from '../models/groupModel.js';
import { calculateDistance, calculateFare, splitFareByDistance } from '../utils/distanceCalculator.js';
import { io } from '../server.js';

// @desc    Create a new ride
// @route   POST /api/rides
// @access  Private
const createRide = async (req, res) => {
  try {
    const {
      type,
      bookingType,
      vehicleId,
      passengers,
      scheduledTime,
      groupId,
      notes,
      recurring
    } = req.body;

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if vehicle is active
    if (vehicle.status !== 'active') {
      return res.status(400).json({ message: 'Vehicle is not available' });
    }

    // Check if group exists if groupId is provided
    let group = null;
    if (groupId) {
      group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
    }

    // Create passenger objects with calculated fares
    const passengersWithFare = await Promise.all(passengers.map(async (passenger) => {
      // Calculate distance between pickup and dropoff
      const distance = calculateDistance(
        passenger.pickupLocation.coordinates[1],
        passenger.pickupLocation.coordinates[0],
        passenger.dropoffLocation.coordinates[1],
        passenger.dropoffLocation.coordinates[0]
      );

      // Calculate fare based on distance
      const fare = calculateFare(distance, 50, 15, vehicle.fareMultiplier);

      // Get user if userId is provided
      let userId = passenger.userId || req.user._id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }

      return {
        user: userId,
        pickupLocation: passenger.pickupLocation,
        dropoffLocation: passenger.dropoffLocation,
        pickupTime: {
          estimated: passenger.estimatedPickupTime || scheduledTime
        },
        dropoffTime: {
          estimated: passenger.estimatedDropoffTime
        },
        fare: {
          base: 50,
          distance: distance * 15,
          time: 0,
          total: fare,
          currency: 'INR'
        }
      };
    }));

    // Create new ride
    const ride = await Ride.create({
      type,
      bookingType,
      vehicle: vehicleId,
      driver: vehicle.driver,
      passengers: passengersWithFare,
      scheduledTime: scheduledTime || Date.now(),
      group: groupId,
      notes,
      recurring: recurring || { isRecurring: false }
    });

    if (ride) {
      // Add ride to user's rides
      await User.findByIdAndUpdate(req.user._id, {
        $push: { rides: ride._id }
      });

      // Add ride to group's rides if group exists
      if (group) {
        await Group.findByIdAndUpdate(groupId, {
          $push: { rides: ride._id }
        });
      }

      // Notify driver about new ride
      io.to(`user-${vehicle.driver}`).emit('new-ride', {
        rideId: ride._id,
        type: ride.type,
        bookingType: ride.bookingType,
        scheduledTime: ride.scheduledTime
      });

      res.status(201).json(ride);
    } else {
      res.status(400).json({ message: 'Invalid ride data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all rides
// @route   GET /api/rides
// @access  Private
const getRides = async (req, res) => {
  try {
    const { status, type, from, to } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (from && to) {
      filter.scheduledTime = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    } else if (from) {
      filter.scheduledTime = { $gte: new Date(from) };
    } else if (to) {
      filter.scheduledTime = { $lte: new Date(to) };
    }
    
    // Get rides where user is a passenger or driver
    const rides = await Ride.find({
      $or: [
        { 'passengers.user': req.user._id },
        { driver: req.user._id }
      ],
      ...filter
    })
      .populate('vehicle', 'type make model licensePlate color')
      .populate('driver', 'name phoneNumber profilePicture')
      .populate('passengers.user', 'name phoneNumber profilePicture')
      .populate('group', 'name');
    
    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get ride by ID
// @route   GET /api/rides/:id
// @access  Private
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('vehicle', 'type make model licensePlate color features images currentLocation')
      .populate('driver', 'name phoneNumber profilePicture ratings')
      .populate('passengers.user', 'name phoneNumber profilePicture')
      .populate('group', 'name members');
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Check if user is authorized to view this ride
    const isPassenger = ride.passengers.some(p => p.user._id.toString() === req.user._id.toString());
    const isDriver = ride.driver._id.toString() === req.user._id.toString();
    const isGroupMember = ride.group && ride.group.members.some(m => m.user.toString() === req.user._id.toString());
    
    if (!isPassenger && !isDriver && !isGroupMember && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to view this ride' });
    }
    
    res.json(ride);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update ride status
// @route   PUT /api/rides/:id/status
// @access  Private
const updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Check if user is the driver or admin
    if (ride.driver.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this ride' });
    }
    
    ride.status = status;
    
    // If ride is starting, set startTime
    if (status === 'in-progress' && !ride.startTime) {
      ride.startTime = Date.now();
    }
    
    // If ride is completed, set endTime
    if (status === 'completed' && !ride.endTime) {
      ride.endTime = Date.now();
    }
    
    const updatedRide = await ride.save();
    
    // Notify all passengers about status change
    ride.passengers.forEach(passenger => {
      io.to(`user-${passenger.user}`).emit('ride-status-update', {
        rideId: ride._id,
        status: ride.status
      });
    });
    
    res.json(updatedRide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update passenger status
// @route   PUT /api/rides/:id/passengers/:passengerId/status
// @access  Private
const updatePassengerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Check if user is the driver or admin
    if (ride.driver.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update passenger status' });
    }
    
    // Find passenger
    const passengerIndex = ride.passengers.findIndex(p => p._id.toString() === req.params.passengerId);
    
    if (passengerIndex === -1) {
      return res.status(404).json({ message: 'Passenger not found in this ride' });
    }
    
    ride.passengers[passengerIndex].status = status;
    
    // If passenger is picked up, set actual pickup time
    if (status === 'picked-up') {
      ride.passengers[passengerIndex].pickupTime.actual = Date.now();
    }
    
    // If passenger is dropped off, set actual dropoff time
    if (status === 'dropped-off') {
      ride.passengers[passengerIndex].dropoffTime.actual = Date.now();
    }
    
    const updatedRide = await ride.save();
    
    // Notify passenger about status change
    io.to(`user-${ride.passengers[passengerIndex].user}`).emit('passenger-status-update', {
      rideId: ride._id,
      status: status
    });
    
    res.json(updatedRide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Cancel ride
// @route   PUT /api/rides/:id/cancel
// @access  Private
const cancelRide = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Check if ride can be cancelled (not already in progress or completed)
    if (ride.status === 'in-progress' || ride.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a ride that is in progress or completed' });
    }
    
    // Check if user is authorized to cancel this ride
    const isPassenger = ride.passengers.some(p => p.user.toString() === req.user._id.toString());
    const isDriver = ride.driver.toString() === req.user._id.toString();
    
    if (!isPassenger && !isDriver && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to cancel this ride' });
    }
    
    ride.status = 'cancelled';
    ride.cancellation = {
      reason,
      cancelledBy: req.user._id,
      cancelledAt: Date.now()
    };
    
    const updatedRide = await ride.save();
    
    // Notify all involved parties about cancellation
    ride.passengers.forEach(passenger => {
      io.to(`user-${passenger.user}`).emit('ride-cancelled', {
        rideId: ride._id,
        cancelledBy: req.user._id,
        reason
      });
    });
    
    io.to(`user-${ride.driver}`).emit('ride-cancelled', {
      rideId: ride._id,
      cancelledBy: req.user._id,
      reason
    });
    
    res.json(updatedRide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Rate ride
// @route   POST /api/rides/:id/rate
// @access  Private
const rateRide = async (req, res) => {
  try {
    const { rating, comment, toUserId } = req.body;
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Check if ride is completed
    if (ride.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed rides' });
    }
    
    // Check if user was part of this ride
    const isPassenger = ride.passengers.some(p => p.user.toString() === req.user._id.toString());
    const isDriver = ride.driver.toString() === req.user._id.toString();
    
    if (!isPassenger && !isDriver) {
      return res.status(401).json({ message: 'Not authorized to rate this ride' });
    }
    
    // Check if user is rating themselves
    if (toUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot rate yourself' });
    }
    
    // Check if user has already rated this person for this ride
    const existingRating = ride.ratings.find(
      r => r.from.toString() === req.user._id.toString() && r.to.toString() === toUserId
    );
    
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this user for this ride' });
    }
    
    // Add rating to ride
    ride.ratings.push({
      from: req.user._id,
      to: toUserId,
      rating,
      comment
    });
    
    await ride.save();
    
    // Update user's average rating
    const user = await User.findById(toUserId);
    
    if (user) {
      // Calculate new average rating
      const totalRatings = user.ratings.count + 1;
      const newAverageRating = ((user.ratings.average * user.ratings.count) + rating) / totalRatings;
      
      user.ratings = {
        average: newAverageRating,
        count: totalRatings
      };
      
      await user.save();
    }
    
    // If rating a driver, also update vehicle rating
    if (ride.driver.toString() === toUserId) {
      const vehicle = await Vehicle.findById(ride.vehicle);
      
      if (vehicle) {
        // Calculate new average rating
        const totalRatings = vehicle.ratings.count + 1;
        const newAverageRating = ((vehicle.ratings.average * vehicle.ratings.count) + rating) / totalRatings;
        
        vehicle.ratings = {
          average: newAverageRating,
          count: totalRatings
        };
        
        await vehicle.save();
      }
    }
    
    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get driver's upcoming rides
// @route   GET /api/rides/driver/upcoming
// @access  Private/Driver
const getDriverUpcomingRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      driver: req.user._id,
      status: { $in: ['pending', 'confirmed'] },
      scheduledTime: { $gte: new Date() }
    })
      .sort({ scheduledTime: 1 })
      .populate('vehicle', 'type make model licensePlate color')
      .populate('passengers.user', 'name phoneNumber profilePicture')
      .populate('group', 'name');
    
    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Driver accepts a ride
// @route   PUT /api/rides/:id/accept
// @access  Private/Driver
const acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    // Only assigned driver can accept
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to accept this ride' });
    }
    if (ride.status !== 'pending') {
      return res.status(400).json({ message: 'Ride is not pending' });
    }
    ride.status = 'confirmed';
    await ride.save();
    // Notify all passengers
    ride.passengers.forEach(passenger => {
      io.to(`user-${passenger.user}`).emit('ride-status-update', {
        rideId: ride._id,
        status: ride.status
      });
    });
    res.json({ message: 'Ride accepted', ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Driver rejects a ride
// @route   PUT /api/rides/:id/reject
// @access  Private/Driver
const rejectRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    // Only assigned driver can reject
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to reject this ride' });
    }
    if (ride.status !== 'pending') {
      return res.status(400).json({ message: 'Ride is not pending' });
    }
    ride.status = 'rejected';
    await ride.save();
    // Notify all passengers
    ride.passengers.forEach(passenger => {
      io.to(`user-${passenger.user}`).emit('ride-status-update', {
        rideId: ride._id,
        status: ride.status
      });
    });
    res.json({ message: 'Ride rejected', ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Join an existing ride
// @route   POST /api/rides/:id/join
// @access  Private
const joinRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('vehicle');
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    // Check if already a passenger
    if (ride.passengers.some(p => p.user.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'You have already joined this ride' });
    }
    // Check if ride is full
    if (ride.passengers.length >= ride.vehicle.capacity) {
      return res.status(400).json({ message: 'Ride is full' });
    }
    // Get pickup/dropoff from request
    const { pickupLocation, dropoffLocation } = req.body;
    if (!pickupLocation || !dropoffLocation) {
      return res.status(400).json({ message: 'Pickup and dropoff locations are required' });
    }
    // Calculate distance and fare
    const distance = calculateDistance(
      pickupLocation.coordinates[1],
      pickupLocation.coordinates[0],
      dropoffLocation.coordinates[1],
      dropoffLocation.coordinates[0]
    );
    const fare = calculateFare(distance, 30, 8, ride.vehicle.fareMultiplier); // Use updated rates
    // Add passenger
    ride.passengers.push({
      user: req.user._id,
      pickupLocation,
      dropoffLocation,
      pickupTime: { estimated: ride.scheduledTime },
      fare: {
        base: 30,
        distance: distance * 8,
        time: 0,
        total: fare,
        currency: 'INR'
      }
    });
    await ride.save();
    // Add ride to user's rides
    await User.findByIdAndUpdate(req.user._id, { $push: { rides: ride._id } });
    res.json(ride);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export {
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
};
