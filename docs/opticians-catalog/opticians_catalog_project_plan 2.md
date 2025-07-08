# Opticians Catalog Project Plan

This document outlines the implementation plan for the Opticians Catalog feature, broken down into specific, manageable prompts that fit within Claude 3.7 token windows on Cline.

## Project Overview

The Opticians Catalog feature will allow a new type of customer who doesn't want to launch an e-commerce store but wants to have a browseable catalog hosted by our platform. Instead of having a customer checkout, they would request/reserve glasses if they were a new customer. An independent optician/user would be able to login to our platform and see their products. The system will allow the user to select and add frames from our master database or have an onboarding wizard which allows them to load a CSV or Excel document. This page would be linked via URL - storex.ourplatform.com which they would mask with an A record.

## Implementation Prompts

Each of the following prompts represents a specific, focused task that can be implemented independently. These prompts are designed to fit within Claude 3.7's token window limitations.

### Phase 1: Database Schema and Core Models

#### Prompt 1: Create Database Models for Opticians Catalog

```
Create the SQLAlchemy database models for the Opticians Catalog feature. We need models for:

1. OpticiansStore - Representing an optician's catalog store with fields for:
   - Basic info (name, description, contact details)
   - Styling (logo, colors)
   - Domain configuration (subdomain, custom domain)
   - Theme customization options

2. OpticiansProduct - Representing products in an optician's catalog:
   - Reference to master frame database
   - Store-specific details (price, stock, etc.)
   - Custom attributes

3. ProductRequest - For customer requests/reservations:
   - Customer information
   - Product reference
   - Request status and details
   - Optional prescription data

4. Supporting models for:
   - Request form templates
   - Page customizations
   - Analytics tracking

Follow our existing SQLAlchemy patterns in src/api/models/db_models.py.
```

#### Prompt 2: Create Database Migrations for Opticians Catalog

```
Create the Alembic migration script to add the Opticians Catalog tables to our database. The migration should:

1. Create all necessary tables for the Opticians Catalog feature
2. Add appropriate indexes for performance
3. Set up foreign key relationships
4. Include a downgrade function to revert changes

Base this on our existing migration patterns and ensure it builds on the latest migration in our codebase.
```

#### Prompt 3: Create Pydantic Models for API Schemas

```
Create the Pydantic models for the Opticians Catalog API. We need:

1. Base models for core entities
2. Create/Update models for API input validation
3. Response models for API output
4. List response models for paginated endpoints

Follow our existing patterns in src/api/models/ and ensure these models work with our FastAPI implementation.
```

### Phase 2: Backend API Implementation

#### Prompt 4: Implement Store Management API Endpoints

```
Create the API endpoints for managing optician stores. Implement the following endpoints:

1. GET /opticians-catalog/stores - List stores
2. POST /opticians-catalog/stores - Create store
3. GET /opticians-catalog/stores/{store_id} - Get store details
4. PUT /opticians-catalog/stores/{store_id} - Update store
5. DELETE /opticians-catalog/stores/{store_id} - Delete store

Include proper authentication, validation, and error handling. Follow our existing FastAPI patterns in src/api/routers/.
```

#### Prompt 5: Implement Product Management API Endpoints

```
Create the API endpoints for managing products in optician stores. Implement:

1. GET /opticians-catalog/products - List products (with store_id filter)
2. POST /opticians-catalog/products - Add product to store
3. GET /opticians-catalog/products/{product_id} - Get product details
4. PUT /opticians-catalog/products/{product_id} - Update product
5. DELETE /opticians-catalog/products/{product_id} - Remove product
6. POST /opticians-catalog/products/bulk-import - Import products from CSV/Excel

Include proper authentication, validation, and error handling. Follow our existing FastAPI patterns.
```

#### Prompt 6: Implement Request Management API Endpoints

```
Create the API endpoints for managing product requests. Implement:

1. GET /opticians-catalog/requests - List requests (with store_id filter)
2. POST /opticians-catalog/requests - Create request (public endpoint)
3. GET /opticians-catalog/requests/{request_id} - Get request details
4. PUT /opticians-catalog/requests/{request_id} - Update request status
5. GET /opticians-catalog/requests/export - Export requests to CSV

Include proper authentication (except for the public create endpoint), validation, and error handling.
```

