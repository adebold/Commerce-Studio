import { VaraiClient } from './VaraiClient.js';

/**
 * Tenant status enum
 */
export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  ARCHIVED = 'archived'
}

/**
 * SSO Provider interface
 */
export interface SSOProvider {
  provider: 'google' | 'microsoft' | 'okta' | 'auth0' | 'saml';
  clientId?: string;
  clientSecret?: string;
  domain?: string;
  metadataUrl?: string;
  certificateData?: string;
  enabled: boolean;
}

/**
 * Password policy interface
 */
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  preventPasswordReuse: number;
}

/**
 * Tenant settings interface
 */
export interface TenantSettings {
  ssoEnabled: boolean;
  ssoProviders?: SSOProvider[];
  mfaEnabled?: boolean;
  mfaRequired?: boolean;
  passwordPolicy?: PasswordPolicy;
  sessionTimeoutMinutes?: number;
  allowedDomains?: string[];
  customBranding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    faviconUrl?: string;
  };
  apiRateLimits?: {
    requestsPerMinute: number;
    burstLimit: number;
  };
  featureFlags?: Record<string, boolean>;
}

/**
 * Tenant interface
 */
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  settings: TenantSettings;
  status: TenantStatus | string;
  plan?: string;
  billingEmail?: string;
  technicalContactEmail?: string;
  maxUsers?: number;
  maxClients?: number;
  maxBrands?: number;
}

/**
 * Parameters for creating a new tenant
 */
export interface TenantCreateParams {
  name: string;
  domain: string;
  adminEmail: string;
  plan?: string;
  billingEmail?: string;
  technicalContactEmail?: string;
  settings?: Partial<TenantSettings>;
}

/**
 * Parameters for updating a tenant
 */
export interface TenantUpdateParams {
  name?: string;
  domain?: string;
  plan?: string;
  billingEmail?: string;
  technicalContactEmail?: string;
  settings?: Partial<TenantSettings>;
  maxUsers?: number;
  maxClients?: number;
  maxBrands?: number;
}

/**
 * Parameters for listing tenants
 */
export interface TenantListParams {
  page?: number;
  pageSize?: number;
  status?: TenantStatus | string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Response for tenant operations
 */
export interface TenantResponse {
  data: Tenant;
}

/**
 * Response for listing tenants
 */
export interface TenantsListResponse {
  data: Tenant[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Service for managing tenants
 */
export class TenantService {
  private client: VaraiClient;

  constructor(client: VaraiClient) {
    this.client = client;
  }

  /**
   * Create a new tenant
   */
  async createTenant(params: TenantCreateParams): Promise<Tenant> {
    const response = await this.client.post<TenantResponse>('/tenants', params);
    return response.data;
  }

  /**
   * Get a tenant by ID
   */
  async getTenant(tenantId: string): Promise<Tenant> {
    const response = await this.client.get<TenantResponse>(`/tenants/${tenantId}`);
    return response.data;
  }

  /**
   * Update a tenant
   */
  async updateTenant(tenantId: string, params: TenantUpdateParams): Promise<Tenant> {
    const response = await this.client.patch<TenantResponse>(`/tenants/${tenantId}`, params);
    return response.data;
  }

  /**
   * Delete a tenant
   */
  async deleteTenant(tenantId: string): Promise<void> {
    await this.client.delete(`/tenants/${tenantId}`);
  }

  /**
   * List tenants with optional filtering
   */
  async listTenants(params?: TenantListParams): Promise<TenantsListResponse> {
    return await this.client.get<TenantsListResponse>('/tenants', { params });
  }

  /**
   * Get a tenant by domain
   */
  async getTenantByDomain(domain: string): Promise<Tenant> {
    const response = await this.client.get<TenantResponse>(`/tenants/domain/${domain}`);
    return response.data;
  }

  /**
   * Suspend a tenant
   */
  async suspendTenant(tenantId: string): Promise<Tenant> {
    const response = await this.client.post<TenantResponse>(`/tenants/${tenantId}/suspend`);
    return response.data;
  }

  /**
   * Activate a tenant
   */
  async activateTenant(tenantId: string): Promise<Tenant> {
    const response = await this.client.post<TenantResponse>(`/tenants/${tenantId}/activate`);
    return response.data;
  }

  /**
   * Get tenant audit logs
   */
  async getTenantAuditLogs(tenantId: string, params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    action?: string;
    userId?: string;
  }): Promise<{
    data: Array<{
      id: string;
      tenantId: string;
      userId: string;
      action: string;
      details: any;
      timestamp: string;
    }>;
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    return await this.client.get(`/tenants/${tenantId}/audit-logs`, { params });
  }

  /**
   * Get tenant usage metrics
   */
  async getTenantUsageMetrics(tenantId: string, params?: {
    startDate?: string;
    endDate?: string;
    metric?: 'api_calls' | 'storage' | 'users' | 'clients' | 'brands';
  }): Promise<{
    data: Array<{
      date: string;
      metric: string;
      value: number;
    }>;
  }> {
    return await this.client.get(`/tenants/${tenantId}/usage`, { params });
  }

  /**
   * Provision a new tenant with default settings and admin user
   */
  async provisionTenant(params: TenantCreateParams & {
    adminFirstName: string;
    adminLastName: string;
    adminPassword: string;
  }): Promise<{
    tenant: Tenant;
    adminUser: {
      id: string;
      email: string;
    };
    apiKey: string;
  }> {
    return await this.client.post('/tenants/provision', params);
  }

  /**
   * Deprovision a tenant and all associated data
   */
  async deprovisionTenant(tenantId: string, params: {
    confirmationCode: string;
    reason?: string;
  }): Promise<void> {
    await this.client.post(`/tenants/${tenantId}/deprovision`, params);
  }
}