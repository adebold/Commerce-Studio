# Google Cloud Platform Deployment Guide

This document provides instructions for deploying the Eyewear ML Platform to Google Cloud Platform (GCP) with region-aware architecture.

## Prerequisites

- Google Cloud CLI (`gcloud`) installed and configured
- Git installed
- Access to GCP project `ml-datadriven-recos`
- Appropriate permissions in the GCP project

## Deployment Scripts

The following deployment scripts have been prepared:

1. **setup-vpc-network.sh**: Sets up the VPC network and VPC connectors
2. **setup-postgresql.sh**: Creates Cloud SQL PostgreSQL instances in both regions
3. **setup-redis.sh**: Creates Redis Memorystore instances in both regions
4. **setup-vertex-ai.sh**: Uploads and deploys ML models to Vertex AI
5. **deploy-to-gcp-staging.sh**: Main deployment script that orchestrates the entire process
6. **rollback-deployment.sh**: Rollback script to restore a previous deployment if needed

## Deployment Process

### Running on Windows

Since Windows PowerShell doesn't support the traditional Unix permission model, you'll need to run the scripts directly through Bash or using the Windows Subsystem for Linux (WSL) if available.

### Option 1: Run with PowerShell

```powershell
# Deploy using the main script
.\deploy-to-gcp-staging.sh
```

### Option 2: Run with WSL (if available)

```bash
# First make the scripts executable in WSL
wsl chmod +x setup-vpc-network.sh setup-postgresql.sh setup-redis.sh setup-vertex-ai.sh deploy-to-gcp-staging.sh rollback-deployment.sh

# Then run the main deployment script
wsl ./deploy-to-gcp-staging.sh
```

## Manual Deployment Process

If you prefer to run the scripts individually:

### Step 1: Set Up VPC Network

```powershell
# In PowerShell
.\setup-vpc-network.sh
```

This will:
- Create a VPC network named `eyewear-ml-vpc`
- Configure VPC peering for private connections
- Create VPC connectors in North America and Europe regions

### Step 2: Set Up PostgreSQL Databases

```powershell
# In PowerShell
.\setup-postgresql.sh
```

This will:
- Create PostgreSQL instances in both regions
- Create necessary databases and users
- Store connection credentials as secrets in Secret Manager

### Step 3: Set Up Redis Memorystore

```powershell
# In PowerShell
.\setup-redis.sh
```

This will:
- Create Redis instances in both regions for caching
- Configure persistence settings
- Store connection information as secrets

### Step 4: Set Up Vertex AI Models

```powershell
# In PowerShell
.\setup-vertex-ai.sh
```

This will:
- Upload ML models to Vertex AI
- Create endpoints for model serving
- Deploy the models to the endpoints
- Store endpoint information as secrets

### Step 5: Deploy the Application

```powershell
# Run the Cloud Build deployment
gcloud builds submit --config=cloudbuild.yaml .
```

This will:
- Build and push the Docker container to Container Registry
- Deploy to Cloud Run in both regions
- Configure environment variables and secrets

### Step 6: Set Up Load Balancer and Custom Domain

This part is included in the main deployment script, but if you're doing it manually:

```powershell
# Run the commands found in the deploy-to-gcp-staging.sh script
# under the "SETTING UP LOAD BALANCER AND CUSTOM DOMAIN" section
```

This will:
- Create serverless NEGs for the Cloud Run services
- Set up a global load balancer
- Configure SSL certificate for the custom domain
- Set up forwarding rules

## Rollback Process

If you need to roll back to a previous deployment:

```powershell
# In PowerShell, specify the deployment tag to roll back to
.\rollback-deployment.sh deployment-v1
```

The rollback script will:
- Check out the code at the specified tag
- Build and deploy the application from that tag
- Provide options for database rollback if needed
- Reset caches and reconfigure services as needed

## Accessing the Deployed Application

After deployment completes:

1. **Regional endpoints**:
   - NA: https://eyewear-ml-na-xxxx-uc.a.run.app
   - EU: https://eyewear-ml-eu-xxxx-ew.a.run.app

2. **Custom domain**:
   - https://commerce-staging.varai.ai

## Monitoring and Troubleshooting

- **Cloud Run Logs**: Check service logs in the Google Cloud Console
- **Cloud Monitoring**: Monitor service health and performance
- **Secret Manager**: Verify secrets are correctly configured
- **Cloud SQL Admin**: Monitor database performance and issues
- **Memorystore for Redis**: Monitor cache performance

## Security Considerations

- All services are deployed within the VPC network for enhanced security
- Secrets are managed through Secret Manager
- Cloud SQL instances use private IP addresses
- SSL is enforced for all external connections
