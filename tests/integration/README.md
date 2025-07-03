# VARAi Integration Testing Framework

This directory contains the integration testing framework for the VARAi platform. The tests verify the integration between different components of the platform and ensure that the system works correctly as a whole.

## Test Organization

The integration tests are organized into the following directories:

- `auth/` - Tests for user authentication flows
- `recommendations/` - Tests for product recommendation flows
- `virtual-try-on/` - Tests for virtual try-on functionality
- `analytics/` - Tests for analytics data collection
- `e-commerce/` - Tests for e-commerce platform integrations
- `multi-tenant/` - Tests for multi-tenant functionality
- `performance/` - Tests for performance benchmarking and load testing
- `environments/` - Test environment setup and configuration
- `utils/` - Utility functions and helpers for testing

## Running Tests

To run all integration tests:

```bash
npm run test:integration
```

To run a specific test suite:

```bash
npm run test:integration -- --suite=auth
```

## Test Environment

The integration tests use isolated test environments to ensure that tests don't interfere with each other. The test environments are created and destroyed automatically as part of the test run.

See the `environments/` directory for more information on test environment setup and configuration.

## Documentation

For more detailed information on the integration testing framework, see the following documents:

- [Integration Test Strategy](./docs/strategy.md)
- [Test Environment Setup Guide](./docs/environment-setup.md)
- [Test Case Documentation](./docs/test-cases.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)