# SPARC Backend Integration Prompts

## Phase 1: Foundation (Authentication & API Client)

### Prompt [LS1_001]
#backend-integration #phase-1 #priority-high

#### Context
The frontend currently uses mock authentication services with localStorage, and there's no proper API client infrastructure for communicating with the backend. The authentication flow needs to be connected to real backend endpoints that implement JWT-based authentication.

#### Task
Implement frontend API client service with proper error handling, interceptors, and type safety.

#### Requirements
- Create a robust HTTP client service using Axios
- Implement request/response interceptors for authentication
- Add comprehensive error handling with appropriate error classes
- Ensure type safety with TypeScript interfaces
- Support configuration via environment variables
- Implement retry logic for failed requests
- Add request cancellation support
- Enable request/response logging in development mode

#### Previous Issues
- No actual HTTP client in the frontend
- No error handling for API requests
- No request/response interceptors
- No type definitions for API responses
- No support for JWT token management in requests

#### Expected Output
```typescript
// Path: frontend/src/services/apiClient.ts
// Complete implementation of a type-safe API client service with:
// - Base configuration
// - Auth interceptors
// - Error handling
// - Retry logic
// - Type definitions for requests/responses

// Path: frontend/src/utils/httpClient.ts
// Low-level HTTP client implementation with:
// - Request/response interceptors
// - Error transformation
// - Cancellation support
// - Logging
```

### Prompt [LS1_002]
#backend-integration #phase-1 #priority-high

#### Context
The backend has defined authentication endpoints, but they currently return mock data. Real authentication with JWT token management, user database operations, and secure password handling needs to be implemented.

#### Task
Create backend authentication endpoints (login, logout, refresh token, user profile).

#### Requirements
- Implement /auth/login endpoint with username/password validation
- Create /auth/logout endpoint for token invalidation
- Develop /auth/refresh endpoint for JWT token refresh
- Build /auth/profile endpoint for user profile management
- Implement secure password hashing using bcrypt
- Add JWT token generation and validation
- Create database operations for user management
- Add proper error handling and status codes
- Implement rate limiting for authentication endpoints
- Document API endpoints with OpenAPI/Swagger

#### Previous Issues
- Authentication endpoints return mock data
- No database user operations
- No password hashing
- No proper JWT token management
- No token refresh mechanism
- Missing profile management endpoints

#### Expected Output
```python
# Path: src/api/routers/auth.py
# Complete implementation of FastAPI auth router with:
# - Login endpoint
# - Logout endpoint
# - Token refresh endpoint
# - User profile endpoint

# Path: src/auth/jwt.py
# JWT token handling implementation with:
# - Token generation
# - Token validation
# - Token refresh

# Path: src/services/user_service.py
# User service implementation with:
# - User CRUD operations
# - Password hashing
# - Profile management
```

### Prompt [LS1_003]
#backend-integration #phase-1 #priority-high

#### Context
The frontend authentication service currently uses localStorage mock implementation. This needs to be replaced with a real implementation that connects to the backend authentication endpoints, manages JWT tokens, and handles authentication state.

#### Task
Connect frontend auth service to backend, replacing mock authentication.

#### Requirements
- Modify frontend auth service to use API client
- Implement JWT token storage with refresh functionality
- Add login/logout methods connecting to backend endpoints
- Create user profile fetching and management
- Add authentication state management
- Implement persistent sessions across page reloads
- Add role-based access control
- Create proper error handling for auth failures
- Update protected route logic to use real authentication
- Ensure backward compatibility with existing components

#### Previous Issues
- Frontend auth service uses localStorage mock
- No real API calls for authentication
- No JWT token management
- No token refresh mechanism
- No persistent authentication state
- Protected routes use mock authentication checks

#### Expected Output
```typescript
// Path: frontend/src/services/auth.ts
// Complete implementation of authentication service with:
// - Login/logout methods
// - Token management
// - User profile handling
// - Authentication state
// - Session persistence
// - Role-based access control

// Path: frontend/src/contexts/AuthContext.tsx
// Authentication context implementation with:
// - Auth state management
// - Provider for auth state
// - Auth-related utilities
```

