export { AuthService } from './AuthService.js';
export { VaraiClient } from './VaraiClient.js';
export { TenantService } from './TenantService.js';
export { RoleService, Permission, Role } from './RoleService.js';

export type {
  AuthConfig,
  UserProfile,
  TokenResponse,
  AccountResponse,
  AuthContext,
} from './AuthService.js';

export type {
  Tenant,
  TenantSettings,
  SSOProvider,
  PasswordPolicy,
  TenantStatus,
  TenantCreateParams,
  TenantUpdateParams,
  TenantResponse,
  TenantsListResponse,
  TenantListParams,
} from './TenantService.js';

export type {
  RoleDefinition,
  RoleAssignment,
  RoleResponse,
  RolesListResponse,
  RoleAssignmentResponse,
  RoleAssignmentsListResponse,
  CreateRoleParams,
  UpdateRoleParams,
  AssignRoleParams,
} from './RoleService.js';
