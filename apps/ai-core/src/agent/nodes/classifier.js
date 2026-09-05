import { ChatGroq } from "@langchain/groq";
import { config } from "../../config/index.js";
import { loadPromptTemplate } from "../../utils/prompts.js";
import { z } from "zod";

const classificationSchema = z.object({
    classification: z.enum(["classical_knowledge", "patentability", "general"]),
    reasoning: z.string()
});

const PATENT_KEYWORDS = /\b(patent|patentable|patentability|section\s*3|prior\s*art|claims?|infringe|synerg|biological\s*diversity|nba)\b/i;
const CLASSICAL_KEYWORDS = /\b(charaka|sushruta|samhita|tkdl|classical|rasayana|bhasma|shloka|ayurvedic\s*formulation)\b/i;

export async function classifierNode(state) {
    const { query = '' } = state;

    // Fast-path 1: Zero-token regex triage for unambiguous queries
    if (PATENT_KEYWORDS.test(query)) {
        return {
            classification: "patentability",
            classificationReasoning: "Zero-token rule match: Query contains patent legal keywords."
        };
    }
    if (CLASSICAL_KEYWORDS.test(query)) {
        return {
            classification: "classical_knowledge",
            classificationReasoning: "Zero-token rule match: Query contains classical Ayurvedic keywords."
        };
    }

    // Fallback: Ultra-lightweight, high-speed LLM classifier (llama-3.1-8b-instant)
    const template = loadPromptTemplate('classifier.txt');
    const formattedPrompt = template.replace('{query}', query);

    const model = new ChatGroq({
        apiKey: config.GROQ_API_KEY,
        model: "llama-3.1-8b-instant",
        modelName: "llama-3.1-8b-instant",
        temperature: 0,
    }).withStructuredOutput(classificationSchema);

    try {
        const response = await model.invoke([
            { role: "user", content: formattedPrompt }
        ]);

        return {
            classification: response.classification,
            classificationReasoning: response.reasoning
        };
    } catch (err) {
        console.error("Error in Classifier Node:", err);
        return {
            classification: "general",
            classificationReasoning: "Fallback due to classification error: " + err.message
        };
    }
}