#### Prompt 7: Implement Form Template and Page Customization APIs

```
Create the API endpoints for managing form templates and page customizations:

1. Form Templates:
   - GET /opticians-catalog/form-templates - List templates
   - POST /opticians-catalog/form-templates - Create template
   - GET /opticians-catalog/form-templates/{template_id} - Get template
   - PUT /opticians-catalog/form-templates/{template_id} - Update template
   - DELETE /opticians-catalog/form-templates/{template_id} - Delete template

2. Page Customizations:
   - GET /opticians-catalog/page-customizations - List customizations
   - POST /opticians-catalog/page-customizations - Create customization
   - GET /opticians-catalog/page-customizations/{customization_id} - Get customization
   - PUT /opticians-catalog/page-customizations/{customization_id} - Update customization
   - DELETE /opticians-catalog/page-customizations/{customization_id} - Delete customization

Include proper authentication, validation, and error handling.
```

#### Prompt 8: Implement Master Frame Database Integration

```
Create the API endpoint for searching the master frame database:

1. GET /opticians-catalog/master-frames - Search master frames with filters for:
   - Brand
   - Style
   - Material
   - Color
   - Price range
   - Text search

Implement pagination and sorting options. This endpoint should leverage our existing Frame model and data.
```

#### Prompt 9: Implement CSV/Excel Import Service

```
Create a service for importing products from CSV/Excel files:

1. Implement file upload handling
2. Create CSV/Excel parsing logic
3. Add validation for required fields
4. Implement mapping of columns to product attributes
5. Add error handling and reporting
6. Create batch processing for efficient imports

This service should be used by the bulk-import API endpoint.
```

#### Prompt 10: Implement Notification System

```
Create a notification system for the Opticians Catalog:

1. Implement notification types:
   - New request notifications
   - Request status updates
   - Low stock alerts
   - System notifications

2. Create delivery methods:
   - Email notifications
   - In-app notifications
   - Optional SMS integration

3. Implement notification preferences and settings

This system should integrate with our existing notification infrastructure if available.
```

### Phase 3: Optician Portal Frontend

#### Prompt 11: Create Store Dashboard Components

```
Create the React components for the optician's store dashboard:

1. Main dashboard with summary widgets:
   - Recent requests
   - Analytics overview
   - Product stats
   - Quick actions

2. Activity feed component
3. Dashboard layout and navigation

Use TypeScript and follow our existing frontend patterns. These components will be integrated into the client portal.
```

#### Prompt 12: Create Product Management UI

```
Create the React components for product management:

1. Product listing with:
   - Search and filtering
   - Pagination
   - Inline actions

2. Product detail/edit form
3. Master catalog browser with:
   - Search and filtering
   - Add to store functionality

4. CSV/Excel import wizard with:
   - File upload
   - Column mapping
   - Validation and error reporting

Use TypeScript and follow our existing frontend patterns.
```

#### Prompt 13: Create Request Management UI

```
Create the React components for request management:

1. Request listing with:
   - Status filtering
   - Search
   - Pagination

2. Request detail view with:
   - Customer information
   - Product details
   - Status management
   - Communication history

3. Export functionality

Use TypeScript and follow our existing frontend patterns.
```

#### Prompt 14: Create Store Settings UI

```
Create the React components for store settings:

1. General settings:
   - Store information
   - Contact details
   - Domain configuration

2. Appearance settings:
   - Theme selection
   - Color customization
   - Logo upload

3. Form template editor:
   - Field configuration
   - Validation settings
   - Layout options

4. Page customization editor:
   - Section management
   - Content editing
   - Layout options

Use TypeScript and follow our existing frontend patterns.
```

#### Prompt 15: Integrate with Client Portal

```
Integrate the Opticians Catalog components into the client portal:

1. Add new navigation items
2. Create new routes for optician-specific pages
3. Implement permission checks
4. Add optician onboarding flow
5. Update existing dashboard for optician users

This integration should maintain the existing client portal functionality while adding the new optician-specific features.
```

