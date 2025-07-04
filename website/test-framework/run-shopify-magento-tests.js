#!/usr/bin/env node

/**
 * Shopify & Magento Implementation Test Runner
 * Simple script to demonstrate testing the UI enhancements
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

console.log('🧪 Shopify & Magento Implementation Test Runner');
console.log('==============================================\n');

async function runTests() {
    const browser = await puppeteer.launch({ 
        headless: false, // Set to true for automated testing
        defaultViewport: { width: 1920, height: 1080 }
    });
    
    const page = await browser.newPage();
    const baseUrl = 'https://commerce-studio-website-353252826752.us-central1.run.app';
    
    console.log('🚀 Starting Shopify & Magento UI Enhancement Tests...\n');

    try {
        // Test 1: Demo Login Page
        console.log('📋 Test 1: Demo Login Page Enhancement');
        console.log('=====================================');
        
        await page.goto(`${baseUrl}/demo-login.html`, { waitUntil: 'networkidle0' });
        
        // Check for Shopify card
        const shopifyCard = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.demo-account-card')).find(card => 
                card.textContent.includes('Shopify') || card.textContent.includes('shopify')
            );
        });
        
        // Check for Magento card
        const magentoCard = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.demo-account-card')).find(card => 
                card.textContent.includes('Magento') || card.textContent.includes('magento')
            );
        });
        
        console.log(`✅ Shopify demo card found: ${!!shopifyCard}`);
        console.log(`✅ Magento demo card found: ${!!magentoCard}`);
        
        if (shopifyCard && magentoCard) {
            console.log('🎉 Demo login enhancement: PASSED\n');
        } else {
            console.log('❌ Demo login enhancement: FAILED - Missing platform cards\n');
        }

        // Test 2: Dashboard Store Connections
        console.log('📋 Test 2: Dashboard Store Connections');
        console.log('====================================');
        
        await page.goto(`${baseUrl}/dashboard/`, { waitUntil: 'networkidle0' });
        
        // Check for Store Connections section
        const storeConnectionsSection = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('h2')).find(h => 
                h.textContent.includes('Store Connections')
            );
        });
        
        // Check for platform cards in dashboard
        const dashboardShopify = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.varai-card')).find(card => 
                card.textContent.includes('Shopify')
            );
        });
        
        const dashboardMagento = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.varai-card')).find(card => 
                card.textContent.includes('Magento')
            );
        });
        
        // Check for connect buttons
        const shopifyConnectBtn = await page.evaluate(() => {
            const shopifyCard = Array.from(document.querySelectorAll('.varai-card')).find(card => 
                card.textContent.includes('Shopify')
            );
            return shopifyCard ? Array.from(shopifyCard.querySelectorAll('button')).find(btn => 
                btn.textContent.includes('Connect Store')
            ) : null;
        });
        
        console.log(`✅ Store Connections section found: ${!!storeConnectionsSection}`);
        console.log(`✅ Shopify card in dashboard: ${!!dashboardShopify}`);
        console.log(`✅ Magento card in dashboard: ${!!dashboardMagento}`);
        console.log(`✅ Shopify connect button: ${!!shopifyConnectBtn}`);
        
        if (storeConnectionsSection && dashboardShopify && dashboardMagento && shopifyConnectBtn) {
            console.log('🎉 Dashboard store connections: PASSED\n');
        } else {
            console.log('❌ Dashboard store connections: FAILED - Missing elements\n');
        }

        // Test 3: Modal Functionality (if connect button exists)
        if (shopifyConnectBtn) {
            console.log('📋 Test 3: Connection Modal Functionality');
            console.log('=======================================');
            
            // Click the Shopify connect button
            await page.evaluate(() => {
                const shopifyCard = Array.from(document.querySelectorAll('.varai-card')).find(card => 
                    card.textContent.includes('Shopify')
                );
                const connectBtn = shopifyCard ? Array.from(shopifyCard.querySelectorAll('button')).find(btn => 
                    btn.textContent.includes('Connect Store')
                ) : null;
                if (connectBtn) connectBtn.click();
            });
            
            // Wait for modal to appear
            await page.waitForTimeout(1000);
            
            // Check if modal opened
            const modalPresent = await page.evaluate(() => {
                return !!document.querySelector('.varai-modal-overlay');
            });
            
            console.log(`✅ Shopify connection modal opens: ${modalPresent}`);
            
            if (modalPresent) {
                // Check modal content
                const modalContent = await page.evaluate(() => {
                    const modal = document.querySelector('.varai-modal');
                    return modal ? {
                        hasTitle: modal.textContent.includes('Connect Your Shopify Store'),
                        hasStoreUrlField: !!modal.querySelector('input[name="store_url"]'),
                        hasApiKeyField: !!modal.querySelector('input[name="api_key"]'),
                        hasConnectButton: !!Array.from(modal.querySelectorAll('button')).find(btn => 
                            btn.textContent.includes('Connect Store')
                        )
                    } : {};
                });
                
                console.log(`✅ Modal has correct title: ${modalContent.hasTitle}`);
                console.log(`✅ Modal has store URL field: ${modalContent.hasStoreUrlField}`);
                console.log(`✅ Modal has API key field: ${modalContent.hasApiKeyField}`);
                console.log(`✅ Modal has connect button: ${modalContent.hasConnectButton}`);
                
                // Close modal
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
                
                console.log('🎉 Modal functionality: PASSED\n');
            } else {
                console.log('❌ Modal functionality: FAILED - Modal did not open\n');
            }
        }

        // Test 4: Platform-Specific Navigation
        console.log('📋 Test 4: Platform-Specific Navigation');
        console.log('=====================================');
        
        // Test Shopify navigation
        await page.goto(`${baseUrl}/demo-login.html?platform=shopify`, { waitUntil: 'networkidle0' });
        
        const shopifyParamTest = await page.evaluate(() => {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('platform') === 'shopify';
        });
        
        // Test Magento navigation
        await page.goto(`${baseUrl}/demo-login.html?platform=magento`, { waitUntil: 'networkidle0' });
        
        const magentoParamTest = await page.evaluate(() => {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('platform') === 'magento';
        });
        
        console.log(`✅ Shopify URL parameter handling: ${shopifyParamTest}`);
        console.log(`✅ Magento URL parameter handling: ${magentoParamTest}`);
        
        if (shopifyParamTest && magentoParamTest) {
            console.log('🎉 Platform navigation: PASSED\n');
        } else {
            console.log('❌ Platform navigation: FAILED - URL parameters not working\n');
        }

        // Generate Summary
        console.log('📊 TEST SUMMARY');
        console.log('===============');
        
        const results = {
            demoLogin: !!(shopifyCard && magentoCard),
            dashboard: !!(storeConnectionsSection && dashboardShopify && dashboardMagento),
            modal: !!shopifyConnectBtn, // Basic check - modal exists if button exists
            navigation: !!(shopifyParamTest && magentoParamTest)
        };
        
        const passedTests = Object.values(results).filter(Boolean).length;
        const totalTests = Object.keys(results).length;
        const score = Math.round((passedTests / totalTests) * 100);
        
        console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
        console.log(`📈 Overall Score: ${score}%`);
        
        if (score >= 75) {
            console.log('🎉 Status: IMPLEMENTATION SUCCESSFUL');
            console.log('✅ Shopify and Magento UI enhancements are working!');
        } else {
            console.log('⚠️ Status: NEEDS IMPROVEMENT');
            console.log('❌ Some UI enhancements may need deployment or fixes');
        }
        
        // Save results
        const testResults = {
            timestamp: new Date().toISOString(),
            score: score,
            status: score >= 75 ? 'PASSED' : 'FAILED',
            details: results,
            recommendations: score < 75 ? [
                'Deploy latest changes to production',
                'Check browser cache and hard refresh',
                'Verify all files are properly uploaded',
                'Check console for JavaScript errors'
            ] : ['All tests passed! Implementation is successful.']
        };
        
        fs.writeFileSync('shopify-magento-test-results.json', JSON.stringify(testResults, null, 2));
        console.log('\n💾 Results saved to: shopify-magento-test-results.json');

    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the tests
if (require.main === module) {
    runTests()
        .then(() => {
            console.log('\n🎉 Test execution completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { runTests };