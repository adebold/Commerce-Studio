#!/bin/bash

echo "🚨 EMERGENCY PORTAL FIX DEPLOYMENT"
echo "=================================="
echo "🎯 Target: Fix admin and customer portal functionality"
echo "🔧 Strategy: Force clean build with cache busting"
echo ""

# Get project details dynamically
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No GCP project set. Please run 'gcloud config set project YOUR_PROJECT_ID'"
    exit 1
fi

SERVICE_NAME="commerce-studio-website"
REGION="us-central1"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "📋 Project: $PROJECT_ID"
echo "🚀 Service: $SERVICE_NAME"
echo "🌍 Region: $REGION"
echo "⏰ Build ID: $TIMESTAMP"
echo ""

# Pre-deployment verification
echo "🔍 PRE-DEPLOYMENT VERIFICATION"
echo "------------------------------"

# Verify admin portal file integrity
echo "🔧 Checking admin portal file..."
if grep -q "onclick.*showSection" website/admin/index.html; then
    echo "✅ Admin portal navigation with onclick handlers: FOUND"
else
    echo "❌ Admin portal navigation with onclick handlers: MISSING"
    exit 1
fi

if grep -q "function showSection" website/admin/index.html; then
    echo "✅ Admin portal showSection function: FOUND"
else
    echo "❌ Admin portal showSection function: MISSING"
    exit 1
fi

# Verify customer portal billing section
echo "💳 Checking customer portal billing..."
if grep -q "billing-section" website/customer/settings.html; then
    echo "✅ Customer portal billing section: FOUND"
else
    echo "❌ Customer portal billing section: MISSING"
    exit 1
fi

if grep -q "billing-manager.js" website/customer/settings.html; then
    echo "✅ Customer portal Stripe integration: FOUND"
else
    echo "❌ Customer portal Stripe integration: MISSING"
    exit 1
fi

echo ""
echo "✅ All portal files verified locally - proceeding with deployment"
echo ""

# Force clean build with cache busting
echo "🏗️ BUILDING WITH CACHE BUSTING"
echo "------------------------------"

# Add timestamp to force new build
echo "# Build timestamp: $TIMESTAMP" >> website/build-info.txt

echo "📦 Building container image with cache busting..."
gcloud builds submit \
    --tag gcr.io/$PROJECT_ID/$SERVICE_NAME:$TIMESTAMP \
    --project=$PROJECT_ID \
    --timeout=20m \
    --machine-type=e2-highcpu-8

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully with timestamp: $TIMESTAMP"

# Deploy with new image
echo ""
echo "🚀 DEPLOYING NEW VERSION"
echo "------------------------"

gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME:$TIMESTAMP \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10 \
    --project=$PROJECT_ID \
    --revision-suffix=$TIMESTAMP

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Deployment completed successfully"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --project=$PROJECT_ID --format 'value(status.url)')

echo ""
echo "🎉 EMERGENCY PORTAL FIX DEPLOYMENT COMPLETE!"
echo "============================================"
echo "📍 Service URL: $SERVICE_URL"
echo "🔗 Admin Portal: $SERVICE_URL/admin/"
echo "💳 Customer Portal: $SERVICE_URL/customer/settings.html"
echo "🆔 Revision: $SERVICE_NAME-$TIMESTAMP"

# Wait for deployment to propagate
echo ""
echo "⏳ Waiting for deployment to propagate..."
sleep 15

# Test the portals
echo ""
echo "🧪 TESTING PORTAL FUNCTIONALITY"
echo "-------------------------------"

# Test admin portal
echo "🔍 Testing admin portal..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/admin/")
if [ "$ADMIN_STATUS" = "200" ]; then
    echo "✅ Admin portal accessible (200 OK)"
else
    echo "❌ Admin portal not accessible ($ADMIN_STATUS)"
fi

# Test customer portal
echo "💳 Testing customer portal..."
CUSTOMER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/customer/settings.html")
if [ "$CUSTOMER_STATUS" = "200" ]; then
    echo "✅ Customer portal accessible (200 OK)"
else
    echo "❌ Customer portal not accessible ($CUSTOMER_STATUS)"
fi

echo ""
echo "🔍 NEXT STEPS:"
echo "1. Run diagnostic tests to verify functionality:"
echo "   node test-admin-portal-navigation.cjs"
echo "   node test-customer-portal-billing.cjs"
echo ""
echo "2. Manually verify portals:"
echo "   Admin: $SERVICE_URL/admin/"
echo "   Customer: $SERVICE_URL/customer/settings.html"
echo ""
echo "✅ Emergency deployment completed!"

# Clean up build info
rm -f website/build-info.txt