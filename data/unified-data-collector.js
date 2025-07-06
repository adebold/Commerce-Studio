/**
 * @fileoverview Central data collection service that aggregates data from
 * both avatar chat and click-based AI recommendations.
 *
 * @version 1.0.0
 * @author AI Agent - Unified Data Infrastructure
 * @copyright 2025 Commerce Studio
 */

import { v4 as uuidv4 } from 'uuid';
// In a real application, this would be a robust event streaming client (e.g., Kafka, Kinesis, or Google Pub/Sub).
import { MockEventStream } from './mock-event-stream.js';
import { getPrivacySettings } from '../config/analytics/tracking-configuration.js';

/**
 * @class UnifiedDataCollector
 * @description A service to collect, transform, and dispatch user interaction data
 * from multiple modalities into a unified event stream.
 */
class UnifiedDataCollector {
    /**
     * @constructor
     */
    constructor() {
        this.eventStream = new MockEventStream();
        this.privacySettings = getPrivacySettings();
    }

    /**
     * Anonymizes a user ID based on privacy settings.
     * @param {string} userId - The original user ID.
     * @returns {string} The anonymized user ID.
     * @private
     */
    _anonymizeUserId(userId) {
        if (this.privacySettings.anonymizeUserIds && userId) {
            // This is a placeholder. Use a secure, consistent hashing mechanism in production.
            return `anon_${Buffer.from(userId).toString('base64')}`;
        }
        return userId;
    }

    /**
     * Creates a standardized event structure.
     * @param {string} sessionId - The session identifier.
     * @param {string} userId - The user identifier.
     * @param {string} modality - The interaction modality ('click_stream' or 'avatar_chat').
     * @param {object} source - The source platform details.
     * @param {object} eventData - The modality-specific event payload.
     * @returns {object} The unified interaction event.
     * @private
     */
    _createUnifiedEvent(sessionId, userId, modality, source, eventData) {
        if (!sessionId || !modality || !source || !eventData) {
            throw new Error('Missing required parameters for unified event creation.');
        }

        return {
            eventId: uuidv4(),
            sessionId,
            userId: this._anonymizeUserId(userId),
            timestamp: new Date().toISOString(),
            modality,
            source: {
                platform: source.platform,
                storeId: source.storeId,
            },
            eventData,
        };
    }

    /**
     * Collects and transforms a click-stream event.
     * @param {string} sessionId - The session ID.
     * @param {string} userId - The user ID.
     * @param {object} source - Details of the source platform (e.g., { platform: 'shopify', storeId: 'store123' }).
     * @param {object} clickEventData - The raw click-stream event data.
     * @returns {Promise<void>}
     */
    async collectClickStreamEvent(sessionId, userId, source, clickEventData) {
        try {
            const transformedData = {
                eventType: clickEventData.type,
                elementDetails: {
                    elementId: clickEventData.element.id,
                    elementType: clickEventData.element.tagName,
                    pageUrl: window.location.href,
                },
            };

            const unifiedEvent = this._createUnifiedEvent(sessionId, userId, 'click_stream', source, transformedData);
            await this.eventStream.publish('unified-interaction-events', unifiedEvent);
            console.log('Click-stream event collected:', unifiedEvent.eventId);
        } catch (error) {
            console.error('Failed to collect click-stream event:', error);
            // In a production system, add to a dead-letter queue for reprocessing.
        }
    }

    /**
     * Collects and transforms an avatar chat event.
     * @param {string} sessionId - The session ID.
     * @param {string} userId - The user ID.
     * @param {object} source - Details of the source platform.
     * @param {object} chatEventData - The raw chat event data.
     * @returns {Promise<void>}
     */
    async collectAvatarChatEvent(sessionId, userId, source, chatEventData) {
        try {
            const transformedData = {
                turnNumber: chatEventData.turn,
                speaker: chatEventData.speaker,
                message: chatEventData.text,
                intent: chatEventData.analysis?.intent,
                entities: chatEventData.analysis?.entities,
            };

            const unifiedEvent = this._createUnifiedEvent(sessionId, userId, 'avatar_chat', source, transformedData);
            await this.eventStream.publish('unified-interaction-events', unifiedEvent);
            console.log('Avatar chat event collected:', unifiedEvent.eventId);
        } catch (error) {
            console.error('Failed to collect avatar chat event:', error);
        }
    }

    /**
     * Provides a health check for the data collector service.
     * @returns {object} The health status of the service.
     */
    healthCheck() {
        const streamHealth = this.eventStream.healthCheck();
        return {
            status: streamHealth.status === 'ok' ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            dependencies: {
                eventStream: streamHealth,
            },
        };
    }
}

// Mock Event Stream for demonstration purposes.
// Replace with a real event stream client in a production environment.
/**
 * @class MockEventStream
 * @description A mock event stream for local development and testing.
 */
class MockEventStream {
    constructor() {
        this.topics = {};
    }

    async publish(topic, message) {
        if (!this.topics[topic]) {
            this.topics[topic] = [];
        }
        this.topics[topic].push(message);
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 50));
        return { success: true, messageId: uuidv4() };
    }

    healthCheck() {
        return { status: 'ok' };
    }
}


export default new UnifiedDataCollector();