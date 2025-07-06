export interface BigCommerceConfig {
    clientId: string;
    accessToken: string;
    storeHash: string;
    varaiApiKey: string;
    varaiApiUrl?: string;
}

export interface ProductData {
    id: number;
    name: string;
    sku: string;
    price: number;
    brand: string;
    images: ProductImage[];
    customFields: Record<string, string>;
}

export interface ProductImage {
    id: number;
    url_standard: string;
    url_thumbnail: string;
    url_zoom: string;
    is_thumbnail: boolean;
    sort_order: number;
    description: string;
}

export type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond';

export interface StyleScore {
    score: number;
    breakdown: {
        design: number;
        trend: number;
        versatility: number;
        uniqueness: number;
        craftsmanship: number;
    };
    recommendations: string[];
}

export interface CustomerMeasurement {
    face_width: number;
    face_height: number;
    temple_to_temple: number;
    pupillary_distance: number;
    bridge_width: number;
    face_shape?: FaceShape;
    custom_measurements?: Record<string, number>;
}

export interface RecommendationOptions {
    limit?: number;
    type?: 'similar' | 'complementary' | 'style_based' | 'face_shape';
    filters?: {
        price_range?: {
            min?: number;
            max?: number;
        };
        brands?: string[];
        styles?: string[];
        face_shapes?: FaceShape[];
        style_score?: {
            min?: number;
        };
    };
    customer_id?: number;
    face_shape?: FaceShape;
    style_preference?: string[];
}

export interface ProductComparisonOptions {
    include_measurements?: boolean;
    include_style_score?: boolean;
    include_face_shape_compatibility?: boolean;
    include_price_comparison?: boolean;
    include_brand_comparison?: boolean;
    include_recommendations?: boolean;
}

export interface AnalyticsEvent {
    event_type: 'view_item' | 'try_on' | 'view_recommendation' | 'select_recommendation' | 'add_to_cart' | 'purchase' | 'face_shape_detected' | 'face_shape_detection_started' | 'product_comparison' | 'style_score_viewed';
    product_id: number;
    user_id?: string;
    session_id?: string;
    recommendation_data?: {
        type: string;
        score: number;
    };
    face_shape?: FaceShape;
    style_score?: number;
    comparison_data?: {
        product_ids: number[];
    };
    custom_data?: Record<string, any>;
}

export interface ScriptTag {
    id: number;
    name: string;
    description?: string;
    src: string;
    location: 'head' | 'footer';
    visibility: 'storefront' | 'all' | 'checkout';
    kind: 'src' | 'script';
    consent_category: 'essential' | 'functional' | 'analytics' | 'targeting';
    auto_uninstall: boolean;
    load_method: 'default' | 'async' | 'defer';
    created_at: string;
    updated_at: string;
}

export interface StoreSettings {
    api_key?: string;
    api_url?: string;
    enable_virtual_try_on?: boolean;
    enable_recommendations?: boolean;
    enable_face_shape_detection?: boolean;
    enable_style_scoring?: boolean;
    enable_product_comparison?: boolean;
    enable_customer_measurements?: boolean;
    recommendations_limit?: number;
    recommendation_type?: 'similar' | 'complementary' | 'style_based' | 'face_shape';
    enable_analytics?: boolean;
    ga4_measurement_id?: string;
    track_product_views?: boolean;
    track_try_ons?: boolean;
    track_recommendations?: boolean;
    track_face_shape_detection?: boolean;
    track_style_score_views?: boolean;
    track_product_comparisons?: boolean;
    dashboard_metrics?: string[];
}
