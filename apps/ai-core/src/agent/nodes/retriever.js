import { qdrant } from '../../vectorstore/qdrant-client.js';
import { COLLECTION_NAME } from '../../vectorstore/schema.js';
import { embedText } from '../../vectorstore/embeddings.js';
import { config } from '../../config/index.js';

/**
 * Retriever node that runs semantic search against Qdrant.
 * Populates 'retrievedDocuments' in the agent state.
 */
export async function retrieverNode(state) {
  const { query, classification } = state;

  try {
    // Generate vector embedding for the search query
    const vector = await embedText(query);

    // Optional metadata filtering:
    // If classification is classical_knowledge, filter or prioritize classical_text.
    // If classification is patentability, check patent_doc or legal_precedent.
    const filter = {};
    if (classification === 'classical_knowledge') {
      filter.must = [{ key: 'category', match: { value: 'classical_text' } }];
    } else if (classification === 'patentability') {
      filter.should = [
        { key: 'category', match: { value: 'patent_doc' } },
        { key: 'category', match: { value: 'legal_precedent' } }
      ];
    }

    // Query Qdrant
    const searchParams = {
      vector,
      limit: config.TOP_K,
      with_payload: true
    };

    if (Object.keys(filter).length > 0) {
      searchParams.filter = filter;
    }

    const results = await qdrant.search(COLLECTION_NAME, searchParams);

    const documents = results.map((hit) => ({
      id: hit.id,
      text: hit.payload?.text || '',
      source: hit.payload?.source || 'Unknown Source',
      category: hit.payload?.category || 'guideline',
      section: hit.payload?.section || 'N/A',
      title: hit.payload?.title || 'Untitled',
      sourceUrl: hit.payload?.sourceUrl || null,
      score: hit.score
    }));

    return {
      retrievedDocuments: documents
    };
  } catch (err) {
    console.error("Retriever node search failed:", err);
    return {
      retrievedDocuments: []
    };
  }
}
