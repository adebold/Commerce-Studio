# VARAi E-commerce Integration Test Environment Setup

This document provides instructions for setting up the test environment for VARAi e-commerce integration testing.

## Prerequisites

Before setting up the test environment, ensure you have the following installed:

- Node.js (v16 or later)
- npm (v8 or later)
- Docker (for running containerized tests)
- MongoDB (for local development)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-organization/eyewear-ml.git
cd eyewear-ml
```

2. Install the main project dependencies:

```bash
npm install
```

3. Install the integration test dependencies:

```bash
cd tests/integration/e-commerce
npm install
```

## Environment Configuration

### Setting Up Environment Variables

Create a `.env.test` file in the `tests/integration/e-commerce` directory with the following variables:

```
# API Configuration
API_BASE_URL=http://localhost:3000
API_KEY=test_api_key

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/varai_test

# Shopify Configuration
SHOPIFY_API_KEY=test_shopify_api_key
SHOPIFY_API_SECRET=test_shopify_api_secret
SHOPIFY_STORE_URL=test-store.myshopify.com
SHOPIFY_WEBHOOK_SECRET=test_shopify_webhook_secret

# Magento Configuration
MAGENTO_API_KEY=test_magento_api_key
MAGENTO_API_SECRET=test_magento_api_secret
MAGENTO_STORE_URL=test-store.magento.com
MAGENTO_WEBHOOK_SECRET=test_magento_webhook_secret

# WooCommerce Configuration
WOOCOMMERCE_API_KEY=test_woocommerce_api_key
WOOCOMMERCE_API_SECRET=test_woocommerce_api_secret
WOOCOMMERCE_STORE_URL=test-store.woocommerce.com
WOOCOMMERCE_WEBHOOK_SECRET=test_woocommerce_webhook_secret

# BigCommerce Configuration
BIGCOMMERCE_API_KEY=test_bigcommerce_api_key
BIGCOMMERCE_API_SECRET=test_bigcommerce_api_secret
BIGCOMMERCE_STORE_URL=test-store.mybigcommerce.com
BIGCOMMERCE_WEBHOOK_SECRET=test_bigcommerce_webhook_secret

# Test Configuration
TEST_TIMEOUT=30000
SUPPRESS_CONSOLE=true
```

### Setting Up Mock Servers

The integration tests use mock servers to simulate e-commerce platform APIs. These are automatically configured when running the tests, but you can also run them separately:

```bash
npm run start:mock-servers
```

This will start mock servers for all supported e-commerce platforms on the following ports:

- Shopify: http://localhost:3001
- Magento: http://localhost:3002
- WooCommerce: http://localhost:3003
- BigCommerce: http://localhost:3004

### Setting Up Sandbox Environments

For more comprehensive testing, you can connect to sandbox environments for each e-commerce platform. Follow these steps to set up sandbox environments:

#### Shopify Sandbox

1. Create a Shopify Partner account at https://partners.shopify.com/
2. Create a development store
3. Create a custom app in the development store
4. Configure the app with the required scopes:
   - `read_products`, `write_products`
   - `read_orders`, `write_orders`
   - `read_customers`, `write_customers`
5. Generate API credentials
6. Update your `.env.test` file with the sandbox credentials

#### Magento Sandbox

1. Set up a local Magento instance using Docker:

```bash
docker run -p 8080:80 -p 8443:443 --name magento-sandbox bitnami/magento:latest
```

2. Create an integration in the Magento admin panel
3. Configure the integration with the required scopes
4. Generate API credentials
5. Update your `.env.test` file with the sandbox credentials

#### WooCommerce Sandbox

1. Set up a local WordPress instance with WooCommerce using Docker:

```bash
docker run -p 8081:80 --name woocommerce-sandbox woocommerce/woocommerce-playground
```

2. Create API keys in the WooCommerce settings
3. Update your `.env.test` file with the sandbox credentials

#### BigCommerce Sandbox

1. Create a BigCommerce developer account at https://developer.bigcommerce.com/
2. Create a sandbox store
3. Create an API account in the sandbox store
4. Generate API credentials
5. Update your `.env.test` file with the sandbox credentials

## Running Tests with Different Environments

### Using Mock Servers (Default)

By default, the tests use mock servers to simulate e-commerce platform APIs. To run tests with mock servers:

```bash
npm test
```

### Using Sandbox Environments

To run tests against sandbox environments:

```bash
npm run test:sandbox
```

### Using CI Environment

The CI environment is configured to run tests with mock servers. The configuration is defined in `.github/workflows/integration-tests.yml`.

## Docker Setup

You can also run the entire test environment in Docker:

1. Build the Docker image:

```bash
docker build -t varai-integration-tests -f Dockerfile.test .
```

2. Run the tests in Docker:

```bash
docker run --rm varai-integration-tests
```

## Troubleshooting

### Common Issues

#### MongoDB Connection Errors

If you encounter MongoDB connection errors:

1. Ensure MongoDB is running:

```bash
mongod --version
```

2. Check if the MongoDB service is running:

```bash
# On Linux/macOS
systemctl status mongodb

# On Windows
sc query MongoDB
```

3. Try connecting to MongoDB manually:

```bash
mongo mongodb://localhost:27017/varai_test
```

#### Mock Server Issues

If you encounter issues with mock servers:

1. Check if the ports are already in use:

```bash
# On Linux/macOS
netstat -tuln | grep '3001\|3002\|3003\|3004'

# On Windows
netstat -ano | findstr "3001 3002 3003 3004"
```

2. Restart the mock servers:

```bash
npm run restart:mock-servers
```

#### Authentication Issues

If you encounter authentication issues with sandbox environments:

1. Verify that your API credentials are correct
2. Check if the API keys have the required scopes
3. Ensure that the sandbox environments are accessible

### Getting Help

If you continue to experience issues, please:

1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review the [FAQs](./faq.md)
3. Contact the integration team at integration-support@varai.ai