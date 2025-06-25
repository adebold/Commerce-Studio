/* global varai_analytics, jQuery */
(function($) {
    'use strict';

    // Initialize analytics tracking
    const VARAnalytics = {
        init: function() {
            if (!varai_analytics.ga4_enabled) {
                return;
            }

            this.bindEvents();
            this.trackPageView();
        },

        bindEvents: function() {
            // Track product view
            if ($('body').hasClass('single-product')) {
                this.trackEvent('view_item');
            }

            // Track virtual try-on
            $(document).on('click', '.varai-try-on-button', function() {
                VARAnalytics.trackEvent('try_on');
            });

            // Track recommendation impressions
            $('.varai-recommendation').each(function() {
                const $recommendation = $(this);
                const productId = $recommendation.data('product-id');
                const recommendationType = $recommendation.data('recommendation-type');
                const recommendationScore = $recommendation.data('recommendation-score');
                const styleScore = $recommendation.data('style-score');

                VARAnalytics.trackRecommendationImpression(productId, {
                    type: recommendationType,
                    score: recommendationScore,
                    style_score: styleScore
                });
            });

            // Track recommendation clicks
            $(document).on('click', '.varai-recommendation', function() {
                const $recommendation = $(this);
                const productId = $recommendation.data('product-id');
                const recommendationType = $recommendation.data('recommendation-type');
                const recommendationScore = $recommendation.data('recommendation-score');
                const styleScore = $recommendation.data('style-score');

                VARAnalytics.trackRecommendationClick(productId, {
                    type: recommendationType,
                    score: recommendationScore,
                    style_score: styleScore
                });
            });

            // Track add to cart
            $(document).on('added_to_cart', function(e, fragments, cart_hash, $button) {
                if ($button && $button.closest('.varai-recommendation').length) {
                    const $recommendation = $button.closest('.varai-recommendation');
                    const productId = $recommendation.data('product-id');
                    const recommendationType = $recommendation.data('recommendation-type');
                    const recommendationScore = $recommendation.data('recommendation-score');
                    const styleScore = $recommendation.data('style-score');

                    VARAnalytics.trackEvent('add_to_cart', {
                        recommendation_type: recommendationType,
                        recommendation_score: recommendationScore,
                        style_score: styleScore
                    });
                } else {
                    VARAnalytics.trackEvent('add_to_cart');
                }
            });

            // Track checkout steps
            if ($('body').hasClass('woocommerce-checkout')) {
                this.trackEvent('begin_checkout');
            }

            // Track purchases
            if ($('body').hasClass('woocommerce-order-received')) {
                this.trackEvent('purchase');
            }
            
            // Track product comparison views
            if ($('.varai-product-comparison').length) {
                this.trackEvent('view_product_comparison', {
                    products: $('.varai-product-comparison').data('product-ids')
                });
            }
            
            // Track style score views
            if ($('.varai-style-score').length) {
                $('.varai-style-score').each(function() {
                    const $score = $(this);
                    const productId = $score.data('product-id');
                    const scoreValue = $score.data('score-value');
                    
                    VARAnalytics.trackEvent('view_style_score', {
                        product_id: productId,
                        score: scoreValue
                    });
                });
            }
        },

        trackPageView: function() {
            const pageData = {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            };

            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_view', pageData);
            }
        },

        trackEvent: function(eventType, additionalData = {}) {
            const productId = $('body').find('.product').data('product-id');
            if (!productId) {
                return;
            }

            $.ajax({
                url: varai_analytics.ajax_url,
                type: 'POST',
                data: {
                    action: 'varai_track_event',
                    nonce: varai_analytics.nonce,
                    event_type: eventType,
                    product_id: productId,
                    ...additionalData
                },
                success: function(response) {
                    if (!response.success) {
                        console.error('Failed to track event:', response);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error tracking event:', error);
                }
            });
        },

        trackRecommendationImpression: function(productId, recommendationData) {
            $.ajax({
                url: varai_analytics.ajax_url,
                type: 'POST',
                data: {
                    action: 'varai_track_recommendation_impression',
                    nonce: varai_analytics.nonce,
                    product_id: productId,
                    recommendation_data: recommendationData
                },
                error: function(xhr, status, error) {
                    console.error('Error tracking recommendation impression:', error);
                }
            });
        },

        trackRecommendationClick: function(productId, recommendationData) {
            $.ajax({
                url: varai_analytics.ajax_url,
                type: 'POST',
                data: {
                    action: 'varai_track_recommendation_click',
                    nonce: varai_analytics.nonce,
                    product_id: productId,
                    recommendation_data: recommendationData
                },
                error: function(xhr, status, error) {
                    console.error('Error tracking recommendation click:', error);
                }
            });
        },
        
        // Enhanced debugging
        debug: function(message, data = {}) {
            if (varai_analytics.debug_mode) {
                console.log(`[VARAi Analytics] ${message}`, data);
            }
        }
    };

    // Initialize on document ready
    $(document).ready(function() {
        VARAnalytics.init();
    });

})(jQuery);
