# Cloud Run Deployment Guide

This guide explains how to deploy the Eyewear ML application to Google Cloud Run.

## Prerequisites

Before deploying, ensure you have the following:

1. Google Cloud SDK installed and configured
2. Python 3.6+ installed
3. Proper permissions to deploy to Google Cloud Run
4. Docker images built and pushed to Google Container Registry (GCR)
5. Cross-project permissions configured (if deploying from images in a different project)

## Deployment Scripts

We provide three scripts for deploying to Cloud Run:

1. `deploy_to_cloud_run.py` - Core Python script for deploying individual services
2. `deploy_staging.sh` - Bash script for deploying to staging (Linux/macOS)
3. `deploy_staging.ps1` - PowerShell script for deploying to staging (Windows)

## Deploying to Staging

### Using the Bash Script (Linux/macOS)

```bash
# Make the script executable
chmod +x deploy_staging.sh

# Run the deployment
./deploy_staging.sh
```

### Using the PowerShell Script (Windows)

```powershell
# Run the deployment
.\deploy_staging.ps1
```

## Manual Deployment

You can also deploy individual services manually using the `deploy_to_cloud_run.py` script:

```bash
python deploy_to_cloud_run.py \
  --service SERVICE_NAME \
  --image-tag IMAGE_TAG \
  --region REGION \
  --memory MEMORY \
  --cpu CPU \
  --concurrency CONCURRENCY \
  --env-var KEY1=VALUE1 \
  --env-var KEY2=VALUE2
```

### Parameters

- `--service`: Name of the service to deploy (required)
- `--image-tag`: Tag of the Docker image to deploy (default: "latest")
- `--region`: GCP region to deploy to (default: "us-central1")
- `--memory`: Memory allocation (default: "1Gi")
- `--cpu`: CPU allocation (default: 1)
- `--concurrency`: Request concurrency (default: 80)
- `--env-var`: Environment variables in KEY=VALUE format (can be specified multiple times)

## Deployment Records

Deployment records are stored in the `data/deployment/` directory. Each deployment creates a JSON file with details about the deployment, including:

- Service name
- Timestamp
- Status
- Region
- URL
- Deployment details (image, resources, etc.)

## Cross-Project Deployment

Our deployment setup uses images from the `eyewear-ml` project but deploys them to the `ml-datadriven-recos` project. This requires special configuration:

1. The Cloud Run service account in the `ml-datadriven-recos` project needs permission to access images in the `eyewear-ml` project
2. All deployment commands must specify the correct project ID

To grant the necessary permissions:

```bash
# Get the Cloud Run service account from the ml-datadriven-recos project
SERVICE_ACCOUNT="service-353252826752@serverless-robot-prod.iam.gserviceaccount.com"

# Grant permission to access Container Registry in the eyewear-ml project
gcloud projects add-iam-policy-binding eyewear-ml \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/storage.objectViewer"
```

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

For PowerShell:

```powershell
gcloud run services update SERVICE_NAME `
  --image gcr.io/eyewear-ml/SERVICE_NAME:PREVIOUS_TAG `
  --region REGION `
  --project ml-datadriven-recos
```