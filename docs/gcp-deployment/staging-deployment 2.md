# Staging Deployment to Google Cloud Run

This guide provides detailed steps for deploying the EyewearML application to the staging environment on Google Cloud Run.

## Prerequisites

### Access Requirements
- Google Cloud SDK installed locally
- Access to "ml-datadriven-recos" GCP project
- Service account key file (ml-datadriven-recos-key.json)
- Appropriate IAM permissions for service account (353252826752-compute@developer.gserviceaccount.com):
  - roles/run.admin - To deploy to Cloud Run
  - roles/storage.admin - To push images to Container Registry
  - roles/iam.serviceAccountUser - To act as the service account
  - roles/secretmanager.secretAccessor - To access secrets (if needed)

### Tools
- Google Cloud SDK
- Docker
- Git
- PowerShell (for Windows deployment)

## Environment Setup

### Service Account Authentication
The deployment process uses a service account for authentication with Google Cloud. This provides secure, automated deployments without requiring user credentials.

```powershell
# Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
$env:GOOGLE_APPLICATION_CREDENTIALS = "$(Get-Location)\ml-datadriven-recos-key.json"

# Authenticate with gcloud using the service account
gcloud auth activate-service-account --key-file=$serviceAccountKeyPath

# Verify authentication
$authStatus = gcloud auth list --filter=status:ACTIVE --format="value(account)"
```

### Project Configuration
```powershell
# Set the Google Cloud project
gcloud config set project ml-datadriven-recos
```

### Environment Variables
1. Use the `.env.staging` file for staging environment configuration
2. The deployment script automatically reads this file and sets environment variables in Cloud Run
3. Ensure all required variables are properly set:
   - `GCP_PROJECT_ID`
   - `GCP_BUCKET_NAME`
   - `JWT_SECRET_KEY`
   - `DEEPSEEK_API_KEY`
   - MongoDB & Redis connection settings

## Build Process

### Build Docker Image
```powershell
# Build the Docker image with a staging tag
docker build -t "eyewear-ml-staging" .
```

### Configure Docker for Google Container Registry
```powershell
# Configure Docker to use Google Container Registry with service account
gcloud auth configure-docker --quiet

# Tag the Docker image for Google Container Registry
$GCR_IMAGE = "gcr.io/ml-datadriven-recos/eyewear-ml-staging"
docker tag "eyewear-ml-staging" $GCR_IMAGE

# Push the image
docker push $GCR_IMAGE
```

## Deployment Process

### Automated Deployment Script
The project includes a PowerShell script (`deploy-to-staging.ps1`) that automates the entire deployment process. This script:

1. Authenticates with Google Cloud using the service account
2. Sets the project configuration
3. Builds the Docker image
4. Configures Docker for GCR
5. Pushes the image to Google Container Registry
6. Reads environment variables from `.env.staging`
7. Deploys to Cloud Run with appropriate configuration
8. Tests the health endpoint

To use the script:

```powershell
# Run the deployment script
./deploy-to-staging.ps1
```

### Manual Deployment to Cloud Run
If you need to deploy manually:

```powershell
# Deploy the container to Cloud Run
gcloud run deploy eyewear-ml-staging `
  --image gcr.io/ml-datadriven-recos/eyewear-ml-staging `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --port 8080 `
  --memory 2Gi `
  --cpu 2 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 300s
```

### Configure Environment Variables
Environment variables are automatically configured by the deployment script from the `.env.staging` file. If you need to update them manually:

```powershell
# Read environment variables from .env.staging file
$envVars = @()
foreach ($line in Get-Content ".env.staging") {
    if ($line -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars += "$key=$value"
    }
}

# Join environment variables with commas
$envVarsString = $envVars -join ","

# Update the service with environment variables
gcloud run services update eyewear-ml-staging `
  --platform managed `
  --region us-central1 `
  --set-env-vars "$envVarsString"
```

### Configure Secrets (if needed)
```powershell
# For sensitive values, use Secret Manager
gcloud secrets create JWT_SECRET_KEY --data-file=./jwt_secret.txt
gcloud run services update eyewear-ml-staging `
  --platform managed `
  --region us-central1 `
  --update-secrets=JWT_SECRET_KEY=JWT_SECRET_KEY:latest
```

