// Mock AuthService for testing purposes

export interface AuthServiceConfig {
  varaiApiUrl: string;
  varaiClientId: string;
  varaiClientSecret: string;
  platform: string;
  redirectUri: string;
}

export interface AuthContext {
  userId: string;
  roles: string[];
  permissions: string[];
  tenantId?: string;
  clientId?: string;
  brandId?: string;
}

export interface UserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private config: AuthServiceConfig;
  private tenantId: string | null = null;

  constructor(config: AuthServiceConfig) {
    this.config = config;
  }

  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }

  clearTenantId(): void {
    this.tenantId = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAuthContext(_token: string): Promise<AuthContext> {
    // Mock implementation
    return {
      userId: 'user-123',
      roles: ['user'],
      permissions: ['read:products', 'write:products'],
      tenantId: this.tenantId || undefined
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getProfile(_token: string): Promise<UserProfile> {
    // Mock implementation
    return {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    };
  }

  getOAuthUrl(state: string): string {
    // Mock implementation
    return `${this.config.varaiApiUrl}/oauth/authorize?client_id=${this.config.varaiClientId}&redirect_uri=${encodeURIComponent(this.config.redirectUri)}&state=${state}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async refreshToken(_refreshToken: string): Promise<TokenResponse> {
    // Mock implementation
    return {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token'
    };
  }

  getTenantService(): {
    listTenants: (params: { status: string }) => Promise<{ data: Array<{ id: string; name: string; status: string }> }>
  } {
    // Mock implementation
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      listTenants: async (_params: { status: string }) => {
        return {
          data: [
            { id: 'tenant-1', name: 'Tenant 1', status: 'active' },
            { id: 'tenant-2', name: 'Tenant 2', status: 'active' }
          ]
        };
      }
    };
  }
}