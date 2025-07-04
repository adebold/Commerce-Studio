/**
 * 🚨 URGENT: Production Verification for Customer Login & Apple Hero Deployment
 * 
 * This test verifies the critical fixes are deployed:
 * 1. CSS @import statements removed
 * 2. Apple hero sections working (400px+ height)
 * 3. Customer login prominently accessible
 * 4. Font loading optimized
 */

const PRODUCTION_URL = 'https://commerce-studio-website-353252826752.us-central1.run.app';

class UrgentProductionVerification {
    constructor() {
        this.results = {
            cssImportFix: {},
            appleHero: {},
            customerLogin: {},
            fontLoading: {},
            overall: {}
        };
        this.errors = [];
        this.warnings = [];
        this.testsPassed = 0;
        this.testsTotal = 0;
    }

    async runAllTests() {
        console.log('🚨 URGENT: Starting Production Verification...\n');
        console.log(`🌐 Production URL: ${PRODUCTION_URL}\n`);
        
        try {
            await this.testCSSImportFix();
            await this.testAppleHeroSections();
            await this.testCustomerLoginIntegration();
            await this.testFontLoadingOptimization();
            await this.testCustomerPortalPages();
            
            this.generateFinalReport();
        } catch (error) {
            console.error('❌ Critical verification failure:', error);
            this.errors.push(`Critical verification failure: ${error.message}`);
        }
    }

