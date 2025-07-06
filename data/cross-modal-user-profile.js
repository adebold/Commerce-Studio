/**
 * @fileoverview Unified user profile system that learns from both
 * conversation and click interactions.
 *
 * @version 1.0.0
 * @author AI Agent - Unified Data Infrastructure
 * @copyright 2025 Commerce Studio
 */

import { v4 as uuidv4 } from 'uuid';
// In a real application, this would be a robust database client (e.g., MongoDB, DynamoDB).
import { MockDataStore } from './mock-data-store.js';

/**
 * @class CrossModalUserProfile
 * @description Manages the creation and updating of unified user profiles from cross-modal interaction data.
 */
class CrossModalUserProfile {
    /**
     * @constructor
     */
    constructor() {
        this.profileStore = new MockDataStore('unified_user_profiles');
    }

    /**
     * Retrieves or creates a user profile.
     * @param {string} userId - The user's unique identifier.
     * @returns {Promise<object>} The user profile.
     * @private
     */
    async _getOrCreateProfile(userId) {
        let profile = await this.profileStore.get(userId);
        if (!profile) {
            profile = {
                userId,
                profileId: uuidv4(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                preferences: {
                    clickStreamPreferences: {},
                    conversationPreferences: {},
                    learnedPreferences: {},
                },
                attributes: {
                    faceAnalysis: null,
                    purchaseHistory: [],
                },
            };
        }
        return profile;
    }

    /**
     * Processes a unified interaction event to update a user's profile.
     * @param {object} unifiedEvent - The unified interaction event.
     * @returns {Promise<void>}
     */
    async processInteractionEvent(unifiedEvent) {
        if (!unifiedEvent || !unifiedEvent.userId) {
            console.error('Invalid event received for profile processing.');
            return;
        }

        const { userId, modality, eventData } = unifiedEvent;
        const profile = await this._getOrCreateProfile(userId);

        // Update profile based on interaction modality
        if (modality === 'click_stream') {
            this._updateFromClickStream(profile, eventData);
        } else if (modality === 'avatar_chat') {
            this._updateFromAvatarChat(profile, eventData);
        }

        // Reconcile preferences
        this._updateLearnedPreferences(profile);

        profile.updatedAt = new Date().toISOString();
        await this.profileStore.set(userId, profile);
        console.log(`User profile for ${userId} updated.`);
    }

    /**
     * Updates the profile with data from a click-stream event.
     * @param {object} profile - The user profile.
     * @param {object} eventData - The click-stream event data.
     * @private
     */
    _updateFromClickStream(profile, eventData) {
        // This is a simplified example. A real implementation would involve more complex logic
        // to infer preferences from various click events (e.g., viewing product categories).
        if (eventData.eventType === 'click' && eventData.elementDetails.elementType === 'recommendation') {
            const prefs = profile.preferences.clickStreamPreferences;
            // Example: extract style from a clicked element's data attribute
            const style = eventData.elementDetails.elementId?.split('-')[1];
            if (style) {
                prefs.stylePreferences = [...new Set([...(prefs.stylePreferences || []), style])];
            }
        }
    }

    /**
     * Updates the profile with data from an avatar chat event.
     * @param {object} profile - The user profile.
     * @param {object} eventData - The avatar chat event data.
     * @private
     */
    _updateFromAvatarChat(profile, eventData) {
        const prefs = profile.preferences.conversationPreferences;
        if (eventData.intent === 'inform_preference' && eventData.entities) {
            if (eventData.entities.style) {
                prefs.mentionedStyles = [...new Set([...(prefs.mentionedStyles || []), ...eventData.entities.style])];
            }
            if (eventData.entities.brand) {
                prefs.mentionedBrands = [...new Set([...(prefs.mentionedBrands || []), ...eventData.entities.brand])];
            }
        }
    }

    /**
     * Updates the unified learned preferences by merging insights from all modalities.
     * @param {object} profile - The user profile to update.
     * @private
     */
    _updateLearnedPreferences(profile) {
        const { clickStreamPreferences, conversationPreferences } = profile.preferences;
        const learned = {};

        // Combine style preferences
        const allStyles = [
            ...(clickStreamPreferences.stylePreferences || []),
            ...(conversationPreferences.mentionedStyles || []),
        ];
        learned.preferredStyles = [...new Set(allStyles)];

        // Combine brand preferences
        const allBrands = [
            ...(clickStreamPreferences.brandPreferences || []),
            ...(conversationPreferences.mentionedBrands || []),
        ];
        learned.preferredBrands = [...new Set(allBrands)];

        profile.preferences.learnedPreferences = learned;
    }

    /**
     * Retrieves a user's unified profile.
     * @param {string} userId - The user's ID.
     * @returns {Promise<object|null>} The user profile or null if not found.
     */
    async getUserProfile(userId) {
        return await this.profileStore.get(userId);
    }

    /**
     * Health check for the user profile service.
     * @returns {object} Health status.
     */
    healthCheck() {
        const storeHealth = this.profileStore.healthCheck();
        return {
            status: storeHealth.status === 'ok' ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            dependencies: {
                profileStore: storeHealth,
            },
        };
    }
}

// Mock Data Store for demonstration purposes.
/**
 * @class MockDataStore
 * @description A mock data store for local development and testing.
 */
class MockDataStore {
    constructor(namespace) {
        this.namespace = namespace;
        this.store = {};
    }

    async get(key) {
        return this.store[key] || null;
    }

    async set(key, value) {
        this.store[key] = value;
    }

    healthCheck() {
        return { status: 'ok' };
    }
}


export default new CrossModalUserProfile();