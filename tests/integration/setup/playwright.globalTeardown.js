/**
 * Global teardown for Playwright tests
 * 
 * This file runs once after all Playwright tests.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.test' });

// Configuration
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';

// Admin credentials for teardown
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'process.env.PLAYWRIGHT_SECRET_4';

/**
 * Global teardown function
 */
async function globalTeardown() {
  console.log('🧹 Starting Playwright global teardown...');
  
  // Clean up test data if needed
  if (process.env.CLEAN_UI_TEST_DATA === 'true') {
    await cleanupUITestUsers();
  }
  
  // Generate test report if needed
  if (process.env.GENERATE_REPORT === 'true') {
    await generateTestReport();
  }
  
  console.log('✅ Playwright global teardown completed');
}

/**
 * Clean up UI test users
 */
async function cleanupUITestUsers() {
  console.log('🧹 Cleaning up UI test users...');
  
  try {
    // Login as admin
    const loginResponse = await axios.post(`${AUTH_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const adminToken = loginResponse.data.token;
    
    // Get UI test users from file
    const testUsersFile = path.resolve(__dirname, '../fixtures/ui-test-users.json');
    
    if (!fs.existsSync(testUsersFile)) {
      console.log('ℹ️ UI test users file not found, skipping cleanup');
      return;
    }
    
    const uiTestUsers = JSON.parse(fs.readFileSync(testUsersFile, 'utf8'));
    
    // Delete UI test users
    for (const user of uiTestUsers) {
      try {
        await axios.delete(`${AUTH_URL}/admin/users/${encodeURIComponent(user.email)}`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Deleted UI test user: ${user.email}`);
      } catch (error) {
        // If user doesn't exist, that's fine
        if (error.response?.status === 404) {
          console.log(`ℹ️ UI test user doesn't exist: ${user.email}`);
        } else {
          console.error(`❌ Failed to delete UI test user ${user.email}:`, error.response?.data || error.message);
        }
      }
    }
    
    // Delete the test users file
    fs.unlinkSync(testUsersFile);
    
    console.log('✅ UI test users cleaned up');
  } catch (error) {
    console.error('❌ Failed to clean up UI test users:', error.response?.data || error.message);
    // Don't throw error here, as we want the teardown to complete even if cleanup fails
  }
}

/**
 * Generate test report
 */
async function generateTestReport() {
  console.log('📊 Generating test report...');
  
  try {
    // Check if allure-commandline is installed
    const { execSync } = require('child_process');
    
    try {
      execSync('allure --version', { stdio: 'ignore' });
      
      // Generate Allure report
      execSync('allure generate --clean ./allure-results -o ./allure-report', {
        stdio: 'inherit'
      });
      
      console.log('✅ Test report generated');
      console.log('📊 To view the report, run: allure open ./allure-report');
    } catch (error) {
      console.log('ℹ️ Allure command-line tool not found, skipping report generation');
      console.log('ℹ️ To install Allure, run: npm install -g allure-commandline');
    }
  } catch (error) {
    console.error('❌ Failed to generate test report:', error);
  }
}

/**
 * Clean up test artifacts
 */
async function cleanupTestArtifacts() {
  console.log('🧹 Cleaning up test artifacts...');
  
  try {
    // Clean up screenshots and videos older than 7 days
    const screenshotsDir = path.resolve(__dirname, '../test-results/screenshots');
    const videosDir = path.resolve(__dirname, '../test-results/videos');
    
    if (fs.existsSync(screenshotsDir)) {
      cleanupOldFiles(screenshotsDir, 7);
    }
    
    if (fs.existsSync(videosDir)) {
      cleanupOldFiles(videosDir, 7);
    }
    
    console.log('✅ Test artifacts cleaned up');
  } catch (error) {
    console.error('❌ Failed to clean up test artifacts:', error);
  }
}

/**
 * Clean up old files in a directory
 */
function cleanupOldFiles(directory, daysOld) {
  const files = fs.readdirSync(directory);
  const now = new Date().getTime();
  const cutoff = now - (daysOld * 24 * 60 * 60 * 1000);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile() && stats.mtimeMs < cutoff) {
      fs.unlinkSync(filePath);
      console.log(`🧹 Deleted old file: ${filePath}`);
    }
  }
}

module.exports = globalTeardown;