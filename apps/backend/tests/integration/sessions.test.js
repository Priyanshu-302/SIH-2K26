import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { Session } from '../../src/models/session.model.js';
import config from '../../src/config/index.js';

describe('Sessions API Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Cleanup database and disconnect
    await Session.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Session.deleteMany({});
  });

  describe('POST /api/sessions', () => {
    it('should create a new session and return HTTP 201 with sessionId', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({ title: 'Test IP Assessment' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body.sessionId).toMatch(/^[0-9a-fA-F]{24}$/);

      // Verify record is saved in MongoDB
      const savedSession = await Session.findById(response.body.sessionId);
      expect(savedSession).toBeTruthy();
      expect(savedSession.title).toBe('Test IP Assessment');
    });

    it('should use default title if none is provided', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.sessionId).toBeDefined();

      const savedSession = await Session.findById(response.body.sessionId);
      expect(savedSession.title).toBe('New Assessment');
    });
  });
});
