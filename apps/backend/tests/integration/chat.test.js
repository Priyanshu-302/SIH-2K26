import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { Session } from '../../src/models/session.model.js';
import { Message } from '../../src/models/message.model.js';
import config from '../../src/config/index.js';

describe('Chat API Integration Tests', () => {
  let testSessionId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await Session.deleteMany({});
    await Message.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Session.deleteMany({});
    await Message.deleteMany({});

    // Create a mock active session to test queries against
    const session = new Session({ title: 'Active Chat Session' });
    await session.save();
    testSessionId = session._id.toString();
  });

  describe('POST /api/chat/ask', () => {
    it('should reject requests with missing or invalid sessionId format', async () => {
      const response = await request(app)
        .post('/api/chat/ask')
        .send({ query: 'Triphala formulation patent search', sessionId: 'invalid-id-format' });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('REQUEST_VALIDATION_FAILED');
    });

    it('should reject requests with non-existent sessionIds', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .post('/api/chat/ask')
        .send({ query: 'Triphala formulation patent search', sessionId: nonExistentId });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SESSION_INVALID');
    });

    it('should establish SSE channel and stream tokens, citations, and terminal done events', async () => {
      const response = await request(app)
        .post('/api/chat/ask')
        .send({ query: 'Triphala classical formulation assessment', sessionId: testSessionId })
        .expect('Content-Type', /text\/event-stream/);

      expect(response.status).toBe(200);

      // Parse the response text chunks
      const lines = response.text.split('\n\n');
      const events = lines
        .filter(line => line.startsWith('data: '))
        .map(line => JSON.parse(line.substring(6)));

      // Assert structure of streamed events
      expect(events.length).toBeGreaterThan(0);
      
      const tokenEvents = events.filter(e => e.type === 'token');
      const citationsEvents = events.filter(e => e.type === 'citations');
      const doneEvents = events.filter(e => e.type === 'done');

      expect(tokenEvents.length).toBeGreaterThan(0);
      expect(citationsEvents.length).toBe(1);
      expect(doneEvents.length).toBe(1);

      // Verify canonical citation shape
      const citation = citationsEvents[0].data[0];
      expect(citation).toHaveProperty('id');
      expect(citation).toHaveProperty('source');
      expect(citation).toHaveProperty('section');
      expect(citation).toHaveProperty('snippet');
      expect(citation).toHaveProperty('confidence');
      expect(citation.confidence).toMatch(/^(high|medium|low)$/);

      // Verify messages are saved in database history logs
      const savedMessages = await Message.find({ sessionId: testSessionId });
      expect(savedMessages.length).toBe(2); // User prompt + Assistant response
      
      const userMsg = savedMessages.find(m => m.role === 'user');
      const assistantMsg = savedMessages.find(m => m.role === 'assistant');

      expect(userMsg.content).toBe('Triphala classical formulation assessment');
      expect(assistantMsg.content).toContain('Triphala');
      expect(assistantMsg.citations.length).toBe(2);
    });

    it('should yield error event for simulated pipeline failure queries', async () => {
      const response = await request(app)
        .post('/api/chat/ask')
        .send({ query: 'generate_error', sessionId: testSessionId });

      const lines = response.text.split('\n\n');
      const events = lines
        .filter(line => line.startsWith('data: '))
        .map(line => JSON.parse(line.substring(6)));

      const errorEvents = events.filter(e => e.type === 'error');
      expect(errorEvents.length).toBe(1);
      expect(errorEvents[0].message).toContain('Simulated assessment pipeline error');
    });
  });
});
