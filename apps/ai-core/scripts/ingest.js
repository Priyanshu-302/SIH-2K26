import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { runIngestion } from '../src/ingestion/pipeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../../../');

const DATASETS = [
    {
        name: 'Statutory Acts and Rules',
        dir: path.join(workspaceRoot, 'statutory_pdfs'),
        category: 'guideline'
    },
    {
        name: 'Landmark Case Law',
        dir: path.join(workspaceRoot, 'case_law'),
        category: 'legal_precedent'
    },
    {
        name: 'Geographical Indications (GI) Registry',
        dir: path.join(workspaceRoot, 'gi_registry'),
        category: 'classical_text'
    },
    {
        name: 'Traditional Knowledge Digital Library (TKDL)',
        dir: path.join(workspaceRoot, 'tkdl'),
        category: 'classical_text'
    },
    {
        name: 'InPASS Patent Prosecutions',
        dir: path.join(workspaceRoot, 'inpass'),
        category: 'patent_doc'
    }
];

async function main() {
    console.log('====================================================');
    console.log('🚀 Starting Full Ayurvedic IP Master Dataset Ingestion');
    console.log('====================================================\n');

    let grandTotalChunks = 0;
    const startTime = Date.now();

    for (const dataset of DATASETS) {
        if (!fs.existsSync(dataset.dir)) {
            console.warn(`⚠️ Warning: Dataset directory not found: ${dataset.dir}`);
            continue;
        }

        console.log(`\n📂 [Ingesting Dataset] ${dataset.name}`);
        console.log(`   Path: ${dataset.dir}`);
        console.log(`   Category Tag: ${dataset.category}`);

        try {
            const result = await runIngestion(dataset.dir, { category: dataset.category });
            console.log(`   ✅ Success: Ingested ${result.ingestedCount} chunks in ${(result.timeTakenMs / 1000).toFixed(2)}s`);
            grandTotalChunks += result.ingestedCount;
        } catch (err) {
            console.error(`   ❌ Failed to ingest ${dataset.name}:`, err.message);
        }
    }

    const totalSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n====================================================');
    console.log(`🎉 Ingestion Complete!`);
    console.log(`   Total Chunks Indexed into Qdrant: ${grandTotalChunks}`);
    console.log(`   Total Elapsed Time: ${totalSeconds}s`);
    console.log('====================================================');
}

main().catch(err => {
    console.error('Fatal ingestion script error:', err);
    process.exit(1);
});
