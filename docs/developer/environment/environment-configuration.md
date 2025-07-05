# Environment Configuration Guide

This guide provides comprehensive documentation on configuring development, testing, and production environments for the VARAi platform, with special attention to complex integrations like Vertex AI.

## Contents

1. [Environment Variables](#environment-variables)
2. [Configuration Files](#configuration-files)
3. [Tenant Configuration](#tenant-configuration)
4. [Service-Specific Configuration](#service-specific-configuration)
5. [Google Cloud Platform Configuration](#google-cloud-platform-configuration)
6. [Cloud Run Deployment Configuration](#cloud-run-deployment-configuration)
7. [Environment-Specific Settings](#environment-specific-settings)
8. [Troubleshooting Configuration Issues](#troubleshooting-configuration-issues)

## Environment Variables

The VARAi platform uses environment variables for configuration across different environments. These variables can be set in a `.env` file or directly in the environment.

### Core Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development, production, test) | `development` | Yes |
| `PORT` | Port for the HTTP server | `3000` | No |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` | No |
| `DATABASE_URL` | Database connection string | - | Yes |
| `REDIS_URL` | Redis connection string | - | No |
| `API_KEY` | API key for external services | - | No |
| `JWT_SECRET` | Secret for JWT token generation | - | Yes |

### Setting Up Environment Variables

#### Local Development

For local development, create a `.env` file in the root directory of each service:

```bash
# Example .env file for local development
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
DATABASE_URL=postgresql://username:password@localhost:5432/varai
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

#### Production Environment

For production environments, set environment variables through your deployment platform (Kubernetes, Docker, etc.):

```bash
# Example Kubernetes ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: varai-config
data:
  NODE_ENV: "production"
  PORT: "3000"
  LOG_LEVEL: "info"
```

Sensitive information should be stored in secrets:

```bash
# Example Kubernetes Secret
apiVersion: v1
kind: Secret
metadata:
  name: varai-secrets
type: Opaque
data:
  DATABASE_URL: <base64-encoded-value>
  JWT_SECRET: <base64-encoded-value>
```

## Configuration Files

In addition to environment variables, the VARAi platform uses configuration files for more complex settings.

### Configuration File Locations

- **Global Configuration**: `config/default.json`, `config/development.json`, `config/production.json`
- **Service Configuration**: `src/[service-name]/config/default.json`
- **Tenant Configuration**: `config/tenants/[tenant-id].json`

### Configuration File Format

Configuration files use JSON format:

```json
{
  "server": {
    "port": 3000,
    "host": "localhost"
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "password",
    "database": "varai"
  },
  "logging": {
    "level": "info",
    "format": "json"
  }
}
```

### Loading Configuration

The platform uses a hierarchical configuration system that merges settings from multiple sources in the following order (later sources override earlier ones):

1. Default configuration files
2. Environment-specific configuration files
3. Tenant-specific configuration files
4. Environment variables
5. Command-line arguments

## Tenant Configuration

The VARAi platform supports multi-tenant configuration through JSON files in the `config/tenants` directory.

### Tenant Configuration Structure

```json
{
  "tenantId": "default",
  "displayName": "Default Tenant",
  "branding": {
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d",
    "logo": "https://example.com/logo.png"
  },
  "features": {
    "featureA": true,
    "featureB": false
  },
  "integrations": {
    "vertexAI": {
      "enabled": true,
      "projectId": "your-gcp-project-id",
      "location": "us-central1"
    }
  }
}
```

### Adding a New Tenant

To add a new tenant:

1. Create a new JSON file in `config/tenants/[tenant-id].json`
2. Configure the tenant settings
3. Restart the application or trigger a configuration reload

## Service-Specific Configuration

Each service in the VARAi platform may have its own configuration requirements.

### API Service

```json
{
  "api": {
    "cors": {
      "origin": "*",
      "methods": ["GET", "POST", "PUT", "DELETE"],
      "allowedHeaders": ["Content-Type", "Authorization"]
    },
    "rateLimit": {
      "windowMs": 60000,
      "max": 100
    }
  }
}
```

### Frontend Service

```json
{
  "frontend": {
    "apiUrl": "http://localhost:3000/api",
    "analytics": {
      "enabled": true,
      "trackingId": "UA-XXXXXXXXX-X"
    }
  }
}
```

## Google Cloud Platform Configuration

The VARAi platform integrates with several Google Cloud Platform services, including Vertex AI and Cloud Run. Proper configuration is essential for these integrations to work correctly.

### Vertex AI Integration

The Vertex AI integration requires specific configuration for authentication and API access.

#### Required Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to the Google Cloud service account key file | - | Yes |
| `GOOGLE_CLOUD_PROJECT` | Google Cloud project ID | - | Yes |
| `VERTEX_AI_LOCATION` | Google Cloud region for Vertex AI | `us-central1` | Yes |
| `VERTEX_AI_MODEL_ID` | Vertex AI model ID | `shopping-assistant` | Yes |
| `VERTEX_AI_PUBLISHER` | Vertex AI model publisher | `google` | Yes |

#### Authentication Setup

1. Create a service account in the Google Cloud Console
2. Grant the service account the necessary permissions (Vertex AI User role)
3. Download the service account key file (JSON)
4. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of the key file

```bash
# Example
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
export GOOGLE_CLOUD_PROJECT=your-gcp-project-id
```

#### TypeScript Configuration for ESM Modules

When working with the Vertex AI integration in TypeScript with ESM modules, ensure your `tsconfig.json` is correctly configured:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "target": "ES2020",
    "outDir": "dist",
    "strict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

This configuration is essential to prevent issues with TypeScript module resolution, particularly the "Unknown file extension '.ts'" error that can occur when using ESM modules.

## Cloud Run Deployment Configuration

The VARAi platform uses Google Cloud Run for deploying certain services, providing scalable, serverless container execution. This section details the configuration for the `ml-datadriven-recos` service deployed on Cloud Run.

### Regional Deployment

The `ml-datadriven-recos` service is deployed to Cloud Run in multiple regions to ensure low latency and compliance with data residency requirements:

| Region | Location | Purpose | Direct URL |
|--------|----------|---------|------------|
| US | `us-central1` | North American users | `https://ml-datadriven-recos-us-ddtojwjn7a-uc.a.run.app` |
| EU | `europe-west1` | European users | `https://ml-datadriven-recos-eu-ddtojwjn7a-ew.a.run.app` |

### Terraform Configuration

The deployment uses a simplified Terraform module located at `terraform/modules/simplified_cloud_run`. This module streamlines the Cloud Run deployment process while maintaining configuration flexibility.

```hcl
# Example usage of the simplified_cloud_run module
module "ml_datadriven_recos_us" {
  source = "../../modules/simplified_cloud_run"
  
  service_name = "ml-datadriven-recos-us"
  region       = "us-central1"
  image        = "gcr.io/eyewear-ml/ml-datadriven-recos:latest"
  
  environment_variables = {
    REGION = "us-central1"
  }
}
```

### Domain Mapping

Custom domain mappings have been attempted for the service:

| Region | Custom Domain | Status |
|--------|---------------|--------|
| US | `us.vareye.ai` | Pending DNS configuration |
| EU | `eu.vareye.ai` | Pending DNS configuration |

**Note**: Until DNS configuration is completed by the user, please use the direct Cloud Run URLs for accessing the services.

### Accessing Deployed Services

To access the deployed services, use the direct Cloud Run URLs:

```bash
# Example: Testing the US deployment
curl https://ml-datadriven-recos-us-ddtojwjn7a-uc.a.run.app/health

# Example: Testing the EU deployment
curl https://ml-datadriven-recos-eu-ddtojwjn7a-ew.a.run.app/health
```

### Monitoring Cloud Run Services

Monitoring is essential for ensuring the reliability and performance of Cloud Run services. Key metrics to monitor include:

1. **Availability**: Service uptime and successful request rate
2. **Latency**: Request processing time
3. **Error Rates**: Rate of 4xx and 5xx responses
4. **Resource Utilization**: CPU and memory usage
5. **Concurrency**: Number of concurrent requests

Google Cloud provides built-in monitoring through Cloud Monitoring. You can also set up custom dashboards and alerts for these metrics.

### Compliance Testing

The `ml-datadriven-recos` service must comply with regulatory requirements, particularly for data residency. To verify compliance, run the compliance tests:

```bash
# Run compliance tests for both regions
cd tests/compliance
python test_cloud_run_compliance.py

# Run tests for a specific region
python test_cloud_run_compliance.py --regions eu
```

The compliance tests verify:
- Regional availability (the `Eu Region Availability` test should pass)
- Data residency compliance
- Security headers and configurations
- Privacy and consent mechanisms

For more details on compliance tests, refer to the [Compliance Tests README](../../../tests/compliance/README.md).

## Environment-Specific Settings

The VARAi platform supports different settings for development, testing, and production environments.

### Development Environment

```json
{
  "server": {
    "port": 3000,
    "host": "localhost"
  },
  "logging": {
    "level": "debug",
    "format": "pretty"
  },
  "features": {
    "mockExternalServices": true
  }
}
```

### Testing Environment

```json
{
  "server": {
    "port": 3001,
    "host": "localhost"
  },
  "database": {
    "database": "varai_test"
  },
  "logging": {
    "level": "error",
    "format": "json"
  },
  "features": {
    "mockExternalServices": true
  }
}
```

### Production Environment

```json
{
  "server": {
    "port": 80,
    "host": "0.0.0.0"
  },
  "logging": {
    "level": "info",
    "format": "json"
  },
  "features": {
    "mockExternalServices": false
  }
}
```

## Troubleshooting Configuration Issues

### Common Configuration Problems

#### Missing Environment Variables

**Symptom**: Application fails to start with an error about missing environment variables.

**Solution**:
1. Check that all required environment variables are set
2. Verify the `.env` file exists and is in the correct location
3. Ensure environment variables are correctly set in your deployment platform

#### Authentication Failures with Google Cloud

**Symptom**: Application fails to connect to Google Cloud services with authentication errors.

**Solution**:
1. Verify the `GOOGLE_APPLICATION_CREDENTIALS` path is correct
2. Check that the service account has the necessary permissions
3. Ensure the `GOOGLE_CLOUD_PROJECT` matches the project ID in the credentials file
4. Confirm that billing is enabled for the GCP project

#### TypeScript Module Resolution Issues

**Symptom**: Application fails with "Unknown file extension '.ts'" error when using ESM modules.

**Solution**:
1. Ensure `tsconfig.json` is correctly configured for ESM modules
2. Set `"type": "module"` in `package.json`
3. Use `.js` extension in import statements (even for TypeScript files)
4. When running with `ts-node`, use the `--esm` flag

#### Configuration Not Loading

**Symptom**: Application uses default values instead of configured values.

**Solution**:
1. Check the configuration file paths and format
2. Verify the environment name is correctly set (`NODE_ENV`)
3. Check for typos in configuration keys
4. Ensure the configuration files are in the correct format (JSON)

### Debugging Configuration

To debug configuration issues:

1. Set `LOG_LEVEL=debug` to see detailed logging
2. Add temporary logging statements to print the loaded configuration
3. Use the configuration validation utilities to check configuration format
4. Check for environment variable name typos

```typescript
// Example of debugging configuration
import { config } from './config';
console.log('Loaded configuration:', JSON.stringify(config, null, 2));
```

## Best Practices

### Security

- Never commit sensitive information (API keys, passwords, etc.) to version control
- Use environment variables for sensitive information
- Rotate credentials regularly
- Use the principle of least privilege for service accounts

### Maintainability

- Document all configuration options
- Use descriptive names for configuration keys
- Group related configuration options
- Provide sensible defaults when possible
- Validate configuration at startup

### Deployment

- Use different configuration files for different environments
- Automate configuration deployment
- Version configuration files
- Test configuration changes before deployment
- Use secrets management for sensitive information

## Additional Resources

- [Google Cloud Authentication Documentation](https://cloud.google.com/docs/authentication)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [TypeScript ESM Documentation](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [Docker Environment Variables Documentation](https://docs.docker.com/compose/environment-variables/)
- [Kubernetes ConfigMaps and Secrets](https://kubernetes.io/docs/concepts/configuration/configmap/)