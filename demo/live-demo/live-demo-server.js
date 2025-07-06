#!/usr/bin/env node

/**
 * Live Demo Server for AI Avatar Chat System
 * Connects to real AI services for live demonstrations
 * Google Cloud services as primary, NVIDIA as fallback
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import yaml from 'js-yaml';
import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import net from 'net';
import { exec } from 'child_process';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment with fallback
try {
    dotenvConfig({ path: path.join(__dirname, '../../.env.demo') });
} catch (error) {
    console.warn('Warning: Could not load .env.demo file:', error.message);
}

// Service Clients - will be loaded dynamically
let OmniverseAvatarService, RivaSpeechService, MerlinConversationService;
let GoogleSpeechService, GoogleConversationService, UnifiedDialogflowService;

class LiveDemoServer {
    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: process.env.DEMO_CORS_ORIGINS?.split(',') || ["http://localhost:3000"],
                methods: ["GET", "POST"]
            }
        });
        
        this.config = null;
        this.nvidiaConfig = null;
        this.activeSessions = new Map();
        
        // Service instances
        this.omniverseService = null;
        this.rivaService = null;
        this.merlinService = null;
        
        // Google Service instances
        this.googleSpeechService = null;
        this.googleConversationService = null;
        this.unifiedDialogflowService = null;
        
        // Service provider tracking
        this.primaryServiceProvider = null;
        this.speechService = null;
        this.conversationService = null;
        
        this.init();
    }

    async init() {
        try {
            await this.createRequiredDirectories();
            await this.loadConfiguration();
            await this.initializeAIServices();
            this.setupMiddleware();
            this.setupRoutes();
            this.setupSocketHandlers();
            this.startServer();
        } catch (error) {
            console.error('Server initialization failed:', error);
            console.error('Attempting fallback initialization...');
            await this.initializeFallbackMode();
        }
    }

    async createRequiredDirectories() {
        const requiredDirs = [
            path.join(__dirname, '../../logs'),
            path.join(__dirname, '../../temp'),
            path.join(__dirname, '../../models/mediapipe'),
            path.join(__dirname, '../mock-services'),
            path.join(__dirname, '../sample-data')
        ];

        for (const dir of requiredDirs) {
            try {
                await fs.mkdir(dir, { recursive: true });
                console.log(`Created directory: ${dir}`);
            } catch (error) {
                console.warn(`Warning: Could not create directory ${dir}:`, error.message);
            }
        }
    }

    async loadConfiguration() {
        try {
            // Load main configuration with fallback
            const configPath = path.join(__dirname, '../live-demo-configuration.yaml');
            try {
                const configContent = await fs.readFile(configPath, 'utf8');
                this.config = yaml.load(configContent);
                console.log('Configuration loaded successfully');
            } catch (error) {
                console.warn('Warning: Could not load configuration file, using defaults:', error.message);
                this.config = this.getDefaultConfig();
            }
            
            // Load NVIDIA API configuration with fallback
            const nvidiaConfigPath = path.join(__dirname, '../../config/nvidia/live-api-configuration.yaml');
            try {
                const nvidiaConfigContent = await fs.readFile(nvidiaConfigPath, 'utf8');
                this.nvidiaConfig = yaml.load(nvidiaConfigContent);
                console.log('NVIDIA configuration loaded successfully');
            } catch (error) {
                console.warn('Warning: Could not load NVIDIA configuration, using defaults:', error.message);
                this.nvidiaConfig = this.getDefaultNvidiaConfig();
            }
            
        } catch (error) {
            console.error('Configuration loading failed completely:', error);
            throw error;
        }
    }

    async initializeAIServices() {
        console.log('Initializing AI services (Google primary, NVIDIA fallback)...');
        
        try {
            // Try Google services first
            await this.initializeGoogleServices();
            console.log('Google services initialized successfully as primary');
            
        } catch (googleError) {
            console.warn('Google services initialization failed, trying NVIDIA fallback:', googleError.message);
            
            try {
                await this.initializeNvidiaServices();
                console.log('NVIDIA fallback services initialized successfully');
                
            } catch (nvidiaError) {
                console.error('Both Google and NVIDIA services failed, using mock services:', nvidiaError.message);
                await this.initializeFallbackServices();
            }
        }
    }

    async initializeGoogleServices() {
        try {
            console.log('Initializing Google Cloud services...');
            
            // Load Google service modules dynamically
            try {
                const googleSpeechModule = await import('../../services/google/google-speech-service.js');
                const unifiedDialogflowModule = await import('../../services/google/unified-dialogflow-service.js');
                
                GoogleSpeechService = googleSpeechModule.default;
                UnifiedDialogflowService = unifiedDialogflowModule.default;
                
                console.log('Google service modules loaded successfully');
            } catch (importError) {
                console.error('Failed to import Google service modules:', importError);
                throw new Error(`Google module import failed: ${importError.message}`);
            }
            
            // Validate Google Cloud credentials
            if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT_ID) {
                throw new Error('Google Cloud credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_PROJECT_ID');
            }

            // Initialize Google Speech Service
            this.googleSpeechService = new GoogleSpeechService({
                projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
                keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
                languageCode: 'en-US'
            });
            await this.googleSpeechService.initialize();
            console.log('Google Speech Service initialized');

            // Initialize Unified Dialogflow Service (replaces Google Conversation Service)
            this.unifiedDialogflowService = new UnifiedDialogflowService({
                projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
                location: process.env.DIALOGFLOW_LOCATION || 'us-central1',
                agentId: process.env.DIALOGFLOW_AGENT_ID,
                languageCode: 'en'
            });
            await this.unifiedDialogflowService.initialize();
            console.log('Unified Dialogflow Service initialized');

            // Set primary service flags
            this.primaryServiceProvider = 'google';
            this.speechService = this.googleSpeechService;
            this.conversationService = this.unifiedDialogflowService;
            
        } catch (error) {
            console.error('Google services initialization failed:', error);
            throw error;
        }
    }

    async initializeNvidiaServices() {
        try {
            console.log('Initializing NVIDIA services...');
            
            // Load NVIDIA service modules dynamically
            try {
                const omniverseModule = await import('../../services/nvidia/omniverse-avatar-service.js');
                const rivaModule = await import('../../services/nvidia/riva-speech-service.js');
                const merlinModule = await import('../../services/nvidia/merlin-conversation-service.js');
                
                OmniverseAvatarService = omniverseModule.default;
                RivaSpeechService = rivaModule.default;
                MerlinConversationService = merlinModule.default;
                
                console.log('NVIDIA service modules loaded successfully');
            } catch (importError) {
                console.error('Failed to import NVIDIA service modules:', importError);
                throw new Error(`Module import failed: ${importError.message}`);
            }
            
            // Validate API key
            if (!process.env.NVIDIA_API_KEY) {
                throw new Error('NVIDIA_API_KEY environment variable is required');
            }

            // Initialize Omniverse Avatar Service
            if (this.config.nvidia_services.omniverse_avatar.enabled) {
                this.omniverseService = new OmniverseAvatarService({
                    endpoint: process.env.NVIDIA_OMNIVERSE_ENDPOINT,
                    apiKey: process.env.NVIDIA_OMNIVERSE_API_KEY,
                    config: this.nvidiaConfig.nvidia_services.omniverse_avatar
                });
                await this.omniverseService.initialize();
                console.log('Omniverse Avatar Service initialized');
            }

            // Initialize Riva Speech Service
            if (this.config.nvidia_services.riva_speech.enabled) {
                this.rivaService = new RivaSpeechService({
                    endpoint: process.env.NVIDIA_RIVA_ENDPOINT,
                    apiKey: process.env.NVIDIA_RIVA_API_KEY,
                    config: this.nvidiaConfig.nvidia_services.riva_speech
                });
                await this.rivaService.initialize();
                console.log('Riva Speech Service initialized');
            }

            // Initialize Merlin Conversation Service
            if (this.config.nvidia_services.merlin_conversation.enabled) {
                this.merlinService = new MerlinConversationService({
                    endpoint: process.env.NVIDIA_MERLIN_ENDPOINT,
                    apiKey: process.env.NVIDIA_MERLIN_API_KEY,
                    config: this.nvidiaConfig.nvidia_services.merlin_conversation
                });
                await this.merlinService.initialize();
                console.log('Merlin Conversation Service initialized');
            }

            // Set fallback service flags
            this.primaryServiceProvider = 'nvidia';
            this.speechService = this.rivaService;
            this.conversationService = this.merlinService;

        } catch (error) {
            console.error('NVIDIA services initialization failed:', error);
            
            // Enable fallback mode if configured
            if (this.config.fallback.enabled) {
                console.log('Enabling fallback mode...');
                await this.initializeFallbackServices();
            } else {
                throw error;
            }
        }
    }

    async initializeFallbackServices() {
        console.log('Initializing fallback services...');
        
        // Create mock services
        this.speechService = {
            async processAudio(audioData) {
                return {
                    transcript: "Mock speech recognition result",
                    confidence: 0.95
                };
            },
            async synthesizeSpeech(text) {
                return {
                    audioData: Buffer.from("mock audio data"),
                    format: "wav"
                };
            }
        };
        
        this.conversationService = {
            async processMessage(message, sessionId) {
                return {
                    response: `Mock response to: ${message}`,
                    intent: "mock.intent",
                    confidence: 0.9,
                    sessionId: sessionId
                };
            }
        };
        
        this.primaryServiceProvider = 'mock';
        console.log('Fallback services initialized');
    }

    async initializeFallbackMode() {
        try {
            console.log('Initializing in fallback mode...');
            
            // Use default configuration
            this.config = this.getDefaultConfig();
            this.nvidiaConfig = this.getDefaultNvidiaConfig();
            
            // Initialize fallback services
            await this.initializeFallbackServices();
            
            // Continue with server setup
            this.setupMiddleware();
            this.setupRoutes();
            this.setupSocketHandlers();
            this.startServer();
            
        } catch (error) {
            console.error('Fallback initialization failed:', error);
            process.exit(1);
        }
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "blob:"],
                    connectSrc: ["'self'", "ws:", "wss:"]
                }
            }
        }));

        // CORS
        this.app.use(cors({
            origin: process.env.DEMO_CORS_ORIGINS?.split(',') || ["http://localhost:3000"],
            credentials: true
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        });
        this.app.use(limiter);

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // File upload handling
        const upload = multer({
            dest: path.join(__dirname, '../../temp'),
            limits: {
                fileSize: 10 * 1024 * 1024 // 10MB limit
            }
        });
        this.app.use('/upload', upload.single('file'));
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: {
                    primary: this.primaryServiceProvider,
                    speech: this.speechService ? 'available' : 'unavailable',
                    conversation: this.conversationService ? 'available' : 'unavailable'
                }
            });
        });

        // Service status
        this.app.get('/api/status', (req, res) => {
            res.json({
                primaryProvider: this.primaryServiceProvider,
                activeSessions: this.activeSessions.size,
                services: {
                    google: {
                        speech: this.googleSpeechService ? 'initialized' : 'not available',
                        dialogflow: this.unifiedDialogflowService ? 'initialized' : 'not available'
                    },
                    nvidia: {
                        omniverse: this.omniverseService ? 'initialized' : 'not available',
                        riva: this.rivaService ? 'initialized' : 'not available',
                        merlin: this.merlinService ? 'initialized' : 'not available'
                    }
                }
            });
        });

        // Speech processing
        this.app.post('/api/speech/process', async (req, res) => {
            try {
                const { audioData, sessionId } = req.body;
                
                if (!this.speechService) {
                    throw new Error('Speech service not available');
                }
                
                const result = await this.speechService.processAudio(audioData);
                res.json({
                    success: true,
                    result: result,
                    provider: this.primaryServiceProvider
                });
                
            } catch (error) {
                console.error('Speech processing error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Conversation processing
        this.app.post('/api/conversation/process', async (req, res) => {
            try {
                const { message, sessionId, context } = req.body;
                
                if (!this.conversationService) {
                    throw new Error('Conversation service not available');
                }
                
                const result = await this.conversationService.processMessage 
                    ? await this.conversationService.processMessage(message, sessionId, context)
                    : await this.conversationService.processConversation(message, sessionId, context);
                
                res.json({
                    success: true,
                    result: result,
                    provider: this.primaryServiceProvider
                });
                
            } catch (error) {
                console.error('Conversation processing error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Static files
        this.app.use('/static', express.static(path.join(__dirname, '../frontend')));
        this.app.use('/', express.static(path.join(__dirname)));
        
        // Default route
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'live-avatar-interface.html'));
        });
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            
            socket.on('join-session', (sessionId) => {
                socket.join(sessionId);
                this.activeSessions.set(sessionId, {
                    socketId: socket.id,
                    joinedAt: new Date(),
                    provider: this.primaryServiceProvider
                });
                console.log(`Client ${socket.id} joined session ${sessionId}`);
            });
            
            socket.on('audio-stream', async (data) => {
                try {
                    if (this.speechService && this.speechService.processAudio) {
                        const result = await this.speechService.processAudio(data.audioData);
                        socket.emit('speech-result', {
                            transcript: result.transcript,
                            confidence: result.confidence,
                            provider: this.primaryServiceProvider
                        });
                    }
                } catch (error) {
                    console.error('Audio stream processing error:', error);
                    socket.emit('error', { message: error.message });
                }
            });
            
            socket.on('chat-message', async (data) => {
                try {
                    if (this.conversationService) {
                        const result = this.conversationService.processMessage 
                            ? await this.conversationService.processMessage(data.message, data.sessionId, data.context)
                            : await this.conversationService.processConversation(data.message, data.sessionId, data.context);
                        
                        socket.emit('chat-response', {
                            response: result.response || result.text,
                            intent: result.intent,
                            confidence: result.confidence,
                            provider: this.primaryServiceProvider,
                            sessionId: data.sessionId
                        });
                    }
                } catch (error) {
                    console.error('Chat message processing error:', error);
                    socket.emit('error', { message: error.message });
                }
            });
            
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
                // Clean up session
                for (const [sessionId, session] of this.activeSessions.entries()) {
                    if (session.socketId === socket.id) {
                        this.activeSessions.delete(sessionId);
                        break;
                    }
                }
            });
        });
    }

    startServer() {
        const port = process.env.DEMO_PORT || 3001;
        
        this.server.listen(port, () => {
            console.log(`\n🚀 Live Demo Server running on port ${port}`);
            console.log(`📊 Primary AI Provider: ${this.primaryServiceProvider}`);
            console.log(`🌐 Access the demo at: http://localhost:${port}`);
            console.log(`💬 WebSocket endpoint: ws://localhost:${port}`);
            console.log(`📋 Health check: http://localhost:${port}/health`);
            console.log(`📈 Status endpoint: http://localhost:${port}/api/status\n`);
        });
    }

    getDefaultConfig() {
        return {
            nvidia_services: {
                omniverse_avatar: { enabled: true },
                riva_speech: { enabled: true },
                merlin_conversation: { enabled: true }
            },
            fallback: { enabled: true }
        };
    }

    getDefaultNvidiaConfig() {
        return {
            nvidia_services: {
                omniverse_avatar: {
                    model: "default",
                    voice: "default"
                },
                riva_speech: {
                    language: "en-US",
                    sample_rate: 16000
                },
                merlin_conversation: {
                    model: "default",
                    max_tokens: 150
                }
            }
        };
    }
}

// Start the server
const server = new LiveDemoServer();

export default LiveDemoServer;