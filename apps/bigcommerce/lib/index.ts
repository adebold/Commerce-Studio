export { ApiClient } from './api-client';
export { Analytics } from './analytics';
export { VirtualTryOn } from './virtual-try-on';

export type {
    BigCommerceConfig,
    ProductData,
    ProductImage,
    RecommendationOptions,
    AnalyticsEvent,
    ScriptTag,
    StoreSettings,
    FaceShape,
    StyleScore,
    CustomerMeasurement,
    ProductComparisonOptions
} from './types';

/**
 * Initialize VARAi for BigCommerce
 */
import type { BigCommerceConfig, FaceShape } from './types';
import { ApiClient } from './api-client';
import { Analytics } from './analytics';
import { VirtualTryOn } from './virtual-try-on';

export function initialize(config: BigCommerceConfig & {
    ga4MeasurementId?: string,
    trackFaceShapeDetection?: boolean,
    trackStyleScoreViews?: boolean,
    trackProductComparisons?: boolean
}) {
    const apiClient = new ApiClient(config);
    const analytics = new Analytics(apiClient, {
        enabled: true,
        ga4MeasurementId: config.ga4MeasurementId,
        trackProductViews: true,
        trackTryOns: true,
        trackRecommendations: true,
        trackFaceShapeDetection: config.trackFaceShapeDetection || false,
        trackStyleScoreViews: config.trackStyleScoreViews || false,
        trackProductComparisons: config.trackProductComparisons || false
    });

    return {
        apiClient,
        analytics,
        VirtualTryOn: (options: {
            container: HTMLElement;
            productId: number;
            onSuccess?: () => void;
            onError?: (error: Error) => void;
            onCapture?: (imageData: string) => void;
            onFaceShapeDetected?: (faceShape: FaceShape) => void;
            detectFaceShape?: boolean;
            enableMeasurements?: boolean;
        }) => {
            const tryOn = new VirtualTryOn(apiClient);
            tryOn.initialize(options);
            return tryOn;
        },
    };
}

/**
 * Load VARAi script
 */
export function loadScript(storeHash: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://app.varai.ai/bigcommerce/assets/app.js?store=${storeHash}`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load VARAi script'));
        document.head.appendChild(script);
    });
}

/**
 * Add product recommendations
 */
export function addRecommendations(options: {
    container: HTMLElement;
    productId: number;
    limit?: number;
    type?: 'similar' | 'complementary' | 'style_based' | 'face_shape';
    faceShape?: FaceShape;
    stylePreference?: string[];
}): void {
    const { container, productId, limit = 4, type = 'similar' } = options;

    // Add data attributes
    container.setAttribute('data-varai-recommendations', '');
    container.setAttribute('data-product-id', productId.toString());
    container.setAttribute('data-limit', limit.toString());
    container.setAttribute('data-type', type);
    
    if (options.faceShape) {
        container.setAttribute('data-face-shape', options.faceShape);
    }
    
    if (options.stylePreference && options.stylePreference.length > 0) {
        container.setAttribute('data-style-preference', options.stylePreference.join(','));
    }

    // Add loading state
    container.innerHTML = '<div class="varai-loading">Loading recommendations...</div>';

    // Recommendations will be loaded by app.js
}

/**
 * Add virtual try-on button
 */
export function addTryOnButton(options: {
    container: HTMLElement;
    productId: number;
    buttonText?: string;
    detectFaceShape?: boolean;
}): void {
    const { container, productId, buttonText = 'Virtual Try-On', detectFaceShape = true } = options;

    const button = document.createElement('button');
    button.className = 'varai-try-on-button';
    button.setAttribute('data-product-id', productId.toString());
    button.textContent = buttonText;
    
    if (detectFaceShape) {
        button.setAttribute('data-detect-face-shape', 'true');
    }

    container.appendChild(button);
}

/**
 * Add product comparison
 */
export function addProductComparison(options: {
    container: HTMLElement;
    productIds: number[];
    compareAttributes?: string[];
    title?: string;
}): void {
    const { container, productIds, compareAttributes = ['style', 'measurements', 'price', 'rating'], title = 'Compare Products' } = options;

    // Add data attributes
    container.setAttribute('data-varai-product-comparison', '');
    container.setAttribute('data-product-ids', productIds.join(','));
    container.setAttribute('data-compare-attributes', compareAttributes.join(','));
    
    // Add loading state
    container.innerHTML = `
        <div class="varai-product-comparison-header">
            <h3>${title}</h3>
        </div>
        <div class="varai-loading">Loading product comparison...</div>
    `;

    // Product comparison will be loaded by app.js
}

/**
 * Add style score display
 */
export function addStyleScore(options: {
    container: HTMLElement;
    productId: number;
    showDetails?: boolean;
}): void {
    const { container, productId, showDetails = true } = options;

    // Add data attributes
    container.setAttribute('data-varai-style-score', '');
    container.setAttribute('data-product-id', productId.toString());
    
    if (showDetails) {
        container.setAttribute('data-show-details', 'true');
    }

    // Add loading state
    container.innerHTML = '<div class="varai-loading">Loading style score...</div>';

    // Style score will be loaded by app.js
}

/**
 * Add face shape compatibility display
 */
export function addFaceShapeCompatibility(options: {
    container: HTMLElement;
    productId: number;
    faceShape?: FaceShape;
}): void {
    const { container, productId, faceShape } = options;

    // Add data attributes
    container.setAttribute('data-varai-face-shape-compatibility', '');
    container.setAttribute('data-product-id', productId.toString());
    
    if (faceShape) {
        container.setAttribute('data-face-shape', faceShape);
    }

    // Add loading state
    container.innerHTML = '<div class="varai-loading">Loading face shape compatibility...</div>';

    // Face shape compatibility will be loaded by app.js
}

/**
 * Version
 */
export const version = '1.0.0';
