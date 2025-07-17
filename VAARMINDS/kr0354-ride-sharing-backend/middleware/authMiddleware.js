import admin from 'firebase-admin';

// Load service account from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);

// Initialize Firebase Admin SDK (replace with your service account config)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Protect routes - verify Firebase ID token
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin middleware (optional, based on custom claims)
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.admin === true) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

// Driver middleware (optional, based on custom claims)
const driver = (req, res, next) => {
  if (req.user && (req.user.driver === true || req.user.admin === true)) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a driver' });
  }
};

export { protect, adminMiddleware as admin, driver };
