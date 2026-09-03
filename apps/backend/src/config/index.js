import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().url().default('mongodb://localhost:27017/ayur-ip-db'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  AI_ADAPTER_MOCK: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().default(true)),
  GROQ_API_KEY: z.string().optional(),
  QDRANT_URL: z.string().url().default('http://localhost:6333'),
  JWT_SECRET: z.string().default('ayur_ip_jwt_secure_secret_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BREVO_API_KEY: z.string().optional(),
  BREVO_SENDER_EMAIL: z.string().default('no-reply@ayur-ip.gov.in'),
  BREVO_SENDER_NAME: z.string().default('Ayur-IP Intelligence'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment configuration:', result.error.format());
    process.exit(1);
  }
  return result.data;
};

const config = parseEnv();

export default config;
