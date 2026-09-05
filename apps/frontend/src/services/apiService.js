import { API_ENDPOINTS } from '../config/api';

/**
 * Returns authorization headers containing current user JWT token if logged in
 * @param {Object} [extraHeaders] 
 * @returns {Object} Headers object
 */
export function getAuthHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ayur_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

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
 * Request an email OTP verification code
 * @param {string} email 
 * @returns {Promise<{ success: boolean, message: string, simulated?: boolean }>}
 */
export async function sendOtpAPI(email) {
  const res = await fetch(API_ENDPOINTS.AUTH_OTP_SEND, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.details || data.error || 'Failed to dispatch verification code');
  }
  return data;
}

/**
 * Verify OTP and login user
 * @param {string} email 
 * @param {string} otp 
 * @param {string} [name] 
 * @param {string} [role] 
 * @returns {Promise<{ success: boolean, token: string, user: Object }>}
 */
export async function verifyOtpAPI(email, otp, name, role) {
  const res = await fetch(API_ENDPOINTS.AUTH_OTP_VERIFY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, name, role }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.details || data.error || 'Verification failed');
  }
  return data;
}

/**
 * Authenticate via Google OAuth
 * @param {Object} payload { credential, email, name, avatar }
 * @returns {Promise<{ success: boolean, token: string, user: Object }>}
 */
export async function googleAuthAPI(payload) {
  const res = await fetch(API_ENDPOINTS.AUTH_GOOGLE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.details || data.error || 'Google login failed');
  }
  return data;
}

/**
 * Fetch current authenticated user details from backend
 * @returns {Promise<{ user: Object }>}
 */
export async function fetchCurrentUserAPI() {
  const res = await fetch(API_ENDPOINTS.AUTH_ME, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to retrieve user profile');
  }
  return await res.json();
}

/**
 * Updates current authenticated user profile
 * @param {Object} data { name, role }
 * @returns {Promise<{ success: boolean, user: Object }>}
 */
export async function updateProfileAPI(data) {
  const res = await fetch(API_ENDPOINTS.AUTH_PROFILE, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.details || body.error || 'Failed to update profile');
  }
  return body;
}

/**
 * Creates a new chat session on the backend
 * @returns {Promise<{ sessionId: string }>}
 */
export async function createSessionAPI(title = 'New Ayurvedic IP Assessment') {
  try {
    const res = await fetch(API_ENDPOINTS.SESSIONS, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title }),
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
 * Uploads a document for ingestion
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
      headers: getAuthHeaders(),
      body: formData,
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.info('[Ayur-IP Preview Mode] Backend offline, simulating ingestion pipeline.');
  }

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
 * Polls the status of an ingested document
 * @param {string} documentId 
 * @returns {Promise<{ documentId: string, filename: string, status: string, progress: number, error: string|null }>}
 */
export async function pollDocumentStatusAPI(documentId) {
  try {
    const res = await fetch(API_ENDPOINTS.DOCUMENT_STATUS(documentId), {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}

  return {
    documentId,
    filename: 'Sample_Manuscript.pdf',
    status: 'completed',
    progress: 100,
    error: null,
  };
}

/**
 * Fetches list of ingested documents
 * @returns {Promise<Array<{ documentId: string, filename: string, category: string, uploadedAt: string, chunkCount: number, status: string }>>}
 */
export async function fetchDocumentsAPI() {
  try {
    const res = await fetch(API_ENDPOINTS.DOCUMENTS, {
      headers: getAuthHeaders(),
    });
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
    const res = await fetch(API_ENDPOINTS.HISTORY(sessionId), {
      headers: getAuthHeaders(),
    });
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
    const res = await fetch(API_ENDPOINTS.SESSIONS, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Fetch Sessions Warning]:', err.message);
  }
  return [];
}

/**
 * Renames a session title on the backend
 * @param {string} sessionId
 * @param {string} title
 * @returns {Promise<{ id: string, title: string, updatedAt: string }>}
 */
export async function renameSessionAPI(sessionId, title) {
  const res = await fetch(API_ENDPOINTS.SESSION_DETAIL(sessionId), {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ title }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.details || data.error || 'Failed to rename assessment session');
  }
  return data;
}

/**
 * Deletes a session and its associated messages
 * @param {string} sessionId
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteSessionAPI(sessionId) {
  const res = await fetch(API_ENDPOINTS.SESSION_DETAIL(sessionId), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.details || data.error || 'Failed to delete assessment session');
  }
  return data;
}

