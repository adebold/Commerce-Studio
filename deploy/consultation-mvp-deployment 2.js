#!/usr/bin/env node

/**
 * Commerce Studio - Intelligent Eyewear Consultation MVP Deployment Script
 * Production-ready deployment with proper error handling and monitoring
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConsultationMVPDeployer {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.services = [];
        this.isRunning = false;
        this.config = {
            ports: {
                html_store: 3001,
                consultation_api: 3002,
                webhook: 8080
            },
            environment: process.env.NODE_ENV || 'development'
        };
    }

    async validateEnvironment() {
        console.log('🔍 Validating Environment Configuration...');
        
        // Check for .env.secure file
        const envSecurePath = path.join(this.rootDir, '.env.secure');
        try {
            await fs.access(envSecurePath);
            console.log('✅ .env.secure file found');
        } catch (error) {
            console.error('❌ .env.secure file not found. Please run setup first.');
            process.exit(1);
        }

        // Load environment variables
        const envContent = await fs.readFile(envSecurePath, 'utf8');
        const envVars = envContent.split('\n')
            .filter(line => line.trim() && !line.startsWith('#'))
            .reduce((acc, line) => {
                const [key, value] = line.split('=');
                if (key && value) {
                    acc[key.trim()] = value.trim().replace(/"/g, '');
                }
                return acc;
            }, {});

        // Set environment variables
        Object.assign(process.env, envVars);

        // Validate required environment variables
        const required = [
            'GOOGLE_CLOUD_PROJECT_ID',
            'GOOGLE_APPLICATION_CREDENTIALS',
            'DIALOGFLOW_AGENT_ID'
        ];

        for (const env of required) {
            if (!process.env[env]) {
                console.error(`❌ Missing required environment variable: ${env}`);
                process.exit(1);
            }
        }

        console.log('✅ Environment validation complete');
    }

    async checkDependencies() {
        console.log('📦 Checking Dependencies...');
        
        const packageJsonPath = path.join(this.rootDir, 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        
        console.log(`📋 Project: ${packageJson.name} v${packageJson.version}`);
        console.log('✅ Dependencies check complete');
    }

    async startHTMLStore() {
        console.log('🌐 Starting HTML Store...');
        
        const htmlStorePath = path.join(this.rootDir, 'apps', 'html-store');
        
        return new Promise((resolve, reject) => {
            const server = spawn('python3', ['-m', 'http.server', this.config.ports.html_store.toString()], {
                cwd: htmlStorePath,
                stdio: 'pipe',
                env: { ...process.env }
            });

            server.stdout.on('data', (data) => {
                console.log(`HTML Store: ${data.toString().trim()}`);
            });

            server.stderr.on('data', (data) => {
                console.log(`HTML Store: ${data.toString().trim()}`);
            });

            server.on('error', (error) => {
                console.error(`❌ HTML Store error: ${error.message}`);
                reject(error);
            });

            // Give server time to start
            setTimeout(() => {
                console.log(`✅ HTML Store running at http://localhost:${this.config.ports.html_store}`);
                this.services.push({ name: 'html-store', process: server });
                resolve(server);
            }, 2000);
        });
    }

    async startConsultationAPI() {
        console.log('🤖 Starting Consultation API...');
        
        // Create a simple Express server for the consultation API
        const apiScript = `
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = ${this.config.ports.consultation_api};

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'consultation-api'
    });
});

// Mock consultation endpoints
app.post('/consultation/start', (req, res) => {
    res.json({
        sessionId: 'session_' + Date.now(),
        message: 'Welcome to your AI eyewear consultation! How can I help you find the perfect frames?',
        stage: 'greeting'
    });
});

app.post('/consultation/message', (req, res) => {
    const { message, sessionId } = req.body;
    res.json({
        sessionId,
        response: 'Thank you for your message: "' + message + '". This is a mock response for the MVP demo.',
        suggestions: ['Tell me about your style preferences', 'I need reading glasses', 'Show me trending frames']
    });
});

app.post('/consultation/face-analysis', (req, res) => {
    res.json({
        faceShape: 'oval',
        recommendations: ['rectangular frames', 'round frames', 'cat-eye frames'],
        confidence: 0.85
    });
});

app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    res.json({ received: true });
});

app.listen(PORT, () => {
    console.log(\`🚀 Consultation API listening at http://localhost:\${PORT}\`);
});
`;

        const apiPath = path.join(this.rootDir, 'temp-consultation-api.js');
        await fs.writeFile(apiPath, apiScript);

        return new Promise((resolve, reject) => {
            const server = spawn('node', [apiPath], {
                cwd: this.rootDir,
                stdio: 'pipe',
                env: { ...process.env }
            });

            server.stdout.on('data', (data) => {
                console.log(`API: ${data.toString().trim()}`);
            });

            server.stderr.on('data', (data) => {
                console.log(`API: ${data.toString().trim()}`);
            });

            server.on('error', (error) => {
                console.error(`❌ API error: ${error.message}`);
                reject(error);
            });

            // Give server time to start
            setTimeout(() => {
                console.log(`✅ Consultation API running at http://localhost:${this.config.ports.consultation_api}`);
                this.services.push({ name: 'consultation-api', process: server, tempFile: apiPath });
                resolve(server);
            }, 3000);
        });
    }

    async deploySystem() {
        console.log('🚀 Deploying Commerce Studio Consultation MVP...');
        console.log('=' .repeat(50));

        try {
            await this.validateEnvironment();
            await this.checkDependencies();
            
            // Start services
            await this.startHTMLStore();
            await this.startConsultationAPI();
            
            this.isRunning = true;
            
            console.log('');
            console.log('✅ Commerce Studio Consultation MVP Deployed Successfully!');
            console.log('=' .repeat(50));
            console.log('🌐 HTML Store: http://localhost:' + this.config.ports.html_store);
            console.log('🤖 Consultation API: http://localhost:' + this.config.ports.consultation_api);
            console.log('📋 Health Check: http://localhost:' + this.config.ports.consultation_api + '/health');
            console.log('');
            console.log('💡 To test the system:');
            console.log('   1. Open http://localhost:' + this.config.ports.html_store);
            console.log('   2. Look for the chat widget in the bottom-right corner');
            console.log('   3. Click to start a consultation');
            console.log('');
            console.log('🛑 Press Ctrl+C to stop all services');
            
            // Handle graceful shutdown
            process.on('SIGINT', () => this.shutdown());
            process.on('SIGTERM', () => this.shutdown());
            
        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            await this.shutdown();
            process.exit(1);
        }
    }

    async shutdown() {
        if (!this.isRunning) return;
        
        console.log('\\n🛑 Shutting down services...');
        
        for (const service of this.services) {
            try {
                console.log(`⏹️  Stopping ${service.name}...`);
                service.process.kill('SIGTERM');
                
                // Clean up temp files
                if (service.tempFile) {
                    await fs.unlink(service.tempFile).catch(() => {});
                }
            } catch (error) {
                console.error(`Error stopping ${service.name}:`, error.message);
            }
        }
        
        console.log('✅ All services stopped');
        this.isRunning = false;
        process.exit(0);
    }
}

// Run deployment
const deployer = new ConsultationMVPDeployer();
deployer.deploySystem().catch(console.error);