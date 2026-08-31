import { describe, it, expect, vi } from 'vitest';
import { ensureCollection, COLLECTION_NAME } from '../src/vectorstore/schema.js';
import { qdrant } from '../src/vectorstore/qdrant-client.js';

vi.mock('../src/vectorstore/qdrant-client.js', () => ({
    qdrant: {
        getCollections: vi.fn().mockResolvedValue({ collections: [] }),
        createCollection: vi.fn().mockResolvedValue({ status: 'ok' }),
        createPayloadIndex: vi.fn().mockResolvedValue({ status: 'ok' })
    }
}));

describe('Qdrant Vector Store Setup', () => {
    it('should initialize collection and indexing schemas correctly', async () => {
        await ensureCollection();

        expect(qdrant.getCollections).toHaveBeenCalled();
        expect(qdrant.createCollection).toHaveBeenCalledWith(COLLECTION_NAME, expect.objectContaining({
            vectors: expect.objectContaining({
                size: 384,
                distance: 'Cosine'
            })
        }));

        expect(qdrant.createPayloadIndex).toHaveBeenCalledWith(COLLECTION_NAME, expect.objectContaining({
            field_name: 'category',
            field_schema: 'keyword'
        }));
    });
});
