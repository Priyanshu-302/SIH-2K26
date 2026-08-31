import { config } from '../config/index.js';

let localPipelinePromise = null;

async function getLocalPipeline() {
    if (!localPipelinePromise) {
        const { pipeline } = await import('@xenova/transformers');
        localPipelinePromise = pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');
    }
    return localPipelinePromise;
}

export async function embedText(text) {
    if (config.EMBEDDING_PROVIDER === 'hosted') {
        try {
            const response = await fetch(
                'https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5',
                {
                    headers: {
                        ...(config.HF_API_KEY ? { Authorization: `Bearer ${config.HF_API_KEY}` } : {}),
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify({ inputs: text }),
                }
            );

            if (!response.ok) {
                throw new Error(`HF Inference API returned status ${response.status}`);
            }

            const result = await response.json();
            if (Array.isArray(result)) {
                if (Array.isArray(result[0])) {
                    return result[0];
                }
                return result;
            }
            throw new Error('Unexpected response format from HF API');
        } catch (err) {
            console.warn(`Hosted embedding failed (using fallback): ${err.message}`);
            return embedLocal(text);
        }
    } else {
        return embedLocal(text);
    }
}

async function embedLocal(text) {
    const extractor = await getLocalPipeline();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

export async function embedDocuments(texts) {
    const embeddings = [];
    for (const text of texts) {
        embeddings.push(await embedText(text));
    }
    return embeddings;
}
