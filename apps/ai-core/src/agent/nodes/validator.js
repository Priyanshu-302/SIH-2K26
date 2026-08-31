import { ChatGroq } from "@langchain/groq";
import { config as appConfig } from "../../config/index.js";
import { loadPromptTemplate } from "../../utils/prompts.js";
import { z } from "zod";

const validatorOutputSchema = z.object({
    validationPassed: z.boolean(),
    feedback: z.string(),
    citations: z.array(z.object({
        docId: z.string(),
        source: z.string(),
        section: z.string(),
        snippet: z.string()
    }))
});

export async function validatorNode(state) {
    const { classification, generation, retrievedDocuments = [], retryCount = 0 } = state;

    if (classification === 'general' || retrievedDocuments.length === 0) {
        return {
            validationPassed: true,
            validatorFeedback: '',
            finalResponse: generation,
            verifiedCitations: []
        };
    }

    const docsText = retrievedDocuments.map((doc, idx) => `---
Source ID: Doc ${idx + 1}
Source Name: ${doc.source}
Section: ${doc.section}
Content: ${doc.text}
---`).join('\n\n');

    const template = loadPromptTemplate('validator.txt');
    const prompt = template
        .replace('{documents}', docsText)
        .replace('{generation}', generation);

    const model = new ChatGroq({
        apiKey: appConfig.GROQ_API_KEY,
        modelName: "llama-3.1-8b-instant",
        temperature: 0,
    }).withStructuredOutput(validatorOutputSchema);

    try {
        const result = await model.invoke([
            { role: "user", content: prompt }
        ]);

        let { validationPassed, feedback, citations = [] } = result;
        const verifiedCitations = [];

        for (const cit of citations) {
            const docMatch = cit.docId.match(/Doc\s+(\d+)/i);
            const docIndex = docMatch ? parseInt(docMatch[1], 10) - 1 : -1;

            if (docIndex < 0 || docIndex >= retrievedDocuments.length) {
                validationPassed = false;
                feedback += `\nHallucinated citation: Referenced "${cit.docId}" which does not exist in retrieved contexts.`;
                continue;
            }

            const matchedDoc = retrievedDocuments[docIndex];

            let confidence = 'medium';
            const score = matchedDoc.score;
            if (typeof score === 'number') {
                if (score >= 0.80) {
                    confidence = 'high';
                } else if (score >= 0.60) {
                    confidence = 'medium';
                } else {
                    confidence = 'low';
                }
            }

            verifiedCitations.push({
                id: matchedDoc.id || `cit-${docIndex}-${Date.now()}`,
                source: matchedDoc.source,
                section: matchedDoc.section,
                snippet: cit.snippet || matchedDoc.text.slice(0, 100),
                confidence,
                url: matchedDoc.sourceUrl || null
            });
        }

        const currentRetries = retryCount || 0;
        if (!validationPassed && currentRetries >= appConfig.MAX_RETRIES) {
            console.warn(`[Validator] Max retries reached (${currentRetries}). Forcing validation pass.`);
            validationPassed = true;
        }

        return {
            validationPassed,
            validatorFeedback: validationPassed ? '' : feedback,
            finalResponse: validationPassed ? generation : undefined,
            verifiedCitations: validationPassed ? verifiedCitations : [],
            retryCount: currentRetries + (!validationPassed ? 1 : 0)
        };
    } catch (err) {
        console.error("Validator Node error:", err);
        return {
            validationPassed: true,
            validatorFeedback: '',
            finalResponse: generation,
            verifiedCitations: []
        };
    }
}
