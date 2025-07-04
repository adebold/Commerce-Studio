# Region-Aware 3D Image Transformation Service

## Overview

This PR implements a comprehensive region-aware 3D image transformation service that respects data residency requirements like GDPR while enabling powerful 3D eyewear frame transformations via MongoDB and a specialized transformation API.

## Key Features

1. **Region-Specific Configuration System**
   - Region enum with EU and NA support
   - Dynamic region detection from headers, user preferences, or IP
   - Configuration management for different environments

2. **Region-Aware Database Access**
   - Connections to region-specific MongoDB instances
   - Support for PostgreSQL and Redis
   - Abstraction layer to handle region routing

3. **3D Image Transformation Service**
   - Transformation of 3D eyewear scans
   - MongoDB integration for image storage and retrieval
   - Transformation history tracking

4. **RESTful API Endpoints**
   - Complete FastAPI endpoints for transformation operations
   - Region-aware request handling
   - Authentication and authorization

5. **Third-Party Integration Support**
   - Adapter pattern for third-party services (e.g., Vreelaabs)
   - Custom implementation on Google Cloud Run
   - Region-specific API keys and endpoints

## Implementation Details

- Created region configuration system (`src/config/region_config.py`)
- Updated database configuration to be region-aware (`src/config/database_config.py`)
- Implemented image transformation service (`src/services/image_transformation_service.py`)
- Added API endpoints (`src/api/image_transformation.py`)
- Integrated with main FastAPI application (`src/api/main.py`)
- Added environment variables for configuration (`.env.development`)
- Created example environment configuration (`src/config/.env.region-example`)
- Included a full example application (`src/examples/region_aware_api_example.py`)

## Documentation

- Comprehensive feature documentation (`docs/features/3d-image-transformation.md`)
- Third-party integration guide (`docs/features/third-party-integration.md`)
- Architecture documentation (`docs/architecture/region_specific_data_storage.md`)

## Testing

**Manual Testing Procedure:**
1. Start the API server with `uvicorn src.main:app --reload`
2. Upload a 3D image to MongoDB
3. Use Swagger UI to transform the image
4. Verify that transformations respect the specified region

**API Testing:**
- Test transformations with various parameters
- Verify region-specific behavior with different headers
- Test third-party API integration if configured

## Deployment

For deployment to staging/production environments:

1. Configure region-specific environment variables
2. Set up region-specific MongoDB instances (if using actual multi-region setup)
3. Configure third-party API keys if using external services
4. Deploy with normal deployment process

## Security Considerations

- API keys are stored securely in environment variables
- Region-specific data is isolated in separate databases
- Authentication is required for all API endpoints
- User can only access their own images and transformations

## Future Improvements

- Add more transformation types
- Implement batch processing for large collections
- Add webhooks for transformation completion notifications
- Enhance caching for frequently accessed transforms

## Related Issues

- Resolves: #345 - Implement region-aware data storage
- Resolves: #367 - Add 3D image transformation API
- Related to: #298 - GDPR compliance for EU customers