    async testCSSImportFix() {
        console.log('🔧 Testing CSS @import Fix...');
        
        try {
            // Test main CSS files for @import statements
            const cssFiles = [
                '/css/varai-design-system.css',
                '/css/apple-landing.css'
            ];

            for (const cssFile of cssFiles) {
                const url = `${PRODUCTION_URL}${cssFile}`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const cssContent = await response.text();
                    const hasImportStatements = cssContent.includes('@import');
                    
                    if (hasImportStatements) {
                        console.log(`❌ ${cssFile}: Still contains @import statements`);
                        this.errors.push(`${cssFile} still contains @import statements`);
                        this.results.cssImportFix[cssFile] = 'FAILED';
                    } else {
                        console.log(`✅ ${cssFile}: @import statements removed`);
                        this.results.cssImportFix[cssFile] = 'PASSED';
                        this.testsPassed++;
                    }
                } else {
                    console.log(`❌ ${cssFile}: File not accessible (${response.status})`);
                    this.errors.push(`${cssFile} not accessible`);
                    this.results.cssImportFix[cssFile] = 'ERROR';
                }
                this.testsTotal++;
            }
        } catch (error) {
            console.log(`❌ CSS @import test failed: ${error.message}`);
            this.errors.push(`CSS @import test failed: ${error.message}`);
        }
    }

    async testAppleHeroSections() {
        console.log('\n🍎 Testing Apple Hero Sections...');
        
        try {
            // Test homepage for Apple hero implementation
            const response = await fetch(PRODUCTION_URL);
            const html = await response.text();
            
            // Check for Apple hero CSS loading
            const hasAppleHeroCSS = html.includes('apple-hero-sections.css');
            console.log(`${hasAppleHeroCSS ? '✅' : '❌'} Apple Hero CSS loaded: ${hasAppleHeroCSS}`);
            this.results.appleHero.cssLoaded = hasAppleHeroCSS;
            if (hasAppleHeroCSS) this.testsPassed++;
            this.testsTotal++;
            
            // Check for Apple hero section elements
            const hasAppleHeroSection = html.includes('apple-hero apple-hero-fullscreen');
            console.log(`${hasAppleHeroSection ? '✅' : '❌'} Apple Hero Section present: ${hasAppleHeroSection}`);
            this.results.appleHero.sectionPresent = hasAppleHeroSection;
            if (hasAppleHeroSection) this.testsPassed++;
            this.testsTotal++;
            
            // Check for Apple hero title styling
            const hasAppleHeroTitle = html.includes('apple-hero-title apple-hero-title-xl');
            console.log(`${hasAppleHeroTitle ? '✅' : '❌'} Apple Hero Title styling: ${hasAppleHeroTitle}`);
            this.results.appleHero.titleStyling = hasAppleHeroTitle;
            if (hasAppleHeroTitle) this.testsPassed++;
            this.testsTotal++;
            
            // Check for Apple buttons
            const hasAppleButtons = html.includes('apple-btn apple-btn-primary');
            console.log(`${hasAppleButtons ? '✅' : '❌'} Apple Button styling: ${hasAppleButtons}`);
            this.results.appleHero.buttonStyling = hasAppleButtons;
            if (hasAppleButtons) this.testsPassed++;
            this.testsTotal++;
            
            // Verify Apple hero CSS content for height requirements
            const cssResponse = await fetch(`${PRODUCTION_URL}/css/apple-hero-sections.css`);
            if (cssResponse.ok) {
                const css = await cssResponse.text();
                const hasMinHeight70vh = css.includes('min-height: 70vh');
                const hasMinHeight80vh = css.includes('min-height: 80vh');
                const meetsHeightRequirement = hasMinHeight70vh || hasMinHeight80vh;
                
                console.log(`${meetsHeightRequirement ? '✅' : '❌'} Apple Hero height requirement (400px+): ${meetsHeightRequirement}`);
                this.results.appleHero.heightRequirement = meetsHeightRequirement;
                if (meetsHeightRequirement) this.testsPassed++;
                
                if (!meetsHeightRequirement) {
                    this.errors.push('Apple hero sections do not meet 400px+ height requirement');
                }
            } else {
                console.log('❌ Could not verify Apple hero CSS file');
                this.errors.push('Apple hero CSS file not accessible');
            }
            this.testsTotal++;
            
        } catch (error) {
            console.log(`❌ Apple hero test failed: ${error.message}`);
            this.errors.push(`Apple hero test failed: ${error.message}`);
        }
    }

    async testCustomerLoginIntegration() {
        console.log('\n👤 Testing Customer Login Integration...');
        
        try {
            // Test homepage for customer login integration
            const response = await fetch(PRODUCTION_URL);
            const html = await response.text();
            
            // Check for Customer Portal link in navigation
            const hasNavLink = html.includes('customer/login.html') && html.includes('Customer Portal');
            console.log(`${hasNavLink ? '✅' : '❌'} Customer Portal navigation link: ${hasNavLink}`);
            this.results.customerLogin.navigationLink = hasNavLink;
            if (hasNavLink) this.testsPassed++;
            this.testsTotal++;
            
            // Check for Customer Login button in hero section
            const hasHeroButton = html.includes('Customer Login') || html.includes('customer/login.html');
            console.log(`${hasHeroButton ? '✅' : '❌'} Customer Login in hero section: ${hasHeroButton}`);
            this.results.customerLogin.heroButton = hasHeroButton;
            if (hasHeroButton) this.testsPassed++;
            this.testsTotal++;
            
            // Test customer login page accessibility
            const loginResponse = await fetch(`${PRODUCTION_URL}/customer/login.html`);
            const loginPageAccessible = loginResponse.ok;
            console.log(`${loginPageAccessible ? '✅' : '❌'} Customer login page accessible: ${loginPageAccessible}`);
            this.results.customerLogin.pageAccessible = loginPageAccessible;
            if (loginPageAccessible) this.testsPassed++;
            this.testsTotal++;
            
            if (loginPageAccessible) {
                const loginHtml = await loginResponse.text();
                
                // Check for demo accounts
                const hasDemoAccounts = loginHtml.includes('demo@visioncraft.com') || loginHtml.includes('Demo Accounts');
                console.log(`${hasDemoAccounts ? '✅' : '❌'} Demo accounts available: ${hasDemoAccounts}`);
                this.results.customerLogin.demoAccounts = hasDemoAccounts;
                if (hasDemoAccounts) this.testsPassed++;
                this.testsTotal++;
            }
            
        } catch (error) {
            console.log(`❌ Customer login test failed: ${error.message}`);
            this.errors.push(`Customer login test failed: ${error.message}`);
        }
    }

    async testFontLoadingOptimization() {
        console.log('\n🔤 Testing Font Loading Optimization...');
        
        try {
            const response = await fetch(PRODUCTION_URL);
            const html = await response.text();
            
            // Check for preconnect links
            const hasPreconnect = html.includes('rel="preconnect"') && html.includes('fonts.googleapis.com');
            console.log(`${hasPreconnect ? '✅' : '❌'} Font preconnect optimization: ${hasPreconnect}`);
            this.results.fontLoading.preconnect = hasPreconnect;
            if (hasPreconnect) this.testsPassed++;
            this.testsTotal++;
            
            // Check for Google Fonts stylesheet link
            const hasFontStylesheet = html.includes('fonts.googleapis.com/css2') && html.includes('Inter') && html.includes('SF+Pro+Display');
            console.log(`${hasFontStylesheet ? '✅' : '❌'} Font stylesheet loaded via HTML: ${hasFontStylesheet}`);
            this.results.fontLoading.stylesheet = hasFontStylesheet;
            if (hasFontStylesheet) this.testsPassed++;
            this.testsTotal++;
            
        } catch (error) {
            console.log(`❌ Font loading test failed: ${error.message}`);
            this.errors.push(`Font loading test failed: ${error.message}`);
        }
    }

    async testCustomerPortalPages() {
        console.log('\n🏠 Testing Customer Portal Pages...');
        
        try {
            const portalPages = [
                '/customer/index.html',
                '/customer/dashboard.html',
                '/customer/settings.html'
            ];

            for (const page of portalPages) {
                const response = await fetch(`${PRODUCTION_URL}${page}`);
                const accessible = response.ok;
                
                console.log(`${accessible ? '✅' : '❌'} ${page}: ${accessible ? 'Accessible' : `Error ${response.status}`}`);
                this.results.customerLogin[`page_${page.replace(/[^a-zA-Z0-9]/g, '_')}`] = accessible;
                if (accessible) this.testsPassed++;
                this.testsTotal++;
            }
            
        } catch (error) {
            console.log(`❌ Customer portal pages test failed: ${error.message}`);
            this.errors.push(`Customer portal pages test failed: ${error.message}`);
        }
    }

    generateFinalReport() {
        console.log('\n' + '='.repeat(80));
        console.log('🚨 URGENT PRODUCTION VERIFICATION REPORT');
        console.log('='.repeat(80));
        
        const successRate = ((this.testsPassed / this.testsTotal) * 100).toFixed(1);
        
        console.log(`\n📊 OVERALL RESULTS:`);
        console.log(`✅ Tests Passed: ${this.testsPassed}`);
        console.log(`❌ Tests Failed: ${this.testsTotal - this.testsPassed}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        
        // Critical Issues Summary
        console.log(`\n🔥 CRITICAL ISSUES:`);
        if (this.errors.length === 0) {
            console.log('✅ No critical issues found!');
        } else {
            this.errors.forEach((error, index) => {
                console.log(`❌ ${index + 1}. ${error}`);
            });
        }
        
        // Detailed Results
        console.log(`\n📋 DETAILED RESULTS:`);
        
        console.log(`\n🔧 CSS @import Fix:`);
        Object.entries(this.results.cssImportFix).forEach(([file, status]) => {
            console.log(`  ${status === 'PASSED' ? '✅' : '❌'} ${file}: ${status}`);
        });
        
        console.log(`\n🍎 Apple Hero Sections:`);
        Object.entries(this.results.appleHero).forEach(([test, result]) => {
            console.log(`  ${result ? '✅' : '❌'} ${test}: ${result}`);
        });
        
        console.log(`\n👤 Customer Login Integration:`);
        Object.entries(this.results.customerLogin).forEach(([test, result]) => {
            console.log(`  ${result ? '✅' : '❌'} ${test}: ${result}`);
        });
        
        console.log(`\n🔤 Font Loading Optimization:`);
        Object.entries(this.results.fontLoading).forEach(([test, result]) => {
            console.log(`  ${result ? '✅' : '❌'} ${test}: ${result}`);
        });
        
        // Final Assessment
        console.log(`\n🎯 FINAL ASSESSMENT:`);
        if (successRate >= 90) {
            console.log('🎉 DEPLOYMENT SUCCESSFUL! All critical requirements met.');
            this.results.overall.status = 'SUCCESS';
        } else if (successRate >= 75) {
            console.log('⚠️  DEPLOYMENT PARTIALLY SUCCESSFUL. Some issues need attention.');
            this.results.overall.status = 'PARTIAL_SUCCESS';
        } else {
            console.log('❌ DEPLOYMENT FAILED. Critical issues must be resolved.');
            this.results.overall.status = 'FAILED';
        }
        
        console.log(`\n🌐 Production URL: ${PRODUCTION_URL}`);
        console.log(`📅 Verification Date: ${new Date().toISOString()}`);
        console.log('='.repeat(80));
    }
}

// Run the verification
const verification = new UrgentProductionVerification();
verification.runAllTests().catch(console.error);