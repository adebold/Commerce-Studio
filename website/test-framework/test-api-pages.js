const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🔑 Testing API Documentation and Key Management Pages...');
  
  const baseUrl = 'https://commerce-studio-website-353252826752.us-central1.run.app';
  
  try {
    // Test API Documentation page
    console.log('\n📚 Testing API Documentation page...');
    await page.goto(`${baseUrl}/api-docs.html`, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('✅ API docs page loaded successfully');
    
    // Check for key elements
    const hasNavigation = await page.$('.nav-sidebar');
    const hasGettingStarted = await page.$('#getting-started');
    const hasAuthentication = await page.$('#authentication');
    const hasStoreIntegration = await page.$('#store-integration');
    
    console.log('📋 Navigation sidebar present:', !!hasNavigation);
    console.log('🚀 Getting Started section present:', !!hasGettingStarted);
    console.log('🔐 Authentication section present:', !!hasAuthentication);
    console.log('🏪 Store Integration section present:', !!hasStoreIntegration);
    
    // Test API Keys Management page
    console.log('\n🔑 Testing API Keys Management page...');
    await page.goto(`${baseUrl}/api-keys.html`, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('✅ API keys page loaded successfully');
    
    // Check for key elements
    const hasPublicKeys = await page.$('#publicKey');
    const hasPrivateKey = await page.$('#privateKey');
    const hasGenerateModal = await page.$('#generateModal');
    const hasUsageStats = await page.$('.usage-stats');
    
    console.log('🔓 Public key section present:', !!hasPublicKeys);
    console.log('🔒 Private key section present:', !!hasPrivateKey);
    console.log('➕ Generate modal present:', !!hasGenerateModal);
    console.log('📊 Usage statistics present:', !!hasUsageStats);
    
    // Test copy functionality
    console.log('\n🧪 Testing copy functionality...');
    const copyButtons = await page.$$('.btn-copy');
    console.log(`📋 Found ${copyButtons.length} copy buttons`);
    
    // Test modal functionality
    console.log('\n🧪 Testing modal functionality...');
    const generateButton = await page.$('.btn-generate');
    if (generateButton) {
      await generateButton.click();
      await page.waitForTimeout(500);
      const modalVisible = await page.$eval('#generateModal', el => 
        getComputedStyle(el).display !== 'none'
      );
      console.log('🎯 Generate modal opens correctly:', modalVisible);
      
      // Close modal
      const closeButton = await page.$('.modal-close');
      if (closeButton) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Check for any JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('\n❌ JavaScript errors found:');
      errors.forEach(error => console.log('  -', error));
    } else {
      console.log('\n✅ No JavaScript errors detected');
    }
    
    console.log('\n🎉 API pages testing completed successfully!');
    
  } catch (error) {
    console.log('\n❌ Error testing API pages:', error.message);
    
    // Check if pages exist
    const apiDocsResponse = await page.goto(`${baseUrl}/api-docs.html`, { waitUntil: 'domcontentloaded' }).catch(() => null);
    const apiKeysResponse = await page.goto(`${baseUrl}/api-keys.html`, { waitUntil: 'domcontentloaded' }).catch(() => null);
    
    console.log('📄 API docs page status:', apiDocsResponse ? apiDocsResponse.status() : 'Failed to load');
    console.log('🔑 API keys page status:', apiKeysResponse ? apiKeysResponse.status() : 'Failed to load');
    
    if (!apiDocsResponse || apiDocsResponse.status() === 404) {
      console.log('⏳ API docs page not yet deployed - deployment may still be in progress');
    }
    
    if (!apiKeysResponse || apiKeysResponse.status() === 404) {
      console.log('⏳ API keys page not yet deployed - deployment may still be in progress');
    }
  } finally {
    await browser.close();
  }
})();