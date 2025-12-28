const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 50
  },
  body: {
    type: String,
    required: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['all', 'user'],
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  recipients: {
    type: Number,
    default: 0
  },
  successful: {
    type: Number,
    default: 0
  },
  failed: {
    type: Number,
    default: 0
  },
  data: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
