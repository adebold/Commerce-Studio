# VARAi Platform - Staging Environment

This directory contains Terraform configurations for the VARAi Platform staging environment. The staging environment is designed to mirror the production environment as closely as possible while allowing for testing and validation before production deployment.

## Features

### Infrastructure

- Kubernetes cluster for staging environment
- MongoDB Atlas database (M20 instance)
- Redis for caching (Standard HA tier)
- Google Cloud infrastructure components
- Networking and security configurations

### Blue/Green Deployment

- Automated blue/green deployment capability
- Traffic routing mechanism
- Deployment verification process
- Rollback procedures
- Health checks for deployment validation
- Zero-downtime deployment process

### Test Automation

- Automated smoke tests
- Integration test suite
- Performance test automation
- Security scanning
- Data validation tests
- User experience tests

### Promotion Process

- Promotion workflow from staging to production
- Approval gates
- Configuration management
- Database migration process
- Artifact promotion
- Documentation for promotion process

### Environment-Specific Configuration

- Configuration management system
- Secrets management
- Feature flag system
- Environment variable management
- Service discovery
- Configuration validation

## Getting Started

### Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) (version >= 1.0.0)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)
- Access to a GCP project with appropriate permissions

### Setup

1. Create a `terraform.tfvars` file from the example:

```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Edit the `terraform.tfvars` file to set the required variables.

3. Initialize Terraform:

```bash
terraform init
```

4. Generate and review an execution plan:

```bash
terraform plan -out=tfplan
```

5. Apply the changes to create or update the infrastructure:

```bash
terraform apply tfplan
```

## Usage

### Deploying to Staging

To deploy the VARAi Platform to the staging environment:

1. Push your changes to the staging branch:

```bash
git push origin staging
```

2. The CI/CD pipeline will automatically deploy the changes to the staging environment.

3. Monitor the deployment in the staging dashboard.

### Running Tests

The test automation suite will run automatically according to the configured schedule. You can also trigger tests manually:

```bash
# Run smoke tests
kubectl create job --from=cronjob/smoke-tests smoke-tests-manual -n varai-test-staging

# Run integration tests
kubectl create job --from=cronjob/integration-tests integration-tests-manual -n varai-test-staging

# Run performance tests
kubectl create job --from=cronjob/performance-tests performance-tests-manual -n varai-test-staging
```

### Promoting to Production

To promote the staging environment to production:

1. Access the promotion dashboard:

```
https://varai-promotion-ui-staging-to-prod-<project-id>.run.app
```

2. Review the promotion checklist and ensure all requirements are met.

3. Initiate the promotion process.

4. Approve the promotion (if approval is required).

5. Monitor the promotion process in the dashboard.

## Architecture

The staging environment is designed to mirror the production environment with the following differences:

- Reduced resource requirements
- Simplified security settings
- Basic autoscaling
- Fewer replicas of each service

## Monitoring

The staging environment includes comprehensive monitoring:

- Cloud Monitoring dashboards
- Uptime checks
- Alert policies
- Log sinks
- Service Level Objectives (SLOs)
- Grafana dashboards
- Prometheus rules

## Troubleshooting

### Common Issues

1. **Deployment Failures**: Check the CI/CD pipeline logs and Kubernetes events.

2. **Test Failures**: Review the test logs in the GCS bucket.

3. **Promotion Failures**: Check the promotion logs and database migration logs.

4. **Resource Quota Errors**: Ensure your GCP project has sufficient quotas for the resources you are trying to provision.

### Getting Help

For additional help, contact the VARAi Platform team at devops@varai.ai.