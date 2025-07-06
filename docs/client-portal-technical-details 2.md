# Client Portal Integration: Technical Details

This document provides a detailed overview of the pages, API routes, and database schema implemented for the client portal integration.

## Pages and Components

### 1. Onboarding Wizard
**Path**: `/onboarding`
**Component**: `src/client-portal-integration/components/OnboardingWizard.jsx`
**Description**: Multi-step wizard for new client onboarding
**Screens**:
- Welcome (`/onboarding/welcome`)
- Business Information (`/onboarding/business-info`)
- Store Setup (`/onboarding/store-setup`)
- Plugin Selection (`/onboarding/plugins`)
- Confirmation (`/onboarding/confirmation`)

### 2. Client Portal Dashboard
**Path**: `/dashboard`
**Component**: `src/client-portal-integration/components/ClientPortalDashboard.jsx`
**Description**: Main dashboard for clients to view metrics and reports
**Tabs**:
- Overview (`/dashboard`)
- Reports (`/dashboard/reports`)
- Platform Accounts (`/dashboard/accounts`)

### 3. Report Viewer
**Path**: `/reports/:reportId`
**Component**: Not implemented yet, referenced in the dashboard
**Description**: Detailed view of a specific report

### 4. Settings Page
**Path**: `/settings`
**Component**: Not implemented yet, referenced in the dashboard
**Description**: Client settings and preferences

### 5. Plugin Management
**Path**: `/plugins`
**Component**: Not implemented yet, referenced in the dashboard
**Description**: Management of activated plugins

## API Routes

### Client Portal API Routes (via API Gateway)

#### Client Management
- `GET /api/client-portal/clients` - Get all clients
- `GET /api/client-portal/clients/:clientId` - Get a specific client
- `POST /api/client-portal/clients` - Create a new client
- `PUT /api/client-portal/clients/:clientId` - Update a client
- `DELETE /api/client-portal/clients/:clientId` - Delete a client (mark as inactive)

#### Platform Account Management
- `GET /api/client-portal/platform-accounts` - Get all platform accounts
- `GET /api/client-portal/platform-accounts/:accountId` - Get a specific platform account
- `POST /api/client-portal/platform-accounts` - Create a new platform account
- `PUT /api/client-portal/platform-accounts/:accountId` - Update a platform account
- `DELETE /api/client-portal/platform-accounts/:accountId` - Delete a platform account

#### Report Management
- `GET /api/client-portal/reports` - Get all reports
- `GET /api/client-portal/reports/:reportId` - Get a specific report
- `POST /api/client-portal/reports` - Create a new report
- `PUT /api/client-portal/reports/:reportId` - Update a report
- `DELETE /api/client-portal/reports/:reportId` - Delete a report
- `POST /api/client-portal/reports/:reportId/run` - Run a report and return the results

#### Scheduled Report Management
- `GET /api/client-portal/scheduled-reports` - Get all scheduled reports
- `GET /api/client-portal/scheduled-reports/:scheduledReportId` - Get a specific scheduled report
- `POST /api/client-portal/scheduled-reports` - Create a new scheduled report
- `PUT /api/client-portal/scheduled-reports/:scheduledReportId` - Update a scheduled report
- `DELETE /api/client-portal/scheduled-reports/:scheduledReportId` - Delete a scheduled report

#### Metrics
- `POST /api/client-portal/metrics` - Get metrics data based on the request parameters
- `GET /api/client-portal/metrics/dashboard` - Get metrics data for the dashboard

### Shopify App API Routes

#### Authentication
- `GET /auth` - Start OAuth flow
- `GET /auth/callback` - OAuth callback
- `POST /auth/uninstall` - Uninstall webhook handler

#### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get a specific product
- `POST /products/:id/sync` - Sync a product to SKU-Genie
- `POST /products/sync-all` - Sync all products to SKU-Genie

#### Settings
- `GET /settings` - Get shop settings
- `PUT /settings` - Update shop settings

## Database Schema

### Shop Model (MongoDB)
**File**: `apps/shopify-app/models/Shop-updated.js`
**Fields**:
- `shopDomain` (String, required, unique): Shopify shop domain
- `accessToken` (String, required): Shopify access token
- `scope` (String, required): Shopify API scope
- `isActive` (Boolean, default: true): Shop active status
- `shopName` (String): Name of the shop
- `email` (String): Shop email
- `phone` (String): Shop phone
- `contactName` (String): Shop contact name
- `plan` (String): Shopify plan
- `shopId` (String): Shopify shop ID
- `settings` (Object):
  - `syncDirection` (String, enum): Direction of data sync
  - `productMapping` (Map): Mapping of product fields
  - `syncFrequency` (String, enum): Frequency of data sync
  - `syncEnabled` (Boolean): Whether sync is enabled
- `clientId` (String): SKU-Genie client ID
- `clientPortalClientId` (String): Client portal client ID
- `clientPortalAccountId` (String): Client portal account ID
- `clientPortalSettings` (Object):
  - `reportsEnabled` (Boolean): Whether reports are enabled
  - `reportFrequency` (String, enum): Frequency of reports
  - `dashboardEnabled` (Boolean): Whether dashboard is enabled
  - `notificationsEnabled` (Boolean): Whether notifications are enabled
- `createdAt` (Date): Creation timestamp
- `updatedAt` (Date): Update timestamp

