#!/bin/bash

echo "🔍 Commerce Studio - Current Setup Diagnostic"
echo "=============================================="
echo

# Check Google Cloud CLI
echo "📋 Google Cloud CLI Status:"
if command -v gcloud &> /dev/null; then
    echo "✅ Google Cloud CLI installed"
    
    # Check current project
    current_project=$(gcloud config get-value project 2>/dev/null)
    if [ "$current_project" = "ml-datadriven-recos" ]; then
        echo "✅ Project set to: $current_project"
    else
        echo "⚠️  Current project: $current_project (expected: ml-datadriven-recos)"
        echo "   Run: gcloud config set project ml-datadriven-recos"
    fi
    
    # Check authentication
    echo "📋 Authenticated accounts:"
    gcloud auth list --format="value(account)" 2>/dev/null | head -3
    
else
    echo "❌ Google Cloud CLI not found"
fi

echo
echo "📋 Service Account Key Status:"
key_path="$HOME/.config/commerce-studio/credentials/service-account-key.json"
if [ -f "$key_path" ]; then
    echo "✅ Service account key exists at: $key_path"
    # Check permissions
    perms=$(stat -f "%A" "$key_path" 2>/dev/null || stat -c "%a" "$key_path" 2>/dev/null)
    if [ "$perms" = "600" ]; then
        echo "✅ Correct permissions (600)"
    else
        echo "⚠️  Permissions: $perms (should be 600)"
        echo "   Run: chmod 600 $key_path"
    fi
else
    echo "❌ Service account key not found at: $key_path"
    echo "   📝 Next step: Create/copy your service account key"
fi

echo
echo "📋 Environment Configuration:"
if [ -f ".env.secure" ]; then
    echo "✅ .env.secure file exists"
    
    # Check for placeholder values
    if grep -q "REPLACE_WITH_YOUR_ACTUAL_AGENT_ID" .env.secure; then
        echo "⚠️  Dialogflow Agent ID needs to be updated"
        echo "   📝 Next step: Get your agent ID and update .env.secure"
    else
        echo "✅ Environment variables configured"
    fi
else
    echo "❌ .env.secure file not found"
fi

echo
echo "📋 Dialogflow Setup Check:"
echo "To get your Dialogflow Agent ID, run:"
echo "   gcloud dialogflow agents list --location=us-central1"

echo
echo "🎯 RECOMMENDED NEXT STEPS:"
echo "=========================="

# Determine what needs to be done next
if [ ! -f "$key_path" ]; then
    echo "1️⃣  PRIORITY: Create service account key"
    echo "   gcloud iam service-accounts keys create $key_path \\"
    echo "       --iam-account=avatar-demo-service@ml-datadriven-recos.iam.gserviceaccount.com"
    echo
elif grep -q "REPLACE_WITH_YOUR_ACTUAL_AGENT_ID" .env.secure 2>/dev/null; then
    echo "1️⃣  PRIORITY: Update Dialogflow Agent ID"
    echo "   - Run: gcloud dialogflow agents list --location=us-central1"
    echo "   - Copy the agent ID from the output"
    echo "   - Edit .env.secure and replace REPLACE_WITH_YOUR_ACTUAL_AGENT_ID"
    echo
else
    echo "1️⃣  READY: Run security validation"
    echo "   ./scripts/validate-security.sh"
    echo
    echo "2️⃣  READY: Start your application"
    echo "   ./scripts/secure-start.sh"
fi

echo "📖 Full setup guide: COMPLETE_SETUP_STEPS.md"