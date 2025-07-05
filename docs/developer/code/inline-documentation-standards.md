# Inline Code Documentation Standards

This document outlines the standards for inline code documentation in the VARAi platform. Following these standards ensures that the codebase is well-documented, maintainable, and accessible to all developers.

## General Principles

1. **Write documentation as you code**: Documentation should be written alongside the code, not as an afterthought.
2. **Document why, not what**: Focus on explaining why the code exists and why it works the way it does, not just what it does (which should be clear from the code itself).
3. **Keep documentation up to date**: When code changes, update the documentation to reflect those changes.
4. **Use clear, concise language**: Documentation should be easy to understand and free of jargon when possible.
5. **Follow language-specific conventions**: Each programming language has its own documentation conventions, which should be followed.

## Python Documentation Standards

### Docstrings

All Python modules, classes, methods, and functions should have docstrings following the [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings).

#### Module Docstrings

```python
"""
Module for handling user authentication and authorization.

This module provides functions and classes for authenticating users,
managing sessions, and enforcing role-based access control.
"""
```

#### Class Docstrings

```python
class User:
    """
    Represents a user in the system.
    
    This class handles user data, authentication, and permissions.
    
    Attributes:
        id (str): The unique identifier for the user.
        email (str): The user's email address.
        roles (List[str]): The roles assigned to the user.
        tenant_id (str): The ID of the tenant the user belongs to.
    """
```

#### Method and Function Docstrings

```python
def authenticate_user(email: str, password: str) -> Optional[User]:
    """
    Authenticates a user with the provided credentials.
    
    Args:
        email: The user's email address.
        password: The user's password.
        
    Returns:
        User: The authenticated user if credentials are valid.
        None: If authentication fails.
        
    Raises:
        AuthenticationError: If the authentication service is unavailable.
    """
```

### Comments

Use inline comments sparingly and only when necessary to explain complex logic or non-obvious decisions:

```python
# This algorithm uses a modified version of breadth-first search
# to handle cycles in the graph while maintaining O(n) time complexity
def process_graph(graph):
    # ...
```

## TypeScript/JavaScript Documentation Standards

### JSDoc Comments

All TypeScript/JavaScript modules, classes, interfaces, methods, and functions should have JSDoc comments.

#### File Headers

```typescript
/**
 * Authentication service for handling user login, logout, and session management.
 * 
 * @module auth/services/authService
 */
```

#### Interface and Type Definitions

```typescript
/**
 * Represents a user in the system.
 */
interface User {
  /** Unique identifier for the user */
  id: string;
  
  /** User's email address */
  email: string;
  
  /** Roles assigned to the user */
  roles: string[];
  
  /** ID of the tenant the user belongs to */
  tenantId: string;
}
```

#### Class Definitions

```typescript
/**
 * Service for handling authentication operations.
 */
class AuthService {
  private apiClient: ApiClient;
  
  /**
   * Creates a new AuthService instance.
   * 
   * @param apiClient - The API client to use for requests
   */
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }
  
  // ...
}
```

#### Method and Function Definitions

```typescript
/**
 * Authenticates a user with the provided credentials.
 * 
 * @param email - The user's email address
 * @param password - The user's password
 * @returns The authenticated user if credentials are valid, null otherwise
 * @throws {AuthenticationError} If the authentication service is unavailable
 */
async function authenticateUser(email: string, password: string): Promise<User | null> {
  // ...
}
```

### Comments

Use inline comments sparingly and only when necessary:

```typescript
// This complex state update is needed to handle concurrent updates
// while maintaining referential integrity for React's rendering
function updateState(newData) {
  // ...
}
```

## React Component Documentation

### Component Documentation

All React components should have JSDoc comments describing their purpose and props:

```typescript
/**
 * Displays a user profile with editable fields.
 * 
 * @example
 * ```tsx
 * <UserProfile user={currentUser} onSave={handleSave} />
 * ```
 */
interface UserProfileProps {
  /** The user to display */
  user: User;
  
  /** Called when the user saves changes */
  onSave: (updatedUser: User) => void;
  
  /** Whether the profile is in edit mode */
  isEditing?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onSave, isEditing = false }) => {
  // ...
};
```

### Hook Documentation

All custom hooks should be documented:

```typescript
/**
 * Hook for managing authentication state.
 * 
 * @returns Authentication state and methods
 * 
 * @example
 * ```tsx
 * const { user, login, logout } = useAuth();
 * ```
 */
export function useAuth() {
  // ...
  
  return { user, login, logout };
}
```

## SQL Documentation

### SQL Queries

All SQL queries should be documented with comments explaining their purpose:

```sql
-- Find all active users in a specific tenant
-- who have logged in within the last 30 days
SELECT u.id, u.email, u.last_login
FROM users u
WHERE u.tenant_id = :tenant_id
  AND u.status = 'active'
  AND u.last_login > NOW() - INTERVAL '30 days';
```

## Automated Documentation Enforcement

To ensure documentation standards are followed, the VARAi platform uses the following tools:

1. **Python**: `pydocstyle` for checking docstring compliance
2. **TypeScript/JavaScript**: `eslint` with documentation plugins
3. **CI Pipeline**: Documentation checks are part of the CI pipeline

## Documentation Generation

The documentation standards are designed to work with automated documentation generation tools:

1. **Python**: Sphinx with Napoleon extension
2. **TypeScript/JavaScript**: TypeDoc
3. **API**: OpenAPI/Swagger

For more information on automated documentation generation, see [Automated Documentation Generation](./automated-documentation.md).

## Examples

For examples of well-documented code in the VARAi platform, see [Code Examples](./code-examples.md).