import User from '../models/userModel.js';

// Middleware to attach MongoDB user to req.user after Firebase Auth
const attachMongoUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Not authorized: No user email found' });
    }
    const mongoUser = await User.findOne({ email: req.user.email });
    if (!mongoUser) {
      return res.status(401).json({ message: 'User not found in database' });
    }
    // Attach MongoDB user info to req.user
    req.user._id = mongoUser._id;
    req.user.role = mongoUser.role;
    req.user.name = mongoUser.name;
    req.user.profilePicture = mongoUser.profilePicture;
    next();
  } catch (error) {
    console.error('attachMongoUser error:', error);
    res.status(500).json({ message: 'Server Error (attachMongoUser)' });
  }
};

export default attachMongoUser; 