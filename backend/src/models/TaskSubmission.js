const mongoose = require('mongoose');

const taskSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: true
  },
  phase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phase',
    required: true
  },
  type: {
    type: String,
    enum: ['completed', 'unable', 'form', 'text'],
    default: 'completed'
  },
  photoUrl: String,
  description: String,
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  unableReason: String,
  formAnswers: [{
    question: String,
    answer: mongoose.Schema.Types.Mixed
  }],
  textContent: {
    text: String,
    wordCount: Number,
    charCount: Number
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewComment: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

taskSubmissionSchema.index({ user: 1, mission: 1 });
taskSubmissionSchema.index({ status: 1, submittedAt: -1 });
taskSubmissionSchema.index({ phase: 1, status: 1 });

taskSubmissionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending' && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('TaskSubmission', taskSubmissionSchema);
