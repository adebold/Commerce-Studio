# Client Portal Integration: User Journeys and Pages

## User Journeys

### 1. Client Registration Journey

**Trigger**: A client installs the Shopify app

**Steps**:
1. Client discovers the VARAi Commerce Studio app in the Shopify App Store
2. Client installs the app on their Shopify store
3. The app authenticates with Shopify using OAuth
4. During the OAuth callback, the app:
   - Creates/updates the shop record in the database
   - Registers the client in the client portal via `clientPortalIntegrationService.syncShopifyShop()`
   - Creates a platform account for the Shopify store
5. Client is redirected to the app dashboard

**Components Involved**:
- Shopify App (`apps/shopify-app/routes/auth-updated.js`)
- Client Portal Integration Service (`src/client-portal-integration/services/clientPortalIntegrationService.js`)
- Auth Module (`auth/AuthService.ts`)

### 2. Onboarding Journey

**Trigger**: A new client accesses the app for the first time

**Steps**:
1. Client is presented with the onboarding wizard
2. Client completes the business information step
3. Client configures their store settings
4. Client selects plugins to enable (Virtual Try-on, PD Calculator, etc.)
5. Client reviews and confirms their selections
6. The system creates/updates their profile in the client portal
7. The system generates initial reports for the client
8. The system schedules regular reports
9. Client is redirected to the dashboard

**Components Involved**:
- Onboarding Wizard Component (`src/client-portal-integration/components/OnboardingWizard.jsx`)
- Client Portal Integration Service (`src/client-portal-integration/services/clientPortalIntegrationService.js`)
- Client Portal API Client (`src/client-portal-integration/api/clientPortalApi.js`)

### 3. Dashboard Access Journey

**Trigger**: Client accesses their dashboard

**Steps**:
1. Client logs into the app
2. The system authenticates the client using the auth module
3. The system fetches client data from the client portal
4. The system fetches platform accounts, reports, and metrics
5. The dashboard displays the client's information, metrics, and reports
6. Client can navigate between different sections (Dashboard, Reports, Platform Accounts)
7. Client can run reports on demand

**Components Involved**:
- Client Portal Dashboard Component (`src/client-portal-integration/components/ClientPortalDashboard.jsx`)
- Client Portal Hook (`src/client-portal-integration/hooks/useClientPortal.js`)
- Auth Utils (`src/client-portal-integration/utils/authUtils.js`)
- Client Portal API Client (`src/client-portal-integration/api/clientPortalApi.js`)

### 4. Report Generation Journey

**Trigger**: Scheduled time or manual trigger by client

**Steps**:
1. The system identifies reports due for generation
2. For each report, the system:
   - Fetches the necessary data from SKU-Genie
   - Processes the data according to the report type
   - Creates a report in the client portal
   - Notifies the client if configured
3. Client can view the report in the dashboard
4. Client can export the report in various formats

**Components Involved**:
- Client Portal Integration Service (`src/client-portal-integration/services/clientPortalIntegrationService.js`)
- SKU-Genie API Client (`apps/shopify-app/services/skuGenieApi.js`)
- Client Portal API Client (`src/client-portal-integration/api/clientPortalApi.js`)

## Pages and Components

### 1. Onboarding Wizard

**File**: `src/client-portal-integration/components/OnboardingWizard.jsx`

**Description**: A multi-step wizard that guides new clients through the setup process.

**Screens**:
- Welcome screen
- Business Information form
- Store Setup configuration
- Plugin Selection options
- Confirmation screen

**Key Features**:
- Progress tracking
- Form validation
- Step navigation
- Configuration saving

### 2. Client Portal Dashboard

**File**: `src/client-portal-integration/components/ClientPortalDashboard.jsx`

**Description**: A comprehensive dashboard that displays client information, metrics, reports, and platform accounts.

**Sections**:
- Client Information card
- Metrics Summary section
- Product Performance chart
- Inventory Status chart
- Reports list
- Platform Accounts list

**Key Features**:
- Tabbed navigation
- Interactive charts
- Report execution
- Responsive design

### 3. API Integration Layer

While not a visible page, the API integration layer is crucial for the user journeys:

**Files**:
- `src/client-portal-integration/api/clientPortalApi.js`
- `src/client-portal-integration/services/clientPortalIntegrationService.js`
- `src/client-portal-integration/utils/authUtils.js`

**Description**: These files provide the backend functionality that powers the user journeys, handling authentication, data fetching, and business logic.

### 4. React Hook for Client Portal Data

**File**: `src/client-portal-integration/hooks/useClientPortal.js`

**Description**: A React hook that provides access to client portal data in components, handling loading states, error handling, and data fetching.

## Integration Points

### 1. Shopify App Integration

**Files**:
- `apps/shopify-app/routes/auth-updated.js`
- `apps/shopify-app/server-updated.js`
- `apps/shopify-app/models/Shop-updated.js`

**Description**: These files integrate the Shopify app with the client portal, enabling automatic client registration and platform account creation.

### 2. API Gateway Integration

**File**: `api-gateway/config/kong-updated.yml`

**Description**: This file configures the API gateway to route requests to the client portal API, providing a unified API experience for clients.

## Future Enhancements

Based on the implemented user journeys and pages, potential future enhancements include:

1. **Advanced Reporting**: More report types and customization options
2. **Real-time Updates**: WebSocket integration for live dashboard updates
3. **Enhanced Visualization**: More chart types and interactive elements
4. **User Management**: Support for multiple users per client with different roles
5. **Notification Center**: Centralized notification management for clients