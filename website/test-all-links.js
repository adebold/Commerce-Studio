const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Link Checker for VARAi Commerce Studio Website
 * Tests all internal and external links, takes screenshots, and generates a report
 */

class LinkChecker {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            passed: [],
            failed: [],
            external: [],
            screenshots: []
        };
        this.baseUrl = 'https://commerce-studio-website-353252826752.us-central1.run.app';
        this.localBaseUrl = 'http://localhost:8080';
        this.screenshotDir = './screenshots';
    }

    async init() {
        // Create screenshots directory
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }

        this.browser = await puppeteer.launch({
            headless: false, // Set to true for CI/CD
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        
        // Set user agent
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    }

    async testUrl(url, description = '') {
        console.log(`\n🔍 Testing: ${url} ${description ? `(${description})` : ''}`);
        
        try {
            const response = await this.page.goto(url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            
            if (response.status() >= 200 && response.status() < 400) {
                console.log(`✅ ${url} - Status: ${response.status()}`);
                
                // Take screenshot
                const screenshotName = `${this.sanitizeFilename(url)}-${Date.now()}.png`;
                const screenshotPath = path.join(this.screenshotDir, screenshotName);
                await this.page.screenshot({ 
                    path: screenshotPath,
                    fullPage: true 
                });
                
                this.results.passed.push({
                    url,
                    status: response.status(),
                    description,
                    screenshot: screenshotPath
                });
                
                this.results.screenshots.push({
                    url,
                    path: screenshotPath,
                    description
                });
                
                return true;
            } else {
                throw new Error(`HTTP ${response.status()}`);
            }
        } catch (error) {
            console.log(`❌ ${url} - Error: ${error.message}`);
            this.results.failed.push({
                url,
                error: error.message,
                description
            });
            return false;
        }
    }

    async extractLinks(url) {
        console.log(`\n📋 Extracting links from: ${url}`);
        
        try {
            await this.page.goto(url, { waitUntil: 'networkidle2' });
            
            const links = await this.page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a[href]'));
                return anchors.map(anchor => ({
                    href: anchor.href,
                    text: anchor.textContent.trim(),
                    target: anchor.target
                })).filter(link => link.href && !link.href.startsWith('javascript:'));
            });
            
            console.log(`Found ${links.length} links`);
            return links;
        } catch (error) {
            console.log(`❌ Error extracting links: ${error.message}`);
            return [];
        }
    }

    sanitizeFilename(url) {
        return url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    isExternalLink(url) {
        return url.startsWith('http') && 
               !url.includes('commerce-studio-website') && 
               !url.includes('localhost') &&
               !url.includes('127.0.0.1');
    }

    async testMainWebsite() {
        console.log('\n🚀 Starting VARAi Commerce Studio Website Link Test\n');
        
        // Test main pages
        const mainPages = [
            { url: `${this.baseUrl}/`, description: 'Home Page' },
            { url: `${this.baseUrl}/products.html`, description: 'Products Page' },
            { url: `${this.baseUrl}/solutions.html`, description: 'Solutions Page' },
            { url: `${this.baseUrl}/pricing.html`, description: 'Pricing Page' },
            { url: `${this.baseUrl}/company.html`, description: 'Company Page' },
            { url: `${this.baseUrl}/dashboard/index.html`, description: 'Dashboard Page' },
            { url: `${this.baseUrl}/signup/index.html`, description: 'Signup Page' }
        ];

        for (const page of mainPages) {
            await this.testUrl(page.url, page.description);
            await this.page.waitForTimeout(1000); // Brief pause between tests
        }

        // Test VisionCraft Demo Store
        await this.testUrl('https://visioncraft-store-353252826752.us-central1.run.app', 'VisionCraft Demo Store');

        // Extract and test all links from home page
        const homeLinks = await this.extractLinks(`${this.baseUrl}/`);
        
        for (const link of homeLinks) {
            if (this.isExternalLink(link.href)) {
                console.log(`🌐 External link found: ${link.href} (${link.text})`);
                this.results.external.push({
                    url: link.href,
                    text: link.text,
                    target: link.target
                });
            } else if (!this.results.passed.some(p => p.url === link.href) && 
                      !this.results.failed.some(f => f.url === link.href)) {
                await this.testUrl(link.href, `Link: ${link.text}`);
            }
        }
    }

    async testNavigation() {
        console.log('\n🧭 Testing Navigation Flow\n');
        
        // Test navigation flow: Home -> Products -> Solutions -> Pricing -> Company -> Signup
        const navigationFlow = [
            `${this.baseUrl}/`,
            `${this.baseUrl}/products.html`,
            `${this.baseUrl}/solutions.html`,
            `${this.baseUrl}/pricing.html`,
            `${this.baseUrl}/company.html`,
            `${this.baseUrl}/signup/index.html`
        ];

        for (let i = 0; i < navigationFlow.length; i++) {
            const url = navigationFlow[i];
            await this.testUrl(url, `Navigation Step ${i + 1}`);
            
            // Test navigation links on each page
            try {
                const navLinks = await this.page.evaluate(() => {
                    const navElements = document.querySelectorAll('.varai-navbar-nav a, .varai-nav-link');
                    return Array.from(navElements).map(el => el.href);
                });
                
                console.log(`Found ${navLinks.length} navigation links on current page`);
            } catch (error) {
                console.log(`Warning: Could not extract navigation links: ${error.message}`);
            }
        }
    }

    async testResponsiveDesign() {
        console.log('\n📱 Testing Responsive Design\n');
        
        const viewports = [
            { width: 375, height: 667, name: 'Mobile' },
            { width: 768, height: 1024, name: 'Tablet' },
            { width: 1920, height: 1080, name: 'Desktop' }
        ];

        for (const viewport of viewports) {
            console.log(`Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
            await this.page.setViewport(viewport);
            
            await this.testUrl(`${this.baseUrl}/`, `Home - ${viewport.name}`);
            
            // Take screenshot for each viewport
            const screenshotName = `home-${viewport.name.toLowerCase()}-${Date.now()}.png`;
            const screenshotPath = path.join(this.screenshotDir, screenshotName);
            await this.page.screenshot({ 
                path: screenshotPath,
                fullPage: true 
            });
            
            this.results.screenshots.push({
                url: `${this.baseUrl}/`,
                path: screenshotPath,
                description: `${viewport.name} Responsive Test`
            });
        }
        
        // Reset to desktop viewport
        await this.page.setViewport({ width: 1920, height: 1080 });
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total_tests: this.results.passed.length + this.results.failed.length,
                passed: this.results.passed.length,
                failed: this.results.failed.length,
                external_links: this.results.external.length,
                screenshots: this.results.screenshots.length
            },
            results: this.results
        };

        // Write JSON report
        fs.writeFileSync('./link-test-report.json', JSON.stringify(report, null, 2));
        
        // Write HTML report
        const htmlReport = this.generateHtmlReport(report);
        fs.writeFileSync('./link-test-report.html', htmlReport);
        
        console.log('\n📊 TEST SUMMARY');
        console.log('================');
        console.log(`✅ Passed: ${report.summary.passed}`);
        console.log(`❌ Failed: ${report.summary.failed}`);
        console.log(`🌐 External Links: ${report.summary.external_links}`);
        console.log(`📸 Screenshots: ${report.summary.screenshots}`);
        console.log(`📄 Report saved to: link-test-report.html`);
        
        return report;
    }

    generateHtmlReport(report) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VARAi Commerce Studio - Link Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f7; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        h1 { color: #0A2463; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2rem; font-weight: bold; color: #0A2463; }
        .metric-label { color: #666; margin-top: 5px; }
        .passed { color: #30D158; }
        .failed { color: #FF3B30; }
        .external { color: #007AFF; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #0A2463; border-bottom: 2px solid #0A2463; padding-bottom: 10px; }
        .test-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #ddd; }
        .test-item.passed { border-left-color: #30D158; }
        .test-item.failed { border-left-color: #FF3B30; }
        .test-item.external { border-left-color: #007AFF; }
        .url { font-family: monospace; background: #e9ecef; padding: 2px 6px; border-radius: 4px; }
        .screenshot { max-width: 200px; border-radius: 8px; margin: 10px 0; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>VARAi Commerce Studio - Link Test Report</h1>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value passed">${report.summary.passed}</div>
                <div class="metric-label">Tests Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value failed">${report.summary.failed}</div>
                <div class="metric-label">Tests Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value external">${report.summary.external_links}</div>
                <div class="metric-label">External Links</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.screenshots}</div>
                <div class="metric-label">Screenshots</div>
            </div>
        </div>

        <div class="section">
            <h2>✅ Passed Tests (${report.summary.passed})</h2>
            ${report.results.passed.map(test => `
                <div class="test-item passed">
                    <strong>${test.description || 'Page Test'}</strong><br>
                    <span class="url">${test.url}</span><br>
                    <small>Status: ${test.status}</small>
                </div>
            `).join('')}
        </div>

        ${report.summary.failed > 0 ? `
        <div class="section">
            <h2>❌ Failed Tests (${report.summary.failed})</h2>
            ${report.results.failed.map(test => `
                <div class="test-item failed">
                    <strong>${test.description || 'Page Test'}</strong><br>
                    <span class="url">${test.url}</span><br>
                    <small>Error: ${test.error}</small>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="section">
            <h2>🌐 External Links (${report.summary.external_links})</h2>
            ${report.results.external.map(link => `
                <div class="test-item external">
                    <strong>${link.text}</strong><br>
                    <span class="url">${link.url}</span>
                    ${link.target ? `<br><small>Target: ${link.target}</small>` : ''}
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>📸 Screenshots (${report.summary.screenshots})</h2>
            <div class="grid">
                ${report.results.screenshots.map(screenshot => `
                    <div class="test-item">
                        <strong>${screenshot.description}</strong><br>
                        <span class="url">${screenshot.url}</span><br>
                        <img src="${screenshot.path}" alt="${screenshot.description}" class="screenshot">
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async run() {
        try {
            await this.init();
            await this.testMainWebsite();
            await this.testNavigation();
            await this.testResponsiveDesign();
            
            const report = this.generateReport();
            
            if (report.summary.failed === 0) {
                console.log('\n🎉 All tests passed! Website is ready for deployment.');
            } else {
                console.log('\n⚠️  Some tests failed. Please review the report.');
            }
            
            return report;
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            throw error;
        } finally {
            await this.close();
        }
    }
}

// Run the tests
if (require.main === module) {
    const checker = new LinkChecker();
    checker.run().catch(console.error);
}

module.exports = LinkChecker;