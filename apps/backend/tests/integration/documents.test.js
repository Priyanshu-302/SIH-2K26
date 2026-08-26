import request from 'supertest';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import app from '../../src/app.js';
import { Session } from '../../src/models/session.model.js';
import { IngestionJob } from '../../src/models/ingestionJob.model.js';
import config from '../../src/config/index.js';

describe('Documents API Integration Tests', () => {
  let testSessionId;
  let testFilePath;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.MONGODB_URI);
    }

    // Create a temporary text file for testing uploads
    testFilePath = path.join(process.cwd(), 'tests', 'dummy-upload.txt');
    fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
    fs.writeFileSync(testFilePath, 'This is a mock Ayurvedic patent text for testing ingestion.');
  });

  afterAll(async () => {
    await Session.deleteMany({});
    await IngestionJob.deleteMany({});
    await mongoose.disconnect();
    
    // Clean up temporary test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  beforeEach(async () => {
    await Session.deleteMany({});
    await IngestionJob.deleteMany({});

    const session = new Session({ title: 'Upload Session' });
    await session.save();
    testSessionId = session._id.toString();
  });

  describe('POST /api/sessions/:sessionId/documents', () => {
    it('should reject document uploads with invalid category names', async () => {
      const response = await request(app)
        .post(`/api/sessions/${testSessionId}/documents`)
        .attach('file', testFilePath)
        .field('category', 'invalid_category_name'); // Non-canonical category

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('REQUEST_VALIDATION_FAILED');
    });

    it('should queue a valid document, save a pending database job, and return HTTP 202', async () => {
      const response = await request(app)
        .post(`/api/sessions/${testSessionId}/documents`)
        .attach('file', testFilePath)
        .field('category', 'classical_text')
        .field('title', 'Triphala formulation reference');

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('documentId');
      expect(response.body.status).toBe('PENDING');

      // Verify DB record matches
      const job = await IngestionJob.findById(response.body.documentId);
      expect(job).toBeTruthy();
      expect(job.filename).toBe('dummy-upload.txt');
      expect(job.title).toBe('Triphala formulation reference');
      expect(job.category).toBe('classical_text');
      expect(job.status).toBe('PENDING');
    });
  });

  describe('GET /api/documents', () => {
    it('should list all ingestion jobs with clean mapped fields, mapping ingestedCount to chunkCount', async () => {
      // Seed the DB with a mock job
      const mockJob = new IngestionJob({
        title: 'Seeded Document',
        filename: 'seeded-file.pdf',
        category: 'patent_doc',
        filePath: 'storage/uploads/seeded.pdf',
        status: 'COMPLETED',
        ingestedCount: 42,
      });
      await mockJob.save();

      const response = await request(app)
        .get('/api/documents');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const jobLog = response.body[0];
      expect(jobLog).toHaveProperty('documentId');
      expect(jobLog).toHaveProperty('filename');
      expect(jobLog).toHaveProperty('category');
      expect(jobLog).toHaveProperty('uploadedAt');
      expect(jobLog).toHaveProperty('chunkCount');
      expect(jobLog.chunkCount).toBe(42);
      expect(jobLog).toHaveProperty('status');
      expect(jobLog.status).toBe('completed'); // Lowercased status string

      // Verify absence of uncomputed properties
      expect(jobLog.wordCount).toBeUndefined();
      expect(jobLog.pipelineStep).toBeUndefined();
    });
  });

  describe('GET /api/documents/status/:documentId', () => {
    it('should return progress metrics for a specific document job, excluding pipelineStep', async () => {
      const mockJob = new IngestionJob({
        title: 'Processing Document',
        filename: 'processing.pdf',
        category: 'guideline',
        filePath: 'storage/uploads/processing.pdf',
        status: 'PROCESSING',
        progress: 45,
      });
      await mockJob.save();

      const response = await request(app)
        .get(`/api/documents/status/${mockJob._id}`);

      expect(response.status).toBe(200);
      expect(response.body.documentId).toBe(mockJob._id.toString());
      expect(response.body.filename).toBe('processing.pdf');
      expect(response.body.status).toBe('processing');
      expect(response.body.progress).toBe(45);
      expect(response.body.error).toBeNull();

      // Verify pipelineStep is not present
      expect(response.body.pipelineStep).toBeUndefined();
    });
  });
});
