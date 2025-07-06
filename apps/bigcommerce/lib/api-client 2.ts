import BigCommerce from 'node-bigcommerce';
import { BigCommerceConfig, ProductData, RecommendationOptions, AnalyticsEvent, FaceShape, StyleScore, CustomerMeasurement, ProductComparisonOptions } from './types';

export class ApiClient {
    private bc: BigCommerce;
    private varaiApiKey: string;
    private varaiApiUrl: string;

    constructor(config: BigCommerceConfig) {
        this.bc = new BigCommerce({
            clientId: config.clientId,
            accessToken: config.accessToken,
            storeHash: config.storeHash,
            responseType: 'json',
            apiVersion: 'v3'
        });

        this.varaiApiKey = config.varaiApiKey;
        this.varaiApiUrl = config.varaiApiUrl || 'https://api.varai.ai/v1';
    }

    /**
     * Get product data
     */
    async getProduct(productId: number): Promise<ProductData> {
        const [product, customFields] = await Promise.all([
            this.bc.get(`/catalog/products/${productId}`),
            this.bc.get(`/catalog/products/${productId}/custom-fields`)
        ]);

        return {
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            brand: product.brand_id ? await this.getBrandName(product.brand_id) : '',
            images: product.images,
            customFields: customFields.reduce((acc: Record<string, string>, field: any) => {
                acc[field.name] = field.value;
                return acc;
            }, {}),
        };
    }

    /**
     * Get brand name
     */
    private async getBrandName(brandId: number): Promise<string> {
        const brand = await this.bc.get(`/catalog/brands/${brandId}`);
        return brand.name;
    }

    /**
     * Update product custom fields
     */
    async updateProductCustomFields(productId: number, fields: Record<string, string>): Promise<void> {
        const existingFields = await this.bc.get(`/catalog/products/${productId}/custom-fields`);
        
        // Delete existing VARAi fields
        for (const field of existingFields) {
            if (field.name.startsWith('varai_')) {
                await this.bc.delete(`/catalog/products/${productId}/custom-fields/${field.id}`);
            }
        }

        // Add new fields
        for (const [name, value] of Object.entries(fields)) {
            await this.bc.create(`/catalog/products/${productId}/custom-fields`, {
                name: `varai_${name}`,
                value: value
            });
        }
    }

