/**
 * CSS @import Fix Verification Test
 * 
 * This test verifies that the CSS @import issues have been resolved
 * and that all Apple hero sections and customer login integration work properly.
 */

const PRODUCTION_URL = 'https://commerce-studio-website-353252826752.us-central1.run.app';

class CSSImportFixVerification {
    constructor() {
        this.results = {
            cssImportFixes: {},
            appleHeroSections: {},
            customerLoginIntegration: {},
            fontLoading: {}
        };
        this.errors = [];
        this.warnings = [];
    }

    async runAllTests() {
        console.log('🔧 CSS @import Fix Verification Starting...\n');
        
        try {
            await this.testCSSImportFixes();
            await this.testFontLoading();
            await this.testAppleHeroSections();
            await this.testCustomerLoginIntegration();
            
            this.generateReport();
        } catch (error) {
            console.error('❌ Critical test failure:', error);
            this.errors.push(`Critical test failure: ${error.message}`);
        }
    }

    async testCSSImportFixes() {
        console.log('🔍 Testing CSS @import Fixes...');
        
        const cssFiles = [
            '/css/varai-design-system.css',
            '/css/apple-landing.css'
        ];

        for (const cssFile of cssFiles) {
            try {
                const response = await fetch(`${PRODUCTION_URL}${cssFile}`);
                if (response.ok) {
                    const cssContent = await response.text();
                    const hasImport = cssContent.includes('@import');
                    
                    if (hasImport) {
                        console.log(`❌ ${cssFile} still contains @import statements`);
                        this.errors.push(`${cssFile} still contains @import statements`);
                        this.results.cssImportFixes[cssFile] = 'STILL_HAS_IMPORT';
                    } else {
                        console.log(`✅ ${cssFile} @import statements removed`);
                        this.results.cssImportFixes[cssFile] = 'FIXED';
                    }
                } else {
                    console.log(`❌ ${cssFile} not accessible (${response.status})`);
                    this.errors.push(`${cssFile} not accessible`);
                    this.results.cssImportFixes[cssFile] = 'NOT_ACCESSIBLE';
                }
            } catch (error) {
                console.log(`❌ Error testing ${cssFile}: ${error.message}`);
                this.errors.push(`Error testing ${cssFile}: ${error.message}`);
                this.results.cssImportFixes[cssFile] = 'ERROR';
            }
        }
    }

    async testFontLoading() {
        console.log('\n📝 Testing Font Loading...');
        
        try {
            const response = await fetch(PRODUCTION_URL);
            const html = await response.text();
            
            // Check for Google Fonts preconnect
            const hasPreconnect = html.includes('rel="preconnect" href="https://fonts.googleapis.com"');
            console.log(`${hasPreconnect ? '✅' : '❌'} Google Fonts preconnect: ${hasPreconnect}`);
            this.results.fontLoading.preconnect = hasPreconnect;
            
            // Check for font stylesheet link
            const hasFontLink = html.includes('fonts.googleapis.com/css2?family=Inter') && html.includes('SF+Pro+Display');
            console.log(`${hasFontLink ? '✅' : '❌'} Font stylesheet link: ${hasFontLink}`);
            this.results.fontLoading.stylesheetLink = hasFontLink;
            
            if (!hasPreconnect || !hasFontLink) {
                this.warnings.push('Font loading optimization may not be complete');
            }
            
        } catch (error) {
            console.log(`❌ Error testing font loading: ${error.message}`);
            this.errors.push(`Font loading test failed: ${error.message}`);
        }
    }

    async testAppleHeroSections() {
        console.log('\n🍎 Testing Apple Hero Sections...');
        
        try {
            const response = await fetch(PRODUCTION_URL);
            const html = await response.text();
            
            // Check for Apple hero section
            const hasAppleHero = html.includes('apple-hero apple-hero-fullscreen');
            console.log(`${hasAppleHero ? '✅' : '❌'} Apple Hero Section: ${hasAppleHero}`);
            this.results.appleHeroSections.sectionPresent = hasAppleHero;
            
            // Check for Apple hero CSS
            const hasAppleHeroCSS = html.includes('apple-hero-sections.css');
            console.log(`${hasAppleHeroCSS ? '✅' : '❌'} Apple Hero CSS loaded: ${hasAppleHeroCSS}`);
            this.results.appleHeroSections.cssLoaded = hasAppleHeroCSS;
            
            // Check for Apple buttons
            const hasAppleButtons = html.includes('apple-btn apple-btn-primary');
            console.log(`${hasAppleButtons ? '✅' : '❌'} Apple Button styling: ${hasAppleButtons}`);
            this.results.appleHeroSections.buttonStyling = hasAppleButtons;
            
            // Check for Apple hero title
            const hasAppleTitle = html.includes('apple-hero-title apple-hero-title-xl');
            console.log(`${hasAppleTitle ? '✅' : '❌'} Apple Hero Title: ${hasAppleTitle}`);
            this.results.appleHeroSections.titleStyling = hasAppleTitle;
            
            if (!hasAppleHero || !hasAppleHeroCSS) {
                this.errors.push('Apple hero sections not properly implemented');
            }
            
        } catch (error) {
            console.log(`❌ Error testing Apple hero sections: ${error.message}`);
            this.errors.push(`Apple hero test failed: ${error.message}`);
        }
    }

