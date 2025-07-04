# Client Portal Integration

## Overview

This PR implements the integration between the VARAi Commerce Studio platform and the Client Portal API. It enables seamless client management, reporting, and analytics by connecting the existing components (Shopify app, auth module, API gateway) with the client portal.

## Changes

### New Components

1. **Client Portal Integration Module**:
   - API client for communicating with the Client Portal API
   - Integration service for business logic
   - Authentication utilities
   - React hooks and components for the frontend
   - Detailed documentation

2. **Frontend Components**:
   - Dashboard component for displaying client portal data
   - Onboarding wizard for guiding users through the setup process

### Updated Components

1. **API Gateway**:
   - Added routes for the client portal API
   - Added authentication for client portal API requests

2. **Shopify App**:
   - Updated auth flow to register clients in the client portal
   - Modified Shop model to include client portal fields
   - Updated server.js to initialize client portal authentication

## User Journeys

These changes enable the following user journeys:

1. **Client Registration**: When a client installs the Shopify app, they are automatically registered in the client portal.
2. **Platform Account Management**: The client's Shopify store is registered as a platform account in the client portal.
3. **Reporting**: The system automatically generates and schedules reports for the client.
4. **Dashboard Access**: Clients can access their dashboard to view reports and metrics.

## Technical Details

### Dependencies

- The client portal API must be running and accessible
- Environment variables must be set for authentication

### Environment Variables

```
CLIENT_PORTAL_API_URL=http://localhost:8000
CLIENT_PORTAL_API_KEY=your-api-key
VARAI_API_URL=https://api.varai.com
VARAI_CLIENT_ID=your-client-id
VARAI_CLIENT_SECRET=your-client-secret
VARAI_REDIRECT_URI=https://your-app.com/auth/callback
```

### API Routes

The client portal API is accessible through the API gateway at `/api/client-portal`.

### Authentication

The integration uses the existing auth module for secure authentication with the client portal API.

## Testing

1. Install the Shopify app on a test store
2. Verify that the client is registered in the client portal
3. Verify that reports are generated and scheduled
4. Access the dashboard to view reports and metrics

## Screenshots

[Include screenshots of the dashboard and onboarding wizard]

## Related Issues

- #123: Client Portal Integration
- #124: Reporting Dashboard
- #125: Onboarding Wizard

## Checklist

- [x] Code follows the project's coding standards
- [x] Documentation has been updated
- [x] Tests have been added/updated
- [x] All tests pass
- [x] Environment variables have been documented
- [x] PR has been reviewed by at least one team member