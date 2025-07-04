import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { TenantService, Tenant, TenantSettings } from '../TenantService.js';
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

describe('TenantService', () => {
  let tenantService: TenantService;
  let mockClient: MockVaraiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    const client = new VaraiClient({
      apiUrl: 'https://api.varai.com',
      clientId: 'test_client_id',
      clientSecret: 'process.env.TENANT_SECRET'
    });
    tenantService = new TenantService(client);
    mockClient = (VaraiClient as jest.Mock).mock.results[0].value as MockVaraiClient;
  });

  test('createTenant creates a new tenant', async () => {
    const mockTenant: Tenant = {
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

    mockClient.post.mockResolvedValueOnce({ data: mockTenant });

    const result = await tenantService.createTenant({
      name: 'Test Tenant',
      domain: 'test.varai.ai',
      adminEmail: 'admin@test.varai.ai'
    });

    expect(result).toEqual(mockTenant);
    expect(mockClient.post).toHaveBeenCalledWith('/tenants', {
      name: 'Test Tenant',
      domain: 'test.varai.ai',
      adminEmail: 'admin@test.varai.ai'
    });
  });

  test('getTenant retrieves a tenant by ID', async () => {
    const mockTenant: Tenant = {
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

    mockClient.get.mockResolvedValueOnce({ data: mockTenant });

    const result = await tenantService.getTenant('tenant-123');

    expect(result).toEqual(mockTenant);
    expect(mockClient.get).toHaveBeenCalledWith('/tenants/tenant-123');
  });

  test('updateTenant updates a tenant', async () => {
    const mockTenant: Tenant = {
      id: 'tenant-123',
      name: 'Updated Tenant',
      domain: 'test.varai.ai',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        ssoEnabled: true,
        mfaEnabled: true
      },
      status: 'active'
    };

    mockClient.patch.mockResolvedValueOnce({ data: mockTenant });

    const result = await tenantService.updateTenant('tenant-123', {
      name: 'Updated Tenant',
      settings: {
        ssoEnabled: true,
        mfaEnabled: true
      }
    });

    expect(result).toEqual(mockTenant);
    expect(mockClient.patch).toHaveBeenCalledWith('/tenants/tenant-123', {
      name: 'Updated Tenant',
      settings: {
        ssoEnabled: true,
        mfaEnabled: true
      }
    });
  });

  test('deleteTenant deletes a tenant', async () => {
    mockClient.delete.mockResolvedValueOnce(undefined);

    await tenantService.deleteTenant('tenant-123');

    expect(mockClient.delete).toHaveBeenCalledWith('/tenants/tenant-123');
  });

  test('listTenants retrieves a list of tenants', async () => {
    const mockResponse = {
      data: [
        {
          id: 'tenant-123',
          name: 'Test Tenant 1',
          domain: 'test1.varai.ai',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          settings: { ssoEnabled: false },
          status: 'active'
        },
        {
          id: 'tenant-456',
          name: 'Test Tenant 2',
          domain: 'test2.varai.ai',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          settings: { ssoEnabled: true },
          status: 'active'
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

    const result = await tenantService.listTenants({
      page: 1,
      pageSize: 10,
      status: 'active'
    });

    expect(result).toEqual(mockResponse);
    expect(mockClient.get).toHaveBeenCalledWith('/tenants', {
      params: {
        page: 1,
        pageSize: 10,
        status: 'active'
      }
    });
  });

  test('getTenantByDomain retrieves a tenant by domain', async () => {
    const mockTenant: Tenant = {
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

    mockClient.get.mockResolvedValueOnce({ data: mockTenant });

    const result = await tenantService.getTenantByDomain('test.varai.ai');

    expect(result).toEqual(mockTenant);
    expect(mockClient.get).toHaveBeenCalledWith('/tenants/domain/test.varai.ai');
  });

  test('suspendTenant suspends a tenant', async () => {
    const mockTenant: Tenant = {
      id: 'tenant-123',
      name: 'Test Tenant',
      domain: 'test.varai.ai',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        ssoEnabled: false
      },
      status: 'suspended'
    };

    mockClient.post.mockResolvedValueOnce({ data: mockTenant });

    const result = await tenantService.suspendTenant('tenant-123');

    expect(result).toEqual(mockTenant);
    expect(mockClient.post).toHaveBeenCalledWith('/tenants/tenant-123/suspend');
  });

  test('activateTenant activates a tenant', async () => {
    const mockTenant: Tenant = {
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

    mockClient.post.mockResolvedValueOnce({ data: mockTenant });

    const result = await tenantService.activateTenant('tenant-123');

    expect(result).toEqual(mockTenant);
    expect(mockClient.post).toHaveBeenCalledWith('/tenants/tenant-123/activate');
  });

  test('getTenantAuditLogs retrieves audit logs for a tenant', async () => {
    const mockAuditLogs = {
      data: [
        {
          id: 'log-123',
          tenantId: 'tenant-123',
          userId: 'user-123',
          action: 'tenant.update',
          details: { name: { from: 'Old Name', to: 'New Name' } },
          timestamp: new Date().toISOString()
        }
      ],
      pagination: {
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      }
    };

    mockClient.get.mockResolvedValueOnce(mockAuditLogs);

    const result = await tenantService.getTenantAuditLogs('tenant-123', {
      page: 1,
      pageSize: 10,
      startDate: '2025-01-01',
      endDate: '2025-04-30'
    });

    expect(result).toEqual(mockAuditLogs);
    expect(mockClient.get).toHaveBeenCalledWith('/tenants/tenant-123/audit-logs', {
      params: {
        page: 1,
        pageSize: 10,
        startDate: '2025-01-01',
        endDate: '2025-04-30'
      }
    });
  });
});