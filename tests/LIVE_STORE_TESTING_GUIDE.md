# 🧪 Live Store Integration Testing Guide

## 🎯 Overview

This comprehensive testing suite validates your VARAi Commerce Studio integration with **live customer data** from Shopify and WooCommerce stores. Following Test-Driven Development (TDD) principles, the suite ensures your key features work reliably with real-world data.

## 📊 What Gets Tested

### **🛍️ Shopify Integration**
- ✅ API Authentication & Store Connection
- ✅ Product Synchronization with Live Inventory
- ✅ Customer Data Integration
- ✅ Order History & Revenue Tracking
- ✅ Webhook Configuration & Events
- ✅ Performance with Real Traffic

### **🛒 WooCommerce Integration**
- ✅ WooCommerce REST API Authentication
- ✅ WordPress Integration & Plugin Detection
- ✅ Product Catalog Synchronization
- ✅ Customer & Order Management
- ✅ Webhook & Event Handling
- ✅ Performance Optimization

### **🎯 Key Features Validated**
- ✅ Real-time Data Synchronization
- ✅ AI-Powered Recommendations with Live Data
- ✅ Analytics Dashboard with Actual Metrics
- ✅ Virtual Try-On Integration
- ✅ Performance Under Load
- ✅ User Experience Flows

## 🚀 Quick Start

### **1. Install Dependencies**
```bash
cd tests
npm install axios dotenv
```

### **2. Configure Your Stores**
```bash
# Copy environment template
cp .env.example .env

# Edit with your store credentials
nano .env
```

### **3. Run Complete Test Suite**
```bash
# Run all tests with live data
node run-live-store-tests.js

# Or run individual platform tests
node shopify-live-integration.js
node woocommerce-live-integration.js
```

## 🔧 Store Setup Requirements

### **Shopify Store Setup**

1. **Create Private App** (Recommended)
   - Go to Shopify Admin → Apps → App and sales channel settings
   - Click "Develop apps" → "Create an app"
   - Configure Admin API access with these scopes:
     - `read_products`
     - `read_customers`
     - `read_orders`
     - `read_inventory`
     - `read_analytics`

2. **Get API Credentials**
   ```env
   SHOPIFY_STORE_URL=your-store.myshopify.com
   SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
   ```

3. **Test Data Requirements**
   - At least 5 products with inventory
   - 3+ customer accounts with order history
   - Recent orders (last 30 days recommended)

### **WooCommerce Store Setup**

1. **Enable REST API**
   - WooCommerce → Settings → Advanced → REST API
   - Click "Add Key"
   - Set permissions to "Read/Write"
   - Copy Consumer Key & Secret

2. **WordPress User Setup**
   - Create admin user for API access
   - Install VARAi WordPress plugin (optional)

3. **Get API Credentials**
   ```env
   WOOCOMMERCE_STORE_URL=your-store.com
   WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxx
   WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxx
   WP_USERNAME=your_admin_username
   WP_PASSWORD=your_admin_password
   ```

4. **Test Data Requirements**
   - At least 10 products with stock
   - 5+ customers with purchase history
   - Recent orders and transactions

## 📋 Test Categories & Scoring

### **Connection Tests (25 points each)**
- **Shopify API Authentication**: Validates store connection
- **WooCommerce API Authentication**: Confirms REST API access
- **WordPress Integration**: Tests admin panel connectivity

### **Data Sync Tests (20 points each)**
- **Product Synchronization**: Real inventory data accuracy
- **Customer Data Integration**: Profile and history sync
- **Order Processing**: Transaction data validation

### **Performance Tests (15 points each)**
- **API Response Times**: < 2 seconds target
- **Dashboard Load Times**: < 3 seconds target
- **Concurrent User Handling**: Load testing

### **Feature Tests (10 points each)**
- **AI Recommendations**: Accuracy with live data
- **Analytics Dashboard**: Real-time metrics
- **Virtual Try-On**: Product visualization
- **Webhook Processing**: Event handling

## 🎯 Scoring System

| Score Range | Status | Meaning |
|-------------|--------|---------|
| 85-100 | 🟢 EXCELLENT | Production ready |
| 75-84 | 🟡 GOOD | Minor improvements needed |
| 60-74 | 🟠 NEEDS IMPROVEMENT | Significant work required |
| 0-59 | 🔴 CRITICAL | Not ready for production |

## 📊 Sample Test Output

