/**
 * VTO (Virtual Try-On) Cart Integration
 * SPARC Implementation - VTO Integration Agent Deliverable
 * Connects existing VTO APIs with enhanced cart and BOPIS functionality
 */

class VTOCartIntegration {
    constructor() {
        this.currentVTOSession = null;
        this.vtoHistory = [];
        this.recommendations = [];
        this.faceAnalysisData = null;
        this.confidenceThreshold = 0.7; // Minimum confidence for auto-add
        this.init();
    }

    init() {
        this.loadVTOHistory();
        this.bindEvents();
        this.initializeVTOAPI();
    }

    bindEvents() {
        // VTO session completion
        document.addEventListener('vto-session-complete', (e) => {
            this.handleVTOSessionComplete(e.detail);
        });

        // Add to cart from VTO
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('vto-add-to-cart')) {
                const sessionId = e.target.dataset.sessionId;
                this.addVTOResultToCart(sessionId);
            }
        });

        // Try different frame
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('try-different-frame')) {
                this.showFrameRecommendations();
            }
        });

        // VTO confidence feedback
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('vto-feedback-btn')) {
                const sessionId = e.target.dataset.sessionId;
                const feedback = e.target.dataset.feedback;
                this.submitVTOFeedback(sessionId, feedback);
            }
        });

        // Face analysis trigger
        document.addEventListener('click', (e) => {
            if (e.target.id === 'analyze-face-shape') {
                this.triggerFaceAnalysis();
            }
        });

        // VTO history navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('vto-history-item')) {
                const sessionId = e.target.dataset.sessionId;
                this.loadVTOSession(sessionId);
            }
        });
    }

    async initializeVTOAPI() {
        try {
            // Check if VTO API is available
            if (window.apiIntegration) {
                this.vtoAPI = window.apiIntegration;
                this.loadActiveVTOSession();
            } else {
                console.warn('VTO API integration not available');
            }
        } catch (error) {
            console.error('Error initializing VTO API:', error);
        }
    }

    async loadActiveVTOSession() {
        try {
            // Check for active VTO session in URL or storage
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get('vto_session') || localStorage.getItem('active_vto_session');
            
            if (sessionId) {
                await this.loadVTOSession(sessionId);
            }
        } catch (error) {
            console.error('Error loading active VTO session:', error);
        }
    }

    async handleVTOSessionComplete(sessionData) {
        try {
            this.currentVTOSession = sessionData;
            
            // Store session in history
            this.addToVTOHistory(sessionData);
            
            // Analyze results and show recommendations
            await this.analyzeVTOResults(sessionData);
            
            // Show cart integration options
            this.showVTOCartOptions(sessionData);
            
            // Track VTO completion
            this.trackVTOEvent('session_complete', sessionData);
            
        } catch (error) {
            console.error('Error handling VTO session completion:', error);
        }
    }

    async analyzeVTOResults(sessionData) {
        try {
            const analysis = {
                confidence: sessionData.confidence_score || 0,
                faceShape: sessionData.face_analysis?.face_shape,
                frameCompatibility: sessionData.compatibility_score || 0,
                recommendations: []
            };

            // Get personalized recommendations based on face analysis
            if (analysis.faceShape) {
                analysis.recommendations = await this.getFrameRecommendations(analysis.faceShape);
            }

            // Store analysis results
            this.faceAnalysisData = analysis;
            
            // Update UI with analysis
            this.displayVTOAnalysis(analysis);
            
        } catch (error) {
            console.error('Error analyzing VTO results:', error);
        }
    }

    async getFrameRecommendations(faceShape) {
        try {
            const response = await fetch(`/api/v1/recommendations?face_shape=${faceShape}&limit=6`);
            if (response.ok) {
                return await response.json();
            }
            return [];
        } catch (error) {
            console.error('Error getting frame recommendations:', error);
            return [];
        }
    }

    showVTOCartOptions(sessionData) {
        const container = document.getElementById('vto-cart-options') || this.createVTOCartContainer();
        
        const confidence = sessionData.confidence_score || 0;
        const isHighConfidence = confidence >= this.confidenceThreshold;
        
        container.innerHTML = `
            <div class="vto-cart-integration">
                <div class="vto-result-header">
                    <h3>How do you like this look?</h3>
                    <div class="confidence-indicator">
                        <span class="confidence-label">Fit Confidence:</span>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${confidence * 100}%"></div>
                        </div>
                        <span class="confidence-score">${Math.round(confidence * 100)}%</span>
                    </div>
                </div>
                
                <div class="vto-actions">
                    <div class="primary-actions">
                        <button class="btn btn-primary vto-add-to-cart" data-session-id="${sessionData.session_id}">
                            <i class="icon-cart"></i>
                            Add to Cart
                        </button>
                        ${isHighConfidence ? `
                            <button class="btn btn-success quick-reserve" data-session-id="${sessionData.session_id}">
                                <i class="icon-pickup"></i>
                                Reserve for Pickup
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="secondary-actions">
                        <button class="btn btn-outline-secondary try-different-frame">
                            <i class="icon-refresh"></i>
                            Try Different Frame
                        </button>
                        <button class="btn btn-outline-secondary save-look" data-session-id="${sessionData.session_id}">
                            <i class="icon-save"></i>
                            Save This Look
                        </button>
                    </div>
                </div>
                
                <div class="vto-feedback">
                    <p>How does this frame look on you?</p>
                    <div class="feedback-buttons">
                        <button class="btn btn-outline-success vto-feedback-btn" data-session-id="${sessionData.session_id}" data-feedback="love">
                            😍 Love it
                        </button>
                        <button class="btn btn-outline-primary vto-feedback-btn" data-session-id="${sessionData.session_id}" data-feedback="like">
                            👍 Like it
                        </button>
                        <button class="btn btn-outline-warning vto-feedback-btn" data-session-id="${sessionData.session_id}" data-feedback="unsure">
                            🤔 Not sure
                        </button>
                        <button class="btn btn-outline-danger vto-feedback-btn" data-session-id="${sessionData.session_id}" data-feedback="dislike">
                            👎 Don't like
                        </button>
                    </div>
                </div>
                
                ${!isHighConfidence ? `
                    <div class="low-confidence-notice">
                        <p><i class="icon-info"></i> For the best fit, we recommend trying this frame in-store or exploring our recommended alternatives.</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Bind new event handlers
        this.bindVTOCartEvents(container);
    }

    bindVTOCartEvents(container) {
        // Quick reserve button
        const quickReserveBtn = container.querySelector('.quick-reserve');
        if (quickReserveBtn) {
            quickReserveBtn.addEventListener('click', (e) => {
                const sessionId = e.target.dataset.sessionId;
                this.quickReserveFromVTO(sessionId);
            });
        }

        // Save look button
        const saveLookBtn = container.querySelector('.save-look');
        if (saveLookBtn) {
            saveLookBtn.addEventListener('click', (e) => {
                const sessionId = e.target.dataset.sessionId;
                this.saveLook(sessionId);
            });
        }
    }

    async addVTOResultToCart(sessionId) {
        try {
            const session = this.getVTOSession(sessionId);
            if (!session) {
                throw new Error('VTO session not found');
            }

            // Get frame data
            const frameData = await this.getFrameData(session.frame_id);
            if (!frameData) {
                throw new Error('Frame data not found');
            }

            // Add VTO context to frame data
            const enhancedFrameData = {
                ...frameData,
                vto_session_id: sessionId,
                confidence_score: session.confidence_score,
                face_analysis: session.face_analysis,
                vto_image_url: session.image_url
            };

            // Add to cart using existing cart system
            if (window.cartManager) {
                window.cartManager.addItem(enhancedFrameData, 1);
            } else if (window.cart) {
                window.cart.addFromVTO(session);
            }

            // Track conversion
            this.trackVTOEvent('added_to_cart', session);
            
            // Show success message with VTO context
            this.showVTOCartSuccess(enhancedFrameData);
            
        } catch (error) {
            console.error('Error adding VTO result to cart:', error);
            this.showError('Failed to add item to cart. Please try again.');
        }
    }

    async quickReserveFromVTO(sessionId) {
        try {
            const session = this.getVTOSession(sessionId);
            if (!session) {
                throw new Error('VTO session not found');
            }

            // First add to cart
            await this.addVTOResultToCart(sessionId);
            
            // Then trigger BOPIS flow
            if (window.cartBOPIS) {
                // Set fulfillment to pickup
                window.cartBOPIS.setFulfillmentType('pickup');
                
                // Show store selector
                window.cartBOPIS.showStoreSelector();
                
                // Track quick reserve
                this.trackVTOEvent('quick_reserve', session);
            } else {
                this.showError('Store pickup not available. Item added to cart for shipping.');
            }
            
        } catch (error) {
            console.error('Error with quick reserve:', error);
            this.showError('Failed to reserve item. Please try adding to cart manually.');
        }
    }

    async saveLook(sessionId) {
        try {
            const session = this.getVTOSession(sessionId);
            if (!session) {
                throw new Error('VTO session not found');
            }

            // Save to local storage
            const savedLooks = JSON.parse(localStorage.getItem('saved_vto_looks') || '[]');
            const lookData = {
                id: sessionId,
                frame_id: session.frame_id,
                frame_name: session.frame_name,
                image_url: session.image_url,
                confidence_score: session.confidence_score,
                saved_at: new Date().toISOString(),
                face_analysis: session.face_analysis
            };

            savedLooks.push(lookData);
            localStorage.setItem('saved_vto_looks', JSON.stringify(savedLooks));

            // Track save event
            this.trackVTOEvent('look_saved', session);
            
            this.showSuccess('Look saved! You can find it in your saved looks.');
            
        } catch (error) {
            console.error('Error saving look:', error);
            this.showError('Failed to save look. Please try again.');
        }
    }

    async submitVTOFeedback(sessionId, feedback) {
        try {
            const session = this.getVTOSession(sessionId);
            if (!session) return;

            // Submit feedback to API
            if (this.vtoAPI) {
                await this.vtoAPI.submitVTOFeedback(sessionId, {
                    rating: this.getFeedbackRating(feedback),
                    feedback_type: feedback,
                    timestamp: new Date().toISOString()
                });
            }

            // Update local session data
            session.user_feedback = {
                type: feedback,
                rating: this.getFeedbackRating(feedback),
                submitted_at: new Date().toISOString()
            };

            // Update UI based on feedback
            this.handleFeedbackResponse(feedback, session);
            
            // Track feedback
            this.trackVTOEvent('feedback_submitted', { ...session, feedback });
            
        } catch (error) {
            console.error('Error submitting VTO feedback:', error);
        }
    }

    getFeedbackRating(feedback) {
        const ratings = {
            'love': 5,
            'like': 4,
            'unsure': 3,
            'dislike': 2
        };
        return ratings[feedback] || 3;
    }

    handleFeedbackResponse(feedback, session) {
        const container = document.querySelector('.vto-feedback');
        if (!container) return;

        // Update feedback UI
        const buttons = container.querySelectorAll('.vto-feedback-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.feedback === feedback) {
                btn.classList.add('active');
            }
        });

        // Show appropriate follow-up actions
        if (feedback === 'love' || feedback === 'like') {
            this.showPositiveFeedbackActions(session);
        } else if (feedback === 'dislike') {
            this.showNegativeFeedbackActions(session);
        } else {
            this.showNeutralFeedbackActions(session);
        }
    }

    showPositiveFeedbackActions(session) {
        const actionsContainer = document.querySelector('.vto-actions');
        if (actionsContainer) {
            // Highlight add to cart button
            const addToCartBtn = actionsContainer.querySelector('.vto-add-to-cart');
            if (addToCartBtn) {
                addToCartBtn.classList.add('pulse-animation');
                addToCartBtn.innerHTML = '<i class="icon-cart"></i> Add This Perfect Match!';
            }
        }
    }

    showNegativeFeedbackActions(session) {
        // Show alternative recommendations
        this.showFrameRecommendations();
    }

    showNeutralFeedbackActions(session) {
        // Show comparison options or additional angles
        this.showComparisonOptions(session);
    }

    async showFrameRecommendations() {
        try {
            if (!this.faceAnalysisData) {
                await this.triggerFaceAnalysis();
            }

            const recommendations = this.faceAnalysisData?.recommendations || [];
            
            if (recommendations.length === 0) {
                this.showError('No recommendations available. Please try our frame finder.');
                return;
            }

            this.displayRecommendationsModal(recommendations);
            
        } catch (error) {
            console.error('Error showing frame recommendations:', error);
            this.showError('Failed to load recommendations.');
        }
    }

    displayRecommendationsModal(recommendations) {
        const modal = document.createElement('div');
        modal.className = 'vto-recommendations-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Recommended for You</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Based on your face shape analysis, here are some great alternatives:</p>
                    <div class="recommendations-grid">
                        ${recommendations.map(frame => `
                            <div class="recommendation-card">
                                <img src="${frame.image}" alt="${frame.name}" loading="lazy">
                                <div class="recommendation-info">
                                    <h4>${frame.name}</h4>
                                    <p class="brand">${frame.brand}</p>
                                    <p class="price">$${frame.price}</p>
                                    <div class="recommendation-actions">
                                        <button class="btn btn-primary try-frame-btn" data-frame-id="${frame.id}">
                                            Try On
                                        </button>
                                        <button class="btn btn-outline-primary add-to-cart" data-frame-id="${frame.id}">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Try frame buttons
        modal.querySelectorAll('.try-frame-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const frameId = e.target.dataset.frameId;
                this.startVTOSession(frameId);
                modal.remove();
            });
        });
    }

    async startVTOSession(frameId) {
        try {
            if (this.vtoAPI) {
                const session = await this.vtoAPI.startVTOSession(frameId);
                this.currentVTOSession = session;
                
                // Navigate to VTO interface or update current view
                this.showVTOInterface(session);
            } else {
                // Fallback to direct navigation
                window.location.href = `/virtual-try-on?frame=${frameId}`;
            }
        } catch (error) {
            console.error('Error starting VTO session:', error);
            this.showError('Failed to start virtual try-on. Please try again.');
        }
    }

    async triggerFaceAnalysis() {
        try {
            if (this.vtoAPI) {
                const analysis = await this.vtoAPI.analyzeFace();
                this.faceAnalysisData = analysis;
                return analysis;
            }
        } catch (error) {
            console.error('Error with face analysis:', error);
            throw error;
        }
    }

    displayVTOAnalysis(analysis) {
        const container = document.getElementById('vto-analysis') || this.createAnalysisContainer();
        
        container.innerHTML = `
            <div class="vto-analysis-content">
                <h4>Your Face Analysis</h4>
                <div class="analysis-results">
                    ${analysis.faceShape ? `
                        <div class="analysis-item">
                            <span class="label">Face Shape:</span>
                            <span class="value">${analysis.faceShape}</span>
                        </div>
                    ` : ''}
                    <div class="analysis-item">
                        <span class="label">Frame Compatibility:</span>
                        <span class="value">${Math.round(analysis.frameCompatibility * 100)}%</span>
                    </div>
                </div>
                ${analysis.recommendations.length > 0 ? `
                    <button class="btn btn-outline-primary view-recommendations">
                        View ${analysis.recommendations.length} Recommended Frames
                    </button>
                ` : ''}
            </div>
        `;

        // Bind view recommendations button
        const viewBtn = container.querySelector('.view-recommendations');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                this.displayRecommendationsModal(analysis.recommendations);
            });
        }
    }

    showVTOCartSuccess(frameData) {
        const notification = document.createElement('div');
        notification.className = 'vto-cart-success';
        notification.innerHTML = `
            <div class="success-content">
                <div class="success-icon">✓</div>
                <div class="success-message">
                    <h4>Added to Cart!</h4>
                    <p>${frameData.name} with your virtual try-on</p>
                    ${frameData.confidence_score ? `
                        <small>Confidence: ${Math.round(frameData.confidence_score * 100)}%</small>
                    ` : ''}
                </div>
                <div class="success-actions">
                    <button class="btn btn-primary view-cart">View Cart</button>
                    <button class="btn btn-outline-secondary continue-shopping">Continue</button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        // Bind action buttons
        notification.querySelector('.view-cart').addEventListener('click', () => {
            if (window.cartManager && window.cartManager.toggleCartSidebar) {
                window.cartManager.toggleCartSidebar();
            }
            notification.remove();
        });

        notification.querySelector('.continue-shopping').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Utility methods
    addToVTOHistory(sessionData) {
        this.vtoHistory.unshift(sessionData);
        
        // Keep only last 10 sessions
        if (this.vtoHistory.length > 10) {
            this.vtoHistory = this.vtoHistory.slice(0, 10);
        }
        
        this.saveVTOHistory();
    }

    loadVTOHistory() {
        const stored = localStorage.getItem('vto_history');
        if (stored) {
            this.vtoHistory = JSON.parse(stored);
        }
    }

    saveVTOHistory() {
        localStorage.setItem('vto_history', JSON.stringify(this.vtoHistory));
    }

    getVTOSession(sessionId) {
        return this.vtoHistory.find(session => session.session_id === sessionId) || this.currentVTOSession;
    }

    async getFrameData(frameId) {
        try {
            const response = await fetch(`/api/v1/products/${frameId}`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Error getting frame data:', error);
            return null;
        }
    }

    async loadVTOSession(sessionId) {
        try {
            if (this.vtoAPI) {
                const session = await this.vtoAPI.getVTOSession(sessionId);
                this.currentVTOSession = session;
                this.showVTOCartOptions(session);
            }
        } catch (error) {
            console.error('Error loading VTO session:', error);
        }
    }

    trackVTOEvent(eventType, sessionData) {
        try {
            if (this.vtoAPI) {
                this.vtoAPI.trackVTOConversion(sessionData.session_id, eventType);
            }
            
            // Also track locally for analytics
            const event = {
                type: eventType,
                session_id: sessionData.session_id,
                frame_id: sessionData.frame_id,
                confidence_score: sessionData.confidence_score,
                timestamp: new Date().toISOString()
            };
            
            const events = JSON.parse(localStorage.getItem('vto_events') || '[]');
            events.push(event);
            localStorage.setItem('vto_events', JSON.stringify(events.slice(-50))); // Keep last 50 events
            
        } catch (error) {
            console.error('Error tracking VTO event:', error);
        }
    }

    createVTOCartContainer() {
        const container = document.createElement('div');
        container.id = 'vto-cart-options';
        container.className = 'vto-cart-container';
        
        // Find appropriate place to insert
        const vtoContainer = document.querySelector('.vto-container') || 
                            document.querySelector('.virtual-try-on') ||
                            document.body;
        
        vtoContainer.appendChild(container);
        return container;
    }

    createAnalysisContainer() {
        const container = document.createElement('div');
        container.id = 'vto-analysis';
        container.className = 'vto-analysis-container';
        
        const vtoContainer = document.querySelector('.vto-container') || 
                            document.querySelector('.virtual-try-on') ||
                            document.body;
        
        vtoContainer.appendChild(container);
        return container;
    }

    showError(message) {
        console.error(message);
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, 'error');
        }
    }

    showSuccess(message) {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, 'success');
        }
    }
}

// Initialize VTO cart integration when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.vtoCartIntegration = new VTOCartIntegration();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VTOCartIntegration;
}