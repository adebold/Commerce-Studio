# Frontend Cloud Run Deployment Fix

## Issue Identified

The frontend deployment to Cloud Run was failing with the error:

```
nginx: [emerg] host not found in upstream "api" in /etc/nginx/conf.d/default.conf:14
```

This occurred because the standard nginx configuration was using a hostname `api` that works in Docker Compose environments but is not valid in Cloud Run where services are isolated.

## Solution Implemented

### 1. Created Cloud Run Specific Nginx Configuration

Created a specialized nginx configuration file that uses environment variables instead of hardcoded service names:

- **File:** `frontend/nginx-cloud-run.conf`
- **Key Changes:** 
  - Changed `proxy_pass http://api:8000/` to `proxy_pass ${API_SERVICE_URL}/`
  - This configuration uses environment variable substitution at runtime

### 2. Created Cloud Run Specific Dockerfile

Created a custom Dockerfile for Cloud Run deployments:

- **File:** `frontend/Dockerfile.cloud-run`
- **Key Changes:**
  - Uses the Cloud Run specific nginx configuration
  - Loads the configuration as a template so environment variables can be processed
  - Configures nginx properly for Cloud Run environment

### 3. Updated Deployment Scripts

Both PowerShell and Bash deployment scripts have been updated to:

- Use the Cloud Run specific Dockerfile
- Get the API service URL from the deployed API service
- Pass the API URL as an environment variable to the frontend service
- Use the proper environment variable name for nginx configuration

## How to Deploy

### To Deploy Only the Frontend

```powershell
# PowerShell
./deploy-frontend-to-cloud-run.ps1
```

```bash
# Bash
./deploy-frontend-to-cloud-run.sh
```

### To Deploy Both API and Frontend

```powershell
# PowerShell
./deploy-all-to-cloud-run.ps1
```

```bash
# Bash
./deploy-all-to-cloud-run.sh
```

## Verification

After deployment, the scripts will output:
- API Service URL
- Frontend Service URL

You can verify the frontend is working correctly by:
1. Opening the Frontend Service URL in a browser
2. Checking that the frontend can communicate with the API
3. Verifying API requests are correctly proxied to the backend

## Troubleshooting

If issues persist:

1. Check Cloud Run logs for the frontend service
2. Verify the API_SERVICE_URL environment variable is correctly set in the Cloud Run service
3. Ensure the API is accessible from the frontend service
4. Check that nginx is correctly processing the environment variables
