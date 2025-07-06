/**
 * @fileoverview Analytics engine that generates insights from combined data sources.
 *
 * @version 1.0.0
 * @author AI Agent - Unified Data Infrastructure
 * @copyright 2025 Commerce Studio
 */

import { MockDataStore } from './mock-data-store.js';

/**
 * @class SharedInsightsEngine
 * @description Analyzes unified interaction data to generate cross-modal insights.
 */
class SharedInsightsEngine {
    /**
     * @constructor
     */
    constructor() {
        // In a real application, these would be connections to analytical databases or data warehouses.
        this.eventStore = new MockDataStore('unified_interaction_events');
        this.profileStore = new MockDataStore('unified_user_profiles');
    }

    /**
     * Analyzes a user's complete journey across all interaction modalities.
     * @param {string} userId - The ID of the user to analyze.
     * @returns {Promise<object>} An object containing the user journey analysis.
     */
    async analyzeUserJourney(userId) {
        const profile = await this.profileStore.get(userId);
        if (!profile) {
            return { error: true, message: 'User profile not found.' };
        }

        const userEvents = await this.eventStore.find({ userId });

        if (!userEvents || userEvents.length === 0) {
            return { error: true, message: 'No interaction events found for this user.' };
        }

        const journey = userEvents
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map(event => ({
                timestamp: event.timestamp,
                modality: event.modality,
                type: event.modality === 'avatar_chat' ? event.eventData.intent : event.eventData.eventType,
                details: event.modality === 'click_stream' ? event.eventData.elementDetails.pageUrl : event.eventData.message,
            }));

        return {
            userId,
            totalInteractions: journey.length,
            firstInteraction: journey[0].timestamp,
            lastInteraction: journey[journey.length - 1].timestamp,
            modalitiesUsed: [...new Set(journey.map(j => j.modality))],
            fullJourney: journey,
        };
    }

    /**
     * Calculates conversion attribution across different modalities.
     * @param {string} orderId - The ID of the order to attribute.
     * @param {string} userId - The ID of the user who made the purchase.
     * @param {number} lookbackWindowDays - The number of days to look back for influential interactions.
     * @returns {Promise<object>} An attribution analysis object.
     */
    async getConversionAttribution(orderId, userId, lookbackWindowDays = 7) {
        const userEvents = await this.eventStore.find({ userId });
        if (!userEvents || userEvents.length === 0) {
            return { orderId, attribution: 'unattributed', reason: 'No user events found.' };
        }

        const lookbackDate = new Date(Date.now() - lookbackWindowDays * 24 * 60 * 60 * 1000);

        const influentialEvents = userEvents
            .filter(event => new Date(event.timestamp) > lookbackDate)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (influentialEvents.length === 0) {
            return { orderId, attribution: 'unattributed', reason: 'No recent influential events.' };
        }

        const lastTouchpoint = influentialEvents[0].modality;
        const influencedBy = [...new Set(influentialEvents.map(e => e.modality))];

        return {
            orderId,
            userId,
            attribution: {
                lastTouchpoint,
                influencedBy,
                interactionCount: influentialEvents.length,
            },
        };
    }

    /**
     * Generates data feeds for a unified analytics dashboard.
     * @returns {Promise<object>} An object containing data for various dashboard widgets.
     */
    async getDashboardFeeds() {
        const allEvents = await this.eventStore.findAll();
        const totalInteractions = allEvents.length;
        const interactionsByModality = allEvents.reduce((acc, event) => {
            acc[event.modality] = (acc[event.modality] || 0) + 1;
            return acc;
        }, {});

        const allProfiles = await this.profileStore.findAll();
        const totalProfiles = allProfiles.length;
        const avgLearnedPrefs = allProfiles.reduce((acc, profile) => {
            const prefs = profile.preferences.learnedPreferences;
            if (prefs.preferredStyles) {
                acc.styles = (acc.styles || 0) + prefs.preferredStyles.length;
            }
            return acc;
        }, { styles: 0 });


        return {
            summary: {
                totalInteractions,
                totalProfiles,
                interactionsByModality,
            },
            trends: {
                // In a real system, this would be a time-series aggregation.
                interactionsOverTime: [{ date: '2025-07-01', count: totalInteractions }],
            },
            userProfileInsights: {
                averageLearnedPreferences: {
                    styles: totalProfiles > 0 ? avgLearnedPrefs.styles / totalProfiles : 0,
                },
            },
        };
    }

    /**
     * Health check for the insights engine.
     * @returns {object} Health status.
     */
    healthCheck() {
        const eventStoreHealth = this.eventStore.healthCheck();
        const profileStoreHealth = this.profileStore.healthCheck();
        const isOk = eventStoreHealth.status === 'ok' && profileStoreHealth.status === 'ok';

        return {
            status: isOk ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            dependencies: {
                eventStore: eventStoreHealth,
                profileStore: profileStoreHealth,
            },
        };
    }
}

// This mock would be replaced by a proper data store client.
class MockDataStore {
    constructor(namespace) {
        this.namespace = namespace;
        this.store = {};
    }
    async get(key) { return this.store[key] || null; }
    async set(key, value) { this.store[key] = value; }
    async find(query) {
        return Object.values(this.store).filter(item =>
            Object.keys(query).every(key => item[key] === query[key])
        );
    }
    async findAll() { return Object.values(this.store); }
    healthCheck() { return { status: 'ok' }; }
}


export default new SharedInsightsEngine();