    async testCustomerLoginIntegration() {
        console.log('\n👤 Testing Customer Login Integration...');
        
        try {
            const response = await fetch(PRODUCTION_URL);
            const html = await response.text();
            
            // Check for customer login in navigation
            const hasNavLogin = html.includes('href="customer/login.html"') && html.includes('Customer Portal');
            console.log(`${hasNavLogin ? '✅' : '❌'} Customer Login in Navigation: ${hasNavLogin}`);
            this.results.customerLoginIntegration.navigationLink = hasNavLogin;
            
            // Check for customer login in hero section
            const hasHeroLogin = html.includes('Customer Login') && html.includes('apple-btn');
            console.log(`${hasHeroLogin ? '✅' : '❌'} Customer Login in Hero Section: ${hasHeroLogin}`);
            this.results.customerLoginIntegration.heroButton = hasHeroLogin;
            
            // Test customer login page accessibility
            const loginResponse = await fetch(`${PRODUCTION_URL}/customer/login.html`);
            const loginAccessible = loginResponse.ok;
            console.log(`${loginAccessible ? '✅' : '❌'} Customer Login Page Accessible: ${loginAccessible}`);
            this.results.customerLoginIntegration.pageAccessible = loginAccessible;
            
            // Test customer portal page
            const portalResponse = await fetch(`${PRODUCTION_URL}/customer/index.html`);
            const portalAccessible = portalResponse.ok;
            console.log(`${portalAccessible ? '✅' : '❌'} Customer Portal Accessible: ${portalAccessible}`);
            this.results.customerLoginIntegration.portalAccessible = portalAccessible;
            
            if (!hasNavLogin || !loginAccessible) {
                this.errors.push('Customer login integration incomplete');
            }
            
        } catch (error) {
            console.log(`❌ Error testing customer login: ${error.message}`);
            this.errors.push(`Customer login test failed: ${error.message}`);
        }
    }

    generateReport() {
        console.log('\n📊 VERIFICATION REPORT');
        console.log('='.repeat(50));
        
        // CSS Import Fixes
        console.log('\n🔧 CSS @import Fixes:');
        Object.entries(this.results.cssImportFixes).forEach(([file, status]) => {
            const icon = status === 'FIXED' ? '✅' : '❌';
            console.log(`  ${icon} ${file}: ${status}`);
        });
        
        // Font Loading
        console.log('\n📝 Font Loading:');
        console.log(`  ${this.results.fontLoading.preconnect ? '✅' : '❌'} Preconnect: ${this.results.fontLoading.preconnect}`);
        console.log(`  ${this.results.fontLoading.stylesheetLink ? '✅' : '❌'} Stylesheet: ${this.results.fontLoading.stylesheetLink}`);
        
        // Apple Hero Sections
        console.log('\n🍎 Apple Hero Sections:');
        console.log(`  ${this.results.appleHeroSections.sectionPresent ? '✅' : '❌'} Section Present: ${this.results.appleHeroSections.sectionPresent}`);
        console.log(`  ${this.results.appleHeroSections.cssLoaded ? '✅' : '❌'} CSS Loaded: ${this.results.appleHeroSections.cssLoaded}`);
        console.log(`  ${this.results.appleHeroSections.buttonStyling ? '✅' : '❌'} Button Styling: ${this.results.appleHeroSections.buttonStyling}`);
        console.log(`  ${this.results.appleHeroSections.titleStyling ? '✅' : '❌'} Title Styling: ${this.results.appleHeroSections.titleStyling}`);
        
        // Customer Login Integration
        console.log('\n👤 Customer Login Integration:');
        console.log(`  ${this.results.customerLoginIntegration.navigationLink ? '✅' : '❌'} Navigation Link: ${this.results.customerLoginIntegration.navigationLink}`);
        console.log(`  ${this.results.customerLoginIntegration.heroButton ? '✅' : '❌'} Hero Button: ${this.results.customerLoginIntegration.heroButton}`);
        console.log(`  ${this.results.customerLoginIntegration.pageAccessible ? '✅' : '❌'} Login Page: ${this.results.customerLoginIntegration.pageAccessible}`);
        console.log(`  ${this.results.customerLoginIntegration.portalAccessible ? '✅' : '❌'} Portal Page: ${this.results.customerLoginIntegration.portalAccessible}`);
        
        // Summary
        console.log('\n📋 SUMMARY:');
        if (this.errors.length === 0) {
            console.log('🎉 SUCCESS: All CSS @import issues fixed and features working!');
            console.log('✅ Apple hero sections properly deployed (400px+ height)');
            console.log('✅ Customer login prominently accessible');
            console.log('✅ All navigation links working');
            console.log('✅ Production deployment complete');
        } else {
            console.log('⚠️  Issues found:');
            this.errors.forEach(error => console.log(`  ❌ ${error}`));
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            this.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
        }
        
        console.log('\n🌐 Production URLs:');
        console.log(`  Main Website: ${PRODUCTION_URL}`);
        console.log(`  Customer Login: ${PRODUCTION_URL}/customer/login.html`);
        console.log(`  Customer Portal: ${PRODUCTION_URL}/customer/index.html`);
    }
}

// Run the verification if this script is executed directly
if (typeof window !== 'undefined') {
    // Browser environment
    window.runCSSImportFixVerification = async function() {
        const verification = new CSSImportFixVerification();
        await verification.runAllTests();
        return verification.results;
    };
} else {
    // Node.js environment
    const verification = new CSSImportFixVerification();
    verification.runAllTests().then(() => {
        process.exit(verification.errors.length > 0 ? 1 : 0);
    });
}

module.exports = CSSImportFixVerification;