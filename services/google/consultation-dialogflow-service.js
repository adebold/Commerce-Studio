import UnifiedDialogflowService from './unified-dialogflow-service.js';

class ConsultationDialogflowService extends UnifiedDialogflowService {
    constructor(config) {
        super(config);

        // Add consultation-specific conversation flows
        this.conversationFlows.greeting = 'greeting_flow';
        this.conversationFlows.needsAssessment = 'needs_assessment_flow';
        this.conversationFlows.styleDiscovery = 'style_discovery_flow';

        // Add consultation-specific intent mappings
        this.eyewearIntents['consultation.start'] = 'consultation.start';
        this.eyewearIntents['face.analysis_request'] = 'face.analysis_request';
    }

    // Override processDialogflowResponse to handle consultation-specific logic
    async processDialogflowResponse(response, sessionId, context) {
        const processedResponse = await super.processDialogflowResponse(response, sessionId, context);

        // Add consultation-specific logic here
        if (processedResponse.intent === 'consultation.start') {
            processedResponse.customData = {
                ...processedResponse.customData,
                consultationState: 'started',
            };
        }

        return processedResponse;
    }
}

export default ConsultationDialogflowService;