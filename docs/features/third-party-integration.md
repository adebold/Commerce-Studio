# Third-Party API Integration for 3D Image Transformation

This guide explains how to integrate a third-party 3D image transformation API (like Vreelaabs) or your own custom service running on cloud platforms such as Google Cloud Run.

## Overview

Our 3D Image Transformation Service is designed with flexibility to work with various backend services. You can:

1. Use our default implementation
2. Integrate with third-party services (e.g., Vreelaabs)
3. Connect to your own custom implementation (e.g., on Google Cloud Run)

Each option requires different configuration steps, particularly regarding API keys, endpoints, and request formats.

## Integrating Third-Party API Services

### Step 1: Update Environment Variables

For each environment (development, staging, production), modify your environment files:

```bash
# Third-Party API Configuration
TRANSFORM_3D_API_KEY=your-third-party-api-key
TRANSFORM_3D_API_ENDPOINT=https://api.third-party-service.com/v1

# Region-specific keys (if applicable)
NA_TRANSFORM_3D_API_KEY=your-na-region-key
EU_TRANSFORM_3D_API_KEY=your-eu-region-key
```

For Vreelaabs specifically:
```bash
TRANSFORM_3D_API_KEY=vreela-api-xxxxxxxxxxxx
TRANSFORM_3D_API_ENDPOINT=https://api.vreelaabs.com/transform/v2
```

### Step 2: Adjust Request Format (If Needed)

If the third-party API uses a different request format, you may need to modify the service implementation. This can be done by creating a specialized adapter class:

Create a new file at `src/services/adapters/vreelaabs_adapter.py`:

```python
"""Adapter for Vreelaabs API"""

class VreelaabsAdapter:
    """Converts between our standard format and Vreelaabs API format"""
    
    @staticmethod
    def adapt_request(standard_request):
        """Convert our standard request to Vreelaabs format"""
        # Example conversion logic
        vreelaabs_request = {
            "model": standard_request.get("image"),
            "modifications": []
        }
        
        # Map our transformations to Vreelaabs format
        for transform in standard_request.get("transformations", []):
            if transform["type"] == "resize":
                vreelaabs_request["modifications"].append({
                    "operation": "dimensions",
                    "width": transform["params"].get("width"),
                    "temple_length": transform["params"].get("templeLength")
                })
            elif transform["type"] == "colorize":
                vreelaabs_request["modifications"].append({
                    "operation": "appearance",
                    "frame_color": transform["params"].get("frameColor"),
                    "lens_tint": transform["params"].get("lensColor"),
                    "lens_opacity": transform["params"].get("transparency", 1.0)
                })
        
        return vreelaabs_request
    
    @staticmethod
    def adapt_response(vreelaabs_response):
        """Convert Vreelaabs response to our standard format"""
        # Example conversion logic
        standard_response = {
            "success": vreelaabs_response.get("status") == "success",
            "transformed_image_url": vreelaabs_response.get("result_url"),
            "preview_urls": vreelaabs_response.get("preview_images", []),
            "metadata": {
                "processing_time": vreelaabs_response.get("process_time_ms"),
                "source": "vreelaabs"
            }
        }
        
        return standard_response
```

Then update the `image_transformation_service.py` to use this adapter:

```python
from src.services.adapters.vreelaabs_adapter import VreelaabsAdapter

# In the transform_image method:
# Determine if using Vreelaabs based on API endpoint
is_vreelaabs = "vreelaabs.com" in self.api_endpoint

if is_vreelaabs:
    # Use the adapter for Vreelaabs
    adapted_payload = VreelaabsAdapter.adapt_request(payload)
    # Make API call with adapted payload
    response = requests.post(
        self.api_endpoint,
        headers=self._api_headers(),
        json=adapted_payload
    )
    result = VreelaabsAdapter.adapt_response(response.json())
else:
    # Use standard format for our default API
    # [existing code]
```

## Using Your Own Service on Google Cloud Run

### Step 1: Deploy Your Service to Google Cloud Run

1. Create a Dockerfile for your service:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:$PORT"]
```

2. Build and deploy to Cloud Run:

```bash
# Build the container
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/3d-transform-api

