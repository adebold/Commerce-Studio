/**
 * BigCommerce Consultation Integration App
 * Commerce Studio Consultation MVP - BigCommerce Integration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

// Initialize Express app
const app = express();

// Configuration
const config = {
    PORT: process.env.PORT || 3003,
    BIGCOMMERCE_CLIENT_ID: process.env.BIGCOMMERCE_CLIENT_ID,
    BIGCOMMERCE_CLIENT_SECRET: process.env.BIGCOMMERCE_CLIENT_SECRET,
    BIGCOMMERCE_CALLBACK_URL: process.env.BIGCOMMERCE_CALLBACK_URL,
    CONSULTATION_API_URL: process.env.CONSULTATION_API_URL || 'http://localhost:3002',
    APP_URL: process.env.APP_URL || 'http://localhost:3003',
    JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key'
};

// Initialize cache for storing app data
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use('/static', express.static('public'));

/**
 * BigCommerce App Installation & Authentication
 */

// App installation endpoint
app.get('/install', (req, res) => {
    const { code, scope, context } = req.query;
    
    if (!code || !context) {
        return res.status(400).send('Missing required parameters');
    }
    
    // Exchange code for access token
    exchangeCodeForToken(code, context, scope)
        .then(tokenData => {
            // Store app installation data
            return storeAppInstallation(context, tokenData);
        })
        .then(installationData => {
            // Initialize consultation integration
            return initializeConsultationIntegration(installationData);
        })
        .then(() => {
            // Redirect to app dashboard
            res.redirect(`/dashboard?context=${encodeURIComponent(context)}`);
        })
        .catch(error => {
            console.error('Installation error:', error);
            res.status(500).send('Installation failed');
        });
});

// App load endpoint
app.get('/load', verifyJWT, (req, res) => {
    const { context } = req.query;
    
    // Verify app is installed for this store
    const installation = getAppInstallation(context);
    
    if (!installation) {
        return res.status(403).send('App not installed');
    }
    
    // Redirect to dashboard
    res.redirect(`/dashboard?context=${encodeURIComponent(context)}`);
});

// App uninstall endpoint
app.get('/uninstall', verifyJWT, (req, res) => {
    const { context } = req.query;
    
    // Clean up app installation
    cleanupAppInstallation(context)
        .then(() => {
            res.status(200).send('App uninstalled successfully');
        })
        .catch(error => {
            console.error('Uninstall error:', error);
            res.status(500).send('Uninstall failed');
        });
});

/**
 * Dashboard and Configuration
 */

// App dashboard
app.get('/dashboard', verifyJWT, (req, res) => {
    const { context } = req.query;
    const installation = getAppInstallation(context);
    
    if (!installation) {
        return res.status(403).send('App not installed');
    }
    
    // Render dashboard HTML
    res.send(generateDashboardHTML(context, installation));
});

// Get configuration
app.get('/api/config', verifyJWT, (req, res) => {
    const { context } = req.query;
    const installation = getAppInstallation(context);
    
    if (!installation) {
        return res.status(404).json({ error: 'Installation not found' });
    }
    
    res.json({
        success: true,
        configuration: installation.configuration
    });
});

// Update configuration
app.post('/api/config', verifyJWT, (req, res) => {
    const { context } = req.query;
    const installation = getAppInstallation(context);
    
    if (!installation) {
        return res.status(404).json({ error: 'Installation not found' });
    }
    
    // Update configuration
    installation.configuration = {
        ...installation.configuration,
        ...req.body
    };
    
    // Save updated installation
    cache.set(`installation_${context}`, installation);
    
    res.json({
        success: true,
        message: 'Configuration updated successfully'
    });
});

/**
 * Consultation API Endpoints
 */

// Start consultation
app.post('/api/consultation/start', verifyStoreRequest, async (req, res) => {
    try {
        const { context } = req.query;
        const { customerId, sessionData } = req.body;
        
        const consultationData = {
            platform: 'bigcommerce',
            storeHash: context,
            customerId,
            sessionData: {
                ...sessionData,
                timestamp: new Date().toISOString()
            }
        };
        
        const response = await makeConsultationAPIRequest('/consultation/start', 'POST', consultationData);
        
        res.json({
            success: true,
            sessionId: response.sessionId,
            consultationUrl: `${config.APP_URL}/consultation?sessionId=${response.sessionId}&context=${encodeURIComponent(context)}`
        });
        
    } catch (error) {
        console.error('Start consultation error:', error);
        res.status(500).json({ error: 'Failed to start consultation' });
    }
});

