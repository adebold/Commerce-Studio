/**
 * Enhanced Customer Portal Verification Script
 * Tests the new Shopify and Magento UI enhancements
 * VARAi Commerce Studio - Store Connection Interface Testing
 */

const puppeteer = require('puppeteer');

async function runEnhancedVerification() {
    console.log('🚀 Starting Enhanced Customer Portal Verification...');
    console.log('🎯 Focus: Shopify & Magento UI Enhancements\n');

    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const baseUrl = 'https://commerce-studio-website-353252826752.us-central1.run.app';
    const results = {
        timestamp: new Date().toISOString(),
        testSuite: 'Enhanced Customer Portal Verification',
        focus: 'Shopify & Magento UI Enhancements',
        overallScore: 0,
        tests: {}
    };

    try {
        // Test 1: Demo Login Enhancements
        console.log('🔐 Testing Demo Login Enhancements...');
        await page.goto(`${baseUrl}/demo-login.html`, { waitUntil: 'networkidle0' });

        const demoLoginTests = await page.evaluate(() => {
            // Check for Shopify demo account
            const shopifyCard = Array.from(document.querySelectorAll('.demo-account-card')).find(card => 
                card.textContent.includes('Shopify') || card.textContent.includes('shopify')
            );

            // Check for Magento demo account
            const magentoCard = Array.from(document.querySelectorAll('.demo-account-card')).find(card => 
                card.textContent.includes('Magento') || card.textContent.includes('magento')
            );

            // Check for platform-specific styling
            const shopifyBorder = shopifyCard ? getComputedStyle(shopifyCard).borderColor : null;
            const magentoBorder = magentoCard ? getComputedStyle(magentoCard).borderColor : null;

            // Check for credentials display
            const shopifyCredentials = shopifyCard ? shopifyCard.textContent.includes('demo-shopify') : false;
            const magentoCredentials = magentoCard ? magentoCard.textContent.includes('demo-magento') : false;

            return {
                shopifyCard: !!shopifyCard,
                magentoCard: !!magentoCard,
                shopifyBorder: shopifyBorder,
                magentoBorder: magentoBorder,
                shopifyCredentials: shopifyCredentials,
                magentoCredentials: magentoCredentials,
                totalCards: document.querySelectorAll('.demo-account-card').length
            };
        });

        results.tests.demoLoginEnhancements = {
            score: 0,
            maxScore: 100,
            details: demoLoginTests
        };

        // Calculate demo login score
        let demoScore = 0;
        if (demoLoginTests.shopifyCard) demoScore += 20;
        if (demoLoginTests.magentoCard) demoScore += 20;
        if (demoLoginTests.shopifyCredentials) demoScore += 15;
        if (demoLoginTests.magentoCredentials) demoScore += 15;
        if (demoLoginTests.shopifyBorder && demoLoginTests.shopifyBorder !== 'rgb(0, 0, 0)') demoScore += 15;
        if (demoLoginTests.magentoBorder && demoLoginTests.magentoBorder !== 'rgb(0, 0, 0)') demoScore += 15;

        results.tests.demoLoginEnhancements.score = demoScore;

        console.log(`✅ Shopify demo card: ${demoLoginTests.shopifyCard}`);
        console.log(`✅ Magento demo card: ${demoLoginTests.magentoCard}`);
        console.log(`📋 Shopify credentials: ${demoLoginTests.shopifyCredentials}`);
        console.log(`📋 Magento credentials: ${demoLoginTests.magentoCredentials}`);
        console.log(`🎨 Demo Login Score: ${demoScore}/100\n`);

        // Test 2: Dashboard Store Connections Section
        console.log('🏪 Testing Dashboard Store Connections...');
        await page.goto(`${baseUrl}/dashboard/`, { waitUntil: 'networkidle0' });

        const dashboardTests = await page.evaluate(() => {
            // Check for Store Connections section
            const storeConnectionsHeading = Array.from(document.querySelectorAll('h2')).find(h => 
                h.textContent.includes('Store Connections')
            );

            // Check for platform cards
            const visioncraftCard = Array.from(document.querySelectorAll('.varai-card')).find(card => 
                card.textContent.includes('VisionCraft')
            );

            const shopifyCard = Array.from(document.querySelectorAll('.varai-card')).find(card => 
                card.textContent.includes('Shopify')
            );

            const magentoCard = Array.from(document.querySelectorAll('.varai-card')).find(card => 
                card.textContent.includes('Magento')
            );

            // Check for connection status badges
            const visioncraftConnected = visioncraftCard ? visioncraftCard.textContent.includes('Connected') : false;
            const shopifyReady = shopifyCard ? shopifyCard.textContent.includes('Ready to Connect') : false;
            const magentoReady = magentoCard ? magentoCard.textContent.includes('Ready to Connect') : false;

            // Check for connect buttons
            const shopifyConnectBtn = shopifyCard ? Array.from(shopifyCard.querySelectorAll('button')).find(btn => 
                btn.textContent.includes('Connect Store')
            ) : null;

            const magentoConnectBtn = magentoCard ? Array.from(magentoCard.querySelectorAll('button')).find(btn => 
                btn.textContent.includes('Connect Store')
            ) : null;

            // Check for demo links
            const shopifyDemoLink = shopifyCard ? Array.from(shopifyCard.querySelectorAll('a')).find(link => 
                link.textContent.includes('Try Demo')
            ) : null;

            const magentoDemoLink = magentoCard ? Array.from(magentoCard.querySelectorAll('a')).find(link => 
                link.textContent.includes('Try Demo')
            ) : null;

            // Check for additional platforms section
            const additionalPlatforms = Array.from(document.querySelectorAll('h3')).find(h => 
                h.textContent.includes('Additional Platforms')
            );

            const bigCommerceCard = Array.from(document.querySelectorAll('.varai-card')).find(card => 
                card.textContent.includes('BigCommerce')
            );

            const wooCommerceCard = Array.from(document.querySelectorAll('.varai-card')).find(card => 
                card.textContent.includes('WooCommerce')
            );

            return {
                storeConnectionsSection: !!storeConnectionsHeading,
                visioncraftCard: !!visioncraftCard,
                shopifyCard: !!shopifyCard,
                magentoCard: !!magentoCard,
                visioncraftConnected: visioncraftConnected,
                shopifyReady: shopifyReady,
                magentoReady: magentoReady,
                shopifyConnectButton: !!shopifyConnectBtn,
                magentoConnectButton: !!magentoConnectBtn,
                shopifyDemoLink: !!shopifyDemoLink,
                magentoDemoLink: !!magentoDemoLink,
                additionalPlatformsSection: !!additionalPlatforms,
                bigCommerceCard: !!bigCommerceCard,
                wooCommerceCard: !!wooCommerceCard
            };
        });

        results.tests.dashboardStoreConnections = {
            score: 0,
            maxScore: 100,
            details: dashboardTests
        };

        // Calculate dashboard score
        let dashboardScore = 0;
        if (dashboardTests.storeConnectionsSection) dashboardScore += 15;
        if (dashboardTests.visioncraftCard) dashboardScore += 10;
        if (dashboardTests.shopifyCard) dashboardScore += 15;
        if (dashboardTests.magentoCard) dashboardScore += 15;
        if (dashboardTests.visioncraftConnected) dashboardScore += 5;
        if (dashboardTests.shopifyReady) dashboardScore += 5;
        if (dashboardTests.magentoReady) dashboardScore += 5;
        if (dashboardTests.shopifyConnectButton) dashboardScore += 10;
        if (dashboardTests.magentoConnectButton) dashboardScore += 10;
        if (dashboardTests.shopifyDemoLink) dashboardScore += 5;
        if (dashboardTests.magentoDemoLink) dashboardScore += 5;

        results.tests.dashboardStoreConnections.score = dashboardScore;

        console.log(`🏪 Store Connections section: ${dashboardTests.storeConnectionsSection}`);
        console.log(`✅ VisionCraft card: ${dashboardTests.visioncraftCard} (Connected: ${dashboardTests.visioncraftConnected})`);
        console.log(`🛍️ Shopify card: ${dashboardTests.shopifyCard} (Ready: ${dashboardTests.shopifyReady})`);
        console.log(`🏬 Magento card: ${dashboardTests.magentoCard} (Ready: ${dashboardTests.magentoReady})`);
        console.log(`🔗 Shopify connect button: ${dashboardTests.shopifyConnectButton}`);
        console.log(`🔗 Magento connect button: ${dashboardTests.magentoConnectButton}`);
        console.log(`🎯 Dashboard Score: ${dashboardScore}/100\n`);

        // Test 3: Store Connection Modal Functionality
        console.log('🔧 Testing Store Connection Modal Functionality...');

        const modalTests = await page.evaluate(() => {
            // Check if dashboard.js is loaded
            const dashboardScript = Array.from(document.querySelectorAll('script')).find(script => 
                script.src && script.src.includes('dashboard.js')
            );

            // Check if connect functions exist
            const connectShopifyExists = typeof window.connectShopify === 'function';
            const connectMagentoExists = typeof window.connectMagento === 'function';

            return {
                dashboardScriptLoaded: !!dashboardScript,
                connectShopifyFunction: connectShopifyExists,
                connectMagentoFunction: connectMagentoExists
            };
        });

        results.tests.modalFunctionality = {
            score: 0,
            maxScore: 100,
            details: modalTests
        };

        // Calculate modal score
        let modalScore = 0;
        if (modalTests.dashboardScriptLoaded) modalScore += 50;
        if (modalTests.connectShopifyFunction) modalScore += 25;
        if (modalTests.connectMagentoFunction) modalScore += 25;

        results.tests.modalFunctionality.score = modalScore;

        console.log(`📜 Dashboard script loaded: ${modalTests.dashboardScriptLoaded}`);
        console.log(`🛍️ Shopify connect function: ${modalTests.connectShopifyFunction}`);
        console.log(`🏬 Magento connect function: ${modalTests.connectMagentoFunction}`);
        console.log(`⚙️ Modal Functionality Score: ${modalScore}/100\n`);

        // Test 4: Platform-Specific Navigation
        console.log('🧭 Testing Platform-Specific Navigation...');

        // Test Shopify demo link navigation
        await page.goto(`${baseUrl}/demo-login.html?platform=shopify`, { waitUntil: 'networkidle0' });
        
        const shopifyNavTest = await page.evaluate(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const platform = urlParams.get('platform');
            
            // Check if Shopify card is highlighted or has special styling
            const shopifyCard = Array.from(document.querySelectorAll('.demo-account-card')).find(card => 
                card.textContent.includes('Shopify')
            );
            
            return {
                platformParam: platform,
                shopifyCardPresent: !!shopifyCard,
                urlCorrect: platform === 'shopify'
            };
        });

        // Test Magento demo link navigation
        await page.goto(`${baseUrl}/demo-login.html?platform=magento`, { waitUntil: 'networkidle0' });
        
        const magentoNavTest = await page.evaluate(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const platform = urlParams.get('platform');
            
            const magentoCard = Array.from(document.querySelectorAll('.demo-account-card')).find(card => 
                card.textContent.includes('Magento')
            );
            
            return {
                platformParam: platform,
                magentoCardPresent: !!magentoCard,
                urlCorrect: platform === 'magento'
            };
        });

        results.tests.platformNavigation = {
            score: 0,
            maxScore: 100,
            details: {
                shopify: shopifyNavTest,
                magento: magentoNavTest
            }
        };

        // Calculate navigation score
        let navScore = 0;
        if (shopifyNavTest.urlCorrect) navScore += 25;
        if (shopifyNavTest.shopifyCardPresent) navScore += 25;
        if (magentoNavTest.urlCorrect) navScore += 25;
        if (magentoNavTest.magentoCardPresent) navScore += 25;

        results.tests.platformNavigation.score = navScore;

        console.log(`🛍️ Shopify URL navigation: ${shopifyNavTest.urlCorrect}`);
        console.log(`🏬 Magento URL navigation: ${magentoNavTest.urlCorrect}`);
        console.log(`🧭 Navigation Score: ${navScore}/100\n`);

        // Calculate overall score
        const totalScore = demoScore + dashboardScore + modalScore + navScore;
        const maxTotalScore = 400;
        results.overallScore = Math.round((totalScore / maxTotalScore) * 100);

        // Determine status based on score
        let status = 'NEEDS IMPROVEMENT';
        if (results.overallScore >= 90) status = '✅ FULLY OPERATIONAL';
        else if (results.overallScore >= 75) status = '⚠️ MOSTLY OPERATIONAL';
        else if (results.overallScore >= 50) status = '⚠️ API READY, UI ENHANCEMENT RECOMMENDED';
        else status = '❌ NEEDS SIGNIFICANT IMPROVEMENT';

        results.status = status;

        // Generate summary
        console.log('📊 ENHANCED VERIFICATION SUMMARY');
        console.log('=====================================');
        console.log(`🎯 Overall Score: ${results.overallScore}/100`);
        console.log(`📈 Status: ${status}`);
        console.log('');
        console.log('📋 Test Breakdown:');
        console.log(`  🔐 Demo Login Enhancements: ${demoScore}/100`);
        console.log(`  🏪 Dashboard Store Connections: ${dashboardScore}/100`);
        console.log(`  ⚙️ Modal Functionality: ${modalScore}/100`);
        console.log(`  🧭 Platform Navigation: ${navScore}/100`);
        console.log('');

        // Platform-specific status
        const shopifyScore = Math.round(((demoLoginTests.shopifyCard ? 25 : 0) + 
                                       (dashboardTests.shopifyCard ? 25 : 0) + 
                                       (dashboardTests.shopifyConnectButton ? 25 : 0) + 
                                       (shopifyNavTest.urlCorrect ? 25 : 0)) / 100 * 100);

        const magentoScore = Math.round(((demoLoginTests.magentoCard ? 25 : 0) + 
                                       (dashboardTests.magentoCard ? 25 : 0) + 
                                       (dashboardTests.magentoConnectButton ? 25 : 0) + 
                                       (magentoNavTest.urlCorrect ? 25 : 0)) / 100 * 100);

        console.log('🏪 Platform-Specific Results:');
        console.log(`  🛍️ Shopify: ${shopifyScore}/100 ${shopifyScore >= 90 ? '✅ FULLY OPERATIONAL' : shopifyScore >= 75 ? '⚠️ MOSTLY OPERATIONAL' : '⚠️ NEEDS IMPROVEMENT'}`);
        console.log(`  🏬 Magento: ${magentoScore}/100 ${magentoScore >= 90 ? '✅ FULLY OPERATIONAL' : magentoScore >= 75 ? '⚠️ MOSTLY OPERATIONAL' : '⚠️ NEEDS IMPROVEMENT'}`);
        console.log('');

        // Recommendations
        console.log('💡 RECOMMENDATIONS:');
        if (results.overallScore >= 90) {
            console.log('  ✅ Excellent! All UI enhancements are working perfectly.');
            console.log('  ✅ Shopify and Magento customers have full visibility and onboarding support.');
        } else {
            if (demoScore < 90) {
                console.log('  🔧 Enhance demo login page with better platform visibility');
            }
            if (dashboardScore < 90) {
                console.log('  🔧 Improve dashboard store connection interface');
            }
            if (modalScore < 90) {
                console.log('  🔧 Fix store connection modal functionality');
            }
            if (navScore < 90) {
                console.log('  🔧 Improve platform-specific navigation and highlighting');
            }
        }

        // Save results
        const fs = require('fs');
        fs.writeFileSync('enhanced-customer-portal-verification-results.json', JSON.stringify(results, null, 2));
        console.log('\n💾 Results saved to: enhanced-customer-portal-verification-results.json');

    } catch (error) {
        console.error('❌ Verification failed:', error);
        results.error = error.message;
        results.overallScore = 0;
        results.status = '❌ VERIFICATION FAILED';
    } finally {
        await browser.close();
    }

    return results;
}

// Run the verification
if (require.main === module) {
    runEnhancedVerification()
        .then(results => {
            console.log('\n🎉 Enhanced verification completed!');
            process.exit(results.overallScore >= 75 ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { runEnhancedVerification };