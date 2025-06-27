import { Role } from '../../services/auth';
import { hasRequiredRole, routeGuards } from '../routeGuards';

describe('Route Guards', () => {
  describe('hasRequiredRole', () => {
    it('should return true when user has the required role', () => {
      expect(hasRequiredRole(Role.SUPER_ADMIN, [Role.SUPER_ADMIN, Role.CLIENT_ADMIN])).toBe(true);
      expect(hasRequiredRole(Role.CLIENT_ADMIN, [Role.SUPER_ADMIN, Role.CLIENT_ADMIN])).toBe(true);
    });

    it('should return false when user does not have the required role', () => {
      expect(hasRequiredRole(Role.VIEWER, [Role.SUPER_ADMIN, Role.CLIENT_ADMIN])).toBe(false);
      expect(hasRequiredRole(Role.BRAND_MANAGER, [Role.SUPER_ADMIN])).toBe(false);
    });

    it('should return true when no roles are required', () => {
      expect(hasRequiredRole(Role.VIEWER, [])).toBe(true);
      expect(hasRequiredRole(Role.CLIENT_ADMIN, [])).toBe(true);
    });
  });

  describe('routeGuards', () => {
    it('should define public routes that do not require authentication', () => {
      expect(routeGuards.public.requireAuth).toBe(false);
      expect(routeGuards.public.requiredRoles).toEqual([]);
    });

    it('should define customer routes that require basic authentication', () => {
      expect(routeGuards.customer.requireAuth).toBe(true);
      expect(routeGuards.customer.requiredRoles).toEqual([]);
      expect(routeGuards.customer.redirectPath).toBe('/signup');
    });

    it('should define admin routes that require admin roles', () => {
      expect(routeGuards.admin.requireAuth).toBe(true);
      expect(routeGuards.admin.requiredRoles).toContain(Role.SUPER_ADMIN);
      expect(routeGuards.admin.requiredRoles).toContain(Role.CLIENT_ADMIN);
      expect(routeGuards.admin.redirectPath).toBe('/admin/auth');
    });

    it('should define super admin routes that require super admin role', () => {
      expect(routeGuards.superAdmin.requireAuth).toBe(true);
      expect(routeGuards.superAdmin.requiredRoles).toEqual([Role.SUPER_ADMIN]);
      expect(routeGuards.superAdmin.redirectPath).toBe('/admin/auth');
    });

    it('should define brand manager routes that allow appropriate roles', () => {
      expect(routeGuards.brandManager.requireAuth).toBe(true);
      expect(routeGuards.brandManager.requiredRoles).toContain(Role.SUPER_ADMIN);
      expect(routeGuards.brandManager.requiredRoles).toContain(Role.CLIENT_ADMIN);
      expect(routeGuards.brandManager.requiredRoles).toContain(Role.BRAND_MANAGER);
      expect(routeGuards.brandManager.redirectPath).toBe('/admin/auth');
    });
  });
});