// Face analysis
app.post('/api/consultation/:sessionId/face-analysis', verifyStoreRequest, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { imageData } = req.body;
        
        const response = await makeConsultationAPIRequest('/consultation/face-analysis', 'POST', {
            sessionId,
            imageData
        });
        
        res.json({
            success: true,
            faceAnalysis: response.faceAnalysis
        });
        
    } catch (error) {
        console.error('Face analysis error:', error);
        res.status(500).json({ error: 'Face analysis failed' });
    }
});

// Get recommendations
app.post('/api/consultation/:sessionId/recommendations', verifyStoreRequest, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { context } = req.query;
        const { preferences, faceAnalysis } = req.body;
        
        // Get store products
        const storeProducts = await getStoreProducts(context);
        
        const response = await makeConsultationAPIRequest('/consultation/recommendations', 'POST', {
            sessionId,
            preferences,
            faceAnalysis,
            productCatalog: storeProducts,
            platform: 'bigcommerce'
        });
        
        res.json({
            success: true,
            recommendations: response.recommendations,
            insights: response.insights
        });
        
    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

// Store locator
app.get('/api/consultation/:sessionId/stores', verifyStoreRequest, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { latitude, longitude, products } = req.query;
        
        const params = new URLSearchParams({
            sessionId,
            latitude,
            longitude,
            products: products || ''
        });
        
        const response = await makeConsultationAPIRequest(`/api/stores/nearby?${params}`, 'GET');
        
        res.json({
            success: true,
            stores: response.stores,
            inventory: response.inventory
        });
        
    } catch (error) {
        console.error('Store locator error:', error);
        res.status(500).json({ error: 'Failed to find stores' });
    }
});

/**
 * Widget and Theme Integration
 */

// Generate consultation widget script
app.get('/widget/consultation.js', (req, res) => {
    const { context } = req.query;
    const installation = getAppInstallation(context);
    
    if (!installation || !installation.configuration.enabled) {
        return res.type('application/javascript').send('// Consultation widget disabled');
    }
    
    const widgetScript = generateWidgetScript(context, installation.configuration);
    res.type('application/javascript').send(widgetScript);
});

// Consultation modal iframe
app.get('/consultation', (req, res) => {
    const { sessionId, context } = req.query;
    const installation = getAppInstallation(context);
    
    if (!installation) {
        return res.status(404).send('Installation not found');
    }
    
    const modalHTML = generateConsultationModal(sessionId, context, installation.configuration);
    res.type('text/html').send(modalHTML);
});

/**
 * Helper Functions
 */

async function exchangeCodeForToken(code, context, scope) {
    try {
        const response = await axios.post('https://login.bigcommerce.com/oauth2/token', {
            client_id: config.BIGCOMMERCE_CLIENT_ID,
            client_secret: config.BIGCOMMERCE_CLIENT_SECRET,
            code: code,
            scope: scope,
            grant_type: 'authorization_code',
            redirect_uri: config.BIGCOMMERCE_CALLBACK_URL,
            context: context
        });
        
        return response.data;
        
    } catch (error) {
        console.error('Token exchange error:', error);
        throw error;
    }
}

async function storeAppInstallation(context, tokenData) {
    const installation = {
        context: context,
        accessToken: tokenData.access_token,
        scope: tokenData.scope,
        user: tokenData.user,
        installedAt: new Date().toISOString(),
        configuration: {
            enabled: true,
            widgetPosition: 'product-page',
            faceAnalysisEnabled: true,
            storeLocatorEnabled: true,
            buttonText: 'Find Your Perfect Frames',
            buttonColor: '#007bff'
        }
    };
    
    // Store in cache (in production, use database)
    cache.set(`installation_${context}`, installation);
    
    return installation;
}

function getAppInstallation(context) {
    return cache.get(`installation_${context}`);
}

