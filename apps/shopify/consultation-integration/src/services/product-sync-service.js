/**
 * Product Sync Service
 * Synchronizes Shopify products with consultation system
 */

import ShopifyAPIService from './shopify-api-service.js';

export default class ProductSyncService {
    constructor(config) {
        this.config = config;
        this.shopifyAPI = new ShopifyAPIService(config);
        this.syncedProducts = new Map(); // Shop -> Products mapping
        this.lastSyncTimes = new Map(); // Shop -> timestamp mapping
    }

    /**
     * Sync all products for a shop
     */
    async syncShopProducts(shop) {
        try {
            console.log(`Starting product sync for shop: ${shop}`);
            
            const shopInfo = await this.shopifyAPI.getShopInfo(shop);
            const products = await this.getAllProducts(shop);
            
            // Transform products for consultation system
            const transformedProducts = products.map(product => 
                this.transformShopifyProduct(product, shop)
            );
            
            // Store synced products
            this.syncedProducts.set(shop, transformedProducts);
            this.lastSyncTimes.set(shop, new Date());
            
            // Add consultation metadata to products
            await this.addConsultationMetadata(shop, products);
            
            console.log(`Synced ${transformedProducts.length} products for ${shop}`);
            
            return {
                syncedCount: transformedProducts.length,
                timestamp: new Date().toISOString(),
                shopInfo: shopInfo.shop
            };
            
        } catch (error) {
            console.error('Product sync error:', error);
            throw new Error('Failed to sync shop products');
        }
    }

    /**
     * Get all products from Shopify (handles pagination)
     */
    async getAllProducts(shop) {
        try {
            let allProducts = [];
            let hasNextPage = true;
            let pageInfo = null;
            
            while (hasNextPage) {
                const params = {
                    limit: 250,
                    fields: 'id,title,handle,vendor,product_type,tags,variants,images,options,created_at,updated_at'
                };
                
                if (pageInfo) {
                    params.page_info = pageInfo;
                }
                
                const response = await this.shopifyAPI.getProducts(shop, { params });
                const products = response.products || [];
                
                allProducts = allProducts.concat(products);
                
                // Check for pagination (simplified - in real implementation check Link header)
                hasNextPage = products.length === 250;
                pageInfo = products.length > 0 ? products[products.length - 1].id : null;
            }
            
            return allProducts;
            
        } catch (error) {
            console.error('Get all products error:', error);
            throw error;
        }
    }

    /**
     * Transform Shopify product to consultation format
     */
    transformShopifyProduct(shopifyProduct, shop) {
        try {
            const mainVariant = shopifyProduct.variants?.[0] || {};
            const mainImage = shopifyProduct.images?.[0];
            
            // Extract eyewear-specific attributes from tags and product type
            const eyewareAttributes = this.extractEyewearAttributes(shopifyProduct);
            
            return {
                id: `shopify_${shopifyProduct.id}`,
                shopifyId: shopifyProduct.id,
                shop: shop,
                name: shopifyProduct.title,
                handle: shopifyProduct.handle,
                brand: shopifyProduct.vendor || 'Unknown',
                category: this.categorizeProduct(shopifyProduct.product_type, shopifyProduct.tags),
                style: eyewareAttributes.style,
                material: eyewareAttributes.material,
                color: eyewareAttributes.color,
                price: parseFloat(mainVariant.price) || 0,
                compareAtPrice: parseFloat(mainVariant.compare_at_price) || null,
                sku: mainVariant.sku || '',
                barcode: mainVariant.barcode || '',
                weight: parseFloat(mainVariant.weight) || 0,
                measurements: eyewareAttributes.measurements,
                features: eyewareAttributes.features,
                suitableFaceShapes: eyewareAttributes.suitableFaceShapes,
                styleMatch: eyewareAttributes.styleMatch,
                lifestyleMatch: eyewareAttributes.lifestyleMatch,
                image: mainImage?.src || '',
                images: shopifyProduct.images?.map(img => img.src) || [],
                variants: shopifyProduct.variants?.map(variant => ({
                    id: variant.id,
                    title: variant.title,
                    price: parseFloat(variant.price),
                    compareAtPrice: parseFloat(variant.compare_at_price) || null,
                    sku: variant.sku,
                    barcode: variant.barcode,
                    weight: parseFloat(variant.weight) || 0,
                    available: variant.available,
                    inventoryQuantity: variant.inventory_quantity || 0
                })) || [],
                tags: shopifyProduct.tags?.split(',').map(tag => tag.trim()) || [],
                productType: shopifyProduct.product_type || '',
                createdAt: shopifyProduct.created_at,
                updatedAt: shopifyProduct.updated_at,
                inStock: mainVariant.available && (mainVariant.inventory_quantity || 0) > 0,
                popularity: this.calculatePopularity(shopifyProduct),
                rating: 4.0, // Default rating - would integrate with review system
                reviews: 0 // Default - would integrate with review system
            };
            
        } catch (error) {
            console.error('Product transformation error:', error);
            return null;
        }
    }

