#!/bin/bash

# NVIDIA API Connectivity Test Script
# Tests connectivity and authentication with NVIDIA AI services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_TIMEOUT=30
TEST_LOG="nvidia-api-test.log"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to load environment variables
load_environment() {
    if [[ -f ".env" ]]; then
        print_status "Loading environment variables from .env file..."
        set -a
        source .env
        set +a
    elif [[ -f ".env.demo.template" ]]; then
        print_status "Loading environment variables from .env.demo.template..."
        set -a
        source .env.demo.template
        set +a
    else
        print_warning "No environment file found. Using system environment variables."
    fi
}

# Function to validate required tools
validate_tools() {
    print_status "Validating required tools..."
    
    if ! command_exists curl; then
        print_error "curl is required but not installed. Please install curl."
        exit 1
    fi
    
    if ! command_exists jq; then
        print_warning "jq is not installed. JSON responses will not be formatted."
    fi
    
    print_success "Required tools are available"
}

# Function to test HTTP connectivity
test_http_connectivity() {
    local url="$1"
    local service_name="$2"
    
    print_status "Testing HTTP connectivity to $service_name..."
    
    if curl -s --connect-timeout $TEST_TIMEOUT --max-time $TEST_TIMEOUT "$url" > /dev/null 2>&1; then
        print_success "$service_name is reachable"
        return 0
    else
        print_error "$service_name is not reachable at $url"
        return 1
    fi
}

# Function to test NVIDIA Omniverse Avatar API
test_omniverse_api() {
    print_status "Testing NVIDIA Omniverse Avatar API..."
    
    if [[ -z "${NVIDIA_OMNIVERSE_API_KEY:-}" ]]; then
        print_error "NVIDIA_OMNIVERSE_API_KEY is not set"
        return 1
    fi
    
    if [[ -z "${NVIDIA_OMNIVERSE_ENDPOINT:-}" ]]; then
        print_error "NVIDIA_OMNIVERSE_ENDPOINT is not set"
        return 1
    fi
    
    local endpoint="$NVIDIA_OMNIVERSE_ENDPOINT"
    local api_key="$NVIDIA_OMNIVERSE_API_KEY"
    
    # Test basic connectivity
    if ! test_http_connectivity "$endpoint" "Omniverse Avatar API"; then
        return 1
    fi
    
    # Test authentication
    print_status "Testing Omniverse API authentication..."
    
    local auth_response=$(curl -s \
        --connect-timeout $TEST_TIMEOUT \
        --max-time $TEST_TIMEOUT \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        "$endpoint/v1/health" 2>/dev/null || echo "")
    
    if [[ -n "$auth_response" ]]; then
        if echo "$auth_response" | grep -q "error\|unauthorized\|forbidden" 2>/dev/null; then
            print_error "Omniverse API authentication failed"
            if command_exists jq; then
                echo "$auth_response" | jq . 2>/dev/null || echo "$auth_response"
            else
                echo "$auth_response"
            fi
            return 1
        else
            print_success "Omniverse API authentication successful"
            if command_exists jq; then
                echo "$auth_response" | jq . 2>/dev/null || echo "$auth_response"
            fi
            return 0
        fi
    else
        print_error "No response from Omniverse API"
        return 1
    fi
}

# Function to test NVIDIA Riva Speech API
test_riva_api() {
    print_status "Testing NVIDIA Riva Speech API..."
    
    if [[ -z "${NVIDIA_RIVA_API_KEY:-}" ]]; then
        print_error "NVIDIA_RIVA_API_KEY is not set"
        return 1
    fi
    
    if [[ -z "${NVIDIA_RIVA_ENDPOINT:-}" ]]; then
        print_error "NVIDIA_RIVA_ENDPOINT is not set"
        return 1
    fi
    
    local endpoint="$NVIDIA_RIVA_ENDPOINT"
    local api_key="$NVIDIA_RIVA_API_KEY"
    
    # Test basic connectivity
    if ! test_http_connectivity "$endpoint" "Riva Speech API"; then
        return 1
    fi
    
    # Test authentication
    print_status "Testing Riva API authentication..."
    
    local auth_response=$(curl -s \
        --connect-timeout $TEST_TIMEOUT \
        --max-time $TEST_TIMEOUT \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        "$endpoint/v1/health" 2>/dev/null || echo "")
    
    if [[ -n "$auth_response" ]]; then
        if echo "$auth_response" | grep -q "error\|unauthorized\|forbidden" 2>/dev/null; then
            print_error "Riva API authentication failed"
            if command_exists jq; then
                echo "$auth_response" | jq . 2>/dev/null || echo "$auth_response"
            else
                echo "$auth_response"
            fi
            return 1
        else
            print_success "Riva API authentication successful"
            if command_exists jq; then
                echo "$auth_response" | jq . 2>/dev/null || echo "$auth_response"
            fi
            return 0
        fi
    else
        print_error "No response from Riva API"
        return 1
    fi
}

