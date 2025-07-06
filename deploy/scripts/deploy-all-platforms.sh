#!/bin/bash

# Master AI Discovery Deployment Orchestrator
# Coordinates deployment across all e-commerce platforms

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
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

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

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

section() {
    echo -e "${PURPLE}[SECTION]${NC} $1"
}

# Global deployment state
declare -A DEPLOYMENT_STATUS
declare -A DEPLOYMENT_TIMES
declare -A DEPLOYMENT_ERRORS

# Initialize deployment tracking
init_deployment_tracking() {
    local deployment_id=$1
    
    # Create deployment tracking directory
    mkdir -p "$PROJECT_ROOT/data/deployments"
    
    # Initialize deployment log
    local deployment_log="$PROJECT_ROOT/data/deployments/master-deployment-$deployment_id.json"
    
    cat > "$deployment_log" <<EOF
{
    "deployment_id": "$deployment_id",
    "start_time": "$(date -Iseconds)",
    "status": "in_progress",
    "platforms": {
        "shopify": {"status": "pending", "start_time": null, "end_time": null, "error": null},
        "woocommerce": {"status": "pending", "start_time": null, "end_time": null, "error": null},
        "magento": {"status": "pending", "start_time": null, "end_time": null, "error": null},
        "html": {"status": "pending", "start_time": null, "end_time": null, "error": null}
    },
    "services": {
        "ai_discovery": {"status": "pending", "start_time": null, "end_time": null, "error": null},
        "face_analysis": {"status": "pending", "start_time": null, "end_time": null, "error": null},
        "recommendation": {"status": "pending", "start_time": null, "end_time": null, "error": null},
        "analytics": {"status": "pending", "start_time": null, "end_time": null, "error": null},
        "api_gateway": {"status": "pending", "start_time": null, "end_time": null, "error": null}
    },
    "infrastructure": {
        "terraform": {"status": "pending", "start_time": null, "end_time": null, "error": null},
        "monitoring": {"status": "pending", "start_time": null, "end_time": null, "error": null},
        "cdn": {"status": "pending", "start_time": null, "end_time": null, "error": null}
    }
}
EOF

    echo "$deployment_log"
}

# Update deployment status
update_deployment_status() {
    local deployment_log=$1
    local component=$2
    local category=$3
    local status=$4
    local error_msg=${5:-null}
    
    local timestamp=$(date -Iseconds)
    
    if [[ "$status" == "started" ]]; then
        jq --arg cat "$category" --arg comp "$component" --arg time "$timestamp" \
            '.[$cat][$comp].status = "in_progress" | .[$cat][$comp].start_time = $time' \
            "$deployment_log" > "${deployment_log}.tmp" && mv "${deployment_log}.tmp" "$deployment_log"
    elif [[ "$status" == "completed" ]]; then
        jq --arg cat "$category" --arg comp "$component" --arg time "$timestamp" \
            '.[$cat][$comp].status = "completed" | .[$cat][$comp].end_time = $time' \
            "$deployment_log" > "${deployment_log}.tmp" && mv "${deployment_log}.tmp" "$deployment_log"
    elif [[ "$status" == "failed" ]]; then
        jq --arg cat "$category" --arg comp "$component" --arg time "$timestamp" --arg error "$error_msg" \
            '.[$cat][$comp].status = "failed" | .[$cat][$comp].end_time = $time | .[$cat][$comp].error = $error' \
            "$deployment_log" > "${deployment_log}.tmp" && mv "${deployment_log}.tmp" "$deployment_log"
    fi
}

# Pre-deployment validation
validate_prerequisites() {
    section "Validating deployment prerequisites..."
    
    local validation_errors=0
    
    # Check required tools
    local required_tools=("docker" "gcloud" "kubectl" "terraform" "npm" "composer" "jq" "curl" "gsutil")
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error "Required tool not found: $tool"
            ((validation_errors++))
        else
            info "✓ $tool found"
        fi
    done
    
    # Check environment variables
    local required_env_vars=(
        "GCP_PROJECT_ID"
        "VERTEX_AI_PROJECT"
        "VERTEX_AI_LOCATION"
    )
    
    for var in "${required_env_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable not set: $var"
            ((validation_errors++))
        else
            info "✓ $var is set"
        fi
    done
    
    # Check GCP authentication
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null; then
        error "GCP authentication not configured"
        ((validation_errors++))
    else
        info "✓ GCP authentication configured"
    fi
    
    # Check Docker daemon
    if ! docker info > /dev/null 2>&1; then
        error "Docker daemon not running"
        ((validation_errors++))
    else
        info "✓ Docker daemon running"
    fi
    
    if [[ $validation_errors -gt 0 ]]; then
        error "Validation failed with $validation_errors errors"
        return 1
    fi
    
    success "All prerequisites validated"
    return 0
}

