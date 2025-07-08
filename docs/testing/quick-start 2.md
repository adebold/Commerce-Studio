# 🚀 Quick Start Guide - Live Store Testing

## ⚡ 5-Minute Setup

Get your live store testing up and running in just 5 minutes!

### **Prerequisites**
- Node.js 16+ installed
- Access to live Shopify and/or WooCommerce stores
- Store API credentials

### **Step 1: Installation**
```bash
# Navigate to the tests directory
cd tests

# Install dependencies
npm install axios dotenv
```

### **Step 2: Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit with your store credentials
nano .env
```

**Required Environment Variables:**
```env
# Shopify Store
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx

# WooCommerce Store
WOOCOMMERCE_STORE_URL=your-store.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxx

# WordPress Admin (for WooCommerce)
WP_USERNAME=your_admin_username
WP_PASSWORD=your_admin_password
```

### **Step 3: Run Tests**
```bash
# Run complete test suite
npm test

# Or run individual platform tests
npm run test:shopify
npm run test:woocommerce
```

### **Step 4: View Results**
```bash
# View detailed results
cat live-store-test-results.json

# Check test configuration
npm run test:config
```

## 📊 Expected Output

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
    📊 Store: Your Store Name
    🌐 Domain: your-store.myshopify.com

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

💡 RECOMMENDATIONS:
🎉 Excellent! Your system is ready for production with live customer data.
✅ All critical integrations are working properly.
🚀 Consider implementing advanced features like AI recommendations.
```

## 🎯 Score Interpretation

| Score | Status | Action Required |
|-------|--------|-----------------|
| 85-100 | 🟢 EXCELLENT | ✅ Production ready |
| 75-84 | 🟡 GOOD | ⚠️ Minor improvements |
| 60-74 | 🟠 NEEDS WORK | 🔧 Significant fixes needed |
| 0-59 | 🔴 CRITICAL | 🚨 Not production ready |

## 🛠️ Common Issues

### **Authentication Errors**
```
❌ Error: Request failed with status code 401
```
**Solution**: Check your API credentials in `.env` file

### **Store Not Found**
```
❌ Error: getaddrinfo ENOTFOUND your-store.myshopify.com
```
**Solution**: Verify your store URL format

### **Permission Denied**
```
❌ Error: Request failed with status code 403
```
**Solution**: Ensure API permissions include required scopes

## 📚 Next Steps

1. **Review Failed Tests**: Address any failing test categories
2. **Optimize Performance**: Improve response times if needed
3. **Schedule Regular Testing**: Set up automated testing
4. **Explore Advanced Features**: Check out [Advanced Examples](examples/advanced-examples.md)

## 🔗 Related Documentation

- **[Installation & Setup](installation-setup.md)** - Detailed setup instructions
- **[Configuration Guide](configuration.md)** - Complete configuration options
- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions
- **[Shopify Testing](shopify/README.md)** - Shopify-specific testing
- **[WooCommerce Testing](woocommerce/README.md)** - WooCommerce-specific testing

---

**🎉 Congratulations! You're now ready to validate your live store integrations with confidence.**