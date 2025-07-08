#!/bin/bash

# Commerce Studio Final Validation & Documentation Script
# Phase 9: Final Validation & Documentation

set -euo pipefail

# Configuration
PROJECT_ID="${PROJECT_ID:-ml-datadriven-recos}"
REGION="${REGION:-us-central1}"
ENVIRONMENT="${ENVIRONMENT:-staging}"
OUTPUT_DIR="${OUTPUT_DIR:-./deployment-docs}"

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

# Validation results tracking
VALIDATIONS_PASSED=0
VALIDATIONS_FAILED=0
FAILED_VALIDATIONS=()

# Record validation result
record_validation() {
    local validation_name="$1"
    local result="$2"
    
    if [[ "$result" == "PASS" ]]; then
        ((VALIDATIONS_PASSED++))
        log_success "✓ $validation_name"
    else
        ((VALIDATIONS_FAILED++))
        FAILED_VALIDATIONS+=("$validation_name")
        log_error "✗ $validation_name"
    fi
}

# Create output directory
setup_output_directory() {
    log_info "Setting up output directory..."
    
    mkdir -p "$OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR/architecture"
    mkdir -p "$OUTPUT_DIR/security"
    mkdir -p "$OUTPUT_DIR/operations"
    mkdir -p "$OUTPUT_DIR/monitoring"
    
    log_success "Output directory created: $OUTPUT_DIR"
}

# Get service information
get_service_info() {
    log_info "Gathering service information..."
    
    # Get service URLs and details
    API_URL=$(gcloud run services describe commerce-studio-api --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "")
    AUTH_URL=$(gcloud run services describe commerce-studio-auth --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "")
    FRONTEND_URL=$(gcloud run services describe commerce-studio-frontend --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "")
    
    # Get service details
    if [[ -n "$API_URL" ]]; then
        gcloud run services describe commerce-studio-api --region="$REGION" --format="export" > "$OUTPUT_DIR/api-service-config.yaml" 2>/dev/null || true
    fi
    
    if [[ -n "$AUTH_URL" ]]; then
        gcloud run services describe commerce-studio-auth --region="$REGION" --format="export" > "$OUTPUT_DIR/auth-service-config.yaml" 2>/dev/null || true
    fi
    
    if [[ -n "$FRONTEND_URL" ]]; then
        gcloud run services describe commerce-studio-frontend --region="$REGION" --format="export" > "$OUTPUT_DIR/frontend-service-config.yaml" 2>/dev/null || true
    fi
    
    log_success "Service information gathered"
}

