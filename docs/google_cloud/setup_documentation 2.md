# Google Cloud Project Setup Documentation

This document provides comprehensive instructions for setting up the Google Cloud project environment for the EyewearML Conversational AI system. Follow these steps in sequence to establish the foundation for the conversational AI implementation.

## Prerequisites

Before beginning the setup process, ensure you have:

1. A Google Cloud account with administrative privileges
2. Billing account access to create new projects and set up billing
3. The Google Cloud SDK installed on your local machine
4. Required permissions to create and manage IAM roles
5. Access to the configuration files in `/config/google_cloud/`

## Step 1: Create Google Cloud Project

### Using Google Cloud Console

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project selector dropdown at the top of the page
3. Click on "New Project"
4. Enter the project details:
   - Name: `eyewearml-conversational-ai` (as specified in `project_config.yaml`)
   - Organization: Select your organization from the dropdown
   - Location: Select the appropriate folder if applicable
5. Click "Create"

### Using Google Cloud SDK

```bash
# Set environment variables
export PROJECT_ID="eyewearml-conversational-ai"
export PROJECT_NAME="EyewearML Conversational AI"
export ORGANIZATION_ID="your-organization-id"  # Replace with actual organization ID

# Create the project
gcloud projects create $PROJECT_ID \
    --name="$PROJECT_NAME" \
    --organization=$ORGANIZATION_ID
```

## Step 2: Set Up Billing

