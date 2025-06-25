# End-to-End Tests for SKU-Genie Store

This directory contains end-to-end tests for the SKU-Genie store, recommendation engine, A/B testing framework, and analytics dashboard. The tests are written using Cypress, a modern end-to-end testing framework.

## Test Structure

The tests are organized into the following files:

- `store.spec.js` - Tests for the basic store functionality
- `recommendations.spec.js` - Tests for the recommendation engine
- `ab-testing.spec.js` - Tests for the A/B testing framework
- `virtual-try-on.spec.js` - Tests for the virtual try-on feature
- `dashboard.spec.js` - Tests for the analytics dashboard

## Running the Tests

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

From the `apps/html-store` directory, run:

```bash
npm install
```

This will install Cypress and other dependencies required for running the tests.

### Running All Tests

To run all tests in headless mode:

```bash
npm test
```

To open the Cypress Test Runner:

```bash
npm run test:open
```

### Running Specific Test Suites

To run specific test suites:

```bash
# Run store tests
npm run test:store

# Run recommendation engine tests
npm run test:recommendations

# Run A/B testing framework tests
npm run test:ab-testing

# Run virtual try-on tests
npm run test:virtual-try-on

# Run dashboard tests
npm run test:dashboard
```

### Running Tests with the Server

To start the HTTP server and run the tests:

```bash
npm run test:ci
```

This will start an HTTP server on port 8080 and run the tests against it.

## Test Data

The tests use fixture data located in the `fixtures` directory:

- `products.json` - Sample product data
- `recommendations.json` - Sample recommendation data
- `ab-testing.json` - Sample A/B testing data

## Custom Commands

The tests use custom commands defined in `support/commands.js` to simplify common operations:

- `visitStore()` - Navigate to the store homepage
- `visitDashboard()` - Navigate to the dashboard
- `openProductDetails(productName)` - Open product details for a specific product
- `filterByFaceShape(faceShape)` - Filter products by face shape
- `filterByBrand(brand)` - Filter products by brand
- `resetFilters()` - Reset all filters
- `openVirtualTryOn(productName)` - Open the virtual try-on modal
- `changeTryOnFaceShape(faceShape)` - Change face shape in virtual try-on
- `tryOnNextProduct()` - Navigate to next product in try-on
- `tryOnPreviousProduct()` - Navigate to previous product in try-on
- `changeDateRange(range)` - Change date range in dashboard
- `switchDashboardTab(tabName)` - Switch to a specific dashboard tab
- `mockProducts(products)` - Mock API response for products
- `mockRecommendations(recommendations)` - Mock API response for recommendations
- `mockABTestData(testData)` - Mock API response for A/B testing data
- `shouldHaveProductCount(count)` - Assert that a specific number of products are displayed
- `shouldShowRecommendations()` - Assert that recommendations are displayed
- `shouldRenderChart(chartId)` - Assert that a chart is properly rendered

## Continuous Integration

These tests can be integrated into a CI/CD pipeline using the `test:ci` script. This script starts the server and runs the tests, making it suitable for automated testing in CI environments.

## Troubleshooting

If you encounter issues running the tests:

1. Make sure all dependencies are installed: `npm install`
2. Check that the server is running on port 8080
3. Try running the tests in headed mode: `npx cypress run --headed`
4. Check the Cypress logs in the `cypress/logs` directory
5. Verify that the fixture data is correctly formatted

## Adding New Tests

To add new tests:

1. Create a new spec file in the `integration` directory
2. Add any required fixture data to the `fixtures` directory
3. Add any custom commands to `support/commands.js`
4. Add a new script to `package.json` to run the new tests