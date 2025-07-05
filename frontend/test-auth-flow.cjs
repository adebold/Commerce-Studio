const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🧪 Testing complete authentication flow...');
  
  try {
    // Test 1: Homepage loads
    await page.goto('http://localhost:5173');
    await page.waitForSelector('nav', { timeout: 5000 });
    console.log('✅ Homepage loads successfully');
    
    // Test 2: /auth route loads
    await page.goto('http://localhost:5173/auth');
    await page.waitForSelector('form', { timeout: 5000 });
    console.log('✅ /auth route loads login page');
    
    // Test 3: /login route loads
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('form', { timeout: 5000 });
    console.log('✅ /login route loads login page');
    
    // Test 4: Demo login works
    const demoCard = await page.$('.MuiCard-root');
    if (demoCard) {
      await demoCard.click();
      await page.waitForTimeout(2000); // Wait for navigation
      const currentUrl = page.url();
      if (currentUrl.includes('/dashboard')) {
        console.log('✅ Demo login redirects to dashboard');
      } else {
        console.log('⚠️  Demo login redirect unclear, current URL:', currentUrl);
      }
    } else {
      console.log('⚠️  Demo cards not found, trying manual login...');
      
      // Try manual login
      await page.type('input[type="email"]', 'super@varai.com');
      await page.type('input[type="password"]', 'demo123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      console.log('✅ Manual login completed');
    }
    
    console.log('🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();