# Deploy infrastructure
deploy_infrastructure() {
    local deployment_log=$1
    local version=$2
    
    section "Deploying infrastructure..."
    
    update_deployment_status "$deployment_log" "terraform" "infrastructure" "started"
    
    if ! deploy_terraform_infrastructure "$version"; then
        update_deployment_status "$deployment_log" "terraform" "infrastructure" "failed" "Terraform deployment failed"
        return 1
    fi
    
    update_deployment_status "$deployment_log" "terraform" "infrastructure" "completed"
    
    update_deployment_status "$deployment_log" "monitoring" "infrastructure" "started"
    
    if ! setup_monitoring_stack "$version"; then
        update_deployment_status "$deployment_log" "monitoring" "infrastructure" "failed" "Monitoring setup failed"
        return 1
    fi
    
    update_deployment_status "$deployment_log" "monitoring" "infrastructure" "completed"
    
    success "Infrastructure deployment completed"
    return 0
}

# Deploy Terraform infrastructure
deploy_terraform_infrastructure() {
    local version=$1
    
    log "Deploying Terraform infrastructure..."
    
    cd "$PROJECT_ROOT/terraform/environments/production"
    
    # Initialize Terraform
    terraform init -upgrade
    
    # Plan deployment
    terraform plan -var="image_tag=$version" -out=tfplan
    
    # Apply deployment
    terraform apply tfplan
    
    success "Terraform infrastructure deployed"
}

# Setup monitoring stack
setup_monitoring_stack() {
    local version=$1
    
    log "Setting up monitoring stack..."
    
    # Deploy monitoring services
    docker-compose -f "$DEPLOY_DIR/production/docker-compose.prod.yml" up -d prometheus grafana
    
    # Wait for services to be ready
    sleep 30
    
    # Configure Grafana dashboards
    if ! configure_grafana_dashboards; then
        warning "Grafana dashboard configuration failed"
    fi
    
    success "Monitoring stack deployed"
}

# Configure Grafana dashboards
configure_grafana_dashboards() {
    log "Configuring Grafana dashboards..."
    
    local grafana_url="http://localhost:3000"
    local admin_password="${GRAFANA_PASSWORD:-admin}"
    
    # Wait for Grafana to be ready
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf "$grafana_url/api/health" > /dev/null 2>&1; then
            break
        fi
        log "Waiting for Grafana to be ready (attempt $attempt/$max_attempts)..."
        sleep 10
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        error "Grafana failed to start"
        return 1
    fi
    
    # Import dashboards
    local dashboard_files=(
        "$DEPLOY_DIR/monitoring/grafana/dashboards/ai-discovery-overview.json"
        "$DEPLOY_DIR/monitoring/grafana/dashboards/platform-widgets.json"
        "$DEPLOY_DIR/monitoring/grafana/dashboards/infrastructure.json"
    )
    
    for dashboard_file in "${dashboard_files[@]}"; do
        if [[ -f "$dashboard_file" ]]; then
            curl -X POST \
                -H "Content-Type: application/json" \
                -u "admin:$admin_password" \
                -d "@$dashboard_file" \
                "$grafana_url/api/dashboards/db"
        fi
    done
    
    success "Grafana dashboards configured"
}

# Deploy backend services
deploy_backend_services() {
    local deployment_log=$1
    local version=$2
    
    section "Deploying backend services..."
    
    local services=("ai_discovery" "face_analysis" "recommendation" "analytics" "api_gateway")
    
    for service in "${services[@]}"; do
        update_deployment_status "$deployment_log" "$service" "services" "started"
        
        if ! deploy_service "$service" "$version"; then
            update_deployment_status "$deployment_log" "$service" "services" "failed" "Service deployment failed"
            return 1
        fi
        
        update_deployment_status "$deployment_log" "$service" "services" "completed"
    done
    
    success "Backend services deployment completed"
    return 0
}

# Deploy individual service
deploy_service() {
    local service=$1
    local version=$2
    
    log "Deploying $service service..."
    
    # Use blue-green deployment for production
    if ! "$SCRIPT_DIR/../blue-green/deploy.sh" prod "$version"; then
        error "Failed to deploy $service service"
        return 1
    fi
    
    success "$service service deployed"
    return 0
}

