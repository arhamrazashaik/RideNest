import User from '../models/userModel.js';

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
// Registration and login are now handled by Firebase Authentication.
// Removed registerUser and loginUser.

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        role: user.role,
        homeAddress: user.homeAddress,
        workAddress: user.workAddress,
        savedLocations: user.savedLocations,
        paymentMethods: user.paymentMethods,
        preferences: user.preferences
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      user.profilePicture = req.body.profilePicture || user.profilePicture;
      
      if (req.body.homeAddress) {
        user.homeAddress = req.body.homeAddress;
      }
      
      if (req.body.workAddress) {
        user.workAddress = req.body.workAddress;
      }
      
      if (req.body.preferences) {
        user.preferences = {
          ...user.preferences,
          ...req.body.preferences
        };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role,
        homeAddress: updatedUser.homeAddress,
        workAddress: updatedUser.workAddress,
        savedLocations: updatedUser.savedLocations,
        preferences: updatedUser.preferences
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a saved location
// @route   POST /api/users/locations
// @access  Private
const addSavedLocation = async (req, res) => {
  try {
    const { name, address, coordinates } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (user) {
      // Check if location with same name already exists
      const locationExists = user.savedLocations.find(loc => loc.name === name);
      
      if (locationExists) {
        return res.status(400).json({ message: 'Location with this name already exists' });
      }
      
      user.savedLocations.push({
        name,
        address,
        coordinates
      });
      
      await user.save();
      
      res.status(201).json(user.savedLocations);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a payment method
// @route   POST /api/users/payment-methods
// @access  Private
const addPaymentMethod = async (req, res) => {
  try {
    const { type, details, isDefault } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (user) {
      // If new payment method is default, set all others to non-default
      if (isDefault) {
        user.paymentMethods.forEach(method => {
          method.isDefault = false;
        });
      }
      
      user.paymentMethods.push({
        type,
        details,
        isDefault: isDefault || user.paymentMethods.length === 0 // First payment method is default
      });
      
      await user.save();
      
      res.status(201).json(user.paymentMethods);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export {
  getUserProfile,
  updateUserProfile,
  addSavedLocation,
  addPaymentMethod,
  getUsers
};