### Prompt [LS1_004]
#backend-integration #phase-1 #priority-high

#### Context
JWT token management is critical for secure authentication. The system needs robust token handling including secure storage, automatic refresh, and proper token validation.

#### Task
Implement JWT token management and secure storage.

#### Requirements
- Create secure token storage mechanism (HTTP-only cookies preferred)
- Implement token refresh logic to handle expiration
- Add token validation on both frontend and backend
- Develop token revocation for logout and security events
- Implement proper error handling for token issues
- Create access/refresh token pattern for enhanced security
- Add token payload validation and security checks
- Implement protection against XSS and CSRF attacks
- Create token monitoring for suspicious activities
- Document token security measures

#### Previous Issues
- No secure token storage
- No token refresh implementation
- No token validation beyond expiration
- No token revocation mechanism
- Vulnerable to XSS attacks with localStorage
- Missing CSRF protection

#### Expected Output
```typescript
// Path: frontend/src/utils/tokenManager.ts
// Complete token management implementation with:
// - Secure storage
// - Automatic refresh
// - Validation
// - Security measures

// Path: src/auth/token_validator.py
// Backend token validation implementation with:
// - Signature verification
// - Payload validation
// - Token blacklisting
// - Security checks
```

## Phase 2: Core Features (Product & Services)

### Prompt [LS1_005]
#backend-integration #phase-2 #priority-high

#### Context
The platform needs a complete product management API to handle eyewear products, including CRUD operations, search, filtering, and integration with e-commerce platforms.

#### Task
Build product management API endpoints (CRUD operations, search, filtering).

#### Requirements
- Create /products endpoints for CRUD operations
- Implement search functionality with multiple criteria
- Add filtering by category, brand, price range, etc.
- Develop pagination and sorting capabilities
- Implement database models and repositories
- Add image handling for product images
- Create validation for product data
- Implement inventory tracking
- Add product variant support
- Document API endpoints with OpenAPI/Swagger

#### Previous Issues
- No product API endpoints in backend
- No product database models
- No search or filtering capabilities
- No inventory tracking
- Missing product variant support
- No image handling for products

#### Expected Output
```python
# Path: src/api/routers/products.py
# Complete implementation of FastAPI product router with:
# - CRUD endpoints
# - Search functionality
# - Filtering capabilities
# - Pagination and sorting

# Path: src/models/product.py
# Product model implementation with:
# - Database schema
# - Validation
# - Relationships

# Path: src/services/product_service.py
# Product service implementation with:
# - Database operations
# - Business logic
# - Search functionality
```

### Prompt [LS1_006]
#backend-integration #phase-2 #priority-medium

#### Context
The virtual try-on service is a key feature of the platform but currently uses mock data. It needs integration with image processing capabilities and ML models to provide real virtual try-on functionality.

#### Task
Implement virtual try-on service integration with image processing.

#### Requirements
- Create image upload endpoints with validation and security
- Implement face detection and analysis using ML models
- Develop virtual try-on rendering capabilities
- Add try-on result storage and retrieval
- Implement progress tracking for long-running operations
- Create error handling for various failure scenarios
- Implement caching for performance optimization
- Add metrics collection for analytics
- Support different eyewear types (glasses, contacts)
- Document API endpoints and image requirements

#### Previous Issues
- Frontend face shape service returns mock data
- No image upload functionality
- No ML model integration
- No real-time processing
- No progress tracking
- Missing error handling for processing failures

#### Expected Output
```python
# Path: src/api/routers/virtual_try_on.py
# Complete implementation of FastAPI virtual try-on router with:
# - Image upload endpoint
# - Processing status endpoint
# - Result retrieval endpoint

# Path: src/services/face_analysis_service.py
# Face analysis service implementation with:
# - Face detection
# - Face measurement
# - Feature extraction

# Path: src/services/try_on_service.py
# Try-on service implementation with:
# - Image processing
# - Virtual placement
# - Result generation
```

### Prompt [LS1_007]
#backend-integration #phase-2 #priority-medium

