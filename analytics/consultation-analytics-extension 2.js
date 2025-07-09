/**
 * Consultation Analytics Extension
 * Extends the existing analytics platform with consultation-specific metrics
 * Integrates with ConversationAnalyticsEngine and BusinessIntelligenceService
 */

import ConversationAnalyticsEngine from './conversation-analytics-engine.js';
import BusinessIntelligenceService from './business-intelligence-service.js';
import RealTimeDashboardService from './real-time-dashboard-service.js';

export default class ConsultationAnalyticsExtension {
    constructor() {
        this.consultationMetrics = new Map();
        this.faceAnalysisMetrics = new Map();
        this.recommendationMetrics = new Map();
        this.storeLocatorMetrics = new Map();
        this.voiceInteractionMetrics = new Map();
        
        // Register consultation-specific event handlers
        this.registerEventHandlers();
    }

    registerEventHandlers() {
        // Listen for real-time events from the dashboard service
        RealTimeDashboardService.on = RealTimeDashboardService.on || function() {};
        
        // Set up consultation-specific alerting rules
        RealTimeDashboardService.alertingRules = {
            ...RealTimeDashboardService.alertingRules,
            lowFaceAnalysisAccuracy: 0.7, // Alert if face analysis accuracy drops below 70%
            lowRecommendationEngagement: 0.3, // Alert if recommendation engagement drops below 30%
            highVoiceProcessingTime: 5000, // Alert if voice processing takes more than 5 seconds
            lowStoreLocatorUsage: 0.1 // Alert if store locator usage drops below 10%
        };
    }

    // Consultation-specific tracking methods
    trackConsultationStart(sessionId, userData = {}) {
        const event = {
            sessionId,
            type: 'consultation_start',
            timestamp: Date.now(),
            userData: this.sanitizeUserData(userData),
            platform: userData.platform || 'web',
            entryPoint: userData.entryPoint || 'unknown'
        };

        this.consultationMetrics.set(sessionId, {
            ...event,
            stages: ['greeting'],
            currentStage: 'greeting',
            faceAnalysisCompleted: false,
            recommendationsGenerated: 0,
            voiceInteractions: 0,
            storeLocatorUsed: false,
            conversionEvents: []
        });

        // Send to existing analytics engine
        ConversationAnalyticsEngine.processRealTime(sessionId);
        
        // Push real-time event
        RealTimeDashboardService.pushEvent('consultation_start', {
            sessionId,
            platform: event.platform,
            entryPoint: event.entryPoint
        });

        return event;
    }

    trackStageTransition(sessionId, fromStage, toStage, metadata = {}) {
        const consultation = this.consultationMetrics.get(sessionId);
        if (!consultation) {
            console.warn(`No consultation found for session ${sessionId}`);
            return;
        }

        consultation.stages.push(toStage);
        consultation.currentStage = toStage;
        consultation.lastActivity = Date.now();

        const event = {
            sessionId,
            type: 'stage_transition',
            fromStage,
            toStage,
            timestamp: Date.now(),
            duration: this.calculateStageSpentTime(consultation, fromStage),
            metadata
        };

        // Update consultation metrics
        this.consultationMetrics.set(sessionId, consultation);

        // Push to real-time dashboard
        RealTimeDashboardService.pushEvent('stage_transition', {
            sessionId,
            fromStage,
            toStage,
            duration: event.duration
        });

        return event;
    }

