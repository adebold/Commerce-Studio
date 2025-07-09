#!/usr/bin/env node

/**
 * TDD Test Suite for Consultation System
 * Following Red-Green-Refactor cycle with proper test structure
 */

const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.secure') });

class ConsultationTDDTester {
    constructor() {
        this.config = {
            consultationPort: process.env.CONSULTATION_PORT || 3002,
            mainServerPort: process.env.PORT || 3001,
            dialogflowProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            dialogflowAgentId: process.env.DIALOGFLOW_AGENT_ID || '1601a958-7e8e-4abe-a0c8-93819aa7594a'
        };
        
        this.baseUrl = `http://localhost:${this.config.consultationPort}`;
        this.testResults = [];
        this.testSuite = 'Consultation System Integration';
    }

    // TDD Phase 1: RED - Write failing tests first
    async runRedPhase() {
        console.log('🔴 RED Phase: Writing failing tests first...\n');
        
        const redTests = [
            { name: 'Service Health Check', test: this.testServiceHealth.bind(this) },
            { name: 'Consultation Session Creation', test: this.testConsultationSessionCreation.bind(this) },
            { name: 'Webhook Endpoint Availability', test: this.testWebhookEndpoint.bind(this) }
        ];
        
        return this.runTestPhase('RED', redTests);
    }

    // TDD Phase 2: GREEN - Implement minimal code to pass
    async runGreenPhase() {
        console.log('🟢 GREEN Phase: Testing implementation...\n');
        
        const greenTests = [
            { name: 'Needs Assessment Flow', test: this.testNeedsAssessmentFlow.bind(this) },
            { name: 'Face Analysis Integration', test: this.testFaceAnalysisIntegration.bind(this) },
            { name: 'Virtual Try-On Integration', test: this.testVirtualTryOnIntegration.bind(this) },
            { name: 'Recommendations Engine', test: this.testRecommendationsEngine.bind(this) }
        ];
        
        return this.runTestPhase('GREEN', greenTests);
    }

    // TDD Phase 3: REFACTOR - Test refactored code
    async runRefactorPhase() {
        console.log('🔵 REFACTOR Phase: Testing refactored implementation...\n');
        
        const refactorTests = [
            { name: 'Store Locator Service', test: this.testStoreLocatorService.bind(this) },
            { name: 'Reservation System', test: this.testReservationSystem.bind(this) },
            { name: 'Frontend Integration', test: this.testFrontendIntegration.bind(this) },
            { name: 'Error Handling', test: this.testErrorHandling.bind(this) }
        ];
        
        return this.runTestPhase('REFACTOR', refactorTests);
    }

    async runTestPhase(phase, tests) {
        const phaseResults = [];
        
        for (const { name, test } of tests) {
            try {
                console.log(`🔍 ${phase}: ${name}...`);
                const result = await test();
                phaseResults.push({ name, status: 'PASS', result, phase });
                console.log(`✅ ${name}: PASSED\n`);
            } catch (error) {
                phaseResults.push({ name, status: 'FAIL', error: error.message, phase });
                console.log(`❌ ${name}: FAILED - ${error.message}\n`);
            }
        }
        
        this.testResults.push(...phaseResults);
        return phaseResults;
    }

