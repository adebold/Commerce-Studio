#!/usr/bin/env node

/**
 * Real Demo Environment Setup Script
 * Creates a new client account, API key, and test store for a realistic demo.
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RealDemoSetup {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.apiUrl = 'https://eyewear-ml-api-prod.us-central1.run.app/api/v1';
    }

    async executeCommand(command, args, cwd) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, { cwd, stdio: 'pipe' });
            let stdout = '';
            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            process.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Command failed with exit code ${code}`));
                }
                resolve(stdout.trim());
            });
        });
    }

    async createClientAccount() {
        console.log('Creating new client account...');
        const response = await fetch(`${this.apiUrl}/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Demo Client' }),
        });
        if (!response.ok) {
            throw new Error('Failed to create client account');
        }
        return response.json();
    }

    async createApiKey(clientId) {
        console.log('Generating API key...');
        const response = await fetch(`${this.apiUrl}/clients/${clientId}/api-keys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            throw new Error('Failed to create API key');
        }
        return response.json();
    }

    async createTestStore(clientId) {
        console.log('Creating test store...');
        const response = await fetch(`${this.apiUrl}/stores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientId,
                name: 'EyewearML Demo Store',
                platform: 'demo',
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to create test store');
        }
        return response.json();
    }

    async updateEnvFile(apiKey, clientId) {
        console.log('Updating .env.secure file...');
        const envPath = path.join(this.rootDir, '.env.secure');
        let envContent = await fs.readFile(envPath, 'utf8');
        envContent += `\nEYEWEAR_ML_API_KEY=${apiKey}`;
        envContent += `\nEYEWEAR_ML_CLIENT_ID=${clientId}`;
        await fs.writeFile(envPath, envContent);
        console.log('✅ .env.secure file updated.');
    }

    async setup() {
        console.log('🚀 Setting up real demo environment...');
        try {
            const client = await this.createClientAccount();
            const apiKey = await this.createApiKey(client.id);
            const store = await this.createTestStore(client.id);
            await this.updateEnvFile(apiKey.key, client.id);

            console.log('\n✅ Real demo environment setup complete!');
            console.log('Client ID:', client.id);
            console.log('API Key:', apiKey.key);
            console.log('Store ID:', store.id);

        } catch (error) {
            console.error('❌ Failed to set up real demo environment:', error.message);
            process.exit(1);
        }
    }
}

const demoSetup = new RealDemoSetup();
demoSetup.setup().catch(console.error);