import { Router } from 'express';
import sessionsRouter from './sessions.js';
import chatRouter from './chat.js';
import documentsRouter from './documents.js';
import historyRouter from './history.js';
import healthRouter from './health.js';

const router = Router();

router.use('/sessions', sessionsRouter);
router.use('/sessions', historyRouter); // Mounts /sessions/:sessionId/history
router.use('/chat', chatRouter);
router.use('/documents', documentsRouter);
router.use('/health', healthRouter);

export default router;
