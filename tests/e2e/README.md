# EyewearML End-to-End Tests

This directory contains end-to-end tests for the EyewearML platform.

## Test Coverage

The tests in this directory verify complete system functionality:

1. **Authentication Tests** (`test_authentication.py`)
   - User login flows (success/failure)
   - API authentication validation

2. **Region-Aware Tests** (`test_region_aware.py`)
   - Region-specific routing (NA/EU)
   - Data handling based on region
   - Regional fallback capabilities

3. **External Integration Tests** (`test_external_integrations.py`)
   - DeepSeek API integration
   - Correlation Platform integration
   - Google Vertex AI integration
   - Multi-service recommendation flows

4. **User Journey Tests** (`test_user_journeys.py`)
   - Complete new user journey
   - Returning user journey
   - Client portal journey for opticians

## Running the Tests

There are two methods to run the tests: directly on your local machine or using our dedicated Docker setup.

### Method 1: Running Locally

#### Prerequisites

- Python 3.9 or newer
- Docker and Docker Compose installed
- Chrome browser (for Selenium tests)

#### Setup

1. Install the required dependencies:

```bash
# Install E2E test dependencies
pip install -r tests/e2e/requirements-e2e.txt
```

2. Make sure Docker is running and available.

#### Running All Tests

To run all end-to-end tests:

```bash
pytest tests/e2e -v
```

#### Running Specific Test Categories

To run specific test categories:

```bash
# Authentication tests only
pytest tests/e2e/test_authentication.py -v

# Region-aware tests only
pytest tests/e2e/test_region_aware.py -v

# External integration tests only
pytest tests/e2e/test_external_integrations.py -v

# User journey tests only
pytest tests/e2e/test_user_journeys.py -v
```

#### Running a Specific Test

To run a specific test:

```bash
pytest tests/e2e/test_authentication.py::test_successful_login -v
```

### Method 2: Running with Docker (Recommended)

This method uses a dedicated Docker setup that ensures compatibility between TensorFlow and Python versions.

#### Prerequisites

- Docker and Docker Compose installed

#### Running Tests Using the Script

We've provided scripts that handle the Docker setup for you:

##### On Linux/macOS:

```bash
# Make the script executable
chmod +x run-e2e-tests.sh

# Run all tests
./run-e2e-tests.sh

# Run a specific test or test file
./run-e2e-tests.sh tests/e2e/test_authentication.py
```

##### On Windows:

```powershell
# Run all tests
.\run-e2e-tests.ps1

# Run a specific test or test file
.\run-e2e-tests.ps1 tests/e2e/test_authentication.py
```

#### Manual Docker Execution

If you prefer to run commands manually:

```bash
# Start the Docker environment
docker-compose -f docker-compose.e2e.yml up -d

# Run all tests
docker-compose -f docker-compose.e2e.yml exec e2e-test-runner pytest tests/e2e -v

# Run a specific test file
docker-compose -f docker-compose.e2e.yml exec e2e-test-runner pytest tests/e2e/test_authentication.py -v

# Clean up when done
docker-compose -f docker-compose.e2e.yml down --volumes
```

## Test Data

Test data is stored in the `test_data` directory:

- `users.json`: Test user accounts for different regions and roles
- `frames.json`: Sample frame data used in tests

## Test Architecture

- `conftest.py`: Contains Pytest fixtures for setting up test environments
- `page_objects/`: Page object models for the frontend UI
- `utils/`: Utility functions for Docker control, API access, etc.

## Important Notes

1. Tests clean up after themselves, but if a test fails, you may need to manually stop Docker containers.
2. Some tests simulate failures by stopping services - check Docker status if tests fail unexpectedly.
3. The first run will take longer as it builds the Docker containers.
