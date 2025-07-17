import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  type: {
    type: String,
    enum: ['event', 'office', 'tour', 'custom'],
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  destination: {
    address: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  origin: {
    address: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  schedule: {
    startDate: Date,
    endDate: Date,
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
      time: String // HH:MM format
    }
  },
  rides: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
  }],
  chat: {
    messages: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }]
  },
  polls: [{
    title: String,
    description: String,
    options: [{
      text: String,
      votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  subscription: {
    isActive: {
      type: Boolean,
      default: false
    },
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise']
    },
    startDate: Date,
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: false
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking']
    },
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    paymentId: String
  },
  settings: {
    joinRequiresApproval: {
      type: Boolean,
      default: false
    },
    memberCanInvite: {
      type: Boolean,
      default: true
    },
    fareCalculation: {
      type: String,
      enum: ['equal', 'distance-based', 'custom'],
      default: 'distance-based'
    }
  }
}, {
  timestamps: true
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
