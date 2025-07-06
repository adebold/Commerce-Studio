# GitHub Actions Workflow for Cloud Run Deployment

This document provides the GitHub Actions workflow configuration for automating deployments to Google Cloud Run.

## Workflow File

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
  workflow_dispatch:
    inputs:
      deploy_api:
        description: 'Deploy API'
        type: boolean
        default: true
      deploy_frontend:
        description: 'Deploy Frontend'
        type: boolean
        default: true

jobs:
  deploy-api:
    name: Deploy API
    runs-on: ubuntu-latest
    if: |
      (github.event_name == 'workflow_dispatch' && inputs.deploy_api) ||
      (github.event_name == 'push' && (contains(github.event.head_commit.message, '[deploy-api]') || github.ref == 'refs/heads/production'))
    
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
    if: |
      (github.event_name == 'workflow_dispatch' && inputs.deploy_frontend) ||
      (github.event_name == 'push' && (contains(github.event.head_commit.message, '[deploy-frontend]') || github.ref == 'refs/heads/production'))
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

## Setup Instructions

### 1. Create a Service Account for GitHub Actions

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

### 2. Create and Download a Service Account Key

```bash
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions-runner@ml-datadriven-recos.iam.gserviceaccount.com
```

### 3. Add the Key as a GitHub Secret

1. Go to your GitHub repository
2. Navigate to Settings > Secrets > New repository secret
3. Create a secret named `GCP_SA_KEY` with the contents of the key.json file
4. Create another secret named `GCP_PROJECT_ID` with the value `ml-datadriven-recos`

### 4. Create the Workflow File

Create the directory structure and file:

```bash
mkdir -p .github/workflows
touch .github/workflows/cloud-run-deploy.yml
```

Then copy the workflow YAML content from above into this file.

## Usage

### Automatic Deployments

The workflow will automatically run when:

1. You push to the `main` branch with `[deploy-api]` in the commit message (deploys API only)
2. You push to the `main` branch with `[deploy-frontend]` in the commit message (deploys frontend only)
3. You push to the `production` branch (deploys both API and frontend)

Example commit:

```bash
git commit -m "Updated API endpoints [deploy-api]"
git push origin main
```

### Manual Deployments

You can also manually trigger the workflow:

1. Go to your GitHub repository
2. Navigate to Actions > Deploy to Cloud Run
3. Click "Run workflow"
4. Select which components to deploy (API, Frontend, or both)
5. Click "Run workflow"

## Benefits

- Fully automated deployments
- Triggered by code changes or manually
- No need to run deployment commands locally
- Consistent deployment environment
- Deployment history and logs in GitHub
- Selective deployment of components