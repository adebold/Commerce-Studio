#!/bin/bash

# Frontend Deployment Script for EyewearML Platform
echo "🚀 Starting Frontend Deployment..."

# Set production environment variables
export VITE_API_URL="https://eyewear-pipeline-api-395261412442.us-central1.run.app"
export VITE_ENVIRONMENT="production"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Test the build
echo "🧪 Testing build..."
if [ -d "dist" ]; then
    echo "✅ Build successful - dist folder created"
    echo "📊 Build size:"
    du -sh dist/
else
    echo "❌ Build failed - no dist folder found"
    exit 1
fi

# Optional: Deploy to static hosting (uncomment based on your hosting provider)
# For Vercel:
# npx vercel --prod

# For Netlify:
# npx netlify deploy --prod --dir=dist

# For Firebase:
# npx firebase deploy

# For AWS S3:
# aws s3 sync dist/ s3://your-bucket-name --delete

echo "✅ Frontend deployment preparation complete!"
echo "📝 Next steps:"
echo "   1. Upload the 'dist' folder to your hosting provider"
echo "   2. Configure your domain to point to the hosted files"
echo "   3. Test the live application"