    trackFaceAnalysis(sessionId, analysisData) {
        const consultation = this.consultationMetrics.get(sessionId);
        if (consultation) {
            consultation.faceAnalysisCompleted = true;
            consultation.faceAnalysisData = {
                faceShape: analysisData.faceShape,
                confidence: analysisData.confidence,
                processingTime: analysisData.processingTime
            };
        }

        const event = {
            sessionId,
            type: 'face_analysis',
            faceShape: analysisData.faceShape,
            confidence: analysisData.confidence,
            processingTime: analysisData.processingTime || 0,
            success: analysisData.success !== false,
            timestamp: Date.now()
        };

        // Store face analysis metrics
        if (!this.faceAnalysisMetrics.has(analysisData.faceShape)) {
            this.faceAnalysisMetrics.set(analysisData.faceShape, {
                count: 0,
                totalConfidence: 0,
                totalProcessingTime: 0,
                successRate: 0
            });
        }

        const metrics = this.faceAnalysisMetrics.get(analysisData.faceShape);
        metrics.count++;
        metrics.totalConfidence += analysisData.confidence || 0;
        metrics.totalProcessingTime += analysisData.processingTime || 0;
        metrics.successRate = (metrics.successRate * (metrics.count - 1) + (event.success ? 1 : 0)) / metrics.count;

        // Check for alerts
        if (analysisData.confidence < RealTimeDashboardService.alertingRules.lowFaceAnalysisAccuracy) {
            RealTimeDashboardService.sendAlert({
                type: 'low_face_analysis_accuracy',
                value: analysisData.confidence,
                threshold: RealTimeDashboardService.alertingRules.lowFaceAnalysisAccuracy,
                sessionId
            });
        }

        // Push real-time event
        RealTimeDashboardService.pushEvent('face_analysis', {
            sessionId,
            faceShape: analysisData.faceShape,
            confidence: analysisData.confidence,
            processingTime: analysisData.processingTime
        });

        return event;
    }

    trackRecommendation(sessionId, recommendationData) {
        const consultation = this.consultationMetrics.get(sessionId);
        if (consultation) {
            consultation.recommendationsGenerated++;
            consultation.lastRecommendations = consultation.lastRecommendations || [];
            consultation.lastRecommendations.push({
                frameId: recommendationData.frameId,
                confidence: recommendationData.confidence,
                reason: recommendationData.reason,
                timestamp: Date.now()
            });
        }

        const event = {
            sessionId,
            type: 'recommendation',
            frameId: recommendationData.frameId,
            confidence: recommendationData.confidence,
            reason: recommendationData.reason,
            rank: recommendationData.rank || 0,
            basedOnFaceShape: recommendationData.basedOnFaceShape || false,
            timestamp: Date.now()
        };

        // Store recommendation metrics
        const frameId = recommendationData.frameId;
        if (!this.recommendationMetrics.has(frameId)) {
            this.recommendationMetrics.set(frameId, {
                recommended: 0,
                selected: 0,
                avgConfidence: 0,
                totalConfidence: 0,
                conversionRate: 0
            });
        }

        const metrics = this.recommendationMetrics.get(frameId);
        metrics.recommended++;
        metrics.totalConfidence += recommendationData.confidence || 0;
        metrics.avgConfidence = metrics.totalConfidence / metrics.recommended;

        // Push real-time event
        RealTimeDashboardService.pushEvent('recommendation', {
            sessionId,
            frameId: recommendationData.frameId,
            confidence: recommendationData.confidence,
            rank: recommendationData.rank
        });

        return event;
    }

    trackVoiceInteraction(sessionId, voiceData) {
        const consultation = this.consultationMetrics.get(sessionId);
        if (consultation) {
            consultation.voiceInteractions++;
        }

        const event = {
            sessionId,
            type: 'voice_interaction',
            interactionType: voiceData.type, // 'speech_to_text', 'voice_command', etc.
            duration: voiceData.duration || 0,
            processingTime: voiceData.processingTime || 0,
            confidence: voiceData.confidence || 0,
            success: voiceData.success !== false,
            language: voiceData.language || 'en-US',
            timestamp: Date.now()
        };

        // Store voice metrics
        const voiceKey = `${voiceData.type}_${voiceData.language}`;
        if (!this.voiceInteractionMetrics.has(voiceKey)) {
            this.voiceInteractionMetrics.set(voiceKey, {
                count: 0,
                totalDuration: 0,
                totalProcessingTime: 0,
                avgConfidence: 0,
                successRate: 0
            });
        }

        const metrics = this.voiceInteractionMetrics.get(voiceKey);
        metrics.count++;
        metrics.totalDuration += voiceData.duration || 0;
        metrics.totalProcessingTime += voiceData.processingTime || 0;
        metrics.avgConfidence = (metrics.avgConfidence * (metrics.count - 1) + (voiceData.confidence || 0)) / metrics.count;
        metrics.successRate = (metrics.successRate * (metrics.count - 1) + (event.success ? 1 : 0)) / metrics.count;

        // Check for alerts
        if (voiceData.processingTime > RealTimeDashboardService.alertingRules.highVoiceProcessingTime) {
            RealTimeDashboardService.sendAlert({
                type: 'high_voice_processing_time',
                value: voiceData.processingTime,
                threshold: RealTimeDashboardService.alertingRules.highVoiceProcessingTime,
                sessionId
            });
        }

        // Push real-time event
        RealTimeDashboardService.pushEvent('voice_interaction', {
            sessionId,
            type: voiceData.type,
            duration: voiceData.duration,
            processingTime: voiceData.processingTime,
            confidence: voiceData.confidence
        });

        return event;
    }