# Deploy to Cloud Run
gcloud run deploy 3d-transform-api \
  --image gcr.io/YOUR_PROJECT_ID/3d-transform-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

3. Set up authentication (if needed):

```bash
# Create a service account
gcloud iam service-accounts create 3d-transform-sa

# Grant appropriate roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:3d-transform-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.invoker"

# Create a key
gcloud iam service-accounts keys create key.json \
  --iam-account=3d-transform-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### Step 2: Update Environment Variables

Modify your environment files to point to your Cloud Run service:

```bash
# Custom Cloud Run Service Configuration
TRANSFORM_3D_API_ENDPOINT=https://3d-transform-api-xxxx-uc.a.run.app
TRANSFORM_3D_API_KEY=your-service-authentication-key

# If using Google service account authentication
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

### Step 3: Implement Region-Specific Services (If Needed)

For data residency requirements, you may need to deploy your service to multiple regions:

1. Deploy to EU region:
```bash
gcloud run deploy 3d-transform-api-eu \
  --image gcr.io/YOUR_PROJECT_ID/3d-transform-api \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

2. Deploy to NA region:
```bash
gcloud run deploy 3d-transform-api-na \
  --image gcr.io/YOUR_PROJECT_ID/3d-transform-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

3. Update region-specific environment variables:
```bash
# Region-specific endpoints
EU_TRANSFORM_3D_API_ENDPOINT=https://3d-transform-api-eu-xxxx-ew.a.run.app
NA_TRANSFORM_3D_API_ENDPOINT=https://3d-transform-api-na-xxxx-uc.a.run.app
```

## Modifying the Service Implementation

If your third-party API or custom service has significantly different behavior, you might need to modify the `ImageTransformationService` class:

1. Create a specialized service class:

```python
class VreelaabsTransformationService(ImageTransformationService):
    """Specialized service for Vreelaabs API"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Any Vreelaabs-specific initialization
        
    def get_transformation_options(self):
        """Override to match Vreelaabs API structure"""
        try:
            response = requests.get(
                f"{self.api_endpoint}/capabilities",  # Different endpoint
                headers=self._api_headers()
            )
            response.raise_for_status()
            
            # Convert from Vreelaabs format to our standard format
            vreelaabs_options = response.json()
            
            standard_options = {
                "transformations": []
            }
            
            # Map options
            for option in vreelaabs_options.get("operations", []):
                # Conversion logic here
                
            return standard_options
        except Exception as e:
            logger.error(f"Error fetching transformation options: {str(e)}")
            return {"error": str(e)}
    
    # Override other methods as needed
```

2. Update the factory function that creates the service:

```python
def get_transformation_service(request: Request, x_data_region: Optional[str] = Header(None)):
    """Get appropriate transformation service based on configuration."""
    # Determine region
    region = get_region_from_request(request)
    region_str = region.value
    
    # Get API key for this region
    api_key = TRANSFORM_3D_API_KEYS.get(region, TRANSFORM_3D_API_KEYS[Region.DEFAULT])
    
    # Get API endpoint for this region
    api_endpoint = os.getenv(f"{region_str.upper()}_TRANSFORM_3D_API_ENDPOINT", 
                            os.getenv("TRANSFORM_3D_API_ENDPOINT"))
    
    # Choose service class based on API endpoint
    if "vreelaabs.com" in api_endpoint:
        service_class = VreelaabsTransformationService
    else:
        service_class = ImageTransformationService
    
    # Initialize and return the appropriate service
    return service_class(
        api_key=api_key,
        api_endpoint=api_endpoint,
        mongodb_url=mongodb_url,
        db_name=db_name,
        region=region_str
    )
```

## Security Considerations

When integrating with third-party services:

1. **API Keys**: Store API keys securely using environment variables or a secret management service.
2. **Data Privacy**: Ensure the third-party service adheres to your data privacy requirements, especially for GDPR compliance.
3. **Service Accounts**: For Google Cloud Run, use service accounts with minimal permissions.
4. **Authentication**: If your Cloud Run service requires authentication, implement token verification.
5. **Encryption**: Ensure data is encrypted in transit using HTTPS.

