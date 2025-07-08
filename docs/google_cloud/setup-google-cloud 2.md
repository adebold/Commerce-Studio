# Setting Up Google Cloud and Firebase for Conversational AI

This guide will walk you through setting up Google Cloud and Firebase for the EyewearML Conversational AI system using the Google Cloud CLI.

## Prerequisites

- Google Cloud CLI installed
- Node.js and npm installed
- Python 3.8+ installed

## Step 1: Install Google Cloud CLI (if not already installed)

### Windows
1. Download the installer from: https://cloud.google.com/sdk/docs/install
2. Run the installer and follow the prompts
3. Restart your command prompt or PowerShell after installation

### Verify Installation
```bash
gcloud --version
```

## Step 2: Authenticate with Google Cloud

```bash
# Log in with your Google account
gcloud auth login

# Also set up application default credentials for local development
gcloud auth application-default login
```

## Step 3: Set Up Project

```bash
# List existing projects (if you want to use an existing one)
gcloud projects list

# Create a new project (or skip if using existing)
gcloud projects create varai-ai-dev --name="VarAI Development"

# Set the active project
gcloud config set project varai-ai-dev
```

## Step 4: Enable Required APIs

```bash
# Enable Dialogflow CX API
gcloud services enable dialogflow.googleapis.com

# Enable Firebase and Firestore APIs
gcloud services enable firebase.googleapis.com firestore.googleapis.com
```

## Step 5: Set Up Dialogflow CX Agent

```bash
# Create a Dialogflow CX agent (this must be done from the console)
echo "Please create a Dialogflow CX agent from the Google Cloud Console:"
echo "1. Go to https://console.cloud.google.com/dialogflow/cx"
echo "2. Click 'Create Agent'"
echo "3. Name it 'EyewearML Virtual Assistant'"
echo "4. Set region to 'us-central1'"
echo "5. Select your project"
echo "6. Click 'Create'"
```

## Step 6: Enable Firebase for your Project

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase for your project
firebase projects:list
firebase use varai-ai-dev

# Initialize Firestore
firebase init firestore
```

## Step 7: Create a Firebase Service Account

```bash
# Create a new service account
gcloud iam service-accounts create eyewear-ml-bot \
  --description="Service account for EyewearML Conversational AI" \
  --display-name="EyewearML Bot"

# Grant necessary roles to the service account
gcloud projects add-iam-policy-binding varai-ai-dev \
  --member="serviceAccount:eyewear-ml-bot@varai-ai-dev.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding varai-ai-dev \
  --member="serviceAccount:eyewear-ml-bot@varai-ai-dev.iam.gserviceaccount.com" \
  --role="roles/firestore.user"

# Create and download the key file
gcloud iam service-accounts keys create ./firebase-credentials.json \
  --iam-account=eyewear-ml-bot@varai-ai-dev.iam.gserviceaccount.com
```

## Step 8: Add Firebase Credentials to Environment

```bash
# Create .env.local file with Firebase credentials
cat > .env.local << EOL
# Google Cloud & Dialogflow Configuration
GOOGLE_CLOUD_PROJECT_ID=varai-ai-dev
GOOGLE_CLOUD_LOCATION=us-central1
DIALOGFLOW_AGENT_NAME=EyewearML Virtual Assistant
DIALOGFLOW_FLOWS_DIR=docs/conversational_ai/poc

# Firebase Configuration (for conversation context)
FIREBASE_PROJECT_ID=varai-ai-dev
FIREBASE_SERVICE_ACCOUNT=$(cat ./firebase-credentials.json)

# Webhook Configuration
WEBHOOK_PORT=3030
WEBHOOK_HOST=localhost

# Demo Configuration
DEMO_PORT=3050
EOL

# Secure the credentials file
mv firebase-credentials.json secured-firebase-credentials.json
chmod 600 secured-firebase-credentials.json
echo "Please keep secured-firebase-credentials.json in a secure location"
```

## Step 9: Install Node.js Dependencies

```bash
# Install required npm packages
npm install --save firebase-admin express dotenv body-parser cors
```

## Step 10: Deploy Conversational Flows

```bash
# Deploy the conversation flows to Dialogflow
python src/conversational_ai/deploy_flows.py
```

## Step 11: Start the Demo

```bash
# Start the demo application
node src/conversational_ai/demo.js
```

After running these steps, you can access the demo at http://localhost:3050.

## Troubleshooting

### Firebase Authentication Issues
If you encounter authentication issues with Firebase, verify that:
- The service account has the correct roles
- The FIREBASE_SERVICE_ACCOUNT environment variable is properly set
- The project ID matches between Google Cloud and Firebase

### Dialogflow Connection Errors
If the demo can't connect to Dialogflow:
- Ensure the Dialogflow CX API is enabled
- Verify your application default credentials are set up correctly
- Check that the agent name matches DIALOGFLOW_AGENT_NAME in your environment

### Webhook Server Issues
If the webhook server fails to start:
- Check for port conflicts (default is 3030)
- Ensure all dependencies are installed
- Verify the environment variables are set correctly