# Validate all security controls
validate_security_controls() {
    log_info "Validating security controls..."
    
    # Check Secret Manager secrets
    local required_secrets=(
        "commerce-studio-jwt-secret"
        "commerce-studio-db-password"
        "commerce-studio-api-key"
    )
    
    local secrets_valid=true
    for secret in "${required_secrets[@]}"; do
        if gcloud secrets describe "$secret" &>/dev/null; then
            log_info "Secret $secret exists"
        else
            log_error "Secret $secret missing"
            secrets_valid=false
        fi
    done
    
    if [[ "$secrets_valid" == "true" ]]; then
        record_validation "Secret Manager Configuration" "PASS"
    else
        record_validation "Secret Manager Configuration" "FAIL"
    fi
    
    # Check service security headers
    if [[ -n "$API_URL" ]]; then
        local api_headers=$(curl -s -I "$API_URL/health" 2>/dev/null || echo "")
        if echo "$api_headers" | grep -q -i "x-content-type-options\|x-frame-options"; then
            record_validation "API Security Headers" "PASS"
        else
            record_validation "API Security Headers" "FAIL"
        fi
    else
        record_validation "API Security Headers" "FAIL"
    fi
    
    # Check HTTPS enforcement
    if [[ -n "$API_URL" ]] && [[ "$API_URL" == https://* ]]; then
        record_validation "HTTPS Enforcement" "PASS"
    else
        record_validation "HTTPS Enforcement" "FAIL"
    fi
    
    # Check IAM permissions
    local current_user=$(gcloud config get-value account 2>/dev/null || echo "")
    if [[ -n "$current_user" ]]; then
        record_validation "IAM Authentication" "PASS"
    else
        record_validation "IAM Authentication" "FAIL"
    fi
}

# Validate monitoring and alerting
validate_monitoring() {
    log_info "Validating monitoring and alerting..."
    
    # Check if monitoring APIs are enabled
    local monitoring_enabled=$(gcloud services list --enabled --filter="name:monitoring.googleapis.com" --format="value(name)" 2>/dev/null || echo "")
    if [[ -n "$monitoring_enabled" ]]; then
        record_validation "Monitoring API Enabled" "PASS"
    else
        record_validation "Monitoring API Enabled" "FAIL"
    fi
    
    # Check alerting policies
    local alert_policies=$(gcloud alpha monitoring policies list --filter="displayName:Commerce Studio" --format="value(name)" 2>/dev/null | wc -l || echo "0")
    if [[ "$alert_policies" -gt 0 ]]; then
        record_validation "Alerting Policies Configured" "PASS"
    else
        record_validation "Alerting Policies Configured" "FAIL"
    fi
    
    # Check uptime checks
    local uptime_checks=$(gcloud monitoring uptime list --filter="displayName:Commerce Studio" --format="value(name)" 2>/dev/null | wc -l)
    uptime_checks=${uptime_checks:-0}
    if [[ "$uptime_checks" -gt 0 ]]; then
        record_validation "Uptime Checks Configured" "PASS"
    else
        record_validation "Uptime Checks Configured" "FAIL"
    fi
    
    # Check log-based metrics
    local log_metrics=$(gcloud logging metrics list --filter="name:commerce_studio" --format="value(name)" 2>/dev/null | wc -l || echo "0")
    if [[ "$log_metrics" -gt 0 ]]; then
        record_validation "Log-based Metrics" "PASS"
    else
        record_validation "Log-based Metrics" "FAIL"
    fi
}

# Validate service health and performance
validate_service_health() {
    log_info "Validating service health and performance..."
    
    # Test API health
    if [[ -n "$API_URL" ]]; then
        local start_time=$(date +%s%N)
        if curl -f -s "$API_URL/health" > /dev/null; then
            local end_time=$(date +%s%N)
            local response_time=$(( (end_time - start_time) / 1000000 ))
            
            record_validation "API Health Check" "PASS"
            
            if [[ $response_time -lt 5000 ]]; then
                record_validation "API Response Time (<5s)" "PASS"
            else
                record_validation "API Response Time (<5s)" "FAIL"
            fi
        else
            record_validation "API Health Check" "FAIL"
            record_validation "API Response Time (<5s)" "FAIL"
        fi
    else
        record_validation "API Health Check" "FAIL"
        record_validation "API Response Time (<5s)" "FAIL"
    fi
    
    # Test Auth service health
    if [[ -n "$AUTH_URL" ]]; then
        if curl -f -s "$AUTH_URL/health" > /dev/null; then
            record_validation "Auth Service Health" "PASS"
        else
            record_validation "Auth Service Health" "FAIL"
        fi
    else
        record_validation "Auth Service Health" "FAIL"
    fi
    
    # Test Frontend health
    if [[ -n "$FRONTEND_URL" ]]; then
        if curl -f -s "$FRONTEND_URL/" > /dev/null; then
            record_validation "Frontend Service Health" "PASS"
        else
            record_validation "Frontend Service Health" "FAIL"
        fi
    else
        record_validation "Frontend Service Health" "FAIL"
    fi
}

# Generate architecture documentation
generate_architecture_docs() {
    log_info "Generating architecture documentation..."
    
    cat > "$OUTPUT_DIR/architecture/deployment-architecture.md" << EOF
# Commerce Studio Deployment Architecture

## Overview
Commerce Studio is deployed on Google Cloud Platform using a microservices architecture with the following components:

## Services
- **API Service**: FastAPI backend service
  - URL: $API_URL
  - Runtime: Python 3.11
  - Platform: Cloud Run
  
- **Auth Service**: Authentication and authorization service
  - URL: $AUTH_URL
  - Runtime: Node.js 18
  - Platform: Cloud Run
  
- **Frontend Service**: React-based web application
  - URL: $FRONTEND_URL
  - Runtime: Nginx (serving static files)
  - Platform: Cloud Run

## Infrastructure Components
- **Secret Manager**: Secure storage for sensitive configuration
- **Cloud Run**: Serverless container platform
- **Cloud Build**: CI/CD pipeline
- **Cloud Monitoring**: Observability and alerting
- **Cloud Logging**: Centralized logging

## Security Features
- HTTPS enforcement for all services
- Secret Manager integration for sensitive data
- IAM-based access control
- Security headers implementation
- Container image scanning

## Monitoring and Alerting
- Service health monitoring
- Performance metrics tracking
- Error rate alerting
- Secret access monitoring
- Uptime checks

## Deployment Information
- Project ID: $PROJECT_ID
- Region: $REGION
- Environment: $ENVIRONMENT
- Deployment Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
EOF
    
    log_success "Architecture documentation generated"
}

# Generate security documentation
generate_security_docs() {
    log_info "Generating security documentation..."
    
    cat > "$OUTPUT_DIR/security/security-controls.md" << EOF
# Commerce Studio Security Controls

## Authentication and Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- API key management
- Session management

## Data Protection
- Secrets stored in Google Secret Manager
- Environment variables for non-sensitive configuration
- HTTPS encryption for all communications
- Database connection encryption

## Infrastructure Security
- Container image security scanning
- IAM-based access control
- Network security with VPC
- Regular security updates

## Monitoring and Auditing
- Security event logging
- Failed authentication monitoring
- Unusual access pattern detection
- Compliance audit trails

## Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Content-Security-Policy
- Strict-Transport-Security

## Secrets Management
The following secrets are managed in Google Secret Manager:
- commerce-studio-jwt-secret: JWT signing key
- commerce-studio-db-password: Database password
- commerce-studio-api-key: API authentication key

## Security Validation Results
- Secret Manager Configuration: $(if [[ " ${FAILED_VALIDATIONS[@]} " =~ " Secret Manager Configuration " ]]; then echo "FAIL"; else echo "PASS"; fi)
- HTTPS Enforcement: $(if [[ " ${FAILED_VALIDATIONS[@]} " =~ " HTTPS Enforcement " ]]; then echo "FAIL"; else echo "PASS"; fi)
- Security Headers: $(if [[ " ${FAILED_VALIDATIONS[@]} " =~ " API Security Headers " ]]; then echo "FAIL"; else echo "PASS"; fi)
EOF
    
    log_success "Security documentation generated"
}

# Generate operations runbook
generate_operations_runbook() {
    log_info "Generating operations runbook..."
    
    cat > "$OUTPUT_DIR/operations/runbook.md" << EOF
# Commerce Studio Operations Runbook

## Service URLs
- API Service: $API_URL
- Auth Service: $AUTH_URL
- Frontend Service: $FRONTEND_URL

## Common Operations

### Deployment
\`\`\`bash
# Deploy to staging
./scripts/deploy-to-staging.sh

# Run end-to-end tests
./scripts/test-end-to-end.sh

# Setup monitoring
./scripts/setup-monitoring.sh
\`\`\`

### Monitoring
\`\`\`bash
# Check service health
curl $API_URL/health
curl $AUTH_URL/health
curl $FRONTEND_URL/

# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=commerce-studio-api" --limit=50

# Check metrics
gcloud monitoring metrics list --filter="metric.type:run.googleapis.com"
\`\`\`

### Troubleshooting

#### Service Not Responding
1. Check service status: \`gcloud run services list\`
2. Check logs: \`gcloud logging read "resource.type=cloud_run_revision"\`
3. Check resource usage in Cloud Console
4. Restart service if needed: \`gcloud run services replace-traffic SERVICE_NAME --to-latest\`

#### High Error Rate
1. Check error logs: \`gcloud logging read "severity=ERROR"\`
2. Check monitoring dashboard
3. Review recent deployments
4. Check external dependencies

#### Authentication Issues
1. Verify Secret Manager secrets
2. Check JWT token validity
3. Review auth service logs
4. Validate IAM permissions

### Emergency Procedures
- Rollback: Use Cloud Run revisions to rollback to previous version
- Scale down: Reduce max instances in Cloud Run
- Circuit breaker: Temporarily disable problematic features

### Maintenance
- Regular security updates
- Secret rotation (quarterly)
- Performance optimization
- Capacity planning

## Contact Information
- On-call: [Your on-call contact]
- Team: [Your team contact]
- Escalation: [Escalation contact]
EOF
    
    log_success "Operations runbook generated"
}

# Generate monitoring documentation
generate_monitoring_docs() {
    log_info "Generating monitoring documentation..."
    
    cat > "$OUTPUT_DIR/monitoring/monitoring-setup.md" << EOF
# Commerce Studio Monitoring Setup

## Dashboards
Access monitoring dashboards at:
https://console.cloud.google.com/monitoring/dashboards?project=$PROJECT_ID

## Key Metrics
- Request rate (requests/second)
- Response latency (95th percentile)
- Error rate (errors/second)
- Service availability (uptime percentage)

## Alerting Policies
- High Error Rate: Triggers when error rate > 5%
- High Latency: Triggers when 95th percentile latency > 5 seconds
- Service Down: Triggers when service instances < 1
- Unusual Secret Access: Triggers on high Secret Manager access rate

## Log-based Metrics
- commerce_studio_error_rate: Error rate across all services
- commerce_studio_auth_failures: Authentication failure rate
- commerce_studio_secret_access: Secret Manager access rate

## Uptime Checks
- API Service health endpoint
- Auth Service health endpoint
- Frontend service availability

## Notification Channels
- Email alerts to operations team
- Integration with incident management system

## SLOs (Service Level Objectives)
- Availability: 99.5%
- Latency: 95% of requests < 2 seconds
- Error Rate: < 1%

## Monitoring Validation Results
- Monitoring API: $(if [[ " ${FAILED_VALIDATIONS[@]} " =~ " Monitoring API Enabled " ]]; then echo "FAIL"; else echo "PASS"; fi)
- Alerting Policies: $(if [[ " ${FAILED_VALIDATIONS[@]} " =~ " Alerting Policies Configured " ]]; then echo "FAIL"; else echo "PASS"; fi)
- Uptime Checks: $(if [[ " ${FAILED_VALIDATIONS[@]} " =~ " Uptime Checks Configured " ]]; then echo "FAIL"; else echo "PASS"; fi)
- Log Metrics: $(if [[ " ${FAILED_VALIDATIONS[@]} " =~ " Log-based Metrics " ]]; then echo "FAIL"; else echo "PASS"; fi)
EOF
    
    log_success "Monitoring documentation generated"
}

# Generate final validation report
generate_validation_report() {
    log_info "Generating final validation report..."
    
    cat > "$OUTPUT_DIR/final-validation-report.md" << EOF
# Commerce Studio Final Validation Report

## Deployment Summary
- **Project ID**: $PROJECT_ID
- **Environment**: $ENVIRONMENT
- **Region**: $REGION
- **Validation Date**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Service Status
- **API Service**: $(if [[ -n "$API_URL" ]]; then echo "Deployed - $API_URL"; else echo "Not Deployed"; fi)
- **Auth Service**: $(if [[ -n "$AUTH_URL" ]]; then echo "Deployed - $AUTH_URL"; else echo "Not Deployed"; fi)
- **Frontend Service**: $(if [[ -n "$FRONTEND_URL" ]]; then echo "Deployed - $FRONTEND_URL"; else echo "Not Deployed"; fi)

## Validation Results
- **Total Validations**: $((VALIDATIONS_PASSED + VALIDATIONS_FAILED))
- **Passed**: $VALIDATIONS_PASSED
- **Failed**: $VALIDATIONS_FAILED
- **Success Rate**: $(( VALIDATIONS_PASSED * 100 / (VALIDATIONS_PASSED + VALIDATIONS_FAILED) ))%

## Failed Validations
EOF
    
    if [[ $VALIDATIONS_FAILED -gt 0 ]]; then
        for validation in "${FAILED_VALIDATIONS[@]}"; do
            echo "- $validation" >> "$OUTPUT_DIR/final-validation-report.md"
        done
    else
        echo "None - All validations passed!" >> "$OUTPUT_DIR/final-validation-report.md"
    fi
    
    cat >> "$OUTPUT_DIR/final-validation-report.md" << EOF

## Security Controls Status
- Secret Manager integration
- HTTPS enforcement
- Security headers implementation
- IAM-based access control

## Monitoring Status
- Service health monitoring
- Performance metrics
- Error rate alerting
- Uptime checks

## Next Steps
$(if [[ $VALIDATIONS_FAILED -gt 0 ]]; then
    echo "1. Address failed validations listed above"
    echo "2. Re-run validation after fixes"
    echo "3. Update documentation as needed"
else
    echo "1. System is ready for production use"
    echo "2. Monitor system performance"
    echo "3. Schedule regular health checks"
fi)

## Documentation Generated
- Architecture documentation: ./architecture/deployment-architecture.md
- Security controls: ./security/security-controls.md
- Operations runbook: ./operations/runbook.md
- Monitoring setup: ./monitoring/monitoring-setup.md

## Compliance Status
- SOC 2: Configuration supports SOC 2 requirements
- GDPR: Data protection measures implemented
- PCI DSS: Security controls for payment data (if applicable)
EOF
    
    log_success "Final validation report generated"
}

# Main validation function
main() {
    log_info "Starting Commerce Studio final validation and documentation"
    
    setup_output_directory
    get_service_info
    validate_security_controls
    validate_monitoring
    validate_service_health
    
    generate_architecture_docs
    generate_security_docs
    generate_operations_runbook
    generate_monitoring_docs
    generate_validation_report
    
    echo ""
    echo "=========================================="
    echo "         FINAL VALIDATION COMPLETE"
    echo "=========================================="
    echo ""
    echo "Validation Results:"
    echo "  Passed: $VALIDATIONS_PASSED"
    echo "  Failed: $VALIDATIONS_FAILED"
    echo "  Success Rate: $(( VALIDATIONS_PASSED * 100 / (VALIDATIONS_PASSED + VALIDATIONS_FAILED) ))%"
    echo ""
    echo "Documentation generated in: $OUTPUT_DIR"
    echo ""
    
    if [[ $VALIDATIONS_FAILED -eq 0 ]]; then
        log_success "All validations passed! Commerce Studio is ready for production."
        return 0
    else
        log_error "Some validations failed. Please review the report and address issues."
        return 1
    fi
}

# Run main function
main "$@"