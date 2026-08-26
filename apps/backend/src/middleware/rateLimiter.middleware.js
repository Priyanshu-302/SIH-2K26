import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient } from '../config/redis.js';
import config from '../config/index.js';

// Reusable standard rate limit error handler
const limitHandler = (req, res) => {
  res.status(429).json({
    error: 'Too Many Requests',
    code: 'API_RATE_LIMIT_EXCEEDED',
    details: 'The legal assistant is busy reviewing documents. Please pause for 45 seconds before asking another question.',
  });
};

let ipLimiterMiddleware = (req, res, next) => next();
let sessionLimiterMiddleware = (req, res, next) => next();

// In non-test environments, initialize full Redis-backed rate limiters
if (config.NODE_ENV !== 'test') {
  const redisClient = getRedisClient();

  // 1. IP-Based Rate Limiter (5 requests per 2 minutes)
  ipLimiterMiddleware = rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 5,
    handler: limitHandler,
  });

  // 2. Session-Based Rate Limiter (3 requests per 2 minutes)
  sessionLimiterMiddleware = rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 3,
    keyGenerator: (req) => {
      // Falls back to IP if sessionId is not provided
      return req.body?.sessionId || req.ip;
    },
    handler: limitHandler,
  });
}

export const ipRateLimiter = ipLimiterMiddleware;
export const sessionRateLimiter = sessionLimiterMiddleware;
export const chatRateLimiter = [ipRateLimiter, sessionRateLimiter];
