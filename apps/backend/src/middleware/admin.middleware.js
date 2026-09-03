import logger from '../config/logger.js';

/**
 * Middleware that ensures the authenticated user has the 'admin' role
 */
export function requireAdmin(req, res, next) {
  const correlationId = req.id || 'admin-check';

  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication Required',
      code: 'AUTH_REQUIRED',
      details: 'Please log in to access this resource.',
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn(
      { correlationId, userId: req.user.id, role: req.user.role, path: req.path },
      'Unauthorized access attempt to admin ingestion endpoint'
    );
    return res.status(403).json({
      error: 'Forbidden',
      code: 'ADMIN_ACCESS_REQUIRED',
      details: 'Access restricted. Dataset ingestion and administrative management require Administrator privileges.',
    });
  }

  next();
}
