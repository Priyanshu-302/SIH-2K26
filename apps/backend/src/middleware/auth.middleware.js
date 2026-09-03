import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from '../config/logger.js';

/**
 * Authentication middleware that verifies JWT Bearer token and populates req.user
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const correlationId = req.id || 'auth-check';

  // Allow mock user strictly in automated tests if no auth header provided
  if (config.NODE_ENV === 'test' && (!authHeader || !authHeader.startsWith('Bearer '))) {
    req.user = {
      id: 'usr_dev101',
      email: 'tester@ayur-ip.gov.in',
      name: 'Ayurveda Researcher',
      role: 'researcher',
    };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication Required',
      code: 'AUTH_REQUIRED',
      details: 'You must be logged in with a valid session token to access this resource.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    logger.debug({ correlationId, userId: decoded.id, path: req.path }, 'Authenticated request verified');
    next();
  } catch (err) {
    logger.warn({ correlationId, error: err.message, path: req.path }, 'JWT verification failed');
    return res.status(401).json({
      error: 'Invalid or Expired Token',
      code: 'TOKEN_INVALID',
      details: 'Your session has expired. Please log in again to continue.',
    });
  }
}
