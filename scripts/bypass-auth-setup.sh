#!/bin/bash

echo "🔧 Commerce Studio - Bypass Authentication Setup"
echo "================================================"
echo "Working around Google Cloud authentication issues..."
echo

# Step 1: Create a mock service account key that uses application default credentials
echo "Step 1: Setting up credential configuration"
echo "------------------------------------------"
key_path="$HOME/.config/commerce-studio/credentials/service-account-key.json"

if [ ! -f "$key_path" ]; then
    echo "Creating application default credentials configuration..."
    cat > "$key_path" << 'EOF'
{
  "type": "application_default_credentials",
  "project_id": "ml-datadriven-recos",
  "note": "Using gcloud application default credentials"
}
EOF
    chmod 600 "$key_path"
    echo "✅ Credential configuration created"
else
    echo "✅ Credential configuration already exists"
fi

# Step 2: Update the Google Cloud Auth Service to handle ADC
echo
echo "Step 2: Updating Google Cloud Auth Service for ADC"
echo "--------------------------------------------------"

# Read the current auth service
if [ -f "core/google-cloud-auth-service.js" ]; then
    # Create a backup
    cp core/google-cloud-auth-service.js core/google-cloud-auth-service.js.backup
    
    # Update the service to handle both key files and ADC
    cat > core/google-cloud-auth-service.js << 'EOF'
import { GoogleAuth } from 'google-auth-library';
import { SessionsClient } from '@google-cloud/dialogflow-cx';
import fs from 'fs';
import path from 'path';
import { configService } from './config-service.js';

class GoogleCloudAuthService {
    constructor() {
        this.auth = null;
        this.sessionsClient = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            const config = await configService.getConfig();
            const credentialsPath = config.google.credentialsPath;
            
            console.log('🔐 Initializing Google Cloud authentication...');
            
            // Check if credentials file exists and what type it is
            if (fs.existsSync(credentialsPath)) {
                const credentialsContent = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
                
                if (credentialsContent.type === 'application_default_credentials') {
                    console.log('📋 Using Application Default Credentials');
                    // Use application default credentials
                    this.auth = new GoogleAuth({
                        projectId: config.google.projectId,
                        scopes: ['https://www.googleapis.com/auth/cloud-platform']
                    });
                } else {
                    console.log('🔑 Using service account key file');
                    // Use service account key file
                    this.auth = new GoogleAuth({
                        keyFilename: credentialsPath,
                        projectId: config.google.projectId,
                        scopes: ['https://www.googleapis.com/auth/cloud-platform']
                    });
                }
            } else {
                console.log('📋 Falling back to Application Default Credentials');
                // Fallback to application default credentials
                this.auth = new GoogleAuth({
                    projectId: config.google.projectId,
                    scopes: ['https://www.googleapis.com/auth/cloud-platform']
                });
            }

            // Initialize Dialogflow CX client
            const authClient = await this.auth.getClient();
            
            this.sessionsClient = new SessionsClient({
                projectId: config.google.projectId,
                auth: authClient
            });

            console.log('✅ Google Cloud authentication initialized successfully');
            this.initialized = true;

        } catch (error) {
            console.error('❌ Failed to initialize Google Cloud authentication:', error.message);
            throw new Error(`Google Cloud authentication failed: ${error.message}`);
        }
    }

    async getSessionsClient() {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.sessionsClient;
    }

    async getAuthClient() {
        if (!this.initialized) {
            await this.initialize();
        }
        return await this.auth.getClient();
    }

    async getProjectId() {
        if (!this.initialized) {
            await this.initialize();
        }
        return await this.auth.getProjectId();
    }
}

export const googleCloudAuthService = new GoogleCloudAuthService();
EOF

    echo "✅ Google Cloud Auth Service updated for ADC support"
else
    echo "❌ Google Cloud Auth Service not found"
    exit 1
fi

# Step 3: Set a default Dialogflow Agent ID if not set
echo
echo "Step 3: Configuring Dialogflow Agent ID"
echo "---------------------------------------"

if [ -f ".env.secure" ]; then
    if grep -q "REPLACE_WITH_YOUR_ACTUAL_AGENT_ID" .env.secure; then
        echo "Setting default agent ID (you can update this later)..."
        # Use a placeholder that won't cause immediate errors
        sed -i.backup 's/REPLACE_WITH_YOUR_ACTUAL_AGENT_ID/default-agent-placeholder/g' .env.secure
        echo "⚠️  Using placeholder agent ID - update .env.secure with your actual agent ID"
        echo "   To find your agent ID later, run: gcloud dialogflow agents list --location=us-central1"
    else
        echo "✅ Dialogflow Agent ID already configured"
    fi
else
    echo "❌ .env.secure file not found"
    exit 1
fi

# Step 4: Validate the setup
echo
echo "Step 4: Validating Configuration"
echo "--------------------------------"
if [ -f "./scripts/validate-security.sh" ]; then
    ./scripts/validate-security.sh
else
    echo "⚠️  Security validation script not found"
fi

echo
echo "🎉 Bypass Setup Complete!"
echo "========================="
echo "Configuration:"
echo "✅ Using Application Default Credentials"
echo "✅ Service configured for ADC fallback"
echo "✅ Environment variables set"
echo "⚠️  Placeholder Dialogflow Agent ID (update manually)"
echo
echo "Next steps:"
echo "1. Update your Dialogflow Agent ID in .env.secure if needed"
echo "2. Start your application: ./scripts/secure-start.sh"
echo "3. Test your API - the 'Internal server error' should be resolved"
echo
echo "Note: This setup uses your existing gcloud authentication"
echo "without requiring token refresh or project switching."
EOF
    chmod +x scripts/bypass-auth-setup.sh
    echo "✅ Bypass setup script created"
else
    echo "❌ Could not create bypass setup script"
    exit 1
fi