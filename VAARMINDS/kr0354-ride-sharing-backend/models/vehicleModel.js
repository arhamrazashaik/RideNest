import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['sedan', 'suv', 'van', 'tempo-traveler', 'bus'],
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: [4, 'Capacity must be at least 4']
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true
  },
  color: {
    type: String,
    required: true
  },
  features: [{
    type: String,
    enum: ['ac', 'wifi', 'entertainment', 'refreshments', 'wheelchair-accessible', 'luggage-space']
  }],
  images: [{
    type: String
  }],
  documents: {
    insurance: {
      number: String,
      expiryDate: Date,
      verified: {
        type: Boolean,
        default: false
      }
    },
    registration: {
      number: String,
      expiryDate: Date,
      verified: {
        type: Boolean,
        default: false
      }
    },
    permit: {
      number: String,
      expiryDate: Date,
      verified: {
        type: Boolean,
        default: false
      }
    }
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'inactive'
  },
  currentLocation: {
    type: {
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      },
      address: String,
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  fareMultiplier: {
    type: Number,
    default: 1.0,
    min: [0.5, 'Fare multiplier cannot be less than 0.5'],
    max: [3.0, 'Fare multiplier cannot be more than 3.0']
  }
}, {
  timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
