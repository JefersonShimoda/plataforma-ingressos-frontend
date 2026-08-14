/**
 * Security & Sanitization Utilities
 */

/**
 * Validate that an image URL uses secure protocols (http/https) and blocks javascript: or data: URIs
 */
export const isSafeImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  // Disallow javascript: or vbscript: or malicious protocols
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:text/html') || trimmed.startsWith('vbscript:')) {
    return false;
  }
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/');
};

/**
 * Fallback image when an image fails to load or is invalid
 */
export const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80';

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
};

/**
 * Validate password strength (at least 6 characters)
 */
export const isValidPassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'A senha deve ter no mínimo 6 caracteres.' };
  }
  return { valid: true };
};

/**
 * Sanitize integer ID parameters to prevent path traversal / injection
 */
export const parseSafeId = (id: string | undefined): number | null => {
  if (!id) return null;
  const parsed = parseInt(id, 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : null;
};
