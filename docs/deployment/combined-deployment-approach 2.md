# Combined Deployment Approach

This document provides a comprehensive approach that combines:
1. Setting up GitHub secrets using GitHub CLI
2. Implementing the single command deployment
3. Creating and testing the GitHub Actions workflow

## Step 1: Set Up GitHub Secrets

First, let's set up the necessary GitHub secrets for the GitHub Actions workflow:

```bash
# Set variables
PROJECT_ID="ml-datadriven-recos"
REPO="your-username/eyewear-ml"  # Replace with your actual repository

# Create service account
gcloud iam service-accounts create github-actions-runner \
  --display-name="GitHub Actions Runner"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-runner@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-runner@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-runner@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download service account key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions-runner@$PROJECT_ID.iam.gserviceaccount.com

# Add secrets to GitHub repository
gh secret set GCP_SA_KEY --repo $REPO < github-actions-key.json
gh secret set GCP_PROJECT_ID --repo $REPO -b "$PROJECT_ID"

# Verify secrets were added
gh secret list --repo $REPO

# Clean up local key file
rm github-actions-key.json
```

## Step 2: Implement Single Command Deployment

Now, let's create and test the single command deployment script:

```bash
# Create the deployment script
cat > deploy-to-cloud-run-simple.sh << 'EOL'
#!/bin/bash
# Simple Cloud Run Deployment Script
# This script uses the simplified gcloud run deploy command with --source flag

# Configuration
PROJECT_ID="ml-datadriven-recos"  # Google Cloud project ID
REGION="us-central1"              # Google Cloud region
API_SERVICE_NAME="eyewear-ml-api" # API Cloud Run service name
FRONTEND_SERVICE_NAME="eyewear-ml-frontend" # Frontend Cloud Run service name

# Check for test mode
if [ "$1" == "--test" ]; then
    echo "Running in test mode - will not deploy to Cloud Run"
    TEST_MODE=true
else
    TEST_MODE=false
fi

# Step 1: Authenticate with Google Cloud (if not already authenticated)
echo "Checking Google Cloud authentication status..."
AUTH_STATUS=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
if [ -z "$AUTH_STATUS" ]; then
    echo "Not authenticated with Google Cloud. Please log in."
    gcloud auth login
else
    echo "Already authenticated as: $AUTH_STATUS"
fi

# Step 2: Set the Google Cloud project
echo "Setting Google Cloud project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Step 3: Deploy API to Cloud Run directly from source
echo -e "\n============================================="
echo "STARTING BACKEND API DEPLOYMENT"
echo -e "=============================================\n"

if [ "$TEST_MODE" == "false" ]; then
    echo "Deploying API to Cloud Run as service: $API_SERVICE_NAME"
    gcloud run deploy $API_SERVICE_NAME \
        --source . \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --port 8000 \
        --memory 2Gi \
        --min-instances 0 \
        --max-instances 10 \
        --cpu 1
else
    echo "[TEST MODE] Would deploy API to Cloud Run as service: $API_SERVICE_NAME"
fi

# Step 4: Get the deployed API service URL
if [ "$TEST_MODE" == "false" ]; then
    echo "API Deployment complete! Getting service URL..."
    API_SERVICE_URL=$(gcloud run services describe $API_SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
    echo "API service deployed successfully at: $API_SERVICE_URL"

    # Step 5: Test the health endpoint
    echo "Testing the API health endpoint..."
    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_SERVICE_URL/api/v1/health)
    if [ "$HEALTH_STATUS" == "200" ]; then
        echo "Health check successful!"
    else
        echo "Health check failed! Status code: $HEALTH_STATUS"
    fi
else
    echo "[TEST MODE] Would get API service URL and test health endpoint"
    API_SERVICE_URL="https://test-api-url.a.run.app"
fi

# Step 6: Deploy Frontend to Cloud Run directly from source
echo -e "\n============================================="
echo "STARTING FRONTEND DEPLOYMENT"
echo -e "=============================================\n"

if [ "$TEST_MODE" == "false" ]; then
    echo "Deploying Frontend to Cloud Run as service: $FRONTEND_SERVICE_NAME"
    gcloud run deploy $FRONTEND_SERVICE_NAME \
        --source ./frontend \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --port 80 \
        --memory 1Gi \
        --min-instances 0 \
        --max-instances 5 \
        --cpu 1 \
        --set-env-vars="API_SERVICE_URL=$API_SERVICE_URL"
else
    echo "[TEST MODE] Would deploy Frontend to Cloud Run as service: $FRONTEND_SERVICE_NAME"
fi

# Step 7: Get the deployed Frontend service URL
if [ "$TEST_MODE" == "false" ]; then
    echo "Frontend Deployment complete! Getting service URL..."
    FRONTEND_SERVICE_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
    echo "Frontend service deployed successfully at: $FRONTEND_SERVICE_URL"
else
    echo "[TEST MODE] Would get Frontend service URL"
    FRONTEND_SERVICE_URL="https://test-frontend-url.a.run.app"
fi

# Step 8: Display summary
echo -e "\n============================================="
echo "DEPLOYMENT SUMMARY"
echo "============================================="
echo "API Service URL: $API_SERVICE_URL"
echo "Frontend Service URL: $FRONTEND_SERVICE_URL"
echo "============================================="

# Step 9: Display browser access information
echo "You can access the deployed frontend at: $FRONTEND_SERVICE_URL"
echo "Open this URL in your browser to view the application"
EOL

# Make the script executable
chmod +x deploy-to-cloud-run-simple.sh

# Test the script in test mode
./deploy-to-cloud-run-simple.sh --test
```

