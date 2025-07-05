# Authentication and Authorization Guide

This document provides comprehensive guidance on implementing authentication and authorization in the VARAi platform, helping developers understand how to secure their applications and APIs.

## Overview

The VARAi platform implements a robust authentication and authorization system based on industry best practices. This system ensures that:

1. Users are properly authenticated before accessing the platform
2. Users can only access resources they are authorized to use
3. API access is secure and controlled
4. Multi-tenant data is properly isolated

## Authentication Architecture

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API Gateway
    participant Auth Service
    participant Resource Service
    participant Database
    
    User->>Client: Login Request
    Client->>API Gateway: Authentication Request
    API Gateway->>Auth Service: Forward Auth Request
    Auth Service->>Database: Validate Credentials
    Database-->>Auth Service: User Data
    Auth Service->>Auth Service: Generate JWT
    Auth Service-->>API Gateway: JWT Token
    API Gateway-->>Client: JWT Token
    Client->>API Gateway: Resource Request + JWT
    API Gateway->>API Gateway: Validate JWT
    API Gateway->>Resource Service: Authorized Request
    Resource Service->>Database: Fetch Resource
    Database-->>Resource Service: Resource Data
    Resource Service-->>API Gateway: Resource Response
    API Gateway-->>Client: Resource Response
    Client-->>User: Display Resource
```

## Authentication Methods

The VARAi platform supports multiple authentication methods:

### 1. Username/Password Authentication

Standard username and password authentication with the following security features:

- Password complexity requirements
- Account lockout after failed attempts
- Password expiration
- Password history
- Multi-factor authentication (optional)

Example login request:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "tenantId": "tenant-123"
}
```

Example response:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "roles": ["admin"],
    "tenantId": "tenant-123"
  }
}
```

### 2. OAuth 2.0 / OpenID Connect

Support for OAuth 2.0 and OpenID Connect for single sign-on and third-party authentication:

- Authorization Code Flow
- Implicit Flow
- Client Credentials Flow
- Resource Owner Password Flow
- Refresh Token Flow

Example OAuth 2.0 authorization request:

```
GET /api/auth/oauth/authorize?
  response_type=code&
  client_id=client-123&
  redirect_uri=https://client.example.com/callback&
  scope=openid profile email&
  state=random-state-string
```

### 3. API Key Authentication

API key authentication for machine-to-machine communication:

- API key generation and management
- API key rotation
- API key scoping

Example API key request:

```http
GET /api/products
Authorization: ApiKey api-key-123
```

### 4. JWT Authentication

JSON Web Token (JWT) authentication for API access:

- JWT generation and validation
- JWT claims validation
- JWT signature verification

Example JWT request:

```http
GET /api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Authorization Model

The VARAi platform uses a Role-Based Access Control (RBAC) system with the following components:

### 1. Multi-tenant Architecture

The platform supports multi-tenancy with the following features:

- Tenant isolation
- Tenant-specific configurations
- Cross-tenant access controls

### 2. Roles and Permissions

The RBAC system includes:

- **Roles**: Collections of permissions assigned to users
- **Permissions**: Fine-grained access controls for resources
- **Resource Scopes**: Limitations on which resources a permission applies to

Standard roles include:

- **System Administrator**: Full access to all system features
- **Tenant Administrator**: Full access to a specific tenant
- **Developer**: Access to development and API features
- **Merchant**: Access to merchant-specific features
- **Customer**: Access to customer-specific features

### 3. Permission Structure

Permissions follow a structured format:

```
<resource>:<action>:<scope>
```

Examples:
- `products:read:all` - Read access to all products
- `products:write:own` - Write access to own products
- `users:manage:tenant` - Manage users within a tenant

### 4. Permission Checks

Permission checks are performed at multiple levels:

- **API Gateway**: Validates JWT and basic permissions
- **Service Layer**: Validates specific resource permissions
- **Data Layer**: Enforces data access controls

Example permission check in code:

```python
# Python backend example
@router.get("/products/{product_id}")
async def get_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    permissions: PermissionChecker = Depends(get_permission_checker)
):
    # Check if user has permission to read products
    if not permissions.has_permission("products:read"):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Get the product
    product = await product_service.get_product(product_id)
    
    # Check if user has access to this specific product
    if product.tenant_id != current_user.tenant_id and not permissions.has_permission("products:read:all"):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    return product
```

```typescript
// TypeScript frontend example
function ProductDetail({ productId }: { productId: string }) {
  const { user, hasPermission } = useAuth();
  const { data: product, error } = useProduct(productId);
  
  if (error) return <ErrorMessage error={error} />;
  if (!product) return <Loading />;
  
  // Check if user has permission to edit this product
  const canEdit = hasPermission('products:write') && 
    (product.tenantId === user.tenantId || hasPermission('products:write:all'));
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      {canEdit && <EditButton productId={productId} />}
    </div>
  );
}
```

## Token Management

### 1. JWT Structure

JWTs used in the VARAi platform have the following structure:

**Header**:
```json
{
  "alg": "RS256",
  "typ": "JWT"
}
```

**Payload**:
```json
{
  "sub": "user-123",
  "iss": "https://auth.varai.ai",
  "aud": "varai-api",
  "exp": 1619876543,
  "iat": 1619872943,
  "tenant_id": "tenant-123",
  "roles": ["admin"],
  "permissions": ["products:read:all", "products:write:own"]
}
```

### 2. Token Lifecycle

The token lifecycle includes:

- **Generation**: Tokens are generated during authentication
- **Validation**: Tokens are validated on each request
- **Refresh**: Access tokens can be refreshed using refresh tokens
- **Revocation**: Tokens can be revoked for security reasons

Example token refresh:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Token Security

Token security measures include:

