import { rateLimit } from 'express-rate-limit';
import config from '../config/index.js';

// Reusable standard rate limit error handler
const limitHandler = (req, res) => {
  res.status(429).json({
    error: 'Too Many Requests',
    code: 'API_RATE_LIMIT_EXCEEDED',
    details: 'The legal assistant is busy reviewing documents. Please pause for 45 seconds before asking another question.',
  });
};

const isDev = config.NODE_ENV === 'development';

// 1. IP-Based Rate Limiter (30 requests per minute in dev)
export const ipRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDev ? 30 : 10,
  handler: limitHandler,
});

// 2. Session-Based Rate Limiter (30 requests per minute in dev)
export const sessionRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDev ? 30 : 10,
  keyGenerator: (req) => {
    return req.body?.sessionId || req.ip;
  },
  handler: limitHandler,
});

export const chatRateLimiter = [ipRateLimiter, sessionRateLimiter];
