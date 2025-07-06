# Platform Integration Pseudocode for Varai AI Discovery
## Agent 3: Platform Integration Pseudocode Agent

## Document Information
- **Document Type**: Platform Integration Pseudocode
- **System**: EyewearML Varai AI Discovery
- **Version**: 1.0
- **Date**: January 2025
- **Author**: Agent 3 - Platform Integration Pseudocode Agent

## Executive Summary

This document provides comprehensive pseudocode for integrating Varai AI discovery across all e-commerce platforms, building on existing platform integrations and specifications from Agent 1 and Agent 2. The pseudocode covers platform-specific enhancements, widget architecture, data synchronization, error handling, and performance optimization.

## 1. Shopify AI Discovery Enhancement Pseudocode

### 1.1 Enhanced Shopping Assistant Integration

Building on [`apps/shopify/frontend/components/ShoppingAssistant.tsx`](apps/shopify/frontend/components/ShoppingAssistant.tsx:1):

```typescript
// Enhanced ShoppingAssistant with AI Discovery
INTERFACE EnhancedShoppingAssistant EXTENDS ShoppingAssistant {
  // Additional AI Discovery properties
  faceAnalysisEngine: MediaPipeFaceAnalyzer
  aiDiscoveryEngine: VaraiAIEngine
  virtualTryOnRenderer: VTORenderer
  conversationContext: AIConversationContext
  
  // Enhanced initialization
  FUNCTION initializeAIDiscovery() {
    // Initialize face analysis engine
    SET this.faceAnalysisEngine = NEW MediaPipeFaceAnalyzer({
      modelPath: '/models/face_landmarker.task',
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    
    // Initialize AI discovery engine
    SET this.aiDiscoveryEngine = NEW VaraiAIEngine({
      apiEndpoint: '/api/ai-discovery',
      sessionId: this.sessionId,
      shopDomain: this.shopDomain
    })
    
    // Initialize virtual try-on renderer
    SET this.virtualTryOnRenderer = NEW VTORenderer({
      canvasId: 'vto-canvas',
      faceAnalyzer: this.faceAnalysisEngine
    })
    
    // Initialize conversation context
    SET this.conversationContext = NEW AIConversationContext({
      sessionId: this.sessionId,
      maxContextLength: 10,
      retentionPeriod: '30_minutes'
    })
    
    // Start AI discovery flow
    CALL this.startAIDiscoveryFlow()
  }
  
  // AI Discovery flow initiation
  FUNCTION startAIDiscoveryFlow() {
    // Check if user has granted camera permission
    IF (await this.checkCameraPermission()) {
      CALL this.initiateWelcomeFlow()
    } ELSE {
      CALL this.showCameraPermissionRequest()
    }
  }
  
  // Welcome flow with AI discovery
  FUNCTION initiateWelcomeFlow() {
    SET welcomeMessage = {
      content: "Hi! I'm your AI eyewear discovery assistant. I'll help you find the perfect frames by analyzing your face shape and understanding your style preferences. Shall we start with a quick face analysis?",
      type: 'ai_discovery_welcome',
      actions: [
        { type: 'start_face_analysis', label: 'Start Face Analysis' },
        { type: 'skip_analysis', label: 'Skip for Now' },
        { type: 'learn_more', label: 'How Does This Work?' }
      ]
    }
    
    CALL this.addMessage(welcomeMessage)
    CALL this.trackEvent('ai_discovery_welcome_shown', { sessionId: this.sessionId })
  }
  
  // Enhanced message handling with AI discovery
  FUNCTION handleSendMessage() OVERRIDE {
    IF (!this.currentMessage.trim()) RETURN
    
    // Add user message
    SET userMessage = this.createUserMessage(this.currentMessage)
    CALL this.addMessage(userMessage)
    
    // Determine message intent
    SET intent = await this.aiDiscoveryEngine.analyzeIntent(this.currentMessage, this.conversationContext)
    
    // Handle different intents
    SWITCH (intent.type) {
      CASE 'face_analysis_request':
        CALL this.handleFaceAnalysisRequest()
        BREAK
      CASE 'product_recommendation_request':
        CALL this.handleProductRecommendationRequest(intent)
        BREAK
      CASE 'virtual_try_on_request':
        CALL this.handleVirtualTryOnRequest(intent)
        BREAK
      CASE 'style_preference_query':
        CALL this.handleStylePreferenceQuery(intent)
        BREAK
      DEFAULT:
        CALL this.handleGeneralQuery(intent)
    }
    
    // Update conversation context
    CALL this.conversationContext.addInteraction(userMessage, intent)
  }
  
  // Face analysis handling
  FUNCTION handleFaceAnalysisRequest() {
    TRY {
      // Show face analysis UI
      CALL this.showFaceAnalysisInterface()
      
      // Start camera stream
      SET stream = await navigator.mediaDevices.getUserMedia({ video: true })
      SET videoElement = document.getElementById('face-analysis-video')
      SET videoElement.srcObject = stream
      
      // Wait for video to load
      await this.waitForVideoReady(videoElement)
      
      // Perform face analysis
      SET analysisResult = await this.performFaceAnalysis(videoElement)
      
      // Stop camera stream
      CALL this.stopCameraStream(stream)
      
      // Process analysis results
      CALL this.processFaceAnalysisResults(analysisResult)
      
    } CATCH (error) {
      CALL this.handleFaceAnalysisError(error)
    }
  }
  
  // Face analysis processing
  FUNCTION performFaceAnalysis(videoElement) {
    RETURN NEW Promise((resolve, reject) => {
      SET analysisAttempts = 0
      SET maxAttempts = 30 // 3 seconds at 10 FPS
      SET analysisResults = []
      
      SET analysisInterval = setInterval(async () => {
        TRY {
          SET result = await this.faceAnalysisEngine.detect(videoElement)
          
          IF (result.faceLandmarks.length > 0) {
            SET measurements = this.extractFaceMeasurements(result.faceLandmarks[0])
            analysisResults.push(measurements)
          }
          
          analysisAttempts++
          
          IF (analysisAttempts >= maxAttempts) {
            clearInterval(analysisInterval)
            
            IF (analysisResults.length > 0) {
              SET averagedResults = this.averageAnalysisResults(analysisResults)
              resolve(averagedResults)
            } ELSE {
              reject(NEW Error('No face detected'))
            }
          }
        } CATCH (error) {
          clearInterval(analysisInterval)
          reject(error)
        }
      }, 100) // 10 FPS
    })
  }
  
  // Extract face measurements from landmarks
  FUNCTION extractFaceMeasurements(landmarks) {
    // Calculate key measurements
    SET faceWidth = this.calculateDistance(landmarks[234], landmarks[454]) // Left to right face boundary
    SET faceHeight = this.calculateDistance(landmarks[10], landmarks[152]) // Top to bottom face
    SET jawWidth = this.calculateDistance(landmarks[172], landmarks[397]) // Jaw width
    SET foreheadWidth = this.calculateDistance(landmarks[21], landmarks[251]) // Forehead width
    SET pupillaryDistance = this.calculateDistance(landmarks[468], landmarks[473]) // Eye centers
    
    // Determine face shape
    SET faceShape = this.determineFaceShape({
      faceWidth,
      faceHeight,
      jawWidth,
      foreheadWidth
    })
    
    RETURN {
      faceWidth,
      faceHeight,
      jawWidth,
      foreheadWidth,
      pupillaryDistance,
      faceShape,
      confidence: this.calculateConfidence(landmarks),
      timestamp: Date.now()
    }
  }
  
  // Process face analysis results
  FUNCTION processFaceAnalysisResults(analysisResult) {
    // Store analysis results (privacy-compliant)
    CALL this.storeAnalysisResults(analysisResult)
    
    // Generate personalized message
    SET personalizedMessage = this.generatePersonalizedMessage(analysisResult)
    CALL this.addMessage(personalizedMessage)
    
    // Generate frame recommendations
    CALL this.generateFrameRecommendations(analysisResult)
    
    // Track analysis completion
    CALL this.trackEvent('face_analysis_completed', {
      sessionId: this.sessionId,
      faceShape: analysisResult.faceShape,
      confidence: analysisResult.confidence
    })
  }
  
  // Generate frame recommendations
  FUNCTION generateFrameRecommendations(analysisResult) {
    TRY {
      SET recommendationRequest = {
        faceAnalysis: analysisResult,
        conversationContext: this.conversationContext.getContext(),
        userPreferences: this.getUserPreferences(),
        sessionId: this.sessionId
      }
      
      SET recommendations = await this.aiDiscoveryEngine.generateRecommendations(recommendationRequest)
      
      // Limit to maximum 8 recommendations as per requirements
      SET limitedRecommendations = recommendations.slice(0, 8)
      
      SET recommendationMessage = {
        content: this.formatRecommendationMessage(limitedRecommendations, analysisResult.faceShape),
        type: 'product_recommendations',
        products: limitedRecommendations,
        suggestedQueries: [
          'Tell me more about the first recommendation',
          'Show me different styles',
          'Can I try these on virtually?',
          'What about different colors?'
        ]
      }
      
      CALL this.addMessage(recommendationMessage)
      
      // Track recommendations generated
      CALL this.trackEvent('recommendations_generated', {
        sessionId: this.sessionId,
        count: limitedRecommendations.length,
        faceShape: analysisResult.faceShape
      })
      
    } CATCH (error) {
      CALL this.handleRecommendationError(error)
    }
  }
  
  // Virtual try-on handling
  FUNCTION handleVirtualTryOnRequest(intent) {
    IF (!intent.productId) {
      SET clarificationMessage = {
        content: "Which frame would you like to try on virtually? Please select one from the recommendations above.",
        type: 'clarification_request'
      }
      CALL this.addMessage(clarificationMessage)
      RETURN
    }
    
    CALL this.startVirtualTryOn(intent.productId)
  }
  
  // Start virtual try-on session
  FUNCTION startVirtualTryOn(productId) {
    TRY {
      // Show VTO interface
      CALL this.showVirtualTryOnInterface()
      
      // Load product 3D model
      SET productModel = await this.loadProduct3DModel(productId)
      
      // Start camera for VTO
      SET stream = await navigator.mediaDevices.getUserMedia({ video: true })
      SET videoElement = document.getElementById('vto-video')
      SET videoElement.srcObject = stream
      
      // Initialize VTO renderer
      await this.virtualTryOnRenderer.initialize(videoElement, productModel)
      
      // Start real-time rendering
      CALL this.startVTORendering()
      
      // Track VTO session start
      CALL this.trackEvent('virtual_try_on_started', {
        sessionId: this.sessionId,
        productId: productId
      })
      
    } CATCH (error) {
      CALL this.handleVTOError(error)
    }
  }
  
  // Error handling
  FUNCTION handleFaceAnalysisError(error) {
    SET errorMessage = {
      content: "I'm having trouble analyzing your face. This could be due to lighting conditions or camera access. Would you like to try again or continue without face analysis?",
      type: 'error_recovery',
      actions: [
        { type: 'retry_face_analysis', label: 'Try Again' },
        { type: 'continue_without_analysis', label: 'Continue Without Analysis' },
        { type: 'troubleshooting_help', label: 'Get Help' }
      ]
    }
    
    CALL this.addMessage(errorMessage)
    CALL this.trackEvent('face_analysis_error', {
      sessionId: this.sessionId,
      error: error.message
    })
  }
}
```

