/**
 * WooCommerce AI Discovery Widget with Camera Integration
 * 
 * This widget provides AI-powered eyewear discovery functionality for WooCommerce stores
 * with real camera access for face analysis and personalized recommendations.
 */

(function() {
    'use strict';

    // Import shared camera interface
    if (typeof CameraInterface === 'undefined') {
        console.error('CameraInterface not found. Please include the shared camera component.');
        return;
    }

    class WooCommerceAIWidget {
        constructor(options = {}) {
            this.options = {
                shopDomain: options.shopDomain || window.location.hostname,
                position: options.position || 'bottom-right',
                primaryColor: options.primaryColor || '#96588a',
                secondaryColor: options.secondaryColor || '#f8f9fa',
                enableFaceAnalysis: options.enableFaceAnalysis !== false,
                enableVirtualTryOn: options.enableVirtualTryOn !== false,
                enableAIRecommendations: options.enableAIRecommendations !== false,
                maxRecommendations: options.maxRecommendations || 6,
                apiEndpoint: options.apiEndpoint || '/wp-json/ai-discovery/v1',
                ...options
            };

            this.isOpen = false;
            this.sessionId = this.generateSessionId();
            this.conversationHistory = [];
            this.faceAnalysisResult = null;
            this.currentProducts = [];

            this.init();
        }

        /**
         * Initialize the widget
         */
        init() {
            this.createWidget();
            this.attachEventListeners();
            this.loadInitialData();
        }

        /**
         * Generate unique session ID
         */
        generateSessionId() {
            return `woo_ai_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
        }

        /**
         * Create widget HTML structure
         */
        createWidget() {
            const widgetHTML = `
                <div id="woo-ai-widget" class="woo-ai-widget ${this.options.position}">
                    <!-- Toggle Button -->
                    <div id="woo-ai-toggle" class="woo-ai-toggle">
                        <div class="woo-ai-toggle-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17C15.24 5.06 14.32 5 13.4 5H10.6C9.68 5 8.76 5.06 7.83 5.17L10.5 2.5L9 1L3 7V9C3 10.1 3.9 11 5 11V16C5 17.1 5.9 18 7 18H17C18.1 18 19 17.1 19 16V11C20.1 11 21 10.1 21 9Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="woo-ai-toggle-text">AI Assistant</div>
                    </div>

                    <!-- Chat Window -->
                    <div id="woo-ai-chat" class="woo-ai-chat" style="display: none;">
                        <div class="woo-ai-header">
                            <div class="woo-ai-header-content">
                                <div class="woo-ai-avatar">🤖</div>
                                <div class="woo-ai-header-text">
                                    <h4>AI Eyewear Assistant</h4>
                                    <p>Find your perfect frames</p>
                                </div>
                            </div>
                            <button id="woo-ai-close" class="woo-ai-close">✕</button>
                        </div>

                        <div class="woo-ai-messages" id="woo-ai-messages">
                            <!-- Messages will be inserted here -->
                        </div>

                        <div class="woo-ai-input-area">
                            <div class="woo-ai-quick-actions" id="woo-ai-quick-actions">
                                <button class="woo-ai-quick-btn" data-action="face-analysis">
                                    📷 Face Analysis
                                </button>
                                <button class="woo-ai-quick-btn" data-action="ai-recommendations">
                                    ✨ AI Recommendations
                                </button>
                                <button class="woo-ai-quick-btn" data-action="browse-products">
                                    👓 Browse Products
                                </button>
                            </div>
                            
                            <div class="woo-ai-input-container">
                                <input type="text" id="woo-ai-input" placeholder="Ask me about eyewear..." />
                                <button id="woo-ai-send" class="woo-ai-send-btn">
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
                <style id="woo-ai-widget-styles">
                .woo-ai-widget {
                    position: fixed;
                    z-index: 9999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .woo-ai-widget.bottom-right {
                    bottom: 20px;
                    right: 20px;
                }

                .woo-ai-widget.bottom-left {
                    bottom: 20px;
                    left: 20px;
                }

                .woo-ai-widget.top-right {
                    top: 20px;
                    right: 20px;
                }

                .woo-ai-widget.top-left {
                    top: 20px;
                    left: 20px;
                }

                .woo-ai-toggle {
                    background: ${this.options.primaryColor};
                    color: white;
                    border-radius: 50px;
                    padding: 15px 20px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    user-select: none;
                }

                .woo-ai-toggle:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                }

                .woo-ai-toggle-icon {
                    display: flex;
                    align-items: center;
                }

                .woo-ai-toggle-text {
                    font-weight: 600;
                    font-size: 14px;
                }

                .woo-ai-chat {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 380px;
                    height: 500px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .woo-ai-header {
                    background: ${this.options.primaryColor};
                    color: white;
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .woo-ai-header-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .woo-ai-avatar {
                    font-size: 24px;
                }

                .woo-ai-header-text h4 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                .woo-ai-header-text p {
                    margin: 0;
                    font-size: 12px;
                    opacity: 0.9;
                }

                .woo-ai-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .woo-ai-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .woo-ai-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .woo-ai-message {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    font-size: 14px;
                    line-height: 1.4;
                }

                .woo-ai-message.user {
                    background: ${this.options.primaryColor};
                    color: white;
                    align-self: flex-end;
                    border-bottom-right-radius: 6px;
                }

                .woo-ai-message.assistant {
                    background: #f1f3f4;
                    color: #333;
                    align-self: flex-start;
                    border-bottom-left-radius: 6px;
                }

                .woo-ai-quick-actions {
                    padding: 15px 20px 10px;
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .woo-ai-quick-btn {
                    background: ${this.options.secondaryColor};
                    border: 1px solid #ddd;
                    border-radius: 20px;
                    padding: 8px 12px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .woo-ai-quick-btn:hover {
                    background: ${this.options.primaryColor};
                    color: white;
                    border-color: ${this.options.primaryColor};
                }

                .woo-ai-input-container {
                    padding: 10px 20px 20px;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .woo-ai-input-container input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid #ddd;
                    border-radius: 25px;
                    font-size: 14px;
                    outline: none;
                }

                .woo-ai-input-container input:focus {
                    border-color: ${this.options.primaryColor};
                }

                .woo-ai-send-btn {
                    background: ${this.options.primaryColor};
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .woo-ai-send-btn:hover {
                    transform: scale(1.05);
                }

                .woo-ai-product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }

                .woo-ai-product-card {
                    border: 1px solid #eee;
                    border-radius: 8px;
                    overflow: hidden;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .woo-ai-product-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .woo-ai-product-image {
                    width: 100%;
                    height: 120px;
                    object-fit: cover;
                }

                .woo-ai-product-info {
                    padding: 10px;
                }

                .woo-ai-product-name {
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 5px;
                    color: #333;
                }

                .woo-ai-product-price {
                    font-size: 14px;
                    font-weight: 700;
                    color: ${this.options.primaryColor};
                }

                .woo-ai-loading {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #666;
                    font-size: 14px;
                }

                .woo-ai-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid ${this.options.primaryColor};
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Mobile responsiveness */
                @media (max-width: 768px) {
                    .woo-ai-chat {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 120px);
                        bottom: 80px;
                        right: 20px;
                        left: 20px;
                    }

                    .woo-ai-toggle-text {
                        display: none;
                    }

                    .woo-ai-toggle {
                        border-radius: 50%;
                        padding: 15px;
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
            const toggle = document.getElementById('woo-ai-toggle');
            const close = document.getElementById('woo-ai-close');
            const input = document.getElementById('woo-ai-input');
            const send = document.getElementById('woo-ai-send');
            const quickActions = document.getElementById('woo-ai-quick-actions');

            toggle.addEventListener('click', () => this.toggleWidget());
            close.addEventListener('click', () => this.closeWidget());
            send.addEventListener('click', () => this.sendMessage());
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });

            quickActions.addEventListener('click', (e) => {
                if (e.target.classList.contains('woo-ai-quick-btn')) {
                    this.handleQuickAction(e.target.dataset.action);
                }
            });
        }

        /**
         * Load initial data and show welcome message
         */
        loadInitialData() {
            const welcomeMessage = {
                type: 'assistant',
                content: "Hi! I'm your AI eyewear assistant. I can help you find the perfect frames by analyzing your face shape or understanding your style preferences. How would you like to start?",
                timestamp: Date.now()
            };

            this.addMessage(welcomeMessage);
        }

        /**
         * Toggle widget visibility
         */
        toggleWidget() {
            const chat = document.getElementById('woo-ai-chat');
            this.isOpen = !this.isOpen;
            chat.style.display = this.isOpen ? 'flex' : 'none';
        }

        /**
         * Close widget
         */
        closeWidget() {
            const chat = document.getElementById('woo-ai-chat');
            this.isOpen = false;
            chat.style.display = 'none';
        }

        /**
         * Handle quick action buttons
         */
        async handleQuickAction(action) {
            switch (action) {
                case 'face-analysis':
                    await this.startFaceAnalysis();
                    break;
                case 'ai-recommendations':
                    await this.startAIRecommendations();
                    break;
                case 'browse-products':
                    await this.browseProducts();
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
                content: 'Great! Let me start the face analysis. I\'ll need access to your camera to analyze your face shape.',
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
                content: 'Perfect! I\'ll analyze your facial features to provide personalized eyewear recommendations.',
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
            } catch (error) {
                this.handleCameraError(error);
            }
        }

        /**
         * Handle face analysis results
         */
        handleFaceAnalysisResults(results) {
            this.faceAnalysisResult = results;
            
            const resultMessage = {
                type: 'assistant',
                content: `Excellent! I've analyzed your face and determined you have a ${results.faceShape} face shape with ${Math.round(results.confidence * 100)}% confidence. Here are the frame styles that will look best on you:`,
                timestamp: Date.now(),
                faceAnalysis: results
            };

            this.addMessage(resultMessage);

            // Show frame recommendations
            const recommendationMessage = {
                type: 'assistant',
                content: `Based on your ${results.faceShape} face shape, I recommend these frame styles:`,
                timestamp: Date.now(),
                recommendations: results.recommendations
            };

            this.addMessage(recommendationMessage);
        }

        /**
         * Handle AI recommendations results
         */
        handleAIRecommendationsResults(results) {
            this.faceAnalysisResult = results;
            
            const resultMessage = {
                type: 'assistant',
                content: `Based on your facial analysis, I've found ${results.products.length} perfect eyewear recommendations tailored specifically for you:`,
                timestamp: Date.now(),
                products: results.products
            };

            this.addMessage(resultMessage);
        }

        /**
         * Handle camera errors
         */
        handleCameraError(error) {
            const errorMessage = {
                type: 'assistant',
                content: 'I\'m having trouble accessing your camera. This could be due to permissions or browser settings. Would you like to try again or continue without camera analysis?',
                timestamp: Date.now(),
                error: true
            };

            this.addMessage(errorMessage);
        }

        /**
         * Browse products without camera
         */
        async browseProducts() {
            const userMessage = {
                type: 'user',
                content: 'Browse products',
                timestamp: Date.now()
            };
            this.addMessage(userMessage);

            try {
                const products = await this.fetchProducts();
                
                const productMessage = {
                    type: 'assistant',
                    content: 'Here are our featured eyewear products:',
                    timestamp: Date.now(),
                    products: products
                };

                this.addMessage(productMessage);
            } catch (error) {
                const errorMessage = {
                    type: 'assistant',
                    content: 'Sorry, I\'m having trouble loading products right now. Please try again later.',
                    timestamp: Date.now(),
                    error: true
                };

                this.addMessage(errorMessage);
            }
        }

        /**
         * Send user message
         */
        async sendMessage() {
            const input = document.getElementById('woo-ai-input');
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
            } catch (error) {
                // Remove loading message
                this.removeLastMessage();
                
                const errorMessage = {
                    type: 'assistant',
                    content: 'I\'m sorry, I\'m having trouble processing your request right now. Please try again.',
                    timestamp: Date.now(),
                    error: true
                };

                this.addMessage(errorMessage);
            }
        }

        /**
         * Add message to chat
         */
        addMessage(message) {
            const messagesContainer = document.getElementById('woo-ai-messages');
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            this.conversationHistory.push(message);
        }

        /**
         * Remove last message (for loading states)
         */
        removeLastMessage() {
            const messagesContainer = document.getElementById('woo-ai-messages');
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
            div.className = `woo-ai-message ${message.type}`;
            
            let content = message.content;
            
            if (message.loading) {
                content += '<div class="woo-ai-loading"><div class="woo-ai-spinner"></div>Processing...</div>';
            }
            
            if (message.recommendations) {
                content += '<div class="woo-ai-recommendations">';
                message.recommendations.forEach(rec => {
                    content += `<span class="woo-ai-recommendation-tag">${rec}</span>`;
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
            let html = '<div class="woo-ai-product-grid">';
            
            products.forEach(product => {
                html += `
                    <div class="woo-ai-product-card" onclick="window.open('${product.url || '#'}', '_blank')">
                        <img src="${product.image}" alt="${product.name}" class="woo-ai-product-image" />
                        <div class="woo-ai-product-info">
                            <div class="woo-ai-product-name">${product.name}</div>
                            <div class="woo-ai-product-price">$${product.price}</div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            return html;
        }

        /**
         * Fetch products from WooCommerce API
         */
        async fetchProducts() {
            // Mock products for demo - replace with actual WooCommerce API call
            return [
                {
                    id: 1,
                    name: 'Classic Aviator',
                    price: 189.99,
                    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
                    url: '/product/classic-aviator'
                },
                {
                    id: 2,
                    name: 'Modern Rectangle',
                    price: 159.99,
                    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
                    url: '/product/modern-rectangle'
                },
                {
                    id: 3,
                    name: 'Designer Cat-Eye',
                    price: 229.99,
                    image: 'https://images.unsplash.com/photo-1513146581-976d6fdb6879?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
                    url: '/product/designer-cat-eye'
                }
            ];
        }

        /**
         * Send message to AI API
         */
        async sendToAPI(message) {
            // Mock API response - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return {
                message: "I understand you're looking for eyewear recommendations. Based on your query, here are some suggestions:",
                products: await this.fetchProducts()
            };
        }
    }

    // Auto-initialize widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new WooCommerceAIWidget();
        });
    } else {
        new WooCommerceAIWidget();
    }

    // Export for manual initialization
    window.WooCommerceAIWidget = WooCommerceAIWidget;

})();