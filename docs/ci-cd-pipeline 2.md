# CI/CD Pipeline Documentation

This document provides information about the CI/CD pipeline used to automate the deployment process for the eyewear-ml application.

## Overview

The CI/CD pipeline is implemented using GitHub Actions and automates the following tasks:

- Code validation (linting and unit tests)
- Building and pushing Docker images
- Deploying to different environments (development, staging, production)
- Running verification tests (smoke tests, integration tests)
- Notifying stakeholders about deployment status

## Pipeline Workflow

The pipeline follows a progressive deployment approach, where code changes flow through multiple environments:

1. **Development**: Initial deployment for testing new features
2. **Staging**: Pre-production environment for final validation
3. **Production**: Live environment for end users

### Workflow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Validate  │────▶│    Build    │────▶│  Deploy to  │────▶│  Deploy to  │
│   & Test    │     │  & Push     │     │ Development │     │   Staging   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │  Deploy to  │
                                                            │ Production  │
                                                            └─────────────┘
```

## Deployment Strategies

The pipeline supports multiple deployment strategies:

### Rolling Update (Default)

A rolling update gradually replaces instances of the previous version with instances of the new version. This strategy ensures zero downtime during deployments.

### Canary Deployment

Canary deployments involve deploying a new version to a small subset of users before rolling it out to the entire user base. This allows for testing the new version with real users while minimizing risk.

To perform a canary deployment:

1. Trigger the workflow manually
2. Select "canary" as the deployment type
3. Specify the component to deploy (e.g., "api")
4. Set the percentage of traffic to route to the canary (e.g., 10%)

### Blue-Green Deployment

Blue-green deployments involve maintaining two identical production environments, with only one serving production traffic at a time. This allows for quick rollbacks if issues are detected.

## Environments

### Development

- Purpose: Testing new features and changes
- Trigger: Push to `staging` branch or manual workflow dispatch
- Verification: Smoke tests

### Staging

- Purpose: Pre-production validation
- Trigger: Push to `main` branch or manual workflow dispatch
- Verification: Smoke tests and integration tests

### Production

- Purpose: Live environment for end users
- Trigger: Manual workflow dispatch only
- Verification: Smoke tests and integration tests

## Rollback Process

The pipeline includes automatic rollback functionality in case of deployment failures. If a deployment fails, the system will automatically roll back to the previous successful deployment.

The rollback process:

1. Detects a deployment failure (failed health check or smoke test)
2. Identifies the previous successful deployment
3. Reverts to the previous deployment using Kubernetes rollout undo
4. Verifies the rollback was successful
5. Updates the deployment record with rollback information

## Deployment Scripts

The pipeline uses the following deployment scripts:

### `deploy_with_rollback.py`

This script handles the deployment process with rollback capability. It supports:

- Regular deployments with automatic rollback
- Canary deployments
- Canary promotion

#### Usage

```bash
# Regular deployment
python deploy_with_rollback.py --environment staging

# Canary deployment
python deploy_with_rollback.py --environment staging --type canary --component api --percentage 10

# Promote canary to full deployment
python deploy_with_rollback.py --environment staging --promote --component api

# Simulate deployment failure (for testing rollback)
python deploy_with_rollback.py --environment staging --simulate-failure
```

## Deployment Records

The pipeline creates detailed deployment records for each deployment. These records are stored in the `data/deployment` directory and include:

- Deployment ID
- Environment
- Timestamp
- Status
- Components deployed
- Verification results
- Additional details (deployment type, start/end time, etc.)

Example deployment record:

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

## Notifications

The pipeline sends notifications to Slack after each deployment. These notifications include:

- Deployment status (success/failure)
- Repository information
- Commit details
- Workflow information
- Duration

## Setting Up the Pipeline

### Prerequisites

1. GitHub repository with the application code
2. Google Cloud Platform (GCP) project with:
   - Google Kubernetes Engine (GKE) cluster
   - Container Registry access
3. Kubernetes manifests for each environment

### Required Secrets

The following secrets must be configured in the GitHub repository:

- `GCP_PROJECT_ID`: GCP project ID
- `GCP_SA_KEY`: GCP service account key with permissions to:
  - Push to Container Registry
  - Deploy to GKE
- `GKE_CLUSTER`: GKE cluster name
- `GKE_ZONE`: GKE cluster zone
- `SLACK_WEBHOOK_URL`: Slack webhook URL for notifications

### Customizing the Pipeline

The pipeline can be customized by modifying the `.github/workflows/deploy.yml` file. Common customizations include:

- Adding additional verification steps
- Modifying deployment triggers
- Adding approval steps for production deployments
- Customizing notification content

## Troubleshooting

### Common Issues

#### Deployment Failure

If a deployment fails, check:

1. Deployment logs in GitHub Actions
2. Kubernetes pod logs
3. Deployment records in `data/deployment`

#### Rollback Failure

If a rollback fails, check:

1. Rollback logs in GitHub Actions
2. Kubernetes events
3. Previous deployment records

## Best Practices

1. **Small, Incremental Changes**: Make small, incremental changes to reduce deployment risk
2. **Feature Flags**: Use feature flags to control feature availability
3. **Automated Testing**: Maintain comprehensive automated tests
4. **Monitoring**: Set up monitoring to detect issues early
5. **Documentation**: Keep deployment documentation up to date