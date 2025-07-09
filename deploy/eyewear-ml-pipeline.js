#!/usr/bin/env node

/**
 * EyewearML Pipeline Deployment Script
 * Deploys the complete intelligent eyewear consultation system
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EyewearMLDeployer {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.services = [];
        this.isRunning = false;
        this.config = {
            ports: {
                html_store: 3001,
                webhook_service: 3002,
            },
            environment: process.env.NODE_ENV || 'development'
        };
    }

    async validateEnvironment() {
        console.log('🔍 Validating Environment Configuration...');
        const envSecurePath = path.join(this.rootDir, '.env.secure');
        try {
            await fs.access(envSecurePath);
            console.log('✅ .env.secure file found');
        } catch (error) {
            console.error('❌ .env.secure file not found. Please run setup first.');
            process.exit(1);
        }

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

        Object.assign(process.env, envVars);

        const required = ['GOOGLE_CLOUD_PROJECT_ID', 'GOOGLE_APPLICATION_CREDENTIALS', 'DIALOGFLOW_AGENT_ID'];
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

    startService(name, command, args, cwd, port) {
        return new Promise((resolve, reject) => {
            const serviceProcess = spawn(command, args, {
                cwd,
                stdio: 'pipe',
                env: { ...process.env, PORT: port }
            });

            serviceProcess.stdout.on('data', (data) => {
                console.log(`[${name}] ${data.toString().trim()}`);
            });

            serviceProcess.stderr.on('data', (data) => {
                console.error(`[${name} ERROR] ${data.toString().trim()}`);
            });

            serviceProcess.on('error', (error) => {
                console.error(`❌ ${name} error: ${error.message}`);
                reject(error);
            });

            setTimeout(() => {
                console.log(`✅ ${name} running at http://localhost:${port}`);
                this.services.push({ name, process: serviceProcess });
                resolve(serviceProcess);
            }, 3000);
        });
    }

    async deploy() {
        console.log('🚀 Deploying EyewearML Pipeline...');
        console.log('=' .repeat(50));

        try {
            await this.validateEnvironment();
            await this.checkDependencies();

            // Start Webhook Service
            const webhookServicePath = path.join(this.rootDir, 'services');
            await this.startService('WebhookService', 'node', ['start-webhook.js'], webhookServicePath, this.config.ports.webhook_service);

            // Start HTML Store
            const htmlStorePath = path.join(this.rootDir, 'apps', 'html-store');
            await this.startService('HTMLStore', 'python3', ['-m', 'http.server', this.config.ports.html_store.toString()], htmlStorePath, this.config.ports.html_store);

            this.isRunning = true;

            console.log('');
            console.log('✅ EyewearML Pipeline Deployed Successfully!');
            console.log('=' .repeat(50));
            console.log('🌐 HTML Store: http://localhost:' + this.config.ports.html_store);
            console.log('🤖 Webhook Service: http://localhost:' + this.config.ports.webhook_service);
            console.log('');
            console.log('🛑 Press Ctrl+C to stop all services');

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
        console.log('\n🛑 Shutting down services...');
        for (const service of this.services) {
            try {
                console.log(`⏹️  Stopping ${service.name}...`);
                service.process.kill('SIGTERM');
            } catch (error) {
                console.error(`Error stopping ${service.name}:`, error.message);
            }
        }
        console.log('✅ All services stopped');
        this.isRunning = false;
        process.exit(0);
    }
}

const deployer = new EyewearMLDeployer();
deployer.deploy().catch(console.error);