    trackStoreLocatorUsage(sessionId, storeData) {
        const consultation = this.consultationMetrics.get(sessionId);
        if (consultation) {
            consultation.storeLocatorUsed = true;
            consultation.storeInteractions = consultation.storeInteractions || [];
            consultation.storeInteractions.push({
                action: storeData.action,
                storeId: storeData.storeId,
                timestamp: Date.now()
            });
        }

        const event = {
            sessionId,
            type: 'store_locator',
            action: storeData.action, // 'search', 'view_details', 'get_directions', 'reserve'
            storeId: storeData.storeId,
            location: storeData.location,
            selectedFrames: storeData.selectedFrames || [],
            timestamp: Date.now()
        };

        // Store location metrics
        const locationKey = storeData.location || 'unknown';
        if (!this.storeLocatorMetrics.has(locationKey)) {
            this.storeLocatorMetrics.set(locationKey, {
                searches: 0,
                viewDetails: 0,
                directions: 0,
                reservations: 0
            });
        }

        const metrics = this.storeLocatorMetrics.get(locationKey);
        switch (storeData.action) {
            case 'search': metrics.searches++; break;
            case 'view_details': metrics.viewDetails++; break;
            case 'get_directions': metrics.directions++; break;
            case 'reserve': metrics.reservations++; break;
        }

        // Push real-time event
        RealTimeDashboardService.pushEvent('store_locator', {
            sessionId,
            action: storeData.action,
            storeId: storeData.storeId,
            location: storeData.location
        });

        return event;
    }

    trackConversion(sessionId, conversionData) {
        const consultation = this.consultationMetrics.get(sessionId);
        if (consultation) {
            consultation.conversionEvents.push({
                type: conversionData.type,
                value: conversionData.value,
                frameId: conversionData.frameId,
                timestamp: Date.now()
            });
        }

        const event = {
            sessionId,
            type: 'conversion',
            conversionType: conversionData.type, // 'frame_selected', 'store_visit', 'reservation', 'purchase'
            value: conversionData.value || 0,
            frameId: conversionData.frameId,
            storeId: conversionData.storeId,
            timestamp: Date.now()
        };

        // Update recommendation conversion metrics
        if (conversionData.frameId && this.recommendationMetrics.has(conversionData.frameId)) {
            const metrics = this.recommendationMetrics.get(conversionData.frameId);
            metrics.selected++;
            metrics.conversionRate = metrics.recommended > 0 ? (metrics.selected / metrics.recommended) * 100 : 0;
        }

        // Send to business intelligence service for ROI calculation
        BusinessIntelligenceService.attributeSales({
            id: `conversion_${sessionId}_${Date.now()}`,
            sessionId,
            amount: conversionData.value || 0
        });

        // Push real-time event
        RealTimeDashboardService.pushEvent('conversion', {
            sessionId,
            type: conversionData.type,
            value: conversionData.value,
            frameId: conversionData.frameId
        });

        return event;
    }