- Short-lived access tokens (1 hour)
- Longer-lived refresh tokens (14 days)
- Token rotation on refresh
- Token revocation on logout or security events
- Secure storage recommendations for clients

## Implementing Authentication

### 1. Backend Implementation

#### FastAPI Authentication Middleware

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        tenant_id: str = payload.get("tenant_id")
        roles: list = payload.get("roles", [])
        permissions: list = payload.get("permissions", [])
    except JWTError:
        raise credentials_exception
    
    user = await get_user(user_id)
    if user is None:
        raise credentials_exception
    
    # Attach additional information to the user object
    user.tenant_id = tenant_id
    user.roles = roles
    user.permissions = permissions
    
    return user
```

#### Permission Checking

```python
class PermissionChecker:
    def __init__(self, user: User):
        self.user = user
    
    def has_permission(self, required_permission: str, resource_id: str = None):
        # Check if user has the required permission
        if required_permission in self.user.permissions:
            return True
        
        # Check for wildcard permissions
        base_permission, action, scope = required_permission.split(":")
        if f"{base_permission}:*:*" in self.user.permissions:
            return True
        if f"{base_permission}:{action}:*" in self.user.permissions:
            return True
        
        # Check for scoped permissions
        if resource_id and self.has_resource_access(base_permission, action, resource_id):
            return True
        
        return False
    
    def has_resource_access(self, resource_type: str, action: str, resource_id: str):
        # Check if user has access to the specific resource
        # This would typically involve a database query
        return False

def get_permission_checker(current_user: User = Depends(get_current_user)):
    return PermissionChecker(current_user)
```

### 2. Frontend Implementation

#### Authentication Context

```tsx
// auth-context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/auth-service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, tenantId: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const authService = new AuthService();
  
  useEffect(() => {
    // Check if user is already authenticated
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      }
    };
    
    initAuth();
  }, []);
  
  const login = async (email: string, password: string, tenantId: string) => {
    const response = await authService.login(email, password, tenantId);
    setUser(response.user);
    setIsAuthenticated(true);
    // Store tokens securely
    localStorage.setItem('refreshToken', response.refreshToken);
    // Don't store access token in localStorage for security reasons
    // Instead, store it in memory or a secure cookie
    authService.setAccessToken(response.accessToken);
  };
  
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('refreshToken');
    authService.clearAccessToken();
  };
  
  const hasPermission = (permission: string) => {
    if (!user || !user.permissions) return false;
    
    // Check for exact permission match
    if (user.permissions.includes(permission)) return true;
    
    // Check for wildcard permissions
    const [resource, action, scope] = permission.split(':');
    if (user.permissions.includes(`${resource}:*:*`)) return true;
    if (user.permissions.includes(`${resource}:${action}:*`)) return true;
    
    return false;
  };
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### Protected Route Component

```tsx
// protected-route.tsx
import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from './auth-context';

interface ProtectedRouteProps extends RouteProps {
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermission,
  ...routeProps
}) => {
  const { isAuthenticated, hasPermission } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Redirect to="/unauthorized" />;
  }
  
  return <Route {...routeProps} />;
};
```

## API Security

### 1. API Authentication

All API endpoints should be secured with appropriate authentication:

```python
# FastAPI example
@router.get("/api/products", tags=["products"])
async def get_products(
    current_user: User = Depends(get_current_user),
    permissions: PermissionChecker = Depends(get_permission_checker)
):
    if not permissions.has_permission("products:read"):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Get products for the user's tenant
    products = await product_service.get_products(tenant_id=current_user.tenant_id)
    return products
```

### 2. Cross-Origin Resource Sharing (CORS)

Configure CORS to restrict API access to trusted domains:

```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.varai.ai", "https://admin.varai.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Rate Limiting

Implement rate limiting to prevent abuse:

```python
# FastAPI example with slowapi
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@router.get("/api/products")
@limiter.limit("100/minute")
async def get_products(request: Request):
    # ...
```

## Security Best Practices

### 1. Secure Password Handling

- Never store passwords in plain text
- Use strong hashing algorithms (bcrypt, Argon2)
- Implement password complexity requirements
- Enforce password rotation policies

```python
# Password hashing example
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)
```

### 2. Multi-factor Authentication

- Implement MFA for sensitive operations
- Support multiple MFA methods (TOTP, SMS, email)
- Allow users to manage MFA settings

### 3. Secure Token Storage

- Store access tokens in memory or secure cookies
- Store refresh tokens in secure HTTP-only cookies
- Implement token rotation on refresh
- Set appropriate token expiration times

### 4. Audit Logging

- Log all authentication and authorization events
- Include relevant details (user, IP, action)
- Protect log data from unauthorized access
- Implement log retention policies

```python
# Audit logging example
async def log_auth_event(user_id: str, event_type: str, details: dict, ip_address: str):
    await db.auth_logs.insert_one({
        "user_id": user_id,
        "event_type": event_type,
        "details": details,
        "ip_address": ip_address,
        "timestamp": datetime.utcnow()
    })
```

## Troubleshooting

### Common Authentication Issues

1. **Expired Tokens**: Implement token refresh logic
2. **Invalid Tokens**: Validate token format and signature
3. **Missing Permissions**: Check required permissions
4. **Cross-Origin Issues**: Configure CORS properly
5. **Rate Limiting**: Handle rate limit exceeded errors

### Debugging Authentication

1. Check token validity using JWT debugger
2. Verify user permissions in the database
3. Check server logs for authentication errors
4. Use network monitoring tools to inspect requests

## Next Steps

For more information on securing your VARAi applications, see:

- [Security Model Documentation](./security-model.md)
- [Data Protection Documentation](./data-protection.md)
- [Secure Coding Guidelines](./secure-coding-guidelines.md)