## Database Operations

### MongoDB Atlas Configuration
The staging environment uses MongoDB Atlas for database services. The database is configured with:

- MongoDB Atlas M20 instance
- Automated backups with the following schedule:
  - Daily backups retained for 7 days
  - Weekly backups retained for 4 weeks
  - Monthly backups retained for 12 months
- Point-in-time recovery enabled
- Encryption at rest
- Network peering with GCP VPC

### Run Migrations
Migrations should be run as part of the deployment process:

```powershell
# Run database migrations
alembic upgrade head
```

## Verification

### Check Deployment Status
```powershell
# Get status of the service
gcloud run services describe eyewear-ml-staging `
  --platform managed `
  --region us-central1
```

### View Logs
```powershell
# View deployment logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eyewear-ml-staging" `
  --limit 50 `
  --format json
```

### Health Check
The deployment script automatically performs a health check. To manually check:

```powershell
# Get the service URL
$SERVICE_URL = gcloud run services describe eyewear-ml-staging `
  --platform managed `
  --region us-central1 `
  --format="value(status.url)"

# Check health endpoint
Invoke-RestMethod -Uri "$SERVICE_URL/health" -Method Get
```

## Monitoring and Alerting

The staging environment includes comprehensive monitoring and alerting:

### Cloud Monitoring Dashboards
- VARAi Platform Overview dashboard with metrics for:
  - API Service CPU and Memory Usage
  - Auth Service CPU and Memory Usage
  - Frontend Service CPU and Memory Usage
  - HTTP Response Codes and Latency
  - API Service Requests per Pod
  - API Service Number of Pods

### Uptime Checks
- API Uptime Check (checks `/api/health` endpoint)
- Auth Uptime Check (checks `/auth/health` endpoint)
- Frontend Uptime Check (checks `/` endpoint)

### Alert Policies
- CPU Usage Alerts (triggers at 80% utilization)
- Memory Usage Alerts (triggers at 80% utilization)
- HTTP Error Rate Alerts (triggers at 5% error rate)
- HTTP Latency Alerts (triggers at 1000ms latency)
- API Pod Request Drop Alerts (detects significant drops in request rates)

### Database Monitoring
- MongoDB Atlas Alerts:
  - CPU Usage (triggers at 80% utilization)
  - Memory Usage (triggers at 80% utilization)
  - Disk Usage (triggers at 80% utilization)
- Redis Monitoring (via Cloud Monitoring)

### Log Management
- Cloud Logging integration
- Log export to BigQuery for long-term storage and analysis
- Retention policy based on environment configuration

### Service Level Objectives (SLOs)
- API Availability SLO (99% target)
- API Latency SLO (95% of requests under 1 second)

## Rollback Procedure

If you need to roll back to a previous version:

```powershell
# List previous revisions
gcloud run revisions list `
  --platform managed `
  --region us-central1 `
  --service eyewear-ml-staging

# Roll back to a specific revision
gcloud run services update-traffic eyewear-ml-staging `
  --platform managed `
  --region us-central1 `
  --to-revisions=REVISION_NAME=100
```

## Troubleshooting

### Common Issues

1. **Deployment Failures**
   - Check build logs: `gcloud builds list`
   - Verify service account permissions
   - Check container image existence
   - Ensure service account has all required roles:
     - roles/run.admin
     - roles/storage.admin
     - roles/iam.serviceAccountUser
     - roles/secretmanager.secretAccessor

2. **Runtime Errors**
   - Check application logs: `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eyewear-ml-staging"`
   - Verify environment variables
   - Check database connectivity

3. **Database Connectivity Issues**
   - Check VPC connector configuration
   - Verify IP allowlisting for database
   - Test connection from local environment with same credentials

4. **Service Account Issues**
   - Verify the service account key file exists and is valid
   - Check that the service account has the necessary permissions
   - Ensure the GOOGLE_APPLICATION_CREDENTIALS environment variable is set correctly

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GCP Service Account Management](https://cloud.google.com/iam/docs/service-accounts)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Terraform Documentation](https://www.terraform.io/docs)
- Internal Slack channel: #eyewear-ml-devops
