/**
 * Input Validation and Sanitization Utilities
 * Provides comprehensive security validation for user inputs
 */

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
}

export interface ValidationOptions {
  maxLength?: number;
  allowHtml?: boolean;
  allowSpecialChars?: boolean;
  maxMessagesPerMinute?: number;
}

/**
 * Comprehensive input validation and sanitization
 */
export function validateAndSanitizeMessage(
  input: string,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    maxLength = 1000,
    allowHtml = false,
    allowSpecialChars = true,
    maxMessagesPerMinute = 10
  } = options;

  const errors: string[] = [];
  let sanitizedValue = input;

  // Check if input is empty
  if (!input || typeof input !== 'string') {
    errors.push('Message cannot be empty');
    return { isValid: false, sanitizedValue: '', errors };
  }

  // Check message length (using byte size for accurate measurement)
  const messageSize = new Blob([input]).size;
  if (messageSize > maxLength) {
    errors.push(`Message too long. Maximum ${maxLength} characters allowed.`);
    return { isValid: false, sanitizedValue: input, errors };
  }

  // Normalize Unicode to prevent Unicode-based attacks
  sanitizedValue = sanitizedValue.normalize('NFKC');

  // Remove null bytes and control characters
  sanitizedValue = sanitizedValue.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  // Convert fullwidth characters to halfwidth to prevent bypass attempts
  sanitizedValue = sanitizedValue.replace(/[\uFF01-\uFF5E]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
  });

  // Check for XSS patterns
  if (containsXSSPatterns(sanitizedValue)) {
    errors.push('Message contains potentially harmful content');
  }

  // Check for SQL injection patterns
  if (containsSQLInjectionPatterns(sanitizedValue)) {
    errors.push('Message contains potentially harmful database commands');
  }

  // Sanitize HTML if not allowed
  if (!allowHtml) {
    sanitizedValue = sanitizeHTML(sanitizedValue);
  }

  // Additional security checks
  if (containsPolyglotAttack(sanitizedValue)) {
    errors.push('Message contains potentially harmful mixed-context content');
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors
  };
}

/**
 * Validate session ID format
 */
export function validateSessionId(sessionId: string): boolean {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }

  // Session ID should be alphanumeric with hyphens and underscores, 1-64 characters
  const sessionIdRegex = /^[a-zA-Z0-9_-]{1,64}$/;
  return sessionIdRegex.test(sessionId);
}

/**
 * Rate limiting validation
 */
// Fix LS5_004: Enhanced Rate Limiter with advanced security features
export class RateLimiter {
  private messageHistory: Map<string, number[]> = new Map();
  private suspiciousActivity: Map<string, { count: number; lastActivity: number }> = new Map();
  private blockedSessions: Set<string> = new Set();
  private readonly windowMs = 60000; // 1 minute
  private readonly suspiciousThreshold = 50; // Messages per minute to flag as suspicious
  private readonly blockDuration = 300000; // 5 minutes block duration

  public isRateLimited(sessionId: string, maxMessages: number = 10): boolean {
    const now = Date.now();
    
    // Check if session is blocked
    if (this.blockedSessions.has(sessionId)) {
      return true;
    }
    
    const history = this.messageHistory.get(sessionId) || [];
    
    // Remove old entries outside the time window
    const recentMessages = history.filter(timestamp => now - timestamp < this.windowMs);
    
    // Update history
    this.messageHistory.set(sessionId, recentMessages);
    
    // Check for suspicious activity
    if (recentMessages.length >= this.suspiciousThreshold) {
      this.flagSuspiciousActivity(sessionId);
    }
    
    return recentMessages.length >= maxMessages;
  }

  public recordMessage(sessionId: string): void {
    const now = Date.now();
    const history = this.messageHistory.get(sessionId) || [];
    history.push(now);
    this.messageHistory.set(sessionId, history);
    
    // Update suspicious activity tracking
    const suspicious = this.suspiciousActivity.get(sessionId);
    if (suspicious) {
      suspicious.count++;
      suspicious.lastActivity = now;
    } else {
      this.suspiciousActivity.set(sessionId, { count: 1, lastActivity: now });
    }
  }

