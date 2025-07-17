import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'cancelled'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekdays', 'weekly', 'monthly'],
    required: true
  },
  days: [{
    type: Number, // 0-6 (Sunday-Saturday)
  }],
  time: {
    type: String, // HH:MM format
    required: true
  },
  origin: {
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
  destination: {
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
  vehiclePreference: {
    type: {
      type: String,
      enum: ['sedan', 'suv', 'van', 'tempo-traveler', 'bus']
    },
    features: [{
      type: String,
      enum: ['ac', 'wifi', 'entertainment', 'refreshments', 'wheelchair-accessible', 'luggage-space']
    }]
  },
  payment: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    method: {
      type: String,
      enum: ['card', 'upi', 'netbanking'],
      required: true
    },
    billingCycle: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    nextBillingDate: Date,
    paymentId: String,
    invoices: [{
      invoiceId: String,
      amount: Number,
      date: Date,
      status: {
        type: String,
        enum: ['paid', 'pending', 'failed'],
        default: 'pending'
      },
      pdfUrl: String
    }]
  },
  rides: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
  }],
  cancellation: {
    reason: String,
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

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
