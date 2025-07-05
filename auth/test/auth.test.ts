import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { AuthService } from '../AuthService.js';
import { VaraiClient } from '../VaraiClient.js';
import { TenantService } from '../TenantService.js';
import { RoleService, Permission } from '../RoleService.js';
import { MockVaraiClient } from './types.js';

// Mock VaraiClient
jest.mock('../VaraiClient.js', () => {
  return {
    __esModule: true,
    VaraiClient: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      getApiUrl: jest.fn().mockReturnValue('https://api.varai.com'),
      getClientId: jest.fn().mockReturnValue('test_client_id'),
      setAccessToken: jest.fn(),
      clearAccessToken: jest.fn(),
      setTenantId: jest.fn(),
      clearTenantId: jest.fn(),
      getTenantId: jest.fn()
    }))
  };
});

// Mock TenantService
jest.mock('../TenantService.js', () => {
  return {
    __esModule: true,
    TenantService: jest.fn().mockImplementation(() => ({
      createTenant: jest.fn(),
      getTenant: jest.fn(),
      updateTenant: jest.fn(),
      deleteTenant: jest.fn(),
      listTenants: jest.fn(),
      getTenantByDomain: jest.fn(),
      suspendTenant: jest.fn(),
      activateTenant: jest.fn(),
      getTenantAuditLogs: jest.fn()
    }))
  };
});

// Mock RoleService
jest.mock('../RoleService.js', () => {
  return {
    __esModule: true,
    RoleService: jest.fn().mockImplementation(() => ({
      createRole: jest.fn(),
      getRole: jest.fn(),
      updateRole: jest.fn(),
      deleteRole: jest.fn(),
      listRoles: jest.fn(),
      assignRole: jest.fn(),
      removeRoleAssignment: jest.fn(),
      getUserRoleAssignments: jest.fn(),
      checkPermission: jest.fn(),
      getUserPermissions: jest.fn(),
      getDefaultRoles: jest.fn()
    })),
    Permission: {
      MANAGE_SYSTEM: 'manage_system',
      MANAGE_TENANTS: 'manage_tenants',
      VIEW_GLOBAL_ANALYTICS: 'view_global_analytics',
      MANAGE_ML_MODELS: 'manage_ml_models',
      MANAGE_TENANT_SETTINGS: 'manage_tenant_settings',
      MANAGE_TENANT_USERS: 'manage_tenant_users',
      MANAGE_TENANT_BILLING: 'manage_tenant_billing',
      MANAGE_TENANT_API_KEYS: 'process.env.API_KEY_241',
      MANAGE_CLIENTS: 'manage_clients',
      MANAGE_CLIENT_USERS: 'manage_client_users',
      CUSTOMIZE_REPORTS: 'customize_reports',
      MANAGE_BRANDS: 'manage_brands',
      MANAGE_PRODUCTS: 'manage_products',
      VIEW_BRAND_ANALYTICS: 'view_brand_analytics',
      VIEW_REPORTS: 'view_reports',
      VIEW_RECOMMENDATIONS: 'view_recommendations',
      MANAGE_PROFILE: 'manage_profile'
    },
    Role: {
      SYSTEM_ADMIN: 'system_admin',
      TENANT_ADMIN: 'tenant_admin',
      TENANT_MANAGER: 'tenant_manager',
      CLIENT_ADMIN: 'client_admin',
      CLIENT_MANAGER: 'client_manager',
      BRAND_MANAGER: 'brand_manager',
      VIEWER: 'viewer'
    }
  };
});

