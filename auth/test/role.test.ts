import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { RoleService, Permission, Role } from '../RoleService.js';
import { VaraiClient } from '../VaraiClient.js';
import { MockVaraiClient } from './types.js';

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

describe('RoleService', () => {
  let roleService: RoleService;
  let mockClient: MockVaraiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    const client = new VaraiClient({
      apiUrl: 'https://api.varai.com',
      clientId: 'test_client_id',
      clientSecret: 'process.env.ROLE_SECRET'
    });
    roleService = new RoleService(client);
    mockClient = (VaraiClient as jest.Mock).mock.results[0].value as MockVaraiClient;
  });

  test('createRole creates a new role', async () => {
    const mockRole = {
      id: 'role-123',
      name: 'Custom Admin',
      description: 'Custom admin role with limited permissions',
      permissions: [
        Permission.MANAGE_TENANT_SETTINGS,
        Permission.MANAGE_TENANT_USERS
      ],
      scope: 'tenant',
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockClient.post.mockResolvedValueOnce({ data: mockRole });

    const result = await roleService.createRole({
      name: 'Custom Admin',
      description: 'Custom admin role with limited permissions',
      permissions: [
        Permission.MANAGE_TENANT_SETTINGS,
        Permission.MANAGE_TENANT_USERS
      ],
      scope: 'tenant'
    });

    expect(result).toEqual(mockRole);
    expect(mockClient.post).toHaveBeenCalledWith('/roles', {
      name: 'Custom Admin',
      description: 'Custom admin role with limited permissions',
      permissions: [
        Permission.MANAGE_TENANT_SETTINGS,
        Permission.MANAGE_TENANT_USERS
      ],
      scope: 'tenant'
    });
  });

  test('getRole retrieves a role by ID', async () => {
    const mockRole = {
      id: 'role-123',
      name: 'Custom Admin',
      description: 'Custom admin role with limited permissions',
      permissions: [
        Permission.MANAGE_TENANT_SETTINGS,
        Permission.MANAGE_TENANT_USERS
      ],
      scope: 'tenant',
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockClient.get.mockResolvedValueOnce({ data: mockRole });

    const result = await roleService.getRole('role-123');

    expect(result).toEqual(mockRole);
    expect(mockClient.get).toHaveBeenCalledWith('/roles/role-123');
  });

  test('updateRole updates a role', async () => {
    const mockRole = {
      id: 'role-123',
      name: 'Updated Admin',
      description: 'Updated admin role with more permissions',
      permissions: [
        Permission.MANAGE_TENANT_SETTINGS,
        Permission.MANAGE_TENANT_USERS,
        Permission.MANAGE_TENANT_BILLING
      ],
      scope: 'tenant',
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockClient.patch.mockResolvedValueOnce({ data: mockRole });

    const result = await roleService.updateRole('role-123', {
      name: 'Updated Admin',
      description: 'Updated admin role with more permissions',
      permissions: [
        Permission.MANAGE_TENANT_SETTINGS,
        Permission.MANAGE_TENANT_USERS,
        Permission.MANAGE_TENANT_BILLING
      ]
    });

    expect(result).toEqual(mockRole);
    expect(mockClient.patch).toHaveBeenCalledWith('/roles/role-123', {
      name: 'Updated Admin',
      description: 'Updated admin role with more permissions',
      permissions: [
        Permission.MANAGE_TENANT_SETTINGS,
        Permission.MANAGE_TENANT_USERS,
        Permission.MANAGE_TENANT_BILLING
      ]
    });
  });

  test('deleteRole deletes a role', async () => {
    mockClient.delete.mockResolvedValueOnce(undefined);

    await roleService.deleteRole('role-123');

    expect(mockClient.delete).toHaveBeenCalledWith('/roles/role-123');
  });

  test('listRoles retrieves a list of roles', async () => {
    const mockResponse = {
      data: [
        {
          id: 'role-123',
          name: 'Custom Admin',
          description: 'Custom admin role with limited permissions',
          permissions: [
            Permission.MANAGE_TENANT_SETTINGS,
            Permission.MANAGE_TENANT_USERS
          ],
          scope: 'tenant',
          isCustom: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'role-456',
          name: 'Viewer',
          description: 'Read-only access',
          permissions: [
            Permission.VIEW_REPORTS,
            Permission.VIEW_RECOMMENDATIONS
          ],
          scope: 'tenant',
          isCustom: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      pagination: {
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      }
    };

    mockClient.get.mockResolvedValueOnce(mockResponse);

    const result = await roleService.listRoles({
      page: 1,
      pageSize: 10,
      scope: 'tenant',
      search: 'admin'
    });

    expect(result).toEqual(mockResponse);
    expect(mockClient.get).toHaveBeenCalledWith('/roles', {
      params: {
        page: 1,
        pageSize: 10,
        scope: 'tenant',
        search: 'admin'
      }
    });
  });

  test('assignRole assigns a role to a user', async () => {
    const mockAssignment = {
      id: 'assignment-123',
      userId: 'user-123',
      roleId: 'role-123',
      tenantId: 'tenant-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockClient.post.mockResolvedValueOnce({ data: mockAssignment });

    const result = await roleService.assignRole({
      userId: 'user-123',
      roleId: 'role-123',
      tenantId: 'tenant-123'
    });

    expect(result).toEqual(mockAssignment);
    expect(mockClient.post).toHaveBeenCalledWith('/role-assignments', {
      userId: 'user-123',
      roleId: 'role-123',
      tenantId: 'tenant-123'
    });
  });

  test('removeRoleAssignment removes a role assignment', async () => {
    mockClient.delete.mockResolvedValueOnce(undefined);

    await roleService.removeRoleAssignment('assignment-123');

    expect(mockClient.delete).toHaveBeenCalledWith('/role-assignments/assignment-123');
  });

  test('getUserRoleAssignments retrieves role assignments for a user', async () => {
    const mockResponse = {
      data: [
        {
          id: 'assignment-123',
          userId: 'user-123',
          roleId: 'role-123',
          tenantId: 'tenant-123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'assignment-456',
          userId: 'user-123',
          roleId: 'role-456',
          tenantId: 'tenant-123',
          clientId: 'client-123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      pagination: {
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      }
    };

    mockClient.get.mockResolvedValueOnce(mockResponse);

    const result = await roleService.getUserRoleAssignments('user-123', {
      tenantId: 'tenant-123'
    });

    expect(result).toEqual(mockResponse);
    expect(mockClient.get).toHaveBeenCalledWith('/users/user-123/role-assignments', {
      params: {
        tenantId: 'tenant-123'
      }
    });
  });

  test('checkPermission checks if a user has a specific permission', async () => {
    mockClient.post.mockResolvedValueOnce({ hasPermission: true });

    const result = await roleService.checkPermission({
      userId: 'user-123',
      permission: Permission.MANAGE_TENANT_SETTINGS,
      tenantId: 'tenant-123'
    });

    expect(result).toEqual({ hasPermission: true });
    expect(mockClient.post).toHaveBeenCalledWith('/permissions/check', {
      userId: 'user-123',
      permission: Permission.MANAGE_TENANT_SETTINGS,
      tenantId: 'tenant-123'
    });
  });

  test('getUserPermissions retrieves permissions for a user', async () => {
    mockClient.get.mockResolvedValueOnce({
      permissions: [
        Permission.MANAGE_TENANT_SETTINGS,
        Permission.MANAGE_TENANT_USERS,
        Permission.VIEW_REPORTS
      ]
    });

    const result = await roleService.getUserPermissions('user-123', {
      tenantId: 'tenant-123'
    });

    expect(result).toEqual({
      permissions: [
        Permission.MANAGE_TENANT_SETTINGS,
        Permission.MANAGE_TENANT_USERS,
        Permission.VIEW_REPORTS
      ]
    });
    expect(mockClient.get).toHaveBeenCalledWith('/users/user-123/permissions', {
      params: {
        tenantId: 'tenant-123'
      }
    });
  });

  test('getDefaultRoles retrieves default roles', async () => {
    const mockRoles = [
      {
        id: 'role-system-admin',
        name: 'System Admin',
        description: 'Full system access',
        permissions: Object.values(Permission),
        scope: 'system',
        isCustom: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'role-tenant-admin',
        name: 'Tenant Admin',
        description: 'Full tenant access',
        permissions: [
          Permission.MANAGE_TENANT_SETTINGS,
          Permission.MANAGE_TENANT_USERS,
          Permission.MANAGE_TENANT_BILLING,
          Permission.MANAGE_TENANT_API_KEYS,
          Permission.MANAGE_CLIENTS,
          Permission.MANAGE_CLIENT_USERS,
          Permission.CUSTOMIZE_REPORTS,
          Permission.MANAGE_BRANDS,
          Permission.MANAGE_PRODUCTS,
          Permission.VIEW_BRAND_ANALYTICS,
          Permission.VIEW_REPORTS,
          Permission.VIEW_RECOMMENDATIONS,
          Permission.MANAGE_PROFILE
        ],
        scope: 'tenant',
        isCustom: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    mockClient.get.mockResolvedValueOnce({ data: mockRoles });

    const result = await roleService.getDefaultRoles();

    expect(result).toEqual(mockRoles);
    expect(mockClient.get).toHaveBeenCalledWith('/roles/defaults');
  });
});