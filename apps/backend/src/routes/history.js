import { Router } from 'express';
import { historyController } from '../controllers/history.controller.js';
import { validate } from '../middleware/validator.middleware.js';
import { getHistorySchema } from '../schemas/history.schema.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Route to retrieve paginated session message history
router.get(
  '/:sessionId/history',
  authMiddleware,
  validate(getHistorySchema),
  historyController.getHistory
);

export default router;
