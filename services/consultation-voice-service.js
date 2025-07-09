/**
 * Consultation Voice Integration Service
 * Extends Google Speech Service for consultation-specific voice interactions
 * Handles speech-to-text, voice commands, and accessibility features
 */

import GoogleSpeechService from './google/google-speech-service.js';
import ConsultationAnalyticsExtension from '../analytics/consultation-analytics-extension.js';

export default class ConsultationVoiceService extends GoogleSpeechService {
    constructor(config = {}) {
        super(config);
        
        this.consultationConfig = {
            voiceCommands: {
                'start consultation': 'consultation.start',
                'analyze my face': 'face.analysis_request',
                'show recommendations': 'recommendation.request',
                'find stores': 'store.locator_request',
                'try on frame': 'virtual.tryon_request',
                'help': 'help.general',
                'repeat': 'system.repeat',
                'stop listening': 'system.stop_voice'
            },
            supportedLanguages: config.supportedLanguages || ['en-US', 'es-ES', 'fr-FR', 'de-DE'],
            voiceResponseEnabled: config.voiceResponseEnabled !== false,
            commandTimeout: config.commandTimeout || 5000,
            continuousListening: config.continuousListening || false,
            ...config
        };
        
        this.isListening = false;
        this.currentSession = null;
        this.voiceState = 'idle'; // 'idle', 'listening', 'processing', 'speaking'
        this.recognitionStream = null;
        this.lastTranscript = '';
        this.commandHistory = [];
        
        // Initialize analytics extension
        this.analytics = new ConsultationAnalyticsExtension();
        
        // Setup voice command processing
        this.setupVoiceCommands();
    }

    async initialize() {
        try {
            // Initialize parent Google Speech Service
            await super.initialize();
            
            // Initialize consultation-specific voice features
            await this.initializeVoiceCommands();
            
            console.log('Consultation Voice Service initialized successfully');
            return true;
        } catch (error) {
            console.error('Consultation Voice Service initialization failed:', error);
            throw error;
        }
    }

    setupVoiceCommands() {
        // Setup voice command patterns
        this.commandPatterns = Object.keys(this.consultationConfig.voiceCommands).map(command => ({
            pattern: new RegExp(command.replace(/\s+/g, '\\s+'), 'i'),
            intent: this.consultationConfig.voiceCommands[command],
            command: command
        }));
    }

    async initializeVoiceCommands() {
        // Pre-load voice models for better performance
        if (this.consultationConfig.supportedLanguages) {
            for (const language of this.consultationConfig.supportedLanguages) {
                try {
                    // This would pre-warm the speech recognition for each language
                    console.log(`Pre-warming voice recognition for ${language}`);
                } catch (error) {
                    console.warn(`Failed to pre-warm voice recognition for ${language}:`, error);
                }
            }
        }
    }

    // Voice interaction methods
    async startVoiceInput(sessionId, options = {}) {
        if (this.isListening) {
            console.warn('Voice input already active');
            return { success: false, reason: 'Already listening' };
        }

        this.currentSession = sessionId;
        this.isListening = true;
        this.voiceState = 'listening';

        const startTime = Date.now();

        try {
            const voiceConfig = {
                languageCode: options.language || 'en-US',
                enableAutomaticPunctuation: true,
                enableWordTimeOffsets: true,
                enableWordConfidence: true,
                maxAlternatives: 3,
                profanityFilter: true,
                speechContexts: [{
                    phrases: Object.keys(this.consultationConfig.voiceCommands),
                    boost: 20
                }],
                ...options
            };

            // Start continuous recognition if enabled
            if (this.consultationConfig.continuousListening) {
                await this.startContinuousRecognition(voiceConfig);
            }

            // Track voice interaction start
            this.analytics.trackVoiceInteraction(sessionId, {
                type: 'voice_input_start',
                language: voiceConfig.languageCode,
                continuous: this.consultationConfig.continuousListening
            });

            this.emit('voiceInputStarted', { sessionId, config: voiceConfig });

            return { 
                success: true, 
                listening: true,
                language: voiceConfig.languageCode,
                continuous: this.consultationConfig.continuousListening
            };

        } catch (error) {
            this.isListening = false;
            this.voiceState = 'idle';
            console.error('Failed to start voice input:', error);
            
            this.analytics.trackVoiceInteraction(sessionId, {
                type: 'voice_input_error',
                error: error.message,
                duration: Date.now() - startTime,
                success: false
            });

            throw error;
        }
    }