    /**
     * Extract eyewear-specific attributes from product data
     */
    extractEyewearAttributes(product) {
        const tags = product.tags?.toLowerCase() || '';
        const productType = product.product_type?.toLowerCase() || '';
        const title = product.title?.toLowerCase() || '';
        
        // Style detection
        let style = 'rectangular'; // default
        if (tags.includes('round') || title.includes('round')) style = 'round';
        if (tags.includes('cat-eye') || title.includes('cat-eye')) style = 'cat-eye';
        if (tags.includes('aviator') || title.includes('aviator')) style = 'aviator';
        if (tags.includes('square') || title.includes('square')) style = 'square';
        if (tags.includes('oval') || title.includes('oval')) style = 'oval';
        if (tags.includes('wrap') || title.includes('wrap')) style = 'wrap';
        
        // Material detection
        let material = 'acetate'; // default
        if (tags.includes('metal') || title.includes('metal')) material = 'metal';
        if (tags.includes('titanium') || title.includes('titanium')) material = 'titanium';
        if (tags.includes('tr90') || title.includes('tr90')) material = 'TR90';
        if (tags.includes('carbon') || title.includes('carbon')) material = 'carbon fiber';
        if (tags.includes('wood') || title.includes('wood')) material = 'wood';
        
        // Color detection from tags/title
        let color = 'black'; // default
        const colors = ['black', 'brown', 'blue', 'red', 'green', 'gold', 'silver', 'tortoiseshell', 'clear'];
        for (const colorOption of colors) {
            if (tags.includes(colorOption) || title.includes(colorOption)) {
                color = colorOption;
                break;
            }
        }
        
        // Features extraction
        const features = [];
        if (tags.includes('blue light') || title.includes('blue light')) features.push('blue light filtering');
        if (tags.includes('anti-glare') || title.includes('anti-glare')) features.push('anti-glare coating');
        if (tags.includes('lightweight') || title.includes('lightweight')) features.push('lightweight');
        if (tags.includes('polarized') || title.includes('polarized')) features.push('polarized');
        if (tags.includes('uv protection') || tags.includes('uv400')) features.push('UV400 protection');
        if (tags.includes('adjustable') || title.includes('adjustable')) features.push('adjustable nose pads');
        
        // Face shape compatibility (basic mapping)
        const suitableFaceShapes = this.mapStyleToFaceShapes(style);
        
        // Style matching
        const styleMatch = this.mapToStyleCategories(style, material, tags);
        
        // Lifestyle matching
        const lifestyleMatch = this.mapToLifestyleCategories(productType, features, tags);
        
        // Mock measurements (in real implementation, these would come from metafields)
        const measurements = this.generateMockMeasurements(style);
        
        return {
            style,
            material,
            color,
            measurements,
            features,
            suitableFaceShapes,
            styleMatch,
            lifestyleMatch
        };
    }

    /**
     * Categorize product based on type and tags
     */
    categorizeProduct(productType, tags) {
        const type = productType?.toLowerCase() || '';
        const tagString = tags?.toLowerCase() || '';
        
        if (type.includes('sunglasses') || tagString.includes('sunglasses')) {
            return 'sunglasses';
        }
        if (type.includes('reading') || tagString.includes('reading')) {
            return 'reading glasses';
        }
        if (type.includes('safety') || tagString.includes('safety')) {
            return 'safety glasses';
        }
        
        return 'prescription'; // default
    }

    /**
     * Map frame style to suitable face shapes
     */
    mapStyleToFaceShapes(style) {
        const faceShapeMap = {
            'rectangular': ['oval', 'round', 'heart'],
            'round': ['square', 'diamond', 'oblong'],
            'cat-eye': ['heart', 'diamond', 'round'],
            'aviator': ['oval', 'heart', 'square'],
            'square': ['oblong', 'diamond'],
            'oval': ['square', 'diamond', 'oblong'],
            'wrap': ['oval', 'square', 'oblong']
        };
        
        return faceShapeMap[style] || ['oval', 'round', 'square'];
    }

    /**
     * Map to style categories
     */
    mapToStyleCategories(style, material, tags) {
        const styles = [];
        
        // Classic styles
        if (['rectangular', 'oval', 'aviator'].includes(style) || material === 'metal') {
            styles.push('classic');
        }
        
        // Modern styles
        if (['rectangular', 'square'].includes(style) || material === 'titanium') {
            styles.push('modern');
        }
        
        // Bold styles
        if (['cat-eye', 'oversized', 'round'].includes(style) || tags.includes('statement')) {
            styles.push('bold');
        }
        
        // Vintage styles
        if (['round', 'cat-eye', 'aviator'].includes(style) || tags.includes('vintage')) {
            styles.push('vintage');
        }
        
        // Sporty styles
        if (['wrap', 'rectangular'].includes(style) || material === 'TR90') {
            styles.push('sporty');
        }
        
        return styles.length > 0 ? styles : ['classic'];
    }

