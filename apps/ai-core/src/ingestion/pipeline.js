import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { parsePdf } from './parser.js';
import { splitLegalText } from './splitter.js';
import { ensureCollection, COLLECTION_NAME } from '../vectorstore/schema.js';
import { qdrant } from '../vectorstore/qdrant-client.js';
import { embedDocuments } from '../vectorstore/embeddings.js';

const VALID_CATEGORIES = ['classical_text', 'patent_doc', 'legal_precedent', 'guideline'];

export async function runIngestion(sourcePath, options = {}) {
    const startTime = Date.now();

    const { category, sourceUrl = null, title: optionsTitle } = options;
    if (!category) {
        throw new Error('Validation Error: Ingestion option "category" is required.');
    }
    if (!VALID_CATEGORIES.includes(category)) {
        throw new Error(`Validation Error: Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
    if (!sourcePath) {
        throw new Error('Validation Error: Ingestion "sourcePath" is required.');
    }

    await ensureCollection();

    const files = [];
    const stat = fs.statSync(sourcePath);
    if (stat.isFile()) {
        files.push(sourcePath);
    } else if (stat.isDirectory()) {
        const list = fs.readdirSync(sourcePath);
        for (const item of list) {
            const fullPath = path.join(sourcePath, item);
            if (fs.statSync(fullPath).isFile() && (item.endsWith('.pdf') || item.endsWith('.txt'))) {
                files.push(fullPath);
            }
        }
    }

    if (files.length === 0) {
        console.warn(`No valid documents (.pdf or .txt) found at path: ${sourcePath}`);
        return { ingestedCount: 0, timeTakenMs: Date.now() - startTime };
    }

    let totalIngested = 0;

    for (const filePath of files) {
        const filename = path.basename(filePath);
        const docTitle = optionsTitle || filename;

        console.log(`[Ingest] Processing file: ${filename}`);
        const rawText = await parsePdf(filePath);
        const chunks = splitLegalText(rawText, docTitle);

        if (chunks.length === 0) continue;

        console.log(`[Ingest] Generated ${chunks.length} chunks. Generating embeddings...`);
        const textList = chunks.map(c => c.text);
        const vectors = await embedDocuments(textList);

        console.log(`[Ingest] Upserting to Qdrant collection "${COLLECTION_NAME}"...`);
        const points = chunks.map((chunk, index) => {
            const hashInput = `${filename}_${chunk.section}_${chunk.chunkIndex}`;
            const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
            const uuid = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;

            return {
                id: uuid,
                vector: vectors[index],
                payload: {
                    text: chunk.text,
                    source: docTitle,
                    category,
                    section: chunk.section,
                    title: chunk.title,
                    sourceUrl,
                    chunkIndex: chunk.chunkIndex,
                    ingestedAt: new Date().toISOString()
                }
            };
        });

        await qdrant.upsert(COLLECTION_NAME, {
            wait: true,
            points
        });

        totalIngested += points.length;
    }

    const timeTakenMs = Date.now() - startTime;
    console.log(`[Ingest] Completed. Ingested ${totalIngested} chunks in ${timeTakenMs}ms.`);
    return { ingestedCount: totalIngested, timeTakenMs };
}
