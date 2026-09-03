import crypto from 'crypto';
import { Otp } from '../models/otp.model.js';
import { getRedisClient } from '../config/redis.js';
import logger from '../config/logger.js';

const OTP_EXPIRY_SECONDS = 300; // 5 minutes

export const otpService = {
  /**
   * Generates a secure 6-digit numeric OTP
   * @returns {string} 6-digit code
   */
  generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
  },

  /**
   * Stores an OTP in MongoDB (with TTL index) and Redis cache
   * 
   * @param {string} email 
   * @param {string} otp 
   */
  async storeOtp(email, otp) {
    const normalizedEmail = email.trim().toLowerCase();
    const key = `otp:${normalizedEmail}`;

    // 1. Persist to MongoDB with 5-minute TTL
    try {
      await Otp.findOneAndUpdate(
        { email: normalizedEmail },
        { email: normalizedEmail, otp, createdAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (err) {
      logger.error({ error: err.message }, 'Failed storing OTP in MongoDB');
    }

    // 2. Cache in Redis if connected
    try {
      const redis = getRedisClient();
      if (redis && redis.status === 'ready') {
        await redis.set(key, otp, 'EX', OTP_EXPIRY_SECONDS);
      }
    } catch (err) {
      // Non-critical fallback
    }
  },

  /**
   * Verifies an OTP against MongoDB / Redis and invalidates it immediately upon success
   * 
   * @param {string} email 
   * @param {string} inputOtp 
   * @returns {Promise<boolean>} True if valid, false otherwise
   */
  async verifyOtp(email, inputOtp) {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanInput = (inputOtp || '').trim();
    const key = `otp:${normalizedEmail}`;

    let storedOtp = null;

    // 1. Try Redis cache first
    try {
      const redis = getRedisClient();
      if (redis && redis.status === 'ready') {
        storedOtp = await redis.get(key);
      }
    } catch (err) {}

    // 2. Fall back to MongoDB
    if (!storedOtp) {
      try {
        const record = await Otp.findOne({ email: normalizedEmail });
        if (record) {
          storedOtp = record.otp;
        }
      } catch (err) {
        logger.error({ error: err.message }, 'Failed reading OTP from MongoDB');
      }
    }

    if (!storedOtp) {
      return false;
    }

    // 3. Verify match
    const isValid = storedOtp === cleanInput;

    if (isValid) {
      // Invalidate OTP immediately (single-use)
      try {
        await Otp.deleteOne({ email: normalizedEmail });
      } catch (e) {}

      try {
        const redis = getRedisClient();
        if (redis && redis.status === 'ready') {
          await redis.del(key);
        }
      } catch (e) {}
    }

    return isValid;
  },
};
