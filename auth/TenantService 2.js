/**
 * Tenant status enum
 */
export const TenantStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  ARCHIVED: 'archived'
};

/**
 * Service for managing tenants
 */
export class TenantService {
  constructor(client) {
    this.client = client;
  }

  /**
   * Create a new tenant
   */
  async createTenant(params) {
    const response = await this.client.post('/tenants', params);
    return response.data;
  }

  /**
   * Get a tenant by ID
   */
  async getTenant(tenantId) {
    const response = await this.client.get(`/tenants/${tenantId}`);
    return response.data;
  }

  /**
   * Update a tenant
   */
  async updateTenant(tenantId, params) {
    const response = await this.client.patch(`/tenants/${tenantId}`, params);
    return response.data;
  }

  /**
   * Delete a tenant
   */
  async deleteTenant(tenantId) {
    await this.client.delete(`/tenants/${tenantId}`);
  }

  /**
   * List tenants with optional filtering
   */
  async listTenants(params) {
    return await this.client.get('/tenants', { params });
  }

  /**
   * Get a tenant by domain
   */
  async getTenantByDomain(domain) {
    const response = await this.client.get(`/tenants/domain/${domain}`);
    return response.data;
  }

  /**
   * Suspend a tenant
   */
  async suspendTenant(tenantId) {
    const response = await this.client.post(`/tenants/${tenantId}/suspend`);
    return response.data;
  }

  /**
   * Activate a tenant
   */
  async activateTenant(tenantId) {
    const response = await this.client.post(`/tenants/${tenantId}/activate`);
    return response.data;
  }

  /**
   * Get tenant audit logs
   */
  async getTenantAuditLogs(tenantId, params) {
    return await this.client.get(`/tenants/${tenantId}/audit-logs`, { params });
  }

  /**
   * Get tenant usage metrics
   */
  async getTenantUsageMetrics(tenantId, params) {
    return await this.client.get(`/tenants/${tenantId}/usage`, { params });
  }

  /**
   * Provision a new tenant with default settings and admin user
   */
  async provisionTenant(params) {
    return await this.client.post('/tenants/provision', params);
  }

  /**
   * Deprovision a tenant and all associated data
   */
  async deprovisionTenant(tenantId, params) {
    await this.client.post(`/tenants/${tenantId}/deprovision`, params);
  }

  /**
   * Update tenant branding
   */
  async updateTenantBranding(tenantId, branding) {
    const response = await this.client.patch(`/tenants/${tenantId}/branding`, branding);
    return response.data;
  }

  /**
   * Configure tenant SSO settings
   */
  async configureTenantSSO(tenantId, ssoConfig) {
    const response = await this.client.patch(`/tenants/${tenantId}/sso`, ssoConfig);
    return response.data;
  }

  /**
   * Update tenant password policy
   */
  async updatePasswordPolicy(tenantId, passwordPolicy) {
    const response = await this.client.patch(`/tenants/${tenantId}/password-policy`, passwordPolicy);
    return response.data;
  }

  /**
   * Get tenant users
   */
  async getTenantUsers(tenantId, params) {
    return await this.client.get(`/tenants/${tenantId}/users`, { params });
  }

  /**
   * Get tenant clients
   */
  async getTenantClients(tenantId, params) {
    return await this.client.get(`/tenants/${tenantId}/clients`, { params });
  }

  /**
   * Get tenant API keys
   */
  async getTenantApiKeys(tenantId) {
    return await this.client.get(`/tenants/${tenantId}/api-keys`);
  }

  /**
   * Create tenant API key
   */
  async createTenantApiKey(tenantId, params) {
    const response = await this.client.post(`/tenants/${tenantId}/api-keys`, params);
    return response.data;
  }

  /**
   * Revoke tenant API key
   */
  async revokeTenantApiKey(tenantId, keyId) {
    await this.client.delete(`/tenants/${tenantId}/api-keys/${keyId}`);
  }
}