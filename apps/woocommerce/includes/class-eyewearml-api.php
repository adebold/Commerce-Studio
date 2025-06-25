<?php
/**
 * EyewearML API Integration
 */

if (!defined('ABSPATH')) {
    exit;
}

class EyewearML_API {
    private $api_key;
    private $api_url;
    private $settings;

    /**
     * Constructor
     */
    public function __construct() {
        $this->settings = get_option('eyewearml_settings', array());
        $this->api_key = !empty($this->settings['api_key']) ? $this->settings['api_key'] : '';
        $this->api_url = !empty($this->settings['api_url']) ? $this->settings['api_url'] : 'https://api.eyewearml.com/v1';
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

        // Get product data
        $product_data = $this->get_product_data($product);

        // Make API request
        $response = wp_remote_post(
            $this->api_url . '/recommendations',
            array(
                'headers' => array(
                    'Authorization' => 'Bearer ' . $this->api_key,
                    'Content-Type' => 'application/json',
                ),
                'body' => wp_json_encode(array(
                    'product' => $product_data,
                    'limit' => $limit,
                )),
                'timeout' => 15,
            )
        );

        if (is_wp_error($response)) {
            error_log('EyewearML API Error: ' . $response->get_error_message());
            return array();
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!$data || !isset($data['recommendations'])) {
            return array();
        }

        return $this->format_recommendations($data['recommendations']);
    }

    /**
     * Get product data for API
     */
    private function get_product_data($product) {
        $image_id = $product->get_image_id();
        $image_url = wp_get_attachment_image_url($image_id, 'full');

        return array(
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'brand' => $this->get_product_brand($product),
            'style' => $this->get_product_style($product),
            'material' => $this->get_product_material($product),
            'color' => $this->get_product_color($product),
            'price' => $product->get_price(),
            'image_url' => $image_url,
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

        $response = wp_remote_post(
            $this->api_url . '/embeddings/update',
            array(
                'headers' => array(
                    'Authorization' => 'Bearer ' . $this->api_key,
                    'Content-Type' => 'application/json',
                ),
                'body' => wp_json_encode(array(
                    'product' => $product_data,
                )),
                'timeout' => 30,
            )
        );

        if (is_wp_error($response)) {
            error_log('EyewearML API Error: ' . $response->get_error_message());
            return false;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!$data || !isset($data['success'])) {
            return false;
        }

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

        $response = wp_remote_post(
            $this->api_url . '/events',
            array(
                'headers' => array(
                    'Authorization' => 'Bearer ' . $this->api_key,
                    'Content-Type' => 'application/json',
                ),
                'body' => wp_json_encode(array(
                    'event_type' => $event_type,
                    'product_id' => $product_id,
                    'user_id' => $user_id,
                    'timestamp' => current_time('mysql'),
                )),
                'timeout' => 5,
            )
        );

        if (is_wp_error($response)) {
            error_log('EyewearML API Error: ' . $response->get_error_message());
            return false;
        }

        return true;
    }
}
