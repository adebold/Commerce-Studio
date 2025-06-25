/**
 * VisionCraft Eyewear API Client
 *
 * This module provides functions to interact with the EyewearML API
 * and fetch eyewear product data with AI-enhanced attributes.
 */

class VisionCraftClient {
    constructor(baseUrl, apiKey) {
        this.baseUrl = baseUrl || 'https://eyewear-pipeline-api-395261412442.us-central1.run.app/api/v1';
        this.apiKey = apiKey;
        this.clientId = null;
    }

    /**
     * Set the API key for authentication
     * @param {string} apiKey - The API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Set the client ID for requests
     * @param {string} clientId - The client ID
     */
    setClientId(clientId) {
        this.clientId = clientId;
    }

    /**
     * Get the headers for API requests
     * @returns {Object} - Headers object
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        return headers;
    }

    /**
     * Make a request to the EyewearML API
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method
     * @param {Object} data - Request data
     * @returns {Promise<Object>} - Response data
     */
    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const options = {
            method,
            headers: this.getHeaders(),
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    /**
     * Get all products with enhanced data
     * @param {Object} options - Query parameters
     * @returns {Promise<Array>} - Array of products
     */
    async getProducts(options = {}) {
        const queryParams = new URLSearchParams();
        
        if (this.clientId) {
            queryParams.append('client_id', this.clientId);
        }
        
        // Add other options as query parameters
        Object.entries(options).forEach(([key, value]) => {
            queryParams.append(key, value);
        });
        
        const queryString = queryParams.toString();
        const endpoint = `/frames${queryString ? `?${queryString}` : ''}`;
        
        return this.request(endpoint);
    }

    /**
     * Get a product by ID
     * @param {string} productId - Product ID
     * @returns {Promise<Object>} - Product data
     */
    async getProduct(productId) {
        const queryParams = new URLSearchParams();
        
        if (this.clientId) {
            queryParams.append('client_id', this.clientId);
        }
        
        const queryString = queryParams.toString();
        const endpoint = `/frames/${productId}${queryString ? `?${queryString}` : ''}`;
        
        return this.request(endpoint);
    }

    /**
     * Get all collections
     * @param {Object} options - Query parameters
     * @returns {Promise<Array>} - Array of collections
     */
    async getCollections(options = {}) {
        const queryParams = new URLSearchParams();
        
        if (this.clientId) {
            queryParams.append('client_id', this.clientId);
        }
        
        // Add other options as query parameters
        Object.entries(options).forEach(([key, value]) => {
            queryParams.append(key, value);
        });
        
        const queryString = queryParams.toString();
        const endpoint = `/collections${queryString ? `?${queryString}` : ''}`;
        
        return this.request(endpoint);
    }

    /**
     * Get a collection by ID
     * @param {string} collectionId - Collection ID
     * @returns {Promise<Object>} - Collection data
     */
    async getCollection(collectionId) {
        const queryParams = new URLSearchParams();
        
        if (this.clientId) {
            queryParams.append('client_id', this.clientId);
        }
        
        const queryString = queryParams.toString();
        const endpoint = `/collections/${collectionId}${queryString ? `?${queryString}` : ''}`;
        
        return this.request(endpoint);
    }

    /**
     * Get inventory for a product
     * @param {string} productId - Product ID
     * @returns {Promise<Object>} - Inventory data
     */
    async getInventory(productId) {
        const queryParams = new URLSearchParams();
        
        if (this.clientId) {
            queryParams.append('client_id', this.clientId);
        }
        
        if (productId) {
            queryParams.append('product_id', productId);
        }
        
        const queryString = queryParams.toString();
        const endpoint = `/inventory${queryString ? `?${queryString}` : ''}`;
        
        return this.request(endpoint);
    }

    /**
     * Get face shape compatibility for a product
     * @param {string} productId - Product ID
     * @returns {Promise<Object>} - Compatibility data
     */
    async getFaceShapeCompatibility(productId) {
        const queryParams = new URLSearchParams();
        
        if (this.clientId) {
            queryParams.append('client_id', this.clientId);
        }
        
        const queryString = queryParams.toString();
        const endpoint = `/products/${productId}/face-shape-compatibility${queryString ? `?${queryString}` : ''}`;
        
        return this.request(endpoint);
    }

    /**
     * Transform EyewearML API product data to the format expected by the store
     * @param {Object} product - EyewearML API product data
     * @returns {Object} - Transformed product data
     */
    transformProduct(product) {
        // Extract face shape compatibility scores
        const faceShapeCompatibility = {};
        if (product.faceShapeCompatibility) {
            Object.entries(product.faceShapeCompatibility).forEach(([shape, score]) => {
                faceShapeCompatibility[shape.toLowerCase()] = parseFloat(score);
            });
        } else {
            // Default values if not available
            faceShapeCompatibility.oval = 0.7;
            faceShapeCompatibility.round = 0.7;
            faceShapeCompatibility.square = 0.7;
            faceShapeCompatibility.heart = 0.7;
            faceShapeCompatibility.diamond = 0.7;
            faceShapeCompatibility.oblong = 0.7;
        }

        // Extract style keywords
        let styleKeywords = [];
        if (product.styleKeywords && Array.isArray(product.styleKeywords)) {
            styleKeywords = product.styleKeywords;
        } else if (product.tags && Array.isArray(product.tags)) {
            styleKeywords = product.tags;
        }

        // Create transformed product
        return {
            id: product.id || product._id,
            name: product.model || product.title || product.name || 'Unknown Frame',
            brand: product.brand || 'Sample Brand',
            brand_id: product.brandId || `brand_${(product.brand || '').toLowerCase().replace(/\s+/g, '_')}`,
            manufacturer_id: product.manufacturerId || 'unknown_manufacturer',
            manufacturer_name: product.manufacturer || 'Unknown Manufacturer',
            price: parseFloat(product.price) || 199.99,
            image: product.imageUrl || product.image || 'https://via.placeholder.com/600x400?text=Eyewear+Frame',
            description: product.description || 'High-quality eyewear frame with modern design',
            specifications: {
                frame_type: 'full-rim',
                frame_shape: product.style || 'rectangular',
                frame_material: product.material || 'acetate',
                frame_color: product.color || 'black'
            },
            ai_enhanced: {
                face_shape_compatibility_scores: faceShapeCompatibility,
                style_keywords: styleKeywords,
                feature_summary: product.featureSummary || product.summary || 'Modern eyewear frame with excellent build quality',
                style_description: product.styleDescription || 'Contemporary design suitable for various face shapes'
            },
            inventory: {
                available: product.available !== false ? 10 : 0,
                locations: product.inventory?.locations || ['Main Store']
            }
        };
    }

    /**
     * Transform multiple EyewearML API products
     * @param {Array} products - Array of EyewearML API products
     * @returns {Array} - Array of transformed products
     */
    transformProducts(products) {
        if (!Array.isArray(products)) {
            console.error('Expected products to be an array');
            return [];
        }
        
        return products.map(product => this.transformProduct(product));
    }
}

// Create a singleton instance
const visionCraftClient = new VisionCraftClient();

// For testing with mock data when API is not available
const useMockData = false;

/**
 * Get products from EyewearML API or mock data
 * @param {Object} options - Query parameters
 * @returns {Promise<Array>} - Array of products
 */
async function getProducts(options = {}) {
    if (useMockData) {
        // Return the mock data from main.js
        return Promise.resolve(products);
    }
    
    try {
        const response = await visionCraftClient.getProducts(options);
        // Handle the frames API response structure
        const framesData = response.frames || response.products || response;
        return visionCraftClient.transformProducts(framesData);
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to mock data
        return products;
    }
}

/**
 * Get a product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Product data
 */
async function getProduct(productId) {
    if (useMockData) {
        // Return the mock product from main.js
        const product = products.find(p => p.id === productId);
        return Promise.resolve(product || null);
    }
    
    try {
        const response = await visionCraftClient.getProduct(productId);
        return visionCraftClient.transformProduct(response);
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        // Fallback to mock data
        const product = products.find(p => p.id === productId);
        return product || null;
    }
}

/**
 * Get face shape compatibility for a product
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Compatibility data
 */
async function getFaceShapeCompatibility(productId) {
    if (useMockData) {
        // Return mock compatibility data
        const product = products.find(p => p.id === productId);
        return Promise.resolve(product?.ai_enhanced?.face_shape_compatibility_scores || {});
    }
    
    try {
        return await visionCraftClient.getFaceShapeCompatibility(productId);
    } catch (error) {
        console.error(`Error fetching face shape compatibility for product ${productId}:`, error);
        // Fallback to mock data
        const product = products.find(p => p.id === productId);
        return product?.ai_enhanced?.face_shape_compatibility_scores || {};
    }
}