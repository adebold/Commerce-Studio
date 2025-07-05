# Integration Testing Troubleshooting Guide

This guide provides solutions for common issues encountered during integration testing of the VARAi platform.

## Table of Contents

1. [Test Environment Issues](#test-environment-issues)
2. [Authentication Test Issues](#authentication-test-issues)
3. [API Test Issues](#api-test-issues)
4. [UI Test Issues](#ui-test-issues)
5. [Database Test Issues](#database-test-issues)
6. [Performance Test Issues](#performance-test-issues)
7. [E-commerce Integration Test Issues](#e-commerce-integration-test-issues)
8. [Debugging Techniques](#debugging-techniques)
9. [Getting Help](#getting-help)

## Test Environment Issues

### Docker Container Startup Failures

**Symptoms:**
- Docker containers fail to start
- `npm run test:env:up` command fails

**Possible Causes:**
- Docker daemon not running
- Port conflicts
- Insufficient permissions
- Corrupted Docker images

**Solutions:**
1. Ensure Docker daemon is running: `docker info`
2. Check for port conflicts: `netstat -tuln`
3. Run Docker commands with appropriate permissions
4. Rebuild Docker images: `docker-compose -f docker-compose.test.yml build --no-cache`

### Network Connectivity Issues

**Symptoms:**
- Services cannot communicate with each other
- "Connection refused" errors

**Possible Causes:**
- Docker network configuration issues
- Firewall blocking connections
- Incorrect service hostnames

**Solutions:**
1. Check Docker network configuration: `docker network ls`
2. Verify firewall settings
3. Ensure service hostnames are correct in configuration
4. Test connectivity between containers: `docker exec -it [container] ping [service]`

### Environment Variable Configuration Issues

**Symptoms:**
- Services fail to start with configuration errors
- Tests fail with "missing configuration" errors

**Possible Causes:**
- Missing environment variables
- Incorrect environment variable values
- Environment file not loaded

**Solutions:**
1. Verify `.env.test` file exists and contains all required variables
2. Check environment variable values for correctness
3. Ensure environment file is loaded: `docker-compose -f docker-compose.test.yml --env-file .env.test up`
4. Print environment variables for debugging: `docker exec -it [container] env`

## Authentication Test Issues

### Token Generation Failures

**Symptoms:**
- Authentication tests fail with "invalid token" errors
- JWT verification errors

**Possible Causes:**
- Incorrect JWT secret
- Token expiration issues
- Clock skew between services

**Solutions:**
1. Verify JWT secret is consistent across services
2. Check token expiration settings
3. Ensure system clocks are synchronized
4. Inspect token contents: `jwt-decode [token]`

### Login Flow Failures

**Symptoms:**
- Login tests fail
- "Invalid credentials" errors even with correct credentials

**Possible Causes:**
- Authentication service not running
- Database connection issues
- Incorrect test user credentials
- Password hashing issues

**Solutions:**
1. Verify authentication service is running
2. Check database connection
3. Verify test user credentials in test data
4. Inspect authentication service logs
5. Test authentication API directly: `curl -X POST [auth_url]/login -d '{"email":"test@example.com","password":"password"}'`

### Role-Based Access Control Issues

**Symptoms:**
- RBAC tests fail
- Unexpected access denied errors
- Users have incorrect permissions

**Possible Causes:**
- Role definitions not loaded correctly
- Permission assignments incorrect
- Role checking logic issues

**Solutions:**
1. Verify role definitions in test data
2. Check user-role assignments
3. Inspect RBAC service logs
4. Test RBAC API directly

## API Test Issues

### API Endpoint Not Found

**Symptoms:**
- 404 errors in API tests
- "Endpoint not found" errors

**Possible Causes:**
- API service not running
- Incorrect API URL
- Route not defined correctly

**Solutions:**
1. Verify API service is running
2. Check API URL configuration
3. Inspect API service logs
4. Test API endpoint directly: `curl [api_url]/endpoint`

### API Response Validation Failures

**Symptoms:**
- Tests fail with schema validation errors
- Unexpected API response format

**Possible Causes:**
- API response schema changed
- Test expectations out of sync with API
- Data transformation issues

**Solutions:**
1. Update test expectations to match current API schema
2. Verify API response format: `curl [api_url]/endpoint | jq`
3. Check for API changes in recent commits

### API Rate Limiting Issues

**Symptoms:**
- Tests fail with 429 errors
- "Too many requests" errors

**Possible Causes:**
- Rate limiting too restrictive in test environment
- Tests sending too many requests

**Solutions:**
1. Adjust rate limiting settings for test environment
2. Add delays between API requests in tests
3. Batch API requests where possible

## UI Test Issues

### Element Not Found

**Symptoms:**
- Playwright tests fail with "element not found" errors
- Timeout waiting for element

**Possible Causes:**
- Element selectors out of date
- Page structure changed
- Element rendering delayed
- Element in different viewport

**Solutions:**
1. Update element selectors
2. Increase wait timeout: `await page.waitForSelector(selector, { timeout: 10000 })`
3. Check if element is in viewport: `await element.isIntersectingViewport()`
4. Take screenshot to debug: `await page.screenshot({ path: 'debug.png' })`

### Browser Automation Issues

**Symptoms:**
- Playwright tests fail with browser-related errors
- Browser crashes during tests

**Possible Causes:**
- Browser version incompatibility
- Insufficient resources
- Browser launch configuration issues

**Solutions:**
1. Update Playwright: `npm update @playwright/test`
2. Install browser dependencies: `npx playwright install-deps`
3. Adjust browser launch options
4. Run with headed browser for debugging: `npm run test:integration -- --headed`

### Visual Regression Issues

**Symptoms:**
- Visual comparison tests fail
- Screenshots don't match expected images

**Possible Causes:**
- UI changes
- Rendering differences between environments
- Font or styling inconsistencies

**Solutions:**
1. Update baseline screenshots if changes are expected
2. Adjust comparison threshold
3. Use more specific element screenshots instead of full page
4. Check for environment-specific styling issues

## Database Test Issues

### Database Connection Failures

**Symptoms:**
- Tests fail with database connection errors
- "Cannot connect to MongoDB" errors

**Possible Causes:**
- MongoDB not running
- Incorrect connection string
- Authentication issues
- Network connectivity problems

**Solutions:**
1. Verify MongoDB is running: `docker ps | grep mongo`
2. Check MongoDB connection string
3. Verify MongoDB credentials
4. Test connection directly: `mongosh [connection_string]`

### Data Setup Issues

**Symptoms:**
- Tests fail due to missing or incorrect test data
- "Document not found" errors

**Possible Causes:**
- Test data not loaded
- Data setup scripts failed
- Data cleared unexpectedly

**Solutions:**
1. Verify test data setup scripts ran successfully
2. Check database for expected test data
3. Ensure tests are not interfering with each other's data
4. Add explicit data setup in test beforeEach hooks

### Schema Validation Issues

**Symptoms:**
- Tests fail with schema validation errors
- "Document failed validation" errors

**Possible Causes:**
- Schema changes not reflected in test data
- Invalid test data
- Schema validation rules too strict

**Solutions:**
1. Update test data to match current schema
2. Verify schema validation rules
3. Check for schema changes in recent commits

## Performance Test Issues

### Timeout Errors

**Symptoms:**
- Performance tests fail with timeout errors
- Tests take longer than expected

**Possible Causes:**
- System under test is overloaded
- Resource constraints in test environment
- Inefficient test implementation
- Unrealistic performance expectations

**Solutions:**
1. Increase test timeouts
2. Reduce load in performance tests
3. Allocate more resources to test environment
4. Optimize test implementation
5. Adjust performance expectations based on environment

### Inconsistent Results

**Symptoms:**
- Performance test results vary significantly between runs
- Benchmarks sometimes pass, sometimes fail

**Possible Causes:**
- External factors affecting performance
- Resource contention
- Insufficient warm-up
- Test environment instability

**Solutions:**
1. Add warm-up phase to performance tests
2. Run tests multiple times and average results
3. Isolate performance tests from other processes
4. Monitor system resources during tests
5. Implement more stable benchmarking techniques

### Memory Leaks

**Symptoms:**
- Increasing memory usage during tests
- Out of memory errors
- Performance degradation over time

**Possible Causes:**
- Memory leaks in application code
- Resource cleanup issues in tests
- Accumulated test data

**Solutions:**
1. Monitor memory usage during tests
2. Ensure proper cleanup in test teardown
3. Implement garbage collection hints
4. Check for memory leaks in application code
5. Restart services between test runs

## E-commerce Integration Test Issues

### Platform API Connectivity Issues

**Symptoms:**
- E-commerce integration tests fail with connectivity errors
- "Cannot connect to platform API" errors

**Possible Causes:**
- Mock platform API not running
- Incorrect API credentials
- Network connectivity issues

**Solutions:**
1. Verify mock platform API is running
2. Check API credentials in test configuration
3. Test API connectivity directly
4. Inspect API request/response logs

### Webhook Handling Issues

**Symptoms:**
- Webhook tests fail
- Events not processed correctly

**Possible Causes:**
- Webhook handler not running
- Incorrect webhook URL
- Webhook payload format issues
- Webhook verification failures

**Solutions:**
1. Verify webhook handler is running
2. Check webhook URL configuration
3. Validate webhook payload format
4. Ensure webhook verification is properly configured
5. Test webhooks directly: `curl -X POST [webhook_url] -d @webhook_payload.json -H "Content-Type: application/json"`

### Product Sync Issues

**Symptoms:**
- Product sync tests fail
- Products not synced correctly

**Possible Causes:**
- Product sync service not running
- API rate limiting
- Data transformation issues
- Validation failures

**Solutions:**
1. Verify product sync service is running
2. Check for API rate limiting
3. Inspect product sync logs
4. Validate product data format
5. Test product sync API directly

## Debugging Techniques

### Logging

Enable detailed logging to diagnose issues:

```javascript
// In test setup
process.env.LOG_LEVEL = 'debug';
```

```python
# In test setup
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Network Monitoring

Monitor network traffic to diagnose API issues:

```bash
# Capture HTTP traffic
npx playwright open --enable-network-logging
```

### Database Inspection

Inspect database state during tests:

```javascript
// In test
const dbState = await mongoose.connection.db.collection('users').find().toArray();
console.log(JSON.stringify(dbState, null, 2));
```

### Interactive Debugging

Use interactive debugging for complex issues:

```bash
# Run tests in debug mode
npm run test:integration -- --debug
```

## Getting Help

If you're still experiencing issues after trying the solutions in this guide:

1. **Check existing issues** in the project issue tracker
2. **Search the documentation** for similar problems
3. **Ask the team** in the #testing Slack channel
4. **Create a new issue** with detailed reproduction steps
5. **Pair with another developer** to debug together