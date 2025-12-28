const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deviceSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['android', 'ios', 'web'],
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: '/avatars/default-avatar.png'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    select: false
  },
  verificationCodeExpires: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  totalExperience: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  activeBadge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phase',
    default: null
  },
  devices: [deviceSchema],
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      taskReview: { type: Boolean, default: true },
      phaseUnlock: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true }
    },
    language: { type: String, default: 'pt-BR' },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' }
  },
  statistics: {
    missionsCompleted: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    tasksSubmitted: { type: Number, default: 0 },
    tasksApproved: { type: Number, default: 0 },
    daysActive: { type: Number, default: 0 },
    lastActiveDate: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.index({ totalPoints: -1 });
userSchema.index({ totalExperience: -1 });
userSchema.index({ 'devices.token': 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.addDevice = async function(token, platform) {
  const existingDevice = this.devices.find(d => d.token === token);
  
  if (existingDevice) {
    existingDevice.lastUsed = new Date();
  } else {
    if (this.devices.length >= 5) {
      this.devices.sort((a, b) => b.lastUsed - a.lastUsed);
      this.devices.pop();
    }
    
    this.devices.push({
      token,
      platform,
      addedAt: new Date(),
      lastUsed: new Date()
    });
  }
  
  await this.save();
};

userSchema.methods.removeDevice = async function(token) {
  this.devices = this.devices.filter(d => d.token !== token);
  await this.save();
};

userSchema.methods.updateLevel = function() {
  const previousLevel = this.level;
  this.level = Math.floor(this.totalExperience / 1000) + 1;
  return this.level > previousLevel ? this.level : null;
};

userSchema.methods.addExperience = async function(amount) {
  this.totalExperience += amount;
  const newLevel = this.updateLevel();
  await this.save();
  return newLevel;
};

userSchema.methods.addPoints = async function(amount) {
  this.totalPoints += amount;
  await this.save();
};

userSchema.methods.updateStatistics = async function(action) {
  const today = new Date().setHours(0, 0, 0, 0);
  const lastActive = this.statistics.lastActiveDate 
    ? new Date(this.statistics.lastActiveDate).setHours(0, 0, 0, 0)
    : null;

  if (!lastActive || lastActive < today) {
    this.statistics.daysActive += 1;
    this.statistics.lastActiveDate = new Date();
  }

  switch(action) {
    case 'mission_completed':
      this.statistics.missionsCompleted += 1;
      break;
    case 'game_played':
      this.statistics.gamesPlayed += 1;
      break;
    case 'task_submitted':
      this.statistics.tasksSubmitted += 1;
      break;
    case 'task_approved':
      this.statistics.tasksApproved += 1;
      break;
  }

  await this.save();
};

module.exports = mongoose.model('User', userSchema);
