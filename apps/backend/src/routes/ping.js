import { Router } from 'express';

const router = Router();

/**
 * GET /api/ping
 * Ultra-lightweight endpoint to prevent cold shutdowns and measure server latency.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Ayur-IP server active',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
