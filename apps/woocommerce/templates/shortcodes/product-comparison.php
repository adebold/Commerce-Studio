<?php
/**
 * VARAi Product Comparison Shortcode Template
 *
 * @package VARAi
 */

if (!defined('ABSPATH')) {
    exit;
}

// Get parameters
$columns = isset($atts['columns']) ? intval($atts['columns']) : 3;
$title = isset($atts['title']) ? $atts['title'] : __('Product Comparison', 'varai');

// Get product IDs for data-attribute
$product_ids = implode(',', array_map(function($product) {
    return $product->get_id();
}, $products));

// Get frame attributes to compare
$frame_attributes = array(
    'width' => __('Frame Width', 'varai'),
    'bridge' => __('Bridge Width', 'varai'),
    'temple' => __('Temple Length', 'varai'),
    'lens_height' => __('Lens Height', 'varai'),
    'lens_width' => __('Lens Width', 'varai'),
    'weight' => __('Weight', 'varai'),
);

// Get product helper
$product_helper = new VARAi_Product();
?>

<div class="varai-product-comparison" data-product-ids="<?php echo esc_attr($product_ids); ?>">
    <h3 class="varai-comparison-title"><?php echo esc_html($title); ?></h3>
    
    <div class="varai-comparison-table-container">
        <table class="varai-comparison-table">
            <thead>
                <tr>
                    <th class="varai-comparison-feature"><?php _e('Feature', 'varai'); ?></th>
                    <?php foreach ($products as $product) : ?>
                        <th class="varai-comparison-product">
                            <div class="varai-comparison-product-image">
                                <?php echo $product->get_image('thumbnail'); ?>
                            </div>
                            <h4 class="varai-comparison-product-title">
                                <a href="<?php echo esc_url($product->get_permalink()); ?>">
                                    <?php echo esc_html($product->get_name()); ?>
                                </a>
                            </h4>
                            <div class="varai-comparison-product-price">
                                <?php echo $product->get_price_html(); ?>
                            </div>
                        </th>
                    <?php endforeach; ?>
                </tr>
            </thead>
            <tbody>
                <!-- Style Score -->
                <tr>
                    <td class="varai-comparison-feature"><?php _e('Style Score', 'varai'); ?></td>
                    <?php foreach ($products as $product) : 
                        $style_score = get_post_meta($product->get_id(), '_varai_style_score', true);
                        $style_score = !empty($style_score) ? intval($style_score) : 0;
                        $score_class = '';
                        
                        if ($style_score >= 80) {
                            $score_class = 'high';
                        } elseif ($style_score >= 50) {
                            $score_class = 'medium';
                        } else {
                            $score_class = 'low';
                        }
                    ?>
                        <td class="varai-comparison-value">
                            <div class="varai-comparison-style-score <?php echo esc_attr($score_class); ?>">
                                <?php echo esc_html($style_score); ?>
                            </div>
                        </td>
                    <?php endforeach; ?>
                </tr>
                
                <!-- Virtual Try-On -->
                <tr>
                    <td class="varai-comparison-feature"><?php _e('Virtual Try-On', 'varai'); ?></td>
                    <?php foreach ($products as $product) : 
                        $try_on_enabled = get_post_meta($product->get_id(), '_varai_enable_try_on', true) === 'yes';
                    ?>
                        <td class="varai-comparison-value">
                            <?php if ($try_on_enabled) : ?>
                                <span class="varai-comparison-yes"><?php _e('Yes', 'varai'); ?></span>
                                <a href="<?php echo esc_url($product->get_permalink()); ?>" class="button varai-try-on-button-small">
                                    <?php _e('Try On', 'varai'); ?>
                                </a>
                            <?php else : ?>
                                <span class="varai-comparison-no"><?php _e('No', 'varai'); ?></span>
                            <?php endif; ?>
                        </td>
                    <?php endforeach; ?>
                </tr>
                
                <!-- Frame Details -->
                <?php foreach ($frame_attributes as $attr_key => $attr_label) : ?>
                    <tr>
                        <td class="varai-comparison-feature"><?php echo esc_html($attr_label); ?></td>
                        <?php foreach ($products as $product) : 
                            $frame_data = $product_helper->get_frame_data($product);
                            $attr_value = !empty($frame_data[$attr_key]) ? $frame_data[$attr_key] : '-';
                            
                            // Add units
                            if (!empty($attr_value) && $attr_value !== '-') {
                                if ($attr_key === 'weight') {
                                    $attr_value .= ' g';
                                } else {
                                    $attr_value .= ' mm';
                                }
                            }
                        ?>
                            <td class="varai-comparison-value">
                                <?php echo esc_html($attr_value); ?>
                            </td>
                        <?php endforeach; ?>
                    </tr>
                <?php endforeach; ?>
                
                <!-- Material -->
                <tr>
                    <td class="varai-comparison-feature"><?php _e('Material', 'varai'); ?></td>
                    <?php foreach ($products as $product) : 
                        $material = $product->get_attribute('pa_material');
                        $material = !empty($material) ? $material : '-';
                    ?>
                        <td class="varai-comparison-value">
                            <?php echo esc_html($material); ?>
                        </td>
                    <?php endforeach; ?>
                </tr>
                
                <!-- Color -->
                <tr>
                    <td class="varai-comparison-feature"><?php _e('Color', 'varai'); ?></td>
                    <?php foreach ($products as $product) : 
                        $color = $product->get_attribute('pa_color');
                        $color = !empty($color) ? $color : '-';
                    ?>
                        <td class="varai-comparison-value">
                            <?php echo esc_html($color); ?>
                        </td>
                    <?php endforeach; ?>
                </tr>
                
                <!-- Style Tags -->
                <tr>
                    <td class="varai-comparison-feature"><?php _e('Style Tags', 'varai'); ?></td>
                    <?php foreach ($products as $product) : 
                        $style_tags = get_post_meta($product->get_id(), '_varai_style_tags', true);
                        $style_tags = !empty($style_tags) ? explode(',', $style_tags) : array();
                    ?>
                        <td class="varai-comparison-value">
                            <?php if (!empty($style_tags)) : ?>
                                <div class="varai-comparison-tags">
                                    <?php foreach ($style_tags as $tag) : ?>
                                        <span class="varai-comparison-tag"><?php echo esc_html(trim($tag)); ?></span>
                                    <?php endforeach; ?>
                                </div>
                            <?php else : ?>
                                -
                            <?php endif; ?>
                        </td>
                    <?php endforeach; ?>
                </tr>
                
                <!-- Add to Cart -->
                <tr class="varai-comparison-actions-row">
                    <td class="varai-comparison-feature"></td>
                    <?php foreach ($products as $product) : ?>
                        <td class="varai-comparison-value">
                            <a href="<?php echo esc_url($product->get_permalink()); ?>" class="button varai-view-product">
                                <?php _e('View Product', 'varai'); ?>
                            </a>
                            <a href="<?php echo esc_url(add_query_arg('add-to-cart', $product->get_id(), wc_get_page_permalink('cart'))); ?>" 
                               class="button add_to_cart_button ajax_add_to_cart"
                               data-product_id="<?php echo esc_attr($product->get_id()); ?>">
                                <?php _e('Add to Cart', 'varai'); ?>
                            </a>
                        </td>
                    <?php endforeach; ?>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<style>
