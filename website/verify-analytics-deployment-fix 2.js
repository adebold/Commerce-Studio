const https = require('https');

const SERVICE_URL = 'https://varai-website-353252826752.us-central1.run.app';

const analyticsPages = [
    '/analytics/',
    '/analytics/sales-forecasting.html',
    '/analytics/risk-assessment.html',
    '/analytics/growth-opportunities.html',
    '/analytics/real-time-analytics.html'
];

async function verifyPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                console.log(`✅ ${url} - OK (Status: ${res.statusCode})`);
                resolve(true);
            } else {
                console.log(`❌ ${url} - FAILED (Status: ${res.statusCode})`);
                resolve(false);
            }
        }).on('error', (err) => {
            console.log(`❌ ${url} - ERROR: ${err.message}`);
            resolve(false);
        });
    });
}

async function runVerification() {
    console.log('🔍 URGENT: Verifying Analytics Pages Deployment Fix...');
    console.log('=========================================================');
    console.log(`🌐 Service URL: ${SERVICE_URL}`);
    console.log('');
    
    let allPassed = true;
    const results = {};
    
    for (const page of analyticsPages) {
        const fullUrl = SERVICE_URL + page;
        const result = await verifyPage(fullUrl);
        results[page] = result;
        if (!result) allPassed = false;
    }
    
    console.log('');
    console.log('📊 ANALYTICS PAGES STATUS:');
    console.log('==========================');
    
    analyticsPages.forEach(page => {
        const status = results[page] ? '✅ WORKING' : '❌ FAILED';
        const fullUrl = SERVICE_URL + page;
        console.log(`${status} - ${page}`);
        console.log(`   URL: ${fullUrl}`);
    });
    
    console.log('');
    console.log('=========================================================');
    if (allPassed) {
        console.log('🎉 SUCCESS: All analytics pages are now accessible!');
        console.log('✅ DEPLOYMENT FIX COMPLETED SUCCESSFULLY');
        console.log('');
        console.log('📈 All 5 analytics pages are live:');
        console.log(`   • Analytics Hub: ${SERVICE_URL}/analytics/`);
        console.log(`   • Sales Forecasting: ${SERVICE_URL}/analytics/sales-forecasting.html`);
        console.log(`   • Risk Assessment: ${SERVICE_URL}/analytics/risk-assessment.html`);
        console.log(`   • Growth Opportunities: ${SERVICE_URL}/analytics/growth-opportunities.html`);
        console.log(`   • Real-time Analytics: ${SERVICE_URL}/analytics/real-time-analytics.html`);
        process.exit(0);
    } else {
        console.log('❌ CRITICAL: Some analytics pages are still not accessible');
        console.log('🚨 DEPLOYMENT FIX FAILED - Further investigation needed');
        process.exit(1);
    }
}

runVerification();