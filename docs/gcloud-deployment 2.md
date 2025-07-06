# Cloud Run Deployment with gcloud CLI

This guide explains how to deploy the Eyewear ML application to Google Cloud Run using the gcloud CLI directly.

## Overview

We've created three deployment scripts that use the Google Cloud CLI (gcloud) directly to deploy our services to Cloud Run:

1. `gcloud_deploy_to_staging.sh` - Bash script for Linux/macOS
2. `gcloud_deploy_to_staging.ps1` - PowerShell script for Windows
3. `gcloud_deploy_to_staging.py` - Python script (cross-platform)

All scripts perform the same deployment process:

1. Deploy the API service to Cloud Run
2. Deploy the Frontend service to Cloud Run
3. Run a health check on the deployed API
4. Create a deployment record with details and results

## Prerequisites

Before deploying, ensure you have the following:

1. Google Cloud SDK installed and configured
2. Proper permissions to deploy to Google Cloud Run
3. Docker images built and pushed to Google Container Registry (GCR)
4. Cross-project permissions configured (if deploying from images in a different project)

## Configuration

All scripts use the following configuration:

- **Project ID**: `ml-datadriven-recos` (deployment target)
- **Region**: `us-central1`
- **Image Tag**: `staging`
- **Source Project**: `eyewear-ml` (where container images are stored)

You can modify these values directly in the scripts if needed.

## Deployment Instructions

### Using the Bash Script (Linux/macOS)

```bash
# Make the script executable
chmod +x gcloud_deploy_to_staging.sh

# Run the deployment
./gcloud_deploy_to_staging.sh
```

### Using the PowerShell Script (Windows)

```powershell
# Run the deployment
.\gcloud_deploy_to_staging.ps1
```

### Using the Python Script (Cross-platform)

```bash
# Make the script executable (Linux/macOS)
chmod +x gcloud_deploy_to_staging.py

# Run the deployment
python gcloud_deploy_to_staging.py
```

## Cross-Project Deployment

Our deployment setup uses images from the `eyewear-ml` project but deploys them to the `ml-datadriven-recos` project. This requires special configuration:

1. The Cloud Run service account in the `ml-datadriven-recos` project needs permission to access images in the `eyewear-ml` project
2. All deployment commands specify the correct project ID

To grant the necessary permissions:

```bash
# Get the Cloud Run service account from the ml-datadriven-recos project
SERVICE_ACCOUNT="service-353252826752@serverless-robot-prod.iam.gserviceaccount.com"

# Grant permission to access Container Registry in the eyewear-ml project
gcloud projects add-iam-policy-binding eyewear-ml \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/storage.objectViewer"
```

## Deployment Records

All scripts create deployment records in the `data/deployment/` directory. Each deployment creates a JSON file with details about the deployment, including:

- Service names
- Timestamp
- Status
- Region
- URLs
- Health check results
- Deployment details

## Troubleshooting

If deployment fails, check the following:

1. Ensure you're authenticated with Google Cloud: `gcloud auth login`
2. Verify the Docker image exists in GCR: `gcloud container images list --repository=gcr.io/eyewear-ml`
3. Check if you have the necessary permissions: `gcloud projects get-iam-policy ml-datadriven-recos`
4. Verify cross-project permissions: `gcloud projects get-iam-policy eyewear-ml | grep serverless-robot-prod`
5. Review the logs for any errors: `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=SERVICE_NAME" --project=ml-datadriven-recos`

## Rollback

To rollback to a previous version:

```bash
gcloud run services update SERVICE_NAME \
  --image gcr.io/eyewear-ml/SERVICE_NAME:PREVIOUS_TAG \
  --region REGION \
  --project ml-datadriven-recos
```

Replace `SERVICE_NAME`, `PREVIOUS_TAG`, and `REGION` with appropriate values.

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines by:

1. Adding them to your CI/CD configuration files
2. Setting up environment variables for configuration
3. Adding appropriate authentication steps
4. Configuring deployment triggers (e.g., on merge to staging branch)

Example GitHub Actions workflow:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [ staging ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ml-datadriven-recos
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          
      - name: Deploy to Cloud Run
        run: ./gcloud_deploy_to_staging.sh