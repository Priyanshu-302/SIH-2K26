import mongoose from 'mongoose';
import { DOCUMENT_CATEGORIES } from '../constants/documentCategory.js';

const IngestionJobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: DOCUMENT_CATEGORIES,
  },
  filePath: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING',
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  ingestedCount: {
    type: Number,
    default: 0,
  },
  timeTakenMs: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export const IngestionJob = mongoose.model('IngestionJob', IngestionJobSchema);
