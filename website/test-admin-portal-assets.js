#!/usr/bin/env node

const https = require('https');

const baseUrl = 'https://varai-website-353252826752.us-central1.run.app';

// List of assets that the user reported as failing
const assetsToTest = [
    '/js/enterprise-enhancements.js',
    '/css/apple-hero-sections.css', 
    '/css/varai-design-system.css',
    '/css/main.css',
    '/css/enterprise-enhancements.css',
    '/js/main.js',
    '/js/theme-manager.js',
    '/js/admin-portal.js'
];

console.log('🔍 Testing Admin Portal Assets...\n');

function testAsset(path) {
    return new Promise((resolve) => {
        const url = baseUrl + path;
        
        https.get(url, (res) => {
            const status = res.statusCode;
            const size = res.headers['content-length'] || 'unknown';
            
            if (status === 200) {
                console.log(`✅ ${path} - HTTP ${status} (${size} bytes)`);
            } else {
                console.log(`❌ ${path} - HTTP ${status}`);
            }
            
            resolve({ path, status, size });
        }).on('error', (err) => {
            console.log(`❌ ${path} - ERROR: ${err.message}`);
            resolve({ path, status: 'ERROR', error: err.message });
        });
    });
}

async function testAllAssets() {
    const results = [];
    
    for (const asset of assetsToTest) {
        const result = await testAsset(asset);
        results.push(result);
    }
    
    console.log('\n📊 Summary:');
    const working = results.filter(r => r.status === 200).length;
    const failing = results.length - working;
    
    console.log(`✅ Working: ${working}`);
    console.log(`❌ Failing: ${failing}`);
    
    if (failing > 0) {
        console.log('\n🚨 Failed Assets:');
        results.filter(r => r.status !== 200).forEach(r => {
            console.log(`   ${r.path} - ${r.status}`);
        });
    }
    
    return results;
}

testAllAssets().then(() => {
    console.log('\n✅ Asset testing complete!');
}).catch(err => {
    console.error('❌ Testing failed:', err);
});