/**
 * Consultation Chat Interface
 * Intelligent eyewear consultation chat widget that integrates with existing store
 * Connects to Dialogflow CX for natural conversation flow
 */

class ConsultationChat {
    constructor(config = {}) {
        this.config = {
            apiBaseUrl: config.apiBaseUrl || 'https://commerce-studio-api-ddtojwjn7a-uc.a.run.app',
            dialogflowProjectId: config.dialogflowProjectId || 'ml-datadriven-recos',
            dialogflowAgentId: config.dialogflowAgentId || '1601a958-7e8e-4abe-a0c8-93819aa7594a',
            language: config.language || 'en',
            ...config
        };
        
        this.sessionId = null;
        this.consultationStage = 'greeting';
        this.isOpen = false;
        this.isTyping = false;
        this.messageHistory = [];
        this.consultationData = {};
        
        // Integration with existing services
        this.apiIntegration = window.apiIntegration;
        this.cartManager = window.cartManager;
        
        // Initialize consultation service
        // this.initializeDialogflowService();
        
        // Create chat interface
        this.createChatInterface();
        this.setupEventListeners();
    }


    createChatInterface() {
        const chatHtml = `
            <div id="consultation-chat-widget" class="consultation-chat-widget">
                <!-- Chat Toggle Button -->
                <button id="chat-toggle" class="chat-toggle-btn" title="Start Eyewear Consultation">
                    <i class="bi bi-chat-dots-fill"></i>
                    <span class="chat-badge">AI</span>
                </button>
                
                <!-- Chat Window -->
                <div id="chat-window" class="chat-window">
                    <!-- Chat Header -->
                    <div class="chat-header">
                        <div class="chat-header-info">
                            <div class="consultant-avatar">
                                <i class="bi bi-robot"></i>
                            </div>
                            <div class="consultant-details">
                                <h6 class="consultant-name">AI Eyewear Consultant</h6>
                                <span class="consultant-status">Online • Ready to help</span>
                            </div>
                        </div>
                        <div class="chat-header-actions">
                            <button class="chat-minimize-btn" title="Minimize">
                                <i class="bi bi-dash"></i>
                            </button>
                            <button class="chat-close-btn" title="Close">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Chat Messages -->
                    <div id="chat-messages" class="chat-messages">
                        <div class="welcome-message">
                            <div class="consultant-avatar">
                                <i class="bi bi-robot"></i>
                            </div>
                            <div class="message-content">
                                <p>👋 Hi! I'm your personal AI eyewear consultant. I'll help you find the perfect frames based on your face shape, style preferences, and needs.</p>
                                <div class="quick-actions">
                                    <button class="quick-action-btn" data-action="start_consultation">
                                        <i class="bi bi-play-circle"></i> Start Consultation
                                    </button>
                                    <button class="quick-action-btn" data-action="browse_frames">
                                        <i class="bi bi-grid"></i> Browse Frames
                                    </button>
                                    <button class="quick-action-btn" data-action="virtual_tryon">
                                        <i class="bi bi-camera"></i> Virtual Try-On
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Typing Indicator -->
                    <div id="typing-indicator" class="typing-indicator" style="display: none;">
                        <div class="consultant-avatar">
                            <i class="bi bi-robot"></i>
                        </div>
                        <div class="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    
                    <!-- Chat Input -->
                    <div class="chat-input-container">
                        <div class="chat-input-wrapper">
                            <input type="text" id="chat-input" class="chat-input" 
                                   placeholder="Ask me anything about eyewear..." 
                                   autocomplete="off">
                            <button id="send-btn" class="send-btn" title="Send message">
                                <i class="bi bi-send-fill"></i>
                            </button>
                            <button id="voice-btn" class="voice-btn" title="Voice input">
                                <i class="bi bi-mic-fill"></i>
                            </button>
                        </div>
                        <div class="quick-replies" id="quick-replies" style="display: none;"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add chat widget to page
        document.body.insertAdjacentHTML('beforeend', chatHtml);
        
        // Add CSS styles
        this.addChatStyles();
    }

    addChatStyles() {
        const styles = `
            <style id="consultation-chat-styles">
                .consultation-chat-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                .chat-toggle-btn {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(44, 90, 160, 0.3);
                    transition: all 0.3s ease;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .chat-toggle-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 25px rgba(44, 90, 160, 0.4);
                }
                
                .chat-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #e74c3c;
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 10px;
                    line-height: 1;
                }
                
                .chat-window {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 380px;
                    height: 600px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    border: 1px solid #e9ecef;
                }
                
                .chat-window.open {
                    display: flex;
                    animation: chatSlideUp 0.3s ease-out;
                }
                
