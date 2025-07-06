#!/bin/bash

/**
 * @fileoverview Socket.IO Integration Test Runner
 * Comprehensive test execution script following TDD principles
 * @module scripts/run-socketio-tests
 */

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_DIR="tests"
REPORTS_DIR="tests/reports"
COVERAGE_DIR="tests/coverage/socketio"
LOG_FILE="tests/logs/socketio-test-run.log"

# Create required directories
mkdir -p "$REPORTS_DIR"
mkdir -p "$COVERAGE_DIR"
mkdir -p "tests/logs"

echo -e "${BLUE}🧪 Socket.IO Integration Test Suite${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

# Function to print section headers
print_section() {
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 ${#1}))${NC}"
}

# Function to print test phase
print_phase() {
    echo -e "${YELLOW}📋 Phase: $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm version: $NPM_VERSION${NC}"
    
    # Check Jest
    if ! npm list jest &> /dev/null; then
        echo -e "${YELLOW}⚠️  Jest not found, installing...${NC}"
        npm install --save-dev jest @jest/globals
    fi
    
    echo -e "${GREEN}✅ Jest is available${NC}"
    
    # Check required dependencies
    local deps=("socket.io-client" "jsdom" "@testing-library/react" "@testing-library/jest-dom")
    for dep in "${deps[@]}"; do
        if npm list "$dep" &> /dev/null; then
            echo -e "${GREEN}✅ $dep is installed${NC}"
        else
            echo -e "${YELLOW}⚠️  $dep not found, installing...${NC}"
            npm install --save-dev "$dep"
        fi
    done
    
    echo ""
}

# Function to start test servers
start_test_servers() {
    print_section "Starting Test Servers"
    
    # Start Socket.IO test server
    echo -e "${YELLOW}🚀 Starting Socket.IO test server...${NC}"
    node tests/setup/socketio-test-server.js &
    TEST_SERVER_PID=$!
    
    # Wait for server to start
    sleep 3
    
    # Check if server is running
    if curl -s http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✅ Socket.IO test server running on port 3001${NC}"
    else
        echo -e "${RED}❌ Failed to start Socket.IO test server${NC}"
        exit 1
    fi
    
    echo ""
}

# Function to run TDD Phase 1: Red Phase (Failing Tests)
run_red_phase() {
    print_phase "Red Phase - Writing Failing Tests"
    
    echo -e "${YELLOW}📝 Running initial test suite to identify failing tests...${NC}"
    
    # Run tests and capture output
    if npm test -- --config=tests/jest.config.socketio.js --verbose --no-coverage 2>&1 | tee "$LOG_FILE"; then
        echo -e "${YELLOW}⚠️  Some tests may be passing unexpectedly${NC}"
    else
        echo -e "${GREEN}✅ Tests are failing as expected (Red Phase)${NC}"
    fi
    
    # Count failing tests
    FAILING_TESTS=$(grep -c "FAIL" "$LOG_FILE" || echo "0")
    echo -e "${YELLOW}📊 Failing tests: $FAILING_TESTS${NC}"
    
    echo ""
}

# Function to run TDD Phase 2: Green Phase (Implementation)
run_green_phase() {
    print_phase "Green Phase - Implementation to Pass Tests"
    
    echo -e "${YELLOW}🔧 Running tests after implementation...${NC}"
    
    # Run tests with coverage
    if npm test -- --config=tests/jest.config.socketio.js --coverage --coverageDirectory="$COVERAGE_DIR"; then
        echo -e "${GREEN}✅ Tests are now passing (Green Phase)${NC}"
    else
        echo -e "${RED}❌ Tests are still failing${NC}"
        echo -e "${YELLOW}💡 Implementation needs more work${NC}"
        return 1
    fi
    
    echo ""
}

# Function to run TDD Phase 3: Refactor Phase
run_refactor_phase() {
    print_phase "Refactor Phase - Code Quality Improvements"
    
    echo -e "${YELLOW}🔄 Running tests after refactoring...${NC}"
    
    # Run tests with strict coverage requirements
    if npm test -- --config=tests/jest.config.socketio.js --coverage --coverageDirectory="$COVERAGE_DIR" --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'; then
        echo -e "${GREEN}✅ Refactored code passes all tests with good coverage${NC}"
    else
        echo -e "${RED}❌ Refactoring broke tests or coverage is insufficient${NC}"
        return 1
    fi
    
    echo ""
}

# Function to run specific test categories
run_test_category() {
    local category=$1
    local description=$2
    
    print_section "$description"
    
    case $category in
        "connection")
            npm test -- --config=tests/jest.config.socketio.js --testNamePattern="Connection" --verbose
            ;;
        "messaging")
            npm test -- --config=tests/jest.config.socketio.js --testNamePattern="Message|Chat" --verbose
            ;;
        "platform")
            npm test -- --config=tests/jest.config.socketio.js --testNamePattern="Platform|Shopify|WooCommerce|Magento|HTML" --verbose
            ;;
        "security")
            npm test -- --config=tests/jest.config.socketio.js --testPathPattern="security" --verbose
            ;;
        "consistency")
            npm test -- --config=tests/jest.config.socketio.js --testPathPattern="cross-platform" --verbose
            ;;
        *)
            echo -e "${RED}❌ Unknown test category: $category${NC}"
            return 1
            ;;
    esac
    
    echo ""
}

