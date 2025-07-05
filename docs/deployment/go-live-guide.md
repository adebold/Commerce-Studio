# EyewearML Go-Live Guide

This guide outlines the steps to push the EyewearML project to production. It addresses the security issues identified in the security audit and provides a comprehensive deployment process.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Security Hardening](#security-hardening)
3. [Environment Configuration](#environment-configuration)
4. [Infrastructure Setup](#infrastructure-setup)
5. [Deployment Process](#deployment-process)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Rollback Procedure](#rollback-procedure)
9. [Security Best Practices](#security-best-practices)

## Prerequisites

Before proceeding with the deployment, ensure you have the following:

- Google Cloud Platform (GCP) account with appropriate permissions
- `gcloud` CLI installed and configured
- `kubectl` CLI installed and configured (for Kubernetes deployment)
- Python 3.9 or higher
- Git access to the EyewearML repository
- Docker installed locally

## Security Hardening

The security audit identified several issues that need to be addressed before going live. The most critical issue is the presence of hardcoded secrets throughout the codebase.

### 1. Run Security Hardening Script

```bash
python scripts/security_hardening.py
```

This script will:
- Update the environment file
- Create a secure certificates directory
- Install pre-commit hooks
- Create rate limiting middleware
- Update server.py to use rate limiting middleware

### 2. Extract Hardcoded Secrets

```bash
python scripts/extract_secrets.py --replace
```

This script will:
- Scan the codebase for hardcoded secrets
- Create a `.env.example` file with placeholders for all identified secrets
- Replace hardcoded secrets in the code with references to environment variables

### 3. Generate Secure Environment Values

```bash
python scripts/generate_env_values.py --overwrite
```

This script will:
- Read the `.env.example` file to identify required environment variables
- Generate secure random values for each variable
- Create a `.env` file with the generated values

### 4. Upload Secrets to Google Cloud Secret Manager

```bash
python scripts/setup_gcp_secrets.py --project-id your-gcp-project-id --prefix eyewear-ml
```

This script will:
- Read the `.env` file to get environment variables and their values
- Create secrets in Google Cloud Secret Manager for each variable
- Optionally grant access to a specified service account

## Environment Configuration

### 1. Configure Google Cloud Project

```bash
# Set default project
gcloud config set project your-gcp-project-id

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable container.googleapis.com
```

### 2. Create Service Accounts

```bash
# Create service account for Cloud Run
gcloud iam service-accounts create eyewear-ml-service \
  --display-name="EyewearML Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding your-gcp-project-id \
  --member="serviceAccount:eyewear-ml-service@your-gcp-project-id.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Configure Database

```bash
# Create Cloud SQL instance (if using Cloud SQL)
gcloud sql instances create eyewear-ml-db \
  --database-version=POSTGRES_13 \
  --tier=db-g1-small \
  --region=us-central1

# Create database
gcloud sql databases create eyewear_ml --instance=eyewear-ml-db

# Create user
gcloud sql users create eyewear_ml_user \
  --instance=eyewear-ml-db \
  --password="${GO_LIVE_GUIDE_SECRET}"
```

## Infrastructure Setup

### 1. Set Up Kubernetes Cluster (if using Kubernetes)

```bash
# Create GKE cluster
gcloud container clusters create eyewear-ml-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-standard-2

# Get credentials
gcloud container clusters get-credentials eyewear-ml-cluster --zone us-central1-a
```

### 2. Set Up Cloud Run (if using Cloud Run)

```bash
# No additional setup required for Cloud Run
# Deployment will create the service
```

## Deployment Process

### 1. Deploy with Secrets

```bash
# Deploy to Cloud Run (production environment)
python scripts/deploy_with_secrets.py \
  --project-id your-gcp-project-id \
  --deployment-type cloud-run \
  --environment prod

# OR Deploy to Kubernetes (production environment)
python scripts/deploy_with_secrets.py \
  --project-id your-gcp-project-id \
  --deployment-type kubernetes \
  --environment prod
```

### 2. Configure Domain and SSL

```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
  --service eyewear-ml-prod \
  --domain eyewear-ml.example.com \
  --region us-central1

# Follow the instructions to verify domain ownership and configure DNS
```

## Post-Deployment Verification

### 1. Verify Deployment

```bash
# Get Cloud Run service URL
gcloud run services describe eyewear-ml-prod \
  --region us-central1 \
  --format="value(status.url)"

# OR Get Kubernetes service URL
kubectl get service eyewear-ml-prod -o jsonpath="{.status.loadBalancer.ingress[0].ip}"
```

### 2. Run E2E Tests

```bash
# Run E2E tests against production environment
cd tests/e2e
npm test -- --env=prod
```

### 3. Verify Security

```bash
# Run security scan
python scripts/security_scan.py --url https://eyewear-ml.example.com
```

## Monitoring and Maintenance

### 1. Set Up Monitoring

```bash
# Set up Cloud Monitoring
gcloud monitoring dashboards create \
  --config-from-file=monitoring/dashboards/eyewear-ml-dashboard.json
```

### 2. Set Up Alerting

```bash
# Set up alerts
gcloud alpha monitoring policies create \
  --policy-from-file=monitoring/alerts/eyewear-ml-alerts.json
```

### 3. Set Up Logging

```bash
# Set up log-based metrics
gcloud logging metrics create eyewear-ml-errors \
  --description="Count of error log entries" \
  --log-filter="resource.type=cloud_run_revision AND resource.labels.service_name=eyewear-ml-prod AND severity>=ERROR"
```

## Rollback Procedure

In case of issues with the deployment, follow these steps to rollback:

### 1. Rollback Cloud Run Deployment

```bash
# List revisions
gcloud run revisions list --service eyewear-ml-prod --region us-central1

# Rollback to previous revision
gcloud run services update-traffic eyewear-ml-prod \
  --to-revisions=eyewear-ml-prod-00001-abc=100 \
  --region us-central1
```

### 2. Rollback Kubernetes Deployment

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/eyewear-ml-prod
```

## Security Best Practices

1. **Regular Secret Rotation**
   - Rotate secrets every 90 days
   - Use the `generate_env_values.py` script to generate new values
   - Update secrets in Google Cloud Secret Manager

2. **Access Control**
   - Implement role-based access control (RBAC)
   - Follow the principle of least privilege
   - Regularly audit access to resources

3. **Monitoring and Logging**
   - Monitor for suspicious activities
   - Set up alerts for security events
   - Retain logs for at least 90 days

4. **Regular Updates**
   - Keep dependencies up to date
   - Apply security patches promptly
   - Regularly review and update security configurations

5. **Compliance**
   - Ensure compliance with relevant regulations (GDPR, HIPAA, etc.)
   - Conduct regular security audits
   - Document security controls and procedures

By following this guide, you will be able to securely deploy the EyewearML project to production, addressing the security issues identified in the security audit and following best practices for cloud deployment.