# Test Fixtures

This directory contains test fixtures used by the integration tests. These fixtures include test data, mock responses, and other resources needed for testing.

## Directory Structure

- `images/` - Test images for virtual try-on tests
- `mock-responses/` - Mock API responses for testing
- `test-data/` - Test data for various test scenarios

## Test Images

The `images/` directory contains test images for virtual try-on tests:

- `face-front.jpg` - Front-facing portrait for face shape detection
- `face-side.jpg` - Side profile portrait
- `face-angle.jpg` - Angled portrait
- `no-face.jpg` - Image without a face (for negative testing)
- `multiple-faces.jpg` - Image with multiple faces (for negative testing)

## Mock Responses

The `mock-responses/` directory contains JSON files with mock API responses for testing:

- `auth/` - Authentication API responses
- `recommendations/` - Recommendation API responses
- `virtual-try-on/` - Virtual try-on API responses
- `analytics/` - Analytics API responses
- `e-commerce/` - E-commerce platform API responses

## Test Data

The `test-data/` directory contains JSON files with test data for various test scenarios:

- `users.json` - Test user accounts
- `products.json` - Test product data
- `tenants.json` - Test tenant data
- `face-shapes.json` - Face shape data for testing
- `recommendations.json` - Recommendation data for testing

## Generated Files

Some files in this directory are generated during test setup and are not committed to the repository:

- `ui-test-users.json` - Generated during Playwright setup to store UI test user credentials

## Usage

Fixtures can be loaded in tests using the following pattern:

```javascript
// Load a fixture
const testUsers = require('../fixtures/test-data/users.json');

// Use the fixture in a test
test('should login with test user', async () => {
  const testUser = testUsers[0];
  // ...
});
```

For image fixtures, use the path to the image file:

```javascript
const path = require('path');
const faceImagePath = path.resolve(__dirname, '../fixtures/images/face-front.jpg');

// Use the image in a test
const formData = new FormData();
formData.append('image', fs.createReadStream(faceImagePath));