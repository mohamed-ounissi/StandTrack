const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const reminderSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  email: { type: String, default: '' },
  times: {
    type: [String],
    default: [],
    validate: {
      validator: function (v) {
        return v.length <= 3;
      },
      message: 'Maximum 3 reminder times allowed'
    }
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  defaultMeetingTime: {
    type: String,
    default: '15:30'
  },
  timezone: {
    type: String,
    default: 'UTC',
    validate: {
      validator: function (v) {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: v });
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid timezone identifier'
    }
  },
  reminderSettings: {
    type: reminderSchema,
    default: () => ({
      enabled: false,
      email: '',
      times: []
    })
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  // Ensure timezone is set for existing users
  if (!this.timezone) {
    this.timezone = 'UTC';
  }
  
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
