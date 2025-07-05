# Authentication Provider Merge Resolution

This document explains the approach taken to resolve the merge conflict in the `AuthProvider.tsx` file and provides guidance on using the merged implementation.

## Overview of Changes

The merge conflict involved two different implementations of the `AuthProvider` component:

1. **HEAD Branch**: Focused on basic authentication with login/logout functionality, loading and error state management.
2. **origin/master Branch**: Included role-based access control (RBAC) and resource-based access control.

The merged implementation preserves the core functionality from both branches while ensuring consistency and compatibility with the rest of the application.

## Key Features of the Merged Implementation

### 1. Authentication Functionality

- **Login**: Supports both email and username-based login
- **Logout**: Provides a consistent logout experience
- **Authentication State**: Maintains loading and error states for better UX
- **Auth Checking**: Includes a `checkAuth` function to verify authentication status

### 2. Access Control

- **Role-Based Access Control**: Implemented through the `hasRole` function
- **Resource-Based Access Control**: Implemented through the `hasAccess` function
- **RBAC Component**: A reusable component for conditional rendering based on user roles and permissions

### 3. Navigation

- **Protected Routes**: Redirects unauthenticated users away from protected routes
- **Role-Based Redirection**: Redirects users to appropriate dashboards based on their roles

## Using the AuthProvider

### Basic Usage

Wrap your application with the `AuthProvider` component:

```tsx
import { AuthProvider } from './components/auth/AuthProvider';

const App = () => {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
};
```

### Accessing Auth Context

Use the `useAuth` hook to access authentication context:

```tsx
import { useAuth } from './components/auth/AuthProvider';

const YourComponent = () => {
  const { 
    isAuthenticated, 
    userContext, 
    login, 
    logout, 
    loading, 
    error,
    hasRole,
    hasAccess
  } = useAuth();

  // Use these values and functions as needed
};
```

### Conditional Rendering with RBAC

Use the `RBAC` component to conditionally render content based on user roles and permissions:

```tsx
import { RBAC, Role } from './components/auth/AuthProvider';

const YourComponent = () => {
  return (
    <div>
      {/* Only visible to super admins */}
      <RBAC allowedRoles={[Role.SUPER_ADMIN]}>
        <AdminPanel />
      </RBAC>

      {/* Only visible to users with access to products */}
      <RBAC resourceType="products">
        <ProductManagement />
      </RBAC>

      {/* With fallback content */}
      <RBAC 
        allowedRoles={[Role.CLIENT_ADMIN]} 
        fallback={<AccessDenied />}
      >
        <ClientSettings />
      </RBAC>
    </div>
  );
};
```

## Testing

A comprehensive test suite has been created in `__tests__/AuthProvider.test.tsx` to verify the functionality of the merged implementation. The tests cover:

1. Authentication state management
2. Login and logout functionality
3. Protected route redirection
4. Role-based access control
5. Resource-based access control
6. RBAC component rendering

Run the tests with:

```bash
npm test -- --testPathPattern=AuthProvider
```

## Future Considerations

1. **Auth Service Resolution**: The auth service itself has a merge conflict that needs to be resolved. The current implementation works with the HEAD branch version of the auth service.

2. **TypeScript Types**: Ensure that the UserContext interface is consistent across the application after resolving the auth service merge conflict.

3. **Route Configuration**: Update route configuration to match the dashboard paths used in the redirectToDashboard function.