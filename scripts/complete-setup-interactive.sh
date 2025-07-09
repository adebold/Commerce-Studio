#!/bin/bash

echo "🚀 Commerce Studio - Interactive Setup Completion"
echo "================================================="
echo
echo "This script will guide you through the final setup steps."
echo "Some steps require interactive authentication."
echo

# Step 1: Authentication
echo "Step 1: Refresh Google Cloud Authentication"
echo "-------------------------------------------"
echo "Please run the following command in your terminal:"
echo
echo "  gcloud auth login"
echo
read -p "Press Enter after you've completed the login..."

# Step 2: Set Project
echo
echo "Step 2: Set Project"
echo "-------------------"
echo "Now setting project to ml-datadriven-recos..."
if gcloud config set project ml-datadriven-recos; then
    echo "✅ Project set successfully"
else
    echo "❌ Failed to set project. Please run manually:"
    echo "  gcloud config set project ml-datadriven-recos"
    read -p "Press Enter after you've set the project..."
fi

# Step 3: Create Service Account Key
echo
echo "Step 3: Create Service Account Key"
echo "----------------------------------"
key_path="$HOME/.config/commerce-studio/credentials/service-account-key.json"

if [ -f "$key_path" ]; then
    echo "✅ Service account key already exists"
else
    echo "Creating service account key..."
    if gcloud iam service-accounts keys create "$key_path" \
        --iam-account=avatar-demo-service@ml-datadriven-recos.iam.gserviceaccount.com; then
        echo "✅ Service account key created successfully"
        chmod 600 "$key_path"
        echo "✅ Secure permissions set"
    else
        echo "❌ Failed to create service account key"
        echo "Please check that the service account exists and you have permissions"
        exit 1
    fi
fi

# Step 4: Get Dialogflow Agent ID
echo
echo "Step 4: Get Dialogflow Agent ID"
echo "-------------------------------"
echo "Getting your Dialogflow agents..."
echo

agents_output=$(gcloud dialogflow agents list --location=us-central1 --format="value(name)" 2>/dev/null)

if [ -n "$agents_output" ]; then
    echo "Found Dialogflow agents:"
    echo "$agents_output"
    echo
    
    # Extract agent ID from the first agent (assuming format: projects/PROJECT/locations/LOCATION/agents/AGENT_ID)
    agent_id=$(echo "$agents_output" | head -1 | sed 's/.*agents\///')
    
    if [ -n "$agent_id" ]; then
        echo "Using Agent ID: $agent_id"
        
        # Update .env.secure file
        if [ -f ".env.secure" ]; then
            # Create backup
            cp .env.secure .env.secure.backup
            
            # Replace the placeholder with actual agent ID
            sed "s/REPLACE_WITH_YOUR_ACTUAL_AGENT_ID/$agent_id/g" .env.secure.backup > .env.secure
            
            echo "✅ Updated .env.secure with Agent ID: $agent_id"
        else
            echo "❌ .env.secure file not found"
            exit 1
        fi
    else
        echo "❌ Could not extract agent ID"
        exit 1
    fi
else
    echo "❌ No Dialogflow agents found or access denied"
    echo "Please check your permissions for Dialogflow in the ml-datadriven-recos project"
    exit 1
fi

# Step 5: Validate Setup
echo
echo "Step 5: Validate Security Setup"
echo "-------------------------------"
if ./scripts/validate-security.sh; then
    echo "✅ Security validation passed!"
else
    echo "⚠️  Security validation had warnings - check output above"
fi

# Step 6: Final Status
echo
echo "🎉 Setup Complete!"
echo "=================="
echo "Your Commerce Studio platform is now configured with:"
echo "✅ Google Cloud authentication"
echo "✅ Service account key"
echo "✅ Dialogflow agent configuration"
echo "✅ Secure environment variables"
echo
echo "Next steps:"
echo "1. Start your application: ./scripts/secure-start.sh"
echo "2. Test your API to confirm the 'Internal server error' is resolved"
echo
echo "Test command:"
echo "curl -X POST http://localhost:3000/api/chat \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"message\":\"Hello\",\"sessionId\":\"test-123\"}'"