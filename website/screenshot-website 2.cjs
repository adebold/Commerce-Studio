const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    // Screenshot the main website
    console.log('📸 Taking screenshot of the website...');
    await page.goto('https://commerce-studio-website-353252826752.us-central1.run.app', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for any animations or dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await page.screenshot({ path: 'website-screenshot.png', fullPage: true });
    console.log('✅ Screenshot saved as website-screenshot.png');
    
    // Get the page content to verify what's actually being served
    const content = await page.content();
    const title = await page.title();
    
    console.log('\n📋 Page Analysis:');
    console.log('Page title:', title);
    console.log('Page content preview (first 500 chars):', content.substring(0, 500));
    
    // Check if VARAi design system CSS is loaded
    const cssLoaded = await page.evaluate(() => {
      const link = document.querySelector('link[href*="varai-design-system.css"]');
      return link ? 'Found' : 'Not found';
    });
    console.log('VARAi Design System CSS:', cssLoaded);
    
    // Check if theme manager JS is loaded
    const jsLoaded = await page.evaluate(() => {
      const script = document.querySelector('script[src*="theme-manager.js"]');
      return script ? 'Found' : 'Not found';
    });
    console.log('Theme Manager JS:', jsLoaded);
    
    // Check for VARAi branding elements
    const brandingCheck = await page.evaluate(() => {
      const navbar = document.querySelector('.varai-navbar-brand');
      const hero = document.querySelector('.varai-hero');
      const cards = document.querySelectorAll('.varai-card');
      
      return {
        navbar: navbar ? navbar.textContent : 'Not found',
        hero: hero ? 'Found' : 'Not found',
        cardCount: cards.length
      };
    });
    
    console.log('\n🎨 VARAi Branding Check:');
    console.log('Navbar brand:', brandingCheck.navbar);
    console.log('Hero section:', brandingCheck.hero);
    console.log('VARAi cards found:', brandingCheck.cardCount);
    
    // Check for any console errors
    const logs = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    page.on('pageerror', error => logs.push(`PAGE ERROR: ${error.message}`));
    
    if (logs.length > 0) {
      console.log('\n⚠️ Console logs/errors:');
      logs.forEach(log => console.log(log));
    } else {
      console.log('\n✅ No console errors detected');
    }
    
  } catch (error) {
    console.error('❌ Error accessing website:', error.message);
    
    // Try to get more details about the error
    if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
      console.log('🔍 DNS resolution failed - website may not be deployed');
    } else if (error.message.includes('timeout')) {
      console.log('🔍 Request timed out - website may be slow to respond');
    }
  }
  
  await browser.close();
})();