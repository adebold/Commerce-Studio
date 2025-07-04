#!/bin/bash
set -e

# Script to run end-to-end tests using Docker Compose
# Fixes TensorFlow/Python compatibility issues by using a dedicated Docker setup

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}   Running EyewearML E2E Test Suite     ${NC}"
echo -e "${YELLOW}========================================${NC}"

# Create test results directory if it doesn't exist
mkdir -p test-results

# Function to cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}Cleaning up containers...${NC}"
  docker-compose -f docker-compose.e2e.yml down --volumes
  echo -e "${GREEN}Cleanup complete.${NC}"
}

# Set trap to ensure cleanup on script exit
trap cleanup EXIT

# Build and start containers
echo -e "\n${YELLOW}Building and starting containers...${NC}"
docker-compose -f docker-compose.e2e.yml build
docker-compose -f docker-compose.e2e.yml up -d

# Wait for services to be ready
echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check if the API service is running
if ! docker-compose -f docker-compose.e2e.yml ps | grep -q "api.*Up"; then
  echo -e "${RED}API service is not running. Check logs for errors.${NC}"
  docker-compose -f docker-compose.e2e.yml logs api
  exit 1
fi

# Run specific test or all tests
if [ -n "$1" ]; then
  echo -e "\n${YELLOW}Running specific test: $1${NC}"
  docker-compose -f docker-compose.e2e.yml exec -T e2e-test-runner pytest $1 -v
else
  echo -e "\n${YELLOW}Running all E2E tests...${NC}"
  docker-compose -f docker-compose.e2e.yml exec -T e2e-test-runner pytest tests/e2e -v
fi

# Check test result
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}[PASS] All tests passed successfully!${NC}"
else
  echo -e "\n${RED}[FAIL] Tests failed. Check logs for details.${NC}"
  exit 1
fi
