import { AnalyticsEvent, FaceShape } from './types';
import { ApiClient } from './api-client';

export class Analytics {
    private apiClient: ApiClient;
    private ga4MeasurementId: string | null;
    private enabled: boolean;
    private trackProductViews: boolean;
    private trackTryOns: boolean;
    private trackRecommendations: boolean;
    private trackFaceShapeDetection: boolean;
    private trackStyleScoreViews: boolean;
    private trackProductComparisons: boolean;

    constructor(apiClient: ApiClient, settings: {
        enabled: boolean;
        ga4MeasurementId?: string;
        trackProductViews?: boolean;
        trackTryOns?: boolean;
        trackRecommendations?: boolean;
        trackFaceShapeDetection?: boolean;
        trackStyleScoreViews?: boolean;
        trackProductComparisons?: boolean;
    }) {
        this.apiClient = apiClient;
        this.enabled = settings.enabled;
        this.ga4MeasurementId = settings.ga4MeasurementId || null;
        this.trackProductViews = settings.trackProductViews || false;
        this.trackTryOns = settings.trackTryOns || false;
        this.trackRecommendations = settings.trackRecommendations || false;
        this.trackFaceShapeDetection = settings.trackFaceShapeDetection || false;
        this.trackStyleScoreViews = settings.trackStyleScoreViews || false;
        this.trackProductComparisons = settings.trackProductComparisons || false;
    }

    /**
     * Initialize analytics
     */
    async initialize(): Promise<void> {
        if (!this.enabled) {
            return;
        }

        // Load GA4 script
        if (this.ga4MeasurementId) {
            await this.loadGA4Script();
        }

        // Initialize event listeners
        this.initializeEventListeners();
    }

    /**
     * Load GA4 script
     */
    private async loadGA4Script(): Promise<void> {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.ga4MeasurementId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
            window.dataLayer.push(args);
        }
        gtag('js', new Date());
        gtag('config', this.ga4MeasurementId as string);

