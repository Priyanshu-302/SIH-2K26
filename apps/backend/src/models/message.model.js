import mongoose from 'mongoose';

const CitationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  snippet: {
    type: String,
    required: true,
  },
  confidence: {
    type: String,
    required: true,
    enum: ['high', 'medium', 'low'],
  },
  url: {
    type: String,
    default: null,
  },
});

const MessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant'],
  },
  content: {
    type: String,
    required: true,
  },
  citations: {
    type: [CitationSchema],
    default: [],
  },
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
});

export const Message = mongoose.model('Message', MessageSchema);
export { CitationSchema };
