<?php
/**
 * VARAi Settings
 */

if (!defined('ABSPATH')) {
    exit;
}

class VARAi_Settings {
    private $settings;
    private $defaults;

    /**
     * Constructor
     */
    public function __construct() {
        $this->defaults = array(
            'api_key' => '',
            'api_url' => 'https://api.varai.ai/v1',
            'enable_virtual_try_on' => 'yes',
            'enable_recommendations' => 'yes',
            'recommendations_limit' => 4,
            'brand_attribute' => 'pa_brand',
            'style_attribute' => 'pa_style',
            'material_attribute' => 'pa_material',
            'color_attribute' => 'pa_color',
            'enable_analytics' => 'yes',
            'ga4_measurement_id' => '',
            'cache_expiration' => 3600,
            'enable_debug_logging' => 'no',
            'webhook_secret' => '',
        );

        $this->settings = get_option('varai_settings', $this->defaults);

        add_action('admin_init', array($this, 'register_settings'));
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting(
            'varai_settings',
            'varai_settings',
            array($this, 'sanitize_settings')
        );

        // API Settings
        add_settings_section(
            'varai_api_settings',
            __('API Settings', 'varai'),
            array($this, 'render_api_settings_section'),
            'varai_settings'
        );

        add_settings_field(
            'api_key',
            __('API Key', 'varai'),
            array($this, 'render_text_field'),
            'varai_settings',
            'varai_api_settings',
            array('id' => 'api_key')
        );

        add_settings_field(
            'api_url',
            __('API URL', 'varai'),
            array($this, 'render_text_field'),
            'varai_settings',
            'varai_api_settings',
            array('id' => 'api_url')
        );

        add_settings_field(
            'webhook_secret',
            __('Webhook Secret', 'varai'),
            array($this, 'render_text_field'),
            'varai_settings',
            'varai_api_settings',
            array(
                'id' => 'webhook_secret',
                'description' => __('Used to verify incoming webhook requests from VARAi', 'varai')
            )
        );

        // Feature Settings
        add_settings_section(
            'varai_feature_settings',
            __('Feature Settings', 'varai'),
            array($this, 'render_feature_settings_section'),
            'varai_settings'
        );

        add_settings_field(
            'enable_virtual_try_on',
            __('Enable Virtual Try-On', 'varai'),
            array($this, 'render_checkbox_field'),
            'varai_settings',
            'varai_feature_settings',
            array('id' => 'enable_virtual_try_on')
        );

        add_settings_field(
            'enable_recommendations',
            __('Enable Recommendations', 'varai'),
            array($this, 'render_checkbox_field'),
            'varai_settings',
            'varai_feature_settings',
            array('id' => 'enable_recommendations')
        );

        add_settings_field(
            'recommendations_limit',
            __('Number of Recommendations', 'varai'),
            array($this, 'render_number_field'),
            'varai_settings',
            'varai_feature_settings',
            array('id' => 'recommendations_limit', 'min' => 1, 'max' => 12)
        );

        // Product Attributes
        add_settings_section(
            'varai_attribute_settings',
            __('Product Attributes', 'varai'),
            array($this, 'render_attribute_settings_section'),
            'varai_settings'
        );

        add_settings_field(
            'brand_attribute',
            __('Brand Attribute', 'varai'),
            array($this, 'render_attribute_field'),
            'varai_settings',
            'varai_attribute_settings',
            array('id' => 'brand_attribute')
        );

        add_settings_field(
            'style_attribute',
            __('Style Attribute', 'varai'),
            array($this, 'render_attribute_field'),
            'varai_settings',
            'varai_attribute_settings',
            array('id' => 'style_attribute')
        );

        add_settings_field(
            'material_attribute',
            __('Material Attribute', 'varai'),
            array($this, 'render_attribute_field'),
            'varai_settings',
            'varai_attribute_settings',
            array('id' => 'material_attribute')
        );

        add_settings_field(
            'color_attribute',
            __('Color Attribute', 'varai'),
            array($this, 'render_attribute_field'),
            'varai_settings',
            'varai_attribute_settings',
            array('id' => 'color_attribute')
        );

        // Analytics Settings
        add_settings_section(
            'varai_analytics_settings',
            __('Analytics Settings', 'varai'),
            array($this, 'render_analytics_settings_section'),
            'varai_settings'
        );

        add_settings_field(
            'enable_analytics',
            __('Enable Analytics', 'varai'),
            array($this, 'render_checkbox_field'),
            'varai_settings',
            'varai_analytics_settings',
            array('id' => 'enable_analytics')
        );

        add_settings_field(
            'ga4_measurement_id',
            __('GA4 Measurement ID', 'varai'),
            array($this, 'render_text_field'),
            'varai_settings',
            'varai_analytics_settings',
            array('id' => 'ga4_measurement_id')
        );
        
        // Performance Settings
        add_settings_section(
            'varai_performance_settings',
            __('Performance Settings', 'varai'),
            array($this, 'render_performance_settings_section'),
            'varai_settings'
        );
        
        add_settings_field(
            'cache_expiration',
            __('Cache Expiration (seconds)', 'varai'),
            array($this, 'render_number_field'),
            'varai_settings',
            'varai_performance_settings',
            array(
                'id' => 'cache_expiration',
                'min' => 60,
                'max' => 86400,
                'description' => __('How long to cache API responses. Default: 3600 (1 hour)', 'varai')
            )
        );
        
        add_settings_field(
            'enable_debug_logging',
            __('Enable Debug Logging', 'varai'),
            array($this, 'render_checkbox_field'),
            'varai_settings',
            'varai_performance_settings',
            array(
                'id' => 'enable_debug_logging',
                'description' => __('Log API requests and responses for troubleshooting', 'varai')
            )
        );
        
        add_settings_field(
            'clear_cache',
            __('Clear Cache', 'varai'),
            array($this, 'render_button_field'),
            'varai_settings',
            'varai_performance_settings',
            array(
                'id' => 'clear_cache',
                'button_text' => __('Clear Cache', 'varai'),
                'description' => __('Clear all cached API responses', 'varai')
            )
        );
    }

    /**
     * Sanitize settings
     */
    public function sanitize_settings($input) {
        $sanitized = array();

        foreach ($this->defaults as $key => $default) {
            if (isset($input[$key])) {
                switch ($key) {
                    case 'api_key':
                    case 'api_url':
                    case 'ga4_measurement_id':
                    case 'webhook_secret':
                        $sanitized[$key] = sanitize_text_field($input[$key]);
                        break;
                    case 'recommendations_limit':
                    case 'cache_expiration':
                        $sanitized[$key] = absint($input[$key]);
                        break;
                    case 'enable_virtual_try_on':
                    case 'enable_recommendations':
                    case 'enable_analytics':
                    case 'enable_debug_logging':
                        $sanitized[$key] = wc_bool_to_string($input[$key]);
                        break;
                    default:
                        $sanitized[$key] = sanitize_text_field($input[$key]);
                }
            } else {
                $sanitized[$key] = $default;
            }
        }
        
        // Handle cache clearing
        if (isset($input['clear_cache']) && $input['clear_cache'] === 'yes') {
            $api = new VARAi_API();
            $api->clear_all_cache();
            add_settings_error(
                'varai_settings',
                'cache_cleared',
                __('Cache cleared successfully', 'varai'),
                'updated'
            );
        }

        return $sanitized;
    }

    /**
     * Render settings sections
     */
    public function render_api_settings_section() {
        echo '<p>' . __('Configure your VARAi API settings.', 'varai') . '</p>';
    }

    public function render_feature_settings_section() {
        echo '<p>' . __('Enable or disable VARAi features.', 'varai') . '</p>';
    }

    public function render_attribute_settings_section() {
        echo '<p>' . __('Map your product attributes to VARAi fields.', 'varai') . '</p>';
    }

    public function render_analytics_settings_section() {
        echo '<p>' . __('Configure analytics tracking settings.', 'varai') . '</p>';
    }
    
    public function render_performance_settings_section() {
        echo '<p>' . __('Configure performance and debugging settings.', 'varai') . '</p>';
    }

    /**
     * Render field types
     */
    public function render_text_field($args) {
        $id = $args['id'];
        $value = isset($this->settings[$id]) ? $this->settings[$id] : '';
        $description = isset($args['description']) ? $args['description'] : '';
        ?>
        <input type="text" 
               id="varai_<?php echo esc_attr($id); ?>" 
               name="varai_settings[<?php echo esc_attr($id); ?>]" 
               value="<?php echo esc_attr($value); ?>" 
               class="regular-text">
        <?php if ($description) : ?>
            <p class="description"><?php echo esc_html($description); ?></p>
        <?php endif; ?>
        <?php
    }

    public function render_checkbox_field($args) {
        $id = $args['id'];
        $value = isset($this->settings[$id]) ? $this->settings[$id] : 'no';
        $description = isset($args['description']) ? $args['description'] : '';
        ?>
        <label>
            <input type="checkbox" 
                   id="varai_<?php echo esc_attr($id); ?>" 
                   name="varai_settings[<?php echo esc_attr($id); ?>]" 
                   value="yes" 
                   <?php checked($value, 'yes'); ?>>
            <?php _e('Enable', 'varai'); ?>
        </label>
        <?php if ($description) : ?>
            <p class="description"><?php echo esc_html($description); ?></p>
        <?php endif; ?>
        <?php
    }

    public function render_number_field($args) {
        $id = $args['id'];
        $value = isset($this->settings[$id]) ? $this->settings[$id] : '';
        $min = isset($args['min']) ? $args['min'] : 0;
        $max = isset($args['max']) ? $args['max'] : 100;
        $description = isset($args['description']) ? $args['description'] : '';
        ?>
        <input type="number" 
               id="varai_<?php echo esc_attr($id); ?>" 
               name="varai_settings[<?php echo esc_attr($id); ?>]" 
               value="<?php echo esc_attr($value); ?>" 
               min="<?php echo esc_attr($min); ?>" 
               max="<?php echo esc_attr($max); ?>" 
               class="small-text">
        <?php if ($description) : ?>
            <p class="description"><?php echo esc_html($description); ?></p>
        <?php endif; ?>
        <?php
    }

    public function render_attribute_field($args) {
        $id = $args['id'];
        $value = isset($this->settings[$id]) ? $this->settings[$id] : '';
        $attributes = wc_get_attribute_taxonomies();
        ?>
        <select id="varai_<?php echo esc_attr($id); ?>" 
                name="varai_settings[<?php echo esc_attr($id); ?>]">
            <option value=""><?php _e('Select an attribute', 'varai'); ?></option>
            <?php foreach ($attributes as $attribute) : ?>
                <option value="pa_<?php echo esc_attr($attribute->attribute_name); ?>" 
                        <?php selected($value, 'pa_' . $attribute->attribute_name); ?>>
                    <?php echo esc_html($attribute->attribute_label); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <?php
    }
    
    public function render_button_field($args) {
        $id = $args['id'];
        $button_text = isset($args['button_text']) ? $args['button_text'] : __('Submit', 'varai');
        $description = isset($args['description']) ? $args['description'] : '';
        ?>
        <button type="button" 
                id="varai_<?php echo esc_attr($id); ?>_button" 
                class="button button-secondary" 
                data-action="<?php echo esc_attr($id); ?>">
            <?php echo esc_html($button_text); ?>
        </button>
        <input type="hidden" 
               id="varai_<?php echo esc_attr($id); ?>" 
               name="varai_settings[<?php echo esc_attr($id); ?>]" 
               value="no">
        <?php if ($description) : ?>
            <p class="description"><?php echo esc_html($description); ?></p>
        <?php endif; ?>
        <script>
            jQuery(document).ready(function($) {
                $('#varai_<?php echo esc_attr($id); ?>_button').on('click', function() {
                    $('#varai_<?php echo esc_attr($id); ?>').val('yes');
                    $(this).closest('form').submit();
                });
            });
        </script>
        <?php
    }

    /**
     * Get setting value
     */
    public function get_setting($key) {
        return isset($this->settings[$key]) ? $this->settings[$key] : $this->defaults[$key];
    }
}