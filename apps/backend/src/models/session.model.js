import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'New Assessment',
  },
}, {
  timestamps: true,
});

export const Session = mongoose.model('Session', SessionSchema);
