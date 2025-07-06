#!/bin/bash

# Deploy Commerce Studio Website with Fixed Configuration
# Based on working revision commerce-studio-website-00023-ghf

set -e

echo "🚀 Starting Commerce Studio Website Deployment"
echo "=============================================="

# Set variables
PROJECT_ID="ml-datadriven-recos"
SERVICE_NAME="commerce-studio-website"
REGION="us-central1"
IMAGE_NAME="commerce-studio-website-fixed"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TAG="${IMAGE_NAME}:${TIMESTAMP}"

echo "📦 Building Docker image with latest code..."
cd website

# Build the Docker image using the working Dockerfile.simple
gcloud builds submit \
  --project=${PROJECT_ID} \
  --config=cloudbuild-simple.yaml \
  .

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image=gcr.io/${PROJECT_ID}/commerce-studio-website-simple:latest \
  --platform=managed \
  --region=${REGION} \
  --allow-unauthenticated \
  --port=8080 \
  --set-env-vars="NODE_ENV=production" \
  --cpu=1 \
  --memory=512Mi \
  --max-instances=10 \
  --timeout=300 \
  --concurrency=80

echo "✅ Deployment completed!"
echo "🔗 URL: https://${SERVICE_NAME}-ddtojwjn7a-uc.a.run.app"

echo "🔍 Verifying deployment..."
sleep 10
curl -s -o /dev/null -w "%{http_code}" https://${SERVICE_NAME}-ddtojwjn7a-uc.a.run.app || echo "Verification failed"

echo "🎉 Commerce Studio Website deployment complete!"