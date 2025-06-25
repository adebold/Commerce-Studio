define([
    'jquery'
], function ($) {
    'use strict';

    return {
        config: {},
        debugMode: false,

        /**
         * Initialize analytics
         *
         * @param {Object} config
         */
        initialize: function (config) {
            this.config = config;
            this.debugMode = config.detailed_logging || false;

            if (!this.config.enabled) {
                return;
            }

            this.initGA4();
            this.log('VARAi Analytics initialized');
        },

        /**
         * Initialize GA4
         */
        initGA4: function () {
            if (!this.config.ga4_measurement_id) {
                return;
            }

            // Load GA4
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=' + this.config.ga4_measurement_id;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            window.gtag = function () {
                window.dataLayer.push(arguments);
            };
            gtag('js', new Date());
            gtag('config', this.config.ga4_measurement_id);
            this.log('GA4 initialized with ID: ' + this.config.ga4_measurement_id);
        },

        /**
         * Log debug message
         *
         * @param {String} message
         * @param {Object} data
         */
        log: function(message, data) {
            if (!this.debugMode) {
                return;
            }
            
            if (data) {
                console.log('[VARAi Analytics]', message, data);
            } else {
                console.log('[VARAi Analytics]', message);
            }
        },

        /**
         * Track event
         *
         * @param {String} eventName
         * @param {Object} eventData
         */
        trackEvent: function (eventName, eventData) {
            if (!this.config.enabled) {
                return;
            }

            this.log('Tracking event: ' + eventName, eventData);

            // Track in GA4
            if (this.config.ga4_measurement_id && window.gtag) {
                gtag('event', eventName, eventData);
            }

            // Track in VARAi
            $.ajax({
                url: this.config.tracking_url,
                method: 'POST',
                data: {
                    event: eventName,
                    data: eventData,
                    timestamp: new Date().toISOString()
                },
                success: function(response) {
                    this.log('Event tracked successfully', response);
                }.bind(this),
                error: function(xhr, status, error) {
                    this.log('Error tracking event', {
                        event: eventName,
                        status: status,
                        error: error
                    });
                }.bind(this)
            });
        },

        /**
         * Track product view
         *
         * @param {Object} product
         */
        trackProductView: function (product) {
            if (!this.config.enabled || !this.config.track_products) {
                return;
            }

            const eventData = {
                currency: product.currency,
                value: product.price,
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    currency: product.currency,
                    price: product.price
                }]
            };
            
            // Add style score if available
            if (product.style_score !== undefined) {
                eventData.style_score = product.style_score;
                eventData.items[0].style_score = product.style_score;
            }

            this.trackEvent('view_item', eventData);
        },

        /**
         * Track virtual try-on
         *
         * @param {Object} product
         */
        trackVirtualTryOn: function (product) {
            if (!this.config.enabled || !this.config.track_try_ons) {
                return;
            }

            const eventData = {
                item_id: product.id,
                item_name: product.name
            };
            
            // Add style score if available
            if (product.style_score !== undefined) {
                eventData.style_score = product.style_score;
            }

            this.trackEvent('try_on', eventData);
        },

        /**
         * Track recommendation impression
         *
         * @param {Object} product
         * @param {Object} recommendationData
         */
        trackRecommendationImpression: function (product, recommendationData) {
            if (!this.config.enabled || !this.config.track_recommendations) {
                return;
            }

            const eventData = {
                currency: product.currency,
                value: product.price,
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    currency: product.currency,
                    price: product.price
                }],
                recommendation_type: recommendationData.type,
                recommendation_score: recommendationData.score
            };
            
            // Add style score if available
            if (recommendationData.style_score !== undefined) {
                eventData.style_score = recommendationData.style_score;
                eventData.items[0].style_score = recommendationData.style_score;
            }
            
            // Add recommendation tags if available
            if (recommendationData.tags && recommendationData.tags.length) {
                eventData.recommendation_tags = recommendationData.tags;
            }

            this.trackEvent('view_recommendation', eventData);
        },

        /**
         * Track recommendation click
         *
         * @param {Object} product
         * @param {Object} recommendationData
         */
        trackRecommendationClick: function (product, recommendationData) {
            if (!this.config.enabled || !this.config.track_recommendations) {
                return;
            }

            const eventData = {
                currency: product.currency,
                value: product.price,
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    currency: product.currency,
                    price: product.price
                }],
                recommendation_type: recommendationData.type,
                recommendation_score: recommendationData.score
            };
            
            // Add style score if available
            if (recommendationData.style_score !== undefined) {
                eventData.style_score = recommendationData.style_score;
                eventData.items[0].style_score = recommendationData.style_score;
            }
            
            // Add recommendation tags if available
            if (recommendationData.tags && recommendationData.tags.length) {
                eventData.recommendation_tags = recommendationData.tags;
            }

            this.trackEvent('select_recommendation', eventData);
        }
    };
});
