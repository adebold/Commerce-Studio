# 🛠️ Installation & Setup Guide

## 📋 Prerequisites

### **System Requirements**
- **Node.js**: Version 16.0 or higher
- **npm**: Version 7.0 or higher (comes with Node.js)
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: 500MB free space for dependencies

### **Store Access Requirements**
- **Shopify Store**: Admin access with API permissions
- **WooCommerce Store**: WordPress admin access with REST API enabled
- **Network**: Stable internet connection for API calls

## 🚀 Installation Steps

### **Step 1: Clone or Navigate to Project**
```bash
# If cloning the repository
git clone https://github.com/your-org/varai-commerce-studio.git
cd varai-commerce-studio

# Or navigate to existing project
cd /path/to/varai-commerce-studio
```

### **Step 2: Install Dependencies**
```bash
# Navigate to tests directory
cd tests

# Install required packages
npm install

# Verify installation
npm list
```

**Expected Dependencies:**
```json
{
  "axios": "^1.6.0",
  "dotenv": "^16.3.0"
}
```

### **Step 3: Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Open for editing (choose your preferred editor)
nano .env
# OR
vim .env
# OR
code .env
```

## 🔐 Store Credentials Setup

### **Shopify Store Configuration**

#### **1. Create Private App (Recommended)**
1. Go to your Shopify Admin: `https://your-store.myshopify.com/admin`
2. Navigate to **Apps** → **App and sales channel settings**
3. Click **Develop apps** → **Create an app**
4. Name your app: "VARAi Commerce Studio Testing"
5. Click **Configure Admin API scopes**

#### **2. Required API Scopes**
```
✅ read_products
✅ read_customers
✅ read_orders
✅ read_inventory
✅ read_analytics
✅ read_reports
✅ read_price_rules
✅ read_discounts
```

#### **3. Generate Access Token**
1. Click **Install app**
2. Copy the **Admin API access token**
3. Add to your `.env` file:

```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **WooCommerce Store Configuration**

#### **1. Enable REST API**
1. Go to WordPress Admin: `https://your-store.com/wp-admin`
2. Navigate to **WooCommerce** → **Settings** → **Advanced** → **REST API**
3. Click **Add key**

#### **2. API Key Settings**
- **Description**: VARAi Commerce Studio Testing
- **User**: Select admin user
- **Permissions**: Read/Write
- **Click**: Generate API Key

#### **3. Copy Credentials**
```env
WOOCOMMERCE_STORE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# WordPress Admin Credentials (for advanced testing)
WP_USERNAME=your_admin_username
WP_PASSWORD=your_admin_password
```

## ⚙️ Configuration Options

### **Complete .env File Example**
```env
# =============================================================================
# VARAi Commerce Studio - Live Store Testing Configuration
# =============================================================================

# Shopify Store Configuration
SHOPIFY_STORE_URL=demo-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# WooCommerce Store Configuration
WOOCOMMERCE_STORE_URL=https://demo-store.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# WordPress Admin Credentials (Optional - for advanced testing)
WP_USERNAME=admin
WP_PASSWORD=secure_password_here

# Testing Configuration
TEST_TIMEOUT=30000
MAX_RETRIES=3
PERFORMANCE_THRESHOLD=2000

# Reporting Configuration
GENERATE_DETAILED_REPORTS=true
EXPORT_JSON_RESULTS=true
ENABLE_PERFORMANCE_MONITORING=true

# Debug Configuration
DEBUG_MODE=false
VERBOSE_LOGGING=false
```

### **Configuration Validation**
```bash
# Test your configuration
npm run test:config

# Expected output:
# ✅ Shopify Configuration: Valid
# ✅ WooCommerce Configuration: Valid
# ✅ All required environment variables present
```

## 🧪 Test Installation

### **Quick Verification**
```bash
# Run a quick test to verify everything is working
npm run test:quick

# Expected output:
# 🧪 VARAi Commerce Studio - Quick Test
# ✅ Dependencies installed
# ✅ Configuration valid
# ✅ Shopify connection successful
# ✅ WooCommerce connection successful
# 🎉 Installation complete!
```

