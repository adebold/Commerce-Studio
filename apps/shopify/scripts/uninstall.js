#!/usr/bin/env node
/**
 * Uninstallation script for the EyewearML Shopify integration.
 * This script:
 * 1. Removes theme components
 * 2. Cleans up environment files
 * 3. Removes generated data
 * 4. Optionally removes dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { program } = require('commander');

async function confirmUninstall() {
  console.log(chalk.bold('\nEyewearML Shopify Integration Uninstaller\n'));
  console.log(chalk.yellow('Warning: This will remove the EyewearML integration from your Shopify store.'));
  
  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Are you sure you want to uninstall?',
      default: false
    }
  ]);
  
  if (!proceed) {
    console.log(chalk.green('\nUninstallation cancelled.'));
    process.exit(0);
  }
  
  const { options } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'options',
      message: 'Select uninstallation options:',
      choices: [
        {
          name: 'Remove theme components',
          value: 'theme',
          checked: true
        },
        {
          name: 'Remove environment files',
          value: 'env',
          checked: true
        },
        {
          name: 'Remove generated data',
          value: 'data',
          checked: true
        },
        {
          name: 'Remove dependencies',
          value: 'deps',
          checked: false
        }
      ]
    }
  ]);
  
  return options;
}

async function removeThemeComponents() {
  const spinner = ora('Removing theme components...').start();
  
  try {
    // Load environment variables
    require('dotenv').config();
    
    const { Shopify } = require('@shopify/shopify-api');
    const shopify = new Shopify({
      shopName: process.env.SHOP_NAME,
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
      apiVersion: process.env.SHOPIFY_API_VERSION
    });
    
    // Get main theme
    const themes = await shopify.theme.list();
    const mainTheme = themes.find(t => t.role === 'main');
    
    if (mainTheme) {
      // Remove virtual try-on component
      await shopify.asset.delete({
        theme_id: mainTheme.id,
        key: 'process.env.UNINSTALL_SECRET'
      });
    }
    
    spinner.succeed('Theme components removed');
    
  } catch (error) {
    spinner.fail(`Failed to remove theme components: ${error.message}`);
    if (program.debug) {
      console.error(error);
    }
  }
}

async function removeEnvironmentFiles() {
  const spinner = ora('Removing environment files...').start();
  
  try {
    const envFile = path.join(__dirname, '../.env');
    if (fs.existsSync(envFile)) {
      fs.unlinkSync(envFile);
    }
    
    spinner.succeed('Environment files removed');
    
  } catch (error) {
    spinner.fail(`Failed to remove environment files: ${error.message}`);
    if (program.debug) {
      console.error(error);
    }
  }
}

async function removeGeneratedData() {
  const spinner = ora('Removing generated data...').start();
  
  try {
    const dataDir = path.join(__dirname, '../data');
    if (fs.existsSync(dataDir)) {
      fs.rmSync(dataDir, { recursive: true, force: true });
    }
    
    const logsDir = path.join(__dirname, '../logs');
    if (fs.existsSync(logsDir)) {
      fs.rmSync(logsDir, { recursive: true, force: true });
    }
    
    spinner.succeed('Generated data removed');
    
  } catch (error) {
    spinner.fail(`Failed to remove generated data: ${error.message}`);
    if (program.debug) {
      console.error(error);
    }
  }
}

async function removeDependencies() {
  const spinner = ora('Removing dependencies...').start();
  
  try {
    // Remove node_modules and package-lock.json
    const nodeModules = path.join(__dirname, '../node_modules');
    const packageLock = path.join(__dirname, '../package-lock.json');
    
    if (fs.existsSync(nodeModules)) {
      fs.rmSync(nodeModules, { recursive: true, force: true });
    }
    
    if (fs.existsSync(packageLock)) {
      fs.unlinkSync(packageLock);
    }
    
    spinner.succeed('Dependencies removed');
    
  } catch (error) {
    spinner.fail(`Failed to remove dependencies: ${error.message}`);
    if (program.debug) {
      console.error(error);
    }
  }
}

async function main() {
  try {
    // Get uninstallation options
    const options = await confirmUninstall();
    
    // Remove theme components
    if (options.includes('theme')) {
      await removeThemeComponents();
    }
    
    // Remove environment files
    if (options.includes('env')) {
      await removeEnvironmentFiles();
    }
    
    // Remove generated data
    if (options.includes('data')) {
      await removeGeneratedData();
    }
    
    // Remove dependencies
    if (options.includes('deps')) {
      await removeDependencies();
    }
    
    console.log(chalk.green('\n✨ Uninstallation completed successfully!\n'));
    
    // Show next steps
    console.log(chalk.bold('Next Steps:'));
    console.log('1. Remove the app from your Shopify admin:');
    console.log('   Apps > EyewearML > Remove app');
    
    if (!options.includes('deps')) {
      console.log('\n2. To completely remove all files, run:');
      console.log('   npm run uninstall:app -- --remove-deps');
    }
    
  } catch (error) {
    console.error(chalk.red('\nUninstallation failed:'), error.message);
    if (program.debug) {
      console.error(error);
    }
    process.exit(1);
  }
}

program
  .option('-d, --debug', 'Enable debug logging')
  .option('--remove-deps', 'Remove dependencies')
  .parse(process.argv);

// If --remove-deps flag is set, add it to inquirer choices default
if (program.removeDeps) {
  process.env.REMOVE_DEPS = 'true';
}

main();
