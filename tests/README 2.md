# VARAi E-commerce Integration Tests

This directory contains the comprehensive test suite for VARAi e-commerce platform integrations, including Shopify, Magento, WooCommerce, and BigCommerce.

## Directory Structure

```
tests/
├── e2e/                      # End-to-end tests
│   ├── docker-compose.yml    # Docker configuration for E2E tests
│   ├── package.json          # Dependencies and scripts for E2E tests
│   ├── playwright.config.js  # Playwright configuration
│   ├── product-sync.test.js  # Product synchronization tests
│   ├── virtual-try-on.test.js # Virtual try-on functionality tests
│   ├── recommendations.test.js # Recommendation engine tests
│   ├── webhook-handling.test.js # Webhook handling tests
│   └── integration-monitoring.test.js # Integration monitoring tests
├── fixtures/                 # Test fixtures and mock data
│   └── images/               # Test images for virtual try-on
├── mocks/                    # Mock servers and API responses
│   └── server.js             # Mock API server
├── scripts/                  # Test utility scripts
│   ├── generate-test-report.js # Test report generation
│   └── check-coverage.js     # Coverage threshold checking
├── TESTING_STRATEGY.md       # Comprehensive testing strategy documentation
└── README.md                 # This file
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Access to test accounts for each platform

### Installation

1. Install dependencies for E2E tests:

```bash
cd tests/e2e
npm install
npm run install:browsers
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your test credentials
```

### Running Tests

#### End-to-End Tests

Start the Docker environment:

```bash
cd tests/e2e
npm run docker:up
```

Run all E2E tests:

```bash
npm test
```

Run specific test suites:

```bash
npm run test:product-sync
npm run test:virtual-try-on
npm run test:recommendations
npm run test:webhook-handling
npm run test:integration-monitoring
```

Run tests in headed mode (with browser UI):

```bash
npm run test:headed
```

Debug tests:

```bash
npm run test:debug
```

View test report:

```bash
npm run report
```

Stop the Docker environment:

```bash
npm run docker:down
```

#### Platform-Specific Tests

Each platform has its own test suite in the respective app directory:

- Shopify: `cd apps/shopify && npm test`
- Magento: `cd apps/magento && npm test`
- WooCommerce: `cd apps/woocommerce && npm test`
- BigCommerce: `cd apps/bigcommerce && npm test`

## Test Documentation

For detailed information about the testing strategy, see [TESTING_STRATEGY.md](./TESTING_STRATEGY.md).

## CI/CD Integration

The test suite is integrated with GitHub Actions. The workflow configuration is in `.github/workflows/integration-tests.yml`.

The CI pipeline runs:
1. Linting
2. Unit tests
3. Integration tests
4. E2E tests
5. Test report generation
6. Coverage checking

## Test Reports

Test reports are generated in the `test-results` directory:

- Playwright report: `test-results/playwright-report/`
- JUnit report: `test-results/junit-report.xml`
- Coverage report: `test-results/coverage/`
- Combined HTML report: `test-results/report/index.html`

## Troubleshooting

### Common Issues

1. **Tests fail with "Cannot connect to API" errors**
   - Check that the mock API server is running
   - Verify API key configuration

2. **E2E tests fail with "Element not found" errors**
   - Check that the platform UI hasn't changed
   - Update selectors in the test files

3. **Docker issues**
   - Make sure Docker is running
   - Try rebuilding the containers: `docker-compose build --no-cache`

4. **Permission issues**
   - Make sure you have write permissions to the test-results directory

For more troubleshooting tips, see the [Troubleshooting section](./TESTING_STRATEGY.md#troubleshooting) in the testing strategy document.

## Contributing

When adding new tests:

1. Follow the existing test structure and naming conventions
2. Add appropriate documentation
3. Ensure tests are isolated and don't depend on external state
4. Add the test to the appropriate npm script in `package.json`
5. Update the CI workflow if necessary

## License

This test suite is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.