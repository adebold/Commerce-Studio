# Test Environment Setup Guide

This guide explains how to set up and configure the test environments for integration testing of the VARAi platform.

## Overview

The integration tests use isolated environments to ensure that tests don't interfere with each other and that test results are consistent and reproducible. The test environments are created and destroyed automatically as part of the test run.

## Environment Types

### Local Development Environment

For local development and testing, the test environment consists of:

- Docker containers for services
- In-memory MongoDB for database tests
- Mock servers for external services
- Local file system for storage

### CI/CD Environment

In the CI/CD pipeline, the test environment consists of:

- Docker containers for services
- Ephemeral MongoDB instances
- Mock servers for external services
- Ephemeral storage

## Prerequisites

To set up the test environments, you need:

- Docker and Docker Compose
- Node.js 18 or later
- Python 3.9 or later
- MongoDB (for local development)

## Setup Instructions

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements-dev.txt
```

### 2. Configure Environment Variables

Create a `.env.test` file in the `tests/integration` directory with the following variables:

```
# Database
MONGODB_URI=mongodb://localhost:27017/varai_test
MONGODB_USER=test_user
MONGODB_PASSWORD=test_password

# API
API_URL=http://localhost:3000
API_KEY=test_api_key

# Authentication
AUTH_SECRET=test_secret
AUTH_ISSUER=varai-test
AUTH_AUDIENCE=varai-api-test

# E-commerce Platforms
SHOPIFY_API_KEY=test_shopify_key
SHOPIFY_API_SECRET=test_shopify_secret
MAGENTO_API_KEY=test_magento_key
WOOCOMMERCE_API_KEY=test_woocommerce_key
BIGCOMMERCE_API_KEY=test_bigcommerce_key

# Test Configuration
TEST_TIMEOUT=30000
TEST_RETRIES=3
```

### 3. Start the Test Environment

```bash
# Start the test environment
npm run test:env:up
```

This command starts the necessary Docker containers and initializes the test databases.

### 4. Run Tests

```bash
# Run all integration tests
npm run test:integration

# Run a specific test suite
npm run test:integration -- --suite=auth
```

### 5. Tear Down the Test Environment

```bash
# Stop and remove the test environment
npm run test:env:down
```

## Docker Compose Configuration

The test environment is defined in `docker-compose.test.yml`. The file includes:

- Service containers
- Database containers
- Mock server containers
- Network configuration
- Volume configuration

## Test Data

Test data is loaded into the test databases during environment setup. The test data includes:

- User accounts with different roles
- Product data
- Customer data
- Order data
- Configuration data

The test data is defined in JSON files in the `tests/integration/fixtures` directory.

## Mock Servers

External services are mocked using mock servers. The mock servers are implemented using:

- [Mockoon](https://mockoon.com/) for HTTP services
- Custom mock implementations for other services

The mock server configurations are defined in the `tests/integration/mocks` directory.

## Containerized Services

Each service runs in its own container. The containers are defined in the `docker-compose.test.yml` file and include:

- API service
- Authentication service
- Recommendation service
- Analytics service
- Virtual try-on service
- E-commerce integration services

## Database Setup

The test databases are created and initialized during environment setup. The database setup includes:

- Creating databases
- Creating collections
- Creating indexes
- Loading test data

## Troubleshooting

### Common Issues

#### Docker Containers Not Starting

If Docker containers fail to start, check:

- Docker daemon is running
- Ports are not in use
- Environment variables are set correctly

#### Tests Failing Due to Timeouts

If tests fail due to timeouts, check:

- Services are running
- Network connectivity between services
- Test timeout configuration

#### Database Connection Issues

If tests fail due to database connection issues, check:

- MongoDB is running
- Connection string is correct
- Authentication credentials are correct

### Logs

Logs for the test environment are available in:

- Docker container logs
- Test output
- Log files in the `logs` directory

To view Docker container logs:

```bash
docker-compose -f docker-compose.test.yml logs [service]
```

## CI/CD Integration

The test environment is automatically set up and torn down in the CI/CD pipeline. The CI/CD pipeline includes:

1. Setting up the test environment
2. Running the tests
3. Collecting test results
4. Tearing down the test environment

The CI/CD configuration is defined in `.github/workflows/integration-tests.yml`.