### 1.2 Shopify App Extension Integration

```typescript
// Shopify App Extension for AI Discovery Widget
INTERFACE ShopifyAIDiscoveryExtension {
  // Extension configuration
  FUNCTION configure() {
    RETURN {
      name: 'varai-ai-discovery',
      type: 'theme_app_extension',
      metafields: [
        {
          namespace: 'varai',
          key: 'ai_discovery_enabled',
          type: 'boolean'
        },
        {
          namespace: 'varai',
          key: 'widget_placement',
          type: 'single_line_text_field'
        },
        {
          namespace: 'varai',
          key: 'customization_settings',
          type: 'json'
        }
      ],
      settings: [
        {
          type: 'checkbox',
          id: 'enable_ai_discovery',
          label: 'Enable AI Discovery',
          default: true
        },
        {
          type: 'select',
          id: 'widget_placement',
          label: 'Widget Placement',
          options: [
            { value: 'product_page', label: 'Product Page' },
            { value: 'collection_page', label: 'Collection Page' },
            { value: 'homepage', label: 'Homepage' },
            { value: 'custom', label: 'Custom Placement' }
          ],
          default: 'product_page'
        },
        {
          type: 'color',
          id: 'primary_color',
          label: 'Primary Color',
          default: '#5c6ac4'
        }
      ]
    }
  }
  
  // Liquid template integration
  FUNCTION generateLiquidTemplate() {
    RETURN `
      {% if app.metafields.varai.ai_discovery_enabled %}
        <div id="varai-ai-discovery-widget" 
             data-shop-domain="{{ shop.domain }}"
             data-placement="{{ app.metafields.varai.widget_placement }}"
             data-settings="{{ app.metafields.varai.customization_settings | json | escape }}">
          
          <!-- AI Discovery Widget Container -->
          <div class="varai-widget-container">
            <!-- Widget will be dynamically loaded here -->
          </div>
          
          <!-- Widget Styles -->
          <style>
            .varai-widget-container {
              position: relative;
              z-index: 1000;
            }
            
            .varai-chat-button {
              position: fixed;
              bottom: 20px;
              right: 20px;
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background-color: {{ settings.primary_color }};
              color: white;
              border: none;
              cursor: pointer;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
            }
            
            .varai-chat-window {
              position: fixed;
              bottom: 90px;
              right: 20px;
              width: 350px;
              height: 500px;
              background: white;
              border-radius: 10px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              display: none;
              flex-direction: column;
              overflow: hidden;
            }
            
            .varai-chat-window.open {
              display: flex;
            }
          </style>
          
          <!-- Widget Script -->
          <script>
            (function() {
              // Load AI Discovery Widget
              const script = document.createElement('script');
              script.src = '{{ 'varai-ai-discovery.js' | asset_url }}';
              script.async = true;
              script.onload = function() {
                window.VaraiAIDiscovery.init({
                  shopDomain: '{{ shop.domain }}',
                  placement: '{{ app.metafields.varai.widget_placement }}',
                  settings: {{ app.metafields.varai.customization_settings | json }},
                  apiEndpoint: '{{ app.api_endpoint }}'
                });
              };
              document.head.appendChild(script);
            })();
          </script>
        </div>
      {% endif %}
    `
  }
  
  // App installation flow
  FUNCTION handleAppInstallation(shop) {
    TRY {
      // Create app installation record
      SET installation = {
        shopDomain: shop.domain,
        shopId: shop.id,
        installationDate: Date.now(),
        status: 'installing',
        features: {
          aiDiscovery: true,
          faceAnalysis: true,
          virtualTryOn: true,
          analytics: true
        }
      }
      
      // Store installation in MongoDB
      await this.storeInstallation(installation)
      
      // Set up webhooks
      await this.setupWebhooks(shop)
      
      // Initialize product sync
      await this.initializeProductSync(shop)
      
      // Create default settings
      await this.createDefaultSettings(shop)
      
      // Mark installation as complete
      installation.status = 'active'
      await this.updateInstallation(installation)
      
      RETURN { success: true, installation }
      
    } CATCH (error) {
      CALL this.handleInstallationError(shop, error)
      RETURN { success: false, error: error.message }
    }
  }
  
  // Webhook setup
  FUNCTION setupWebhooks(shop) {
    SET webhooks = [
      {
        topic: 'orders/create',
        address: `${this.apiEndpoint}/webhooks/shopify/orders/create`,
        format: 'json'
      },
      {
        topic: 'customers/create',
        address: `${this.apiEndpoint}/webhooks/shopify/customers/create`,
        format: 'json'
      },
      {
        topic: 'products/update',
        address: `${this.apiEndpoint}/webhooks/shopify/products/update`,
        format: 'json'
      },
      {
        topic: 'app/uninstalled',
        address: `${this.apiEndpoint}/webhooks/shopify/app/uninstalled`,
        format: 'json'
      }
    ]
    
    FOR EACH webhook IN webhooks {
      await this.createWebhook(shop, webhook)
    }
  }
}
```

