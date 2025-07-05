# Google Cloud Run Deployment Guide

This guide provides general information about deploying applications to Google Cloud Run, focusing on best practices and common patterns for the EyewearML project.

## What is Cloud Run?

Cloud Run is a managed compute platform that enables you to run containers directly on top of Google's scalable infrastructure. It automatically scales up or down from zero depending on traffic, so you only pay for the resources you use.

## When to Use Cloud Run

Cloud Run is ideal for:

- HTTP-based services or APIs
- Web applications
- Background processing tasks with HTTP triggers
- Event-driven applications (via Cloud Pub/Sub, Cloud Tasks, etc.)
- Microservices architecture

## Advantages for EyewearML

For the EyewearML project, Cloud Run offers several advantages:

1. **Cost Efficiency**: Pay only for what you use with per-100ms billing
2. **Auto-scaling**: Automatically handles traffic spikes
3. **Zero Maintenance**: No infrastructure management overhead
4. **Integration**: Seamless integration with other GCP services
5. **Deployment Simplicity**: Simple container-based deployment model

## Architecture Patterns

### Basic Web Application

```
Client → Cloud Run → Database → Storage
```

### Microservices Architecture

```
Client → API Gateway → Cloud Run Services → Databases/Storage
                          ↑
                     Event Triggers
```

### ML Inference Architecture

```
Client → Cloud Run API → ML Model Container → Results
                             ↑
                       Model Storage
```

## Container Requirements

To work well with Cloud Run, containers should:

1. **Listen on PORT environment variable** (defaults to 8080)
2. **Handle HTTP requests**
3. **Be stateless** (store persistent data externally)
4. **Gracefully handle termination signals**
5. **Start quickly** (ideally under 2-3 seconds)

## Security Best Practices

### Service Identity

Always use service accounts with the principle of least privilege:

```bash
# Create service account
gcloud iam service-accounts create cloud-run-sa \
  --display-name="Cloud Run Service Account"

# Assign only needed permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:cloud-run-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"
```

### Secret Management

Use Secret Manager for sensitive configuration:

```bash
# Create secret
gcloud secrets create API_KEY --data-file=./api_key.txt

# Access secret in Cloud Run
gcloud run services update SERVICE_NAME \
  --update-secrets=API_KEY=API_KEY:latest
```

### Private Services

For internal services, consider making them private:

```bash
# Deploy private service
gcloud run deploy SERVICE_NAME \
  --image IMAGE_URL \
  --no-allow-unauthenticated
```

## Performance Optimization

### Memory and CPU Allocation

Choose appropriate resources for your workload:

```bash
# For ML inference with medium models
gcloud run deploy SERVICE_NAME \
  --image IMAGE_URL \
  --memory 2Gi \
  --cpu 2
```

### Instance Settings

Control scaling behavior:

```bash
# For stable performance with known traffic patterns
gcloud run deploy SERVICE_NAME \
  --image IMAGE_URL \
  --min-instances 1 \
  --max-instances 10
```

### Container Optimization

- Use multi-stage Docker builds
- Remove unnecessary dependencies
- Leverage build caching
- Consider distroless base images

## Integration with Other GCP Services

### Cloud SQL

Connect to managed databases:

```bash
# Deploy with SQL connection
gcloud run deploy SERVICE_NAME \
  --image IMAGE_URL \
  --add-cloudsql-instances=INSTANCE_CONNECTION_NAME
```

### VPC Connector

Access resources in your VPC:

```bash
# Create VPC connector
gcloud compute networks vpc-access connectors create CONNECTOR_NAME \
  --region=REGION \
  --network=default \
  --range=10.8.0.0/28

# Use VPC connector
gcloud run deploy SERVICE_NAME \
  --image IMAGE_URL \
  --vpc-connector=CONNECTOR_NAME
```

### Cloud Storage

Integrate with object storage:

```bash
# Grant storage access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/storage.objectUser"
```

## CI/CD Integration

### GitHub Actions

Example workflow:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup GCloud
        uses: google-github-actions/setup-gcloud@v0
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          
      - name: Build and push image
        run: |
          gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/SERVICE_NAME
          
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy SERVICE_NAME \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/SERVICE_NAME \
            --region us-central1 \
            --platform managed
```

### Cloud Build

Example cloudbuild.yaml:

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/SERVICE_NAME', '.']
  
  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/SERVICE_NAME']
  
  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
    - 'run'
    - 'deploy'
    - 'SERVICE_NAME'
    - '--image'
    - 'gcr.io/$PROJECT_ID/SERVICE_NAME'
    - '--region'
    - 'us-central1'
    - '--platform'
    - 'managed'

images:
  - 'gcr.io/$PROJECT_ID/SERVICE_NAME'
```

## Cost Management

### Controlling Costs

1. **Adjust Concurrency**: Higher concurrency means fewer instances but higher latency
   ```bash
   gcloud run services update SERVICE_NAME --concurrency=80
   ```

2. **CPU Allocation**: Only use CPU always allocated when necessary
   ```bash
   gcloud run services update SERVICE_NAME --cpu=1 --cpu-always-allocated
   ```

3. **Request-based Scaling**: Monitor and adjust max-instances based on traffic patterns
   ```bash
   gcloud run services update SERVICE_NAME --max-instances=5
   ```

4. **Idle Instances**: Set min-instances=0 for infrequently used services

## Monitoring and Logging

### Recommended Metrics

- Request Count
- Response Latencies
- Container Instance Count
- Memory Utilization
- CPU Utilization

### Setting Up Alerting

```bash
# Create alert policy for high error rate
gcloud alpha monitoring policies create \
  --display-name="Cloud Run Error Rate" \
  --condition-filter="resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"SERVICE_NAME\" AND metric.type=\"run.googleapis.com/request_count\" AND metric.labels.response_code_class=\"4xx\"" \
  --condition-threshold-value=5 \
  --condition-threshold-duration=300s \
  --notification-channels="projects/PROJECT_ID/notificationChannels/CHANNEL_ID"
```

### Log Analysis

```bash
# View error logs and create log-based metrics
gcloud logging metrics create cloud-run-errors \
  --description="Count of Cloud Run errors" \
  --log-filter="resource.type=cloud_run_revision AND resource.labels.service_name=SERVICE_NAME AND severity>=ERROR"
```

## References

- [Official Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run vs App Engine vs Cloud Functions](https://cloud.google.com/blog/products/serverless/cloud-run-vs-cloud-functions-vs-app-engine)
- [Container Runtime Contract](https://cloud.google.com/run/docs/container-contract)
- [Google Buildpacks](https://github.com/GoogleCloudPlatform/buildpacks)
