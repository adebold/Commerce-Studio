#!/usr/bin/env node

/**
 * ML Integration Deployment Script
 * 
 * This script automates the process of deploying the ML integration
 * to various environments (development, staging, production).
 * 
 * Usage:
 *   node deploy-ml-integration.js [environment]
 * 
 * Examples:
 *   node deploy-ml-integration.js development
 *   node deploy-ml-integration.js staging
 *   node deploy-ml-integration.js production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Define environments
const ENVIRONMENTS = ['development', 'staging', 'production'];

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
 * Main deployment function
 */
async function deploy() {
  try {
    console.log(`\n🚀 Deploying ML integration to ${targetEnv}...\n`);
    
    // Step 1: Confirm deployment
    await confirmDeployment();
    
    // Step 2: Load environment variables
    loadEnvironmentVariables();
    
    // Step 3: Install dependencies
    installDependencies();
    
    // Step 4: Run tests
    runTests();
    
    // Step 5: Build the webhook service
    buildWebhook();
    
    // Step 6: Deploy the webhook service
    deployWebhook();
    
    console.log('\n✅ ML integration deployment completed successfully!');
    
    // Provide next steps
    console.log('\nNext steps:');
    console.log('1. Verify that the webhook service is running correctly');
    console.log('2. Test the ML-powered recommendations in Dialogflow');
    console.log('3. Monitor logs for any issues');
    
    rl.close();
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

/**
 * Prompt for deployment confirmation
 */
function confirmDeployment() {
  return new Promise((resolve, reject) => {
    rl.question(`Are you sure you want to deploy to ${targetEnv}? (y/n) `, (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        resolve();
      } else {
        reject(new Error('Deployment cancelled by user'));
      }
    });
  });
}

/**
 * Load environment variables from .env file
 */
function loadEnvironmentVariables() {
  console.log('\n📝 Loading environment variables...');
  
  const envFile = `.env.${targetEnv}`;
  const mlEnvFile = `src/ml/.env.${targetEnv}`;
  
  // Check if main .env file exists
  if (fs.existsSync(envFile)) {
    console.log(`  - Loading variables from ${envFile}`);
    require('dotenv').config({ path: envFile });
  } else {
    console.warn(`  ⚠️ Warning: ${envFile} not found, using defaults`);
  }
  
  // Check if ML-specific .env file exists
  if (fs.existsSync(mlEnvFile)) {
    console.log(`  - Loading ML variables from ${mlEnvFile}`);
    require('dotenv').config({ path: mlEnvFile, override: true });
  } else {
    console.warn(`  ⚠️ Warning: ${mlEnvFile} not found, using defaults`);
  }
  
  // Verify required variables
  const requiredVars = ['ML_API_BASE_URL', 'ML_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`  ❌ Error: Missing required environment variables: ${missingVars.join(', ')}`);
    console.error(`  Please add these variables to ${envFile} or ${mlEnvFile}`);
    throw new Error('Missing required environment variables');
  }
  
  console.log('  ✅ Environment variables loaded successfully');
}

/**
 * Install dependencies
 */
function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  try {
    // Install main project dependencies
    console.log('  - Installing project dependencies');
    execSync('npm install', { stdio: 'inherit' });
    
    // Install webhook dependencies if separate
    if (fs.existsSync('src/webhook/package.json')) {
      console.log('  - Installing webhook dependencies');
      execSync('cd src/webhook && npm install', { stdio: 'inherit' });
    }
    
    console.log('  ✅ Dependencies installed successfully');
  } catch (error) {
    console.error('  ❌ Error installing dependencies');
    throw error;
  }
}

/**
 * Run tests
 */
function runTests() {
  console.log('\n🧪 Running tests...');
  
  try {
    // Run ML client test
    console.log('  - Testing ML client');
    execSync('node src/ml/client/test.js', { stdio: 'inherit' });
    
    console.log('  ✅ Tests completed successfully');
  } catch (error) {
    console.error('  ❌ Error running tests');
    console.error('  ⚠️ The ML API may not be available or properly configured');
    
    // Prompt for continue despite test failures
    const shouldContinue = execSync('read -p "Continue deployment despite test failures? (y/n) " choice && echo $choice')
      .toString()
      .trim();
    
    if (shouldContinue.toLowerCase() !== 'y' && shouldContinue.toLowerCase() !== 'yes') {
      throw new Error('Deployment cancelled due to test failures');
    }
  }
}

/**
 * Build the webhook service
 */
function buildWebhook() {
  console.log('\n🔨 Building webhook service...');
  
  try {
    // Check if there's a build script in package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.build) {
      console.log('  - Running build script');
      execSync('npm run build', { stdio: 'inherit' });
    } else if (fs.existsSync('src/webhook/package.json')) {
      // Check if webhook has a build script
      const webhookPackageJson = JSON.parse(fs.readFileSync('src/webhook/package.json', 'utf8'));
      
      if (webhookPackageJson.scripts && webhookPackageJson.scripts.build) {
        console.log('  - Running webhook build script');
        execSync('cd src/webhook && npm run build', { stdio: 'inherit' });
      } else {
        console.log('  - No build script found, skipping build step');
      }
    } else {
      console.log('  - No build script found, skipping build step');
    }
    
    console.log('  ✅ Build completed successfully');
  } catch (error) {
    console.error('  ❌ Error building webhook service');
    throw error;
  }
}

/**
 * Deploy the webhook service
 */
function deployWebhook() {
  console.log('\n🚢 Deploying webhook service...');
  
  try {
    // Check deployment method from package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts[`deploy:${targetEnv}`]) {
      // Use predefined deploy script
      console.log(`  - Running deploy:${targetEnv} script`);
      execSync(`npm run deploy:${targetEnv}`, { stdio: 'inherit' });
    } else if (packageJson.scripts && packageJson.scripts.deploy) {
      // Use generic deploy script
      console.log('  - Running deploy script');
      execSync(`npm run deploy -- ${targetEnv}`, { stdio: 'inherit' });
    } else if (targetEnv === 'development') {
      // For development, just start the server locally
      console.log('  - Starting webhook service locally');
      console.log('  - Press Ctrl+C to stop');
      execSync('node src/webhook/index.js', { stdio: 'inherit' });
    } else {
      // Manual deployment instructions
      console.log('  ⚠️ No deployment script found. Manual deployment steps:');
      console.log('  1. Copy the webhook files to your server');
      console.log('  2. Install dependencies on the server');
      console.log('  3. Set up environment variables on the server');
      console.log('  4. Start the webhook service');
      
      throw new Error('No deployment script available');
    }
    
    console.log('  ✅ Deployment completed successfully');
  } catch (error) {
    console.error('  ❌ Error deploying webhook service');
    throw error;
  }
}

// Run the deployment
deploy();
