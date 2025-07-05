#!/usr/bin/env node

/**
 * GCP and Dialogflow CX Setup Script
 * 
 * This script automates the setup process for GCP projects and Dialogflow CX agents
 * across development, staging, and production environments.
 * 
 * Prerequisites:
 * - Google Cloud CLI (gcloud) installed and authenticated
 * - Appropriate permissions to create projects and enable APIs
 * 
 * Usage:
 *   node setup-gcp-dialogflow.js [environment]
 * 
 * Examples:
 *   node setup-gcp-dialogflow.js development
 *   node setup-gcp-dialogflow.js staging
 */

const { execSync } = require('child_process');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Define environments
const ENVIRONMENTS = ['development', 'staging', 'production'];

// Define environment-specific configurations
const ENV_CONFIGS = {
  development: {
    projectName: 'eyewearml-conversational-ai-dev',
    projectId: 'eyewearml-conversational-ai-dev',
    agentName: 'EyewearML Assistant - Dev',
    location: 'us-central1',
    apiEndpoint: 'https://api-dev.eyewearml.com/dialogflow',
    webhookUrl: 'https://webhook-dev.eyewearml.com/dialogflow'
  },
  staging: {
    projectName: 'eyewearml-conversational-ai-staging',
    projectId: 'eyewearml-conversational-ai-staging',
    agentName: 'EyewearML Assistant - Staging',
    location: 'us-central1',
    apiEndpoint: 'https://api-staging.eyewearml.com/dialogflow',
    webhookUrl: 'https://webhook-staging.eyewearml.com/dialogflow'
  },
  production: {
    projectName: 'eyewearml-conversational-ai-prod',
    projectId: 'eyewearml-conversational-ai-prod',
    agentName: 'EyewearML Assistant',
    location: 'us-central1',
    apiEndpoint: 'https://api.eyewearml.com/dialogflow',
    webhookUrl: 'https://webhook.eyewearml.com/dialogflow'
  }
};

// Required APIs to enable
const REQUIRED_APIS = [
  'dialogflow.googleapis.com',
  'cloudfunctions.googleapis.com',
  'storage.googleapis.com'
];

// Parse command line arguments
const args = process.argv.slice(2);
const targetEnv = args[0] || 'development';

