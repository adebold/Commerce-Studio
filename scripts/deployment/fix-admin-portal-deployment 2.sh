#!/bin/bash

echo "🔧 Admin Portal Navigation Fix Deployment"
echo "========================================"

# Set project details
PROJECT_ID="commerce-studio-website"
SERVICE_NAME="commerce-studio-website"
REGION="us-central1"

echo "📋 Project: $PROJECT_ID"
echo "🚀 Service: $SERVICE_NAME"
echo "🌍 Region: $REGION"
echo ""

# Verify admin portal file integrity
echo "🔍 Verifying admin portal file integrity..."
if grep -q "onclick.*showSection" website/admin/index.html; then
    echo "✅ Admin portal navigation links with onclick handlers: FOUND"
else
    echo "❌ Admin portal navigation links with onclick handlers: MISSING"
    exit 1
fi

if grep -q "function showSection" website/admin/index.html; then
    echo "✅ showSection JavaScript function: FOUND"
else
    echo "❌ showSection JavaScript function: MISSING"
    exit 1
fi

if grep -q "admin-portal.js" website/admin/index.html; then
    echo "✅ Admin portal API integration script: FOUND"
else
    echo "❌ Admin portal API integration script: MISSING"
    exit 1
fi

echo ""
echo "🏗️ Building and deploying with correct admin portal..."

# Build the container image
echo "📦 Building container image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --project=$PROJECT_ID \
    --timeout=20m \
    --machine-type=e2-highcpu-8

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10 \
    --project=$PROJECT_ID

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Deployment completed successfully"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --project=$PROJECT_ID --format 'value(status.url)')

echo ""
echo "🎉 Admin Portal Fix Deployment Complete!"
echo "📍 Service URL: $SERVICE_URL"
echo "🔗 Admin Portal: $SERVICE_URL/admin/"

# Test the admin portal
echo ""
echo "🧪 Testing admin portal navigation..."
sleep 10

# Test if the admin portal is accessible
if curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/admin/" | grep -q "200"; then
    echo "✅ Admin portal is accessible (200 OK)"
else
    echo "❌ Admin portal is not accessible"
fi

echo ""
echo "🔍 Verifying navigation functionality..."
echo "Please check: $SERVICE_URL/admin/"
echo "Expected: Navigation links for Customers, Platform Analytics, Security Reports, SOC2/HIPAA, Billing, Settings"
echo ""
echo "✅ Admin portal navigation fix deployment completed!"