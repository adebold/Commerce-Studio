#!/bin/bash

# Google Secret Manager Integration Script
# Manages secrets and environment configuration for deployments

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$DEPLOY_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Load configuration
load_config() {
    local env=$1
    local config_file="$DEPLOY_DIR/config/$env.yaml"
    
    if [[ ! -f "$config_file" ]]; then
        error "Configuration file not found: $config_file"
        exit 1
    fi
    
    PROJECT_ID=$(grep "project_id:" "$config_file" | awk '{print $2}')
    REGION=$(grep "region:" "$config_file" | awk '{print $2}')
}

# Create secret in Google Secret Manager
create_secret() {
    local secret_name=$1
    local secret_value=$2
    local env=$3
    
    log "Creating secret: $secret_name for environment: $env"
    
    # Create secret with environment-specific name
    local full_secret_name="${env}-${secret_name}"
    
    # Check if secret already exists
    if gcloud secrets describe "$full_secret_name" --project="$PROJECT_ID" >/dev/null 2>&1; then
        log "Secret $full_secret_name already exists, updating..."
        echo "$secret_value" | gcloud secrets versions add "$full_secret_name" \
            --data-file=- \
            --project="$PROJECT_ID"
    else
        log "Creating new secret $full_secret_name..."
        echo "$secret_value" | gcloud secrets create "$full_secret_name" \
            --data-file=- \
            --project="$PROJECT_ID" \
            --labels="environment=$env,managed-by=deployment-script"
    fi
    
    success "Secret $full_secret_name created/updated successfully"
}

# Get secret from Google Secret Manager
get_secret() {
    local secret_name=$1
    local env=$2
    
    local full_secret_name="${env}-${secret_name}"
    
    gcloud secrets versions access latest \
        --secret="$full_secret_name" \
        --project="$PROJECT_ID" 2>/dev/null || {
        error "Failed to retrieve secret: $full_secret_name"
        return 1
    }
}

# Setup default secrets for an environment
setup_default_secrets() {
    local env=$1
    
    log "Setting up default secrets for environment: $env"
    
    # Database secrets
    if [[ -z "${DATABASE_URL:-}" ]]; then
        warning "DATABASE_URL not provided, generating placeholder"
        DATABASE_URL="mongodb://localhost:27017/eyewear_${env}"
    fi
    create_secret "database-url" "$DATABASE_URL" "$env"
    
    # JWT secrets
    if [[ -z "${JWT_SECRET:-}" ]]; then
        log "Generating JWT secret..."
        JWT_SECRET=$(openssl rand -base64 32)
    fi
    create_secret "jwt-secret" "$JWT_SECRET" "$env"
    
    # API keys
    if [[ -n "${GOOGLE_CLOUD_API_KEY:-}" ]]; then
        create_secret "google-cloud-api-key" "$GOOGLE_CLOUD_API_KEY" "$env"
    fi
    
    if [[ -n "${OPENAI_API_KEY:-}" ]]; then
        create_secret "openai-api-key" "$OPENAI_API_KEY" "$env"
    fi
    
    # Session secrets
    if [[ -z "${SESSION_SECRET:-}" ]]; then
        log "Generating session secret..."
        SESSION_SECRET=$(openssl rand -base64 32)
    fi
    create_secret "session-secret" "$SESSION_SECRET" "$env"
    
    # Encryption keys
    if [[ -z "${ENCRYPTION_KEY:-}" ]]; then
        log "Generating encryption key..."
        ENCRYPTION_KEY=$(openssl rand -base64 32)
    fi
    create_secret "encryption-key" "$ENCRYPTION_KEY" "$env"
    
    success "Default secrets setup completed for $env"
}

# Generate environment variables from secrets
generate_env_vars() {
    local env=$1
    local service=$2
    
    log "Generating environment variables for $service in $env"
    
    # Common environment variables
    local env_vars=""
    
    # Database configuration
    local database_url=$(get_secret "database-url" "$env")
    if [[ -n "$database_url" ]]; then
        env_vars="$env_vars --set-env-vars DATABASE_URL=$database_url"
    fi
    
    # JWT configuration
    local jwt_secret=$(get_secret "jwt-secret" "$env")
    if [[ -n "$jwt_secret" ]]; then
        env_vars="$env_vars --set-env-vars JWT_SECRET=$jwt_secret"
    fi
    
    # Session configuration
    local session_secret=$(get_secret "session-secret" "$env")
    if [[ -n "$session_secret" ]]; then
        env_vars="$env_vars --set-env-vars SESSION_SECRET=$session_secret"
    fi
    
    # Service-specific configurations
    case $service in
        "auth-service")
            local encryption_key=$(get_secret "encryption-key" "$env")
            if [[ -n "$encryption_key" ]]; then
                env_vars="$env_vars --set-env-vars ENCRYPTION_KEY=$encryption_key"
            fi
            ;;
        "frontend")
            # Frontend typically doesn't need sensitive secrets
            env_vars="$env_vars --set-env-vars REACT_APP_ENV=$env"
            ;;
        "api-gateway")
            local google_api_key=$(get_secret "google-cloud-api-key" "$env" 2>/dev/null || echo "")
            if [[ -n "$google_api_key" ]]; then
                env_vars="$env_vars --set-env-vars GOOGLE_CLOUD_API_KEY=$google_api_key"
            fi
            ;;
    esac
    
    # Common environment variables
    env_vars="$env_vars --set-env-vars NODE_ENV=$env"
    env_vars="$env_vars --set-env-vars ENVIRONMENT=$env"
    env_vars="$env_vars --set-env-vars GCP_PROJECT_ID=$PROJECT_ID"
    env_vars="$env_vars --set-env-vars GCP_REGION=$REGION"
    
    echo "$env_vars"
}

