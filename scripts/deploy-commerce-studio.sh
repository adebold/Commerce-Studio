#!/bin/bash

# Commerce Studio Master Deployment Script
# Orchestrates all deployment phases for complete Commerce Studio deployment

set -euo pipefail

# Configuration
PROJECT_ID="${PROJECT_ID:-ml-datadriven-recos}"
REGION="${REGION:-us-central1}"
ENVIRONMENT="${ENVIRONMENT:-staging}"
NOTIFICATION_EMAIL="${NOTIFICATION_EMAIL:-alerts@commerce-studio.com}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_phase() {
    echo -e "${PURPLE}[PHASE]${NC} $1"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Phase tracking
CURRENT_PHASE=0
TOTAL_PHASES=10
FAILED_PHASES=()

# Record phase result
record_phase() {
    local phase_name="$1"
    local result="$2"
    
    if [[ "$result" == "SUCCESS" ]]; then
        log_success "Phase completed: $phase_name"
    else
        log_error "Phase failed: $phase_name"
        FAILED_PHASES+=("$phase_name")
    fi
}

# Display banner
display_banner() {
    echo ""
    echo "=========================================="
    echo "    COMMERCE STUDIO DEPLOYMENT SUITE"
    echo "=========================================="
    echo ""
    echo "Project ID: $PROJECT_ID"
    echo "Region: $REGION"
    echo "Environment: $ENVIRONMENT"
    echo "Deployment Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_phase "Prerequisites Check"
    
    # Check if gcloud is installed
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
    local current_project=$(gcloud config get-value project 2>/dev/null || echo "")
    if [[ "$current_project" != "$PROJECT_ID" ]]; then
        log_warning "Setting project to $PROJECT_ID"
        gcloud config set project "$PROJECT_ID"
    fi
    
    # Check if required scripts exist
    local required_scripts=(
        "scripts/migrate-to-secret-manager.sh"
        "scripts/deploy-to-staging.sh"
        "scripts/test-end-to-end.sh"
        "scripts/setup-monitoring.sh"
        "scripts/final-validation.sh"
        "scripts/production-readiness-assessment.sh"
    )
    
    for script in "${required_scripts[@]}"; do
        if [[ ! -f "$script" ]]; then
            log_error "Required script not found: $script"
            exit 1
        fi
        chmod +x "$script"
    done
    
    log_success "Prerequisites check completed"
}

# Phase 1-5: Infrastructure Setup (assumed completed)
setup_infrastructure() {
    log_phase "Phase 1-5: Infrastructure Setup"
    log_info "Assuming infrastructure phases 1-5 are completed:"
    log_info "  ✓ Phase 1: GCP Project Setup"
    log_info "  ✓ Phase 2: Network & Security Configuration"
    log_info "  ✓ Phase 3: Database Infrastructure"
    log_info "  ✓ Phase 4: Container Registry & Build Pipeline"
    log_info "  ✓ Phase 5: Secret Manager Configuration"
    
    # Verify Secret Manager setup
    log_step "Verifying Secret Manager configuration..."
    if ./scripts/migrate-to-secret-manager.sh; then
        record_phase "Infrastructure Setup" "SUCCESS"
    else
        record_phase "Infrastructure Setup" "FAILED"
        return 1
    fi
}

# Phase 6: Application Build & Deployment
deploy_applications() {
    ((CURRENT_PHASE++))
    log_phase "Phase $CURRENT_PHASE/$TOTAL_PHASES: Application Build & Deployment"
    
    log_step "Building and deploying Commerce Studio services..."
    if ./scripts/deploy-to-staging.sh; then
        record_phase "Application Build & Deployment" "SUCCESS"
    else
        record_phase "Application Build & Deployment" "FAILED"
        return 1
    fi
}

# Phase 7: Service Integration & Testing
test_integration() {
    ((CURRENT_PHASE++))
    log_phase "Phase $CURRENT_PHASE/$TOTAL_PHASES: Service Integration & Testing"
    
    log_step "Running end-to-end integration tests..."
    if ./scripts/test-end-to-end.sh; then
        record_phase "Service Integration & Testing" "SUCCESS"
    else
        record_phase "Service Integration & Testing" "FAILED"
        return 1
    fi
}

