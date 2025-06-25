<?php
/**
 * VARAi Recommendations Shortcode Template
 *
 * @package VARAi
 */

if (!defined('ABSPATH')) {
    exit;
}

// Get parameters
$limit = isset($atts['limit']) ? intval($atts['limit']) : 4;
$columns = isset($atts['columns']) ? intval($atts['columns']) : 2;
$title = isset($atts['title']) ? $atts['title'] : __('Recommended Products', 'varai');

// Calculate column width
$column_width = 12 / $columns;
?>

<div class="varai-recommendations-container">
    <h3 class="varai-recommendations-title"><?php echo esc_html($title); ?></h3>
    
    <?php if (empty($recommendations)) : ?>
        <p class="varai-no-recommendations"><?php _e('No recommendations found.', 'varai'); ?></p>
    <?php else : ?>
        <div class="varai-recommendations-grid columns-<?php echo esc_attr($columns); ?>">
            <?php foreach ($recommendations as $recommendation) : ?>
                <div class="varai-recommendation" 
                     data-product-id="<?php echo esc_attr($recommendation['id']); ?>"
                     data-recommendation-type="similar"
                     data-recommendation-score="<?php echo esc_attr($recommendation['score']); ?>"
                     data-style-score="<?php echo esc_attr($recommendation['style_score']); ?>">
                    
                    <div class="varai-recommendation-inner">
                        <a href="<?php echo esc_url($recommendation['url']); ?>" class="varai-recommendation-image">
                            <img src="<?php echo esc_url($recommendation['image']); ?>" alt="<?php echo esc_attr($recommendation['name']); ?>">
                            
                            <?php if (isset($recommendation['style_score']) && $recommendation['style_score'] > 0) : ?>
                                <div class="varai-style-score" data-product-id="<?php echo esc_attr($recommendation['id']); ?>" data-score-value="<?php echo esc_attr($recommendation['style_score']); ?>">
                                    <span class="varai-style-score-value"><?php echo esc_html($recommendation['style_score']); ?></span>
                                    <span class="varai-style-score-label"><?php _e('Style', 'varai'); ?></span>
                                </div>
                            <?php endif; ?>
                            
                            <?php if (isset($recommendation['virtual_try_on']) && $recommendation['virtual_try_on']) : ?>
                                <div class="varai-try-on-badge">
                                    <span><?php _e('Try-On', 'varai'); ?></span>
                                </div>
                            <?php endif; ?>
                        </a>
                        
                        <div class="varai-recommendation-details">
                            <h4 class="varai-recommendation-title">
                                <a href="<?php echo esc_url($recommendation['url']); ?>">
                                    <?php echo esc_html($recommendation['name']); ?>
                                </a>
                            </h4>
                            
                            <div class="varai-recommendation-price">
                                <?php echo $recommendation['price']; ?>
                            </div>
                            
                            <?php if (!empty($recommendation['reasoning'])) : ?>
                                <div class="varai-recommendation-reasoning">
                                    <?php echo esc_html($recommendation['reasoning']); ?>
                                </div>
                            <?php endif; ?>
                            
                            <div class="varai-recommendation-actions">
                                <a href="<?php echo esc_url($recommendation['url']); ?>" class="button varai-view-product">
                                    <?php _e('View Product', 'varai'); ?>
                                </a>
                                
                                <a href="<?php echo esc_url(add_query_arg('add-to-cart', $recommendation['id'], wc_get_page_permalink('cart'))); ?>" 
                                   class="button add_to_cart_button ajax_add_to_cart"
                                   data-product_id="<?php echo esc_attr($recommendation['id']); ?>">
                                    <?php _e('Add to Cart', 'varai'); ?>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<style>
.varai-recommendations-container {
    margin: 30px 0;
}

.varai-recommendations-title {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: 600;
}

.varai-recommendations-grid {
    display: grid;
    grid-template-columns: repeat(<?php echo esc_html($columns); ?>, 1fr);
    gap: 20px;
}

.varai-recommendation {
    position: relative;
    border: 1px solid #e5e5e5;
    border-radius: 5px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.varai-recommendation:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.varai-recommendation-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.varai-recommendation-image {
    position: relative;
    display: block;
    overflow: hidden;
}

.varai-recommendation-image img {
    width: 100%;
    height: auto;
    transition: transform 0.3s ease;
}

.varai-recommendation:hover .varai-recommendation-image img {
    transform: scale(1.05);
}

.varai-style-score {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    line-height: 1.2;
}

.varai-style-score-value {
    font-size: 16px;
    font-weight: bold;
}

.varai-try-on-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: #2271b1;
    color: #fff;
    padding: 5px 10px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: bold;
}

.varai-recommendation-details {
    padding: 15px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.varai-recommendation-title {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 16px;
    line-height: 1.4;
}

.varai-recommendation-title a {
    color: #333;
    text-decoration: none;
}

.varai-recommendation-price {
    margin-bottom: 10px;
    font-weight: bold;
}

.varai-recommendation-reasoning {
    margin-bottom: 15px;
    font-size: 14px;
    color: #666;
    font-style: italic;
}

.varai-recommendation-actions {
    margin-top: auto;
    display: flex;
    gap: 10px;
}

.varai-recommendation-actions .button {
    flex: 1;
    text-align: center;
    padding: 8px 12px;
    font-size: 14px;
}

@media (max-width: 768px) {
    .varai-recommendations-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .varai-recommendations-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<script>
jQuery(document).ready(function($) {
    // Track recommendation impressions
    $('.varai-recommendation').each(function() {
        const $recommendation = $(this);
        const productId = $recommendation.data('product-id');
        const recommendationType = $recommendation.data('recommendation-type');
        const recommendationScore = $recommendation.data('recommendation-score');
        const styleScore = $recommendation.data('style-score');
        
        if (typeof VARAnalytics !== 'undefined') {
            VARAnalytics.trackRecommendationImpression(productId, {
                type: recommendationType,
                score: recommendationScore,
                style_score: styleScore
            });
        }
    });
    
    // Track recommendation clicks
    $('.varai-recommendation a').on('click', function() {
        const $recommendation = $(this).closest('.varai-recommendation');
        const productId = $recommendation.data('product-id');
        const recommendationType = $recommendation.data('recommendation-type');
        const recommendationScore = $recommendation.data('recommendation-score');
        const styleScore = $recommendation.data('style-score');
        
        if (typeof VARAnalytics !== 'undefined') {
            VARAnalytics.trackRecommendationClick(productId, {
                type: recommendationType,
                score: recommendationScore,
                style_score: styleScore
            });
        }
    });
});
</script>