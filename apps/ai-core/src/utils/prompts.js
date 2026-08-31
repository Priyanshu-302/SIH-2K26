import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPTS_DIR = path.resolve(__dirname, '../../prompts');

export function loadPromptTemplate(filename) {
    const filePath = path.join(PROMPTS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Prompt template file not found at: ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf-8');
}
