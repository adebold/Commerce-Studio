# Deploying to Google Cloud Run

This guide explains how to deploy the Eyewear ML API to Google Cloud Run using the provided deployment scripts.

## Prerequisites

1. **Google Cloud SDK** installed:
   - Windows: Download from https://cloud.google.com/sdk/docs/install
   - Linux/macOS: Use the installer or package manager

2. **Docker** installed:
   - Windows: Docker Desktop
   - Linux: Docker Engine

3. **Google Cloud Account** with:
   - A project (default: `varai-ai-dev`)
   - Billing enabled
   - Required APIs enabled:
     - Cloud Run API
     - Container Registry API

## Deployment Scripts

Two deployment scripts are provided:

1. `deploy-to-cloud-run.ps1` - For Windows users (PowerShell)
2. `deploy-to-cloud-run.sh` - For Linux/macOS users (Bash)

## Configuration

Both scripts have configurable variables at the top:

```
PROJECT_ID="varai-ai-dev"    # Google Cloud project ID
REGION="us-central1"         # Google Cloud region
SERVICE_NAME="eyewear-ml-api"  # Cloud Run service name
IMAGE_NAME="eyewear-ml-api"    # Local image name
```

Modify these values if needed before running the scripts.

## Deployment Process

The scripts perform the following steps:

1. **Authentication** with Google Cloud
2. **Set the project** in Google Cloud
3. **Build the Docker image** from the Dockerfile
4. **Configure Docker** to use Google Container Registry
5. **Tag the image** for Google Container Registry
6. **Push the image** to Google Container Registry
7. **Deploy to Cloud Run** with defined parameters
8. **Get the deployed service URL**
9. **Test the health endpoint**

## Using the Deployment Scripts

### On Windows

1. Open PowerShell
2. Navigate to the project directory
3. Run the PowerShell script:

```powershell
.\deploy-to-cloud-run.ps1
```

### On Linux/macOS

1. Open Terminal
2. Navigate to the project directory
3. Make the script executable (if not already):

```bash
chmod +x deploy-to-cloud-run.sh
```

4. Run the script:

```bash
./deploy-to-cloud-run.sh
```

## Cloud Run Configuration

The deployment scripts configure the Cloud Run service with:

- **Memory**: 2 GiB
- **CPU**: 1 vCPU 
- **Concurrency**: Default (80)
- **Minimum instances**: 0 (scales to zero)
- **Maximum instances**: 10
- **Port**: 8000
- **Authentication**: Public (unauthenticated)

These settings can be adjusted in the scripts if needed.

## Environment Variables

The Dockerfile is already configured to use environment variables from the Docker build. If you need to pass additional environment variables to the Cloud Run service, add them to the deployment script using the `--set-env-vars` flag:

```
--set-env-vars="KEY1=VALUE1,KEY2=VALUE2"
```

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

```bash
# Re-authenticate with Google Cloud
gcloud auth login

# For Docker authentication issues
gcloud auth configure-docker
```

### Image Push Failures

If pushing to Container Registry fails:

1. Verify you have the required permissions
2. Check if the Container Registry API is enabled
3. Ensure Docker is properly configured for GCP

### Deployment Failures

If the deployment fails:

1. Check the output of the deployment command
2. View the logs in the Google Cloud Console
3. Verify the service account has the required permissions

## Viewing Logs

To view logs for the deployed service:

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eyewear-ml-api" --limit=20
```

## Cleanup

To delete the Cloud Run service:

```bash
gcloud run services delete eyewear-ml-api --platform managed --region us-central1
```

To delete the Container Registry image:

```bash
gcloud container images delete gcr.io/varai-ai-dev/eyewear-ml-api --force-delete-tags