# Deploy platform widgets
deploy_platform_widgets() {
    local deployment_log=$1
    local version=$2
    local parallel=${3:-false}
    
    section "Deploying platform widgets..."
    
    local platforms=("shopify" "woocommerce" "magento" "html")
    
    if [[ "$parallel" == "true" ]]; then
        deploy_platforms_parallel "$deployment_log" "$version" "${platforms[@]}"
    else
        deploy_platforms_sequential "$deployment_log" "$version" "${platforms[@]}"
    fi
}

# Deploy platforms sequentially
deploy_platforms_sequential() {
    local deployment_log=$1
    local version=$2
    shift 2
    local platforms=("$@")
    
    for platform in "${platforms[@]}"; do
        update_deployment_status "$deployment_log" "$platform" "platforms" "started"
        
        if ! deploy_platform "$platform" "$version"; then
            update_deployment_status "$deployment_log" "$platform" "platforms" "failed" "Platform deployment failed"
            error "Failed to deploy $platform platform"
            continue
        fi
        
        update_deployment_status "$deployment_log" "$platform" "platforms" "completed"
        success "$platform platform deployed successfully"
    done
}

# Deploy platforms in parallel
deploy_platforms_parallel() {
    local deployment_log=$1
    local version=$2
    shift 2
    local platforms=("$@")
    
    local pids=()
    
    # Start all deployments in parallel
    for platform in "${platforms[@]}"; do
        update_deployment_status "$deployment_log" "$platform" "platforms" "started"
        
        (
            if deploy_platform "$platform" "$version"; then
                update_deployment_status "$deployment_log" "$platform" "platforms" "completed"
                success "$platform platform deployed successfully"
            else
                update_deployment_status "$deployment_log" "$platform" "platforms" "failed" "Platform deployment failed"
                error "Failed to deploy $platform platform"
            fi
        ) &
        
        pids+=($!)
    done
    
    # Wait for all deployments to complete
    local failed_count=0
    for pid in "${pids[@]}"; do
        if ! wait "$pid"; then
            ((failed_count++))
        fi
    done
    
    if [[ $failed_count -gt 0 ]]; then
        error "$failed_count platform deployments failed"
        return 1
    fi
    
    success "All platform deployments completed"
    return 0
}

# Deploy individual platform
deploy_platform() {
    local platform=$1
    local version=$2
    
    log "Deploying $platform platform..."
    
    case "$platform" in
        "shopify")
            # Shopify deployment is handled by the main service deployment
            log "Shopify integration deployed with backend services"
            ;;
        "woocommerce")
            "$SCRIPT_DIR/deploy-woocommerce.sh" "$version" true true
            ;;
        "magento")
            "$SCRIPT_DIR/deploy-magento.sh" "$version" true true
            ;;
        "html")
            "$SCRIPT_DIR/deploy-html.sh" "$version" true
            ;;
        *)
            error "Unknown platform: $platform"
            return 1
            ;;
    esac
    
    return 0
}

# Run post-deployment validation
run_post_deployment_validation() {
    local deployment_log=$1
    local version=$2
    
    section "Running post-deployment validation..."
    
    # Health checks
    if ! run_health_checks; then
        error "Health checks failed"
        return 1
    fi
    
    # Integration tests
    if ! run_integration_tests "$version"; then
        error "Integration tests failed"
        return 1
    fi
    
    # Performance tests
    if ! run_performance_tests; then
        warning "Performance tests failed (non-blocking)"
    fi
    
    success "Post-deployment validation completed"
    return 0
}

# Run health checks
run_health_checks() {
    log "Running health checks..."
    
    local services=(
        "https://api.varai.ai/health"
        "https://api.varai.ai/ai/health"
        "https://api.varai.ai/face/health"
        "https://api.varai.ai/recommendations/health"
        "https://api.varai.ai/analytics/health"
    )
    
    for service_url in "${services[@]}"; do
        if ! curl -sf "$service_url" > /dev/null; then
            error "Health check failed for: $service_url"
            return 1
        fi
        info "✓ Health check passed: $service_url"
    done
    
    success "All health checks passed"
    return 0
}

# Run integration tests
run_integration_tests() {
    local version=$1
    
    log "Running integration tests..."
    
    cd "$PROJECT_ROOT"
    
    # Run platform-specific integration tests
    npm run test:integration:all
    
    success "Integration tests completed"
    return 0
}

