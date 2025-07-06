# Quick Start: Staging Deployment

## Overview

This guide provides a simplified way to deploy the VARAi AI Discovery platform to Google Cloud Platform staging environment with password protection.

## Prerequisites

1. **Google Cloud Platform Account** with billing enabled
2. **gcloud CLI** installed and authenticated
3. **Terraform** installed (version 1.0+)
4. **Docker** installed and running

## Quick Deployment

### Step 1: Set Environment Variables

```bash
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
export ADMIN_USERNAME="varai-staging"
export ADMIN_PASSWORD="YourSecurePassword123!"
```

### Step 2: Authenticate with Google Cloud

```bash
gcloud auth login
gcloud config set project $GCP_PROJECT_ID
gcloud auth configure-docker
```

### Step 3: Run the Deployment Script

```bash
./deploy/scripts/deploy-staging-simple.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Enable required GCP APIs
- ✅ Build and push Docker images
- ✅ Deploy infrastructure with Terraform
- ✅ Configure Cloud Run services
- ✅ Set up security policies
- ✅ Provide deployment information

## What Gets Deployed

### Infrastructure Components

- **Cloud Run Services**: Admin panel and documentation API
- **Secret Manager**: Secure credential storage
- **Load Balancer**: Global load balancing with SSL
- **Cloud Armor**: DDoS protection and rate limiting
- **SSL Certificates**: Managed certificates for custom domains

### Security Features

- 🔐 **HTTP Basic Authentication** on all routes
- 🛡️ **SSL/TLS encryption** with Google-managed certificates
- 🚫 **Rate limiting** (100 requests/minute per IP)
- 🔒 **Secret management** for credentials
- 🛡️ **Cloud Armor protection** against malicious traffic

## Access Information

After deployment, you'll receive:

### Service URLs
- **Admin Panel**: `https://[cloud-run-url]`
- **Documentation API**: `https://[cloud-run-url]`

### Custom Domain Setup (Optional)
- **Admin Panel**: `https://admin-staging.varai.ai`
- **Documentation**: `https://docs-api-staging.varai.ai`

### Login Credentials
- **Username**: `varai-staging` (or your custom username)
- **Password**: `VaraiStaging2025!` (or your custom password)

## DNS Configuration (For Custom Domains)

If you want to use custom domains, configure these DNS records:

```
admin-staging.varai.ai    A    [STAGING_IP_ADDRESS]
docs-api-staging.varai.ai A    [STAGING_IP_ADDRESS]
```

The IP address will be provided in the deployment output.

## Monitoring and Logs

### View Logs
```bash
# Admin panel logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=varai-admin-staging" --project=$GCP_PROJECT_ID

# Documentation API logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=varai-docs-api-staging" --project=$GCP_PROJECT_ID
```

### Monitor Services
- **Cloud Console**: https://console.cloud.google.com/run
- **Monitoring**: https://console.cloud.google.com/monitoring

## Testing the Deployment

### Health Check
```bash
# Test admin panel
curl -u "varai-staging:VaraiStaging2025!" https://[admin-url]

# Test documentation API
curl -u "varai-staging:VaraiStaging2025!" https://[docs-api-url]/health
```

### Browser Access
1. Navigate to the admin panel URL
2. Enter credentials when prompted:
   - Username: `varai-staging`
   - Password: `VaraiStaging2025!`
3. Verify the admin interface loads correctly

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
```bash
gcloud auth login
gcloud auth configure-docker
```

#### 2. Permission Errors
```bash
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="user:$(gcloud config get-value account)" \
    --role="roles/owner"
```

#### 3. API Not Enabled
```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

#### 4. Docker Build Fails
```bash
# Check Docker is running
docker info

# Clean up Docker
docker system prune -f
```

### View Deployment Status
```bash
# Check Cloud Run services
gcloud run services list --region=$GCP_REGION

# Check Terraform state
cd terraform/environments/staging
terraform show
```

## Cleanup

To remove the staging deployment:

```bash
cd terraform/environments/staging
terraform destroy -var-file=terraform.tfvars
```

## Next Steps

1. **Configure DNS** (if using custom domains)
2. **Test functionality** with the provided credentials
3. **Monitor logs** for any issues
4. **Set up CI/CD** for automated deployments
5. **Configure monitoring alerts**

## Support

For issues or questions:
1. Check the logs in Google Cloud Console
2. Review the Terraform state for infrastructure issues
3. Verify all prerequisites are met
4. Ensure proper GCP permissions

## Security Notes

- Change default passwords in production
- Regularly rotate credentials
- Monitor access logs
- Keep dependencies updated
- Review security policies regularly

---

**Deployment Time**: ~10-15 minutes  
**SSL Certificate Provisioning**: Up to 60 minutes  
**Cost**: ~$10-20/month for staging environment