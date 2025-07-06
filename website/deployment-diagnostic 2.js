#!/usr/bin/env node

/**
 * Deployment Diagnostic Script
 * Investigates why analytics files are returning 404
 */

const https = require('https');

const BASE_URL = 'https://commerce-studio-website-ddtojwjn7a-uc.a.run.app';

async function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function diagnose() {
    console.log('🔍 DEPLOYMENT DIAGNOSTIC ANALYSIS');
    console.log('='.repeat(50));
    
    // Test what /analytics/ actually returns
    console.log('\n1. Analyzing /analytics/ response...');
    try {
        const analyticsResponse = await makeRequest(`${BASE_URL}/analytics/`);
        console.log(`Status: ${analyticsResponse.statusCode}`);
        console.log(`Content-Length: ${analyticsResponse.data.length}`);
        
        // Check if it's returning the homepage instead of analytics page
        if (analyticsResponse.data.includes('<title>')) {
            const titleMatch = analyticsResponse.data.match(/<title>(.*?)<\/title>/);
            if (titleMatch) {
                console.log(`Page Title: "${titleMatch[1]}"`);
            }
        }
        
        // Check for analytics-specific content
        const hasAnalyticsContent = analyticsResponse.data.includes('analytics') || 
                                   analyticsResponse.data.includes('Analytics') ||
                                   analyticsResponse.data.includes('forecasting');
        console.log(`Contains analytics content: ${hasAnalyticsContent}`);
        
        // Check if it's the homepage
        const isHomepage = analyticsResponse.data.includes('VarAI Commerce Studio') &&
                          analyticsResponse.data.includes('Revolutionize');
        console.log(`Is homepage content: ${isHomepage}`);
        
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    
    // Test direct file access
    console.log('\n2. Testing direct file access patterns...');
    const testPaths = [
        '/analytics/index.html',
        '/analytics/sales-forecasting.html',
        '/analytics/real-time-analytics.html',
        '/js/analytics-showcase.js',
        '/css/predictive-analytics.css'
    ];
    
    for (const path of testPaths) {
        try {
            const response = await makeRequest(`${BASE_URL}${path}`);
            console.log(`${path}: ${response.statusCode} (${response.data.length} bytes)`);
            
            if (response.statusCode === 404) {
                // Check if it's a generic 404 or nginx 404
                if (response.data.includes('nginx')) {
                    console.log(`  → Nginx 404 (file not found on server)`);
                } else if (response.data.includes('Google Cloud')) {
                    console.log(`  → Cloud Run 404`);
                } else {
                    console.log(`  → Generic 404`);
                }
            }
        } catch (error) {
            console.log(`${path}: ERROR - ${error.message}`);
        }
    }
    
    // Test nginx routing behavior
    console.log('\n3. Testing nginx routing behavior...');
    const routingTests = [
        '/analytics',
        '/analytics/',
        '/analytics/index',
        '/analytics/index.html'
    ];
    
    for (const path of routingTests) {
        try {
            const response = await makeRequest(`${BASE_URL}${path}`);
            console.log(`${path}: ${response.statusCode}`);
            
            if (response.statusCode === 200) {
                const isHomepage = response.data.includes('VarAI Commerce Studio');
                console.log(`  → Returns: ${isHomepage ? 'Homepage' : 'Analytics page'}`);
            }
        } catch (error) {
            console.log(`${path}: ERROR - ${error.message}`);
        }
    }
    
    // Check for common static assets
    console.log('\n4. Testing static asset availability...');
    const staticAssets = [
        '/css/varai-design-system.css',
        '/js/dashboard.js',
        '/favicon.ico'
    ];
    
    for (const asset of staticAssets) {
        try {
            const response = await makeRequest(`${BASE_URL}${asset}`);
            console.log(`${asset}: ${response.statusCode}`);
        } catch (error) {
            console.log(`${asset}: ERROR - ${error.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🔍 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(50));
    
    console.log('\n💡 LIKELY CAUSES:');
    console.log('1. Analytics files not copied during Docker build');
    console.log('2. Nginx routing falling back to index.html for /analytics/');
    console.log('3. File permissions issue in container');
    console.log('4. Build process excluding analytics directory');
    
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('1. Verify Dockerfile COPY commands include analytics files');
    console.log('2. Check .gcloudignore doesn\'t exclude analytics files');
    console.log('3. Rebuild and redeploy with explicit analytics file inclusion');
    console.log('4. Test nginx configuration locally');
    
    console.log('\n🚨 IMMEDIATE ACTION REQUIRED:');
    console.log('- Redeploy with fixed Docker build process');
    console.log('- Verify all analytics files are included in deployment');
    console.log('- Test deployment locally before pushing to Cloud Run');
}

diagnose().catch(console.error);