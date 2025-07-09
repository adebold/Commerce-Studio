#!/usr/bin/env node

/**
 * Consultation Integration Test Script
 * Tests the complete consultation flow from frontend to backend
 * Validates all components are working together correctly
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.secure') });

class ConsultationIntegrationTester {
    constructor() {
        this.config = {
            consultationPort: process.env.CONSULTATION_PORT || 3002,
            mainServerPort: process.env.PORT || 3001,
            dialogflowProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            dialogflowAgentId: process.env.DIALOGFLOW_AGENT_ID || '1601a958-7e8e-4abe-a0c8-93819aa7594a'
        };
        
        this.baseUrl = `http://localhost:${this.config.consultationPort}`;
        this.testResults = [];
    }

    async runAllTests() {
        console.log('🧪 Starting Consultation Integration Tests...\n');
        
        const tests = [
            { name: 'Health Check', test: this.testHealthCheck.bind(this) },
            { name: 'Consultation Start', test: this.testConsultationStart.bind(this) },
            { name: 'Needs Assessment', test: this.testNeedsAssessment.bind(this) },
            { name: 'Face Analysis Request', test: this.testFaceAnalysisRequest.bind(this) },
            { name: 'Virtual Try-On Request', test: this.testVirtualTryOnRequest.bind(this) },
            { name: 'Recommendations Request', test: this.testRecommendationsRequest.bind(this) },
            { name: 'Store Locator Request', test: this.testStoreLocatorRequest.bind(this) },
            { name: 'Reservation Request', test: this.testReservationRequest.bind(this) },
            { name: 'Webhook Integration', test: this.testWebhookIntegration.bind(this) }
        ];
        
        for (const { name, test } of tests) {
            try {
                console.log(`🔍 Testing: ${name}...`);
                const result = await test();
                this.testResults.push({ name, status: 'PASS', result });
                console.log(`✅ ${name}: PASSED\n`);
            } catch (error) {
                this.testResults.push({ name, status: 'FAIL', error: error.message });
                console.log(`❌ ${name}: FAILED - ${error.message}\n`);
            }
        }
        
        this.printSummary();
    }

    async testHealthCheck() {
        const response = await fetch(`${this.baseUrl}/health`);
        
        if (!response.ok) {
            throw new Error(`Health check failed: ${response.status}`);
        }
        
        const health = await response.json();
        
        if (health.status !== 'healthy') {
            throw new Error(`Service unhealthy: ${health.status}`);
        }
        
        return health;
    }

    async testConsultationStart() {
        const response = await fetch(`${this.baseUrl}/consultation/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'test-session-' + Date.now()
            })
        });
        
        if (!response.ok) {
            throw new Error(`Consultation start failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.sessionId) {
            throw new Error('Invalid consultation start response');
        }
        
        return result;
    }

    async testNeedsAssessment() {
        const webhookPayload = {
            queryResult: {
                intent: { displayName: 'needs.assessment' },
                parameters: {
                    prescription: 'yes',
                    lifestyle: 'office work',
                    budget: '$100-200',
                    stylePreference: 'modern'
                }
            },
            sessionInfo: {
                session: 'projects/test/locations/us-central1/agents/test/sessions/test-session'
            }
        };
        
        const response = await fetch(`${this.baseUrl}/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload)
        });
        
        if (!response.ok) {
            throw new Error(`Needs assessment webhook failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.fulfillmentResponse || !result.fulfillmentResponse.messages) {
            throw new Error('Invalid webhook response format');
        }
        
        return result;
    }

    async testFaceAnalysisRequest() {
        const response = await fetch(`${this.baseUrl}/consultation/face-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'test-session-' + Date.now(),
                imageData: 'base64-encoded-image-data'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Face analysis failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.faceAnalysis) {
            throw new Error('Invalid face analysis response');
        }
        
        return result;
    }

    async testVirtualTryOnRequest() {
        const response = await fetch(`${this.baseUrl}/consultation/virtual-tryon`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'test-session-' + Date.now(),
                frameId: 'test-frame-001',
                imageData: 'base64-encoded-image-data'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Virtual try-on failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.vtoResult) {
            throw new Error('Invalid virtual try-on response');
        }
        
        return result;
    }

    async testRecommendationsRequest() {
        const response = await fetch(`${this.baseUrl}/consultation/recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'test-session-' + Date.now(),
                criteria: {
                    faceShape: 'oval',
                    stylePreference: 'modern',
                    budget: '$100-200',
                    lifestyle: 'office work'
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Recommendations failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.recommendations) {
            throw new Error('Invalid recommendations response');
        }
        
        return result;
    }

    async testStoreLocatorRequest() {
        const response = await fetch(`${this.baseUrl}/consultation/store-locator`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitude: 40.7128,
                longitude: -74.0060,
                frameIds: ['test-frame-001']
            })
        });
        
        if (!response.ok) {
            throw new Error(`Store locator failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.stores) {
            throw new Error('Invalid store locator response');
        }
        
        return result;
    }

    async testReservationRequest() {
        const response = await fetch(`${this.baseUrl}/consultation/reservation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                storeId: 'store-001',
                frameId: 'test-frame-001',
                customerInfo: {
                    name: 'Test Customer',
                    email: 'test@example.com',
                    phone: '555-123-4567'
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Reservation failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.reservation) {
            throw new Error('Invalid reservation response');
        }
        
        return result;
    }

    async testWebhookIntegration() {
        const webhookPayload = {
            queryResult: {
                intent: { displayName: 'consultation.start' },
                parameters: {}
            },
            sessionInfo: {
                session: 'projects/test/locations/us-central1/agents/test/sessions/test-session'
            }
        };
        
        const response = await fetch(`${this.baseUrl}/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload)
        });
        
        if (!response.ok) {
            throw new Error(`Webhook integration failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.fulfillmentResponse) {
            throw new Error('Invalid webhook response format');
        }
        
        return result;
    }

    printSummary() {
        console.log('\n📊 Test Summary');
        console.log('================');
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const total = this.testResults.length;
        
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
        
        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
        }
        
        console.log('\n📋 Configuration:');
        console.log(`  - Consultation Service: http://localhost:${this.config.consultationPort}`);
        console.log(`  - Main Server: http://localhost:${this.config.mainServerPort}`);
        console.log(`  - Dialogflow Project: ${this.config.dialogflowProjectId}`);
        console.log(`  - Dialogflow Agent: ${this.config.dialogflowAgentId}`);
        
        if (passed === total) {
            console.log('\n🎉 All tests passed! The consultation system is ready for use.');
        } else {
            console.log('\n⚠️  Some tests failed. Please check the configuration and try again.');
        }
    }

    async testFrontendIntegration() {
        console.log('\n🌐 Testing Frontend Integration...');
        
        try {
            // Test if HTML store is accessible
            const htmlResponse = await fetch(`http://localhost:${this.config.mainServerPort}`);
            
            if (htmlResponse.ok) {
                console.log('✅ HTML Store is accessible');
            } else {
                console.log('❌ HTML Store is not accessible');
            }
            
            // Test if consultation chat script is loaded
            const chatResponse = await fetch(`http://localhost:${this.config.mainServerPort}/js/consultation-chat.js`);
            
            if (chatResponse.ok) {
                console.log('✅ Consultation chat script is accessible');
            } else {
                console.log('❌ Consultation chat script is not accessible');
            }
            
        } catch (error) {
            console.log(`❌ Frontend integration test failed: ${error.message}`);
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'all';
    
    const tester = new ConsultationIntegrationTester();
    
    try {
        switch (command) {
            case 'all':
                await tester.runAllTests();
                await tester.testFrontendIntegration();
                break;
                
            case 'backend':
                await tester.runAllTests();
                break;
                
            case 'frontend':
                await tester.testFrontendIntegration();
                break;
                
            case 'health':
                console.log('🔍 Testing health check...');
                const health = await tester.testHealthCheck();
                console.log('✅ Health check passed:', health);
                break;
                
            default:
                console.log(`
🧪 Consultation Integration Tester

Usage: node test-consultation-integration.js [command]

Commands:
  all       Run all tests (default)
  backend   Run backend API tests only
  frontend  Run frontend integration tests only
  health    Run health check only

Examples:
  node test-consultation-integration.js
  node test-consultation-integration.js backend
  node test-consultation-integration.js health
                `);
                process.exit(0);
        }
        
    } catch (error) {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default ConsultationIntegrationTester;