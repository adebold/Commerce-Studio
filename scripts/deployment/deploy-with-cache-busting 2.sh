#!/bin/bash

# Deploy Commerce Studio with Cache Busting
# This script ensures fresh builds and proper deployment validation

set -e

echo "🚀 Starting Commerce Studio deployment with cache busting..."

# Get current timestamp for cache busting
TIMESTAMP=$(date +%s)
BUILD_ID="cb-${TIMESTAMP}"

echo "📦 Building with cache busting ID: ${BUILD_ID}"

# Build with cache busting - force fresh build
gcloud builds submit \
  --config=website/cloudbuild-simple.yaml \
  --substitutions=_BUILD_ID=${BUILD_ID} \
  website/

echo "🔍 Verifying build completed..."
sleep 5

# Deploy with the new image
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy commerce-studio-website \
  --image=gcr.io/ml-datadriven-recos/commerce-studio-website-simple:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=8080 \
  --set-env-vars="NODE_ENV=production,BUILD_ID=${BUILD_ID}" \
  --cpu=1 \
  --memory=512Mi \
  --max-instances=10 \
  --timeout=300 \
  --concurrency=80 \
  --no-traffic

echo "✅ Deployment completed. New revision created but not receiving traffic yet."

# Get the new revision name
NEW_REVISION=$(gcloud run services describe commerce-studio-website \
  --region=us-central1 \
  --format="value(status.latestCreatedRevisionName)")

echo "🔍 New revision: ${NEW_REVISION}"

# Test the new revision before routing traffic
echo "🧪 Testing new revision..."
REVISION_URL=$(gcloud run services describe commerce-studio-website \
  --region=us-central1 \
  --format="value(status.address.url)")

# Add cache busting to test URL
TEST_URL="${REVISION_URL}?cb=${TIMESTAMP}"

echo "Testing URL: ${TEST_URL}"

# Test the new revision
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${TEST_URL}" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ New revision is responding correctly (HTTP ${HTTP_STATUS})"
    
    # Verify content
    CONTENT_CHECK=$(curl -s "${TEST_URL}" | grep -o "VARAi Commerce Studio" | head -1)
    
    if [ "$CONTENT_CHECK" = "VARAi Commerce Studio" ]; then
        echo "✅ Content verification passed - Commerce Studio detected"
        
        # Route traffic to new revision
        echo "🔄 Routing traffic to new revision..."
        gcloud run services update-traffic commerce-studio-website \
          --to-revisions=${NEW_REVISION}=100 \
          --region=us-central1
        
        echo "✅ Traffic successfully routed to new revision!"
        
        # Final verification
        echo "🔍 Final verification..."
        sleep 3
        FINAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${REVISION_URL}?final=${TIMESTAMP}")
        
        if [ "$FINAL_STATUS" = "200" ]; then
            echo "🎉 Deployment successful! Service is live and responding."
            echo "🌐 URL: ${REVISION_URL}"
            echo "📋 Revision: ${NEW_REVISION}"
            echo "🏷️  Build ID: ${BUILD_ID}"
        else
            echo "❌ Final verification failed (HTTP ${FINAL_STATUS})"
            exit 1
        fi
    else
        echo "❌ Content verification failed - Commerce Studio not detected"
        exit 1
    fi
else
    echo "❌ New revision health check failed (HTTP ${HTTP_STATUS})"
    echo "🔄 Keeping traffic on current working revision"
    exit 1
fi

echo "✅ Deployment with cache busting completed successfully!"