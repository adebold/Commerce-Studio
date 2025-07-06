# Deployment Scripts

This document provides information about the deployment scripts used to deploy the application to different environments.

## Overview

The deployment scripts are used to automate the deployment process to different environments (development, staging, production). They handle the following tasks:

- Applying Kubernetes manifests
- Waiting for deployments to be ready
- Running health checks and smoke tests
- Creating deployment records

## Available Scripts

### `deploy_to_staging.py`

This script deploys the application to the staging environment.

#### Usage

```bash
python deploy_to_staging.py
```

#### Features

- Simulates deployment to staging environment
- Applies Kubernetes manifests
- Runs health checks and smoke tests
- Creates deployment records

#### Requirements

- Python 3.8+
- kubectl (for real deployments)
- Access to the staging Kubernetes cluster (for real deployments)

#### Configuration

The script uses the following configuration:

- Kubernetes namespace: `varai-staging`
- Kubernetes manifests: `kubernetes/overlays/staging`
- Health check endpoint: `http://localhost:8000/health`
- Smoke tests: `tests.e2e.smoke_tests`

## Deployment Process

The deployment process follows these steps:

1. **Preparation**: Verify kubectl version and Kubernetes context
2. **Deployment**: Apply Kubernetes manifests for the target environment
3. **Verification**: Wait for deployment to be ready
4. **Health Check**: Verify API health endpoint
5. **Smoke Test**: Run automated smoke tests
6. **Documentation**: Create deployment record

## Deployment Records

Deployment records are stored in the `data/deployment` directory. Each record is a JSON file with the following format:

```json
{
  "id": "deployment-staging-20250515_143609",
  "environment": "staging",
  "timestamp": "2025-05-15T14:36:14.839476",
  "status": "completed",
  "components": [
    "api",
    "frontend"
  ],
  "verification_results": {
    "health_check": true,
    "smoke_test": true
  },
  "details": {
    "deployed_by": "alex",
    "deployment_type": "rolling",
    "start_time": "2025-05-15T14:34:14.839484",
    "end_time": "2025-05-15T14:36:14.839489"
  }
}
```

## Troubleshooting

### Common Issues

#### Kubernetes Context Not Found

If you see an error like "Failed to get Kubernetes context", make sure you have:

1. Installed kubectl
2. Configured kubectl to access the target cluster
3. Set the correct context using `kubectl config use-context <context-name>`

#### Deployment Failed

If the deployment fails, check the following:

1. Kubernetes manifests for errors
2. Kubernetes events using `kubectl get events -n <namespace>`
3. Pod logs using `kubectl logs <pod-name> -n <namespace>`

#### Health Check Failed

If the health check fails, check the following:

1. API service is running
2. Health check endpoint is accessible
3. API service logs for errors

## Future Improvements

1. Add support for canary deployments
2. Implement rollback functionality
3. Add support for blue-green deployments
4. Integrate with monitoring systems
5. Add notification system for deployment status