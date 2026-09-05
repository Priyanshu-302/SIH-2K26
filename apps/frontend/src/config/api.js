export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  SESSIONS: `${API_BASE_URL}/sessions`,
  SESSION_DETAIL: (sessionId) => `${API_BASE_URL}/sessions/${sessionId}`,
  CHAT_ASK: `${API_BASE_URL}/chat/ask`,
  DOCUMENTS: `${API_BASE_URL}/documents`,
  DOCUMENT_UPLOAD: (sessionId) => `${API_BASE_URL}/sessions/${sessionId}/documents`,
  DOCUMENT_STATUS: (documentId) => `${API_BASE_URL}/documents/status/${documentId}`,
  HISTORY: (sessionId) => `${API_BASE_URL}/sessions/${sessionId}/history`,
  AUTH_OTP_SEND: `${API_BASE_URL}/auth/otp/send`,
  AUTH_OTP_VERIFY: `${API_BASE_URL}/auth/otp/verify`,
  AUTH_GOOGLE: `${API_BASE_URL}/auth/google`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,
  AUTH_PROFILE: `${API_BASE_URL}/auth/profile`,
};

export const DOCUMENT_CATEGORIES = [
  { id: 'classical_text', label: 'Classical Text (TKDL / Samhita)' },
  { id: 'patent_doc', label: 'Patent Document / Prior Art' },
  { id: 'legal_precedent', label: 'Legal Precedent / Case Law' },
  { id: 'guideline', label: 'Ayush / Statutory Guideline' },
];