### Phase 4: Customer-Facing Catalog

#### Prompt 16: Create Catalog Frontend Structure

```
Create the base structure for the customer-facing catalog:

1. Set up a new React application for the catalog
2. Implement dynamic subdomain/custom domain routing
3. Create the base layout components:
   - Header
   - Footer
   - Navigation
   - Main content area

4. Implement theme loading and application
5. Set up API service for catalog data

Use TypeScript and modern React patterns (hooks, context, etc.).
```

#### Prompt 17: Implement Product Browsing Experience

```
Create the components for browsing products in the catalog:

1. Homepage with:
   - Featured products
   - Collections
   - Promotional sections

2. Product listing page with:
   - Filtering options
   - Sorting
   - Grid/list views
   - Pagination

3. Search functionality with:
   - Autocomplete
   - Filtering
   - Results display

Use TypeScript and ensure responsive design for mobile devices.
```

#### Prompt 18: Implement Product Detail Page

```
Create the product detail page components:

1. Product image gallery
2. Product information display:
   - Name, brand, price
   - Description
   - Specifications
   - Availability

3. Similar/related products section
4. Request button and flow initiation

Use TypeScript and ensure responsive design for mobile devices.
```

#### Prompt 19: Implement Request Form and Flow

```
Create the request form and flow components:

1. Multi-step request form:
   - Customer information
   - Optional prescription details
   - Appointment preferences
   - Custom fields from template

2. Form validation
3. Submission handling
4. Confirmation page

Use TypeScript and ensure responsive design for mobile devices.
```

#### Prompt 20: Implement Recommendation Integration

```
Integrate the recommendation engine with the catalog:

1. Create components for displaying recommendations:
   - "Recommended for You" section
   - "Similar Products" section
   - "You Might Also Like" section

2. Implement recommendation API calls
3. Add tracking for recommendation interactions
4. Implement preference capture from browsing behavior

Use TypeScript and integrate with our existing recommendation engine.
```

### Phase 5: Analytics and Reporting

#### Prompt 21: Implement Catalog Analytics Tracking

```
Create the analytics tracking system for the catalog:

1. Implement tracking for:
   - Page views
   - Product views
   - Search queries
   - Request submissions
   - Recommendation interactions

2. Create data aggregation services
3. Implement storage in the CatalogAnalytics model

This system should integrate with our existing analytics infrastructure if available.
```

#### Prompt 22: Create Analytics Dashboard for Opticians

```
Create the analytics dashboard components for opticians:

1. Overview dashboard with:
   - Key metrics
   - Trend charts
   - Comparison to previous periods

2. Detailed reports for:
   - Product performance
   - Request conversion
   - Search analytics
   - Recommendation performance

3. Export functionality

Use TypeScript and data visualization libraries compatible with our stack.
```

### Phase 6: Deployment and Infrastructure

#### Prompt 23: Implement Subdomain/Custom Domain Handling

```
Create the infrastructure for handling subdomains and custom domains:

1. Implement subdomain routing in our web server
2. Create domain verification system for custom domains
3. Implement SSL certificate management
4. Create DNS configuration documentation

This should work with our existing hosting infrastructure.
```

#### Prompt 24: Create Deployment Pipeline Updates

```
Update our deployment pipeline for the Opticians Catalog:

1. Add new build steps for the catalog frontend
2. Update database migration handling
3. Configure subdomain/custom domain handling
4. Update monitoring and logging
5. Create rollback procedures

This should integrate with our existing CI/CD pipeline.
```

## Testing Strategy

For each implementation prompt, include appropriate tests:

1. Unit tests for services and utilities
2. API tests for endpoints
3. Component tests for frontend elements
4. Integration tests for key flows
5. End-to-end tests for critical user journeys

## Documentation Requirements

For each implementation prompt, include appropriate documentation:

1. Code documentation (comments, docstrings)
2. API documentation (OpenAPI/Swagger)
3. User documentation (for opticians)
4. Admin documentation (for our team)

## Implementation Order

The prompts should be implemented in roughly the order presented, with some flexibility based on dependencies and resource availability. The core database and API work (Phases 1-2) should be completed before the frontend work (Phases 3-4).
