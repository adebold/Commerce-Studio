# 3D Image Transformation Service

This document describes the 3D Image Transformation Service implementation, which allows transforming 3D eyewear scan images stored in MongoDB using a specialized API while respecting data residency requirements.

## Overview

The 3D Image Transformation Service enables applying various transformations to 3D eyewear scan images, such as:

- Adjusting frame dimensions
- Changing lens tint or color
- Modifying textures and materials
- Generating photorealistic renders from different angles
- Frame customization (colors, details, etc.)

The service is region-aware, utilizing the appropriate regional datastore and API endpoint based on user location, preferences, or explicit region selection.

## Architecture

### Key Components

1. **Image Transformation Service** (`src/services/image_transformation_service.py`):
   - Core service that connects to MongoDB and the 3D Transform API
   - Region-aware connection management
   - Transformation handling and result storage

2. **API Endpoints** (`src/api/image_transformation.py`):
   - RESTful API for transformation operations
   - Region-aware request handling
   - Authentication and authorization

3. **Configuration** (`.env` files and `src/config`):
   - Region-specific API keys and connection details
   - Environment-specific settings

## Integration with Region-Specific Data Storage

This service fully integrates with our region-specific data storage architecture:

- EU customer data remains in EU datastores
- NA customer data remains in NA datastores
- API requests include region information
- Transformation history is stored in the appropriate regional database

For complete details on our region-specific architecture, see `docs/architecture/region_specific_data_storage.md`.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/image-transformation/options` | GET | Get available transformation options |
| `/api/image-transformation/transform/{image_id}` | POST | Transform a specific 3D image |
| `/api/image-transformation/history` | GET | Get transformation history for the current user |
| `/api/image-transformation/batch-transform` | POST | Transform multiple images matching a query |
| `/api/image-transformation/status` | GET | Get service status across regions |

## Usage Examples

### Transform a 3D Image

```javascript
// Client-side example
async function transform3DImage(imageId, transformations) {
  const response = await fetch(`/api/image-transformation/transform/${imageId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
      'X-Data-Region': 'eu'  // Optional: explicitly specify region
    },
    body: JSON.stringify(transformations)
  });
  
  return await response.json();
}

// Example transformations
const transformations = [
  {
    "type": "resize",
    "params": {
      "width": 140,
      "templeLength": 145
    }
  },
  {
    "type": "colorize",
    "params": {
      "frameColor": "#00394c",
      "lensColor": "#a9d6e5",
      "transparency": 0.8
    }
  }
];

// Apply transformations
const result = await transform3DImage('60f8a7b296e8d631c4b09a42', transformations);
```

### Get Transformation History

```javascript
// Client-side example
async function getTransformationHistory() {
  const response = await fetch('/api/image-transformation/history', {
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });
  
  return await response.json();
}
```

## Configuration

Add the following to your environment files (already in `.env.development`):

```
# Region Settings
DATA_REGION=na  # Default region for data storage (na or eu)

# 3D Transform API Settings
TRANSFORM_3D_API_KEY=your-api-key
TRANSFORM_3D_API_ENDPOINT=https://api.3dtransform.varai.ai/v1

# Region-Specific 3D Transform API Keys
NA_TRANSFORM_3D_API_KEY=your-na-region-key
EU_TRANSFORM_3D_API_KEY=your-eu-region-key
```

## Development Setup

1. Ensure MongoDB is running and configured for both regions
2. Add necessary environment variables
3. Run the server with `uvicorn src.main:app --reload`
4. Test endpoints with the provided examples

## Testing the Service

### Manual Testing

1. Upload a 3D image to the system
2. Use the `/transform/{image_id}` endpoint to apply transformations
3. Check the transformation results in the MongoDB collection

### Automated Testing

```bash
# Run specific tests for the 3D transformation service
pytest tests/services/test_image_transformation_service.py
pytest tests/api/test_image_transformation_api.py
```

## Security Considerations

- All endpoints require authentication
- Transformed images maintain the same access control as originals
- API keys are stored securely per region
- User can only access their own images and transformations

## Troubleshooting

### Common Issues

1. **Transformation Failed**: Check that the image exists and is in a supported format
2. **Region Not Available**: Verify that the specified region is correctly configured
3. **API Key Invalid**: Ensure the correct API key is set for the appropriate region

### Monitoring

The `/api/image-transformation/status` endpoint provides current service status across all regions.

## Future Enhancements

- Add support for more transformation types
- Implement batch processing for large collections
- Add webhooks for transformation completion notifications
- Enhance caching for frequently accessed transforms
