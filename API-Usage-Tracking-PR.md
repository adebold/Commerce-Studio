# API Usage Tracking Implementation

## Overview

This PR implements a comprehensive API usage tracking system for third-party services like Apify, Shopify, OpenAI, and Vertex AI. The system records API usage for each tenant, calculates costs, and enforces usage limits defined in subscription plans.

## Features

- **API Usage Tracking**: Records API calls to third-party services with detailed usage data
- **Cost Calculation**: Calculates the cost of API calls based on service-specific pricing models
- **Usage Limits**: Enforces usage limits defined in subscription plans
- **Admin Interface**: Adds documentation for API usage tracking in the admin knowledge base
- **Database Schema**: Adds a new `usage_records` table to store API usage data

## Implementation Details

### Core Components

1. **API Usage Tracker**
   - Created `api_usage_tracker.py` with utilities for tracking API usage
   - Implemented `record_api_usage` function to record API calls
   - Implemented `calculate_api_cost` function to calculate costs
   - Created `api_usage_decorator` for easy integration with existing code

2. **Billing Service Integration**
   - Added `record_usage` method to `BillingService` class
   - Added `get_feature_usage` method to retrieve usage data
   - Added `get_tenant_usage` method to get usage summaries

3. **Data Model Updates**
   - Added `api_name` field to `PlanFeature` model
   - Created database migration for `usage_records` table

4. **API Adapter Integration**
   - Updated Apify, Shopify, and generic API adapters to use the tracking decorator
   - Ensured tenant ID is passed to the tracking system

5. **Admin Documentation**
   - Added API Usage Tracking tab to the Knowledge Base component
   - Documented how to set usage limits and view usage data

### Database Changes

Added a new `usage_records` table with the following schema:
- `id`: UUID primary key
- `tenant_id`: Foreign key to tenants table
- `feature`: Feature name (e.g., "api.openai.completion")
- `quantity`: Usage quantity
- `metadata`: JSON field for additional data (cost, details, etc.)
- `recorded_at`: Timestamp when the usage occurred
- `created_at`: Timestamp when the record was created

Added `api_name` column to `plan_features` table to link features to specific APIs.

## Testing

- Added unit tests for API usage tracker
- Tested with various API services
- Verified cost calculations match expected values
- Tested usage limit enforcement

## How to Use

### Setting API Usage Limits

1. Go to Subscription Plans
2. Edit a plan
3. Add a feature with the API name (e.g., "api.openai.completion")
4. Set the usage limit

### Viewing API Usage

1. Go to Tenant Management
2. Select a tenant
3. View the Usage tab to see API usage statistics

## Future Improvements

- Add more detailed usage analytics and visualizations
- Implement automatic billing for usage overages
- Add support for more third-party services
- Create a dedicated API usage dashboard