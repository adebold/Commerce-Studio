#!/bin/bash

# 🚀 Deploy Commerce Studio to GCP
# This script pushes the cleaned repository to GCP and triggers deployment

set -e

echo "🚀 Starting GCP Deployment for Commerce Studio..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch:${NC} $CURRENT_BRANCH"

# Push to origin
echo -e "\n${YELLOW}Step 1: Pushing to origin repository...${NC}"
git push origin $CURRENT_BRANCH

# Check if we have GCP project configured
if command -v gcloud &> /dev/null; then
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    if [ ! -z "$PROJECT_ID" ]; then
        echo -e "${BLUE}GCP Project:${NC} $PROJECT_ID"
        
        # Trigger Cloud Build if cloudbuild.yaml exists
        if [ -f "cloudbuild.yaml" ]; then
            echo -e "\n${YELLOW}Step 2: Triggering Cloud Build deployment...${NC}"
            gcloud builds submit --config cloudbuild.yaml .
        elif [ -f "website/cloudbuild.yaml" ]; then
            echo -e "\n${YELLOW}Step 2: Triggering Cloud Build deployment for website...${NC}"
            gcloud builds submit --config website/cloudbuild.yaml website/
        else
            echo -e "\n${YELLOW}Step 2: No cloudbuild.yaml found, deploying manually...${NC}"
            
            # Deploy website to Cloud Run if Dockerfile exists
            if [ -f "website/Dockerfile" ]; then
                echo -e "${BLUE}Deploying website to Cloud Run...${NC}"
                gcloud run deploy commerce-studio-website \
                    --source website/ \
                    --platform managed \
                    --region us-central1 \
                    --allow-unauthenticated
            fi
            
            # Deploy API to Cloud Run if API Dockerfile exists
            if [ -f "src/Dockerfile" ] || [ -f "Dockerfile" ]; then
                echo -e "${BLUE}Deploying API to Cloud Run...${NC}"
                gcloud run deploy commerce-studio-api \
                    --source . \
                    --platform managed \
                    --region us-central1 \
                    --allow-unauthenticated
            fi
        fi
        
        echo -e "\n${GREEN}✅ GCP deployment initiated successfully!${NC}"
        echo -e "${BLUE}Monitor deployment progress in GCP Console:${NC}"
        echo -e "https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
        
    else
        echo -e "${RED}❌ No GCP project configured. Run 'gcloud config set project YOUR_PROJECT_ID'${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ gcloud CLI not found. Please install Google Cloud SDK.${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 Deployment process completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Monitor Cloud Build logs in GCP Console"
echo "2. Check Cloud Run services for deployment status"
echo "3. Test the deployed application endpoints"
echo "4. Configure custom domains if needed"