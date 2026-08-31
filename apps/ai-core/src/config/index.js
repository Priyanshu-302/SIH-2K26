import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
  process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'mock-groq-api-key';
  process.env.QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
}

const configSchema = z.object({
  GROQ_API_KEY: z.string().min(1, "Groq API Key is required"),
  GROQ_MODEL_NAME: z.string().default("llama-3.1-70b-versatile"),
  QDRANT_URL: z.string().url("Valid Qdrant URL is required").default("http://localhost:6333"),
  QDRANT_API_KEY: z.string().optional(),
  QDRANT_COLLECTION: z.string().default("ayurveda_ip_corpus"),
  EMBEDDING_PROVIDER: z.enum(["local", "hosted"]).default("hosted"),
  HF_API_KEY: z.string().optional(),
  TOP_K: z.coerce.number().default(5),
  MAX_RETRIES: z.coerce.number().default(2)
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
