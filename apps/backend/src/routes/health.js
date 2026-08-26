import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';

const router = Router();

// Endpoint for database connection and worker health probes
router.get('/', healthController.checkHealth);

export default router;
