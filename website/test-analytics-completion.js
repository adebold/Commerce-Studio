/**
 * Analytics Showcase Completion Test
 * Verifies all missing components and creates a comprehensive report
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class AnalyticsCompletionTest {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            missingPages: [],
            missingImages: [],
            missingElements: [],
            navigationIssues: [],
            recommendations: []
        };
    }

    async run() {
        console.log('🔍 Starting Analytics Showcase Completion Test...');
        
        try {
            await this.setupBrowser();
            await this.testAnalyticsPages();
            await this.testSalesForecasting();
            await this.testSolutionsPage();
            await this.generateReport();
            
            console.log('✅ Analytics Completion Test completed successfully');
        } catch (error) {
            console.error('❌ Test failed:', error);
        } finally {
            await this.cleanup();
        }
    }

    async setupBrowser() {
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1200, height: 800 }
        });
        this.page = await this.browser.newPage();
    }

    async testAnalyticsPages() {
        console.log('📊 Testing Analytics Pages...');
        
        const baseUrl = 'http://localhost:8080/analytics/';
        const requiredPages = [
            'index.html',
            'sales-forecasting.html',
            'seasonal-intelligence.html',
            'risk-assessment.html',
            'growth-opportunities.html',
            'real-time-analytics.html'
        ];

        for (const page of requiredPages) {
            try {
                const response = await this.page.goto(`${baseUrl}${page}`, { 
                    waitUntil: 'networkidle0',
                    timeout: 10000 
                });
                
                if (response.status() === 404) {
                    this.results.missingPages.push(page);
                    console.log(`❌ Missing page: ${page}`);
                } else {
                    console.log(`✅ Found page: ${page}`);
                    
                    // Check navigation links
                    await this.checkNavigationLinks(page);
                }
            } catch (error) {
                this.results.missingPages.push(page);
                console.log(`❌ Error accessing ${page}: ${error.message}`);
            }
        }
    }

    async checkNavigationLinks(currentPage) {
        const navLinks = await this.page.$$eval('.varai-dropdown-menu a', links => 
            links.map(link => ({
                text: link.textContent.trim(),
                href: link.getAttribute('href')
            }))
        );

        for (const link of navLinks) {
            if (link.href && !link.href.startsWith('http')) {
                try {
                    const response = await fetch(`http://localhost:8080/analytics/${link.href}`);
                    if (response.status === 404) {
                        this.results.navigationIssues.push({
                            page: currentPage,
                            brokenLink: link.href,
                            linkText: link.text
                        });
                    }
                } catch (error) {
                    this.results.navigationIssues.push({
                        page: currentPage,
                        brokenLink: link.href,
                        linkText: link.text,
                        error: error.message
                    });
                }
            }
        }
    }

    async testSalesForecasting() {
        console.log('📈 Testing Sales Forecasting Page...');
        
        try {
            await this.page.goto('http://localhost:8080/analytics/sales-forecasting.html', {
                waitUntil: 'networkidle0'
            });

            // Check for missing visual elements
            const missingElements = [];
            
            const requiredCharts = [
                'seasonalPatternChart',
                'confidenceChart', 
                'multiProductChart',
                'modelUpdateChart'
            ];

            for (const chartId of requiredCharts) {
                const element = await this.page.$(`#${chartId}`);
                if (!element) {
                    missingElements.push(`Missing chart: ${chartId}`);
                } else {
                    // Check if chart has actual content or just placeholder
                    const hasContent = await this.page.evaluate((id) => {
                        const canvas = document.getElementById(id);
                        if (!canvas) return false;
                        
                        const ctx = canvas.getContext('2d');
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        
                        // Check if canvas has any non-transparent pixels
                        for (let i = 3; i < imageData.data.length; i += 4) {
                            if (imageData.data[i] !== 0) return true;
                        }
                        return false;
                    }, chartId);
                    
                    if (!hasContent) {
                        missingElements.push(`Empty chart: ${chartId}`);
                    }
                }
            }

            this.results.missingImages.push(...missingElements);
            
        } catch (error) {
            console.error('Error testing sales forecasting:', error);
        }
    }

    async testSolutionsPage() {
        console.log('🔧 Testing Solutions Page...');
        
        try {
            await this.page.goto('http://localhost:8080/solutions.html', {
                waitUntil: 'networkidle0'
            });

            // Check for placeholder content
            const placeholders = await this.page.$$eval('.varai-card', cards => {
                return cards.filter(card => {
                    const text = card.textContent;
                    return text.includes('Demo') || text.includes('Placeholder') || 
                           text.includes('linear-gradient') || text.includes('#6c757d');
                }).length;
            });

            if (placeholders > 0) {
                this.results.missingImages.push(`Solutions page has ${placeholders} placeholder elements`);
            }

        } catch (error) {
            console.error('Error testing solutions page:', error);
        }
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                missingPages: this.results.missingPages.length,
                missingImages: this.results.missingImages.length,
                navigationIssues: this.results.navigationIssues.length
            },
            details: this.results,
            recommendations: [
                'Create missing analytics pages: risk-assessment.html and growth-opportunities.html',
                'Add visual elements to sales-forecasting.html for the 4 missing chart sections',
                'Replace placeholder content in solutions.html with actual visual elements',
                'Update navigation to ensure all links work correctly',
                'Add CSS-based graphics or appropriate images for better user experience'
            ]
        };

        const reportPath = path.join(__dirname, 'analytics-completion-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('\n📋 ANALYTICS COMPLETION REPORT');
        console.log('================================');
        console.log(`Missing Pages: ${report.summary.missingPages}`);
        console.log(`Missing Images: ${report.summary.missingImages}`);
        console.log(`Navigation Issues: ${report.summary.navigationIssues}`);
        console.log(`\nDetailed report saved to: ${reportPath}`);
        
        return report;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run the test
if (require.main === module) {
    const test = new AnalyticsCompletionTest();
    test.run().catch(console.error);
}

module.exports = AnalyticsCompletionTest;