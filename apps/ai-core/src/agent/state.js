import { Annotation } from "@langchain/langgraph";

/**
 * State schema definition for the Ayurveda IP classification agent workflow.
 * Uses Annotation.Root and Annotation() to define channels in LangGraph.js.
 */
export const AgentState = Annotation.Root({
    // Inputs
    query: Annotation(),
    chatHistory: Annotation(), // BaseMessage[] or array of message objects

    // Node Outputs & Intermediates
    classification: Annotation(),        // "classical_knowledge" | "patentability" | "general"
    classificationReasoning: Annotation(), // Justification for the classification

    retrievedDocuments: Annotation(),        // Array of retrieved document chunks from vector store

    generation: Annotation(),              // Current response text draft

    // Validation State
    validatorFeedback: Annotation(),       // Correction guidelines if validation fails
    validationPassed: Annotation(),       // Groundedness evaluation result
    retryCount: Annotation(),              // Number of generator retries

    // Final Outputs
    finalResponse: Annotation(),           // Final response to be returned
    verifiedCitations: Annotation(),          // List of canonical Citation objects
});
