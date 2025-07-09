<?php
/**
 * Plugin Name: Consultation Integration
 * Plugin URI: https://commercestudio.com/consultation-integration
 * Description: AI-powered eyewear consultation integration for WooCommerce stores
 * Version: 1.0.0
 * Author: Commerce Studio
 * License: GPL v2 or later
 * Text Domain: consultation-integration
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('CONSULTATION_INTEGRATION_VERSION', '1.0.0');
define('CONSULTATION_INTEGRATION_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CONSULTATION_INTEGRATION_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CONSULTATION_INTEGRATION_PLUGIN_FILE', __FILE__);

/**
 * Main Consultation Integration Class
 */
class ConsultationIntegration
{
    /**
     * Single instance of the class
     *
     * @var ConsultationIntegration
     */
    protected static $_instance = null;

    /**
     * Consultation API URL
     *
     * @var string
     */
    protected $api_url;

    /**
     * Plugin settings
     *
     * @var array
     */
    protected $settings;

    /**
     * Main Instance
     *
     * @static
     * @return ConsultationIntegration
     */
    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->init_hooks();
        $this->load_settings();
    }

    /**
     * Hook into actions and filters
     */
    private function init_hooks()
    {
        add_action('init', array($this, 'init'), 0);
        add_action('wp_enqueue_scripts', array($this, 'frontend_scripts'));
        add_action('woocommerce_single_product_summary', array($this, 'add_consultation_button'), 25);
        add_action('wp_ajax_start_consultation', array($this, 'ajax_start_consultation'));
        add_action('wp_ajax_nopriv_start_consultation', array($this, 'ajax_start_consultation'));
        add_action('wp_ajax_face_analysis', array($this, 'ajax_face_analysis'));
        add_action('wp_ajax_nopriv_face_analysis', array($this, 'ajax_face_analysis'));
        add_action('wp_ajax_get_recommendations', array($this, 'ajax_get_recommendations'));
        add_action('wp_ajax_nopriv_get_recommendations', array($this, 'ajax_get_recommendations'));
        add_action('wp_ajax_find_stores', array($this, 'ajax_find_stores'));
        add_action('wp_ajax_nopriv_find_stores', array($this, 'ajax_find_stores'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
        add_filter('woocommerce_get_settings_pages', array($this, 'add_settings_page'));
    }

    /**
     * Init when WordPress Initializes
     */
    public function init()
    {
        // Load plugin text domain
        load_plugin_textdomain('consultation-integration', false, dirname(plugin_basename(__FILE__)) . '/languages');

        // Check if WooCommerce is active
        if (!class_exists('WooCommerce')) {
            add_action('admin_notices', array($this, 'woocommerce_missing_notice'));
            return;
        }
    }

    /**
     * Load plugin settings
     */
    private function load_settings()
    {
        $this->settings = get_option('consultation_integration_settings', array(
            'enabled' => 'yes',
            'api_url' => 'http://localhost:3002',
            'api_key' => '',
            'widget_position' => 'product-page',
            'face_analysis_enabled' => 'yes',
            'store_locator_enabled' => 'yes',
            'button_text' => __('Find Your Perfect Frames', 'consultation-integration'),
            'button_color' => '#007bff'
        ));

        $this->api_url = $this->settings['api_url'];
    }

    /**
     * Enqueue frontend scripts and styles
     */
    public function frontend_scripts()
    {
        if (!$this->is_enabled()) {
            return;
        }

        wp_enqueue_script(
            'consultation-integration',
            CONSULTATION_INTEGRATION_PLUGIN_URL . 'assets/js/consultation-integration.js',
            array('jquery'),
            CONSULTATION_INTEGRATION_VERSION,
            true
        );

        wp_enqueue_style(
            'consultation-integration',
            CONSULTATION_INTEGRATION_PLUGIN_URL . 'assets/css/consultation-integration.css',
            array(),
            CONSULTATION_INTEGRATION_VERSION
        );

        // Localize script with settings
        wp_localize_script('consultation-integration', 'consultationIntegration', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('consultation_integration_nonce'),
            'api_url' => $this->api_url,
            'settings' => $this->settings,
            'strings' => array(
                'loading' => __('Loading...', 'consultation-integration'),
                'error' => __('An error occurred. Please try again.', 'consultation-integration'),
                'camera_permission' => __('Camera permission is required for face analysis.', 'consultation-integration'),
                'face_analysis_complete' => __('Face analysis complete!', 'consultation-integration'),
                'recommendations_loading' => __('Loading your personalized recommendations...', 'consultation-integration')
            )
        ));
    }

    /**
     * Add consultation button to product page
     */
    public function add_consultation_button()
    {
        if (!$this->is_enabled() || !$this->is_eyewear_product()) {
            return;
        }

        $button_text = $this->settings['button_text'];
        $button_color = $this->settings['button_color'];

        echo '<div class="consultation-button-container">';
        echo '<button type="button" class="consultation-button" style="background-color: ' . esc_attr($button_color) . '">';
        echo '<span class="consultation-icon">👓</span> ' . esc_html($button_text);
        echo '</button>';
        echo '</div>';

        // Add consultation modal structure
        $this->render_consultation_modal();
    }

    /**
     * Render consultation modal
     */
    private function render_consultation_modal()
    {
        ?>
        <div id="consultation-modal" class="consultation-modal" style="display: none;">
            <div class="consultation-modal-content">
                <button class="consultation-modal-close">&times;</button>
                
                <div class="consultation-header">
                    <h2><?php _e('Find Your Perfect Frames', 'consultation-integration'); ?></h2>
                    <p><?php _e('Our AI-powered consultation will help you discover eyewear that complements your face shape and style preferences.', 'consultation-integration'); ?></p>
                </div>

                <!-- Step 1: Welcome -->
                <div class="consultation-step" id="step-welcome">
                    <div class="step-header">
                        <span class="step-number">1</span>
                        <h3><?php _e('Welcome to Your Personal Consultation', 'consultation-integration'); ?></h3>
                    </div>
                    <div class="step-content">
                        <p><?php _e('Let\'s find the perfect frames for you! This consultation will analyze your face shape and preferences to recommend the best eyewear options.', 'consultation-integration'); ?></p>
                        <button class="consultation-btn consultation-btn-primary" onclick="consultationIntegrationJS.startPreferences()">
                            <?php _e('Get Started', 'consultation-integration'); ?>
                        </button>
                    </div>
                </div>

                <!-- Step 2: Style Preferences -->
                <div class="consultation-step" id="step-preferences" style="display: none;">
                    <div class="step-header">
                        <span class="step-number">2</span>
                        <h3><?php _e('Tell Us About Your Style', 'consultation-integration'); ?></h3>
                    </div>
                    <div class="step-content">
                        <p><?php _e('What style appeals to you most?', 'consultation-integration'); ?></p>
                        <div class="style-options">
                            <button class="style-option" data-style="classic">
                                <strong><?php _e('Classic & Professional', 'consultation-integration'); ?></strong>
                                <span><?php _e('Timeless designs for work and formal occasions', 'consultation-integration'); ?></span>
                            </button>
                            <button class="style-option" data-style="modern">
                                <strong><?php _e('Modern & Minimalist', 'consultation-integration'); ?></strong>
                                <span><?php _e('Clean lines and contemporary aesthetics', 'consultation-integration'); ?></span>
                            </button>
                            <button class="style-option" data-style="bold">
                                <strong><?php _e('Bold & Statement', 'consultation-integration'); ?></strong>
                                <span><?php _e('Eye-catching designs that make an impact', 'consultation-integration'); ?></span>
                            </button>
                            <button class="style-option" data-style="vintage">
                                <strong><?php _e('Vintage & Retro', 'consultation-integration'); ?></strong>
                                <span><?php _e('Classic styles with nostalgic appeal', 'consultation-integration'); ?></span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Step 3: Face Analysis -->
                <div class="consultation-step" id="step-face-analysis" style="display: none;">
                    <div class="step-header">
                        <span class="step-number">3</span>
                        <h3><?php _e('Face Shape Analysis', 'consultation-integration'); ?></h3>
                    </div>
                    <div class="step-content">
                        <p><?php _e('For the most accurate recommendations, let\'s analyze your face shape.', 'consultation-integration'); ?></p>
                        <div id="face-analysis-container">
                            <div id="camera-preview">
                                <p><?php _e('Click "Start Camera" to begin face analysis', 'consultation-integration'); ?></p>
                            </div>
                            <div class="face-analysis-buttons">
                                <button class="consultation-btn consultation-btn-primary" onclick="consultationIntegrationJS.startCamera()">
                                    <?php _e('Start Camera', 'consultation-integration'); ?>
                                </button>
                                <button class="consultation-btn consultation-btn-secondary" onclick="consultationIntegrationJS.skipFaceAnalysis()">
                                    <?php _e('Skip This Step', 'consultation-integration'); ?>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 4: Recommendations -->
                <div class="consultation-step" id="step-recommendations" style="display: none;">
                    <div class="step-header">
                        <span class="step-number">4</span>
                        <h3><?php _e('Your Personalized Recommendations', 'consultation-integration'); ?></h3>
                    </div>
                    <div class="step-content">
                        <div id="recommendations-loading">
                            <p><?php _e('Loading your personalized recommendations...', 'consultation-integration'); ?></p>
                        </div>
                        <div id="recommendations-content" style="display: none;">
                            <!-- Recommendations will be populated by JavaScript -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * AJAX handler for starting consultation
     */
    public function ajax_start_consultation()
    {
        check_ajax_referer('consultation_integration_nonce', 'nonce');

        $session_data = array(
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'referrer' => $_SERVER['HTTP_REFERER'] ?? '',
            'url' => wp_get_referer(),
            'user_id' => get_current_user_id(),
            'product_id' => intval($_POST['product_id'] ?? 0)
        );

        $response = $this->make_api_request('/consultation/start', 'POST', array(
            'platform' => 'woocommerce',
            'sessionData' => $session_data
        ));

        if ($response && isset($response['sessionId'])) {
            wp_send_json_success($response);
        } else {
            wp_send_json_error(__('Failed to start consultation', 'consultation-integration'));
        }
    }

    /**
     * AJAX handler for face analysis
     */
    public function ajax_face_analysis()
    {
        check_ajax_referer('consultation_integration_nonce', 'nonce');

        $session_id = sanitize_text_field($_POST['session_id'] ?? '');
        $image_data = sanitize_textarea_field($_POST['image_data'] ?? '');

        if (empty($session_id) || empty($image_data)) {
            wp_send_json_error(__('Missing required data', 'consultation-integration'));
            return;
        }

        $response = $this->make_api_request('/consultation/face-analysis', 'POST', array(
            'sessionId' => $session_id,
            'imageData' => $image_data
        ));

        if ($response && isset($response['faceAnalysis'])) {
            wp_send_json_success($response);
        } else {
            wp_send_json_error(__('Face analysis failed', 'consultation-integration'));
        }
    }

    /**
     * AJAX handler for getting recommendations
     */
    public function ajax_get_recommendations()
    {
        check_ajax_referer('consultation_integration_nonce', 'nonce');

        $session_id = sanitize_text_field($_POST['session_id'] ?? '');
        $preferences = $_POST['preferences'] ?? array();
        $face_analysis = $_POST['face_analysis'] ?? null;

        if (empty($session_id)) {
            wp_send_json_error(__('Missing session ID', 'consultation-integration'));
            return;
        }

        // Get WooCommerce products for recommendations
        $product_catalog = $this->get_woocommerce_products();

        $response = $this->make_api_request('/consultation/recommendations', 'POST', array(
            'sessionId' => $session_id,
            'preferences' => $preferences,
            'faceAnalysis' => $face_analysis,
            'productCatalog' => $product_catalog,
            'platform' => 'woocommerce'
        ));

        if ($response && isset($response['recommendations'])) {
            wp_send_json_success($response);
        } else {
            wp_send_json_error(__('Failed to get recommendations', 'consultation-integration'));
        }
    }

    /**
     * AJAX handler for finding stores
     */
    public function ajax_find_stores()
    {
        check_ajax_referer('consultation_integration_nonce', 'nonce');

        $session_id = sanitize_text_field($_POST['session_id'] ?? '');
        $latitude = floatval($_POST['latitude'] ?? 0);
        $longitude = floatval($_POST['longitude'] ?? 0);
        $selected_products = $_POST['selected_products'] ?? array();

        if (empty($session_id) || !$latitude || !$longitude) {
            wp_send_json_error(__('Missing required location data', 'consultation-integration'));
            return;
        }

        $params = array(
            'sessionId' => $session_id,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'products' => implode(',', array_map('sanitize_text_field', $selected_products))
        );

        $response = $this->make_api_request('/api/stores/nearby?' . http_build_query($params), 'GET');

        if ($response && isset($response['stores'])) {
            wp_send_json_success($response);
        } else {
            wp_send_json_error(__('Failed to find stores', 'consultation-integration'));
        }
    }

    /**
     * Get WooCommerce products for consultation
     */
    private function get_woocommerce_products()
    {
        $products = array();
        
        $query_args = array(
            'post_type' => 'product',
            'post_status' => 'publish',
            'posts_per_page' => 100,
            'meta_query' => array(
                array(
                    'key' => '_stock_status',
                    'value' => 'instock'
                )
            )
        );

        // Filter for eyewear products if category exists
        $eyewear_categories = get_terms(array(
            'taxonomy' => 'product_cat',
            'name__like' => 'eyewear',
            'hide_empty' => false
        ));

        if ($eyewear_categories) {
            $query_args['tax_query'] = array(
                array(
                    'taxonomy' => 'product_cat',
                    'field' => 'term_id',
                    'terms' => wp_list_pluck($eyewear_categories, 'term_id')
                )
            );
        }

        $product_query = new WP_Query($query_args);

        if ($product_query->have_posts()) {
            while ($product_query->have_posts()) {
                $product_query->the_post();
                $product = wc_get_product(get_the_ID());
                
                if ($product) {
                    $products[] = $this->transform_woocommerce_product($product);
                }
            }
            wp_reset_postdata();
        }

        return $products;
    }

    /**
     * Transform WooCommerce product to consultation format
     */
    private function transform_woocommerce_product($product)
    {
        // Extract eyewear attributes
        $eyewear_attributes = $this->extract_eyewear_attributes($product);

        return array(
            'id' => 'woocommerce_' . $product->get_id(),
            'woocommerceId' => $product->get_id(),
            'name' => $product->get_name(),
            'sku' => $product->get_sku(),
            'brand' => $this->get_product_brand($product),
            'category' => $this->categorize_product($product),
            'style' => $eyewear_attributes['style'],
            'material' => $eyewear_attributes['material'],
            'color' => $eyewear_attributes['color'],
            'price' => floatval($product->get_price()),
            'salePrice' => floatval($product->get_sale_price()),
            'measurements' => $eyewear_attributes['measurements'],
            'features' => $eyewear_attributes['features'],
            'suitableFaceShapes' => $eyewear_attributes['suitableFaceShapes'],
            'styleMatch' => $eyewear_attributes['styleMatch'],
            'lifestyleMatch' => $eyewear_attributes['lifestyleMatch'],
            'image' => wp_get_attachment_image_url($product->get_image_id(), 'medium'),
            'url' => $product->get_permalink(),
            'inStock' => $product->is_in_stock(),
            'rating' => floatval($product->get_average_rating()) ?: 4.0,
            'reviews' => $product->get_review_count()
        );
    }

    /**
     * Additional helper methods would go here...
     */
    
    private function extract_eyewear_attributes($product) { /* Implementation */ }
    private function get_product_brand($product) { /* Implementation */ }
    private function categorize_product($product) { /* Implementation */ }
    private function is_enabled() { /* Implementation */ }
    private function is_eyewear_product() { /* Implementation */ }
    private function make_api_request($endpoint, $method = 'GET', $data = null) { /* Implementation */ }
    public function woocommerce_missing_notice() { /* Implementation */ }
    public function admin_menu() { /* Implementation */ }
    public function admin_init() { /* Implementation */ }
    public function add_settings_page($settings) { /* Implementation */ }
}

/**
 * Main instance of ConsultationIntegration
 *
 * @return ConsultationIntegration
 */
function consultation_integration()
{
    return ConsultationIntegration::instance();
}

// Global for backwards compatibility
$GLOBALS['consultation_integration'] = consultation_integration();