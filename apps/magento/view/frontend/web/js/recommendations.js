define([
    'jquery',
    'uiComponent',
    'ko',
    'mage/url'
], function ($, Component, ko, urlBuilder) {
    'use strict';

    return Component.extend({
        defaults: {
            template: 'VARAi_Core/recommendations',
            productId: null,
            recommendationType: 'similar_items',
            numRecommendations: 4,
            recommendations: [],
            isLoading: false,
            useRecommendationTags: true,
            minStyleScore: 0
        },

        initialize: function () {
            this._super();
            this.initObservables();
            this.loadRecommendations();
            return this;
        },

        initObservables: function () {
            this.recommendations = ko.observableArray([]);
            this.isLoading = ko.observable(this.isLoading);
            this.hasRecommendations = ko.computed(function() {
                return this.recommendations().length > 0;
            }, this);
            return this;
        },

        loadRecommendations: function () {
            if (!this.productId) {
                return;
            }

            this.isLoading(true);
            $.ajax({
                url: urlBuilder.build('varai/recommendations/get'),
                data: {
                    product_id: this.productId,
                    type: this.recommendationType,
                    limit: this.numRecommendations,
                    use_tags: this.useRecommendationTags ? 1 : 0,
                    min_style_score: this.minStyleScore
                },
                method: 'GET',
                success: function (response) {
                    if (response.success && response.recommendations) {
                        this.recommendations(response.recommendations);
                        this.trackImpressions();
                    }
                }.bind(this),
                error: function (xhr) {
                    console.error('Failed to load recommendations:', xhr.responseText);
                },
                complete: function () {
                    this.isLoading(false);
                }.bind(this)
            });
        },

        trackImpressions: function () {
            const recommendations = this.recommendations();
            if (!recommendations.length) {
                return;
            }

            $.ajax({
                url: urlBuilder.build('varai/analytics/track'),
                data: {
                    event: 'view_recommendation',
                    product_id: this.productId,
                    recommendations: recommendations.map(function (item) {
                        return {
                            product_id: item.id,
                            type: this.recommendationType,
                            score: item.score,
                            style_score: item.style_score,
                            tags: item.recommendation_tags
                        };
                    }.bind(this))
                },
                method: 'POST'
            });
        },

        trackClick: function (product) {
            $.ajax({
                url: urlBuilder.build('varai/analytics/track'),
                data: {
                    event: 'select_recommendation',
                    product_id: this.productId,
                    recommendation: {
                        product_id: product.id,
                        type: this.recommendationType,
                        score: product.score,
                        style_score: product.style_score,
                        tags: product.recommendation_tags
                    }
                },
                method: 'POST'
            });
        },
        
        getStyleScoreClass: function(product) {
            const score = product.style_score;
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
