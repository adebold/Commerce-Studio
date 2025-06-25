# Testing VARAi Magento Integration

This document provides instructions for testing the VARAi Magento integration module.

## Unit Tests

### PHP Unit Tests

The module includes PHP unit tests for testing the backend functionality.

#### Prerequisites

- PHPUnit 9.0+
- Magento 2 testing framework

#### Running PHP Unit Tests

1. Navigate to your Magento root directory
2. Run the following command:

```bash
vendor/bin/phpunit -c dev/tests/unit/phpunit.xml.dist app/code/VARAi/Core/Test/Unit
```

### JavaScript Unit Tests

The module includes JavaScript unit tests for testing the frontend functionality.

#### Prerequisites

- Node.js 14.0+
- npm 6.0+

#### Installing Dependencies

1. Navigate to the module directory:

```bash
cd app/code/VARAi/Core
```

2. Install dependencies:

```bash
npm install
```

#### Running JavaScript Tests

1. Run all tests:

```bash
npm test
```

2. Run tests with coverage:

```bash
npm run test:coverage
```

3. Run tests in watch mode (for development):

```bash
npm run test:watch
```

## Integration Tests

### Prerequisites

- Magento 2 integration test framework
- MySQL database for testing

### Running Integration Tests

1. Configure your integration test environment in `dev/tests/integration/etc/install-config-mysql.php`
2. Run the integration tests:

```bash
vendor/bin/phpunit -c dev/tests/integration/phpunit.xml.dist app/code/VARAi/Core/Test/Integration
```

## Manual Testing

### Virtual Try-On Feature

1. Log in to Magento admin
2. Go to Stores > Configuration > VARAi > Settings
3. Enable VARAi and Virtual Try-On
4. Save configuration
5. Clear cache
6. Go to a product page on the frontend
7. Verify that the "Try On Virtually" button appears
8. Click the button and verify that the virtual try-on modal opens
9. Test the virtual try-on functionality

### Recommendations Feature

1. Log in to Magento admin
2. Go to Stores > Configuration > VARAi > Settings
3. Enable VARAi and Recommendations
4. Save configuration
5. Clear cache
6. Go to a product page on the frontend
7. Verify that product recommendations appear
8. Click on a recommended product and verify that tracking works

### Analytics Feature

1. Log in to Magento admin
2. Go to Stores > Configuration > VARAi > Settings
3. Enable VARAi and Analytics
4. Configure GA4 Measurement ID if needed
5. Save configuration
6. Clear cache
7. Go to a product page on the frontend
8. Use browser developer tools to verify that analytics events are being tracked

## Troubleshooting

### Common Issues

1. **Tests fail with "Class not found" errors**
   - Make sure autoloader is properly configured
   - Check namespace declarations in test files

2. **JavaScript tests fail with "Cannot find module" errors**
   - Run `npm install` to install dependencies
   - Check import paths in test files

3. **Integration tests fail with database errors**
   - Check database configuration in `dev/tests/integration/etc/install-config-mysql.php`
   - Ensure database user has proper permissions

### Debugging

- For PHP tests, add `--debug` flag to PHPUnit command
- For JavaScript tests, add `JEST_VERBOSE=true` environment variable:

```bash
JEST_VERBOSE=true npm test
```

## Continuous Integration

The module is configured to run tests automatically in GitHub Actions. The workflow:

1. Runs PHP unit tests
2. Runs JavaScript unit tests
3. Runs integration tests
4. Generates coverage reports
5. Fails the build if tests fail or coverage is below threshold

You can view test results in the GitHub Actions tab of the repository.