describe('AuthService', () => {
  let auth: AuthService;
  let mockClient: MockVaraiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    auth = new AuthService({
      varaiApiUrl: 'https://api.varai.com',
      varaiClientId: 'test_client_id',
      varaiClientSecret: 'process.env.AUTH_SECRET',
      platform: 'shopify',
      redirectUri: 'https://app.example.com/auth/callback',
      tenantId: 'tenant-123'
    });
    
    mockClient = (VaraiClient as jest.Mock).mock.results[0].value as MockVaraiClient;
  });

  test('getOAuthUrl returns correct URL with params and tenant ID', () => {
    const state = 'test_state';
    const url = auth.getOAuthUrl(state);
    
    expect(url).toContain('https://api.varai.com/oauth/authorize');
    expect(url).toContain('client_id=test_client_id');
    expect(url).toContain('redirect_uri=https%3A%2F%2Fapp.example.com%2Fauth%2Fcallback');
    expect(url).toContain('response_type=code');
    expect(url).toContain(`state=${state}`);
    expect(url).toContain('platform=shopify');
    expect(url).toContain('tenant_id=tenant-123');
  });

  test('createOrUpdateAccount creates account successfully with tenant ID', async () => {
    const mockProfile = {
      id: '123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      platform: 'shopify',
      storeId: 'store_123',
      tenantId: 'tenant-123',
      roles: ['tenant_admin'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockClient.post.mockResolvedValueOnce({ data: mockProfile } as any);

    const result = await auth.createOrUpdateAccount({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      storeId: 'store_123',
      platformToken: 'platform_token',
      roles: ['tenant_admin']
    });

    expect(result).toEqual(mockProfile);
    expect(mockClient.post).toHaveBeenCalledWith('/accounts', {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      storeId: 'store_123',
      platformToken: 'platform_token',
      platform: 'shopify',
      tenantId: 'tenant-123',
      roles: ['tenant_admin']
    });
  });

  test('exchangeCode exchanges code for tokens with tenant context', async () => {
    const mockTenant = {
      id: 'tenant-123',
      name: 'Test Tenant',
      domain: 'test.varai.ai',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        ssoEnabled: false
      },
      status: 'active'
    };
    
    const mockResponse = {
      access_token: 'access_123',
      refresh_token: 'refresh_123',
      expires_in: 3600,
      profile: {
        id: '123',
        email: 'test@example.com',
        platform: 'shopify',
        storeId: 'store_123',
        tenantId: 'tenant-123',
        roles: ['tenant_admin'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      tenant: mockTenant
    };

    mockClient.post.mockResolvedValueOnce(mockResponse as any);

    const result = await auth.exchangeCode('test_code');

    expect(result).toEqual({
      accessToken: 'access_123',
      refreshToken: 'refresh_123',
      expiresIn: 3600,
      profile: mockResponse.profile,
      tenant: mockTenant
    });
    
    expect(mockClient.post).toHaveBeenCalledWith('/oauth/token', {
      grant_type: 'authorization_code',
      code: 'test_code',
      redirect_uri: 'https://app.example.com/auth/callback',
      tenant_id: 'tenant-123'
    });
  });

  test('refreshToken refreshes access token with tenant context', async () => {
    const mockTenant = {
      id: 'tenant-123',
      name: 'Test Tenant',
      domain: 'test.varai.ai',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        ssoEnabled: false
      },
      status: 'active'
    };
    
    const mockResponse = {
      access_token: 'new_access_123',
      refresh_token: 'new_refresh_123',
      expires_in: 3600,
      tenant: mockTenant
    };

    mockClient.post.mockResolvedValueOnce(mockResponse as any);

    const result = await auth.refreshToken('old_refresh_token');

    expect(result).toEqual({
      accessToken: 'new_access_123',
      refreshToken: 'new_refresh_123',
      expiresIn: 3600,
      tenant: mockTenant
    });
    
    expect(mockClient.post).toHaveBeenCalledWith('/oauth/token', {
      grant_type: 'refresh_token',
      refresh_token: 'old_refresh_token',
      tenant_id: 'tenant-123'
    });
  });

  test('getProfile returns user profile with tenant context', async () => {
    const mockProfile = {
      id: '123',
      email: 'test@example.com',
      platform: 'shopify',
      storeId: 'store_123',
      tenantId: 'tenant-123',
      roles: ['tenant_admin'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockClient.get.mockResolvedValueOnce({ data: mockProfile } as any);

    const result = await auth.getProfile('test_token');

    expect(result).toEqual(mockProfile);
    expect(mockClient.get).toHaveBeenCalledWith('/accounts/profile', {
      headers: {
        Authorization: 'Bearer test_token'
      },
      params: {
        tenant_id: 'tenant-123'
      }
    });
  });

  test('updateProfile updates user profile with tenant context', async () => {
    const mockProfile = {
      id: '123',
      email: 'test@example.com',
      firstName: 'Jane',
      platform: 'shopify',
      storeId: 'store_123',
      tenantId: 'tenant-123',
      roles: ['tenant_admin'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockClient.patch.mockResolvedValueOnce({ data: mockProfile } as any);

    const result = await auth.updateProfile('test_token', {
      firstName: 'Jane'
    });

    expect(result).toEqual(mockProfile);
    expect(mockClient.patch).toHaveBeenCalledWith(
      '/accounts/profile',
      { firstName: 'Jane' },
      {
        headers: {
          Authorization: 'Bearer test_token'
        },
        params: {
          tenant_id: 'tenant-123'
        }
      }
    );
  });

  test('deleteAccount deletes user account with tenant context', async () => {
    mockClient.delete.mockResolvedValueOnce(undefined as any);

    await auth.deleteAccount('test_token');

    expect(mockClient.delete).toHaveBeenCalledWith('/accounts', {
      headers: {
        Authorization: 'Bearer test_token'
      },
      params: {
        tenant_id: 'tenant-123'
      }
    });
  });

  test('linkPlatformAccount links platform account with tenant context', async () => {
    mockClient.post.mockResolvedValueOnce(undefined as any);

    await auth.linkPlatformAccount('test_token', {
      storeId: 'store_123',
      platformToken: 'platform_token'
    });

    expect(mockClient.post).toHaveBeenCalledWith(
      '/accounts/platforms',
      {
        platform: 'shopify',
        storeId: 'store_123',
        platformToken: 'platform_token'
      },
      {
        headers: {
          Authorization: 'Bearer test_token'
        },
        params: {
          tenant_id: 'tenant-123'
        }
      }
    );
  });

  test('unlinkPlatformAccount unlinks platform account with tenant context', async () => {
    mockClient.delete.mockResolvedValueOnce(undefined as any);

    await auth.unlinkPlatformAccount('test_token');

    expect(mockClient.delete).toHaveBeenCalledWith('/accounts/platforms/shopify', {
      headers: {
        Authorization: 'Bearer test_token'
      },
      params: {
        tenant_id: 'tenant-123'
      }
    });
  });

  test('getAuthContext returns user context with roles and permissions', async () => {
    const mockProfile = {
      id: '123',
      email: 'test@example.com',
      platform: 'shopify',
      storeId: 'store_123',
      tenantId: 'tenant-123',
      roles: ['tenant_admin'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockClient.get.mockResolvedValueOnce({ data: mockProfile } as any);

    const mockRoleService = (RoleService as jest.Mock).mock.results[0].value as any;
    mockRoleService.getUserPermissions.mockResolvedValueOnce({
      permissions: [
        Permission.MANAGE_TENANT_SETTINGS,
        Permission.MANAGE_TENANT_USERS,
        Permission.MANAGE_TENANT_BILLING
      ]
    });

    const result = await auth.getAuthContext('test_token');

    expect(result).toEqual({
      userId: '123',
      tenantId: 'tenant-123',
      roles: ['tenant_admin'],
      permissions: [
        Permission.MANAGE_TENANT_SETTINGS,
        Permission.MANAGE_TENANT_USERS,
        Permission.MANAGE_TENANT_BILLING
      ]
    });

    expect(mockClient.setAccessToken).toHaveBeenCalledWith('test_token');
    expect(mockClient.get).toHaveBeenCalledWith('/accounts/profile', {
      headers: {
        Authorization: 'Bearer test_token'
      },
      params: {
        tenant_id: 'tenant-123'
      }
    });
    expect(mockRoleService.getUserPermissions).toHaveBeenCalledWith('123', {
      tenantId: 'tenant-123'
    });
  });

  test('hasPermission checks if user has specific permission', async () => {
    const mockProfile = {
      id: '123',
      email: 'test@example.com',
      platform: 'shopify',
      storeId: 'store_123',
      tenantId: 'tenant-123',
      roles: ['tenant_admin'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockClient.get.mockResolvedValueOnce({ data: mockProfile } as any);

    const mockRoleService = (RoleService as jest.Mock).mock.results[0].value as any;
    mockRoleService.checkPermission.mockResolvedValueOnce({ hasPermission: true });

    const result = await auth.hasPermission(
      'test_token',
      Permission.MANAGE_TENANT_SETTINGS,
      { clientId: 'client-456' }
    );

    expect(result).toBe(true);
    expect(mockClient.setAccessToken).toHaveBeenCalledWith('test_token');
    expect(mockClient.get).toHaveBeenCalledWith('/accounts/profile', {
      headers: {
        Authorization: 'Bearer test_token'
      },
      params: {
        tenant_id: 'tenant-123'
      }
    });
    expect(mockRoleService.checkPermission).toHaveBeenCalledWith({
      userId: '123',
      permission: Permission.MANAGE_TENANT_SETTINGS,
      tenantId: 'tenant-123',
      clientId: 'client-456',
      brandId: undefined
    });
  });

  test('getTenantService returns tenant service instance', () => {
    const tenantService = auth.getTenantService();
    expect(tenantService).toBeDefined();
    expect(TenantService).toHaveBeenCalledTimes(1);
  });

  test('getRoleService returns role service instance', () => {
    const roleService = auth.getRoleService();
    expect(roleService).toBeDefined();
    expect(RoleService).toHaveBeenCalledTimes(1);
  });

  test('setTenantId updates the tenant ID', () => {
    auth.setTenantId('new-tenant-456');
    expect(auth.getTenantId()).toBe('new-tenant-456');
  });
});
