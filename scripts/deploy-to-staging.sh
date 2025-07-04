#!/bin/bash

# Commerce Studio Secure Deployment Script for Staging Environment
# Phase 6: Application Build & Deployment

set -euo pipefail

# Configuration
PROJECT_ID="${PROJECT_ID:-ml-datadriven-recos}"
REGION="${REGION:-us-central1}"
ENVIRONMENT="${ENVIRONMENT:-staging}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if gcloud is installed and authenticated
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI is not installed"
        exit 1
    fi
    
    # Check if authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "Not authenticated with gcloud. Run 'gcloud auth login'"
        exit 1
    fi
    
    # Check if project is set
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
    if [[ "$CURRENT_PROJECT" != "$PROJECT_ID" ]]; then
        log_warning "Setting project to $PROJECT_ID"
        gcloud config set project "$PROJECT_ID"
    fi
    
    # Enable required APIs
    log_info "Enabling required APIs..."
    gcloud services enable \
        cloudbuild.googleapis.com \
        run.googleapis.com \
        secretmanager.googleapis.com \
        containerregistry.googleapis.com \
        monitoring.googleapis.com \
        logging.googleapis.com
    
    log_success "Prerequisites checked"
}

# Validate secrets exist
validate_secrets() {
    log_info "Validating secrets in Secret Manager..."
    
    local secrets=(
        "commerce-studio-jwt-secret"
        "commerce-studio-db-password"
        "commerce-studio-api-key"
    )
    
    for secret in "${secrets[@]}"; do
        if ! gcloud secrets describe "$secret" &>/dev/null; then
            log_error "Secret $secret does not exist. Please create it first."
            exit 1
        fi
    done
    
    log_success "All required secrets exist"
}

# Deploy using Cloud Build
deploy_with_cloud_build() {
    log_info "Starting secure deployment with Cloud Build..."
    
    # Submit build with secure configuration
    gcloud builds submit \
        --config cloudbuild-secure.yaml \
        --substitutions=_ENVIRONMENT="$ENVIRONMENT",_REGION="$REGION" \
        --timeout=3600s
    
    log_success "Cloud Build deployment completed"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Get service URLs
    local api_url=$(gcloud run services describe commerce-studio-api --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "")
    local auth_url=$(gcloud run services describe commerce-studio-auth --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "")
    local frontend_url=$(gcloud run services describe commerce-studio-frontend --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "")
    
    # Verify services are running
    if [[ -n "$api_url" ]]; then
        log_info "Testing API service at $api_url"
        if curl -f "$api_url/health" &>/dev/null; then
            log_success "API service is healthy"
        else
            log_error "API service health check failed"
            return 1
        fi
    else
        log_error "API service not found"
        return 1
    fi
    
    if [[ -n "$auth_url" ]]; then
        log_info "Testing Auth service at $auth_url"
        if curl -f "$auth_url/health" &>/dev/null; then
            log_success "Auth service is healthy"
        else
            log_error "Auth service health check failed"
            return 1
        fi
    else
        log_error "Auth service not found"
        return 1
    fi
    
    if [[ -n "$frontend_url" ]]; then
        log_info "Testing Frontend service at $frontend_url"
        if curl -f "$frontend_url/" &>/dev/null; then
            log_success "Frontend service is healthy"
        else
            log_error "Frontend service health check failed"
            return 1
        fi
    else
        log_error "Frontend service not found"
        return 1
    fi
    
    # Display service URLs
    echo ""
    log_success "Deployment verification completed successfully!"
    echo ""
    echo "Service URLs:"
    echo "  API:      $api_url"
    echo "  Auth:     $auth_url"
    echo "  Frontend: $frontend_url"
    echo ""
}

# Main deployment function
main() {
    log_info "Starting Commerce Studio deployment to $ENVIRONMENT environment"
    
    check_prerequisites
    validate_secrets
    deploy_with_cloud_build
    verify_deployment
    
    log_success "Commerce Studio deployment completed successfully!"
}

# Run main function
main "$@"