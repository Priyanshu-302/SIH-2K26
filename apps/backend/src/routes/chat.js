import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { validate } from '../middleware/validator.middleware.js';
import { askRequestSchema } from '../schemas/chat.schema.js';
import { chatRateLimiter } from '../middleware/rateLimiter.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Endpoint for streaming AI RAG responses
router.post(
  '/ask',
  authMiddleware,
  validate(askRequestSchema),
  chatRateLimiter,
  chatController.ask
);

export default router;
