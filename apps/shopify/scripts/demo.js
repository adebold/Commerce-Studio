#!/usr/bin/env node
/**
 * Demo script to showcase the EyewearML data pipeline integration with Shopify.
 * This script demonstrates how to:
 * 1. Import product data
 * 2. Process images
 * 3. Generate recommendations
 * 4. Display virtual try-on
 */

import path from 'path';
import dotenv from 'dotenv';
import pkg from '@shopify/shopify-api';
const { Shopify } = pkg;
import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';
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

// Configure EyewearML API client
const eyewearML = axios.create({
  baseURL: process.env.EYEWEAR_ML_API_URL || 'http://localhost:8000',
  headers: {
    'Authorization': `Bearer ${process.env.EYEWEAR_ML_API_KEY}`
  }
});

async function importProducts() {
  const spinner = ora('Importing products from Shopify').start();
  
  try {
    // Get products from Shopify
    const { body: { products } } = await client.get({
      path: 'products'
    });
    spinner.text = `Found ${products.length} products`;
    
    // Start data import job
    const { data: { job_id } } = await eyewearML.post('/data/import', {
      products: products.map(p => ({
        id: p.id,
        title: p.title,
        images: p.images.map(img => img.src),
        variants: p.variants.map(v => ({
          sku: v.sku,
          price: v.price,
          inventory_quantity: v.inventory_quantity
        }))
      }))
    });
    
    // Poll for job completion
    while (true) {
      const { data: status } = await eyewearML.get(`/data/import/status/${job_id}`);
      spinner.text = `Import progress: ${status.progress}%`;
      
      if (status.status === 'completed') {
        spinner.succeed('Import completed successfully');
        return status.result;
      } else if (status.status === 'failed') {
        throw new Error(status.error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    spinner.fail(`Import failed: ${error.message}`);
    throw error;
  }
}

async function generateRecommendations() {
  const spinner = ora('Generating product recommendations').start();
  
  try {
    const { data: recommendations } = await eyewearML.post('/recommendations/generate');
    spinner.succeed('Recommendations generated successfully');
    return recommendations;
  } catch (error) {
    spinner.fail(`Failed to generate recommendations: ${error.message}`);
    throw error;
  }
}

async function setupVirtualTryOn() {
  const spinner = ora('Setting up virtual try-on').start();
  
  try {
    // Update theme to include virtual try-on component
    const { body: { themes } } = await client.get({
      path: 'themes'
    });
    const mainTheme = themes.find(t => t.role === 'main');
    
    await client.put({
      path: `themes/${mainTheme.id}/assets`,
      data: {
        asset: {
          key: 'process.env.DEMO_SECRET',
          value: `
            <div id="virtual-try-on"
              data-api-url="{{ shop.metafields.eyewearml.api_url }}"
              data-product-id="{{ product.id }}"
            >
              <div class="try-on-container"></div>
              <button class="try-on-button">Virtual Try-On</button>
            </div>
            
            {% schema %}
            {
              "name": "Virtual Try-On",
              "target": "section",
              "settings": [
                {
                  "type": "text",
                  "id": "button_text",
                  "label": "Button Text",
                  "default": "Virtual Try-On"
                }
              ]
            }
            {% endschema %}
          `
        }
      }
    });
    
    spinner.succeed('Virtual try-on component installed');
  } catch (error) {
    spinner.fail(`Failed to setup virtual try-on: ${error.message}`);
    throw error;
  }
}

async function displayDemoResults(results) {
  console.log('\n' + chalk.bold('Demo Results:'));
  
  // Display import statistics
  console.log('\n' + chalk.blue('Import Statistics:'));
  console.log(`Total products: ${results.import.total_products}`);
  console.log(`Processed images: ${results.import.processed_images}`);
  console.log(`Processing time: ${results.import.processing_time}s`);
  
  // Display sample recommendations
  console.log('\n' + chalk.blue('Sample Recommendations:'));
  results.recommendations.slice(0, 3).forEach(rec => {
    console.log(`\n${chalk.bold(rec.product_title)}`);
    console.log(`Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
    console.log(`Similar products: ${rec.similar_products.map(p => p.title).join(', ')}`);
  });
  
  // Display virtual try-on instructions
  console.log('\n' + chalk.blue('Virtual Try-On Setup:'));
  console.log('1. The virtual try-on component has been added to your theme');
  console.log('2. Add the component to product pages in theme customizer');
  console.log('3. Configure the component settings as needed');
  
  // Display next steps
  console.log('\n' + chalk.green('Next Steps:'));
  console.log('1. Visit your Shopify admin panel');
  console.log('2. Go to Online Store > Themes');
  console.log('3. Click "Customize" on your main theme');
  console.log('4. Add the Virtual Try-On section to your product pages');
}

program
  .option('-d, --debug', 'Enable debug logging')
  .option('--skip-import', 'Skip product import')
  .option('--skip-recommendations', 'Skip recommendation generation')
  .option('--skip-try-on', 'Skip virtual try-on setup')
  .parse(process.argv);

async function main() {
  try {
    const results = {
      import: null,
      recommendations: null,
      virtualTryOn: false
    };
    
    console.log(chalk.bold('\nEyewearML Shopify Integration Demo\n'));
    
    if (!program.skipImport) {
      results.import = await importProducts();
    }
    
    if (!program.skipRecommendations) {
      results.recommendations = await generateRecommendations();
    }
    
    if (!program.skipTryOn) {
      await setupVirtualTryOn();
      results.virtualTryOn = true;
    }
    
    await displayDemoResults(results);
    
  } catch (error) {
    console.error(chalk.red('\nDemo failed:'), error.message);
    if (program.debug) {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
