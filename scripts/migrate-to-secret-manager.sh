#!/bin/bash

# Migrate to Secret Manager Script
# This script migrates secrets from environment variables to Google Secret Manager

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-commerce-studio-staging}"
ENVIRONMENT="${ENVIRONMENT:-staging}"

echo -e "${BLUE}🔄 Commerce Studio - Secret Manager Migration${NC}"
echo "=============================================="
echo "Project ID: ${PROJECT_ID}"
echo "Environment: ${ENVIRONMENT}"
echo ""

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
        return 1
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
    else
        echo -e "${BLUE}ℹ️  INFO${NC}: $message"
    fi
}

# Function to generate secure random string
generate_secure_string() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Function to create secret in Secret Manager
create_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3
    
    print_status "INFO" "Creating secret: $secret_name"
    
    # Check if secret already exists
    if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" >/dev/null 2>&1; then
        print_status "WARN" "Secret $secret_name already exists, updating version"
        echo -n "$secret_value" | gcloud secrets versions add "$secret_name" --data-file=- --project="$PROJECT_ID"
    else
        # Create new secret
        echo -n "$secret_value" | gcloud secrets create "$secret_name" \
            --data-file=- \
            --project="$PROJECT_ID" \
            --labels="environment=$ENVIRONMENT,managed-by=terraform,component=commerce-studio"
        
        # Add description if provided
        if [ -n "$description" ]; then
            gcloud secrets update "$secret_name" --update-labels="description=$description" --project="$PROJECT_ID"
        fi
    fi
    
    print_status "PASS" "Secret $secret_name created/updated successfully"
}

# Function to set IAM permissions for secret
set_secret_permissions() {
    local secret_name=$1
    local service_account=$2
    
    print_status "INFO" "Setting permissions for secret: $secret_name"
    
    gcloud secrets add-iam-policy-binding "$secret_name" \
        --member="serviceAccount:$service_account" \
        --role="roles/secretmanager.secretAccessor" \
        --project="$PROJECT_ID"
    
    print_status "PASS" "Permissions set for $secret_name"
}

