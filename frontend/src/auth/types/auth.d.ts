declare module '../../../auth/AuthService' {
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

  export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    profile?: UserProfile;
    tenant?: Tenant;
  }

  export interface AuthContext {
    userId: string;
    tenantId?: string;
    clientId?: string;
    brandId?: string;
    roles: string[];
    permissions: string[];
  }

  export interface Tenant {
    id: string;
    name: string;
    domain: string;
    createdAt: string;
    updatedAt: string;
    settings: {
      ssoEnabled: boolean;
      ssoProviders?: Array<{
        provider: string;
        enabled: boolean;
        clientId?: string;
        domain?: string;
      }>;
      mfaEnabled?: boolean;
      mfaRequired?: boolean;
      customBranding?: {
        logoUrl?: string;
        primaryColor?: string;
        secondaryColor?: string;
      };
    };
    status: string;
  }

  export interface AuthConfig {
    varaiApiUrl: string;
    varaiClientId: string;
    varaiClientSecret: string;
    platform: string;
    redirectUri: string;
    tenantId?: string;
  }

  export class TenantService {
    constructor(client: any);
    createTenant(params: any): Promise<Tenant>;
    getTenant(tenantId: string): Promise<Tenant>;
    updateTenant(tenantId: string, params: any): Promise<Tenant>;
    deleteTenant(tenantId: string): Promise<void>;
    listTenants(params?: any): Promise<{ data: Tenant[]; pagination: any }>;
    getTenantByDomain(domain: string): Promise<Tenant>;
    suspendTenant(tenantId: string): Promise<Tenant>;
    activateTenant(tenantId: string): Promise<Tenant>;
    getTenantAuditLogs(tenantId: string, params?: any): Promise<any>;
    getTenantUsageMetrics(tenantId: string, params?: any): Promise<any>;
    updateTenantBranding(tenantId: string, branding: any): Promise<Tenant>;
    configureTenantSSO(tenantId: string, ssoConfig: any): Promise<Tenant>;
    updatePasswordPolicy(tenantId: string, passwordPolicy: any): Promise<Tenant>;
  }

  export class RoleService {
    constructor(client: any);
    createRole(params: any): Promise<any>;
    getRole(roleId: string): Promise<any>;
    updateRole(roleId: string, params: any): Promise<any>;
    deleteRole(roleId: string): Promise<void>;
    listRoles(params?: any): Promise<any>;
    assignRole(params: any): Promise<any>;
    removeRoleAssignment(assignmentId: string): Promise<void>;
    getUserRoleAssignments(userId: string, params?: any): Promise<any>;
    checkPermission(params: any): Promise<{ hasPermission: boolean }>;
    getUserPermissions(userId: string, params?: any): Promise<{ permissions: string[] }>;
    getDefaultRoles(): Promise<any[]>;
  }

  export class AuthService {
    constructor(config: AuthConfig);
    getOAuthUrl(state: string): string;
    exchangeCode(code: string): Promise<TokenResponse>;
    refreshToken(refreshToken: string): Promise<TokenResponse>;
    createOrUpdateAccount(params: any): Promise<UserProfile>;
    getProfile(token: string): Promise<UserProfile>;
    updateProfile(token: string, params: any): Promise<UserProfile>;
    deleteAccount(token: string): Promise<void>;
    linkPlatformAccount(token: string, params: any): Promise<void>;
    unlinkPlatformAccount(token: string): Promise<void>;
    getAuthContext(token: string): Promise<AuthContext>;
    hasPermission(token: string, permission: string, context?: any): Promise<boolean>;
    getTenantService(): TenantService;
    getRoleService(): RoleService;
    setTenantId(tenantId: string): void;
    getTenantId(): string | null;
    clearTenantId(): void;
    initiatePasswordReset(email: string): Promise<void>;
    completePasswordReset(token: string, newPassword: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    inviteUser(token: string, params: any): Promise<void>;
    acceptInvitation(invitationToken: string, params: any): Promise<TokenResponse>;
  }
}