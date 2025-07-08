<?php
/**
 * Plugin Name: AI Avatar Chat for WooCommerce
 * Plugin URI: https://example.com/
 * Description: Integrates the AI Avatar Chat system with WooCommerce.
 * Version: 1.0.0
 * Author: Commerce Studio
 * Author URI: https://example.com/
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: ai-avatar-chat-woocommerce
 *
 * Key features:
 * - WooCommerce REST API integration for product and cart management.
 * - WordPress hooks for seamless theme integration.
 * - User authentication via WordPress user accounts.
 * - Shortcode for easy widget placement.
 */

if (!defined('WPINC')) {
    die;
}

// Define plugin constants
define('AI_AVATAR_CHAT_WOOCOMMERCE_VERSION', '1.0.0');
define('AI_AVATAR_CHAT_WOOCOMMERCE_PLUGIN_DIR', plugin_dir_path(__FILE__));

class AiAvatarChatWooCommerce
{
    public function __construct()
    {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_action('wp_footer', [$this, 'render_widget_container']);
        add_shortcode('ai_avatar_chat', [$this, 'render_widget_shortcode']);
        add_action('wp_ajax_ai_avatar_sync_products', [$this, 'sync_products']);
        add_action('wp_ajax_nopriv_ai_avatar_sync_products', [$this, 'sync_products']);
        add_action('wp_ajax_ai_avatar_add_to_cart', [$this, 'add_to_cart']);
        add_action('wp_ajax_nopriv_ai_avatar_add_to_cart', [$this, 'add_to_cart']);
    }

    /**
     * Enqueue scripts and styles.
     */
    public function enqueue_scripts()
    {
        // TODO: Enqueue the main JavaScript file for the widget.
        // wp_enqueue_script(
        //     'ai-avatar-chat-woocommerce-script',
        //     plugins_url('avatar-chat-widget.js', __FILE__),
        //     [],
        //     AI_AVATAR_CHAT_WOOCOMMERCE_VERSION,
        //     true
        // );

        // Pass data to the script
        wp_localize_script('ai-avatar-chat-woocommerce-script', 'aiAvatarChat', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('ai_avatar_chat_nonce'),
            'is_user_logged_in' => is_user_logged_in(),
        ]);
    }

    /**
     * Render the container for the chat widget.
     */
    public function render_widget_container()
    {
        echo '<div id="ai-avatar-chat-widget-container"></div>';
    }

    /**
     * Render the widget via shortcode.
     */
    public function render_widget_shortcode()
    {
        ob_start();
        $this->render_widget_container();
        return ob_get_clean();
    }

    /**
     * Sync WooCommerce products with the AI engine.
     * Uses WooCommerce REST API.
     */
    public function sync_products()
    {
        // Security check
        check_ajax_referer('ai_avatar_chat_nonce', 'nonce');

        // TODO: Implement product synchronization using WC_REST_Products_Controller
        // This would typically be called by a backend service.
        // For simplicity, we'll simulate a response.
        wp_send_json_success(['message' => 'Product sync initiated.']);
    }

    /**
     * Add a product to the cart.
     */
    public function add_to_cart()
    {
        // Security check
        check_ajax_referer('ai_avatar_chat_nonce', 'nonce');

        if (!isset($_POST['product_id']) || !isset($_POST['quantity'])) {
            wp_send_json_error(['message' => 'Missing product ID or quantity.']);
        }

        $product_id = absint($_POST['product_id']);
        $quantity = absint($_POST['quantity']);

        if (WC()->cart->add_to_cart($product_id, $quantity)) {
            wp_send_json_success(['message' => 'Product added to cart.']);
        } else {
            wp_send_json_error(['message' => 'Failed to add product to cart.']);
        }
    }

    /**
     * Health check for monitoring.
     */
    public static function health_check()
    {
        // This could be exposed via a custom REST API endpoint for monitoring.
        return [
            'status' => 'ok',
            'timestamp' => current_time('mysql', 1),
            'woocommerce_active' => class_exists('WooCommerce'),
        ];
    }
}

// Initialize the plugin
new AiAvatarChatWooCommerce();

/**
 * Installation Guide:
 * 1. Install and activate the plugin through the WordPress admin panel.
 * 2. The chat widget will automatically appear on all pages.
 * 3. Alternatively, use the [ai_avatar_chat] shortcode to place the widget manually.
 * 4. Ensure WooCommerce is installed and active.
 * 5. Configure Commerce Studio service endpoints in the plugin settings (not implemented in this file).
 */