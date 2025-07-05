import { jest } from '@jest/globals';
import { Permission } from '../RoleService.js';

export interface MockVaraiClient {
  get: jest.Mock<any>;
  post: jest.Mock<any>;
  put: jest.Mock<any>;
  patch: jest.Mock<any>;
  delete: jest.Mock<any>;
  getApiUrl: jest.Mock<any>;
  getClientId: jest.Mock<any>;
  setAccessToken: jest.Mock<any>;
  clearAccessToken: jest.Mock<any>;
  setTenantId: jest.Mock<any>;
  clearTenantId: jest.Mock<any>;
  getTenantId: jest.Mock<any>;
}

export interface MockTenantService {
  createTenant: jest.Mock<any>;
  getTenant: jest.Mock<any>;
  updateTenant: jest.Mock<any>;
  deleteTenant: jest.Mock<any>;
  listTenants: jest.Mock<any>;
  getTenantByDomain: jest.Mock<any>;
  suspendTenant: jest.Mock<any>;
  activateTenant: jest.Mock<any>;
  getTenantAuditLogs: jest.Mock<any>;
}

export interface MockRoleService {
  createRole: jest.Mock<any>;
  getRole: jest.Mock<any>;
  updateRole: jest.Mock<any>;
  deleteRole: jest.Mock<any>;
  listRoles: jest.Mock<any>;
  assignRole: jest.Mock<any>;
  removeRoleAssignment: jest.Mock<any>;
  getUserRoleAssignments: jest.Mock<any>;
  checkPermission: jest.Mock<any>;
  getUserPermissions: jest.Mock<any>;
  getDefaultRoles: jest.Mock<any>;
}

export type MockFunction<T> = jest.Mock<any, any, any, Promise<T>>;

export type MockResponse<T> = {
  data: T;
};

export type MockTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  profile?: {
    id: string;
    email: string;
    platform: string;
    storeId: string;
    tenantId?: string;
    roles?: string[];
    createdAt: string;
    updatedAt: string;
  };
  tenant?: {
    id: string;
    name: string;
    domain: string;
    createdAt: string;
    updatedAt: string;
    settings: {
      ssoEnabled: boolean;
    };
    status: string;
  };
};

export type MockProfile = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  platform: string;
  storeId: string;
  tenantId?: string;
  roles?: string[];
  createdAt: string;
  updatedAt: string;
};

export type MockTenant = {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    ssoEnabled: boolean;
  };
  status: string;
};

export type MockAuthContext = {
  userId: string;
  tenantId?: string;
  clientId?: string;
  brandId?: string;
  roles: string[];
  permissions: Permission[];
};
