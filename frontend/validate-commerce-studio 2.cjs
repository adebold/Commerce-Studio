const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function validateCommerceStudio() {
  console.log('🚀 Starting Commerce Studio validation...');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => {
      console.log(`🌐 Browser Console [${msg.type()}]:`, msg.text());
    });
    
    // Enable error logging
    page.on('pageerror', error => {
      console.error('❌ Page Error:', error.message);
    });

    // Navigate to the Commerce Studio
    console.log('📍 Navigating to http://localhost:5173/');
    await page.goto('http://localhost:5173/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait for the page to load and redirect
    await page.waitForTimeout(2000);
    
    // Check if we're on the Commerce Studio page
    const currentUrl = page.url();
    console.log('🔗 Current URL:', currentUrl);
    
    // Take screenshot of the main page
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, 'commerce-studio-main.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot saved: commerce-studio-main.png');

    // Check for key elements
    console.log('🔍 Checking for key Commerce Studio elements...');
    
    // Check for dashboard title
    const dashboardTitle = await page.$eval('h1', el => el.textContent).catch(() => null);
    console.log('📊 Dashboard Title:', dashboardTitle);
    
    // Check for KPI cards
    const kpiCards = await page.$$('[role="region"][aria-label*="metric"]');
    console.log('📈 KPI Cards found:', kpiCards.length);
    
    // Check for charts/visualizations
    const charts = await page.$$('canvas, svg').catch(() => []);
    console.log('📊 Charts/Visualizations found:', charts.length);
    
    // Check for Material-UI components
    const muiComponents = await page.$$('.MuiCard-root, .MuiTypography-root, .MuiButton-root');
    console.log('🎨 MUI Components found:', muiComponents.length);

    // Test navigation to settings
    console.log('🔧 Testing navigation to settings...');
    await page.goto('http://localhost:5173/commerce-studio/settings', { 
      waitUntil: 'networkidle2',
      timeout: 15000 
    });
    
    await page.waitForTimeout(2000);
    
    // Take screenshot of settings page
    await page.screenshot({ 
      path: path.join(screenshotDir, 'commerce-studio-settings.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot saved: commerce-studio-settings.png');
    
    // Check settings page elements
    const settingsTitle = await page.$eval('h1', el => el.textContent).catch(() => null);
    console.log('⚙️ Settings Title:', settingsTitle);
    
    const settingsNavItems = await page.$$('[role="menuitem"]');
    console.log('📋 Settings Navigation Items:', settingsNavItems.length);

    // Test responsive design
    console.log('📱 Testing responsive design...');
    await page.setViewport({ width: 768, height: 1024 }); // Tablet
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, 'commerce-studio-tablet.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot saved: commerce-studio-tablet.png');
    
    await page.setViewport({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, 'commerce-studio-mobile.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot saved: commerce-studio-mobile.png');

    // Performance metrics
    const performanceMetrics = await page.metrics();
    console.log('⚡ Performance Metrics:');
    console.log(`   - JS Heap Used: ${Math.round(performanceMetrics.JSHeapUsedSize / 1024 / 1024)}MB`);
    console.log(`   - JS Heap Total: ${Math.round(performanceMetrics.JSHeapTotalSize / 1024 / 1024)}MB`);
    console.log(`   - DOM Nodes: ${performanceMetrics.Nodes}`);

    // Accessibility check
    console.log('♿ Checking accessibility...');
    const ariaLabels = await page.$$('[aria-label]');
    const roles = await page.$$('[role]');
    console.log(`   - Elements with aria-label: ${ariaLabels.length}`);
    console.log(`   - Elements with role: ${roles.length}`);

    console.log('✅ Commerce Studio validation completed successfully!');
    
    return {
      success: true,
      url: currentUrl,
      dashboardTitle,
      kpiCards: kpiCards.length,
      charts: charts.length,
      muiComponents: muiComponents.length,
      settingsTitle,
      settingsNavItems: settingsNavItems.length,
      performanceMetrics,
      accessibility: {
        ariaLabels: ariaLabels.length,
        roles: roles.length
      }
    };

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// Run validation
validateCommerceStudio()
  .then(result => {
    console.log('\n📋 VALIDATION SUMMARY:');
    console.log('='.repeat(50));
    if (result.success) {
      console.log('✅ Status: SUCCESS');
      console.log(`🔗 URL: ${result.url}`);
      console.log(`📊 Dashboard: ${result.dashboardTitle}`);
      console.log(`📈 KPI Cards: ${result.kpiCards}`);
      console.log(`📊 Charts: ${result.charts}`);
      console.log(`🎨 MUI Components: ${result.muiComponents}`);
      console.log(`⚙️ Settings: ${result.settingsTitle}`);
      console.log(`📋 Settings Nav: ${result.settingsNavItems}`);
      console.log(`♿ Accessibility: ${result.accessibility.ariaLabels} aria-labels, ${result.accessibility.roles} roles`);
      console.log('📸 Screenshots saved in ./screenshots/');
    } else {
      console.log('❌ Status: FAILED');
      console.log(`💥 Error: ${result.error}`);
    }
    console.log('='.repeat(50));
  })
  .catch(console.error);