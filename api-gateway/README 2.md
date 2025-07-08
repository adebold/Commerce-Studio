# API Gateway Implementation

This directory contains the implementation of the API Gateway for the VARAi Commerce Studio platform. The API Gateway serves as the central entry point for all client interactions with the platform, providing routing, security, documentation, and monitoring capabilities.

## Overview

The API Gateway implementation uses Kong, a popular open-source API Gateway and Microservices Management Layer. This implementation includes:

- Kong API Gateway configuration
- Kong Manager UI for administration
- PostgreSQL database for Kong configuration
- Mock services for testing

## Prerequisites

- Docker and Docker Compose
- Basic understanding of API Gateway concepts
- Familiarity with Kong configuration

## Directory Structure

```
api-gateway/
├── config/
│   └── kong.yml           # Declarative configuration for Kong
├── mock-service/
│   └── mockserver-config.json  # Mock service configuration
├── docker-compose.yml     # Docker Compose configuration
└── README.md              # This file
```

## Getting Started

### 1. Start the API Gateway

```bash
cd api-gateway
docker-compose up -d
```

This will start the following services:
- Kong API Gateway
- Kong Database (PostgreSQL)
- Kong Manager UI
- Mock Service for testing

### 2. Verify the Installation

Once the services are running, you can verify the installation by accessing the following URLs:

- Kong Admin API: http://localhost:8001
- Kong Manager UI: http://localhost:1337
- Kong Proxy (API Gateway): http://localhost:8000

You can check the status of the Kong API Gateway by running:

```bash
curl http://localhost:8001/status
```

### 3. Test the API Gateway

The API Gateway is configured with several routes that proxy to the mock service. You can test these routes using curl or any API client:

#### Products API

```bash
# Get all products
curl http://localhost:8000/api/v1/products

# Get a specific product
curl http://localhost:8000/api/v1/products/product-1
```

#### Users API

```bash
# Get all users
curl http://localhost:8000/api/v1/users

# Get a specific user
curl http://localhost:8000/api/v1/users/user-1
```

#### Authentication API

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john.doe", "password": "password"}'
```

### 4. Explore Kong Manager

Kong Manager provides a web interface for managing the Kong API Gateway. You can access it at http://localhost:1337.

On first access, you'll need to create an admin user. Follow the on-screen instructions to set up your admin account.

## Configuration

### Kong Configuration

The Kong API Gateway is configured using a declarative configuration file located at `config/kong.yml`. This file defines:

- Services: Backend services that Kong proxies to
- Routes: Rules for matching client requests to services
- Plugins: Additional functionality like authentication, rate limiting, etc.
- Consumers: Entities that consume the API (applications, users, etc.)

To modify the configuration:

1. Edit the `config/kong.yml` file
2. Restart the Kong container or reload the configuration:

```bash
# Restart Kong
docker-compose restart kong

# Or reload the configuration (if Kong is running in DB mode)
curl -X POST http://localhost:8001/config
```

### Mock Service Configuration

The mock service is configured using the `mock-service/mockserver-config.json` file. This file defines the mock endpoints and their responses.

To modify the mock service:

1. Edit the `mock-service/mockserver-config.json` file
2. Restart the mock service container:

```bash
docker-compose restart mock-service
```

## Common Tasks

### Adding a New Service

To add a new service to the API Gateway:

1. Edit the `config/kong.yml` file
2. Add a new service entry:

```yaml
services:
  - name: new-service
    url: http://new-service-host:port
    routes:
      - name: new-service-routes
        paths:
          - /api/v1/new-service
        strip_path: false
        protocols:
          - http
          - https
```

3. Reload the Kong configuration

### Enabling Authentication

To enable authentication for a service:

1. Edit the `config/kong.yml` file
2. Add an authentication plugin to the service:

```yaml
services:
  - name: secure-service
    # ... other service configuration ...
    plugins:
      - name: key-auth
        config:
          key_names:
            - apikey
```

3. Create a consumer and credentials:

```yaml
consumers:
  - username: api-client
    keyauth_credentials:
      - key: your-api-key
```

4. Reload the Kong configuration

### Monitoring and Logging

Kong provides several plugins for monitoring and logging:

- **Prometheus**: Exposes metrics for Prometheus to scrape
- **HTTP Log**: Sends request/response logs to an HTTP endpoint
- **File Log**: Logs to a file
- **StatsD**: Sends metrics to a StatsD server

To enable Prometheus metrics:

1. Edit the `config/kong.yml` file
2. Add the Prometheus plugin:

```yaml
plugins:
  - name: prometheus
    config:
      status_codes: true
      latency: true
      bandwidth: true
      upstream_health: true
```

3. Reload the Kong configuration

## Troubleshooting

### Common Issues

#### Kong Won't Start

If Kong fails to start, check the logs:

```bash
docker-compose logs kong
```

Common issues include:
- Database connection problems
- Invalid configuration
- Port conflicts

#### Routes Not Working

If routes aren't working as expected:

1. Check the Kong logs
2. Verify the route configuration in `config/kong.yml`
3. Test the backend service directly to ensure it's working
4. Check for any plugins that might be blocking requests

#### Performance Issues

If you're experiencing performance issues:

1. Check the Kong logs for any errors or warnings
2. Monitor Kong's resource usage (CPU, memory)
3. Consider scaling Kong horizontally by adding more instances
4. Review plugin configuration, as some plugins can impact performance

### Getting Help

If you need help with Kong:

- Kong Documentation: https://docs.konghq.com/
- Kong Forum: https://discuss.konghq.com/
- Kong GitHub Issues: https://github.com/Kong/kong/issues

## Next Steps

After setting up the basic API Gateway, consider implementing:

1. **Authentication and Authorization**: Implement OAuth 2.0 or JWT authentication
2. **Rate Limiting**: Protect your APIs from abuse
3. **API Documentation**: Set up Swagger/OpenAPI documentation
4. **Monitoring and Alerting**: Configure comprehensive monitoring
5. **CI/CD Pipeline**: Automate deployment of Kong configuration

## References

- [Kong Documentation](https://docs.konghq.com/)
- [Kong Plugins](https://docs.konghq.com/hub/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MockServer Documentation](https://www.mock-server.com/)