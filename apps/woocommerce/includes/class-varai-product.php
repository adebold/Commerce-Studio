<?php
/**
 * VARAi Product
 */

if (!defined('ABSPATH')) {
    exit;
}

class VARAi_Product {
    private $product;
    private $settings;

    /**
     * Constructor
     */
    public function __construct($product = null) {
        $this->settings = get_option('varai_settings', array());
        
        if (is_numeric($product)) {
            $this->product = wc_get_product($product);
        } elseif (is_a($product, 'WC_Product')) {
            $this->product = $product;
        }

        // Product hooks
        add_action('woocommerce_process_product_meta', array($this, 'save_product_meta'));
        add_action('woocommerce_product_after_variable_attributes', array($this, 'add_variation_fields'), 10, 3);
        add_action('woocommerce_save_product_variation', array($this, 'save_variation_fields'), 10, 2);
        
        // Add product category filter
        add_action('restrict_manage_posts', array($this, 'add_varai_product_filter'));
        add_filter('parse_query', array($this, 'filter_products_by_varai_category'));
    }

    /**
     * Add product meta box
     */
    public function add_product_meta_box() {
        add_meta_box(
            'varai_product_data',
            __('VARAi Settings', 'varai'),
            array($this, 'render_product_meta_box'),
            'product',
            'normal',
            'high'
        );
    }

    /**
     * Render product meta box
     */
    public function render_product_meta_box($post) {
        $product = wc_get_product($post);
        $frame_data = $this->get_frame_data($product);
        wp_nonce_field('varai_save_product_meta', 'varai_product_meta_nonce');
        ?>
        <div class="varai-product-settings">
            <h4><?php _e('Frame Details', 'varai'); ?></h4>
            <p class="form-field">
                <label for="varai_frame_width"><?php _e('Frame Width (mm)', 'varai'); ?></label>
                <input type="number" 
                       id="varai_frame_width" 
                       name="varai_frame_data[width]" 
                       value="<?php echo esc_attr($frame_data['width']); ?>" 
                       step="0.1" 
                       min="0">
            </p>
            <p class="form-field">
                <label for="varai_frame_bridge"><?php _e('Bridge Width (mm)', 'varai'); ?></label>
                <input type="number" 
                       id="varai_frame_bridge" 
                       name="varai_frame_data[bridge]" 
                       value="<?php echo esc_attr($frame_data['bridge']); ?>" 
                       step="0.1" 
                       min="0">
            </p>
            <p class="form-field">
                <label for="varai_frame_temple"><?php _e('Temple Length (mm)', 'varai'); ?></label>
                <input type="number" 
                       id="varai_frame_temple" 
                       name="varai_frame_data[temple]" 
                       value="<?php echo esc_attr($frame_data['temple']); ?>" 
                       step="0.1" 
                       min="0">
            </p>
            <p class="form-field">
                <label for="varai_frame_lens_height"><?php _e('Lens Height (mm)', 'varai'); ?></label>
                <input type="number" 
                       id="varai_frame_lens_height" 
                       name="varai_frame_data[lens_height]" 
                       value="<?php echo esc_attr($frame_data['lens_height']); ?>" 
                       step="0.1" 
                       min="0">
            </p>
            <p class="form-field">
                <label for="varai_frame_lens_width"><?php _e('Lens Width (mm)', 'varai'); ?></label>
                <input type="number" 
                       id="varai_frame_lens_width" 
                       name="varai_frame_data[lens_width]" 
                       value="<?php echo esc_attr($frame_data['lens_width']); ?>" 
                       step="0.1" 
                       min="0">
            </p>
            <p class="form-field">
                <label for="varai_frame_weight"><?php _e('Weight (g)', 'varai'); ?></label>
                <input type="number" 
                       id="varai_frame_weight" 
                       name="varai_frame_data[weight]" 
                       value="<?php echo esc_attr($frame_data['weight']); ?>" 
                       step="0.1" 
                       min="0">
            </p>
        </div>

        <div class="varai-virtual-try-on">
            <h4><?php _e('Virtual Try-On', 'varai'); ?></h4>
            <p class="form-field">
                <label for="varai_enable_try_on">
                    <input type="checkbox" 
                           id="varai_enable_try_on" 
                           name="varai_enable_try_on" 
                           value="yes" 
                           <?php checked($this->get_try_on_enabled($product), 'yes'); ?>>
                    <?php _e('Enable virtual try-on for this product', 'varai'); ?>
                </label>
            </p>
            <p class="form-field">
                <label for="varai_try_on_model"><?php _e('3D Model File', 'varai'); ?></label>
                <input type="text" 
                       id="varai_try_on_model" 
                       name="varai_try_on_model" 
                       value="<?php echo esc_attr($this->get_try_on_model($product)); ?>" 
                       class="regular-text">
                <button type="button" class="button varai-upload-model">
                    <?php _e('Upload Model', 'varai'); ?>
                </button>
            </p>
        </div>

        <div class="varai-recommendations">
            <h4><?php _e('Style & Recommendations', 'varai'); ?></h4>
            <p class="form-field">
                <label for="varai_style_score"><?php _e('Style Score (0-100)', 'varai'); ?></label>
                <input type="number" 
                       id="varai_style_score" 
                       name="varai_style_score" 
                       value="<?php echo esc_attr($this->get_style_score($product)); ?>" 
                       min="0" 
                       max="100">
                <span class="description">
                    <?php _e('Style score affects product ranking in recommendations', 'varai'); ?>
                </span>
            </p>
            <p class="form-field">
                <label for="varai_style_tags"><?php _e('Style Tags', 'varai'); ?></label>
                <input type="text" 
                       id="varai_style_tags" 
                       name="varai_style_tags" 
                       value="<?php echo esc_attr($this->get_style_tags($product)); ?>" 
                       class="regular-text">
                <span class="description">
                    <?php _e('Comma-separated tags to improve style-based recommendations', 'varai'); ?>
                </span>
            </p>
            <p class="form-field">
                <label>
                    <input type="checkbox" 
                           name="varai_add_to_category" 
                           value="yes" 
                           <?php checked($this->is_in_varai_category($product), true); ?>>
                    <?php _e('Add to VARAi Products category', 'varai'); ?>
                </label>
            </p>
        </div>
        <?php
    }

