#!/bin/bash

# Critical Fixes Test Runner Script
# Executes comprehensive test suite for critical issues before cross-platform propagation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_DIR="tests/critical-fixes"
COVERAGE_DIR="coverage/critical-fixes"
REPORT_DIR="reports/critical-fixes"

# Create directories
mkdir -p "$COVERAGE_DIR"
mkdir -p "$REPORT_DIR"

echo -e "${BLUE}🧪 Critical Fixes Test Suite${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to print section headers
print_section() {
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 ${#1}))${NC}"
}

# Function to run tests with error handling
run_test_suite() {
    local test_name="$1"
    local test_pattern="$2"
    local description="$3"
    
    echo -e "${YELLOW}Running $test_name...${NC}"
    echo "Description: $description"
    echo ""
    
    if npm test -- --config="$TEST_DIR/jest.config.critical-fixes.js" --testPathPattern="$test_pattern" --verbose; then
        echo -e "${GREEN}✅ $test_name PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name FAILED${NC}"
        return 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
    else
        echo -e "${RED}❌ Node.js not found${NC}"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
    else
        echo -e "${RED}❌ npm not found${NC}"
        exit 1
    fi
    
    # Check if test files exist
    if [ -d "$TEST_DIR" ]; then
        TEST_COUNT=$(find "$TEST_DIR" -name "*.test.js" | wc -l)
        echo -e "${GREEN}✅ Test directory found with $TEST_COUNT test files${NC}"
    else
        echo -e "${RED}❌ Test directory not found: $TEST_DIR${NC}"
        exit 1
    fi
    
    echo ""
}

# Function to install dependencies
install_dependencies() {
    print_section "Installing Dependencies"
    
    echo "Installing test dependencies..."
    npm install --save-dev \
        jest \
        @testing-library/react \
        @testing-library/jest-dom \
        @testing-library/user-event \
        jest-environment-jsdom \
        jest-html-reporters \
        jest-junit \
        babel-jest \
        @babel/preset-env \
        @babel/preset-react \
        @babel/preset-typescript
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
}

# Function to run memory leak tests
run_memory_leak_tests() {
    print_section "Memory Leak Tests"
    
    run_test_suite \
        "Memory Leak Tests" \
        "memory-leak-timeout-handler" \
        "Tests for timeout handler memory leaks and cleanup issues"
    
    echo ""
}

# Function to run security tests
run_security_tests() {
    print_section "Security Validation Tests"
    
    run_test_suite \
        "Security Tests" \
        "input-validation-security" \
        "Tests for XSS prevention, input validation, and sanitization"
    
    echo ""
}

# Function to run race condition tests
run_race_condition_tests() {
    print_section "Race Condition Tests"
    
    run_test_suite \
        "Race Condition Tests" \
        "connection-race-condition" \
        "Tests for connection state race conditions and atomic operations"
    
    echo ""
}

# Function to run interface consistency tests
run_interface_tests() {
    print_section "Interface Consistency Tests"
    
    run_test_suite \
        "Interface Tests" \
        "interface-consistency-error-recovery" \
        "Tests for duplicate interfaces and error recovery patterns"
    
    echo ""
}

# Function to run performance tests
run_performance_tests() {
    print_section "Performance and Memory Tests"
    
    run_test_suite \
        "Performance Tests" \
        "performance-memory-leak" \
        "Tests for performance regressions and memory usage"
    
    echo ""
}

# Function to run all critical tests
run_all_critical_tests() {
    print_section "Running All Critical Fix Tests"
    
    local failed_tests=0
    
    # Run each test suite and track failures
    run_memory_leak_tests || ((failed_tests++))
    run_security_tests || ((failed_tests++))
    run_race_condition_tests || ((failed_tests++))
    run_interface_tests || ((failed_tests++))
    run_performance_tests || ((failed_tests++))
    
    return $failed_tests
}

# Function to generate coverage report
generate_coverage_report() {
    print_section "Generating Coverage Report"
    
    echo "Running tests with coverage..."
    npm test -- \
        --config="$TEST_DIR/jest.config.critical-fixes.js" \
        --coverage \
        --coverageDirectory="$COVERAGE_DIR" \
        --coverageReporters=text,lcov,html,json
    
    echo -e "${GREEN}✅ Coverage report generated in $COVERAGE_DIR${NC}"
    echo ""
}

# Function to analyze test results
analyze_results() {
    print_section "Test Results Analysis"
    
    local failed_count=$1
    
    if [ $failed_count -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL CRITICAL TESTS PASSED!${NC}"
        echo -e "${GREEN}✅ Ready for cross-platform propagation${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Review coverage report in $COVERAGE_DIR"
        echo "2. Implement any remaining fixes"
        echo "3. Run integration tests"
        echo "4. Proceed with cross-platform deployment"
    else
        echo -e "${RED}❌ $failed_count test suite(s) failed${NC}"
        echo -e "${RED}🚫 NOT ready for cross-platform propagation${NC}"
        echo ""
        echo "Required actions:"
        echo "1. Review failed test output above"
        echo "2. Implement fixes for failing tests"
        echo "3. Re-run this test suite"
        echo "4. Ensure all tests pass before proceeding"
    fi
    
    echo ""
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  all              Run all critical fix tests (default)"
    echo "  memory           Run memory leak tests only"
    echo "  security         Run security validation tests only"
    echo "  race-condition   Run race condition tests only"
    echo "  interface        Run interface consistency tests only"
    echo "  performance      Run performance tests only"
    echo "  coverage         Run all tests with coverage report"
    echo "  install          Install test dependencies"
    echo "  help             Show this help message"
    echo ""
}

# Main execution
main() {
    local option="${1:-all}"
    
    case $option in
        "help"|"-h"|"--help")
            show_usage
            exit 0
            ;;
        "install")
            check_prerequisites
            install_dependencies
            exit 0
            ;;
        "memory")
            check_prerequisites
            run_memory_leak_tests
            exit $?
            ;;
        "security")
            check_prerequisites
            run_security_tests
            exit $?
            ;;
        "race-condition")
            check_prerequisites
            run_race_condition_tests
            exit $?
            ;;
        "interface")
            check_prerequisites
            run_interface_tests
            exit $?
            ;;
        "performance")
            check_prerequisites
            run_performance_tests
            exit $?
            ;;
        "coverage")
            check_prerequisites
            generate_coverage_report
            exit $?
            ;;
        "all")
            check_prerequisites
            failed_tests=0
            run_all_critical_tests || failed_tests=$?
            analyze_results $failed_tests
            exit $failed_tests
            ;;
        *)
            echo -e "${RED}Unknown option: $option${NC}"
            show_usage
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"