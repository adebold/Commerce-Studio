import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenvConfig({ path: path.join(__dirname, '../../.env.demo') });

console.log('=== Testing Service Configuration ===');

// Test what would be passed to Riva service
const rivaConfig = {
    endpoint: process.env.NVIDIA_RIVA_ENDPOINT,
    apiKey: process.env.NVIDIA_RIVA_API_KEY,
    config: {} // This would be this.nvidiaConfig.nvidia_services.riva_speech
};

console.log('Riva config passed to constructor:');
console.log('  endpoint:', rivaConfig.endpoint);
console.log('  apiKey:', rivaConfig.apiKey);
console.log('  config:', rivaConfig.config);

// Test what would be passed to Merlin service
const merlinConfig = {
    endpoint: process.env.NVIDIA_MERLIN_ENDPOINT,
    apiKey: process.env.NVIDIA_MERLIN_API_KEY,
    config: {} // This would be this.nvidiaConfig.nvidia_services.merlin_conversation
};

console.log('\nMerlin config passed to constructor:');
console.log('  endpoint:', merlinConfig.endpoint);
console.log('  apiKey:', merlinConfig.apiKey);
console.log('  config:', merlinConfig.config);

// Test how the service constructor would process this
console.log('\n=== Simulating Service Constructor Logic ===');

// Simulate Riva constructor
const rivaProcessedConfig = {
    endpoint: rivaConfig.endpoint || 'https://api.riva.nvidia.com/v1',
    apiKey: rivaConfig.apiKey || 'iulzg9oedq-60se7t722e-dpxw5krfwk',
    timeout: rivaConfig.timeout || 30000,
    retryAttempts: rivaConfig.retryAttempts || 3,
    ...rivaConfig  // This spread could override the defaults!
};

console.log('Riva processed config:');
console.log('  endpoint:', rivaProcessedConfig.endpoint);
console.log('  apiKey:', rivaProcessedConfig.apiKey);

// Simulate Merlin constructor
const merlinProcessedConfig = {
    endpoint: merlinConfig.endpoint || 'https://api.merlin.nvidia.com/v1',
    apiKey: merlinConfig.apiKey || 'iulzg9oedq-60se7t722e-dpxw5krfwk',
    modelId: merlinConfig.modelId || 'merlin-eyewear-specialist-v1',
    deploymentId: merlinConfig.deploymentId || 'commerce-studio-deployment',
    timeout: merlinConfig.timeout || 30000,
    retryAttempts: merlinConfig.retryAttempts || 3,
    ...merlinConfig  // This spread could override the defaults!
};

console.log('\nMerlin processed config:');
console.log('  endpoint:', merlinProcessedConfig.endpoint);
console.log('  apiKey:', merlinProcessedConfig.apiKey);
console.log('  modelId:', merlinProcessedConfig.modelId);