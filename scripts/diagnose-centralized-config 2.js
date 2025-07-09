#!/usr/bin/env node

/**
 * Centralized Configuration Diagnostic Tool
 * Diagnoses the "Internal server error" using Commerce Studio's centralized config approach
 */

const fs = require('fs');
const path = require('path');

function diagnoseCentralizedConfig() {
    console.log('🔍 Commerce Studio Centralized Configuration Diagnostic');
    console.log('='.repeat(60));
    
    const environment = process.env.NODE_ENV || 'development';
    console.log(`\n🌍 Environment: ${environment}`);
    
    // Check centralized configuration files
    console.log('\n📋 Checking Centralized Configuration Files:');
    
    const configFiles = [
        `config/environments/${environment}.yaml`,
        'config/google_cloud/project_config.yaml',
        'config/google_cloud/service_accounts.yaml',
        'core/config-service.js',
        'core/google-cloud-auth-service.js'
    ];
    
    let missingFiles = [];
    configFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${filePath}: exists`);
        } else {
            console.log(`❌ ${filePath}: missing`);
            missingFiles.push(filePath);
        }
    });
    
    // Check environment variables (only the essential ones for centralized approach)
    console.log('\n🔑 Checking Essential Environment Variables:');
    const essentialEnvVars = [
        'GOOGLE_APPLICATION_CREDENTIALS',
        'DIALOGFLOW_AGENT_ID'
    ];
    
    let missingEnvVars = [];
    essentialEnvVars.forEach(envVar => {
        const value = process.env[envVar];
        if (!value) {
            missingEnvVars.push(envVar);
            console.log(`❌ ${envVar}: NOT SET`);
        } else {
            console.log(`✅ ${envVar}: ${value.substring(0, 30)}...`);
        }
    });
    
    // Check optional environment variables
    console.log('\n📝 Optional Environment Variables (can be set in config files):');
    const optionalEnvVars = [
        'GOOGLE_CLOUD_PROJECT_ID',
        'DIALOGFLOW_LOCATION',
        'NODE_ENV'
    ];
    
    optionalEnvVars.forEach(envVar => {
        const value = process.env[envVar];
        if (value) {
            console.log(`✅ ${envVar}: ${value}`);
        } else {
            console.log(`⚠️  ${envVar}: Not set (will use config file defaults)`);
        }
    });
    
    // Check credentials file
    console.log('\n🔐 Checking Google Cloud Credentials:');
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (credentialsPath) {
        try {
            if (fs.existsSync(credentialsPath)) {
                const stats = fs.statSync(credentialsPath);
                console.log(`✅ Credentials file exists: ${credentialsPath}`);
                console.log(`   Size: ${stats.size} bytes`);
                console.log(`   Modified: ${stats.mtime}`);
                
                // Try to parse the credentials file
                try {
                    const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
                    const credentials = JSON.parse(credentialsContent);
                    console.log(`✅ Credentials file is valid JSON`);
                    console.log(`   Project ID: ${credentials.project_id || 'Not specified'}`);
                    console.log(`   Client Email: ${credentials.client_email || 'Not specified'}`);
                } catch (parseError) {
                    console.log(`❌ Credentials file is not valid JSON: ${parseError.message}`);
                }
            } else {
                console.log(`❌ Credentials file not found: ${credentialsPath}`);
            }
        } catch (error) {
            console.log(`❌ Error checking credentials file: ${error.message}`);
        }
    } else {
        console.log('❌ GOOGLE_APPLICATION_CREDENTIALS not set');
    }
    
    // Analyze the error and provide solutions
    console.log('\n🎯 Error Analysis:');
    console.log('Your error: {"type":"error","error":{"details":null,"type":"api_error","message":"Internal server error"}}');
    console.log('\nWith centralized configuration, this error is most likely caused by:');
    
    if (missingEnvVars.length > 0) {
        console.log(`1. ❌ Missing essential environment variables: ${missingEnvVars.join(', ')}`);
    }
    
    if (missingFiles.length > 0) {
        console.log(`2. ❌ Missing configuration files: ${missingFiles.join(', ')}`);
    }
    
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS || '')) {
        console.log('3. ❌ Google Cloud service account key file issue');
    }
    
    console.log('4. ⚠️  Configuration service not properly initialized');
    console.log('5. ⚠️  Dialogflow agent not accessible with current credentials');
    
    // Provide specific solutions for centralized approach
    console.log('\n🔧 Solutions for Centralized Configuration:');
    
    console.log('\n1. Set Essential Environment Variables:');
    if (missingEnvVars.includes('GOOGLE_APPLICATION_CREDENTIALS')) {
        console.log('   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"');
    }
    if (missingEnvVars.includes('DIALOGFLOW_AGENT_ID')) {
        console.log('   export DIALOGFLOW_AGENT_ID="your-dialogflow-agent-id"');
    }
    
    console.log('\n2. Verify Configuration Files:');
    console.log('   # Check if environment config exists:');
    console.log(`   cat config/environments/${environment}.yaml`);
    console.log('   # Check Google Cloud project config:');
    console.log('   cat config/google_cloud/project_config.yaml');
    
    console.log('\n3. Test Configuration Loading:');
    console.log('   # Test the centralized config service:');
    console.log('   node -e "');
    console.log('   import { getConfigService } from \'./core/config-service.js\';');
    console.log('   const config = getConfigService();');
    console.log('   await config.load();');
    console.log('   console.log(config.getGoogleCloudConfig());');
    console.log('   "');
    
    console.log('\n4. Initialize Services in Correct Order:');
    console.log('   # In your application startup:');
    console.log('   # 1. Load centralized configuration first');
    console.log('   # 2. Initialize Google Cloud Auth Service');
    console.log('   # 3. Initialize other services');
    
    console.log('\n🚀 Quick Fix for Your Error:');
    
    if (missingEnvVars.length === 0 && missingFiles.length === 0) {
        console.log('✅ Configuration looks good! Try:');
        console.log('1. Restart your application server');
        console.log('2. Check application logs for more detailed errors');
        console.log('3. Verify Dialogflow agent is accessible');
    } else {
        console.log('1. Fix missing environment variables and files listed above');
        console.log('2. Ensure your service account has the correct permissions');
        console.log('3. Restart your application server');
        console.log('4. Test the API endpoint again');
    }
    
    console.log('\n📞 Test Commands:');
    console.log('# Test Google Cloud authentication:');
    console.log('gcloud auth application-default print-access-token');
    console.log('\n# Test Dialogflow access:');
    console.log('gcloud dialogflow agents list --location=us-central1');
    console.log('\n# Test API endpoint:');
    console.log('curl -X POST http://localhost:3000/api/chat \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"message":"test","sessionId":"test-123"}\'');
}

// Run diagnostic
diagnoseCentralizedConfig();