#### Context
The recommendation engine is currently mocked. It needs to be integrated with ML models to provide personalized eyewear recommendations based on face shape, preferences, and past behavior.

#### Task
Create recommendation engine API with ML model integration.

#### Requirements
- Implement /recommendations endpoints for personalized suggestions
- Integrate ML models for recommendation generation
- Add user preference tracking and storage
- Develop face shape-based recommendation logic
- Implement A/B testing infrastructure
- Create recommendation analytics collection
- Add feedback mechanisms to improve recommendations
- Implement caching for performance optimization
- Support different recommendation types (style, fit, trending)
- Document API endpoints and recommendation parameters

#### Previous Issues
- No recommendation service in backend
- No ML model integration
- No user preference storage
- No recommendation tracking
- Missing A/B testing capabilities
- No feedback loop for recommendations

#### Expected Output
```python
# Path: src/api/routers/recommendations.py
# Complete implementation of FastAPI recommendations router with:
# - Personalized recommendation endpoint
# - Preference tracking endpoint
# - Feedback endpoint

# Path: src/services/recommendation_service.py
# Recommendation service implementation with:
# - ML model integration
# - Preference analysis
# - Recommendation generation

# Path: src/models/user_preference.py
# User preference model implementation with:
# - Preference storage
# - History tracking
# - Analysis capabilities
```

### Prompt [LS1_008]
#backend-integration #phase-2 #priority-high

#### Context
The Shopify app has commented-out routes due to "API issues." These need to be restored and the Shopify integration needs to be fully functional with proper OAuth flow, webhook handling, and product synchronization.

#### Task
Restore Shopify app functionality (fix commented routes, implement OAuth flow).

#### Requirements
- Uncomment and fix Shopify app routes
- Implement Shopify OAuth flow for authentication
- Add webhook handling for product updates
- Create product synchronization between Shopify and VARAi
- Implement error recovery mechanisms
- Add logging and monitoring for integration status
- Create Shopify API client with rate limiting support
- Implement retry logic for failed operations
- Add configuration management for Shopify settings
- Document OAuth flow and webhook setup

#### Previous Issues
- Shopify app routes are commented out
- No OAuth flow implementation
- No webhook handling
- No product synchronization
- Missing error recovery
- No monitoring for integration status

#### Expected Output
```typescript
// Path: apps/shopify/src/routes/index.ts
// Uncommented and fixed router implementation with:
// - OAuth routes
// - Webhook routes
// - Product sync routes

// Path: apps/shopify/src/services/oauth.ts
// OAuth implementation with:
// - Authorization
// - Token management
// - Session handling

// Path: apps/shopify/src/services/webhooks.ts
// Webhook handling implementation with:
// - Registration
// - Processing
// - Error handling
```

## Phase 3: E-commerce Integration

### Prompt [LS1_009]
#backend-integration #phase-3 #priority-medium

#### Context
BigCommerce integration needs to be implemented to support merchants using this platform. This includes OAuth flow, webhook handling, and product synchronization.

#### Task
Implement BigCommerce integration with webhook handling.

#### Requirements
- Create BigCommerce OAuth flow for authentication
- Implement webhook endpoints for product updates
- Develop product synchronization between BigCommerce and VARAi
- Add inventory synchronization capabilities
- Implement order management functionality
- Create error handling and recovery mechanisms
- Add logging and monitoring for integration status
- Implement rate limiting and retry logic
- Create configuration management for BigCommerce settings
- Document API endpoints and webhook configuration

#### Previous Issues
- No functional BigCommerce integration
- No OAuth flow implementation
- No webhook handling
- No product synchronization
- Missing error recovery
- No monitoring for integration status

#### Expected Output
```typescript
// Path: apps/bigcommerce/src/routes/index.ts
// Complete router implementation with:
// - OAuth routes
// - Webhook routes
// - Product sync routes

// Path: apps/bigcommerce/src/services/oauth.ts
// OAuth implementation with:
// - Authorization
// - Token management
// - Session handling

// Path: apps/bigcommerce/src/services/products.ts
// Product service implementation with:
// - Synchronization
// - Mapping
// - Validation
```

