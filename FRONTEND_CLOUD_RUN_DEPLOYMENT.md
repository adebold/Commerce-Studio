# Deploying the Frontend to Google Cloud Run

This guide explains how to deploy the Eyewear ML Frontend to Google Cloud Run using the provided deployment scripts.

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

Two deployment scripts are provided for the frontend:

1. `deploy-frontend-to-cloud-run.ps1` - For Windows users (PowerShell)
2. `deploy-frontend-to-cloud-run.sh` - For Linux/macOS users (Bash)

## Configuration

Both scripts have configurable variables at the top:

```
PROJECT_ID="varai-ai-dev"       # Google Cloud project ID
REGION="us-central1"            # Google Cloud region
SERVICE_NAME="eyewear-ml-frontend"  # Cloud Run service name
IMAGE_NAME="eyewear-ml-frontend"    # Local image name
```

Modify these values if needed before running the scripts.

## Deployment Process

The scripts perform the following steps:

1. **Authentication** with Google Cloud
2. **Set the project** in Google Cloud
3. **Build the Docker image** from the frontend Dockerfile
4. **Configure Docker** to use Google Container Registry
5. **Tag the image** for Google Container Registry
6. **Push the image** to Google Container Registry
7. **Deploy to Cloud Run** with defined parameters
8. **Get the deployed service URL**
9. **Open the deployed frontend** in a browser (Windows PowerShell version only)

## Using the Deployment Scripts

### On Windows

1. Open PowerShell
2. Navigate to the project directory
3. Run the PowerShell script:

```powershell
.\deploy-frontend-to-cloud-run.ps1
```

### On Linux/macOS

1. Open Terminal
2. Navigate to the project directory
3. Make the script executable (if not already):

```bash
chmod +x deploy-frontend-to-cloud-run.sh
```

4. Run the script:

```bash
./deploy-frontend-to-cloud-run.sh
```

## Cloud Run Configuration

The deployment scripts configure the Cloud Run service with:

- **Memory**: 1 GiB
- **CPU**: 1 vCPU 
- **Minimum instances**: 0 (scales to zero)
- **Maximum instances**: 5
- **Port**: 80 (standard HTTP port)
- **Authentication**: Public (unauthenticated)

These settings can be adjusted in the scripts if needed.

## Environment Variables for the Frontend

If your frontend requires environment variables (like API URLs), you can add them to the deployment command using the `--set-env-vars` flag:

```
--set-env-vars="VITE_API_URL=https://api-service-url.run.app,VITE_OTHER_VAR=value"
```

Note: For frontend applications using Vite, ensure environment variables start with `VITE_` to be exposed to the client-side code.

## Connecting to the Backend API

To connect the frontend with the backend API deployed on Cloud Run:

1. Deploy the backend API first using `deploy-to-cloud-run.ps1` or `deploy-to-cloud-run.sh`
2. Take note of the API service URL
3. Add it as an environment variable when deploying the frontend:

```
--set-env-vars="VITE_API_URL=https://eyewear-ml-api-xxxxx.run.app"
```

## Troubleshooting

### Build Issues

If the Docker build fails:

1. Check if the required files exist in the frontend directory
2. Verify the Dockerfile is correctly formatted
3. Make sure all dependencies are properly specified

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
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eyewear-ml-frontend" --limit=20
```

## Cleanup

To delete the Cloud Run service:

```bash
gcloud run services delete eyewear-ml-frontend --platform managed --region us-central1
```

To delete the Container Registry image:

```bash
gcloud container images delete gcr.io/varai-ai-dev/eyewear-ml-frontend --force-delete-tags
```

## Continuous Deployment

For a complete CI/CD setup, consider:

1. Adding these deployment scripts to your CI/CD pipeline
2. Setting up GitHub Actions to automatically deploy on commits to main/master
3. Using Cloud Build triggers for automated builds

## Security Considerations

For production deployments:

1. Consider setting up authentication for the frontend service
2. Configure HTTPS and proper security headers
3. Set up a custom domain with proper SSL certificates
