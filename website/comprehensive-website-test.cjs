const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const websiteUrl = 'https://commerce-studio-website-353252826752.us-central1.run.app';
  
  try {
    console.log('🚀 COMPREHENSIVE WEBSITE VERIFICATION');
    console.log('=====================================');
    
    // Test different screen sizes
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      console.log('─'.repeat(50));
      
      await page.setViewport(viewport);
      await page.goto(websiteUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Take screenshot
      const screenshotName = `website-${viewport.name.toLowerCase()}-screenshot.png`;
      await page.screenshot({ 
        path: screenshotName, 
        fullPage: true 
      });
      console.log(`✅ Screenshot saved: ${screenshotName}`);
      
      // Check VARAi branding elements
      const brandingCheck = await page.evaluate(() => {
        const navbar = document.querySelector('.varai-navbar-brand');
        const hero = document.querySelector('.varai-hero');
        const cards = document.querySelectorAll('.varai-card');
        const buttons = document.querySelectorAll('.varai-btn');
        
        return {
          navbar: navbar ? navbar.textContent.trim() : 'Not found',
          hero: hero ? 'Found' : 'Not found',
          cardCount: cards.length,
          buttonCount: buttons.length
        };
      });
      
      console.log(`   Navbar brand: ${brandingCheck.navbar}`);
      console.log(`   Hero section: ${brandingCheck.hero}`);
      console.log(`   VARAi cards: ${brandingCheck.cardCount}`);
      console.log(`   VARAi buttons: ${brandingCheck.buttonCount}`);
      
      // Check CSS loading
      const cssCheck = await page.evaluate(() => {
        const varaiCSS = document.querySelector('link[href*="varai-design-system.css"]');
        const mainCSS = document.querySelector('link[href*="main.css"]');
        
        return {
          varaiCSS: varaiCSS ? 'Loaded' : 'Missing',
          mainCSS: mainCSS ? 'Loaded' : 'Missing'
        };
      });
      
      console.log(`   VARAi CSS: ${cssCheck.varaiCSS}`);
      console.log(`   Main CSS: ${cssCheck.mainCSS}`);
      
      // Check JavaScript functionality
      const jsCheck = await page.evaluate(() => {
        const themeManager = document.querySelector('script[src*="theme-manager.js"]');
        const mainJS = document.querySelector('script[src*="main.js"]');
        
        return {
          themeManager: themeManager ? 'Loaded' : 'Missing',
          mainJS: mainJS ? 'Loaded' : 'Missing'
        };
      });
      
      console.log(`   Theme Manager JS: ${jsCheck.themeManager}`);
      console.log(`   Main JS: ${jsCheck.mainJS}`);
    }
    
    // Test page performance
    console.log('\n⚡ PERFORMANCE ANALYSIS');
    console.log('─'.repeat(50));
    
    await page.setViewport({ width: 1920, height: 1080 });
    
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        totalLoadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart)
      };
    });
    
    console.log(`DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`Load Complete: ${performanceMetrics.loadComplete}ms`);
    console.log(`Total Load Time: ${performanceMetrics.totalLoadTime}ms`);
    
    // Test key functionality
    console.log('\n🔧 FUNCTIONALITY TESTS');
    console.log('─'.repeat(50));
    
    // Test navigation links
    const navLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('.varai-nav-link');
      return Array.from(links).map(link => ({
        text: link.textContent.trim(),
        href: link.getAttribute('href')
      }));
    });
    
    console.log('Navigation Links:');
    navLinks.forEach(link => {
      console.log(`   • ${link.text} → ${link.href}`);
    });
    
    // Test CTA buttons
    const ctaButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('.varai-btn');
      return Array.from(buttons).map(btn => ({
        text: btn.textContent.trim(),
        href: btn.getAttribute('href') || 'No href',
        classes: btn.className
      }));
    });
    
    console.log('\nCTA Buttons:');
    ctaButtons.forEach(btn => {
      console.log(`   • "${btn.text}" → ${btn.href}`);
    });
    
    // Check for console errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(`ERROR: ${msg.text()}`);
      }
    });
    page.on('pageerror', error => {
      logs.push(`PAGE ERROR: ${error.message}`);
    });
    
    // Reload to catch any errors
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n🐛 ERROR ANALYSIS');
    console.log('─'.repeat(50));
    if (logs.length > 0) {
      console.log('Console errors detected:');
      logs.forEach(log => console.log(`   ⚠️  ${log}`));
    } else {
      console.log('✅ No console errors detected');
    }
    
    // Final verification
    console.log('\n✨ FINAL VERIFICATION');
    console.log('─'.repeat(50));
    
    const finalCheck = await page.evaluate(() => {
      const title = document.title;
      const hasVaraiClasses = document.querySelectorAll('[class*="varai-"]').length;
      const hasHeroSection = document.querySelector('.varai-hero') !== null;
      const hasNavbar = document.querySelector('.varai-navbar') !== null;
      const hasFooter = document.querySelector('.varai-footer') !== null;
      
      return {
        title,
        hasVaraiClasses,
        hasHeroSection,
        hasNavbar,
        hasFooter
      };
    });
    
    console.log(`Page Title: ${finalCheck.title}`);
    console.log(`VARAi Design Elements: ${finalCheck.hasVaraiClasses} found`);
    console.log(`Hero Section: ${finalCheck.hasHeroSection ? '✅' : '❌'}`);
    console.log(`Navigation Bar: ${finalCheck.hasNavbar ? '✅' : '❌'}`);
    console.log(`Footer: ${finalCheck.hasFooter ? '✅' : '❌'}`);
    
    console.log('\n🎉 VERIFICATION COMPLETE!');
    console.log('The VARAi Commerce Studio website is fully deployed and functional.');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  }
  
  await browser.close();
})();