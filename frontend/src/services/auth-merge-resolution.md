# Auth Service Merge Conflict Resolution

## Overview

This document explains the changes made to resolve the merge conflict in `frontend/src/services/auth.ts`. The conflict arose from two different implementations of the authentication service:

1. The original implementation in `frontend/src/services/auth.ts` - A simple token-based authentication service
2. Another implementation in `frontend/src/auth/services/authService.ts` - A more sophisticated authentication service with additional features

The merged implementation preserves the core functionality from both branches while ensuring compatibility with the existing AuthProvider and LoginForm components.

## Key Changes

### 1. Enhanced User Context

The `UserContext` interface has been expanded to include additional fields:

```typescript
export interface UserContext {
  id: string;
  email: string;
  role: Role;
  clientId?: string;
  brandId?: string;
  username?: string;     // Added to support username-based login
  firstName?: string;    // Added from the other implementation
  lastName?: string;     // Added from the other implementation
  permissions?: string[]; // Added from the other implementation
}
```

### 2. Support for Email and Username Login

The login credentials interface now supports both email and username:

```typescript
export interface LoginCredentials {
  emailOrUsername: string; // Changed to support both email and username
  password: string;
}
```

The login function has been updated to handle both email and username inputs:

```typescript
const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // ...
  // Support both email and username login by sending both fields
  body: JSON.stringify({
    email: credentials.emailOrUsername,
    username: credentials.emailOrUsername,
    password: credentials.password
  }),
  // ...
}
```

### 3. Token Refresh Functionality

Added support for refresh tokens:

```typescript
// Refresh token management
const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

const setRefreshToken = (token: string): void => {
  localStorage.setItem('refresh_token', token);
};

const removeRefreshToken = (): void => {
  localStorage.removeItem('refresh_token');
};

// Refresh the authentication token
const refreshAuthToken = async (): Promise<AuthResponse | null> => {
  // Implementation...
}
```

### 4. Additional Authentication Features

Added several new functions from the other implementation:

- `register` - For user registration
- `requestPasswordReset` - For password reset requests
- `verifyAuth` - For verifying authentication status
- `hasPermission` - For checking user permissions

### 5. Environment-Aware Implementation

The service now behaves differently based on the environment:

- In development mode with `REACT_APP_USE_MOCK_AUTH=true`, it uses mock data
- In production mode, it makes real API calls

```typescript
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
  // Mock implementation
} else {
  // Real API implementation
}
```

### 6. Updated Component Integration

The `AuthProvider` and `LoginForm` components have been updated to work with the new auth service:

- `AuthProvider` now calls `login({ emailOrUsername: email, password })` instead of `login({ email, password })`
- `LoginForm` now accepts and validates both email and username inputs

## Usage Examples

### Login with Email

```typescript
const response = await authService.login({
  emailOrUsername: 'user@example.com',
  password: '${AUTH_MERGE_RESOLUTION_SECRET_1}'
});
```

### Login with Username

```typescript
const response = await authService.login({
  emailOrUsername: 'username',
  password: '${AUTH_MERGE_RESOLUTION_SECRET_1}'
});
```

### Get Current User

```typescript
const user = await authService.getCurrentUser();
if (user) {
  // User is authenticated
  console.log(`Hello, ${user.firstName || user.email}!`);
} else {
  // User is not authenticated
  // Redirect to login page
}
```

### Check Permissions

```typescript
const canEditUsers = authService.hasPermission('users:edit');
if (canEditUsers) {
  // Show edit user button
}
```

## Testing

Comprehensive unit tests have been added in `frontend/src/services/__tests__/auth.test.ts` to ensure the merged implementation works correctly. The tests cover:

- Login with email and username
- Token management
- User authentication status
- Token refresh
- Error handling

## Next Steps

1. Update any other components that directly use the auth service to work with the new implementation
2. Consider adding more sophisticated token management (e.g., automatic refresh on expiration)
3. Implement proper error handling for network issues
4. Add support for additional authentication methods (e.g., SSO, MFA)