# Docker Deploy to Cloud Run PowerShell Script

This document contains a PowerShell script for deploying to Cloud Run using Docker on Windows. Save the script content to a file named `docker-deploy-to-cloud-run.ps1`.

```powershell
# Docker Deploy to Cloud Run PowerShell Script

# Configuration
$PROJECT_ID = "ml-datadriven-recos"  # Google Cloud project ID
$REGION = "us-central1"              # Google Cloud region
$API_SERVICE_NAME = "eyewear-ml-api" # API Cloud Run service name
$FRONTEND_SERVICE_NAME = "eyewear-ml-frontend" # Frontend Cloud Run service name
$API_IMAGE_NAME = "eyewear-ml-api"    # API Local image name
$FRONTEND_IMAGE_NAME = "eyewear-ml-frontend"    # Frontend Local image name

# Function to display colored text
function Write-ColorText {
    param (
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

# Function to display section headers
function Write-SectionHeader {
    param (
        [string]$Title
    )
    Write-Host "`n=============================================" -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host "=============================================`n" -ForegroundColor Cyan
}

# Step 1: Authenticate with Google Cloud (if not already authenticated)
Write-ColorText "Checking Google Cloud authentication status..." "Yellow"
$AUTH_STATUS = gcloud auth list --filter=status:ACTIVE --format="value(account)"
if ([string]::IsNullOrEmpty($AUTH_STATUS)) {
    Write-ColorText "Not authenticated with Google Cloud. Please log in." "Red"
    gcloud auth login
} else {
    Write-ColorText "Already authenticated as: $AUTH_STATUS" "Green"
}

# Step 2: Set the Google Cloud project
Write-ColorText "Setting Google Cloud project to: $PROJECT_ID" "Yellow"
gcloud config set project $PROJECT_ID

# Step 3: Configure Docker to use Google Container Registry
Write-ColorText "Configuring Docker to use Google Container Registry" "Yellow"
gcloud auth configure-docker

# Step 4: Build and Deploy the API
Write-SectionHeader "STARTING BACKEND API DEPLOYMENT"

# Build the Docker image locally
Write-ColorText "Building Docker image: $API_IMAGE_NAME" "Yellow"
docker build -t $API_IMAGE_NAME .

# Tag the image for Google Container Registry
$GCR_API_IMAGE = "gcr.io/$PROJECT_ID/$API_IMAGE_NAME"
Write-ColorText "Tagging Docker image for GCR: $GCR_API_IMAGE" "Yellow"
docker tag $API_IMAGE_NAME $GCR_API_IMAGE

# Push the image to Google Container Registry
Write-ColorText "Pushing Docker image to Google Container Registry" "Yellow"
docker push $GCR_API_IMAGE

# Deploy to Cloud Run
Write-ColorText "Deploying to Cloud Run as service: $API_SERVICE_NAME" "Yellow"
gcloud run deploy $API_SERVICE_NAME `
    --image $GCR_API_IMAGE `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --port 8000 `
    --memory 2Gi `
    --min-instances 0 `
    --max-instances 10 `
    --cpu 1

# Get the deployed service URL
Write-ColorText "API Deployment complete! Getting service URL..." "Green"
$API_SERVICE_URL = gcloud run services describe $API_SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'
Write-ColorText "API service deployed successfully at: $API_SERVICE_URL" "Green"

# Test the health endpoint
Write-ColorText "Testing the health endpoint..." "Yellow"
try {
    $HEALTH_STATUS = Invoke-WebRequest -Uri "$API_SERVICE_URL/api/v1/health" -Method Get -UseBasicParsing
    if ($HEALTH_STATUS.StatusCode -eq 200) {
        Write-ColorText "Health check successful!" "Green"
    } else {
        Write-ColorText "Health check failed! Status code: $($HEALTH_STATUS.StatusCode)" "Red"
    }
} catch {
    Write-ColorText "Health check failed! Error: $_" "Red"
}

# Step 5: Build and Deploy the Frontend
Write-SectionHeader "STARTING FRONTEND DEPLOYMENT"

# Build the Docker image locally
Write-ColorText "Building Docker image: $FRONTEND_IMAGE_NAME" "Yellow"
docker build -t $FRONTEND_IMAGE_NAME -f frontend/Dockerfile ./frontend

# Tag the image for Google Container Registry
$GCR_FRONTEND_IMAGE = "gcr.io/$PROJECT_ID/$FRONTEND_IMAGE_NAME"
Write-ColorText "Tagging Docker image for GCR: $GCR_FRONTEND_IMAGE" "Yellow"
docker tag $FRONTEND_IMAGE_NAME $GCR_FRONTEND_IMAGE

# Push the image to Google Container Registry
Write-ColorText "Pushing Docker image to Google Container Registry" "Yellow"
docker push $GCR_FRONTEND_IMAGE

# Deploy to Cloud Run
Write-ColorText "Deploying to Cloud Run as service: $FRONTEND_SERVICE_NAME" "Yellow"
gcloud run deploy $FRONTEND_SERVICE_NAME `
    --image $GCR_FRONTEND_IMAGE `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --port 80 `
    --memory 1Gi `
    --min-instances 0 `
    --max-instances 5 `
    --cpu 1 `
    --set-env-vars="API_SERVICE_URL=$API_SERVICE_URL"

# Get the deployed service URL
Write-ColorText "Frontend Deployment complete! Getting service URL..." "Green"
$FRONTEND_SERVICE_URL = gcloud run services describe $FRONTEND_SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'
Write-ColorText "Frontend service deployed successfully at: $FRONTEND_SERVICE_URL" "Green"

# Step 6: Display summary
Write-SectionHeader "DEPLOYMENT SUMMARY"
Write-ColorText "API Service URL: $API_SERVICE_URL" "Cyan"
Write-ColorText "Frontend Service URL: $FRONTEND_SERVICE_URL" "Cyan"
Write-ColorText "=============================================" "Cyan"

# Step 7: Display browser access information
Write-ColorText "You can access the deployed frontend at: $FRONTEND_SERVICE_URL" "Green"
Write-ColorText "Open this URL in your browser to view the application" "Green"

# Optional: Open the frontend in the default browser
$openBrowser = Read-Host "Would you like to open the frontend in your browser? (y/n)"
if ($openBrowser -eq "y") {
    Start-Process $FRONTEND_SERVICE_URL
}
```

## Usage Instructions

1. Save the script content to a file named `docker-deploy-to-cloud-run.ps1`
2. Open PowerShell as Administrator
3. Navigate to your project directory
4. Run the script:
   ```powershell
   .\docker-deploy-to-cloud-run.ps1
   ```

## Prerequisites

1. Docker Desktop installed and running on Windows
2. Google Cloud SDK installed and configured
3. PowerShell 5.1 or later
4. Authenticated with Google Cloud

## Troubleshooting

### Docker Issues

If you encounter Docker-related issues:

```powershell
# Check Docker is running
docker info

# If Docker is not running, start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Google Cloud SDK Issues

If you encounter Google Cloud SDK issues:

```powershell
# Check gcloud version
gcloud --version

# Update gcloud components
gcloud components update

# Re-authenticate if needed
gcloud auth login
```

### Deployment Issues

If deployment fails:

```powershell
# Check for errors in the Cloud Run service
gcloud run services describe $API_SERVICE_NAME --platform managed --region $REGION

# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$API_SERVICE_NAME" --limit 50
```

## Notes for Windows Users

- Ensure Docker Desktop is running before executing the script
- If you're using Windows Subsystem for Linux (WSL), you may need to adjust Docker paths
- PowerShell execution policy may need to be set to allow script execution:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser