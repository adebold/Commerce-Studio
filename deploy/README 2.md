# Deployment Management

This directory contains the consolidated deployment infrastructure for the EyewearML platform.

## Directory Structure

```
deploy/
├── README.md                 # This file
├── Makefile                 # Main deployment entry point
├── config/                  # Environment configurations
│   ├── dev.yaml
│   ├── staging.yaml
│   └── prod.yaml
├── docker/                  # Docker build configurations
│   ├── build.sh
│   └── push.sh
├── scripts/                 # Deployment scripts
│   ├── deploy.sh
│   ├── rollback.sh
│   └── health-check.sh
├── blue-green/              # Blue-green deployment
│   ├── deploy.sh
│   ├── switch.sh
│   └── rollback.sh
└── monitoring/              # Deployment monitoring
    ├── check-health.sh
    └── notify.sh
```

## Quick Start

### Deploy to Staging
```bash
make deploy ENV=staging
```

### Deploy to Production (Blue-Green)
```bash
make deploy-blue-green ENV=prod
```

### Rollback
```bash
make rollback ENV=prod
```

## Environment Variables

Required environment variables:
- `GCP_PROJECT_ID`: Google Cloud Project ID
- `GCP_REGION`: Deployment region
- `DOCKER_REGISTRY`: Docker registry URL
- `SECRET_MANAGER_PROJECT`: Google Secret Manager project

## Services

The following services are managed by this deployment system:
- `auth-service`: Authentication service
- `frontend`: React frontend application
- `api-gateway`: API gateway service
- `ml-service`: Machine learning service

## Blue-Green Deployment

Blue-green deployments are supported for production environments:
1. Deploy to the inactive environment (blue or green)
2. Run health checks and validation
3. Switch traffic to the new environment
4. Keep the old environment as backup for quick rollback

## Monitoring

Deployment monitoring includes:
- Health checks for all services
- Performance metrics collection
- Automated rollback triggers
- Slack/email notifications