/**
 * VARAi Webstore API Integration Layer
 * 
 * This service abstracts existing platform APIs for seamless integration
 * with the enhanced ecommerce experience.
 */

class APIIntegration {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.endpoints = {
            // Existing VTO API endpoints (from virtual_try_on.py)
            virtualTryOn: '/api/v1/virtual-try-on',
            vtoSessions: '/api/v1/virtual-try-on/sessions',
            vtoFeedback: '/api/v1/virtual-try-on/sessions/{sessionId}/feedback',
            vtoCompatibility: '/api/v1/virtual-try-on/frames/{frameId}/compatibility',
            
            // Face analysis endpoints
            faceAnalysis: '/api/v1/face-analysis',
            faceDetection: '/api/v1/face-detection',
            
            // Product endpoints
            products: '/api/v1/products',
            recommendations: '/api/v1/recommendations',
            
            // New endpoints for enhanced features (to be implemented)
            stores: '/api/v1/stores',
            storeInventory: '/api/v1/stores/{storeId}/inventory',
            reservations: '/api/v1/reservations',
            storeLocator: '/api/v1/stores/nearby'
        };
    }

    /**
     * Virtual Try-On Service Integration
     */
    async performVirtualTryOn(frameId, userId, adjustmentParams = null) {
        try {
            const response = await this._makeRequest('POST', this.endpoints.virtualTryOn, {
                frame_id: frameId,
                user_id: userId,
                adjustment_params: adjustmentParams
            });
            
            return {
                success: true,
                data: response,
                sessionId: response.session_id,
                resultImageUrl: response.result_image_url,
                confidenceScore: response.confidence_score
            };
        } catch (error) {
            console.error('VTO API Error:', error);
            return {
                success: false,
                error: error.message,
                fallback: this._getVTOFallback(frameId)
            };
        }
    }

    async getVTOSession(sessionId) {
        try {
            const response = await this._makeRequest('GET', 
                this.endpoints.vtoSessions + `/${sessionId}`);
            return { success: true, data: response };
        } catch (error) {
            console.error('VTO Session Error:', error);
            return { success: false, error: error.message };
        }
    }

    async submitVTOFeedback(sessionId, rating, comments = null) {
        try {
            const response = await this._makeRequest('POST', 
                this.endpoints.vtoFeedback.replace('{sessionId}', sessionId), {
                rating: rating,
                comments: comments
            });
            return { success: true, data: response };
        } catch (error) {
            console.error('VTO Feedback Error:', error);
            return { success: false, error: error.message };
        }
    }

    async checkFrameCompatibility(frameId) {
        try {
            const response = await this._makeRequest('GET', 
                this.endpoints.vtoCompatibility.replace('{frameId}', frameId));
            return {
                success: true,
                compatible: response.compatible,
                compatibilityScore: response.compatibility_score,
                supportedFeatures: response.supported_features
            };
        } catch (error) {
            console.error('Frame Compatibility Error:', error);
            return {
                success: false,
                error: error.message,
                compatible: false // Safe fallback
            };
        }
    }

    /**
     * Face Analysis Service Integration
     */
    async analyzeFace(imageData) {
        try {
            const formData = new FormData();
            formData.append('image', imageData);
            
            const response = await this._makeRequest('POST', this.endpoints.faceAnalysis, formData, {
                'Content-Type': 'multipart/form-data'
            });
            
            return {
                success: true,
                faceShape: response.face_shape,
                measurements: response.measurements,
                confidence: response.confidence
            };
        } catch (error) {
            console.error('Face Analysis Error:', error);
            return {
                success: false,
                error: error.message,
                fallback: this._getFaceAnalysisFallback()
            };
        }
    }

    /**
     * Store Locator Service (New Implementation)
     */
    async findNearbyStores(latitude, longitude, radius = 25) {
        try {
            const response = await this._makeRequest('GET', this.endpoints.storeLocator, null, {}, {
                lat: latitude,
                lng: longitude,
                radius: radius
            });
            
            return {
                success: true,
                stores: response.stores.map(store => ({
                    id: store.id,
                    name: store.name,
                    address: store.address,
                    distance: store.distance,
                    hours: store.hours_of_operation,
                    services: store.services_offered,
                    phone: store.phone,
                    hasInventory: store.inventory_available
                }))
            };
        } catch (error) {
            console.error('Store Locator Error:', error);
            return {
                success: false,
                error: error.message,
                stores: this._getFallbackStores()
            };
        }
    }

    async getStoreInventory(storeId, frameId = null) {
        try {
            const endpoint = this.endpoints.storeInventory.replace('{storeId}', storeId);
            const params = frameId ? { frame_id: frameId } : {};
            
            const response = await this._makeRequest('GET', endpoint, null, {}, params);
            
            return {
                success: true,
                inventory: response.inventory,
                lastUpdated: response.last_updated
            };
        } catch (error) {
            console.error('Store Inventory Error:', error);
            return {
                success: false,
                error: error.message,
                inventory: []
            };
        }
    }

    /**
     * Reservation Service (BOPIS)
     */
    async createReservation(reservationData) {
        try {
            const response = await this._makeRequest('POST', this.endpoints.reservations, {
                customer_email: reservationData.customerEmail,
                customer_name: reservationData.customerName,
                customer_phone: reservationData.customerPhone,
                store_id: reservationData.storeId,
                frame_id: reservationData.frameId,
                quantity: reservationData.quantity || 1,
                pickup_by_date: reservationData.pickupByDate
            });
            
            return {
                success: true,
                reservationId: response.id,
                confirmationNumber: response.confirmation_number,
                pickupInstructions: response.pickup_instructions
            };
        } catch (error) {
            console.error('Reservation Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getReservation(reservationId) {
        try {
            const response = await this._makeRequest('GET', 
                this.endpoints.reservations + `/${reservationId}`);
            return { success: true, data: response };
        } catch (error) {
            console.error('Get Reservation Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Product Recommendations Integration
     */
    async getPersonalizedRecommendations(userId, faceShape = null, preferences = {}) {
        try {
            const response = await this._makeRequest('GET', this.endpoints.recommendations, null, {}, {
                user_id: userId,
                face_shape: faceShape,
                ...preferences
            });
            
            return {
                success: true,
                recommendations: response.recommendations,
                algorithm: response.algorithm_used,
                confidence: response.confidence
            };
        } catch (error) {
            console.error('Recommendations Error:', error);
            return {
                success: false,
                error: error.message,
                recommendations: this._getFallbackRecommendations()
            };
        }
    }

    /**
     * Private helper methods
     */
    async _makeRequest(method, endpoint, data = null, headers = {}, params = {}) {
        const url = new URL(this.baseURL + endpoint);
        
        // Add query parameters
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });

        const config = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (data && method !== 'GET') {
            if (data instanceof FormData) {
                delete config.headers['Content-Type']; // Let browser set it for FormData
                config.body = data;
            } else {
                config.body = JSON.stringify(data);
            }
        }

        const response = await fetch(url.toString(), config);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    _getVTOFallback(frameId) {
        return {
            session_id: `fallback_${frameId}_${Date.now()}`,
            result_image_url: '/images/vto-placeholder.jpg',
            confidence_score: 0.0,
            message: 'Virtual try-on temporarily unavailable'
        };
    }

    _getFaceAnalysisFallback() {
        return {
            face_shape: 'oval', // Safe default
            measurements: {
                face_width: 140,
                face_height: 180,
                confidence: 0.0
            }
        };
    }

    _getFallbackStores() {
        return [
            {
                id: 'store_1',
                name: 'VisionCraft Downtown',
                address: '123 Main Street, Downtown',
                distance: 2.5,
                hours: { monday: '9:00-18:00', tuesday: '9:00-18:00' },
                services: ['eye_exams', 'frame_fitting'],
                phone: '(555) 123-4567',
                hasInventory: true
            }
        ];
    }

    _getFallbackRecommendations() {
        return [
            {
                id: 'rec_1',
                name: 'Classic Rectangle Frame',
                confidence: 0.8,
                reason: 'Popular choice'
            }
        ];
    }
}

// Create global instance
window.apiIntegration = new APIIntegration();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIIntegration;
}