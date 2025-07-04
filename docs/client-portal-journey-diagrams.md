# Client Portal Integration: User Journey Diagrams

## 1. Client Registration Journey

```mermaid
sequenceDiagram
    participant Client
    participant Shopify
    participant ShopifyApp
    participant ClientPortal
    participant AuthModule

    Client->>Shopify: Install app from App Store
    Shopify->>ShopifyApp: OAuth redirect
    ShopifyApp->>Shopify: Request access token
    Shopify->>ShopifyApp: Return access token
    ShopifyApp->>ShopifyApp: Create/update shop record
    ShopifyApp->>AuthModule: Request client portal token
    AuthModule->>ShopifyApp: Return token
    ShopifyApp->>ClientPortal: Register client
    ShopifyApp->>ClientPortal: Create platform account
    ShopifyApp->>Client: Redirect to app dashboard
```

## 2. Onboarding Journey

```mermaid
sequenceDiagram
    participant Client
    participant OnboardingWizard
    participant IntegrationService
    participant ClientPortalAPI
    participant SKUGenieAPI

    Client->>OnboardingWizard: Access app first time
    OnboardingWizard->>Client: Display welcome screen
    Client->>OnboardingWizard: Enter business information
    Client->>OnboardingWizard: Configure store settings
    Client->>OnboardingWizard: Select plugins
    Client->>OnboardingWizard: Confirm selections
    OnboardingWizard->>IntegrationService: Submit client data
    IntegrationService->>ClientPortalAPI: Update client profile
    IntegrationService->>SKUGenieAPI: Fetch product data
    IntegrationService->>ClientPortalAPI: Generate initial reports
    IntegrationService->>ClientPortalAPI: Schedule regular reports
    OnboardingWizard->>Client: Redirect to dashboard
```

## 3. Dashboard Access Journey

```mermaid
sequenceDiagram
    participant Client
    participant Dashboard
    participant ClientPortalHook
    participant AuthUtils
    participant ClientPortalAPI

    Client->>Dashboard: Access dashboard
    Dashboard->>AuthUtils: Request authentication
    AuthUtils->>ClientPortalAPI: Get token
    AuthUtils->>Dashboard: Return token
    Dashboard->>ClientPortalHook: Initialize with token
    ClientPortalHook->>ClientPortalAPI: Fetch client data
    ClientPortalHook->>ClientPortalAPI: Fetch platform accounts
    ClientPortalHook->>ClientPortalAPI: Fetch reports
    ClientPortalHook->>ClientPortalAPI: Fetch metrics
    ClientPortalHook->>Dashboard: Return data
    Dashboard->>Client: Display dashboard
    Client->>Dashboard: Navigate between sections
    Client->>Dashboard: Run report
    Dashboard->>ClientPortalAPI: Execute report
    ClientPortalAPI->>Dashboard: Return report results
    Dashboard->>Client: Display updated report
```

## 4. Report Generation Journey

```mermaid
sequenceDiagram
    participant Scheduler
    participant IntegrationService
    participant SKUGenieAPI
    participant ClientPortalAPI
    participant Client

    Scheduler->>IntegrationService: Trigger scheduled report
    IntegrationService->>SKUGenieAPI: Fetch product data
    SKUGenieAPI->>IntegrationService: Return product data
    IntegrationService->>IntegrationService: Process data
    IntegrationService->>ClientPortalAPI: Create report
    ClientPortalAPI->>Client: Send notification (if configured)
    Client->>ClientPortalAPI: Request report
    ClientPortalAPI->>Client: Return report data
    Client->>Client: View/export report
```

## Component Interaction Diagram

```mermaid
graph TD
    A[Client Browser] --> B[React Frontend]
    B --> C[ClientPortalDashboard]
    B --> D[OnboardingWizard]
    
    C --> E[useClientPortal Hook]
    D --> E
    
    E --> F[authUtils]
    E --> G[clientPortalApi]
    
    F --> G
    
    H[Shopify App] --> I[clientPortalIntegrationService]
    I --> G
    I --> J[skuGenieApi]
    
    K[API Gateway] --> L[Client Portal API]
    G --> K
    
    M[Auth Module] --> F
```

These diagrams illustrate the flow of data and interactions between different components in the client portal integration, providing a visual representation of the user journeys described in the previous document.