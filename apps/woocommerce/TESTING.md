# VARAi for WooCommerce Testing Guide

This document outlines the testing approach for the VARAi for WooCommerce plugin.

## Testing Architecture

The plugin uses a comprehensive testing approach with both PHP and JavaScript tests:

1. **PHP Unit Tests**: For testing PHP classes and functionality
2. **JavaScript Tests**: For testing frontend components and interactions
3. **Integration Tests**: For testing the integration with WooCommerce
4. **End-to-End Tests**: For testing the complete user flow

## Setting Up the Testing Environment

### PHP Unit Tests

1. Install PHPUnit and WordPress testing library:

```bash
composer require --dev phpunit/phpunit yoast/phpunit-polyfills
composer require --dev wp-phpunit/wp-phpunit
```

2. Set up the WordPress test environment:

```bash
bash bin/install-wp-tests.sh wordpress_test root '' localhost latest
```

3. Run the tests:

```bash
vendor/bin/phpunit
```

### JavaScript Tests

1. Install dependencies:

```bash
npm install
```

2. Run the tests:

```bash
npm test
```

## Test Structure

### PHP Tests

PHP tests are located in the `tests` directory and follow the same structure as the plugin's classes:

- `tests/class-varai-api-test.php`: Tests for the VARAi API class
- `tests/class-varai-product-test.php`: Tests for the VARAi Product class
- `tests/class-varai-settings-test.php`: Tests for the VARAi Settings class
- `tests/class-varai-analytics-test.php`: Tests for the VARAi Analytics class

### JavaScript Tests

JavaScript tests are located in the `tests/js` directory:

- `tests/js/analytics.test.js`: Tests for the analytics.js file
- `tests/js/virtual-try-on.test.js`: Tests for the virtual-try-on.js file
- `tests/js/recommendations.test.js`: Tests for the recommendations.js file
- `tests/js/product-comparison.test.js`: Tests for the product-comparison.js file

## Writing Tests

### PHP Tests

PHP tests use PHPUnit and the WordPress testing framework. Here's an example of a test for the VARAi API class:

```php
class VARAi_API_Test extends WP_UnitTestCase {
    public function test_get_recommendations() {
        // Arrange
        $api = new VARAi_API();
        
        // Act
        $recommendations = $api->get_recommendations(123);
        
        // Assert
        $this->assertIsArray($recommendations);
    }
}
```

### JavaScript Tests

JavaScript tests use Jest and the Testing Library. Here's an example of a test for the analytics.js file:

```javascript
describe('VARAi Analytics', () => {
    test('should track events', () => {
        // Arrange
        const trackEventSpy = jest.spyOn(VARAnalytics, 'trackEvent');
        
        // Act
        VARAnalytics.trackEvent('view_item');
        
        // Assert
        expect(trackEventSpy).toHaveBeenCalledWith('view_item');
    });
});
```

## Test Coverage

The goal is to maintain at least 80% code coverage for both PHP and JavaScript code. You can check the current coverage by running:

```bash
# PHP coverage
vendor/bin/phpunit --coverage-html coverage-php

# JavaScript coverage
npm run test:coverage
```

## Continuous Integration

The plugin uses GitHub Actions for continuous integration. The workflow is defined in `.github/workflows/test.yml` and runs the following checks:

1. PHP Linting
2. PHP Unit Tests
3. JavaScript Linting
4. JavaScript Tests

## Manual Testing Checklist

In addition to automated tests, the following manual tests should be performed before each release:

### Installation and Setup

- [ ] Plugin installs without errors
- [ ] Plugin activates without errors
- [ ] Settings page loads correctly
- [ ] API key can be entered and saved

### Product Configuration

- [ ] Frame details can be entered and saved
- [ ] Virtual try-on can be enabled and disabled
- [ ] Style score can be set
- [ ] Style tags can be added

### Frontend Features

- [ ] Virtual try-on button appears on product pages
- [ ] Virtual try-on modal opens and works correctly
- [ ] Recommendations appear on product pages
- [ ] Product comparison works correctly
- [ ] Style scores are displayed correctly

### Analytics

- [ ] Events are tracked correctly
- [ ] GA4 integration works
- [ ] Analytics dashboard shows data

## Troubleshooting Tests

If you encounter issues with the tests, try the following:

1. Make sure all dependencies are installed:
   ```bash
   composer install
   npm install
   ```

2. Reset the test database:
   ```bash
   bash bin/install-wp-tests.sh wordpress_test root '' localhost latest
   ```

3. Clear the Jest cache:
   ```bash
   npx jest --clearCache
   ```

4. Check for PHP errors in the WordPress debug log.

## Contributing Tests

When contributing new features or fixing bugs, please include tests that cover your changes. This helps ensure that the plugin remains stable and reliable.

For more information on writing tests, see:
- [PHPUnit Documentation](https://phpunit.de/documentation.html)
- [WordPress Testing Documentation](https://make.wordpress.org/core/handbook/testing/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)