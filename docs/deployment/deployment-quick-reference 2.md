# Cloud Run Deployment Quick Reference

This quick reference guide provides the most common commands and scenarios for deploying to Cloud Run using both the single command approach and GitHub Actions.

## Single Command Deployment

### Deploy API Only

```bash
# Deploy API to Cloud Run
gcloud run deploy eyewear-ml-api \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8000 \
  --memory 2Gi \
  --min-instances 0 \
  --max-instances 10 \
  --cpu 1
```

### Deploy Frontend Only

```bash
# Get API URL
API_URL=$(gcloud run services describe eyewear-ml-api --platform managed --region us-central1 --format 'value(status.url)')

# Deploy Frontend to Cloud Run
gcloud run deploy eyewear-ml-frontend \
  --source ./frontend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 80 \
  --memory 1Gi \
  --min-instances 0 \
  --max-instances 5 \
  --cpu 1 \
  --set-env-vars="API_SERVICE_URL=$API_URL"
```

### Deploy Both Using Script

```bash
# Run the deployment script
./deploy-to-cloud-run-simple.sh

# Run in test mode (no actual deployment)
./deploy-to-cloud-run-simple.sh --test
```

## GitHub Actions Workflow

### Trigger Workflow Manually

```bash
# Trigger workflow with default options (both API and Frontend)
gh workflow run cloud-run-deploy.yml --ref main

# Trigger workflow with specific options
gh workflow run cloud-run-deploy.yml --ref main -f deploy_api=true -f deploy_frontend=false
```

### Monitor Workflow Execution

```bash
# List recent workflow runs
gh run list --workflow=cloud-run-deploy.yml

# View details of the latest run
gh run view $(gh run list --workflow=cloud-run-deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')

# Watch the latest run in real-time
gh run watch $(gh run list --workflow=cloud-run-deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')
```

### Trigger Deployment via Commit

```bash
# Deploy API only
git commit -m "Update API endpoint [deploy-api]"
git push origin main

# Deploy Frontend only
git commit -m "Update frontend styling [deploy-frontend]"
git push origin main

# Deploy both (by pushing to production branch)
git checkout production
git merge main
git push origin production
```

## GitHub Secrets Management

### Add or Update Secrets

```bash
# Set the repository variable
REPO="your-username/eyewear-ml"

# Add/update the GCP_SA_KEY secret
gh secret set GCP_SA_KEY --repo $REPO < path/to/service-account-key.json

# Add/update the GCP_PROJECT_ID secret
gh secret set GCP_PROJECT_ID --repo $REPO -b "ml-datadriven-recos"
```

### List Secrets

```bash
# List all secrets in the repository
gh secret list --repo $REPO
```

## Service Account Management

### Create Service Account and Key

```bash
# Create service account
gcloud iam service-accounts create github-actions-runner \
  --display-name="GitHub Actions Runner"

# Grant necessary permissions
gcloud projects add-iam-policy-binding ml-datadriven-recos \
  --member="serviceAccount:github-actions-runner@ml-datadriven-recos.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding ml-datadriven-recos \
  --member="serviceAccount:github-actions-runner@ml-datadriven-recos.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding ml-datadriven-recos \
  --member="serviceAccount:github-actions-runner@ml-datadriven-recos.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download a service account key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions-runner@ml-datadriven-recos.iam.gserviceaccount.com
```

### Rotate Service Account Key

```bash
# List existing keys
gcloud iam service-accounts keys list \
  --iam-account=github-actions-runner@ml-datadriven-recos.iam.gserviceaccount.com

# Create new key
gcloud iam service-accounts keys create new-github-actions-key.json \
  --iam-account=github-actions-runner@ml-datadriven-recos.iam.gserviceaccount.com

# Update GitHub secret with new key
gh secret set GCP_SA_KEY --repo $REPO < new-github-actions-key.json

# Delete old key (replace KEY_ID with the ID of the old key)
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=github-actions-runner@ml-datadriven-recos.iam.gserviceaccount.com

# Clean up local key file
rm new-github-actions-key.json
```

## Monitoring and Troubleshooting

### View Service Status

```bash
# Get API service status
gcloud run services describe eyewear-ml-api \
  --platform managed \
  --region us-central1

# Get Frontend service status
gcloud run services describe eyewear-ml-frontend \
  --platform managed \
  --region us-central1
```

### View Logs

```bash
# View API logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eyewear-ml-api" \
  --limit 50 \
  --format json

# View Frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eyewear-ml-frontend" \
  --limit 50 \
  --format json
```

### Test Endpoints

```bash
# Test API health endpoint
curl -s "$(gcloud run services describe eyewear-ml-api --platform managed --region us-central1 --format 'value(status.url)')/api/v1/health"

# Open Frontend in browser
open "$(gcloud run services describe eyewear-ml-frontend --platform managed --region us-central1 --format 'value(status.url)')"
```

## Common Scenarios

### First-time Setup

1. Create service account and key
2. Add GitHub secrets
3. Create workflow file
4. Test deployment

### Regular Deployment

1. Make code changes
2. Commit with appropriate tag (`[deploy-api]` or `[deploy-frontend]`)
3. Push to main branch
4. Monitor workflow execution

### Emergency Rollback

```bash
# List revisions
gcloud run revisions list --service=eyewear-ml-api --region=us-central1 --platform=managed

# Roll back to a specific revision
gcloud run services update-traffic eyewear-ml-api \
  --region=us-central1 \
  --platform=managed \
  --to-revisions=REVISION_NAME=100
```

### Scaling Configuration

```bash
# Update scaling configuration
gcloud run services update eyewear-ml-api \
  --region=us-central1 \
  --platform=managed \
  --min-instances=1 \
  --max-instances=20 \
  --concurrency=80
```

## Reference Documentation

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [gcloud run deploy](https://cloud.google.com/sdk/gcloud/reference/run/deploy)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub CLI Documentation](https://cli.github.com/manual/)