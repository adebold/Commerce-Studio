import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current directory:', __dirname);
console.log('Looking for .env.demo at:', path.join(__dirname, '../../.env.demo'));

// Load environment with fallback
try {
    const result = dotenvConfig({ path: path.join(__dirname, '../../.env.demo') });
    console.log('dotenv result:', result);
    console.log('Environment variables loaded successfully');
} catch (error) {
    console.error('Error loading .env.demo file:', error.message);
}

// Check specific environment variables
console.log('\n=== Environment Variables ===');
console.log('NVIDIA_API_KEY:', process.env.NVIDIA_API_KEY || 'NOT SET');
console.log('NVIDIA_OMNIVERSE_API_KEY:', process.env.NVIDIA_OMNIVERSE_API_KEY || 'NOT SET');
console.log('NVIDIA_RIVA_API_KEY:', process.env.NVIDIA_RIVA_API_KEY || 'NOT SET');
console.log('NVIDIA_MERLIN_API_KEY:', process.env.NVIDIA_MERLIN_API_KEY || 'NOT SET');

console.log('\n=== Endpoint Variables ===');
console.log('NVIDIA_OMNIVERSE_ENDPOINT:', process.env.NVIDIA_OMNIVERSE_ENDPOINT || 'NOT SET');
console.log('NVIDIA_RIVA_ENDPOINT:', process.env.NVIDIA_RIVA_ENDPOINT || 'NOT SET');
console.log('NVIDIA_MERLIN_ENDPOINT:', process.env.NVIDIA_MERLIN_ENDPOINT || 'NOT SET');