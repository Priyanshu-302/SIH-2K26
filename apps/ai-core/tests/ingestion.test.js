import { describe, it, expect, vi } from 'vitest';
import { splitLegalText } from '../src/ingestion/splitter.js';
import { runIngestion } from '../src/ingestion/pipeline.js';

// Mock dependency layers
vi.mock('../src/ingestion/parser.js', () => ({
    parsePdf: vi.fn().mockResolvedValue('Section 3 Inventions not patentable. Traditional knowledge is not patentable.')
}));

vi.mock('../src/vectorstore/embeddings.js', () => ({
    embedDocuments: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]])
}));

vi.mock('../src/vectorstore/qdrant-client.js', () => ({
    qdrant: {
        upsert: vi.fn().mockResolvedValue({ status: 'ok' })
    }
}));

vi.mock('../src/vectorstore/schema.js', () => ({
    ensureCollection: vi.fn().mockResolvedValue(true),
    COLLECTION_NAME: 'ayurveda_ip_corpus'
}));

describe('Ingestion Pipeline Tests', () => {
    describe('splitter.js', () => {
        it('should split legal text by section headers correctly', () => {
            const text = `Section 3 Inventions not patentable under traditional law.\nSection 4 Atomic energy formulations.`;
            const chunks = splitLegalText(text, 'Test Doc');
            expect(chunks.length).toBe(2);
            expect(chunks[0].section).toBe('Section 3');
            expect(chunks[1].section).toBe('Section 4');
        });

        it('should sub-chunk a section if it exceeds character limits', () => {
            const longSection = `Section 3 ` + 'Abc '.repeat(500);
            const chunks = splitLegalText(longSection, 'Long Doc');

            expect(chunks.length).toBeGreaterThan(1);
            expect(chunks[0].section).toBe('Section 3');
            expect(chunks[1].section).toBe('Section 3');
        });
    });

    describe('pipeline.js options validation', () => {
        it('should throw validation error if category is omitted', async () => {
            await expect(runIngestion('some-file.pdf', { title: 'No Category' }))
                .rejects.toThrow('category');
        });

        it('should throw validation error if category is not one of the allowed enums', async () => {
            await expect(runIngestion('some-file.pdf', { category: 'unknown_category' }))
                .rejects.toThrow('category');
        });
    });
});