                @keyframes chatSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .chat-header {
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    padding: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .chat-header-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .consultant-avatar {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }
                
                .consultant-name {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 600;
                }
                
                .consultant-status {
                    font-size: 0.8rem;
                    opacity: 0.9;
                }
                
                .chat-header-actions {
                    display: flex;
                    gap: 5px;
                }
                
                .chat-minimize-btn, .chat-close-btn {
                    background: none;
                    border: none;
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                
                .chat-minimize-btn:hover, .chat-close-btn:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 15px;
                    background: #f8f9fa;
                }
                
                .welcome-message, .message {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                    align-items: flex-start;
                }
                
                .message.user {
                    flex-direction: row-reverse;
                }
                
                .message.user .message-content {
                    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                    color: white;
                    margin-left: 40px;
                }
                
                .message-content {
                    background: white;
                    padding: 12px 15px;
                    border-radius: 15px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    max-width: 280px;
                    margin-right: 40px;
                }
                
                .message-content p {
                    margin: 0;
                    line-height: 1.4;
                    font-size: 0.9rem;
                }
                
                .quick-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-top: 12px;
                }
                
                .quick-action-btn {
                    background: var(--bg-light);
                    border: 1px solid #dee2e6;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    text-align: left;
                }
                
                .quick-action-btn:hover {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }
                
                .typing-indicator {
                    display: flex;
                    gap: 10px;
                    padding: 0 15px 15px;
                    align-items: center;
                }
                
                .typing-dots {
                    display: flex;
                    gap: 4px;
                    padding: 12px 15px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                .typing-dots span {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #bbb;
                    animation: typingDot 1.4s infinite;
                }
                
                .typing-dots span:nth-child(2) {
                    animation-delay: 0.2s;
                }
                
                .typing-dots span:nth-child(3) {
                    animation-delay: 0.4s;
                }
                
                @keyframes typingDot {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 0.4;
                    }
                    30% {
                        transform: translateY(-10px);
                        opacity: 1;
                    }
                }
                
                .chat-input-container {
                    padding: 15px;
                    background: white;
                    border-top: 1px solid #e9ecef;
                }
                
                .chat-input-wrapper {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                
                .chat-input {
                    flex: 1;
                    border: 1px solid #dee2e6;
                    border-radius: 25px;
                    padding: 10px 15px;
                    font-size: 0.9rem;
                    outline: none;
                    transition: border-color 0.2s ease;
                }
                
                .chat-input:focus {
                    border-color: var(--primary-color);
                }
                
                .send-btn, .voice-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: none;
                    background: var(--primary-color);
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                
                .send-btn:hover, .voice-btn:hover {
                    background: var(--secondary-color);
                    transform: scale(1.05);
                }
                
                .voice-btn {
                    background: #28a745;
                }
                
                .voice-btn.recording {
                    background: #dc3545;
                    animation: pulse 1s infinite;
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                .quick-replies {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-top: 10px;
                }
                
                .quick-reply-btn {
                    background: var(--bg-light);
                    border: 1px solid #dee2e6;
                    padding: 6px 12px;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .quick-reply-btn:hover {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }
                
                /* Store Locator Interface Styles */
                .store-locator-interface {
                    max-width: 100%;
                }
                
                .store-locator-container {
                    margin-top: 15px;
                }
                
                .store-map-section {
                    margin-bottom: 15px;
                }
                
                .store-map-placeholder {
                    height: 150px;
                    background: #f8f9fa;
                    border: 2px dashed #dee2e6;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .store-map-placeholder:hover {
                    background: #e9ecef;
                    border-color: var(--primary-color);
                }
                
                .map-placeholder-content {
                    text-align: center;
                    color: #6c757d;
                }
                
                .map-placeholder-content i {
                    font-size: 2rem;
                    margin-bottom: 8px;
                    color: var(--primary-color);
                }
                
                .store-card {
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    transition: all 0.2s ease;
                }
                
                .store-card:hover {
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    border-color: var(--primary-color);
                }
                
                .store-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 10px;
                }
                
                .store-name {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-dark);
                }
                
                .store-distance {
                    background: var(--accent-color);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }
                
                .store-details p {
                    margin: 5px 0;
                    font-size: 0.9rem;
                    color: #6c757d;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .store-details i {
                    width: 14px;
                    color: var(--primary-color);
                }
                
                .store-inventory {
                    margin: 12px 0;
                    padding: 12px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                
                .store-inventory h6 {
                    margin: 0 0 8px 0;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-dark);
                }
                
                .inventory-item {
                    margin: 6px 0;
                    padding: 8px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                }
                
                .inventory-item.in-stock {
                    background: #d4edda;
                    border: 1px solid #c3e6cb;
                }
                
                .inventory-item.out-of-stock {
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                }
                
                .frame-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 500;
                }
                
                .frame-status i {
                    font-size: 0.9rem;
                }
                
                .in-stock .frame-status {
                    color: #155724;
                }
                
                .out-of-stock .frame-status {
                    color: #721c24;
                }
                
                .frame-options {
                    margin-top: 4px;
                    font-size: 0.75rem;
                    color: #495057;
                }
                
                .frame-options small {
                    display: block;
                    margin: 2px 0;
                }
                
