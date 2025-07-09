#!/usr/bin/env node

/**
 * Google Cloud Production Deployment Script
 * Builds the demo store and deploys it to a GCS bucket.
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GCPDeployer {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.buildDir = path.join(this.rootDir, 'apps', 'html-store', 'build');
        this.sourceDir = path.join(this.rootDir, 'apps', 'html-store');
        this.gcsBucket = `gs://eyewear-demo-store-${process.env.GOOGLE_CLOUD_PROJECT_ID}`;
    }

    async executeCommand(command, args, cwd) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, { cwd, stdio: 'inherit' });
            process.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Command failed with exit code ${code}`));
                }
                resolve();
            });
        });
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

    async buildStore() {
        console.log('📦 Building demo store for production...');
        await fs.mkdir(this.buildDir, { recursive: true });
        
        const filesToCopy = ['index.html', 'css', 'js', 'images'];
        for (const file of filesToCopy) {
            await this.executeCommand('cp', ['-r', path.join(this.sourceDir, file), this.buildDir]);
        }
        
        console.log('✅ Production build complete.');
    }

    async deployToGCS() {
        console.log(`🚀 Deploying to Google Cloud Storage bucket: ${this.gcsBucket}`);

        // Create bucket if it doesn't exist
        try {
            await this.executeCommand('gcloud', ['storage', 'buckets', 'describe', this.gcsBucket]);
            console.log('✅ Bucket already exists.');
        } catch (error) {
            console.log(' bucket does not exist, creating...');
            await this.executeCommand('gcloud', ['storage', 'buckets', 'create', this.gcsBucket, '--location=US']);
            console.log('✅ Bucket created.');
        }
        
        // Upload files
        await this.executeCommand('gcloud', ['storage', 'cp', '-r', `${this.buildDir}/*`, this.gcsBucket]);
        
        // Set public access
        await this.executeCommand('gcloud', ['storage', 'buckets', 'add-iam-policy-binding', this.gcsBucket, '--member=allUsers', '--role=roles/storage.objectViewer']);
        
        console.log('✅ Deployment to GCS complete.');
    }

    async deploy() {
        console.log('🚀 Starting Google Cloud Deployment...');
        console.log('=' .repeat(50));

        try {
            await this.validateEnvironment();
            this.gcsBucket = `gs://eyewear-demo-store-${process.env.GOOGLE_CLOUD_PROJECT_ID}`;

            await this.buildStore();
            await this.deployToGCS();

            console.log('');
            console.log('✅ Deployment to Google Cloud Successful!');
            console.log('=' .repeat(50));
            console.log(`🌐 Your demo store is now live at: https://storage.googleapis.com/${this.gcsBucket.replace('gs://', '')}/index.html`);
            console.log('');

        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            process.exit(1);
        }
    }
}

const deployer = new GCPDeployer();
deployer.deploy().catch(console.error);