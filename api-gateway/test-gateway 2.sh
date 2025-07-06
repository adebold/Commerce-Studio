#!/bin/bash

# Bash script to test the API Gateway

# Navigate to the API Gateway directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to make API requests and display results
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local body=$4
    
    echo -e "\n\e[36m=== Testing: $description ===\e[0m"
    echo -e "\e[36mEndpoint: $method $endpoint\e[0m"
    
    if [ -z "$body" ]; then
        response=$(curl -s -X $method $endpoint -H "Content-Type: application/json" -w "\n%{http_code}")
    else
        response=$(curl -s -X $method $endpoint -H "Content-Type: application/json" -d "$body" -w "\n%{http_code}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
        echo -e "\e[32mStatus: Success ($http_code)\e[0m"
        echo -e "\e[32mResponse:\e[0m"
        echo "$body" | jq . || echo "$body"
        return 0
    else
        echo -e "\e[31mStatus: Failed ($http_code)\e[0m"
        echo -e "\e[31mResponse:\e[0m"
        echo "$body" | jq . || echo "$body"
        return 1
    fi
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "\e[33mWarning: jq is not installed. JSON responses will not be formatted.\e[0m"
    echo -e "\e[33mInstall jq with: sudo apt-get install jq (Debian/Ubuntu) or brew install jq (macOS)\e[0m"
fi

# Check if API Gateway is running
if curl -s http://localhost:8001/status > /dev/null; then
    KONG_STATUS=$(curl -s http://localhost:8001/status)
    KONG_VERSION=$(echo $KONG_STATUS | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    echo -e "\e[32mKong API Gateway is running!\e[0m"
    echo -e "\e[32mKong version: $KONG_VERSION\e[0m"
else
    echo -e "\e[31mKong API Gateway is not running. Please start it with './start-gateway.sh'\e[0m"
    exit 1
fi

# Test endpoints
tests_passed=0
total_tests=5

# Test 1: Get all products
if test_endpoint "GET" "http://localhost:8000/api/v1/products" "Get all products"; then
    ((tests_passed++))
fi

# Test 2: Get a specific product
if test_endpoint "GET" "http://localhost:8000/api/v1/products/product-1" "Get a specific product"; then
    ((tests_passed++))
fi

# Test 3: Get all users
if test_endpoint "GET" "http://localhost:8000/api/v1/users" "Get all users"; then
    ((tests_passed++))
fi

# Test 4: Get a specific user
if test_endpoint "GET" "http://localhost:8000/api/v1/users/user-1" "Get a specific user"; then
    ((tests_passed++))
fi

# Test 5: Authentication
auth_body='{"username": "john.doe", "password": "password"}'
if test_endpoint "POST" "http://localhost:8000/api/v1/auth/login" "Authentication" "$auth_body"; then
    ((tests_passed++))
fi

# Display test results
echo -e "\n\e[36m=== Test Results ===\e[0m"
if [ $tests_passed -eq $total_tests ]; then
    echo -e "\e[32mTests passed: $tests_passed/$total_tests\e[0m"
    success_rate=$((tests_passed * 100 / total_tests))
    echo -e "\e[32mSuccess rate: $success_rate%\e[0m"
    echo -e "\n\e[32mAll tests passed! The API Gateway is working correctly.\e[0m"
else
    echo -e "\e[33mTests passed: $tests_passed/$total_tests\e[0m"
    success_rate=$((tests_passed * 100 / total_tests))
    echo -e "\e[33mSuccess rate: $success_rate%\e[0m"
    echo -e "\n\e[33mSome tests failed. Please check the API Gateway configuration.\e[0m"
fi