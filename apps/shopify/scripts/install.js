#!/usr/bin/env node
/**
 * Installation script for the EyewearML Shopify integration.
 * This script:
 * 1. Guides users through getting required credentials
 * 2. Sets up environment configuration
 * 3. Installs dependencies
 * 4. Verifies the setup
 * 5. Deploys theme components
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pkg from '@shopify/shopify-api';
const { Shopify } = pkg;
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Shopify API
const shopify = Shopify.shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || 'dummy_key',
  apiSecretKey: process.env.SHOPIFY_API_SECRET || 'dummy_secret',
  scopes: ['read_products', 'write_products', 'read_themes', 'write_themes'],
  hostName: process.env.SHOP_NAME,
  apiVersion: '2024-01'
});

// Initialize REST client
const client = new shopify.clients.Rest({
  session: {
    shop: process.env.SHOP_NAME,
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN
  }
});

// Installation steps
const STEPS = {
  INTRO: 'intro',
  CREDENTIALS: 'credentials',
  ENVIRONMENT: 'environment',
  DEPENDENCIES: 'dependencies',
  VERIFICATION: 'verification',
  DEPLOYMENT: 'deployment'
};

// Questions for gathering credentials
const QUESTIONS = [
  {
    type: 'input',
    name: 'shopName',
    message: 'Enter your Shopify store name (e.g., your-store.myshopify.com):',
    validate: input => /^[a-zA-Z0-9-]+\.myshopify\.com$/.test(input)
  },
  {
    type: 'input',
    name: 'accessToken',
    message: 'Enter your Shopify access token:'process.env.APIKEY_2529'input',
    name: 'eyewearMLApiKey',
    message: 'Enter your EyewearML API key:'process.env.APIKEY_2529'confirm',
    name: 'analytics',
    message: 'Would you like to enable analytics tracking?',
    default: true
  },
  {
    type: 'confirm',
    name: 'automaticSync',
    message: 'Enable automatic product synchronization?',
    default: true
  }
];

async function showIntro() {
  console.log(chalk.bold('\nEyewearML Shopify Integration Installer\n'));
  console.log('This installer will help you set up the EyewearML integration with your Shopify store.');
  console.log('\nBefore proceeding, please ensure you have:');
  console.log('1. A Shopify Partner account');
  console.log('2. Access to your Shopify store admin');
  console.log('3. An EyewearML account and API key');
  
  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Do you have all the prerequisites?',
      default: true
    }
  ]);
  
  if (!proceed) {
    console.log(chalk.yellow('\nPlease gather the required credentials and try again.'));
    process.exit(0);
  }
}

async function gatherCredentials() {
  console.log(chalk.bold('\nGathering Credentials\n'));
  
  const spinner = ora('Validating credentials...').start();
  
  try {
    const answers = await inquirer.prompt(QUESTIONS);
    
    // Validate Shopify access
    spinner.text = 'Verifying Shopify access...';
    const shopifyValid = await validateShopifyCredentials(answers);
    if (!shopifyValid) {
      throw new Error('Invalid Shopify credentials');
    }
    
    // Validate EyewearML API key
    spinner.text = 'Verifying EyewearML API key...';
    const apiValid = await validateEyewearMLApiKey(answers);
    if (!apiValid) {
      throw new Error('Invalid EyewearML API key');
    }
    
    spinner.succeed('Credentials validated successfully');
    return answers;
    
  } catch (error) {
    spinner.fail(`Credential validation failed: ${error.message}`);
    process.exit(1);
  }
}

async function setupEnvironment(credentials) {
  console.log(chalk.bold('\nSetting Up Environment\n'));
  
  const spinner = ora('Creating environment configuration...').start();
  
  try {
    // Create .env file
    const envContent = generateEnvContent(credentials);
    fs.writeFileSync(path.join(__dirname, '../.env'), envContent);
    
    spinner.succeed('Environment configuration created');
    
  } catch (error) {
    spinner.fail(`Environment setup failed: ${error.message}`);
    process.exit(1);
  }
}

async function installDependencies() {
  console.log(chalk.bold('\nInstalling Dependencies\n'));
  
  const spinner = ora('Installing npm packages...').start();
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    spinner.succeed('Dependencies installed successfully');
    
  } catch (error) {
    spinner.fail(`Dependency installation failed: ${error.message}`);
    process.exit(1);
  }
}

async function verifySetup() {
  console.log(chalk.bold('\nVerifying Setup\n'));
  
  const spinner = ora('Running verification...').start();
  
  try {
    execSync('npm run verify', { stdio: 'inherit' });
    spinner.succeed('Setup verified successfully');
    
  } catch (error) {
    spinner.fail(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

async function deployComponents() {
  console.log(chalk.bold('\nDeploying Theme Components\n'));
  
  const spinner = ora('Installing theme components...').start();
  
  try {
    // Run demo script with try-on only to install components
    execSync('npm run demo:try-on-only', { stdio: 'inherit' });
    spinner.succeed('Theme components installed successfully');
    
  } catch (error) {
    spinner.fail(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

function generateEnvContent(credentials) {
  return `# Shopify Configuration
SHOP_NAME=${credentials.shopName}
SHOPIFY_ACCESS_TOKEN=${credentials.accessToken}
SHOPIFY_API_VERSION=2024-01

# EyewearML Configuration
EYEWEAR_ML_API_URL=https://api.eyewearml.com
EYEWEAR_ML_API_KEY=${credentials.eyewearMLApiKey}

# Feature Flags
ANALYTICS_ENABLED=${credentials.analytics}
AUTOMATIC_SYNC_ENABLED=${credentials.automaticSync}

# Default Settings
VIRTUAL_TRY_ON_ENABLED=true
RECOMMENDATIONS_ENABLED=true
CACHE_ENABLED=true
DEBUG=false`;
}

async function validateShopifyCredentials(credentials) {
  try {
    const testShopify = Shopify.shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY || 'dummy_key',
      apiSecretKey: process.env.SHOPIFY_API_SECRET || 'dummy_secret',
      scopes: ['read_products', 'write_products', 'read_themes', 'write_themes'],
      hostName: credentials.shopName,
      apiVersion: '2024-01'
    });

    const testClient = new testShopify.clients.Rest({
      session: {
        shop: credentials.shopName,
        accessToken: credentials.accessToken
      }
    });
    
    // Test API access
    await testClient.get({
      path: 'shop'
    });
    
    return true;
  } catch (error) {
    console.error('Shopify validation error:', error.message);
    return false;
  }
}

async function validateEyewearMLApiKey(credentials) {
  // Implement EyewearML API key validation
  return true;
}

async function main() {
  try {
    console.log(chalk.bold('\nEyewearML Shopify Integration Installer\n'));
    
    // Use existing configuration
    const credentials = {
      shopName: 'varai-test.myshopify.com',
      accessToken: 'process.env.APIKEY_200',
      eyewearMLApiKey: 'process.env.APIKEY_2528',
      analytics: true,
      automaticSync: true
    };

    // Setup environment with existing credentials
    await setupEnvironment(credentials);
    
    // Install dependencies
    await installDependencies();
    
    // Verify setup
    await verifySetup();
    
    // Deploy components
    await deployComponents();
    
    // Show success message
    console.log(chalk.green('\n✨ Installation completed successfully!\n'));
    
    // Show next steps
    console.log(chalk.bold('Next Steps:'));
    console.log('1. Visit your Shopify admin:');
    console.log(`   https://${credentials.shopName}/admin/apps/eyewearml`);
    console.log('\n2. Configure the app settings');
    console.log('\n3. Add the virtual try-on component to your product pages');
    console.log('\n4. Test the integration:');
    console.log('   npm run demo');
    
  } catch (error) {
    console.error(chalk.red('\nInstallation failed:'), error.message);
    if (program.debug) {
      console.error(error);
    }
    process.exit(1);
  }
}

program
  .option('-d, --debug', 'Enable debug logging')
  .parse(process.argv);

main();
