import { jest } from '@jest/globals';

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/ayur-ip-test-db';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.AI_ADAPTER_MOCK = 'true';

// Mock Redis connection globally
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      on: jest.fn(),
      ping: jest.fn().mockResolvedValue('PONG'),
      call: jest.fn().mockResolvedValue(1),
      quit: jest.fn().mockResolvedValue('OK'),
    };
  });
});

// Mock BullMQ globally
jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => ({
      add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    })),
    Worker: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      close: jest.fn().mockResolvedValue(true),
    })),
  };
});

// -------------------------------------------------------------
// In-Memory Database Store Mocking
// -------------------------------------------------------------

const dbStore = {
  Session: [],
  Message: [],
  IngestionJob: [],
};

global.resetTestDbStore = () => {
  dbStore.Session = [];
  dbStore.Message = [];
  dbStore.IngestionJob = [];
};

class MockObjectId {
  constructor(id) {
    this.id = id || Math.random().toString(16).substring(2, 14) + Math.random().toString(16).substring(2, 14);
  }
  toString() {
    return this.id;
  }
}

const createQueryChain = (results) => {
  const chain = {
    sort: jest.fn().mockImplementation(() => chain),
    skip: jest.fn().mockImplementation((val) => {
      if (Array.isArray(results) && typeof val === 'number') {
        return createQueryChain(results.slice(val));
      }
      return chain;
    }),
    limit: jest.fn().mockImplementation((val) => {
      if (Array.isArray(results) && typeof val === 'number') {
        return createQueryChain(results.slice(0, val));
      }
      return chain;
    }),
    lean: jest.fn().mockImplementation(() => Promise.resolve(results)),
    then: jest.fn().mockImplementation((resolve) => {
      return Promise.resolve(results).then(resolve);
    }),
    catch: jest.fn(),
  };
  return chain;
};

// Mock mongoose entirely to avoid internal compilation schema errors
jest.mock('mongoose', () => {
  const mockMongoose = {
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    connection: {
      readyState: 1,
    },
    Schema: class Schema {
      constructor(definition, options) {
        this.definition = definition;
        this.options = options;
      }
    },
    Types: {
      ObjectId: MockObjectId,
    },
    model: jest.fn().mockImplementation((modelName, schema) => {
      class CompiledModel {
        constructor(data) {
          Object.assign(this, data);
          if (!this._id) {
            this._id = new MockObjectId();
          }
          if (!this.createdAt) {
            this.createdAt = new Date();
          }
          if (!this.updatedAt) {
            this.updatedAt = new Date();
          }
          if (this.errorMessage === undefined) {
            this.errorMessage = null;
          }
          if (this.ingestedCount === undefined) {
            this.ingestedCount = 0;
          }
        }
        save() {
          const doc = { ...this };
          if (!dbStore[modelName]) dbStore[modelName] = [];
          dbStore[modelName] = dbStore[modelName].filter(
            (d) => d._id.toString() !== this._id.toString()
          );
          dbStore[modelName].push(doc);
          return Promise.resolve(this);
        }
        toObject() {
          return this;
        }
      }

      CompiledModel.modelName = modelName;

      CompiledModel.find = jest.fn().mockImplementation((conditions) => {
        let results = dbStore[modelName] || [];
        if (conditions && conditions.sessionId) {
          results = results.filter(
            (d) => d.sessionId && d.sessionId.toString() === conditions.sessionId.toString()
          );
        }
        // Map elements to model instances so constructor fields get populated
        const modelInstances = results.map(r => new CompiledModel(r));
        return createQueryChain(modelInstances);
      });

      CompiledModel.findById = jest.fn().mockImplementation((id) => {
        const results = dbStore[modelName] || [];
        const doc = results.find((d) => d._id.toString() === id?.toString());
        if (!doc) return createQueryChain(null);
        return createQueryChain(new CompiledModel(doc));
      });

      CompiledModel.findByIdAndUpdate = jest.fn().mockImplementation((id, update) => {
        const results = dbStore[modelName] || [];
        const docIndex = results.findIndex((d) => d._id.toString() === id?.toString());
        if (docIndex !== -1) {
          const doc = results[docIndex];
          const finalUpdate = update.$set || update;
          const updatedDoc = { ...doc, ...finalUpdate };
          results[docIndex] = updatedDoc;
          dbStore[modelName] = results;
          return createQueryChain(new CompiledModel(updatedDoc));
        }
        return createQueryChain(null);
      });

      CompiledModel.deleteMany = jest.fn().mockImplementation((conditions) => {
        if (conditions && conditions.sessionId) {
          dbStore[modelName] = (dbStore[modelName] || []).filter(
            (d) => d.sessionId && d.sessionId.toString() !== conditions.sessionId.toString()
          );
        } else {
          dbStore[modelName] = [];
        }
        return Promise.resolve({ deletedCount: 1 });
      });

      CompiledModel.findByIdAndDelete = jest.fn().mockImplementation((id) => {
        dbStore[modelName] = (dbStore[modelName] || []).filter(
          (d) => d._id.toString() !== id?.toString()
        );
        return Promise.resolve({ deletedCount: 1 });
      });

      return CompiledModel;
    }),
  };

  mockMongoose.Schema.Types = {
    ObjectId: MockObjectId,
  };

  return mockMongoose;
});
export { MockObjectId };
