# Staging Deployment Guide

## Overview

This guide provides instructions for deploying the VARAi AI Discovery platform to the staging environment on Google Cloud Platform with password protection.

## Prerequisites

1. Google Cloud Platform account with billing enabled
2. Terraform installed (version 1.5.0+)
3. Google Cloud CLI installed and configured
4. Required GCP APIs enabled:
   - Cloud Run API
   - Cloud Build API
   - Container Registry API
   - Cloud SQL API
   - Secret Manager API

## Environment Setup

### 1. Configure GCP Project

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 2. Set Up Terraform Variables

Copy the example terraform variables file:

```bash
cd terraform/environments/staging
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your specific values:

```hcl
project_id = "your-project-id"
region     = "us-central1"
environment = "staging"

# Password protection
staging_password = "YourSecurePassword123!"
```

### 3. Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the infrastructure
terraform apply
```

## Security Features

The staging deployment includes:

- **HTTP Basic Authentication**: Password protection on all admin routes
- **SSL/TLS Encryption**: Google-managed certificates
- **Cloud Armor Protection**: DDoS and malicious traffic protection
- **CORS Configuration**: Secure API access
- **Rate Limiting**: Brute force attack prevention
- **Secret Management**: Secure credential storage

## Access Information

After deployment, the staging environment will be available at:

- **Admin Panel**: `https://admin-staging.varai.ai`
- **Documentation**: `https://admin-staging.varai.ai/documentation.html`
- **API Endpoint**: `https://docs-api-staging.varai.ai`

### Default Credentials

- **Username**: `varai-staging`
- **Password**: `VaraiStaging2025!` (or your custom password)

## Monitoring and Logs

- **Cloud Run Logs**: Available in Google Cloud Console
- **Application Metrics**: Integrated with Cloud Monitoring
- **Health Checks**: Automated health monitoring
- **Alerts**: Configured for critical issues

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify GCP credentials are properly configured
   - Check service account permissions

2. **Terraform Errors**
   - Ensure all required APIs are enabled
   - Verify terraform.tfvars configuration

3. **Deployment Failures**
   - Check Cloud Build logs
   - Verify container images are built successfully

### Support

For additional support, refer to:
- [Technical Documentation](../docs/technical/DEVELOPER-TECHNICAL-GUIDE.md)
- [Troubleshooting Guide](../docs/operations/TROUBLESHOOTING-MAINTENANCE-GUIDE.md)
- [API Documentation](../docs/api/API-DOCUMENTATION-INTEGRATION-GUIDE.md)

## Next Steps

1. Test the staging environment functionality
2. Configure monitoring and alerting
3. Set up automated testing pipeline
4. Prepare for production deployment