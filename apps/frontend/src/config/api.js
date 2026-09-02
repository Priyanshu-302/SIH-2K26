export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  SESSIONS: `${API_BASE_URL}/sessions`,
  CHAT_ASK: `${API_BASE_URL}/chat/ask`,
  DOCUMENTS: `${API_BASE_URL}/documents`,
  DOCUMENT_UPLOAD: (sessionId) => `${API_BASE_URL}/sessions/${sessionId}/documents`,
  DOCUMENT_STATUS: (documentId) => `${API_BASE_URL}/documents/status/${documentId}`,
  HISTORY: (sessionId) => `${API_BASE_URL}/history/${sessionId}`,
};

export const DOCUMENT_CATEGORIES = [
  { id: 'classical_text', label: 'Classical Text (TKDL / Samhita)' },
  { id: 'patent_doc', label: 'Patent Document / Prior Art' },
  { id: 'legal_precedent', label: 'Legal Precedent / Case Law' },
  { id: 'guideline', label: 'Ayush / Statutory Guideline' },
];
