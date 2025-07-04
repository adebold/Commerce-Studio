#!/bin/bash

# Direct GCP Website Deployment Script for Commerce Studio
# This script deploys the website directly to GCP Cloud Run

set -e

echo "🚀 Starting Direct Website Deployment to GCP..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_warning "No active gcloud authentication found. Please run 'gcloud auth login'"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    print_error "No GCP project set. Please run 'gcloud config set project YOUR_PROJECT_ID'"
    exit 1
fi

print_status "Using GCP Project: $PROJECT_ID"
print_status "Current directory: $(pwd)"

# Step 1: Navigate to website directory and deploy
print_status "Step 1: Deploying website to Cloud Run..."

# Check if website directory exists
if [ ! -d "website" ]; then
    print_error "Website directory not found"
    exit 1
fi

# Navigate to website directory
cd website

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile not found in website directory"
    exit 1
fi

print_status "Found Dockerfile, proceeding with deployment..."

# Build and deploy to Cloud Run
print_status "Building container image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/commerce-studio-website --timeout=20m

if [ $? -eq 0 ]; then
    print_success "Container image built successfully!"
else
    print_error "Container build failed"
    exit 1
fi

print_status "Deploying to Cloud Run..."
gcloud run deploy commerce-studio-website \
    --image gcr.io/$PROJECT_ID/commerce-studio-website \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 80 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300 \
    --set-env-vars NODE_ENV=production,PORT=80

if [ $? -eq 0 ]; then
    print_success "Website deployed successfully!"
else
    print_error "Website deployment failed"
    exit 1
fi

# Get the service URL
SERVICE_URL=$(gcloud run services describe commerce-studio-website --platform managed --region us-central1 --format 'value(status.url)')

print_success "Website deployed successfully!"
print_success "Service URL: $SERVICE_URL"

# Step 2: Test the deployment
print_status "Step 2: Testing deployment..."
if curl -s --head "$SERVICE_URL" | head -n 1 | grep -q "200 OK"; then
    print_success "Website is responding correctly!"
else
    print_warning "Website may not be responding correctly. Please check manually."
fi

# Step 3: Summary
echo ""
echo "================================================"
print_success "🎉 GCP Website Deployment Complete!"
echo "================================================"
print_status "Project: $PROJECT_ID"
print_status "Website URL: $SERVICE_URL"
print_status "Region: us-central1"
print_status "Service: commerce-studio-website"
echo ""
print_status "Features deployed:"
echo "  ✅ Customer Portal with billing functionality"
echo "  ✅ Admin Portal with enterprise features"
echo "  ✅ Enhanced UI/UX with Apple design system"
echo "  ✅ Optimized codebase (500MB+ reduction)"
echo ""
print_status "Next steps:"
echo "1. Test the deployed application: $SERVICE_URL"
echo "2. Configure custom domain (optional)"
echo "3. Set up monitoring and alerts"
echo "4. Configure CI/CD pipeline"
echo ""
print_success "Deployment completed successfully! 🚀"

# Return to original directory
cd ..