# Phase 8: Monitoring & Observability Setup
setup_monitoring() {
    ((CURRENT_PHASE++))
    log_phase "Phase $CURRENT_PHASE/$TOTAL_PHASES: Monitoring & Observability Setup"
    
    log_step "Configuring monitoring, alerting, and observability..."
    if NOTIFICATION_EMAIL="$NOTIFICATION_EMAIL" ./scripts/setup-monitoring.sh; then
        record_phase "Monitoring & Observability Setup" "SUCCESS"
    else
        record_phase "Monitoring & Observability Setup" "FAILED"
        return 1
    fi
}

# Phase 9: Final Validation & Documentation
final_validation() {
    ((CURRENT_PHASE++))
    log_phase "Phase $CURRENT_PHASE/$TOTAL_PHASES: Final Validation & Documentation"
    
    log_step "Running comprehensive validation and generating documentation..."
    if ./scripts/final-validation.sh; then
        record_phase "Final Validation & Documentation" "SUCCESS"
    else
        record_phase "Final Validation & Documentation" "FAILED"
        return 1
    fi
}

# Phase 10: Production Readiness Assessment
production_readiness() {
    ((CURRENT_PHASE++))
    log_phase "Phase $CURRENT_PHASE/$TOTAL_PHASES: Production Readiness Assessment"
    
    log_step "Conducting production readiness assessment..."
    local assessment_result=0
    ./scripts/production-readiness-assessment.sh || assessment_result=$?
    
    if [[ $assessment_result -eq 0 ]]; then
        record_phase "Production Readiness Assessment" "SUCCESS"
        log_success "✅ Commerce Studio is READY FOR PRODUCTION!"
    elif [[ $assessment_result -eq 1 ]]; then
        record_phase "Production Readiness Assessment" "SUCCESS"
        log_warning "⚠️ Commerce Studio is CONDITIONALLY READY for production"
    else
        record_phase "Production Readiness Assessment" "FAILED"
        log_error "❌ Commerce Studio is NOT READY for production"
        return 1
    fi
}

# Generate deployment summary
generate_deployment_summary() {
    log_info "Generating deployment summary..."
    
    local deployment_dir="./deployment-summary-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$deployment_dir"
    
    cat > "$deployment_dir/deployment-summary.md" << EOF
# Commerce Studio Deployment Summary

## Deployment Information
- **Project ID**: $PROJECT_ID
- **Environment**: $ENVIRONMENT
- **Region**: $REGION
- **Deployment Date**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- **Deployment Duration**: $SECONDS seconds

## Phase Results
$(for i in $(seq 1 $CURRENT_PHASE); do
    case $i in
        1) echo "- Phase $i: Infrastructure Setup - $(if [[ " ${FAILED_PHASES[@]} " =~ " Infrastructure Setup " ]]; then echo "FAILED"; else echo "SUCCESS"; fi)" ;;
        2) echo "- Phase $i: Application Build & Deployment - $(if [[ " ${FAILED_PHASES[@]} " =~ " Application Build & Deployment " ]]; then echo "FAILED"; else echo "SUCCESS"; fi)" ;;
        3) echo "- Phase $i: Service Integration & Testing - $(if [[ " ${FAILED_PHASES[@]} " =~ " Service Integration & Testing " ]]; then echo "FAILED"; else echo "SUCCESS"; fi)" ;;
        4) echo "- Phase $i: Monitoring & Observability Setup - $(if [[ " ${FAILED_PHASES[@]} " =~ " Monitoring & Observability Setup " ]]; then echo "FAILED"; else echo "SUCCESS"; fi)" ;;
        5) echo "- Phase $i: Final Validation & Documentation - $(if [[ " ${FAILED_PHASES[@]} " =~ " Final Validation & Documentation " ]]; then echo "FAILED"; else echo "SUCCESS"; fi)" ;;
        6) echo "- Phase $i: Production Readiness Assessment - $(if [[ " ${FAILED_PHASES[@]} " =~ " Production Readiness Assessment " ]]; then echo "FAILED"; else echo "SUCCESS"; fi)" ;;
    esac
done)

## Service URLs
$(if gcloud run services describe commerce-studio-api --region="$REGION" --format="value(status.url)" &>/dev/null; then
    echo "- **API Service**: $(gcloud run services describe commerce-studio-api --region="$REGION" --format="value(status.url)")"
fi)
$(if gcloud run services describe commerce-studio-auth --region="$REGION" --format="value(status.url)" &>/dev/null; then
    echo "- **Auth Service**: $(gcloud run services describe commerce-studio-auth --region="$REGION" --format="value(status.url)")"
fi)
$(if gcloud run services describe commerce-studio-frontend --region="$REGION" --format="value(status.url)" &>/dev/null; then
    echo "- **Frontend Service**: $(gcloud run services describe commerce-studio-frontend --region="$REGION" --format="value(status.url)")"
fi)

