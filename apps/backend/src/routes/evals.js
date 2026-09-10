import { Router } from 'express';
import { getBenchmarkSummary, runLiveEvaluation } from '../controllers/eval.controller.js';
import { optionalAuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/evals/benchmark - Publicly auditable benchmark scorecard and comparison matrix
router.get('/benchmark', getBenchmarkSummary);

// POST /api/evals/run - On-demand live benchmark evaluation runner
router.post('/run', optionalAuthMiddleware, runLiveEvaluation);

export default router;