### Product Model (MongoDB)
**File**: `apps/shopify-app/models/Product.js` (existing)
**Fields**:
- `shopDomain` (String, required): Shopify shop domain
- `shopifyProductId` (String, required): Shopify product ID
- `title` (String, required): Product title
- `description` (String): Product description
- `vendor` (String): Product vendor
- `productType` (String): Product type
- `tags` (Array): Product tags
- `handle` (String): Product handle
- `status` (String): Product status
- `publishedAt` (Date): Publication date
- `publishedScope` (String): Publication scope
- `variants` (Array): Product variants
- `options` (Array): Product options
- `images` (Array): Product images
- `syncDirection` (String): Direction of data sync
- `syncStatus` (String): Status of data sync
- `syncError` (String): Error message if sync failed
- `skuGenieId` (String): SKU-Genie product ID
- `lastSyncedAt` (Date): Last sync timestamp

### SyncJob Model (MongoDB)
**File**: `apps/shopify-app/models/SyncJob.js` (existing)
**Fields**:
- `shopDomain` (String, required): Shopify shop domain
- `jobType` (String, required): Type of sync job
- `direction` (String, required): Direction of data sync
- `status` (String, required): Job status
- `progress` (Object): Job progress
  - `total` (Number): Total items to process
  - `current` (Number): Current progress
- `targetResources` (Object): Resources to sync
  - `productIds` (Array): Product IDs to sync
- `queuedBy` (Object): User who queued the job
  - `userId` (String): User ID
  - `userEmail` (String): User email
- `options` (Object): Job options
  - `forceSync` (Boolean): Whether to force sync
- `results` (Object): Job results
  - `success` (Object): Successful operations
  - `errors` (Array): Errors encountered
- `startedAt` (Date): Job start timestamp
- `completedAt` (Date): Job completion timestamp
- `createdAt` (Date): Creation timestamp
- `updatedAt` (Date): Update timestamp

## Client Portal API Database Schema (Referenced)

These models are defined in the client portal API and are referenced by the integration:

### Client Model
**Fields**:
- `id` (String, required): Client ID
- `name` (String, required): Client name
- `email` (String, required): Client email
- `contactName` (String): Client contact name
- `phone` (String): Client phone
- `status` (String): Client status
- `externalId` (String): External ID
- `metadata` (Object): Additional metadata
- `createdAt` (Date): Creation timestamp
- `updatedAt` (Date): Update timestamp

### PlatformAccount Model
**Fields**:
- `id` (String, required): Account ID
- `clientId` (String, required): Client ID
- `name` (String, required): Account name
- `platform` (String, required): Platform type
- `status` (String): Account status
- `credentials` (Object): Account credentials
- `settings` (Object): Account settings
- `metadata` (Object): Additional metadata
- `createdAt` (Date): Creation timestamp
- `updatedAt` (Date): Update timestamp

### Report Model
**Fields**:
- `id` (String, required): Report ID
- `clientId` (String, required): Client ID
- `name` (String, required): Report name
- `type` (String, required): Report type
- `format` (String): Report format
- `data` (Object): Report data
- `metadata` (Object): Additional metadata
- `createdAt` (Date): Creation timestamp
- `updatedAt` (Date): Update timestamp

### ScheduledReport Model
**Fields**:
- `id` (String, required): Scheduled report ID
- `clientId` (String, required): Client ID
- `name` (String, required): Scheduled report name
- `type` (String, required): Report type
- `format` (String): Report format
- `schedule` (Object): Schedule configuration
- `delivery` (Object): Delivery configuration
- `metadata` (Object): Additional metadata
- `createdAt` (Date): Creation timestamp
- `updatedAt` (Date): Update timestamp

## API Integration Points

### Client Portal API Client
**File**: `src/client-portal-integration/api/clientPortalApi.js`
**Description**: Client for communicating with the Client Portal API
**Methods**:
- Client management methods
- Platform account management methods
- Report management methods
- Scheduled report management methods
- Metrics methods

### Client Portal Integration Service
**File**: `src/client-portal-integration/services/clientPortalIntegrationService.js`
**Description**: Service for integrating with the Client Portal
**Methods**:
- `registerClient`: Register a new client
- `createPlatformAccount`: Create a platform account
- `syncShopifyShop`: Sync a Shopify shop
- `generateClientReports`: Generate reports for a client
- `scheduleClientReports`: Schedule reports for a client
- `getClientDashboardMetrics`: Get dashboard metrics

### Auth Utils
**File**: `src/client-portal-integration/utils/authUtils.js`
**Description**: Utilities for authentication with the Client Portal API
**Methods**:
- `getClientPortalToken`: Get a token for the Client Portal API
- `setClientPortalAuth`: Set authentication for the Client Portal API
- `clearClientPortalAuth`: Clear authentication

## Frontend Integration Points

### Client Portal Hook
**File**: `src/client-portal-integration/hooks/useClientPortal.js`
**Description**: React hook for accessing Client Portal data
**Methods**:
- Data fetching methods
- Data mutation methods
- State management

### Components
**Files**:
- `src/client-portal-integration/components/ClientPortalDashboard.jsx`
- `src/client-portal-integration/components/OnboardingWizard.jsx`
**Description**: React components for displaying Client Portal data

## Conclusion

This document provides a comprehensive overview of the technical details of the client portal integration, including pages, API routes, and database schema. These components work together to provide a seamless experience for clients, enabling them to register, onboard, manage their store, and access reports and analytics.