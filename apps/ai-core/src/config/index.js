import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../apps/backend/.env') });
dotenv.config();

if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
  process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'mock-groq-api-key';
  process.env.QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
}

const configSchema = z.object({
  GROQ_API_KEY: z.string().default("gsk_placeholder_key"),
  GROQ_MODEL_NAME: z.string().default("llama-3.3-70b-versatile"),
  QDRANT_URL: z.string().default("http://localhost:6333"),
  QDRANT_API_KEY: z.string().optional(),
  QDRANT_COLLECTION: z.string().default("ayurveda_ip_corpus"),
  EMBEDDING_PROVIDER: z.enum(["local", "hosted"]).default("local"),
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
