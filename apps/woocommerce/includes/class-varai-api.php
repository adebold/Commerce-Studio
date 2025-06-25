<?php
/**
 * VARAi API Integration
 */

if (!defined('ABSPATH')) {
    exit;
}

class VARAi_API {
    private $api_key;
    private $api_url;
    private $settings;
    private $cache;
    private $cache_expiration;

    /**
     * Constructor
     */
    public function __construct() {
        $this->settings = get_option('varai_settings', array());
        $this->api_key = !empty($this->settings['api_key']) ? $this->settings['api_key'] : '';
        $this->api_url = !empty($this->settings['api_url']) ? $this->settings['api_url'] : 'https://api.varai.ai/v1';
        $this->cache = array();
        $this->cache_expiration = !empty($this->settings['cache_expiration']) ? intval($this->settings['cache_expiration']) : 3600; // Default 1 hour
    }

    /**
     * Get product recommendations
     */
    public function get_recommendations($product_id, $limit = 4) {
        if (!$this->api_key) {
            return array();
        }

        $product = wc_get_product($product_id);
        if (!$product) {
            return array();
        }

        // Check cache first
        $cache_key = 'varai_recommendations_' . $product_id . '_' . $limit;
        $cached_data = $this->get_cache($cache_key);
        if ($cached_data !== false) {
            return $cached_data;
        }

        // Get product data
        $product_data = $this->get_product_data($product);

        // Make API request
        $response = $this->make_api_request(
            '/recommendations',
            'POST',
            array(
                'product' => $product_data,
                'limit' => $limit,
            )
        );

        if (is_wp_error($response)) {
            $this->log_error('Error getting recommendations: ' . $response->get_error_message());
            return array();
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);

        if (!$data || !isset($data['recommendations'])) {
            return array();
        }

        $formatted = $this->format_recommendations($data['recommendations']);
        
        // Cache the results
        $this->set_cache($cache_key, $formatted);

        return $formatted;
    }

    /**
     * Get product data for API
     */
    private function get_product_data($product) {
        $image_id = $product->get_image_id();
        $image_url = wp_get_attachment_image_url($image_id, 'full');

        // Get style score from product meta
        $style_score = get_post_meta($product->get_id(), '_varai_style_score', true);
        $style_score = !empty($style_score) ? intval($style_score) : null;

        // Get recommendation tags from product meta
        $recommendation_tags = get_post_meta($product->get_id(), '_varai_style_tags', true);
        $recommendation_tags = !empty($recommendation_tags) ? explode(',', $recommendation_tags) : array();

        // Get virtual try-on status
        $virtual_try_on = get_post_meta($product->get_id(), '_varai_enable_try_on', true) === 'yes';

        return array(
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'brand' => $this->get_product_brand($product),
            'style' => $this->get_product_style($product),
            'material' => $this->get_product_material($product),
            'color' => $this->get_product_color($product),
            'price' => $product->get_price(),
            'image_url' => $image_url,
            'style_score' => $style_score,
            'recommendation_tags' => $recommendation_tags,
            'virtual_try_on_enabled' => $virtual_try_on,
        );
    }

    /**
     * Format recommendations for display
     */
    private function format_recommendations($recommendations) {
        $formatted = array();

        foreach ($recommendations as $rec) {
            $product_id = $rec['product_id'];
            $product = wc_get_product($product_id);

            if (!$product) {
                continue;
            }

            $formatted[] = array(
                'id' => $product_id,
                'name' => $product->get_name(),
                'url' => $product->get_permalink(),
                'image' => wp_get_attachment_image_url($product->get_image_id(), 'woocommerce_thumbnail'),
                'price' => $product->get_price_html(),
                'score' => isset($rec['score']) ? $rec['score'] : null,
                'reasoning' => isset($rec['reasoning']) ? $rec['reasoning'] : '',
                'style_score' => get_post_meta($product_id, '_varai_style_score', true),
                'virtual_try_on' => get_post_meta($product_id, '_varai_enable_try_on', true) === 'yes',
            );
        }

        return $formatted;
    }

    /**
     * Get product brand (using WooCommerce Brands if available)
     */
    private function get_product_brand($product) {
        if (function_exists('wc_brands_get_product_brands')) {
            $brands = wc_brands_get_product_brands($product->get_id());
            if (!empty($brands)) {
                return reset($brands)->name;
            }
        }

        // Fallback to product attribute
        $brand_attribute = $this->settings['brand_attribute'] ?? 'pa_brand';
        return $product->get_attribute($brand_attribute);
    }

    /**
     * Get product style
     */
    private function get_product_style($product) {
        $style_attribute = $this->settings['style_attribute'] ?? 'pa_style';
        return $product->get_attribute($style_attribute);
    }

    /**
     * Get product material
     */
    private function get_product_material($product) {
        $material_attribute = $this->settings['material_attribute'] ?? 'pa_material';
        return $product->get_attribute($material_attribute);
    }

    /**
     * Get product color
     */
    private function get_product_color($product) {
        $color_attribute = $this->settings['color_attribute'] ?? 'pa_color';
        return $product->get_attribute($color_attribute);
    }

