/**
 * Store Locator Integration Test Script
 * Tests the complete store locator, inventory checking, and BOPIS reservation system
 */

import StoreLocatorService from '../services/store-locator-service.js';
import ConsultationWebhookService from '../services/consultation-webhook-service.js';
import fetch from 'node-fetch';

// Mock fetch for Node.js environment
global.fetch = fetch;

class StoreLocatorIntegrationTest {
    constructor() {
        this.storeLocator = new StoreLocatorService();
        this.webhookService = new ConsultationWebhookService({ port: 3003 });
        this.testResults = [];
        
        // Mock coordinates (New York City area)
        this.testCoordinates = {
            lat: 40.7589,
            lng: -73.9851
        };
    }

    async runAllTests() {
        console.log('🧪 Starting Store Locator Integration Tests...\n');

        try {
            await this.testStoreLocatorService();
            await this.testInventoryChecking();
            await this.testBOPISReservation();
            await this.testWebhookIntegration();
            
            this.printTestResults();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        }
    }

    async testStoreLocatorService() {
        console.log('📍 Testing Store Locator Service...');

        // Test 1: Find nearby stores
        try {
            const result = await this.storeLocator.findNearbyStores(
                this.testCoordinates.lat, 
                this.testCoordinates.lng
            );
            
            this.assert(result.success, 'Store locator should return success');
            this.assert(result.stores.length > 0, 'Should find at least one store');
            this.assert(result.stores[0].distance !== undefined, 'Stores should have distance calculated');
            
            console.log(`✅ Found ${result.stores.length} stores`);
            console.log(`   Closest store: ${result.stores[0].name} (${result.stores[0].distance} miles)`);
            
        } catch (error) {
            this.fail('Find nearby stores failed', error);
        }

        // Test 2: Search stores by name
        try {
            const searchResult = this.storeLocator.searchStores('downtown');
            this.assert(searchResult.success, 'Store search should return success');
            this.assert(searchResult.stores.length > 0, 'Should find stores matching search');
            
            console.log(`✅ Store search found ${searchResult.stores.length} matching stores`);
            
        } catch (error) {
            this.fail('Store search failed', error);
        }

        // Test 3: Get individual store
        try {
            const storeResult = this.storeLocator.getStore('store-001');
            this.assert(storeResult.success, 'Get store should return success');
            this.assert(storeResult.store.id === 'store-001', 'Should return correct store');
            
            console.log(`✅ Retrieved store: ${storeResult.store.name}`);
            
        } catch (error) {
            this.fail('Get store failed', error);
        }
    }

    async testInventoryChecking() {
        console.log('\n📦 Testing Inventory Checking...');

        // Test 1: Check single store inventory
        try {
            const inventoryResult = await this.storeLocator.checkInventory('store-001', 'rec-001');
            this.assert(inventoryResult.success, 'Inventory check should return success');
            this.assert(inventoryResult.storeId === 'store-001', 'Should return correct store ID');
            this.assert(inventoryResult.frameId === 'rec-001', 'Should return correct frame ID');
            
            console.log(`✅ Inventory check: ${inventoryResult.inStock ? 'In Stock' : 'Out of Stock'}`);
            if (inventoryResult.inStock) {
                console.log(`   Quantity: ${inventoryResult.quantity}`);
                console.log(`   Sizes: ${inventoryResult.sizes?.join(', ') || 'N/A'}`);
                console.log(`   Colors: ${inventoryResult.colors?.join(', ') || 'N/A'}`);
            }
            
        } catch (error) {
            this.fail('Single inventory check failed', error);
        }

        // Test 2: Check bulk inventory
        try {
            const storeIds = ['store-001', 'store-002', 'store-003'];
            const frameIds = ['rec-001', 'rec-002'];
            
            const bulkResult = await this.storeLocator.checkInventoryForRecommendations(storeIds, frameIds);
            this.assert(bulkResult.success, 'Bulk inventory check should return success');
            this.assert(bulkResult.inventoryResults.length === storeIds.length, 'Should return results for all stores');
            
            console.log(`✅ Bulk inventory check completed for ${storeIds.length} stores, ${frameIds.length} frames`);
            
            bulkResult.inventoryResults.forEach(store => {
                const inStockFrames = store.frames.filter(frame => frame.inStock).length;
                console.log(`   ${store.storeName}: ${inStockFrames}/${store.frames.length} frames in stock`);
            });
            
        } catch (error) {
            this.fail('Bulk inventory check failed', error);
        }
    }

