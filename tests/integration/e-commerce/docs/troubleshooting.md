# VARAi E-commerce Integration Troubleshooting Guide

This guide provides solutions for common issues encountered when running the VARAi e-commerce integration tests.

## Table of Contents

1. [General Troubleshooting](#general-troubleshooting)
2. [Environment Setup Issues](#environment-setup-issues)
3. [Authentication Issues](#authentication-issues)
4. [Product Synchronization Issues](#product-synchronization-issues)
5. [Order Processing Issues](#order-processing-issues)
6. [Webhook Issues](#webhook-issues)
7. [Performance Issues](#performance-issues)
8. [Platform-Specific Issues](#platform-specific-issues)
   - [Shopify Issues](#shopify-issues)
   - [Magento Issues](#magento-issues)
   - [WooCommerce Issues](#woocommerce-issues)
   - [BigCommerce Issues](#bigcommerce-issues)
9. [Debugging Techniques](#debugging-techniques)
10. [Getting Help](#getting-help)

## General Troubleshooting

### Tests Fail to Run

**Symptoms:**
- Tests don't start
- Error messages about missing dependencies
- Syntax errors

**Possible Causes:**
- Missing dependencies
- Incorrect Node.js version
- Incorrect test configuration

**Solutions:**
1. Ensure all dependencies are installed:
   ```bash
   npm install
   ```

2. Verify Node.js version (should be v16 or later):
   ```bash
   node --version
   ```

3. Check test configuration in `jest.config.js` and `package.json`

4. Try running with verbose output:
   ```bash
   npm test -- --verbose
   ```

### Tests Run But All Fail

**Symptoms:**
- All tests fail with similar errors
- Tests timeout

**Possible Causes:**
- Environment not properly set up
- Mock servers not running
- Database connection issues

**Solutions:**
1. Check environment variables in `.env.test`

2. Verify MongoDB is running:
   ```bash
   mongod --version
   ```

3. Check for port conflicts:
   ```bash
   # On Linux/macOS
   netstat -tuln | grep '3001\|3002\|3003\|3004'
   
   # On Windows
   netstat -ano | findstr "3001 3002 3003 3004"
   ```

4. Increase test timeout:
   ```bash
   npm test -- --testTimeout=60000
   ```

## Environment Setup Issues

### MongoDB Connection Errors

**Symptoms:**
- Tests fail with MongoDB connection errors
- Error messages about "MongoNetworkError" or "failed to connect"

**Possible Causes:**
- MongoDB not running
- Incorrect MongoDB URI
- MongoDB authentication issues

**Solutions:**
1. Start MongoDB:
   ```bash
   # On Linux/macOS
   sudo systemctl start mongodb
   
   # On Windows
   net start MongoDB
   ```

2. Check MongoDB URI in `.env.test`

3. Verify MongoDB connection manually:
   ```bash
   mongo mongodb://localhost:27017/varai_test
   ```

4. If using MongoDB Memory Server, check for compatibility issues:
   ```bash
   npm install mongodb-memory-server@latest
   ```

### TypeScript Compilation Errors

**Symptoms:**
- TypeScript errors during test execution
- "Cannot find module" errors
- Type mismatch errors

**Possible Causes:**
- Missing type definitions
- Incorrect TypeScript configuration
- Incompatible types between modules

**Solutions:**
1. Install missing type definitions:
   ```bash
   npm install --save-dev @types/jest @types/node @types/mongodb
   ```

2. Check TypeScript configuration in `tsconfig.json`

3. Update TypeScript:
   ```bash
   npm install --save-dev typescript@latest
   ```

4. Clear TypeScript cache:
   ```bash
   rm -rf node_modules/.cache/typescript
   ```

## Authentication Issues

### API Authentication Failures

**Symptoms:**
- Tests fail with authentication errors
- "Unauthorized" or "Forbidden" error messages

**Possible Causes:**
- Invalid API credentials
- Expired tokens
- Missing required scopes
- Rate limiting

**Solutions:**
1. Check API credentials in `.env.test`

2. Verify token refresh mechanism is working

3. Check required API scopes

4. Implement exponential backoff for rate limiting:
   ```javascript
   const backoff = (attempt) => Math.pow(2, attempt) * 1000;
   ```

### OAuth Flow Issues

**Symptoms:**
- OAuth flow fails
- Redirect URI errors
- Invalid state parameter errors

**Possible Causes:**
- Incorrect OAuth configuration
- Invalid redirect URI
- CSRF protection issues

**Solutions:**
1. Check OAuth configuration in `.env.test`

2. Verify redirect URI is correctly configured

3. Ensure state parameter is properly validated

4. Check for HTTPS requirements in OAuth flow

## Product Synchronization Issues

### Products Not Syncing

**Symptoms:**
- Product sync tests fail
- Products not appearing in e-commerce platform
- Error messages about product creation

**Possible Causes:**
- Invalid product data
- API permission issues
- Rate limiting
- Product validation failures

**Solutions:**
1. Check product data for required fields

2. Verify API permissions for product creation

3. Implement retry mechanism for failed syncs

4. Check product validation rules on the platform

### Product Data Inconsistencies

**Symptoms:**
- Product data doesn't match between VARAi and e-commerce platform
- Missing product fields
- Incorrect product values

**Possible Causes:**
- Data transformation issues
- Field mapping errors
- Platform-specific limitations

**Solutions:**
1. Check data transformation logic

2. Verify field mappings between VARAi and platform

3. Handle platform-specific limitations gracefully

4. Implement data validation before and after sync

## Order Processing Issues

### Orders Not Processing

**Symptoms:**
- Order processing tests fail
- Orders not being processed
- Error messages about order retrieval

**Possible Causes:**
- API permission issues
- Order status filtering issues
- Rate limiting
- Order validation failures

**Solutions:**
1. Verify API permissions for order retrieval

2. Check order status filtering logic

3. Implement retry mechanism for failed processing

4. Verify order validation rules

### Order Data Inconsistencies

**Symptoms:**
- Order data doesn't match between VARAi and e-commerce platform
- Missing order fields
- Incorrect order values

**Possible Causes:**
- Data transformation issues
- Field mapping errors
- Platform-specific limitations

**Solutions:**
1. Check order data transformation logic

2. Verify field mappings between VARAi and platform

3. Handle platform-specific limitations gracefully

4. Implement order data validation

## Webhook Issues

### Webhooks Not Registering

**Symptoms:**
- Webhook registration tests fail
- Webhooks not appearing in e-commerce platform
- Error messages about webhook creation

**Possible Causes:**
- API permission issues
- Invalid webhook URL
- Webhook limit reached
- HTTPS requirements

**Solutions:**
1. Verify API permissions for webhook creation

2. Check webhook URL format and accessibility

3. Remove unused webhooks before creating new ones

4. Ensure webhook URL uses HTTPS if required

### Webhooks Not Triggering

**Symptoms:**
- Webhook events not being received
- Webhook tests timeout
- No webhook activity in logs

**Possible Causes:**
- Webhook not properly registered
- Event not triggering webhook
- Webhook delivery failures
- Firewall or network issues

**Solutions:**
1. Verify webhook is registered for the correct event

2. Check if event is actually occurring

3. Verify webhook delivery settings

4. Check for firewall or network blocking issues

### Webhook Signature Verification Failures

**Symptoms:**
- Webhook signature verification fails
- Webhooks rejected as invalid
- Security-related error messages

**Possible Causes:**
- Incorrect webhook secret
- Signature calculation issues
- Request body modification
- Timestamp issues

**Solutions:**
1. Verify webhook secret in `.env.test`

2. Check signature calculation algorithm

3. Ensure request body is not modified before verification

4. Check for timestamp validation issues

## Performance Issues

### Slow Test Execution

**Symptoms:**
- Tests take a long time to run
- Tests timeout
- Performance degradation over time

**Possible Causes:**
- Network latency
- Resource constraints
- Inefficient test implementation
- Too many API calls

**Solutions:**
1. Use mock servers instead of real APIs for testing

2. Optimize test implementation

3. Run tests in parallel where possible:
   ```bash
   npm test -- --maxWorkers=4
   ```

4. Reduce the number of API calls in tests

### Memory Leaks

**Symptoms:**
- Increasing memory usage during test runs
- Out of memory errors
- Tests becoming slower over time

**Possible Causes:**
- Unclosed connections
- Accumulating test data
- Event listeners not being removed
- Large response data not being garbage collected

**Solutions:**
1. Ensure all connections are closed after tests

2. Clean up test data after each test

3. Remove event listeners in test teardown

4. Limit response data size or use pagination

## Platform-Specific Issues

### Shopify Issues

**Symptoms:**
- Shopify-specific tests fail
- Shopify API errors
- Rate limiting issues

**Possible Causes:**
- API version incompatibility
- Rate limits exceeded
- GraphQL vs REST API confusion
- Metafield permission issues

**Solutions:**
1. Check Shopify API version compatibility

2. Implement rate limiting handling:
   ```javascript
   // Check for rate limit headers
   const retryAfter = response.headers['retry-after'];
   if (retryAfter) {
     await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
   }
   ```

3. Use the appropriate API (GraphQL or REST) for each operation

4. Verify metafield permissions and namespace/key requirements

### Magento Issues

**Symptoms:**
- Magento-specific tests fail
- Magento API errors
- Authentication issues

**Possible Causes:**
- API version incompatibility
- Integration configuration issues
- Custom attribute configuration
- Complex data structures

**Solutions:**
1. Check Magento API version compatibility

2. Verify integration configuration

3. Ensure custom attributes are properly defined

4. Handle complex data structures correctly

### WooCommerce Issues

**Symptoms:**
- WooCommerce-specific tests fail
- WooCommerce API errors
- Authentication issues

**Possible Causes:**
- API version incompatibility
- REST API authentication issues
- Custom field handling
- WordPress compatibility

**Solutions:**
1. Check WooCommerce API version compatibility

2. Verify REST API authentication method

3. Handle custom fields correctly

4. Check WordPress version compatibility

### BigCommerce Issues

**Symptoms:**
- BigCommerce-specific tests fail
- BigCommerce API errors
- Rate limiting issues

**Possible Causes:**
- API version incompatibility
- Rate limits exceeded
- Store-specific configuration
- V2 vs V3 API confusion

**Solutions:**
1. Check BigCommerce API version compatibility

2. Implement rate limiting handling

3. Verify store-specific configuration

4. Use the appropriate API version (V2 or V3) for each operation

## Debugging Techniques

### Enabling Verbose Logging

To enable verbose logging during test execution:

```bash
# Set environment variable
export DEBUG=varai:*

# Run tests with debug output
npm test
```

### Using Jest Debug Mode

To debug tests using Node.js debugger:

```bash
# Start Jest in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Then connect with Chrome DevTools
# Open chrome://inspect in Chrome
```

### Inspecting Network Traffic

To inspect API requests and responses:

1. Add request/response logging to the adapter:
   ```javascript
   console.log('Request:', {
     method: config.method,
     url: config.url,
     headers: config.headers,
     data: config.data
   });
   
   console.log('Response:', {
     status: response.status,
     headers: response.headers,
     data: response.data
   });
   ```

2. Use a proxy tool like Charles Proxy or Fiddler

### Isolating Test Failures

To isolate test failures:

1. Run a specific test:
   ```bash
   npm test -- -t "should sync product data"
   ```

2. Focus on a specific test file:
   ```bash
   npm test -- platforms/shopify
   ```

3. Use `.only` to focus on specific tests:
   ```javascript
   it.only('should sync product data', async () => {
     // Test code
   });
   ```

## Getting Help

If you continue to experience issues after trying the solutions in this guide:

1. Check the [VARAi Integration Documentation](https://docs.varai.ai/integration)

2. Review platform-specific documentation:
   - [Shopify API Documentation](https://shopify.dev/docs/admin-api)
   - [Magento API Documentation](https://devdocs.magento.com/guides/v2.4/rest/bk-rest.html)
   - [WooCommerce API Documentation](https://woocommerce.github.io/woocommerce-rest-api-docs/)
   - [BigCommerce API Documentation](https://developer.bigcommerce.com/api-docs)

3. Search for known issues in the [GitHub repository](https://github.com/your-organization/eyewear-ml/issues)

4. Contact the integration team at integration-support@varai.ai with:
   - Detailed description of the issue
   - Steps to reproduce
   - Test environment details
   - Error logs and stack traces
   - Screenshots or recordings if applicable