import path from 'path';

// Allowed file types for uploads
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'text/csv'
];

// Maximum file sizes (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

/**
 * Validates and sanitizes uploaded files
 */
export function validateImageFile(
  file: { mimetype: string; originalname: string; size: number }
): FileValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `File too large. Maximum size: ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
    };
  }

  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.originalname);
  
  return {
    isValid: true,
    sanitizedFilename
  };
}

/**
 * Validates document files (Excel, CSV)
 */
export function validateDocumentFile(
  file: { mimetype: string; originalname: string; size: number }
): FileValidationResult {
  // Check file type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_DOCUMENT_TYPES.join(', ')}`
    };
  }

  // Check file size
  if (file.size > MAX_DOCUMENT_SIZE) {
    return {
      isValid: false,
      error: `File too large. Maximum size: ${MAX_DOCUMENT_SIZE / (1024 * 1024)}MB`
    };
  }

  const sanitizedFilename = sanitizeFilename(file.originalname);
  
  return {
    isValid: true,
    sanitizedFilename
  };
}

/**
 * Sanitizes filename to prevent directory traversal and other attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  let sanitized = filename.replace(/[\/\\:\*\?"<>\|]/g, '');
  
  // Remove leading dots and spaces
  sanitized = sanitized.replace(/^[.\s]+/, '');
  
  // Limit length
  if (sanitized.length > 100) {
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext);
    sanitized = name.substring(0, 100 - ext.length) + ext;
  }
  
  // Ensure we have a valid filename
  if (!sanitized || sanitized === '') {
    sanitized = `file_${Date.now()}`;
  }
  
  return sanitized;
}

/**
 * Validates and sanitizes file paths to prevent directory traversal
 */
export function validateFilePath(filePath: string, allowedDirectory: string): boolean {
  const resolvedPath = path.resolve(filePath);
  const resolvedAllowedDir = path.resolve(allowedDirectory);
  
  // Check if the resolved path is within the allowed directory
  return resolvedPath.startsWith(resolvedAllowedDir);
}