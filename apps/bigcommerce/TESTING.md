# VARAi for BigCommerce Testing Guide

This document outlines the testing approach for the VARAi for BigCommerce app.

## Testing Architecture

The app uses a comprehensive testing approach with both TypeScript and JavaScript tests:

1. **Unit Tests**: For testing individual components and functions
2. **Integration Tests**: For testing the integration with BigCommerce API
3. **End-to-End Tests**: For testing the complete user flow
4. **Visual Regression Tests**: For testing UI components

## Setting Up the Testing Environment

### Unit Tests

1. Install dependencies:

```bash
npm install
```

2. Run the tests:

```bash
npm test
```

### Integration Tests

1. Set up environment variables:

```bash
cp .env.example .env.test
```

2. Edit `.env.test` with your BigCommerce API credentials:

```
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
ACCESS_TOKEN=your_access_token
STORE_HASH=your_store_hash
VARAI_API_KEY=your_varai_api_key
```

3. Run the integration tests:

```bash
npm run test:integration
```

## Test Structure

### Unit Tests

Unit tests are located in the `tests/unit` directory and follow the same structure as the app's modules:

- `tests/unit/api-client.test.ts`: Tests for the ApiClient class
- `tests/unit/analytics.test.ts`: Tests for the Analytics class
- `tests/unit/virtual-try-on.test.ts`: Tests for the VirtualTryOn class
- `tests/unit/index.test.ts`: Tests for the public API

### Integration Tests

Integration tests are located in the `tests/integration` directory:

- `tests/integration/api-client.test.ts`: Tests for the ApiClient class with real API calls
- `tests/integration/webhooks.test.ts`: Tests for webhook functionality

### End-to-End Tests

End-to-end tests are located in the `tests/e2e` directory:

- `tests/e2e/installation.test.ts`: Tests for the app installation flow
- `tests/e2e/admin-ui.test.ts`: Tests for the admin UI
- `tests/e2e/storefront.test.ts`: Tests for the storefront functionality

## Writing Tests

### Unit Tests

Unit tests use Jest and Testing Library. Here's an example of a test for the ApiClient class:

```typescript
import { ApiClient } from '../../lib/api-client';

describe('ApiClient', () => {
  let apiClient: ApiClient;
  
  beforeEach(() => {
    apiClient = new ApiClient({
      clientId: 'test-client-id',
      accessToken: 'test-access-token',
      storeHash: 'test-store-hash',
      varaiApiKey: '${APIKEY_2516}'
    });
  });
  
  test('getProduct should return product data', async () => {
    // Mock the BigCommerce API response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        id: 123,
        name: 'Test Product',
        // ...other product data
      })
    });
    
    const product = await apiClient.getProduct(123);
    
    expect(product).toHaveProperty('id', 123);
    expect(product).toHaveProperty('name', 'Test Product');
  });
});
```

### Integration Tests

Integration tests use real API calls to test the integration with BigCommerce. Here's an example:

```typescript
import { ApiClient } from '../../lib/api-client';
import dotenv from 'dotenv';

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

describe('ApiClient Integration', () => {
  let apiClient: ApiClient;
  
  beforeEach(() => {
    apiClient = new ApiClient({
      clientId: process.env.CLIENT_ID!,
      accessToken: process.env.ACCESS_TOKEN!,
      storeHash: process.env.STORE_HASH!,
      varaiApiKey: process.env.VARAI_API_KEY!
    });
  });
  
  test('getProduct should return real product data', async () => {
    // Use a real product ID from your store
    const productId = 123;
    
    const product = await apiClient.getProduct(productId);
    
    expect(product).toHaveProperty('id', productId);
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
  });
});
```

## Test Coverage

The goal is to maintain at least 80% code coverage for both TypeScript and JavaScript code. You can check the current coverage by running:

```bash
npm run test:coverage
```

## Continuous Integration

The app uses GitHub Actions for continuous integration. The workflow is defined in `.github/workflows/test.yml` and runs the following checks:

1. TypeScript Linting
2. Unit Tests
3. Integration Tests (with mock API responses)
4. Build Check

## Manual Testing Checklist

In addition to automated tests, the following manual tests should be performed before each release:

### Installation and Setup

- [ ] App installs without errors
- [ ] App activates without errors
- [ ] Settings page loads correctly
- [ ] API key can be entered and saved

### Product Configuration

- [ ] Frame details can be entered and saved
- [ ] Virtual try-on can be enabled and disabled
- [ ] Style score can be set
- [ ] Face shape compatibility can be configured
- [ ] Style tags can be added

### Frontend Features

- [ ] Virtual try-on button appears on product pages
- [ ] Virtual try-on modal opens and works correctly
- [ ] Face shape detection works correctly
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
   npm install
   ```

2. Clear the Jest cache:
   ```bash
   npx jest --clearCache
   ```

3. Check for TypeScript errors:
   ```bash
   npm run lint
   ```

4. Check the environment variables in `.env.test`.

## Contributing Tests

When contributing new features or fixing bugs, please include tests that cover your changes. This helps ensure that the app remains stable and reliable.

For more information on writing tests, see:
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Documentation](https://testing-library.com/docs/)
- [BigCommerce API Documentation](https://developer.bigcommerce.com/docs)