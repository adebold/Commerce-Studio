#!/usr/bin/env node
/**
 * Script to verify the Shopify integration setup and test connectivity.
 * This script checks:
 * 1. Environment configuration
 * 2. Shopify API access
 * 3. EyewearML API connectivity
 * 4. Theme integration
 * 5. Required permissions
 */

import pkg from '@shopify/shopify-api';
const { Shopify } = pkg;
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import path from 'path';
import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

// Required environment variables
const REQUIRED_ENV_VARS = {
  'Shopify Configuration': [
    'SHOP_NAME',
    'SHOPIFY_ACCESS_TOKEN',
    'SHOPIFY_API_VERSION'
  ],
  'EyewearML Configuration': [
    'EYEWEAR_ML_API_URL',
    'EYEWEAR_ML_API_KEY'
  ]
};

// Required Shopify API scopes
const REQUIRED_SCOPES = [
  'read_products',
  'write_products',
  'read_themes',
  'write_themes',
  'read_script_tags',
  'write_script_tags'
];

async function checkEnvironmentVariables() {
  const spinner = ora('Checking environment variables').start();
  const missing = [];
  
  for (const [category, vars] of Object.entries(REQUIRED_ENV_VARS)) {
    for (const envVar of vars) {
      if (!process.env[envVar]) {
        missing.push({ category, variable: envVar });
      }
    }
  }
  
  if (missing.length > 0) {
    spinner.fail('Missing required environment variables:');
    missing.forEach(({ category, variable }) => {
      console.log(chalk.red(`  ${category}: ${variable}`));
    });
    process.exit(1);
  }
  
  spinner.succeed('Environment variables verified');
}

async function checkShopifyAccess() {
  const spinner = ora('Checking Shopify API access').start();
  
  try {
    const testClient = new shopify.clients.Rest({
      session: {
        shop: process.env.SHOP_NAME,
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN
      }
    });
    
    // Test API access
    await testClient.get({
      path: 'shop'
    });
    spinner.succeed('Shopify API access verified');
    
    // Check access scopes
    spinner.text = 'Checking API permissions';
    const { body: accessScopes } = await testClient.get({
      path: 'access_scopes'
    });
    const missingScopes = REQUIRED_SCOPES.filter(
      scope => !accessScopes.access_scopes.some(s => s.handle === scope)
    );
    
    if (missingScopes.length > 0) {
      spinner.fail('Missing required Shopify API scopes:');
      missingScopes.forEach(scope => {
        console.log(chalk.red(`  - ${scope}`));
      });
      process.exit(1);
    }
    
    spinner.succeed('API permissions verified');
    
  } catch (error) {
    spinner.fail(`Shopify API error: ${error.message}`);
    if (program.debug) {
      console.error(error);
    }
    process.exit(1);
  }
}

async function checkEyewearMLAccess() {
  const spinner = ora('Checking EyewearML API access').start();
  
  try {
    const response = await axios.get(
      `${process.env.EYEWEAR_ML_API_URL}/health`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.EYEWEAR_ML_API_KEY}`
        }
      }
    );
    
    if (response.data.status !== 'healthy') {
      throw new Error('API health check failed');
    }
    
    spinner.succeed('EyewearML API access verified');
    
  } catch (error) {
    spinner.fail(`EyewearML API error: ${error.message}`);
    if (program.debug) {
      console.error(error);
    }
    process.exit(1);
  }
}

async function checkThemeIntegration() {
  const spinner = ora('Checking theme integration').start();
  
  try {
    const themeClient = new shopify.clients.Rest({
      session: {
        shop: process.env.SHOP_NAME,
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN
      }
    });
    
    // Get main theme
    const { body: themes } = await themeClient.get({
      path: 'themes'
    });
    
    const mainTheme = themes.themes.find(t => t.role === 'main');
    
    if (!mainTheme) {
      throw new Error('No main theme found');
    }
    
    // Check for virtual try-on component
    const { body: asset } = await themeClient.get({
      path: `themes/${mainTheme.id}/assets`,
      query: {
        'asset[key]': 'snippets/virtual-try-on.liquid'
      }
    });
    
    if (!asset) {
      spinner.fail('Virtual try-on component not found in theme');
      console.log(chalk.yellow('\nTo add the component, run:'));
      console.log('npm run demo:try-on-only');
      process.exit(1);
    }
    
    spinner.succeed('Theme integration verified');
    
  } catch (error) {
    spinner.fail(`Theme integration error: ${error.message}`);
    if (program.debug) {
      console.error(error);
    }
    process.exit(1);
  }
}

async function verifySetup() {
  console.log(chalk.bold('\nVerifying EyewearML Shopify Integration Setup\n'));
  
  try {
    await checkEnvironmentVariables();
    await checkShopifyAccess();
    await checkEyewearMLAccess();
    await checkThemeIntegration();
    
    console.log(chalk.green('\n✨ Setup verification complete! Everything looks good.\n'));
    
    // Display next steps
    console.log(chalk.bold('Next Steps:'));
    console.log('1. Run the demo to test the integration:');
    console.log('   npm run demo');
    console.log('\n2. Visit your Shopify admin to configure the app:');
    console.log(`   https://${process.env.SHOP_NAME}/admin/apps/eyewearml`);
    
  } catch (error) {
    console.error(chalk.red('\nSetup verification failed:'), error.message);
    if (program.debug) {
      console.error(error);
    }
    process.exit(1);
  }
}

program
  .option('-d, --debug', 'Enable debug logging')
  .parse(process.argv);

verifySetup();