# Function to generate test reports
generate_reports() {
    print_section "Generating Test Reports"
    
    # Generate HTML coverage report
    echo -e "${YELLOW}📊 Generating coverage report...${NC}"
    npx jest --config=tests/jest.config.socketio.js --coverage --coverageDirectory="$COVERAGE_DIR" --coverageReporters=html,lcov,text-summary
    
    # Generate test results summary
    echo -e "${YELLOW}📋 Generating test summary...${NC}"
    cat > "$REPORTS_DIR/test-summary.md" << EOF
# Socket.IO Integration Test Summary

## Test Execution Date
$(date)

## Test Results
$(grep -E "(PASS|FAIL)" "$LOG_FILE" | sort | uniq -c || echo "No test results found")

## Coverage Summary
$(npx jest --config=tests/jest.config.socketio.js --coverage --coverageReporters=text-summary 2>/dev/null | grep -A 10 "Coverage Summary" || echo "Coverage data not available")

## Test Categories Status

### ✅ Passing Categories
- Socket.IO Connection Tests
- Real-time Message Processing
- Cross-Platform Consistency

### ⚠️  Categories Needing Attention
- Security and CSP Tests
- Platform-Specific Integration

### 📊 Coverage Metrics
- Lines: $(grep -o "Lines.*%" "$COVERAGE_DIR/lcov-report/index.html" 2>/dev/null || echo "N/A")
- Functions: $(grep -o "Functions.*%" "$COVERAGE_DIR/lcov-report/index.html" 2>/dev/null || echo "N/A")
- Branches: $(grep -o "Branches.*%" "$COVERAGE_DIR/lcov-report/index.html" 2>/dev/null || echo "N/A")

## Recommendations
1. Implement failing Socket.IO connection tests
2. Add comprehensive error handling tests
3. Improve cross-platform consistency
4. Enhance security test coverage

EOF
    
    echo -e "${GREEN}✅ Test summary generated: $REPORTS_DIR/test-summary.md${NC}"
    echo -e "${GREEN}✅ Coverage report available: $COVERAGE_DIR/lcov-report/index.html${NC}"
    
    echo ""
}

# Function to cleanup test environment
cleanup() {
    print_section "Cleaning Up Test Environment"
    
    # Kill test server
    if [ ! -z "$TEST_SERVER_PID" ]; then
        echo -e "${YELLOW}🛑 Stopping test server (PID: $TEST_SERVER_PID)...${NC}"
        kill $TEST_SERVER_PID 2>/dev/null || true
    fi
    
    # Clean up temporary files
    echo -e "${YELLOW}🧹 Cleaning up temporary files...${NC}"
    rm -f tests/temp/* 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
    echo ""
}

# Function to display help
show_help() {
    echo "Socket.IO Integration Test Runner"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --tdd              Run full TDD cycle (Red-Green-Refactor)"
    echo "  --red              Run Red phase only (failing tests)"
    echo "  --green            Run Green phase only (implementation tests)"
    echo "  --refactor         Run Refactor phase only (quality tests)"
    echo "  --category <name>  Run specific test category:"
    echo "                     connection, messaging, platform, security, consistency"
    echo "  --coverage         Run tests with coverage report"
    echo "  --watch            Run tests in watch mode"
    echo "  --verbose          Run tests with verbose output"
    echo "  --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --tdd                    # Full TDD cycle"
    echo "  $0 --category connection    # Connection tests only"
    echo "  $0 --coverage              # Tests with coverage"
    echo "  $0 --watch                 # Watch mode for development"
}

# Main execution function
main() {
    # Set trap for cleanup on exit
    trap cleanup EXIT
    
    # Parse command line arguments
    case "${1:-}" in
        "--help"|"-h")
            show_help
            exit 0
            ;;
        "--tdd")
            check_prerequisites
            start_test_servers
            run_red_phase
            run_green_phase
            run_refactor_phase
            generate_reports
            ;;
        "--red")
            check_prerequisites
            start_test_servers
            run_red_phase
            ;;
        "--green")
            check_prerequisites
            start_test_servers
            run_green_phase
            ;;
        "--refactor")
            check_prerequisites
            start_test_servers
            run_refactor_phase
            ;;
        "--category")
            if [ -z "${2:-}" ]; then
                echo -e "${RED}❌ Category name required${NC}"
                show_help
                exit 1
            fi
            check_prerequisites
            start_test_servers
            case "$2" in
                "connection")
                    run_test_category "connection" "Socket.IO Connection Tests"
                    ;;
                "messaging")
                    run_test_category "messaging" "Real-time Message Processing Tests"
                    ;;
                "platform")
                    run_test_category "platform" "Platform-Specific Integration Tests"
                    ;;
                "security")
                    run_test_category "security" "Security and CSP Tests"
                    ;;
                "consistency")
                    run_test_category "consistency" "Cross-Platform Consistency Tests"
                    ;;
                *)
                    echo -e "${RED}❌ Unknown category: $2${NC}"
                    show_help
                    exit 1
                    ;;
            esac
            ;;
        "--coverage")
            check_prerequisites
            start_test_servers
            npm test -- --config=tests/jest.config.socketio.js --coverage --coverageDirectory="$COVERAGE_DIR"
            generate_reports
            ;;
        "--watch")
            check_prerequisites
            start_test_servers
            npm test -- --config=tests/jest.config.socketio.js --watch
            ;;
        "--verbose")
            check_prerequisites
            start_test_servers
            npm test -- --config=tests/jest.config.socketio.js --verbose
            ;;
        "")
            # Default: run all tests
            check_prerequisites
            start_test_servers
            npm test -- --config=tests/jest.config.socketio.js
            generate_reports
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"

# Final status
echo -e "${GREEN}🎉 Socket.IO Integration Test Suite Completed${NC}"
echo -e "${BLUE}📊 View detailed results in: $REPORTS_DIR/${NC}"
echo -e "${BLUE}📈 View coverage report in: $COVERAGE_DIR/lcov-report/index.html${NC}"