### Prompt [LS1_010]
#backend-integration #phase-3 #priority-medium

#### Context
WooCommerce integration needs to be implemented to support merchants using WordPress. This includes REST API integration, webhook handling, and product synchronization.

#### Task
Build WooCommerce REST API integration.

#### Requirements
- Implement WooCommerce REST API client
- Create authentication with API keys
- Develop webhook endpoints for product updates
- Implement product synchronization between WooCommerce and VARAi
- Add inventory management capabilities
- Create order synchronization functionality
- Implement error handling and recovery mechanisms
- Add logging and monitoring for integration status
- Create rate limiting and retry logic
- Document API endpoints and webhook configuration

#### Previous Issues
- No functional WooCommerce integration
- No API client implementation
- No webhook handling
- No product synchronization
- Missing error recovery
- No monitoring for integration status

#### Expected Output
```php
// Path: apps/woocommerce/includes/class-varai-api.php
// Complete WooCommerce API integration with:
// - Authentication
// - REST API client
// - Webhook handling

// Path: apps/woocommerce/includes/class-varai-product-sync.php
// Product synchronization implementation with:
// - Bidirectional sync
// - Product mapping
// - Error handling

// Path: apps/woocommerce/includes/class-varai-admin.php
// Admin interface implementation with:
// - Configuration
// - Status monitoring
// - Manual sync triggers
```

### Prompt [LS1_011]
#backend-integration #phase-3 #priority-medium

#### Context
Magento 2 integration needs to be implemented using GraphQL API. This includes authentication, product synchronization, and webhook handling.

#### Task
Create Magento 2 GraphQL integration.

#### Requirements
- Implement Magento 2 GraphQL client
- Create authentication with OAuth
- Develop product synchronization between Magento and VARAi
- Implement inventory management capabilities
- Add order synchronization functionality
- Create webhook handling for product updates
- Implement error handling and recovery mechanisms
- Add logging and monitoring for integration status
- Create rate limiting and retry logic
- Document GraphQL schema and integration setup

#### Previous Issues
- No functional Magento integration
- No GraphQL client implementation
- No OAuth authentication
- No product synchronization
- Missing error recovery
- No monitoring for integration status

#### Expected Output
```php
// Path: apps/magento/Model/GraphQL/Client.php
// Complete GraphQL client implementation with:
// - Authentication
// - Query execution
// - Error handling

// Path: apps/magento/Model/ProductSync.php
// Product synchronization implementation with:
// - Bidirectional sync
// - Product mapping
// - Error handling

// Path: apps/magento/etc/webapi.xml
// Web API configuration with:
// - REST endpoints
// - OAuth scopes
// - Service contracts
```

### Prompt [LS1_012]
#backend-integration #phase-3 #priority-high

#### Context
A unified product sync service is needed to manage product data across multiple e-commerce platforms. This service should handle synchronization, conflict resolution, and monitoring.

#### Task
Implement unified product sync service across platforms.

#### Requirements
- Create a platform-agnostic product synchronization service
- Implement adapters for each e-commerce platform
- Develop conflict resolution strategies
- Add bidirectional synchronization capabilities
- Implement scheduled and on-demand sync operations
- Create synchronization status tracking
- Add error handling and recovery mechanisms
- Implement logging and monitoring
- Create performance optimization strategies
- Document synchronization architecture and operations

#### Previous Issues
- No unified approach to product synchronization
- Platform-specific implementations with duplication
- No conflict resolution strategy
- Inconsistent error handling
- Missing monitoring and reporting
- No scheduled synchronization

#### Expected Output
```typescript
// Path: src/services/product_sync_service.ts
// Unified product sync service implementation with:
// - Platform-agnostic interfaces
// - Synchronization engine
// - Conflict resolution

// Path: src/adapters/shopify_adapter.ts
// Path: src/adapters/bigcommerce_adapter.ts
// Path: src/adapters/woocommerce_adapter.ts
// Path: src/adapters/magento_adapter.ts
// Platform-specific adapters implementing common interface

// Path: src/models/sync_status.ts
// Sync status model implementation with:
// - Status tracking
// - History
// - Reporting
```

