import puppeteer from 'puppeteer';

async function testHomepage() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });
  
  // Listen for errors
  page.on('error', err => {
    console.log('Browser error:', err.message);
  });
  
  // Listen for page errors
  page.on('pageerror', err => {
    console.log('Page error:', err.message);
  });
  
  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Wait a bit for React to render
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if the root element has content
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        hasContent: root && root.innerHTML.length > 0,
        innerHTML: root ? root.innerHTML.substring(0, 500) : 'No root element',
        childrenCount: root ? root.children.length : 0
      };
    });
    
    console.log('Root element analysis:', rootContent);
    
    // Check for specific homepage elements
    const homepageElements = await page.evaluate(() => {
      return {
        hasH1: document.querySelector('h1') !== null,
        h1Text: document.querySelector('h1')?.textContent || 'No H1 found',
        hasButtons: document.querySelectorAll('button').length,
        hasNavigation: document.querySelector('nav') !== null,
        hasLoginButton: document.querySelector('a[href="/demo-login.html"]') !== null,
        navigationLinks: Array.from(document.querySelectorAll('nav a, nav button')).map(el => el.textContent?.trim()),
        bodyClasses: document.body.className,
        totalElements: document.querySelectorAll('*').length
      };
    });
    
    console.log('Homepage elements:', homepageElements);
    
    // Take a screenshot
    await page.screenshot({ path: 'homepage-test.png', fullPage: true });
    console.log('Screenshot saved as homepage-test.png');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testHomepage();