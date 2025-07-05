# Simple Cloud Run Deployment Script

This file contains a simple shell script for deploying to Cloud Run using the single command approach.

## Script Content

```bash
#!/bin/bash
# Simple Cloud Run Deployment Script
# This script uses the simplified gcloud run deploy command with --source flag

# Configuration
PROJECT_ID="ml-datadriven-recos"  # Google Cloud project ID
REGION="us-central1"              # Google Cloud region
API_SERVICE_NAME="eyewear-ml-api" # API Cloud Run service name
FRONTEND_SERVICE_NAME="eyewear-ml-frontend" # Frontend Cloud Run service name

# Step 1: Authenticate with Google Cloud (if not already authenticated)
echo "Checking Google Cloud authentication status..."
AUTH_STATUS=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
if [ -z "$AUTH_STATUS" ]; then
    echo "Not authenticated with Google Cloud. Please log in."
    gcloud auth login
else
    echo "Already authenticated as: $AUTH_STATUS"
fi

# Step 2: Set the Google Cloud project
echo "Setting Google Cloud project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Step 3: Deploy API to Cloud Run directly from source
echo -e "\n============================================="
echo "STARTING BACKEND API DEPLOYMENT"
echo -e "=============================================\n"

echo "Deploying API to Cloud Run as service: $API_SERVICE_NAME"
gcloud run deploy $API_SERVICE_NAME \
    --source . \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8000 \
    --memory 2Gi \
    --min-instances 0 \
    --max-instances 10 \
    --cpu 1

# Step 4: Get the deployed API service URL
echo "API Deployment complete! Getting service URL..."
API_SERVICE_URL=$(gcloud run services describe $API_SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "API service deployed successfully at: $API_SERVICE_URL"

# Step 5: Test the health endpoint
echo "Testing the API health endpoint..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_SERVICE_URL/api/v1/health)
if [ "$HEALTH_STATUS" == "200" ]; then
    echo "Health check successful!"
else
    echo "Health check failed! Status code: $HEALTH_STATUS"
fi

# Step 6: Deploy Frontend to Cloud Run directly from source
echo -e "\n============================================="
echo "STARTING FRONTEND DEPLOYMENT"
echo -e "=============================================\n"

echo "Deploying Frontend to Cloud Run as service: $FRONTEND_SERVICE_NAME"
gcloud run deploy $FRONTEND_SERVICE_NAME \
    --source ./frontend \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 80 \
    --memory 1Gi \
    --min-instances 0 \
    --max-instances 5 \
    --cpu 1 \
    --set-env-vars="API_SERVICE_URL=$API_SERVICE_URL"

# Step 7: Get the deployed Frontend service URL
echo "Frontend Deployment complete! Getting service URL..."
FRONTEND_SERVICE_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "Frontend service deployed successfully at: $FRONTEND_SERVICE_URL"

# Step 8: Display summary
echo -e "\n============================================="
echo "DEPLOYMENT SUMMARY"
echo "============================================="
echo "API Service URL: $API_SERVICE_URL"
echo "Frontend Service URL: $FRONTEND_SERVICE_URL"
echo "============================================="

# Step 9: Display browser access information
echo "You can access the deployed frontend at: $FRONTEND_SERVICE_URL"
echo "Open this URL in your browser to view the application"
```

## Usage Instructions

1. Save the above script to a file named `deploy-to-cloud-run-simple.sh`
2. Make it executable: `chmod +x deploy-to-cloud-run-simple.sh`
3. Run it: `./deploy-to-cloud-run-simple.sh`

This script will:
1. Authenticate with Google Cloud
2. Deploy the API directly from source code
3. Deploy the frontend directly from source code
4. Set up the necessary environment variables
5. Display the deployment URLs

## Benefits

- No need to manually build Docker images
- No need to manually push to container registry
- Simplified deployment process
- Uses Cloud Build behind the scenes