// Validate environment
if (!ENVIRONMENTS.includes(targetEnv)) {
  console.error(`Error: Invalid environment "${targetEnv}"`);
  console.error(`Valid environments: ${ENVIRONMENTS.join(', ')}`);
  process.exit(1);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Main setup function
 */
async function setup() {
  try {
    console.log(`\n🚀 Setting up GCP and Dialogflow CX for ${targetEnv} environment...\n`);
    
    // Get environment-specific configuration
    const config = ENV_CONFIGS[targetEnv];
    
    // Verify gcloud is installed
    await verifyGcloudInstalled();
    
    // Ask if user wants to use existing project or create new one
    const useExistingProject = await promptUseExistingProject(config.projectId);
    
    let projectId = config.projectId;
    
    if (useExistingProject) {
      projectId = await promptExistingProjectId(config.projectId);
      console.log(`Using existing project: ${projectId}`);
    } else {
      // Create new GCP project
      await createGCPProject(config);
      projectId = config.projectId;
    }
    
    // Set default project
    await setDefaultProject(projectId);
    
    // Enable required APIs
    await enableRequiredAPIs(projectId);
    
    // Get or create Dialogflow CX agent
    const agentId = await setupDialogflowAgent(config);
    
    // Output configuration
    outputConfiguration(config, projectId, agentId);
    
    console.log('\n✅ GCP and Dialogflow CX setup completed successfully!');
    
    rl.close();
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

/**
 * Verify gcloud CLI is installed
 */
async function verifyGcloudInstalled() {
  console.log('📋 Verifying gcloud CLI installation...');
  
  try {
    execSync('gcloud --version', { stdio: 'ignore' });
    console.log('  ✅ gcloud CLI is installed');
  } catch (error) {
    throw new Error('gcloud CLI is not installed. Please install it from https://cloud.google.com/sdk/docs/install');
  }
  
  // Check if user is authenticated
  try {
    const accountInfo = execSync('gcloud auth list --filter=status:ACTIVE --format="value(account)"').toString().trim();
    if (!accountInfo) {
      throw new Error('No active gcloud account found');
    }
    console.log(`  ✅ Authenticated as ${accountInfo}`);
  } catch (error) {
    throw new Error('Please authenticate with gcloud by running: gcloud auth login');
  }
}

/**
 * Prompt to use existing project or create new one
 */
async function promptUseExistingProject(projectId) {
  return new Promise((resolve) => {
    rl.question(`Do you want to use an existing GCP project instead of creating ${projectId}? (y/n) `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Prompt for existing project ID
 */
async function promptExistingProjectId(defaultId) {
  return new Promise((resolve) => {
    rl.question(`Enter the existing GCP project ID (default: ${defaultId}): `, (answer) => {
      resolve(answer.trim() || defaultId);
    });
  });
}

/**
 * Create GCP project
 */
async function createGCPProject(config) {
  console.log(`\n🔨 Creating GCP project: ${config.projectName} (${config.projectId})...`);
  
  try {
    execSync(`gcloud projects create ${config.projectId} --name="${config.projectName}"`, { stdio: 'inherit' });
    console.log(`  ✅ Project created successfully`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`  ⚠️ Project ${config.projectId} already exists, using existing project`);
    } else {
      throw new Error(`Failed to create GCP project: ${error.message}`);
    }
  }
}

/**
 * Set default project
 */
async function setDefaultProject(projectId) {
  console.log(`\n🔨 Setting default project to ${projectId}...`);
  
  try {
    execSync(`gcloud config set project ${projectId}`, { stdio: 'inherit' });
    console.log(`  ✅ Default project set successfully`);
  } catch (error) {
    throw new Error(`Failed to set default project: ${error.message}`);
  }
}

/**
 * Enable required APIs
 */
async function enableRequiredAPIs(projectId) {
  console.log('\n🔨 Enabling required APIs...');
  
  for (const api of REQUIRED_APIS) {
    console.log(`  - Enabling ${api}...`);
    
    try {
      execSync(`gcloud services enable ${api} --project=${projectId}`, { stdio: 'inherit' });
      console.log(`    ✅ API enabled successfully`);
    } catch (error) {
      throw new Error(`Failed to enable API ${api}: ${error.message}`);
    }
  }
}

/**
 * Setup Dialogflow CX agent
 */
async function setupDialogflowAgent(config) {
  console.log(`\n🔨 Setting up Dialogflow CX agent: ${config.agentName}...`);
  
  // Check if there's an existing agent
  console.log('  - Checking for existing agents...');
  let agentId = null;
  
  try {
    const result = execSync(
      `gcloud dialogflow cx agents list --location=${config.location} --format="value(displayName,name)" --filter="displayName=${config.agentName}"`,
      { encoding: 'utf8' }
    );
    
    if (result.trim()) {
      const matches = result.match(/.*projects\/[^/]+\/locations\/[^/]+\/agents\/([a-f0-9-]+)/);
      if (matches && matches[1]) {
        agentId = matches[1];
        console.log(`    ✅ Found existing agent with ID: ${agentId}`);
      }
    }
  } catch (error) {
    console.log(`    ⚠️ Error checking existing agents: ${error.message}`);
  }
  
  // Create new agent if none exists
  if (!agentId) {
    console.log('  - Creating new agent...');
    
    // Unfortunately, the gcloud CLI doesn't directly support creating Dialogflow CX agents
    // Here, you'd typically use the Dialogflow CX API directly
    console.log('    ⚠️ Agent creation via CLI not supported');
    console.log('    📝 Please create the agent manually in the Dialogflow CX console:');
    console.log(`    https://dialogflow.cloud.google.com/cx/projects/${config.projectId}/locations/${config.location}/agents?createDialog=true`);
    
    // Prompt for agent ID
    agentId = await promptAgentId();
  }
  
  return agentId;
}

/**
 * Prompt for agent ID
 */
async function promptAgentId() {
  return new Promise((resolve) => {
    rl.question('Enter the Dialogflow CX Agent ID (found in agent settings): ', (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Output configuration
 */
function outputConfiguration(config, projectId, agentId) {
  console.log('\n📋 Configuration Summary:');
  console.log(`  - Environment: ${targetEnv}`);
  console.log(`  - Project ID: ${projectId}`);
  console.log(`  - Agent Name: ${config.agentName}`);
  console.log(`  - Agent ID: ${agentId}`);
  console.log(`  - Location: ${config.location}`);
  
  console.log('\n📋 Environment Variables:');
  console.log(`REACT_APP_DIALOGFLOW_URL=${config.apiEndpoint}`);
  console.log(`REACT_APP_DIALOGFLOW_PROJECT_ID=${projectId}`);
  console.log(`REACT_APP_DIALOGFLOW_AGENT_ID=${agentId}`);
  console.log(`REACT_APP_DIALOGFLOW_LOCATION=${config.location}`);
  
  // Update environment file with actual agent ID
  const envFilePath = path.resolve(__dirname, `../src/frontend/.env.${targetEnv}`);
  if (fs.existsSync(envFilePath)) {
    console.log(`\n📝 Updating environment file: ${envFilePath}`);
    
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    envContent = envContent.replace(/REACT_APP_DIALOGFLOW_AGENT_ID=.*$/m, `REACT_APP_DIALOGFLOW_AGENT_ID=${agentId}`);
    fs.writeFileSync(envFilePath, envContent);
    
    console.log(`  ✅ Environment file updated with Agent ID`);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Import Dialogflow conversation flows:');
  console.log('   - Go to the Dialogflow CX console');
  console.log('   - Navigate to your agent');
  console.log('   - Import the flow definitions from src/dialogflow/flows/');
  console.log('2. Configure webhook:');
  console.log('   - Go to Manage > Webhooks');
  console.log('   - Create a new webhook for the ML integration');
  console.log(`   - Set the URL to ${config.webhookUrl}`);
  console.log('   - Configure tags according to docs/integration/dialogflow_fulfillment_config.md');
}

// Run the setup
setup();
