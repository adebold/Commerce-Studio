# Docker Deploy to Cloud Run

This guide provides instructions for deploying to Cloud Run using Docker, which involves building a Docker image locally, pushing it to Google Container Registry, and then deploying it to Cloud Run.

## Prerequisites

1. Docker installed and running
2. Google Cloud SDK installed and configured
3. Authenticated with Google Cloud
4. Access to the Google Cloud project

## Step 1: Authenticate with Google Cloud

```bash
# Check authentication status
gcloud auth list --filter=status:ACTIVE --format="value(account)"

# If not authenticated, log in
gcloud auth login

# Set the Google Cloud project
gcloud config set project ml-datadriven-recos
```

## Step 2: Configure Docker to use Google Container Registry

```bash
# Configure Docker to use Google Container Registry
gcloud auth configure-docker
```

## Step 3: Build and Deploy the API

```bash
# Build the Docker image locally
docker build -t eyewear-ml-api .

# Tag the image for Google Container Registry
docker tag eyewear-ml-api gcr.io/ml-datadriven-recos/eyewear-ml-api

# Push the image to Google Container Registry
docker push gcr.io/ml-datadriven-recos/eyewear-ml-api

# Deploy the image to Cloud Run
gcloud run deploy eyewear-ml-api \
  --image gcr.io/ml-datadriven-recos/eyewear-ml-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000 \
  --memory 2Gi \
  --min-instances 0 \
  --max-instances 10 \
  --cpu 1

# Get the deployed service URL
API_SERVICE_URL=$(gcloud run services describe eyewear-ml-api --platform managed --region us-central1 --format 'value(status.url)')
echo "API service deployed successfully at: $API_SERVICE_URL"

# Test the health endpoint
curl -s "$API_SERVICE_URL/api/v1/health"
```

## Step 4: Build and Deploy the Frontend

```bash
# Build the Docker image locally
docker build -t eyewear-ml-frontend -f frontend/Dockerfile ./frontend

# Tag the image for Google Container Registry
docker tag eyewear-ml-frontend gcr.io/ml-datadriven-recos/eyewear-ml-frontend

# Push the image to Google Container Registry
docker push gcr.io/ml-datadriven-recos/eyewear-ml-frontend

# Deploy the image to Cloud Run
gcloud run deploy eyewear-ml-frontend \
  --image gcr.io/ml-datadriven-recos/eyewear-ml-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 1Gi \
  --min-instances 0 \
  --max-instances 5 \
  --cpu 1 \
  --set-env-vars="API_SERVICE_URL=$API_SERVICE_URL"

# Get the deployed service URL
FRONTEND_SERVICE_URL=$(gcloud run services describe eyewear-ml-frontend --platform managed --region us-central1 --format 'value(status.url)')
echo "Frontend service deployed successfully at: $FRONTEND_SERVICE_URL"
```

## Step 5: Verify the Deployment

```bash
# Display deployment summary
echo -e "\n============================================="
echo "DEPLOYMENT SUMMARY"
echo "============================================="
echo "API Service URL: $API_SERVICE_URL"
echo "Frontend Service URL: $FRONTEND_SERVICE_URL"
echo "============================================="

# Open the frontend in a browser
echo "You can access the deployed frontend at: $FRONTEND_SERVICE_URL"
```

## Complete Script

Here's a complete script that you can use to deploy both the API and frontend:

```bash
#!/bin/bash
# Docker Deploy to Cloud Run Script

# Configuration
PROJECT_ID="ml-datadriven-recos"  # Google Cloud project ID
REGION="us-central1"              # Google Cloud region
API_SERVICE_NAME="eyewear-ml-api" # API Cloud Run service name
FRONTEND_SERVICE_NAME="eyewear-ml-frontend" # Frontend Cloud Run service name
API_IMAGE_NAME="eyewear-ml-api"    # API Local image name
FRONTEND_IMAGE_NAME="eyewear-ml-frontend"    # Frontend Local image name

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

# Step 3: Configure Docker to use Google Container Registry
echo "Configuring Docker to use Google Container Registry"
gcloud auth configure-docker

# Step 4: Build and Deploy the API
echo -e "\n============================================="
echo "STARTING BACKEND API DEPLOYMENT"
echo -e "=============================================\n"

# Build the Docker image locally
echo "Building Docker image: $API_IMAGE_NAME"
docker build -t $API_IMAGE_NAME .

# Tag the image for Google Container Registry
GCR_API_IMAGE="gcr.io/$PROJECT_ID/$API_IMAGE_NAME"
echo "Tagging Docker image for GCR: $GCR_API_IMAGE"
docker tag $API_IMAGE_NAME $GCR_API_IMAGE

# Push the image to Google Container Registry
echo "Pushing Docker image to Google Container Registry"
docker push $GCR_API_IMAGE

# Deploy to Cloud Run
echo "Deploying to Cloud Run as service: $API_SERVICE_NAME"
gcloud run deploy $API_SERVICE_NAME \
    --image $GCR_API_IMAGE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8000 \
    --memory 2Gi \
    --min-instances 0 \
    --max-instances 10 \
    --cpu 1

# Get the deployed service URL
echo "API Deployment complete! Getting service URL..."
API_SERVICE_URL=$(gcloud run services describe $API_SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "API service deployed successfully at: $API_SERVICE_URL"

# Test the health endpoint
echo "Testing the health endpoint..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_SERVICE_URL/api/v1/health)
if [ "$HEALTH_STATUS" == "200" ]; then
    echo "Health check successful!"
else
    echo "Health check failed! Status code: $HEALTH_STATUS"
fi

# Step 5: Build and Deploy the Frontend
echo -e "\n============================================="
echo "STARTING FRONTEND DEPLOYMENT"
echo -e "=============================================\n"

# Build the Docker image locally
echo "Building Docker image: $FRONTEND_IMAGE_NAME"
docker build -t $FRONTEND_IMAGE_NAME -f frontend/Dockerfile ./frontend

# Tag the image for Google Container Registry
GCR_FRONTEND_IMAGE="gcr.io/$PROJECT_ID/$FRONTEND_IMAGE_NAME"
echo "Tagging Docker image for GCR: $GCR_FRONTEND_IMAGE"
docker tag $FRONTEND_IMAGE_NAME $GCR_FRONTEND_IMAGE

# Push the image to Google Container Registry
echo "Pushing Docker image to Google Container Registry"
docker push $GCR_FRONTEND_IMAGE

# Deploy to Cloud Run
echo "Deploying to Cloud Run as service: $FRONTEND_SERVICE_NAME"
gcloud run deploy $FRONTEND_SERVICE_NAME \
    --image $GCR_FRONTEND_IMAGE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 80 \
    --memory 1Gi \
    --min-instances 0 \
    --max-instances 5 \
    --cpu 1 \
    --set-env-vars="API_SERVICE_URL=$API_SERVICE_URL"

# Get the deployed service URL
echo "Frontend Deployment complete! Getting service URL..."
FRONTEND_SERVICE_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "Frontend service deployed successfully at: $FRONTEND_SERVICE_URL"

# Step 6: Display summary
echo -e "\n============================================="
echo "DEPLOYMENT SUMMARY"
echo "============================================="
echo "API Service URL: $API_SERVICE_URL"
echo "Frontend Service URL: $FRONTEND_SERVICE_URL"
echo "============================================="

# Step 7: Display browser access information
echo "You can access the deployed frontend at: $FRONTEND_SERVICE_URL"
echo "Open this URL in your browser to view the application"
```

Save this script as `docker-deploy-to-cloud-run.sh`, make it executable with `chmod +x docker-deploy-to-cloud-run.sh`, and run it with `./docker-deploy-to-cloud-run.sh`.

## Advantages of Docker Deploy

1. **Full Control**: You have full control over the Docker build process
2. **Local Testing**: You can test the Docker image locally before deploying
3. **Custom Builds**: You can customize the build process as needed
4. **Familiar Workflow**: Uses the standard Docker workflow

## Disadvantages of Docker Deploy

1. **Local Resources**: Requires Docker to be installed and running locally
2. **Build Time**: Building large images locally can be time-consuming
3. **Manual Process**: More manual steps compared to the `--source` approach
4. **Consistency**: Potential for inconsistency between local and production environments

## Next Steps

After successfully deploying with Docker, consider implementing the more streamlined approaches described in the other documentation:

1. **Single Command Deployment**: Using `gcloud run deploy --source`
2. **GitHub Actions Workflow**: For automated CI/CD integration

These approaches can further simplify your deployment process while maintaining the flexibility of Docker.