1. Navigate to the [Billing page](https://console.cloud.google.com/billing) in Google Cloud Console
2. Select the newly created project
3. Click "Link a billing account"
4. Select the appropriate billing account
5. Click "Set account"

```bash
# Link billing account using gcloud
export BILLING_ACCOUNT_ID="your-billing-account-id"  # Replace with actual billing account ID

gcloud billing projects link $PROJECT_ID \
    --billing-account=$BILLING_ACCOUNT_ID
```

## Step 3: Configure Budget Alerts

1. Navigate to the [Budgets & Alerts page](https://console.cloud.google.com/billing/budgets) in Google Cloud Console
2. Click "Create Budget"
3. Set up the primary budget alert as defined in `budget_alerts.yaml`
4. Create additional service-specific and environment-specific budgets

```bash
# Example command to create a budget using the gcloud beta billing budgets command
# Note: This requires the gcloud beta components to be installed

gcloud beta billing budgets create \
    --billing-account=$BILLING_ACCOUNT_ID \
    --display-name="EyewearML Conversational AI Monthly Budget" \
    --budget-amount=1000USD \
    --threshold-rule=percent=50,basis=current-spend \
    --threshold-rule=percent=75,basis=current-spend \
    --threshold-rule=percent=90,basis=current-spend \
    --threshold-rule=percent=100,basis=current-spend
```

## Step 4: Enable Required APIs

Enable all required APIs as specified in the `project_config.yaml` file:

```bash
# Enable required APIs
gcloud services enable dialogflow.googleapis.com
gcloud services enable language.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable firestore.googleapis.com
```

Alternatively, you can use the Google Cloud Console:

1. Navigate to the [APIs & Services Dashboard](https://console.cloud.google.com/apis/dashboard)
2. Click "Enable APIs and Services"
3. Search for each API listed in the `project_config.yaml` file
4. Click on each API and click "Enable"

## Step 5: Create Service Accounts

Create service accounts as defined in the `service_accounts.yaml` file:

```bash
# Function to create a service account with description
create_service_account() {
  local name=$1
  local display_name=$2
  local description=$3
  
  gcloud iam service-accounts create $name \
    --display-name="$display_name" \
    --description="$description"
}

# Create development service account
create_service_account "conversational-ai-dev" \
  "Conversational AI Development Service Account" \
  "Service account for development environment of the Conversational AI system"

# Create testing service account
create_service_account "conversational-ai-test" \
  "Conversational AI Testing Service Account" \
  "Service account for testing environment of the Conversational AI system"

# Create production service account
create_service_account "conversational-ai-prod" \
  "Conversational AI Production Service Account" \
  "Service account for production environment of the Conversational AI system"

# Create CI/CD service account
create_service_account "conversational-ai-cicd" \
  "Conversational AI CI/CD Service Account" \
  "Service account for CI/CD pipelines of the Conversational AI system"

# Create analytics service account
create_service_account "conversational-ai-analytics" \
  "Conversational AI Analytics Service Account" \
  "Service account for analytics processing of Conversational AI data"
```

## Step 6: Assign IAM Roles to Service Accounts

Assign the appropriate roles to each service account as defined in the `service_accounts.yaml` file:

```bash
# Set project for convenience
export PROJECT_ID="eyewearml-conversational-ai"

# Function to add roles to a service account
add_roles_to_service_account() {
  local sa_name=$1
  shift
  local roles=("$@")
  
  for role in "${roles[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
      --member="serviceAccount:$sa_name@$PROJECT_ID.iam.gserviceaccount.com" \
      --role="$role"
  done
}

# Add roles to development service account
add_roles_to_service_account "conversational-ai-dev" \
  "roles/dialogflow.admin" \
  "roles/cloudfunctions.developer" \
  "roles/storage.objectAdmin" \
  "roles/logging.logWriter" \
  "roles/monitoring.metricWriter" \
  "roles/datastore.user"

# Add roles to testing service account
add_roles_to_service_account "conversational-ai-test" \
  "roles/dialogflow.client" \
  "roles/cloudfunctions.invoker" \
  "roles/storage.objectViewer" \
  "roles/logging.logWriter" \
  "roles/monitoring.metricWriter" \
  "roles/datastore.user"

# Add roles to production service account
add_roles_to_service_account "conversational-ai-prod" \
  "roles/dialogflow.client" \
  "roles/cloudfunctions.invoker" \
  "roles/storage.objectViewer" \
  "roles/logging.logWriter" \
  "roles/monitoring.metricWriter" \
  "roles/datastore.user"

# Add roles to CI/CD service account
add_roles_to_service_account "conversational-ai-cicd" \
  "roles/dialogflow.admin" \
  "roles/cloudfunctions.developer" \
  "roles/storage.objectAdmin" \
  "roles/iam.serviceAccountUser" \
  "roles/run.admin"

# Add roles to analytics service account
add_roles_to_service_account "conversational-ai-analytics" \
  "roles/bigquery.dataViewer" \
  "roles/bigquery.jobUser" \
  "roles/logging.viewer" \
  "roles/dialogflow.reader"
```

## Step 7: Configure Resource Labels

Set up resource labels as defined in the `project_config.yaml` file:

```bash
# Add labels to the project
gcloud projects update $PROJECT_ID \
  --update-labels=environment=development,application=conversational-ai,business-unit=customer-experience,cost-center=digital-transformation
```

## Step 8: Set Up Audit Logging

Configure audit logging as specified in the `project_config.yaml` file:

1. Navigate to the [Audit Logs page](https://console.cloud.google.com/iam-admin/audit)
2. Enable audit logs for the specified services
3. Select the log types defined in the configuration file

## Step 9: Create Storage Buckets

Create storage buckets for the Conversational AI assets:

```bash
# Create storage buckets
gcloud storage buckets create gs://$PROJECT_ID-assets \
  --project=$PROJECT_ID \
  --location=us-central1 \
  --uniform-bucket-level-access

gcloud storage buckets create gs://$PROJECT_ID-exports \
  --project=$PROJECT_ID \
  --location=us-central1 \
  --uniform-bucket-level-access

gcloud storage buckets create gs://$PROJECT_ID-backups \
  --project=$PROJECT_ID \
  --location=us-central1 \
  --uniform-bucket-level-access
```

## Step 10: Set Up Firestore Database

Initialize Firestore in Native mode for conversation context storage:

```bash
# Create Firestore database
gcloud firestore databases create --region=us-central1
```

## Step 11: Generate and Securely Store Service Account Keys

Generate keys for development and CI/CD service accounts:

```bash
# Generate and download keys
gcloud iam service-accounts keys create ./conversational-ai-dev-key.json \
  --iam-account=conversational-ai-dev@$PROJECT_ID.iam.gserviceaccount.com

gcloud iam service-accounts keys create ./conversational-ai-cicd-key.json \
  --iam-account=conversational-ai-cicd@$PROJECT_ID.iam.gserviceaccount.com
```

**Important Security Note:** Store service account keys securely and never commit them to version control. Use Secret Manager for secure storage:

```bash
# Create secrets in Secret Manager
gcloud secrets create conversational-ai-dev-key \
  --replication-policy="automatic"

gcloud secrets create conversational-ai-cicd-key \
  --replication-policy="automatic"

# Add the key content to the secrets
gcloud secrets versions add conversational-ai-dev-key \
  --data-file="./conversational-ai-dev-key.json"

gcloud secrets versions add conversational-ai-cicd-key \
  --data-file="./conversational-ai-cicd-key.json"

# Delete the local key files after uploading to Secret Manager
rm ./conversational-ai-dev-key.json
rm ./conversational-ai-cicd-key.json
```

## Step 12: Verification Checklist

After completing the setup, verify that:

- [ ] Project has been created with the correct name and organization
- [ ] Billing account is linked to the project
- [ ] Budget alerts are configured as specified
- [ ] All required APIs are enabled
- [ ] Service accounts are created with appropriate roles
- [ ] Resource labels are applied to the project
- [ ] Audit logging is configured correctly
- [ ] Storage buckets are created and accessible
- [ ] Firestore database is initialized
- [ ] Service account keys are generated and stored securely

## Troubleshooting

### Common Issues and Solutions

#### API Enablement Failures
- **Issue**: Error enabling APIs: "API X has not been used in project Y before or it is disabled"
- **Solution**: Verify that the billing account is properly linked to the project. Some APIs require billing to be enabled.

#### Permission Errors
- **Issue**: "User does not have permission to access project"
- **Solution**: Verify that the user has the necessary IAM roles. Typically, roles/owner or roles/editor are required for project setup.

#### Quota Limits
- **Issue**: "Quota exceeded for resource X"
- **Solution**: Request quota increase through the Google Cloud Console or split resources across multiple projects.

#### Service Account Key Creation
- **Issue**: "Cannot create service account key"
- **Solution**: Verify that the user has the iam.serviceAccountKeys.create permission for the service account.

## Next Steps

After completing the Google Cloud project setup, proceed to:

1. [Dialogflow Agent Creation and Configuration](../conversational_ai/google_nlp/phase1_agentic_prompts.md#prompt-2-dialogflow-agent-creation-and-configuration)
2. Set up development environments and CI/CD pipelines
3. Begin implementing the core conversational flows

## References

- [Google Cloud Project Setup Best Practices](https://cloud.google.com/docs/enterprise/best-practices-for-enterprise-organizations)
- [Google Cloud IAM Best Practices](https://cloud.google.com/iam/docs/recommender-best-practices)
- [Dialogflow CX Documentation](https://cloud.google.com/dialogflow/cx/docs)
- [EyewearML Conversational AI Integration Strategy](../conversational_ai/integration_strategy.md)
