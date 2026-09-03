import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// POST /api/auth/otp/send - Send OTP verification email
router.post('/otp/send', authController.sendOtp);

// POST /api/auth/otp/verify - Verify OTP and login/register
router.post('/otp/verify', authController.verifyOtp);

// POST /api/auth/google - Authenticate via Google
router.post('/google', authController.googleAuth);

// GET /api/auth/me - Retrieve profile for authenticated user
router.get('/me', authMiddleware, authController.getMe);

// PUT /api/auth/profile - Update profile details
router.put('/profile', authMiddleware, authController.updateProfile);

export default router;
