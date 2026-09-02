import { API_ENDPOINTS } from '../config/api';

// In-memory mock store for offline preview mode
let mockDocuments = [
  {
    documentId: '65b90f48f4384a6c8c4a92c1',
    filename: 'Caraka_Samhita_Vimana_Sthana.pdf',
    category: 'classical_text',
    uploadedAt: '2026-08-25T10:30:00Z',
    chunkCount: 12310,
    status: 'completed',
  },
  {
    documentId: '65b90f48f4384a6c8c4a92c2',
    filename: 'Indian_Patents_Act_1970_Section_3p.pdf',
    category: 'legal_precedent',
    uploadedAt: '2026-08-24T14:15:00Z',
    chunkCount: 4500,
    status: 'completed',
  },
  {
    documentId: '65b90f48f4384a6c8c4a92c3',
    filename: 'Sushruta_Samhita_Sharira.pdf',
    category: 'classical_text',
    uploadedAt: '2026-08-23T09:00:00Z',
    chunkCount: 10122,
    status: 'completed',
  },
  {
    documentId: '65b90f48f4384a6c8c4a92c4',
    filename: 'Herbal_Patent_Guidelines_PCT.pdf',
    category: 'patent_doc',
    uploadedAt: '2026-08-22T16:45:00Z',
    chunkCount: 7850,
    status: 'completed',
  },
];

/**
 * Creates a new chat session on the backend (with offline mock fallback)
 * @returns {Promise<{ sessionId: string }>}
 */
export async function createSessionAPI() {
  try {
    const res = await fetch(API_ENDPOINTS.SESSIONS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Ayurvedic IP Assessment' }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.info('[Ayur-IP Preview Mode] Backend offline, using client-generated session ID.');
  }

  // Fallback: Return 24-character hexadecimal ObjectId
  return { sessionId: '60b8d2f1f1d2e825a07d' + Math.random().toString(16).slice(2, 6) };
}

/**
 * Uploads a document for ingestion (with offline mock fallback)
 * @param {string} sessionId 
 * @param {File} file 
 * @param {string} category 
 * @param {string} [title] 
 * @returns {Promise<{ documentId: string, status: string }>}
 */
export async function uploadDocumentAPI(sessionId, file, category, title) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (title) formData.append('title', title);

    const res = await fetch(API_ENDPOINTS.DOCUMENT_UPLOAD(sessionId), {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.info('[Ayur-IP Preview Mode] Backend offline, simulating ingestion pipeline.');
  }

  // Fallback: add to mock document store and return mock documentId
  const documentId = '65b90f48f4384a6c8c4a' + Math.random().toString(16).slice(2, 6);
  mockDocuments.unshift({
    documentId,
    filename: file.name,
    title: title || file.name,
    category,
    uploadedAt: new Date().toISOString(),
    chunkCount: Math.floor(Math.random() * 50) + 15,
    status: 'completed',
  });

  return { documentId, status: 'PENDING' };
}

/**
 * Polls the status of an ingested document (with offline mock fallback)
 * @param {string} documentId 
 * @returns {Promise<{ documentId: string, filename: string, status: string, progress: number, error: string|null }>}
 */
export async function pollDocumentStatusAPI(documentId) {
  try {
    const res = await fetch(API_ENDPOINTS.DOCUMENT_STATUS(documentId));
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline simulation
  }

  return {
    documentId,
    filename: 'Sample_Manuscript.pdf',
    status: 'completed',
    progress: 100,
    error: null,
  };
}

/**
 * Fetches list of ingested documents (with offline mock fallback)
 * @returns {Promise<Array<{ documentId: string, filename: string, category: string, uploadedAt: string, chunkCount: number, status: string }>>}
 */
export async function fetchDocumentsAPI() {
  try {
    const res = await fetch(API_ENDPOINTS.DOCUMENTS);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.info('[Ayur-IP Preview Mode] Backend offline, displaying default repository texts.');
  }

  return [...mockDocuments];
}

/**
 * Fetches message history for a session from the backend
 * @param {string} sessionId
 * @returns {Promise<Array<Object>>}
 */
export async function fetchSessionHistoryAPI(sessionId) {
  try {
    const res = await fetch(API_ENDPOINTS.HISTORY(sessionId));
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Fetch History Warning]:', err.message);
  }
  return [];
}

/**
 * Fetches all past assessment sessions from the backend
 * @returns {Promise<Array<{ id: string, title: string, createdAt: string, updatedAt: string }>>}
 */
export async function fetchSessionsAPI() {
  try {
    const res = await fetch(API_ENDPOINTS.SESSIONS);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Fetch Sessions Warning]:', err.message);
  }
  return [];
}