    async stopVoiceInput() {
        if (!this.isListening) {
            return { success: false, reason: 'Not currently listening' };
        }

        this.isListening = false;
        this.voiceState = 'idle';

        if (this.recognitionStream) {
            this.recognitionStream.destroy();
            this.recognitionStream = null;
        }

        this.emit('voiceInputStopped', { sessionId: this.currentSession });

        return { success: true, listening: false };
    }

    async processVoiceInput(audioData, options = {}) {
        if (!this.currentSession) {
            throw new Error('No active voice session');
        }

        const startTime = Date.now();
        this.voiceState = 'processing';

        try {
            // Use parent class to process speech recognition
            const result = await this.recognizeSpeech(audioData, options);
            const transcript = result.transcript.toLowerCase().trim();
            
            this.lastTranscript = transcript;
            const processingTime = Date.now() - startTime;

            // Check if transcript contains voice commands
            const commandResult = this.detectVoiceCommand(transcript);

            const voiceResult = {
                transcript: result.transcript,
                confidence: result.confidence,
                processingTime,
                words: result.words,
                command: commandResult.command,
                intent: commandResult.intent,
                isCommand: commandResult.isCommand
            };

            // Track voice interaction
            this.analytics.trackVoiceInteraction(this.currentSession, {
                type: commandResult.isCommand ? 'voice_command' : 'speech_to_text',
                duration: audioData.length || 0,
                processingTime,
                confidence: result.confidence,
                command: commandResult.command,
                intent: commandResult.intent,
                success: true,
                language: options.languageCode || 'en-US'
            });

            // Add to command history
            this.commandHistory.push({
                timestamp: Date.now(),
                transcript: result.transcript,
                command: commandResult.command,
                intent: commandResult.intent,
                confidence: result.confidence
            });

            // Keep only last 20 commands
            if (this.commandHistory.length > 20) {
                this.commandHistory = this.commandHistory.slice(-20);
            }

            this.voiceState = 'idle';
            this.emit('voiceInputProcessed', {
                sessionId: this.currentSession,
                result: voiceResult
            });

            return voiceResult;

        } catch (error) {
            this.voiceState = 'idle';
            const processingTime = Date.now() - startTime;

            this.analytics.trackVoiceInteraction(this.currentSession, {
                type: 'voice_processing_error',
                duration: audioData.length || 0,
                processingTime,
                error: error.message,
                success: false
            });

            console.error('Voice input processing failed:', error);
            throw error;
        }
    }

    detectVoiceCommand(transcript) {
        for (const { pattern, intent, command } of this.commandPatterns) {
            if (pattern.test(transcript)) {
                return {
                    isCommand: true,
                    command: command,
                    intent: intent,
                    confidence: this.calculateCommandConfidence(transcript, command)
                };
            }
        }

        return { isCommand: false, command: null, intent: null, confidence: 0 };
    }

    calculateCommandConfidence(transcript, command) {
        // Simple confidence calculation based on word overlap
        const transcriptWords = transcript.toLowerCase().split(/\s+/);
        const commandWords = command.toLowerCase().split(/\s+/);
        
        let matches = 0;
        commandWords.forEach(word => {
            if (transcriptWords.includes(word)) {
                matches++;
            }
        });

        return commandWords.length > 0 ? matches / commandWords.length : 0;
    }

