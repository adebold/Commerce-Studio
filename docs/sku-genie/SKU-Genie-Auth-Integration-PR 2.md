# SKU-Genie Authentication Integration

## Overview

This PR integrates SKU-Genie with the main application's authentication and RBAC (Role-Based Access Control) system. The integration allows SKU-Genie to use the same user roles and permissions as the main application, providing a consistent security model across the entire platform.

## Changes

- Created an auth adapter to bridge the main app's auth system with SKU-Genie
- Updated database operations to include user context and permission checks
- Modified the CLI interface to accept authentication tokens
- Added comprehensive documentation in the new `docs/modules` directory
- Created test scripts to verify the integration

## Implementation Details

### Auth Adapter

The auth adapter maps SKU-Genie resources to main application permissions:

- CLIENT resource maps to VIEW_REPORTS, MANAGE_BRANDS, and MANAGE_CLIENT_USERS permissions
- DATA_SOURCE resource maps to VIEW_REPORTS, MANAGE_PRODUCTS, and MANAGE_BRANDS permissions
- SCHEMA resource maps to VIEW_REPORTS, MANAGE_PRODUCTS, and CUSTOMIZE_REPORTS permissions
- IMPORT resource maps to VIEW_REPORTS, MANAGE_PRODUCTS, and MANAGE_BRANDS permissions
- QUALITY resource maps to VIEW_REPORTS, MANAGE_PRODUCTS, and CUSTOMIZE_REPORTS permissions
- MAINTENANCE resource maps to VIEW_REPORTS, MANAGE_PRODUCTS, and MANAGE_SYSTEM permissions

### Database Operations

All database operations now include an optional `user_context` parameter that is used to check permissions before performing operations. The operations also filter results based on the user's role and scope:

- Super admins can access all data
- Client admins can only access data for their client
- Brand managers can only access data for their brand
- Viewers can only view data for their client/brand

### CLI Interface

The CLI interface now accepts a `--token` parameter that is used to authenticate the user. The token is verified and the user context is passed to all database operations.

## Testing

A test script has been created to verify the integration:

- Tests the auth adapter with different user roles
- Tests database operations with user context
- Verifies that permissions are correctly enforced

## Documentation

Comprehensive documentation has been added to explain the integration:

- `docs/modules/SKU-Genie-Auth-Integration-Plan.md` - Detailed integration plan
- `docs/modules/README.md` - Overview of the modules directory

## Next Steps

- Integrate with the API layer to enforce permissions on API endpoints
- Add user interface components for authentication and authorization
- Implement more granular permissions for specific operations