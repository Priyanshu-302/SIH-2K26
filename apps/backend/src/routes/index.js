import { Router } from 'express';
import sessionsRouter from './sessions.js';
import chatRouter from './chat.js';
import documentsRouter from './documents.js';
import historyRouter from './history.js';
import healthRouter from './health.js';
import authRouter from './auth.js';
import evalsRouter from './evals.js';
import formsRouter from './forms.js';
import pingRouter from './ping.js';

const router = Router();

router.use('/ping', pingRouter);
router.use('/auth', authRouter);
router.use('/sessions', sessionsRouter);
router.use('/sessions', historyRouter); // Mounts /sessions/:sessionId/history
router.use('/chat', chatRouter);
router.use('/documents', documentsRouter);
router.use('/health', healthRouter);
router.use('/evals', evalsRouter);
router.use('/forms', formsRouter);

export default router;
