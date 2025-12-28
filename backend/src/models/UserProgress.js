const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phase',
    required: true
  },
  videoWatched: {
    type: Boolean,
    default: false
  },
  watchedAt: {
    type: Date
  },
  completedMissions: [{
    mission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission'
    },
    completedAt: Date,
    score: Number
  }],
  completedGames: [{
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game'
    },
    completedAt: Date,
    score: Number,
    attempts: Number
  }],
  currentMission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  },
  currentGame: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  },
  phaseCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

userProgressSchema.index({ user: 1, phase: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);