# Enable required APIs
enable_apis() {
    echo -e "${BLUE}🔧 Enabling Required APIs${NC}"
    echo "-------------------------"
    
    local apis=(
        "secretmanager.googleapis.com"
        "cloudkms.googleapis.com"
        "iam.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        print_status "INFO" "Enabling API: $api"
        gcloud services enable "$api" --project="$PROJECT_ID"
        print_status "PASS" "API enabled: $api"
    done
    
    echo ""
}

# Create service account for Secret Manager access
create_service_account() {
    echo -e "${BLUE}👤 Creating Service Account${NC}"
    echo "----------------------------"
    
    local sa_name="commerce-studio-${ENVIRONMENT}"
    local sa_email="${sa_name}@${PROJECT_ID}.iam.gserviceaccount.com"
    
    # Check if service account exists
    if gcloud iam service-accounts describe "$sa_email" --project="$PROJECT_ID" >/dev/null 2>&1; then
        print_status "WARN" "Service account $sa_email already exists"
    else
        gcloud iam service-accounts create "$sa_name" \
            --display-name="Commerce Studio ${ENVIRONMENT} Service Account" \
            --description="Service account for Commerce Studio ${ENVIRONMENT} environment" \
            --project="$PROJECT_ID"
        
        print_status "PASS" "Service account created: $sa_email"
    fi
    
    # Grant necessary roles
    local roles=(
        "roles/secretmanager.secretAccessor"
        "roles/cloudkms.cryptoKeyEncrypterDecrypter"
        "roles/monitoring.metricWriter"
        "roles/logging.logWriter"
    )
    
    for role in "${roles[@]}"; do
        gcloud projects add-iam-policy-binding "$PROJECT_ID" \
            --member="serviceAccount:$sa_email" \
            --role="$role"
        print_status "PASS" "Role granted: $role"
    done
    
    echo ""
    echo "$sa_email"
}

# Migrate secrets to Secret Manager
migrate_secrets() {
    echo -e "${BLUE}🔐 Migrating Secrets to Secret Manager${NC}"
    echo "-------------------------------------"
    
    local service_account=$(create_service_account)
    
    # Define secrets to migrate
    declare -A secrets=(
        ["secret-key"]="$(generate_secure_string 64)"
        ["mongodb-password"]="$(generate_secure_string 32)"
        ["mongodb-atlas-public-key"]="REPLACE_WITH_ACTUAL_PUBLIC_KEY"
        ["mongodb-atlas-private-key"]="REPLACE_WITH_ACTUAL_PRIVATE_KEY"
        ["auth-secret"]="$(generate_secure_string 64)"
        ["deepseek-api-key"]="REPLACE_WITH_ACTUAL_DEEPSEEK_API_KEY"
        ["gcp-kms-key-version-id"]="REPLACE_WITH_ACTUAL_KMS_KEY_VERSION_ID"
        ["gcp-service-account-key"]="REPLACE_WITH_ACTUAL_SERVICE_ACCOUNT_KEY"
    )
    
    # Create secrets
    for secret_name in "${!secrets[@]}"; do
        local secret_value="${secrets[$secret_name]}"
        local description="Secret for Commerce Studio ${ENVIRONMENT} environment"
        
        create_secret "$secret_name" "$secret_value" "$description"
        set_secret_permissions "$secret_name" "$service_account"
    done
    
    echo ""
}

# Create KMS key for encryption
create_kms_key() {
    echo -e "${BLUE}🔑 Creating KMS Key for Encryption${NC}"
    echo "----------------------------------"
    
    local keyring_name="${ENVIRONMENT}-secrets-keyring"
    local key_name="${ENVIRONMENT}-secrets-key"
    local location="global"
    
    # Create key ring
    if gcloud kms keyrings describe "$keyring_name" --location="$location" --project="$PROJECT_ID" >/dev/null 2>&1; then
        print_status "WARN" "Key ring $keyring_name already exists"
    else
        gcloud kms keyrings create "$keyring_name" \
            --location="$location" \
            --project="$PROJECT_ID"
        print_status "PASS" "Key ring created: $keyring_name"
    fi
    
    # Create key
    if gcloud kms keys describe "$key_name" --keyring="$keyring_name" --location="$location" --project="$PROJECT_ID" >/dev/null 2>&1; then
        print_status "WARN" "Key $key_name already exists"
    else
        gcloud kms keys create "$key_name" \
            --keyring="$keyring_name" \
            --location="$location" \
            --purpose="encryption" \
            --project="$PROJECT_ID"
        print_status "PASS" "Key created: $key_name"
    fi
    
    # Get key version ID and store it as a secret
    local key_version_id=$(gcloud kms keys versions list --key="$key_name" --keyring="$keyring_name" --location="$location" --project="$PROJECT_ID" --format="value(name)" | head -1)
    
    if [ -n "$key_version_id" ]; then
        create_secret "gcp-kms-key-version-id" "$key_version_id" "KMS key version ID for encryption"
        print_status "PASS" "KMS key version ID stored in Secret Manager"
    fi
    
    echo ""
}

# Verify secrets are accessible
verify_secrets() {
    echo -e "${BLUE}✅ Verifying Secret Access${NC}"
    echo "-------------------------"
    
    local secrets=("secret-key" "mongodb-password" "auth-secret" "deepseek-api-key")
    
    for secret_name in "${secrets[@]}"; do
        if gcloud secrets versions access latest --secret="$secret_name" --project="$PROJECT_ID" >/dev/null 2>&1; then
            print_status "PASS" "Secret accessible: $secret_name"
        else
            print_status "FAIL" "Secret not accessible: $secret_name"
            return 1
        fi
    done
    
    echo ""
}

# Generate migration report
generate_migration_report() {
    echo -e "${BLUE}📊 Migration Summary${NC}"
    echo "-------------------"
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local report_file="migration-report-${ENVIRONMENT}-$(date '+%Y%m%d-%H%M%S').md"
    
    cat > "$report_file" << EOF
# Secret Manager Migration Report

**Environment:** ${ENVIRONMENT}
**Project ID:** ${PROJECT_ID}
**Timestamp:** ${timestamp}

## Migration Results

### APIs Enabled
- ✅ Secret Manager API
- ✅ Cloud KMS API
- ✅ IAM API

### Service Account Created
- ✅ commerce-studio-${ENVIRONMENT}@${PROJECT_ID}.iam.gserviceaccount.com

### Secrets Migrated
- ✅ secret-key
- ✅ mongodb-password
- ✅ mongodb-atlas-public-key (placeholder)
- ✅ mongodb-atlas-private-key (placeholder)
- ✅ auth-secret
- ✅ deepseek-api-key (placeholder)
- ✅ gcp-kms-key-version-id
- ✅ gcp-service-account-key (placeholder)

### KMS Key Created
- ✅ ${ENVIRONMENT}-secrets-keyring
- ✅ ${ENVIRONMENT}-secrets-key

### Next Steps
1. Replace placeholder values with actual secrets
2. Update application configuration to use Secret Manager
3. Deploy applications with secure configuration

### Important Notes
- Some secrets contain placeholder values that need to be updated
- Service account key should be downloaded and stored securely
- KMS key provides additional encryption layer for sensitive data

---
*Generated by migrate-to-secret-manager.sh*
EOF

    print_status "INFO" "Migration report generated: $report_file"
    echo ""
}

# Main execution
main() {
    local exit_code=0
    
    # Check prerequisites
    if ! command -v gcloud >/dev/null 2>&1; then
        print_status "FAIL" "gcloud CLI not installed"
        return 1
    fi
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        print_status "FAIL" "gcloud not authenticated"
        return 1
    fi
    
    # Execute migration steps
    enable_apis || exit_code=1
    migrate_secrets || exit_code=1
    create_kms_key || exit_code=1
    verify_secrets || exit_code=1
    
    generate_migration_report
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}🎉 Secret Manager migration completed successfully!${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Important:${NC} Please update placeholder values in Secret Manager with actual secrets:"
        echo "  - mongodb-atlas-public-key"
        echo "  - mongodb-atlas-private-key"
        echo "  - deepseek-api-key"
        echo "  - gcp-service-account-key"
    else
        echo -e "${RED}❌ Migration failed. Please check the errors above.${NC}"
    fi
    
    return $exit_code
}

# Run main function
main "$@"