#!/bin/bash

# 🚀 Fast Portal Deployment Script
# Targets only critical portal files to avoid network timeouts

set -e

echo "🚀 FAST PORTAL DEPLOYMENT STARTING..."
echo "Time: $(date)"

# Create minimal deployment package with only portal files
echo "📦 Creating minimal portal deployment package..."
mkdir -p /tmp/portal-deploy
cd /tmp/portal-deploy

# Copy only critical portal files
echo "📋 Copying critical portal files..."
mkdir -p admin customer js api/stripe
cp /Users/adebold/Documents/GitHub/Commerce-Studio/website/admin/index.html admin/
cp /Users/adebold/Documents/GitHub/Commerce-Studio/website/customer/settings.html customer/
cp /Users/adebold/Documents/GitHub/Commerce-Studio/website/js/admin-portal.js js/
cp /Users/adebold/Documents/GitHub/Commerce-Studio/website/js/billing-manager.js js/
cp /Users/adebold/Documents/GitHub/Commerce-Studio/website/api/stripe/config.js api/stripe/

# Create minimal Dockerfile for portal files only
cat > Dockerfile << 'EOF'
FROM nginx:alpine
COPY admin/ /usr/share/nginx/html/admin/
COPY customer/ /usr/share/nginx/html/customer/
COPY js/ /usr/share/nginx/html/js/
COPY api/ /usr/share/nginx/html/api/
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
EOF

# Create minimal cloudbuild.yaml
cat > cloudbuild.yaml << 'EOF'
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/commerce-studio-portal-fix:latest', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/commerce-studio-portal-fix:latest']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args: 
      - 'run'
      - 'deploy'
      - 'commerce-studio-website'
      - '--image=gcr.io/$PROJECT_ID/commerce-studio-portal-fix:latest'
      - '--platform=managed'
      - '--region=us-central1'
      - '--allow-unauthenticated'
      - '--port=8080'
      - '--memory=512Mi'
      - '--cpu=1'
      - '--max-instances=10'
      - '--timeout=300'
options:
  machineType: 'E2_HIGHCPU_8'
timeout: '600s'
EOF

echo "🔧 Files prepared. Starting fast deployment..."
echo "📁 Deployment package contents:"
find . -type f | head -20

# Submit the minimal build
echo "🚀 Submitting fast portal deployment..."
gcloud builds submit --config cloudbuild.yaml --timeout=600s .

echo "✅ Fast portal deployment submitted!"
echo "🕐 Build should complete in 2-3 minutes (much faster than full site)"

# Cleanup
cd /Users/adebold/Documents/GitHub/Commerce-Studio
rm -rf /tmp/portal-deploy

echo "🎯 Portal deployment initiated. Testing in 3 minutes..."