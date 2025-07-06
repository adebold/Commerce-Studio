#!/bin/bash

# Commerce Studio End-to-End Testing Script
# Phase 7: Service Integration & Testing

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

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Record test result
record_test() {
    local test_name="$1"
    local result="$2"
    
    if [[ "$result" == "PASS" ]]; then
        ((TESTS_PASSED++))
        log_success "✓ $test_name"
    else
        ((TESTS_FAILED++))
        FAILED_TESTS+=("$test_name")
        log_error "✗ $test_name"
    fi
}

# Get service URLs
get_service_urls() {
    log_info "Retrieving service URLs..."
    
    API_URL=$(gcloud run services describe commerce-studio-api --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "")
    AUTH_URL=$(gcloud run services describe commerce-studio-auth --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "")
    FRONTEND_URL=$(gcloud run services describe commerce-studio-frontend --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "")
    
    if [[ -z "$API_URL" || -z "$AUTH_URL" || -z "$FRONTEND_URL" ]]; then
        log_error "Could not retrieve all service URLs. Ensure services are deployed."
        exit 1
    fi
    
    log_info "Service URLs retrieved:"
    echo "  API:      $API_URL"
    echo "  Auth:     $AUTH_URL"
    echo "  Frontend: $FRONTEND_URL"
}

# Test API health endpoints
test_api_health() {
    log_info "Testing API health endpoints..."
    
    # Test main API health
    if curl -f -s "$API_URL/health" > /dev/null; then
        record_test "API Health Check" "PASS"
    else
        record_test "API Health Check" "FAIL"
    fi
    
    # Test API root endpoint
    if curl -f -s "$API_URL/" > /dev/null; then
        record_test "API Root Endpoint" "PASS"
    else
        record_test "API Root Endpoint" "FAIL"
    fi
}

# Test authentication service
test_auth_service() {
    log_info "Testing authentication service..."
    
    # Test auth health
    if curl -f -s "$AUTH_URL/health" > /dev/null; then
        record_test "Auth Service Health" "PASS"
    else
        record_test "Auth Service Health" "FAIL"
        return
    fi
    
    # Test auth endpoints structure
    local auth_response=$(curl -s "$AUTH_URL/health" || echo "")
    if echo "$auth_response" | grep -q "status"; then
        record_test "Auth Service Response Format" "PASS"
    else
        record_test "Auth Service Response Format" "FAIL"
    fi
}

# Test authentication flow
test_authentication_flow() {
    log_info "Testing authentication flow..."
    
    # Test login endpoint exists
    local login_response=$(curl -s -w "%{http_code}" -o /dev/null "$AUTH_URL/api/auth/login" || echo "000")
    if [[ "$login_response" == "405" || "$login_response" == "400" ]]; then
        # 405 Method Not Allowed or 400 Bad Request is expected for GET on login endpoint
        record_test "Auth Login Endpoint Exists" "PASS"
    else
        record_test "Auth Login Endpoint Exists" "FAIL"
    fi
    
    # Test registration endpoint exists
    local register_response=$(curl -s -w "%{http_code}" -o /dev/null "$AUTH_URL/api/auth/register" || echo "000")
    if [[ "$register_response" == "405" || "$register_response" == "400" ]]; then
        # 405 Method Not Allowed or 400 Bad Request is expected for GET on register endpoint
        record_test "Auth Register Endpoint Exists" "PASS"
    else
        record_test "Auth Register Endpoint Exists" "FAIL"
    fi
}

# Test frontend service
test_frontend_service() {
    log_info "Testing frontend service..."
    
    # Test frontend health
    if curl -f -s "$FRONTEND_URL/" > /dev/null; then
        record_test "Frontend Service Health" "PASS"
    else
        record_test "Frontend Service Health" "FAIL"
        return
    fi
    
    # Test frontend content
    local frontend_content=$(curl -s "$FRONTEND_URL/" || echo "")
    if echo "$frontend_content" | grep -q -i "html"; then
        record_test "Frontend HTML Content" "PASS"
    else
        record_test "Frontend HTML Content" "FAIL"
    fi
    
    # Test frontend assets
    if echo "$frontend_content" | grep -q -E "(css|js)"; then
        record_test "Frontend Assets Referenced" "PASS"
    else
        record_test "Frontend Assets Referenced" "FAIL"
    fi
}

