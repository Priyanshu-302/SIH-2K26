/**
 * Format ISO date string into human readable format
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format bytes to readable string (e.g. 2.4 MB)
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Canonical category label map
 */
export const CATEGORY_LABELS = {
  classical_text: 'Classical Text (TKDL / Samhita)',
  patent_doc: 'Patent Document / Prior Art',
  legal_precedent: 'Legal Precedent / Case Law',
  guideline: 'Statutory Guideline',
};

export function getCategoryLabel(categoryKey) {
  return CATEGORY_LABELS[categoryKey] || categoryKey?.replace('_', ' ') || 'General';
}