async function cleanupAppInstallation(context) {
    // Remove from cache
    cache.del(`installation_${context}`);
    
    // Additional cleanup would go here
    console.log(`Cleaned up installation for context: ${context}`);
}

async function initializeConsultationIntegration(installation) {
    // Initialize consultation integration for this store
    console.log(`Initializing consultation integration for: ${installation.context}`);
    
    // Set up webhooks, sync products, etc.
    return true;
}

async function getStoreProducts(context) {
    try {
        const installation = getAppInstallation(context);
        if (!installation) {
            throw new Error('Installation not found');
        }
        
        // Get products from BigCommerce API
        const response = await axios.get(`https://api.bigcommerce.com/stores/${context}/v3/catalog/products`, {
            headers: {
                'X-Auth-Token': installation.accessToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            params: {
                limit: 250,
                include_fields: 'id,name,sku,price,sale_price,categories,custom_fields,images,availability'
            }
        });
        
        // Transform products for consultation
        return response.data.data.map(product => transformBigCommerceProduct(product, context));
        
    } catch (error) {
        console.error('Get store products error:', error);
        return [];
    }
}

function transformBigCommerceProduct(product, context) {
    // Extract eyewear attributes
    const eyewearAttributes = extractEyewearAttributes(product);
    
    return {
        id: `bigcommerce_${product.id}`,
        bigcommerceId: product.id,
        storeHash: context,
        name: product.name,
        sku: product.sku,
        brand: product.brand || 'Unknown',
        category: categorizeProduct(product),
        style: eyewearAttributes.style,
        material: eyewearAttributes.material,
        color: eyewearAttributes.color,
        price: parseFloat(product.price) || 0,
        salePrice: parseFloat(product.sale_price) || null,
        measurements: eyewearAttributes.measurements,
        features: eyewearAttributes.features,
        suitableFaceShapes: eyewearAttributes.suitableFaceShapes,
        styleMatch: eyewearAttributes.styleMatch,
        lifestyleMatch: eyewearAttributes.lifestyleMatch,
        image: product.images?.[0]?.url_standard || '',
        inStock: product.availability === 'available',
        rating: 4.0, // Default - would integrate with review system
        reviews: 0 // Default - would integrate with review system
    };
}

function extractEyewearAttributes(product) {
    // Similar to other platform implementations
    const name = product.name.toLowerCase();
    
    // Detect style, material, color from name and custom fields
    let style = 'rectangular';
    if (name.includes('round')) style = 'round';
    if (name.includes('cat-eye')) style = 'cat-eye';
    if (name.includes('aviator')) style = 'aviator';
    if (name.includes('square')) style = 'square';
    
    let material = 'acetate';
    if (name.includes('metal')) material = 'metal';
    if (name.includes('titanium')) material = 'titanium';
    
    let color = 'black';
    const colors = ['black', 'brown', 'blue', 'red', 'gold', 'silver'];
    for (const colorOption of colors) {
        if (name.includes(colorOption)) {
            color = colorOption;
            break;
        }
    }
    
    return {
        style,
        material,
        color,
        measurements: generateMockMeasurements(style),
        features: extractFeatures(product),
        suitableFaceShapes: mapStyleToFaceShapes(style),
        styleMatch: mapToStyleCategories(style, material),
        lifestyleMatch: mapToLifestyleCategories(product)
    };
}

async function makeConsultationAPIRequest(endpoint, method, data = null) {
    try {
        const config = {
            method,
            url: `${process.env.CONSULTATION_API_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return response.data;
        
    } catch (error) {
        console.error('Consultation API request error:', error);
        throw error;
    }
}

function generateWidgetScript(context, configuration) {
    return `
(function() {
    const BIGCOMMERCE_CONSULTATION_CONFIG = {
        context: '${context}',
        appUrl: '${config.APP_URL}',
        enabled: ${configuration.enabled},
        position: '${configuration.widgetPosition}',
        buttonText: '${configuration.buttonText}',
        buttonColor: '${configuration.buttonColor}'
    };
    
    // Widget implementation similar to Shopify
    // ... (widget code would be similar to other platforms)
})();
    `;
}

function generateConsultationModal(sessionId, context, configuration) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Eyewear Consultation</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Modal HTML similar to other platforms -->
</head>
<body>
    <!-- Modal content -->
</body>
</html>
    `;
}

function generateDashboardHTML(context, installation) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Consultation Integration Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
        .config-section { margin-bottom: 30px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .status { padding: 10px; border-radius: 4px; margin-bottom: 20px; }
        .status.enabled { background: #d4edda; color: #155724; }
        .status.disabled { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Consultation Integration</h1>
        <p>Configure your AI-powered eyewear consultation system</p>
    </div>
    
    <div class="status ${installation.configuration.enabled ? 'enabled' : 'disabled'}">
        Status: ${installation.configuration.enabled ? 'Enabled' : 'Disabled'}
    </div>
    
    <form id="config-form">
        <div class="config-section">
            <h3>General Settings</h3>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="enabled" ${installation.configuration.enabled ? 'checked' : ''}> 
                    Enable Consultation Integration
                </label>
            </div>
            <div class="form-group">
                <label for="buttonText">Button Text:</label>
                <input type="text" id="buttonText" value="${installation.configuration.buttonText}">
            </div>
            <div class="form-group">
                <label for="buttonColor">Button Color:</label>
                <input type="color" id="buttonColor" value="${installation.configuration.buttonColor}">
            </div>
        </div>
        
        <div class="config-section">
            <h3>Features</h3>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="faceAnalysisEnabled" ${installation.configuration.faceAnalysisEnabled ? 'checked' : ''}> 
                    Enable Face Shape Analysis
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="storeLocatorEnabled" ${installation.configuration.storeLocatorEnabled ? 'checked' : ''}> 
                    Enable Store Locator
                </label>
            </div>
        </div>
        
        <button type="submit">Save Configuration</button>
    </form>
    
    <script>
        document.getElementById('config-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const config = {
                enabled: document.getElementById('enabled').checked,
                buttonText: document.getElementById('buttonText').value,
                buttonColor: document.getElementById('buttonColor').value,
                faceAnalysisEnabled: document.getElementById('faceAnalysisEnabled').checked,
                storeLocatorEnabled: document.getElementById('storeLocatorEnabled').checked
            };
            
            fetch('/api/config?context=${encodeURIComponent(context)}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Configuration saved successfully!');
                    location.reload();
                } else {
                    alert('Failed to save configuration');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred');
            });
        });
    </script>
</body>
</html>
    `;
}

/**
 * Middleware Functions
 */

function verifyJWT(req, res, next) {
    const signedPayload = req.query.signed_payload;
    
    if (!signedPayload) {
        return res.status(401).send('Unauthorized');
    }
    
    try {
        const [encodedSignature, encodedPayload] = signedPayload.split('.');
        const signature = Buffer.from(encodedSignature, 'base64');
        const payload = Buffer.from(encodedPayload, 'base64');
        
        const expectedSignature = crypto
            .createHmac('sha256', config.BIGCOMMERCE_CLIENT_SECRET)
            .update(payload)
            .digest();
        
        if (!crypto.timingSafeEqual(signature, expectedSignature)) {
            return res.status(401).send('Invalid signature');
        }
        
        req.payload = JSON.parse(payload.toString());
        next();
        
    } catch (error) {
        console.error('JWT verification error:', error);
        res.status(401).send('Unauthorized');
    }
}

function verifyStoreRequest(req, res, next) {
    // Simplified verification for API requests
    // In production, implement proper authentication
    next();
}

// Additional helper functions
function categorizeProduct(product) { /* Implementation */ }
function generateMockMeasurements(style) { /* Implementation */ }
function extractFeatures(product) { /* Implementation */ }
function mapStyleToFaceShapes(style) { /* Implementation */ }
function mapToStyleCategories(style, material) { /* Implementation */ }
function mapToLifestyleCategories(product) { /* Implementation */ }

// Error handling
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'bigcommerce-consultation-integration',
        timestamp: new Date().toISOString() 
    });
});

// Start server
const server = app.listen(config.PORT, () => {
    console.log(`BigCommerce Consultation Integration server running on port ${config.PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = server;