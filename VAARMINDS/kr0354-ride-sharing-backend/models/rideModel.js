import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['event', 'office', 'tour', 'custom'],
    required: true
  },
  bookingType: {
    type: String,
    enum: ['instant', 'scheduled'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  passengers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pickupLocation: {
      address: {
        type: String,
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere'
      }
    },
    dropoffLocation: {
      address: {
        type: String,
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere'
      }
    },
    pickupTime: {
      estimated: Date,
      actual: Date
    },
    dropoffTime: {
      estimated: Date,
      actual: Date
    },
    fare: {
      base: Number,
      distance: Number,
      time: Number,
      total: Number,
      currency: {
        type: String,
        default: 'INR'
      },
      paid: {
        type: Boolean,
        default: false
      },
      paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'cash', 'wallet']
      },
      paymentId: String
    },
    status: {
      type: String,
      enum: ['waiting', 'picked-up', 'dropped-off', 'cancelled'],
      default: 'waiting'
    }
  }],
  route: {
    optimized: {
      type: Boolean,
      default: true
    },
    waypoints: [{
      location: {
        coordinates: [Number], // [longitude, latitude]
        address: String
      },
      stopType: {
        type: String,
        enum: ['pickup', 'dropoff', 'both']
      },
      order: Number,
      estimatedArrivalTime: Date,
      actualArrivalTime: Date
    }],
    totalDistance: {
      type: Number, // in kilometers
      default: 0
    },
    totalDuration: {
      type: Number, // in minutes
      default: 0
    },
    polyline: String // encoded polyline for map rendering
  },
  scheduledTime: {
    type: Date
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekdays', 'weekly', 'monthly']
    },
    days: [{
      type: Number, // 0-6 (Sunday-Saturday)
    }],
    endDate: Date
  },
  totalFare: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  ratings: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed', 'none'],
      default: 'none'
    }
  }
}, {
  timestamps: true
});

// Index for geospatial queries
rideSchema.index({ 'passengers.pickupLocation.coordinates': '2dsphere' });
rideSchema.index({ 'passengers.dropoffLocation.coordinates': '2dsphere' });
rideSchema.index({ 'route.waypoints.location.coordinates': '2dsphere' });

const Ride = mongoose.model('Ride', rideSchema);

export default Ride;
