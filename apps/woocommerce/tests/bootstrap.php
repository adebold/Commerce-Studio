<?php
/**
 * PHPUnit bootstrap file
 *
 * @package VARAi
 */

// Composer autoloader must be loaded before WP_PHPUNIT__DIR will be available
require_once dirname( __DIR__ ) . '/vendor/autoload.php';

// Give access to tests_add_filter() function.
require_once getenv( 'WP_TESTS_DIR' ) . '/includes/functions.php';

/**
 * Manually load the plugin being tested.
 */
function _manually_load_plugin() {
    // Load WooCommerce
    require_once dirname( dirname( dirname( __DIR__ ) ) ) . '/woocommerce/woocommerce.php';
    
    // Load VARAi plugin
    require_once dirname( __DIR__ ) . '/varai.php';
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Start up the WP testing environment.
require getenv( 'WP_TESTS_DIR' ) . '/includes/bootstrap.php';

// Mock WordPress functions if needed
if (!function_exists('wp_json_encode')) {
    function wp_json_encode($data, $options = 0, $depth = 512) {
        return json_encode($data, $options, $depth);
    }
}

if (!function_exists('wc_bool_to_string')) {
    function wc_bool_to_string($bool) {
        return $bool ? 'yes' : 'no';
    }
}

if (!function_exists('wc_clean')) {
    function wc_clean($var) {
        return is_array($var) ? array_map('wc_clean', $var) : sanitize_text_field($var);
    }
}

if (!function_exists('sanitize_text_field')) {
    function sanitize_text_field($str) {
        return trim(strip_tags($str));
    }
}

if (!function_exists('esc_attr')) {
    function esc_attr($text) {
        return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('esc_html')) {
    function esc_html($text) {
        return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('esc_url')) {
    function esc_url($url) {
        return filter_var($url, FILTER_SANITIZE_URL);
    }
}

if (!function_exists('esc_js')) {
    function esc_js($text) {
        return addslashes($text);
    }
}

if (!function_exists('__')) {
    function __($text, $domain = 'default') {
        return $text;
    }
}

if (!function_exists('_e')) {
    function _e($text, $domain = 'default') {
        echo $text;
    }
}

if (!function_exists('_x')) {
    function _x($text, $context, $domain = 'default') {
        return $text;
    }
}

// Create test class for VARAi_Product
class VARAi_Product_Test_Double extends VARAi_Product {
    public function __construct($product = null) {
        // Skip parent constructor to avoid WordPress function calls
    }
    
    public function get_frame_data($product = null) {
        return array(
            'width' => '140',
            'bridge' => '20',
            'temple' => '145',
            'lens_height' => '45',
            'lens_width' => '50',
            'weight' => '25',
            'color_code' => 'BLK',
            'finish' => 'Matte',
        );
    }
    
    public function get_try_on_enabled($product = null) {
        return 'yes';
    }
    
    public function get_try_on_model($product = null) {
        return 'https://example.com/model.glb';
    }
    
    public function get_style_score($product = null) {
        return 85;
    }
    
    public function get_style_tags($product = null) {
        return 'modern,trendy,lightweight';
    }
    
    public function is_in_varai_category($product = null) {
        return true;
    }
}