    /**
     * Map to lifestyle categories
     */
    mapToLifestyleCategories(productType, features, tags) {
        const lifestyles = [];
        
        if (features.includes('blue light filtering') || tags.includes('office')) {
            lifestyles.push('professional');
        }
        
        if (features.includes('lightweight') || tags.includes('student')) {
            lifestyles.push('student');
        }
        
        if (features.includes('impact resistant') || tags.includes('sport')) {
            lifestyles.push('active');
        }
        
        if (features.includes('fashion') || tags.includes('trendy')) {
            lifestyles.push('social');
        }
        
        if (features.includes('UV400 protection') || productType.includes('sunglasses')) {
            lifestyles.push('outdoor');
        }
        
        return lifestyles.length > 0 ? lifestyles : ['professional'];
    }

    /**
     * Generate mock measurements based on style
     */
    generateMockMeasurements(style) {
        const baseMeasurements = {
            'rectangular': { lensWidth: 52, bridgeWidth: 18, templeLength: 140, frameWidth: 135, frameHeight: 32 },
            'round': { lensWidth: 48, bridgeWidth: 20, templeLength: 145, frameWidth: 130, frameHeight: 48 },
            'cat-eye': { lensWidth: 54, bridgeWidth: 16, templeLength: 138, frameWidth: 140, frameHeight: 38 },
            'aviator': { lensWidth: 58, bridgeWidth: 14, templeLength: 135, frameWidth: 140, frameHeight: 50 },
            'square': { lensWidth: 56, bridgeWidth: 17, templeLength: 142, frameWidth: 145, frameHeight: 45 },
            'wrap': { lensWidth: 65, bridgeWidth: 15, templeLength: 125, frameWidth: 145, frameHeight: 42 }
        };
        
        return baseMeasurements[style] || baseMeasurements['rectangular'];
    }

    /**
     * Calculate product popularity score
     */
    calculatePopularity(product) {
        // Simple popularity calculation based on available metrics
        let score = 0.5; // base score
        
        // Boost for having images
        if (product.images && product.images.length > 0) score += 0.1;
        
        // Boost for having variants
        if (product.variants && product.variants.length > 1) score += 0.1;
        
        // Boost for complete product info
        if (product.vendor && product.product_type) score += 0.1;
        
        // Boost for tags (indicates curation)
        if (product.tags && product.tags.length > 0) score += 0.2;
        
        return Math.min(score, 1.0);
    }

    /**
     * Add consultation metadata to Shopify products
     */
    async addConsultationMetadata(shop, products) {
        try {
            console.log(`Adding consultation metadata for ${products.length} products`);
            
            // In a real implementation, you'd add metafields for:
            // - Face shape compatibility
            // - Style categories
            // - Lifestyle matches
            // - Measurements
            
            // Example metafield structure:
            const sampleMetafields = [
                {
                    namespace: 'consultation',
                    key: 'face_shapes',
                    value: JSON.stringify(['oval', 'round']),
                    type: 'json'
                },
                {
                    namespace: 'consultation',
                    key: 'measurements',
                    value: JSON.stringify({ lensWidth: 52, bridgeWidth: 18 }),
                    type: 'json'
                }
            ];
            
            // Batch process products (limit API calls)
            for (let i = 0; i < Math.min(products.length, 5); i++) {
                const product = products[i];
                try {
                    // await this.shopifyAPI.createProductMetafield(shop, product.id, sampleMetafields[0]);
                    console.log(`Added metadata to product ${product.id}`);
                } catch (error) {
                    console.error(`Failed to add metadata to product ${product.id}:`, error.message);
                }
            }
            
        } catch (error) {
            console.error('Add consultation metadata error:', error);
        }
    }

    /**
     * Sync single product (for webhooks)
     */
    async syncSingleProduct(shop, shopifyProduct) {
        try {
            const transformedProduct = this.transformShopifyProduct(shopifyProduct, shop);
            
            if (!transformedProduct) {
                throw new Error('Product transformation failed');
            }
            
            // Update in local storage
            const shopProducts = this.syncedProducts.get(shop) || [];
            const existingIndex = shopProducts.findIndex(p => p.shopifyId === shopifyProduct.id);
            
            if (existingIndex >= 0) {
                shopProducts[existingIndex] = transformedProduct;
            } else {
                shopProducts.push(transformedProduct);
            }
            
            this.syncedProducts.set(shop, shopProducts);
            
            console.log(`Synced single product: ${shopifyProduct.title} for ${shop}`);
            return transformedProduct;
            
        } catch (error) {
            console.error('Single product sync error:', error);
            throw error;
        }
    }

    /**
     * Update synced product (for webhooks)
     */
    async updateSyncedProduct(shop, shopifyProduct) {
        try {
            return await this.syncSingleProduct(shop, shopifyProduct);
            
        } catch (error) {
            console.error('Update synced product error:', error);
            throw error;
        }
    }

    /**
     * Get synced products for a shop
     */
    getShopProducts(shop) {
        return this.syncedProducts.get(shop) || [];
    }

    /**
     * Get last sync time for a shop
     */
    getLastSyncTime(shop) {
        return this.lastSyncTimes.get(shop);
    }

    /**
     * Check if sync is needed
     */
    isSyncNeeded(shop, maxAgeHours = 24) {
        const lastSync = this.getLastSyncTime(shop);
        
        if (!lastSync) return true;
        
        const ageHours = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
        return ageHours > maxAgeHours;
    }
}