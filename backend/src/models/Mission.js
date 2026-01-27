const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  phase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phase',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'foto', 'jogos', 'formulario', 'texto'],
    required: true
  },
  videoUrl: {
    type: String
  },
  photoTask: {
    instructions: String,
    exampleImage: String,
    requiresPhoto: {
      type: Boolean,
      default: true
    },
    requiresLocation: {
      type: Boolean,
      default: false
    }
  },
  taskDetails: {
    instructions: String,
    exampleImage: String,
    requiresPhoto: {
      type: Boolean,
      default: true
    },
    requiresLocation: {
      type: Boolean,
      default: false
    }
  },
  formTask: {
    instructions: String,
    questions: [{
      question: String,
      type: {
        type: String,
        enum: ['text', 'textarea', 'select', 'multiselect', 'rating']
      },
      options: [String],
      required: Boolean,
      placeholder: String
    }],
    minAnswers: Number
  },
  textTask: {
    instructions: String,
    minWords: {
      type: Number,
      default: 50
    },
    maxWords: {
      type: Number,
      default: 500
    },
    topics: [String],
    exampleText: String
  },
  games: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  }],
  experienceReward: {
    type: Number,
    default: 50
  },
  pointsReward: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

missionSchema.pre('save', function(next) {
  if (this.type === 'foto') {
    if (this.photoTask && !this.taskDetails) {
      this.taskDetails = { ...this.photoTask };
    } else if (this.taskDetails && !this.photoTask) {
      this.photoTask = { ...this.taskDetails };
    }
  }
  next();
});

module.exports = mongoose.model('Mission', missionSchema);