  private flagSuspiciousActivity(sessionId: string): void {
    console.warn(`Suspicious activity detected for session: ${sessionId}`);
    this.blockedSessions.add(sessionId);
    
    // Auto-unblock after block duration
    setTimeout(() => {
      this.blockedSessions.delete(sessionId);
      this.suspiciousActivity.delete(sessionId);
    }, this.blockDuration);
  }

  public isSessionBlocked(sessionId: string): boolean {
    return this.blockedSessions.has(sessionId);
  }

  public getSessionRisk(sessionId: string): 'low' | 'medium' | 'high' {
    const history = this.messageHistory.get(sessionId) || [];
    const recentMessages = history.filter(timestamp => Date.now() - timestamp < this.windowMs);
    
    if (recentMessages.length > 30) return 'high';
    if (recentMessages.length > 15) return 'medium';
    return 'low';
  }

  public cleanup(): void {
    const now = Date.now();
    
    // Clean up message history
    for (const [sessionId, history] of this.messageHistory.entries()) {
      const recentMessages = history.filter(timestamp => now - timestamp < this.windowMs);
      if (recentMessages.length === 0) {
        this.messageHistory.delete(sessionId);
      } else {
        this.messageHistory.set(sessionId, recentMessages);
      }
    }
    
    // Clean up suspicious activity tracking
    for (const [sessionId, activity] of this.suspiciousActivity.entries()) {
      if (now - activity.lastActivity > this.windowMs * 5) { // 5 minutes
        this.suspiciousActivity.delete(sessionId);
      }
    }
  }
}

/**
 * Detect XSS patterns
 */
function containsXSSPatterns(input: string): boolean {
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<svg[\s\S]*?>/gi,
    /onerror\s*=/gi,
    /<object[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi,
    /<link[\s\S]*?>/gi,
    /<style[\s\S]*?>[\s\S]*?<\/style>/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
    /data:text\/html/gi
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect SQL injection patterns
 */
function containsSQLInjectionPatterns(input: string): boolean {
  const sqlPatterns = [
    /DROP\s+TABLE/gi,
    /INSERT\s+INTO/gi,
    /DELETE\s+FROM/gi,
    /UNION\s+SELECT/gi,
    /EXEC\s+xp_cmdshell/gi,
    /'\s*OR\s*'1'\s*=\s*'1/gi,
    /'\s*OR\s*1\s*=\s*1/gi,
    /--/g,
    /;.*?--/g,
    /\/\*.*?\*\//g,
    /INFORMATION_SCHEMA/gi,
    /LOAD_FILE/gi,
    /INTO\s+OUTFILE/gi
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect polyglot attacks (mixed-context attacks)
 */
function containsPolyglotAttack(input: string): boolean {
  const polyglotPatterns = [
    /javascript:.*?alert\s*\(/gi,
    /on\w+\s*=.*?alert\s*\(/gi,
    /<.*?onerror.*?=/gi,
    /confirm\s*\(/gi,
    /prompt\s*\(/gi,
    /document\.cookie/gi,
    /window\.location/gi,
    /eval\s*\(/gi
  ];

  return polyglotPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize HTML content
 */
function sanitizeHTML(input: string): string {
  let sanitized = input;

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

  // Remove dangerous tags
  sanitized = sanitized.replace(/<(iframe|object|embed|link|style|svg|form|input|button)[^>]*>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Encode HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * Decode HTML entities for processing
 */
function decodeHTMLEntities(input: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = input;
  return textarea.value;
}

/**
 * Global rate limiter instance
 */
export const globalRateLimiter = new RateLimiter();

// Cleanup rate limiter every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    globalRateLimiter.cleanup();
  }, 5 * 60 * 1000);
}