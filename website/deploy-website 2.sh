#!/bin/bash

# Deploy VARAi Commerce Studio Website to Google Cloud Run
# This script deploys the actual SAAS platform website

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="ml-datadriven-recos"
REGION="us-central1"
SERVICE_NAME="commerce-studio-website"
FRONTEND_SERVICE_NAME="commerce-studio-frontend"

echo -e "${BLUE}🚀 Deploying VARAi Commerce Studio SAAS Website${NC}"
echo "=================================================="

# Check if we're in the website directory
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ Error: Must run from website directory${NC}"
    exit 1
fi

# Check if required files exist
echo -e "${YELLOW}📋 Checking deployment files...${NC}"
required_files=("Dockerfile" "nginx.conf" "cloudbuild.yaml" "index.html" "css/main.css" "js/main.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Missing required file: $file${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Found: $file${NC}"
done

# Set the Google Cloud project
echo -e "${YELLOW}🔧 Setting up Google Cloud project...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and deploy using Cloud Build
echo -e "${YELLOW}🏗️ Building and deploying with Cloud Build...${NC}"
gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID

# Get the service URLs
echo -e "${YELLOW}📡 Getting service URLs...${NC}"
WEBSITE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --region=$REGION --format="value(status.url)" 2>/dev/null || echo "Not deployed")

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "================================"
echo -e "${BLUE}VARAi Commerce Studio Website:${NC} $WEBSITE_URL"
echo -e "${BLUE}Frontend Service (Updated):${NC} $FRONTEND_URL"
echo ""

# Test the deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL" | grep -q "200"; then
    echo -e "${GREEN}✅ Website is responding correctly${NC}"
else
    echo -e "${RED}❌ Website health check failed${NC}"
    exit 1
fi

# Check if the content is correct
echo -e "${YELLOW}🔍 Verifying website content...${NC}"
if curl -s "$WEBSITE_URL" | grep -q "VARAi Commerce Studio"; then
    echo -e "${GREEN}✅ Website content verified - VARAi Commerce Studio branding found${NC}"
else
    echo -e "${RED}❌ Website content verification failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎯 SAAS Platform Successfully Deployed!${NC}"
echo "========================================"
echo -e "${BLUE}Main Website:${NC} $WEBSITE_URL"
echo -e "${BLUE}Features:${NC}"
echo "  • AI-Powered Eyewear Retail Platform"
echo "  • Virtual Try-On Technology"
echo "  • Merchant Dashboard"
echo "  • Customer Signup Flow"
echo "  • Demo Capabilities"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Test all website features and pages"
echo "2. Verify signup and demo flows"
echo "3. Update DNS records if needed"
echo "4. Monitor performance and logs"
echo ""
echo -e "${GREEN}✨ The CORRECT Commerce Studio SAAS platform is now live!${NC}"