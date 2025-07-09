# Multi-Platform Consultation Integration Guide

This guide covers the integration of the Commerce Studio Consultation platform, now with an advanced recommendations engine, across Shopify, Magento, WooCommerce, and BigCommerce.

## Overview

The consultation system provides production-ready, AI-powered eyewear recommendations, featuring real-time personalization and face shape analysis. Each platform integration is designed to deliver a consistent, high-quality user experience while adhering to platform-specific best practices.

## Supported Platforms

| Platform | Integration Type | Status | Documentation |
|----------|-----------------|--------|---------------|
| Shopify | App + Theme Integration | ✅ Production | [Shopify Guide](#shopify-integration) |
| Magento 2 | Module | ✅ Production | [Magento Guide](#magento-integration) |
| WooCommerce | Plugin | ✅ Production | [WooCommerce Guide](#woocommerce-integration) |
| BigCommerce | App + Stencil | ✅ Production | [BigCommerce Guide](#bigcommerce-integration) |

## Core Features

All platform integrations include:

- **Advanced Recommendations**: Real-time, ML-powered recommendations with detailed scoring and explanations.
- **Face Shape Analysis**: AI-powered facial recognition for personalized recommendations.
- **Dynamic Personalization**: Recommendations adapt based on user interaction and preferences.
- **Store Locator Integration**: Find nearby stores with inventory checking.
- **Admin Configuration**: Platform-specific settings for API keys and feature toggles.

## Quick Start

### Prerequisites

- A valid API Key for the Commerce Studio Production API.
- The relevant e-commerce platform development environment.

### Universal Integration Steps

1.  **Install the Platform-Specific App/Plugin/Module**: Follow the installation instructions for your platform ([Shopify](#shopify-integration), [Magento](#magento-integration), [WooCommerce](#woocommerce-integration), [BigCommerce](#bigcommerce-integration)).
2.  **Configure the API Key**: In the admin panel of the integration, enter your production API key.
3.  **Enable Features**: Toggle the features you want to enable, such as the consultation widget and enhanced recommendations.

## Platform-Specific Integration Guides

## Shopify Integration

### Installation

1.  **Install the Shopify App**: Install the official Commerce Studio consultation app from the Shopify App Store.
2.  **Complete Authentication**: Follow the on-screen instructions to authorize the app with your store.

### Configuration

Access the app configuration in your Shopify admin:

- **API Settings**: Enter your production API key.
- **Widget Settings**: Configure button text, colors, and positioning.
- **Features**: Enable/disable face analysis, enhanced recommendations, and store locator.

### Theme Integration

The app automatically injects consultation widgets into your theme. Manual integration options:

```liquid
<!-- Product page integration -->
{% if product.type contains 'eyewear' %}
  <div id="consultation-widget-container"></div>
  <script src="{{ 'consultation-widget.js' | asset_url }}"></script>
{% endif %}
```

### Testing

```bash
# Test Shopify integration
npm run test:shopify

# Test specific features
npm run test:face-analysis
npm run test:recommendations
```

## Magento Integration

### Installation

1. **Copy Module Files**
   ```bash
   # Copy module to Magento installation
   cp -r apps/magento/consultation-integration/* /path/to/magento/app/code/CommerceStudio/ConsultationIntegration/
   ```

2. **Enable Module**
   ```bash
   cd /path/to/magento
   php bin/magento module:enable CommerceStudio_ConsultationIntegration
   php bin/magento setup:upgrade
   php bin/magento setup:di:compile
   php bin/magento cache:flush
   ```

### Configuration

Navigate to **Stores > Configuration > Commerce Studio > Consultation Integration**:

- **General Settings**: Enable/disable integration
- **API Configuration**: Set consultation API URL and credentials
- **Widget Configuration**: Customize button appearance and behavior
- **Feature Settings**: Configure face analysis and store locator

### Template Integration

Add consultation widget to product pages:

```php
<?php if ($this->helper('CommerceStudio\ConsultationIntegration\Helper\ConsultationHelper')->isEnabled()): ?>
    <div class="consultation-widget-container">
        <?= $block->getChildHtml('consultation.widget') ?>
    </div>
<?php endif; ?>
```

### Custom Attributes

Configure eyewear-specific product attributes:

- `frame_style`: Dropdown (rectangular, round, cat-eye, aviator, etc.)
- `frame_material`: Dropdown (acetate, metal, titanium, etc.)
- `lens_width`: Integer
- `bridge_width`: Integer
- `temple_length`: Integer

## WooCommerce Integration

### Installation

1. **Install Plugin**
   ```bash
   # Copy plugin files
   cp -r apps/woocommerce/consultation-integration /path/to/wordpress/wp-content/plugins/
   ```

2. **Activate Plugin**
   - Go to WordPress Admin > Plugins
   - Find "Consultation Integration"
   - Click "Activate"

### Configuration

Navigate to **WooCommerce > Settings > Consultation**:

- **General Settings**: Enable integration and set API URL
- **Display Settings**: Configure widget appearance
- **Features**: Enable face analysis and store locator
- **Product Settings**: Set eyewear categories

### Shortcode Usage

Manual widget placement using shortcodes:

```php
// Display consultation button on product pages
[consultation_button]

// Display consultation modal
[consultation_modal]

// Display store locator
[consultation_stores]
```

### Custom Fields

Add eyewear-specific custom fields to products:

- `_frame_style`
- `_frame_material`
- `_lens_width`
- `_bridge_width`
- `_temple_length`

### Hooks and Filters

```php
// Customize button text
add_filter('consultation_button_text', function($text) {
    return 'Find Your Perfect Frames';
});

// Modify consultation data
add_filter('consultation_product_data', function($data, $product) {
    // Add custom product attributes
    return $data;
}, 10, 2);
```

## BigCommerce Integration

### Installation

1. **Set up BigCommerce App**
   ```bash
   export BIGCOMMERCE_CLIENT_ID="your_client_id"
   export BIGCOMMERCE_CLIENT_SECRET="your_client_secret"
   export BIGCOMMERCE_CALLBACK_URL="https://your-app.com/install"
   ```

2. **Deploy BigCommerce App**
   ```bash
   cd apps/bigcommerce/consultation-integration
   npm install
   npm run build
   npm start
   ```

3. **Install in BigCommerce Store**
   - Submit app for review or install via developer tools
   - Complete OAuth installation flow

### Configuration

Access app configuration through BigCommerce control panel:

- **Widget Settings**: Configure consultation button
- **API Settings**: Set consultation service endpoints
- **Features**: Enable face analysis and store locator
- **Stencil Integration**: Configure theme integration

### Stencil Theme Integration

Add consultation widgets to Stencil themes:

```handlebars
{{!-- Product page integration --}}
{{#if product.custom_fields.eyewear}}
    <div class="consultation-widget-container">
        {{{snippet 'consultation-button'}}}
    </div>
{{/if}}
```

### Custom Fields

Configure product custom fields for eyewear attributes:

- `frame_style`
- `frame_material`
- `measurements`
- `suitable_face_shapes`

## Testing and Validation

### Integration Tests

```bash
# Run comprehensive platform tests
npm run test:platforms

# Test specific platform
npm run test:shopify
npm run test:magento
npm run test:woocommerce
npm run test:bigcommerce
```

### Manual Testing Checklist

For each platform, verify:

- [ ] Widget displays on product pages
- [ ] Consultation modal opens correctly
- [ ] Face analysis camera works
- [ ] Recommendations are generated
- [ ] Store locator functions
- [ ] Admin configuration saves
- [ ] Error handling works
- [ ] Mobile responsiveness

### Performance Testing

```bash
# Load testing
npm run test:load

# Performance monitoring
npm run test:performance
```

## Troubleshooting

### Common Issues

1. **Widget Not Displaying**
   - Check if platform integration is enabled
   - Verify product is categorized as eyewear
   - Check console for JavaScript errors

2. **Face Analysis Failing**
   - Ensure HTTPS is enabled
   - Check camera permissions
   - Verify consultation API is accessible

3. **Recommendations Not Loading**
   - Check API connectivity
   - Verify product data format
   - Check consultation service logs

4. **Store Locator Issues**
   - Verify geolocation permissions
   - Check store data configuration
   - Ensure location services are enabled

### Debug Mode

Enable debug mode for detailed logging:

```javascript
// Add to platform configuration
window.consultationDebug = true;
```

### API Health Checks

```bash
# Check consultation API health
curl http://localhost:3002/health

# Check platform-specific endpoints
curl http://localhost:3000/health  # Shopify
curl http://localhost:3003/health  # BigCommerce
```

## Production Deployment

All platform integrations connect to the centralized Commerce Studio production environment. Configuration is managed through the admin interface of each app, plugin, or module.

### API Configuration

- **Production API URL**: [`https://commerce-studio-api-ddtojwjn7a-uc.a.run.app`](https://commerce-studio-api-ddtojwjn7a-uc.a.run.app)
- **Authentication**: All API requests must be authenticated with a valid API Key provided to you by Commerce Studio.

### Monitoring and Maintenance

- **Service Monitoring**: All core services are monitored by the Commerce Studio DevOps team.
- **Platform Health**: Check the status of your integration within the platform-specific admin panel.

## Support and Documentation

### Additional Resources

- **[API Contract Specifications](../architecture/API_CONTRACT_SPECIFICATIONS.md)**
- **[Advanced Recommendations Engine Architecture](../architecture/ADVANCED_RECOMMENDATIONS_ENGINE_ARCHITECTURE.md)**
- **[ML Pipeline Specifications](../architecture/ML_PIPELINE_SPECIFICATIONS.md)**

### Support Channels

- **Issue Tracking**: GitHub Issues
- **Enterprise Support**: support@commercestudio.com

### Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines on contributing to the multi-platform consultation integration.

---

**Last Updated**: July 2025
**Version**: 2.0.0
**Supported Platforms**: Shopify, Magento 2, WooCommerce, BigCommerce