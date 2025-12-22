const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserMongoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  institution: {
    type: String,
    default: ''
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    autoSaveReports: {
      type: Boolean,
      default: true
    },
    advancedFeatures: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Hash password before saving
UserMongoSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserMongoSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get user without password
UserMongoSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const UserMongo = mongoose.model('User', UserMongoSchema);

module.exports = UserMongo;
