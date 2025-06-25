<?php
/**
 * EyewearML Analytics
 */

if (!defined('ABSPATH')) {
    exit;
}

class EyewearML_Analytics {
    private $settings;
    private $ga4_enabled;
    private $measurement_id;

    /**
     * Constructor
     */
    public function __construct() {
        $this->settings = get_option('eyewearml_settings', array());
        $this->ga4_enabled = isset($this->settings['enable_analytics']) && $this->settings['enable_analytics'] === 'yes';
        $this->measurement_id = isset($this->settings['ga4_measurement_id']) ? $this->settings['ga4_measurement_id'] : '';

        if ($this->ga4_enabled && $this->measurement_id) {
            add_action('wp_head', array($this, 'add_ga4_tracking_code'));
            add_action('wp_enqueue_scripts', array($this, 'enqueue_analytics_scripts'));
        }
    }

    /**
     * Add GA4 tracking code
     */
    public function add_ga4_tracking_code() {
        ?>
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr($this->measurement_id); ?>"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '<?php echo esc_attr($this->measurement_id); ?>');
        </script>
        <?php
    }

    /**
     * Enqueue analytics scripts
     */
    public function enqueue_analytics_scripts() {
        if (is_product()) {
            wp_enqueue_script(
                'eyewearml-analytics',
                EYEWEARML_PLUGIN_URL . 'assets/js/analytics.js',
                array('jquery'),
                EYEWEARML_VERSION,
                true
            );

            wp_localize_script('eyewearml-analytics', 'eyewearml_analytics', array(
                'ga4_enabled' => $this->ga4_enabled,
                'measurement_id' => $this->measurement_id,
            ));
        }
    }

    /**
     * Track event
     */
    public function track_event($event_type, $product_id, $user_id = null) {
        if (!$this->ga4_enabled || !$this->measurement_id) {
            return;
        }

        $product = wc_get_product($product_id);
        if (!$product) {
            return;
        }

        $event_data = $this->get_event_data($event_type, $product);
        $this->send_ga4_event($event_data);

        // Track in EyewearML API
        $api = new EyewearML_API();
        $api->track_event($event_type, $product_id, $user_id);
    }

    /**
     * Get event data
     */
    private function get_event_data($event_type, $product) {
        $data = array(
            'currency' => get_woocommerce_currency(),
            'value' => (float) $product->get_price(),
            'items' => array(
                array(
                    'item_id' => $product->get_id(),
                    'item_name' => $product->get_name(),
                    'item_brand' => $this->get_product_brand($product),
                    'item_category' => 'Eyewear',
                    'price' => (float) $product->get_price(),
                )
            )
        );

        switch ($event_type) {
            case 'view_item':
                return array_merge($data, array(
                    'event_name' => 'view_item',
                ));

            case 'try_on':
                return array_merge($data, array(
                    'event_name' => 'try_on_virtual',
                    'success' => true,
                ));

            case 'add_to_cart':
                return array_merge($data, array(
                    'event_name' => 'add_to_cart',
                ));

            case 'begin_checkout':
                return array_merge($data, array(
                    'event_name' => 'begin_checkout',
                ));

            case 'purchase':
                return array_merge($data, array(
                    'event_name' => 'purchase',
                    'transaction_id' => uniqid('tr_'),
                ));

            default:
                return array_merge($data, array(
                    'event_name' => $event_type,
                ));
        }
    }

    /**
     * Send GA4 event
     */
    private function send_ga4_event($event_data) {
        ?>
        <script>
            gtag('event', '<?php echo esc_js($event_data['event_name']); ?>', <?php echo wp_json_encode($event_data); ?>);
        </script>
        <?php
    }

    /**
     * Get product brand
     */
    private function get_product_brand($product) {
        if (function_exists('wc_brands_get_product_brands')) {
            $brands = wc_brands_get_product_brands($product->get_id());
            if (!empty($brands)) {
                return reset($brands)->name;
            }
        }

        $brand_attribute = isset($this->settings['brand_attribute']) ? $this->settings['brand_attribute'] : 'pa_brand';
        return $product->get_attribute($brand_attribute);
    }

    /**
     * Track recommendation impression
     */
    public function track_recommendation_impression($product_id, $recommendation_data) {
        if (!$this->ga4_enabled || !$this->measurement_id) {
            return;
        }

        $product = wc_get_product($product_id);
        if (!$product) {
            return;
        }

        $event_data = array(
            'event_name' => 'view_recommendation',
            'currency' => get_woocommerce_currency(),
            'value' => (float) $product->get_price(),
            'items' => array(
                array(
                    'item_id' => $product->get_id(),
                    'item_name' => $product->get_name(),
                    'item_brand' => $this->get_product_brand($product),
                    'item_category' => 'Eyewear',
                    'price' => (float) $product->get_price(),
                )
            ),
            'recommendation_type' => isset($recommendation_data['type']) ? $recommendation_data['type'] : 'similar_items',
            'recommendation_score' => isset($recommendation_data['score']) ? $recommendation_data['score'] : null,
        );

        $this->send_ga4_event($event_data);
    }

    /**
     * Track recommendation click
     */
    public function track_recommendation_click($product_id, $recommendation_data) {
        if (!$this->ga4_enabled || !$this->measurement_id) {
            return;
        }

        $product = wc_get_product($product_id);
        if (!$product) {
            return;
        }

        $event_data = array(
            'event_name' => 'select_recommendation',
            'currency' => get_woocommerce_currency(),
            'value' => (float) $product->get_price(),
            'items' => array(
                array(
                    'item_id' => $product->get_id(),
                    'item_name' => $product->get_name(),
                    'item_brand' => $this->get_product_brand($product),
                    'item_category' => 'Eyewear',
                    'price' => (float) $product->get_price(),
                )
            ),
            'recommendation_type' => isset($recommendation_data['type']) ? $recommendation_data['type'] : 'similar_items',
            'recommendation_score' => isset($recommendation_data['score']) ? $recommendation_data['score'] : null,
        );

        $this->send_ga4_event($event_data);
    }
}
