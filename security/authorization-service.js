/**
 * @fileoverview Authorization service for Role-Based Access Control (RBAC) and permission management.
 * @module security/authorization-service
 */

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Load security policies
const securityPolicies = yaml.load(fs.readFileSync(path.resolve(__dirname, '../config/security/security-policies.yaml'), 'utf8'));
const rbacConfig = securityPolicies.rbac;

/**
 * Manages roles, permissions, and access control checks.
 */
class AuthorizationService {
  constructor() {
    this.roles = new Map(rbacConfig.roles.map(role => [role.name, new Set(role.permissions)]));
  }

  /**
   * Checks if a user with a given role has the required permission.
   * Supports wildcard permissions.
   * @param {string} roleName - The name of the user's role.
   * @param {string} requiredPermission - The permission required to perform the action (e.g., 'avatar:chat').
   * @returns {boolean} True if the user is authorized, false otherwise.
   */
  hasPermission(roleName, requiredPermission) {
    const userPermissions = this.roles.get(roleName);

    if (!userPermissions) {
      console.warn(`Authorization check for unknown role: ${roleName}`);
      return false;
    }

    // Direct permission match
    if (userPermissions.has(requiredPermission)) {
      return true;
    }

    // Wildcard permission match (e.g., 'user:*' grants all user permissions)
    const permissionParts = requiredPermission.split(':');
    for (let i = permissionParts.length; i > 0; i--) {
      const wildcard = [...permissionParts.slice(0, i - 1), '*'].join(':');
      if (userPermissions.has(wildcard)) {
        return true;
      }
    }
    
    // Check for all-encompassing wildcard
    if (userPermissions.has('*:*')) {
        return true;
    }

    return false;
  }

  /**
   * Express middleware for checking permissions.
   * @param {string} requiredPermission - The permission required for the route.
   * @returns {function} Express middleware function.
   */
  checkPermission(requiredPermission) {
    return (req, res, next) => {
      // Assuming user role is attached to the request object by a previous middleware (e.g., authentication)
      const userRole = req.user ? req.user.role : 'guest';

      if (this.hasPermission(userRole, requiredPermission)) {
        return next();
      }

      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have the required permissions to perform this action.',
      });
    };
  }

  /**
   * Retrieves all permissions for a given role.
   * @param {string} roleName - The name of the role.
   * @returns {Set<string>|null} A set of permissions or null if the role does not exist.
   */
  getPermissionsForRole(roleName) {
    return this.roles.get(roleName) || null;
  }
}

module.exports = new AuthorizationService();