    async testBOPISReservation() {
        console.log('\n🔖 Testing BOPIS Reservation System...');

        // Test 1: Create reservation
        try {
            const reservationData = {
                storeId: 'store-001',
                frameId: 'rec-001',
                customerInfo: {
                    name: 'Test Customer',
                    email: 'test@example.com',
                    phone: '555-0123'
                },
                size: 'Medium',
                color: 'Black',
                sessionId: 'test-session-123'
            };

            const reservationResult = await this.storeLocator.createReservation(reservationData);
            this.assert(reservationResult.success, 'Reservation creation should return success');
            this.assert(reservationResult.reservation.id, 'Should return reservation ID');
            this.assert(reservationResult.reservation.confirmationCode, 'Should return confirmation code');
            
            console.log(`✅ Reservation created: ${reservationResult.reservation.id}`);
            console.log(`   Confirmation Code: ${reservationResult.reservation.confirmationCode}`);
            console.log(`   Expires: ${new Date(reservationResult.reservation.expiresAt).toLocaleString()}`);

            // Test 2: Retrieve reservation
            const retrievedReservation = await this.storeLocator.getReservation(reservationResult.reservation.id);
            this.assert(retrievedReservation.success, 'Reservation retrieval should return success');
            this.assert(retrievedReservation.reservation.status === 'active', 'Reservation should be active');
            
            console.log(`✅ Retrieved reservation status: ${retrievedReservation.reservation.status}`);
            
        } catch (error) {
            this.fail('BOPIS reservation failed', error);
        }

        // Test 3: Cleanup expired reservations
        try {
            const expiredCount = this.storeLocator.cleanupExpiredReservations();
            console.log(`✅ Cleanup completed: ${expiredCount} expired reservations processed`);
            
        } catch (error) {
            this.fail('Reservation cleanup failed', error);
        }
    }

    async testWebhookIntegration() {
        console.log('\n🔗 Testing Webhook Integration...');

        // Start webhook service for testing
        await new Promise((resolve) => {
            this.webhookService.start();
            setTimeout(resolve, 1000); // Give it time to start
        });

        try {
            // Test 1: Store locator webhook endpoint
            const storeLocatorResponse = await fetch('http://localhost:3003/consultation/store-locator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: 'test-session-webhook',
                    latitude: this.testCoordinates.lat,
                    longitude: this.testCoordinates.lng
                })
            });

            const storeLocatorResult = await storeLocatorResponse.json();
            this.assert(storeLocatorResult.success, 'Webhook store locator should return success');
            this.assert(storeLocatorResult.stores.length > 0, 'Webhook should return stores');
            
            console.log(`✅ Webhook store locator: Found ${storeLocatorResult.stores.length} stores`);

            // Test 2: API endpoint - nearby stores
            const nearbyResponse = await fetch(`http://localhost:3003/api/stores/nearby?lat=${this.testCoordinates.lat}&lng=${this.testCoordinates.lng}`);
            const nearbyResult = await nearbyResponse.json();
            
            this.assert(nearbyResult.success, 'API nearby stores should return success');
            console.log(`✅ API nearby stores: ${nearbyResult.stores.length} stores found`);

            // Test 3: API endpoint - inventory check
            const inventoryResponse = await fetch('http://localhost:3003/api/stores/store-001/inventory/rec-001');
            const inventoryResult = await inventoryResponse.json();
            
            this.assert(inventoryResult.success, 'API inventory check should return success');
            console.log(`✅ API inventory check: ${inventoryResult.inStock ? 'Available' : 'Not available'}`);

            // Test 4: API endpoint - create reservation
            const reservationResponse = await fetch('http://localhost:3003/api/stores/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId: 'store-001',
                    frameId: 'rec-001',
                    customerInfo: {
                        name: 'API Test Customer',
                        email: 'apitest@example.com',
                        phone: '555-0124'
                    },
                    sessionId: 'api-test-session'
                })
            });

            const reservationResult = await reservationResponse.json();
            this.assert(reservationResult.success, 'API reservation should return success');
            console.log(`✅ API reservation: ${reservationResult.reservation.confirmationCode}`);

        } catch (error) {
            this.fail('Webhook integration test failed', error);
        } finally {
            // Stop webhook service
            this.webhookService.stop();
        }
    }

    assert(condition, message) {
        if (condition) {
            this.testResults.push({ status: 'PASS', message });
        } else {
            this.testResults.push({ status: 'FAIL', message });
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    fail(message, error) {
        this.testResults.push({ status: 'FAIL', message: `${message}: ${error.message}` });
        throw error;
    }

    printTestResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('='.repeat(50));
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        
        console.log(`Total Tests: ${this.testResults.length}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        
        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(test => console.log(`   - ${test.message}`));
        }
        
        console.log(failed === 0 ? '\n🎉 All tests passed!' : '\n⚠️  Some tests failed!');
    }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new StoreLocatorIntegrationTest();
    tester.runAllTests().catch(console.error);
}

export default StoreLocatorIntegrationTest;