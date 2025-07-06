import RivaSpeechService from '../../services/nvidia/riva-speech-service.js';
import MerlinConversationService from '../../services/nvidia/merlin-conversation-service.js';

async function testServices() {
    console.log('Testing Riva Speech Service...');
    try {
        const rivaService = new RivaSpeechService({
            endpoint: process.env.NVIDIA_RIVA_ENDPOINT,
            apiKey: process.env.NVIDIA_RIVA_API_KEY
        });
        await rivaService.initialize();
        console.log('✅ Riva Service initialized successfully');
        
        const healthCheck = await rivaService.healthCheck();
        console.log('✅ Riva Health Check:', healthCheck);
    } catch (error) {
        console.log('❌ Riva Service failed:', error.message);
        console.log('Stack:', error.stack);
    }

    console.log('\nTesting Merlin Conversation Service...');
    try {
        const merlinService = new MerlinConversationService({
            endpoint: process.env.NVIDIA_MERLIN_ENDPOINT,
            apiKey: process.env.NVIDIA_MERLIN_API_KEY
        });
        await merlinService.initialize();
        console.log('✅ Merlin Service initialized successfully');
        
        const healthCheck = await merlinService.healthCheck();
        console.log('✅ Merlin Health Check:', healthCheck);
    } catch (error) {
        console.log('❌ Merlin Service failed:', error.message);
        console.log('Stack:', error.stack);
    }
}

testServices().catch(console.error);