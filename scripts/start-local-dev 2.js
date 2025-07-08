#!/usr/bin/env node

/**
 * Local Development Environment Starter
 * 
 * This script sets up and starts the local development environment
 * for the ML platform integration.
 * 
 * Usage:
 *   node start-local-dev.js [api-mode]
 * 
 * Examples:
 *   node start-local-dev.js httpbin  # Use httpbin.org as API endpoint
 *   node start-local-dev.js staging  # Use staging API endpoint
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Configuration
const API_MODES = ['httpbin', 'staging'];

// Parse command line arguments
const args = process.argv.slice(2);
const apiMode = args[0] || 'httpbin';

// Validate API mode
if (!API_MODES.includes(apiMode)) {
  console.error(`Error: Invalid API mode "${apiMode}"`);
  console.error(`Valid modes: ${API_MODES.join(', ')}`);
  process.exit(1);
}

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Track running processes
const processes = [];

/**
 * Main function
 */
async function start() {
  console.log(`\n${colors.bright}${colors.blue}🚀 Starting ML Integration Local Development Environment${colors.reset}\n`);
  
  try {
    // Configure environment based on API mode
    await configureEnvironment(apiMode);
    
    // Test API connectivity
    await testApiConnectivity(apiMode);
    
    // Start webhook server
    await startWebhookServer();
    
    console.log(`\n${colors.bright}${colors.green}✅ Local development environment is ready!${colors.reset}\n`);
    console.log('The following services are running:');
    console.log(`- Webhook Server: ${colors.cyan}http://localhost:8080${colors.reset}`);
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
 * Configure environment based on API mode
 */
async function configureEnvironment(apiMode) {
  console.log(`${colors.cyan}📋 Configuring environment for ${apiMode} mode...${colors.reset}`);
  
  const envFilePath = path.resolve(__dirname, '../src/ml/.env.local');
  
  let envContent;
  
  if (apiMode === 'httpbin') {
    envContent = `# ML Platform API Configuration for local development (httpbin mode)

# Using httpbin.org for API testing
ML_API_BASE_URL=https://httpbin.org

# API Key for testing
ML_API_KEY=test-key-local-development

# ML Client Configuration
ML_CLIENT_TIMEOUT=5000
ML_CLIENT_ENABLE_CACHE=true
ML_CLIENT_LOG_LEVEL=debug
`;
  } else if (apiMode === 'staging') {
    const stagingApiKey = await promptStagingApiKey();
    
    envContent = `# ML Platform API Configuration for local development (staging mode)

# Using staging API for ML functionality
ML_API_BASE_URL=https://staging-ml-api.eyewearml.com/api

# API Key for staging
ML_API_KEY=${stagingApiKey}

# ML Client Configuration
ML_CLIENT_TIMEOUT=5000
ML_CLIENT_ENABLE_CACHE=true
ML_CLIENT_LOG_LEVEL=debug
`;
  }
  
  // Write environment file
  fs.writeFileSync(envFilePath, envContent);
  console.log(`${colors.green}✅ Environment configured for ${apiMode} mode${colors.reset}`);
}

/**
 * Prompt for staging API key
 */
async function promptStagingApiKey() {
  const defaultKey = 'process.env.APIKEY_2581';
  
  return new Promise((resolve) => {
    rl.question(`Enter staging API key (default: ${defaultKey}): `, (answer) => {
      resolve(answer.trim() || defaultKey);
    });
  });
}

/**
 * Test API connectivity
 */
async function testApiConnectivity(apiMode) {
  console.log(`\n${colors.cyan}🔍 Testing API connectivity...${colors.reset}`);
  
  const testScript = apiMode === 'httpbin' ? 'test-httpbin.js' : 'test-ml-connection.js';
  const testArgs = apiMode === 'httpbin' ? [] : ['local'];
  
  try {
    execSync(`node scripts/${testScript} ${testArgs.join(' ')}`, { stdio: 'inherit' });
    console.log(`${colors.green}✅ API connectivity test passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}⚠️ API connectivity test failed${colors.reset}`);
    console.log('Continuing anyway - you can troubleshoot connectivity issues later');
  }
}

/**
 * Start webhook server
 */
async function startWebhookServer() {
  console.log(`\n${colors.cyan}🔌 Starting webhook server...${colors.reset}`);
  
  // Set environment variable for the webhook server
  const env = { 
    ...process.env, 
    NODE_ENV: 'local'
  };
  
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
    
    let buffer = '';
    
    webhookProcess.stdout.on('data', (data) => {
      buffer += data.toString();
      if (buffer.includes('Webhook service running') || buffer.includes('service running on port')) {
        clearTimeout(timeout);
        started = true;
        console.log(`${colors.green}✅ Webhook server started on port 8080${colors.reset}`);
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
    
    // Resolve after a short timeout even if we don't see the expected output
    setTimeout(() => {
      if (!started) {
        console.log(`${colors.yellow}⚠️ Webhook server may have started but confirmation message not detected${colors.reset}`);
        started = true;
        resolve();
      }
    }, 5000);
  });
}

/**
 * Set up handlers for process termination
 */
function setupTerminationHandlers() {
  process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}⚠️ Shutting down services...${colors.reset}`);
    killAllProcesses();
    rl.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log(`\n${colors.yellow}⚠️ Shutting down services...${colors.reset}`);
    killAllProcesses();
    rl.close();
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

// Start the local development environment
start();
