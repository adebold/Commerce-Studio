/**
 * Custom error classes for authentication service
 */

export class AuthError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 401, code: string = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.code = code;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }
}

export class ValidationError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly field?: string | undefined;

  constructor(message: string, field?: string, statusCode: number = 400, code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

export class DatabaseError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'DATABASE_ERROR') {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = statusCode;
    this.code = code;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}

export class RateLimitError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly retryAfter?: number | undefined;

  constructor(message: string, retryAfter?: number, statusCode: number = 429, code: string = 'RATE_LIMIT_ERROR') {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = statusCode;
    this.code = code;
    this.retryAfter = retryAfter;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError);
    }
  }
}

export class TokenError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 401, code: string = 'TOKEN_ERROR') {
    super(message);
    this.name = 'TokenError';
    this.statusCode = statusCode;
    this.code = code;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TokenError);
    }
  }
}

/**
 * Error handler utility functions
 */
export class ErrorHandler {
  /**
   * Check if error is operational (expected) vs programming error
   */
  static isOperationalError(error: Error): boolean {
    return error instanceof AuthError ||
           error instanceof ValidationError ||
           error instanceof DatabaseError ||
           error instanceof RateLimitError ||
           error instanceof TokenError;
  }

  /**
   * Get appropriate HTTP status code for error
   */
  static getStatusCode(error: Error): number {
    if (error instanceof AuthError ||
        error instanceof ValidationError ||
        error instanceof DatabaseError ||
        error instanceof RateLimitError ||
        error instanceof TokenError) {
      return error.statusCode;
    }
    
    return 500; // Internal server error for unknown errors
  }

  /**
   * Get error code for logging and client response
   */
  static getErrorCode(error: Error): string {
    if (error instanceof AuthError ||
        error instanceof ValidationError ||
        error instanceof DatabaseError ||
        error instanceof RateLimitError ||
        error instanceof TokenError) {
      return error.code;
    }
    
    return 'INTERNAL_ERROR';
  }

  /**
   * Format error for client response (hide sensitive details in production)
   */
  static formatErrorResponse(error: Error, includeStack: boolean = false) {
    const isOperational = this.isOperationalError(error);
    
    return {
      error: {
        message: isOperational ? error.message : 'Internal server error',
        code: this.getErrorCode(error),
        statusCode: this.getStatusCode(error),
        ...(includeStack && { stack: error.stack }),
        ...(error instanceof ValidationError && error.field && { field: error.field }),
        ...(error instanceof RateLimitError && error.retryAfter && { retryAfter: error.retryAfter }),
      },
    };
  }
}