## 2. Magento Module Extension Pseudocode

### 2.1 Magento Module Structure

Building on [`apps/magento/`](apps/magento/) structure:

```php
// Magento AI Discovery Module
MODULE VaraiAIDiscovery {
  
  // Module configuration
  FUNCTION module.xml() {
    RETURN `
      <?xml version="1.0"?>
      <config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
              xsi:noNamespaceSchemaLocation="urn:magento:framework:Module/etc/module.xsd">
          <module name="Varai_AIDiscovery" setup_version="1.0.0">
              <sequence>
                  <module name="Magento_Catalog"/>
                  <module name="Magento_Customer"/>
                  <module name="Magento_Checkout"/>
              </sequence>
          </module>
      </config>
    `
  }
  
  // AI Discovery Block Class
  CLASS AIDiscoveryBlock EXTENDS \Magento\Framework\View\Element\Template {
    
    PROTECTED $configHelper
    PROTECTED $customerSession
    PROTECTED $productRepository
    
    FUNCTION __construct(
      \Magento\Framework\View\Element\Template\Context $context,
      \Varai\AIDiscovery\Helper\Config $configHelper,
      \Magento\Customer\Model\Session $customerSession,
      \Magento\Catalog\Api\ProductRepositoryInterface $productRepository,
      array $data = []
    ) {
      $this->configHelper = $configHelper
      $this->customerSession = $customerSession
      $this->productRepository = $productRepository
      parent::__construct($context, $data)
    }
    
    // Check if AI Discovery is enabled
    FUNCTION isAIDiscoveryEnabled() {
      RETURN $this->configHelper->isEnabled()
    }
    
    // Get widget configuration
    FUNCTION getWidgetConfig() {
      RETURN [
        'apiEndpoint' => $this->configHelper->getApiEndpoint(),
        'shopDomain' => $this->_storeManager->getStore()->getBaseUrl(),
        'customerId' => $this->customerSession->getCustomerId(),
        'sessionId' => $this->customerSession->getSessionId(),
        'placement' => $this->configHelper->getWidgetPlacement(),
        'primaryColor' => $this->configHelper->getPrimaryColor(),
        'enableFaceAnalysis' => $this->configHelper->isFaceAnalysisEnabled(),
        'enableVirtualTryOn' => $this->configHelper->isVirtualTryOnEnabled()
      ]
    }
    
    // Get current product context
    FUNCTION getCurrentProductContext() {
      $product = $this->_coreRegistry->registry('current_product')
      
      IF ($product) {
        RETURN [
          'productId' => $product->getId(),
          'productName' => $product->getName(),
          'productType' => $product->getTypeId(),
          'categoryIds' => $product->getCategoryIds(),
          'attributes' => $this->getProductAttributes($product)
        ]
      }
      
      RETURN null
    }
    
    // Get product attributes for AI context
    FUNCTION getProductAttributes($product) {
      $attributes = []
      
      // Get eyewear-specific attributes
      $eyewearAttributes = [
        'frame_shape',
        'frame_material',
        'frame_color',
        'lens_type',
        'brand',
        'gender',
        'face_shape_compatibility'
      ]
      
      FOR EACH $attributeCode IN $eyewearAttributes {
        $attributeValue = $product->getData($attributeCode)
        IF ($attributeValue) {
          $attributes[$attributeCode] = $attributeValue
        }
      }
      
      RETURN $attributes
    }
  }
  
  // AI Discovery Controller
  CLASS AIDiscoveryController EXTENDS \Magento\Framework\App\Action\Action {
    
    PROTECTED $resultJsonFactory
    PROTECTED $aiDiscoveryService
    PROTECTED $customerSession
    
    FUNCTION __construct(
      \Magento\Framework\App\Action\Context $context,
      \Magento\Framework\Controller\Result\JsonFactory $resultJsonFactory,
      \Varai\AIDiscovery\Service\AIDiscoveryService $aiDiscoveryService,
      \Magento\Customer\Model\Session $customerSession
    ) {
      $this->resultJsonFactory = $resultJsonFactory
      $this->aiDiscoveryService = $aiDiscoveryService
      $this->customerSession = $customerSession
      parent::__construct($context)
    }
    
    // Handle AI discovery requests
    FUNCTION execute() {
      $result = $this->resultJsonFactory->create()
      
      TRY {
        $requestData = $this->getRequest()->getContent()
        $data = json_decode($requestData, true)
        
        // Validate request
        IF (!$this->validateRequest($data)) {
          RETURN $result->setData([
            'success' => false,
            'error' => 'Invalid request data'
          ])
        }
        
        // Process AI discovery request
        $response = $this->processAIDiscoveryRequest($data)
        
        RETURN $result->setData([
          'success' => true,
          'data' => $response
        ])
        
      } CATCH (Exception $e) {
        RETURN $result->setData([
          'success' => false,
          'error' => $e->getMessage()
        ])
      }
    }
    
    // Process AI discovery request
    FUNCTION processAIDiscoveryRequest($data) {
      SWITCH ($data['action']) {
        CASE 'analyze_face':
          RETURN $this->aiDiscoveryService->analyzeFace($data)
        CASE 'get_recommendations':
          RETURN $this->aiDiscoveryService->getRecommendations($data)
        CASE 'start_virtual_try_on':
          RETURN $this->aiDiscoveryService->startVirtualTryOn($data)
        CASE 'track_interaction':
          RETURN $this->aiDiscoveryService->trackInteraction($data)
        DEFAULT:
          THROW NEW Exception('Unknown action: ' . $data['action'])
      }
    }
  }
  
  // AI Discovery Service
  CLASS AIDiscoveryService {
    
    PROTECTED $httpClient
    PROTECTED $configHelper
    PROTECTED $logger
    
    FUNCTION __construct(
      \Magento\Framework\HTTP\Client\Curl $httpClient,
      \Varai\AIDiscovery\Helper\Config $configHelper,
      \Psr\Log\LoggerInterface $logger
    ) {
      $this->httpClient = $httpClient
      $this->configHelper = $configHelper
      $this->logger = $logger
    }
    
    // Analyze face data
    FUNCTION analyzeFace($data) {
      $apiEndpoint = $this->configHelper->getApiEndpoint() . '/api/face-analysis'
      
      $requestData = [
        'sessionId' => $data['sessionId'],
        'faceData' => $data['faceData'],
        'platform' => 'magento',
        'storeId' => $data['storeId']
      ]
      
      $this->httpClient->post($apiEndpoint, json_encode($requestData))
      $response = json_decode($this->httpClient->getBody(), true)
      
      IF ($response['success']) {
        // Store analysis results locally
        $this->storeAnalysisResults($data['sessionId'], $response['data'])
        RETURN $response['data']
      } ELSE {
        THROW NEW Exception('Face analysis failed: ' . $response['error'])
      }
    }
    
    // Get product recommendations
    FUNCTION getRecommendations($data) {
      $apiEndpoint = $this->configHelper->getApiEndpoint() . '/api/recommendations'
      
      $requestData = [
        'sessionId' => $data['sessionId'],
        'faceAnalysis' => $data['faceAnalysis'],
        'preferences' => $data['preferences'],
        'context' => $data['context'],
        'platform' => 'magento',
        'maxResults' => 8 // Limit as per requirements
      ]
      
      $this->httpClient->post($apiEndpoint, json_encode($requestData))
      $response = json_decode($this->httpClient->getBody(), true)
      
      IF ($response['success']) {
        // Convert to Magento product format
        $recommendations = $this->convertToMagentoProducts($response['data']['recommendations'])
        RETURN $recommendations
      } ELSE {
        THROW NEW Exception('Recommendation generation failed: ' . $response['error'])
      }
    }
    
    // Convert API recommendations to Magento product format
    FUNCTION convertToMagentoProducts($recommendations) {
      $products = []
      
      FOR EACH $recommendation IN $recommendations {
        TRY {
          $product = $this->productRepository->getById($recommendation['productId'])
          
          $products[] = [
            'id' => $product->getId(),
            'name' => $product->getName(),
            'price' => $product->getPrice(),
            'image' => $this->getProductImageUrl($product),
            'url' => $product->getProductUrl(),
            'score' => $recommendation['score'],
            'reasoning' => $recommendation['reasoning']
          ]
        } CATCH (Exception $e) {
          $this->logger->warning('Product not found: ' . $recommendation['productId'])
        }
      }
      
      RETURN $products
    }
  }
  
  // Layout XML for widget placement
  FUNCTION layout_xml() {
    RETURN `
      <?xml version="1.0"?>
      <page xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
            xsi:noNamespaceSchemaLocation="urn:magento:framework:View/Layout/etc/page_configuration.xsd">
          <body>
              <!-- Product page integration -->
              <referenceContainer name="product.info.main">
                  <block class="Varai\AIDiscovery\Block\AIDiscoveryWidget" 
                         name="varai.ai.discovery.widget" 
                         template="Varai_AIDiscovery::widget.phtml"
                         after="product.info.price"/>
              </referenceContainer>
              
              <!-- Category page integration -->
              <referenceContainer name="content">
                  <block class="Varai\AIDiscovery\Block\AIDiscoveryWidget" 
                         name="varai.ai.discovery.category" 
                         template="Varai_AIDiscovery::category-widget.phtml"
                         before="category.products.list"/>
              </referenceContainer>
          </body>
      </page>
    `
  }
}
```

