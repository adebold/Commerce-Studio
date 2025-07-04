import { VaraiClient } from './VaraiClient.js';

/**
 * Permission enum defining all available permissions in the system
 */
export enum Permission {
  // System-level permissions
  MANAGE_SYSTEM = 'manage_system',
  MANAGE_TENANTS = 'manage_tenants',
  VIEW_GLOBAL_ANALYTICS = 'view_global_analytics',
  MANAGE_ML_MODELS = 'manage_ml_models',
  
  // Tenant-level permissions
  MANAGE_TENANT_SETTINGS = 'manage_tenant_settings',
  MANAGE_TENANT_USERS = 'manage_tenant_users',
  MANAGE_TENANT_BILLING = 'manage_tenant_billing',
  MANAGE_TENANT_API_KEYS = 'process.env.API_KEY_240',
  
  // Client-level permissions
  MANAGE_CLIENTS = 'manage_clients',
  MANAGE_CLIENT_USERS = 'manage_client_users',
  CUSTOMIZE_REPORTS = 'customize_reports',
  
  // Brand-level permissions
  MANAGE_BRANDS = 'manage_brands',
  MANAGE_PRODUCTS = 'manage_products',
  VIEW_BRAND_ANALYTICS = 'view_brand_analytics',
  
  // Basic permissions
  VIEW_REPORTS = 'view_reports',
  VIEW_RECOMMENDATIONS = 'view_recommendations',
  MANAGE_PROFILE = 'manage_profile'
}

/**
 * Role enum defining predefined roles in the system
 */
export enum Role {
  SYSTEM_ADMIN = 'system_admin',
  TENANT_ADMIN = 'tenant_admin',
  TENANT_MANAGER = 'tenant_manager',
  CLIENT_ADMIN = 'client_admin',
  CLIENT_MANAGER = 'client_manager',
  BRAND_MANAGER = 'brand_manager',
  VIEWER = 'viewer'
}

/**
 * Role definition interface
 */
export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  scope: 'system' | 'tenant' | 'client' | 'brand';
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Role assignment interface
 */
export interface RoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  tenantId?: string;
  clientId?: string;
  brandId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a new role
 */
export interface CreateRoleParams {
  name: string;
  description: string;
  permissions: Permission[];
  scope: 'system' | 'tenant' | 'client' | 'brand';
}

/**
 * Parameters for updating a role
 */
export interface UpdateRoleParams {
  name?: string;
  description?: string;
  permissions?: Permission[];
}

/**
 * Parameters for assigning a role to a user
 */
export interface AssignRoleParams {
  userId: string;
  roleId: string;
  tenantId?: string;
  clientId?: string;
  brandId?: string;
}

/**
 * Parameters for checking permissions
 */
export interface CheckPermissionParams {
  userId: string;
  permission: Permission;
  tenantId?: string;
  clientId?: string;
  brandId?: string;
}

/**
 * Response for role operations
 */
export interface RoleResponse {
  data: RoleDefinition;
}

/**
 * Response for listing roles
 */
export interface RolesListResponse {
  data: RoleDefinition[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Response for role assignment operations
 */
export interface RoleAssignmentResponse {
  data: RoleAssignment;
}

/**
 * Response for listing role assignments
 */
export interface RoleAssignmentsListResponse {
  data: RoleAssignment[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Service for managing roles and permissions
 */
export class RoleService {
  private client: VaraiClient;

  constructor(client: VaraiClient) {
    this.client = client;
  }

  /**
   * Create a new role
   */
  async createRole(params: CreateRoleParams): Promise<RoleDefinition> {
    const response = await this.client.post<RoleResponse>('/roles', params);
    return response.data;
  }

  /**
   * Get a role by ID
   */
  async getRole(roleId: string): Promise<RoleDefinition> {
    const response = await this.client.get<RoleResponse>(`/roles/${roleId}`);
    return response.data;
  }

  /**
   * Update a role
   */
  async updateRole(roleId: string, params: UpdateRoleParams): Promise<RoleDefinition> {
    const response = await this.client.patch<RoleResponse>(`/roles/${roleId}`, params);
    return response.data;
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: string): Promise<void> {
    await this.client.delete(`/roles/${roleId}`);
  }

  /**
   * List roles with optional filtering
   */
  async listRoles(params?: {
    page?: number;
    pageSize?: number;
    scope?: 'system' | 'tenant' | 'client' | 'brand';
    search?: string;
    isCustom?: boolean;
  }): Promise<RolesListResponse> {
    return await this.client.get<RolesListResponse>('/roles', { params });
  }

  /**
   * Assign a role to a user
   */
  async assignRole(params: AssignRoleParams): Promise<RoleAssignment> {
    const response = await this.client.post<RoleAssignmentResponse>('/role-assignments', params);
    return response.data;
  }

  /**
   * Remove a role assignment
   */
  async removeRoleAssignment(assignmentId: string): Promise<void> {
    await this.client.delete(`/role-assignments/${assignmentId}`);
  }

  /**
   * Get role assignments for a user
   */
  async getUserRoleAssignments(userId: string, params?: {
    tenantId?: string;
    clientId?: string;
    brandId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<RoleAssignmentsListResponse> {
    return await this.client.get<RoleAssignmentsListResponse>(
      `/users/${userId}/role-assignments`,
      { params }
    );
  }

  /**
   * Check if a user has a specific permission
   */
  async checkPermission(params: CheckPermissionParams): Promise<{ hasPermission: boolean }> {
    return await this.client.post<{ hasPermission: boolean }>('/permissions/check', params);
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string, params?: {
    tenantId?: string;
    clientId?: string;
    brandId?: string;
  }): Promise<{ permissions: Permission[] }> {
    return await this.client.get<{ permissions: Permission[] }>(
      `/users/${userId}/permissions`,
      { params }
    );
  }

  /**
   * Get default system roles
   */
  async getDefaultRoles(): Promise<RoleDefinition[]> {
    const response = await this.client.get<{ data: RoleDefinition[] }>('/roles/defaults');
    return response.data;
  }
}