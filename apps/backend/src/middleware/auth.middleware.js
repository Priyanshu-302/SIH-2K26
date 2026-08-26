import logger from '../config/logger.js';

/**
 * Mock authorization middleware to populate user context on req.user.
 * Expects Bearer token or authorization headers, or assigns a mock developer context.
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const correlationId = req.id || 'system-action';

  // For development and testing, assign a mock user if no auth is present
  req.user = {
    id: 'usr_dev101',
    name: 'Ayurveda Researcher',
    role: 'researcher',
  };

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    // In real scenarios, verify token here
    logger.debug({ correlationId, path: req.path }, 'User authenticated via Bearer token');
  } else {
    logger.debug({ correlationId, path: req.path }, 'Assigned developer credentials to request context');
  }

  next();
}
