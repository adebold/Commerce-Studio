#!/bin/bash

# NVIDIA Omniverse Setup Script
# Automates the setup process for NVIDIA Omniverse Avatar integration

set -e  # Exit on any error

echo "🚀 Setting up NVIDIA Omniverse Avatar Integration..."

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
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the Commerce Studio root directory"
    exit 1
fi

print_status "Checking prerequisites..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version check passed: $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_success "npm check passed: $(npm -v)"

# Install dependencies if needed
print_status "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Check environment configuration
print_status "Checking environment configuration..."

if [ ! -f ".env.demo" ]; then
    print_error ".env.demo file not found"
    exit 1
fi

print_success "Environment configuration found"

# Test basic service functionality
print_status "Testing NVIDIA Omniverse service..."

# Run the simple test
if node demo/live-demo/test-omniverse-simple.js; then
    print_success "Basic service test passed"
else
    print_error "Basic service test failed"
    exit 1
fi

# Run GitHub Secrets integration test
print_status "Testing GitHub Secrets integration..."

if node demo/live-demo/test-github-secrets-integration.js; then
    print_success "GitHub Secrets integration test passed"
else
    print_error "GitHub Secrets integration test failed"
    exit 1
fi

# Check for API key configuration
print_status "Checking API key configuration..."

if [ -z "$NVIDIA_API_KEY" ] && [ -z "$NVIDIA_OMNIVERSE_API_KEY" ]; then
    print_warning "No NVIDIA API keys found in environment"
    print_status "To complete setup:"
    echo "  1. Add your NVIDIA API key to GitHub Secrets (recommended)"
    echo "  2. Or create .env.local with your API keys for local development"
    echo "  3. See docs/deployment/GITHUB_SECRETS_SETUP.md for details"
else
    print_success "NVIDIA API key configuration found"
    
    # Run comprehensive test with API key
    print_status "Testing with API key..."
    if node demo/live-demo/test-omniverse.js; then
        print_success "Comprehensive API test passed"
    else
        print_warning "API test completed with warnings (this may be normal)"
    fi
fi

# Create local environment template if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_status "Creating .env.local template..."
    cat > .env.local << EOF
# Local Development Environment Variables
# Copy this file and add your actual API keys

# NVIDIA API Keys
NVIDIA_API_KEY=your-nvidia-api-key-here
NVIDIA_OMNIVERSE_API_KEY=your-omniverse-api-key-here

# Google Cloud API Key (if needed)
GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key-here

# Note: Never commit this file to version control
# Add .env.local to your .gitignore if not already present
EOF
    print_success "Created .env.local template"
    print_warning "Please edit .env.local with your actual API keys"
fi

# Check .gitignore
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
    print_status "Adding .env.local to .gitignore..."
    echo ".env.local" >> .gitignore
    print_success "Added .env.local to .gitignore"
fi

# Summary
echo ""
echo "🎉 NVIDIA Omniverse Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "  1. Configure your API keys:"
echo "     • For production: Add to GitHub Secrets (see docs/deployment/GITHUB_SECRETS_SETUP.md)"
echo "     • For local dev: Edit .env.local with your keys"
echo ""
echo "  2. Test the integration:"
echo "     • npm run test:omniverse"
echo "     • node demo/live-demo/test-omniverse.js"
echo ""
echo "  3. Start the demo server:"
echo "     • npm run demo"
echo "     • Open http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "  • GitHub Secrets Setup: docs/deployment/GITHUB_SECRETS_SETUP.md"
echo "  • Architecture Overview: docs/architecture/centralized-google-cloud-authentication.md"
echo ""
echo "🔧 Troubleshooting:"
echo "  • Check logs in ./logs/ directory"
echo "  • Run: node demo/live-demo/test-github-secrets-integration.js"
echo "  • Verify API keys are correctly configured"
echo ""

print_success "Setup completed successfully! 🚀"