# Function to test NVIDIA Merlin Conversation API
test_merlin_api() {
    print_status "Testing NVIDIA Merlin Conversation API..."
    
    if [[ -z "${NVIDIA_MERLIN_API_KEY:-}" ]]; then
        print_error "NVIDIA_MERLIN_API_KEY is not set"
        return 1
    fi
    
    if [[ -z "${NVIDIA_MERLIN_ENDPOINT:-}" ]]; then
        print_error "NVIDIA_MERLIN_ENDPOINT is not set"
        return 1
    fi
    
    local endpoint="$NVIDIA_MERLIN_ENDPOINT"
    local api_key="$NVIDIA_MERLIN_API_KEY"
    
    # Test basic connectivity
    if ! test_http_connectivity "$endpoint" "Merlin Conversation API"; then
        return 1
    fi
    
    # Test authentication
    print_status "Testing Merlin API authentication..."
    
    local auth_response=$(curl -s \
        --connect-timeout $TEST_TIMEOUT \
        --max-time $TEST_TIMEOUT \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        "$endpoint/v1/health" 2>/dev/null || echo "")
    
    if [[ -n "$auth_response" ]]; then
        if echo "$auth_response" | grep -q "error\|unauthorized\|forbidden" 2>/dev/null; then
            print_error "Merlin API authentication failed"
            if command_exists jq; then
                echo "$auth_response" | jq . 2>/dev/null || echo "$auth_response"
            else
                echo "$auth_response"
            fi
            return 1
        else
            print_success "Merlin API authentication successful"
            if command_exists jq; then
                echo "$auth_response" | jq . 2>/dev/null || echo "$auth_response"
            fi
            return 0
        fi
    else
        print_error "No response from Merlin API"
        return 1
    fi
}

# Function to test avatar creation (basic functionality test)
test_avatar_creation() {
    print_status "Testing avatar creation functionality..."
    
    if [[ -z "${NVIDIA_OMNIVERSE_API_KEY:-}" ]] || [[ -z "${NVIDIA_OMNIVERSE_ENDPOINT:-}" ]]; then
        print_warning "Skipping avatar creation test - credentials not available"
        return 0
    fi
    
    local endpoint="$NVIDIA_OMNIVERSE_ENDPOINT"
    local api_key="$NVIDIA_OMNIVERSE_API_KEY"
    
    # Test avatar creation request
    local create_payload='{
        "avatar_type": "professional_consultant",
        "session_id": "test_session_' $(date +%s) '",
        "config": {
            "quality": "medium",
            "background": "neutral"
        }
    }'
    
    local create_response=$(curl -s \
        --connect-timeout $TEST_TIMEOUT \
        --max-time $TEST_TIMEOUT \
        -X POST \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        -d "$create_payload" \
        "$endpoint/v1/avatars" 2>/dev/null || echo "")
    
    if [[ -n "$create_response" ]]; then
        if echo "$create_response" | grep -q "avatar_id\|session_id" 2>/dev/null; then
            print_success "Avatar creation test successful"
            if command_exists jq; then
                echo "$create_response" | jq . 2>/dev/null || echo "$create_response"
            fi
            
            # Extract avatar ID for cleanup
            local avatar_id=""
            if command_exists jq; then
                avatar_id=$(echo "$create_response" | jq -r '.avatar_id // empty' 2>/dev/null)
            fi
            
            # Clean up test avatar
            if [[ -n "$avatar_id" ]]; then
                print_status "Cleaning up test avatar..."
                curl -s \
                    --connect-timeout $TEST_TIMEOUT \
                    --max-time $TEST_TIMEOUT \
                    -X DELETE \
                    -H "Authorization: Bearer $api_key" \
                    "$endpoint/v1/avatars/$avatar_id" >/dev/null 2>&1 || true
            fi
            
            return 0
        else
            print_error "Avatar creation test failed"
            if command_exists jq; then
                echo "$create_response" | jq . 2>/dev/null || echo "$create_response"
            else
                echo "$create_response"
            fi
            return 1
        fi
    else
        print_error "No response from avatar creation endpoint"
        return 1
    fi
}

