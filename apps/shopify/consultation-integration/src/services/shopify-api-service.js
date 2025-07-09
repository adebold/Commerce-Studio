/**
 * Shopify API Service
 * Handles Shopify API interactions and authentication
 */

import axios from 'axios';
import crypto from 'crypto';

export default class ShopifyAPIService {
    constructor(config) {
        this.config = config;
        this.shopCredentials = new Map(); // In production, use secure database storage
    }

    /**
     * Generate OAuth URL for shop installation
     */
    getAuthURL(shop) {
        const scopes = this.config.SCOPES;
        const redirectUri = `${this.config.HOST}/auth/callback`;
        const state = crypto.randomBytes(16).toString('hex');
        
        const params = new URLSearchParams({
            client_id: this.config.SHOPIFY_API_KEY,
            scope: scopes,
            redirect_uri: redirectUri,
            state: state
        });
        
        return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
    }

    /**
     * Exchange authorization code for access token
     */
    async getAccessToken(shop, code) {
        try {
            const response = await axios.post(`https://${shop}/admin/oauth/access_token`, {
                client_id: this.config.SHOPIFY_API_KEY,
                client_secret: this.config.SHOPIFY_API_SECRET,
                code: code
            });
            
            return response.data.access_token;
            
        } catch (error) {
            console.error('Access token exchange error:', error);
            throw new Error('Failed to get access token');
        }
    }

    /**
     * Store shop credentials securely
     */
    async storeShopCredentials(shop, accessToken) {
        try {
            // In production, store in encrypted database
            this.shopCredentials.set(shop, {
                accessToken,
                createdAt: new Date(),
                lastUsed: new Date()
            });
            
            console.log(`Stored credentials for shop: ${shop}`);
            
        } catch (error) {
            console.error('Credential storage error:', error);
            throw error;
        }
    }

    /**
     * Get shop credentials
     */
    getShopCredentials(shop) {
        return this.shopCredentials.get(shop);
    }

    /**
     * Remove shop credentials
     */
    async removeShopCredentials(shop) {
        try {
            this.shopCredentials.delete(shop);
            console.log(`Removed credentials for shop: ${shop}`);
            
        } catch (error) {
            console.error('Credential removal error:', error);
            throw error;
        }
    }

    /**
     * Make authenticated API request to Shopify
     */
    async makeAPIRequest(shop, endpoint, options = {}) {
        try {
            const credentials = this.getShopCredentials(shop);
            
            if (!credentials) {
                throw new Error('Shop credentials not found');
            }
            
            const config = {
                method: options.method || 'GET',
                url: `https://${shop}/admin/api/2023-10${endpoint}`,
                headers: {
                    'X-Shopify-Access-Token': credentials.accessToken,
                    'Content-Type': 'application/json'
                },
                ...options
            };
            
            const response = await axios(config);
            
            // Update last used timestamp
            credentials.lastUsed = new Date();
            this.shopCredentials.set(shop, credentials);
            
            return response.data;
            
        } catch (error) {
            console.error('Shopify API request error:', error);
            throw error;
        }
    }

    /**
     * Get shop information
     */
    async getShopInfo(shop) {
        try {
            return await this.makeAPIRequest(shop, '/shop.json');
            
        } catch (error) {
            console.error('Get shop info error:', error);
            throw error;
        }
    }

    /**
     * Get shop products
     */
    async getProducts(shop, options = {}) {
        try {
            const params = new URLSearchParams({
                limit: options.limit || 250,
                ...options.params
            });
            
            return await this.makeAPIRequest(shop, `/products.json?${params.toString()}`);
            
        } catch (error) {
            console.error('Get products error:', error);
            throw error;
        }
    }

    /**
     * Get single product
     */
    async getProduct(shop, productId) {
        try {
            return await this.makeAPIRequest(shop, `/products/${productId}.json`);
            
        } catch (error) {
            console.error('Get product error:', error);
            throw error;
        }
    }

    /**
     * Create script tag
     */
    async createScriptTag(shop, scriptTag) {
        try {
            return await this.makeAPIRequest(shop, '/script_tags.json', {
                method: 'POST',
                data: scriptTag
            });
            
        } catch (error) {
            console.error('Create script tag error:', error);
            throw error;
        }
    }

    /**
     * Delete script tag
     */
    async deleteScriptTag(shop, scriptTagId) {
        try {
            return await this.makeAPIRequest(shop, `/script_tags/${scriptTagId}.json`, {
                method: 'DELETE'
            });
            
        } catch (error) {
            console.error('Delete script tag error:', error);
            throw error;
        }
    }

    /**
     * Create webhook
     */
    async createWebhook(shop, webhook) {
        try {
            return await this.makeAPIRequest(shop, '/webhooks.json', {
                method: 'POST',
                data: webhook
            });
            
        } catch (error) {
            console.error('Create webhook error:', error);
            throw error;
        }
    }

    /**
     * Get webhooks
     */
    async getWebhooks(shop) {
        try {
            return await this.makeAPIRequest(shop, '/webhooks.json');
            
        } catch (error) {
            console.error('Get webhooks error:', error);
            throw error;
        }
    }

    /**
     * Delete webhook
     */
    async deleteWebhook(shop, webhookId) {
        try {
            return await this.makeAPIRequest(shop, `/webhooks/${webhookId}.json`, {
                method: 'DELETE'
            });
            
        } catch (error) {
            console.error('Delete webhook error:', error);
            throw error;
        }
    }

    /**
     * Verify webhook
     */
    verifyWebhook(data, hmacHeader) {
        try {
            const calculated = crypto
                .createHmac('sha256', this.config.SHOPIFY_API_SECRET)
                .update(data, 'utf8')
                .digest('base64');
            
            return crypto.timingSafeEqual(
                Buffer.from(calculated, 'base64'),
                Buffer.from(hmacHeader, 'base64')
            );
            
        } catch (error) {
            console.error('Webhook verification error:', error);
            return false;
        }
    }

    /**
     * Get collections
     */
    async getCollections(shop, options = {}) {
        try {
            const params = new URLSearchParams({
                limit: options.limit || 250,
                ...options.params
            });
            
            return await this.makeAPIRequest(shop, `/collections.json?${params.toString()}`);
            
        } catch (error) {
            console.error('Get collections error:', error);
            throw error;
        }
    }

    /**
     * Get customers
     */
    async getCustomers(shop, options = {}) {
        try {
            const params = new URLSearchParams({
                limit: options.limit || 250,
                ...options.params
            });
            
            return await this.makeAPIRequest(shop, `/customers.json?${params.toString()}`);
            
        } catch (error) {
            console.error('Get customers error:', error);
            throw error;
        }
    }

    /**
     * Create product metafield
     */
    async createProductMetafield(shop, productId, metafield) {
        try {
            return await this.makeAPIRequest(shop, `/products/${productId}/metafields.json`, {
                method: 'POST',
                data: { metafield }
            });
            
        } catch (error) {
            console.error('Create product metafield error:', error);
            throw error;
        }
    }

    /**
     * Get product metafields
     */
    async getProductMetafields(shop, productId) {
        try {
            return await this.makeAPIRequest(shop, `/products/${productId}/metafields.json`);
            
        } catch (error) {
            console.error('Get product metafields error:', error);
            throw error;
        }
    }
}