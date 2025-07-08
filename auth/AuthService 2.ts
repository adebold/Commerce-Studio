import { VaraiClient } from './VaraiClient.js';
import { TenantService } from './TenantService.js';
import { RoleService, Permission } from './RoleService.js';
import { Tenant } from './TenantService.js';

/**
 * Auth configuration interface
 */
export interface AuthConfig {
  varaiApiUrl: string;
  varaiClientId: string;
  varaiClientSecret: string;
  platform: string;
  redirectUri: string;
  tenantId?: string;
}

/**
 * User profile interface
 */
export interface UserProfile {
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
  lastLoginAt?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  mfaEnabled?: boolean;
  preferences?: Record<string, any>;
}

/**
 * Token response interface
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  profile?: UserProfile;
  tenant?: Tenant;
}

/**
 * Account response interface
 */
export interface AccountResponse {
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
}

/**
 * Auth context interface
 */
export interface AuthContext {
  userId: string;
  tenantId?: string;
  clientId?: string;
  brandId?: string;
  roles: string[];
  permissions: Permission[];
}

/**
 * Service for handling authentication and authorization
 */
export class AuthService {
  private client: VaraiClient;
  private tenantService: TenantService | null = null;
  private roleService: RoleService | null = null;
  private platform: string;
  private redirectUri: string;
  private tenantId: string | null = null;

  constructor(config: AuthConfig) {
    this.client = new VaraiClient({
      apiUrl: config.varaiApiUrl,
      clientId: config.varaiClientId,
      clientSecret: config.varaiClientSecret
    });
    
    this.platform = config.platform;
    this.redirectUri = config.redirectUri;
    this.tenantId = config.tenantId || null;
    
    if (this.tenantId) {
      this.client.setTenantId(this.tenantId);
    }
  }

