# VARAi for BigCommerce

AI-powered eyewear recommendations and virtual try-on with advanced style analysis for BigCommerce stores.

## Features

- **Virtual Try-On**: Let customers virtually try on frames before purchasing
- **Style Recommendation Engine**: AI-powered product recommendations based on style, brand, and customer behavior
- **Face Shape Compatibility**: Filter products based on face shape compatibility
- **Style Scoring System**: Evaluate products based on style metrics
- **Customer Measurement Storage**: Save and retrieve customer measurements for better fitting recommendations
- **Product Comparison**: Allow customers to compare multiple products side-by-side
- **Analytics Dashboard**: Comprehensive analytics with key metrics and insights
- **Frame Measurements**: Detailed frame measurements and specifications
- **Analytics Integration**: Built-in GA4 tracking and analytics dashboard
- **Style Tagging**: Improve recommendations with custom style tags
- **BigCommerce Integration**: Seamless integration with your existing store

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

## Usage

### Initialize the App

```javascript
import { initialize, loadScript } from '@varai/bigcommerce';

// Load the VARAi script
await loadScript('your_store_hash');

// Initialize the app
const varai = initialize({
    clientId: 'your_client_id',
    accessToken: 'your_access_token',
    storeHash: 'your_store_hash',
    varaiApiKey: '${APIKEY_2515}',
    ga4MeasurementId: 'your_ga4_measurement_id' // optional
});
```

### Add Product Recommendations

```javascript
import { addRecommendations } from '@varai/bigcommerce';

// Add recommendations to a container
addRecommendations({
    container: document.getElementById('recommendations'),
    productId: 123,
    limit: 4,
    type: 'similar',
    faceShape: 'oval' // optional - filter by face shape
});
```

### Add Virtual Try-On

```javascript
import { addTryOnButton } from '@varai/bigcommerce';

// Add try-on button
addTryOnButton({
    container: document.getElementById('try-on'),
    productId: 123,
    buttonText: 'Try On Now'
});

// Initialize virtual try-on
const tryOn = varai.VirtualTryOn({
    container: document.getElementById('try-on-view'),
    productId: 123,
    onSuccess: () => console.log('Try-on initialized'),
    onError: (error) => console.error('Try-on error:', error),
    onCapture: (imageData) => console.log('Photo captured:', imageData),
    onFaceShapeDetected: (faceShape) => console.log('Face shape detected:', faceShape)
});
```

### Add Product Comparison

```javascript
import { addProductComparison } from '@varai/bigcommerce';

// Add product comparison
addProductComparison({
    container: document.getElementById('product-comparison'),
    productIds: [123, 456, 789],
    compareAttributes: ['style', 'measurements', 'price', 'rating']
});
```

### Track Analytics Events

```javascript
// Events are tracked automatically, but you can track custom events
varai.analytics.trackEvent({
    event_type: 'custom_event',
    product_id: 123,
    custom_data: {
        // your custom data
    }
});
```

## Configuration

### Store Settings

1. Go to your BigCommerce admin
2. Navigate to Apps > VARAi > Settings
3. Configure the following:
   - API Key
   - Analytics Settings
   - Virtual Try-On Settings
   - Recommendation Settings
   - Face Shape Compatibility Settings
   - Style Scoring Settings
   - Product Comparison Settings

### Product Settings

1. Edit a product in BigCommerce admin
2. Scroll to "VARAi Settings"
3. Configure:
   - Frame Measurements
   - Style Tags
   - Face Shape Compatibility
   - Style Score
   - Virtual Try-On Model

## Development

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

### Testing

```bash
# Run unit tests
npm test

# Run linting
npm run lint
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

## Support

For support:
1. Check the [FAQ](https://varai.ai/docs/faq)
2. Contact support@varai.ai
3. Visit our [community forum](https://community.varai.ai)

## License

This app is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 VARAi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
