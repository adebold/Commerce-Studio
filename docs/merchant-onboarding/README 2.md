# VARAi Merchant Onboarding Documentation

This document provides comprehensive information about the merchant onboarding process for the VARAi platform. It covers the step-by-step process, integration options, and best practices for a successful implementation.

## Table of Contents

1. [Overview](#overview)
2. [Onboarding Process](#onboarding-process)
3. [Platform-Specific Integration Guides](#platform-specific-integration-guides)
4. [Configuration Options](#configuration-options)
5. [Troubleshooting](#troubleshooting)
6. [FAQs](#faqs)

## Overview

The VARAi merchant onboarding process is designed to streamline the integration of our AI-powered eyewear solutions into your e-commerce store. Our platform supports multiple e-commerce platforms including Shopify, Magento, WooCommerce, BigCommerce, and custom integrations.

### Key Features

- **Virtual Try-On**: Allow customers to virtually try on eyewear frames
- **AI Recommendations**: Provide personalized frame recommendations based on face shape and style preferences
- **Face Shape Detection**: Automatically detect customer face shapes for better recommendations
- **Style Scoring**: Rate how well frames match customer style preferences
- **Product Comparison**: Enable customers to compare multiple frames side by side
- **Customer Measurements**: Capture and store customer facial measurements for better fit

## Onboarding Process

The merchant onboarding process consists of five main steps:

### 1. Platform Selection

Choose your e-commerce platform from the supported options:
- Shopify
- Magento
- WooCommerce
- BigCommerce
- Custom Integration

Each platform has its own integration method, but all provide the same core functionality.

### 2. Account Setup

Create your VARAi account to access the Commerce Studio dashboard, where you can:
- View analytics and insights
- Manage your integration settings
- Access support resources
- Configure your widgets and features

### 3. Store Configuration

Connect your e-commerce store to VARAi by providing:
- Store name
- Store URL
- Store ID (for some platforms)
- Additional platform-specific information

### 4. Integration Setup

Configure your integration settings:
- API credentials
- Feature selection
- Widget placement and style
- Color scheme customization

### 5. Final Verification

Review your settings and complete the onboarding process. After completion, you'll need to:
- Install the appropriate app/plugin/extension for your platform
- Configure product attributes
- Add the VARAi widget to your product pages
- Test the integration

## Platform-Specific Integration Guides

### Shopify Integration

1. Install the VARAi app from the Shopify App Store
2. Configure the app with your API credentials
3. Map your product attributes to VARAi's eyewear attributes
4. Add the VARAi widget to your product template
5. Test the integration on your storefront

[Detailed Shopify Integration Guide](./shopify-integration.md)

### Magento Integration

1. Install the VARAi extension from Magento Marketplace
2. Configure the extension with your API credentials
3. Map your product attributes to VARAi's eyewear attributes
4. Add the VARAi widget to your product pages
5. Clear cache and test the integration

[Detailed Magento Integration Guide](./magento-integration.md)

### WooCommerce Integration

1. Install the VARAi plugin from WordPress Plugin Directory
2. Activate the plugin in your WordPress admin
3. Configure the plugin with your API credentials
4. Add the VARAi shortcode to your product template
5. Test the integration on your store

[Detailed WooCommerce Integration Guide](./woocommerce-integration.md)

### BigCommerce Integration

1. Install the VARAi app from the BigCommerce App Marketplace
2. Configure the app with your API credentials
3. Map your product attributes to VARAi's eyewear attributes
4. Add the VARAi script to your store theme
5. Test the integration on your storefront

[Detailed BigCommerce Integration Guide](./bigcommerce-integration.md)

### Custom Integration

1. Implement the VARAi API endpoints in your platform
2. Add the VARAi JavaScript SDK to your store
3. Configure the SDK with your API credentials
4. Implement the widget UI in your product pages
5. Test the integration thoroughly

[Detailed Custom Integration Guide](./custom-integration.md)

## Configuration Options

### Widget Placement Options

- **Product Page**: Embed the widget directly on product pages
- **Cart Page**: Show recommendations on the cart page
- **Floating Button**: Add a floating button that opens the widget
- **Navigation Menu**: Add a link in your navigation menu
- **Custom Position**: Place the widget anywhere on your site

### Widget Style Options

- **Floating Button**: A button that opens the widget in a modal
- **Embedded Widget**: Embed the widget directly in your page
- **Modal Dialog**: Open the widget in a modal dialog
- **Sidebar Panel**: Show the widget in a sidebar panel
- **Minimal Button**: A minimal button that expands to show the widget

### Color Scheme Customization

Customize the widget's appearance to match your brand:
- Primary color
- Secondary color
- Background color
- Text color

## Troubleshooting

### Common Issues

#### API Connection Issues

- Verify your API credentials are correct
- Check your store URL is properly formatted
- Ensure your firewall allows connections to VARAi's API endpoints

#### Widget Display Issues

- Check for JavaScript errors in your browser console
- Verify the widget code is properly added to your template
- Ensure there are no CSS conflicts with your theme

#### Product Data Issues

- Verify your product attributes are properly mapped
- Check that your product images meet the required specifications
- Ensure your product data is being properly synchronized

## FAQs

### General Questions

**Q: How long does the onboarding process take?**  
A: The basic onboarding process takes about 15-30 minutes. Full integration, including app installation and testing, typically takes 1-2 hours depending on your platform.

**Q: Is there a cost for integration?**  
A: Integration itself is free. VARAi offers various pricing plans based on your needs and usage. See our [Pricing Page](https://varai.ai/pricing) for details.

**Q: Can I customize the look and feel of the widgets?**  
A: Yes, you can customize colors, placement, and style to match your brand identity.

### Platform-Specific Questions

**Q: Do I need to be on a specific Shopify plan?**  
A: VARAi works with all Shopify plans, but some advanced features may require Shopify Plus.

**Q: Is VARAi compatible with Magento 1.x?**  
A: VARAi officially supports Magento 2.x. Limited support for Magento 1.x is available upon request.

**Q: Can I use VARAi with a custom-built e-commerce platform?**  
A: Yes, VARAi provides a REST API and JavaScript SDK for custom integrations.

---

For additional support, please contact our integration team at integration@varai.ai or visit our [Support Center](https://support.varai.ai).