# Validate secrets exist
validate_secrets() {
    local env=$1
    
    log "Validating secrets for environment: $env"
    
    local required_secrets=("database-url" "jwt-secret" "session-secret" "encryption-key")
    local missing_secrets=()
    
    for secret in "${required_secrets[@]}"; do
        if ! get_secret "$secret" "$env" >/dev/null 2>&1; then
            missing_secrets+=("$secret")
        fi
    done
    
    if [[ ${#missing_secrets[@]} -gt 0 ]]; then
        error "Missing required secrets for $env: ${missing_secrets[*]}"
        return 1
    fi
    
    success "All required secrets exist for $env"
    return 0
}

# Rotate secrets
rotate_secrets() {
    local env=$1
    local secret_name=$2
    
    log "Rotating secret: $secret_name for environment: $env"
    
    case $secret_name in
        "jwt-secret"|"session-secret"|"encryption-key")
            local new_secret=$(openssl rand -base64 32)
            create_secret "$secret_name" "$new_secret" "$env"
            ;;
        *)
            error "Secret rotation not supported for: $secret_name"
            return 1
            ;;
    esac
    
    success "Secret $secret_name rotated successfully for $env"
}

# List secrets for an environment
list_secrets() {
    local env=$1
    
    log "Listing secrets for environment: $env"
    
    gcloud secrets list \
        --filter="labels.environment=$env" \
        --project="$PROJECT_ID" \
        --format="table(name,createTime,labels.environment)"
}

# Delete secrets for an environment
delete_secrets() {
    local env=$1
    
    warning "This will delete ALL secrets for environment: $env"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Operation cancelled"
        return 0
    fi
    
    log "Deleting secrets for environment: $env"
    
    local secrets=$(gcloud secrets list \
        --filter="labels.environment=$env" \
        --project="$PROJECT_ID" \
        --format="value(name)")
    
    for secret in $secrets; do
        log "Deleting secret: $secret"
        gcloud secrets delete "$secret" --project="$PROJECT_ID" --quiet
    done
    
    success "All secrets deleted for environment: $env"
}

# Main function
main() {
    local action=${1:-help}
    local env=${2:-}
    
    case $action in
        "setup")
            if [[ -z "$env" ]]; then
                error "Environment required for setup action"
                exit 1
            fi
            load_config "$env"
            setup_default_secrets "$env"
            ;;
        "validate")
            if [[ -z "$env" ]]; then
                error "Environment required for validate action"
                exit 1
            fi
            load_config "$env"
            validate_secrets "$env"
            ;;
        "generate-env")
            if [[ -z "$env" ]]; then
                error "Environment required for generate-env action"
                exit 1
            fi
            local service=${3:-}
            if [[ -z "$service" ]]; then
                error "Service required for generate-env action"
                exit 1
            fi
            load_config "$env"
            generate_env_vars "$env" "$service"
            ;;
        "rotate")
            if [[ -z "$env" ]]; then
                error "Environment required for rotate action"
                exit 1
            fi
            local secret_name=${3:-}
            if [[ -z "$secret_name" ]]; then
                error "Secret name required for rotate action"
                exit 1
            fi
            load_config "$env"
            rotate_secrets "$env" "$secret_name"
            ;;
        "list")
            if [[ -z "$env" ]]; then
                error "Environment required for list action"
                exit 1
            fi
            load_config "$env"
            list_secrets "$env"
            ;;
        "delete")
            if [[ -z "$env" ]]; then
                error "Environment required for delete action"
                exit 1
            fi
            load_config "$env"
            delete_secrets "$env"
            ;;
        "help"|*)
            echo "Usage: $0 <action> <environment> [options]"
            echo ""
            echo "Actions:"
            echo "  setup <env>                    - Setup default secrets for environment"
            echo "  validate <env>                 - Validate required secrets exist"
            echo "  generate-env <env> <service>   - Generate environment variables for service"
            echo "  rotate <env> <secret_name>     - Rotate a specific secret"
            echo "  list <env>                     - List all secrets for environment"
            echo "  delete <env>                   - Delete all secrets for environment"
            echo ""
            echo "Examples:"
            echo "  $0 setup staging"
            echo "  $0 validate prod"
            echo "  $0 generate-env staging auth-service"
            echo "  $0 rotate prod jwt-secret"
            ;;
    esac
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi