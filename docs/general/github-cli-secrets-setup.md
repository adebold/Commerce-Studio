# Setting Up GitHub Secrets Using GitHub CLI

This guide provides instructions for using the GitHub CLI to set up the necessary secrets for the Cloud Run deployment workflow.

## Prerequisites

1. Install the GitHub CLI if you haven't already:
   ```bash
   # For Windows (using winget)
   winget install GitHub.cli

   # For macOS
   brew install gh

   # For Ubuntu/Debian
   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
   sudo apt update
   sudo apt install gh
   ```

2. Authenticate with GitHub:
   ```bash
   gh auth login
   ```

3. Install the Google Cloud SDK if you haven't already:
   ```bash
   # Follow instructions at https://cloud.google.com/sdk/docs/install
   ```

## Step 1: Create Service Account and Key

```bash
# Create a service account for GitHub Actions
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

## Step 2: Add Secrets to GitHub Repository Using GitHub CLI

```bash
# Set the repository variable (replace with your actual repository)
REPO="your-username/eyewear-ml"

# Add the GCP_SA_KEY secret (service account key)
gh secret set GCP_SA_KEY --repo $REPO < github-actions-key.json

# Add the GCP_PROJECT_ID secret
gh secret set GCP_PROJECT_ID --repo $REPO -b "ml-datadriven-recos"
```

## Step 3: Verify Secrets Were Added

```bash
# List all secrets in the repository
gh secret list --repo $REPO
```

You should see both `GCP_SA_KEY` and `GCP_PROJECT_ID` in the list.

## Step 4: Clean Up Local Key File

For security reasons, remove the local key file after adding it to GitHub:

```bash
# Securely delete the key file
rm github-actions-key.json
```

## Step 5: Create the GitHub Actions Workflow File

```bash
# Create the directory structure if it doesn't exist
mkdir -p .github/workflows

# Create the workflow file
gh workflow create .github/workflows/cloud-run-deploy.yml
```

When prompted, paste the content from the `github-actions-workflow.md` file.

Alternatively, you can create the file directly:

```bash
# Create the directory structure
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

## Step 6: Commit and Push the Workflow File

```bash
# Create a new branch
git checkout -b add-github-actions-workflow

# Add the workflow file
git add .github/workflows/cloud-run-deploy.yml

# Commit the changes
git commit -m "Add GitHub Actions workflow for Cloud Run deployment"

# Push the branch
git push -u origin add-github-actions-workflow

# Create a pull request
gh pr create --title "Add GitHub Actions workflow for Cloud Run deployment" --body "This PR adds a GitHub Actions workflow for automated deployment to Cloud Run."
```

## Step 7: Test the Workflow

After the PR is merged, you can manually trigger the workflow:

```bash
# Trigger the workflow
gh workflow run cloud-run-deploy.yml --ref main
```

You can also monitor the workflow execution:

```bash
# List workflow runs
gh run list --workflow=cloud-run-deploy.yml

# View the latest run
gh run view $(gh run list --workflow=cloud-run-deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')

# Watch the latest run
gh run watch $(gh run list --workflow=cloud-run-deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')
```

## Security Considerations

1. **Service Account Key**: The service account key is a sensitive credential. Make sure to:
   - Never commit it to your repository
   - Delete the local copy after adding it as a secret
   - Rotate the key periodically (recommended every 90 days)

2. **Principle of Least Privilege**: The service account should only have the permissions it needs to deploy to Cloud Run. Review the roles assigned to ensure they follow the principle of least privilege.

3. **Secret Rotation**: Set up a process to rotate the service account key periodically.

## Troubleshooting

If you encounter issues with the GitHub CLI:

1. **Authentication Issues**:
   ```bash
   gh auth status
   # If needed, re-authenticate
   gh auth login
   ```

2. **Permission Issues**:
   ```bash
   # Ensure you have admin access to the repository
   gh repo view $REPO --json viewerPermission
   ```

3. **Service Account Issues**:
   ```bash
   # List service accounts
   gcloud iam service-accounts list
   
   # Verify permissions
   gcloud projects get-iam-policy ml-datadriven-recos \
     --flatten="bindings[].members" \
     --format="table(bindings.role)" \
     --filter="bindings.members:github-actions-runner@ml-datadriven-recos.iam.gserviceaccount.com"