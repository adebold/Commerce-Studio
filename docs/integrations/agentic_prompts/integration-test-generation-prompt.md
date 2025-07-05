# E-commerce Integration Test Generation Prompt

## Context
We need to create comprehensive end-to-end tests for our e-commerce integrations to ensure reliability across merchant storefronts. The tests need to validate the complete user journey from platform connection to order processing.

## Testing Framework

Our E2E testing uses:
- Playwright for browser automation
- Jest for assertions and test structure
- MSW (Mock Service Worker) for API mocking
- Custom test helpers for common operations

Test files are structured as follows:

```typescript
// Import testing utilities and fixtures
import { test, expect } from '@playwright/test';
import { mockShopifyEndpoints } from '../mocks/shopify-api-mock';
import { setupMerchantAccount } from '../helpers/merchant-setup';
import { generateTestProducts } from '../helpers/test-data-generator';

// Test suite for specific platform
test.describe('Shopify Integration', () => {
  // Setup before tests
  test.beforeEach(async ({ page, context }) => {
    // Set up mocks and test environment
    await mockShopifyEndpoints(context);
    
    // Additional setup as needed
  });
  
  // Individual test cases
  test('should connect to Shopify store via OAuth', async ({ page }) => {
    // Test implementation
  });
  
  test('should sync products to Shopify', async ({ page }) => {
    // Test implementation
  });
  
  // More test cases...
});
```

## Test Requirements

### Authentication Tests

1. **OAuth Authentication Test**
   - Verify the complete OAuth flow
   - Test handling of authentication errors
   - Verify token storage and refresh logic
   - Test permission scope validation

2. **API Key Authentication Test (where applicable)**
   - Verify API key validation
   - Test invalid API key scenarios
   - Verify secure storage of credentials

### Data Synchronization Tests

1. **Product Sync Tests**
   - Test syncing new products to platform
   - Test updating existing products
   - Test handling large product catalogs (performance)
   - Verify eyewear-specific attributes are mapped correctly
   - Test image synchronization

2. **Inventory Sync Tests**
   - Test inventory quantity updates
   - Test multi-location inventory (where applicable)
   - Verify inventory sync error handling

3. **Order Sync Tests**
   - Test capturing new orders from platform
   - Test order status updates
   - Verify prescription data handling
   - Test fulfillment updates

### Webhook Tests

1. **Webhook Registration Tests**
   - Verify automatic webhook registration
   - Test webhook signature validation
   - Verify handling of webhook delivery failures

2. **Event Processing Tests**
   - Test processing product update events
   - Test processing order events
   - Test inventory update events
   - Verify event queuing and retry logic

### Error Handling Tests

1. **API Error Tests**
   - Test handling of rate limits
   - Test handling of temporary outages
   - Verify retry logic with exponential backoff
   - Test logging and error reporting

2. **Data Validation Tests**
   - Test handling of invalid product data
   - Test handling of incompatible attributes
   - Verify validation error reporting

### User Interface Tests

1. **Merchant Dashboard Tests**
   - Test integration status display
   - Verify metrics display accuracy
   - Test manual sync triggers
   - Verify error logs and filtering
   - Test platform settings configuration

2. **Setup Wizard Tests**
   - Test complete merchant onboarding flow
   - Verify platform selection interface
   - Test app selection and configuration
   - Verify initial sync process

## Test Data Requirements

Tests should use these types of test data:

1. **Platform-Specific Test Fixtures**
   - Mock API responses that match platform schemas
   - Simulated webhook payloads
   - Authentication tokens and refresh tokens

2. **Product Test Data**
   - Various eyewear product types (frames, sunglasses, etc.)
   - Products with multiple variants and options
   - Products with various images and attributes
   - Edge cases (extremely long descriptions, special characters)

3. **Order Test Data**
   - Orders with different payment statuses
   - Orders with prescription data
   - Orders with special requirements
   - Multiple shipping/billing scenarios

## Mocking Requirements

1. **API Mocking**
   - Mock all external platform API endpoints
   - Simulate rate limiting and errors
   - Provide configurable response delays
   - Support different API versions

2. **Authentication Mocking**
   - Simulate OAuth redirects and tokens
   - Mock refresh token scenarios
   - Simulate authentication errors

## Test Coverage Requirements

Tests should achieve:
- 95%+ coverage of integration code
- 100% coverage of critical paths (authentication, sync)
- All error handling scenarios covered
- Performance testing for large data sets

## Platform-Specific Considerations

### {PLATFORM_NAME} Specific Requirements

1. **API Versioning**
   - Tests should validate against API version {API_VERSION}
   - Include version compatibility checks

2. **Special Features**
   - Test {PLATFORM_SPECIFIC_FEATURE_1}
   - Verify handling of {PLATFORM_SPECIFIC_EDGE_CASE}

3. **Known Limitations**
   - Test graceful handling of {PLATFORM_LIMITATION}
   - Verify user feedback for unsupported features

## Expected Output

Please provide a complete test suite for {PLATFORM_NAME} integration that includes:

1. The main test file structure with all test cases described above
2. Mock setup for {PLATFORM_NAME} API endpoints
3. Helper functions specific to {PLATFORM_NAME} testing
4. Any additional test utilities needed

The tests should be comprehensive, maintainable, and follow our best practices:
- Use page object pattern for UI interactions
- Implement proper test isolation
- Include informative test descriptions
- Add appropriate assertions with helpful error messages
- Follow AAA (Arrange-Act-Assert) pattern
- Implement proper cleanup in afterEach/afterAll hooks

## Additional Notes

- We use a custom test reporter for integration with our CI/CD pipeline
- Test data should be generated programmatically where possible
- Include comments explaining complex test scenarios or setups
- Consider test execution time and optimize where possible
- Tests should be compatible with both local and CI environments
