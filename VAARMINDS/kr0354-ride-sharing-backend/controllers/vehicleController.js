import Vehicle from '../models/vehicleModel.js';
import User from '../models/userModel.js';

// @desc    Register a new vehicle
// @route   POST /api/vehicles
// @access  Private/Driver
const registerVehicle = async (req, res) => {
  try {
    const {
      type,
      capacity,
      make,
      model,
      year,
      licensePlate,
      color,
      features,
      images,
      documents
    } = req.body;

    // Check if vehicle with same license plate already exists
    const vehicleExists = await Vehicle.findOne({ licensePlate });

    if (vehicleExists) {
      return res.status(400).json({ message: 'Vehicle with this license plate already exists' });
    }

    // Create new vehicle
    const vehicle = await Vehicle.create({
      driver: req.user._id,
      type,
      capacity,
      make,
      model,
      year,
      licensePlate,
      color,
      features: features || [],
      images: images || [],
      documents: documents || {}
    });

    if (vehicle) {
      res.status(201).json(vehicle);
    } else {
      res.status(400).json({ message: 'Invalid vehicle data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res) => {
  try {
    const { type, capacity, features } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (capacity) {
      filter.capacity = { $gte: parseInt(capacity) };
    }
    
    if (features) {
      const featureArray = features.split(',');
      filter.features = { $all: featureArray };
    }
    
    // Only show active vehicles
    filter.status = 'active';
    
    const vehicles = await Vehicle.find(filter).populate('driver', 'name email phoneNumber profilePicture ratings');
    
    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('driver', 'name email phoneNumber profilePicture ratings');
    
    if (vehicle) {
      res.json(vehicle);
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Driver
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Check if user is the vehicle's driver or an admin
    if (vehicle.driver.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this vehicle' });
    }
    
    // Update fields
    vehicle.type = req.body.type || vehicle.type;
    vehicle.capacity = req.body.capacity || vehicle.capacity;
    vehicle.make = req.body.make || vehicle.make;
    vehicle.model = req.body.model || vehicle.model;
    vehicle.year = req.body.year || vehicle.year;
    vehicle.color = req.body.color || vehicle.color;
    vehicle.features = req.body.features || vehicle.features;
    vehicle.images = req.body.images || vehicle.images;
    vehicle.status = req.body.status || vehicle.status;
    vehicle.fareMultiplier = req.body.fareMultiplier || vehicle.fareMultiplier;
    
    if (req.body.documents) {
      vehicle.documents = {
        ...vehicle.documents,
        ...req.body.documents
      };
    }
    
    if (req.body.currentLocation) {
      vehicle.currentLocation = {
        ...vehicle.currentLocation,
        ...req.body.currentLocation,
        updatedAt: Date.now()
      };
    }
    
    const updatedVehicle = await vehicle.save();
    
    res.json(updatedVehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update vehicle location
// @route   PUT /api/vehicles/:id/location
// @access  Private/Driver
const updateVehicleLocation = async (req, res) => {
  try {
    const { coordinates, address } = req.body;
    
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Check if user is the vehicle's driver
    if (vehicle.driver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this vehicle location' });
    }
    
    vehicle.currentLocation = {
      coordinates,
      address: address || vehicle.currentLocation?.address,
      updatedAt: Date.now()
    };
    
    const updatedVehicle = await vehicle.save();
    
    res.json({
      _id: updatedVehicle._id,
      currentLocation: updatedVehicle.currentLocation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get nearby vehicles
// @route   GET /api/vehicles/nearby
// @access  Public
const getNearbyVehicles = async (req, res) => {
  try {
    const { lat, lng, radius = 5, type, capacity } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // Build filter object
    const filter = {
      'currentLocation.coordinates': {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius / 6378.1] // radius in km to radians
        }
      },
      status: 'active'
    };
    
    if (type) {
      filter.type = type;
    }
    
    if (capacity) {
      filter.capacity = { $gte: parseInt(capacity) };
    }
    
    const vehicles = await Vehicle.find(filter).populate('driver', 'name email phoneNumber profilePicture ratings');
    
    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get driver's vehicles
// @route   GET /api/vehicles/driver
// @access  Private/Driver
const getDriverVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ driver: req.user._id });
    
    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export {
  registerVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  updateVehicleLocation,
  getNearbyVehicles,
  getDriverVehicles
};
