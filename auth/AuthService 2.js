import { VaraiClient } from './VaraiClient.js';
import { TenantService } from './TenantService.js';
import { RoleService, Permission } from './RoleService.js';

/**
 * Service for handling authentication and authorization
 */
export class AuthService {
  constructor(config) {
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
  getOAuthUrl(state) {
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
  async exchangeCode(code) {
    const params = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri
    };
    
    if (this.tenantId) {
      params.tenant_id = this.tenantId;
    }
    
    const response = await this.client.post('/oauth/token', params);
    
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
  async refreshToken(refreshToken) {
    const params = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    };
    
    if (this.tenantId) {
      params.tenant_id = this.tenantId;
    }
    
    const response = await this.client.post('/oauth/token', params);
    
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
  async createOrUpdateAccount(params) {
    const data = {
      ...params,
      platform: this.platform
    };
    
    if (this.tenantId) {
      data.tenantId = this.tenantId;
    }
    
    const response = await this.client.post('/accounts', data);
    return response.data;
  }

  /**
   * Get user profile
   */
  async getProfile(token) {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {}
    };
    
    if (this.tenantId) {
      config.params.tenant_id = this.tenantId;
    }
    
    const response = await this.client.get('/accounts/profile', config);
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(token, params) {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {}
    };
    
    if (this.tenantId) {
      config.params.tenant_id = this.tenantId;
    }
    
    const response = await this.client.patch(
      '/accounts/profile',
      params,
      config
    );
    
    return response.data;
  }

  /**
   * Delete user account
   */
  async deleteAccount(token) {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {}
    };
    
    if (this.tenantId) {
      config.params.tenant_id = this.tenantId;
    }
    
    await this.client.delete('/accounts', config);
  }

  /**
   * Link platform account
   */
  async linkPlatformAccount(token, params) {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {}
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
  async unlinkPlatformAccount(token) {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {}
    };
    
    if (this.tenantId) {
      config.params.tenant_id = this.tenantId;
    }
    
    await this.client.delete(`/accounts/platforms/${this.platform}`, config);
  }

  /**
   * Get auth context with roles and permissions
   */
  async getAuthContext(token) {
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
  async hasPermission(token, permission, context) {
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
  getTenantService() {
    if (!this.tenantService) {
      this.tenantService = new TenantService(this.client);
    }
    return this.tenantService;
  }

  /**
   * Get role service instance
   */
  getRoleService() {
    if (!this.roleService) {
      this.roleService = new RoleService(this.client);
    }
    return this.roleService;
  }

  /**
   * Set tenant ID
   */
  setTenantId(tenantId) {
    this.tenantId = tenantId;
    this.client.setTenantId(tenantId);
  }

  /**
   * Get tenant ID
   */
  getTenantId() {
    return this.tenantId;
  }

  /**
   * Clear tenant ID
   */
  clearTenantId() {
    this.tenantId = null;
    this.client.clearTenantId();
  }

  /**
   * Initialize password reset flow
   */
  async initiatePasswordReset(email) {
    const params = {
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
  async completePasswordReset(token, newPassword) {
    const params = {
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
  async verifyEmail(token) {
    const params = {
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
  async inviteUser(token, params) {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {}
    };
    
    const inviteParams = { ...params };
    
    if (this.tenantId) {
      config.params.tenant_id = this.tenantId;
      inviteParams.tenantId = this.tenantId;
    }
    
    await this.client.post('/users/invite', inviteParams, config);
  }

  /**
   * Accept user invitation
   */
  async acceptInvitation(invitationToken, params) {
    const requestParams = {
      ...params,
      token: invitationToken
    };
    
    if (this.tenantId) {
      requestParams.tenant_id = this.tenantId;
    }
    
    const response = await this.client.post('/users/accept-invitation', requestParams);
    
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      profile: response.profile,
      tenant: response.tenant
    };
  }
}