<?php
/**
 * Plugin Name: VARAi for WooCommerce
 * Plugin URI: https://varai.ai/woocommerce
 * Description: AI-powered eyewear recommendations and virtual try-on for WooCommerce
 * Version: 1.0.0
 * Author: VARAi
 * Author URI: https://varai.ai
 * Text Domain: varai
 * Domain Path: /languages
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('VARAI_VERSION', '1.0.0');
define('VARAI_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('VARAI_PLUGIN_URL', plugin_dir_url(__FILE__));

class VARAi {
    /**
     * Constructor
     */
    public function __construct() {
        // Load translations
        add_action('init', array($this, 'load_plugin_textdomain'));

        // Check if WooCommerce is active
        if ($this->is_woocommerce_active()) {
            $this->init();
        } else {
            add_action('admin_notices', array($this, 'woocommerce_missing_notice'));
        }
    }

    /**
     * Initialize plugin
     */
    private function init() {
        // Load required files
        require_once VARAI_PLUGIN_DIR . 'includes/class-varai-api.php';
        require_once VARAI_PLUGIN_DIR . 'includes/class-varai-product.php';
        require_once VARAI_PLUGIN_DIR . 'includes/class-varai-settings.php';
        require_once VARAI_PLUGIN_DIR . 'includes/class-varai-analytics.php';
        
        // Register custom product category
        add_action('init', array($this, 'register_varai_product_category'));

        // Admin hooks
        if (is_admin()) {
            add_action('admin_menu', array($this, 'add_admin_menu'));
            add_action('admin_enqueue_scripts', array($this, 'admin_scripts'));
            add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'plugin_action_links'));
        }

        // Frontend hooks
        add_action('wp_enqueue_scripts', array($this, 'frontend_scripts'));
        add_action('woocommerce_after_single_product', array($this, 'render_recommendations'));
        add_action('woocommerce_before_add_to_cart_button', array($this, 'render_virtual_try_on'));
        
        // Product filtering
        add_filter('woocommerce_product_query_meta_query', array($this, 'filter_products_by_varai_attributes'), 10, 2);

        // AJAX handlers
        add_action('wp_ajax_varai_get_recommendations', array($this, 'ajax_get_recommendations'));
        add_action('wp_ajax_nopriv_varai_get_recommendations', array($this, 'ajax_get_recommendations'));
        add_action('wp_ajax_varai_track_event', array($this, 'ajax_track_event'));
        add_action('wp_ajax_nopriv_varai_track_event', array($this, 'ajax_track_event'));
        
        // Webhook support
        add_action('rest_api_init', array($this, 'register_webhooks'));

        // Initialize analytics
        $this->analytics = new VARAi_Analytics();
        
        // Register shortcodes
        add_shortcode('varai_virtual_try_on', array($this, 'virtual_try_on_shortcode'));
        add_shortcode('varai_recommendations', array($this, 'recommendations_shortcode'));
        add_shortcode('varai_product_comparison', array($this, 'product_comparison_shortcode'));
    }

    /**
     * Check if WooCommerce is active
     */
    private function is_woocommerce_active() {
        return in_array(
            'woocommerce/woocommerce.php',
            apply_filters('active_plugins', get_option('active_plugins'))
        );
    }

    /**
     * Load plugin textdomain
     */
    public function load_plugin_textdomain() {
        load_plugin_textdomain(
            'varai',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages/'
        );
    }
    
    /**
     * Register VARAi product category
     */
    public function register_varai_product_category() {
        $labels = array(
            'name'              => _x('VARAi Products', 'taxonomy general name', 'varai'),
            'singular_name'     => _x('VARAi Product', 'taxonomy singular name', 'varai'),
            'search_items'      => __('Search VARAi Products', 'varai'),
            'all_items'         => __('All VARAi Products', 'varai'),
            'parent_item'       => __('Parent VARAi Product', 'varai'),
            'parent_item_colon' => __('Parent VARAi Product:', 'varai'),
            'edit_item'         => __('Edit VARAi Product', 'varai'),
            'update_item'       => __('Update VARAi Product', 'varai'),
            'add_new_item'      => __('Add New VARAi Product', 'varai'),
            'new_item_name'     => __('New VARAi Product Name', 'varai'),
            'menu_name'         => __('VARAi Products', 'varai'),
        );

        $args = array(
            'hierarchical'      => true,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'rewrite'           => array('slug' => 'varai-product'),
        );

        register_taxonomy('varai_product_cat', array('product'), $args);
    }
    
    /**
     * Filter products by VARAi attributes
     */
    public function filter_products_by_varai_attributes($meta_query, $query) {
        // Only apply on shop/archive pages when VARAi filter is active
        if (!is_admin() && isset($_GET['varai_filter'])) {
            // Style score filter
            if (isset($_GET['style_score']) && !empty($_GET['style_score'])) {
                $score = intval($_GET['style_score']);
                $meta_query[] = array(
                    'key'     => '_varai_style_score',
                    'value'   => $score,
                    'compare' => '>=',
                    'type'    => 'NUMERIC'
                );
            }
            
            // Virtual try-on filter
            if (isset($_GET['virtual_try_on']) && $_GET['virtual_try_on'] === 'yes') {
                $meta_query[] = array(
                    'key'     => '_varai_enable_try_on',
                    'value'   => 'yes',
                    'compare' => '='
                );
            }
            
            // Recommendation tags filter
            if (isset($_GET['recommendation_tag']) && !empty($_GET['recommendation_tag'])) {
                $tag = sanitize_text_field($_GET['recommendation_tag']);
                $meta_query[] = array(
                    'key'     => '_varai_style_tags',
                    'value'   => $tag,
                    'compare' => 'LIKE'
                );
            }
        }
        
        return $meta_query;
    }

    /**
     * Add admin menu items
     */
    public function add_admin_menu() {
        add_menu_page(
            __('VARAi', 'varai'),
            __('VARAi', 'varai'),
            'manage_options',
            'varai',
            array($this, 'render_admin_page'),
            'dashicons-visibility',
            56
        );

        add_submenu_page(
            'varai',
            __('Settings', 'varai'),
            __('Settings', 'varai'),
            'manage_options',
            'varai-settings',
            array($this, 'render_settings_page')
        );

        add_submenu_page(
            'varai',
            __('Analytics', 'varai'),
            __('Analytics', 'varai'),
            'manage_options',
            'varai-analytics',
            array($this, 'render_analytics_page')
        );
        
        add_submenu_page(
            'varai',
            __('Documentation', 'varai'),
            __('Documentation', 'varai'),
            'manage_options',
            'varai-documentation',
            array($this, 'render_documentation_page')
        );
    }

    /**
     * Enqueue admin scripts
     */
    public function admin_scripts() {
        wp_enqueue_style(
            'varai-admin',
            VARAI_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            VARAI_VERSION
        );

        wp_enqueue_script(
            'varai-admin',
            VARAI_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            VARAI_VERSION,
            true
        );

        wp_localize_script('varai-admin', 'varai_admin', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('varai-admin'),
            'rest_url' => rest_url('varai/v1'),
        ));
    }

    /**
     * Enqueue frontend scripts
     */
    public function frontend_scripts() {
        if (is_product()) {
            wp_enqueue_style(
                'varai-frontend',
                VARAI_PLUGIN_URL . 'assets/css/frontend.css',
                array(),
                VARAI_VERSION
            );

            wp_enqueue_script(
                'varai-frontend',
                VARAI_PLUGIN_URL . 'assets/js/frontend.js',
                array('jquery'),
                VARAI_VERSION,
                true
            );

            wp_localize_script('varai-frontend', 'varai', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('varai-frontend'),
                'product_id' => get_the_ID(),
                'rest_url' => rest_url('varai/v1'),
            ));
        }
    }

    /**
     * Add plugin action links
     */
    public function plugin_action_links($links) {
        $plugin_links = array(
            '<a href="' . admin_url('admin.php?page=varai-settings') . '">' . __('Settings', 'varai') . '</a>',
            '<a href="' . admin_url('admin.php?page=varai-documentation') . '">' . __('Documentation', 'varai') . '</a>',
        );
        return array_merge($plugin_links, $links);
    }

    /**
     * Render recommendations on product page
     */
    public function render_recommendations() {
        if (is_product()) {
            $product_id = get_the_ID();
            $settings = get_option('varai_settings');

            if (!empty($settings['api_key'])) {
                include VARAI_PLUGIN_DIR . 'templates/recommendations.php';
            }
        }
    }

    /**
     * Render virtual try-on button
     */
    public function render_virtual_try_on() {
        if (is_product()) {
            $product_id = get_the_ID();
            $settings = get_option('varai_settings');

            if (!empty($settings['api_key']) && !empty($settings['enable_virtual_try_on'])) {
                include VARAI_PLUGIN_DIR . 'templates/virtual-try-on.php';
            }
        }
    }

    /**
     * AJAX handler for recommendations
     */
    public function ajax_get_recommendations() {
        check_ajax_referer('varai-frontend', 'nonce');

        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
        if (!$product_id) {
            wp_send_json_error('Invalid product ID');
        }

        $api = new VARAi_API();
        $recommendations = $api->get_recommendations($product_id);

        wp_send_json_success($recommendations);
    }

    /**
     * AJAX handler for event tracking
     */
    public function ajax_track_event() {
        check_ajax_referer('varai-frontend', 'nonce');

        $event_type = isset($_POST['event_type']) ? sanitize_text_field($_POST['event_type']) : '';
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

        if (!$event_type || !$product_id) {
            wp_send_json_error('Invalid parameters');
        }

        $this->analytics->track_event($event_type, $product_id);
        wp_send_json_success();
    }

    /**
     * Register webhook endpoints
     */
    public function register_webhooks() {
        register_rest_route('varai/v1', '/webhook', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_webhook'),
            'permission_callback' => array($this, 'verify_webhook_request'),
        ));
    }
    
    /**
     * Verify webhook request
     */
    public function verify_webhook_request($request) {
        $settings = get_option('varai_settings');
        $api_key = !empty($settings['api_key']) ? $settings['api_key'] : '';
        
        if (empty($api_key)) {
            return false;
        }
        
        $signature = $request->get_header('X-VARAi-Signature');
        if (empty($signature)) {
            return false;
        }
        
        $payload = $request->get_body();
        $expected_signature = hash_hmac('sha256', $payload, $api_key);
        
        return hash_equals($expected_signature, $signature);
    }
    
    /**
     * Handle webhook
     */
    public function handle_webhook($request) {
        $payload = $request->get_json_params();
        
        if (empty($payload['event']) || empty($payload['data'])) {
            return new WP_Error('invalid_payload', 'Invalid webhook payload', array('status' => 400));
        }
        
        $event = sanitize_text_field($payload['event']);
        $data = $payload['data'];
        
        // Log webhook event
        error_log('VARAi webhook received: ' . $event);
        
        // Process based on event type
        switch ($event) {
            case 'product_update':
                // Handle product update
                break;
                
            case 'recommendation_update':
                // Handle recommendation update
                break;
                
            case 'style_score_update':
                // Handle style score update
                break;
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Webhook processed successfully'
        ));
    }
    
    /**
     * Virtual try-on shortcode
     */
    public function virtual_try_on_shortcode($atts) {
        $atts = shortcode_atts(array(
            'product_id' => 0,
            'button_text' => __('Try On Virtually', 'varai'),
            'button_class' => 'varai-try-on-button',
        ), $atts, 'varai_virtual_try_on');
        
        $product_id = intval($atts['product_id']);
        if (!$product_id) {
            $product_id = get_the_ID();
        }
        
        if (!$product_id) {
            return '';
        }
        
        $product = wc_get_product($product_id);
        if (!$product) {
            return '';
        }
        
        $product_helper = new VARAi_Product($product);
        if ($product_helper->get_try_on_enabled() !== 'yes') {
            return '';
        }
        
        ob_start();
        include VARAI_PLUGIN_DIR . 'templates/shortcodes/virtual-try-on.php';
        return ob_get_clean();
    }
    
    /**
     * Recommendations shortcode
     */
    public function recommendations_shortcode($atts) {
        $atts = shortcode_atts(array(
            'product_id' => 0,
            'limit' => 4,
            'columns' => 2,
            'title' => __('Recommended Products', 'varai'),
        ), $atts, 'varai_recommendations');
        
        $product_id = intval($atts['product_id']);
        if (!$product_id) {
            $product_id = get_the_ID();
        }
        
        if (!$product_id) {
            return '';
        }
        
        $api = new VARAi_API();
        $recommendations = $api->get_recommendations($product_id, intval($atts['limit']));
        
        if (empty($recommendations)) {
            return '';
        }
        
        ob_start();
        include VARAI_PLUGIN_DIR . 'templates/shortcodes/recommendations.php';
        return ob_get_clean();
    }
    
    /**
     * Product comparison shortcode
     */
    public function product_comparison_shortcode($atts) {
        $atts = shortcode_atts(array(
            'products' => '',
            'columns' => 3,
            'title' => __('Product Comparison', 'varai'),
        ), $atts, 'varai_product_comparison');
        
        if (empty($atts['products'])) {
            return '';
        }
        
        $product_ids = array_map('intval', explode(',', $atts['products']));
        if (empty($product_ids)) {
            return '';
        }
        
        $products = array();
        foreach ($product_ids as $product_id) {
            $product = wc_get_product($product_id);
            if ($product) {
                $products[] = $product;
            }
        }
        
        if (count($products) < 2) {
            return '';
        }
        
        ob_start();
        include VARAI_PLUGIN_DIR . 'templates/shortcodes/product-comparison.php';
        return ob_get_clean();
    }
    
    /**
     * Render documentation page
     */
    public function render_documentation_page() {
        include VARAI_PLUGIN_DIR . 'admin/documentation.php';
    }

    /**
     * Display notice if WooCommerce is not active
     */
    public function woocommerce_missing_notice() {
        ?>
        <div class="error">
            <p><?php _e('VARAi for WooCommerce requires WooCommerce to be installed and active.', 'varai'); ?></p>
        </div>
        <?php
    }
}

// Initialize plugin
$varai = new VARAi();
