/**
 * Shopify Consultation Service
 * Bridges Shopify app with consultation services
 */

import axios from 'axios';

export default class ConsultationService {
    constructor(config) {
        this.config = config;
        this.consultationAPI = axios.create({
            baseURL: config.CONSULTATION_API_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Store for shop integrations
        this.shopIntegrations = new Map();
    }

    /**
     * Initialize consultation integration for a shop
     */
    async initializeShopIntegration(shop, accessToken) {
        try {
            console.log(`Initializing consultation integration for shop: ${shop}`);
            
            // Store shop configuration
            this.shopIntegrations.set(shop, {
                accessToken,
                setupDate: new Date(),
                configuration: {
                    enabled: true,
                    widgetPosition: 'product-page',
                    showOnCollections: true,
                    faceAnalysisEnabled: true,
                    storeLocatorEnabled: true,
                    customBranding: false
                }
            });
            
            // Install script tags for theme integration
            await this.installThemeScripts(shop, accessToken);
            
            // Set up webhooks
            await this.setupWebhooks(shop, accessToken);
            
            console.log(`Consultation integration initialized for ${shop}`);
            return { success: true };
            
        } catch (error) {
            console.error('Shop integration initialization error:', error);
            throw error;
        }
    }

    /**
     * Start a new consultation session
     */
    async startConsultation(shop, customerId, sessionData = {}) {
        try {
            const response = await this.consultationAPI.post('/consultation/start', {
                platform: 'shopify',
                shop: shop,
                customerId: customerId,
                sessionData: {
                    ...sessionData,
                    userAgent: sessionData.userAgent,
                    referrer: sessionData.referrer,
                    timestamp: new Date().toISOString()
                }
            });
            
            const { sessionId } = response.data;
            
            return {
                sessionId,
                consultationUrl: this.generateConsultationURL(shop, sessionId)
            };
            
        } catch (error) {
            console.error('Start consultation error:', error);
            throw new Error('Failed to start consultation session');
        }
    }

    /**
     * Analyze face shape using consultation API
     */
    async analyzeFaceShape(sessionId, imageData) {
        try {
            const response = await this.consultationAPI.post('/consultation/face-analysis', {
                sessionId,
                imageData
            });
            
            return response.data.faceAnalysis;
            
        } catch (error) {
            console.error('Face analysis error:', error);
            throw new Error('Face shape analysis failed');
        }
    }

    /**
     * Get personalized recommendations
     */
    async getRecommendations(sessionId, preferences, faceAnalysis, shopProducts) {
        try {
            const response = await this.consultationAPI.post('/consultation/recommendations', {
                sessionId,
                preferences,
                faceAnalysis,
                productCatalog: shopProducts,
                platform: 'shopify'
            });
            
            return {
                recommendations: response.data.recommendations,
                insights: response.data.insights,
                metadata: response.data.metadata
            };
            
        } catch (error) {
            console.error('Recommendations error:', error);
            throw new Error('Failed to generate recommendations');
        }
    }

    /**
     * Find nearby stores
     */
    async findNearbyStores(sessionId, location, selectedProducts) {
        try {
            const response = await this.consultationAPI.get('/api/stores/nearby', {
                params: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    sessionId,
                    products: selectedProducts.join(',')
                }
            });
            
            return {
                stores: response.data.stores,
                inventory: response.data.inventory
            };
            
        } catch (error) {
            console.error('Store locator error:', error);
            throw new Error('Failed to find nearby stores');
        }
    }

    /**
     * Generate theme widget script
     */
    async generateThemeWidget(shop) {
        const shopConfig = this.shopIntegrations.get(shop);
        
        if (!shopConfig) {
            throw new Error('Shop integration not found');
        }
        
        const widgetScript = `
(function() {
    // Shopify Consultation Widget
    const CONSULTATION_CONFIG = {
        shop: '${shop}',
        apiUrl: '${this.config.HOST}',
        enabled: ${shopConfig.configuration.enabled},
        position: '${shopConfig.configuration.widgetPosition}',
        faceAnalysis: ${shopConfig.configuration.faceAnalysisEnabled},
        storeLocator: ${shopConfig.configuration.storeLocatorEnabled}
    };
    
    // Widget CSS
    const styles = \`
        .consultation-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 15px 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-family: Arial, sans-serif;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        .consultation-widget:hover {
            background: #0056b3;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        }
        
        .consultation-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
        }
        
        .consultation-modal-content {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 800px;
            height: 80%;
            position: relative;
            overflow: hidden;
        }
        
        .consultation-modal iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        
        .consultation-modal-close {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #f5f5f5;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            z-index: 1;
        }
    \`;
    
    // Create widget
    function createConsultationWidget() {
        // Add styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        // Create widget button
        const widget = document.createElement('button');
        widget.className = 'consultation-widget';
        widget.textContent = '👓 Find Your Perfect Frames';
        widget.onclick = openConsultation;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'consultation-modal';
        modal.onclick = (e) => {
            if (e.target === modal) closeConsultation();
        };
        
        const modalContent = document.createElement('div');
        modalContent.className = 'consultation-modal-content';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'consultation-modal-close';
        closeButton.innerHTML = '×';
        closeButton.onclick = closeConsultation;
        
        const iframe = document.createElement('iframe');
        iframe.id = 'consultation-iframe';
        
        modalContent.appendChild(closeButton);
        modalContent.appendChild(iframe);
        modal.appendChild(modalContent);
        
        document.body.appendChild(widget);
        document.body.appendChild(modal);
    }
    
    function openConsultation() {
        startConsultationSession().then(sessionId => {
            const iframe = document.getElementById('consultation-iframe');
            iframe.src = \`\${CONSULTATION_CONFIG.apiUrl}/theme/consultation-modal?shop=\${CONSULTATION_CONFIG.shop}&sessionId=\${sessionId}\`;
            
            const modal = document.querySelector('.consultation-modal');
            modal.style.display = 'flex';
        });
    }
    
    function closeConsultation() {
        const modal = document.querySelector('.consultation-modal');
        modal.style.display = 'none';
    }
    
    async function startConsultationSession() {
        try {
            const response = await fetch(\`\${CONSULTATION_CONFIG.apiUrl}/api/consultation/start?shop=\${CONSULTATION_CONFIG.shop}\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerId: window.ShopifyAnalytics?.meta?.page?.customerId,
                    sessionData: {
                        userAgent: navigator.userAgent,
                        referrer: document.referrer,
                        url: window.location.href
                    }
                })
            });
            
            const data = await response.json();
            return data.sessionId;
            
        } catch (error) {
            console.error('Failed to start consultation:', error);
            alert('Unable to start consultation. Please try again later.');
        }
    }
    
    // Initialize widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createConsultationWidget);
    } else {
        createConsultationWidget();
    }
})();
        `;
        
        return widgetScript;
    }

    /**
     * Generate consultation modal HTML
     */
    async generateConsultationModal(shop, sessionId) {
        const shopConfig = this.shopIntegrations.get(shop);
        
        const modalHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eyewear Consultation</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f8f9fa;
        }
        
        .consultation-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .consultation-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .consultation-header h1 {
            color: #333;
            margin: 0 0 10px 0;
        }
        
        .consultation-header p {
            color: #666;
            margin: 0;
        }
        
        .consultation-step {
            background: white;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .step-number {
            background: #007bff;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-weight: bold;
        }
        
        .step-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        
        .step-content {
            color: #666;
            line-height: 1.6;
        }
        
        .action-button {
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 12px 24px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 10px 10px 0;
            transition: background-color 0.3s;
        }
        
        .action-button:hover {
            background: #0056b3;
        }
        
        .action-button.secondary {
            background: #6c757d;
        }
        
        .action-button.secondary:hover {
            background: #545b62;
        }
        
        #face-analysis-container {
            text-align: center;
            margin: 20px 0;
        }
        
        #camera-preview {
            width: 100%;
            max-width: 400px;
            height: 300px;
            background: #f0f0f0;
            border: 2px dashed #ccc;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px auto;
        }
        
