import mongoose from 'mongoose';
import { getRedisClient } from '../config/redis.js';
import { getQdrantClient } from '../services/qdrant.service.js';
import logger from '../config/logger.js';

export const healthController = {
  /**
   * Health probe verifying Redis, MongoDB, and Qdrant readiness connections
   * Route: GET /api/health
   * 
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async checkHealth(req, res) {
    const status = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: 'DOWN',
        redis: 'DOWN',
        qdrant: 'DOWN',
      },
    };

    let hasFailure = false;

    // 1. Verify MongoDB connection state
    try {
      const readyState = mongoose.connection.readyState;
      if (readyState === 1) {
        status.services.mongodb = 'UP';
      } else {
        hasFailure = true;
        status.services.mongodb = `DOWN (state: ${readyState})`;
      }
    } catch (err) {
      hasFailure = true;
      status.services.mongodb = `ERROR: ${err.message}`;
    }

    // 2. Verify Redis connection ping
    try {
      const redisClient = getRedisClient();
      const pingResponse = await redisClient.ping();
      if (pingResponse === 'PONG') {
        status.services.redis = 'UP';
      } else {
        hasFailure = true;
        status.services.redis = `DOWN (ping response: ${pingResponse})`;
      }
    } catch (err) {
      hasFailure = true;
      status.services.redis = `ERROR: ${err.message}`;
    }

    // 3. Verify Qdrant connection endpoint
    try {
      const qdrant = getQdrantClient();
      const response = await qdrant.getCollections();
      if (response) {
        status.services.qdrant = 'UP';
      } else {
        hasFailure = true;
        status.services.qdrant = 'DOWN';
      }
    } catch (err) {
      // In mock modes, we might skip throwing critical errors for Qdrant if not running
      // but let's record it.
      hasFailure = true;
      status.services.qdrant = `ERROR: ${err.message}`;
    }

    if (hasFailure) {
      status.status = 'DEGRADED';
      logger.warn(status, 'System health report: DEGRADED');
      return res.status(503).json(status);
    }

    res.status(200).json(status);
  },
};