## Step 3: Set Up GitHub Actions Workflow

Now, let's create and set up the GitHub Actions workflow:

```bash
# Create the workflow directory
mkdir -p .github/workflows

# Create the workflow file
cat > .github/workflows/cloud-run-deploy.yml << 'EOL'
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
EOL
```

## Step 4: Commit and Create PR

Let's commit these changes and create a PR:

```bash
# Create a new branch
git checkout -b cloud-run-deployment-improvements

# Add the files
git add deploy-to-cloud-run-simple.sh
git add .github/workflows/cloud-run-deploy.yml
git add cloud-run-deployment-plan.md
git add simple-deployment-script.md
git add github-actions-workflow.md
git add deployment-implementation-plan.md
git add deployment-process-diagrams.md
git add cloud-run-deployment-pr.md
git add post-merge-implementation-guide.md
git add implementation-checklist.md
git add github-cli-secrets-setup.md
git add combined-deployment-approach.md

# Commit the changes
git commit -m "Add Cloud Run deployment improvements"

# Push the branch
git push -u origin cloud-run-deployment-improvements

# Create a PR using GitHub CLI
gh pr create --title "Cloud Run Deployment Improvements" --body-file cloud-run-deployment-pr.md
```

## Step 5: Test the Deployment

After the PR is merged, you can test both deployment approaches:

### Test Single Command Deployment

```bash
# Run the deployment script
./deploy-to-cloud-run-simple.sh
```

### Test GitHub Actions Workflow

```bash
# Trigger the workflow manually
gh workflow run cloud-run-deploy.yml --ref main

# Monitor the workflow
gh run list --workflow=cloud-run-deploy.yml
gh run watch $(gh run list --workflow=cloud-run-deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')
```

## Step 6: Monitor and Maintain

Set up monitoring for your deployments:

```bash
# Create a log-based metric for deployment failures
gcloud logging metrics create cloud-run-deployment-failures \
  --description="Count of Cloud Run deployment failures" \
  --log-filter="resource.type=cloud_run_revision AND textPayload:\"failed to deploy\""

# Create an alert policy (replace CHANNEL_ID with your notification channel ID)
gcloud alpha monitoring policies create \
  --display-name="Cloud Run Deployment Failures" \
  --condition-filter="metric.type=\"logging.googleapis.com/user/cloud-run-deployment-failures\" AND resource.type=\"cloud_run_revision\"" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=60s \
  --notification-channels="projects/$PROJECT_ID/notificationChannels/CHANNEL_ID"
```

## Conclusion

This combined approach provides a comprehensive solution for deploying to Cloud Run:

1. **GitHub Secrets**: Set up using GitHub CLI for secure credential management
2. **Single Command Deployment**: Quick and easy manual deployments
3. **GitHub Actions Workflow**: Automated CI/CD integration
4. **Monitoring**: Proactive alerts for deployment issues

By implementing this approach, you'll significantly streamline your deployment process, reduce manual effort, and enable automated CI/CD integration.