                .store-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                    flex-wrap: wrap;
                }
                
                .store-actions .btn {
                    font-size: 0.8rem;
                    padding: 6px 12px;
                }
                
                /* Location Input Styles */
                .location-input-container {
                    margin: 15px 0;
                }
                
                .location-input-form {
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                }
                
                .location-input-form .form-control {
                    flex: 1;
                    border-radius: 20px;
                    border: 1px solid #dee2e6;
                    padding: 8px 15px;
                    font-size: 0.9rem;
                }
                
                .location-input-form .btn {
                    border-radius: 20px;
                    padding: 8px 15px;
                    font-size: 0.9rem;
                }
                
                /* Reservation Form Styles */
                .reservation-form {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 15px 0;
                }
                
                .reservation-form h6 {
                    margin: 0 0 15px 0;
                    color: var(--primary-color);
                    font-weight: 600;
                }
                
                .form-group {
                    margin-bottom: 15px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                    font-size: 0.9rem;
                    color: var(--text-dark);
                }
                
                .form-control {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    transition: border-color 0.2s ease;
                }
                
                .form-control:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.1);
                }
                
                .form-row {
                    display: flex;
                    gap: 10px;
                }
                
                .form-row .form-group {
                    flex: 1;
                }
                
                .reservation-terms {
                    margin: 15px 0;
                    padding: 10px;
                    background: #e9ecef;
                    border-radius: 6px;
                }
                
                .form-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }
                
                /* Reservation Confirmation Styles */
                .reservation-confirmation {
                    background: #d4edda;
                    border: 1px solid #c3e6cb;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 15px 0;
                }
                
                .confirmation-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                
                .confirmation-header i {
                    font-size: 1.5rem;
                }
                
                .confirmation-header h6 {
                    margin: 0;
                    color: #155724;
                    font-weight: 600;
                }
                
                .confirmation-details {
                    margin: 15px 0;
                }
                
                .confirmation-details p {
                    margin: 5px 0;
                    font-size: 0.9rem;
                    color: #155724;
                }
                
                .confirmation-actions {
                    display: flex;
                    gap: 8px;
                    margin: 15px 0;
                    flex-wrap: wrap;
                }
                
                .next-steps {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid #c3e6cb;
                }
                
                /* Contact Options Styles */
                .contact-options {
                    margin: 15px 0;
                }
                
                .contact-buttons {
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                    flex-wrap: wrap;
                }
                
                .callback-form {
                    margin: 15px 0;
                }
                
                .callback-options {
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                    flex-wrap: wrap;
                }
                
                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .chat-window {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 140px);
                        bottom: 80px;
                        right: 20px;
                        left: 20px;
                    }
                    
                    .consultation-chat-widget {
                        right: 20px;
                        bottom: 20px;
                    }
                    
                    .store-actions,
                    .confirmation-actions,
                    .contact-buttons,
                    .callback-options {
                        flex-direction: column;
                    }
                    
                    .store-actions .btn,
                    .confirmation-actions .btn,
                    .contact-buttons .btn,
                    .callback-options .btn {
                        width: 100%;
                        margin: 2px 0;
                    }
                    
                    .form-row {
                        flex-direction: column;
                    }
                    
                    .location-input-form {
                        flex-direction: column;
                    }
                    
                    .form-actions {
                        flex-direction: column;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    setupEventListeners() {
        // Chat toggle
        document.getElementById('chat-toggle').addEventListener('click', () => {
            this.toggleChat();
        });
        
        // Chat close/minimize
        document.querySelector('.chat-close-btn').addEventListener('click', () => {
            this.closeChat();
        });
        
        document.querySelector('.chat-minimize-btn').addEventListener('click', () => {
            this.minimizeChat();
        });
        
        // Message input
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Voice input
        document.getElementById('voice-btn').addEventListener('click', () => {
            this.toggleVoiceInput();
        });
        
        // Quick actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            }
            
            if (e.target.classList.contains('quick-reply-btn')) {
                const reply = e.target.textContent;
                this.sendMessage(reply);
            }
        });
    }

    toggleChat() {
        const chatWindow = document.getElementById('chat-window');
        
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    async openChat() {
        const chatWindow = document.getElementById('chat-window');
        chatWindow.classList.add('open');
        this.isOpen = true;
        
        // Focus input
        setTimeout(() => {
            document.getElementById('chat-input').focus();
        }, 300);
        
        // Start consultation if not already started
        if (!this.sessionId) {
            await this.startConsultation();
        }
    }

    closeChat() {
        const chatWindow = document.getElementById('chat-window');
        chatWindow.classList.remove('open');
        this.isOpen = false;
    }

    minimizeChat() {
        this.closeChat();
    }

    async startConsultation() {
        try {
            this.displayMessage("Starting a new consultation...", 'system');
            const response = await visionCraftClient.request('/consultation/start', 'POST');
            this.sessionId = response.sessionId;
            this.displayMessage(response.message, 'consultant');
            this.consultationStage = 'needs_assessment';
        } catch (error) {
            console.error('Error starting consultation:', error);
            this.showError('Failed to start consultation. Please try again.');
        }
    }

    async sendMessage(message = null) {
        const input = message || document.getElementById('chat-input').value.trim();
        if (!input) return;

        this.displayMessage(input, 'user');
        document.getElementById('chat-input').value = '';
        this.showTyping(true);

        try {
            const response = await visionCraftClient.request('/consultation/message', 'POST', { message: input, sessionId: this.sessionId });
            this.showTyping(false);
            this.handleConsultationResponse(response);
        } catch (error) {
            console.error('Error sending message:', error);
            this.showTyping(false);
            this.showError('Sorry, I encountered an error. Please try again.');
        }
    }

    displayMessage(text, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'consultant-avatar';
        avatarDiv.innerHTML = sender === 'user' ? '<i class="bi bi-person-fill"></i>' : '<i class="bi bi-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `<p>${text}</p>`;
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Store in history
        this.messageHistory.push({ text, sender, timestamp: Date.now() });
    }

    showTyping(show) {
        const typingIndicator = document.getElementById('typing-indicator');
        typingIndicator.style.display = show ? 'flex' : 'none';
        
        if (show) {
            const messagesContainer = document.getElementById('chat-messages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        this.isTyping = show;
    }

    showQuickReplies(replies) {
        const quickRepliesContainer = document.getElementById('quick-replies');
        
        if (!replies || replies.length === 0) {
            quickRepliesContainer.style.display = 'none';
            return;
        }
        
        quickRepliesContainer.innerHTML = '';
        replies.forEach(reply => {
            const button = document.createElement('button');
            button.className = 'quick-reply-btn';
            button.textContent = reply;
            quickRepliesContainer.appendChild(button);
        });
        
        quickRepliesContainer.style.display = 'flex';
    }

    async handleConsultationResponse(response) {
        if (!response.consultationData) return;
        
        const data = response.consultationData;
        
        switch (data.type) {
            case 'face_analysis_request':
                await this.handleFaceAnalysisRequest(data);
                break;
            case 'virtual_tryon_request':
                await this.handleVirtualTryOnRequest(data);
                break;
            case 'recommendation_request':
                await this.handleRecommendationRequest(data);
                break;
            case 'store_locator_request':
                await this.handleStoreLocatorRequest(data);
                break;
        }
    }

    async handleFaceAnalysisRequest(data) {
        // Request camera permission and start face analysis
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Create camera interface
            this.showCameraInterface('face-analysis', stream);
            
        } catch (error) {
            console.error('Camera access denied:', error);
            this.displayMessage("I need camera access to analyze your face shape. Please allow camera permission and try again.", 'assistant');
        }
    }

    async handleVirtualTryOnRequest(data) {
        // Start virtual try-on with selected frame
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Create VTO interface
            this.showCameraInterface('virtual-tryon', stream, data.frameId);
            
        } catch (error) {
            console.error('Camera access denied:', error);
            this.displayMessage("I need camera access for virtual try-on. Please allow camera permission and try again.", 'assistant');
        }
    }

    async handleRecommendationRequest(data) {
        // Get personalized recommendations
        try {
            const recommendations = await this.apiIntegration.getPersonalizedRecommendations(
                this.sessionId,
                data.criteria.faceShape,
                data.criteria
            );
            
            if (recommendations.success) {
                this.showRecommendations(recommendations.recommendations);
            }
            
        } catch (error) {
            console.error('Error getting recommendations:', error);
            this.displayMessage("I'm having trouble getting your recommendations. Let me show you some popular options instead.", 'assistant');
        }
    }

    async handleStoreLocatorRequest(data) {
        // Find nearby stores with enhanced functionality
        try {
            if (navigator.geolocation) {
                this.displayMessage("Let me find stores near you...", 'assistant');
                this.showTyping(true);
                
                navigator.geolocation.getCurrentPosition(async (position) => {
                    try {
                        const response = await fetch('/consultation/store-locator', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                sessionId: this.sessionId,
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                frameIds: data.selectedFrames || []
                            })
                        });
                        
                        const result = await response.json();
                        this.showTyping(false);
                        
                        if (result.success) {
                            this.showStoreLocatorInterface(result.stores, {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                            }, result.recommendedFrames);
                        } else {
                            this.displayMessage("I couldn't find stores in your area. Please try a different location.", 'assistant');
                        }
                        
                    } catch (error) {
                        this.showTyping(false);
                        console.error('Error finding stores:', error);
                        this.displayMessage("I'm having trouble finding stores near you. Please try again later.", 'assistant');
                    }
                }, (error) => {
                    this.showTyping(false);
                    console.error('Geolocation error:', error);
                    this.displayMessage("I need your location to find nearby stores. Please allow location access or enter your location manually.", 'assistant');
                    this.showLocationInput();
                });
            } else {
                this.displayMessage("Your browser doesn't support location services. Please enter your location manually.", 'assistant');
                this.showLocationInput();
            }
            
        } catch (error) {
            console.error('Error in store locator request:', error);
            this.displayMessage("I'm having trouble with the store locator. Please try again later.", 'assistant');
        }
    }

    showCameraInterface(type, stream, frameId = null) {
        // This would integrate with existing VTO functionality
        // For now, show a placeholder message
        this.displayMessage(`Camera interface for ${type} would appear here. Integration with existing VTO system pending.`, 'assistant');
        
        // Stop the stream for now
        stream.getTracks().forEach(track => track.stop());
    }

    showRecommendations(recommendations) {
        // Display recommendations in chat
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'consultant-avatar';
        avatarDiv.innerHTML = '<i class="bi bi-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        let html = '<p>Here are my personalized recommendations for you:</p>';
        html += '<div class="recommendations-grid">';
        
        recommendations.slice(0, 3).forEach(rec => {
            html += `
                <div class="recommendation-card">
                    <img src="${rec.image || '/images/placeholder-frame.jpg'}" alt="${rec.name}">
                    <h6>${rec.name}</h6>
                    <p class="price">$${rec.price}</p>
                    <button class="btn btn-sm btn-primary" onclick="window.consultationChat.selectFrame('${rec.id}')">
                        Try On
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
        contentDiv.innerHTML = html;
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        document.getElementById('chat-messages').appendChild(messageDiv);
        document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
    }

    showStoreLocatorInterface(stores, userLocation, recommendedFrames = []) {
        // Create enhanced store locator interface
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'consultant-avatar';
        avatarDiv.innerHTML = '<i class="bi bi-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content store-locator-interface';
        
        let html = `
            <p>I found ${stores.length} stores near you!</p>
            <div class="store-locator-container">
                <div class="store-map-section">
                    <div id="store-map-${Date.now()}" class="store-map-placeholder">
                        <div class="map-placeholder-content">
                            <i class="bi bi-geo-alt-fill"></i>
                            <p>Interactive Map</p>
                            <small>Showing ${stores.length} nearby stores</small>
                        </div>
                    </div>
                </div>
                <div class="store-list-section">
                    ${stores.map(store => this.createStoreCard(store, recommendedFrames)).join('')}
                </div>
            </div>
        `;
        
        contentDiv.innerHTML = html;
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        document.getElementById('chat-messages').appendChild(messageDiv);
        document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
        
        // Initialize map if available
        this.initializeStoreMap(userLocation, stores);
    }

    createStoreCard(store, recommendedFrames = []) {
        const hasRecommendedInventory = store.inventory &&
            store.inventory.some(frame => frame.inStock && recommendedFrames.includes(frame.frameId));
        
        return `
            <div class="store-card" data-store-id="${store.id}">
                <div class="store-header">
                    <h6 class="store-name">${store.name}</h6>
                    <span class="store-distance">${store.distance} mi</span>
                </div>
                <div class="store-details">
                    <p class="store-address">
                        <i class="bi bi-geo-alt"></i>
                        ${store.address}
                    </p>
                    <p class="store-phone">
                        <i class="bi bi-telephone"></i>
                        ${store.phone}
                    </p>
                    <div class="store-hours">
                        <i class="bi bi-clock"></i>
                        <small>${this.getStoreHoursToday(store.hours)}</small>
                    </div>
                </div>
                
                ${store.inventory && store.inventory.length > 0 ? `
                    <div class="store-inventory">
                        <h6>Frame Availability</h6>
                        ${store.inventory.map(frame => `
                            <div class="inventory-item ${frame.inStock ? 'in-stock' : 'out-of-stock'}">
                                <span class="frame-status">
                                    <i class="bi bi-${frame.inStock ? 'check-circle-fill' : 'x-circle-fill'}"></i>
                                    Frame ${frame.frameId} ${frame.inStock ? 'Available' : 'Out of Stock'}
                                </span>
                                ${frame.inStock ? `
                                    <div class="frame-options">
                                        <small>Sizes: ${frame.sizes ? frame.sizes.join(', ') : 'Standard'}</small>
                                        <small>Colors: ${frame.colors ? frame.colors.join(', ') : 'Black'}</small>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="store-actions">
                    <button class="btn btn-outline-primary btn-sm"
                            onclick="window.consultationChat.getDirections('${store.id}')">
                        <i class="bi bi-map"></i> Directions
                    </button>
                    ${hasRecommendedInventory ? `
                        <button class="btn btn-primary btn-sm"
                                onclick="window.consultationChat.startReservation('${store.id}')">
                            <i class="bi bi-bookmark-plus"></i> Reserve Frames
                        </button>
                    ` : `
                        <button class="btn btn-outline-secondary btn-sm"
                                onclick="window.consultationChat.contactStore('${store.id}')">
                            <i class="bi bi-telephone"></i> Call Store
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    getStoreHoursToday(hours) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = days[new Date().getDay()];
        return hours[today] || 'Hours not available';
    }

    initializeStoreMap(userLocation, stores) {
        // Simple map placeholder - in production would integrate with Google Maps or Leaflet
        const mapElements = document.querySelectorAll('.store-map-placeholder');
        mapElements.forEach(mapEl => {
            mapEl.addEventListener('click', () => {
                this.openFullMap(userLocation, stores);
            });
        });
    }

    openFullMap(userLocation, stores) {
        // Open external map with store locations
        const storeCoords = stores.map(store =>
            `${store.coordinates.lat},${store.coordinates.lng}`
        ).join('|');
        
        const mapsUrl = `https://www.google.com/maps/search/eyewear+store/@${userLocation.latitude},${userLocation.longitude},14z`;
        window.open(mapsUrl, '_blank');
    }

    showLocationInput() {
        const html = `
            <div class="location-input-container">
                <p>Please enter your location to find nearby stores:</p>
                <div class="location-input-form">
                    <input type="text" id="manual-location" class="form-control"
                           placeholder="Enter city, state or zip code">
                    <button class="btn btn-primary" onclick="window.consultationChat.searchByLocation()">
                        <i class="bi bi-search"></i> Find Stores
                    </button>
                </div>
            </div>
        `;
        this.displayMessage(html, 'assistant');
    }

    async searchByLocation() {
        const locationInput = document.getElementById('manual-location');
        const location = locationInput.value.trim();
        
        if (!location) {
            this.displayMessage("Please enter a valid location.", 'assistant');
            return;
        }

        try {
            // In production, would geocode the address first
            this.displayMessage(`Searching for stores near "${location}"...`, 'assistant');
            this.displayMessage("Manual location search would be implemented with geocoding service.", 'assistant');
            
        } catch (error) {
            console.error('Error searching by location:', error);
            this.displayMessage("I had trouble searching for that location. Please try again.", 'assistant');
        }
    }

    async handleQuickAction(action) {
        switch (action) {
            case 'start_consultation':
                await this.sendMessage("I'd like to start a consultation to find the perfect frames");
                break;
            case 'browse_frames':
                await this.sendMessage("Show me different frame styles");
                break;
            case 'virtual_tryon':
                await this.sendMessage("I want to try on frames virtually");
                break;
        }
    }

    selectFrame(frameId) {
        this.sendMessage(`I'd like to try on frame ${frameId}`);
    }

    selectStore(storeId) {
        this.sendMessage(`I'd like to reserve frames at store ${storeId}`);
    }

    // Enhanced store locator methods
    getDirections(storeId) {
        // Get store details and open directions
        const storeCard = document.querySelector(`[data-store-id="${storeId}"]`);
        if (storeCard) {
            const storeName = storeCard.querySelector('.store-name').textContent;
            const storeAddress = storeCard.querySelector('.store-address').textContent.replace(/^\s*\S+\s*/, ''); // Remove icon
            
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeAddress)}`;
            window.open(directionsUrl, '_blank');
            
            this.displayMessage(`Opening directions to ${storeName}...`, 'assistant');
        }
    }

    contactStore(storeId) {
        // Get store phone number and offer contact options
        const storeCard = document.querySelector(`[data-store-id="${storeId}"]`);
        if (storeCard) {
            const storeName = storeCard.querySelector('.store-name').textContent;
            const storePhone = storeCard.querySelector('.store-phone').textContent.replace(/^\s*\S+\s*/, ''); // Remove icon
            
            const contactHtml = `
                <div class="contact-options">
                    <p>Contact ${storeName}:</p>
                    <div class="contact-buttons">
                        <a href="tel:${storePhone}" class="btn btn-primary btn-sm">
                            <i class="bi bi-telephone"></i> Call ${storePhone}
                        </a>
                        <button class="btn btn-outline-primary btn-sm"
                                onclick="window.consultationChat.scheduleCallback('${storeId}')">
                            <i class="bi bi-calendar"></i> Schedule Callback
                        </button>
                    </div>
                </div>
            `;
            this.displayMessage(contactHtml, 'assistant');
        }
    }

    async startReservation(storeId) {
        // Start the BOPIS reservation process
        try {
            const storeCard = document.querySelector(`[data-store-id="${storeId}"]`);
            if (!storeCard) {
                this.displayMessage("Sorry, I couldn't find the store information. Please try again.", 'assistant');
                return;
            }

            const storeName = storeCard.querySelector('.store-name').textContent;
            
            // Get available frames from the store card
            const inventoryItems = storeCard.querySelectorAll('.inventory-item.in-stock');
            if (inventoryItems.length === 0) {
                this.displayMessage("I don't see any recommended frames available at this store. Would you like me to check other locations?", 'assistant');
                return;
            }

            // Show reservation form
            this.showReservationForm(storeId, storeName, inventoryItems);
            
        } catch (error) {
            console.error('Error starting reservation:', error);
            this.displayMessage("I had trouble starting the reservation. Please try again.", 'assistant');
        }
    }

    showReservationForm(storeId, storeName, availableFrames) {
        const frameOptions = Array.from(availableFrames).map(item => {
            const frameText = item.querySelector('.frame-status').textContent;
            const frameId = frameText.match(/Frame (\w+)/)?.[1] || 'unknown';
            return { id: frameId, name: frameText };
        });

        const formHtml = `
            <div class="reservation-form">
                <h6>Reserve Frames at ${storeName}</h6>
                <form id="bopis-reservation-form" onsubmit="window.consultationChat.submitReservation(event)">
                    <input type="hidden" name="storeId" value="${storeId}">
                    
                    <div class="form-group">
                        <label>Select Frame:</label>
                        <select name="frameId" class="form-control" required>
                            <option value="">Choose a frame...</option>
                            ${frameOptions.map(frame =>
                                `<option value="${frame.id}">${frame.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label>Size:</label>
                            <select name="size" class="form-control">
                                <option value="Small">Small</option>
                                <option value="Medium" selected>Medium</option>
                                <option value="Large">Large</option>
                            </select>
                        </div>
                        <div class="form-group col-md-6">
                            <label>Color:</label>
                            <select name="color" class="form-control">
                                <option value="Black" selected>Black</option>
                                <option value="Brown">Brown</option>
                                <option value="Silver">Silver</option>
                                <option value="Blue">Blue</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Your Name:</label>
                        <input type="text" name="customerName" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" name="customerEmail" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Phone:</label>
                        <input type="tel" name="customerPhone" class="form-control" required>
                    </div>
                    
                    <div class="reservation-terms">
                        <small class="text-muted">
                            <i class="bi bi-info-circle"></i>
                            Frames will be held for 24 hours. You'll receive a confirmation email with pickup details.
                        </small>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-bookmark-plus"></i> Reserve Frames
                        </button>
                        <button type="button" class="btn btn-outline-secondary"
                                onclick="window.consultationChat.cancelReservation()">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        this.displayMessage(formHtml, 'assistant');
    }

    async submitReservation(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const reservationData = {
            storeId: formData.get('storeId'),
            frameId: formData.get('frameId'),
            size: formData.get('size'),
            color: formData.get('color'),
            customerInfo: {
                name: formData.get('customerName'),
                email: formData.get('customerEmail'),
                phone: formData.get('customerPhone')
            },
            sessionId: this.sessionId
        };

        try {
            this.showTyping(true);
            
            const response = await fetch('/api/stores/reserve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservationData)
            });

            const result = await response.json();
            this.showTyping(false);

            if (result.success) {
                this.showReservationConfirmation(result.reservation);
            } else {
                this.displayMessage(`Sorry, I couldn't complete your reservation: ${result.error}`, 'assistant');
            }

        } catch (error) {
            this.showTyping(false);
            console.error('Error submitting reservation:', error);
            this.displayMessage("I had trouble processing your reservation. Please try again or call the store directly.", 'assistant');
        }
    }

    showReservationConfirmation(reservation) {
        const confirmationHtml = `
            <div class="reservation-confirmation">
                <div class="confirmation-header">
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <h6>Reservation Confirmed!</h6>
                </div>
                
                <div class="confirmation-details">
                    <p><strong>Confirmation Code:</strong> ${reservation.confirmationCode}</p>
                    <p><strong>Store:</strong> ${reservation.store}</p>
                    <p><strong>Address:</strong> ${reservation.storeAddress}</p>
                    <p><strong>Customer:</strong> ${reservation.customerName}</p>
                    <p><strong>Expires:</strong> ${new Date(reservation.expiresAt).toLocaleString()}</p>
                </div>
                
                <div class="confirmation-actions">
                    <a href="tel:${reservation.storePhone}" class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-telephone"></i> Call Store
                    </a>
                    <button class="btn btn-primary btn-sm"
                            onclick="window.consultationChat.emailConfirmation('${reservation.id}')">
                        <i class="bi bi-envelope"></i> Email Details
                    </button>
                </div>
                
                <div class="next-steps">
                    <small class="text-muted">
                        <strong>Next Steps:</strong><br>
                        • Bring a valid ID when picking up<br>
                        • Call ahead to confirm availability<br>
                        • Frames will be held for 24 hours
                    </small>
                </div>
            </div>
        `;
        
        this.displayMessage(confirmationHtml, 'assistant');
        
        // Clear the form
        const form = document.getElementById('bopis-reservation-form');
        if (form) {
            form.style.display = 'none';
        }
    }

    cancelReservation() {
        this.displayMessage("Reservation cancelled. Is there anything else I can help you with?", 'assistant');
        
        // Hide the form
        const form = document.getElementById('bopis-reservation-form');
        if (form) {
            form.style.display = 'none';
        }
    }

    scheduleCallback(storeId) {
        const callbackHtml = `
            <div class="callback-form">
                <p>I'll help you schedule a callback from the store.</p>
                <div class="callback-options">
                    <button class="btn btn-outline-primary btn-sm"
                            onclick="window.consultationChat.sendMessage('Schedule a callback for today')">
                        Today
                    </button>
                    <button class="btn btn-outline-primary btn-sm"
                            onclick="window.consultationChat.sendMessage('Schedule a callback for tomorrow')">
                        Tomorrow
                    </button>
                    <button class="btn btn-outline-primary btn-sm"
                            onclick="window.consultationChat.sendMessage('Schedule a callback for this week')">
                        This Week
                    </button>
                </div>
            </div>
        `;
        this.displayMessage(callbackHtml, 'assistant');
    }

    emailConfirmation(reservationId) {
        this.displayMessage("I'll send the confirmation details to your email address. Please check your inbox in a few minutes.", 'assistant');
        // In production, would trigger email service
    }

    async toggleVoiceInput() {
        const voiceBtn = document.getElementById('voice-btn');
        
        if (!this.voiceService) {
            // Initialize voice service if not already done
            try {
                const { default: ConsultationVoiceService } = await import('/services/consultation-voice-service.js');
                this.voiceService = new ConsultationVoiceService();
                await this.voiceService.initialize();
            } catch (error) {
                console.error('Failed to initialize voice service:', error);
                this.showError('Voice service unavailable. Please try again later.');
                return;
            }
        }

        if (this.voiceService.isListening) {
            // Stop listening
            try {
                await this.voiceService.stopVoiceInput();
                voiceBtn.classList.remove('recording');
                voiceBtn.innerHTML = '<i class="bi bi-mic-fill"></i>';
                voiceBtn.title = 'Start voice input';
            } catch (error) {
                console.error('Failed to stop voice input:', error);
                this.showError('Failed to stop voice input. Please try again.');
            }
        } else {
            // Start listening
            try {
                await this.voiceService.startVoiceInput(this.sessionId, {
                    language: 'en-US',
                    continuous: true
                });
                
                voiceBtn.classList.add('recording');
                voiceBtn.innerHTML = '<i class="bi bi-mic-mute-fill"></i>';
                voiceBtn.title = 'Stop voice input';
                
                // Set up voice event listeners
                this.setupVoiceEventListeners();
                
            } catch (error) {
                console.error('Failed to start voice input:', error);
                this.showError('Failed to start voice input. Please check microphone permissions.');
            }
        }
    }

    setupVoiceEventListeners() {
        if (!this.voiceService) return;

        // Listen for voice input processed
        this.voiceService.on('voiceInputProcessed', (data) => {
            if (data.result.isCommand) {
                // Handle voice command
                this.handleVoiceCommand(data.result.command, data.result.intent);
            } else {
                // Handle speech-to-text
                const chatInput = document.getElementById('chat-input');
                chatInput.value = data.result.transcript;
                
                // Optionally auto-send the message
                if (data.result.confidence > 0.8) {
                    this.sendMessage();
                }
            }
        });

        // Listen for voice errors
        this.voiceService.on('error', (error) => {
            console.error('Voice service error:', error);
            this.showError('Voice input error. Please try again.');
            this.resetVoiceButton();
        });
    }

    async handleVoiceCommand(command, intent) {
        console.log(`Voice command received: ${command} (intent: ${intent})`);
        
        switch (intent) {
            case 'consultation.start':
                await this.startConsultation();
                break;
            case 'face.analysis_request':
                await this.handleQuickAction('start_face_analysis');
                break;
            case 'recommendation.request':
                await this.sendMessage('Show me recommendations');
                break;
            case 'store.locator_request':
                await this.sendMessage('Find stores near me');
                break;
            case 'virtual.tryon_request':
                await this.handleQuickAction('virtual_tryon');
                break;
            case 'help.general':
                await this.sendMessage('Help');
                break;
            case 'system.repeat':
                // Repeat last assistant message
                if (this.lastBotMessage) {
                    await this.speakMessage(this.lastBotMessage);
                }
                break;
            case 'system.stop_voice':
                await this.toggleVoiceInput();
                break;
            default:
                // Treat as regular text input
                await this.sendMessage(command);
        }
    }

    async speakMessage(text) {
        if (!this.voiceService || !this.consultationConfig?.voiceResponseEnabled) {
            return;
        }

        try {
            const result = await this.voiceService.speakResponse(text, {
                language: 'en-US',
                speakingRate: 1.0
            });
            
            if (result.success) {
                // Play the audio
                const audio = new Audio();
                audio.src = `data:audio/mp3;base64,${result.audioContent}`;
                audio.play();
            }
        } catch (error) {
            console.error('Failed to speak message:', error);
        }
    }

    resetVoiceButton() {
        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn) {
            voiceBtn.classList.remove('recording');
            voiceBtn.innerHTML = '<i class="bi bi-mic-fill"></i>';
            voiceBtn.title = 'Start voice input';
        }
        // Voice input functionality would be implemented here
        // Integration with existing Google Speech service
        this.displayMessage("Voice input feature coming soon!", 'assistant');
    }

    showError(message) {
        this.displayMessage(`⚠️ ${message}`, 'assistant');
    }

    // Public API methods
    async getConsultationData() {
        if (this.consultationService && this.sessionId) {
            return await this.consultationService.exportConsultationData(this.sessionId);
        }
        return null;
    }

    resetConsultation() {
        this.sessionId = null;
        this.consultationStage = 'greeting';
        this.messageHistory = [];
        this.consultationData = {};
        
        // Clear chat messages
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <div class="consultant-avatar">
                    <i class="bi bi-robot"></i>
                </div>
                <div class="message-content">
                    <p>👋 Hi! I'm your personal AI eyewear consultant. I'll help you find the perfect frames based on your face shape, style preferences, and needs.</p>
                    <div class="quick-actions">
                        <button class="quick-action-btn" data-action="start_consultation">
                            <i class="bi bi-play-circle"></i> Start Consultation
                        </button>
                        <button class="quick-action-btn" data-action="browse_frames">
                            <i class="bi bi-grid"></i> Browse Frames
                        </button>
                        <button class="quick-action-btn" data-action="virtual_tryon">
                            <i class="bi bi-camera"></i> Virtual Try-On
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Create global instance
window.consultationChat = new ConsultationChat();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConsultationChat;
}