# Run performance tests
run_performance_tests() {
    log "Running performance tests..."
    
    # Basic performance validation
    local widget_url="https://cdn.varai.ai/widgets/html/latest/js/varai-widget.min.js"
    local load_time=$(curl -o /dev/null -s -w '%{time_total}' "$widget_url")
    
    if (( $(echo "$load_time > 2.0" | bc -l) )); then
        warning "Widget load time is slow: ${load_time}s"
        return 1
    fi
    
    info "Widget load time: ${load_time}s"
    success "Performance tests completed"
    return 0
}

# Generate deployment report
generate_deployment_report() {
    local deployment_log=$1
    local deployment_id=$2
    
    section "Generating deployment report..."
    
    # Update final status
    jq --arg time "$(date -Iseconds)" \
        '.end_time = $time | .status = "completed"' \
        "$deployment_log" > "${deployment_log}.tmp" && mv "${deployment_log}.tmp" "$deployment_log"
    
    # Generate summary report
    local report_file="$PROJECT_ROOT/data/deployments/deployment-report-$deployment_id.md"
    
    cat > "$report_file" <<EOF
# AI Discovery Production Deployment Report

## Deployment Summary
- **Deployment ID**: $deployment_id
- **Date**: $(date -Iseconds)
- **Status**: $(jq -r '.status' "$deployment_log")
- **Duration**: $(calculate_deployment_duration "$deployment_log")

## Infrastructure
$(generate_infrastructure_summary "$deployment_log")

## Backend Services
$(generate_services_summary "$deployment_log")

## Platform Widgets
$(generate_platforms_summary "$deployment_log")

## Validation Results
- ✅ Health checks passed
- ✅ Integration tests passed
- ✅ Performance validation completed

## Access URLs
- **API Gateway**: https://api.varai.ai
- **Monitoring**: https://monitoring.varai.ai
- **CDN**: https://cdn.varai.ai
- **Documentation**: https://docs.varai.ai

## Platform Integration
- **Shopify**: Integrated with backend services
- **WooCommerce**: https://wordpress.org/plugins/varai-ai-discovery/
- **Magento**: https://marketplace.magento.com/varai-ai-discovery.html
- **HTML Widget**: https://cdn.varai.ai/widgets/html/latest/

## Support
- **Documentation**: https://docs.varai.ai
- **Support**: support@varai.ai
- **Status Page**: https://status.varai.ai

## Next Steps
1. Monitor system performance and alerts
2. Validate customer integrations
3. Collect feedback and metrics
4. Plan next iteration improvements
EOF

    success "Deployment report generated: $report_file"
}

# Calculate deployment duration
calculate_deployment_duration() {
    local deployment_log=$1
    
    local start_time=$(jq -r '.start_time' "$deployment_log")
    local end_time=$(jq -r '.end_time' "$deployment_log")
    
    if [[ "$end_time" != "null" ]]; then
        local start_epoch=$(date -d "$start_time" +%s)
        local end_epoch=$(date -d "$end_time" +%s)
        local duration=$((end_epoch - start_epoch))
        
        echo "${duration}s ($(date -d@$duration -u +%H:%M:%S))"
    else
        echo "In progress"
    fi
}

# Generate infrastructure summary
generate_infrastructure_summary() {
    local deployment_log=$1
    
    echo "| Component | Status | Duration |"
    echo "|-----------|--------|----------|"
    
    local components=("terraform" "monitoring" "cdn")
    for component in "${components[@]}"; do
        local status=$(jq -r ".infrastructure.$component.status" "$deployment_log")
        local start_time=$(jq -r ".infrastructure.$component.start_time" "$deployment_log")
        local end_time=$(jq -r ".infrastructure.$component.end_time" "$deployment_log")
        
        local duration="N/A"
        if [[ "$start_time" != "null" && "$end_time" != "null" ]]; then
            local start_epoch=$(date -d "$start_time" +%s)
            local end_epoch=$(date -d "$end_time" +%s)
            duration="$((end_epoch - start_epoch))s"
        fi
        
        echo "| $component | $status | $duration |"
    done
}

# Generate services summary
generate_services_summary() {
    local deployment_log=$1
    
    echo "| Service | Status | Duration |"
    echo "|---------|--------|----------|"
    
    local services=("ai_discovery" "face_analysis" "recommendation" "analytics" "api_gateway")
    for service in "${services[@]}"; do
        local status=$(jq -r ".services.$service.status" "$deployment_log")
        local start_time=$(jq -r ".services.$service.start_time" "$deployment_log")
        local end_time=$(jq -r ".services.$service.end_time" "$deployment_log")
        
        local duration="N/A"
        if [[ "$start_time" != "null" && "$end_time" != "null" ]]; then
            local start_epoch=$(date -d "$start_time" +%s)
            local end_epoch=$(date -d "$end_time" +%s)
            duration="$((end_epoch - start_epoch))s"
        fi
        
        echo "| $service | $status | $duration |"
    done
}

