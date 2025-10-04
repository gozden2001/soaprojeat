const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: {
    userId: {
      type: Number,
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  following: {
    userId: {
      type: Number,
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one follow relationship per user pair
followSchema.index({ 'follower.userId': 1, 'following.userId': 1 }, { unique: true });

// Index for fast queries
followSchema.index({ 'follower.userId': 1 });
followSchema.index({ 'following.userId': 1 });

module.exports = mongoose.model('Follow', followSchema);