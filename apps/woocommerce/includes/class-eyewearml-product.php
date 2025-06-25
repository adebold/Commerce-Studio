<?php
/**
 * EyewearML Product
 */

if (!defined('ABSPATH')) {
    exit;
}

class EyewearML_Product {
    private $product;
    private $settings;

    /**
     * Constructor
     */
    public function __construct($product = null) {
        $this->settings = get_option('eyewearml_settings', array());
        
        if (is_numeric($product)) {
            $this->product = wc_get_product($product);
        } elseif (is_a($product, 'WC_Product')) {
            $this->product = $product;
        }

        // Product hooks
        add_action('woocommerce_process_product_meta', array($this, 'save_product_meta'));
        add_action('woocommerce_product_after_variable_attributes', array($this, 'add_variation_fields'), 10, 3);
        add_action('woocommerce_save_product_variation', array($this, 'save_variation_fields'), 10, 2);
    }

    /**
     * Add product meta box
     */
    public function add_product_meta_box() {
        add_meta_box(
            'eyewearml_product_data',
            __('EyewearML Settings', 'eyewearml'),
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
        wp_nonce_field('eyewearml_save_product_meta', 'eyewearml_product_meta_nonce');
        ?>
        <div class="eyewearml-product-settings">
            <h4><?php _e('Frame Details', 'eyewearml'); ?></h4>
            <p class="form-field">
                <label for="eyewearml_frame_width"><?php _e('Frame Width (mm)', 'eyewearml'); ?></label>
                <input type="number" 
                       id="eyewearml_frame_width" 
                       name="eyewearml_frame_data[width]" 
                       value="<?php echo esc_attr($frame_data['width']); ?>" 
                       step="0.1" 
                       min="0">
            </p>
            <p class="form-field">
                <label for="eyewearml_frame_bridge"><?php _e('Bridge Width (mm)', 'eyewearml'); ?></label>
                <input type="number" 
                       id="eyewearml_frame_bridge" 
                       name="eyewearml_frame_data[bridge]" 
                       value="<?php echo esc_attr($frame_data['bridge']); ?>" 
                       step="0.1" 
                       min="0">
            </p>
            <p class="form-field">
                <label for="eyewearml_frame_temple"><?php _e('Temple Length (mm)', 'eyewearml'); ?></label>
                <input type="number" 
                       id="eyewearml_frame_temple" 
                       name="eyewearml_frame_data[temple]" 
                       value="<?php echo esc_attr($frame_data['temple']); ?>" 
                       step="0.1" 
                       min="0">
            </p>
            <p class="form-field">
                <label for="eyewearml_frame_lens_height"><?php _e('Lens Height (mm)', 'eyewearml'); ?></label>
                <input type="number" 
                       id="eyewearml_frame_lens_height" 
                       name="eyewearml_frame_data[lens_height]" 
                       value="<?php echo esc_attr($frame_data['lens_height']); ?>" 
                       step="0.1" 
                       min="0">
            </p>
            <p class="form-field">
                <label for="eyewearml_frame_lens_width"><?php _e('Lens Width (mm)', 'eyewearml'); ?></label>
                <input type="number" 
                       id="eyewearml_frame_lens_width" 
                       name="eyewearml_frame_data[lens_width]" 
                       value="<?php echo esc_attr($frame_data['lens_width']); ?>" 
                       step="0.1" 
                       min="0">
            </p>
            <p class="form-field">
                <label for="eyewearml_frame_weight"><?php _e('Weight (g)', 'eyewearml'); ?></label>
                <input type="number" 
                       id="eyewearml_frame_weight" 
                       name="eyewearml_frame_data[weight]" 
                       value="<?php echo esc_attr($frame_data['weight']); ?>" 
                       step="0.1" 
                       min="0">
            </p>
        </div>

        <div class="eyewearml-virtual-try-on">
            <h4><?php _e('Virtual Try-On', 'eyewearml'); ?></h4>
            <p class="form-field">
                <label for="eyewearml_enable_try_on">
                    <input type="checkbox" 
                           id="eyewearml_enable_try_on" 
                           name="eyewearml_enable_try_on" 
                           value="yes" 
                           <?php checked($this->get_try_on_enabled($product), 'yes'); ?>>
                    <?php _e('Enable virtual try-on for this product', 'eyewearml'); ?>
                </label>
            </p>
            <p class="form-field">
                <label for="eyewearml_try_on_model"><?php _e('3D Model File', 'eyewearml'); ?></label>
                <input type="text" 
                       id="eyewearml_try_on_model" 
                       name="eyewearml_try_on_model" 
                       value="<?php echo esc_attr($this->get_try_on_model($product)); ?>" 
                       class="regular-text">
                <button type="button" class="button eyewearml-upload-model">
                    <?php _e('Upload Model', 'eyewearml'); ?>
                </button>
            </p>
        </div>

        <div class="eyewearml-recommendations">
            <h4><?php _e('Recommendations', 'eyewearml'); ?></h4>
            <p class="form-field">
                <label for="eyewearml_style_tags"><?php _e('Style Tags', 'eyewearml'); ?></label>
                <input type="text" 
                       id="eyewearml_style_tags" 
                       name="eyewearml_style_tags" 
                       value="<?php echo esc_attr($this->get_style_tags($product)); ?>" 
                       class="regular-text">
                <span class="description">
                    <?php _e('Comma-separated tags to improve style-based recommendations', 'eyewearml'); ?>
                </span>
            </p>
        </div>
        <?php
    }

    /**
     * Save product meta
     */
    public function save_product_meta($post_id) {
        if (!isset($_POST['eyewearml_product_meta_nonce']) || 
            !wp_verify_nonce($_POST['eyewearml_product_meta_nonce'], 'eyewearml_save_product_meta')) {
            return;
        }

        // Save frame data
        if (isset($_POST['eyewearml_frame_data'])) {
            $frame_data = array_map('wc_clean', $_POST['eyewearml_frame_data']);
            update_post_meta($post_id, '_eyewearml_frame_data', $frame_data);
        }

        // Save virtual try-on settings
        $enable_try_on = isset($_POST['eyewearml_enable_try_on']) ? 'yes' : 'no';
        update_post_meta($post_id, '_eyewearml_enable_try_on', $enable_try_on);

        if (isset($_POST['eyewearml_try_on_model'])) {
            update_post_meta($post_id, '_eyewearml_try_on_model', wc_clean($_POST['eyewearml_try_on_model']));
        }

        // Save style tags
        if (isset($_POST['eyewearml_style_tags'])) {
            update_post_meta($post_id, '_eyewearml_style_tags', wc_clean($_POST['eyewearml_style_tags']));
        }

        // Update product embeddings
        $api = new EyewearML_API();
        $api->update_product_embeddings($post_id);
    }

    /**
     * Add variation fields
     */
    public function add_variation_fields($loop, $variation_data, $variation) {
        $frame_data = $this->get_frame_data($variation);
        ?>
        <div class="eyewearml-variation-settings">
            <p class="form-row form-row-first">
                <label><?php _e('Frame Color Code', 'eyewearml'); ?></label>
                <input type="text" 
                       name="eyewearml_frame_color[<?php echo $loop; ?>]" 
                       value="<?php echo esc_attr($frame_data['color_code'] ?? ''); ?>" 
                       class="short">
            </p>
            <p class="form-row form-row-last">
                <label><?php _e('Frame Finish', 'eyewearml'); ?></label>
                <input type="text" 
                       name="eyewearml_frame_finish[<?php echo $loop; ?>]" 
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

        if (isset($_POST['eyewearml_frame_color'][$loop])) {
            $frame_data['color_code'] = wc_clean($_POST['eyewearml_frame_color'][$loop]);
        }

        if (isset($_POST['eyewearml_frame_finish'][$loop])) {
            $frame_data['finish'] = wc_clean($_POST['eyewearml_frame_finish'][$loop]);
        }

        update_post_meta($variation_id, '_eyewearml_frame_data', $frame_data);
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

        $frame_data = get_post_meta($product->get_id(), '_eyewearml_frame_data', true);
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

        return get_post_meta($product->get_id(), '_eyewearml_enable_try_on', true) ?: 'no';
    }

    /**
     * Get 3D model URL
     */
    public function get_try_on_model($product = null) {
        $product = $product ?: $this->product;
        if (!$product) {
            return '';
        }

        return get_post_meta($product->get_id(), '_eyewearml_try_on_model', true) ?: '';
    }

    /**
     * Get style tags
     */
    public function get_style_tags($product = null) {
        $product = $product ?: $this->product;
        if (!$product) {
            return '';
        }

        return get_post_meta($product->get_id(), '_eyewearml_style_tags', true) ?: '';
    }
}
