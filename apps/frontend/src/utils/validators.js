export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx', '.txt'];
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * Validates file format and size
 * @param {File} file
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateUploadFile(file) {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_FILE_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed formats: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: 'File size exceeds maximum allowed limit (50MB)',
    };
  }

  return { isValid: true, error: null };
}