    /**
     * Get product recommendations
     */
    async getRecommendations(productId: number, options: RecommendationOptions = {}): Promise<ProductData[]> {
        const product = await this.getProduct(productId);
        
        const response = await fetch(`${this.varaiApiUrl}/recommendations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.varaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product: {
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    style: product.customFields.varai_style_tags,
                    price: product.price,
                    face_shape_compatibility: product.customFields.varai_face_shape_compatibility
                },
                ...options
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get recommendations');
        }

        const data = await response.json();
        const recommendedProducts = await Promise.all(
            data.recommendations.map((rec: any) => this.getProduct(rec.product_id))
        );

        return recommendedProducts;
    }

    /**
     * Get face shape compatibility recommendations
     */
    async getFaceShapeRecommendations(faceShape: FaceShape, options: RecommendationOptions = {}): Promise<ProductData[]> {
        const response = await fetch(`${this.varaiApiUrl}/recommendations/face-shape`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.varaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                face_shape: faceShape,
                ...options
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get face shape recommendations');
        }

        const data = await response.json();
        const recommendedProducts = await Promise.all(
            data.recommendations.map((rec: any) => this.getProduct(rec.product_id))
        );

        return recommendedProducts;
    }

    /**
     * Update product embeddings
     */
    async updateProductEmbeddings(productId: number): Promise<void> {
        const product = await this.getProduct(productId);
        
        const response = await fetch(`${this.varaiApiUrl}/embeddings/update`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.varaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product: {
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    style: product.customFields.varai_style_tags,
                    price: product.price,
                    face_shape_compatibility: product.customFields.varai_face_shape_compatibility,
                    style_score: product.customFields.varai_style_score,
                    measurements: {
                        width: product.customFields.varai_frame_width,
                        bridge: product.customFields.varai_frame_bridge,
                        temple: product.customFields.varai_frame_temple,
                        lens_height: product.customFields.varai_frame_lens_height,
                        lens_width: product.customFields.varai_frame_lens_width,
                        weight: product.customFields.varai_frame_weight
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update embeddings');
        }
    }

    /**
     * Calculate style score for a product
     */
    async calculateStyleScore(productId: number): Promise<StyleScore> {
        const product = await this.getProduct(productId);
        
        const response = await fetch(`${this.varaiApiUrl}/style-score/calculate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.varaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product: {
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    style: product.customFields.varai_style_tags,
                    images: product.images.map((img: any) => img.url_standard)
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to calculate style score');
        }

        const data = await response.json();
        
        // Update product custom field with the style score
        await this.updateProductCustomFields(productId, {
            style_score: data.score.toString(),
            style_score_breakdown: JSON.stringify(data.breakdown)
        });

        return data;
    }

    /**
     * Detect face shape from image
     */
    async detectFaceShape(imageData: string): Promise<FaceShape> {
        const response = await fetch(`${this.varaiApiUrl}/face-shape/detect`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.varaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageData
            })
        });

        if (!response.ok) {
            throw new Error('Failed to detect face shape');
        }

        const data = await response.json();
        return data.face_shape;
    }

    /**
     * Store customer measurements
     */
    async storeCustomerMeasurements(customerId: number, measurements: CustomerMeasurement): Promise<void> {
        const response = await fetch(`${this.varaiApiUrl}/customers/${customerId}/measurements`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.varaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(measurements)
        });

        if (!response.ok) {
            throw new Error('Failed to store customer measurements');
        }
    }

    /**
     * Get customer measurements
     */
    async getCustomerMeasurements(customerId: number): Promise<CustomerMeasurement> {
        const response = await fetch(`${this.varaiApiUrl}/customers/${customerId}/measurements`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.varaiApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get customer measurements');
        }

        return response.json();
    }

    /**
     * Compare products
     */
    async compareProducts(productIds: number[], options: ProductComparisonOptions = {}): Promise<any> {
        const products = await Promise.all(productIds.map(id => this.getProduct(id)));
        
        const response = await fetch(`${this.varaiApiUrl}/products/compare`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.varaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                products: products.map(product => ({
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    style: product.customFields.varai_style_tags,
                    face_shape_compatibility: product.customFields.varai_face_shape_compatibility,
                    style_score: product.customFields.varai_style_score,
                    measurements: {
                        width: product.customFields.varai_frame_width,
                        bridge: product.customFields.varai_frame_bridge,
                        temple: product.customFields.varai_frame_temple,
                        lens_height: product.customFields.varai_frame_lens_height,
                        lens_width: product.customFields.varai_frame_lens_width,
                        weight: product.customFields.varai_frame_weight
                    }
                })),
                ...options
            })
        });

        if (!response.ok) {
            throw new Error('Failed to compare products');
        }

        return response.json();
    }

    /**
     * Track analytics event
     */
    async trackEvent(event: AnalyticsEvent): Promise<void> {
        const response = await fetch(`${this.varaiApiUrl}/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.varaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...event,
                platform: 'bigcommerce',
                store_hash: this.bc.config.storeHash,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to track event');
        }
    }

    /**
     * Get script tags
     */
    async getScriptTags(): Promise<any[]> {
        return this.bc.get('/content/scripts');
    }

    /**
     * Create script tag
     */
    async createScriptTag(params: {
        name: string;
        description?: string;
        src: string;
        location: 'head' | 'footer';
        visibility?: 'storefront' | 'all' | 'checkout';
        kind?: 'src' | 'script';
        consent_category?: 'essential' | 'functional' | 'analytics' | 'targeting';
    }): Promise<void> {
        await this.bc.create('/content/scripts', params);
    }

    /**
     * Delete script tag
     */
    async deleteScriptTag(scriptId: number): Promise<void> {
        await this.bc.delete(`/content/scripts/${scriptId}`);
    }

    /**
     * Get store information
     */
    async getStoreInfo(): Promise<any> {
        return this.bc.get('/store');
    }

    /**
     * Get store settings
     */
    async getSettings(): Promise<any> {
        const settings = await this.bc.get('/settings');
        return settings.reduce((acc: Record<string, any>, setting: any) => {
            if (setting.name.startsWith('varai_')) {
                acc[setting.name.replace('varai_', '')] = setting.value;
            }
            return acc;
        }, {});
    }

    /**
     * Update store settings
     */
    async updateSettings(settings: Record<string, any>): Promise<void> {
        const updates = Object.entries(settings).map(([key, value]) => ({
            name: `varai_${key}`,
            value: value
        }));

        await this.bc.update('/settings', updates);
    }

    /**
     * Get virtual try-on model
     */
    async getVirtualTryOnModel(productId: number): Promise<any> {
        const response = await fetch(`${this.varaiApiUrl}/virtual-try-on/model`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.varaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get virtual try-on model');
        }

        return response.json();
    }

    /**
     * Upload virtual try-on model
     */
    async uploadVirtualTryOnModel(productId: number, modelFile: File): Promise<void> {
        const formData = new FormData();
        formData.append('product_id', productId.toString());
        formData.append('model_file', modelFile);

        const response = await fetch(`${this.varaiApiUrl}/virtual-try-on/model/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.varaiApiKey}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload virtual try-on model');
        }
    }

    /**
     * Delete virtual try-on model
     */
    async deleteVirtualTryOnModel(productId: number): Promise<void> {
        const response = await fetch(`${this.varaiApiUrl}/virtual-try-on/model`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.varaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to delete virtual try-on model');
        }
    }

    /**
     * Get analytics dashboard data
     */
    async getAnalyticsDashboard(): Promise<any> {
        const response = await fetch(`${this.varaiApiUrl}/analytics/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.varaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                store_hash: this.bc.config.storeHash
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get analytics dashboard data');
        }

        return response.json();
    }
}
