const mongoose = require('mongoose');

const phaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['facil', 'medio', 'dificil'],
    default: 'facil'
  },
  category: {
    type: String,
    enum: ['plantio', 'reciclagem', 'monitoramento', 'educacao', 'conservacao'],
    default: 'educacao'
  },
  introVideoUrl: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  badge: {
    type: String,
    default: '/badges/default-phase.png'
  },
  badgeTitle: {
    type: String,
    default: 'Explorador da Caatinga'
  },
  badgeDescription: {
    type: String,
    default: 'Completou uma fase importante'
  },
  experienceReward: {
    type: Number,
    default: 100
  },
  pointsReward: {
    type: Number,
    default: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requiredLevel: {
    type: Number,
    default: 1
  },
  missions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  }],
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Phase', phaseSchema);
