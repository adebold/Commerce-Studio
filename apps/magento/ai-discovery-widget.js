/**
 * Magento AI Discovery Widget with Camera Integration
 * 
 * This widget provides AI-powered eyewear discovery functionality for Magento stores
 * with real camera access for face analysis and personalized recommendations.
 */

(function() {
    'use strict';

    // Import shared camera interface
    if (typeof CameraInterface === 'undefined') {
        console.error('CameraInterface not found. Please include the shared camera component.');
        return;
    }

    class MagentoAIWidget {
        constructor(options = {}) {
            this.options = {
                shopDomain: options.shopDomain || window.location.hostname,
                position: options.position || 'bottom-right',
                primaryColor: options.primaryColor || '#eb5202',
                secondaryColor: options.secondaryColor || '#f8f9fa',
                enableFaceAnalysis: options.enableFaceAnalysis !== false,
                enableVirtualTryOn: options.enableVirtualTryOn !== false,
                enableAIRecommendations: options.enableAIRecommendations !== false,
                maxRecommendations: options.maxRecommendations || 6,
                apiEndpoint: options.apiEndpoint || '/rest/V1/ai-discovery',
                storeCode: options.storeCode || 'default',
                ...options
            };

            this.isOpen = false;
            this.sessionId = this.generateSessionId();
            this.conversationHistory = [];
            this.faceAnalysisResult = null;
            this.currentProducts = [];
            this.customerData = null;

            this.init();
        }

        /**
         * Initialize the widget
         */
        init() {
            this.loadCustomerData();
            this.createWidget();
            this.attachEventListeners();
            this.loadInitialData();
        }

        /**
         * Generate unique session ID
         */
        generateSessionId() {
            return `magento_ai_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
        }

        /**
         * Load customer data if available
         */
        loadCustomerData() {
            // Try to get customer data from Magento's customer data
            if (window.customerData && window.customerData.get) {
                this.customerData = window.customerData.get('customer')();
            }
        }

        /**
         * Create widget HTML structure
         */
        createWidget() {
            const widgetHTML = `
                <div id="magento-ai-widget" class="magento-ai-widget ${this.options.position}">
                    <!-- Toggle Button -->
                    <div id="magento-ai-toggle" class="magento-ai-toggle">
                        <div class="magento-ai-toggle-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17C15.24 5.06 14.32 5 13.4 5H10.6C9.68 5 8.76 5.06 7.83 5.17L10.5 2.5L9 1L3 7V9C3 10.1 3.9 11 5 11V16C5 17.1 5.9 18 7 18H17C18.1 18 19 17.1 19 16V11C20.1 11 21 10.1 21 9Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="magento-ai-toggle-text">AI Eyewear Assistant</div>
                    </div>

                    <!-- Chat Window -->
                    <div id="magento-ai-chat" class="magento-ai-chat" style="display: none;">
                        <div class="magento-ai-header">
                            <div class="magento-ai-header-content">
                                <div class="magento-ai-avatar">🤖</div>
                                <div class="magento-ai-header-text">
                                    <h4>AI Eyewear Discovery</h4>
                                    <p>Powered by advanced face analysis</p>
                                </div>
                            </div>
                            <button id="magento-ai-close" class="magento-ai-close">✕</button>
                        </div>

                        <div class="magento-ai-messages" id="magento-ai-messages">
                            <!-- Messages will be inserted here -->
                        </div>

                        <div class="magento-ai-input-area">
                            <div class="magento-ai-quick-actions" id="magento-ai-quick-actions">
                                <button class="magento-ai-quick-btn" data-action="face-analysis">
                                    📷 Face Analysis
                                </button>
                                <button class="magento-ai-quick-btn" data-action="ai-recommendations">
                                    ✨ Smart Recommendations
                                </button>
                                <button class="magento-ai-quick-btn" data-action="virtual-tryon">
                                    👓 Virtual Try-On
                                </button>
                                <button class="magento-ai-quick-btn" data-action="browse-catalog">
                                    🛍️ Browse Catalog
                                </button>
                            </div>
                            
                            <div class="magento-ai-input-container">
                                <input type="text" id="magento-ai-input" placeholder="Ask about eyewear styles, face shapes, or products..." />
                                <button id="magento-ai-send" class="magento-ai-send-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', widgetHTML);
            this.addStyles();
        }

        /**
         * Add widget styles
         */
        addStyles() {
            const styles = `
                <style id="magento-ai-widget-styles">
                .magento-ai-widget {
                    position: fixed;
                    z-index: 9999;
                    font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                }

                .magento-ai-widget.bottom-right {
                    bottom: 20px;
                    right: 20px;
                }

                .magento-ai-widget.bottom-left {
                    bottom: 20px;
                    left: 20px;
                }

                .magento-ai-widget.top-right {
                    top: 20px;
                    right: 20px;
                }

                .magento-ai-widget.top-left {
                    top: 20px;
                    left: 20px;
                }

                .magento-ai-toggle {
                    background: linear-gradient(135deg, ${this.options.primaryColor}, #ff6b35);
                    color: white;
                    border-radius: 50px;
                    padding: 15px 20px;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(235, 82, 2, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    user-select: none;
                    border: none;
                }

                .magento-ai-toggle:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(235, 82, 2, 0.4);
                }

                .magento-ai-toggle-icon {
                    display: flex;
                    align-items: center;
                }

                .magento-ai-toggle-text {
                    font-weight: 600;
                    font-size: 14px;
                }

                .magento-ai-chat {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 400px;
                    height: 550px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    border: 1px solid #e0e0e0;
                }

                .magento-ai-header {
                    background: linear-gradient(135deg, ${this.options.primaryColor}, #ff6b35);
                    color: white;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .magento-ai-header-content {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .magento-ai-avatar {
                    font-size: 28px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    width: 45px;
                    height: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .magento-ai-header-text h4 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                }

                .magento-ai-header-text p {
                    margin: 0;
                    font-size: 13px;
                    opacity: 0.9;
                }

                .magento-ai-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .magento-ai-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .magento-ai-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    background: #fafafa;
                }

                .magento-ai-message {
                    max-width: 85%;
                    padding: 14px 18px;
                    border-radius: 20px;
                    font-size: 14px;
                    line-height: 1.5;
                    word-wrap: break-word;
                }

                .magento-ai-message.user {
                    background: linear-gradient(135deg, ${this.options.primaryColor}, #ff6b35);
                    color: white;
                    align-self: flex-end;
                    border-bottom-right-radius: 8px;
                }

                .magento-ai-message.assistant {
                    background: white;
                    color: #333;
                    align-self: flex-start;
                    border-bottom-left-radius: 8px;
                    border: 1px solid #e0e0e0;
                }

                .magento-ai-quick-actions {
                    padding: 15px 20px 10px;
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    background: white;
                    border-top: 1px solid #e0e0e0;
                }

                .magento-ai-quick-btn {
                    background: ${this.options.secondaryColor};
                    border: 1px solid #ddd;
                    border-radius: 25px;
                    padding: 10px 15px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                    font-weight: 500;
                }

                .magento-ai-quick-btn:hover {
                    background: ${this.options.primaryColor};
                    color: white;
                    border-color: ${this.options.primaryColor};
                    transform: translateY(-1px);
                }

                .magento-ai-input-container {
                    padding: 15px 20px 20px;
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    background: white;
                }

                .magento-ai-input-container input {
                    flex: 1;
                    padding: 14px 18px;
                    border: 2px solid #e0e0e0;
                    border-radius: 25px;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .magento-ai-input-container input:focus {
                    border-color: ${this.options.primaryColor};
                    box-shadow: 0 0 0 3px rgba(235, 82, 2, 0.1);
                }

                .magento-ai-send-btn {
                    background: linear-gradient(135deg, ${this.options.primaryColor}, #ff6b35);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 45px;
                    height: 45px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(235, 82, 2, 0.3);
                }

                .magento-ai-send-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(235, 82, 2, 0.4);
                }

                .magento-ai-product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }

                .magento-ai-product-card {
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    background: white;
                }

                .magento-ai-product-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                    border-color: ${this.options.primaryColor};
                }

                .magento-ai-product-image {
                    width: 100%;
                    height: 130px;
                    object-fit: cover;
                }

                .magento-ai-product-info {
                    padding: 12px;
                }

                .magento-ai-product-name {
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 6px;
                    color: #333;
                    line-height: 1.3;
                }

                .magento-ai-product-price {
                    font-size: 15px;
                    font-weight: 700;
                    color: ${this.options.primaryColor};
                }

                .magento-ai-product-match {
                    font-size: 11px;
                    color: #28a745;
                    font-weight: 600;
                    margin-top: 4px;
                }

                .magento-ai-loading {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #666;
                    font-size: 14px;
                    margin-top: 10px;
                }

                .magento-ai-spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid ${this.options.primaryColor};
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .magento-ai-recommendations {
                    margin-top: 10px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .magento-ai-recommendation-tag {
                    background: #e8f5e8;
                    color: #28a745;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .magento-ai-analysis-result {
                    background: #f0f8ff;
                    border: 1px solid #b3d9ff;
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 10px;
                }

                .magento-ai-analysis-title {
                    font-weight: 600;
                    color: #0066cc;
                    margin-bottom: 6px;
                }

                .magento-ai-analysis-details {
                    font-size: 12px;
                    color: #666;
                }

                /* Mobile responsiveness */
                @media (max-width: 768px) {
                    .magento-ai-chat {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 120px);
                        bottom: 80px;
                        right: 20px;
                        left: 20px;
                    }

                    .magento-ai-toggle-text {
                        display: none;
                    }

                    .magento-ai-toggle {
                        border-radius: 50%;
                        padding: 15px;
                    }

                    .magento-ai-quick-actions {
                        flex-direction: column;
                    }

                    .magento-ai-quick-btn {
                        width: 100%;
                        text-align: center;
                    }

                    .magento-ai-product-grid {
                        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    }
                }
                </style>
            `;

            document.head.insertAdjacentHTML('beforeend', styles);
        }

        /**
         * Attach event listeners
         */
        attachEventListeners() {
            const toggle = document.getElementById('magento-ai-toggle');
            const close = document.getElementById('magento-ai-close');
            const input = document.getElementById('magento-ai-input');
            const send = document.getElementById('magento-ai-send');
            const quickActions = document.getElementById('magento-ai-quick-actions');

            toggle.addEventListener('click', () => this.toggleWidget());
            close.addEventListener('click', () => this.closeWidget());
            send.addEventListener('click', () => this.sendMessage());
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });

            quickActions.addEventListener('click', (e) => {
                if (e.target.classList.contains('magento-ai-quick-btn')) {
                    this.handleQuickAction(e.target.dataset.action);
                }
            });
        }

        /**
         * Load initial data and show welcome message
         */
        loadInitialData() {
            const customerName = this.customerData?.firstname || 'there';
            const welcomeMessage = {
                type: 'assistant',
                content: `Hi ${customerName}! I'm your AI eyewear discovery assistant. I use advanced face analysis to help you find the perfect frames that complement your unique features. Ready to discover your ideal eyewear?`,
                timestamp: Date.now()
            };

            this.addMessage(welcomeMessage);
        }

        /**
         * Toggle widget visibility
         */
        toggleWidget() {
            const chat = document.getElementById('magento-ai-chat');
            this.isOpen = !this.isOpen;
            chat.style.display = this.isOpen ? 'flex' : 'none';
            
            if (this.isOpen) {
                this.trackEvent('widget_opened');
            }
        }

        /**
         * Close widget
         */
        closeWidget() {
            const chat = document.getElementById('magento-ai-chat');
            this.isOpen = false;
            chat.style.display = 'none';
            this.trackEvent('widget_closed');
        }

        /**
         * Handle quick action buttons
         */
        async handleQuickAction(action) {
            this.trackEvent('quick_action_clicked', { action });
            
            switch (action) {
                case 'face-analysis':
                    await this.startFaceAnalysis();
                    break;
                case 'ai-recommendations':
                    await this.startAIRecommendations();
                    break;
                case 'virtual-tryon':
                    await this.startVirtualTryOn();
                    break;
                case 'browse-catalog':
                    await this.browseCatalog();
                    break;
            }
        }

        /**
         * Start face analysis with camera
         */
        async startFaceAnalysis() {
            if (!CameraInterface.isCameraSupported()) {
                CameraInterface.showNotSupportedMessage();
                return;
            }

            const userMessage = {
                type: 'user',
                content: 'Start face analysis',
                timestamp: Date.now()
            };
            this.addMessage(userMessage);

            const loadingMessage = {
                type: 'assistant',
                content: 'Excellent choice! I\'ll analyze your face shape using advanced AI technology. Please allow camera access when prompted.',
                timestamp: Date.now(),
                loading: true
            };
            this.addMessage(loadingMessage);

            try {
                const cameraInterface = new CameraInterface({
                    onAnalysisComplete: (results) => this.handleFaceAnalysisResults(results),
                    onError: (error) => this.handleCameraError(error)
                });

                cameraInterface.createCameraModal('face-analysis');
                this.trackEvent('face_analysis_started');
            } catch (error) {
                this.handleCameraError(error);
            }
        }

        /**
         * Start AI recommendations with camera
         */
        async startAIRecommendations() {
            if (!CameraInterface.isCameraSupported()) {
                CameraInterface.showNotSupportedMessage();
                return;
            }

            const userMessage = {
                type: 'user',
                content: 'Get AI recommendations',
                timestamp: Date.now()
            };
            this.addMessage(userMessage);

            const loadingMessage = {
                type: 'assistant',
                content: 'Perfect! I\'ll analyze your facial features to provide highly personalized eyewear recommendations tailored just for you.',
                timestamp: Date.now(),
                loading: true
            };
            this.addMessage(loadingMessage);

            try {
                const cameraInterface = new CameraInterface({
                    onAnalysisComplete: (results) => this.handleAIRecommendationsResults(results),
                    onError: (error) => this.handleCameraError(error)
                });

                cameraInterface.createCameraModal('ai-recommendations');
                this.trackEvent('ai_recommendations_started');
            } catch (error) {
                this.handleCameraError(error);
            }
        }

        /**
         * Start virtual try-on
         */
        async startVirtualTryOn() {
            const userMessage = {
                type: 'user',
                content: 'Start virtual try-on',
                timestamp: Date.now()
            };
            this.addMessage(userMessage);

            const tryOnMessage = {
                type: 'assistant',
                content: 'Virtual try-on is coming soon! For now, I can help you find the perfect frames through face analysis and personalized recommendations. Would you like to start with a face analysis?',
                timestamp: Date.now()
            };
            this.addMessage(tryOnMessage);
            
            this.trackEvent('virtual_tryon_requested');
        }

        /**
         * Handle face analysis results
         */
        handleFaceAnalysisResults(results) {
            this.faceAnalysisResult = results;
            
            // Remove loading message
            this.removeLastMessage();
            
            const resultMessage = {
                type: 'assistant',
                content: `Outstanding! I've completed your face analysis with ${Math.round(results.confidence * 100)}% confidence.`,
                timestamp: Date.now(),
                faceAnalysis: results
            };

            this.addMessage(resultMessage);

            // Show detailed analysis
            const detailMessage = {
                type: 'assistant',
                content: `Your face shape is **${results.faceShape}**, which means these frame styles will look absolutely perfect on you:`,
                timestamp: Date.now(),
                recommendations: results.recommendations
            };

            this.addMessage(detailMessage);
            
            this.trackEvent('face_analysis_completed', { 
                faceShape: results.faceShape, 
                confidence: results.confidence 
            });
        }

        /**
         * Handle AI recommendations results
         */
        handleAIRecommendationsResults(results) {
            this.faceAnalysisResult = results;
            
            // Remove loading message
            this.removeLastMessage();
            
            const resultMessage = {
                type: 'assistant',
                content: `Based on your ${results.faceShape} face shape and facial measurements, I've curated ${results.products.length} exceptional eyewear recommendations specifically for you:`,
                timestamp: Date.now(),
                products: results.products
            };

            this.addMessage(resultMessage);
            
            this.trackEvent('ai_recommendations_completed', { 
                faceShape: results.faceShape, 
                productCount: results.products.length 
            });
        }

        /**
         * Handle camera errors
         */
        handleCameraError(error) {
            // Remove loading message if present
            this.removeLastMessage();
            
            const errorMessage = {
                type: 'assistant',
                content: 'I\'m having trouble accessing your camera. This could be due to browser permissions or settings. Would you like to try again, or shall I help you browse our catalog instead?',
                timestamp: Date.now(),
                error: true
            };

            this.addMessage(errorMessage);
            this.trackEvent('camera_error', { error: error.message });
        }

        /**
         * Browse catalog without camera
         */
        async browseCatalog() {
            const userMessage = {
                type: 'user',
                content: 'Browse catalog',
                timestamp: Date.now()
            };
            this.addMessage(userMessage);

            try {
                const products = await this.fetchProducts();
                
                const productMessage = {
                    type: 'assistant',
                    content: 'Here are our featured eyewear collections. Each piece is carefully selected for quality and style:',
                    timestamp: Date.now(),
                    products: products
                };

                this.addMessage(productMessage);
                this.trackEvent('catalog_browsed');
            } catch (error) {
                const errorMessage = {
                    type: 'assistant',
                    content: 'I\'m having trouble loading our catalog right now. Please try again in a moment.',
                    timestamp: Date.now(),
                    error: true
                };

                this.addMessage(errorMessage);
                this.trackEvent('catalog_error', { error: error.message });
            }
        }

        /**
         * Send user message
         */
        async sendMessage() {
            const input = document.getElementById('magento-ai-input');
            const message = input.value.trim();
            
            if (!message) return;

            const userMessage = {
                type: 'user',
                content: message,
                timestamp: Date.now()
            };

            this.addMessage(userMessage);
            input.value = '';

            // Show loading
            const loadingMessage = {
                type: 'assistant',
                content: 'Let me help you with that...',
                timestamp: Date.now(),
                loading: true
            };
            this.addMessage(loadingMessage);

            try {
                const response = await this.sendToAPI(message);
                
                // Remove loading message
                this.removeLastMessage();
                
                const assistantMessage = {
                    type: 'assistant',
                    content: response.message,
                    timestamp: Date.now(),
                    products: response.products
                };

                this.addMessage(assistantMessage);
                this.trackEvent('message_sent', { message });
            } catch (error) {
                // Remove loading message
                this.removeLastMessage();
                
                const errorMessage = {
                    type: 'assistant',
                    content: 'I\'m experiencing some technical difficulties. Please try again in a moment.',
                    timestamp: Date.now(),
                    error: true
                };

                this.addMessage(errorMessage);
                this.trackEvent('message_error', { error: error.message });
            }
        }

        /**
         * Add message to chat
         */
        addMessage(message) {
            const messagesContainer = document.getElementById('magento-ai-messages');
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            this.conversationHistory.push(message);
        }

        /**
         * Remove last message (for loading states)
         */
        removeLastMessage() {
            const messagesContainer = document.getElementById('magento-ai-messages');
            const lastMessage = messagesContainer.lastElementChild;
            if (lastMessage) {
                lastMessage.remove();
                this.conversationHistory.pop();
            }
        }

        /**
         * Create message element
         */
        createMessageElement(message) {
            const div = document.createElement('div');
            div.className = `magento-ai-message ${message.type}`;
            
            let content = message.content;
            
            if (message.loading) {
                content += '<div class="magento-ai-loading"><div class="magento-ai-spinner"></div>Processing...</div>';
            }
            
            if (message.faceAnalysis) {
                content += `
                    <div class="magento-ai-analysis-result">
                        <div class="magento-ai-analysis-title">Face Analysis Results</div>
                        <div class="magento-ai-analysis-details">
                            Face Shape: ${message.faceAnalysis.faceShape} (${Math.round(message.faceAnalysis.confidence * 100)}% confidence)
                        </div>
                    </div>
                `;
            }
            
            if (message.recommendations) {
                content += '<div class="magento-ai-recommendations">';
                message.recommendations.forEach(rec => {
                    content += `<span class="magento-ai-recommendation-tag">${rec}</span>`;
                });
                content += '</div>';
            }
            
            if (message.products) {
                content += this.createProductGrid(message.products);
            }
            
            div.innerHTML = content;
            return div;
        }

        /**
         * Create product grid HTML
         */
        createProductGrid(products) {
            let html = '<div class="magento-ai-product-grid">';
            
            products.forEach(product => {
                html += `
                    <div class="magento-ai-product-card" onclick="window.open('${product.url || '#'}', '_blank')">
                        <img src="${product.image}" alt="${product.name}" class="magento-ai-product-image" />
                        <div class="magento-ai-product-info">
                            <div class="magento-ai-product-name">${product.name}</div>
                            <div class="magento-ai-product-price">$${product.price}</div>
                            ${product.match ? `<div class="magento-ai-product-match">${product.match}% Match</div>` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            return html;
        }

        /**
         * Fetch products from Magento API
         */
        async fetchProducts() {
            try {
                // Mock products for demo - replace with actual Magento API call
                return [
                    {
                        id: 1,
                        name: 'Premium Aviator Collection',
                        price: 249.99,
                        image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
                        url: '/premium-aviator-collection.html',
                        match: 95
                    },
                    {
                        id: 2,
                        name: 'Executive Rectangle Frames',
                        price: 199.99,
                        image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
                        url: '/executive-rectangle-frames.html',
                        match: 92
                    },
                    {
                        id: 3,
                        name: 'Designer Cat-Eye Luxury',
                        price: 329.99,
                        image: 'https://images.unsplash.com/photo-1513146581-976d6fdb6879?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
                        url: '/designer-cat-eye-luxury.html',
                        match: 88
                    },
                    {
                        id: 4,
                        name: 'Sport Performance Series',
                        price: 179.99,
                        image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
                        url: '/sport-performance-series.html',
                        match: 85
                    }
                ];
            } catch (error) {
                console.error('Error fetching products:', error);
                throw error;
            }
        }

        /**
         * Send message to AI API
         */
        async sendToAPI(message) {
            try {
                // Mock API response - replace with actual Magento AI API call
                await new Promise(resolve => setTimeout(resolve, 1200));
                
                const responses = [
                    "I understand you're looking for eyewear recommendations. Based on current trends and our bestsellers, here are some excellent options:",
                    "Great question! Let me show you some products that match your style preferences:",
                    "I'd be happy to help you find the perfect frames. Here are some curated recommendations:"
                ];
                
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                
                return {
                    message: randomResponse,
                    products: await this.fetchProducts()
                };
            } catch (error) {
                console.error('Error calling AI API:', error);
                throw error;
            }
        }

        /**
         * Track events for analytics
         */
        trackEvent(eventName, data = {}) {
            try {
                // Integration with Magento analytics
                if (window.gtag) {
                    window.gtag('event', eventName, {
                        event_category: 'AI_Discovery',
                        event_label: this.sessionId,
                        custom_map: data
                    });
                }
                
                // Integration with Adobe Analytics (if available)
                if (window.s && window.s.tl) {
                    window.s.tl(true, 'o', `AI_Discovery_${eventName}`);
                }
                
                console.log('AI Discovery Event:', eventName, data);
            } catch (error) {
                console.error('Error tracking event:', error);
            }
        }

        /**
         * Destroy widget and clean up
         */
        destroy() {
            const widget = document.getElementById('magento-ai-widget');
            const styles = document.getElementById('magento-ai-widget-styles');
            
            if (widget) widget.remove();
            if (styles) styles.remove();
            
            this.trackEvent('widget_destroyed');
        }
    }

    // Auto-initialize widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new MagentoAIWidget();
        });
    } else {
        new MagentoAIWidget();
    }

    // Export for manual initialization
    window.MagentoAIWidget = MagentoAIWidget;

})();