## 3. WooCommerce Plugin Enhancement Pseudocode

### 3.1 WooCommerce Plugin Structure

Building on [`apps/woocommerce/`](apps/woocommerce/) structure:

```php
// WooCommerce AI Discovery Plugin
PLUGIN VaraiAIDiscoveryWooCommerce {
  
  // Plugin header
  FUNCTION plugin_header() {
    RETURN `
      <?php
      /**
       * Plugin Name: Varai AI Discovery for WooCommerce
       * Description: AI-powered eyewear discovery with face analysis and virtual try-on
       * Version: 1.0.0
       * Author: Varai Inc.
       * Requires at least: 5.0
       * Tested up to: 6.4
       * WC requires at least: 5.0
       * WC tested up to: 8.0
       */
    `
  }
  
  // Main plugin class
  CLASS VaraiAIDiscovery {
    
    PROTECTED $version = '1.0.0'
    PROTECTED $plugin_name = 'varai-ai-discovery'
    
    // Initialize plugin
    FUNCTION __construct() {
      add_action('init', [$this, 'init'])
      add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts'])
      add_action('woocommerce_single_product_summary', [$this, 'add_ai_discovery_widget'], 25)
      add_action('woocommerce_before_shop_loop', [$this, 'add_category_widget'], 15)
      add_action('wp_ajax_varai_ai_discovery', [$this, 'handle_ajax_request'])
      add_action('wp_ajax_nopriv_varai_ai_discovery',