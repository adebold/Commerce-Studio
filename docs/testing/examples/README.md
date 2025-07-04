# 📚 Examples & Use Cases

## Overview

Real-world examples and use cases for VARAi Commerce Studio Live Store Testing Suite. This section provides practical examples, code snippets, and common testing scenarios.

## 📋 Table of Contents

- [Basic Examples](#-basic-examples)
- [Advanced Use Cases](#-advanced-use-cases)
- [Custom Test Scenarios](#-custom-test-scenarios)
- [Integration Examples](#-integration-examples)
- [Performance Testing](#-performance-testing)
- [Multi-Store Testing](#-multi-store-testing)

## 🚀 Basic Examples

### **Simple Store Validation**
```javascript
// Basic store health check
const { runLiveStoreTests } = require('../run-live-store-tests');

async function basicHealthCheck() {
  const results = await runLiveStoreTests({
    platforms: ['shopify', 'woocommerce'],
    testSuite: 'smoke',
    timeout: 30000
  });
  
  console.log(`Overall Score: ${results.overallScore}/100`);
  console.log(`Status: ${results.status}`);
  
  return results.overallScore >= 75;
}

// Usage
basicHealthCheck()
  .then(passed => {
    console.log(passed ? '✅ Store is healthy' : '❌ Store needs attention');
    process.exit(passed ? 0 : 1);
  })
  .catch(console.error);
```

### **Single Platform Testing**
```javascript
// Test only Shopify
const shopifyResults = await runLiveStoreTests({
  platforms: ['shopify'],
  config: {
    shopify: {
      storeUrl: process.env.SHOPIFY_STORE_URL,
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN
    }
  }
});

// Test only WooCommerce
const wooResults = await runLiveStoreTests({
  platforms: ['woocommerce'],
  config: {
    woocommerce: {
      storeUrl: process.env.WOOCOMMERCE_STORE_URL,
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET
    }
  }
});
```

## 🔧 Advanced Use Cases

### **Custom Scoring Weights**
```javascript
// E-commerce focus (prioritize product and order management)
const ecommerceConfig = {
  scoring: {
    shopify: {
      authenticationWeight: 10,      // Reduced
      productSyncWeight: 35,         // Increased
      customerDataWeight: 15,        // Reduced
      orderManagementWeight: 30,     // Increased
      webhookWeight: 5,              // Reduced
      performanceWeight: 5
    }
  }
};

// Performance focus (prioritize speed and reliability)
const performanceConfig = {
  scoring: {
    shopify: {
      authenticationWeight: 15,
      productSyncWeight: 20,
      customerDataWeight: 15,
      orderManagementWeight: 15,
      webhookWeight: 5,
      performanceWeight: 30          // Increased
    }
  }
};
```

### **Conditional Testing**
```javascript
// Test based on store characteristics
async function adaptiveTest(storeInfo) {
  const config = {
    platforms: ['shopify', 'woocommerce'],
    testSuite: 'full'
  };
  
  // Adjust based on store size
  if (storeInfo.productCount > 1000) {
    config.performance = {
      maxResponseTime: 3000,         // Allow more time for large stores
      concurrentRequests: 3          // Reduce concurrency
    };
  }
  
  // Adjust based on business type
  if (storeInfo.businessType === 'b2b') {
    config.scoring = {
      productCatalogWeight: 40,      // B2B focuses on product catalog
      customerManagementWeight: 30
    };
  }
  
  return await runLiveStoreTests(config);
}
```

### **Error Recovery Testing**
```javascript
// Test error handling and recovery
async function errorRecoveryTest() {
  const config = {
    platforms: ['shopify', 'woocommerce'],
    errorTesting: {
      simulateNetworkErrors: true,
      simulateRateLimiting: true,
      simulateServerErrors: true,
      testRetryMechanism: true
    },
    retries: 5,
    retryDelay: 2000
  };
  
  const results = await runLiveStoreTests(config);
  
  // Verify error recovery worked
  const errorRecoveryScore = results.categories.errorRecovery?.score || 0;
  console.log(`Error Recovery Score: ${errorRecoveryScore}/100`);
  
  return errorRecoveryScore >= 80;
}
```

## 🎯 Custom Test Scenarios

### **Black Friday Readiness Test**
```javascript
// High-load scenario testing
async function blackFridayReadinessTest() {
  const config = {
    platforms: ['shopify', 'woocommerce'],
    loadTesting: {
      concurrentUsers: 50,
      testDuration: 300000,          // 5 minutes
      rampUpTime: 60000,             // 1 minute ramp-up
      scenarios: [
        'product_browsing',
        'cart_operations',
        'checkout_process',
        'order_management'
      ]
    },
    performance: {
      maxResponseTime: 1000,         // Strict performance requirements
      errorThreshold: 1              // Maximum 1% error rate
    }
  };
  
  const results = await runLiveStoreTests(config);
  
  // Black Friday specific checks
  const checks = {
    performanceUnderLoad: results.performance.averageResponseTime < 1000,
    errorRateAcceptable: results.performance.errorRate < 0.01,
    inventoryAccurate: results.categories.productSync.inventoryAccuracy > 99,
    checkoutWorking: results.categories.orderManagement.checkoutSuccess > 99
  };
  
  const readinessScore = Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100;
  
  console.log(`Black Friday Readiness: ${readinessScore}%`);
  return readinessScore >= 95;
}
```

### **GDPR Compliance Test**
```javascript
// Data privacy and compliance testing
async function gdprComplianceTest() {
  const config = {
    platforms: ['shopify', 'woocommerce'],
    compliance: {
      testDataPrivacy: true,
      testDataRetention: true,
      testDataDeletion: true,
      testConsentManagement: true,
      testDataPortability: true
    },
    dataHandling: {
      maskPII: true,
      logDataAccess: true,
      validateDataMinimization: true
    }
  };
  
  const results = await runLiveStoreTests(config);
  
  // GDPR specific scoring
  const gdprScore = (
    results.compliance.dataPrivacy * 0.3 +
    results.compliance.dataRetention * 0.2 +
    results.compliance.dataDeletion * 0.2 +
    results.compliance.consentManagement * 0.2 +
    results.compliance.dataPortability * 0.1
  );
  
  return gdprScore >= 90;
}
```

### **Mobile Commerce Test**
```javascript
// Mobile-specific testing
async function mobileCommerceTest() {
  const config = {
    platforms: ['shopify', 'woocommerce'],
    mobile: {
      testMobileAPI: true,
      testResponsiveDesign: true,
      testMobileCheckout: true,
      testAppIntegration: true
    },
    performance: {
      maxResponseTime: 1500,         // Mobile networks are slower
      testOnSlowConnection: true,
      test3GPerformance: true
    }
  };
  
  const results = await runLiveStoreTests(config);
  
  // Mobile-specific metrics
  const mobileScore = (
    results.mobile.apiCompatibility * 0.4 +
    results.mobile.responsiveDesign * 0.3 +
    results.mobile.checkoutExperience * 0.3
  );
  
  return mobileScore >= 85;
}
```

## 🔗 Integration Examples

### **CI/CD Pipeline Integration**
```yaml
# GitHub Actions example
name: Live Store Testing
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  test-live-stores:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd tests
          npm install
          
      - name: Run live store tests
        env:
          SHOPIFY_STORE_URL: ${{ secrets.SHOPIFY_STORE_URL }}
          SHOPIFY_ACCESS_TOKEN: ${{ secrets.SHOPIFY_ACCESS_TOKEN }}
          WOOCOMMERCE_STORE_URL: ${{ secrets.WOOCOMMERCE_STORE_URL }}
          WOOCOMMERCE_CONSUMER_KEY: ${{ secrets.WOOCOMMERCE_CONSUMER_KEY }}
          WOOCOMMERCE_CONSUMER_SECRET: ${{ secrets.WOOCOMMERCE_CONSUMER_SECRET }}
        run: |
          cd tests
          npm test
          
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: tests/live-store-test-results.json
```

### **Slack Notification Integration**
```javascript
// Slack notification after tests
async function notifySlack(results) {
  const webhook = process.env.SLACK_WEBHOOK;
  if (!webhook) return;
  
  const color = results.overallScore >= 85 ? 'good' : 
                results.overallScore >= 75 ? 'warning' : 'danger';
  
  const message = {
    attachments: [{
      color: color,
      title: 'Live Store Test Results',
      fields: [
        {
          title: 'Overall Score',
          value: `${results.overallScore}/100`,
          short: true
        },
        {
          title: 'Status',
          value: results.status,
          short: true
        },
        {
          title: 'Shopify Score',
          value: `${results.shopify.score}/100`,
          short: true
        },
        {
          title: 'WooCommerce Score',
          value: `${results.woocommerce.score}/100`,
          short: true
        }
      ],
      footer: 'VARAi Commerce Studio',
      ts: Math.floor(Date.now() / 1000)
    }]
  };
  
  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
}

// Usage
const results = await runLiveStoreTests();
await notifySlack(results);
```

### **Database Integration**
```javascript
// Store results in database
async function storeResults(results) {
  const db = require('./database');
  
  await db.testResults.create({
    timestamp: new Date(),
    overallScore: results.overallScore,
    status: results.status,
    shopifyScore: results.shopify?.score,
    woocommerceScore: results.woocommerce?.score,
    performanceMetrics: results.performance,
    recommendations: results.recommendations,
    rawResults: JSON.stringify(results)
  });
  
  // Clean up old results (keep last 30 days)
  await db.testResults.deleteMany({
    timestamp: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });
}
```

## ⚡ Performance Testing

### **Load Testing Example**
```javascript
// Simulate high traffic
async function loadTest() {
  const config = {
    platforms: ['shopify', 'woocommerce'],
    loadTesting: {
      virtualUsers: 100,
      duration: 600000,              // 10 minutes
      rampUpTime: 120000,            // 2 minutes
      scenarios: [
        {
          name: 'product_browsing',
          weight: 40,
          actions: [
            'list_products',
            'get_product_details',
            'search_products'
          ]
        },
        {
          name: 'customer_journey',
          weight: 30,
          actions: [
            'register_customer',
            'login_customer',
            'view_account'
          ]
        },
        {
          name: 'order_processing',
          weight: 30,
          actions: [
            'create_cart',
            'add_to_cart',
            'checkout_process'
          ]
        }
      ]
    }
  };
  
  const results = await runLiveStoreTests(config);
  
  // Analyze load test results
  const loadTestMetrics = {
    averageResponseTime: results.performance.averageResponseTime,
    maxResponseTime: results.performance.maxResponseTime,
    throughput: results.performance.requestsPerSecond,
    errorRate: results.performance.errorRate,
    concurrentUsers: results.performance.maxConcurrentUsers
  };
  
  console.log('Load Test Results:', loadTestMetrics);
  
  return loadTestMetrics.errorRate < 0.05 && 
         loadTestMetrics.averageResponseTime < 2000;
}
```

### **Stress Testing Example**
```javascript
// Find breaking point
async function stressTest() {
  const baseConfig = {
    platforms: ['shopify', 'woocommerce'],
    duration: 300000                 // 5 minutes per test
  };
  
  const userCounts = [10, 25, 50, 100, 200, 500];
  const results = [];
  
  for (const userCount of userCounts) {
    console.log(`Testing with ${userCount} concurrent users...`);
    
    const config = {
      ...baseConfig,
      loadTesting: {
        virtualUsers: userCount,
        rampUpTime: 60000
      }
    };
    
    try {
      const result = await runLiveStoreTests(config);
      results.push({
        users: userCount,
        averageResponseTime: result.performance.averageResponseTime,
        errorRate: result.performance.errorRate,
        success: result.performance.errorRate < 0.05
      });
      
      // Stop if error rate exceeds 5%
      if (result.performance.errorRate >= 0.05) {
        console.log(`Breaking point reached at ${userCount} users`);
        break;
      }
    } catch (error) {
      console.log(`System failed at ${userCount} users:`, error.message);
      break;
    }
  }
  
  return results;
}
```

## 🏪 Multi-Store Testing

### **Multi-Environment Testing**
```javascript
// Test across multiple environments
async function multiEnvironmentTest() {
  const environments = [
    {
      name: 'production',
      shopify: {
        storeUrl: process.env.SHOPIFY_PROD_URL,
        accessToken: process.env.SHOPIFY_PROD_TOKEN
      },
      woocommerce: {
        storeUrl: process.env.WC_PROD_URL,
        consumerKey: process.env.WC_PROD_KEY,
        consumerSecret: process.env.WC_PROD_SECRET
      }
    },
    {
      name: 'staging',
      shopify: {
        storeUrl: process.env.SHOPIFY_STAGING_URL,
        accessToken: process.env.SHOPIFY_STAGING_TOKEN
      },
      woocommerce: {
        storeUrl: process.env.WC_STAGING_URL,
        consumerKey: process.env.WC_STAGING_KEY,
        consumerSecret: process.env.WC_STAGING_SECRET
      }
    }
  ];
  
  const results = {};
  
  for (const env of environments) {
    console.log(`Testing ${env.name} environment...`);
    
    const config = {
      platforms: ['shopify', 'woocommerce'],
      shopify: env.shopify,
      woocommerce: env.woocommerce
    };
    
    results[env.name] = await runLiveStoreTests(config);
  }
  
  // Compare environments
  const comparison = {
    production: results.production.overallScore,
    staging: results.staging.overallScore,
    difference: Math.abs(results.production.overallScore - results.staging.overallScore)
  };
  
  console.log('Environment Comparison:', comparison);
  
  // Alert if environments differ significantly
  if (comparison.difference > 10) {
    console.warn('⚠️ Significant difference between environments detected!');
  }
  
  return results;
}
```

### **A/B Testing Support**
```javascript
// Test different configurations
async function abTest() {
  const configA = {
    platforms: ['shopify', 'woocommerce'],
    performance: {
      maxResponseTime: 2000,
      concurrentRequests: 5
    }
  };
  
  const configB = {
    platforms: ['shopify', 'woocommerce'],
    performance: {
      maxResponseTime: 3000,
      concurrentRequests: 3
    }
  };
  
  const [resultsA, resultsB] = await Promise.all([
    runLiveStoreTests(configA),
    runLiveStoreTests(configB)
  ]);
  
  const comparison = {
    configA: {
      score: resultsA.overallScore,
      performance: resultsA.performance.averageResponseTime
    },
    configB: {
      score: resultsB.overallScore,
      performance: resultsB.performance.averageResponseTime
    },
    winner: resultsA.overallScore > resultsB.overallScore ? 'A' : 'B'
  };
  
  console.log('A/B Test Results:', comparison);
  return comparison;
}
```

## 📊 Reporting Examples

### **Custom Report Generation**
```javascript
// Generate custom HTML report
async function generateCustomReport(results) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Live Store Test Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .score { font-size: 2em; font-weight: bold; }
        .excellent { color: #28a745; }
        .good { color: #ffc107; }
        .poor { color: #dc3545; }
        .metric { margin: 10px 0; padding: 10px; border-left: 4px solid #007bff; }
      </style>
    </head>
    <body>
      <h1>VARAi Commerce Studio - Live Store Test Report</h1>
      <div class="score ${getScoreClass(results.overallScore)}">
        Overall Score: ${results.overallScore}/100
      </div>
      
      <h2>Platform Scores</h2>
      <div class="metric">
        <strong>Shopify:</strong> ${results.shopify?.score || 'N/A'}/100
      </div>
      <div class="metric">
        <strong>WooCommerce:</strong> ${results.woocommerce?.score || 'N/A'}/100
      </div>
      
      <h2>Performance Metrics</h2>
      <div class="metric">
        <strong>Average Response Time:</strong> ${results.performance.averageResponseTime}ms
      </div>
      <div class="metric">
        <strong>Error Rate:</strong> ${(results.performance.errorRate * 100).toFixed(2)}%
      </div>
      
      <h2>Recommendations</h2>
      <ul>
        ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
      
      <p><em>Generated on ${new Date().toISOString()}</em></p>
    </body>
    </html>
  `;
  
  require('fs').writeFileSync('test-report.html', html);
  console.log('Custom report generated: test-report.html');
}

function getScoreClass(score) {
  if (score >= 85) return 'excellent';
  if (score >= 75) return 'good';
  return 'poor';
}
```

## 🔗 Related Documentation

- **[Installation & Setup](../installation-setup.md)** - Get started
- **[Configuration Guide](../configuration.md)** - Detailed configuration
- **[Troubleshooting](../troubleshooting.md)** - Common issues
- **[API Reference](api-reference.md)** - Complete API documentation

---

**📚 These examples provide a foundation for implementing comprehensive live store testing in your specific use case.**