        // Store gtag function
        (window as any).gtag = gtag;
    }

    /**
     * Initialize event listeners
     */
    private initializeEventListeners(): void {
        if (this.trackProductViews) {
            this.initializeProductViewTracking();
        }

        if (this.trackTryOns) {
            this.initializeTryOnTracking();
        }

        if (this.trackRecommendations) {
            this.initializeRecommendationTracking();
        }
        
        if (this.trackFaceShapeDetection) {
            this.initializeFaceShapeTracking();
        }
        
        if (this.trackStyleScoreViews) {
            this.initializeStyleScoreTracking();
        }
        
        if (this.trackProductComparisons) {
            this.initializeProductComparisonTracking();
        }
    }

    /**
     * Initialize product view tracking
     */
    private initializeProductViewTracking(): void {
        const productElement = document.querySelector('[data-product-id]');
        if (productElement) {
            const productId = parseInt(productElement.getAttribute('data-product-id') || '0', 10);
            if (productId) {
                this.trackEvent({
                    event_type: 'view_item',
                    product_id: productId
                });
            }
        }
    }

    /**
     * Initialize try-on tracking
     */
    private initializeTryOnTracking(): void {
        document.addEventListener('click', (event) => {
            const button = (event.target as Element).closest('.varai-try-on-button');
            if (button) {
                const productElement = button.closest('[data-product-id]');
                if (productElement) {
                    const productId = parseInt(productElement.getAttribute('data-product-id') || '0', 10);
                    if (productId) {
                        this.trackEvent({
                            event_type: 'try_on',
                            product_id: productId
                        });
                    }
                }
            }
        });
    }

    /**
     * Initialize recommendation tracking
     */
    private initializeRecommendationTracking(): void {
        // Track recommendation impressions
        const recommendations = document.querySelectorAll('.varai-recommendation');
        recommendations.forEach((recommendation) => {
            const productId = parseInt(recommendation.getAttribute('data-product-id') || '0', 10);
            const recommendationType = recommendation.getAttribute('data-recommendation-type');
            const recommendationScore = parseFloat(recommendation.getAttribute('data-recommendation-score') || '0');

            if (productId) {
                this.trackEvent({
                    event_type: 'view_recommendation',
                    product_id: productId,
                    recommendation_data: {
                        type: recommendationType || 'similar',
                        score: recommendationScore
                    }
                });
            }
        });

        // Track recommendation clicks
        document.addEventListener('click', (event) => {
            const recommendation = (event.target as Element).closest('.varai-recommendation');
            if (recommendation) {
                const productId = parseInt(recommendation.getAttribute('data-product-id') || '0', 10);
                const recommendationType = recommendation.getAttribute('data-recommendation-type');
                const recommendationScore = parseFloat(recommendation.getAttribute('data-recommendation-score') || '0');

                if (productId) {
                    this.trackEvent({
                        event_type: 'select_recommendation',
                        product_id: productId,
                        recommendation_data: {
                            type: recommendationType || 'similar',
                            score: recommendationScore
                        }
                    });
                }
            }
        });
    }
    
    /**
     * Initialize face shape detection tracking
     */
    private initializeFaceShapeTracking(): void {
        // Listen for custom face shape detection events
        document.addEventListener('varai-face-shape-detected', (event: any) => {
            if (event.detail && event.detail.faceShape && event.detail.productId) {
                this.trackEvent({
                    event_type: 'face_shape_detected',
                    product_id: event.detail.productId,
                    face_shape: event.detail.faceShape as FaceShape
                });
            }
        });
        
        // Track face shape detection button clicks
        document.addEventListener('click', (event) => {
            const button = (event.target as Element).closest('.varai-detect-face-shape');
            if (button) {
                const productElement = button.closest('[data-product-id]');
                if (productElement) {
                    const productId = parseInt(productElement.getAttribute('data-product-id') || '0', 10);
                    if (productId) {
                        // The actual face shape will be tracked when detected
                        // This just tracks the intent to detect
                        this.trackEvent({
                            event_type: 'face_shape_detection_started',
                            product_id: productId
                        } as AnalyticsEvent);
                    }
                }
            }
        });
    }
    
    /**
     * Initialize style score tracking
     */
    private initializeStyleScoreTracking(): void {
        // Track style score views
        const styleScores = document.querySelectorAll('.varai-style-score');
        styleScores.forEach((scoreElement) => {
            const productElement = scoreElement.closest('[data-product-id]');
            if (productElement) {
                const productId = parseInt(productElement.getAttribute('data-product-id') || '0', 10);
                const score = parseInt(scoreElement.getAttribute('data-score') || '0', 10);
                
                if (productId && score) {
                    this.trackEvent({
                        event_type: 'style_score_viewed',
                        product_id: productId,
                        style_score: score
                    });
                }
            }
        });
    }
    
    /**
     * Initialize product comparison tracking
     */
    private initializeProductComparisonTracking(): void {
        // Track product comparison views
        const comparisons = document.querySelectorAll('.varai-product-comparison');
        comparisons.forEach((comparison) => {
            const productIds: number[] = [];
            
            // Get all products in the comparison
            comparison.querySelectorAll('[data-product-id]').forEach((product) => {
                const productId = parseInt(product.getAttribute('data-product-id') || '0', 10);
                if (productId) {
                    productIds.push(productId);
                }
            });
            
            if (productIds.length >= 2) {
                this.trackEvent({
                    event_type: 'product_comparison',
                    product_id: productIds[0], // Primary product
                    comparison_data: {
                        product_ids: productIds
                    }
                });
            }
        });
    }

    /**
     * Track event
     */
    async trackEvent(event: AnalyticsEvent): Promise<void> {
        if (!this.enabled) {
            return;
        }

        // Track in GA4
        if (this.ga4MeasurementId && (window as any).gtag) {
            this.trackGA4Event(event);
        }

        // Track in VARAi
        try {
            await this.apiClient.trackEvent(event);
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }

    /**
     * Track GA4 event
     */
    private trackGA4Event(event: AnalyticsEvent): void {
        const gtag = (window as any).gtag;
        if (!gtag) {
            return;
        }

        const eventData: Record<string, any> = {
            product_id: event.product_id
        };

        if (event.recommendation_data) {
            eventData.recommendation_type = event.recommendation_data.type;
            eventData.recommendation_score = event.recommendation_data.score;
        }
        
        if (event.face_shape) {
            eventData.face_shape = event.face_shape;
        }
        
        if (event.style_score) {
            eventData.style_score = event.style_score;
        }
        
        if (event.comparison_data) {
            eventData.comparison_product_ids = event.comparison_data.product_ids.join(',');
        }

        if (event.custom_data) {
            Object.assign(eventData, event.custom_data);
        }

        gtag('event', this.getGA4EventName(event.event_type), eventData);
    }

    /**
     * Get GA4 event name
     */
    private getGA4EventName(eventType: AnalyticsEvent['event_type']): string {
        switch (eventType) {
            case 'view_item':
                return 'view_item';
            case 'try_on':
                return 'try_on_virtual';
            case 'view_recommendation':
                return 'view_recommendation';
            case 'select_recommendation':
                return 'select_recommendation';
            case 'add_to_cart':
                return 'add_to_cart';
            case 'purchase':
                return 'purchase';
            case 'face_shape_detected':
                return 'face_shape_detected';
            case 'face_shape_detection_started':
                return 'face_shape_detection_started';
            case 'style_score_viewed':
                return 'style_score_viewed';
            case 'product_comparison':
                return 'product_comparison';
            default:
                return eventType;
        }
    }
    
    /**
     * Get analytics dashboard data
     */
    async getDashboardData(): Promise<any> {
        try {
            return await this.apiClient.getAnalyticsDashboard();
        } catch (error) {
            console.error('Failed to get analytics dashboard data:', error);
            return null;
        }
    }
}
