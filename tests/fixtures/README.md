# Test Fixtures

This directory contains test fixtures used by the automated test suite.

## Images

The `images` directory contains sample images used for testing the virtual try-on functionality:

- `face-front.jpg`: Front-facing portrait for face shape detection
- `face-side.jpg`: Side profile for additional measurements
- `face-angle.jpg`: Angled portrait for 3D model fitting

These images are used in the virtual try-on tests to verify that face shape detection and 3D model rendering work correctly.

## Usage

To use these fixtures in tests:

```javascript
const path = require('path');

// Get path to test image
const testImagePath = path.resolve(__dirname, '../fixtures/images/face-front.jpg');

// Use in file upload test
await fileChooser.setFiles(testImagePath);
```

## Adding New Fixtures

When adding new fixtures:

1. Add the fixture file to the appropriate subdirectory
2. Update this README with a description of the fixture
3. Make sure the fixture is appropriately sized (compress images, minify JSON, etc.)
4. Include attribution if the fixture is from an external source