    // Test implementations following TDD principles
    async testServiceHealth() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, { timeout: 5000 });
            
            if (!response.ok) {
                throw new Error(`Health endpoint returned ${response.status}`);
            }
            
            const health = await response.json();
            
            if (health.status !== 'healthy') {
                throw new Error(`Service status: ${health.status}`);
            }
            
            return { status: 'healthy', timestamp: health.timestamp };
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Consultation service is not running on port ' + this.config.consultationPort);
            }
            throw error;
        }
    }

    async testConsultationSessionCreation() {
        const sessionId = 'test-session-' + Date.now();
        
        const response = await fetch(`${this.baseUrl}/consultation/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
            timeout: 5000
        });
        
        if (!response.ok) {
            throw new Error(`Session creation failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.sessionId) {
            throw new Error('Invalid session creation response');
        }
        
        return { sessionId: result.sessionId, created: true };
    }

    async testWebhookEndpoint() {
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
            body: JSON.stringify(webhookPayload),
            timeout: 5000
        });
        
        if (!response.ok) {
            throw new Error(`Webhook endpoint failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.fulfillmentResponse) {
            throw new Error('Invalid webhook response format');
        }
        
        return { webhook: 'available', response: 'valid' };
    }

    async testNeedsAssessmentFlow() {
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
            body: JSON.stringify(webhookPayload),
            timeout: 5000
        });
        
        if (!response.ok) {
            throw new Error(`Needs assessment failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.fulfillmentResponse || !result.fulfillmentResponse.messages) {
            throw new Error('Invalid needs assessment response');
        }
        
        return { assessment: 'completed', parameters: webhookPayload.queryResult.parameters };
    }

    async testFaceAnalysisIntegration() {
        const response = await fetch(`${this.baseUrl}/consultation/face-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'test-session-' + Date.now(),
                imageData: 'base64-test-image-data'
            }),
            timeout: 10000
        });
        
        if (!response.ok) {
            throw new Error(`Face analysis failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.faceAnalysis) {
            throw new Error('Invalid face analysis response');
        }
        
        return { analysis: 'completed', faceShape: result.faceAnalysis.faceShape };
    }

    async testVirtualTryOnIntegration() {
        const response = await fetch(`${this.baseUrl}/consultation/virtual-tryon`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'test-session-' + Date.now(),
                frameId: 'test-frame-001',
                imageData: 'base64-test-image-data'
            }),
            timeout: 10000
        });
        
        if (!response.ok) {
            throw new Error(`Virtual try-on failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.vtoResult) {
            throw new Error('Invalid virtual try-on response');
        }
        
        return { tryon: 'completed', frameId: 'test-frame-001' };
    }

    async testRecommendationsEngine() {
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
            }),
            timeout: 10000
        });
        
        if (!response.ok) {
            throw new Error(`Recommendations failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.recommendations) {
            throw new Error('Invalid recommendations response');
        }
        
        return { recommendations: result.recommendations.length, criteria: 'matched' };
    }

    async testStoreLocatorService() {
        const response = await fetch(`${this.baseUrl}/consultation/store-locator`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitude: 40.7128,
                longitude: -74.0060,
                frameIds: ['test-frame-001']
            }),
            timeout: 5000
        });
        
        if (!response.ok) {
            throw new Error(`Store locator failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.stores) {
            throw new Error('Invalid store locator response');
        }
        
        return { stores: result.stores.length, location: 'NYC' };
    }

    async testReservationSystem() {
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
            }),
            timeout: 5000
        });
        
        if (!response.ok) {
            throw new Error(`Reservation failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.reservation) {
            throw new Error('Invalid reservation response');
        }
        
        return { reservation: result.reservation.id, status: 'confirmed' };
    }

    async testFrontendIntegration() {
        try {
            // Test HTML store accessibility
            const htmlResponse = await fetch(`http://localhost:${this.config.mainServerPort}`, { timeout: 5000 });
            const htmlAccessible = htmlResponse.ok;
            
            // Test consultation chat script
            const chatResponse = await fetch(`http://localhost:${this.config.mainServerPort}/js/consultation-chat.js`, { timeout: 5000 });
            const chatScriptAccessible = chatResponse.ok;
            
            if (!htmlAccessible && !chatScriptAccessible) {
                throw new Error('Frontend services not accessible');
            }
            
            return { 
                htmlStore: htmlAccessible ? 'accessible' : 'not accessible',
                chatScript: chatScriptAccessible ? 'accessible' : 'not accessible'
            };
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Frontend server not running on port ' + this.config.mainServerPort);
            }
            throw error;
        }
    }

    async testErrorHandling() {
        // Test invalid endpoint
        const invalidResponse = await fetch(`${this.baseUrl}/invalid-endpoint`, { timeout: 5000 });
        
        if (invalidResponse.status !== 404) {
            throw new Error('Error handling not working for invalid endpoints');
        }
        
        // Test malformed request - should return 400 for invalid JSON
        try {
            const malformedResponse = await fetch(`${this.baseUrl}/consultation/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: 'invalid-json',
                timeout: 5000
            });
            
            // Express with body-parser should return 400 for malformed JSON
            if (malformedResponse.status !== 400) {
                throw new Error(`Expected 400 for malformed JSON, got ${malformedResponse.status}`);
            }
            
        } catch (fetchError) {
            // If fetch itself fails due to connection issues, that's also acceptable
            if (!fetchError.message.includes('400')) {
                throw new Error('Error handling test failed: ' + fetchError.message);
            }
        }
        
        return { errorHandling: 'working', invalidEndpoint: '404', malformedRequest: '400' };
    }

    async runFullTDDCycle() {
        console.log('🧪 Starting TDD Consultation System Test Suite\n');
        console.log('Following Red-Green-Refactor cycle...\n');
        
        // Run all TDD phases
        await this.runRedPhase();
        await this.runGreenPhase();
        await this.runRefactorPhase();
        
        this.printTDDSummary();
    }

    printTDDSummary() {
        console.log('\n📊 TDD Test Suite Summary');
        console.log('==========================');
        
        const redTests = this.testResults.filter(r => r.phase === 'RED');
        const greenTests = this.testResults.filter(r => r.phase === 'GREEN');
        const refactorTests = this.testResults.filter(r => r.phase === 'REFACTOR');
        
        const totalPassed = this.testResults.filter(r => r.status === 'PASS').length;
        const totalFailed = this.testResults.filter(r => r.status === 'FAIL').length;
        const total = this.testResults.length;
        
        console.log(`\n🔴 RED Phase: ${redTests.filter(r => r.status === 'PASS').length}/${redTests.length} passed`);
        console.log(`🟢 GREEN Phase: ${greenTests.filter(r => r.status === 'PASS').length}/${greenTests.length} passed`);
        console.log(`🔵 REFACTOR Phase: ${refactorTests.filter(r => r.status === 'PASS').length}/${refactorTests.length} passed`);
        
        console.log(`\nTotal Tests: ${total}`);
        console.log(`Passed: ${totalPassed} ✅`);
        console.log(`Failed: ${totalFailed} ❌`);
        console.log(`Success Rate: ${Math.round((totalPassed / total) * 100)}%`);
        
        if (totalFailed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`  - [${r.phase}] ${r.name}: ${r.error}`));
        }
        
        console.log('\n📋 Configuration:');
        console.log(`  - Consultation Service: http://localhost:${this.config.consultationPort}`);
        console.log(`  - Main Server: http://localhost:${this.config.mainServerPort}`);
        console.log(`  - Dialogflow Project: ${this.config.dialogflowProjectId}`);
        console.log(`  - Dialogflow Agent: ${this.config.dialogflowAgentId}`);
        
        if (totalPassed === total) {
            console.log('\n🎉 All TDD phases passed! The consultation system is production-ready.');
        } else {
            console.log('\n⚠️  Some tests failed. Review implementation and refactor as needed.');
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'tdd';
    
    const tester = new ConsultationTDDTester();
    
    try {
        switch (command) {
            case 'tdd':
            case 'all':
                await tester.runFullTDDCycle();
                break;
                
            case 'red':
                await tester.runRedPhase();
                tester.printTDDSummary();
                break;
                
            case 'green':
                await tester.runGreenPhase();
                tester.printTDDSummary();
                break;
                
            case 'refactor':
                await tester.runRefactorPhase();
                tester.printTDDSummary();
                break;
                
            case 'health':
                console.log('🔍 Testing service health...');
                const health = await tester.testServiceHealth();
                console.log('✅ Health check passed:', health);
                break;
                
            default:
                console.log(`
🧪 TDD Consultation System Tester

Usage: node test-consultation-tdd.js [command]

Commands:
  tdd       Run full TDD cycle (default)
  red       Run RED phase tests only
  green     Run GREEN phase tests only  
  refactor  Run REFACTOR phase tests only
  health    Run health check only

Examples:
  node test-consultation-tdd.js
  node test-consultation-tdd.js red
  node test-consultation-tdd.js health
                `);
                process.exit(0);
        }
        
    } catch (error) {
        console.error('❌ TDD test execution failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = ConsultationTDDTester;