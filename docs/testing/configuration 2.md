# ⚙️ Configuration Guide

## Overview

Complete configuration guide for VARAi Commerce Studio Live Store Testing Suite. This guide covers all configuration options, environment variables, and customization settings.

## 📋 Table of Contents

- [Environment Variables](#-environment-variables)
- [Test Configuration](#-test-configuration)
- [Performance Tuning](#-performance-tuning)
- [Scoring Configuration](#-scoring-configuration)
- [Reporting Options](#-reporting-options)
- [Security Settings](#-security-settings)
- [Advanced Configuration](#-advanced-configuration)

## 🔧 Environment Variables

### **Core Configuration**
```env
# =============================================================================
# VARAi Commerce Studio - Live Store Testing Configuration
# =============================================================================

# Shopify Store Configuration
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# WooCommerce Store Configuration
WOOCOMMERCE_STORE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# WordPress Admin Credentials (Optional)
WP_USERNAME=admin
WP_PASSWORD=secure_password_here
```

### **Testing Configuration**
```env
# Test Execution Settings
TEST_TIMEOUT=30000                    # Test timeout in milliseconds
MAX_RETRIES=3                        # Maximum retry attempts
PERFORMANCE_THRESHOLD=2000           # Performance threshold in ms
CONCURRENT_TESTS=5                   # Number of concurrent tests

# Test Scope Configuration
ENABLE_SHOPIFY_TESTS=true           # Enable Shopify testing
ENABLE_WOOCOMMERCE_TESTS=true       # Enable WooCommerce testing
ENABLE_PERFORMANCE_TESTS=true       # Enable performance testing
ENABLE_INTEGRATION_TESTS=true       # Enable integration testing
```

### **Reporting Configuration**
```env
# Report Generation
GENERATE_DETAILED_REPORTS=true      # Generate detailed test reports
EXPORT_JSON_RESULTS=true            # Export results to JSON
EXPORT_CSV_RESULTS=false            # Export results to CSV
EXPORT_PDF_REPORTS=false            # Export PDF reports

# Report Storage
REPORT_OUTPUT_DIR=./reports         # Report output directory
REPORT_RETENTION_DAYS=30            # Report retention period
COMPRESS_OLD_REPORTS=true           # Compress old reports
```

### **Debug Configuration**
```env
# Debug Settings
DEBUG_MODE=false                    # Enable debug mode
VERBOSE_LOGGING=false               # Enable verbose logging
LOG_API_REQUESTS=false              # Log all API requests
LOG_PERFORMANCE_METRICS=true       # Log performance metrics

# Log Configuration
LOG_LEVEL=info                      # Log level (error, warn, info, debug)
LOG_OUTPUT_FILE=./logs/test.log     # Log output file
MAX_LOG_FILE_SIZE=10MB              # Maximum log file size
LOG_ROTATION_COUNT=5                # Number of log files to keep
```

## 🧪 Test Configuration

### **Main Configuration File**
Edit [`live-store-config.js`](../tests/live-store-config.js) for detailed test settings:

```javascript
module.exports = {
  // Performance Configuration
  performance: {
    maxResponseTime: 2000,           // Maximum API response time (ms)
    maxTestDuration: 300000,         // Maximum total test time (ms)
    retryAttempts: 3,                // Number of retry attempts
    retryDelay: 1000,                // Delay between retries (ms)
    concurrentRequests: 5,           // Max concurrent API requests
    rateLimitBuffer: 0.8             // Rate limit safety buffer (80%)
  },

  // Validation Thresholds
  validation: {
    shopify: {
      minProducts: 1,                // Minimum products required
      minCustomers: 0,               // Minimum customers required
      minOrders: 0,                  // Minimum orders required
      requiredScopes: [              // Required API scopes
        'read_products',
        'read_customers',
        'read_orders'
      ]
    },
    
    woocommerce: {
      minProducts: 1,                // Minimum products required
      minCustomers: 0,               // Minimum customers required
      minOrders: 0,                  // Minimum orders required
      requiredPlugins: [             // Required WordPress plugins
        'woocommerce/woocommerce.php'
      ],
      minWordPressVersion: '5.0',    // Minimum WordPress version
      minWooCommerceVersion: '6.0'   // Minimum WooCommerce version
    }
  },

  // Scoring Configuration
  scoring: {
    passingThreshold: 75,            // Minimum score for "passing"
    excellentThreshold: 85,          // Minimum score for "excellent"
    
    shopify: {
      authenticationWeight: 20,      // Authentication test weight (%)
      productSyncWeight: 25,         // Product sync test weight (%)
      customerDataWeight: 20,        // Customer data test weight (%)
      orderManagementWeight: 20,     // Order management test weight (%)
      webhookWeight: 10,             // Webhook test weight (%)
      performanceWeight: 5           // Performance test weight (%)
    },
    
    woocommerce: {
      authenticationWeight: 15,      // Authentication test weight (%)
      productCatalogWeight: 25,      // Product catalog test weight (%)
      customerManagementWeight: 20,  // Customer management test weight (%)
      orderProcessingWeight: 20,     // Order processing test weight (%)
      wordpressIntegrationWeight: 10, // WordPress integration weight (%)
      pluginEcosystemWeight: 5,      // Plugin ecosystem weight (%)
      performanceWeight: 5           // Performance test weight (%)
    }
  },

  // Reporting Configuration
  reporting: {
    generateDetailedReports: true,   // Generate detailed reports
    exportJsonResults: true,         // Export JSON results
    includePerformanceMetrics: true, // Include performance data
    includeErrorDetails: true,       // Include error details
    generateRecommendations: true,   // Generate improvement recommendations
    
    outputFormats: [                 // Supported output formats
      'json',
      'console',
      'html'
    ],
    
    reportTemplate: 'default',       // Report template to use
    includeScreenshots: false,       // Include screenshots (future feature)
    compressReports: true            // Compress large reports
  }
};
```

### **Platform-Specific Configuration**

#### **Shopify Configuration**
```javascript
// shopify-config.js
module.exports = {
  api: {
    version: '2023-10',              // Shopify API version
    timeout: 10000,                  // API timeout (ms)
    retries: 3,                      // Retry attempts
    rateLimit: {
      requestsPerSecond: 2,          // Requests per second
      burstLimit: 40                 // Burst limit
    }
  },
  
  testing: {
    productLimit: 50,                // Max products to test
    customerLimit: 50,               // Max customers to test
    orderLimit: 50,                  // Max orders to test
    testWebhooks: true,              // Test webhook functionality
    testBulkOperations: false        // Test bulk operations
  },
  
  validation: {
    requiredFields: {
      products: ['id', 'title', 'handle', 'status'],
      customers: ['id', 'email', 'first_name', 'last_name'],
      orders: ['id', 'order_number', 'total_price', 'financial_status']
    }
  }
};
```

#### **WooCommerce Configuration**
```javascript
// woocommerce-config.js
module.exports = {
  api: {
    version: 'v3',                   // WooCommerce API version
    timeout: 10000,                  // API timeout (ms)
    retries: 3,                      // Retry attempts
    perPage: 20                      // Items per page
  },
  
  wordpress: {
    loginTimeout: 15000,             // WordPress login timeout (ms)
    adminPath: '/wp-admin',          // WordPress admin path
    testAdminAccess: true,           // Test admin access
    checkPluginStatus: true          // Check plugin status
  },
  
  testing: {
    productLimit: 50,                // Max products to test
    customerLimit: 50,               // Max customers to test
    orderLimit: 50,                  // Max orders to test
    testThemeCompatibility: false,   // Test theme compatibility
    testPluginCompatibility: true    // Test plugin compatibility
  },
  
  validation: {
    requiredFields: {
      products: ['id', 'name', 'slug', 'status', 'type'],
      customers: ['id', 'email', 'first_name', 'last_name'],
      orders: ['id', 'number', 'status', 'total']
    },
    
    requiredPlugins: [
      'woocommerce/woocommerce.php'
    ],
    
    recommendedPlugins: [
      'woocommerce-admin/woocommerce-admin.php'
    ]
  }
};
```

## ⚡ Performance Tuning

### **Response Time Optimization**
```javascript
// Performance configuration
const performanceConfig = {
  // API Request Optimization
  apiOptimization: {
    connectionPooling: true,         // Enable connection pooling
    keepAlive: true,                 // Keep connections alive
    maxSockets: 10,                  // Maximum socket connections
    timeout: 5000,                   // Request timeout
    retryDelay: 1000                 // Delay between retries
  },
  
  // Concurrent Request Management
  concurrency: {
    maxConcurrent: 5,                // Max concurrent requests
    queueTimeout: 30000,             // Queue timeout
    rateLimitRespect: true,          // Respect rate limits
    adaptiveThrottling: true         // Adaptive throttling
  },
  
  // Caching Configuration
  caching: {
    enableResponseCache: false,      // Cache API responses
    cacheTimeout: 300000,            // Cache timeout (5 minutes)
    maxCacheSize: 100,               // Max cached responses
    cacheKeyStrategy: 'url+params'   // Cache key strategy
  }
};
```

### **Memory Management**
```javascript
// Memory optimization settings
const memoryConfig = {
  // Garbage Collection
  gc: {
    forceGC: false,                  // Force garbage collection
    gcInterval: 60000,               // GC interval (1 minute)
    memoryThreshold: 512             // Memory threshold (MB)
  },
  
  // Data Management
  dataManagement: {
    streamLargeResponses: true,      // Stream large API responses
    maxResponseSize: 10485760,       // Max response size (10MB)
    cleanupInterval: 30000,          // Cleanup interval
    maxRetainedResults: 1000         // Max retained test results
  }
};
```

## 📊 Scoring Configuration

### **Custom Scoring Weights**
```javascript
// Custom scoring configuration
const customScoring = {
  // Global weights
  global: {
    functionalityWeight: 70,         // Functionality tests (70%)
    performanceWeight: 20,           // Performance tests (20%)
    securityWeight: 10               // Security tests (10%)
  },
  
  // Platform-specific weights
  platforms: {
    shopify: {
      authentication: 20,
      productSync: 25,
      customerData: 20,
      orderManagement: 20,
      webhooks: 10,
      performance: 5
    },
    
    woocommerce: {
      authentication: 15,
      productCatalog: 25,
      customerManagement: 20,
      orderProcessing: 20,
      wordpressIntegration: 10,
      pluginEcosystem: 5,
      performance: 5
    }
  },
  
  // Score thresholds
  thresholds: {
    excellent: 90,                   // Excellent threshold
    good: 75,                        // Good threshold
    acceptable: 60,                  // Acceptable threshold
    critical: 40                     // Critical threshold
  }
};
```

### **Dynamic Scoring**
```javascript
// Dynamic scoring based on store characteristics
const dynamicScoring = {
  // Adjust weights based on store size
  storeSize: {
    small: {                         // < 100 products
      performanceWeight: 0.8,        // Reduce performance weight
      functionalityWeight: 1.2       // Increase functionality weight
    },
    
    medium: {                        // 100-1000 products
      performanceWeight: 1.0,        // Standard weights
      functionalityWeight: 1.0
    },
    
    large: {                         // > 1000 products
      performanceWeight: 1.3,        // Increase performance weight
      functionalityWeight: 0.9       // Slightly reduce functionality weight
    }
  },
  
  // Adjust based on business type
  businessType: {
    b2c: {
      customerDataWeight: 1.2,       // Increase customer focus
      orderManagementWeight: 1.1
    },
    
    b2b: {
      productCatalogWeight: 1.2,     // Increase product focus
      performanceWeight: 1.1
    }
  }
};
```

## 📋 Reporting Options

### **Report Formats**
```javascript
// Report configuration
const reportConfig = {
  // Output formats
  formats: {
    console: {
      enabled: true,                 // Console output
      colorized: true,               // Colorized output
      detailed: false                // Detailed console output
    },
    
    json: {
      enabled: true,                 // JSON output
      pretty: true,                  // Pretty-printed JSON
      includeRawData: false          // Include raw test data
    },
    
    html: {
      enabled: false,                // HTML report
      template: 'default',           // HTML template
      includeCharts: true,           // Include charts
      responsive: true               // Responsive design
    },
    
    csv: {
      enabled: false,                // CSV export
      delimiter: ',',                // CSV delimiter
      includeHeaders: true           // Include column headers
    },
    
    pdf: {
      enabled: false,                // PDF report
      template: 'professional',      // PDF template
      includeGraphs: true,           // Include graphs
      pageSize: 'A4'                 // Page size
    }
  },
  
  // Report content
  content: {
    executiveSummary: true,          // Include executive summary
    detailedResults: true,           // Include detailed results
    performanceMetrics: true,        // Include performance metrics
    recommendations: true,           // Include recommendations
    errorDetails: true,              // Include error details
    apiLogs: false,                  // Include API logs
    screenshots: false               // Include screenshots
  },
  
  // Report storage
  storage: {
    directory: './reports',          // Report directory
    filename: 'live-store-test-{timestamp}', // Filename pattern
    compression: true,               // Compress reports
    retention: 30,                   // Retention days
    archiving: true                  // Archive old reports
  }
};
```

## 🔒 Security Settings

### **API Security**
```javascript
// Security configuration
const securityConfig = {
  // API Security
  api: {
    validateCertificates: true,      // Validate SSL certificates
    allowSelfSigned: false,          // Allow self-signed certificates
    timeout: 10000,                  // Request timeout
    maxRedirects: 5,                 // Maximum redirects
    userAgent: 'VARAi-Commerce-Studio-Testing/1.0' // User agent
  },
  
  // Credential Management
  credentials: {
    encryptAtRest: false,            // Encrypt credentials at rest
    maskInLogs: true,                // Mask credentials in logs
    rotationReminder: 90,            // Rotation reminder (days)
    validateOnStartup: true          // Validate credentials on startup
  },
  
  // Network Security
  network: {
    allowedHosts: [],                // Allowed hosts (empty = all)
    blockedHosts: [],                // Blocked hosts
    requireHttps: true,              // Require HTTPS
    validateHostnames: true          // Validate hostnames
  }
};
```

### **Data Protection**
```javascript
// Data protection settings
const dataProtection = {
  // PII Handling
  pii: {
    maskCustomerData: true,          // Mask customer PII
    maskPaymentData: true,           // Mask payment information
    logDataAccess: true,             // Log data access
    dataRetention: 30                // Data retention days
  },
  
  // Compliance
  compliance: {
    gdprCompliant: true,             // GDPR compliance mode
    ccpaCompliant: true,             // CCPA compliance mode
    dataMinimization: true,          // Data minimization
    consentRequired: false           // Consent required for testing
  }
};
```

## 🚀 Advanced Configuration

### **Multi-Store Configuration**
```javascript
// Multi-store testing configuration
const multiStoreConfig = {
  stores: [
    {
      name: 'production',
      platform: 'shopify',
      config: {
        storeUrl: 'prod-store.myshopify.com',
        accessToken: process.env.SHOPIFY_PROD_TOKEN
      },
      weight: 1.0                    // Store weight in overall score
    },
    
    {
      name: 'staging',
      platform: 'woocommerce',
      config: {
        storeUrl: 'https://staging.example.com',
        consumerKey: process.env.WC_STAGING_KEY,
        consumerSecret: process.env.WC_STAGING_SECRET
      },
      weight: 0.5                    // Lower weight for staging
    }
  ],
  
  // Multi-store execution
  execution: {
    parallel: true,                  // Run stores in parallel
    maxConcurrent: 3,                // Max concurrent stores
    failFast: false,                 // Continue on store failure
    aggregateResults: true           // Aggregate results across stores
  }
};
```

### **CI/CD Integration**
```javascript
// CI/CD configuration
const cicdConfig = {
  // Exit codes
  exitCodes: {
    success: 0,                      // Success exit code
    testFailure: 1,                  // Test failure exit code
    configError: 2,                  // Configuration error
    networkError: 3                  // Network error
  },
  
  // Thresholds for CI/CD
  ciThresholds: {
    minimumScore: 75,                // Minimum passing score
    performanceThreshold: 2000,      // Performance threshold
    errorThreshold: 5,               // Maximum allowed errors
    warningThreshold: 10             // Maximum allowed warnings
  },
  
  // Notifications
  notifications: {
    slack: {
      enabled: false,                // Slack notifications
      webhook: process.env.SLACK_WEBHOOK,
      channel: '#testing'
    },
    
    email: {
      enabled: false,                // Email notifications
      smtp: process.env.SMTP_CONFIG,
      recipients: ['team@example.com']
    }
  }
};
```

### **Custom Test Suites**
```javascript
// Custom test suite configuration
const customTestSuites = {
  // Quick smoke test
  smoke: {
    tests: ['authentication', 'basic-connectivity'],
    timeout: 30000,
    retries: 1
  },
  
  // Full regression test
  regression: {
    tests: ['all'],
    timeout: 300000,
    retries: 3,
    includePerformance: true
  },
  
  // Performance-focused test
  performance: {
    tests: ['performance', 'load-testing'],
    timeout: 600000,
    retries: 1,
    concurrency: 10
  }
};
```

## 📝 Configuration Validation

### **Validation Script**
```bash
# Validate configuration
npm run test:config

# Validate specific platform
npm run test:config:shopify
npm run test:config:woocommerce

# Validate environment
npm run test:env
```

### **Configuration Checklist**
- [ ] Environment variables configured
- [ ] API credentials valid
- [ ] Test thresholds appropriate
- [ ] Performance settings optimized
- [ ] Security settings configured
- [ ] Reporting options selected
- [ ] Multi-store setup (if applicable)
- [ ] CI/CD integration configured

## 🔗 Related Documentation

- **[Installation & Setup](installation-setup.md)** - Initial setup guide
- **[Quick Start Guide](quick-start.md)** - Get started quickly
- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions
- **[Shopify Testing](shopify/README.md)** - Shopify-specific configuration
- **[WooCommerce Testing](woocommerce/README.md)** - WooCommerce-specific configuration

---

**⚙️ Configuration complete! Your testing suite is now customized for your specific needs.**