import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'New Assessment',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true,
  },
}, {
  timestamps: true,
});

export const Session = mongoose.model('Session', SessionSchema);
