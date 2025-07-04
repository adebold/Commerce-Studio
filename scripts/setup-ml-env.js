#!/usr/bin/env node

/**
 * ML Environment Setup Script
 * 
 * This script helps set up environment-specific configuration files
 * for ML platform integration, making it easier to deploy to
 * different environments.
 * 
 * Usage:
 *   node setup-ml-env.js [environment]
 * 
 * Examples:
 *   node setup-ml-env.js development
 *   node setup-ml-env.js staging
 *   node setup-ml-env.js production
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Define environments
const ENVIRONMENTS = ['development', 'staging', 'production'];

// Environment-specific configurations
const ENV_CONFIGS = {
  development: {
    ML_API_BASE_URL: 'https://dev-ml-api.eyewearml.com/api',
    ML_CLIENT_TIMEOUT: '8000',
    ML_CLIENT_ENABLE_CACHE: 'true',
    ML_CLIENT_LOG_LEVEL: 'debug'
  },
  staging: {
    ML_API_BASE_URL: 'https://staging-ml-api.eyewearml.com/api',
    ML_CLIENT_TIMEOUT: '10000',
    ML_CLIENT_ENABLE_CACHE: 'true',
    ML_CLIENT_LOG_LEVEL: 'info'
  },
  production: {
    ML_API_BASE_URL: 'https://ml-api.eyewearml.com/api',
    ML_CLIENT_TIMEOUT: '12000',
    ML_CLIENT_ENABLE_CACHE: 'true',
    ML_CLIENT_LOG_LEVEL: 'warn'
  }
};

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
 * Main function
 */
async function setup() {
  try {
    console.log(`\n🔧 Setting up ML environment for ${targetEnv}...\n`);
    
    // Get environment configuration
    const envConfig = ENV_CONFIGS[targetEnv];
    
    // Get ML API key
    const apiKey = await promptApiKey();
    envConfig.ML_API_KEY = apiKey;
    
    // Create environment file
    createEnvFile(envConfig);
    
    console.log('\n✅ ML environment setup completed successfully!');
    
    // Provide next steps
    console.log('\nNext steps:');
    console.log('1. Review the generated .env file');
    console.log('2. Deploy the ML integration with:');
    console.log(`   node scripts/deploy-ml-integration.js ${targetEnv}`);
    
    rl.close();
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

/**
 * Prompt for ML API key
 */
function promptApiKey() {
  return new Promise((resolve) => {
    rl.question(`Enter ML API key for ${targetEnv}: `, (answer) => {
      if (!answer.trim()) {
        console.warn('  ⚠️ Warning: No API key provided');
      }
      resolve(answer.trim());
    });
  });
}

/**
 * Create environment file
 */
function createEnvFile(envConfig) {
  console.log('\n📝 Creating environment file...');
  
  // Generate file content
  let fileContent = `# ML Platform API Configuration for ${targetEnv}\n\n`;
  
  for (const [key, value] of Object.entries(envConfig)) {
    fileContent += `${key}=${value}\n`;
  }
  
  // Write to file
  const filePath = `src/ml/.env.${targetEnv}`;
  fs.writeFileSync(filePath, fileContent);
  
  console.log(`  ✅ Environment file created: ${filePath}`);
  console.log('  File contents:');
  console.log('  ---------------');
  
  // Print file contents (excluding sensitive values)
  const sanitizedContent = fileContent.replace(/ML_API_KEY=.*$/m, 'ML_API_KEY=********');
  console.log('  ' + sanitizedContent.replace(/\n/g, '\n  '));
  console.log('  ---------------');
}

// Run the setup
setup();
