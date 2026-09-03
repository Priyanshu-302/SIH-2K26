import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    trim: true,
    default: function() {
      if (this.email) {
        const username = this.email.split('@')[0];
        return username.charAt(0).toUpperCase() + username.slice(1);
      }
      return 'Ayurveda Researcher';
    },
  },
  role: {
    type: String,
    enum: ['researcher', 'examiner', 'attorney', 'admin'],
    default: 'researcher',
  },
  avatar: {
    type: String,
    default: null,
  },
  authProvider: {
    type: String,
    enum: ['email_otp', 'google'],
    default: 'email_otp',
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export const User = mongoose.model('User', UserSchema);
