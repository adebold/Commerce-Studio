# Google Cloud Platform Deployment

This directory contains documentation for deploying the EyewearML application to Google Cloud Platform (GCP).

## Available Deployment Options

The EyewearML application can be deployed to GCP using various services:

1. **Cloud Run** (Recommended for staging and production)
   - Serverless container platform
   - Auto-scaling capabilities
   - Pay-per-use billing model
   - Low maintenance overhead

2. **Google Kubernetes Engine** (For complex deployments)
   - Container orchestration
   - Advanced networking
   - More granular control
   - Suitable for complex microservices architectures

## Environment-Specific Documentation

We maintain separate documentation for different deployment environments:

- [Staging Deployment](./staging-deployment.md) - Guide for deploying to the staging environment
- Production Deployment (Coming soon) - Guide for deploying to production

## Prerequisites for All Deployments

Regardless of the deployment target, you'll need:

1. **Google Cloud SDK** installed locally
2. **Docker** for building container images
3. **Access to the GCP project** with appropriate IAM permissions
4. **Service Account credentials** with necessary permissions

### Service Account Requirements

For staging deployments, the service account (353252826752-compute@developer.gserviceaccount.com) must have these IAM roles:

- **roles/run.admin** - To deploy to Cloud Run
- **roles/storage.admin** - To push images to Container Registry
- **roles/iam.serviceAccountUser** - To act as the service account
- **roles/secretmanager.secretAccessor** - To access secrets (if needed)

## Deployment Strategy

Our deployment strategy follows these principles:

1. **Infrastructure as Code** - All infrastructure is codified using Terraform
2. **Immutable Infrastructure** - Build once, deploy anywhere
3. **Automated Deployments** - Reduce manual steps and human error with deployment scripts
4. **Environment Parity** - Staging mirrors production with appropriate scaling

## Infrastructure Components

Our GCP infrastructure includes:

### Compute
- **Cloud Run** for containerized services
- Configured with appropriate memory, CPU, and scaling parameters

### Database
- **MongoDB Atlas** for primary database
  - Automated backups (daily, weekly, monthly)
  - Point-in-time recovery
  - Network peering with GCP VPC
- **Cloud Memorystore (Redis)** for caching

### Monitoring & Observability
- **Cloud Monitoring** dashboards
- **Uptime checks** for service health
- **Alert policies** for CPU, memory, error rates, and latency
- **Log exports** to BigQuery
- **Service Level Objectives (SLOs)** for availability and performance

## Continuous Integration/Deployment

We implement a CI/CD pipeline for automated deployments:

- GitHub Actions for build and test automation
- Automated deployments to staging environments
- Manual approval for production deployments
- Monitoring and alerting integration

## Security Considerations

When deploying to GCP, we follow these security best practices:

1. **Service Account Principle of Least Privilege**
   - Service accounts have only the permissions they need
   - Separate service accounts for different environments

2. **Secrets Management**
   - Using GCP Secret Manager for sensitive values
   - Environment variables for non-sensitive configuration

3. **Network Security**
   - VPC Service Controls where appropriate
   - Private connectivity for database access
   - IP allowlisting for sensitive services

4. **Access Control**
   - IAM Role Bindings for granular access control
   - Regular access reviews and audits

5. **Security Monitoring**
   - Audit Logging enabled
   - Regular security scanning
   - Automated vulnerability assessment

## Need Help?

For deployment issues or questions:
- Consult the troubleshooting guide
- Contact the DevOps team via Slack at #eyewear-ml-devops
- Open an issue in the GitHub repository
