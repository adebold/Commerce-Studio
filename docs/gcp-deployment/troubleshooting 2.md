# Cloud Run Deployment Troubleshooting Guide

This document provides solutions for common issues encountered when deploying to Google Cloud Run.

## Deployment Failures

### Container Build Issues

| Problem | Solution |
|---------|----------|
| **Docker build fails** | • Check Dockerfile syntax<br>• Ensure base image is accessible<br>• Check for network issues during build |
| **Push to Container Registry fails** | • Verify you're authenticated with `gcloud auth configure-docker`<br>• Check you have permissions to the GCP project<br>• Ensure project ID is correct |
| **"Permission denied" during build** | • Check if your service account has Container Registry Writer permissions<br>• Ensure your local Docker daemon has adequate permissions |

### Cloud Run Deployment Issues

| Problem | Solution |
|---------|----------|
| **"Permission denied" during deployment** | • Verify your service account has Cloud Run Admin role<br>• Check project and region permissions |
| **Service creation failure** | • Check CloudBuild and Cloud Run quotas<br>• Verify service name follows GCP naming conventions |
| **"Image not found" error** | • Ensure the image path is correct<br>• Check that the image was successfully pushed to Container Registry<br>• Verify the image tag is correct |

## Runtime Issues

### Application Startup Problems

| Problem | Solution |
|---------|----------|
| **Container fails to start** | • Check container logs: `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eyewear-ml-staging"`<br>• Verify entrypoint script permissions (`chmod +x scripts/entrypoint.sh`)<br>• Check for any crashloops in the application |
| **"Port 8080 not listening" error** | • Ensure your app listens on the port specified in deployment<br>• Check your application startup logs<br>• Verify port configuration in any framework-specific settings |
| **Timeout during startup** | • Check for slow initialization code<br>• Consider increasing memory allocation<br>• Optimize ML model loading |

### Environment Issues

| Problem | Solution |
|---------|----------|
| **Missing environment variables** | • Check environment variable configuration in the Cloud Run console<br>• Verify variables were set during deployment<br>• Check for typos in variable names |
| **Secret value not available** | • Verify Secret Manager permissions<br>• Check secret version is correct<br>• Ensure secret binding is correct in the deployment |
| **GCP credential issues** | • Check `GOOGLE_APPLICATION_CREDENTIALS` is set<br>• Verify service account has necessary permissions<br>• Check if credentials file exists and is valid |

## Connectivity Issues

### Database Connection Problems

| Problem | Solution |
|---------|----------|
| **Can't connect to MongoDB** | • Check MongoDB connection string<br>• Verify MongoDB is running and accessible<br>• Check if VPC connector is required<br>• Ensure IP is allowlisted |
| **Redis connection fails** | • Verify Redis connection parameters<br>• Check Redis SSL setting<br>• Ensure Redis password is correct |
| **Connection timeouts** | • Check network settings and firewall rules<br>• Verify VPC connector configuration<br>• Consider increasing connection timeout values |

### API Access Issues

| Problem | Solution |
|---------|----------|
| **DeepSeek API key not working** | • Verify the API key is correct<br>• Check API key permissions<br>• Ensure key is not expired |
| **"Unauthorized" accessing GCP resources** | • Check service account permissions<br>• Verify correct bucket/project access<br>• Ensure IAM roles are correct |
| **External API calls failing** | • Check network connectivity from Cloud Run<br>• Verify API endpoints and authentication<br>• Look for quota limits |

## Performance Issues

| Problem | Solution |
|---------|----------|
| **Service is slow** | • Check CPU/memory allocation<br>• Consider increasing resources<br>• Look for bottlenecks in application code |
| **Cold start issues** | • Configure minimum instances > 0<br>• Optimize container size and startup<br>• Consider Cloud Run CPU always allocated |
| **Memory errors** | • Increase memory allocation<br>• Check for memory leaks<br>• Optimize ML model memory usage |

## Security Issues

| Problem | Solution |
|---------|----------|
| **TLS certificate errors** | • Verify certificate validity<br>• Check domain configuration<br>• Ensure certificate is properly installed |
| **CORS issues** | • Verify ALLOWED_ORIGINS in configuration<br>• Check CORS headers in responses<br>• Test with specific origins |
| **Authentication failures** | • Check JWT secret configuration<br>• Verify token settings<br>• Ensure auth middleware is properly configured |

## Debugging Commands

### View Service Information

```bash
# Get detailed information about the service
gcloud run services describe eyewear-ml-staging \
  --platform managed \
  --region us-central1
```

### Check Logs

```bash
# View general application logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eyewear-ml-staging" \
  --limit 50

# Filter for error logs only
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eyewear-ml-staging AND severity>=ERROR" \
  --limit 20

# Look for specific error patterns
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eyewear-ml-staging AND textPayload:'connection error'" \
  --limit 20
```

### Check Container Image

```bash
# List available container images
gcloud container images list-tags gcr.io/commerce-studio/eyewear-ml

# Get image details
gcloud container images describe gcr.io/commerce-studio/eyewear-ml:staging
```

## Getting Further Help

If you've tried the troubleshooting steps above and still encounter issues:

1. **Check GCP Status**: Verify there are no ongoing GCP service disruptions at [GCP Status Dashboard](https://status.cloud.google.com/)

2. **Internal Support**: 
   - Post in the #eyewear-ml-devops Slack channel
   - Include logs, error messages, and steps to reproduce

3. **GCP Support**: If you have support package, open a case with Google Cloud Support

4. **Documentation Resources**:
   - [Cloud Run Documentation](https://cloud.google.com/run/docs)
   - [Cloud Run Troubleshooting](https://cloud.google.com/run/docs/troubleshooting)
   - [Container Registry Troubleshooting](https://cloud.google.com/container-registry/docs/troubleshooting)
