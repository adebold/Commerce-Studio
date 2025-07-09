/**
 * Consultation Dialogflow Service
 * Enhanced Dialogflow CX service specifically for intelligent eyewear consultation
 * Extends the UnifiedDialogflowService with consultation-specific flows and intents
 */

import UnifiedDialogflowService from './unified-dialogflow-service.js';
import { v4 as uuidv4 } from 'uuid';

export default class ConsultationDialogflowService extends UnifiedDialogflowService {
    constructor(config = {}) {
        super(config);
        
        // Enhanced conversation flows for consultation
        this.consultationFlows = {
            greeting: 'consultation_greeting_flow',
            needsAssessment: 'needs_assessment_flow',
            styleDiscovery: 'style_discovery_flow',
            faceAnalysis: 'face_analysis_flow',
            virtualTryOn: 'virtual_tryon_flow',
            recommendation: 'recommendation_flow',
            storeLocator: 'store_locator_flow',
            reservation: 'reservation_flow',
            followUp: 'follow_up_flow'
        };
        
        // Consultation-specific intents
        this.consultationIntents = {
            // Greeting and initial engagement
            'consultation.start': 'Start consultation',
            'consultation.greeting': 'Greeting response',
            'consultation.help': 'General help request',
            
            // Needs assessment
            'needs.prescription': 'Prescription needs',
            'needs.lifestyle': 'Lifestyle assessment',
            'needs.budget': 'Budget discussion',
            'needs.style_preference': 'Style preferences',
            'needs.occasion': 'Usage occasion',
            
            // Style discovery
            'style.explore': 'Explore styles',
            'style.recommendation': 'Style recommendations',
            'style.comparison': 'Compare styles',
            'style.feedback': 'Style feedback',
            
            // Face analysis and fitting
            'face.analysis_request': 'Request face analysis',
            'face.shape_discussion': 'Discuss face shape',
            'face.measurement': 'Face measurements',
            'fitting.consultation': 'Fitting consultation',
            
            // Virtual try-on
            'vto.start': 'Start virtual try-on',
            'vto.camera_permission': 'Camera permission',
            'vto.feedback': 'VTO feedback',
            'vto.comparison': 'Compare try-ons',
            
            // Recommendations and selection
            'recommendation.request': 'Request recommendations',
            'recommendation.refine': 'Refine recommendations',
            'recommendation.selection': 'Make selection',
            
            // Store and purchase
            'store.locate': 'Find stores',
            'store.inventory': 'Check inventory',
            'reservation.create': 'Create reservation',
            'purchase.intent': 'Purchase intent',
            
            // Follow-up and support
            'followup.schedule': 'Schedule follow-up',
            'support.contact': 'Contact support',
            'consultation.end': 'End consultation'
        };
        
        // Consultation context tracking
        this.consultationContext = new Map();
        
        // Consultation stages
        this.consultationStages = {
            GREETING: 'greeting',
            NEEDS_ASSESSMENT: 'needs_assessment',
            STYLE_DISCOVERY: 'style_discovery',
            FACE_ANALYSIS: 'face_analysis',
            VIRTUAL_TRYON: 'virtual_tryon',
            RECOMMENDATIONS: 'recommendations',
            SELECTION: 'selection',
            STORE_LOCATOR: 'store_locator',
            RESERVATION: 'reservation',
            COMPLETION: 'completion'
        };
    }

    async initialize() {
        await super.initialize();
        console.log('Consultation Dialogflow Service initialized with enhanced flows');
    }

    async startConsultation(sessionId = null, userContext = {}) {
        try {
            if (!sessionId) {
                sessionId = uuidv4();
            }
            
            // Initialize consultation context
            this.initializeConsultationContext(sessionId, userContext);
            
            // Send greeting message to start consultation
            const greetingResponse = await this.processConsultationMessage(
                "Hi, I'm looking for new glasses",
                sessionId,
                { stage: this.consultationStages.GREETING }
            );
            
            return {
                sessionId,
                response: greetingResponse,
                stage: this.consultationStages.GREETING,
                nextActions: this.getNextActions(this.consultationStages.GREETING)
            };
            
        } catch (error) {
            console.error('Error starting consultation:', error);
            throw error;
        }
    }

