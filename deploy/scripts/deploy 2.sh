#!/bin/bash

# Main Deployment Script
# Standardized deployment with secret management integration

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
    REGISTRY=$(grep "registry:" "$config_file" | awk '{print $2}')
}

# Build Docker images
build_images() {
    local env=$1
    local image_tag=${2:-latest}
    
    log "Building Docker images for environment: $env"
    
    # Build auth service
    log "Building auth-service..."
    docker build -t "$REGISTRY/auth-service:$image_tag" \
        -f auth/Dockerfile \
        --build-arg NODE_ENV="$env" \
        auth/
    
    # Build frontend
    log "Building frontend..."
    docker build -t "$REGISTRY/frontend:$image_tag" \
        -f frontend/Dockerfile \
        --build-arg NODE_ENV="$env" \
        frontend/
    
    success "Docker images built successfully"
}

# Push Docker images
push_images() {
    local image_tag=${1:-latest}
    
    log "Pushing Docker images to registry..."
    
    # Configure Docker to use gcloud as credential helper
    gcloud auth configure-docker --quiet
    
    # Push images
    docker push "$REGISTRY/auth-service:$image_tag"
    docker push "$REGISTRY/frontend:$image_tag"
    
    success "Docker images pushed successfully"
}

# Deploy service to Cloud Run
deploy_service() {
    local service=$1
    local env=$2
    local image_tag=${3:-latest}
    
    log "Deploying $service to $env environment..."
    
    # Load service configuration
    local config_file="$DEPLOY_DIR/config/$env.yaml"
    local memory=$(grep -A 20 "$service:" "$config_file" | grep "memory:" | awk '{print $2}')
    local cpu=$(grep -A 20 "$service:" "$config_file" | grep "cpu:" | awk '{print $2}')
    local min_instances=$(grep -A 20 "$service:" "$config_file" | grep "min_instances:" | awk '{print $2}')
    local max_instances=$(grep -A 20 "$service:" "$config_file" | grep "max_instances:" | awk '{print $2}')
    local concurrency=$(grep -A 20 "$service:" "$config_file" | grep "concurrency:" | awk '{print $2}')
    
    # Generate environment variables from secrets
    local env_vars=$("$SCRIPT_DIR/manage-secrets.sh" generate-env "$env" "$service")
    
    # Deploy to Cloud Run
    gcloud run deploy "$service" \
        --image="$REGISTRY/$service:$image_tag" \
        --platform=managed \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --memory="$memory" \
        --cpu="$cpu" \
        --min-instances="$min_instances" \
        --max-instances="$max_instances" \
        --concurrency="$concurrency" \
        --allow-unauthenticated \
        $env_vars \
        --labels="environment=$env,service=$service,deployment-type=standard" \
        --quiet
    
    success "Deployed $service successfully"
}

# Run health checks
run_health_checks() {
    local env=$1
    local services=("auth-service" "frontend")
    
    log "Running health checks for $env environment..."
    
    for service in "${services[@]}"; do
        log "Checking health of $service..."
        
        # Get service URL
        local service_url=$(gcloud run services describe "$service" \
            --region="$REGION" \
            --project="$PROJECT_ID" \
            --format="value(status.url)")
        
        if [[ -z "$service_url" ]]; then
            error "Could not get service URL for $service"
            return 1
        fi
        
        # Health check with retries
        local max_retries=5
        local retry_count=0
        
        while [[ $retry_count -lt $max_retries ]]; do
            if curl -sf "$service_url/health" >/dev/null 2>&1; then
                success "Health check passed for $service"
                break
            else
                retry_count=$((retry_count + 1))
                if [[ $retry_count -lt $max_retries ]]; then
                    warning "Health check failed for $service, retrying ($retry_count/$max_retries)..."
                    sleep 10
                else
                    error "Health check failed for $service after $max_retries attempts"
                    return 1
                fi
            fi
        done
    done
    
    success "All health checks passed"
}

# Update documentation
update_documentation() {
    local env=$1
    local deployment_id=$2
    
    log "Updating deployment documentation..."
    
    # Create deployment record
    local deployment_record=$(cat <<EOF
{
  "deployment_id": "$deployment_id",
  "environment": "$env",
  "timestamp": "$(date -Iseconds)",
  "services": ["auth-service", "frontend"],
  "status": "completed",
  "deployed_by": "$(whoami)",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF
)
    
    # Save deployment record
    mkdir -p "$PROJECT_ROOT/data/deployments"
    echo "$deployment_record" > "$PROJECT_ROOT/data/deployments/deployment-$deployment_id.json"
    
    success "Deployment documentation updated"
}

# Main deployment function
main() {
    local env=${1:-staging}
    local image_tag=${2:-$(date +%Y%m%d-%H%M%S)}
    local skip_build=${3:-false}
    
    log "Starting deployment to $env environment"
    log "Image tag: $image_tag"
    
    # Validate environment
    if [[ "$env" != "dev" && "$env" != "staging" && "$env" != "prod" ]]; then
        error "Invalid environment: $env. Must be dev, staging, or prod"
        exit 1
    fi
    
    # Load configuration
    load_config "$env"
    
    # Generate deployment ID
    local deployment_id="deploy-$(date +%Y%m%d-%H%M%S)"
    log "Deployment ID: $deployment_id"
    
    # Validate secrets exist
    if ! "$SCRIPT_DIR/manage-secrets.sh" validate "$env"; then
        error "Secret validation failed. Run: deploy/scripts/manage-secrets.sh setup $env"
        exit 1
    fi
    
    # Build images if not skipping
    if [[ "$skip_build" != "true" ]]; then
        build_images "$env" "$image_tag"
        push_images "$image_tag"
    else
        log "Skipping image build (using existing images)"
    fi
    
    # Deploy services
    local services=("auth-service" "frontend")
    
    for service in "${services[@]}"; do
        deploy_service "$service" "$env" "$image_tag"
    done
    
    # Run health checks
    if ! run_health_checks "$env"; then
        error "Health checks failed, deployment may be unstable"
        exit 1
    fi
    
    # Update documentation
    update_documentation "$env" "$deployment_id"
    
    success "Deployment completed successfully!"
    success "Deployment ID: $deployment_id"
    success "Environment: $env"
    success "Image tag: $image_tag"
    
    # Display service URLs
    log "Service URLs:"
    for service in "${services[@]}"; do
        local service_url=$(gcloud run services describe "$service" \
            --region="$REGION" \
            --project="$PROJECT_ID" \
            --format="value(status.url)")
        log "  $service: $service_url"
    done
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi