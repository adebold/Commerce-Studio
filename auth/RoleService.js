/**
 * Permission enum defining all available permissions in the system
 */
export const Permission = {
  // System-level permissions
  MANAGE_SYSTEM: 'manage_system',
  MANAGE_TENANTS: 'manage_tenants',
  VIEW_GLOBAL_ANALYTICS: 'view_global_analytics',
  MANAGE_ML_MODELS: 'manage_ml_models',
  
  // Tenant-level permissions
  MANAGE_TENANT_SETTINGS: 'manage_tenant_settings',
  MANAGE_TENANT_USERS: 'manage_tenant_users',
  MANAGE_TENANT_BILLING: 'manage_tenant_billing',
  MANAGE_TENANT_API_KEYS: 'process.env.API_KEY_239',
  
  // Client-level permissions
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_CLIENT_USERS: 'manage_client_users',
  CUSTOMIZE_REPORTS: 'customize_reports',
  
  // Brand-level permissions
  MANAGE_BRANDS: 'manage_brands',
  MANAGE_PRODUCTS: 'manage_products',
  VIEW_BRAND_ANALYTICS: 'view_brand_analytics',
  
  // Basic permissions
  VIEW_REPORTS: 'view_reports',
  VIEW_RECOMMENDATIONS: 'view_recommendations',
  MANAGE_PROFILE: 'manage_profile'
};

/**
 * Role enum defining predefined roles in the system
 */
export const Role = {
  SYSTEM_ADMIN: 'system_admin',
  TENANT_ADMIN: 'tenant_admin',
  TENANT_MANAGER: 'tenant_manager',
  CLIENT_ADMIN: 'client_admin',
  CLIENT_MANAGER: 'client_manager',
  BRAND_MANAGER: 'brand_manager',
  VIEWER: 'viewer'
};

/**
 * Service for managing roles and permissions
 */
export class RoleService {
  constructor(client) {
    this.client = client;
  }

  /**
   * Create a new role
   */
  async createRole(params) {
    const response = await this.client.post('/roles', params);
    return response.data;
  }

  /**
   * Get a role by ID
   */
  async getRole(roleId) {
    const response = await this.client.get(`/roles/${roleId}`);
    return response.data;
  }

  /**
   * Update a role
   */
  async updateRole(roleId, params) {
    const response = await this.client.patch(`/roles/${roleId}`, params);
    return response.data;
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId) {
    await this.client.delete(`/roles/${roleId}`);
  }

  /**
   * List roles with optional filtering
   */
  async listRoles(params) {
    return await this.client.get('/roles', { params });
  }

  /**
   * Assign a role to a user
   */
  async assignRole(params) {
    const response = await this.client.post('/role-assignments', params);
    return response.data;
  }

  /**
   * Remove a role assignment
   */
  async removeRoleAssignment(assignmentId) {
    await this.client.delete(`/role-assignments/${assignmentId}`);
  }

  /**
   * Get role assignments for a user
   */
  async getUserRoleAssignments(userId, params) {
    return await this.client.get(
      `/users/${userId}/role-assignments`,
      { params }
    );
  }

  /**
   * Check if a user has a specific permission
   */
  async checkPermission(params) {
    return await this.client.post('/permissions/check', params);
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId, params) {
    return await this.client.get(
      `/users/${userId}/permissions`,
      { params }
    );
  }

  /**
   * Get default system roles
   */
  async getDefaultRoles() {
    const response = await this.client.get('/roles/defaults');
    return response.data;
  }
}