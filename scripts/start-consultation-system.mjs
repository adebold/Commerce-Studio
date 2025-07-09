#!/usr/bin/env node

/**
 * Consultation System Startup Script
 * Initializes and starts the intelligent eyewear consultation system
 * Integrates with existing Commerce Studio infrastructure
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import consultation services
import ConsultationDialogflowService from '../services/google/consultation-dialogflow-service.js';
import ConsultationWebhookService from '../services/consultation-webhook-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.secure') });

class ConsultationSystemManager {
    constructor() {
        this.services = {};
        this.isRunning = false;
        
        // Configuration
        this.config = {
            port: process.env.CONSULTATION_PORT || 3002,
            dialogflowProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            dialogflowAgentId: process.env.DIALOGFLOW_AGENT_ID || '1601a958-7e8e-4abe-a0c8-93819aa7594a',
            dialogflowLocation: process.env.DIALOGFLOW_LOCATION || 'us-central1',
            mainServerPort: process.env.PORT || 3001
        };
        
        console.log('🤖 Initializing Consultation System Manager...');
        console.log(`📋 Configuration:
  - Consultation Port: ${this.config.port}
  - Dialogflow Project: ${this.config.dialogflowProjectId}
  - Dialogflow Agent: ${this.config.dialogflowAgentId}
  - Main Server: http://localhost:${this.config.mainServerPort}`);
    }

    async initialize() {
        try {
            console.log('\n🚀 Starting Consultation System...');
            
            // Initialize Dialogflow Service
            await this.initializeDialogflowService();
            
            // Initialize Webhook Service
            await this.initializeWebhookService();
            
            // Setup graceful shutdown
            this.setupGracefulShutdown();
            
            this.isRunning = true;
            console.log('\n✅ Consultation System initialized successfully!');
            console.log(`🌐 Webhook Service: http://localhost:${this.config.port}`);
            console.log(`🤖 Dialogflow Agent: ${this.config.dialogflowAgentId}`);
            console.log('\n📝 Available endpoints:');
            console.log(`  - POST /webhook (Dialogflow CX webhook)`);
            console.log(`  - POST /consultation/start`);
            console.log(`  - POST /consultation/face-analysis`);
            console.log(`  - POST /consultation/virtual-tryon`);
            console.log(`  - POST /consultation/recommendations`);
            console.log(`  - POST /consultation/store-locator`);
            console.log(`  - POST /consultation/reservation`);
            console.log(`  - GET /health`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Consultation System:', error);
            throw error;
        }
    }

    async initializeDialogflowService() {
        console.log('🔧 Initializing Dialogflow Service...');
        
        try {
            this.services.dialogflow = new ConsultationDialogflowService({
                projectId: this.config.dialogflowProjectId,
                agentId: this.config.dialogflowAgentId,
                location: this.config.dialogflowLocation,
                languageCode: 'en'
            });
            
            await this.services.dialogflow.initialize();
            console.log('✅ Dialogflow Service initialized');
            
        } catch (error) {
            console.error('❌ Dialogflow Service initialization failed:', error);
            throw error;
        }
    }

    async initializeWebhookService() {
        console.log('🔧 Initializing Webhook Service...');
        
        try {
            this.services.webhook = new ConsultationWebhookService({
                port: this.config.port,
                apiIntegrationUrl: `http://localhost:${this.config.mainServerPort}`
            });
            
            await this.services.webhook.start();
            console.log('✅ Webhook Service initialized');
            
        } catch (error) {
            console.error('❌ Webhook Service initialization failed:', error);
            throw error;
        }
    }

    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
            
            try {
                if (this.services.webhook) {
                    await this.services.webhook.stop();
                    console.log('✅ Webhook Service stopped');
                }
                
                console.log('✅ Consultation System shutdown complete');
                process.exit(0);
                
            } catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        };
        
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGUSR2', () => shutdown('SIGUSR2')); // nodemon restart
    }

    async healthCheck() {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {}
        };
        
        try {
            // Check Dialogflow Service
            if (this.services.dialogflow) {
                const dialogflowHealth = await this.services.dialogflow.healthCheck();
                health.services.dialogflow = dialogflowHealth;
            }
            
            // Check Webhook Service
            if (this.services.webhook) {
                health.services.webhook = {
                    status: 'healthy',
                    port: this.config.port
                };
            }
            
            return health;
            
        } catch (error) {
            health.status = 'unhealthy';
            health.error = error.message;
            return health;
        }
    }

    async testConsultationFlow() {
        console.log('\n🧪 Testing consultation flow...');
        
        try {
            if (!this.services.dialogflow) {
                throw new Error('Dialogflow service not initialized');
            }
            
            // Test basic conversation
            const testMessage = "Hi, I'm looking for new glasses";
            const response = await this.services.dialogflow.processConsultationMessage(
                testMessage,
                'test-session-' + Date.now()
            );
            
            console.log('✅ Test conversation successful:');
            console.log(`  Input: "${testMessage}"`);
            console.log(`  Response: "${response.text}"`);
            console.log(`  Intent: ${response.intent}`);
            console.log(`  Confidence: ${response.confidence}`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Consultation flow test failed:', error);
            return false;
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'start';
    
    const manager = new ConsultationSystemManager();
    
    try {
        switch (command) {
            case 'start':
                await manager.initialize();
                
                // Optional: Run test if --test flag is provided
                if (args.includes('--test')) {
                    setTimeout(async () => {
                        await manager.testConsultationFlow();
                    }, 2000);
                }
                break;
                
            case 'test':
                await manager.initialize();
                const testResult = await manager.testConsultationFlow();
                process.exit(testResult ? 0 : 1);
                break;
                
            case 'health':
                await manager.initialize();
                const health = await manager.healthCheck();
                console.log(JSON.stringify(health, null, 2));
                process.exit(health.status === 'healthy' ? 0 : 1);
                break;
                
            default:
                console.log(`
🤖 Consultation System Manager

Usage: node start-consultation-system.js [command] [options]

Commands:
  start     Start the consultation system (default)
  test      Run consultation flow test
  health    Check system health

Options:
  --test    Run test after starting (with start command)

Examples:
  node start-consultation-system.js
  node start-consultation-system.js start --test
  node start-consultation-system.js test
  node start-consultation-system.js health
                `);
                process.exit(0);
        }
        
    } catch (error) {
        console.error('❌ Consultation System Manager failed:', error);
        process.exit(1);
    }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default ConsultationSystemManager;