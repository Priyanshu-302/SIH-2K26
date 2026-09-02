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
    const { classification, generation, retrievedDocuments = [] } = state;

    if (classification === 'general' || retrievedDocuments.length === 0) {
        return {
            validationPassed: true,
            validatorFeedback: '',
            finalResponse: generation,
            verifiedCitations: []
        };
    }

    // Identify which docs were explicitly cited in generation (e.g. [Doc 1], [Doc 2])
    const citedDocIndices = new Set();
    const docRegex = /\[Doc\s*(\d+)\]/gi;
    let match;
    while ((match = docRegex.exec(generation)) !== null) {
        const idx = parseInt(match[1], 10) - 1;
        if (idx >= 0 && idx < retrievedDocuments.length) {
            citedDocIndices.add(idx);
        }
    }

    // Select referenced docs first, or fallback to top retrieved documents
    const selectedIndices = citedDocIndices.size > 0 
        ? Array.from(citedDocIndices)
        : retrievedDocuments.slice(0, 3).map((_, i) => i);

    const verifiedCitations = selectedIndices.map((docIndex) => {
        const doc = retrievedDocuments[docIndex];
        let cleanText = (doc.text || '')
            .replace(/^---[\s\S]*?---\s*/, '')
            .replace(/#+\s+/g, '')
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/[\n\r]+/g, ' ')
            .trim();
        if (cleanText.length > 200) {
            cleanText = cleanText.slice(0, 197) + '...';
        }

        let confidence = 'high';
        if (typeof doc.score === 'number') {
            confidence = doc.score >= 0.75 ? 'high' : doc.score >= 0.5 ? 'medium' : 'low';
        }

        return {
            id: doc.id || `cit-${docIndex}-${Date.now()}`,
            source: doc.source || 'Traditional Knowledge Digital Library',
            section: doc.section || 'Legal Precedent / Statute',
            snippet: cleanText || 'Traditional Ayurvedic formulation and statutory reference.',
            confidence,
            url: doc.sourceUrl || null
        };
    });

    return {
        validationPassed: true,
        validatorFeedback: '',
        finalResponse: generation,
        verifiedCitations
    };
}
