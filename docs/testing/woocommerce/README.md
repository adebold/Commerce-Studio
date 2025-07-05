# 🛒 WooCommerce Testing Documentation

## Overview

Comprehensive testing suite for WooCommerce store integrations with VARAi Commerce Studio. This documentation covers all aspects of testing WooCommerce stores with real customer data and WordPress integration.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [API Authentication](#-api-authentication)
- [Test Categories](#-test-categories)
- [WordPress Integration](#-wordpress-integration)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Advanced Features](#-advanced-features)

## 🚀 Quick Start

### **Prerequisites**
- WordPress site with WooCommerce plugin
- WordPress admin access
- WooCommerce REST API enabled
- API keys generated

### **Basic Test Run**
```bash
# Run WooCommerce-specific tests
npm run test:woocommerce

# Run with verbose output
DEBUG=true npm run test:woocommerce
```

## 🔐 API Authentication

### **Enabling WooCommerce REST API**

1. **Access WordPress Admin**
   ```
   https://your-store.com/wp-admin
   ```

2. **Navigate to WooCommerce Settings**
   ```
   WooCommerce → Settings → Advanced → REST API
   ```

3. **Create API Key**
   - Click "Add key"
   - Description: "VARAi Commerce Studio Testing"
   - User: Select admin user
   - Permissions: Read/Write
   - Click "Generate API key"

4. **Copy Credentials**
   ```
   Consumer Key: ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Consumer Secret: cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### **WordPress Admin Access (Optional)**
For advanced testing features, provide WordPress admin credentials:

```env
WP_USERNAME=your_admin_username
WP_PASSWORD=your_secure_password
```

### **Environment Configuration**
```env
WOOCOMMERCE_STORE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WP_USERNAME=admin
WP_PASSWORD=secure_password_here
```

## 🧪 Test Categories

### **1. Authentication Tests**
Validates API connectivity and WordPress integration.

```javascript
// Test: API Authentication
✅ WooCommerce API connection successful
✅ API credentials valid
✅ WordPress admin access working
✅ Store information accessible
```

**What it tests:**
- WooCommerce REST API connectivity
- API key validation
- WordPress admin authentication
- Store metadata retrieval

### **2. Product Catalog Tests**
Tests product management and catalog integration.

```javascript
// Test: Product Catalog
✅ Product catalog accessible
✅ Product data structure valid
✅ Inventory management working
✅ Product categories organized
✅ Product variations handled
```

**What it tests:**
- Product list retrieval
- Individual product details
- Stock management
- Category hierarchy
- Variable products
- Product attributes

### **3. Customer Management Tests**
Validates customer data and account management.

```javascript
// Test: Customer Management
✅ Customer list accessible
✅ Customer profiles complete
✅ Registration process working
✅ Customer orders linked
```

**What it tests:**
- Customer list retrieval
- Customer profile data
- Account creation process
- Order history association
- Customer roles and permissions

### **4. Order Processing Tests**
Tests order management and e-commerce workflow.

```javascript
// Test: Order Processing
✅ Order history accessible
✅ Order details complete
✅ Payment processing working
✅ Order status management
✅ Shipping calculations accurate
```

**What it tests:**
- Order list retrieval
- Order detail accuracy
- Payment gateway integration
- Order status workflow
- Shipping and tax calculations

### **5. WordPress Integration Tests**
Validates WordPress-specific features and plugins.

```javascript
// Test: WordPress Integration
✅ WordPress version compatible
✅ WooCommerce version current
✅ Required plugins active
✅ Theme compatibility verified
✅ Database structure valid
```

**What it tests:**
- WordPress core compatibility
- WooCommerce plugin status
- Essential plugin dependencies
- Theme integration
- Database integrity

### **6. Plugin Ecosystem Tests**
Tests compatibility with common WooCommerce plugins.

```javascript
// Test: Plugin Ecosystem
✅ Payment gateways configured
✅ Shipping methods available
✅ Tax settings configured
✅ Security plugins compatible
```

**What it tests:**
- Payment gateway plugins
- Shipping method plugins
- Tax calculation plugins
- Security and optimization plugins

### **7. Performance Tests**
Measures API response times and WordPress performance.

```javascript
// Test: Performance
✅ API response time < 2000ms
✅ WordPress load time acceptable
✅ Database queries optimized
✅ Caching mechanisms active
```

**What it tests:**
- REST API response times
- WordPress page load speeds
- Database query performance
- Caching effectiveness

## 🔧 WordPress Integration

### **WordPress Version Compatibility**
```javascript
// Supported WordPress versions
const supportedVersions = {
  minimum: '5.0',
  recommended: '6.0+',
  tested: '6.4.2'
};
```

### **WooCommerce Version Compatibility**
```javascript
// Supported WooCommerce versions
const supportedWooCommerce = {
  minimum: '6.0',
  recommended: '8.0+',
  tested: '8.5.2'
};
```

### **Required Plugins**
```javascript
// Essential plugins for full functionality
const requiredPlugins = [
  'woocommerce/woocommerce.php',           // Core WooCommerce
  'woocommerce-admin/woocommerce-admin.php' // WooCommerce Admin
];

// Recommended plugins
const recommendedPlugins = [
  'woocommerce-gateway-stripe/woocommerce-gateway-stripe.php',
  'woocommerce-services/woocommerce-services.php',
  'jetpack/jetpack.php'
];
```

## ⚙️ Configuration

### **Test Thresholds**
```javascript
// woocommerce-config.js
module.exports = {
  performance: {
    maxResponseTime: 2000,     // Max API response time (ms)
    maxPageLoadTime: 3000,     // Max WordPress page load (ms)
    maxDbQueryTime: 500        // Max database query time (ms)
  },
  
  validation: {
    minProducts: 1,            // Minimum products required
    minCustomers: 0,           // Minimum customers required
    minOrders: 0,              // Minimum orders required
    requiredPlugins: [         // Required plugin list
      'woocommerce/woocommerce.php'
    ]
  },
  
  scoring: {
    authenticationWeight: 15,   // Authentication test weight
    productCatalogWeight: 25,   // Product catalog test weight
    customerManagementWeight: 20, // Customer management test weight
    orderProcessingWeight: 20,  // Order processing test weight
    wordpressIntegrationWeight: 10, // WordPress integration weight
    pluginEcosystemWeight: 5,   // Plugin ecosystem weight
    performanceWeight: 5        // Performance test weight
  }
};
```

### **Custom WordPress Configuration**
```javascript
// wordpress-config.js
module.exports = {
  admin: {
    loginUrl: '/wp-admin',
    dashboardUrl: '/wp-admin/admin.php',
    timeout: 10000
  },
  
  api: {
    baseUrl: '/wp-json/wc/v3',
    version: 'v3',
    timeout: 5000
  },
  
  security: {
    enableSslVerification: true,
    allowSelfSignedCerts: false,
    maxRedirects: 5
  }
};
```

## 🔍 Troubleshooting

### **Common Issues**

#### **API Authentication Errors**
```
❌ Error: Request failed with status code 401
```

**Solutions:**
1. Verify consumer key format: `ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
2. Verify consumer secret format: `cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. Check API key permissions (Read/Write required)
4. Ensure WooCommerce REST API is enabled
5. Verify user has admin privileges

#### **WordPress Admin Access Issues**
```
❌ Error: WordPress login failed
```

**Solutions:**
1. Verify WordPress admin URL: `https://your-store.com/wp-admin`
2. Check username and password
3. Ensure user has administrator role
4. Check for security plugins blocking access
5. Verify two-factor authentication settings

#### **Plugin Compatibility Issues**
```
❌ Error: Required plugin not found
```

**Solutions:**
1. Install and activate WooCommerce plugin
2. Update WooCommerce to latest version
3. Check plugin compatibility with WordPress version
4. Resolve plugin conflicts
5. Verify plugin file paths

#### **Performance Issues**
```
❌ Error: Request timeout
```

**Solutions:**
1. Optimize WordPress database
2. Enable caching plugins
3. Optimize images and media
4. Check hosting server performance
5. Review plugin performance impact

#### **SSL/HTTPS Issues**
```
❌ Error: SSL certificate verification failed
```

**Solutions:**
1. Ensure SSL certificate is valid
2. Update SSL certificate if expired
3. Configure proper HTTPS redirects
4. Check mixed content issues
5. Verify SSL configuration

### **Debug Mode**
```bash
# Enable detailed logging
DEBUG=true npm run test:woocommerce

# Enable WordPress debug logging
DEBUG_WP=true npm run test:woocommerce

# Enable API request logging
DEBUG_API=true npm run test:woocommerce

# Enable performance monitoring
DEBUG_PERFORMANCE=true npm run test:woocommerce
```

## 🚀 Advanced Features

### **Multi-Site Testing**
```javascript
// Test WordPress multisite networks
const multisiteTest = await woocommerceIntegration.testMultisite({
  sites: ['site1.example.com', 'site2.example.com'],
  sharedConfig: true
});
```

### **Plugin Compatibility Testing**
```javascript
// Test specific plugin combinations
const pluginTest = await woocommerceIntegration.testPluginCompatibility([
  'woocommerce-subscriptions',
  'woocommerce-memberships',
  'woocommerce-bookings'
]);
```

### **Theme Compatibility Testing**
```javascript
// Test theme compatibility
const themeTest = await woocommerceIntegration.testThemeCompatibility({
  themes: ['storefront', 'astra', 'oceanwp'],
  testCheckout: true,
  testProductPages: true
});
```

### **Database Performance Testing**
```javascript
// Test database performance
const dbTest = await woocommerceIntegration.testDatabasePerformance({
  queryTypes: ['products', 'orders', 'customers'],
  loadTest: true,
  optimizationSuggestions: true
});
```

## 📊 Test Results Interpretation

### **Score Breakdown**
```
🛒 WOOCOMMERCE INTEGRATION SCORE: 88.7/100

📊 Category Breakdown:
  🔐 Authentication: 95/100 (15%)
  📦 Product Catalog: 92/100 (25%)
  👥 Customer Management: 88/100 (20%)
  📋 Order Processing: 85/100 (20%)
  🔧 WordPress Integration: 90/100 (10%)
  🔌 Plugin Ecosystem: 80/100 (5%)
  ⚡ Performance: 85/100 (5%)
```

### **Status Indicators**
- **🟢 85-100**: Excellent - Production ready
- **🟡 70-84**: Good - Minor improvements needed
- **🟠 55-69**: Needs work - Significant issues
- **🔴 0-54**: Critical - Not production ready

### **WordPress-Specific Metrics**
```
🔧 WordPress Health Check:
  📊 WordPress Version: 6.4.2 ✅
  🛒 WooCommerce Version: 8.5.2 ✅
  🔌 Active Plugins: 12 ✅
  🎨 Active Theme: Storefront ✅
  💾 Database Size: 45.2 MB ✅
  ⚡ Page Load Time: 1.8s ✅
```

## 📚 API Reference

### **Core Methods**
```javascript
// Authentication
await woocommerceIntegration.authenticate()
await woocommerceIntegration.authenticateWordPress()

// Product operations
await woocommerceIntegration.getProducts(page, perPage)
await woocommerceIntegration.getProduct(productId)
await woocommerceIntegration.getProductCategories()

// Customer operations
await woocommerceIntegration.getCustomers(page, perPage)
await woocommerceIntegration.getCustomer(customerId)

// Order operations
await woocommerceIntegration.getOrders(page, perPage)
await woocommerceIntegration.getOrder(orderId)

// WordPress operations
await woocommerceIntegration.getWordPressInfo()
await woocommerceIntegration.getPluginStatus()
await woocommerceIntegration.getThemeInfo()

// Performance testing
await woocommerceIntegration.measurePerformance(operations)
```

### **WordPress-Specific Methods**
```javascript
// Plugin management
await woocommerceIntegration.getActivePlugins()
await woocommerceIntegration.checkPluginCompatibility(pluginList)

// Theme operations
await woocommerceIntegration.getActiveTheme()
await woocommerceIntegration.testThemeCompatibility()

// Database operations
await woocommerceIntegration.getDatabaseInfo()
await woocommerceIntegration.optimizeDatabase()
```

## 🔗 Related Documentation

- **[Installation & Setup](../installation-setup.md)** - Initial setup guide
- **[Configuration Guide](../configuration.md)** - Detailed configuration
- **[Shopify Testing](../shopify/README.md)** - Shopify-specific testing
- **[CI/CD Integration](../ci-cd-integration.md)** - Automated testing setup
- **[Troubleshooting](../troubleshooting.md)** - Common issues and solutions

## 📞 Support

For WooCommerce-specific testing issues:

1. **Check WooCommerce Status**: https://status.woocommerce.com/
2. **Review API Documentation**: https://woocommerce.github.io/woocommerce-rest-api-docs/
3. **WordPress Support**: https://wordpress.org/support/
4. **WooCommerce Community**: https://woocommerce.com/community/
5. **Contact Support**: Include test logs, WordPress version, and plugin list

## 🛡️ Security Considerations

### **API Security**
- Use HTTPS for all API requests
- Rotate API keys regularly
- Limit API key permissions to required scopes
- Monitor API usage for unusual activity

### **WordPress Security**
- Keep WordPress and plugins updated
- Use strong admin passwords
- Enable two-factor authentication
- Install security plugins
- Regular security scans

### **Data Protection**
- Comply with GDPR/CCPA requirements
- Secure customer data transmission
- Implement proper data retention policies
- Regular security audits

---

**🎉 Ready to test your WooCommerce integration with confidence!**