    /**
     * Save product meta
     */
    public function save_product_meta($post_id) {
        if (!isset($_POST['varai_product_meta_nonce']) || 
            !wp_verify_nonce($_POST['varai_product_meta_nonce'], 'varai_save_product_meta')) {
            return;
        }

        // Save frame data
        if (isset($_POST['varai_frame_data'])) {
            $frame_data = array_map('wc_clean', $_POST['varai_frame_data']);
            update_post_meta($post_id, '_varai_frame_data', $frame_data);
        }

        // Save virtual try-on settings
        $enable_try_on = isset($_POST['varai_enable_try_on']) ? 'yes' : 'no';
        update_post_meta($post_id, '_varai_enable_try_on', $enable_try_on);

        if (isset($_POST['varai_try_on_model'])) {
            update_post_meta($post_id, '_varai_try_on_model', wc_clean($_POST['varai_try_on_model']));
        }

        // Save style score
        if (isset($_POST['varai_style_score'])) {
            $style_score = intval($_POST['varai_style_score']);
            if ($style_score < 0) $style_score = 0;
            if ($style_score > 100) $style_score = 100;
            update_post_meta($post_id, '_varai_style_score', $style_score);
        }

        // Save style tags
        if (isset($_POST['varai_style_tags'])) {
            update_post_meta($post_id, '_varai_style_tags', wc_clean($_POST['varai_style_tags']));
        }

        // Handle VARAi category
        $product_terms = wp_get_object_terms($post_id, 'varai_product_cat');
        $has_varai_term = !empty($product_terms);

        if (isset($_POST['varai_add_to_category']) && $_POST['varai_add_to_category'] === 'yes') {
            if (!$has_varai_term) {
                wp_set_object_terms($post_id, 'varai-products', 'varai_product_cat', true);
            }
        } else {
            if ($has_varai_term) {
                wp_remove_object_terms($post_id, 'varai-products', 'varai_product_cat');
            }
        }

        // Update product embeddings
        $api = new VARAi_API();
        $api->update_product_embeddings($post_id);
    }

    /**
     * Add variation fields
     */
    public function add_variation_fields($loop, $variation_data, $variation) {
        $frame_data = $this->get_frame_data($variation);
        ?>
        <div class="varai-variation-settings">
            <p class="form-row form-row-first">
                <label><?php _e('Frame Color Code', 'varai'); ?></label>
                <input type="text" 
                       name="varai_frame_color[<?php echo $loop; ?>]" 
                       value="<?php echo esc_attr($frame_data['color_code'] ?? ''); ?>" 
                       class="short">
            </p>
            <p class="form-row form-row-last">
                <label><?php _e('Frame Finish', 'varai'); ?></label>
                <input type="text" 
                       name="varai_frame_finish[<?php echo $loop; ?>]" 
                       value="<?php echo esc_attr($frame_data['finish'] ?? ''); ?>" 
                       class="short">
            </p>
        </div>
        <?php
    }