    // Voice response methods
    async speakResponse(text, options = {}) {
        if (!this.consultationConfig.voiceResponseEnabled) {
            return { success: false, reason: 'Voice response disabled' };
        }

        this.voiceState = 'speaking';
        const startTime = Date.now();

        try {
            const speechOptions = {
                languageCode: options.language || 'en-US',
                voiceName: options.voiceName || this.getRecommendedVoice(options.language),
                speakingRate: options.speakingRate || 1.0,
                pitch: options.pitch || 0.0,
                ...options
            };

            const result = await this.synthesizeSpeech(text, speechOptions);
            const synthesisTime = Date.now() - startTime;

            // Track voice response
            if (this.currentSession) {
                this.analytics.trackVoiceInteraction(this.currentSession, {
                    type: 'voice_response',
                    duration: text.length * 50, // Estimate based on text length
                    processingTime: synthesisTime,
                    language: speechOptions.languageCode,
                    success: true
                });
            }

            this.voiceState = 'idle';
            this.emit('voiceResponseGenerated', {
                sessionId: this.currentSession,
                text,
                audioContent: result.audioContent,
                synthesisTime
            });

            return {
                success: true,
                audioContent: result.audioContent,
                synthesisTime,
                language: speechOptions.languageCode
            };

        } catch (error) {
            this.voiceState = 'idle';
            const synthesisTime = Date.now() - startTime;

            if (this.currentSession) {
                this.analytics.trackVoiceInteraction(this.currentSession, {
                    type: 'voice_response_error',
                    processingTime: synthesisTime,
                    error: error.message,
                    success: false
                });
            }

            console.error('Voice response generation failed:', error);
            throw error;
        }
    }

    getRecommendedVoice(languageCode = 'en-US') {
        const voiceMap = {
            'en-US': 'en-US-Neural2-D',
            'es-ES': 'es-ES-Neural2-B',
            'fr-FR': 'fr-FR-Neural2-A',
            'de-DE': 'de-DE-Neural2-B'
        };

        return voiceMap[languageCode] || voiceMap['en-US'];
    }

    // Accessibility features
    async enableAccessibilityMode(sessionId, accessibilityOptions = {}) {
        this.currentSession = sessionId;
        
        const accessibilityConfig = {
            slowSpeech: accessibilityOptions.slowSpeech || false,
            highContrast: accessibilityOptions.highContrast || false,
            repeatConfirmations: accessibilityOptions.repeatConfirmations || true,
            verboseDescriptions: accessibilityOptions.verboseDescriptions || true,
            extendedTimeout: accessibilityOptions.extendedTimeout || true,
            ...accessibilityOptions
        };

        // Adjust voice settings for accessibility
        if (accessibilityConfig.slowSpeech) {
            this.consultationConfig.speakingRate = 0.8;
        }

        if (accessibilityConfig.extendedTimeout) {
            this.consultationConfig.commandTimeout = 10000; // 10 seconds
        }

        this.emit('accessibilityModeEnabled', {
            sessionId,
            config: accessibilityConfig
        });

        return { success: true, config: accessibilityConfig };
    }

    // Continuous listening for hands-free experience
    async startContinuousRecognition(voiceConfig) {
        // Implementation would depend on the specific speech service
        // This is a simplified version
        console.log('Starting continuous voice recognition with config:', voiceConfig);
        
        // In a real implementation, this would set up streaming recognition
        // that continuously listens for voice commands
    }

    // Multi-language support
    async switchLanguage(language) {
        if (!this.consultationConfig.supportedLanguages.includes(language)) {
            throw new Error(`Language ${language} not supported`);
        }

        this.audioConfig.languageCode = language;
        
        if (this.currentSession) {
            this.analytics.trackVoiceInteraction(this.currentSession, {
                type: 'language_switch',
                language: language,
                success: true
            });
        }

        this.emit('languageChanged', { language });
        return { success: true, language };
    }

    // Voice state and status
    getVoiceStatus() {
        return {
            isListening: this.isListening,
            voiceState: this.voiceState,
            currentSession: this.currentSession,
            language: this.audioConfig.languageCode,
            continuousListening: this.consultationConfig.continuousListening,
            voiceResponseEnabled: this.consultationConfig.voiceResponseEnabled,
            lastTranscript: this.lastTranscript,
            commandHistory: this.commandHistory.slice(-5) // Last 5 commands
        };
    }

    // Cleanup and shutdown
    async shutdown() {
        await this.stopVoiceInput();
        await super.shutdown();
        
        this.commandHistory = [];
        this.currentSession = null;
        this.lastTranscript = '';
        
        console.log('Consultation Voice Service shut down successfully');
    }
}