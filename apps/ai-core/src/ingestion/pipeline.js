import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { parsePdf } from './parser.js';
import { splitLegalText } from './splitter.js';
import { ensureCollection, COLLECTION_NAME } from '../vectorstore/schema.js';
import { qdrant } from '../vectorstore/qdrant-client.js';
import { embedDocuments } from '../vectorstore/embeddings.js';

const VALID_CATEGORIES = ['classical_text', 'patent_doc', 'legal_precedent', 'guideline'];

function collectFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        if (file.startsWith('.')) continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(collectFiles(fullPath));
        } else if (stat && stat.isFile()) {
            if (file.endsWith('.pdf') || file.endsWith('.txt') || file.endsWith('.md')) {
                results.push(fullPath);
            }
        }
    }
    return results;
}

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

    let files = [];
    const stat = fs.statSync(sourcePath);
    if (stat.isFile()) {
        files.push(sourcePath);
    } else if (stat.isDirectory()) {
        files = collectFiles(sourcePath);
    }

    if (files.length === 0) {
        console.warn(`No valid documents (.pdf, .txt, or .md) found at path: ${sourcePath}`);
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