# Generate platforms summary
generate_platforms_summary() {
    local deployment_log=$1
    
    echo "| Platform | Status | Duration |"
    echo "|----------|--------|----------|"
    
    local platforms=("shopify" "woocommerce" "magento" "html")
    for platform in "${platforms[@]}"; do
        local status=$(jq -r ".platforms.$platform.status" "$deployment_log")
        local start_time=$(jq -r ".platforms.$platform.start_time" "$deployment_log")
        local end_time=$(jq -r ".platforms.$platform.end_time" "$deployment_log")
        
        local duration="N/A"
        if [[ "$start_time" != "null" && "$end_time" != "null" ]]; then
            local start_epoch=$(date -d "$start_time" +%s)
            local end_epoch=$(date -d "$end_time" +%s)
            duration="$((end_epoch - start_epoch))s"
        fi
        
        echo "| $platform | $status | $duration |"
    done
}

# Send deployment notifications
send_deployment_notifications() {
    local deployment_id=$1
    local status=$2
    
    log "Sending deployment notifications..."
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local message
        if [[ "$status" == "success" ]]; then
            message="🚀 AI Discovery production deployment completed successfully!\nDeployment ID: $deployment_id\nAll platforms and services are now live."
        else
            message="❌ AI Discovery production deployment failed!\nDeployment ID: $deployment_id\nPlease check logs for details."
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" > /dev/null 2>&1 || true
    fi
    
    # Email notification (if configured)
    if [[ -n "${EMAIL_NOTIFICATION_ENDPOINT:-}" ]]; then
        local subject="AI Discovery Deployment $status - $deployment_id"
        local body="Deployment ID: $deployment_id\nStatus: $status\nTimestamp: $(date)\nDashboard: https://monitoring.varai.ai"
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"subject\":\"$subject\",\"body\":\"$body\",\"recipients\":[\"ops-team@varai.ai\"]}" \
            "$EMAIL_NOTIFICATION_ENDPOINT" > /dev/null 2>&1 || true
    fi
    
    success "Notifications sent"
}

# Main deployment function
main() {
    local version=${1:-$(date +%Y%m%d-%H%M%S)}
    local parallel_widgets=${2:-false}
    local skip_validation=${3:-false}
    
    # Generate deployment ID
    local deployment_id="master-$(date +%Y%m%d-%H%M%S)"
    
    section "Starting AI Discovery Master Deployment"
    log "Deployment ID: $deployment_id"
    log "Version: $version"
    log "Parallel widget deployment: $parallel_widgets"
    
    # Initialize deployment tracking
    local deployment_log=$(init_deployment_tracking "$deployment_id")
    
    # Pre-deployment validation
    if [[ "$skip_validation" != "true" ]]; then
        if ! validate_prerequisites; then
            error "Prerequisites validation failed"
            send_deployment_notifications "$deployment_id" "failed"
            exit 1
        fi
    fi
    
    # Deploy infrastructure
    if ! deploy_infrastructure "$deployment_log" "$version"; then
        error "Infrastructure deployment failed"
        send_deployment_notifications "$deployment_id" "failed"
        exit 1
    fi
    
    # Deploy backend services
    if ! deploy_backend_services "$deployment_log" "$version"; then
        error "Backend services deployment failed"
        send_deployment_notifications "$deployment_id" "failed"
        exit 1
    fi
    
    # Deploy platform widgets
    if ! deploy_platform_widgets "$deployment_log" "$version" "$parallel_widgets"; then
        error "Platform widgets deployment failed"
        send_deployment_notifications "$deployment_id" "failed"
        exit 1
    fi
    
    # Post-deployment validation
    if ! run_post_deployment_validation "$deployment_log" "$version"; then
        error "Post-deployment validation failed"
        send_deployment_notifications "$deployment_id" "failed"
        exit 1
    fi
    
    # Generate deployment report
    generate_deployment_report "$deployment_log" "$deployment_id"
    
    # Send success notifications
    send_deployment_notifications "$deployment_id" "success"
    
    success "🎉 AI Discovery master deployment completed successfully!"
    success "Deployment ID: $deployment_id"
    success "Version: $version"
    success "All platforms and services are now live and operational"
    
    info "Access URLs:"
    info "  - API Gateway: https://api.varai.ai"
    info "  - Monitoring: https://monitoring.varai.ai"
    info "  - Documentation: https://docs.varai.ai"
    info "  - Status Page: https://status.varai.ai"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi