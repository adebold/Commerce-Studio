#!/bin/bash
set -e

echo "🚀 Deploying Complete VARAi Commerce Studio Website..."

# Deploy main website
echo "📦 Building and deploying main website..."
cd website
gcloud builds submit --tag gcr.io/ml-datadriven-recos/commerce-studio-website-complete
gcloud run deploy commerce-studio-website \
  --image gcr.io/ml-datadriven-recos/commerce-studio-website-complete \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=ml-datadriven-recos,NODE_ENV=production,API_PORT=3001" \
  --service-account="353252826752-compute@developer.gserviceaccount.com"

# Deploy VisionCraft store
echo "🛒 Building and deploying VisionCraft store..."
cd ../apps/visioncraft-store
gcloud builds submit --tag gcr.io/ml-datadriven-recos/visioncraft-store-enhanced
gcloud run deploy visioncraft-store \
  --image gcr.io/ml-datadriven-recos/visioncraft-store-enhanced \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080

echo "✅ Deployment complete!"
echo "🌐 Website: https://commerce-studio-website-353252826752.us-central1.run.app"
echo "🛒 Store: https://visioncraft-store-353252826752.us-central1.run.app"

# Run health check
echo ""
echo "🔍 Running deployment verification..."
cd ../../
./scripts/check-deployment.sh