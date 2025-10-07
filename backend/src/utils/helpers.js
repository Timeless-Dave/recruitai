import { nanoid } from 'nanoid';

/**
 * Generate a unique shareable ID for job applications
 */
export function generateShareableId() {
  return nanoid(10); // 10 character unique ID
}

/**
 * Format error response
 */
export function formatError(error) {
  return {
    error: error.message || 'An error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
}

/**
 * Validate file type
 */
export function isValidFileType(filename) {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '.pdf,.doc,.docx')
    .split(',')
    .map(type => type.trim().toLowerCase());
  
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedTypes.includes(ext);
}

/**
 * Validate file size
 */
export function isValidFileSize(size) {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB default
  return size <= maxSize;
}

/**
 * Generate public application URL
 */
export function generateApplicationUrl(shareableId) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${frontendUrl}/apply/${shareableId}`;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/<script[^>]*>.*?<\/script>/gi, '');
}

/**
 * Check if user is authorized for organization
 */
export function isAuthorizedForOrg(user, orgId) {
  return user.orgId === orgId || user.role === 'admin';
}

/**
 * Calculate time remaining for assessment
 */
export function calculateTimeRemaining(startedAt, timeLimit) {
  if (!startedAt || !timeLimit) return null;
  
  const startTime = new Date(startedAt);
  const now = new Date();
  const elapsedMinutes = (now - startTime) / (1000 * 60);
  const remainingMinutes = Math.max(0, timeLimit - elapsedMinutes);
  
  return Math.floor(remainingMinutes);
}

/**
 * Format application data for export
 */
export function formatApplicationForExport(applicant, score) {
  return {
    Name: applicant.name,
    Email: applicant.email,
    Phone: applicant.phone || 'N/A',
    'Application Date': new Date(applicant.createdAt).toLocaleDateString(),
    'Final Score': score?.finalScore || 'N/A',
    Rank: score?.rank || 'N/A',
    Percentile: score?.percentile ? `${score.percentile}%` : 'N/A',
    Status: score?.status || 'pending'
  };
}

/**
 * Parse pagination parameters
 */
export function parsePaginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

/**
 * Build pagination response
 */
export function buildPaginationResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages
    }
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate random password (for temporary accounts)
 */
export function generatePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Delay execution (for rate limiting)
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}



