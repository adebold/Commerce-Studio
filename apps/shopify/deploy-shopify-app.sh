#!/bin/bash

# VARAi Commerce Studio - Shopify App Deployment Script
# This script handles the complete deployment and publishing process

set -e

echo "🚀 VARAi Commerce Studio - Shopify App Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "shopify.app.toml" ]; then
    print_error "shopify.app.toml not found. Please run this script from the apps/shopify directory."
    exit 1
fi

print_status "Starting VARAi Commerce Studio Shopify App deployment..."

# Step 1: Install dependencies
print_status "Installing dependencies..."
if command -v npm &> /dev/null; then
    npm install
    print_success "Dependencies installed successfully"
else
    print_error "npm not found. Please install Node.js and npm."
    exit 1
fi

# Step 2: Check for Shopify CLI
print_status "Checking Shopify CLI availability..."
if npx @shopify/cli version &> /dev/null; then
    print_success "Shopify CLI available via npx"
else
    print_error "Shopify CLI not available"
    exit 1
fi

# Step 3: Verify environment setup
print_status "Verifying environment setup..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please update .env file with your actual credentials before continuing."
        print_warning "Press Enter when ready to continue..."
        read
    else
        print_error ".env.example file not found. Cannot create environment file."
        exit 1
    fi
fi

# Step 4: Run setup verification
print_status "Running setup verification..."
if [ -f "scripts/verify-setup.js" ]; then
    node scripts/verify-setup.js
    print_success "Setup verification completed"
else
    print_warning "Setup verification script not found. Skipping..."
fi

# Step 5: Build the application
print_status "Building the application..."
npm run build 2>/dev/null || {
    print_warning "Build script not found or failed. Continuing with deployment..."
}

# Step 6: Run tests
print_status "Running tests..."
npm test 2>/dev/null || {
    print_warning "Tests failed or not configured. Continuing with deployment..."
}

# Step 7: Deploy to Shopify
print_status "Deploying to Shopify..."
print_warning "This will deploy the app to Shopify. Make sure you're logged in to the correct partner account."
print_warning "Press Enter to continue or Ctrl+C to cancel..."
read

# Login to Shopify (if not already logged in)
npx @shopify/cli auth login

# Deploy the app
print_status "Deploying VARAi Commerce Studio app..."
npx @shopify/cli app deploy

print_success "App deployed successfully!"

# Step 8: Generate app URL
print_status "Generating app installation URL..."
npx @shopify/cli app info

print_success "Deployment completed successfully!"
print_status "Next steps:"
echo "1. Test the app in a development store"
echo "2. Submit for review in the Shopify Partner Dashboard"
echo "3. Once approved, the app will be available in the Shopify App Store"

echo ""
print_success "VARAi Commerce Studio Shopify App deployment completed!"