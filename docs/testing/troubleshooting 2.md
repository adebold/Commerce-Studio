# 🔧 Troubleshooting Guide

## Overview

Comprehensive troubleshooting guide for VARAi Commerce Studio Live Store Testing Suite. This guide covers common issues, error messages, and solutions for both Shopify and WooCommerce integrations.

## 📋 Table of Contents

- [Quick Diagnostics](#-quick-diagnostics)
- [Authentication Issues](#-authentication-issues)
- [Network & Connectivity](#-network--connectivity)
- [Performance Problems](#-performance-problems)
- [Platform-Specific Issues](#-platform-specific-issues)
- [Configuration Errors](#-configuration-errors)
- [Debug Tools](#-debug-tools)
- [Getting Help](#-getting-help)

## 🚀 Quick Diagnostics

### **Health Check Command**
```bash
# Run comprehensive health check
npm run test:health

# Quick connectivity test
npm run test:ping

# Configuration validation
npm run test:config
```

### **Common Quick Fixes**
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Reset configuration
cp .env.example .env
# Edit .env with your credentials

# Test basic connectivity
curl -I https://your-store.myshopify.com
curl -I https://your-woocommerce-store.com
```

## 🔐 Authentication Issues

### **Shopify Authentication Errors**

#### **Error: Request failed with status code 401**
```
❌ Shopify API authentication failed
❌ Request failed with status code 401
```

**Causes & Solutions:**

1. **Invalid Access Token**
   ```bash
   # Check token format
   echo $SHOPIFY_ACCESS_TOKEN
   # Should start with: shpat_
   ```
   
   **Solution:** Regenerate access token in Shopify admin
   - Go to Apps → App and sales channel settings
   - Find your app → Regenerate token

2. **Expired Token**
   ```bash
   # Test token manually
   curl -H "X-Shopify-Access-Token: $SHOPIFY_ACCESS_TOKEN" \
        https://your-store.myshopify.com/admin/api/2023-10/shop.json
   ```
   
   **Solution:** Create new private app with fresh token

3. **Incorrect Store URL**
   ```env
   # Wrong format
   SHOPIFY_STORE_URL=https://your-store.myshopify.com
   
   # Correct format
   SHOPIFY_STORE_URL=your-store.myshopify.com
   ```

#### **Error: Request failed with status code 403**
```
❌ Insufficient permissions
❌ Request failed with status code 403
```

**Causes & Solutions:**

1. **Missing API Scopes**
   ```
   Required scopes:
   ✅ read_products
   ✅ read_customers  
   ✅ read_orders
   ✅ read_inventory
   ✅ read_analytics
   ```
   
   **Solution:** Update app scopes in Shopify admin

2. **App Not Installed**
   **Solution:** Ensure private app is installed and active

### **WooCommerce Authentication Errors**

#### **Error: Request failed with status code 401**
```
❌ WooCommerce API authentication failed
❌ Request failed with status code 401
```

**Causes & Solutions:**

1. **Invalid API Keys**
   ```bash
   # Check key formats
   echo $WOOCOMMERCE_CONSUMER_KEY    # Should start with: ck_
   echo $WOOCOMMERCE_CONSUMER_SECRET # Should start with: cs_
   ```
   
   **Solution:** Regenerate API keys in WooCommerce settings

2. **Incorrect Permissions**
   ```
   API Key Permissions: Read/Write (required)
   User Role: Administrator (required)
   ```

3. **REST API Disabled**
   ```
   WooCommerce → Settings → Advanced → REST API
   Ensure "Enable the REST API" is checked
   ```

#### **WordPress Admin Login Failed**
```
❌ WordPress login failed
❌ Invalid username or password
```

**Causes & Solutions:**

1. **Incorrect Credentials**
   ```env
   WP_USERNAME=your_admin_username
   WP_PASSWORD=your_secure_password
   ```

2. **Two-Factor Authentication**
   **Solution:** Disable 2FA temporarily or use app passwords

3. **Security Plugin Blocking**
   **Solution:** Whitelist testing IP or disable security plugin temporarily

## 🌐 Network & Connectivity

### **Connection Timeout Errors**

#### **Error: ECONNRESET or ETIMEDOUT**
```
❌ Error: connect ETIMEDOUT
❌ Error: socket hang up
```

**Causes & Solutions:**

1. **Network Connectivity**
   ```bash
   # Test basic connectivity
   ping your-store.myshopify.com
   ping your-woocommerce-store.com
   
   # Test HTTPS connectivity
   curl -I https://your-store.myshopify.com
   curl -I https://your-woocommerce-store.com
   ```

2. **Firewall/Proxy Issues**
   ```bash
   # Configure proxy if needed
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

3. **DNS Resolution**
   ```bash
   # Test DNS resolution
   nslookup your-store.myshopify.com
   nslookup your-woocommerce-store.com
   ```

### **SSL Certificate Issues**

#### **Error: CERT_UNTRUSTED or SSL verification failed**
```
❌ Error: certificate verify failed
❌ Error: self signed certificate
```

**Solutions:**

1. **Update SSL Configuration**
   ```javascript
   // In test configuration
   process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Only for testing
   ```

2. **Check Certificate Validity**
   ```bash
   # Check SSL certificate
   openssl s_client -connect your-store.com:443 -servername your-store.com
   ```

3. **Update Certificate Store**
   ```bash
   # Update system certificates
   # macOS
   brew install ca-certificates
   
   # Ubuntu/Debian
   sudo apt-get update && sudo apt-get install ca-certificates
   ```

## ⚡ Performance Problems

### **Slow Response Times**

#### **Error: Tests timing out or slow performance**
```
❌ Test timeout exceeded
❌ Performance threshold not met
```

**Causes & Solutions:**

1. **Increase Timeout Values**
   ```env
   TEST_TIMEOUT=60000          # Increase to 60 seconds
   PERFORMANCE_THRESHOLD=5000  # Increase threshold
   ```

2. **Reduce Concurrent Requests**
   ```javascript
   // In configuration
   performance: {
     concurrentRequests: 2,    // Reduce from 5 to 2
     retryDelay: 2000         // Increase retry delay
   }
   ```

3. **Optimize Store Performance**
   - Enable caching on your store
   - Optimize database queries
   - Reduce plugin overhead
   - Use CDN for static assets

### **Rate Limiting Issues**

#### **Error: Request failed with status code 429**
```
❌ Too Many Requests
❌ Rate limit exceeded
```

**Solutions:**

1. **Implement Exponential Backoff**
   ```javascript
   // Automatic in latest version
   performance: {
     rateLimitBuffer: 0.5,    // Use 50% of rate limit
     retryDelay: 2000        // 2 second delay
   }
   ```

2. **Reduce Request Frequency**
   ```javascript
   // Reduce concurrent requests
   performance: {
     concurrentRequests: 1,   // Sequential requests only
     requestDelay: 1000      // 1 second between requests
   }
   ```

## 🛍️ Platform-Specific Issues

### **Shopify-Specific Problems**

#### **GraphQL vs REST API Issues**
```
❌ GraphQL endpoint not found
❌ REST API deprecated warnings
```

**Solutions:**

1. **Use Correct API Version**
   ```javascript
   // Use latest stable version
   const apiVersion = '2023-10';
   ```

2. **Check API Deprecations**
   - Review Shopify API changelog
   - Update deprecated endpoints
   - Use GraphQL for complex queries

#### **Webhook Configuration Issues**
```
❌ Webhook delivery failed
❌ Webhook endpoint not reachable
```

**Solutions:**

1. **Verify Webhook URL**
   ```bash
   # Test webhook endpoint
   curl -X POST https://your-webhook-endpoint.com/webhook \
        -H "Content-Type: application/json" \
        -d '{"test": "data"}'
   ```

2. **Check Webhook Verification**
   - Implement HMAC verification
   - Verify webhook secret
   - Handle webhook retries

### **WooCommerce-Specific Problems**

#### **WordPress Plugin Conflicts**
```
❌ Plugin compatibility issues
❌ Fatal error: Cannot redeclare function
```

**Solutions:**

1. **Identify Conflicting Plugins**
   ```bash
   # Test with minimal plugins
   # Deactivate all plugins except WooCommerce
   # Reactivate one by one to identify conflict
   ```

2. **Update Plugin Versions**
   ```bash
   # Check for plugin updates
   wp plugin list --update=available
   wp plugin update --all
   ```

#### **Database Issues**
```
❌ Database connection error
❌ Table doesn't exist
```

**Solutions:**

1. **Check Database Connection**
   ```php
   // Test database connection
   wp db check
   wp db repair
   ```

2. **Verify WooCommerce Tables**
   ```sql
   -- Check WooCommerce tables exist
   SHOW TABLES LIKE 'wp_woocommerce_%';
   ```

## ⚙️ Configuration Errors

### **Environment Variable Issues**

#### **Error: Required environment variable missing**
```
❌ SHOPIFY_STORE_URL is required
❌ Configuration validation failed
```

**Solutions:**

1. **Check Environment File**
   ```bash
   # Verify .env file exists and is readable
   ls -la .env
   cat .env | grep -v "^#" | grep -v "^$"
   ```

2. **Validate Environment Variables**
   ```bash
   # Check variables are loaded
   node -e "require('dotenv').config(); console.log(process.env.SHOPIFY_STORE_URL);"
   ```

### **Configuration File Errors**

#### **Error: Invalid configuration format**
```
❌ SyntaxError: Unexpected token
❌ Configuration file not found
```

**Solutions:**

1. **Validate JSON/JavaScript Syntax**
   ```bash
   # Check configuration file syntax
   node -c live-store-config.js
   ```

2. **Reset to Default Configuration**
   ```bash
   # Backup current config
   cp live-store-config.js live-store-config.js.backup
   
   # Reset to default
   git checkout live-store-config.js
   ```

## 🔍 Debug Tools

### **Enable Debug Mode**
```bash
# Enable comprehensive debugging
DEBUG=true npm test

# Enable specific debug categories
DEBUG_API=true npm test           # API requests
DEBUG_PERFORMANCE=true npm test   # Performance metrics
DEBUG_CONFIG=true npm test        # Configuration loading
```

### **Logging Configuration**
```javascript
// Enhanced logging
const debugConfig = {
  logLevel: 'debug',              // error, warn, info, debug
  logToFile: true,                // Log to file
  logFile: './logs/debug.log',    // Log file path
  logApiRequests: true,           // Log all API requests
  logApiResponses: false,         // Log API responses (sensitive)
  logPerformance: true,           // Log performance metrics
  logErrors: true                 // Log detailed errors
};
```

### **Network Debugging**
```bash
# Monitor network traffic
# macOS
sudo tcpdump -i any host your-store.myshopify.com

# Linux
sudo netstat -tulpn | grep :443

# Windows
netstat -an | findstr :443
```

### **API Request Debugging**
```bash
# Test API requests manually
# Shopify
curl -v -H "X-Shopify-Access-Token: $SHOPIFY_ACCESS_TOKEN" \
     https://your-store.myshopify.com/admin/api/2023-10/shop.json

# WooCommerce
curl -v -u "$WOOCOMMERCE_CONSUMER_KEY:$WOOCOMMERCE_CONSUMER_SECRET" \
     https://your-store.com/wp-json/wc/v3/system_status
```

## 📊 Performance Debugging

### **Identify Bottlenecks**
```bash
# Run performance profiling
npm run test:performance

# Monitor resource usage
top -p $(pgrep -f "node.*test")
```

### **Memory Issues**
```bash
# Check memory usage
node --max-old-space-size=4096 run-live-store-tests.js

# Monitor memory leaks
node --inspect run-live-store-tests.js
```

## 🆘 Getting Help

### **Collect Debug Information**
```bash
# Generate debug report
npm run debug:report

# This creates a debug package with:
# - Configuration files
# - Log files
# - System information
# - Network diagnostics
# - Error traces
```

### **Debug Report Contents**
```
debug-report-{timestamp}.zip
├── config/
│   ├── .env (sanitized)
│   ├── live-store-config.js
│   └── package.json
├── logs/
│   ├── test.log
│   ├── error.log
│   └── debug.log
├── system/
│   ├── system-info.txt
│   ├── network-info.txt
│   └── node-version.txt
└── traces/
    ├── stack-traces.txt
    └── api-requests.log
```

### **Support Channels**

1. **Documentation**
   - [Installation Guide](installation-setup.md)
   - [Configuration Guide](configuration.md)
   - [Platform Guides](shopify/README.md)

2. **Community Support**
   - GitHub Issues
   - Community Forums
   - Stack Overflow (tag: varai-commerce-studio)

3. **Professional Support**
   - Email: support@varai.com
   - Include debug report
   - Specify platform and error details

### **Before Contacting Support**

**Checklist:**
- [ ] Reviewed this troubleshooting guide
- [ ] Checked platform status pages
- [ ] Verified credentials and configuration
- [ ] Tested basic connectivity
- [ ] Generated debug report
- [ ] Documented exact error messages
- [ ] Listed steps to reproduce issue

**Information to Include:**
- Platform versions (Node.js, npm, OS)
- Store platforms (Shopify/WooCommerce versions)
- Exact error messages
- Configuration details (sanitized)
- Steps to reproduce
- Debug report (if possible)

## 🔄 Recovery Procedures

### **Complete Reset**
```bash
# Nuclear option - complete reset
rm -rf node_modules package-lock.json
rm .env
rm -rf logs/
rm -rf reports/

# Reinstall
npm install
cp .env.example .env
# Edit .env with credentials

# Test
npm run test:config
npm run test:quick
```

### **Backup and Restore**
```bash
# Backup working configuration
tar -czf config-backup-$(date +%Y%m%d).tar.gz .env live-store-config.js

# Restore from backup
tar -xzf config-backup-20231201.tar.gz
```

## 📈 Monitoring and Prevention

### **Health Monitoring**
```bash
# Set up regular health checks
# Add to crontab
0 */6 * * * cd /path/to/project && npm run test:health >> logs/health.log 2>&1
```

### **Preventive Measures**
- Regular credential rotation (90 days)
- Monitor API rate limits
- Keep dependencies updated
- Regular configuration backups
- Monitor store platform updates

---

**🔧 Most issues can be resolved by checking credentials, network connectivity, and configuration. When in doubt, start with the quick diagnostics!**