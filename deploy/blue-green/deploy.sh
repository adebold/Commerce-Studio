#!/bin/bash

# Blue-Green Deployment Script
# Implements blue-green deployment pattern with automated rollback triggers

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
    
    # Parse YAML configuration (simplified - in production use yq or similar)
    PROJECT_ID=$(grep "project_id:" "$config_file" | awk '{print $2}')
    REGION=$(grep "region:" "$config_file" | awk '{print $2}')
    REGISTRY=$(grep "registry:" "$config_file" | awk '{print $2}')
    
    # Check if blue-green is enabled
    BLUE_GREEN_ENABLED=$(grep -A 5 "blue_green:" "$config_file" | grep "enabled:" | awk '{print $2}')
    if [[ "$BLUE_GREEN_ENABLED" != "true" ]]; then
        error "Blue-green deployment is not enabled for environment: $env"
        exit 1
    fi
    
    HEALTH_CHECK_TIMEOUT=$(grep -A 5 "blue_green:" "$config_file" | grep "health_check_timeout:" | awk '{print $2}' || echo "300")
    ROLLBACK_THRESHOLD=$(grep -A 5 "blue_green:" "$config_file" | grep "rollback_threshold:" | awk '{print $2}' || echo "5")
}

# Determine current active environment (blue or green)
get_current_environment() {
    local service=$1
    local env=$2
    
    # Check which environment is currently receiving traffic
    local current_service=$(gcloud run services describe "$service" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(metadata.labels.environment)" 2>/dev/null || echo "")
    
    if [[ "$current_service" == "blue" ]]; then
        echo "green"  # Deploy to the inactive environment
    else
        echo "blue"   # Default to blue if no current environment or if green is active
    fi
}

# Deploy to inactive environment
deploy_to_inactive() {
    local service=$1
    local env=$2
    local target_env=$3
    local image_tag=${4:-latest}
    
    log "Deploying $service to $target_env environment..."
    
    # Load service configuration
    local config_file="$DEPLOY_DIR/config/$env.yaml"
    local memory=$(grep -A 20 "$service:" "$config_file" | grep "memory:" | awk '{print $2}')
    local cpu=$(grep -A 20 "$service:" "$config_file" | grep "cpu:" | awk '{print $2}')
    local min_instances=$(grep -A 20 "$service:" "$config_file" | grep "min_instances:" | awk '{print $2}')
    local max_instances=$(grep -A 20 "$service:" "$config_file" | grep "max_instances:" | awk '{print $2}')
    local concurrency=$(grep -A 20 "$service:" "$config_file" | grep "concurrency:" | awk '{print $2}')
    
    # Deploy to Cloud Run with blue/green suffix
    local service_name="${service}-${target_env}"
    
    gcloud run deploy "$service_name" \
        --image="$REGISTRY/$service:$image_tag" \
        --platform=managed \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --memory="$memory" \
        --cpu="$cpu" \
        --min-instances="$min_instances" \
        --max-instances="$max_instances" \
        --concurrency="$concurrency" \
        --no-allow-unauthenticated \
        --set-env-vars="ENVIRONMENT=$env,DEPLOYMENT_TYPE=$target_env" \
        --labels="environment=$target_env,service=$service,deployment-type=blue-green" \
        --quiet
    
    success "Deployed $service to $target_env environment"
}

# Run health checks on deployed service
run_health_checks() {
    local service=$1
    local target_env=$2
    local timeout=$3
    
    log "Running health checks for $service-$target_env..."
    
    # Get service URL
    local service_url=$(gcloud run services describe "$service-$target_env" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.url)")
    
    if [[ -z "$service_url" ]]; then
        error "Could not get service URL for $service-$target_env"
        return 1
    fi
    
    # Health check with timeout
    local start_time=$(date +%s)
    local end_time=$((start_time + timeout))
    local check_count=0
    local failed_checks=0
    
    while [[ $(date +%s) -lt $end_time ]]; do
        check_count=$((check_count + 1))
        
        if curl -sf "$service_url/health" >/dev/null 2>&1; then
            success "Health check $check_count passed for $service-$target_env"
            
            # Additional checks for specific services
            case $service in
                "auth-service")
                    if ! curl -sf "$service_url/auth/status" >/dev/null 2>&1; then
                        warning "Auth status check failed"
                        failed_checks=$((failed_checks + 1))
                    fi
                    ;;
                "frontend")
                    if ! curl -sf "$service_url/" >/dev/null 2>&1; then
                        warning "Frontend root check failed"
                        failed_checks=$((failed_checks + 1))
                    fi
                    ;;
            esac
            
            # If we have enough successful checks, consider it healthy
            if [[ $check_count -ge 3 && $failed_checks -lt $ROLLBACK_THRESHOLD ]]; then
                success "Health checks passed for $service-$target_env"
                return 0
            fi
        else
            warning "Health check $check_count failed for $service-$target_env"
            failed_checks=$((failed_checks + 1))
            
            if [[ $failed_checks -ge $ROLLBACK_THRESHOLD ]]; then
                error "Too many failed health checks ($failed_checks >= $ROLLBACK_THRESHOLD)"
                return 1
            fi
        fi
        
        sleep 10
    done
    
    error "Health checks timed out for $service-$target_env"
    return 1
}

