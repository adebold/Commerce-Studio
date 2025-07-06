/**
 * @fileoverview Enhanced personalization service that uses data from
 * both interaction modalities.
 *
 * @version 1.0.0
 * @author AI Agent - Unified Data Infrastructure
 * @copyright 2025 Commerce Studio
 */

import CrossModalUserProfile from './cross-modal-user-profile.js';
// This would be the existing recommendation engine.
import RecommendationEngine from '../ai/recommendation-engine.js';
// This would be the existing avatar response generator.
import AvatarResponseGenerator from '../core/avatar-response-generator.js';

/**
 * @class UnifiedPersonalizationService
 * @description Delivers personalized experiences across different modalities using unified user profiles.
 */
class UnifiedPersonalizationService {
    /**
     * @constructor
     */
    constructor() {
        this.userProfileService = CrossModalUserProfile;
        this.recommendationEngine = RecommendationEngine;
        this.responseGenerator = AvatarResponseGenerator;
    }

    /**
     * Gets personalized recommendations for a user, enhanced with cross-modal insights.
     * @param {string} userId - The ID of the user.
     * @param {object} currentContext - The current interaction context (e.g., page, active conversation).
     * @returns {Promise<object[]>} A list of personalized product recommendations.
     */
    async getPersonalizedRecommendations(userId, currentContext) {
        const profile = await this.userProfileService.getUserProfile(userId);
        if (!profile) {
            // Fallback to non-personalized recommendations
            return this.recommendationEngine.getGenericRecommendations();
        }

        const learnedPrefs = profile.preferences.learnedPreferences;
        
        // Enhance the context with learned preferences from the unified profile
        const enhancedContext = {
            ...currentContext,
            userProfile: {
                preferredStyles: learnedPrefs.preferredStyles || [],
                preferredBrands: learnedPrefs.preferredBrands || [],
                faceShape: profile.attributes.faceAnalysis?.faceShape,
            },
        };

        // The recommendation engine can now use this richer context
        return this.recommendationEngine.getRecommendations(enhancedContext);
    }

    /**
     * Gets a personalized avatar response, adapted using the unified user profile.
     * @param {string} userId - The ID of the user.
     * @param {string} userInput - The latest user input to the avatar.
     * @param {string} conversationId - The ID of the current conversation.
     * @returns {Promise<object>} A personalized avatar response object.
     */
    async getPersonalizedAvatarResponse(userId, userInput, conversationId) {
        const profile = await this.userProfileService.getUserProfile(userId);
        
        let personalityContext = {};
        if (profile) {
            // Adapt avatar personality based on learned preferences
            const totalInteractions = profile.preferences.clickStreamPreferences.stylePreferences?.length || 0 + profile.preferences.conversationPreferences.mentionedStyles?.length || 0;
            personalityContext = {
                // Make the avatar more proactive if the user has shown significant engagement
                proactivity: totalInteractions > 5 ? 0.8 : 0.4,
                // Use a more casual tone if the user has expressed preferences for modern styles
                formality: profile.preferences.learnedPreferences.preferredStyles?.includes('modern') ? 0.2 : 0.6,
            };
        }

        // The response generator can use this context to tailor the response style and content
        return this.responseGenerator.generateResponse(userInput, conversationId, personalityContext);
    }

    /**
     * Provides a health check for the personalization service.
     * @returns {object} Health status.
     */
    healthCheck() {
        const profileHealth = this.userProfileService.healthCheck();
        const recoHealth = this.recommendationEngine.healthCheck();
        const avatarHealth = this.responseGenerator.healthCheck();
        
        const isOk = profileHealth.status === 'ok' && recoHealth.status === 'ok' && avatarHealth.status === 'ok';

        return {
            status: isOk ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            dependencies: {
                userProfileService: profileHealth,
                recommendationEngine: recoHealth,
                avatarResponseGenerator: avatarHealth,
            },
        };
    }
}

// Mock dependencies for demonstration.
// In a real system, these would be imported from their actual locations.
class MockRecommendationEngine {
    getGenericRecommendations() { return [{ id: 'prod_101', name: 'Generic Glasses' }]; }
    getRecommendations(context) {
        if (context.userProfile?.preferredStyles.includes('vintage')) {
            return [{ id: 'prod_202', name: 'Vintage Style Eyewear' }];
        }
        return [{ id: 'prod_303', name: 'Standard Recommendation' }];
    }
    healthCheck() { return { status: 'ok' }; }
}

class MockAvatarResponseGenerator {
    generateResponse(input, convoId, context) {
        let response = `Based on your input: "${input}"`;
        if (context.proactivity > 0.7) {
            response += " I'd also like to suggest...";
        }
        return { text: response };
    }
    healthCheck() { return { status: 'ok' }; }
}

// Replace mock instances with actual singletons
const service = new UnifiedPersonalizationService();
service.recommendationEngine = new MockRecommendationEngine();
service.responseGenerator = new MockAvatarResponseGenerator();

export default service;