### **Full Test Suite**
```bash
# Run the complete test suite
npm test

# This will take 2-5 minutes and test all integrations
```

## 🔧 Advanced Configuration

### **Custom Test Thresholds**
Edit `live-store-config.js` to customize testing parameters:

```javascript
module.exports = {
  performance: {
    maxResponseTime: 2000,    // Maximum API response time (ms)
    maxTestDuration: 300000,  // Maximum total test time (ms)
    retryAttempts: 3          // Number of retry attempts
  },
  
  scoring: {
    passingThreshold: 75,     // Minimum score for "passing"
    excellentThreshold: 85    // Minimum score for "excellent"
  },
  
  reporting: {
    generateDetailedReports: true,
    exportJsonResults: true,
    includePerformanceMetrics: true
  }
};
```

### **Multiple Store Testing**
You can test multiple stores by creating additional environment files:

```bash
# Create store-specific configs
cp .env .env.store1
cp .env .env.store2

# Run tests for specific store
ENV_FILE=.env.store1 npm test
ENV_FILE=.env.store2 npm test
```

## 🛡️ Security Best Practices

### **Environment File Security**
```bash
# Ensure .env files are not committed to version control
echo ".env*" >> .gitignore

# Set proper file permissions (Unix/Linux/macOS)
chmod 600 .env
```

### **API Key Management**
- **Never commit** API keys to version control
- **Use environment variables** for all sensitive data
- **Rotate keys regularly** (every 90 days recommended)
- **Use read-only permissions** when possible
- **Monitor API usage** for unusual activity

### **Network Security**
- **Use HTTPS** for all API endpoints
- **Whitelist IP addresses** if your store supports it
- **Enable rate limiting** on your store APIs
- **Monitor failed authentication attempts**

## 🔍 Troubleshooting Installation

### **Common Issues**

#### **Node.js Version Issues**
```bash
# Check Node.js version
node --version

# If version is too old, update Node.js
# Visit: https://nodejs.org/en/download/
```

#### **Permission Errors**
```bash
# On macOS/Linux, you might need to use sudo
sudo npm install

# Or fix npm permissions (recommended)
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

#### **Network/Firewall Issues**
```bash
# Test network connectivity
curl -I https://your-store.myshopify.com
curl -I https://your-woocommerce-store.com

# If behind corporate firewall, configure proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

#### **API Authentication Errors**
```bash
# Test Shopify connection manually
curl -H "X-Shopify-Access-Token: YOUR_TOKEN" \
     https://your-store.myshopify.com/admin/api/2023-10/shop.json

# Test WooCommerce connection manually
curl -u "CONSUMER_KEY:CONSUMER_SECRET" \
     https://your-store.com/wp-json/wc/v3/system_status
```

### **Getting Help**

If you encounter issues:

1. **Check the logs**: Look for error messages in the console output
2. **Verify credentials**: Double-check all API keys and URLs
3. **Test connectivity**: Ensure you can reach your stores from your network
4. **Review documentation**: Check platform-specific guides
5. **Contact support**: Reach out with specific error messages

## ✅ Installation Checklist

- [ ] Node.js 16+ installed
- [ ] Project dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Shopify API credentials added
- [ ] WooCommerce API credentials added
- [ ] Configuration validated (`npm run test:config`)
- [ ] Quick test passed (`npm run test:quick`)
- [ ] Security best practices implemented
- [ ] `.env` files added to `.gitignore`

## 🎯 Next Steps

Once installation is complete:

1. **[Run Quick Start Guide](quick-start.md)** - Get testing immediately
2. **[Review Configuration Guide](configuration.md)** - Understand all options
3. **[Explore Platform Guides](shopify/README.md)** - Platform-specific testing
4. **[Set Up CI/CD](ci-cd-integration.md)** - Automate your testing

---

**🎉 Installation Complete! You're ready to start testing your live store integrations.**