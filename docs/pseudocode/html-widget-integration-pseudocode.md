# HTML Store Widget Integration Pseudocode
## Agent 3: Platform Integration Pseudocode Agent

## Document Information
- **Document Type**: HTML Widget Integration Pseudocode
- **System**: EyewearML Varai AI Discovery
- **Version**: 1.0
- **Date**: January 2025
- **Author**: Agent 3 - Platform Integration Pseudocode Agent

## Executive Summary

This document provides comprehensive pseudocode for integrating Varai AI discovery into HTML/Custom stores through an embeddable widget, building on the existing [`apps/html-store/`](apps/html-store/) structure and specifications from Agent 1 and Agent 2.

## HTML Widget Architecture Pseudocode

### Universal Widget Implementation

Building on [`apps/html-store/index.html`](apps/html-store/index.html:1):

```javascript
// Universal HTML Store AI Discovery Widget
CLASS VaraiUniversalWidget {
  
  FUNCTION constructor(config = {}) {
    // Default configuration
    this.config = {
      apiEndpoint: config.apiEndpoint || 'https://api.varai.ai',
      apiKey: config.apiKey || '',
      containerId: config.containerId || 'varai-widget',
      placement: config.placement || 'bottom-right',
      primaryColor: config.primaryColor || '#2c5aa0',
      secondaryColor: config.secondaryColor || '#f8f9fa',
      enableFaceAnalysis: config.enableFaceAnalysis !== false,
      enableVirtualTryOn: config.enableVirtualTryOn !== false,
      language: config.language || 'en',
      customCSS: config.customCSS || '',
      debug: config.debug || false,
      ...config
    }
    
    this.sessionId = this.generateSessionId()
    this.isInitialized = false
    this.isOpen = false
    this.faceAnalysisEngine = null
    this.conversationHistory = []
    this.currentProducts = []
    this.analytics = NEW AnalyticsTracker(this.config)
    
    this.init()
  }
  
  // Initialize widget
  FUNCTION init() {
    // Validate configuration
    IF (!this.validateConfig()) {
      console.error('Varai Widget: Invalid configuration')
      RETURN
    }
    
    // Load dependencies
    this.loadDependencies()
      .then(() => this.initializeComponents())
      .then(() => this.createWidgetUI())
      .then(() => this.setupEventListeners())
      .then(() => {
        this.isInitialized = true
        this.fireEvent('widget:initialized')
        IF (this.config.debug) console.log('Varai Widget initialized successfully')
      })
      .catch(error => {
        console.error('Varai Widget initialization failed:', error)
        this.fireEvent('widget:error', { error })
      })
  }
  
  // Validate configuration
  FUNCTION validateConfig() {
    IF (!this.config.apiEndpoint) {
      console.error('Varai Widget: API endpoint is required')
      RETURN false
    }
    
    IF (!this.config.apiKey) {
      console.error('Varai Widget: API key is required')
      RETURN false
    }
    
    RETURN true
  }
  
  // Load dependencies
  FUNCTION loadDependencies() {
    SET dependencies = []
    
    // Load MediaPipe for face analysis
    IF (this.config.enableFaceAnalysis) {
      dependencies.push(this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_landmarker@0.1.0/face_landmarker.js'))
    }
    
    // Load Three.js for virtual try-on
    IF (this.config.enableVirtualTryOn) {
      dependencies.push(this.loadScript('https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.min.js'))
    }
    
    // Load widget styles
    dependencies.push(this.loadStyles())
    
    RETURN Promise.all(dependencies)
  }
  
  // Load external script
  FUNCTION loadScript(src) {
    RETURN NEW Promise((resolve, reject) => {
      SET script = document.createElement('script')
      script.src = src
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  
  // Load widget styles
  FUNCTION loadStyles() {
    RETURN NEW Promise((resolve) => {
      SET style = document.createElement('style')
      style.textContent = this.getWidgetCSS()
      document.head.appendChild(style)
      resolve()
    })
  }
  
  // Get widget CSS
  FUNCTION getWidgetCSS() {
    RETURN `
      /* Varai AI Discovery Widget Styles */
      .varai-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: fixed;
        z-index: 999999;
        ${this.getPositionStyles()}
      }
      
      .varai-chat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.config.secondaryColor});
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        color: white;
        font-size: 24px;
      }
      
      .varai-chat-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }
      
      .varai-chat-window {
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        display: none;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid #e1e5e9;
      }
      
      .varai-chat-window.open {
        display: flex;
      }
      
      .varai-chat-header {
        background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.config.secondaryColor});
        color: white;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .varai-chat-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .varai-close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
      }
      
      .varai-close-btn:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      .varai-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f8f9fa;
      }
      
      .varai-message {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
      }
      
      .varai-message-user {
        align-items: flex-end;
      }
      
      .varai-message-assistant {
        align-items: flex-start;
      }
      
      .varai-message-content {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .varai-message-user .varai-message-content {
        background: ${this.config.primaryColor};
        color: white;
      }
      
      .varai-message-assistant .varai-message-content {
        background: white;
        color: #333;
        border: 1px solid #e1e5e9;
      }
      
      .varai-message-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }
      
      .varai-action-btn {
        background: white;
        border: 2px solid ${this.config.primaryColor};
        color: ${this.config.primaryColor};
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .varai-action-btn:hover {
        background: ${this.config.primaryColor};
        color: white;
      }
      
      .varai-chat-input {
        padding: 16px;
        border-top: 1px solid #e1e5e9;
        display: flex;
        gap: 8px;
        background: white;
      }
      
      .varai-message-input {
        flex: 1;
        border: 1px solid #e1e5e9;
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 14px;
        outline: none;
      }
      
      .varai-message-input:focus {
        border-color: ${this.config.primaryColor};
      }
      
      .varai-send-btn {
        background: ${this.config.primaryColor};
        border: none;
        color: white;
        padding: 10px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s;
      }
      
      .varai-send-btn:hover {
        background: ${this.darkenColor(this.config.primaryColor, 10)};
      }
      
      .varai-send-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      
      .varai-product-recommendations {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        margin-top: 12px;
      }
      
      .varai-product-card {
        background: white;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        padding: 12px;
        transition: box-shadow 0.2s;
      }
      
      .varai-product-card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .varai-product-image {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 6px;
        margin-bottom: 8px;
      }
      
      .varai-product-name {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 4px 0;
        color: #333;
      }
      
      .varai-product-price {
        font-size: 16px;
        font-weight: 700;
        color: ${this.config.primaryColor};
        margin: 0 0 8px 0;
      }
      
      .varai-product-reasoning {
        font-size: 12px;
        color: #666;
        margin: 0 0 12px 0;
        line-height: 1.3;
      }
      
      .varai-product-actions {
        display: flex;
        gap: 8px;
      }
      
      .varai-try-on-btn, .varai-view-product-btn {
        flex: 1;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
        text-decoration: none;
        display: inline-block;
      }
      
      .varai-try-on-btn {
        background: ${this.config.primaryColor};
        color: white;
        border: none;
      }
      
      .varai-try-on-btn:hover {
        background: ${this.darkenColor(this.config.primaryColor, 10)};
      }
      
      .varai-view-product-btn {
        background: white;
        color: ${this.config.primaryColor};
        border: 1px solid ${this.config.primaryColor};
      }
      
      .varai-view-product-btn:hover {
        background: ${this.config.primaryColor};
        color: white;
      }
      
      .varai-face-analysis {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .varai-face-analysis.active {
        display: flex;
      }
      
      .varai-face-video {
        width: 100%;
        max-width: 300px;
        border-radius: 8px;
        margin-bottom: 16px;
      }
      
      .varai-analysis-controls {
        display: flex;
        gap: 12px;
      }
      
      .varai-analysis-controls button {
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .varai-start-analysis {
        background: ${this.config.primaryColor};
        color: white;
        border: none;
      }
      
      .varai-skip-analysis {
        background: white;
        color: ${this.config.primaryColor};
        border: 1px solid ${this.config.primaryColor};
      }
      
      .varai-typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 12px 16px;
        background: white;
        border-radius: 18px;
        border: 1px solid #e1e5e9;
        margin-bottom: 16px;
      }
      
      .varai-typing-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #999;
        animation: varai-typing 1.4s infinite ease-in-out;
      }
      
      .varai-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .varai-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      @keyframes varai-typing {
        0%, 80%, 100% {
          opacity: 0.3;
          transform: scale(0.8);
        }
        40% {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      /* Mobile responsive */
      @media (max-width: 480px) {
        .varai-widget {
          bottom: 10px;
          right: 10px;
        }
        
        .varai-chat-window {
          width: calc(100vw - 20px);
          height: calc(100vh - 100px);
          bottom: 70px;
          right: -10px;
        }
      }
      
      ${this.config.customCSS}
    `
  }
  
  // Get position styles based on placement
  FUNCTION getPositionStyles() {
    SWITCH (this.config.placement) {
      CASE 'bottom-right':
        RETURN 'bottom: 20px; right: 20px;'
      CASE 'bottom-left':
        RETURN 'bottom: 20px; left: 20px;'
      CASE 'top-right':
        RETURN 'top: 20px; right: 20px;'
      CASE 'top-left':
        RETURN 'top: 20px; left: 20px;'
      DEFAULT:
        RETURN 'bottom: 20px; right: 20px;'
    }
  }
  
  // Initialize components
  FUNCTION initializeComponents() {
    // Initialize face analysis if enabled
    IF (this.config.enableFaceAnalysis && window.MediaPipe) {
      this.initializeFaceAnalysis()
    }
    
    // Initialize analytics
    this.analytics.init()
    
    // Initialize product detection
    this.detectPageProducts()
  }
  
  // Initialize face analysis
  FUNCTION initializeFaceAnalysis() {
    TRY {
      this.faceAnalysisEngine = NEW MediaPipe.FaceLandmarker({
        baseOptions: {
          modelAssetPath: `${this.config.apiEndpoint}/models/face_landmarker.task`,
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      })
    } CATCH (error) {
      console.warn('Face analysis initialization failed:', error)
      this.config.enableFaceAnalysis = false
    }
  }
  
  // Detect products on current page
  FUNCTION detectPageProducts() {
    // Try to detect products from common e-commerce patterns
    SET productSelectors = [
      '[data-product-id]',
      '.product',
      '.product-item',
      '[itemtype*="Product"]',
      '.woocommerce-product',
      '.product-details'
    ]
    
    FOR EACH selector IN productSelectors {
      SET elements = document.querySelectorAll(selector)
      IF (elements.length > 0) {
        this.extractProductInfo(elements)
        BREAK
      }
    }
  }
  
  // Extract product information from page
  FUNCTION extractProductInfo(elements) {
    this.currentProducts = []
    
    elements.forEach(element => {
      SET product = {
        id: element.dataset.productId || this.generateProductId(),
        name: this.extractProductName(element),
        price: this.extractProductPrice(element),
        image: this.extractProductImage(element),
        url: this.extractProductUrl(element),
        attributes: this.extractProductAttributes(element)
      }
      
      IF (product.name) {
        this.currentProducts.push(product)
      }
    })
  }
  
  // Extract product name
  FUNCTION extractProductName(element) {
    SET nameSelectors = [
      '.product-name',
      '.product-title',
      'h1',
      'h2',
      '[itemprop="name"]'
    ]
    
    FOR EACH selector IN nameSelectors {
      SET nameElement = element.querySelector(selector)
      IF (nameElement) {
        RETURN nameElement.textContent.trim()
      }
    }
    
    RETURN null
  }
  
  // Extract product price
  FUNCTION extractProductPrice(element) {
    SET priceSelectors = [
      '.price',
      '.product-price',
      '[itemprop="price"]',
      '.amount'
    ]
    
    FOR EACH selector IN priceSelectors {
      SET priceElement = element.querySelector(selector)
      IF (priceElement) {
        SET priceText = priceElement.textContent.trim()
        SET price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
        IF (!isNaN(price)) {
          RETURN price
        }
      }
    }
    
    RETURN null
  }
  
  // Extract product image
  FUNCTION extractProductImage(element) {
    SET imageSelectors = [
      '.product-image img',
      '.product-photo img',
      'img[itemprop="image"]',
      'img'
    ]
    
    FOR EACH selector IN imageSelectors {
      SET imageElement = element.querySelector(selector)
      IF (imageElement && imageElement.src) {
        RETURN imageElement.src
      }
    }
    
    RETURN null
  }
  
  // Create widget UI
  FUNCTION createWidgetUI() {
    SET container = document.getElementById(this.config.containerId)
    IF (!container) {
      container = document.createElement('div')
      container.id = this.config.containerId
      document.body.appendChild(container)
    }
    
    container.innerHTML = `
      <div class="varai-widget">
        <button class="varai-chat-button" id="varai-chat-toggle" aria-label="Open AI Discovery Chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        </button>
        
        <div class="varai-chat-window" id="varai-chat-window">
          <div class="varai-chat-header">
            <h3>AI Eyewear Discovery</h3>
            <button class="varai-close-btn" id="varai-close-chat" aria-label="Close chat">×</button>
          </div>
          
          <div class="varai-chat-messages" id="varai-chat-messages">
            <!-- Messages will be added here -->
          </div>
          
          <div class="varai-chat-input">
            <input type="text" id="varai-message-input" placeholder="Ask me about eyewear..." aria-label="Type your message">
            <button id="varai-send-btn" aria-label="Send message">Send</button>
          </div>
          
          <div class="varai-face-analysis" id="varai-face-analysis">
            <h4>Face Analysis</h4>
            <p>Position your face in the camera to get personalized frame recommendations</p>
            <video id="varai-face-video" autoplay muted playsinline></video>
            <canvas id="varai-face-canvas" style="display: none;"></canvas>
            <div class="varai-analysis-controls">
              <button id="varai-start-analysis" class="varai-start-analysis">Start Analysis</button>
              <button id="varai-skip-analysis" class="varai-skip-analysis">Skip for Now</button>
            </div>
          </div>
        </div>
      </div>
    `
  }
  
  // Setup event listeners
  FUNCTION setupEventListeners() {
    // Chat toggle
    document.getElementById('varai-chat-toggle').addEventListener('click', () => {
      this.toggleChat()
    })
    
    // Close chat
    document.getElementById('varai-close-chat').addEventListener('click', () => {
      this.closeChat()
    })
    
    // Send message
    document.getElementById('varai-send-btn').addEventListener('click', () => {
      this.sendMessage()
    })
    
    // Enter key to send
    document.getElementById('varai-message-input').addEventListener('keypress', (e) => {
      IF (e.key === 'Enter') {
        this.sendMessage()
      }
    })
    
    // Face analysis controls
    document.getElementById('varai-start-analysis').addEventListener('click', () => {
      this.startFaceAnalysis()
    })
    
    document.getElementById('varai-skip-analysis').addEventListener('click', () => {
      this.skipFaceAnalysis()
    })
    
    // Window resize handler
    window.addEventListener('resize', () => {
      this.handleResize()
    })
  }
  
  // Toggle chat window
  FUNCTION toggleChat() {
    IF (this.isOpen) {
      this.closeChat()
    } ELSE {
      this.openChat()
    }
  }
  
  // Open chat
  FUNCTION openChat() {
    SET chatWindow = document.getElementById('varai-chat-window')
    chatWindow.classList.add('open')
    this.isOpen = true
    
    // Show welcome message if first time
    IF (this.conversationHistory.length === 0) {
      this.showWelcomeMessage()
    }
    
    // Track event
    this.analytics.track('chat_opened', {
      sessionId: this.sessionId,
      timestamp: Date.now()
    })
    
    this.fireEvent('chat:opened')
  }
  
  // Close chat
  FUNCTION closeChat() {
    SET chatWindow = document.getElementById('varai-chat-window')
    chatWindow.classList.remove('open')
    this.isOpen = false
    
    // Hide face analysis if active
    this.hideFaceAnalysisInterface()
    
    // Track event
    this.analytics.track('chat_closed', {
      sessionId: this.sessionId,
      timestamp: Date.now()
    })
    
    this.fireEvent('chat:closed')
  }
  
  // Show welcome message
  FUNCTION showWelcomeMessage() {
    SET welcomeMessage = {
      type: 'assistant',
      content: "Hi! I'm your AI eyewear discovery assistant. I can help you find the perfect frames by analyzing your face shape and understanding your style preferences. Would you like to start with a quick face analysis?",
      actions: [
        { type: 'start_face_analysis', label: 'Start Face Analysis' },
        { type: 'browse_products', label: 'Browse Products' },
        { type: 'learn_more', label: 'How Does This Work?' }
      ]
    }
    
    this.addMessage(welcomeMessage)
  }
  
  // Add message to chat
  FUNCTION addMessage(message) {
    SET messagesContainer = document.getElementById('varai-chat-messages')
    SET messageElement = document.createElement('div')
    messageElement.className = `varai-message varai-message-${message.type}`
    
    SET messageHTML = `
      <div class="varai-message-content">${message.content}</div>
    `
    
    // Add action buttons if present
    IF (message.actions) {
      messageHTML += '<div class="varai-message-actions">'
      FOR EACH action IN message.actions {
        messageHTML += `<button class="varai-action-btn" data-action="${action.type}">${action.label}</button>`
      }
      messageHTML += '</div>'
    }
    
    // Add product recommendations if present
    IF (message.products) {
      messageHTML += this.renderProductRecommendations(message.products)
    }
    
    messageElement.innerHTML = messageHTML
    messagesContainer.appendChild(messageElement)
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight
    
    // Add to conversation history
    this.conversationHistory.push(message)
    
    // Set up action button listeners
    this.setupActionButtonListeners(messageElement)
    
    this.fireEvent('message:added', { message })
  }
  
  // Render product recommendations
  FUNCTION renderProductRecommendations(products) {
    SET html = '<div class="varai-product-recommendations">'
    
    FOR EACH product IN products {
      html += `
        <div class="varai-product-card" data-product-id="${product.id}">
          <img src="${product.image}" alt="${product.name}" class="varai-product-image" loading="lazy">
          <div class="varai-product-info">
            <h4 class="varai-product-name">${product.name}</h4>
            <p class="varai-product-price">$${product.price}</p>
            <p class="varai-product-reasoning">${product.reasoning}</p>
            <div class="varai-product-actions">
              ${this.config.enableVirtualTryOn ? `<button class="varai-try-on-btn" data-product-id="${product.id}">Try On</button>` : ''}
              <a href="${product.url}" class="varai-view-product-btn" target="_blank">View Product</a>
            </div>
          </div>
        </div>
      `
    }
    
    html += '</div>'
    RETURN html
  }
  
  // Setup action button listeners
  FUNCTION setupActionButtonListeners(messageElement) {
    // Action buttons
    SET actionButtons = messageElement.querySelectorAll('.varai-action-btn')
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        SET action = e.target.dataset.action
        this.handleAction(action)
      })
    })
    
    // Try-on buttons
    SET tryOnButtons = messageElement.querySelectorAll('.varai-try-on-btn')
    tryOnButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        SET productId = e.target.dataset.productId
        this.startVirtualTryOn(productId)
      })
    })
  }
  
  // Handle action
  FUNCTION handleAction(action) {
    SWITCH (action) {
      CASE 'start_face_analysis':
        this.showFaceAnalysisInterface()
        BREAK
      CASE 'browse_products':
        this.showProductBrowser()
        BREAK
      CASE 'learn_more':
        this.showHowItWorks()
        BREAK
    }
    
    this.analytics.track('action_clicked', {
      action,
      sessionId: this.sessionId,
      timestamp: Date.now()
    })
  }
  
  // Send message
  FUNCTION sendMessage() {
    SET input = document.getElementById('varai-message-input')
    SET message = input.value.trim()
    
    IF (!message) RETURN
    
    // Add user message
    this.addMessage({
      type: 'user',
      content: message
    })
    
    // Clear input
    input.value = ''
    
    // Process message
    this.processUserMessage(message)
  }
  
  // Process user message
  FUNCTION processUserMessage(message) {
    // Show typing indicator
    this.showTypingIndicator()
    
    // Send to API
    this.sendToAPI('chat', {
      message: message,
      sessionId: this.sessionId,
      context: this.getConversationContext(),
      products: this.currentProducts
    }).then(response => {
      this.hideTypingIndicator()
      this.addMessage({
        type: 'assistant',
        content: response.message,
        products: response.products,
        actions: response