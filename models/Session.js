import mongoose from 'mongoose';

// Define the session schema
const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 24 * 60 * 60 * 1000, // Default to 1 day expiry
  }
}, {
  timestamps: false, // Disable default timestamps (createdAt, updatedAt) since we have custom fields
});

// Add an index to optimize expired session queries
sessionSchema.index({ expiresAt: 1 });

// Create the Session model
const Session = mongoose.model('Session', sessionSchema);

export default Session;
