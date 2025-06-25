define([
    'jquery',
    'uiComponent',
    'ko',
    'mage/url'
], function ($, Component, ko, urlBuilder) {
    'use strict';

    return Component.extend({
        defaults: {
            template: 'VARAi_Core/virtual-try-on',
            productId: null,
            buttonText: 'Try On Virtually',
            buttonPosition: 'after_add_to_cart',
            modelUrl: null,
            isEnabled: false,
            isLoading: false,
            styleScore: null
        },

        initialize: function () {
            this._super();
            this.initObservables();
            this.loadModel();
            return this;
        },

        initObservables: function () {
            this.isEnabled = ko.observable(this.isEnabled);
            this.isLoading = ko.observable(this.isLoading);
            this.modelUrl = ko.observable(this.modelUrl);
            this.styleScore = ko.observable(this.styleScore);
            return this;
        },

        loadModel: function () {
            if (!this.productId) {
                return;
            }

            this.isLoading(true);
            $.ajax({
                url: urlBuilder.build('varai/virtual-try-on/model'),
                data: {
                    product_id: this.productId
                },
                method: 'GET',
                success: function (response) {
                    if (response.success && response.model_url) {
                        this.modelUrl(response.model_url);
                        this.isEnabled(true);
                        
                        // Set style score if available
                        if (response.style_score !== undefined) {
                            this.styleScore(response.style_score);
                        }
                    }
                }.bind(this),
                error: function (xhr) {
                    console.error('Failed to load virtual try-on model:', xhr.responseText);
                },
                complete: function () {
                    this.isLoading(false);
                }.bind(this)
            });
        },

        initTryOn: function () {
            if (!this.modelUrl()) {
                return;
            }

            // Track try-on event
            this.trackEvent();

            // Initialize virtual try-on viewer
            const container = document.getElementById('virtual-try-on-viewer');
            if (!container) {
                return;
            }

            // Load 3D viewer library
            require(['varai-viewer'], function (VaraiViewer) {
                new VaraiViewer({
                    container: container,
                    modelUrl: this.modelUrl(),
                    styleScore: this.styleScore(),
                    onReady: function () {
                        $('#virtual-try-on-modal').modal('openModal');
                    }.bind(this),
                    onError: function (error) {
                        console.error('Virtual try-on error:', error);
                    }
                });
            }.bind(this));
        },

        trackEvent: function () {
            $.ajax({
                url: urlBuilder.build('varai/analytics/track'),
                data: {
                    event: 'try_on',
                    product_id: this.productId,
                    style_score: this.styleScore()
                },
                method: 'POST'
            });
        },
        
        getStyleScoreClass: function() {
            const score = this.styleScore();
            if (score === null || score === undefined) {
                return '';
            }
            
            if (score >= 80) {
                return 'style-score-high';
            } else if (score >= 60) {
                return 'style-score-medium';
            } else {
                return 'style-score-low';
            }
        }
    });
});
