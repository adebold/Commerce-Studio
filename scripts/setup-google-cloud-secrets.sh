#!/bin/bash

# Google Cloud Secret Manager Setup Script
# VARAi Commerce Studio - Security Remediation
# This script creates all required secrets in Google Cloud Secret Manager

set -e

echo "🔐 Setting up Google Cloud Secret Manager for VARAi Commerce Studio"
echo "=================================================="

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed. Please install it first."
    echo "   Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with gcloud. Please run 'gcloud auth login'"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No project set. Please run 'gcloud config set project YOUR_PROJECT_ID'"
    exit 1
fi

echo "📋 Project: $PROJECT_ID"
echo ""

# Function to create secret
create_secret() {
    local secret_name=$1
    local description=$2
    
    echo "Creating secret: $secret_name"
    
    if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" &>/dev/null; then
        echo "  ⚠️  Secret '$secret_name' already exists, skipping..."
    else
        gcloud secrets create "$secret_name" \
            --project="$PROJECT_ID" \
            --labels="app=varai-commerce-studio,environment=production,type=api-key" \
            --replication-policy="automatic" || {
            echo "  ❌ Failed to create secret: $secret_name"
            return 1
        }
        echo "  ✅ Created secret: $secret_name"
    fi
}

# Function to set secret value
set_secret_value() {
    local secret_name=$1
    local value=$2
    
    if [ -n "$value" ]; then
        echo "$value" | gcloud secrets versions add "$secret_name" \
            --project="$PROJECT_ID" \
            --data-file=- || {
            echo "  ❌ Failed to set value for secret: $secret_name"
            return 1
        }
        echo "  ✅ Set value for secret: $secret_name"
    else
        echo "  ⚠️  No value provided for secret: $secret_name (you'll need to set this manually)"
    fi
}

echo "🔑 Creating Stripe Configuration Secrets..."
echo "----------------------------------------"

# Stripe API Keys
create_secret "stripe-publishable-key" "Stripe publishable key for VARAi Commerce Studio"
create_secret "stripe-secret-key" "Stripe secret key for VARAi Commerce Studio"
create_secret "stripe-webhook-secret" "Stripe webhook secret for VARAi Commerce Studio"

echo ""
echo "📦 Creating Stripe Product ID Secrets..."
echo "---------------------------------------"

# Stripe Product IDs
create_secret "stripe-starter-product-id" "Stripe product ID for Starter plan"
create_secret "stripe-starter-price-id" "Stripe price ID for Starter plan"
create_secret "stripe-professional-product-id" "Stripe product ID for Professional plan"
create_secret "stripe-professional-price-id" "Stripe price ID for Professional plan"
create_secret "stripe-enterprise-product-id" "Stripe product ID for Enterprise plan"
create_secret "stripe-enterprise-price-id" "Stripe price ID for Enterprise plan"

echo ""
echo "🎫 Creating Token Package Secrets..."
echo "-----------------------------------"

# Token Package Price IDs
create_secret "stripe-tokens-1k-price-id" "Stripe price ID for 1K token package"
create_secret "stripe-tokens-5k-price-id" "Stripe price ID for 5K token package"
create_secret "stripe-tokens-10k-price-id" "Stripe price ID for 10K token package"

echo ""
echo "🗄️ Creating Database Configuration Secrets..."
echo "--------------------------------------------"

# Database Configuration
create_secret "database-url" "PostgreSQL database connection URL"

echo ""
echo "🔐 Creating Authentication Secrets..."
echo "-----------------------------------"

# JWT Secret
create_secret "jwt-secret" "JWT secret key for authentication"

echo ""
echo "📧 Creating Email Configuration Secrets..."
echo "----------------------------------------"

# Email Configuration
create_secret "smtp-host" "SMTP server hostname"
create_secret "smtp-port" "SMTP server port"
create_secret "smtp-user" "SMTP username"
create_secret "smtp-pass" "SMTP password"
create_secret "from-email" "From email address"

echo ""
echo "🔧 Setting up IAM permissions..."
echo "-------------------------------"

# Get the default compute service account
COMPUTE_SA="${PROJECT_ID}-compute@developer.gserviceaccount.com"

echo "Granting Secret Manager access to compute service account: $COMPUTE_SA"

# Grant Secret Manager Secret Accessor role to the compute service account
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$COMPUTE_SA" \
    --role="roles/secretmanager.secretAccessor" || {
    echo "  ⚠️  Warning: Failed to grant IAM permissions. You may need to do this manually."
}

echo ""
echo "✅ Secret Manager Setup Complete!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo "1. Set values for all created secrets using the Google Cloud Console or gcloud CLI"
echo "2. Example: gcloud secrets versions add stripe-publishable-key --data-file=- <<< 'pk_live_...'"
echo "3. Update your Cloud Run service to use these secrets as environment variables"
echo "4. Test the application to ensure all secrets are properly loaded"
echo ""
echo "🔗 Useful Commands:"
echo "List all secrets: gcloud secrets list --project=$PROJECT_ID"
echo "View secret: gcloud secrets versions access latest --secret=SECRET_NAME --project=$PROJECT_ID"
echo "Update secret: echo 'NEW_VALUE' | gcloud secrets versions add SECRET_NAME --data-file=- --project=$PROJECT_ID"
echo ""
echo "⚠️  SECURITY REMINDER:"
echo "- Never commit secrets to version control"
echo "- Regularly rotate your API keys"
echo "- Monitor secret access logs"
echo "- Use least privilege access principles"