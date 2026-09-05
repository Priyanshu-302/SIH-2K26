import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { Session } from '../../src/models/session.model.js';
import { Message } from '../../src/models/message.model.js';
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
    await Message.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Session.deleteMany({});
    await Message.deleteMany({});
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

  describe('PATCH /api/sessions/:sessionId', () => {
    it('should rename a session title successfully', async () => {
      const session = new Session({ title: 'Old Title' });
      await session.save();

      const response = await request(app)
        .patch(`/api/sessions/${session._id}`)
        .send({ title: 'Updated Botanical Patent Assessment' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Botanical Patent Assessment');

      const updated = await Session.findById(session._id);
      expect(updated.title).toBe('Updated Botanical Patent Assessment');
    });

    it('should return 400 if title is empty or invalid', async () => {
      const session = new Session({ title: 'Some Title' });
      await session.save();

      const response = await request(app)
        .patch(`/api/sessions/${session._id}`)
        .send({ title: '   ' });

      expect(response.status).toBe(400);
    });

    it('should return 404 if session does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/sessions/${nonExistentId}`)
        .send({ title: 'Valid Title' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/sessions/:sessionId', () => {
    it('should delete a session and cascade delete its messages', async () => {
      const session = new Session({ title: 'Session To Delete' });
      await session.save();

      // Seed message linked to this session
      const message = new Message({
        sessionId: session._id,
        role: 'user',
        content: 'Is neem oil patentable?',
      });
      await message.save();

      const response = await request(app)
        .delete(`/api/sessions/${session._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify session and message are gone
      const sessionCheck = await Session.findById(session._id);
      expect(sessionCheck).toBeNull();

      const messageCheck = await Message.find({ sessionId: session._id });
      expect(messageCheck.length).toBe(0);
    });

    it('should return 404 when deleting non-existent session', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/sessions/${nonExistentId}`);

      expect(response.status).toBe(404);
    });
  });
});

