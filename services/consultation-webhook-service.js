/**
 * Consultation Webhook Service
 * Handles webhook requests from Dialogflow CX and integrates with existing APIs
 * Provides the bridge between conversation flows and backend services
 * Includes voice integration and analytics tracking
 */

import express from 'express';
import cors from 'cors';
import StoreLocatorService from './store-locator-service.js';
import FaceShapeAnalysisService from './face-shape-analysis-service.js';
import EnhancedRecommendationService from './enhanced-recommendation-service.js';
import ConsultationVoiceService from './consultation-voice-service.js';
import ConsultationAnalyticsExtension from '../analytics/consultation-analytics-extension.js';

export default class ConsultationWebhookService {
    constructor(config = {}) {
        this.config = {
            port: config.port || 3002,
            apiIntegrationUrl: config.apiIntegrationUrl || 'http://localhost:3001',
            ...config
        };
        
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        
        // Integration with existing services
        this.apiIntegration = null;
        this.consultationSessions = new Map();
        
        // Initialize Store Locator Service
        this.storeLocator = new StoreLocatorService(config.storeLocator || {});
        
        // Initialize Face Shape Analysis Service
        this.faceShapeAnalyzer = new FaceShapeAnalysisService(config.faceShapeAnalysis || {});
        
        // Initialize Enhanced Recommendation Service
        this.enhancedRecommendations = new EnhancedRecommendationService(config.enhancedRecommendations || {});
        
        // Initialize Voice Service
        this.voiceService = new ConsultationVoiceService(config.voiceService || {});
        
        // Initialize Analytics Extension
        this.analytics = new ConsultationAnalyticsExtension();
    }

    setupMiddleware() {
        const corsOptions = {
            origin: [
                'https://storage.googleapis.com',
                'http://localhost:3001',
                'https://commerce-studio-api-ddtojwjn7a-uc.a.run.app'
            ],
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
            optionsSuccessStatus: 204
        };
        this.app.use(cors(corsOptions));
        this.app.options('*', cors(corsOptions));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {
        // Main webhook endpoint for Dialogflow CX
        this.app.post('/webhook', this.handleWebhook.bind(this));
        
        // Consultation-specific endpoints
        this.app.post('/consultation/start', this.startConsultation.bind(this));
        this.app.post('/consultation/face-analysis', this.handleFaceAnalysis.bind(this));
        this.app.post('/consultation/virtual-tryon', this.handleVirtualTryOn.bind(this));
        this.app.post('/consultation/recommendations', this.handleRecommendations.bind(this));
        this.app.post('/consultation/store-locator', this.handleStoreLocator.bind(this));
        this.app.post('/consultation/reservation', this.handleReservation.bind(this));
        
        // Voice integration endpoints
        this.app.post('/consultation/voice/start', this.startVoiceInput.bind(this));
        this.app.post('/consultation/voice/process', this.processVoiceInput.bind(this));
        this.app.post('/consultation/voice/stop', this.stopVoiceInput.bind(this));
        this.app.post('/consultation/voice/speak', this.speakResponse.bind(this));
        
        // Enhanced Recommendation API endpoints
        this.app.post('/api/recommendations/analyze-face', this.analyzeFaceShape.bind(this));
        this.app.post('/api/recommendations/enhanced', this.getEnhancedRecommendations.bind(this));
        this.app.post('/api/recommendations/explain', this.explainRecommendation.bind(this));
        
        // Store Locator API endpoints
        this.app.get('/api/stores/nearby', this.findNearbyStores.bind(this));
        this.app.get('/api/stores/:storeId/inventory/:frameId', this.checkStoreInventory.bind(this));
        this.app.post('/api/stores/inventory/bulk', this.checkBulkInventory.bind(this));
        this.app.post('/api/stores/reserve', this.createReservation.bind(this));
        this.app.get('/api/stores/reservations/:reservationId', this.getReservation.bind(this));
        this.app.get('/api/stores', this.getAllStores.bind(this));
        this.app.get('/api/stores/search', this.searchStores.bind(this));
        
        // Analytics endpoints
        this.app.get('/analytics/consultation/metrics', this.getConsultationMetrics.bind(this));
        this.app.get('/analytics/consultation/consultations', this.getConsultationAnalytics.bind(this));
        this.app.get('/analytics/consultation/face-analysis', this.getFaceAnalysisMetrics.bind(this));
        this.app.get('/analytics/consultation/recommendations', this.getRecommendationMetrics.bind(this));
        this.app.get('/analytics/consultation/voice', this.getVoiceMetrics.bind(this));
        this.app.get('/analytics/consultation/stores', this.getStoreMetrics.bind(this));
        this.app.get('/analytics/consultation/performance', this.getPerformanceMetrics.bind(this));
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'healthy', timestamp: new Date().toISOString() });
        });
    }

    async handleWebhook(req, res) {
        try {
            const { queryResult, sessionInfo } = req.body;
            const sessionId = this.extractSessionId(sessionInfo.session);
            const intent = queryResult.intent?.displayName;
            const parameters = queryResult.parameters || {};
            
            console.log(`Processing webhook for intent: ${intent}, session: ${sessionId}`);
            
            let response = {
                fulfillmentResponse: {
                    messages: []
                }
            };
            
            // Route to appropriate handler based on intent
            switch (intent) {
                case 'consultation.start':
                    response = await this.handleConsultationStart(parameters, sessionId);
                    break;
                    
                case 'needs.assessment':
                    response = await this.handleNeedsAssessment(parameters, sessionId);
                    break;
                    
                case 'face.analysis_request':
                    response = await this.handleFaceAnalysisRequest(parameters, sessionId);
                    break;
                    
                case 'virtual.tryon_request':
                    response = await this.handleVirtualTryOnRequest(parameters, sessionId);
                    break;
                    
                case 'recommendation.request':
                    response = await this.handleRecommendationRequest(parameters, sessionId);
                    break;
                    
                case 'store.locator_request':
                    response = await this.handleStoreLocatorRequest(parameters, sessionId);
                    break;
                    
                case 'reservation.create':
                    response = await this.handleReservationRequest(parameters, sessionId);
                    break;
                    
                default:
                    response = await this.handleDefaultIntent(intent, parameters, sessionId);
            }
            
            res.json(response);
            
        } catch (error) {
            console.error('Webhook error:', error);
            res.status(500).json({
                fulfillmentResponse: {
                    messages: [{
                        text: {
                            text: ["I apologize, but I'm having trouble processing your request. Please try again."]
                        }
                    }]
                }
            });
        }
    }

    async handleConsultationStart(parameters, sessionId) {
        // Initialize consultation session
        this.consultationSessions.set(sessionId, {
            startTime: Date.now(),
            stage: 'greeting',
            collectedData: {},
            preferences: {},
            recommendations: []
        });
        
        // Track consultation start
        this.analytics.trackConsultationStart(sessionId, parameters);
        
        return {
            fulfillmentResponse: {
                messages: [{
                    text: {
                        text: ["Hello! I'm your personal AI eyewear consultant. I'll help you find the perfect frames based on your face shape, style preferences, and lifestyle needs. What brings you here today?"]
                    }
                }, {
                    payload: {
                        quickReplies: [
                            "I need new glasses",
                            "Help me find my style",
                            "I want to try frames virtually",
                            "Find frames for my face shape"
                        ]
                    }
                }]
            }
        };
    }

    async handleNeedsAssessment(parameters, sessionId) {
        const session = this.consultationSessions.get(sessionId) || {};
        
        // Update collected data
        session.collectedData = {
            ...session.collectedData,
            prescription: parameters.prescription,
            lifestyle: parameters.lifestyle,
            budget: parameters.budget,
            stylePreference: parameters.stylePreference,
            occasion: parameters.occasion
        };
        
        session.stage = 'needs_assessment';
        this.consultationSessions.set(sessionId, session);
        
        // Track stage transition
        this.analytics.trackStageTransition(sessionId, 'greeting', 'needs_assessment');
        
        // Determine next question or move to next stage
        const missingData = this.getMissingNeedsData(session.collectedData);
        
        if (missingData.length > 0) {
            const nextQuestion = this.getNextNeedsQuestion(missingData[0]);
            return {
                fulfillmentResponse: {
                    messages: [{
                        text: {
                            text: [nextQuestion]
                        }
                    }]
                }
            };
        } else {
            // All needs data collected, move to recommendations
            return {
                fulfillmentResponse: {
                    messages: [{
                        text: {
                            text: ["Perfect! I have all the information I need about your preferences. Now, would you like me to analyze your face shape for the most accurate recommendations, or shall I show you some options based on what you've told me?"]
                        }
                    }, {
                        payload: {
                            quickReplies: [
                                "Analyze my face shape",
                                "Show me recommendations now",
                                "Let me try frames virtually"
                            ]
                        }
                    }]
                }
            };
        }
    }

    async handleFaceAnalysisRequest(parameters, sessionId) {
        // Track stage transition
        this.analytics.trackStageTransition(sessionId, 'needs_assessment', 'face_analysis');
        
        return {
            fulfillmentResponse: {
                messages: [{
                    text: {
                        text: ["Great! I'll help you analyze your face shape for the most accurate frame recommendations. Please allow camera access when prompted."]
                    }
                }, {
                    payload: {
                        type: 'face_analysis_request',
                        cameraRequired: true,
                        instructions: [
                            "Position your face in the camera frame",
                            "Ensure good lighting",
                            "Look directly at the camera",
                            "Keep your face still for analysis"
                        ]
                    }
                }]
            }
        };
    }

    async handleVirtualTryOnRequest(parameters, sessionId) {
        const frameId = parameters.frameId || parameters.selectedFrame;
        
        return {
            fulfillmentResponse: {
                messages: [{
                    text: {
                        text: [`Let's try on ${frameId ? 'these frames' : 'some frames'} virtually! Please allow camera access when prompted.`]
                    }
                }, {
                    payload: {
                        type: 'virtual_tryon_request',
                        frameId: frameId,
                        cameraRequired: true,
                        instructions: [
                            "Allow camera access",
                            "Position your face in the frame",
                            "Try different angles",
                            "Compare multiple frames"
                        ]
                    }
                }]
            }
        };
    }

    async handleRecommendationRequest(parameters, sessionId) {
        const session = this.consultationSessions.get(sessionId) || {};
        
        // Get personalized recommendations based on collected data
        const recommendations = await this.getPersonalizedRecommendations(session.collectedData);
        
        session.recommendations = recommendations;
        this.consultationSessions.set(sessionId, session);
        
        // Track recommendations
        recommendations.forEach((rec, index) => {
            this.analytics.trackRecommendation(sessionId, {
                frameId: rec.id,
                confidence: rec.confidence,
                reason: rec.reason,
                rank: index
            });
        });
        
        return {
            fulfillmentResponse: {
                messages: [{
                    text: {
                        text: ["Based on your preferences and needs, I've found some perfect frames for you! Here are my top recommendations:"]
                    }
                }, {
                    payload: {
                        type: 'product_recommendations',
                        recommendations: recommendations.slice(0, 3),
                        criteria: session.collectedData
                    }
                }, {
                    text: {
                        text: ["Would you like to try any of these on virtually, or shall I find more options for you?"]
                    }
                }]
            }
        };
    }

    async handleStoreLocatorRequest(parameters, sessionId) {
        const location = parameters.location;
        const selectedFrames = parameters.selectedFrames || [];
        
        // Track store locator usage
        this.analytics.trackStoreLocatorUsage(sessionId, {
            action: 'request',
            location: location,
            selectedFrames: selectedFrames
        });
        
        return {
            fulfillmentResponse: {
                messages: [{
                    text: {
                        text: ["I'll help you find stores near you where you can try on and purchase your selected frames."]
                    }
                }, {
                    payload: {
                        type: 'store_locator_request',
                        location: location,
                        selectedFrames: selectedFrames,
                        requiresLocation: !location
                    }
                }]
            }
        };
    }

    async handleReservationRequest(parameters, sessionId) {
        const storeId = parameters.storeId;
        const frameId = parameters.frameId;
        const customerInfo = {
            name: parameters.customerName,
            email: parameters.customerEmail,
            phone: parameters.customerPhone
        };
        
        return {
            fulfillmentResponse: {
                messages: [{
                    text: {
                        text: ["I'll help you reserve these frames for pickup. Let me get your contact information."]
                    }
                }, {
                    payload: {
                        type: 'reservation_request',
                        storeId: storeId,
                        frameId: frameId,
                        customerInfo: customerInfo,
                        requiresInfo: !customerInfo.email
                    }
                }]
            }
        };
    }

    async handleDefaultIntent(intent, parameters, sessionId) {
        return {
            fulfillmentResponse: {
                messages: [{
                    text: {
                        text: ["I understand you're interested in eyewear. How can I help you find the perfect frames today?"]
                    }
                }, {
                    payload: {
                        quickReplies: [
                            "Start consultation",
                            "Browse frames",
                            "Virtual try-on",
                            "Find stores"
                        ]
                    }
                }]
            }
        };
    }

    // Voice integration methods
    async startVoiceInput(req, res) {
        const { sessionId, options } = req.body;
        
        try {
            const result = await this.voiceService.startVoiceInput(sessionId, options);
            res.json(result);
        } catch (error) {
            console.error('Failed to start voice input:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async processVoiceInput(req, res) {
        const { audioData, options } = req.body;
        
        try {
            const result = await this.voiceService.processVoiceInput(audioData, options);
            res.json(result);
        } catch (error) {
            console.error('Failed to process voice input:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async stopVoiceInput(req, res) {
        try {
            const result = await this.voiceService.stopVoiceInput();
            res.json(result);
        } catch (error) {
            console.error('Failed to stop voice input:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async speakResponse(req, res) {
        const { text, options } = req.body;
        
        try {
            const result = await this.voiceService.speakResponse(text, options);
            res.json(result);
        } catch (error) {
            console.error('Failed to generate voice response:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Analytics endpoints
    async getConsultationMetrics(req, res) {
        const timeRange = req.query.timeRange || '24h';
        const metrics = this.analytics.getConsultationMetrics(timeRange);
        res.json(metrics);
    }

    async getConsultationAnalytics(req, res) {
        const timeRange = req.query.timeRange || '24h';
        const analytics = this.analytics.getUserJourneyAnalytics(timeRange);
        res.json(analytics);
    }

    async getFaceAnalysisMetrics(req, res) {
        const metrics = this.analytics.getFaceAnalysisMetrics();
        res.json(metrics);
    }

    async getRecommendationMetrics(req, res) {
        const metrics = this.analytics.getRecommendationEffectiveness();
        res.json(metrics);
    }

    async getVoiceMetrics(req, res) {
        const metrics = this.analytics.getVoiceInteractionMetrics();
        res.json(metrics);
    }

    async getStoreMetrics(req, res) {
        const metrics = this.analytics.getStoreLocatorMetrics();
        res.json(metrics);
    }

    async getPerformanceMetrics(req, res) {
        const timeRange = req.query.timeRange || '24h';
        const metrics = this.analytics.getPerformanceMetrics(timeRange);
        res.json(metrics);
    }

    // Helper methods
    extractSessionId(sessionPath) {
        // Extract session ID from Dialogflow session path
        const parts = sessionPath.split('/');
        return parts[parts.length - 1];
    }

    getMissingNeedsData(collectedData) {
        const requiredFields = ['prescription', 'lifestyle', 'budget', 'stylePreference'];
        return requiredFields.filter(field => !collectedData[field]);
    }

    getNextNeedsQuestion(missingField) {
        const questions = {
            prescription: "Do you need prescription lenses, or are you looking for non-prescription frames?",
            lifestyle: "Tell me about your lifestyle. Are you active, work in an office, or spend time outdoors?",
            budget: "What's your budget range for new frames?",
            stylePreference: "What style appeals to you most - classic, modern, bold, or subtle?"
        };
        
        return questions[missingField] || "Tell me more about what you're looking for.";
    }

    async getPersonalizedRecommendations(collectedData) {
        // This would integrate with the existing recommendation engine
        // For now, return mock data based on preferences
        const mockRecommendations = [
            {
                id: 'rec-001',
                name: 'Classic Rectangle Frame',
                brand: 'VisionCraft',
                price: 149.99,
                image: '/images/frames/classic-rectangle.jpg',
                confidence: 0.95,
                reason: 'Perfect for your professional lifestyle and classic style preference',
                faceShapeMatch: 'Excellent for oval faces'
            },
            {
                id: 'rec-002',
                name: 'Modern Round Frame',
                brand: 'VisionCraft',
                price: 129.99,
                image: '/images/frames/modern-round.jpg',
                confidence: 0.88,
                reason: 'Trendy design that complements your modern style',
                faceShapeMatch: 'Great for square faces'
            },
            {
                id: 'rec-003',
                name: 'Premium Cat-Eye Frame',
                brand: 'VisionCraft',
                price: 199.99,
                image: '/images/frames/premium-cat-eye.jpg',
                confidence: 0.82,
                reason: 'Sophisticated design perfect for special occasions',
                faceShapeMatch: 'Flattering for round faces'
            }
        ];
        
        // Filter based on budget if specified
        if (collectedData.budget) {
            const budgetRange = this.parseBudgetRange(collectedData.budget);
            return mockRecommendations.filter(rec => 
                rec.price >= budgetRange.min && rec.price <= budgetRange.max
            );
        }
        
        return mockRecommendations;
    }

    parseBudgetRange(budgetString) {
        // Parse budget strings like "under $150", "$100-200", "over $200"
        if (budgetString.includes('under')) {
            const amount = parseInt(budgetString.match(/\d+/)[0]);
            return { min: 0, max: amount };
        } else if (budgetString.includes('over')) {
            const amount = parseInt(budgetString.match(/\d+/)[0]);
            return { min: amount, max: Infinity };
        } else if (budgetString.includes('-')) {
            const amounts = budgetString.match(/\d+/g);
            return { min: parseInt(amounts[0]), max: parseInt(amounts[1]) };
        }
        
        return { min: 0, max: Infinity };
    }

    // API endpoints for direct integration
    async startConsultation(req, res) {
        const sessionId = req.body.sessionId || `session_${Date.now()}`;
        
        this.consultationSessions.set(sessionId, {
            startTime: Date.now(),
            stage: 'greeting',
            collectedData: {},
            preferences: {},
            recommendations: []
        });
        
        // Track consultation start
        this.analytics.trackConsultationStart(sessionId, req.body);
        
        res.json({
            success: true,
            sessionId: sessionId,
            message: "Consultation started successfully"
        });
    }

    async handleFaceAnalysis(req, res) {
        const { sessionId, imageData } = req.body;
        
        try {
            // Use the enhanced face shape analysis service
            const faceAnalysisResult = await this.faceShapeAnalyzer.analyzeFaceShape(imageData);
            
            // Update session with face analysis results
            const session = this.consultationSessions.get(sessionId) || {};
            session.collectedData.faceShape = faceAnalysisResult.faceShape;
            session.collectedData.faceAnalysis = faceAnalysisResult;
            this.consultationSessions.set(sessionId, session);
            
            // Track face analysis
            this.analytics.trackFaceAnalysis(sessionId, faceAnalysisResult);
            
            res.json({
                success: true,
                faceAnalysis: faceAnalysisResult
            });
            
        } catch (error) {
            console.error('Face analysis failed:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async analyzeFaceShape(req, res) {
        const { imageData, sessionId } = req.body;
        
        try {
            if (!imageData) {
                return res.status(400).json({
                    success: false,
                    error: 'Image data is required'
                });
            }

            // Use the enhanced face shape analysis service
            const faceAnalysisResult = await this.faceShapeAnalyzer.analyzeFaceShape(imageData);
            
            // Track analytics
            if (sessionId) {
                this.analytics.trackFaceAnalysis(sessionId, faceAnalysisResult);
            }
            
            res.json({
                success: true,
                analysis: faceAnalysisResult
            });
            
        } catch (error) {
            console.error('Face shape analysis failed:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getEnhancedRecommendations(req, res) {
        const { sessionId, faceShape, preferences } = req.body;
        
        try {
            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    error: 'Session ID is required'
                });
            }

            // Get enhanced recommendations using the service
            const recommendations = await this.enhancedRecommendations.generateRecommendations({
                sessionId,
                faceShape,
                preferences: preferences || {}
            });
            
            // Track each recommendation
            recommendations.forEach((rec, index) => {
                this.analytics.trackRecommendation(sessionId, {
                    frameId: rec.id,
                    confidence: rec.confidence,
                    reason: rec.reason,
                    rank: index,
                    basedOnFaceShape: !!faceShape
                });
            });
            
            res.json({
                success: true,
                recommendations: recommendations
            });
            
        } catch (error) {
            console.error('Enhanced recommendations failed:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async explainRecommendation(req, res) {
        const { frameId, faceShape, preferences } = req.body;
        
        try {
            if (!frameId) {
                return res.status(400).json({
                    success: false,
                    error: 'Frame ID is required'
                });
            }

            // Get explanation from enhanced recommendations service
            const explanation = await this.enhancedRecommendations.explainRecommendation({
                frameId,
                faceShape,
                preferences: preferences || {}
            });
            
            res.json({
                success: true,
                explanation: explanation
            });
            
        } catch (error) {
            console.error('Recommendation explanation failed:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Store locator methods
    async findNearbyStores(req, res) {
        const { latitude, longitude, location, maxDistance } = req.query;
        
        try {
            const stores = await this.storeLocator.findNearbyStores({
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                location,
                maxDistance: parseInt(maxDistance) || 25
            });
            
            res.json({ success: true, stores });
        } catch (error) {
            console.error('Store search failed:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async checkStoreInventory(req, res) {
        const { storeId, frameId } = req.params;
        
        try {
            const inventory = await this.storeLocator.checkInventory(storeId, frameId);
            res.json({ success: true, inventory });
        } catch (error) {
            console.error('Inventory check failed:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async createReservation(req, res) {
        const reservationData = req.body;
        
        try {
            const reservation = await this.storeLocator.createReservation(reservationData);
            
            // Track conversion
            if (reservationData.sessionId) {
                this.analytics.trackConversion(reservationData.sessionId, {
                    type: 'reservation',
                    frameId: reservationData.frameId,
                    storeId: reservationData.storeId,
                    value: reservationData.estimatedValue || 0
                });
            }
            
            res.json({ success: true, reservation });
        } catch (error) {
            console.error('Reservation creation failed:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getReservation(req, res) {
        const { reservationId } = req.params;
        
        try {
            const reservation = await this.storeLocator.getReservation(reservationId);
            res.json({ success: true, reservation });
        } catch (error) {
            console.error('Reservation retrieval failed:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getAllStores(req, res) {
        try {
            const stores = await this.storeLocator.getAllStores();
            res.json({ success: true, stores });
        } catch (error) {
            console.error('Store listing failed:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async searchStores(req, res) {
        const { query } = req.query;
        
        try {
            const stores = await this.storeLocator.searchStores(query);
            res.json({ success: true, stores });
        } catch (error) {
            console.error('Store search failed:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    start() {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.config.port, () => {
                console.log(`Consultation Webhook Service listening on port ${this.config.port}`);
                resolve();
            });
        });
    }

    stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('Consultation Webhook Service stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}