```
🧪 VARAi Commerce Studio - Live Store Integration Test Suite
================================================================================
📊 Testing with REAL customer data from live stores
🛍️ Shopify + 🛒 WooCommerce Integration Validation
================================================================================

🔧 Configuration Validation
------------------------------
Shopify Configuration: ✅ Ready
WooCommerce Configuration: ✅ Ready

🛍️ SHOPIFY INTEGRATION TESTS
--------------------------------------------------
  🔐 Testing Shopify API Authentication...
    ✅ Shopify API authentication successful
    📊 Store: Demo Store
    🌐 Domain: demo-store.myshopify.com
  
  📦 Testing Shopify Product Synchronization...
    ✅ Retrieved 25 products
    📊 Sample Product: Premium Sunglasses
    💰 Price: $199.99
    📦 Inventory: 15

📊 Shopify Integration Score: 92.3/100

🛒 WOOCOMMERCE INTEGRATION TESTS
--------------------------------------------------
  🔐 Testing WooCommerce API Authentication...
    ✅ WooCommerce API authentication successful
    📊 WooCommerce Version: 8.5.2
    🌐 WordPress Version: 6.4.2

📊 WooCommerce Integration Score: 88.7/100

================================================================================
📋 COMPREHENSIVE LIVE STORE INTEGRATION REPORT
================================================================================

🎯 OVERALL SCORE: 90.5/100
📊 STATUS: 🟢 EXCELLENT
⏱️ DURATION: 45.2s
📅 COMPLETED: 2025-07-03T18:52:00.000Z

📈 PLATFORM SCORES:
🛍️ Shopify:     92.3/100 ✅
🛒 WooCommerce: 88.7/100 ✅

📊 TEST SUMMARY:
✅ Passed: 11/13
❌ Failed: 2/13
📈 Success Rate: 84.6%

🎯 COVERAGE METRICS:
🔌 Store Connection: 100.0%
🔄 Data Synchronization: 85.7%
⚡ Performance: 90.0%
🔗 Integration: 75.0%

💡 RECOMMENDATIONS:
🎉 Excellent! Your system is ready for production with live customer data.
✅ All critical integrations are working properly.
🚀 Consider implementing advanced features like AI recommendations.
```

## 🛠️ Troubleshooting

### **Common Issues**

**❌ Shopify Authentication Failed**
```
Error: Request failed with status code 401
```
**Solution**: Check your access token and store URL format

**❌ WooCommerce Connection Timeout**
```
Error: timeout of 10000ms exceeded
```
**Solution**: Verify your store URL and increase timeout in config

**❌ WordPress Plugin Not Detected**
```
⚠️ VARAi WordPress plugin not detected
```
**Solution**: Install and activate the VARAi WooCommerce plugin

### **Performance Issues**

**Slow API Responses**
- Check your hosting provider performance
- Verify database optimization
- Consider CDN implementation

**High Memory Usage**
- Reduce test batch sizes
- Implement pagination for large datasets
- Monitor server resources

## 📈 Advanced Configuration

### **Custom Test Thresholds**
```javascript
// In live-store-config.js
this.testThresholds = {
    performance: {
        apiResponseTime: 1500, // Stricter: 1.5 seconds
        dashboardLoadTime: 2000, // Stricter: 2 seconds
        syncTime: 3000 // Stricter: 3 seconds
    },
    accuracy: {
        dataSync: 98, // Higher accuracy requirement
        recommendations: 80,
        analytics: 95
    }
};
```

### **Parallel Testing**
```bash
# Run tests in parallel for faster execution
TEST_PARALLEL=true node run-live-store-tests.js
```

### **Continuous Integration**
```yaml
# .github/workflows/live-store-tests.yml
name: Live Store Integration Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Live Store Tests
        run: |
          cd tests
          npm install
          node run-live-store-tests.js
        env:
          SHOPIFY_STORE_URL: ${{ secrets.SHOPIFY_STORE_URL }}
          SHOPIFY_ACCESS_TOKEN: ${{ secrets.SHOPIFY_ACCESS_TOKEN }}
          WOOCOMMERCE_STORE_URL: ${{ secrets.WOOCOMMERCE_STORE_URL }}
          WOOCOMMERCE_CONSUMER_KEY: ${{ secrets.WOOCOMMERCE_CONSUMER_KEY }}
          WOOCOMMERCE_CONSUMER_SECRET: ${{ secrets.WOOCOMMERCE_CONSUMER_SECRET }}
```

## 🔒 Security Best Practices

### **Credential Management**
- ✅ Use environment variables for all credentials
- ✅ Never commit `.env` files to version control
- ✅ Rotate API keys regularly
- ✅ Use read-only permissions where possible
- ✅ Monitor API usage and rate limits

### **Test Data Safety**
- ✅ Use test/staging stores when possible
- ✅ Avoid modifying production data
- ✅ Implement data backup before testing
- ✅ Use sandbox environments for payment testing

## 📞 Support

### **Getting Help**
- 📧 Email: support@varai.ai
- 📚 Documentation: [docs.varai.ai](https://docs.varai.ai)
- 💬 Discord: [VARAi Community](https://discord.gg/varai)

### **Reporting Issues**
When reporting test failures, include:
- Complete test output
- Store configuration (without credentials)
- Error logs and stack traces
- Environment details (Node.js version, OS)

---

**🎯 Ready to validate your live store integrations? Run the test suite and ensure your VARAi Commerce Studio is production-ready!**