# Function to test speech synthesis
test_speech_synthesis() {
    print_status "Testing speech synthesis functionality..."
    
    if [[ -z "${NVIDIA_RIVA_API_KEY:-}" ]] || [[ -z "${NVIDIA_RIVA_ENDPOINT:-}" ]]; then
        print_warning "Skipping speech synthesis test - credentials not available"
        return 0
    fi
    
    local endpoint="$NVIDIA_RIVA_ENDPOINT"
    local api_key="$NVIDIA_RIVA_API_KEY"
    
    # Test speech synthesis request
    local tts_payload='{
        "text": "Hello, this is a test of the speech synthesis system.",
        "voice": "default",
        "format": "wav"
    }'
    
    local tts_response=$(curl -s \
        --connect-timeout $TEST_TIMEOUT \
        --max-time $TEST_TIMEOUT \
        -X POST \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        -d "$tts_payload" \
        "$endpoint/v1/speech/synthesize" 2>/dev/null || echo "")
    
    if [[ -n "$tts_response" ]]; then
        if echo "$tts_response" | grep -q "audio\|url\|data" 2>/dev/null; then
            print_success "Speech synthesis test successful"
            return 0
        else
            print_error "Speech synthesis test failed"
            if command_exists jq; then
                echo "$tts_response" | jq . 2>/dev/null || echo "$tts_response"
            else
                echo "$tts_response"
            fi
            return 1
        fi
    else
        print_error "No response from speech synthesis endpoint"
        return 1
    fi
}

# Function to test conversation generation
test_conversation_generation() {
    print_status "Testing conversation generation functionality..."
    
    if [[ -z "${NVIDIA_MERLIN_API_KEY:-}" ]] || [[ -z "${NVIDIA_MERLIN_ENDPOINT:-}" ]]; then
        print_warning "Skipping conversation generation test - credentials not available"
        return 0
    fi
    
    local endpoint="$NVIDIA_MERLIN_ENDPOINT"
    local api_key="$NVIDIA_MERLIN_API_KEY"
    
    # Test conversation generation request
    local chat_payload='{
        "message": "Hello, I am looking for new eyeglasses. Can you help me?",
        "context": "eyewear_consultation",
        "session_id": "test_session_' $(date +%s) '"
    }'
    
    local chat_response=$(curl -s \
        --connect-timeout $TEST_TIMEOUT \
        --max-time $TEST_TIMEOUT \
        -X POST \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        -d "$chat_payload" \
        "$endpoint/v1/chat/completions" 2>/dev/null || echo "")
    
    if [[ -n "$chat_response" ]]; then
        if echo "$chat_response" | grep -q "response\|message\|text" 2>/dev/null; then
            print_success "Conversation generation test successful"
            if command_exists jq; then
                echo "$chat_response" | jq . 2>/dev/null || echo "$chat_response"
            fi
            return 0
        else
            print_error "Conversation generation test failed"
            if command_exists jq; then
                echo "$chat_response" | jq . 2>/dev/null || echo "$chat_response"
            else
                echo "$chat_response"
            fi
            return 1
        fi
    else
        print_error "No response from conversation generation endpoint"
        return 1
    fi
}

