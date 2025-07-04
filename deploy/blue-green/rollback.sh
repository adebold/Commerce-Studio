#!/bin/bash

# Blue-Green Rollback Script
# Implements automated rollback for blue-green deployments

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

# Get the last stable deployment
get_last_stable_deployment() {
    local service=$1
    
    # Find the inactive environment that was previously stable
    local blue_status=$(gcloud run services describe "$service-blue" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(metadata.labels.status)" 2>/dev/null || echo "")
    
    local green_status=$(gcloud run services describe "$service-green" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(metadata.labels.status)" 2>/dev/null || echo "")
    
    # Determine which environment to rollback to
    if [[ "$blue_status" == "inactive" ]]; then
        echo "blue"
    elif [[ "$green_status" == "inactive" ]]; then
        echo "green"
    else
        # If no inactive environment found, try to determine from current traffic
        local current_revision=$(gcloud run services describe "$service" \
            --region="$REGION" \
            --project="$PROJECT_ID" \
            --format="value(status.traffic[0].revisionName)" 2>/dev/null || echo "")
        
        if [[ "$current_revision" == *"-blue-"* ]]; then
            echo "green"  # Rollback to green
        else
            echo "blue"   # Rollback to blue
        fi
    fi
}

# Verify rollback target is healthy
verify_rollback_target() {
    local service=$1
    local target_env=$2
    
    log "Verifying rollback target $service-$target_env..."
    
    # Check if the service exists
    if ! gcloud run services describe "$service-$target_env" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(metadata.name)" >/dev/null 2>&1; then
        error "Rollback target $service-$target_env does not exist"
        return 1
    fi
    
    # Get service URL
    local service_url=$(gcloud run services describe "$service-$target_env" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.url)")
    
    if [[ -z "$service_url" ]]; then
        error "Could not get service URL for $service-$target_env"
        return 1
    fi
    
    # Quick health check
    if curl -sf "$service_url/health" >/dev/null 2>&1; then
        success "Rollback target $service-$target_env is healthy"
        return 0
    else
        error "Rollback target $service-$target_env failed health check"
        return 1
    fi
}

# Switch traffic back to stable environment
rollback_traffic() {
    local service=$1
    local target_env=$2
    
    log "Rolling back traffic for $service to $target_env..."
    
    # Update traffic allocation to point back to stable environment
    gcloud run services update-traffic "$service" \
        --to-revisions="$service-$target_env=100" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --quiet
    
    # Update labels to mark the rollback
    gcloud run services update "$service-$target_env" \
        --labels="environment=$target_env,service=$service,deployment-type=blue-green,status=active,rollback=true" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --quiet
    
    success "Traffic rolled back to $service-$target_env"
}

# Mark failed environment
mark_failed_environment() {
    local service=$1
    local failed_env=$2
    
    log "Marking $service-$failed_env as failed..."
    
    gcloud run services update "$service-$failed_env" \
        --labels="environment=$failed_env,service=$service,deployment-type=blue-green,status=failed" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --quiet
    
    # Optionally scale down the failed environment to save costs
    gcloud run services update "$service-$failed_env" \
        --min-instances=0 \
        --max-instances=1 \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --quiet
    
    success "Marked $service-$failed_env as failed and scaled down"
}

# Send rollback notification
send_notification() {
    local env=$1
    local deployment_id=$2
    local reason=$3
    
    log "Sending rollback notification..."
    
    # Create notification payload
    local notification_payload=$(cat <<EOF
{
  "text": "🚨 Blue-Green Deployment Rollback",
  "attachments": [
    {
      "color": "danger",
      "fields": [
        {
          "title": "Environment",
          "value": "$env",
          "short": true
        },
        {
          "title": "Deployment ID",
          "value": "$deployment_id",
          "short": true
        },
        {
          "title": "Reason",
          "value": "$reason",
          "short": false
        },
        {
          "title": "Time",
          "value": "$(date -Iseconds)",
          "short": true
        }
      ]
    }
  ]
}
EOF
)
    
    # Save notification for later processing
    mkdir -p "$PROJECT_ROOT/data/notifications"
    echo "$notification_payload" > "$PROJECT_ROOT/data/notifications/rollback-$(date +%Y%m%d-%H%M%S).json"
    
    success "Rollback notification saved"
}

# Main rollback function
main() {
    local env=${1:-staging}
    local deployment_id=${2:-"manual-rollback"}
    local reason=${3:-"Manual rollback requested"}
    
    if [[ "$env" != "staging" && "$env" != "prod" ]]; then
        error "Blue-green rollback only supported for staging and prod environments"
        exit 1
    fi
    
    log "Starting blue-green rollback for environment: $env"
    log "Deployment ID: $deployment_id"
    log "Reason: $reason"
    
    # Load configuration
    load_config "$env"
    
    # Services to rollback
    local services=("auth-service" "frontend" "api-gateway")
    
    # Track rollback state
    local rollback_id="rb-$(date +%Y%m%d-%H%M%S)"
    local rollback_log="/tmp/rollback-$rollback_id.log"
    
    log "Rollback ID: $rollback_id"
    log "Rollback log: $rollback_log"
    
    # Create rollback record
    cat > "$rollback_log" <<EOF
{
  "rollback_id": "$rollback_id",
  "deployment_id": "$deployment_id",
  "environment": "$env",
  "reason": "$reason",
  "start_time": "$(date -Iseconds)",
  "services": [],
  "status": "in_progress"
}
EOF
    
    local rollback_success=true
    
    for service in "${services[@]}"; do
        log "Rolling back service: $service"
        
        # Determine rollback target
        local target_env=$(get_last_stable_deployment "$service")
        local failed_env
        if [[ "$target_env" == "blue" ]]; then
            failed_env="green"
        else
            failed_env="blue"
        fi
        
        log "Rolling back $service to $target_env (marking $failed_env as failed)"
        
        # Verify rollback target
        if ! verify_rollback_target "$service" "$target_env"; then
            error "Cannot rollback $service: target environment $target_env is not healthy"
            rollback_success=false
            continue
        fi
        
        # Rollback traffic
        if ! rollback_traffic "$service" "$target_env"; then
            error "Failed to rollback traffic for $service"
            rollback_success=false
            continue
        fi
        
        # Mark failed environment
        mark_failed_environment "$service" "$failed_env"
        
        success "Successfully rolled back $service to $target_env"
    done
    
    # Update rollback record with final status
    local final_status
    if [[ "$rollback_success" == "true" ]]; then
        final_status="completed"
        success "Blue-green rollback completed successfully!"
    else
        final_status="partial_failure"
        warning "Blue-green rollback completed with some failures"
    fi
    
    local end_time=$(date -Iseconds)
    
    # Update rollback log with final status
    if command -v jq >/dev/null 2>&1; then
        jq --arg end_time "$end_time" --arg status "$final_status" \
            '.end_time = $end_time | .status = $status' \
            "$rollback_log" > "${rollback_log}.tmp" && mv "${rollback_log}.tmp" "$rollback_log"
    else
        # Fallback if jq is not available
        sed -i "s/\"status\": \"in_progress\"/\"status\": \"$final_status\", \"end_time\": \"$end_time\"/" "$rollback_log"
    fi
    
    # Send notification
    send_notification "$env" "$deployment_id" "$reason"
    
    # Save rollback record to persistent storage
    mkdir -p "$PROJECT_ROOT/data/rollbacks"
    cp "$rollback_log" "$PROJECT_ROOT/data/rollbacks/rollback-$rollback_id.json"
    
    if [[ "$rollback_success" == "true" ]]; then
        exit 0
    else
        exit 1
    fi
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi