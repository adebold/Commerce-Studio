<?php
/**
 * VARAi Analytics
 */

if (!defined('ABSPATH')) {
    exit;
}

class VARAi_Analytics {
    private $settings;
    private $ga4_enabled;
    private $measurement_id;

    /**
     * Constructor
     */
    public function __construct() {
        $this->settings = get_option('varai_settings', array());
        $this->ga4_enabled = isset($this->settings['enable_analytics']) && $this->settings['enable_analytics'] === 'yes';
        $this->measurement_id = isset($this->settings['ga4_measurement_id']) ? $this->settings['ga4_measurement_id'] : '';

        if ($this->ga4_enabled && $this->measurement_id) {
            add_action('wp_head', array($this, 'add_ga4_tracking_code'));
            add_action('wp_enqueue_scripts', array($this, 'enqueue_analytics_scripts'));
            
            // Add enhanced ecommerce tracking
            add_action('woocommerce_thankyou', array($this, 'track_purchase'));
            add_action('woocommerce_add_to_cart', array($this, 'track_add_to_cart'), 10, 6);
            add_action('woocommerce_before_checkout_form', array($this, 'track_begin_checkout'));
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
                'varai-analytics',
                VARAI_PLUGIN_URL . 'assets/js/analytics.js',
                array('jquery'),
                VARAI_VERSION,
                true
            );

            wp_localize_script('varai-analytics', 'varai_analytics', array(
                'ga4_enabled' => $this->ga4_enabled,
                'measurement_id' => $this->measurement_id,
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('varai-analytics'),
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

        // Track in VARAi API
        $api = new VARAi_API();
        $api->track_event($event_type, $product_id, $user_id);
        
        // Log the event
        $this->log_event($event_type, $product_id, $event_data);
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
            'style_score' => get_post_meta($product_id, '_varai_style_score', true),
        );

        $this->send_ga4_event($event_data);
        
        // Log the event
        $this->log_event('view_recommendation', $product_id, $event_data);
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
            'style_score' => get_post_meta($product_id, '_varai_style_score', true),
        );

        $this->send_ga4_event($event_data);
        
        // Log the event
        $this->log_event('select_recommendation', $product_id, $event_data);
    }
    
    /**
     * Track purchase
     */
    public function track_purchase($order_id) {
        if (!$this->ga4_enabled || !$this->measurement_id) {
            return;
        }
        
        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }
        
        $items = array();
        $has_varai_product = false;
        
        foreach ($order->get_items() as $item) {
            $product_id = $item->get_product_id();
            $product = wc_get_product($product_id);
            
            if (!$product) {
                continue;
            }
            
            // Check if this is a VARAi-enabled product
            $is_varai_product = get_post_meta($product_id, '_varai_enable_try_on', true) === 'yes';
            if ($is_varai_product) {
                $has_varai_product = true;
            }
            
            $items[] = array(
                'item_id' => $product_id,
                'item_name' => $product->get_name(),
                'item_brand' => $this->get_product_brand($product),
                'item_category' => 'Eyewear',
                'price' => (float) $product->get_price(),
                'quantity' => $item->get_quantity(),
                'is_varai_product' => $is_varai_product,
                'style_score' => get_post_meta($product_id, '_varai_style_score', true),
            );
        }
        
        // Only track if at least one VARAi product was purchased
        if (!$has_varai_product) {
            return;
        }
        
        $event_data = array(
            'event_name' => 'purchase',
            'transaction_id' => $order->get_order_number(),
            'value' => (float) $order->get_total(),
            'tax' => (float) $order->get_total_tax(),
            'shipping' => (float) $order->get_shipping_total(),
            'currency' => $order->get_currency(),
            'items' => $items,
        );
        
        $this->send_ga4_event($event_data);
        
        // Track in VARAi API
        $api = new VARAi_API();
        foreach ($items as $item) {
            if ($item['is_varai_product']) {
                $api->track_event('purchase', $item['item_id'], $order->get_customer_id());
            }
        }
        
        // Log the event
        $this->log_event('purchase', $order_id, $event_data);
    }
    
    /**
     * Track add to cart
     */
    public function track_add_to_cart($cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item_data) {
        if (!$this->ga4_enabled || !$this->measurement_id) {
            return;
        }
        
        $actual_product_id = $variation_id ? $variation_id : $product_id;
        $product = wc_get_product($actual_product_id);
        
        if (!$product) {
            return;
        }
        
        // Check if this is a VARAi-enabled product
        $is_varai_product = get_post_meta($product_id, '_varai_enable_try_on', true) === 'yes';
        if (!$is_varai_product) {
            return;
        }
        
        $event_data = array(
            'event_name' => 'add_to_cart',
            'currency' => get_woocommerce_currency(),
            'value' => (float) $product->get_price() * $quantity,
            'items' => array(
                array(
                    'item_id' => $actual_product_id,
                    'item_name' => $product->get_name(),
                    'item_brand' => $this->get_product_brand($product),
                    'item_category' => 'Eyewear',
                    'price' => (float) $product->get_price(),
                    'quantity' => $quantity,
                    'style_score' => get_post_meta($product_id, '_varai_style_score', true),
                )
            ),
        );
        
        $this->send_ga4_event($event_data);
        
        // Track in VARAi API
        $api = new VARAi_API();
        $api->track_event('add_to_cart', $actual_product_id);
        
        // Log the event
        $this->log_event('add_to_cart', $actual_product_id, $event_data);
    }
    
    /**
     * Track begin checkout
     */
    public function track_begin_checkout() {
        if (!$this->ga4_enabled || !$this->measurement_id) {
            return;
        }
        
        $cart = WC()->cart;
        if (!$cart || $cart->is_empty()) {
            return;
        }
        
        $items = array();
        $has_varai_product = false;
        
        foreach ($cart->get_cart() as $cart_item) {
            $product_id = $cart_item['product_id'];
            $product = wc_get_product($cart_item['data']);
            
            if (!$product) {
                continue;
            }
            
            // Check if this is a VARAi-enabled product
            $is_varai_product = get_post_meta($product_id, '_varai_enable_try_on', true) === 'yes';
            if ($is_varai_product) {
                $has_varai_product = true;
            }
            
            $items[] = array(
                'item_id' => $product->get_id(),
                'item_name' => $product->get_name(),
                'item_brand' => $this->get_product_brand($product),
                'item_category' => 'Eyewear',
                'price' => (float) $product->get_price(),
                'quantity' => $cart_item['quantity'],
                'style_score' => get_post_meta($product_id, '_varai_style_score', true),
            );
        }
        
        // Only track if at least one VARAi product is in the cart
        if (!$has_varai_product) {
            return;
        }
        
        $event_data = array(
            'event_name' => 'begin_checkout',
            'currency' => get_woocommerce_currency(),
            'value' => (float) $cart->get_cart_contents_total(),
            'items' => $items,
        );
        
        $this->send_ga4_event($event_data);
        
        // Track in VARAi API
        $api = new VARAi_API();
        foreach ($items as $item) {
            $api->track_event('begin_checkout', $item['item_id']);
        }
        
        // Log the event
        $this->log_event('begin_checkout', 0, $event_data);
    }
    
    /**
     * Log event for analytics dashboard
     */
    private function log_event($event_type, $product_id, $event_data) {
        // Get existing logs
        $logs = get_option('varai_analytics_logs', array());
        
        // Add new log entry
        $logs[] = array(
            'timestamp' => current_time('mysql'),
            'event_type' => $event_type,
            'product_id' => $product_id,
            'user_id' => is_user_logged_in() ? get_current_user_id() : 0,
            'data' => $event_data,
        );
        
        // Keep only the last 1000 events
        if (count($logs) > 1000) {
            $logs = array_slice($logs, -1000);
        }
        
        // Save logs
        update_option('varai_analytics_logs', $logs);
    }
    
    /**
     * Get analytics data for dashboard
     */
    public function get_analytics_data($days = 30) {
        $logs = get_option('varai_analytics_logs', array());
        $start_date = date('Y-m-d H:i:s', strtotime("-{$days} days"));
        
        // Filter logs by date
        $filtered_logs = array_filter($logs, function($log) use ($start_date) {
            return $log['timestamp'] >= $start_date;
        });
        
        // Count events by type
        $event_counts = array();
        foreach ($filtered_logs as $log) {
            $event_type = $log['event_type'];
            if (!isset($event_counts[$event_type])) {
                $event_counts[$event_type] = 0;
            }
            $event_counts[$event_type]++;
        }
        
        // Get top products
        $product_counts = array();
        foreach ($filtered_logs as $log) {
            $product_id = $log['product_id'];
            if ($product_id > 0) {
                if (!isset($product_counts[$product_id])) {
                    $product_counts[$product_id] = 0;
                }
                $product_counts[$product_id]++;
            }
        }
        
        // Sort products by count
        arsort($product_counts);
        
        // Get top 10 products
        $top_products = array();
        $count = 0;
        foreach ($product_counts as $product_id => $count) {
            $product = wc_get_product($product_id);
            if ($product) {
                $top_products[] = array(
                    'id' => $product_id,
                    'name' => $product->get_name(),
                    'count' => $count,
                );
            }
            
            if (++$count >= 10) {
                break;
            }
        }
        
        return array(
            'event_counts' => $event_counts,
            'top_products' => $top_products,
            'total_events' => count($filtered_logs),
            'days' => $days,
        );
    }
}