  /**
   * Get the OAuth URL for authentication
   */
  getOAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.client.getClientId(),
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state,
      platform: this.platform
    });
    
    if (this.tenantId) {
      params.append('tenant_id', this.tenantId);
    }
    
    return `${this.client.getApiUrl()}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(code: string): Promise<TokenResponse> {
    const params: any = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri
    };
    
    if (this.tenantId) {
      params.tenant_id = this.tenantId;
    }
    
    const response = await this.client.post<any>('/oauth/token', params);
    
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      profile: response.profile,
      tenant: response.tenant
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const params: any = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    };
    
    if (this.tenantId) {
      params.tenant_id = this.tenantId;
    }
    
    const response = await this.client.post<any>('/oauth/token', params);
    
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      tenant: response.tenant
    };
  }

  /**
   * Create or update a user account
   */
  async createOrUpdateAccount(params: {
    email: string;
    firstName?: string;
    lastName?: string;
    storeId: string;
    platformToken: string;
    roles?: string[];
  }): Promise<UserProfile> {
    const data: any = {
      ...params,
      platform: this.platform
    };
    
    if (this.tenantId) {
      data.tenantId = this.tenantId;
    }
    
    const response = await this.client.post<{ data: UserProfile }>('/accounts', data);
    return response.data;
  }

  /**
   * Get user profile
   */
  async getProfile(token: string): Promise<UserProfile> {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {} as Record<string, any>
    };
    
    if (this.tenantId) {
      config.params.tenant_id = this.tenantId;
    }
    
    const response = await this.client.get<{ data: UserProfile }>('/accounts/profile', config);
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(token: string, params: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    phoneNumber?: string;
    preferences?: Record<string, any>;
  }): Promise<UserProfile> {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {} as Record<string, any>
    };
    
    if (this.tenantId) {
      config.params.tenant_id = this.tenantId;
    }
    
    const response = await this.client.patch<{ data: UserProfile }>(
      '/accounts/profile',
      params,
      config
    );
    
    return response.data;
  }

  /**
   * Delete user account
   */
  async deleteAccount(token: string): Promise<void> {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {} as Record<string, any>
    };
    
    if (this.tenantId) {
      config.params.tenant_id = this.tenantId;
    }
    
    await this.client.delete('/accounts', config);
  }

  /**
   * Link platform account
   */
  async linkPlatformAccount(token: string, params: {
    storeId: string;
    platformToken: string;
  }): Promise<void> {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {} as Record<string, any>
    };
    
    if (this.tenantId) {
      config.params.tenant_id = this.tenantId;
    }
    
    await this.client.post(
      '/accounts/platforms',
      {
        platform: this.platform,
        ...params
      },
      config
    );
  }

  /**
   * Unlink platform account
   */
  async unlinkPlatformAccount(token: string): Promise<void> {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {} as Record<string, any>
    };
    
    if (this.tenantId) {
      config.params.tenant_id = this.tenantId;
    }
    
    await this.client.delete(`/accounts/platforms/${this.platform}`, config);
  }

  /**
   * Get auth context with roles and permissions
   */
  async getAuthContext(token: string): Promise<AuthContext> {
    this.client.setAccessToken(token);
    
    const profile = await this.getProfile(token);
    const roleService = this.getRoleService();
    
    const permissionsResponse = await roleService.getUserPermissions(profile.id, {
      tenantId: profile.tenantId
    });
    
    return {
      userId: profile.id,
      tenantId: profile.tenantId,
      roles: profile.roles || [],
      permissions: permissionsResponse.permissions
    };
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(
    token: string,
    permission: Permission,
    context?: {
      clientId?: string;
      brandId?: string;
    }
  ): Promise<boolean> {
    this.client.setAccessToken(token);
    
    const profile = await this.getProfile(token);
    const roleService = this.getRoleService();
    
    const response = await roleService.checkPermission({
      userId: profile.id,
      permission,
      tenantId: profile.tenantId,
      clientId: context?.clientId,
      brandId: context?.brandId
    });
    
    return response.hasPermission;
  }

  /**
   * Get tenant service instance
   */
  getTenantService(): TenantService {
    if (!this.tenantService) {
      this.tenantService = new TenantService(this.client);
    }
    return this.tenantService;
  }

  /**
   * Get role service instance
   */
  getRoleService(): RoleService {
    if (!this.roleService) {
      this.roleService = new RoleService(this.client);
    }
    return this.roleService;
  }

  /**
   * Set tenant ID
   */
  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
    this.client.setTenantId(tenantId);
  }

  /**
   * Get tenant ID
   */
  getTenantId(): string | null {
    return this.tenantId;
  }

  /**
   * Clear tenant ID
   */
  clearTenantId(): void {
    this.tenantId = null;
    this.client.clearTenantId();
  }

  /**
   * Initialize password reset flow
   */
  async initiatePasswordReset(email: string): Promise<void> {
    const params: any = {
      email,
      platform: this.platform
    };
    
    if (this.tenantId) {
      params.tenant_id = this.tenantId;
    }
    
    await this.client.post('/auth/password-reset/initiate', params);
  }

  /**
   * Complete password reset
   */
  async completePasswordReset(token: string, newPassword: string): Promise<void> {
    const params: any = {
      token,
      newPassword
    };
    
    if (this.tenantId) {
      params.tenant_id = this.tenantId;
    }
    
    await this.client.post('/auth/password-reset/complete', params);
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    const params: any = {
      token
    };
    
    if (this.tenantId) {
      params.tenant_id = this.tenantId;
    }
    
    await this.client.post('/auth/verify-email', params);
  }

  /**
   * Send invitation to a new user
   */
  async inviteUser(token: string, params: {
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    clientId?: string;
    brandId?: string;
    message?: string;
  }): Promise<void> {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {} as Record<string, any>
    };
    
    const inviteParams: any = { ...params };
    
    if (this.tenantId) {
      config.params.tenant_id = this.tenantId;
      inviteParams.tenantId = this.tenantId;
    }
    
    await this.client.post('/users/invite', inviteParams, config);
  }

  /**
   * Accept user invitation
   */
  async acceptInvitation(invitationToken: string, params: {
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<TokenResponse> {
    const requestParams: any = {
      ...params,
      token: invitationToken
    };
    
    if (this.tenantId) {
      requestParams.tenant_id = this.tenantId;
    }
    
    const response = await this.client.post<any>('/users/accept-invitation', requestParams);
    
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      profile: response.profile,
      tenant: response.tenant
    };
  }
}