.varai-product-comparison {
    margin: 30px 0;
}

.varai-comparison-title {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: 600;
}

.varai-comparison-table-container {
    overflow-x: auto;
}

.varai-comparison-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #e5e5e5;
}

.varai-comparison-table th,
.varai-comparison-table td {
    padding: 15px;
    border: 1px solid #e5e5e5;
    text-align: center;
}

.varai-comparison-feature {
    background-color: #f9f9f9;
    font-weight: bold;
    text-align: left;
}

.varai-comparison-product {
    min-width: 200px;
}

.varai-comparison-product-image {
    margin-bottom: 10px;
}

.varai-comparison-product-image img {
    max-width: 100px;
    height: auto;
}

.varai-comparison-product-title {
    margin: 0 0 5px;
    font-size: 16px;
}

.varai-comparison-product-title a {
    color: #333;
    text-decoration: none;
}

.varai-comparison-product-price {
    font-weight: bold;
    margin-bottom: 10px;
}

.varai-comparison-style-score {
    display: inline-block;
    width: 40px;
    height: 40px;
    line-height: 40px;
    border-radius: 50%;
    color: #fff;
    font-weight: bold;
}

.varai-comparison-style-score.high {
    background-color: #4CAF50;
}

.varai-comparison-style-score.medium {
    background-color: #FFC107;
}

.varai-comparison-style-score.low {
    background-color: #F44336;
}

.varai-comparison-yes {
    color: #4CAF50;
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
}

.varai-comparison-no {
    color: #F44336;
    font-weight: bold;
}

.varai-try-on-button-small {
    font-size: 12px;
    padding: 5px 10px;
}

.varai-comparison-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
}

.varai-comparison-tag {
    background-color: #f0f0f0;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 12px;
}

.varai-comparison-actions-row td {
    padding-top: 20px;
}

.varai-comparison-value .button {
    display: block;
    width: 100%;
    margin-bottom: 5px;
    text-align: center;
}

@media (max-width: 768px) {
    .varai-comparison-table th,
    .varai-comparison-table td {
        padding: 10px;
    }
    
    .varai-comparison-product {
        min-width: 150px;
    }
}
</style>

<script>
jQuery(document).ready(function($) {
    // Track product comparison view
    if (typeof VARAnalytics !== 'undefined') {
        VARAnalytics.trackEvent('view_product_comparison', {
            products: $('.varai-product-comparison').data('product-ids')
        });
    }
    
    // Track product clicks
    $('.varai-comparison-product-title a, .varai-view-product').on('click', function() {
        const productId = $(this).closest('th, td').index();
        const productElement = $('.varai-comparison-table th').eq(productId);
        const productName = productElement.find('.varai-comparison-product-title').text().trim();
        
        if (typeof VARAnalytics !== 'undefined') {
            VARAnalytics.trackEvent('select_comparison_product', {
                product_id: productId,
                product_name: productName
            });
        }
    });
});
</script>