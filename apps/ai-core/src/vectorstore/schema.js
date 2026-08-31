import { qdrant } from './qdrant-client.js';
import { config } from '../config/index.js';

export const COLLECTION_NAME = config.QDRANT_COLLECTION;
export const VECTOR_DIMENSION = 384;

export async function ensureCollection() {
    try {
        const response = await qdrant.getCollections();
        const exists = response.collections.some((col) => col.name === COLLECTION_NAME);

        if (!exists) {
            console.log(`Collection "${COLLECTION_NAME}" does not exist. Creating...`);
            await qdrant.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_DIMENSION,
                    distance: 'Cosine'
                }
            });

            await qdrant.createPayloadIndex(COLLECTION_NAME, {
                field_name: 'category',
                field_schema: 'keyword'
            });

            console.log(`Collection "${COLLECTION_NAME}" created successfully.`);
        }
    } catch (err) {
        console.error(`Error ensuring collection "${COLLECTION_NAME}":`, err);
        throw err;
    }
}
