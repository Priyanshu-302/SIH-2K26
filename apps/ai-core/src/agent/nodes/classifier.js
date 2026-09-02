import { ChatGroq } from "@langchain/groq";
import { config } from "../../config/index.js";
import { loadPromptTemplate } from "../../utils/prompts.js";
import { z } from "zod";

const classificationSchema = z.object({
    classification: z.enum(["classical_knowledge", "patentability", "general"]),
    reasoning: z.string()
});

export async function classifierNode(state) {
    const { query } = state;

    const template = loadPromptTemplate('classifier.txt');
    const formattedPrompt = template.replace('{query}', query);

    const model = new ChatGroq({
        apiKey: config.GROQ_API_KEY,
        model: "openai/gpt-oss-20b",
        modelName: "openai/gpt-oss-20b",
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
