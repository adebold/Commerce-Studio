# PowerShell deployment script for GCP

# Configuration
$PROJECT_ID = "varai-commerce-studio" # Replace with your GCP project ID
$REGION = "us-central1"               # Replace with your preferred region
$BACKEND_IMAGE_NAME = "eyewear-ml-api"
$FRONTEND_IMAGE_NAME = "eyewear-ml-frontend"
$VERSION = Get-Date -Format "yyyyMMdd-HHmmss" # Timestamp-based version

# Ensure gcloud is installed and configured
Write-Host "Checking gcloud authentication..." -ForegroundColor Cyan
try {
    gcloud auth print-access-token | Out-Null
}
catch {
    Write-Host "Not authenticated with gcloud. Please run 'gcloud auth login' first." -ForegroundColor Red
    exit 1
}

# Set the current project
Write-Host "Setting GCP project to $PROJECT_ID..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

# Build and push backend image
Write-Host "Building backend Docker image..." -ForegroundColor Cyan
docker build -t "$BACKEND_IMAGE_NAME`:$VERSION" -f Dockerfile .
Write-Host "Tagging backend image for GCR..." -ForegroundColor Cyan
docker tag "$BACKEND_IMAGE_NAME`:$VERSION" "gcr.io/$PROJECT_ID/$BACKEND_IMAGE_NAME`:$VERSION"
docker tag "$BACKEND_IMAGE_NAME`:$VERSION" "gcr.io/$PROJECT_ID/$BACKEND_IMAGE_NAME`:latest"

Write-Host "Pushing backend image to Google Container Registry..." -ForegroundColor Cyan
docker push "gcr.io/$PROJECT_ID/$BACKEND_IMAGE_NAME`:$VERSION"
docker push "gcr.io/$PROJECT_ID/$BACKEND_IMAGE_NAME`:latest"

# Build and push frontend image
Write-Host "Building frontend Docker image..." -ForegroundColor Cyan
Push-Location -Path frontend
docker build -t "$FRONTEND_IMAGE_NAME`:$VERSION" -f Dockerfile .
Write-Host "Tagging frontend image for GCR..." -ForegroundColor Cyan
docker tag "$FRONTEND_IMAGE_NAME`:$VERSION" "gcr.io/$PROJECT_ID/$FRONTEND_IMAGE_NAME`:$VERSION"
docker tag "$FRONTEND_IMAGE_NAME`:$VERSION" "gcr.io/$PROJECT_ID/$FRONTEND_IMAGE_NAME`:latest"

Write-Host "Pushing frontend image to Google Container Registry..." -ForegroundColor Cyan
docker push "gcr.io/$PROJECT_ID/$FRONTEND_IMAGE_NAME`:$VERSION"
docker push "gcr.io/$PROJECT_ID/$FRONTEND_IMAGE_NAME`:latest"
Pop-Location

# Deploy to Cloud Run
Write-Host "Deploying backend to Cloud Run..." -ForegroundColor Cyan
gcloud run deploy eyewear-ml-api `
  --image "gcr.io/$PROJECT_ID/$BACKEND_IMAGE_NAME`:$VERSION" `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated

Write-Host "Deploying frontend to Cloud Run..." -ForegroundColor Cyan
gcloud run deploy eyewear-ml-frontend `
  --image "gcr.io/$PROJECT_ID/$FRONTEND_IMAGE_NAME`:$VERSION" `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated

# Display deployment information
Write-Host "Deployment completed!" -ForegroundColor Green
$BACKEND_URL = $(gcloud run services describe eyewear-ml-api --platform managed --region $REGION --format 'value(status.url)')
$FRONTEND_URL = $(gcloud run services describe eyewear-ml-frontend --platform managed --region $REGION --format 'value(status.url)')

Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Yellow
Write-Host "Frontend URL: $FRONTEND_URL" -ForegroundColor Yellow