    /**
     * Save variation fields
     */
    public function save_variation_fields($variation_id, $loop) {
        $frame_data = $this->get_frame_data(wc_get_product($variation_id));

        if (isset($_POST['varai_frame_color'][$loop])) {
            $frame_data['color_code'] = wc_clean($_POST['varai_frame_color'][$loop]);
        }

        if (isset($_POST['varai_frame_finish'][$loop])) {
            $frame_data['finish'] = wc_clean($_POST['varai_frame_finish'][$loop]);
        }

        update_post_meta($variation_id, '_varai_frame_data', $frame_data);
    }

    /**
     * Add VARAi product filter to admin
     */
    public function add_varai_product_filter() {
        global $typenow;
        
        if ($typenow !== 'product') {
            return;
        }
        
        $current = isset($_GET['varai_filter']) ? $_GET['varai_filter'] : '';
        ?>
        <select name="varai_filter" id="varai_filter">
            <option value=""><?php _e('All Products', 'varai'); ?></option>
            <option value="varai" <?php selected($current, 'varai'); ?>><?php _e('VARAi Products', 'varai'); ?></option>
            <option value="try_on" <?php selected($current, 'try_on'); ?>><?php _e('Virtual Try-On Enabled', 'varai'); ?></option>
            <option value="high_score" <?php selected($current, 'high_score'); ?>><?php _e('High Style Score (70+)', 'varai'); ?></option>
        </select>
        <?php
    }

    /**
     * Filter products by VARAi category
     */
    public function filter_products_by_varai_category($query) {
        global $pagenow, $typenow;
        
        if ($pagenow !== 'edit.php' || $typenow !== 'product' || !isset($_GET['varai_filter']) || empty($_GET['varai_filter'])) {
            return $query;
        }
        
        $filter_value = $_GET['varai_filter'];
        
        if ($filter_value === 'varai') {
            // Filter by VARAi category
            $query->query_vars['tax_query'][] = array(
                'taxonomy' => 'varai_product_cat',
                'field' => 'slug',
                'terms' => 'varai-products',
            );
        } elseif ($filter_value === 'try_on') {
            // Filter by virtual try-on enabled
            $query->query_vars['meta_query'][] = array(
                'key' => '_varai_enable_try_on',
                'value' => 'yes',
                'compare' => '=',
            );
        } elseif ($filter_value === 'high_score') {
            // Filter by high style score
            $query->query_vars['meta_query'][] = array(
                'key' => '_varai_style_score',
                'value' => 70,
                'compare' => '>=',
                'type' => 'NUMERIC',
            );
        }
        
        return $query;
    }

    /**
     * Get frame data
     */
    public function get_frame_data($product = null) {
        $product = $product ?: $this->product;
        if (!$product) {
            return array();
        }

        $defaults = array(
            'width' => '',
            'bridge' => '',
            'temple' => '',
            'lens_height' => '',
            'lens_width' => '',
            'weight' => '',
            'color_code' => '',
            'finish' => '',
        );

        $frame_data = get_post_meta($product->get_id(), '_varai_frame_data', true);
        return wp_parse_args($frame_data, $defaults);
    }

    /**
     * Get virtual try-on status
     */
    public function get_try_on_enabled($product = null) {
        $product = $product ?: $this->product;
        if (!$product) {
            return 'no';
        }

        return get_post_meta($product->get_id(), '_varai_enable_try_on', true) ?: 'no';
    }

    /**
     * Get 3D model URL
     */
    public function get_try_on_model($product = null) {
        $product = $product ?: $this->product;
        if (!$product) {
            return '';
        }

        return get_post_meta($product->get_id(), '_varai_try_on_model', true) ?: '';
    }

    /**
     * Get style score
     */
    public function get_style_score($product = null) {
        $product = $product ?: $this->product;
        if (!$product) {
            return 0;
        }

        return intval(get_post_meta($product->get_id(), '_varai_style_score', true)) ?: 0;
    }

    /**
     * Get style tags
     */
    public function get_style_tags($product = null) {
        $product = $product ?: $this->product;
        if (!$product) {
            return '';
        }

        return get_post_meta($product->get_id(), '_varai_style_tags', true) ?: '';
    }

    /**
     * Check if product is in VARAi category
     */
    public function is_in_varai_category($product = null) {
        $product = $product ?: $this->product;
        if (!$product) {
            return false;
        }

        $terms = wp_get_object_terms($product->get_id(), 'varai_product_cat', array('fields' => 'slugs'));
        return in_array('varai-products', $terms);
    }
}