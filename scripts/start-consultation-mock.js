#!/usr/bin/env node

/**
 * Mock Consultation System for TDD Testing
 * Provides a simple mock server to demonstrate TDD testing principles
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.secure') });

class MockConsultationSystem {
    constructor() {
        this.app = express();
        this.port = process.env.CONSULTATION_PORT || 3002;
        this.server = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        
        console.log('🤖 Mock Consultation System initialized');
        console.log(`📋 Configuration: Port ${this.port}`);
    }
    
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }
    
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'mock-consultation-system'
            });
        });
        
        // Consultation start endpoint
        this.app.post('/consultation/start', (req, res) => {
            const { sessionId } = req.body;
            res.json({
                success: true,
                sessionId: sessionId || 'mock-session-' + Date.now(),
                message: 'Consultation session started'
            });
        });
        
        // Webhook endpoint for Dialogflow
        this.app.post('/webhook', (req, res) => {
            const { queryResult } = req.body;
            const intent = queryResult?.intent?.displayName || 'unknown';
            
            res.json({
                fulfillmentResponse: {
                    messages: [{
                        text: {
                            text: [`Mock response for intent: ${intent}`]
                        }
                    }]
                }
            });
        });
        
        // Face analysis endpoint
        this.app.post('/consultation/face-analysis', (req, res) => {
            const { sessionId, imageData } = req.body;
            res.json({
                success: true,
                sessionId,
                faceAnalysis: {
                    faceShape: 'oval',
                    confidence: 0.85,
                    features: {
                        eyeDistance: 'medium',
                        noseWidth: 'narrow',
                        jawline: 'soft'
                    }
                }
            });
        });
        
        // Virtual try-on endpoint
        this.app.post('/consultation/virtual-tryon', (req, res) => {
            const { sessionId, frameId, imageData } = req.body;
            res.json({
                success: true,
                sessionId,
                frameId,
                vtoResult: {
                    imageUrl: 'mock-tryon-result.jpg',
                    fit: 'excellent',
                    confidence: 0.92
                }
            });
        });
        
        // Recommendations endpoint
        this.app.post('/consultation/recommendations', (req, res) => {
            const { sessionId, criteria } = req.body;
            res.json({
                success: true,
                sessionId,
                recommendations: [
                    {
                        id: 'frame-001',
                        name: 'Modern Classic',
                        price: '$150',
                        match: 0.95,
                        reasons: ['Perfect for oval face', 'Matches style preference']
                    },
                    {
                        id: 'frame-002',
                        name: 'Professional Elite',
                        price: '$180',
                        match: 0.88,
                        reasons: ['Great for office work', 'Within budget range']
                    }
                ]
            });
        });
        
        // Store locator endpoint
        this.app.post('/consultation/store-locator', (req, res) => {
            const { latitude, longitude, frameIds } = req.body;
            res.json({
                success: true,
                stores: [
                    {
                        id: 'store-001',
                        name: 'Downtown Vision Center',
                        address: '123 Main St, New York, NY',
                        distance: '0.5 miles',
                        hasFrames: true
                    },
                    {
                        id: 'store-002',
                        name: 'Uptown Eyewear',
                        address: '456 Broadway, New York, NY',
                        distance: '1.2 miles',
                        hasFrames: true
                    }
                ]
            });
        });
        
        // Reservation endpoint
        this.app.post('/consultation/reservation', (req, res) => {
            const { storeId, frameId, customerInfo } = req.body;
            res.json({
                success: true,
                reservation: {
                    id: 'reservation-' + Date.now(),
                    storeId,
                    frameId,
                    customerInfo,
                    appointmentTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    status: 'confirmed'
                }
            });
        });
        
        // Error handling
        this.app.use((err, req, res, next) => {
            console.error('Error:', err);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        });
        
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint not found'
            });
        });
    }
    
    async start() {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(this.port, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`🚀 Mock Consultation System running on port ${this.port}`);
                    console.log(`🌐 Health check: http://localhost:${this.port}/health`);
                    resolve();
                }
            });
        });
    }
    
    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('🛑 Mock Consultation System stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'start';
    
    const mockSystem = new MockConsultationSystem();
    
    try {
        switch (command) {
            case 'start':
                await mockSystem.start();
                
                // Setup graceful shutdown
                process.on('SIGTERM', async () => {
                    console.log('\n🛑 Received SIGTERM, shutting down...');
                    await mockSystem.stop();
                    process.exit(0);
                });
                
                process.on('SIGINT', async () => {
                    console.log('\n🛑 Received SIGINT, shutting down...');
                    await mockSystem.stop();
                    process.exit(0);
                });
                
                break;
                
            default:
                console.log(`
🤖 Mock Consultation System

Usage: node start-consultation-mock.js [command]

Commands:
  start     Start the mock consultation system (default)

Examples:
  node start-consultation-mock.js
  node start-consultation-mock.js start
                `);
                process.exit(0);
        }
        
    } catch (error) {
        console.error('❌ Mock Consultation System failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = MockConsultationSystem;