# VARAi Merchant Onboarding Guide

This guide will walk you through the process of setting up your VARAi account and integrating the virtual try-on and recommendation platform with your eyewear business.

## Table of Contents

1. [Creating Your VARAi Account](#creating-your-varai-account)
2. [Setting Up Your Merchant Profile](#setting-up-your-merchant-profile)
3. [Configuring Your Store](#configuring-your-store)
4. [Uploading Your Product Catalog](#uploading-your-product-catalog)
5. [Integrating with Your E-commerce Platform](#integrating-with-your-e-commerce-platform)
6. [Testing Your Integration](#testing-your-integration)
7. [Going Live](#going-live)
8. [Next Steps](#next-steps)

## Creating Your VARAi Account

### Prerequisites

Before creating your VARAi account, make sure you have:

- A valid business email address
- Your business registration information
- Payment information for subscription fees
- Access to your e-commerce platform administration

### Registration Steps

1. Visit [https://merchant.varai.ai/register](https://merchant.varai.ai/register)
2. Click on "Create Merchant Account"
3. Fill in your business information:
   - Business name
   - Business email
   - Phone number
   - Website URL
4. Create a secure password
5. Agree to the Terms of Service and Privacy Policy
6. Click "Create Account"
7. Verify your email address by clicking the link sent to your business email

### Choosing Your Subscription Plan

After verifying your email, you'll be prompted to select a subscription plan:

- **Starter**: For small businesses with up to 100 products
- **Professional**: For medium-sized businesses with up to 500 products
- **Enterprise**: For large businesses with unlimited products and custom features

Select the plan that best fits your business needs and complete the payment process.

## Setting Up Your Merchant Profile

### Accessing Your Dashboard

1. Log in to your account at [https://merchant.varai.ai/login](https://merchant.varai.ai/login)
2. You'll be directed to your merchant dashboard
3. Navigate to "Profile Settings" in the left sidebar

### Completing Your Profile

Fill in the following information:

1. **Business Details**:
   - Business description
   - Year established
   - Business logo (recommended size: 512x512px, PNG or JPG format)
   - Business address
   
2. **Brand Settings**:
   - Brand colors (primary and secondary)
   - Brand fonts
   - Custom CSS (optional)
   
3. **Contact Information**:
   - Customer support email
   - Customer support phone number
   - Support hours
   
4. **Social Media Links**:
   - Facebook
   - Instagram
   - Twitter
   - Pinterest
   - YouTube

5. Click "Save Profile" to update your information

## Configuring Your Store

### Store Settings

1. Navigate to "Store Settings" in the left sidebar
2. Configure the following settings:

   - **General Settings**:
     - Store name
     - Store URL
     - Default language
     - Default currency
     - Time zone
   
   - **Customer Experience**:
     - Enable/disable customer reviews
     - Enable/disable social sharing
     - Enable/disable wish list functionality
     - Configure recommendation algorithm preferences
   
   - **Analytics & Tracking**:
     - Google Analytics ID
     - Facebook Pixel ID
     - Other tracking codes
   
   - **Notifications**:
     - Email notification preferences
     - Dashboard notification preferences
     - Mobile app notification preferences

3. Click "Save Settings" to update your store configuration

## Uploading Your Product Catalog

### Preparing Your Product Data

Before uploading your product catalog, ensure your product data includes:

- Product name
- SKU/product ID
- Price
- Description
- Categories/tags
- Frame dimensions (width, height, bridge, temple length)
- Frame material
- Frame color
- Lens options
- High-quality product images (front, side, and 45-degree angles)
- 3D model files (if available)

### Upload Methods

VARAi offers three methods to upload your product catalog:

1. **CSV/Excel Upload**:
   - Navigate to "Products" > "Import" in the left sidebar
   - Download the product template
   - Fill in your product data following the template format
   - Upload the completed file
   - Map the columns to VARAi fields
   - Click "Import Products"

2. **API Integration**:
   - Navigate to "Developer" > "API Keys" in the left sidebar
   - Generate a new API key
   - Use the VARAi API to programmatically upload your products
   - Refer to the [API Documentation](../../api/index.html) for detailed instructions

3. **E-commerce Platform Sync**:
   - Navigate to "Integrations" in the left sidebar
   - Select your e-commerce platform
   - Follow the platform-specific instructions to connect your store
   - Sync your products automatically

### Verifying Your Products

After uploading your products:

1. Navigate to "Products" > "All Products" in the left sidebar
2. Verify that all products are correctly imported
3. Check for any missing information or errors
4. Update product information as needed

## Integrating with Your E-commerce Platform

VARAi supports integration with major e-commerce platforms:

### Shopify Integration

1. Navigate to "Integrations" > "Shopify" in the left sidebar
2. Click "Connect with Shopify"
3. Enter your Shopify store URL
4. Click "Install App" and authorize the VARAi app
5. Configure the widget placement options
6. Select which product collections to enable for virtual try-on
7. Click "Save Configuration"

For detailed instructions, see the [Shopify Integration Guide](../../integrations/shopify/README.html).

### WooCommerce Integration

1. Navigate to "Integrations" > "WooCommerce" in the left sidebar
2. Download the VARAi WooCommerce plugin
3. Install the plugin on your WordPress site
4. Enter your VARAi API key in the plugin settings
5. Configure the widget placement options
6. Select which product categories to enable for virtual try-on
7. Click "Save Configuration"

For detailed instructions, see the [WooCommerce Integration Guide](../../integrations/sections/WooCommerceIntegration.html).

### Magento Integration

1. Navigate to "Integrations" > "Magento" in the left sidebar
2. Download the VARAi Magento extension
3. Install the extension on your Magento store
4. Enter your VARAi API key in the extension settings
5. Configure the widget placement options
6. Select which product categories to enable for virtual try-on
7. Click "Save Configuration"

For detailed instructions, see the [Magento Integration Guide](../../integrations/sections/MagentoIntegration.html).

### BigCommerce Integration

1. Navigate to "Integrations" > "BigCommerce" in the left sidebar
2. Click "Connect with BigCommerce"
3. Enter your BigCommerce store URL
4. Click "Install App" and authorize the VARAi app
5. Configure the widget placement options
6. Select which product categories to enable for virtual try-on
7. Click "Save Configuration"

For detailed instructions, see the [BigCommerce Integration Guide](../../integrations/sections/BigCommerceIntegration.html).

### Custom Integration

If you're using a different e-commerce platform or a custom-built solution:

1. Navigate to "Developer" > "API Keys" in the left sidebar
2. Generate a new API key
3. Use the VARAi API to integrate with your platform
4. Refer to the [API Documentation](../../api/index.html) for detailed instructions
5. Contact our support team for assistance with custom integrations

## Testing Your Integration

### Test Mode

Before going live, test your integration in test mode:

1. Navigate to "Store Settings" > "General" in the left sidebar
2. Enable "Test Mode"
3. Click "Save Settings"

In test mode, the VARAi widgets will only be visible to you and users with test access.

### Testing Virtual Try-On

1. Navigate to your e-commerce store
2. Go to a product page with virtual try-on enabled
3. Click the "Try On" button
4. Test the virtual try-on experience with different frames
5. Verify that the widget loads correctly and displays accurate frame renderings

### Testing Recommendations

1. Navigate to your e-commerce store
2. Go to a product page with recommendations enabled
3. Verify that the "Recommended for You" section appears
4. Test the recommendation functionality with different user profiles
5. Verify that the recommendations are relevant and display correctly

### Testing Analytics

1. Navigate to "Analytics" in the VARAi merchant dashboard
2. Verify that test interactions are being tracked
3. Test different user journeys and verify the data in the analytics dashboard

## Going Live

### Disabling Test Mode

When you're ready to go live:

1. Navigate to "Store Settings" > "General" in the left sidebar
2. Disable "Test Mode"
3. Click "Save Settings"

### Pre-Launch Checklist

Before launching to your customers, verify:

- All products are correctly uploaded and configured
- Virtual try-on works correctly on all product pages
- Recommendations are displaying relevant products
- Analytics tracking is working properly
- Your branding is consistent throughout the experience
- All integration points with your e-commerce platform are working

### Launching to Customers

1. Announce the new virtual try-on feature to your customers:
   - Email newsletter
   - Social media posts
   - Website banner
   - Blog post explaining the benefits

2. Consider offering a promotion to encourage customers to try the new feature

3. Monitor the initial launch closely for any issues or customer feedback

## Next Steps

After completing the onboarding process, explore these resources to get the most out of your VARAi integration:

- [Dashboard Usage Guide](./dashboard.md) - Learn how to use the VARAi merchant dashboard
- [Product Management Guide](./product-management.md) - Learn how to manage your products in VARAi
- [Analytics Interpretation Guide](./analytics.md) - Learn how to interpret and use the analytics data
- [Integration Setup Guide](./integration-setup.md) - Detailed information on platform integrations
- [Troubleshooting Guide](./troubleshooting.md) - Solutions to common issues

## Need Help?

If you encounter any issues during the onboarding process, contact our merchant support team:

- Email: merchant-support@varai.ai
- Phone: +1 (555) 123-4567
- Live Chat: Available in your merchant dashboard
- Support Hours: Monday-Friday, 9am-5pm EST