# Test service integration
test_service_integration() {
    log_info "Testing service integration..."
    
    # Test CORS headers
    local cors_response=$(curl -s -H "Origin: https://example.com" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS "$API_URL/health" || echo "")
    if curl -s -I "$API_URL/health" | grep -q -i "access-control"; then
        record_test "API CORS Headers" "PASS"
    else
        record_test "API CORS Headers" "FAIL"
    fi
    
    # Test API response time
    local start_time=$(date +%s%N)
    curl -f -s "$API_URL/health" > /dev/null
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [[ $response_time -lt 5000 ]]; then # Less than 5 seconds
        record_test "API Response Time (<5s)" "PASS"
    else
        record_test "API Response Time (<5s)" "FAIL"
    fi
}

# Test security headers
test_security_headers() {
    log_info "Testing security headers..."
    
    # Test API security headers
    local api_headers=$(curl -s -I "$API_URL/health" || echo "")
    
    if echo "$api_headers" | grep -q -i "x-content-type-options"; then
        record_test "API X-Content-Type-Options Header" "PASS"
    else
        record_test "API X-Content-Type-Options Header" "FAIL"
    fi
    
    # Test Auth security headers
    local auth_headers=$(curl -s -I "$AUTH_URL/health" || echo "")
    
    if echo "$auth_headers" | grep -q -i "x-frame-options\|content-security-policy"; then
        record_test "Auth Security Headers" "PASS"
    else
        record_test "Auth Security Headers" "FAIL"
    fi
    
    # Test Frontend security headers
    local frontend_headers=$(curl -s -I "$FRONTEND_URL/" || echo "")
    
    if echo "$frontend_headers" | grep -q -i "x-frame-options\|content-security-policy"; then
        record_test "Frontend Security Headers" "PASS"
    else
        record_test "Frontend Security Headers" "FAIL"
    fi
}

# Test database connectivity (if applicable)
test_database_connectivity() {
    log_info "Testing database connectivity..."
    
    # Test if API can connect to database (through a health check that includes DB)
    local db_health_response=$(curl -s "$API_URL/health" || echo "")
    if echo "$db_health_response" | grep -q -i "healthy\|ok"; then
        record_test "Database Connectivity" "PASS"
    else
        record_test "Database Connectivity" "FAIL"
    fi
}

# Test monitoring and logging
test_monitoring() {
    log_info "Testing monitoring and logging..."
    
    # Check if services are generating logs
    local api_logs=$(gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=commerce-studio-api" --limit=1 --format="value(timestamp)" 2>/dev/null || echo "")
    if [[ -n "$api_logs" ]]; then
        record_test "API Logging" "PASS"
    else
        record_test "API Logging" "FAIL"
    fi
    
    local auth_logs=$(gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=commerce-studio-auth" --limit=1 --format="value(timestamp)" 2>/dev/null || echo "")
    if [[ -n "$auth_logs" ]]; then
        record_test "Auth Service Logging" "PASS"
    else
        record_test "Auth Service Logging" "FAIL"
    fi
}

# Generate test report
generate_report() {
    echo ""
    echo "=========================================="
    echo "         END-TO-END TEST REPORT"
    echo "=========================================="
    echo ""
    echo "Environment: $ENVIRONMENT"
    echo "Project ID:  $PROJECT_ID"
    echo "Region:      $REGION"
    echo ""
    echo "Test Results:"
    echo "  Passed: $TESTS_PASSED"
    echo "  Failed: $TESTS_FAILED"
    echo "  Total:  $((TESTS_PASSED + TESTS_FAILED))"
    echo ""
    
    if [[ $TESTS_FAILED -gt 0 ]]; then
        echo "Failed Tests:"
        for test in "${FAILED_TESTS[@]}"; do
            echo "  - $test"
        done
        echo ""
    fi
    
    echo "Service URLs:"
    echo "  API:      $API_URL"
    echo "  Auth:     $AUTH_URL"
    echo "  Frontend: $FRONTEND_URL"
    echo ""
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        log_success "All tests passed! ✓"
        return 0
    else
        log_error "Some tests failed! ✗"
        return 1
    fi
}

# Main testing function
main() {
    log_info "Starting Commerce Studio end-to-end testing"
    
    get_service_urls
    
    test_api_health
    test_auth_service
    test_authentication_flow
    test_frontend_service
    test_service_integration
    test_security_headers
    test_database_connectivity
    test_monitoring
    
    generate_report
}

# Run main function
main "$@"