## Phase 4: Advanced Features

### Prompt [LS1_013]
#backend-integration #phase-4 #priority-medium

#### Context
The analytics dashboard needs real-time data updates via WebSocket connections. This involves implementing WebSocket server, client connections, and real-time data processing.

#### Task
Build real-time analytics dashboard with WebSocket connections.

#### Requirements
- Implement WebSocket server for real-time data streaming
- Create frontend WebSocket client for data reception
- Develop real-time data processing pipeline
- Add authentication for WebSocket connections
- Implement reconnection logic
- Create message serialization and validation
- Add performance optimizations for high throughput
- Implement data aggregation for dashboard metrics
- Create event-based architecture for real-time updates
- Document WebSocket API and message formats

#### Previous Issues
- No real-time data updates in dashboard
- No WebSocket implementation
- Static or periodically refreshed data only
- No live notifications
- Missing real-time performance metrics
- No event-based architecture

#### Expected Output
```typescript
// Path: src/services/websocket_service.py
// WebSocket server implementation with:
// - Connection handling
// - Authentication
// - Message processing

// Path: frontend/src/services/socketClient.ts
// WebSocket client implementation with:
// - Connection management
// - Reconnection logic
// - Message handling

// Path: frontend/src/components/analytics/RealTimeDashboard.tsx
// Real-time dashboard implementation with:
// - Data subscription
// - Live updates
// - Visualization
```

### Prompt [LS1_014]
#backend-integration #phase-4 #priority-high

#### Context
Face shape analysis is a key feature for the virtual try-on and recommendation systems. It needs AI service integration for accurate analysis and classification.

#### Task
Implement face shape analysis AI service.

#### Requirements
- Create face shape detection and analysis service
- Implement ML model integration for shape classification
- Develop feature extraction for facial measurements
- Add confidence scoring for analysis results
- Implement caching for performance optimization
- Create face shape database for analysis history
- Add privacy controls for facial data
- Implement error handling for various failure scenarios
- Create metrics collection for model performance
- Document API endpoints and integration methods

#### Previous Issues
- Face shape analysis returns mock data
- No ML model integration
- No feature extraction implementation
- Missing confidence scoring
- No privacy controls
- Inadequate error handling

#### Expected Output
```python
# Path: src/services/face_shape_analysis_service.py
# Face shape analysis service implementation with:
# - ML model integration
# - Feature extraction
# - Shape classification

# Path: src/models/face_shape.py
# Face shape model implementation with:
# - Measurement storage
# - Classification results
# - Confidence metrics

# Path: frontend/src/services/faceShapeService.ts
# Frontend service implementation with:
# - Analysis requests
# - Result handling
# - Error management
```

### Prompt [LS1_015]
#backend-integration #phase-4 #priority-medium

#### Context
A/B testing is needed to optimize recommendations and user experience. This requires a framework for experiment definition, user assignment, and result analysis.

#### Task
Create A/B testing framework for recommendations.

#### Requirements
- Implement A/B test definition and management
- Create user assignment to test variants
- Develop metrics collection for experiment results
- Add statistical analysis for significance testing
- Implement experiment scheduling and lifecycle management
- Create reporting interface for test results
- Add integration with recommendation engine
- Implement segmentation for targeted testing
- Create multivariate testing capabilities
- Document A/B testing framework and best practices

#### Previous Issues
- No A/B testing infrastructure
- No experiment definition mechanism
- No user assignment logic
- Missing metrics collection
- No statistical analysis
- Lack of reporting interface

#### Expected Output
```typescript
// Path: src/services/ab_testing_service.py
// A/B testing service implementation with:
// - Experiment definition
// - User assignment
// - Results collection

// Path: src/models/experiment.py
// Experiment model implementation with:
// - Variant definitions
// - Assignment rules
// - Metrics configuration

// Path: frontend/src/components/analytics/ABTestResults.tsx
// Results visualization component with:
// - Statistical analysis
// - Performance metrics
// - Significance indicators