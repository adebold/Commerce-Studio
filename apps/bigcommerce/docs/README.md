# VARAi for BigCommerce Documentation

This documentation provides detailed information about the VARAi for BigCommerce app, including installation, configuration, and usage.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Features](#features)
  - [Virtual Try-On](#virtual-try-on)
  - [Style Recommendations](#style-recommendations)
  - [Face Shape Compatibility](#face-shape-compatibility)
  - [Style Scoring](#style-scoring)
  - [Customer Measurements](#customer-measurements)
  - [Product Comparison](#product-comparison)
  - [Analytics Dashboard](#analytics-dashboard)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Overview

VARAi for BigCommerce is an AI-powered eyewear app that enhances the shopping experience for eyewear products. It provides features such as virtual try-on, style recommendations, face shape compatibility analysis, style scoring, customer measurements, product comparison, and analytics.

## Installation

### From BigCommerce App Store

1. Visit the [BigCommerce App Store](https://www.bigcommerce.com/apps/)
2. Search for "VARAi"
3. Click "Install" and follow the prompts
4. Configure your settings in the BigCommerce admin

### Manual Installation

1. Clone this repository
2. Install dependencies:
```bash
cd apps/bigcommerce
npm install
```

3. Build the app:
```bash
npm run build
```

4. Create a BigCommerce app in your [Developer Portal](https://devtools.bigcommerce.com/)
5. Update your `.env` file with your app credentials:
```env
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
AUTH_CALLBACK=https://your-domain.com/auth/callback
API_URL=https://api.varai.ai/v1
```

## Configuration

### Store Settings

1. Go to your BigCommerce admin
2. Navigate to Apps > VARAi > Settings
3. Configure the following:
   - API Key: Your VARAi API key
   - Analytics Settings: Configure GA4 integration and event tracking
   - Virtual Try-On Settings: Configure virtual try-on behavior
   - Recommendation Settings: Configure product recommendations
   - Face Shape Compatibility Settings: Configure face shape detection
   - Style Scoring Settings: Configure style scoring
   - Product Comparison Settings: Configure product comparison

### Product Settings

1. Edit a product in BigCommerce admin
2. Scroll to "VARAi Settings"
3. Configure:
   - Frame Measurements: Enter frame dimensions
   - Style Tags: Add style tags for better recommendations
   - Face Shape Compatibility: Select compatible face shapes
   - Style Score: View and adjust style score
   - Virtual Try-On Model: Upload 3D model for virtual try-on

## Features

### Virtual Try-On

The virtual try-on feature allows customers to see how eyewear products look on their face before purchasing.

#### Implementation

```javascript
import { addTryOnButton } from '@varai/bigcommerce';

// Add try-on button
addTryOnButton({
  container: document.getElementById('try-on'),
  productId: 123,
  buttonText: 'Try On Now',
  detectFaceShape: true
});

// Initialize virtual try-on
const tryOn = varai.VirtualTryOn({
  container: document.getElementById('try-on-view'),
  productId: 123,
  onSuccess: () => console.log('Try-on initialized'),
  onError: (error) => console.error('Try-on error:', error),
  onCapture: (imageData) => console.log('Photo captured:', imageData),
  onFaceShapeDetected: (faceShape) => console.log('Face shape detected:', faceShape),
  detectFaceShape: true,
  enableMeasurements: true
});
```

### Style Recommendations

The style recommendations feature provides personalized product recommendations based on style preferences, face shape, and other factors.

#### Implementation

```javascript
import { addRecommendations } from '@varai/bigcommerce';

// Add recommendations to a container
addRecommendations({
  container: document.getElementById('recommendations'),
  productId: 123,
  limit: 4,
  type: 'similar',
  faceShape: 'oval',
  stylePreference: ['modern', 'sleek']
});
```

### Face Shape Compatibility

The face shape compatibility feature analyzes a customer's face shape and recommends products that are compatible with that face shape.

#### Implementation

```javascript
import { addFaceShapeCompatibility } from '@varai/bigcommerce';

// Add face shape compatibility display
addFaceShapeCompatibility({
  container: document.getElementById('face-shape-compatibility'),
  productId: 123,
  faceShape: 'oval'
});
```

### Style Scoring

The style scoring feature evaluates products based on style metrics and provides a score that helps customers make informed decisions.

#### Implementation

```javascript
import { addStyleScore } from '@varai/bigcommerce';

// Add style score display
addStyleScore({
  container: document.getElementById('style-score'),
  productId: 123,
  showDetails: true
});
```

### Customer Measurements

The customer measurements feature allows customers to save their facial measurements for better fitting recommendations.

#### Implementation

```javascript
// Get customer measurements from virtual try-on
const measurements = tryOn.getMeasurements();

// Store measurements
await varai.apiClient.storeCustomerMeasurements(customerId, measurements);

// Get stored measurements
const storedMeasurements = await varai.apiClient.getCustomerMeasurements(customerId);
```

### Product Comparison

The product comparison feature allows customers to compare multiple products side-by-side.

#### Implementation

```javascript
import { addProductComparison } from '@varai/bigcommerce';

// Add product comparison
addProductComparison({
  container: document.getElementById('product-comparison'),
  productIds: [123, 456, 789],
  compareAttributes: ['style', 'measurements', 'price', 'rating'],
  title: 'Compare Frames'
});
```

### Analytics Dashboard

The analytics dashboard provides insights into customer behavior, product performance, and other metrics.

#### Implementation

```javascript
// Get analytics dashboard data
const dashboardData = await varai.analytics.getDashboardData();

// Display dashboard data
console.log('Views:', dashboardData.metrics.views);
console.log('Try-ons:', dashboardData.metrics.try_ons);
console.log('Top products:', dashboardData.top_products);
console.log('Face shape distribution:', dashboardData.face_shape_distribution);
```

## API Reference

### initialize(config)

Initialize the VARAi app.

```typescript
interface Config {
  clientId: string;
  accessToken: string;
  storeHash: string;
  varaiApiKey: string;
  ga4MeasurementId?: string;
  trackFaceShapeDetection?: boolean;
  trackStyleScoreViews?: boolean;
  trackProductComparisons?: boolean;
}
```

### addRecommendations(options)

Add product recommendations to a container.

```typescript
interface Options {
  container: HTMLElement;
  productId: number;
  limit?: number;
  type?: 'similar' | 'complementary' | 'style_based' | 'face_shape';
  faceShape?: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond';
  stylePreference?: string[];
}
```

### addTryOnButton(options)

Add a virtual try-on button.

```typescript
interface Options {
  container: HTMLElement;
  productId: number;
  buttonText?: string;
  detectFaceShape?: boolean;
}
```

### addProductComparison(options)

Add product comparison functionality.

```typescript
interface Options {
  container: HTMLElement;
  productIds: number[];
  compareAttributes?: string[];
  title?: string;
}
```

### addStyleScore(options)

Add style score display.

```typescript
interface Options {
  container: HTMLElement;
  productId: number;
  showDetails?: boolean;
}
```

### addFaceShapeCompatibility(options)

Add face shape compatibility display.

```typescript
interface Options {
  container: HTMLElement;
  productId: number;
  faceShape?: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond';
}
```

## Troubleshooting

### Common Issues

#### Virtual Try-On Not Working

- Check that the product has a virtual try-on model uploaded
- Ensure that the customer has granted camera access
- Check browser compatibility (WebRTC support required)
- Check console for JavaScript errors

#### Recommendations Not Showing

- Verify that the product has style tags configured
- Check that the VARAi API key is valid
- Check network requests for API errors
- Ensure that the container element exists in the DOM

#### Face Shape Detection Not Working

- Ensure that the customer has granted camera access
- Check lighting conditions (good lighting required for accurate detection)
- Verify that the face is properly positioned in the frame
- Check network requests for API errors

### Error Codes

- `ERR_CAMERA_ACCESS`: Camera access denied by user
- `ERR_API_KEY_INVALID`: Invalid VARAi API key
- `ERR_MODEL_NOT_FOUND`: Virtual try-on model not found for product
- `ERR_FACE_DETECTION_FAILED`: Failed to detect face in image
- `ERR_NETWORK`: Network error when communicating with VARAi API

## FAQ

### General

#### What is VARAi?

VARAi is an AI-powered platform for eyewear that provides features such as virtual try-on, style recommendations, face shape compatibility analysis, and more.

#### How does VARAi improve the shopping experience?

VARAi helps customers find the perfect eyewear by allowing them to virtually try on products, get personalized recommendations, understand their face shape compatibility, and compare products side-by-side.

### Virtual Try-On

#### How accurate is the virtual try-on?

The virtual try-on provides a realistic representation of how eyewear products will look on a customer's face. While it's not a perfect substitute for physically trying on products, it gives customers a good idea of how the products will look.

#### What browsers support virtual try-on?

Virtual try-on works on modern browsers that support WebRTC, including Chrome, Firefox, Safari, and Edge. Mobile browsers are also supported.

### Face Shape Detection

#### How accurate is the face shape detection?

The face shape detection algorithm has been trained on a large dataset of faces and provides accurate results in most cases. However, factors such as lighting, camera angle, and hair coverage can affect accuracy.

#### What face shapes are supported?

VARAi supports the following face shapes: oval, round, square, heart, oblong, and diamond.

### Style Recommendations

#### How are style recommendations generated?

Style recommendations are generated using a combination of factors, including style tags, face shape compatibility, customer preferences, and product popularity.

#### Can I customize the recommendation algorithm?

Yes, you can customize the recommendation algorithm by adjusting the weights of different factors in the VARAi settings.

### Analytics

#### What metrics are tracked?

VARAi tracks metrics such as product views, try-ons, recommendation impressions, recommendation clicks, face shape detections, and product comparisons.

#### Is the analytics data GDPR compliant?

Yes, VARAi's analytics data collection is GDPR compliant. Customer data is anonymized and stored securely.