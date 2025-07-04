# 🛍️ Shopify Testing Documentation

## Overview

Comprehensive testing suite for Shopify store integrations with VARAi Commerce Studio. This documentation covers all aspects of testing Shopify stores with real customer data.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [API Authentication](#-api-authentication)
- [Test Categories](#-test-categories)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Advanced Features](#-advanced-features)

## 🚀 Quick Start

### **Prerequisites**
- Shopify store with admin access
- Private app created with required API scopes
- Admin API access token

### **Basic Test Run**
```bash
# Run Shopify-specific tests
npm run test:shopify

# Run with verbose output
DEBUG=true npm run test:shopify
```

## 🔐 API Authentication

### **Creating a Private App**

1. **Navigate to Apps Section**
   ```
   https://your-store.myshopify.com/admin/apps
   ```

2. **Create Private App**
   - Click "App and sales channel settings"
   - Click "Develop apps"
   - Click "Create an app"
   - Name: "VARAi Commerce Studio Testing"

3. **Configure API Scopes**
   ```
   ✅ read_products          - Product catalog access
   ✅ read_customers         - Customer data access
   ✅ read_orders           - Order history access
   ✅ read_inventory        - Inventory levels
   ✅ read_analytics        - Store analytics
   ✅ read_reports          - Sales reports
   ✅ read_price_rules      - Discount rules
   ✅ read_discounts        - Active discounts
   ✅ read_locations        - Store locations
   ✅ read_shipping         - Shipping settings
   ```

4. **Generate Access Token**
   - Click "Install app"
   - Copy the Admin API access token
   - Format: `shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **Environment Configuration**
```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🧪 Test Categories

### **1. Authentication Tests**
Validates API connectivity and permissions.

```javascript
// Test: API Authentication
✅ Shopify API connection successful
✅ Access token valid
✅ Required scopes available
✅ Store information accessible
```

**What it tests:**
- API endpoint connectivity
- Access token validity
- Permission scope verification
- Store metadata retrieval

### **2. Product Synchronization Tests**
Tests product catalog integration.

```javascript
// Test: Product Sync
✅ Product catalog accessible
✅ Product data structure valid
✅ Inventory levels accurate
✅ Pricing information correct
✅ Product variants handled
```

**What it tests:**
- Product list retrieval
- Individual product details
- Inventory tracking
- Variant management
- Image and media handling

### **3. Customer Data Tests**
Validates customer information access.

```javascript
// Test: Customer Data
✅ Customer list accessible
✅ Customer profiles complete
✅ Order history linked
✅ Customer segments identified
```

**What it tests:**
- Customer list retrieval
- Individual customer profiles
- Order history association
- Customer segmentation data

### **4. Order Management Tests**
Tests order processing and history.

```javascript
// Test: Order Management
✅ Order history accessible
✅ Order details complete
✅ Payment status accurate
✅ Fulfillment tracking working
```

**What it tests:**
- Order list retrieval
- Order detail accuracy
- Payment processing status
- Shipping and fulfillment

### **5. Webhook Integration Tests**
Validates real-time event handling.

```javascript
// Test: Webhook Integration
✅ Webhook endpoints configured
✅ Event notifications working
✅ Data synchronization active
✅ Error handling functional
```

**What it tests:**
- Webhook configuration
- Event delivery
- Data consistency
- Error recovery

### **6. Performance Tests**
Measures API response times and reliability.

```javascript
// Test: Performance
✅ API response time < 2000ms
✅ Bulk operations efficient
✅ Rate limiting respected
✅ Error recovery working
```

**What it tests:**
- Response time benchmarks
- Bulk operation performance
- Rate limit compliance
- Error handling efficiency

## ⚙️ Configuration

### **Test Thresholds**
```javascript
// shopify-config.js
module.exports = {
  performance: {
    maxResponseTime: 2000,     // Max API response time (ms)
    maxBulkOperations: 100,    // Max bulk operation size
    rateLimitBuffer: 0.8       // Rate limit safety buffer
  },
  
  validation: {
    minProducts: 1,            // Minimum products required
    minCustomers: 0,           // Minimum customers required
    minOrders: 0               // Minimum orders required
  },
  
  scoring: {
    authenticationWeight: 20,   // Authentication test weight
    productSyncWeight: 25,      // Product sync test weight
    customerDataWeight: 20,     // Customer data test weight
    orderManagementWeight: 20,  // Order management test weight
    webhookWeight: 10,          // Webhook test weight
    performanceWeight: 5        // Performance test weight
  }
};
```

### **Custom Test Configuration**
```bash
# Create custom config
cp shopify-config.js shopify-config.custom.js

# Run with custom config
CONFIG_FILE=shopify-config.custom.js npm run test:shopify
```

## 🔍 Troubleshooting

### **Common Issues**

#### **Authentication Errors**
```
❌ Error: Request failed with status code 401
```

**Solutions:**
1. Verify access token format: `shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
2. Check token hasn't expired
3. Ensure app is installed and active
4. Verify required API scopes are granted

#### **Permission Denied**
```
❌ Error: Request failed with status code 403
```

**Solutions:**
1. Review API scopes in app configuration
2. Ensure all required permissions are granted
3. Check if store has restrictions on API access
4. Verify app installation status

#### **Rate Limiting**
```
❌ Error: Request failed with status code 429
```

**Solutions:**
1. Implement exponential backoff
2. Reduce concurrent requests
3. Check Shopify API rate limits
4. Use bulk operations where possible

#### **Store Not Found**
```
❌ Error: getaddrinfo ENOTFOUND your-store.myshopify.com
```

**Solutions:**
1. Verify store URL format: `store-name.myshopify.com`
2. Check store is active and accessible
3. Ensure network connectivity
4. Verify DNS resolution

### **Debug Mode**
```bash
# Enable detailed logging
DEBUG=true npm run test:shopify

# Enable API request logging
DEBUG_API=true npm run test:shopify

# Enable performance monitoring
DEBUG_PERFORMANCE=true npm run test:shopify
```

## 🚀 Advanced Features

### **Bulk Operations Testing**
```javascript
// Test bulk product updates
const bulkTest = await shopifyIntegration.testBulkOperations({
  operation: 'product_update',
  batchSize: 50,
  maxConcurrent: 5
});
```

### **Webhook Simulation**
```javascript
// Simulate webhook events
const webhookTest = await shopifyIntegration.simulateWebhooks([
  'orders/create',
  'orders/updated',
  'products/create',
  'customers/create'
]);
```

### **Performance Benchmarking**
```javascript
// Run performance benchmarks
const performanceTest = await shopifyIntegration.runBenchmarks({
  duration: 60000,        // 1 minute test
  concurrency: 10,        // 10 concurrent requests
  operations: ['products', 'customers', 'orders']
});
```

### **Multi-Store Testing**
```bash
# Test multiple Shopify stores
SHOPIFY_STORES="store1,store2,store3" npm run test:shopify:multi
```

## 📊 Test Results Interpretation

### **Score Breakdown**
```
🛍️ SHOPIFY INTEGRATION SCORE: 92.3/100

📊 Category Breakdown:
  🔐 Authentication: 100/100 (20%)
  📦 Product Sync: 95/100 (25%)
  👥 Customer Data: 90/100 (20%)
  📋 Order Management: 88/100 (20%)
  🔔 Webhooks: 85/100 (10%)
  ⚡ Performance: 95/100 (5%)
```

### **Status Indicators**
- **🟢 90-100**: Excellent - Production ready
- **🟡 75-89**: Good - Minor improvements needed
- **🟠 60-74**: Needs work - Significant issues
- **🔴 0-59**: Critical - Not production ready

## 📚 API Reference

### **Core Methods**
```javascript
// Authentication
await shopifyIntegration.authenticate()

// Product operations
await shopifyIntegration.getProducts(limit, page)
await shopifyIntegration.getProduct(productId)

// Customer operations
await shopifyIntegration.getCustomers(limit, page)
await shopifyIntegration.getCustomer(customerId)

// Order operations
await shopifyIntegration.getOrders(limit, page)
await shopifyIntegration.getOrder(orderId)

// Webhook operations
await shopifyIntegration.configureWebhooks(endpoints)
await shopifyIntegration.testWebhooks()

// Performance testing
await shopifyIntegration.measurePerformance(operations)
```

## 🔗 Related Documentation

- **[Installation & Setup](../installation-setup.md)** - Initial setup guide
- **[Configuration Guide](../configuration.md)** - Detailed configuration
- **[WooCommerce Testing](../woocommerce/README.md)** - WooCommerce-specific testing
- **[CI/CD Integration](../ci-cd-integration.md)** - Automated testing setup
- **[Troubleshooting](../troubleshooting.md)** - Common issues and solutions

## 📞 Support

For Shopify-specific testing issues:

1. **Check Shopify API Status**: https://status.shopify.com/
2. **Review API Documentation**: https://shopify.dev/api/admin-rest
3. **Shopify Community**: https://community.shopify.com/
4. **Contact Support**: Include test logs and error messages

---

**🎉 Ready to test your Shopify integration with confidence!**