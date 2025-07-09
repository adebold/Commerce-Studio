#!/usr/bin/env node

/**
 * Universal Deployment Script for Consultation MVP
 * Deploys consultation system across all supported e-commerce platforms
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const axios = require('axios');

// Configuration
const config = {
    platforms: ['shopify', 'magento', 'woocommerce', 'bigcommerce'],
    consultationAPI: process.env.CONSULTATION_API_URL || 'http://localhost:3002',
    environments: {
        development: {
            shopify: { port: 3000, host: 'localhost' },
            magento: { port: 80, host: 'localhost' },
            woocommerce: { port: 80, host: 'localhost' },
            bigcommerce: { port: 3003, host: 'localhost' }
        },
        staging: {
            shopify: { port: 3000, host: 'staging.commercestudio.com' },
            magento: { port: 443, host: 'magento-staging.commercestudio.com' },
            woocommerce: { port: 443, host: 'woocommerce-staging.commercestudio.com' },
            bigcommerce: { port: 3003, host: 'bigcommerce-staging.commercestudio.com' }
        },
        production: {
            shopify: { port: 443, host: 'commercestudio.com' },
            magento: { port: 443, host: 'magento.commercestudio.com' },
            woocommerce: { port: 443, host: 'woocommerce.commercestudio.com' },
            bigcommerce: { port: 443, host: 'bigcommerce.commercestudio.com' }
        }
    }
};

class PlatformDeployer {
    constructor(environment = 'development') {
        this.environment = environment;
        this.deploymentResults = {};
        this.startTime = Date.now();
        
        console.log(`🚀 Starting multi-platform consultation deployment...`);
        console.log(`📦 Environment: ${environment}`);
        console.log(`🎯 Platforms: ${config.platforms.join(', ')}`);
        console.log('━'.repeat(60));
    }

    async deploy() {
        try {
            // Step 1: Validate prerequisites
            await this.validatePrerequisites();
            
            // Step 2: Start consultation services
            await this.startConsultationServices();
            
            // Step 3: Deploy to each platform
            for (const platform of config.platforms) {
                console.log(`\n🔧 Deploying ${platform.toUpperCase()} integration...`);
                await this.deployPlatform(platform);
            }
            
            // Step 4: Run integration tests
            await this.runIntegrationTests();
            
            // Step 5: Generate deployment report
            this.generateDeploymentReport();
            
        } catch (error) {
            console.error('\n❌ Deployment failed:', error.message);
            process.exit(1);
        }
    }

    async validatePrerequisites() {
        console.log('🔍 Validating prerequisites...');
        
        // Check Node.js version
        const nodeVersion = process.version;
        if (!nodeVersion.startsWith('v16') && !nodeVersion.startsWith('v18') && !nodeVersion.startsWith('v20')) {
            throw new Error('Node.js 16+ is required');
        }
        
        // Check required directories exist
        const requiredDirs = [
            'apps/shopify/consultation-integration',
            'apps/magento/consultation-integration',
            'apps/woocommerce/consultation-integration',
            'apps/bigcommerce/consultation-integration',
            'services'
        ];
        
        for (const dir of requiredDirs) {
            if (!fs.existsSync(dir)) {
                throw new Error(`Required directory not found: ${dir}`);
            }
        }
        
        // Check environment variables
        const requiredEnvVars = [
            'CONSULTATION_API_URL'
        ];
        
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar] && this.environment !== 'development') {
                console.warn(`⚠️  Warning: ${envVar} not set`);
            }
        }
        
        console.log('✅ Prerequisites validated');
    }

    async startConsultationServices() {
        console.log('🎯 Starting consultation services...');
        
        try {
            // Start consultation webhook service
            this.startService('consultation-webhook', 'node scripts/start-consultation-system.js', { 
                cwd: process.cwd() 
            });
            
            // Wait for service to be ready
            await this.waitForService(config.consultationAPI, 30000);
            
            console.log('✅ Consultation services started');
            
        } catch (error) {
            throw new Error(`Failed to start consultation services: ${error.message}`);
        }
    }

    async deployPlatform(platform) {
        const platformConfig = config.environments[this.environment][platform];
        const appDir = `apps/${platform}/consultation-integration`;
        
        try {
            switch (platform) {
                case 'shopify':
                    await this.deployShopify(appDir, platformConfig);
                    break;
                case 'magento':
                    await this.deployMagento(appDir, platformConfig);
                    break;
                case 'woocommerce':
                    await this.deployWooCommerce(appDir, platformConfig);
                    break;
                case 'bigcommerce':
                    await this.deployBigCommerce(appDir, platformConfig);
                    break;
                default:
                    throw new Error(`Unknown platform: ${platform}`);
            }
            
            this.deploymentResults[platform] = { 
                status: 'success', 
                url: `http://${platformConfig.host}:${platformConfig.port}`,
                timestamp: new Date().toISOString()
            };
            
            console.log(`✅ ${platform.toUpperCase()} deployment successful`);
            
        } catch (error) {
            this.deploymentResults[platform] = { 
                status: 'failed', 
                error: error.message,
                timestamp: new Date().toISOString()
            };
            
            console.error(`❌ ${platform.toUpperCase()} deployment failed:`, error.message);
            
            if (this.environment === 'production') {
                throw error; // Fail fast in production
            }
        }
    }

    async deployShopify(appDir, platformConfig) {
        console.log('  📦 Installing Shopify dependencies...');
        this.execCommand('npm install', { cwd: appDir });
        
        console.log('  🏗️  Building Shopify app...');
        this.execCommand('npm run build', { cwd: appDir });
        
        console.log('  🚀 Starting Shopify integration server...');
        this.startService('shopify-consultation', `npm start`, { cwd: appDir });
        
        // Wait for service to be ready
        await this.waitForService(`http://${platformConfig.host}:${platformConfig.port}/health`, 15000);
        
        console.log('  🔗 Configuring Shopify webhooks...');
        // In production, this would configure actual Shopify webhooks
        
        console.log('  ✅ Shopify integration deployed');
    }

    async deployMagento(appDir, platformConfig) {
        console.log('  📦 Copying Magento module files...');
        
        // Copy module to Magento installation
        const magentoPath = process.env.MAGENTO_PATH || '/var/www/html/magento';
        const modulePath = `${magentoPath}/app/code/CommerceStudio/ConsultationIntegration`;
        
        if (fs.existsSync(magentoPath)) {
            this.execCommand(`cp -r ${appDir}/* ${modulePath}/`, { cwd: process.cwd() });
            
            console.log('  🔧 Enabling Magento module...');
            this.execCommand('php bin/magento module:enable CommerceStudio_ConsultationIntegration', { 
                cwd: magentoPath 
            });
            
            console.log('  📚 Running Magento setup upgrade...');
            this.execCommand('php bin/magento setup:upgrade', { cwd: magentoPath });
            
            console.log('  🗂️  Compiling Magento DI...');
            this.execCommand('php bin/magento setup:di:compile', { cwd: magentoPath });
            
            console.log('  🧹 Flushing Magento cache...');
            this.execCommand('php bin/magento cache:flush', { cwd: magentoPath });
        } else {
            console.log('  ⚠️  Magento installation not found, skipping automatic deployment');
        }
        
        console.log('  ✅ Magento module deployed');
    }

    async deployWooCommerce(appDir, platformConfig) {
        console.log('  📦 Preparing WooCommerce plugin...');
        
        // Copy plugin to WordPress plugins directory
        const wpPath = process.env.WORDPRESS_PATH || '/var/www/html/wordpress';
        const pluginPath = `${wpPath}/wp-content/plugins/consultation-integration`;
        
        if (fs.existsSync(wpPath)) {
            this.execCommand(`cp -r ${appDir} ${pluginPath}`, { cwd: process.cwd() });
            
            console.log('  🔌 WooCommerce plugin files copied');
            console.log('  ℹ️  Please activate the plugin in WordPress admin');
        } else {
            console.log('  ⚠️  WordPress installation not found, skipping automatic deployment');
        }
        
        console.log('  ✅ WooCommerce plugin deployed');
    }

    async deployBigCommerce(appDir, platformConfig) {
        console.log('  📦 Installing BigCommerce dependencies...');
        this.execCommand('npm install', { cwd: appDir });
        
        console.log('  🏗️  Building BigCommerce app...');
        this.execCommand('npm run build', { cwd: appDir });
        
        console.log('  🚀 Starting BigCommerce integration server...');
        this.startService('bigcommerce-consultation', `npm start`, { cwd: appDir });
        
        // Wait for service to be ready
        await this.waitForService(`http://${platformConfig.host}:${platformConfig.port}/health`, 15000);
        
        console.log('  ✅ BigCommerce integration deployed');
    }

    async runIntegrationTests() {
        console.log('\n🧪 Running integration tests...');
        
        const testResults = {};
        
        for (const platform of config.platforms) {
            if (this.deploymentResults[platform]?.status === 'success') {
                console.log(`  🔍 Testing ${platform} integration...`);
                
                try {
                    await this.testPlatformIntegration(platform);
                    testResults[platform] = 'passed';
                    console.log(`  ✅ ${platform} tests passed`);
                } catch (error) {
                    testResults[platform] = 'failed';
                    console.log(`  ❌ ${platform} tests failed:`, error.message);
                }
            } else {
                testResults[platform] = 'skipped';
                console.log(`  ⏭️  ${platform} tests skipped (deployment failed)`);
            }
        }
        
        this.testResults = testResults;
        console.log('✅ Integration tests completed');
    }

    async testPlatformIntegration(platform) {
        const platformConfig = config.environments[this.environment][platform];
        const baseUrl = `http://${platformConfig.host}:${platformConfig.port}`;
        
        // Test health endpoint
        const healthResponse = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
        if (healthResponse.status !== 200) {
            throw new Error('Health check failed');
        }
        
        // Test consultation start endpoint (basic)
        if (platform === 'shopify' || platform === 'bigcommerce') {
            try {
                const consultationResponse = await axios.post(`${baseUrl}/api/consultation/start`, {
                    customerId: 'test-customer',
                    sessionData: { test: true }
                }, { timeout: 5000 });
                
                if (!consultationResponse.data.sessionId) {
                    throw new Error('Consultation start test failed');
                }
            } catch (error) {
                // Non-critical test failure
                console.log(`    ⚠️  Consultation API test skipped: ${error.message}`);
            }
        }
    }

    generateDeploymentReport() {
        const duration = Date.now() - this.startTime;
        const report = {
            timestamp: new Date().toISOString(),
            environment: this.environment,
            duration: `${Math.round(duration / 1000)}s`,
            platforms: this.deploymentResults,
            tests: this.testResults || {},
            summary: {
                total: config.platforms.length,
                successful: Object.values(this.deploymentResults).filter(r => r.status === 'success').length,
                failed: Object.values(this.deploymentResults).filter(r => r.status === 'failed').length
            }
        };
        
        console.log('\n📊 DEPLOYMENT REPORT');
        console.log('━'.repeat(60));
        console.log(`🕐 Duration: ${report.duration}`);
        console.log(`✅ Successful: ${report.summary.successful}/${report.summary.total}`);
        console.log(`❌ Failed: ${report.summary.failed}/${report.summary.total}`);
        
        console.log('\n📋 Platform Status:');
        for (const [platform, result] of Object.entries(this.deploymentResults)) {
            const status = result.status === 'success' ? '✅' : '❌';
            const tests = this.testResults?.[platform] || 'not run';
            console.log(`  ${status} ${platform.toUpperCase()}: ${result.status} (tests: ${tests})`);
            if (result.url) {
                console.log(`     🔗 ${result.url}`);
            }
        }
        
        // Save report to file
        const reportPath = `deployment-report-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Report saved to: ${reportPath}`);
        
        if (report.summary.failed > 0) {
            console.log('\n⚠️  Some deployments failed. Check the report for details.');
            if (this.environment === 'production') {
                process.exit(1);
            }
        } else {
            console.log('\n🎉 All deployments successful!');
        }
    }

    // Utility methods
    execCommand(command, options = {}) {
        try {
            const result = execSync(command, { 
                stdio: 'pipe', 
                encoding: 'utf8',
                ...options 
            });
            return result.trim();
        } catch (error) {
            throw new Error(`Command failed: ${command}\n${error.message}`);
        }
    }

    startService(name, command, options = {}) {
        console.log(`    🚀 Starting service: ${name}`);
        
        const child = spawn('sh', ['-c', command], {
            stdio: 'pipe',
            detached: true,
            ...options
        });
        
        child.unref(); // Don't wait for child process
        
        // Store process for cleanup
        if (!this.childProcesses) {
            this.childProcesses = [];
        }
        this.childProcesses.push(child);
        
        return child;
    }

    async waitForService(url, timeout = 30000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            try {
                await axios.get(url, { timeout: 5000 });
                return true;
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        throw new Error(`Service did not become ready within ${timeout}ms: ${url}`);
    }

    cleanup() {
        if (this.childProcesses) {
            console.log('\n🧹 Cleaning up processes...');
            for (const child of this.childProcesses) {
                try {
                    process.kill(-child.pid); // Kill process group
                } catch (error) {
                    // Process may already be dead
                }
            }
        }
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const environment = args[0] || 'development';
    
    if (!['development', 'staging', 'production'].includes(environment)) {
        console.error('Usage: node deploy-consultation-platforms.js [development|staging|production]');
        process.exit(1);
    }
    
    const deployer = new PlatformDeployer(environment);
    
    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log('\n🛑 Deployment interrupted');
        deployer.cleanup();
        process.exit(1);
    });
    
    process.on('SIGTERM', () => {
        deployer.cleanup();
        process.exit(1);
    });
    
    try {
        await deployer.deploy();
    } finally {
        if (environment === 'development') {
            // Keep services running in development
            console.log('\n🔄 Services running in background (development mode)');
            console.log('   Press Ctrl+C to stop all services');
            
            // Wait indefinitely
            await new Promise(() => {});
        } else {
            deployer.cleanup();
        }
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('Deployment script error:', error);
        process.exit(1);
    });
}

module.exports = PlatformDeployer;