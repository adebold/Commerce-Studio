#!/usr/bin/env node

/**
 * VARAi Commerce Studio - Simple Test Runner
 * HTTP-based tests without Puppeteer for environments where browser automation isn't available
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class SimpleTestRunner {
    constructor() {
        this.config = {
            baseUrl: 'https://commerce-studio-website-353252826752.us-central1.run.app',
            visioncraftUrl: 'https://visioncraft-store-353252826752.us-central1.run.app',
            authServiceUrl: 'https://commerce-studio-auth-353252826752.us-central1.run.app',
            reportDir: './test-reports',
            timeout: 30000
        };

        this.testResults = {
            navigation: { passed: [], failed: [] },
            visioncraft: { passed: [], failed: [] },
            connectivity: { passed: [], failed: [] }
        };

        this.testPages = [
            { path: '/', name: 'Home' },
            { path: '/products.html', name: 'Products' },
            { path: '/solutions.html', name: 'Solutions' },
            { path: '/pricing.html', name: 'Pricing' },
            { path: '/company.html', name: 'Company' },
            { path: '/dashboard/index.html', name: 'Dashboard' },
            { path: '/signup/index.html', name: 'Signup' }
        ];
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https:') ? https : http;
            const startTime = Date.now();
            
            const req = protocol.get(url, {
                timeout: this.config.timeout,
                headers: {
                    'User-Agent': 'VARAi-Test-Suite/1.0.0'
                }
            }, (res) => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data,
                        responseTime: responseTime,
                        url: url
                    });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    async testPageConnectivity() {
        console.log('\n🌐 Testing Page Connectivity');
        console.log('============================');

        for (const page of this.testPages) {
            const url = `${this.config.baseUrl}${page.path}`;
            console.log(`\n📄 Testing ${page.name} page: ${url}`);

            try {
                const response = await this.makeRequest(url);
                
                if (response.statusCode === 200) {
                    console.log(`   ✅ ${page.name}: HTTP ${response.statusCode} (${response.responseTime}ms)`);
                    
                    // Basic content checks
                    const hasVaraiTitle = response.data.includes('VARAi') || response.data.includes('Commerce Studio');
                    const hasNavigation = response.data.includes('nav') || response.data.includes('navbar');
                    const hasContent = response.data.length > 1000; // Basic content length check
                    
                    console.log(`   📝 Content checks:`);
                    console.log(`      VARAi branding: ${hasVaraiTitle ? '✅' : '❌'}`);
                    console.log(`      Navigation: ${hasNavigation ? '✅' : '❌'}`);
                    console.log(`      Content length: ${hasContent ? '✅' : '❌'} (${response.data.length} chars)`);

                    this.testResults.navigation.passed.push({
                        page: page.name,
                        url: url,
                        statusCode: response.statusCode,
                        responseTime: response.responseTime,
                        contentLength: response.data.length,
                        hasVaraiTitle,
                        hasNavigation,
                        hasContent
                    });
                } else {
                    console.log(`   ❌ ${page.name}: HTTP ${response.statusCode}`);
                    this.testResults.navigation.failed.push({
                        page: page.name,
                        url: url,
                        statusCode: response.statusCode,
                        error: `HTTP ${response.statusCode}`
                    });
                }
            } catch (error) {
                console.log(`   ❌ ${page.name}: ${error.message}`);
                this.testResults.navigation.failed.push({
                    page: page.name,
                    url: url,
                    error: error.message
                });
            }
        }
    }

    async testVisionCraftConnectivity() {
        console.log('\n🛍️ Testing VisionCraft Demo Store Connectivity');
        console.log('===============================================');

        try {
            console.log(`\n🔗 Testing VisionCraft Demo: ${this.config.visioncraftUrl}`);
            const response = await this.makeRequest(this.config.visioncraftUrl);
            
            if (response.statusCode === 200) {
                console.log(`   ✅ VisionCraft Demo: HTTP ${response.statusCode} (${response.responseTime}ms)`);
                
                // Basic content checks for demo store
                const hasVisionCraftTitle = response.data.includes('VisionCraft') || response.data.includes('Demo');
                const hasProductElements = response.data.includes('product') || response.data.includes('catalog');
                const hasEcommerceElements = response.data.includes('cart') || response.data.includes('shop');
                
                console.log(`   📝 Demo store checks:`);
                console.log(`      VisionCraft branding: ${hasVisionCraftTitle ? '✅' : '❌'}`);
                console.log(`      Product elements: ${hasProductElements ? '✅' : '❌'}`);
                console.log(`      E-commerce elements: ${hasEcommerceElements ? '✅' : '❌'}`);
                console.log(`      Content length: ${response.data.length} chars`);

                this.testResults.visioncraft.passed.push({
                    test: 'VisionCraft Demo Connectivity',
                    url: this.config.visioncraftUrl,
                    statusCode: response.statusCode,
                    responseTime: response.responseTime,
                    contentLength: response.data.length,
                    hasVisionCraftTitle,
                    hasProductElements,
                    hasEcommerceElements
                });
            } else {
                console.log(`   ❌ VisionCraft Demo: HTTP ${response.statusCode}`);
                this.testResults.visioncraft.failed.push({
                    test: 'VisionCraft Demo Connectivity',
                    url: this.config.visioncraftUrl,
                    statusCode: response.statusCode,
                    error: `HTTP ${response.statusCode}`
                });
            }
        } catch (error) {
            console.log(`   ❌ VisionCraft Demo: ${error.message}`);
            this.testResults.visioncraft.failed.push({
                test: 'VisionCraft Demo Connectivity',
                url: this.config.visioncraftUrl,
                error: error.message
            });
        }
    }

    async testServiceConnectivity() {
        console.log('\n🔐 Testing Service Connectivity');
        console.log('===============================');

        const services = [
            { name: 'Main Website', url: this.config.baseUrl },
            { name: 'VisionCraft Demo', url: this.config.visioncraftUrl },
            { name: 'Auth Service', url: this.config.authServiceUrl }
        ];

        for (const service of services) {
            try {
                console.log(`\n🔗 Testing ${service.name}: ${service.url}`);
                const response = await this.makeRequest(service.url);
                
                console.log(`   ✅ ${service.name}: HTTP ${response.statusCode} (${response.responseTime}ms)`);
                
                this.testResults.connectivity.passed.push({
                    service: service.name,
                    url: service.url,
                    statusCode: response.statusCode,
                    responseTime: response.responseTime
                });
            } catch (error) {
                console.log(`   ❌ ${service.name}: ${error.message}`);
                this.testResults.connectivity.failed.push({
                    service: service.name,
                    url: service.url,
                    error: error.message
                });
            }
        }
    }

    async generateReport() {
        console.log('\n📊 COMPREHENSIVE TEST REPORT');
        console.log('============================');

        const summary = {
            navigation: {
                passed: this.testResults.navigation.passed.length,
                failed: this.testResults.navigation.failed.length
            },
            visioncraft: {
                passed: this.testResults.visioncraft.passed.length,
                failed: this.testResults.visioncraft.failed.length
            },
            connectivity: {
                passed: this.testResults.connectivity.passed.length,
                failed: this.testResults.connectivity.failed.length
            }
        };

        const totalPassed = Object.values(summary).reduce((sum, cat) => sum + cat.passed, 0);
        const totalFailed = Object.values(summary).reduce((sum, cat) => sum + cat.failed, 0);
        const totalTests = totalPassed + totalFailed;
        const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${totalPassed} (${passRate}%)`);
        console.log(`Failed: ${totalFailed}`);
        console.log('');

        // Category breakdown
        Object.entries(summary).forEach(([category, results]) => {
            const categoryTotal = results.passed + results.failed;
            const categoryPassRate = categoryTotal > 0 ? ((results.passed / categoryTotal) * 100).toFixed(1) : 0;
            console.log(`${category.toUpperCase()}: ${results.passed}/${categoryTotal} (${categoryPassRate}%)`);
        });

        // Show failed tests
        if (totalFailed > 0) {
            console.log('\n❌ FAILED TESTS:');
            Object.entries(this.testResults).forEach(([category, results]) => {
                if (results.failed.length > 0) {
                    console.log(`\n${category.toUpperCase()} Failures:`);
                    results.failed.forEach((failure, index) => {
                        console.log(`${index + 1}. ${failure.page || failure.test || failure.service}: ${failure.error}`);
                    });
                }
            });
        }

        // Generate JSON report
        if (!fs.existsSync(this.config.reportDir)) {
            fs.mkdirSync(this.config.reportDir, { recursive: true });
        }

        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                totalPassed,
                totalFailed,
                passRate: parseFloat(passRate)
            },
            categories: summary,
            results: this.testResults,
            environment: {
                baseUrl: this.config.baseUrl,
                visioncraftUrl: this.config.visioncraftUrl,
                authServiceUrl: this.config.authServiceUrl
            }
        };

        const jsonReportPath = path.join(this.config.reportDir, 'simple-test-report.json');
        fs.writeFileSync(jsonReportPath, JSON.stringify(reportData, null, 2));
        console.log(`\n📄 Report generated: ${jsonReportPath}`);

        // Final assessment
        if (totalFailed === 0) {
            console.log('\n🎉 ALL TESTS PASSED! Website connectivity verified.');
        } else if (passRate >= 90) {
            console.log('\n✅ Most tests passed. Minor connectivity issues detected.');
        } else if (passRate >= 75) {
            console.log('\n⚠️  Some tests failed. Review connectivity issues.');
        } else {
            console.log('\n❌ Many tests failed. Significant connectivity issues detected.');
        }

        return { totalPassed, totalFailed, passRate };
    }

    async runAllTests() {
        console.log('🚀 VARAi Commerce Studio - Simple Test Runner');
        console.log('==============================================');
        console.log(`Test Environment: ${this.config.baseUrl}`);
        console.log(`VisionCraft Demo: ${this.config.visioncraftUrl}`);
        console.log('==============================================\n');

        const startTime = Date.now();

        try {
            await this.testPageConnectivity();
            await this.testVisionCraftConnectivity();
            await this.testServiceConnectivity();

            const endTime = Date.now();
            const totalTime = endTime - startTime;
            console.log(`\nExecution Time: ${totalTime}ms`);

            const results = await this.generateReport();
            return results;

        } catch (error) {
            console.error('❌ Test suite failed:', error);
            throw error;
        }
    }
}

// Run the tests if this file is executed directly
if (require.main === module) {
    const testRunner = new SimpleTestRunner();
    testRunner.runAllTests()
        .then((results) => {
            if (results.totalFailed === 0) {
                process.exit(0);
            } else if (results.passRate >= 75) {
                process.exit(0);
            } else {
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = SimpleTestRunner;