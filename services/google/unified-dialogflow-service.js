/**
 * Unified Dialogflow Service
 * Consolidates all Dialogflow CX functionality across the Commerce Studio platform
 * Integrates with existing conversation flows, webhook handlers, and ML platform
 */

import { SessionsClient } from '@google-cloud/dialogflow-cx';
import { v4 as uuidv4 } from 'uuid';

export default class UnifiedDialogflowService {
    constructor(config = {}) {
        this.projectId = config.projectId || process.env.GOOGLE_CLOUD_PROJECT_ID;
        this.location = config.location || process.env.DIALOGFLOW_LOCATION || 'us-central1';
        this.agentId = config.agentId || process.env.DIALOGFLOW_AGENT_ID;
        this.languageCode = config.languageCode || 'en';
        
        // Initialize Dialogflow CX client with regional endpoint
        this.sessionsClient = new SessionsClient({
            projectId: this.projectId,
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            apiEndpoint: `${this.location}-dialogflow.googleapis.com`
        });
        
        // Session management
        this.activeSessions = new Map();
        this.sessionTimeout = config.sessionTimeout || 30 * 60 * 1000; // 30 minutes
        
        // Conversation flows from existing documentation
        this.conversationFlows = {
            styleRecommendation: 'style_recommendation_flow',
            frameFinder: 'frame_finder_flow',
            fitConsultation: 'fit_consultation_flow',
            virtualTryon: 'virtual_tryon_flow',
            cartManagement: 'cart_management_flow',
            visualAnalysis: 'visual_analysis_flow'
        };
        
        // Intent mappings for eyewear domain
        this.eyewearIntents = {
            'style.recommendation': 'recommendation.style',
            'frame.finder': 'recommendation.frame',
            'fit.consultation': 'consultation.fit',
            'virtual.tryon': 'tryon.virtual',
            'cart.add': 'cart.add',
            'cart.view': 'cart.view',
            'visual.analysis': 'analysis.visual'
        };
        
        this.initialized = false;
    }

    async initialize() {
        try {
            console.log('Initializing Unified Dialogflow Service...');
            
            // Validate configuration
            if (!this.projectId || !this.agentId) {
                throw new Error('Missing required Dialogflow configuration: projectId and agentId are required');
            }
            
            // Test connection
            await this.testConnection();
            
            // Start session cleanup interval
            this.startSessionCleanup();
            
            this.initialized = true;
            console.log('Unified Dialogflow Service initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Unified Dialogflow Service:', error);
            throw error;
        }
    }

    async testConnection() {
        try {
            const testSessionId = `test-${Date.now()}`;
            const sessionPath = this.sessionsClient.projectLocationAgentSessionPath(
                this.projectId,
                this.location,
                this.agentId,
                testSessionId
            );
            
            const request = {
                session: sessionPath,
                queryInput: {
                    text: {
                        text: 'test connection'
                    },
                    languageCode: this.languageCode
                }
            };
            
            await this.sessionsClient.detectIntent(request);
            console.log('Dialogflow connection test successful');
            
        } catch (error) {
            console.error('Dialogflow connection test failed:', error);
            throw new Error(`Dialogflow connection failed: ${error.message}`);
        }
    }

    async processMessage(message, sessionId = null, context = {}) {
        return await this.processConversation(message, sessionId, context);
    }

    async processConversation(message, sessionId = null, context = {}) {
        try {
            if (!this.initialized) {
                throw new Error('Service not initialized');
            }
            
            // Generate session ID if not provided
            if (!sessionId) {
                sessionId = uuidv4();
            }
            
            // Create session path
            const sessionPath = this.sessionsClient.projectLocationAgentSessionPath(
                this.projectId,
                this.location,
                this.agentId,
                sessionId
            );
            
            // Prepare request with context
            const request = {
                session: sessionPath,
                queryInput: {
                    text: {
                        text: message
                    },
                    languageCode: this.languageCode
                }
            };
            
            // Add session parameters if provided
            if (context && Object.keys(context).length > 0) {
                request.queryParams = {
                    parameters: this.convertContextToParameters(context)
                };
            }
            
            // Send request to Dialogflow
            const [response] = await this.sessionsClient.detectIntent(request);
            
            // Process and enhance response
            const processedResponse = await this.processDialogflowResponse(response, sessionId, context);
            
            // Update session tracking
            this.updateSession(sessionId, {
                lastActivity: Date.now(),
                context: context,
                lastIntent: response.queryResult?.intent?.displayName
            });
            
            return processedResponse;
            
        } catch (error) {
            console.error('Conversation processing failed:', error);
            throw error;
        }
    }

    async processDialogflowResponse(response, sessionId, context) {
        const queryResult = response.queryResult;
        
        // Base response structure
        const processedResponse = {
            sessionId: sessionId,
            responseId: response.responseId,
            text: queryResult.responseMessages?.[0]?.text?.text?.[0] || '',
            intent: queryResult.intent?.displayName,
            confidence: queryResult.intentDetectionConfidence,
            parameters: queryResult.parameters,
            fulfillmentText: queryResult.responseMessages?.[0]?.text?.text?.[0] || '',
            webhookStatus: queryResult.webhookStatuses?.[0]?.message || null,
            conversationFlow: this.identifyConversationFlow(queryResult.intent?.displayName),
            eyewearContext: this.extractEyewearContext(queryResult.parameters, context)
        };
        
        // Handle rich responses for eyewear domain
        if (queryResult.responseMessages) {
            processedResponse.richResponses = await this.processRichResponses(
                queryResult.responseMessages,
                context
            );
        }
        
        // Add ML integration hooks
        if (this.shouldTriggerMLRecommendation(queryResult.intent?.displayName)) {
            processedResponse.mlRecommendation = await this.triggerMLRecommendation(
                queryResult.parameters,
                context
            );
        }
        
        // Add visual analysis hooks
        if (this.shouldTriggerVisualAnalysis(queryResult.intent?.displayName)) {
            processedResponse.visualAnalysis = await this.triggerVisualAnalysis(
                queryResult.parameters,
                context
            );
        }
        
        return processedResponse;
    }