# Switch traffic to new environment
switch_traffic() {
    local service=$1
    local target_env=$2
    
    log "Switching traffic to $service-$target_env..."
    
    # Update the main service to point to the new environment
    local target_service_url=$(gcloud run services describe "$service-$target_env" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.url)")
    
    # Update traffic allocation (this is a simplified approach)
    # In a real implementation, you might use Cloud Load Balancer or Traffic Director
    gcloud run services update-traffic "$service" \
        --to-revisions="$service-$target_env=100" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --quiet
    
    success "Traffic switched to $service-$target_env"
}

# Cleanup old environment
cleanup_old_environment() {
    local service=$1
    local old_env=$2
    
    log "Cleaning up old environment $service-$old_env..."
    
    # Keep the old environment for a while for potential rollback
    # Mark it as inactive but don't delete immediately
    gcloud run services update "$service-$old_env" \
        --labels="environment=$old_env,service=$service,deployment-type=blue-green,status=inactive" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --quiet
    
    success "Marked $service-$old_env as inactive"
}

# Main deployment function
main() {
    local env=${1:-staging}
    local image_tag=${2:-latest}
    
    if [[ "$env" != "staging" && "$env" != "prod" ]]; then
        error "Blue-green deployment only supported for staging and prod environments"
        exit 1
    fi
    
    log "Starting blue-green deployment for environment: $env"
    
    # Load configuration
    load_config "$env"
    
    # Services to deploy
    local services=("auth-service" "frontend" "api-gateway")
    
    # Track deployment state
    local deployment_id="bg-$(date +%Y%m%d-%H%M%S)"
    local deployment_log="/tmp/deployment-$deployment_id.log"
    
    log "Deployment ID: $deployment_id"
    log "Deployment log: $deployment_log"
    
    # Create deployment record
    cat > "$deployment_log" <<EOF
{
  "deployment_id": "$deployment_id",
  "environment": "$env",
  "start_time": "$(date -Iseconds)",
  "services": [],
  "status": "in_progress"
}
EOF
    
    for service in "${services[@]}"; do
        log "Processing service: $service"
        
        # Determine target environment (blue or green)
        local target_env=$(get_current_environment "$service" "$env")
        local old_env
        if [[ "$target_env" == "blue" ]]; then
            old_env="green"
        else
            old_env="blue"
        fi
        
        log "Deploying $service to $target_env (current: $old_env)"
        
        # Deploy to inactive environment
        if ! deploy_to_inactive "$service" "$env" "$target_env" "$image_tag"; then
            error "Failed to deploy $service to $target_env"
            
            # Trigger rollback
            warning "Triggering automatic rollback..."
            "$SCRIPT_DIR/rollback.sh" "$env" "$deployment_id"
            exit 1
        fi
        
        # Run health checks
        if ! run_health_checks "$service" "$target_env" "$HEALTH_CHECK_TIMEOUT"; then
            error "Health checks failed for $service-$target_env"
            
            # Trigger rollback
            warning "Triggering automatic rollback due to failed health checks..."
            "$SCRIPT_DIR/rollback.sh" "$env" "$deployment_id"
            exit 1
        fi
        
        # Switch traffic
        if ! switch_traffic "$service" "$target_env"; then
            error "Failed to switch traffic for $service"
            
            # Trigger rollback
            warning "Triggering automatic rollback due to traffic switch failure..."
            "$SCRIPT_DIR/rollback.sh" "$env" "$deployment_id"
            exit 1
        fi
        
        # Cleanup old environment
        cleanup_old_environment "$service" "$old_env"
        
        success "Successfully deployed $service using blue-green strategy"
    done
    
    # Update deployment record
    local end_time=$(date -Iseconds)
    jq --arg end_time "$end_time" --arg status "completed" \
        '.end_time = $end_time | .status = $status' \
        "$deployment_log" > "${deployment_log}.tmp" && mv "${deployment_log}.tmp" "$deployment_log"
    
    success "Blue-green deployment completed successfully!"
    success "Deployment ID: $deployment_id"
    success "All services are now running in the new environment"
    
    # Save deployment record to persistent storage
    mkdir -p "$PROJECT_ROOT/data/deployments"
    cp "$deployment_log" "$PROJECT_ROOT/data/deployments/deployment-$deployment_id.json"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi