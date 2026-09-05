import { ChatGroq } from "@langchain/groq";
import { config as appConfig } from "../../config/index.js";
import { loadPromptTemplate } from "../../utils/prompts.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generatorNode(state, config = {}) {
    const { query, retrievedDocuments = [], validatorFeedback = '', chatHistory = [] } = state;
    const onToken = config.configurable?.onToken;

    const template = loadPromptTemplate('generator.txt');

    // Filter by relevance threshold and limit to top 3 documents to save tokens
    const qualifiedDocs = retrievedDocuments
        .filter(doc => typeof doc.score !== 'number' || doc.score >= 0.5)
        .slice(0, 3);

    const targetDocs = qualifiedDocs.length > 0 ? qualifiedDocs : retrievedDocuments.slice(0, 2);

    const docsText = targetDocs.length > 0
        ? targetDocs.map((doc, idx) => {
            const clean = (doc.text || '')
                .replace(/[\r\n\t]+/g, ' ')
                .replace(/\s{2,}/g, ' ')
                .trim();
            const trimmedText = clean.length > 450 ? clean.slice(0, 447) + '...' : clean;
            return `---
Source ID: Doc ${idx + 1}
Source: ${doc.source}
Section: ${doc.section}
Content: ${trimmedText}
---`;
        }).join('\n\n')
        : 'No legal documents retrieved.';

    // Keep only last 2 messages and truncate long assistant outputs to preserve tokens
    const historyText = Array.isArray(chatHistory) && chatHistory.length > 0
        ? chatHistory.slice(-2).map(msg => {
            const role = msg.role || msg.type || (msg._type === 'human' ? 'user' : 'assistant');
            let content = msg.content || msg.text || '';
            if (role === 'assistant' && content.length > 250) {
                content = content.slice(0, 250) + '...';
            }
            return `${role}: ${content}`;
        }).join('\n')
        : 'No conversation history.';

    const feedbackText = validatorFeedback
        ? `\n⚠️ [CRITICAL CORRECTIONS REQUIRED]\n${validatorFeedback}\nPlease rewrite the answer correcting the citations.`
        : '';

    const prompt = template
        .replace('{documents}', docsText)
        .replace('{query}', query)
        .replace('{chat_history}', historyText)
        .replace('{validator_feedback}', feedbackText);

    const model = new ChatGroq({
        apiKey: appConfig.GROQ_API_KEY,
        model: appConfig.GROQ_MODEL_NAME,
        modelName: appConfig.GROQ_MODEL_NAME,
        temperature: 0.2,
        maxTokens: 1200,
    });

    const messages = [{ role: 'user', content: prompt }];
    let completeResponse = '';

    // Resilient retry loop with backoff if Groq TPM rate limit is hit
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            attempts++;
            if (typeof onToken === 'function') {
                const stream = await model.stream(messages);
                for await (const chunk of stream) {
                    const text = chunk.content || '';
                    completeResponse += text;
                    onToken(text);
                }
            } else {
                const response = await model.invoke(messages);
                completeResponse = response.content || '';
            }

            return {
                generation: completeResponse
            };
        } catch (err) {
            const isRateLimit = err?.status === 429 || err?.message?.includes('Rate limit') || err?.code === 'rate_limit_exceeded';
            if (isRateLimit && attempts < maxAttempts) {
                console.warn(`[Groq TPM Backoff] Rate limit reached. Auto-waiting 3.5s before retry (attempt ${attempts}/${maxAttempts})...`);
                await sleep(3500);
                continue;
            }
            console.error("Error in Generator Node execution:", err);
            throw err;
        }
    }
}
