#!/usr/bin/env node

/**
 * API Error Diagnostic Tool
 * Helps diagnose the "Internal server error" issue in Commerce Studio
 */

import { UnifiedDialogflowService } from '../services/google/unified-dialogflow-service.js';
import { VertexAIConnector } from '../apps/shopify/connectors/vertex-ai-connector.js';

async function diagnoseAPIError() {
    console.log('🔍 Commerce Studio API Error Diagnostic Tool');
    console.log('=' .repeat(50));
    
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
        return;
    }
    
    // Test Google Cloud Authentication
    console.log('\n🔐 Testing Google Cloud Authentication:');
    try {
        const dialogflowService = new UnifiedDialogflowService();
        await dialogflowService.initialize();
        console.log('✅ Google Cloud Dialogflow: Connected');
    } catch (error) {
        console.log('❌ Google Cloud Dialogflow: Failed');
        console.log(`   Error: ${error.message}`);
        
        // Test Vertex AI fallback
        console.log('\n🔄 Testing Vertex AI Fallback:');
        try {
            const vertexService = new VertexAIConnector('test-shop');
            console.log('✅ Vertex AI Connector: Available');
        } catch (vertexError) {
            console.log('❌ Vertex AI Connector: Failed');
            console.log(`   Error: ${vertexError.message}`);
            console.log('\n🚨 Both primary and fallback services failed!');
            console.log('This explains the "Internal server error"');
        }
    }
    
    // Test API endpoint simulation
    console.log('\n🧪 Simulating API Request:');
    try {
        const testPayload = {
            message: 'Hello, I need help finding glasses',
            sessionId: 'test-session-123',
            shopDomain: 'test-shop.myshopify.com'
        };
        
        console.log('📤 Test payload:', JSON.stringify(testPayload, null, 2));
        
        // This would normally call the actual API endpoint
        // For now, we'll just validate the payload structure
        if (!testPayload.message) {
            throw new Error('Message parameter is required');
        }
        if (!testPayload.sessionId) {
            throw new Error('Session ID is required');
        }
        
        console.log('✅ Payload validation: Passed');
        
    } catch (error) {
        console.log('❌ API simulation: Failed');
        console.log(`   Error: ${error.message}`);
    }
    
    // Provide recommendations
    console.log('\n💡 Recommendations:');
    if (envIssues.length > 0) {
        console.log('1. Set missing environment variables:');
        envIssues.forEach(envVar => {
            console.log(`   export ${envVar}="your-value-here"`);
        });
    }
    
    console.log('2. Check Google Cloud credentials file exists and is readable');
    console.log('3. Verify Dialogflow CX agent is properly configured');
    console.log('4. Check network connectivity to Google Cloud services');
    console.log('5. Review application logs for more detailed error information');
    
    console.log('\n🔧 Quick Fix Commands:');
    console.log('# Check if credentials file exists:');
    console.log('ls -la $GOOGLE_APPLICATION_CREDENTIALS');
    console.log('\n# Test Google Cloud authentication:');
    console.log('gcloud auth application-default print-access-token');
    console.log('\n# Check Dialogflow agent:');
    console.log('gcloud dialogflow agents list --location=$DIALOGFLOW_LOCATION');
}

// Run diagnostic if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    diagnoseAPIError().catch(console.error);
}

export { diagnoseAPIError };