const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    default: '/badges/default.png'
  },
  type: {
    type: String,
    enum: ['level', 'points', 'games', 'phase', 'mission', 'special'],
    required: true
  },
  requirement: {
    type: Number,
    required: true
  },
  rarity: {
    type: String,
    enum: ['comum', 'raro', 'epico', 'lendario'],
    default: 'comum'
  },
  pointsReward: {
    type: Number,
    default: 0
  },
  phase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phase'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Achievement', achievementSchema);
