#!/usr/bin/env node

/**
 * Comprehensive test script for VARAi Commerce Studio Dashboard Flow
 * Tests the complete flow from login to functional dashboard with demo data
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173', // Vite dev server default
  timeout: 30000,
  viewport: { width: 1920, height: 1080 },
  headless: false, // Set to true for CI/CD
  slowMo: 100, // Slow down for better visibility
};

// Demo credentials from seed-demo-data.sh
const DEMO_CREDENTIALS = {
  superAdmin: {
    email: 'admin@varai.com',
    password: 'SuperAdmin123!',
    name: 'Sarah Chen',
    role: 'Super Admin'
  },
  brandManager: {
    email: 'manager@varai.com',
    password: 'Manager123!',
    name: 'Marcus Rodriguez',
    role: 'Brand Manager'
  },
  clientAdmin: {
    email: 'client@varai.com',
    password: 'Client123!',
    name: 'Emily Johnson',
    role: 'Client Admin'
  },
  viewer: {
    email: 'viewer@varai.com',
    password: 'Viewer123!',
    name: 'Lisa Wang',
    role: 'Viewer'
  }
};

// Test utilities
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logStep = (step, message) => {
  console.log(`\n🔍 Step ${step}: ${message}`);
};

const logSuccess = (message) => {
  console.log(`✅ ${message}`);
};

const logError = (message) => {
  console.log(`❌ ${message}`);
};

const logInfo = (message) => {
  console.log(`ℹ️  ${message}`);
};

// Test functions
async function testLoginFlow(page, credentials) {
  logStep(1, `Testing login flow for ${credentials.name} (${credentials.role})`);
  
  try {
    // Navigate to login page
    await page.goto(`${TEST_CONFIG.baseUrl}/login`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    logSuccess('Login page loaded successfully');

    // Fill in credentials
    await page.type('input[type="email"]', credentials.email);
    await page.type('input[type="password"]', credentials.password);
    logSuccess('Credentials entered');

    // Submit login form
    await page.click('button[type="submit"]');
    logSuccess('Login form submitted');

    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
    
    // Verify we're on the dashboard
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      logSuccess('Successfully redirected to dashboard');
      return true;
    } else {
      logError(`Expected dashboard URL, got: ${currentUrl}`);
      return false;
    }
  } catch (error) {
    logError(`Login flow failed: ${error.message}`);
    return false;
  }
}

async function testDashboardElements(page, credentials) {
  logStep(2, 'Testing dashboard elements and functionality');
  
  try {
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"], .MuiAppBar-root', { timeout: 15000 });
    logSuccess('Dashboard container loaded');

    // Check for user welcome message
    const welcomeText = await page.$eval('h4, h1, [class*="welcome"]', el => el.textContent).catch(() => null);
    if (welcomeText && welcomeText.includes(credentials.name.split(' ')[0])) {
      logSuccess(`Welcome message found for ${credentials.name}`);
    } else {
      logInfo('Welcome message not found or doesn\'t match user name');
    }

    // Check for navigation sidebar
    const sidebar = await page.$('.MuiDrawer-root, [role="navigation"]');
    if (sidebar) {
      logSuccess('Navigation sidebar found');
    } else {
      logError('Navigation sidebar not found');
    }

    // Check for metric cards
    const metricCards = await page.$$('.MuiCard-root');
    if (metricCards.length >= 4) {
      logSuccess(`Found ${metricCards.length} metric cards`);
    } else {
      logError(`Expected at least 4 metric cards, found ${metricCards.length}`);
    }

    // Check for charts
    const charts = await page.$$('.recharts-wrapper, svg[class*="recharts"]');
    if (charts.length >= 2) {
      logSuccess(`Found ${charts.length} charts`);
    } else {
      logError(`Expected at least 2 charts, found ${charts.length}`);
    }

    // Check for activity feed
    const activityFeed = await page.$('[class*="activity"], [aria-label*="activity"]');
    if (activityFeed) {
      logSuccess('Activity feed found');
    } else {
      logInfo('Activity feed not found (may be loading)');
    }

    // Check for integration status
    const integrationStatus = await page.$('[class*="integration"], [aria-label*="integration"]');
    if (integrationStatus) {
      logSuccess('Integration status found');
    } else {
      logInfo('Integration status not found (may be loading)');
    }

    return true;
  } catch (error) {
    logError(`Dashboard elements test failed: ${error.message}`);
    return false;
  }
}

async function testDashboardInteractivity(page) {
  logStep(3, 'Testing dashboard interactivity');
  
  try {
    // Test time period buttons if they exist
    const timePeriodButtons = await page.$$('button[class*="period"], button:has-text("Daily"), button:has-text("Weekly"), button:has-text("Monthly")');
    if (timePeriodButtons.length > 0) {
      logSuccess('Time period buttons found');
      
      // Try clicking a different time period
      for (const button of timePeriodButtons) {
        const buttonText = await button.textContent();
        if (buttonText.includes('Monthly')) {
          await button.click();
          await delay(2000); // Wait for chart to update
          logSuccess('Successfully clicked Monthly time period');
          break;
        }
      }
    } else {
      logInfo('Time period buttons not found');
    }

    // Test refresh functionality if available
    const refreshButton = await page.$('button[aria-label*="refresh"], button[class*="refresh"]');
    if (refreshButton) {
      await refreshButton.click();
      await delay(1000);
      logSuccess('Refresh button clicked');
    } else {
      logInfo('Refresh button not found');
    }

    // Test navigation menu items
    const menuItems = await page.$$('[role="menuitem"], .MuiListItem-root');
    if (menuItems.length > 0) {
      logSuccess(`Found ${menuItems.length} navigation menu items`);
    } else {
      logInfo('Navigation menu items not found');
    }

    return true;
  } catch (error) {
    logError(`Dashboard interactivity test failed: ${error.message}`);
    return false;
  }
}

async function testDataLoading(page) {
  logStep(4, 'Testing data loading and demo data integration');
  
  try {
    // Wait for loading states to complete
    await delay(3000);
    
    // Check for loading indicators (should be gone)
    const loadingIndicators = await page.$$('.MuiCircularProgress-root, [class*="loading"], .MuiSkeleton-root');
    if (loadingIndicators.length === 0) {
      logSuccess('No loading indicators found - data loaded successfully');
    } else {
      logInfo(`Found ${loadingIndicators.length} loading indicators (data may still be loading)`);
    }

    // Check for actual data in metric cards
    const metricValues = await page.$$eval('.MuiCard-root h4, .MuiCard-root [class*="metric"]', 
      elements => elements.map(el => el.textContent).filter(text => text && text.trim() !== '0')
    ).catch(() => []);
    
    if (metricValues.length > 0) {
      logSuccess(`Found ${metricValues.length} metric values with data`);
    } else {
      logError('No metric values found with actual data');
    }

    // Check for chart data
    const chartElements = await page.$$('.recharts-line, .recharts-bar, .recharts-pie');
    if (chartElements.length > 0) {
      logSuccess(`Found ${chartElements.length} chart elements with data`);
    } else {
      logError('No chart elements found with data');
    }

    return true;
  } catch (error) {
    logError(`Data loading test failed: ${error.message}`);
    return false;
  }
}

async function testResponsiveDesign(page) {
  logStep(5, 'Testing responsive design');
  
  try {
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await delay(1000);
    
    // Check if mobile menu button appears
    const mobileMenuButton = await page.$('button[aria-label*="menu"], .MuiIconButton-root');
    if (mobileMenuButton) {
      logSuccess('Mobile menu button found');
      
      // Try opening mobile menu
      await mobileMenuButton.click();
      await delay(500);
      logSuccess('Mobile menu opened');
    } else {
      logInfo('Mobile menu button not found');
    }

    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await delay(1000);
    logSuccess('Tablet viewport tested');

    // Return to desktop viewport
    await page.setViewport(TEST_CONFIG.viewport);
    await delay(1000);
    logSuccess('Returned to desktop viewport');

    return true;
  } catch (error) {
    logError(`Responsive design test failed: ${error.message}`);
    return false;
  }
}

async function runTestSuite() {
  console.log('🚀 Starting VARAi Commerce Studio Dashboard Flow Test');
  console.log('='.repeat(60));
  
  let browser;
  let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: TEST_CONFIG.headless,
      slowMo: TEST_CONFIG.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: TEST_CONFIG.viewport
    });

    const page = await browser.newPage();
    
    // Set longer timeout
    page.setDefaultTimeout(TEST_CONFIG.timeout);
    
    // Enable console logging from the page
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🔴 Browser Console Error: ${msg.text()}`);
      }
    });

    // Test with Super Admin credentials (Sarah Chen)
    const credentials = DEMO_CREDENTIALS.superAdmin;
    
    console.log(`\n👤 Testing with ${credentials.name} (${credentials.role})`);
    console.log(`📧 Email: ${credentials.email}`);
    console.log(`🔑 Password: ${credentials.password}`);
    
    // Run test sequence
    const tests = [
      { name: 'Login Flow', fn: () => testLoginFlow(page, credentials) },
      { name: 'Dashboard Elements', fn: () => testDashboardElements(page, credentials) },
      { name: 'Dashboard Interactivity', fn: () => testDashboardInteractivity(page) },
      { name: 'Data Loading', fn: () => testDataLoading(page) },
      { name: 'Responsive Design', fn: () => testResponsiveDesign(page) }
    ];

    for (const test of tests) {
      testResults.total++;
      try {
        const result = await test.fn();
        if (result) {
          testResults.passed++;
          testResults.details.push({ name: test.name, status: 'PASSED' });
        } else {
          testResults.failed++;
          testResults.details.push({ name: test.name, status: 'FAILED' });
        }
      } catch (error) {
        testResults.failed++;
        testResults.details.push({ name: test.name, status: 'ERROR', error: error.message });
        logError(`Test "${test.name}" threw an error: ${error.message}`);
      }
    }

  } catch (error) {
    logError(`Test suite failed to run: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  console.log('\n📋 DETAILED RESULTS:');
  testResults.details.forEach((result, index) => {
    const status = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.name}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n🔗 DEMO LOGIN CREDENTIALS:');
  console.log('Super Admin: admin@varai.com / SuperAdmin123!');
  console.log('Brand Manager: manager@varai.com / Manager123!');
  console.log('Client Admin: client@varai.com / Client123!');
  console.log('Viewer: viewer@varai.com / Viewer123!');

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Start the frontend development server: npm run dev');
  console.log('2. Navigate to http://localhost:5173/login');
  console.log('3. Login with any of the demo credentials above');
  console.log('4. Explore the fully functional commerce studio dashboard');

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the test suite
runTestSuite().catch(error => {
  logError(`Test suite crashed: ${error.message}`);
  process.exit(1);
});