    /**
     * Update product embeddings
     */
    public function update_product_embeddings($product_id) {
        if (!$this->api_key) {
            return false;
        }

        $product = wc_get_product($product_id);
        if (!$product) {
            return false;
        }

        $product_data = $this->get_product_data($product);

        $response = $this->make_api_request(
            '/embeddings/update',
            'POST',
            array(
                'product' => $product_data,
            )
        );

        if (is_wp_error($response)) {
            $this->log_error('Error updating product embeddings: ' . $response->get_error_message());
            return false;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!$data || !isset($data['success'])) {
            return false;
        }

        // Clear cache for this product
        $this->clear_product_cache($product_id);

        return true;
    }

    /**
     * Track event
     */
    public function track_event($event_type, $product_id, $user_id = null) {
        if (!$this->api_key) {
            return false;
        }

        if (!$user_id && is_user_logged_in()) {
            $user_id = get_current_user_id();
        }

        $response = $this->make_api_request(
            '/events',
            'POST',
            array(
                'event_type' => $event_type,
                'product_id' => $product_id,
                'user_id' => $user_id,
                'timestamp' => current_time('mysql'),
            )
        );

        if (is_wp_error($response)) {
            $this->log_error('Error tracking event: ' . $response->get_error_message());
            return false;
        }

        return true;
    }

    /**
     * Get style score for a product
     */
    public function get_style_score($product_id) {
        if (!$this->api_key) {
            return 0;
        }

        $product = wc_get_product($product_id);
        if (!$product) {
            return 0;
        }

        // Check cache first
        $cache_key = 'varai_style_score_' . $product_id;
        $cached_data = $this->get_cache($cache_key);
        if ($cached_data !== false) {
            return $cached_data;
        }

        $product_data = $this->get_product_data($product);

        $response = $this->make_api_request(
            '/style/score',
            'POST',
            array(
                'product' => $product_data,
            )
        );

        if (is_wp_error($response)) {
            $this->log_error('Error getting style score: ' . $response->get_error_message());
            return 0;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!$data || !isset($data['score'])) {
            return 0;
        }

        $score = intval($data['score']);
        
        // Cache the result
        $this->set_cache($cache_key, $score);
        
        // Update product meta
        update_post_meta($product_id, '_varai_style_score', $score);

        return $score;
    }

    /**
     * Make API request with error handling
     */
    private function make_api_request($endpoint, $method = 'GET', $data = array(), $timeout = 15) {
        $url = $this->api_url . $endpoint;
        
        $args = array(
            'method' => $method,
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json',
                'User-Agent' => 'VARAi WooCommerce Plugin/' . VARAI_VERSION,
            ),
            'timeout' => $timeout,
        );
        
        if (!empty($data) && in_array($method, array('POST', 'PUT'))) {
            $args['body'] = wp_json_encode($data);
        }
        
        // Add request logging
        $this->log_request($url, $method, $data);
        
        // Make the request
        $response = wp_remote_request($url, $args);
        
        // Handle errors
        if (is_wp_error($response)) {
            $this->log_error('API Request Error: ' . $response->get_error_message());
            return $response;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        
        // Log response for debugging
        $this->log_response($status_code, wp_remote_retrieve_body($response));
        
        // Handle error status codes
        if ($status_code >= 400) {
            $error_message = 'API Error: HTTP ' . $status_code;
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);
            
            if (isset($data['error']) && !empty($data['error'])) {
                $error_message .= ' - ' . $data['error'];
            }
            
            $this->log_error($error_message);
            return new WP_Error('api_error', $error_message, array('status' => $status_code));
        }
        
        return $response;
    }

    /**
     * Log API request for debugging
     */
    private function log_request($url, $method, $data) {
        if (empty($this->settings['enable_debug_logging'])) {
            return;
        }
        
        $log_message = sprintf(
            '[VARAi API Request] %s %s',
            $method,
            $url
        );
        
        if (!empty($data)) {
            $log_message .= ' - Data: ' . wp_json_encode($data);
        }
        
        error_log($log_message);
    }

    /**
     * Log API response for debugging
     */
    private function log_response($status_code, $body) {
        if (empty($this->settings['enable_debug_logging'])) {
            return;
        }
        
        $log_message = sprintf(
            '[VARAi API Response] Status: %d - Body: %s',
            $status_code,
            $body
        );
        
        error_log($log_message);
    }

    /**
     * Log error message
     */
    private function log_error($message) {
        error_log('[VARAi Error] ' . $message);
    }

    /**
     * Get cached data
     */
    private function get_cache($key) {
        $transient_key = 'varai_cache_' . md5($key);
        return get_transient($transient_key);
    }

    /**
     * Set cached data
     */
    private function set_cache($key, $data) {
        $transient_key = 'varai_cache_' . md5($key);
        set_transient($transient_key, $data, $this->cache_expiration);
    }

    /**
     * Clear cache for a specific product
     */
    private function clear_product_cache($product_id) {
        global $wpdb;
        
        $like = $wpdb->esc_like('varai_cache_') . '%';
        $keys = $wpdb->get_col($wpdb->prepare(
            "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s AND option_value LIKE %s",
            $like,
            '%' . $wpdb->esc_like('"id":' . $product_id) . '%'
        ));
        
        foreach ($keys as $key) {
            $transient_key = str_replace('_transient_', '', $key);
            delete_transient($transient_key);
        }
    }

    /**
     * Clear all VARAi cache
     */
    public function clear_all_cache() {
        global $wpdb;
        
        $like = $wpdb->esc_like('varai_cache_') . '%';
        $wpdb->query($wpdb->prepare(
            "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
            '_transient_' . $like,
            '_transient_timeout_' . $like
        ));
        
        return true;
    }
}