# Function to generate test report
generate_test_report() {
    local omniverse_status="$1"
    local riva_status="$2"
    local merlin_status="$3"
    local functionality_tests="$4"
    
    print_status "Generating test report..."
    
    local report_file="nvidia-api-test-report.json"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat > "$report_file" << EOF
{
  "test_report": {
    "timestamp": "$timestamp",
    "test_duration": "$(date +%s)",
    "services": {
      "omniverse_avatar": {
        "status": "$omniverse_status",
        "endpoint": "${NVIDIA_OMNIVERSE_ENDPOINT:-"not_configured"}",
        "api_key_configured": $([ -n "${NVIDIA_OMNIVERSE_API_KEY:-}" ] && echo "true" || echo "false")
      },
      "riva_speech": {
        "status": "$riva_status",
        "endpoint": "${NVIDIA_RIVA_ENDPOINT:-"not_configured"}",
        "api_key_configured": $([ -n "${NVIDIA_RIVA_API_KEY:-}" ] && echo "true" || echo "false")
      },
      "merlin_conversation": {
        "status": "$merlin_status",
        "endpoint": "${NVIDIA_MERLIN_ENDPOINT:-"not_configured"}",
        "api_key_configured": $([ -n "${NVIDIA_MERLIN_API_KEY:-}" ] && echo "true" || echo "false")
      }
    },
    "functionality_tests": $functionality_tests,
    "overall_status": "$([ "$omniverse_status" = "success" ] && [ "$riva_status" = "success" ] && [ "$merlin_status" = "success" ] && echo "success" || echo "partial")"
  }
}
EOF
    
    print_success "Test report generated: $report_file"
    
    if command_exists jq; then
        jq . "$report_file"
    else
        cat "$report_file"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --quick         Run quick connectivity tests only"
    echo "  --full          Run full functionality tests (default)"
    echo "  --service NAME  Test specific service only (omniverse|riva|merlin)"
    echo "  --timeout SEC   Set timeout for requests (default: 30)"
    echo "  --help          Show this help message"
}

# Main execution
main() {
    local test_mode="full"
    local specific_service=""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --quick)
                test_mode="quick"
                shift
                ;;
            --full)
                test_mode="full"
                shift
                ;;
            --service)
                specific_service="$2"
                shift 2
                ;;
            --timeout)
                TEST_TIMEOUT="$2"
                shift 2
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Start logging
    exec 1> >(tee -a "$TEST_LOG")
    exec 2> >(tee -a "$TEST_LOG" >&2)
    
    print_status "NVIDIA API Connectivity Test"
    print_status "============================"
    print_status "Test mode: $test_mode"
    print_status "Timeout: ${TEST_TIMEOUT}s"
    
    # Initialize
    load_environment
    validate_tools
    
    # Test results
    local omniverse_result="not_tested"
    local riva_result="not_tested"
    local merlin_result="not_tested"
    local functionality_tests="false"
    
    # Run service tests
    if [[ -z "$specific_service" ]] || [[ "$specific_service" == "omniverse" ]]; then
        if test_omniverse_api; then
            omniverse_result="success"
        else
            omniverse_result="failed"
        fi
    fi
    
    if [[ -z "$specific_service" ]] || [[ "$specific_service" == "riva" ]]; then
        if test_riva_api; then
            riva_result="success"
        else
            riva_result="failed"
        fi
    fi
    
    if [[ -z "$specific_service" ]] || [[ "$specific_service" == "merlin" ]]; then
        if test_merlin_api; then
            merlin_result="success"
        else
            merlin_result="failed"
        fi
    fi
    
    # Run functionality tests if in full mode
    if [[ "$test_mode" == "full" ]]; then
        print_status "Running functionality tests..."
        functionality_tests="true"
        
        test_avatar_creation || true
        test_speech_synthesis || true
        test_conversation_generation || true
    fi
    
    # Generate report
    generate_test_report "$omniverse_result" "$riva_result" "$merlin_result" "$functionality_tests"
    
    # Exit with appropriate code
    if [[ "$omniverse_result" == "success" ]] && [[ "$riva_result" == "success" ]] && [[ "$merlin_result" == "success" ]]; then
        print_success "All NVIDIA API tests passed!"
        exit 0
    elif [[ "$omniverse_result" == "failed" ]] && [[ "$riva_result" == "failed" ]] && [[ "$merlin_result" == "failed" ]]; then
        print_error "All NVIDIA API tests failed!"
        exit 1
    else
        print_warning "Some NVIDIA API tests failed. Check the report for details."
        exit 2
    fi
}

# Run main function with all arguments
main "$@"