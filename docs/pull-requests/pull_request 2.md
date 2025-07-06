# Pull Request: Shopify App Integration

## Overview
This PR implements a Shopify app that integrates with the EyewearML platform, providing virtual try-on and product recommendation capabilities for eyewear stores.

## Changes Made

### 1. API Endpoints (`/apps/shopify/api/`)
- **auth.js**: Implements OAuth authentication flow
  - Uses Shopify's OAuth 2.0 protocol
  - Handles initial authentication request
  - Configures required scopes: `read_products`, `write_products`, `read_themes`, `write_themes`

- **callback.js**: Handles OAuth callback
  - Processes authentication response
  - Manages session token storage
  - Implements secure token handling

- **index.js**: Main app interface
  - Provides responsive landing page
  - Shows authentication status
  - Features grid layout for main functionalities
  - Implements conditional rendering based on auth state

### 2. Configuration (`/apps/shopify/vercel.json`)
- Vercel deployment configuration
- Environment variables setup
- API routing configuration
- Build settings for Node.js

## Technical Details

### Authentication Flow
1. User clicks "Connect Store"
2. Redirected to `/api/auth` with shop parameter
3. OAuth process initiated with Shopify using `@shopify/shopify-api`
4. Callback received at `/api/callback`
5. Session established and stored using `@shopify/shopify-app-session-storage-memory`
6. User redirected to main interface with success status

### Session Management
- Using `@shopify/shopify-app-session-storage-memory` for session storage
- Session tokens securely handled and stored
- Authentication state properly managed across requests
- Session lookup by shop implemented

### Environment Variables
```
SHOPIFY_API_KEY=<client_id>
SHOPIFY_API_SECRET=<secret_key>
SHOPIFY_API_VERSION=2024-01
NODE_ENV=production
VERCEL_URL=<deployment-url>
```

### API Routes
- `/api/auth`: Authentication initiation
- `/api/callback`: OAuth callback handling
- `/`: Main app interface

## Security Considerations
- Secure token handling
- Environment variable protection
- OAuth flow security
- Session management
- HTTPS enforcement

## Testing Instructions
1. Visit the app URL
2. Click "Connect Your Shopify Store"
3. Complete OAuth flow
4. Verify successful authentication
5. Test feature accessibility

## Future Improvements
1. Database integration for token storage
2. Session persistence
3. Rate limiting
4. Error logging
5. Analytics integration
6. Enhanced security measures

## Dependencies
- @shopify/shopify-api: Latest version for Shopify API integration
- @shopify/shopify-app-session-storage-memory: For session management
- Node.js runtime: For server-side execution
- Vercel platform: For deployment and hosting

## Deployment
The app is deployed on Vercel with automatic deployments configured:
- Production: On main branch updates
- Preview: On PR creation
- Development: Local testing

## Notes
- Requires Shopify Partners account
- Store must be on Shopify Plus or higher
- API version compatibility maintained
- Regular security updates needed

## Related Documentation
- [Shopify API Documentation](https://shopify.dev/api/admin-rest)
- [OAuth Documentation](https://shopify.dev/apps/auth/oauth)
- [Vercel Documentation](https://vercel.com/docs)

## Screenshots
(To be added during review)
