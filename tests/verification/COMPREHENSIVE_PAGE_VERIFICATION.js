/**
 * Comprehensive Page Verification Tool
 * Systematically checks all pages in the VARAi Commerce Studio website
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://commerce-studio-website-353252826752.us-central1.run.app';

// Define all pages to check
const PAGES_TO_CHECK = [
    // Main website pages
    { path: '/', name: 'Homepage', type: 'main' },
    { path: '/company.html', name: 'Company', type: 'main' },
    { path: '/products.html', name: 'Products', type: 'main' },
    { path: '/solutions.html', name: 'Solutions', type: 'main' },
    { path: '/pricing.html', name: 'Pricing', type: 'main' },
    { path: '/api-docs.html', name: 'API Documentation', type: 'main' },
    { path: '/store-locator.html', name: 'Store Locator', type: 'main' },
    { path: '/demo-login.html', name: 'Demo Login', type: 'main' },
    { path: '/install-varai.html', name: 'Install VARAi', type: 'main' },
    { path: '/shopify-install.html', name: 'Shopify Install', type: 'main' },
    
    // Customer portal pages
    { path: '/customer/login.html', name: 'Customer Login', type: 'customer' },
    { path: '/customer/index.html', name: 'Customer Overview', type: 'customer' },
    { path: '/customer/dashboard.html', name: 'Customer Dashboard', type: 'customer' },
    { path: '/customer/settings.html', name: 'Customer Settings', type: 'customer' },
    
    // Admin pages
    { path: '/admin/index.html', name: 'Admin Dashboard', type: 'admin' },
    
    // Signup pages
    { path: '/signup/index.html', name: 'Signup', type: 'auth' },
    
    // API Keys page
    { path: '/api-keys.html', name: 'API Keys', type: 'main' }
];

// Key content checks for each page type
const CONTENT_CHECKS = {
    main: [
        'VARAi',
        'Commerce Studio',
        'AI-powered',
        '<title>',
        '</html>'
    ],
    customer: [
        'VARAi Customer Portal',
        'settings',
        'dashboard',
        '<title>',
        '</html>'
    ],
    admin: [
        'Admin',
        'Customer Management',
        'Analytics',
        '<title>',
        '</html>'
    ],
    auth: [
        'Sign',
        'Login',
        'Register',
        '<title>',
        '</html>'
    ]
};

// CSS rendering issue checks
const CSS_CHECKS = [
    {
        pattern: /\.[\w-]+\s*\{[^}]*\}/g,
        name: 'CSS Rules Outside Style Tags',
        description: 'Checks for CSS code appearing as plain text'
    },
    {
        pattern: /<style[^>]*>[\s\S]*?<\/style>/gi,
        name: 'Style Tags',
        description: 'Counts properly formatted style blocks'
    }
];

class PageVerifier {
    constructor() {
        this.results = [];
        this.summary = {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0
        };
    }

    async verifyPage(pageInfo) {
        const url = `${BASE_URL}${pageInfo.path}`;
        console.log(`\n🔍 Checking: ${pageInfo.name} (${url})`);
        
        try {
            const content = await this.fetchPage(url);
            const result = this.analyzePage(pageInfo, content, url);
            this.results.push(result);
            
            // Update summary
            this.summary.total++;
            if (result.status === 'PASS') {
                this.summary.passed++;
                console.log(`✅ ${pageInfo.name}: PASSED`);
            } else if (result.status === 'FAIL') {
                this.summary.failed++;
                console.log(`❌ ${pageInfo.name}: FAILED`);
                result.issues.forEach(issue => console.log(`   • ${issue}`));
            } else {
                this.summary.warnings++;
                console.log(`⚠️  ${pageInfo.name}: WARNING`);
                result.issues.forEach(issue => console.log(`   • ${issue}`));
            }
            
            return result;
        } catch (error) {
            const result = {
                page: pageInfo.name,
                url: url,
                status: 'FAIL',
                issues: [`Failed to load page: ${error.message}`],
                contentLength: 0,
                hasCSS: false,
                cssIssues: []
            };
            
            this.results.push(result);
            this.summary.total++;
            this.summary.failed++;
            
            console.log(`❌ ${pageInfo.name}: FAILED - ${error.message}`);
            return result;
        }
    }

    async fetchPage(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}`));
                    return;
                }
                
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve(data);
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    }

    analyzePage(pageInfo, content, url) {
        const issues = [];
        const warnings = [];
        
        // Basic content checks
        const expectedContent = CONTENT_CHECKS[pageInfo.type] || CONTENT_CHECKS.main;
        expectedContent.forEach(check => {
            if (!content.includes(check)) {
                issues.push(`Missing expected content: "${check}"`);
            }
        });
        
        // CSS rendering checks
        const cssIssues = this.checkCSSRendering(content);
        
        // HTML structure checks
        if (!content.includes('<!DOCTYPE html>')) {
            issues.push('Missing DOCTYPE declaration');
        }
        
        if (!content.includes('</html>')) {
            issues.push('Missing closing HTML tag');
        }
        
        // Check for proper title
        const titleMatch = content.match(/<title>(.*?)<\/title>/i);
        if (!titleMatch) {
            issues.push('Missing page title');
        } else if (titleMatch[1].trim().length === 0) {
            issues.push('Empty page title');
        }
        
        // Check content length (too short might indicate issues)
        if (content.length < 1000) {
            warnings.push(`Page content is very short (${content.length} characters)`);
        }
        
        // Determine status
        let status = 'PASS';
        if (issues.length > 0 || cssIssues.critical.length > 0) {
            status = 'FAIL';
        } else if (warnings.length > 0 || cssIssues.warnings.length > 0) {
            status = 'WARNING';
        }
        
        return {
            page: pageInfo.name,
            url: url,
            type: pageInfo.type,
            status: status,
            issues: [...issues, ...cssIssues.critical],
            warnings: [...warnings, ...cssIssues.warnings],
            contentLength: content.length,
            hasCSS: content.includes('<style>') || content.includes('.css'),
            cssIssues: cssIssues,
            title: titleMatch ? titleMatch[1] : 'No title found'
        };
    }

    checkCSSRendering(content) {
        const critical = [];
        const warnings = [];
        
        // Check for CSS rules outside style tags
        const cssRuleRegex = /\.[\w-]+\s*\{[^}]*\}/g;
        const styleTagRegex = /<style[^>]*>[\s\S]*?<\/style>/gi;
        
        const allCSSRules = content.match(cssRuleRegex) || [];
        const styleBlocks = content.match(styleTagRegex) || [];
        
        if (allCSSRules.length > 0) {
            let cssInStyleTags = 0;
            styleBlocks.forEach(block => {
                const blockCSSRules = block.match(cssRuleRegex) || [];
                cssInStyleTags += blockCSSRules.length;
            });
            
            const cssOutsideStyleTags = allCSSRules.length - cssInStyleTags;
            
            if (cssOutsideStyleTags > 0) {
                critical.push(`Found ${cssOutsideStyleTags} CSS rules outside <style> tags`);
            }
        }
        
        // Check for mismatched style tags
        const openStyleTags = (content.match(/<style[^>]*>/gi) || []).length;
        const closeStyleTags = (content.match(/<\/style>/gi) || []).length;
        
        if (openStyleTags !== closeStyleTags) {
            critical.push(`Mismatched style tags: ${openStyleTags} opening, ${closeStyleTags} closing`);
        }
        
        // Check for CSS after </html>
        const htmlEndIndex = content.lastIndexOf('</html>');
        if (htmlEndIndex !== -1) {
            const afterHTML = content.substring(htmlEndIndex + 7);
            if (afterHTML.match(cssRuleRegex)) {
                critical.push('CSS code found after </html> tag');
            }
        }
        
        return {
            critical,
            warnings,
            totalCSSRules: allCSSRules.length,
            cssInStyleTags: allCSSRules.length - (critical.length > 0 ? parseInt(critical[0].match(/\d+/)[0]) || 0 : 0),
            styleBlocks: styleBlocks.length
        };
    }

    async verifyAllPages() {
        console.log('🚀 Starting Comprehensive Page Verification');
        console.log('===========================================');
        console.log(`Checking ${PAGES_TO_CHECK.length} pages...`);
        
        for (const pageInfo of PAGES_TO_CHECK) {
            await this.verifyPage(pageInfo);
            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        this.generateReport();
    }

    generateReport() {
        console.log('\n📊 VERIFICATION SUMMARY');
        console.log('=======================');
        console.log(`Total Pages: ${this.summary.total}`);
        console.log(`✅ Passed: ${this.summary.passed}`);
        console.log(`⚠️  Warnings: ${this.summary.warnings}`);
        console.log(`❌ Failed: ${this.summary.failed}`);
        
        const successRate = ((this.summary.passed / this.summary.total) * 100).toFixed(1);
        console.log(`📈 Success Rate: ${successRate}%`);
        
        // Group results by status
        const failed = this.results.filter(r => r.status === 'FAIL');
        const warnings = this.results.filter(r => r.status === 'WARNING');
        const passed = this.results.filter(r => r.status === 'PASS');
        
        if (failed.length > 0) {
            console.log('\n❌ FAILED PAGES:');
            console.log('================');
            failed.forEach(result => {
                console.log(`\n${result.page} (${result.url})`);
                result.issues.forEach(issue => console.log(`   • ${issue}`));
            });
        }
        
        if (warnings.length > 0) {
            console.log('\n⚠️  PAGES WITH WARNINGS:');
            console.log('========================');
            warnings.forEach(result => {
                console.log(`\n${result.page} (${result.url})`);
                result.warnings.forEach(warning => console.log(`   • ${warning}`));
            });
        }
        
        console.log('\n✅ PASSED PAGES:');
        console.log('================');
        passed.forEach(result => {
            console.log(`${result.page} - ${result.contentLength} chars - ${result.title}`);
        });
        
        // CSS-specific summary
        const cssIssues = this.results.filter(r => r.cssIssues && r.cssIssues.critical.length > 0);
        if (cssIssues.length > 0) {
            console.log('\n🎨 CSS RENDERING ISSUES:');
            console.log('========================');
            cssIssues.forEach(result => {
                console.log(`${result.page}: ${result.cssIssues.critical.join(', ')}`);
            });
        }
        
        // Save detailed report
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: this.summary,
            results: this.results,
            baseUrl: BASE_URL
        };
        
        fs.writeFileSync('PAGE_VERIFICATION_REPORT.json', JSON.stringify(reportData, null, 2));
        console.log('\n📄 Detailed report saved to: PAGE_VERIFICATION_REPORT.json');
        
        return this.summary;
    }
}

// Run verification if called directly
if (require.main === module) {
    const verifier = new PageVerifier();
    verifier.verifyAllPages()
        .then(summary => {
            const exitCode = summary.failed > 0 ? 1 : 0;
            process.exit(exitCode);
        })
        .catch(err => {
            console.error('❌ Verification failed:', err);
            process.exit(1);
        });
}

module.exports = { PageVerifier, PAGES_TO_CHECK };