# Cloud Run Deployment Plan

This plan outlines two streamlined approaches for deploying our application to Google Cloud Run:

1. **Single Command Deployment** - For quick manual deployments
2. **GitHub Actions Workflow** - For automated CI/CD integration

## 1. Single Command Deployment

The `gcloud run deploy` command with the `--source` flag provides a one-step solution that:
- Builds your container using Cloud Build
- Pushes it to Artifact Registry
- Deploys it to Cloud Run

### Implementation Steps

1. **Ensure you have the latest Google Cloud SDK installed**

2. **Authenticate with Google Cloud**
   ```bash
   gcloud auth login
   gcloud config set project ml-datadriven-recos
   ```

3. **Deploy API with a single command**
   ```bash
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

4. **Deploy Frontend with a single command**
   ```bash
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
     --set-env-vars="API_SERVICE_URL=$(gcloud run services describe eyewear-ml-api --platform managed --region us-central1 --format 'value(status.url)')"
   ```

### Benefits
- No need to manually build Docker images
- No need to manually push to container registry
- Simplified deployment process
- Uses Cloud Build behind the scenes

## 2. GitHub Actions Workflow

This approach automates the deployment process whenever code is pushed to specific branches.

### Implementation Steps

1. **Create a service account for GitHub Actions**
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
   ```

2. **Create and download a service account key**
   ```bash
   gcloud iam service-accounts keys create key.json \
     --iam-account=github-actions-runner@ml-datadriven-recos.iam.gserviceaccount.com
   ```

3. **Add the key as a GitHub secret**
   - Go to your GitHub repository
   - Navigate to Settings > Secrets > New repository secret
   - Create a secret named `GCP_SA_KEY` with the contents of the key.json file
   - Create another secret named `GCP_PROJECT_ID` with the value `ml-datadriven-recos`

4. **Create GitHub Actions workflow file**
   Create a file at `.github/workflows/cloud-run-deploy.yml` with the following content:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main
      - production
    paths:
      - 'src/**'
      - 'frontend/**'
      - 'Dockerfile'
      - 'frontend/Dockerfile'
      - '.github/workflows/cloud-run-deploy.yml'

jobs:
  deploy-api:
    name: Deploy API
    runs-on: ubuntu-latest
    if: "contains(github.event.head_commit.message, '[deploy-api]') || github.ref == 'refs/heads/production'"
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          
      - name: Deploy to Cloud Run
        run: |
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

  deploy-frontend:
    name: Deploy Frontend
    runs-on: ubuntu-latest
    if: "contains(github.event.head_commit.message, '[deploy-frontend]') || github.ref == 'refs/heads/production'"
    needs: deploy-api
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          
      - name: Get API URL
        id: get-api-url
        run: |
          API_URL=$(gcloud run services describe eyewear-ml-api --platform managed --region us-central1 --format 'value(status.url)')
          echo "API_URL=$API_URL" >> $GITHUB_ENV
          
      - name: Deploy to Cloud Run
        run: |
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
            --set-env-vars="API_SERVICE_URL=${{ env.API_URL }}"
```

### Usage

With this GitHub Actions workflow:

1. **Automatic Deployment**: 
   - The API will deploy when you push to main with `[deploy-api]` in the commit message
   - The frontend will deploy when you push to main with `[deploy-frontend]` in the commit message
   - Both will deploy when you push to the production branch

2. **Manual Trigger**:
   - You can also manually trigger the workflow from the GitHub Actions tab

### Benefits
- Fully automated deployments
- Triggered by code changes
- No need to run deployment commands locally
- Consistent deployment environment
- Deployment history and logs in GitHub

## Comparison with Current Approach

| Feature | Current Scripts | Single Command | GitHub Actions |
|---------|----------------|----------------|----------------|
| Automation | Semi-automated | Manual but simple | Fully automated |
| Steps Required | Multiple | Single command | Git push |
| Local Dependencies | Docker, gcloud | gcloud only | None |
| CI/CD Integration | No | No | Yes |
| Deployment History | No | No | Yes |
| Complexity | High | Low | Medium (setup) |

## Recommendation

1. Use the **Single Command Deployment** for development and testing
2. Implement the **GitHub Actions Workflow** for production deployments

This combination provides both flexibility for quick deployments during development and reliability for production releases.