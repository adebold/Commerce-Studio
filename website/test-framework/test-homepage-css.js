const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🏠 Testing Homepage CSS and Visual State...');
  
  try {
    await page.goto('https://commerce-studio-website-353252826752.us-central1.run.app/', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('✅ Homepage loaded successfully');
    
    // Check if CSS files are loaded
    const cssFiles = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.map(link => ({
        href: link.href,
        loaded: link.sheet !== null
      }));
    });
    
    console.log('\n📄 CSS Files Status:');
    cssFiles.forEach(css => {
      console.log(`  ${css.loaded ? '✅' : '❌'} ${css.href}`);
    });
    
    // Check if key elements have proper styling
    const elementStyles = await page.evaluate(() => {
      const hero = document.querySelector('.varai-hero');
      const navbar = document.querySelector('.varai-navbar');
      const container = document.querySelector('.varai-container');
      
      return {
        hero: hero ? {
          exists: true,
          backgroundColor: getComputedStyle(hero).backgroundColor,
          padding: getComputedStyle(hero).padding,
          display: getComputedStyle(hero).display
        } : { exists: false },
        navbar: navbar ? {
          exists: true,
          backgroundColor: getComputedStyle(navbar).backgroundColor,
          position: getComputedStyle(navbar).position,
          zIndex: getComputedStyle(navbar).zIndex
        } : { exists: false },
        container: container ? {
          exists: true,
          maxWidth: getComputedStyle(container).maxWidth,
          margin: getComputedStyle(container).margin
        } : { exists: false }
      };
    });
    
    console.log('\n🎨 Element Styling:');
    console.log('Hero Section:', elementStyles.hero.exists ? '✅ Found' : '❌ Missing');
    if (elementStyles.hero.exists) {
      console.log(`  Background: ${elementStyles.hero.backgroundColor}`);
      console.log(`  Padding: ${elementStyles.hero.padding}`);
    }
    
    console.log('Navbar:', elementStyles.navbar.exists ? '✅ Found' : '❌ Missing');
    if (elementStyles.navbar.exists) {
      console.log(`  Background: ${elementStyles.navbar.backgroundColor}`);
      console.log(`  Position: ${elementStyles.navbar.position}`);
    }
    
    console.log('Container:', elementStyles.container.exists ? '✅ Found' : '❌ Missing');
    if (elementStyles.container.exists) {
      console.log(`  Max Width: ${elementStyles.container.maxWidth}`);
    }
    
    // Check for JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('\n❌ JavaScript errors found:');
      errors.forEach(error => console.log('  -', error));
    } else {
      console.log('\n✅ No JavaScript errors detected');
    }
    
    // Check if fonts are loading
    const fontStatus = await page.evaluate(() => {
      return document.fonts.status;
    });
    
    console.log(`\n🔤 Font Status: ${fontStatus}`);
    
    // Take a screenshot for debugging
    await page.screenshot({ 
      path: 'homepage-debug.png', 
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved as homepage-debug.png');
    
    // Check specific VARAi classes
    const varaiClasses = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="varai-"]');
      const classes = new Set();
      elements.forEach(el => {
        el.classList.forEach(cls => {
          if (cls.startsWith('varai-')) {
            classes.add(cls);
          }
        });
      });
      return Array.from(classes).slice(0, 10); // First 10 classes
    });
    
    console.log('\n🏷️ VARAi Classes Found:', varaiClasses.length > 0 ? '✅' : '❌');
    if (varaiClasses.length > 0) {
      console.log('  Sample classes:', varaiClasses.join(', '));
    }
    
  } catch (error) {
    console.log('\n❌ Error testing homepage:', error.message);
  } finally {
    await browser.close();
  }
})();