## Failed Phases
$(if [[ ${#FAILED_PHASES[@]} -eq 0 ]]; then
    echo "None - All phases completed successfully!"
else
    for phase in "${FAILED_PHASES[@]}"; do
        echo "- $phase"
    done
fi)

## Next Steps
$(if [[ ${#FAILED_PHASES[@]} -eq 0 ]]; then
    echo "1. Review production readiness assessment"
    echo "2. Obtain stakeholder approvals"
    echo "3. Schedule production deployment"
    echo "4. Monitor system performance"
else
    echo "1. Address failed phases listed above"
    echo "2. Re-run deployment for failed components"
    echo "3. Validate fixes before proceeding"
    echo "4. Complete production readiness assessment"
fi)

## Documentation
- Deployment logs: Available in Cloud Logging
- Architecture documentation: ./deployment-docs/architecture/
- Security documentation: ./deployment-docs/security/
- Operations runbook: ./deployment-docs/operations/
- Monitoring setup: ./deployment-docs/monitoring/
- Production readiness: ./production-readiness/

## Support
- Deployment team: [Your team contact]
- Operations team: [Operations contact]
- Emergency contact: [Emergency contact]
EOF
    
    log_success "Deployment summary generated: $deployment_dir/deployment-summary.md"
}

# Cleanup function
cleanup() {
    log_info "Performing cleanup..."
    # Remove temporary files if any
    rm -f /tmp/commerce-studio-* 2>/dev/null || true
}

# Error handler
error_handler() {
    local exit_code=$?
    log_error "Deployment failed with exit code $exit_code"
    cleanup
    exit $exit_code
}

# Set error trap
trap error_handler ERR

# Main deployment function
main() {
    local start_time=$(date +%s)
    
    display_banner
    check_prerequisites
    
    # Execute deployment phases
    setup_infrastructure
    deploy_applications
    test_integration
    setup_monitoring
    final_validation
    production_readiness
    
    # Generate summary
    generate_deployment_summary
    cleanup
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo "=========================================="
    echo "         DEPLOYMENT COMPLETED"
    echo "=========================================="
    echo ""
    echo "Total Duration: $duration seconds"
    echo "Phases Completed: $CURRENT_PHASE/$TOTAL_PHASES"
    echo "Failed Phases: ${#FAILED_PHASES[@]}"
    echo ""
    
    if [[ ${#FAILED_PHASES[@]} -eq 0 ]]; then
        log_success "🎉 Commerce Studio deployment completed successfully!"
        echo ""
        echo "Your Commerce Studio platform is now deployed and ready!"
        echo ""
        echo "Access your services:"
        if gcloud run services describe commerce-studio-frontend --region="$REGION" --format="value(status.url)" &>/dev/null; then
            echo "  Frontend: $(gcloud run services describe commerce-studio-frontend --region="$REGION" --format="value(status.url)")"
        fi
        if gcloud run services describe commerce-studio-api --region="$REGION" --format="value(status.url)" &>/dev/null; then
            echo "  API: $(gcloud run services describe commerce-studio-api --region="$REGION" --format="value(status.url)")"
        fi
        echo ""
        echo "Monitor your deployment:"
        echo "  https://console.cloud.google.com/monitoring/dashboards?project=$PROJECT_ID"
        echo ""
        return 0
    else
        log_error "❌ Deployment completed with errors"
        echo ""
        echo "Failed phases:"
        for phase in "${FAILED_PHASES[@]}"; do
            echo "  - $phase"
        done
        echo ""
        echo "Please review the logs and address the issues before proceeding."
        return 1
    fi
}

# Show usage information
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --project PROJECT_ID    GCP Project ID (default: ml-datadriven-recos)"
    echo "  -r, --region REGION         GCP Region (default: us-central1)"
    echo "  -e, --environment ENV       Environment (default: staging)"
    echo "  -n, --notification EMAIL    Notification email (default: alerts@commerce-studio.com)"
    echo "  -h, --help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                          # Deploy with defaults"
    echo "  $0 -p my-project -r us-west1              # Deploy to specific project/region"
    echo "  $0 -e production -n ops@company.com       # Deploy to production"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--project)
            PROJECT_ID="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -n|--notification)
            NOTIFICATION_EMAIL="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Export environment variables for child scripts
export PROJECT_ID REGION ENVIRONMENT NOTIFICATION_EMAIL

# Run main function
main "$@"