    identifyConversationFlow(intentName) {
        if (!intentName) return null;
        
        const intentLower = intentName.toLowerCase();
        
        if (intentLower.includes('style') || intentLower.includes('recommendation')) {
            return this.conversationFlows.styleRecommendation;
        }
        if (intentLower.includes('frame') || intentLower.includes('finder')) {
            return this.conversationFlows.frameFinder;
        }
        if (intentLower.includes('fit') || intentLower.includes('consultation')) {
            return this.conversationFlows.fitConsultation;
        }
        if (intentLower.includes('tryon') || intentLower.includes('virtual')) {
            return this.conversationFlows.virtualTryon;
        }
        if (intentLower.includes('cart')) {
            return this.conversationFlows.cartManagement;
        }
        if (intentLower.includes('visual') || intentLower.includes('analysis')) {
            return this.conversationFlows.visualAnalysis;
        }
        
        return null;
    }

    extractEyewearContext(parameters, userContext) {
        const eyewearContext = {
            faceShape: parameters?.faceShape || userContext.faceShape,
            stylePreference: parameters?.stylePreference || userContext.stylePreference,
            frameType: parameters?.frameType || userContext.frameType,
            budget: parameters?.budget || userContext.budget,
            prescription: parameters?.prescription || userContext.prescription,
            lifestyle: parameters?.lifestyle || userContext.lifestyle,
            colorPreference: parameters?.colorPreference || userContext.colorPreference,
            brandPreference: parameters?.brandPreference || userContext.brandPreference
        };
        
        // Remove null/undefined values
        return Object.fromEntries(
            Object.entries(eyewearContext).filter(([_, value]) => value != null)
        );
    }

    async processRichResponses(responseMessages, context) {
        const richResponses = [];
        
        for (const message of responseMessages) {
            if (message.payload) {
                // Handle custom payloads for eyewear recommendations
                const payload = message.payload;
                
                if (payload.productRecommendations) {
                    richResponses.push({
                        type: 'product_recommendations',
                        data: payload.productRecommendations
                    });
                }
                
                if (payload.visualAnalysisResults) {
                    richResponses.push({
                        type: 'visual_analysis',
                        data: payload.visualAnalysisResults
                    });
                }
                
                if (payload.virtualTryonOptions) {
                    richResponses.push({
                        type: 'virtual_tryon',
                        data: payload.virtualTryonOptions
                    });
                }
            }
        }
        
        return richResponses;
    }

    shouldTriggerMLRecommendation(intentName) {
        if (!intentName) return false;
        
        const mlTriggerIntents = [
            'style.recommendation',
            'frame.finder',
            'fit.consultation',
            'recommendation.style',
            'recommendation.frame'
        ];
        
        return mlTriggerIntents.some(trigger => 
            intentName.toLowerCase().includes(trigger.toLowerCase())
        );
    }

    shouldTriggerVisualAnalysis(intentName) {
        if (!intentName) return false;
        
        const visualTriggerIntents = [
            'visual.analysis',
            'face.analysis',
            'virtual.tryon',
            'fit.consultation'
        ];
        
        return visualTriggerIntents.some(trigger => 
            intentName.toLowerCase().includes(trigger.toLowerCase())
        );
    }

    async triggerMLRecommendation(parameters, context) {
        // Placeholder for ML integration
        // This would integrate with the existing ML platform
        return {
            triggered: true,
            type: 'ml_recommendation',
            parameters: parameters,
            context: context,
            timestamp: new Date().toISOString()
        };
    }

    async triggerVisualAnalysis(parameters, context) {
        // Placeholder for visual analysis integration
        // This would integrate with the existing visual AI services
        return {
            triggered: true,
            type: 'visual_analysis',
            parameters: parameters,
            context: context,
            timestamp: new Date().toISOString()
        };
    }

    convertContextToParameters(context) {
        // Convert user context to Dialogflow parameters format
        const parameters = {};
        
        Object.entries(context).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                parameters[key] = value;
            }
        });
        
        return parameters;
    }

    updateSession(sessionId, sessionData) {
        this.activeSessions.set(sessionId, {
            ...this.activeSessions.get(sessionId),
            ...sessionData
        });
    }

    getSession(sessionId) {
        return this.activeSessions.get(sessionId);
    }

    startSessionCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [sessionId, session] of this.activeSessions.entries()) {
                if (now - session.lastActivity > this.sessionTimeout) {
                    this.activeSessions.delete(sessionId);
                    console.log(`Cleaned up expired session: ${sessionId}`);
                }
            }
        }, 5 * 60 * 1000); // Check every 5 minutes
    }

    async getConversationHistory(sessionId) {
        // This would integrate with conversation history storage
        // For now, return basic session info
        const session = this.getSession(sessionId);
        return session ? [session] : [];
    }

    async exportConversationFlows() {
        // Export current conversation flows for backup/migration
        return {
            flows: this.conversationFlows,
            intents: this.eyewearIntents,
            timestamp: new Date().toISOString()
        };
    }

    async healthCheck() {
        try {
            if (!this.initialized) {
                return { status: 'unhealthy', reason: 'Service not initialized' };
            }
            
            await this.testConnection();
            
            return {
                status: 'healthy',
                projectId: this.projectId,
                agentId: this.agentId,
                activeSessions: this.activeSessions.size,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            return {
                status: 'unhealthy',
                reason: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}