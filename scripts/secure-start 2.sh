#!/bin/bash

# Commerce Studio Secure Startup Script
# Ensures security checks before starting the application

echo "🔒 Commerce Studio - Secure Startup"
echo "=================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Load environment from secure file first
if [ -f ".env.secure" ]; then
    echo "📋 Loading secure environment configuration..."
    set -a  # automatically export all variables
    source .env.secure
    set +a
    echo "✅ Secure environment loaded"
elif [ -f ".env" ]; then
    echo "📋 Loading environment configuration..."
    set -a  # automatically export all variables
    source .env
    set +a
    echo "✅ Environment loaded"
fi

# Check for required environment variables
echo "🔍 Checking environment variables..."
required_vars=("GOOGLE_APPLICATION_CREDENTIALS" "DIALOGFLOW_AGENT_ID")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables: ${missing_vars[*]}"
    echo ""
    echo "🔧 To fix this, run:"
    echo "   ./scripts/setup-environment.sh"
    echo "   OR follow: docs/security/SECURE_ENVIRONMENT_SETUP.md"
    exit 1
fi

echo "✅ Required environment variables are set"

# Validate credentials file exists and is secure
echo "🔐 Checking credentials file security..."
if [ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "❌ Credentials file not found: $GOOGLE_APPLICATION_CREDENTIALS"
    echo ""
    echo "🔧 Please ensure your service account key file exists at the specified path"
    exit 1
fi

# Check file permissions (Unix/Linux/macOS)
if command_exists stat; then
    # Try Linux stat first, then macOS stat
    perms=$(stat -c "%a" "$GOOGLE_APPLICATION_CREDENTIALS" 2>/dev/null || stat -f "%A" "$GOOGLE_APPLICATION_CREDENTIALS" 2>/dev/null)
    
    if [ -n "$perms" ]; then
        # Convert octal to decimal for comparison
        perms_decimal=$((8#$perms))
        if [ "$perms_decimal" -gt 600 ]; then
            echo "⚠️  Warning: Credentials file permissions are too open ($perms)"
            echo "🔧 Fixing permissions..."
            chmod 600 "$GOOGLE_APPLICATION_CREDENTIALS"
            echo "✅ Permissions secured to 600"
        else
            echo "✅ Credentials file permissions are secure ($perms)"
        fi
    fi
fi

# Validate JSON structure without exposing content
echo "📋 Validating credentials file format..."
if command_exists python3; then
    if python3 -m json.tool "$GOOGLE_APPLICATION_CREDENTIALS" > /dev/null 2>&1; then
        echo "✅ Credentials file is valid JSON"
    else
        echo "❌ Credentials file is not valid JSON"
        exit 1
    fi
elif command_exists node; then
    if node -e "JSON.parse(require('fs').readFileSync('$GOOGLE_APPLICATION_CREDENTIALS', 'utf8'))" > /dev/null 2>&1; then
        echo "✅ Credentials file is valid JSON"
    else
        echo "❌ Credentials file is not valid JSON"
        exit 1
    fi
else
    echo "⚠️  Cannot validate JSON format (python3 or node not available)"
fi


# Test Google Cloud authentication (without exposing tokens)
echo "🔑 Testing Google Cloud authentication..."
if command_exists gcloud; then
    if gcloud auth application-default print-access-token > /dev/null 2>&1; then
        echo "✅ Google Cloud authentication working"
    else
        echo "❌ Google Cloud authentication failed"
        echo "🔧 Try running: gcloud auth application-default login"
        exit 1
    fi
else
    echo "⚠️  gcloud CLI not available - skipping auth test"
fi

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in Commerce Studio root directory"
    echo "🔧 Please run this script from the Commerce Studio root directory"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "✅ All security checks passed"
echo "🚀 Starting Commerce Studio application..."
echo ""

# Start the application
if [ -f "demo/live-demo/live-demo-server.js" ]; then
    echo "🎯 Starting live demo server..."
    node demo/live-demo/live-demo-server.js
elif [ -f "server.js" ]; then
    echo "🎯 Starting main server..."
    node server.js
else
    echo "🎯 Starting with npm..."
    npm start
fi