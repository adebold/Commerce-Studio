#!/usr/bin/env node

/**
 * ML Integration Startup Script
 * 
 * This script automates the setup process for the ML platform integration,
 * starting all necessary components for local development.
 * 
 * Usage:
 *   node start-ml-integration.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT_ML_API = 5000;
const PORT_WEBHOOK = 8080;
const ENV = 'local';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Track running processes
const processes = [];

/**
 * Main function
 */
async function start() {
  console.log(`\n${colors.bright}${colors.blue}🚀 Starting ML Integration Development Environment${colors.reset}\n`);
  
  try {
    // Check environment file
    await checkEnvFile();
    
    // Install dependencies if needed
    await installDependencies();
    
    // Start ML API server
    await startMLApiServer();
    
    // Verify ML setup
    await verifyMLSetup();
    
    // Start webhook server
    await startWebhookServer();
    
    console.log(`\n${colors.bright}${colors.green}✅ ML Integration development environment is ready!${colors.reset}\n`);
    console.log('The following services are running:');
    console.log(`- ML API Server: ${colors.cyan}http://localhost:${PORT_ML_API}${colors.reset}`);
    console.log(`- Webhook Server: ${colors.cyan}http://localhost:${PORT_WEBHOOK}${colors.reset}`);
    console.log('\nPress Ctrl+C to stop all services\n');
    
    // Handle process termination
    setupTerminationHandlers();
  } catch (error) {
    console.error(`\n${colors.bright}${colors.red}❌ Startup failed:${colors.reset} ${error.message}`);
    killAllProcesses();
    process.exit(1);
  }
}

/**
 * Check for environment file
 */
async function checkEnvFile() {
  console.log(`${colors.cyan}📋 Checking environment configuration...${colors.reset}`);
  
  const envFilePath = path.resolve(__dirname, `../src/ml/.env.${ENV}`);
  
  if (!fs.existsSync(envFilePath)) {
    console.log(`${colors.yellow}⚠️ Environment file not found. Creating default local environment.${colors.reset}`);
    
    const defaultContent = `# ML Platform API Configuration for local development

# Base URL for the ML API (local mock server)
ML_API_BASE_URL=http://localhost:${PORT_ML_API}/api

# API Key for authentication (local development key)
ML_API_KEY=local-dev-key

# ML Client Configuration
ML_CLIENT_TIMEOUT=5000
ML_CLIENT_ENABLE_CACHE=true
ML_CLIENT_LOG_LEVEL=debug
`;
    
    fs.writeFileSync(envFilePath, defaultContent);
    console.log(`${colors.green}✅ Created environment file: ${envFilePath}${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Environment file exists: ${envFilePath}${colors.reset}`);
  }
}

/**
 * Install dependencies if needed
 */
async function installDependencies() {
  console.log(`${colors.cyan}📦 Checking dependencies...${colors.reset}`);
  
  // Check if express is installed (needed for ML API server)
  try {
    require.resolve('express');
    console.log(`${colors.green}✅ Express is installed${colors.reset}`);
  } catch (e) {
    console.log(`${colors.yellow}⚠️ Installing required dependencies...${colors.reset}`);
    
    // Run npm install for required packages
    await runCommand('npm', ['install', 'express', 'cors', 'body-parser', 'dotenv'], {
      cwd: process.cwd(),
      stdio: 'inherit'
    });
    
    console.log(`${colors.green}✅ Dependencies installed${colors.reset}`);
  }
}

/**
 * Start the mock ML API server
 */
async function startMLApiServer() {
  console.log(`${colors.cyan}🔌 Starting ML API server...${colors.reset}`);
  
  const serverProcess = spawn('node', ['scripts/start-local-ml-api.js', PORT_ML_API], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });
  
  processes.push(serverProcess);
  
  // Set up logging
  serverProcess.stdout.on('data', (data) => {
    console.log(`${colors.dim}[ML API] ${data.toString().trim()}${colors.reset}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`${colors.dim}${colors.red}[ML API ERROR] ${data.toString().trim()}${colors.reset}`);
  });
  
  // Wait for server to start
  await new Promise((resolve, reject) => {
    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        reject(new Error('ML API server failed to start within timeout period'));
      }
    }, 10000);
    
    serverProcess.stdout.on('data', (data) => {
      if (data.toString().includes('ML API server running')) {
        clearTimeout(timeout);
        started = true;
        console.log(`${colors.green}✅ ML API server started on port ${PORT_ML_API}${colors.reset}`);
        resolve();
      }
    });
    
    serverProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start ML API server: ${err.message}`));
    });
    
    serverProcess.on('exit', (code) => {
      if (!started) {
        clearTimeout(timeout);
        reject(new Error(`ML API server exited with code ${code}`));
      }
    });
  });
}

/**
 * Verify ML setup
 */
async function verifyMLSetup() {
  console.log(`${colors.cyan}🔍 Verifying ML setup...${colors.reset}`);
  
  try {
    // Run the verification script
    const result = await runCommand('node', ['scripts/verify-ml-setup.js', ENV], {
      cwd: process.cwd(),
      stdio: 'inherit'
    });
    
    console.log(`${colors.green}✅ ML setup verified${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}⚠️ ML setup verification had issues${colors.reset}`);
    console.log('Continuing anyway - you can troubleshoot once all services are running');
  }
}

/**
 * Start the webhook server
 */
async function startWebhookServer() {
  console.log(`${colors.cyan}🔌 Starting webhook server...${colors.reset}`);
  
  // Set environment variable for the webhook server
  const env = { ...process.env, NODE_ENV: ENV };
  
  const webhookProcess = spawn('node', ['src/webhook/index.js'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    env,
    detached: false
  });
  
  processes.push(webhookProcess);
  
  // Set up logging
  webhookProcess.stdout.on('data', (data) => {
    console.log(`${colors.dim}[Webhook] ${data.toString().trim()}${colors.reset}`);
  });
  
  webhookProcess.stderr.on('data', (data) => {
    console.error(`${colors.dim}${colors.red}[Webhook ERROR] ${data.toString().trim()}${colors.reset}`);
  });
  
  // Wait for server to start
  await new Promise((resolve, reject) => {
    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        reject(new Error('Webhook server failed to start within timeout period'));
      }
    }, 10000);
    
    webhookProcess.stdout.on('data', (data) => {
      if (data.toString().includes('Webhook service running')) {
        clearTimeout(timeout);
        started = true;
        console.log(`${colors.green}✅ Webhook server started on port ${PORT_WEBHOOK}${colors.reset}`);
        resolve();
      }
    });
    
    webhookProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start webhook server: ${err.message}`));
    });
    
    webhookProcess.on('exit', (code) => {
      if (!started) {
        clearTimeout(timeout);
        reject(new Error(`Webhook server exited with code ${code}`));
      }
    });
  });
}

/**
 * Run a command and return a promise
 */
function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, options);
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command ${command} ${args.join(' ')} failed with code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Set up handlers for process termination
 */
function setupTerminationHandlers() {
  process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}⚠️ Shutting down services...${colors.reset}`);
    killAllProcesses();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log(`\n${colors.yellow}⚠️ Shutting down services...${colors.reset}`);
    killAllProcesses();
    process.exit(0);
  });
}

/**
 * Kill all running processes
 */
function killAllProcesses() {
  processes.forEach((proc) => {
    if (!proc.killed) {
      try {
        proc.kill();
      } catch (e) {
        // Ignore errors when killing processes
      }
    }
  });
}

// Start the integration
start();
