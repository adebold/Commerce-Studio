/**
 * VARAi Analytics Tests
 */

// Mock jQuery
global.jQuery = require('jquery');
const $ = global.jQuery;

// Mock document
document.body.innerHTML = `
<div class="product" data-product-id="123">
    <div class="varai-recommendation" data-product-id="456" data-recommendation-type="similar" data-recommendation-score="0.95" data-style-score="85">
        <a href="#" class="varai-recommendation-link">Product 1</a>
    </div>
    <div class="varai-recommendation" data-product-id="789" data-recommendation-type="similar" data-recommendation-score="0.85" data-style-score="75">
        <a href="#" class="varai-recommendation-link">Product 2</a>
    </div>
    <div class="varai-try-on-button">Try On</div>
    <div class="varai-style-score" data-product-id="123" data-score-value="90">90</div>
    <div class="varai-product-comparison" data-product-ids="123,456,789"></div>
</div>
`;

// Mock gtag
global.gtag = jest.fn();

// Mock AJAX
$.ajax = jest.fn().mockImplementation((options) => {
    if (options.success) {
        options.success({ success: true });
    }
    return { 
        error: function(callback) { 
            return this; 
        } 
    };
});

// Mock analytics settings
global.varai_analytics = {
    ga4_enabled: true,
    measurement_id: 'G-12345',
    ajax_url: '/ajax',
    nonce: 'test_nonce',
    debug_mode: true
};

// Mock wc_add_to_cart_params
global.wc_add_to_cart_params = {
    ajax_url: '/ajax'
};

// Import analytics.js
require('../../assets/js/analytics');

// Define VARAnalytics for testing
const VARAnalytics = global.VARAnalytics;

describe('VARAi Analytics', () => {
    beforeEach(() => {
        // Clear mocks
        jest.clearAllMocks();
    });

    test('should initialize correctly', () => {
        // Verify initialization
        expect(VARAnalytics).toBeDefined();
        expect(typeof VARAnalytics.init).toBe('function');
        expect(typeof VARAnalytics.trackEvent).toBe('function');
        expect(typeof VARAnalytics.trackRecommendationImpression).toBe('function');
        expect(typeof VARAnalytics.trackRecommendationClick).toBe('function');
    });

    test('should track page view', () => {
        // Call trackPageView
        VARAnalytics.trackPageView();

        // Verify gtag was called
        expect(gtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({
            page_title: expect.any(String),
            page_location: expect.any(String),
            page_path: expect.any(String)
        }));
    });

    test('should track events', () => {
        // Call trackEvent
        VARAnalytics.trackEvent('view_item');

        // Verify AJAX was called
        expect($.ajax).toHaveBeenCalledWith(expect.objectContaining({
            url: '/ajax',
            type: 'POST',
            data: expect.objectContaining({
                action: 'varai_track_event',
                nonce: 'test_nonce',
                event_type: 'view_item',
                product_id: '123'
            })
        }));
    });

    test('should track recommendation impressions', () => {
        // Call trackRecommendationImpression
        VARAnalytics.trackRecommendationImpression('456', {
            type: 'similar',
            score: 0.95,
            style_score: 85
        });

        // Verify AJAX was called
        expect($.ajax).toHaveBeenCalledWith(expect.objectContaining({
            url: '/ajax',
            type: 'POST',
            data: expect.objectContaining({
                action: 'varai_track_recommendation_impression',
                nonce: 'test_nonce',
                product_id: '456',
                recommendation_data: expect.objectContaining({
                    type: 'similar',
                    score: 0.95,
                    style_score: 85
                })
            })
        }));
    });

    test('should track recommendation clicks', () => {
        // Call trackRecommendationClick
        VARAnalytics.trackRecommendationClick('456', {
            type: 'similar',
            score: 0.95,
            style_score: 85
        });

        // Verify AJAX was called
        expect($.ajax).toHaveBeenCalledWith(expect.objectContaining({
            url: '/ajax',
            type: 'POST',
            data: expect.objectContaining({
                action: 'varai_track_recommendation_click',
                nonce: 'test_nonce',
                product_id: '456',
                recommendation_data: expect.objectContaining({
                    type: 'similar',
                    score: 0.95,
                    style_score: 85
                })
            })
        }));
    });

    test('should track add to cart events', () => {
        // Trigger added_to_cart event
        $(document).trigger('added_to_cart', [null, null, $('.varai-recommendation').first()]);

        // Verify AJAX was called
        expect($.ajax).toHaveBeenCalledWith(expect.objectContaining({
            url: '/ajax',
            type: 'POST',
            data: expect.objectContaining({
                action: 'varai_track_event',
                nonce: 'test_nonce',
                event_type: 'add_to_cart',
                product_id: '123',
                recommendation_type: 'similar',
                recommendation_score: 0.95,
                style_score: 85
            })
        }));
    });

    test('should track virtual try-on events', () => {
        // Trigger click on try-on button
        $('.varai-try-on-button').trigger('click');

        // Verify AJAX was called
        expect($.ajax).toHaveBeenCalledWith(expect.objectContaining({
            url: '/ajax',
            type: 'POST',
            data: expect.objectContaining({
                action: 'varai_track_event',
                nonce: 'test_nonce',
                event_type: 'try_on',
                product_id: '123'
            })
        }));
    });

    test('should track product comparison views', () => {
        // Call init to trigger event binding
        VARAnalytics.init();

        // Verify AJAX was called for product comparison
        expect($.ajax).toHaveBeenCalledWith(expect.objectContaining({
            url: '/ajax',
            type: 'POST',
            data: expect.objectContaining({
                action: 'varai_track_event',
                nonce: 'test_nonce',
                event_type: 'view_product_comparison',
                product_id: '123',
                products: '123,456,789'
            })
        }));
    });

    test('should log debug messages when debug mode is enabled', () => {
        // Mock console.log
        const originalConsoleLog = console.log;
        console.log = jest.fn();

        // Call debug
        VARAnalytics.debug('Test message', { test: true });

        // Verify console.log was called
        expect(console.log).toHaveBeenCalledWith('[VARAi Analytics] Test message', { test: true });

        // Restore console.log
        console.log = originalConsoleLog;
    });
});