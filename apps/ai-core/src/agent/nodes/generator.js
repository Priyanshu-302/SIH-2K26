import { ChatGroq } from "@langchain/groq";
import { config as appConfig } from "../../config/index.js";
import { loadPromptTemplate } from "../../utils/prompts.js";

export async function generatorNode(state, config = {}) {
    const { query, retrievedDocuments = [], validatorFeedback = '', chatHistory = [] } = state;
    const onToken = config.configurable?.onToken;

    const template = loadPromptTemplate('generator.txt');

    const docsText = retrievedDocuments.length > 0
        ? retrievedDocuments.map((doc, idx) => `---
Source ID: Doc ${idx + 1}
Source Name: ${doc.source}
Section: ${doc.section}
Content: ${doc.text}
---`).join('\n\n')
        : 'No documents retrieved.';

    const historyText = Array.isArray(chatHistory) && chatHistory.length > 0
        ? chatHistory.map(msg => {
            const role = msg.role || msg.type || (msg._type === 'human' ? 'user' : 'assistant');
            const content = msg.content || msg.text || '';
            return `${role}: ${content}`;
        }).join('\n')
        : 'No conversation history.';

    const feedbackText = validatorFeedback
        ? `\n⚠️ [CRITICAL CORRECTIONS REQUIRED FOR PREVIOUS HALLUCINATED CITATIONS]\nThe citation validator rejected the previous draft with the following feedback:\n${validatorFeedback}\n\nPlease rewrite the answer correcting the invalid citations above.`
        : '';

    const prompt = template
        .replace('{documents}', docsText)
        .replace('{query}', query)
        .replace('{chat_history}', historyText)
        .replace('{validator_feedback}', feedbackText);

    const model = new ChatGroq({
        apiKey: appConfig.GROQ_API_KEY,
        modelName: appConfig.GROQ_MODEL_NAME,
        temperature: 0.2,
    });

    const messages = [{ role: 'user', content: prompt }];
    let completeResponse = '';

    try {
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
        console.error("Error in Generator Node execution:", err);
        throw err;
    }
}
