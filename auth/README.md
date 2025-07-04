# VARAi Auth Module

Authentication and account management module for VARAi platform integrations with multi-tenant support.

## Features

- Multi-tenant architecture
- OAuth 2.0 authentication flow
- Account creation and management
- Platform-specific integrations
- Token management and refresh
- Role-based access control (RBAC)
- Tenant management
- TypeScript support
- Error handling
- Audit logging

## Installation

```bash
npm install @eyewearml/auth
```

## Usage

### Initialize Auth Service

```typescript
import { AuthService } from '@eyewearml/auth';

const auth = new AuthService({
  varaiApiUrl: 'https://api.varai.com',
  varaiClientId: 'your_client_id',
  varaiClientSecret: '${README_SECRET}',
  platform: 'shopify', // or 'bigcommerce', 'magento', 'woocommerce'
  redirectUri: 'https://your-app.com/auth/callback',
  tenantId: 'your_tenant_id' // Optional: specify tenant context
});
```

### OAuth Flow

1. Get authorization URL:
```typescript
const state = crypto.randomUUID();
const authUrl = auth.getOAuthUrl(state, 'tenant_id'); // Optional tenant ID
// Redirect user to authUrl
```

2. Exchange code for tokens:
```typescript
const { accessToken, refreshToken, expiresIn, profile, tenant } = await auth.exchangeCode(code);
```

3. Refresh access token:
```typescript
const { accessToken, refreshToken, expiresIn, tenant } = await auth.refreshToken(refreshToken);
```

### Account Management

1. Create or update account:
```typescript
const profile = await auth.createOrUpdateAccount({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  company: 'Example Store',
  storeId: 'store_123',
  platformToken: 'platform_access_token',
  tenantId: 'tenant_id', // Optional: specify tenant
  roles: ['tenant_admin'] // Optional: specify roles
});
```

2. Get user profile:
```typescript
const profile = await auth.getProfile(accessToken, 'tenant_id'); // Optional tenant ID
```

3. Update profile:
```typescript
const updatedProfile = await auth.updateProfile(
  accessToken,
  {
    firstName: 'Jane',
    company: 'New Store Name'
  },
  'tenant_id' // Optional tenant ID
);
```

4. Delete account:
```typescript
await auth.deleteAccount(accessToken, 'tenant_id'); // Optional tenant ID
```

### Platform Integration

1. Link platform account:
```typescript
await auth.linkPlatformAccount(accessToken, {
  storeId: 'store_123',
  platformToken: 'platform_access_token',
  tenantId: 'tenant_id' // Optional tenant ID
});
```

2. Unlink platform account:
```typescript
await auth.unlinkPlatformAccount(accessToken, 'tenant_id'); // Optional tenant ID
```

## Multi-Tenant Features

### Tenant Management

```typescript
// Get tenant service
const tenantService = auth.getTenantService();

// Create a new tenant
const tenant = await tenantService.createTenant({
  name: 'Acme Corp',
  domain: 'acme.varai.ai',
  adminEmail: 'admin@acme.com',
  settings: {
    ssoEnabled: true,
    mfaEnabled: true
  }
});

// Get tenant by ID
const tenant = await tenantService.getTenant('tenant_id');

// Update tenant
const updatedTenant = await tenantService.updateTenant('tenant_id', {
  name: 'Acme Corporation',
  settings: {
    ssoEnabled: true,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    }
  }
});

// List tenants
const { data: tenants, pagination } = await tenantService.listTenants({
  page: 1,
  pageSize: 20,
  status: 'active'
});

// Suspend/activate tenant
await tenantService.suspendTenant('tenant_id');
await tenantService.activateTenant('tenant_id');
```

### Role-Based Access Control

```typescript
// Get role service
const roleService = auth.getRoleService();

// Create a custom role
const role = await roleService.createRole({
  name: 'Marketing Manager',
  description: 'Can manage marketing campaigns and view analytics',
  permissions: [
    Permission.VIEW_REPORTS,
    Permission.VIEW_BRAND_ANALYTICS,
    Permission.CUSTOMIZE_REPORTS
  ],
  scope: 'client'
});

// Assign role to user
await roleService.assignRole({
  userId: 'user_id',
  roleId: 'role_id',
  tenantId: 'tenant_id',
  clientId: 'client_id'
});

// Check permissions
const { hasPermission } = await roleService.checkPermission({
  userId: 'user_id',
  permission: Permission.MANAGE_TENANT_SETTINGS,
  tenantId: 'tenant_id'
});

// Get user permissions
const { permissions } = await roleService.getUserPermissions('user_id', {
  tenantId: 'tenant_id'
});
```

### Authentication Context

```typescript
// Get authentication context with roles and permissions
const authContext = await auth.getAuthContext(accessToken);
console.log(authContext.permissions); // Array of permissions
console.log(authContext.roles); // Array of role IDs

// Check if user has specific permission
const hasPermission = await auth.hasPermission(
  accessToken,
  Permission.MANAGE_TENANT_SETTINGS,
  { tenantId: 'tenant_id' }
);
```

## Error Handling

The module provides detailed error messages and types:

```typescript
try {
  await auth.createOrUpdateAccount(params);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    // Handle specific error cases
  }
}
```

## Types

### AuthConfig

```typescript
interface AuthConfig {
  varaiApiUrl: string;
  varaiClientId: string;
  varaiClientSecret: string;
  platform: 'shopify' | 'bigcommerce' | 'magento' | 'woocommerce';
  redirectUri: string;
  tenantId?: string;
}
```

### UserProfile

```typescript
interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  platform: string;
  storeId: string;
  tenantId?: string;
  roles?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Tenant

```typescript
interface Tenant {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  settings: TenantSettings;
  status: 'active' | 'suspended' | 'pending' | 'deleted';
}

interface TenantSettings {
  ssoEnabled: boolean;
  ssoProviders?: SSOProvider[];
  passwordPolicy?: PasswordPolicy;
  sessionTimeout?: number;
  mfaEnabled?: boolean;
  allowedEmailDomains?: string[];
  customBranding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}
```

### Role and Permission

```typescript
enum Permission {
  // System-wide permissions
  MANAGE_SYSTEM = 'manage_system',
  MANAGE_TENANTS = 'manage_tenants',
  // Tenant-level permissions
  MANAGE_TENANT_SETTINGS = 'manage_tenant_settings',
  MANAGE_TENANT_USERS = 'manage_tenant_users',
  // ... and more
}

enum Role {
  SYSTEM_ADMIN = 'system_admin',
  TENANT_ADMIN = 'tenant_admin',
  CLIENT_ADMIN = 'client_admin',
  // ... and more
}

interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  scope: 'system' | 'tenant' | 'client' | 'brand';
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Build:
```bash
npm run build
```

3. Run tests:
```bash
npm test
```

4. Lint:
```bash
npm run lint
```

## Environment Variables

Required environment variables:

```env
VARAI_API_URL=https://api.varai.com
VARAI_CLIENT_ID=your_client_id
VARAI_CLIENT_SECRET=${README_SECRET}
```

## Security

- Multi-tenant isolation
- All sensitive data is transmitted over HTTPS
- OAuth 2.0 for secure authentication
- Access tokens are short-lived
- Refresh tokens are single-use
- Platform-specific tokens are encrypted
- Role-based access control
- Tenant-specific authentication settings
- Audit logging for security events

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

MIT License - see LICENSE file for details
