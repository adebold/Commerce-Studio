# Manufacturer Role Feature - aiGI Code-Centric Prompts (LS1)

This document contains the initial code-centric prompts for implementing the manufacturer role feature in the eyewear-ml platform. These prompts are organized by subcomponent and designed to drive subsequent TDD and implementation phases.

## Prompt [LS1_01]

### Context
The eyewear platform needs to implement a manufacturer role with agentic onboarding capabilities. The onboarding process should guide manufacturers through account creation, profile setup, and initial product uploads in a conversational, AI-driven flow. Previous TDD and security analysis requires proper database operations and comprehensive validation.

### Task
Implement the core components of the manufacturer agentic onboarding flow, including the conversation state machine, entity validation, and database integration.

### Requirements
- Create a stateful conversation flow manager that guides manufacturers through the onboarding process
- Implement comprehensive input validation for manufacturer profile data
- Design a secure database schema for storing manufacturer information
- Build proper database transaction handling for atomic operations
- Implement role-based permission assignment during account creation
- Create detailed logging for security audit and debugging purposes
- Ensure all database operations use proper error handling and rollback mechanisms

### Previous Issues
- Mock database operations failed to catch real-world edge cases
- Insufficient input validation led to security vulnerabilities
- Lack of proper transaction handling caused data inconsistencies
- Poor error handling created confusing user experiences

### Expected Output
A modular set of Python classes and functions that implement the manufacturer onboarding flow with the following components:
1. `ManufacturerOnboardingFlow` class to manage the conversation state
2. Database models and schema for manufacturer data
3. Input validation utilities for all manufacturer profile fields
4. Secure authentication and permission assignment
5. Transaction management and error handling utilities
6. Unit tests demonstrating proper functionality

## Prompt [LS1_02]

### Context
The manufacturer role requires role-based access control (RBAC) with free and paid tier differentiation. Authentication and authorization mechanisms must be secure, performant, and scalable. The system should enforce appropriate permission boundaries between tiers.

### Task
Implement the RBAC and authentication system for the manufacturer role with free/paid tier differentiation.

### Requirements
- Design and implement the manufacturer role permission schema with distinct free and paid tier permissions
- Create a secure authentication mechanism compatible with existing system architecture
- Implement middleware for enforcing tier-specific access controls
- Build JWT token management with proper claims for manufacturer roles and tiers
- Design upgrade pathways from free to paid tier with permission propagation
- Implement security logging and auditing for all authentication events
- Create rate limiting and resource quota enforcement based on tier level

### Previous Issues
- Inconsistent permission checks across different services
- Security vulnerabilities in token validation
- Lack of proper rate limiting led to potential DoS vectors
- Insufficient logging made security audits difficult
- Permission boundaries between tiers were not clearly enforced

### Expected Output
A set of secure, well-tested authentication and authorization components:
1. `ManufacturerAuthService` class for authentication operations
2. Middleware for tier-specific permission enforcement
3. Token management utilities with proper signing and validation
4. Database schema for storing manufacturer permissions and tier information
5. API endpoints for tier upgrades and permission management
6. Comprehensive security tests for all authentication flows

## Prompt [LS1_03]

### Context
The platform requires a centralized product repository for manufacturers to upload and manage their eyewear products. This repository must be performant, support high-volume operations, and integrate with the existing product database structure.

### Task
Implement the centralized product repository system for manufacturer-uploaded eyewear products.

### Requirements
- Design a scalable database schema for manufacturer products with proper indexing
- Implement CRUD operations for product management with optimistic locking
- Create secure file storage for product images with CDN integration
- Build search and filtering capabilities optimized for performance
- Implement batch operations for bulk product uploads and updates
- Design proper data validation and sanitization for all product fields
- Create access control mechanisms based on manufacturer ownership
- Implement performance monitoring and optimization strategies

### Previous Issues
- Poor database indexing led to slow query performance
- Lack of optimistic locking caused data corruption during concurrent updates
- Insufficient input validation allowed malformed product data
- File storage implementations didn't scale for high-volume product catalogs
- Search operations became prohibitively expensive as product counts grew

### Expected Output
A comprehensive product repository implementation with:
1. Database models and schema for manufacturer products
2. CRUD service with proper validation and transaction handling
3. File storage manager with CDN integration
4. Search and filtering service with performance optimizations
5. Batch operation handlers for bulk product management
6. Performance tests demonstrating scalability under load
7. Security tests for access control validation

## Prompt [LS1_04]

### Context
Manufacturers need a tiered dashboard with different capabilities based on their subscription level. The dashboard should include conversion optimization features that encourage free tier users to upgrade to paid plans. The UI must be responsive, accessible, and optimized for manufacturer workflows.

### Task
Implement the tiered manufacturer dashboard with conversion optimization features.

### Requirements
- Design component architecture for the manufacturer dashboard with tier-specific UI elements
- Implement responsive, accessible UI components following design system guidelines
- Create dynamic feature gating based on manufacturer tier
- Build conversion elements that highlight paid tier benefits to free users
- Implement usage analytics tracking to identify conversion opportunities
- Design a unified API layer for dashboard data retrieval and actions
- Create feature discovery mechanisms for onboarding manufacturers to dashboard functionality
- Implement A/B testing capability for optimizing conversion elements

### Previous Issues
- Inconsistent UI made dashboard navigation confusing
- Poor mobile responsiveness limited dashboard utility on small screens
- Lack of clear value proposition for paid tiers hurt conversion rates
- Accessibility issues created barriers for some manufacturers
- Performance issues with data-heavy dashboard views

### Expected Output
A complete dashboard implementation with:
1. React component library for dashboard UI elements
2. API services for dashboard data operations
3. Feature gating system based on manufacturer tier
4. Conversion tracking and optimization utilities
5. Responsive layouts for all device sizes
6. Accessibility compliance for all interactive elements
7. Performance optimizations for data-heavy views
8. A/B testing framework for conversion element optimization

## Prompt [LS1_05]

### Context
Paid tier manufacturers should have access to advanced ML tools for product analysis, trend prediction, and customer preference matching. These tools must integrate with the product repository, be computationally efficient, and provide actionable insights to manufacturers.

### Task
Implement the ML tools integration for paid tier manufacturers.

### Requirements
- Design a modular ML service architecture that can scale independently
- Implement product popularity prediction model with proper feature engineering
- Create customer preference matching algorithm using historical data
- Build trend analysis system for identifying market opportunities
- Implement batch processing for resource-intensive ML operations
- Design caching strategy for ML results to improve performance
- Create visualization components for presenting ML insights in the dashboard
- Implement usage metering and quotas for ML service consumption

### Previous Issues
- ML models lacked proper validation and testing procedures
- Performance bottlenecks in ML processing created user experience issues
- Poor caching strategy led to redundant processing
- Lack of proper error handling for ML operations
- Insufficient explanation of ML insights reduced manufacturer adoption

### Expected Output
A comprehensive ML tools integration including:
1. ML service architecture with proper separation of concerns
2. Implementation of core ML models (popularity prediction, preference matching, trend analysis)
3. Batch processing system for resource-intensive operations
4. Caching layer for optimizing repeated queries
5. API endpoints for triggering ML operations and retrieving results
6. Dashboard visualization components for ML insights
7. Usage metering and quota enforcement system
8. Comprehensive tests for ML model validation and performance