    async processConsultationMessage(message, sessionId, context = {}) {
        try {
            // Get current consultation context
            const consultationCtx = this.getConsultationContext(sessionId);
            const enhancedContext = { ...consultationCtx, ...context };
            
            // Process message through Dialogflow
            const response = await this.processConversation(message, sessionId, enhancedContext);
            
            // Enhance response with consultation-specific processing
            const consultationResponse = await this.enhanceConsultationResponse(
                response, 
                sessionId, 
                enhancedContext
            );
            
            // Update consultation context
            this.updateConsultationContext(sessionId, consultationResponse);
            
            return consultationResponse;
            
        } catch (error) {
            console.error('Error processing consultation message:', error);
            return this.getErrorResponse(error, sessionId);
        }
    }

    async enhanceConsultationResponse(response, sessionId, context) {
        const enhanced = { ...response };
        const intent = response.intent;
        
        // Add consultation-specific enhancements based on intent
        if (this.isNeedsAssessmentIntent(intent)) {
            enhanced.consultationData = await this.processNeedsAssessment(response, context);
            enhanced.stage = this.consultationStages.NEEDS_ASSESSMENT;
        }
        
        if (this.isStyleDiscoveryIntent(intent)) {
            enhanced.consultationData = await this.processStyleDiscovery(response, context);
            enhanced.stage = this.consultationStages.STYLE_DISCOVERY;
        }
        
        if (this.isFaceAnalysisIntent(intent)) {
            enhanced.consultationData = await this.processFaceAnalysisRequest(response, context);
            enhanced.stage = this.consultationStages.FACE_ANALYSIS;
        }
        
        if (this.isVirtualTryOnIntent(intent)) {
            enhanced.consultationData = await this.processVirtualTryOnRequest(response, context);
            enhanced.stage = this.consultationStages.VIRTUAL_TRYON;
        }
        
        if (this.isRecommendationIntent(intent)) {
            enhanced.consultationData = await this.processRecommendationRequest(response, context);
            enhanced.stage = this.consultationStages.RECOMMENDATIONS;
        }
        
        if (this.isStoreLocatorIntent(intent)) {
            enhanced.consultationData = await this.processStoreLocatorRequest(response, context);
            enhanced.stage = this.consultationStages.STORE_LOCATOR;
        }
        
        // Add next actions and quick replies
        enhanced.nextActions = this.getNextActions(enhanced.stage, context);
        enhanced.quickReplies = this.getQuickReplies(enhanced.stage, context);
        
        return enhanced;
    }

    async processNeedsAssessment(response, context) {
        const parameters = response.parameters || {};
        
        return {
            type: 'needs_assessment',
            collectedData: {
                prescription: parameters.prescription || context.prescription,
                lifestyle: parameters.lifestyle || context.lifestyle,
                budget: parameters.budget || context.budget,
                stylePreference: parameters.stylePreference || context.stylePreference,
                occasion: parameters.occasion || context.occasion
            },
            completionPercentage: this.calculateNeedsAssessmentCompletion(parameters, context),
            nextQuestion: this.getNextNeedsQuestion(parameters, context)
        };
    }

    async processStyleDiscovery(response, context) {
        const parameters = response.parameters || {};
        
        return {
            type: 'style_discovery',
            stylePreferences: {
                frameShape: parameters.frameShape || context.frameShape,
                frameType: parameters.frameType || context.frameType,
                material: parameters.material || context.material,
                color: parameters.color || context.color
            },
            suggestedStyles: await this.getSuggestedStyles(parameters, context),
            styleQuiz: this.getStyleQuizQuestion(context)
        };
    }

    async processFaceAnalysisRequest(response, context) {
        return {
            type: 'face_analysis_request',
            cameraRequired: true,
            analysisSteps: [
                'Position your face in the camera frame',
                'Ensure good lighting',
                'Look directly at the camera',
                'Keep your face still for analysis'
            ],
            expectedResults: [
                'Face shape identification',
                'Facial measurements',
                'Frame size recommendations',
                'Style compatibility scores'
            ]
        };
    }

    async processVirtualTryOnRequest(response, context) {
        const parameters = response.parameters || {};
        
        return {
            type: 'virtual_tryon_request',
            frameId: parameters.frameId || context.selectedFrameId,
            cameraRequired: true,
            instructions: [
                'Allow camera access',
                'Position your face in the frame',
                'Try different angles',
                'Compare multiple frames'
            ],
            features: [
                'Real-time frame overlay',
                'Multiple frame comparison',
                'Photo capture',
                'Share with friends'
            ]
        };
    }

    async processRecommendationRequest(response, context) {
        const consultationCtx = this.getConsultationContext(response.sessionId);
        
        return {
            type: 'recommendation_request',
            criteria: {
                faceShape: consultationCtx.faceShape || context.faceShape,
                stylePreference: consultationCtx.stylePreference || context.stylePreference,
                budget: consultationCtx.budget || context.budget,
                lifestyle: consultationCtx.lifestyle || context.lifestyle
            },
            recommendationTypes: [
                'Best overall match',
                'Budget-friendly options',
                'Premium selections',
                'Trending styles'
            ],
            personalizationLevel: this.calculatePersonalizationLevel(consultationCtx)
        };
    }

    async processStoreLocatorRequest(response, context) {
        const parameters = response.parameters || {};
        
        return {
            type: 'store_locator_request',
            location: parameters.location || context.location,
            selectedFrames: context.selectedFrames || [],
            services: [
                'Frame fitting',
                'Eye exams',
                'Prescription services',
                'Repairs and adjustments'
            ],
            searchRadius: parameters.radius || 25
        };
    }

    // Helper methods for intent classification
    isNeedsAssessmentIntent(intent) {
        return intent && intent.toLowerCase().includes('needs');
    }

    isStyleDiscoveryIntent(intent) {
        return intent && (intent.toLowerCase().includes('style') || intent.toLowerCase().includes('explore'));
    }

    isFaceAnalysisIntent(intent) {
        return intent && (intent.toLowerCase().includes('face') || intent.toLowerCase().includes('analysis'));
    }

    isVirtualTryOnIntent(intent) {
        return intent && (intent.toLowerCase().includes('tryon') || intent.toLowerCase().includes('virtual'));
    }

    isRecommendationIntent(intent) {
        return intent && intent.toLowerCase().includes('recommendation');
    }

    isStoreLocatorIntent(intent) {
        return intent && (intent.toLowerCase().includes('store') || intent.toLowerCase().includes('location'));
    }

    // Consultation context management
    initializeConsultationContext(sessionId, userContext) {
        this.consultationContext.set(sessionId, {
            startTime: Date.now(),
            stage: this.consultationStages.GREETING,
            userContext: userContext,
            collectedData: {},
            interactions: [],
            preferences: {},
            recommendations: [],
            selectedFrames: []
        });
    }

    getConsultationContext(sessionId) {
        return this.consultationContext.get(sessionId) || {};
    }

    updateConsultationContext(sessionId, responseData) {
        const context = this.getConsultationContext(sessionId);
        const updated = {
            ...context,
            lastUpdate: Date.now(),
            stage: responseData.stage || context.stage,
            interactions: [...(context.interactions || []), {
                timestamp: Date.now(),
                intent: responseData.intent,
                confidence: responseData.confidence,
                parameters: responseData.parameters
            }]
        };

        if (responseData.consultationData) {
            updated.collectedData = {
                ...updated.collectedData,
                ...responseData.consultationData.collectedData
            };
        }

        this.consultationContext.set(sessionId, updated);
    }

    // Next actions and quick replies
    getNextActions(stage, context = {}) {
        const actions = {
            [this.consultationStages.GREETING]: [
                { text: "Tell me about your needs", action: "needs_assessment" },
                { text: "Explore frame styles", action: "style_discovery" },
                { text: "Start virtual try-on", action: "virtual_tryon" }
            ],
            [this.consultationStages.NEEDS_ASSESSMENT]: [
                { text: "Analyze my face shape", action: "face_analysis" },
                { text: "Show me recommendations", action: "recommendations" },
                { text: "Browse styles", action: "style_discovery" }
            ],
            [this.consultationStages.STYLE_DISCOVERY]: [
                { text: "Try on these frames", action: "virtual_tryon" },
                { text: "Get personalized recommendations", action: "recommendations" },
                { text: "Analyze my face", action: "face_analysis" }
            ],
            [this.consultationStages.FACE_ANALYSIS]: [
                { text: "See my recommendations", action: "recommendations" },
                { text: "Try on frames", action: "virtual_tryon" },
                { text: "Find nearby stores", action: "store_locator" }
            ],
            [this.consultationStages.VIRTUAL_TRYON]: [
                { text: "Get more recommendations", action: "recommendations" },
                { text: "Find stores near me", action: "store_locator" },
                { text: "Compare more frames", action: "style_discovery" }
            ],
            [this.consultationStages.RECOMMENDATIONS]: [
                { text: "Try these on virtually", action: "virtual_tryon" },
                { text: "Find stores with these frames", action: "store_locator" },
                { text: "Refine my preferences", action: "needs_assessment" }
            ],
            [this.consultationStages.STORE_LOCATOR]: [
                { text: "Reserve for pickup", action: "reservation" },
                { text: "Get directions", action: "directions" },
                { text: "Call the store", action: "contact_store" }
            ]
        };

        return actions[stage] || [];
    }

    getQuickReplies(stage, context = {}) {
        const replies = {
            [this.consultationStages.GREETING]: [
                "I need reading glasses",
                "I want stylish frames",
                "Help me find the right fit",
                "Show me what's trending"
            ],
            [this.consultationStages.NEEDS_ASSESSMENT]: [
                "For everyday wear",
                "For work/professional",
                "For special occasions",
                "I have a prescription"
            ],
            [this.consultationStages.STYLE_DISCOVERY]: [
                "Classic styles",
                "Modern/trendy",
                "Bold statement",
                "Subtle/minimal"
            ]
        };

        return replies[stage] || [];
    }

    // Utility methods
    calculateNeedsAssessmentCompletion(parameters, context) {
        const requiredFields = ['prescription', 'lifestyle', 'budget', 'stylePreference'];
        const completedFields = requiredFields.filter(field => 
            parameters[field] || context[field]
        );
        return (completedFields.length / requiredFields.length) * 100;
    }

    getNextNeedsQuestion(parameters, context) {
        if (!parameters.prescription && !context.prescription) {
            return "Do you need prescription lenses or are you looking for non-prescription frames?";
        }
        if (!parameters.lifestyle && !context.lifestyle) {
            return "What's your lifestyle like? Are you active, work in an office, or spend time outdoors?";
        }
        if (!parameters.budget && !context.budget) {
            return "What's your budget range for new frames?";
        }
        if (!parameters.stylePreference && !context.stylePreference) {
            return "What style appeals to you most - classic, modern, bold, or subtle?";
        }
        return null;
    }

    async getSuggestedStyles(parameters, context) {
        // This would integrate with the recommendation engine
        return [
            { style: 'rectangular', confidence: 0.9, reason: 'Complements your face shape' },
            { style: 'round', confidence: 0.7, reason: 'Trendy and versatile' },
            { style: 'cat-eye', confidence: 0.8, reason: 'Adds sophistication' }
        ];
    }

    getStyleQuizQuestion(context) {
        const questions = [
            "Which celebrity's style do you admire most?",
            "What's your go-to outfit for a night out?",
            "How would friends describe your style?",
            "What's most important: comfort, style, or durability?"
        ];
        
        return questions[Math.floor(Math.random() * questions.length)];
    }

    calculatePersonalizationLevel(context) {
        const dataPoints = Object.keys(context.collectedData || {}).length;
        const interactions = (context.interactions || []).length;
        return Math.min(100, (dataPoints * 20) + (interactions * 5));
    }

    getErrorResponse(error, sessionId) {
        return {
            sessionId,
            text: "I apologize, but I'm having trouble processing your request. Let me help you in a different way.",
            intent: 'error.fallback',
            confidence: 0.0,
            error: true,
            nextActions: [
                { text: "Start over", action: "restart_consultation" },
                { text: "Browse frames", action: "browse_products" },
                { text: "Contact support", action: "contact_support" }
            ]
        };
    }

    async exportConsultationData(sessionId) {
        const context = this.getConsultationContext(sessionId);
        return {
            sessionId,
            duration: Date.now() - context.startTime,
            stage: context.stage,
            collectedData: context.collectedData,
            interactions: context.interactions,
            recommendations: context.recommendations,
            selectedFrames: context.selectedFrames,
            completionStatus: this.getCompletionStatus(context)
        };
    }

    getCompletionStatus(context) {
        const stages = Object.values(this.consultationStages);
        const currentStageIndex = stages.indexOf(context.stage);
        return {
            currentStage: context.stage,
            progress: ((currentStageIndex + 1) / stages.length) * 100,
            completed: context.stage === this.consultationStages.COMPLETION
        };
    }
}