import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../config/index.js';

export const qdrant = new QdrantClient({
    url: config.QDRANT_URL,
    apiKey: config.QDRANT_API_KEY || undefined,
});
