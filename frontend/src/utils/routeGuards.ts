import { Role } from '../services/auth';

/**
 * Interface for route guard options
 */
export interface RouteGuardOptions {
  requiredRoles?: Role[];
  requireAuth?: boolean;
  redirectPath?: string;
}

/**
 * Default route guard options
 */
export const defaultGuardOptions: RouteGuardOptions = {
  requiredRoles: [],
  requireAuth: true,
  redirectPath: '/admin/auth',
};

/**
 * Route guard configurations for different route types
 */
export const routeGuards = {
  /**
   * Guard for public routes (no authentication required)
   */
  public: {
    requireAuth: false,
    requiredRoles: [],
  },

  /**
   * Guard for customer routes (basic authentication required)
   */
  customer: {
    requireAuth: true,
    requiredRoles: [],
    redirectPath: '/signup',
  },

  /**
   * Guard for admin routes (admin role required)
   */
  admin: {
    requireAuth: true,
    requiredRoles: [Role.SUPER_ADMIN, Role.CLIENT_ADMIN],
    redirectPath: '/admin/auth',
  },

  /**
   * Guard for super admin routes (super admin role required)
   */
  superAdmin: {
    requireAuth: true,
    requiredRoles: [Role.SUPER_ADMIN],
    redirectPath: '/admin/auth',
  },

  /**
   * Guard for brand manager routes
   */
  brandManager: {
    requireAuth: true,
    requiredRoles: [Role.SUPER_ADMIN, Role.CLIENT_ADMIN, Role.BRAND_MANAGER],
    redirectPath: '/admin/auth',
  },
};

/**
 * Helper function to check if a user has the required role
 * @param userRole The user's role
 * @param requiredRoles Array of required roles
 * @returns Boolean indicating if the user has the required role
 */
export const hasRequiredRole = (userRole: Role, requiredRoles: Role[]): boolean => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  return requiredRoles.includes(userRole);
};