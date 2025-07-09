#!/usr/bin/env node

/**
 * Simple API Error Diagnostic Tool
 * Helps diagnose the "Internal server error" issue in Commerce Studio
 */

const fs = require('fs');
const path = require('path');

function diagnoseAPIError() {
    console.log('🔍 Commerce Studio API Error Diagnostic Tool');
    console.log('='.repeat(50));
    
    // Check environment variables
    console.log('\n📋 Environment Configuration:');
    const requiredEnvVars = [
        'GOOGLE_CLOUD_PROJECT_ID',
        'DIALOGFLOW_LOCATION', 
        'DIALOGFLOW_AGENT_ID',
        'GOOGLE_APPLICATION_CREDENTIALS'
    ];
    
    let envIssues = [];
    requiredEnvVars.forEach(envVar => {
        const value = process.env[envVar];
        if (!value) {
            envIssues.push(envVar);
            console.log(`❌ ${envVar}: NOT SET`);
        } else {
            console.log(`✅ ${envVar}: ${value.substring(0, 20)}...`);
        }
    });
    
    if (envIssues.length > 0) {
        console.log(`\n🚨 Missing Environment Variables: ${envIssues.join(', ')}`);
        console.log('This is likely causing the "Internal server error"');
    }
    
    // Check if credentials file exists
    console.log('\n🔐 Checking Google Cloud Credentials:');
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (credentialsPath) {
        try {
            if (fs.existsSync(credentialsPath)) {
                const stats = fs.statSync(credentialsPath);
                console.log(`✅ Credentials file exists: ${credentialsPath}`);
                console.log(`   Size: ${stats.size} bytes`);
                console.log(`   Modified: ${stats.mtime}`);
            } else {
                console.log(`❌ Credentials file not found: ${credentialsPath}`);
                console.log('This will cause authentication failures');
            }
        } catch (error) {
            console.log(`❌ Error checking credentials file: ${error.message}`);
        }
    } else {
        console.log('❌ GOOGLE_APPLICATION_CREDENTIALS not set');
    }
    
    // Check if required service files exist
    console.log('\n📁 Checking Service Files:');
    const serviceFiles = [
        'services/google/unified-dialogflow-service.js',
        'apps/shopify/connectors/vertex-ai-connector.js',
        'apps/shopify/api/ai-discovery/chat.js'
    ];
    
    serviceFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${filePath}: exists`);
        } else {
            console.log(`❌ ${filePath}: missing`);
        }
    });
    
    // Analyze the error pattern
    console.log('\n🔍 Error Analysis:');
    console.log('The error format you\'re seeing:');
    console.log('{"type":"error","error":{"details":null,"type":"api_error","message":"Internal server error"}}');
    console.log('\nThis suggests:');
    console.log('1. The API endpoint is being reached (not a 404)');
    console.log('2. An exception is being caught in the try/catch block');
    console.log('3. The error is being sanitized for security (no stack trace)');
    
    // Check common causes
    console.log('\n🎯 Most Likely Causes:');
    if (envIssues.length > 0) {
        console.log('1. ❌ Missing environment variables (CRITICAL)');
    }
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS || '')) {
        console.log('2. ❌ Google Cloud authentication failure (CRITICAL)');
    }
    console.log('3. ⚠️  Dialogflow CX agent not properly configured');
    console.log('4. ⚠️  Network connectivity issues to Google Cloud');
    console.log('5. ⚠️  Invalid request payload structure');
    
    // Provide specific fixes
    console.log('\n🔧 Immediate Fixes:');
    
    if (envIssues.includes('GOOGLE_CLOUD_PROJECT_ID')) {
        console.log('Set your Google Cloud Project ID:');
        console.log('export GOOGLE_CLOUD_PROJECT_ID="your-project-id"');
    }
    
    if (envIssues.includes('GOOGLE_APPLICATION_CREDENTIALS')) {
        console.log('Set path to your service account key:');
        console.log('export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"');
    }
    
    if (envIssues.includes('DIALOGFLOW_AGENT_ID')) {
        console.log('Set your Dialogflow CX Agent ID:');
        console.log('export DIALOGFLOW_AGENT_ID="your-agent-id"');
    }
    
    console.log('\n📝 Test Commands:');
    console.log('# Test Google Cloud auth:');
    console.log('gcloud auth application-default print-access-token');
    console.log('\n# List Dialogflow agents:');
    console.log('gcloud dialogflow agents list --location=us-central1');
    console.log('\n# Test API endpoint manually:');
    console.log('curl -X POST http://localhost:3000/api/chat \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"message":"test","sessionId":"test-123"}\'');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Fix any missing environment variables shown above');
    console.log('2. Restart your application server');
    console.log('3. Test the API endpoint again');
    console.log('4. Check application logs for more detailed errors');
    
    if (envIssues.length === 0) {
        console.log('\n✅ Environment looks good! The issue might be:');
        console.log('- Network connectivity to Google Cloud');
        console.log('- Dialogflow agent configuration');
        console.log('- Request payload validation');
        console.log('Check your application logs for more details.');
    }
}

// Run diagnostic
diagnoseAPIError();