    // Analytics query methods
    getConsultationMetrics(timeRange = '24h') {
        const since = this.getTimeRangeSince(timeRange);
        const consultations = Array.from(this.consultationMetrics.values())
            .filter(c => c.timestamp >= since);

        const totalConsultations = consultations.length;
        const completedConsultations = consultations.filter(c => c.conversionEvents.length > 0).length;
        const faceAnalysisUsage = consultations.filter(c => c.faceAnalysisCompleted).length;
        const voiceInteractionUsage = consultations.filter(c => c.voiceInteractions > 0).length;
        const storeLocatorUsage = consultations.filter(c => c.storeLocatorUsed).length;

        return {
            totalConsultations,
            completedConsultations,
            conversionRate: totalConsultations > 0 ? (completedConsultations / totalConsultations) * 100 : 0,
            faceAnalysisUsage: totalConsultations > 0 ? (faceAnalysisUsage / totalConsultations) * 100 : 0,
            voiceInteractionUsage: totalConsultations > 0 ? (voiceInteractionUsage / totalConsultations) * 100 : 0,
            storeLocatorUsage: totalConsultations > 0 ? (storeLocatorUsage / totalConsultations) * 100 : 0,
            averageRecommendationsPerConsultation: consultations.length > 0 ? 
                consultations.reduce((sum, c) => sum + c.recommendationsGenerated, 0) / consultations.length : 0
        };
    }

    getFaceAnalysisMetrics() {
        const metrics = {};
        this.faceAnalysisMetrics.forEach((data, faceShape) => {
            metrics[faceShape] = {
                count: data.count,
                avgConfidence: data.count > 0 ? data.totalConfidence / data.count : 0,
                avgProcessingTime: data.count > 0 ? data.totalProcessingTime / data.count : 0,
                successRate: data.successRate * 100
            };
        });
        return metrics;
    }

    getRecommendationEffectiveness() {
        const metrics = {};
        this.recommendationMetrics.forEach((data, frameId) => {
            metrics[frameId] = {
                recommended: data.recommended,
                selected: data.selected,
                conversionRate: data.conversionRate,
                avgConfidence: data.avgConfidence
            };
        });
        return metrics;
    }

    getVoiceInteractionMetrics() {
        const metrics = {};
        this.voiceInteractionMetrics.forEach((data, voiceKey) => {
            metrics[voiceKey] = {
                count: data.count,
                avgDuration: data.count > 0 ? data.totalDuration / data.count : 0,
                avgProcessingTime: data.count > 0 ? data.totalProcessingTime / data.count : 0,
                avgConfidence: data.avgConfidence,
                successRate: data.successRate * 100
            };
        });
        return metrics;
    }

    getStoreLocatorMetrics() {
        const metrics = {};
        this.storeLocatorMetrics.forEach((data, location) => {
            metrics[location] = {
                searches: data.searches,
                viewDetails: data.viewDetails,
                directions: data.directions,
                reservations: data.reservations,
                conversionRate: data.searches > 0 ? (data.reservations / data.searches) * 100 : 0
            };
        });
        return metrics;
    }

    // Helper methods
    sanitizeUserData(userData) {
        // Remove PII and sensitive data
        const sanitized = { ...userData };
        delete sanitized.email;
        delete sanitized.phone;
        delete sanitized.fullName;
        return sanitized;
    }

    calculateStageSpentTime(consultation, stage) {
        // Calculate time spent in a specific stage
        const stageIndex = consultation.stages.indexOf(stage);
        if (stageIndex === -1 || stageIndex === consultation.stages.length - 1) {
            return 0;
        }
        // This would need actual stage timestamps in a real implementation
        return 30000; // Mock 30 seconds
    }

    getTimeRangeSince(timeRange) {
        const now = Date.now();
        switch (timeRange) {
            case '1h': return now - (60 * 60 * 1000);
            case '24h': return now - (24 * 60 * 60 * 1000);
            case '7d': return now - (7 * 24 * 60 * 60 * 1000);
            case '30d': return now - (30 * 24 * 60 * 60 * 1000);
            default: return now - (24 * 60 * 60 * 1000);
        }
    }

    // Export comprehensive analytics for dashboard
    getComprehensiveAnalytics(timeRange = '24h') {
        return {
            consultation: this.getConsultationMetrics(timeRange),
            faceAnalysis: this.getFaceAnalysisMetrics(),
            recommendations: this.getRecommendationEffectiveness(),
            voiceInteractions: this.getVoiceInteractionMetrics(),
            storeLocator: this.getStoreLocatorMetrics(),
            timestamp: new Date().toISOString(),
            timeRange
        };
    }
}