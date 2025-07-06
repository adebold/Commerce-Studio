/**
 * EMERGENCY Google Maps Store Locator Test
 * Tests the fallback API key functionality
 */

const puppeteer = require('puppeteer');

async function emergencyMapsTest() {
    console.log('🚨 EMERGENCY Google Maps Store Locator Test');
    console.log('='.repeat(50));
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        devtools: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capture all console messages and errors
    const logs = [];
    const errors = [];
    
    page.on('console', msg => {
        const text = msg.text();
        logs.push(`${msg.type().toUpperCase()}: ${text}`);
        console.log(`📝 ${msg.type().toUpperCase()}: ${text}`);
    });
    
    page.on('pageerror', error => {
        errors.push(error.message);
        console.log(`❌ PAGE ERROR: ${error.message}`);
    });
    
    page.on('requestfailed', request => {
        errors.push(`Failed request: ${request.url()}`);
        console.log(`🚫 FAILED REQUEST: ${request.url()}`);
    });
    
    try {
        console.log('🔍 Loading store locator page...');
        await page.goto('https://commerce-studio-website-353252826752.us-central1.run.app/store-locator.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        console.log('✅ Store locator page loaded successfully');
        
        // Wait for potential async operations
        console.log('⏳ Waiting for JavaScript initialization...');
        await page.waitForTimeout(5000);
        
        // Check page elements
        const pageAnalysis = await page.evaluate(() => {
            return {
                hasMapDiv: !!document.getElementById('map'),
                hasStoreList: !!document.getElementById('store-list'),
                hasSearchInput: !!document.getElementById('location-search'),
                mapDivContent: document.getElementById('map') ? document.getElementById('map').innerHTML.substring(0, 200) : 'No map div found',
                storeLocatorInstance: typeof window.storeLocator !== 'undefined',
                googleMapsLoaded: typeof google !== 'undefined' && typeof google.maps !== 'undefined',
                fallbackApiKey: window.storeLocator ? window.storeLocator.fallbackApiKey : 'Not available'
            };
        });
        
        console.log('\n📊 Page Analysis Results:');
        console.log('- Map container present:', pageAnalysis.hasMapDiv);
        console.log('- Store list present:', pageAnalysis.hasStoreList);
        console.log('- Search input present:', pageAnalysis.hasSearchInput);
        console.log('- Store locator instance:', pageAnalysis.storeLocatorInstance);
        console.log('- Google Maps API loaded:', pageAnalysis.googleMapsLoaded);
        console.log('- Fallback API key available:', pageAnalysis.fallbackApiKey ? 'Yes' : 'No');
        console.log('- Map div content preview:', pageAnalysis.mapDivContent);
        
        // Test API key endpoint
        console.log('\n🔑 Testing API key endpoint...');
        const apiResponse = await page.evaluate(async () => {
            try {
                const response = await fetch('/api/config/maps-key');
                return {
                    status: response.status,
                    ok: response.ok,
                    statusText: response.statusText,
                    data: response.ok ? await response.json() : await response.text()
                };
            } catch (error) {
                return { error: error.message };
            }
        });
        
        console.log('API endpoint response:', apiResponse);
        
        // Check if map is actually rendering
        console.log('\n🗺️ Checking map rendering...');
        await page.waitForTimeout(3000);
        
        const mapStatus = await page.evaluate(() => {
            const mapDiv = document.getElementById('map');
            if (!mapDiv) return { status: 'no-map-div' };
            
            const hasChildren = mapDiv.children.length > 0;
            const hasGoogleContent = mapDiv.innerHTML.includes('gm-') || mapDiv.innerHTML.includes('google');
            const hasFallbackContent = mapDiv.innerHTML.includes('Store Locations') || mapDiv.innerHTML.includes('store-item');
            
            return {
                status: 'map-div-found',
                hasChildren,
                hasGoogleContent,
                hasFallbackContent,
                childrenCount: mapDiv.children.length,
                innerHTML: mapDiv.innerHTML.substring(0, 500)
            };
        });
        
        console.log('Map rendering status:', mapStatus);
        
        // Take a screenshot for visual verification
        console.log('\n📸 Taking screenshot...');
        await page.screenshot({ 
            path: 'emergency-maps-test-screenshot.png', 
            fullPage: true 
        });
        console.log('Screenshot saved as: emergency-maps-test-screenshot.png');
        
        // Final assessment
        console.log('\n🎯 EMERGENCY TEST RESULTS:');
        console.log('='.repeat(50));
        
        if (pageAnalysis.googleMapsLoaded) {
            console.log('✅ SUCCESS: Google Maps API loaded successfully');
        } else if (mapStatus.hasFallbackContent) {
            console.log('⚠️ FALLBACK: Google Maps failed, but fallback UI is working');
        } else {
            console.log('❌ FAILURE: Neither Google Maps nor fallback UI is working');
        }
        
        if (errors.length === 0) {
            console.log('✅ No JavaScript errors detected');
        } else {
            console.log(`❌ ${errors.length} errors detected:`, errors);
        }
        
        console.log('\n📋 Summary:');
        console.log(`- Page loads: ✅`);
        console.log(`- Map container: ${pageAnalysis.hasMapDiv ? '✅' : '❌'}`);
        console.log(`- Google Maps: ${pageAnalysis.googleMapsLoaded ? '✅' : '❌'}`);
        console.log(`- Fallback UI: ${mapStatus.hasFallbackContent ? '✅' : '❌'}`);
        console.log(`- JavaScript errors: ${errors.length === 0 ? '✅' : '❌'}`);
        
        const overallStatus = pageAnalysis.hasMapDiv && (pageAnalysis.googleMapsLoaded || mapStatus.hasFallbackContent) && errors.length === 0;
        console.log(`\n🏆 OVERALL STATUS: ${overallStatus ? '✅ WORKING' : '❌ NEEDS ATTENTION'}`);
        
    } catch (error) {
        console.log('❌ Critical error during test:', error.message);
    } finally {
        console.log('\n🔚 Test completed. Browser will remain open for manual inspection.');
        console.log('Press Ctrl+C to close when done.');
        
        // Keep browser open for manual inspection
        // await browser.close();
    }
}

// Run the test
emergencyMapsTest().catch(console.error);