## Example: Using Vreelaabs API

Here's a complete example of integrating with Vreelaabs:

1. Update environment variables:
```bash
# Vreelaabs API Configuration
TRANSFORM_3D_API_KEY=vreela-api-xxxxxxxxxxxx
TRANSFORM_3D_API_ENDPOINT=https://api.vreelaabs.com/transform/v2

# Region-specific keys
EU_TRANSFORM_3D_API_KEY=vreela-api-eu-xxxxxxxxxxxx
NA_TRANSFORM_3D_API_KEY=vreela-api-na-xxxxxxxxxxxx
```

2. Create the adapter (as shown above)

3. Test the integration:
```python
# Example Python code
from src.services.image_transformation_service import ImageTransformationService

service = ImageTransformationService(
    api_key=os.getenv('TRANSFORM_3D_API_KEY'),
    api_endpoint=os.getenv('TRANSFORM_3D_API_ENDPOINT'),
    region='eu'
)

# Test transformation
result = service.transform_image('60f8a7b296e8d631c4b09a42', [
    {
        "type": "resize",
        "params": {
            "width": 140,
            "templeLength": 145
        }
    }
])

print(result)
```

## Example: Using Your Own Cloud Run Service

1. Deploy your service to Cloud Run (as shown above)

2. Update environment variables:
```bash
# Custom Cloud Run Service Configuration
TRANSFORM_3D_API_ENDPOINT=https://3d-transform-api-xxxx-uc.a.run.app
TRANSFORM_3D_API_KEY=your-service-authentication-key

# Region-specific endpoints
EU_TRANSFORM_3D_API_ENDPOINT=https://3d-transform-api-eu-xxxx-ew.a.run.app
NA_TRANSFORM_3D_API_ENDPOINT=https://3d-transform-api-na-xxxx-uc.a.run.app
```

3. Test the integration:
```python
# Example Python code
from src.services.image_transformation_service import ImageTransformationService

service = ImageTransformationService(
    api_key=os.getenv('TRANSFORM_3D_API_KEY'),
    api_endpoint=os.getenv('TRANSFORM_3D_API_ENDPOINT'),
    region='na'
)

# Test transformation
result = service.transform_image('60f8a7b296e8d631c4b09a42', [
    {
        "type": "resize",
        "params": {
            "width": 140,
            "templeLength": 145
        }
    }
])

print(result)
```

## Troubleshooting

### Common Issues with Third-Party APIs

1. **Authentication Errors**:
   - Verify API key formatting
   - Check if region-specific keys are required
   - Ensure the API key has the necessary permissions

2. **Endpoint Configuration**:
   - Confirm the API endpoint URL is correct
   - Check if the endpoint requires a specific version path
   - Verify if the endpoint requires additional parameters

3. **Request Format Issues**:
   - Review API documentation for the correct payload structure
   - Implement and test the adapter thoroughly
   - Start with simple transformations before attempting complex ones

4. **Region-Specific Problems**:
   - Ensure endpoints are deployed in the appropriate regions
   - Verify that region-specific configuration is correctly applied
   - Test with explicit region headers to bypass auto-detection

### Monitoring and Logging

Add additional logging for third-party integrations:

```python
# In ImageTransformationService

def transform_image(self, image_id, transformations):
    try:
        # Existing code...
        
        # Add detailed logging for third-party APIs
        logger.info(f"Sending request to {self.api_endpoint} with API key: {self.api_key[:5]}***")
        logger.debug(f"Request payload: {json.dumps(payload)}")
        
        response = requests.post(...)
        
        logger.info(f"Response received from {self.api_endpoint}, status: {response.status_code}")
        logger.debug(f"Response data: {response.text[:200]}...")
        
        # Existing code...
    except Exception as e:
        logger.error(f"Error in third-party API call to {self.api_endpoint}: {str(e)}", exc_info=True)
        return {"error": str(e)}
```

For more detailed guidance on specific third-party services or custom implementations, please refer to the respective API documentation or contact your cloud provider's support.
