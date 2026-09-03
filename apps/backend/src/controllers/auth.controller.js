import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { otpService } from '../services/otp.service.js';
import { brevoService } from '../services/brevo.service.js';
import config from '../config/index.js';
import logger from '../config/logger.js';

/**
 * Generates a signed JWT token for a user
 * @param {Object} user 
 * @returns {string} Signed JWT
 */
function createToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

export const authController = {
  /**
   * Request OTP to be sent to user's email
   * POST /api/auth/otp/send
   */
  async sendOtp(req, res, next) {
    const correlationId = req.id || 'auth-otp-send';
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        error: 'Invalid Email',
        code: 'INVALID_EMAIL',
        details: 'A valid email address is required to receive a verification code.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      logger.info({ correlationId, email: normalizedEmail }, 'Processing OTP request');

      const otp = otpService.generateOtp();
      await otpService.storeOtp(normalizedEmail, otp);
      const emailResult = await brevoService.sendOtpEmail(normalizedEmail, otp);

      res.status(200).json({
        success: true,
        message: 'A 6-digit verification code has been sent to your email.',
        simulated: emailResult.simulated || false,
      });
    } catch (error) {
      logger.error({ correlationId, error: error.message }, 'Failed sending OTP');
      next(error);
    }
  },

  /**
   * Verify entered OTP and login or create user
   * POST /api/auth/otp/verify
   */
  async verifyOtp(req, res, next) {
    const correlationId = req.id || 'auth-otp-verify';
    const { email, otp, name, role } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: 'Missing Credentials',
        code: 'MISSING_FIELDS',
        details: 'Both email and verification code are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const isValid = await otpService.verifyOtp(normalizedEmail, otp);

      if (!isValid) {
        return res.status(400).json({
          error: 'Verification Failed',
          code: 'INVALID_OTP',
          details: 'The verification code entered is invalid or has expired. Please request a new code.',
        });
      }

      // Find or create User
      let user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        user = new User({
          email: normalizedEmail,
          name: name || undefined,
          role: role || 'researcher',
          authProvider: 'email_otp',
          lastLoginAt: new Date(),
        });
        await user.save();
        logger.info({ correlationId, userId: user._id, email: user.email }, 'New user registered via Email OTP');
      } else {
        user.lastLoginAt = new Date();
        await user.save();
        logger.info({ correlationId, userId: user._id, email: user.email }, 'Existing user authenticated via Email OTP');
      }

      const token = createToken(user);

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      logger.error({ correlationId, error: error.message }, 'OTP verification failed');
      next(error);
    }
  },

  /**
   * Authenticate via Google OAuth credential token or profile
   * POST /api/auth/google
   */
  async googleAuth(req, res, next) {
    const correlationId = req.id || 'auth-google';
    const { credential, email, name, avatar } = req.body;

    let userEmail = email;
    let userName = name;
    let userAvatar = avatar;

    // Decode Google JWT credential if supplied
    if (credential) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          userEmail = payload.email;
          userName = payload.name;
          userAvatar = payload.picture;
        }
      } catch (err) {
        logger.warn({ correlationId, error: err.message }, 'Failed decoding Google credential, falling back to direct fields');
      }
    }

    if (!userEmail) {
      return res.status(400).json({
        error: 'Google Authentication Failed',
        code: 'INVALID_GOOGLE_AUTH',
        details: 'Unable to extract email from Google credential.',
      });
    }

    const normalizedEmail = userEmail.trim().toLowerCase();

    try {
      let user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        user = new User({
          email: normalizedEmail,
          name: userName || 'Ayurveda Researcher',
          avatar: userAvatar || null,
          role: 'researcher',
          authProvider: 'google',
          lastLoginAt: new Date(),
        });
        await user.save();
        logger.info({ correlationId, userId: user._id, email: user.email }, 'New user registered via Google');
      } else {
        user.lastLoginAt = new Date();
        if (userName) user.name = userName;
        if (userAvatar) user.avatar = userAvatar;
        user.authProvider = 'google';
        await user.save();
        logger.info({ correlationId, userId: user._id, email: user.email }, 'Existing user authenticated via Google');
      }

      const token = createToken(user);

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      logger.error({ correlationId, error: error.message }, 'Google authentication error');
      next(error);
    }
  },

  /**
   * Get currently authenticated user details
   * GET /api/auth/me
   */
  async getMe(req, res) {
    res.status(200).json({
      user: req.user,
    });
  },

  /**
   * Update profile of currently authenticated user
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    const correlationId = req.id || 'auth-profile-update';
    const { name, role } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (name && name.trim()) user.name = name.trim();
      if (role && ['researcher', 'examiner', 'attorney', 'admin'].includes(role)) {
        user.role = role;
      }

      await user.save();
      logger.info({ correlationId, userId: user._id, name: user.name }, 'User profile updated');

      res.status(200).json({
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      logger.error({ correlationId, error: error.message }, 'Failed updating profile');
      next(error);
    }
  },
};
