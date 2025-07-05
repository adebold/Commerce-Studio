export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationResult {
  private errors: ValidationError[] = [];

  addError(field: string, message: string): void {
    this.errors.push({ field, message });
  }

  isEmpty(): boolean {
    return this.errors.length === 0;
  }

  array(): ValidationError[] {
    return this.errors;
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function validateLoginRequest(body: any): ValidationResult {
  const result = new ValidationResult();

  if (!body.email) {
    result.addError('email', 'Email is required');
  } else if (!validateEmail(body.email)) {
    result.addError('email', 'Invalid email format');
  }

  if (!body.password) {
    result.addError('password', 'Password is required');
  }

  return result;
}

export function validateRefreshTokenRequest(body: any): ValidationResult {
  const result = new ValidationResult();

  if (!body.refreshToken) {
    result.addError('refreshToken', 'Refresh token is required');
  }

  return result;
}

export function validateRegisterRequest(body: any): ValidationResult {
  const result = new ValidationResult();

  if (!body.email) {
    result.addError('email', 'Email is required');
  } else if (!validateEmail(body.email)) {
    result.addError('email', 'Invalid email format');
  }

  if (!body.password) {
    result.addError('password', 'Password is required');
  } else if (!validatePassword(body.password)) {
    result.addError('password', 'Password must be at least 8 characters with uppercase, lowercase, and number');
  }

  if (body.firstName && typeof body.firstName !== 'string') {
    result.addError('firstName', 'First name must be a string');
  }

  if (body.lastName && typeof body.lastName !== 'string') {
    result.addError('lastName', 'Last name must be a string');
  }

  return result;
}

export function validateChangePasswordRequest(body: any): ValidationResult {
  const result = new ValidationResult();

  if (!body.currentPassword) {
    result.addError('currentPassword', 'Current password is required');
  }

  if (!body.newPassword) {
    result.addError('newPassword', 'New password is required');
  } else if (!validatePassword(body.newPassword)) {
    result.addError('newPassword', 'New password must be at least 8 characters with uppercase, lowercase, and number');
  }

  return result;
}

export function validateUpdateProfileRequest(body: any): ValidationResult {
  const result = new ValidationResult();

  if (body.email && !validateEmail(body.email)) {
    result.addError('email', 'Invalid email format');
  }

  if (body.firstName && typeof body.firstName !== 'string') {
    result.addError('firstName', 'First name must be a string');
  }

  if (body.lastName && typeof body.lastName !== 'string') {
    result.addError('lastName', 'Last name must be a string');
  }

  return result;
}