#!/bin/bash

# Analytics Deployment Fix Script - Corrected Version
# Deploys from the correct directory context to include analytics files

set -e

echo "🔧 Analytics Deployment Fix Script - Corrected"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="ml-datadriven-recos"
SERVICE_NAME="commerce-studio-website"
REGION="us-central1"

echo -e "${YELLOW}📋 Pre-deployment verification...${NC}"

# 1. Verify we're in the website directory
if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Must run from website directory containing Dockerfile${NC}"
    exit 1
fi

# 2. Verify analytics files exist locally
echo "1. Checking local analytics files..."
if [ ! -d "analytics" ]; then
    echo -e "${RED}❌ Analytics directory not found!${NC}"
    exit 1
fi

required_files=(
    "analytics/index.html"
    "analytics/sales-forecasting.html" 
    "analytics/real-time-analytics.html"
    "js/analytics-showcase.js"
    "css/predictive-analytics.css"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Missing file: $file${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Found: $file${NC}"
    fi
done

# 3. Verify Dockerfile includes analytics
echo "2. Checking Dockerfile..."
if grep -q "COPY analytics/" Dockerfile; then
    echo -e "${GREEN}✅ Dockerfile includes analytics directory${NC}"
else
    echo -e "${RED}❌ Dockerfile missing analytics copy command${NC}"
    exit 1
fi

# 4. Check .gcloudignore doesn't exclude analytics
echo "3. Checking .gcloudignore..."
if [ -f "../.gcloudignore" ]; then
    if grep -q "^analytics/" ../.gcloudignore; then
        echo -e "${RED}❌ .gcloudignore excludes analytics directory${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Analytics not excluded in .gcloudignore${NC}"
    fi
fi

echo -e "${YELLOW}🚀 Starting deployment fix...${NC}"

# 5. Build and test locally first
echo "4. Building Docker image locally..."
docker build -t $SERVICE_NAME-test . || {
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
}

echo "5. Testing local container..."
# Stop any existing test container
docker stop $SERVICE_NAME-test 2>/dev/null || true
docker rm $SERVICE_NAME-test 2>/dev/null || true

# Start container in background
docker run -d -p 8080:8080 --name $SERVICE_NAME-test $SERVICE_NAME-test

# Wait for container to start
sleep 5

# Test analytics endpoints
echo "Testing analytics endpoints locally..."
test_endpoints=(
    "http://localhost:8080/analytics/index.html"
    "http://localhost:8080/analytics/sales-forecasting.html"
    "http://localhost:8080/analytics/real-time-analytics.html"
    "http://localhost:8080/js/analytics-showcase.js"
    "http://localhost:8080/css/predictive-analytics.css"
)

all_tests_passed=true
for endpoint in "${test_endpoints[@]}"; do
    if curl -f -s "$endpoint" > /dev/null; then
        echo -e "${GREEN}✅ $endpoint${NC}"
    else
        echo -e "${RED}❌ $endpoint${NC}"
        all_tests_passed=false
    fi
done

# Cleanup test container
docker stop $SERVICE_NAME-test
docker rm $SERVICE_NAME-test

if [ "$all_tests_passed" = false ]; then
    echo -e "${RED}❌ Local tests failed. Fix issues before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Local tests passed!${NC}"

# 6. Deploy to Cloud Run from website directory
echo "6. Deploying to Google Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300 || {
    echo -e "${RED}❌ Cloud Run deployment failed${NC}"
    exit 1
}

echo -e "${GREEN}✅ Deployment completed!${NC}"

# 7. Verify deployment
echo "7. Verifying deployment..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --format="value(status.url)")

echo "Service URL: $SERVICE_URL"

# Wait for deployment to be ready
echo "Waiting for service to be ready..."
sleep 15

# Test production endpoints
echo "Testing production endpoints..."
all_tests_passed=true
for endpoint in "${test_endpoints[@]}"; do
    prod_endpoint="${endpoint/http:\/\/localhost:8080/$SERVICE_URL}"
    echo "Testing: $prod_endpoint"
    if curl -f -s "$prod_endpoint" > /dev/null; then
        echo -e "${GREEN}✅ $prod_endpoint${NC}"
    else
        echo -e "${RED}❌ $prod_endpoint${NC}"
        all_tests_passed=false
    fi
done

if [ "$all_tests_passed" = true ]; then
    echo -e "${GREEN}🎉 Deployment fix successful!${NC}"
    echo -e "${GREEN}All analytics endpoints are now working.${NC}"
    echo ""
    echo "📋 Verification URLs:"
    echo "• Analytics Hub: $SERVICE_URL/analytics/"
    echo "• Sales Forecasting: $SERVICE_URL/analytics/sales-forecasting.html"
    echo "• Real-time Analytics: $SERVICE_URL/analytics/real-time-analytics.html"
    echo ""
    echo "🔄 Run post-deployment monitoring:"
    echo "cd .. && node website/post-deployment-monitoring.js"
else
    echo -e "${RED}❌ Deployment verification failed${NC}"
    echo "Check Cloud Run logs for details:"
    echo "gcloud logs read --project=$PROJECT_ID --service=$SERVICE_NAME"
    exit 1
fi

echo -e "${YELLOW}📊 Next steps:${NC}"
echo "1. Run comprehensive monitoring: cd .. && node website/post-deployment-monitoring.js"
echo "2. Test all interactive features manually"
echo "3. Set up continuous monitoring alerts"
echo "4. Update documentation with new deployment process"

echo -e "${GREEN}✅ Analytics deployment fix completed successfully!${NC}"