import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

/**
 * Parses a document file (PDF, TXT, or MD) and returns its raw text content.
 * 
 * @param {string} filePath - Absolute path to the target file.
 * @returns {Promise<string>} Raw text content of the document.
 */
export async function parsePdf(filePath) {
    if (!filePath) {
        throw new Error('parsePdf requires a valid filePath');
    }

    if (filePath.endsWith('.txt') || filePath.endsWith('.md')) {
        return fs.readFileSync(filePath, 'utf-8');
    }

    if (filePath.endsWith('.pdf')) {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        await parser.load();
        const result = await parser.getText();
        return (typeof result === 'string' ? result : result?.text) || '';
    }

    throw new Error(`Unsupported file format for path: ${filePath}`);
}