        .recommendations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .recommendation-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .recommendation-image {
            width: 100%;
            height: 150px;
            background: #f0f0f0;
            border-radius: 6px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="consultation-container">
        <div class="consultation-header">
            <h1>👓 Find Your Perfect Frames</h1>
            <p>Our AI-powered consultation will help you discover eyewear that complements your face shape and style preferences.</p>
        </div>
        
        <div id="consultation-steps">
            <!-- Step 1: Welcome -->
            <div class="consultation-step" id="step-welcome">
                <div class="step-title">
                    <span class="step-number">1</span>
                    Welcome to Your Personal Consultation
                </div>
                <div class="step-content">
                    <p>Let's find the perfect frames for you! This consultation will analyze your face shape and preferences to recommend the best eyewear options.</p>
                    <button class="action-button" onclick="startPreferences()">Get Started</button>
                </div>
            </div>
            
            <!-- Step 2: Preferences -->
            <div class="consultation-step" id="step-preferences" style="display: none;">
                <div class="step-title">
                    <span class="step-number">2</span>
                    Tell Us About Your Style
                </div>
                <div class="step-content">
                    <p>What style appeals to you most?</p>
                    <button class="action-button" onclick="selectStyle('classic')">Classic & Professional</button>
                    <button class="action-button" onclick="selectStyle('modern')">Modern & Minimalist</button>
                    <button class="action-button" onclick="selectStyle('bold')">Bold & Statement</button>
                    <button class="action-button" onclick="selectStyle('vintage')">Vintage & Retro</button>
                </div>
            </div>
            
            <!-- Step 3: Face Analysis -->
            <div class="consultation-step" id="step-face-analysis" style="display: none;">
                <div class="step-title">
                    <span class="step-number">3</span>
                    Face Shape Analysis
                </div>
                <div class="step-content">
                    <p>For the most accurate recommendations, let's analyze your face shape.</p>
                    <div id="face-analysis-container">
                        <div id="camera-preview">
                            Click "Start Camera" to begin face analysis
                        </div>
                        <button class="action-button" onclick="startCamera()">Start Camera</button>
                        <button class="action-button secondary" onclick="skipFaceAnalysis()">Skip This Step</button>
                    </div>
                </div>
            </div>
            
            <!-- Step 4: Recommendations -->
            <div class="consultation-step" id="step-recommendations" style="display: none;">
                <div class="step-title">
                    <span class="step-number">4</span>
                    Your Personalized Recommendations
                </div>
                <div class="step-content" id="recommendations-content">
                    <p>Loading your personalized recommendations...</p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let sessionId = '${sessionId}';
        let consultationData = {
            style: null,
            faceAnalysis: null
        };
        
        function startPreferences() {
            document.getElementById('step-welcome').style.display = 'none';
            document.getElementById('step-preferences').style.display = 'block';
        }
        
        function selectStyle(style) {
            consultationData.style = style;
            document.getElementById('step-preferences').style.display = 'none';
            document.getElementById('step-face-analysis').style.display = 'block';
        }
        
        function startCamera() {
            // Implement camera functionality
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    const video = document.createElement('video');
                    video.srcObject = stream;
                    video.autoplay = true;
                    video.style.width = '100%';
                    video.style.height = '100%';
                    
                    const preview = document.getElementById('camera-preview');
                    preview.innerHTML = '';
                    preview.appendChild(video);
                    
                    // Add capture button
                    setTimeout(() => {
                        const captureBtn = document.createElement('button');
                        captureBtn.className = 'action-button';
                        captureBtn.textContent = 'Capture & Analyze';
                        captureBtn.onclick = () => captureAndAnalyze(video, stream);
                        
                        const container = document.getElementById('face-analysis-container');
                        container.appendChild(captureBtn);
                    }, 1000);
                })
                .catch(err => {
                    console.error('Camera access denied:', err);
                    alert('Camera access is required for face analysis. You can skip this step if needed.');
                });
        }
        
        function captureAndAnalyze(video, stream) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Stop camera
            stream.getTracks().forEach(track => track.stop());
            
            // Send for analysis
            analyzeFaceShape(imageData);
        }
        
        function skipFaceAnalysis() {
            showRecommendations();
        }
        
        async function analyzeFaceShape(imageData) {
            try {
                document.getElementById('camera-preview').innerHTML = 'Analyzing your face shape...';
                
                const response = await fetch(\`/api/consultation/\${sessionId}/face-analysis?shop=${shop}\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ imageData })
                });
                
                const data = await response.json();
                consultationData.faceAnalysis = data.faceAnalysis;
                
                document.getElementById('camera-preview').innerHTML = \`
                    <div>
                        <strong>Face Shape Detected: \${data.faceAnalysis.faceShape}</strong><br>
                        Confidence: \${Math.round(data.faceAnalysis.confidence * 100)}%
                    </div>
                \`;
                
                setTimeout(showRecommendations, 2000);
                
            } catch (error) {
                console.error('Face analysis error:', error);
                document.getElementById('camera-preview').innerHTML = 'Analysis failed. Proceeding with style preferences only.';
                setTimeout(showRecommendations, 1500);
            }
        }
        
        async function showRecommendations() {
            document.getElementById('step-face-analysis').style.display = 'none';
            document.getElementById('step-recommendations').style.display = 'block';
            
            try {
                const response = await fetch(\`/api/consultation/\${sessionId}/recommendations?shop=${shop}\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        preferences: { stylePreference: consultationData.style },
                        faceAnalysis: consultationData.faceAnalysis
                    })
                });
                
                const data = await response.json();
                displayRecommendations(data.recommendations);
                
            } catch (error) {
                console.error('Recommendations error:', error);
                document.getElementById('recommendations-content').innerHTML = '<p>Sorry, we could not load recommendations at this time.</p>';
            }
        }
        
        function displayRecommendations(recommendations) {
            const content = document.getElementById('recommendations-content');
            
            let html = '<div class="recommendations-grid">';
            
            recommendations.slice(0, 3).forEach(rec => {
                html += \`
                    <div class="recommendation-card">
                        <div class="recommendation-image">
                            \${rec.name}
                        </div>
                        <h3>\${rec.name}</h3>
                        <p><strong>\$\${rec.price}</strong></p>
                        <p>\${rec.explanation || 'Great choice for your style!'}</p>
                        <button class="action-button" onclick="viewProduct('\${rec.id}')">View Product</button>
                    </div>
                \`;
            });
            
            html += '</div>';
            html += '<button class="action-button" onclick="findStores()">Find In Store</button>';
            
            content.innerHTML = html;
        }
        
        function viewProduct(productId) {
            // Redirect to product page
            window.parent.location.href = \`/products/\${productId}\`;
        }
        
        function findStores() {
            // Implement store locator
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const { latitude, longitude } = position.coords;
                    window.parent.location.href = \`/pages/store-locator?lat=\${latitude}&lng=\${longitude}\`;
                });
            }
        }
    </script>
</body>
</html>
        `;
        
        return modalHTML;
    }

    /**
     * Install theme scripts
     */
    async installThemeScripts(shop, accessToken) {
        try {
            // This would use Shopify API to install script tags
            console.log(`Installing theme scripts for ${shop}`);
            
            // Script tag for consultation widget
            const scriptTag = {
                script_tag: {
                    event: 'onload',
                    src: `${this.config.HOST}/theme/consultation-widget.js?shop=${shop}`
                }
            };
            
            // In real implementation, make API call to Shopify
            // await shopifyAPI.post(`/admin/api/2023-10/script_tags.json`, scriptTag);
            
        } catch (error) {
            console.error('Script installation error:', error);
        }
    }

    /**
     * Setup webhooks
     */
    async setupWebhooks(shop, accessToken) {
        try {
            const webhooks = [
                {
                    webhook: {
                        topic: 'products/create',
                        address: `${this.config.HOST}/webhooks/products/create`,
                        format: 'json'
                    }
                },
                {
                    webhook: {
                        topic: 'products/update',
                        address: `${this.config.HOST}/webhooks/products/update`,
                        format: 'json'
                    }
                },
                {
                    webhook: {
                        topic: 'app/uninstalled',
                        address: `${this.config.HOST}/webhooks/app/uninstalled`,
                        format: 'json'
                    }
                }
            ];
            
            // In real implementation, create webhooks via Shopify API
            console.log(`Setting up webhooks for ${shop}:`, webhooks.length);
            
        } catch (error) {
            console.error('Webhook setup error:', error);
        }
    }

    /**
     * Get shop configuration
     */
    async getShopConfiguration(shop) {
        const shopConfig = this.shopIntegrations.get(shop);
        
        if (!shopConfig) {
            throw new Error('Shop integration not found');
        }
        
        return shopConfig.configuration;
    }

    /**
     * Update shop configuration
     */
    async updateShopConfiguration(shop, configuration) {
        const shopConfig = this.shopIntegrations.get(shop);
        
        if (!shopConfig) {
            throw new Error('Shop integration not found');
        }
        
        shopConfig.configuration = {
            ...shopConfig.configuration,
            ...configuration
        };
        
        this.shopIntegrations.set(shop, shopConfig);
    }

    /**
     * Cleanup shop integration
     */
    async cleanupShopIntegration(shop) {
        try {
            // Remove shop from integrations
            this.shopIntegrations.delete(shop);
            
            // Additional cleanup tasks would go here
            console.log(`Cleaned up integration for ${shop}`);
            
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    /**
     * Generate consultation URL
     */
    generateConsultationURL(shop, sessionId) {
        return `${this.config.HOST}/theme/consultation-modal?shop=${shop}&sessionId=${sessionId}`;
    }
}