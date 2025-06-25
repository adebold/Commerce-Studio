<?php
/**
 * EyewearML Settings
 */

if (!defined('ABSPATH')) {
    exit;
}

class EyewearML_Settings {
    private $settings;
    private $defaults;

    /**
     * Constructor
     */
    public function __construct() {
        $this->defaults = array(
            'api_key' => '',
            'api_url' => 'https://api.eyewearml.com/v1',
            'enable_virtual_try_on' => 'yes',
            'enable_recommendations' => 'yes',
            'recommendations_limit' => 4,
            'brand_attribute' => 'pa_brand',
            'style_attribute' => 'pa_style',
            'material_attribute' => 'pa_material',
            'color_attribute' => 'pa_color',
            'enable_analytics' => 'yes',
            'ga4_measurement_id' => '',
        );

        $this->settings = get_option('eyewearml_settings', $this->defaults);

        add_action('admin_init', array($this, 'register_settings'));
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting(
            'eyewearml_settings',
            'eyewearml_settings',
            array($this, 'sanitize_settings')
        );

        // API Settings
        add_settings_section(
            'eyewearml_api_settings',
            __('API Settings', 'eyewearml'),
            array($this, 'render_api_settings_section'),
            'eyewearml_settings'
        );

        add_settings_field(
            'api_key',
            __('API Key', 'eyewearml'),
            array($this, 'render_text_field'),
            'eyewearml_settings',
            'eyewearml_api_settings',
            array('id' => 'api_key')
        );

        add_settings_field(
            'api_url',
            __('API URL', 'eyewearml'),
            array($this, 'render_text_field'),
            'eyewearml_settings',
            'eyewearml_api_settings',
            array('id' => 'api_url')
        );

        // Feature Settings
        add_settings_section(
            'eyewearml_feature_settings',
            __('Feature Settings', 'eyewearml'),
            array($this, 'render_feature_settings_section'),
            'eyewearml_settings'
        );

        add_settings_field(
            'enable_virtual_try_on',
            __('Enable Virtual Try-On', 'eyewearml'),
            array($this, 'render_checkbox_field'),
            'eyewearml_settings',
            'eyewearml_feature_settings',
            array('id' => 'enable_virtual_try_on')
        );

        add_settings_field(
            'enable_recommendations',
            __('Enable Recommendations', 'eyewearml'),
            array($this, 'render_checkbox_field'),
            'eyewearml_settings',
            'eyewearml_feature_settings',
            array('id' => 'enable_recommendations')
        );

        add_settings_field(
            'recommendations_limit',
            __('Number of Recommendations', 'eyewearml'),
            array($this, 'render_number_field'),
            'eyewearml_settings',
            'eyewearml_feature_settings',
            array('id' => 'recommendations_limit', 'min' => 1, 'max' => 12)
        );

        // Product Attributes
        add_settings_section(
            'eyewearml_attribute_settings',
            __('Product Attributes', 'eyewearml'),
            array($this, 'render_attribute_settings_section'),
            'eyewearml_settings'
        );

        add_settings_field(
            'brand_attribute',
            __('Brand Attribute', 'eyewearml'),
            array($this, 'render_attribute_field'),
            'eyewearml_settings',
            'eyewearml_attribute_settings',
            array('id' => 'brand_attribute')
        );

        add_settings_field(
            'style_attribute',
            __('Style Attribute', 'eyewearml'),
            array($this, 'render_attribute_field'),
            'eyewearml_settings',
            'eyewearml_attribute_settings',
            array('id' => 'style_attribute')
        );

        add_settings_field(
            'material_attribute',
            __('Material Attribute', 'eyewearml'),
            array($this, 'render_attribute_field'),
            'eyewearml_settings',
            'eyewearml_attribute_settings',
            array('id' => 'material_attribute')
        );

        add_settings_field(
            'color_attribute',
            __('Color Attribute', 'eyewearml'),
            array($this, 'render_attribute_field'),
            'eyewearml_settings',
            'eyewearml_attribute_settings',
            array('id' => 'color_attribute')
        );

        // Analytics Settings
        add_settings_section(
            'eyewearml_analytics_settings',
            __('Analytics Settings', 'eyewearml'),
            array($this, 'render_analytics_settings_section'),
            'eyewearml_settings'
        );

        add_settings_field(
            'enable_analytics',
            __('Enable Analytics', 'eyewearml'),
            array($this, 'render_checkbox_field'),
            'eyewearml_settings',
            'eyewearml_analytics_settings',
            array('id' => 'enable_analytics')
        );

        add_settings_field(
            'ga4_measurement_id',
            __('GA4 Measurement ID', 'eyewearml'),
            array($this, 'render_text_field'),
            'eyewearml_settings',
            'eyewearml_analytics_settings',
            array('id' => 'ga4_measurement_id')
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
                        $sanitized[$key] = sanitize_text_field($input[$key]);
                        break;
                    case 'recommendations_limit':
                        $sanitized[$key] = absint($input[$key]);
                        break;
                    case 'enable_virtual_try_on':
                    case 'enable_recommendations':
                    case 'enable_analytics':
                        $sanitized[$key] = wc_bool_to_string($input[$key]);
                        break;
                    default:
                        $sanitized[$key] = sanitize_text_field($input[$key]);
                }
            } else {
                $sanitized[$key] = $default;
            }
        }

        return $sanitized;
    }

    /**
     * Render settings sections
     */
    public function render_api_settings_section() {
        echo '<p>' . __('Configure your EyewearML API settings.', 'eyewearml') . '</p>';
    }

    public function render_feature_settings_section() {
        echo '<p>' . __('Enable or disable EyewearML features.', 'eyewearml') . '</p>';
    }

    public function render_attribute_settings_section() {
        echo '<p>' . __('Map your product attributes to EyewearML fields.', 'eyewearml') . '</p>';
    }

    public function render_analytics_settings_section() {
        echo '<p>' . __('Configure analytics tracking settings.', 'eyewearml') . '</p>';
    }

    /**
     * Render field types
     */
    public function render_text_field($args) {
        $id = $args['id'];
        $value = isset($this->settings[$id]) ? $this->settings[$id] : '';
        ?>
        <input type="text" 
               id="eyewearml_<?php echo esc_attr($id); ?>" 
               name="eyewearml_settings[<?php echo esc_attr($id); ?>]" 
               value="<?php echo esc_attr($value); ?>" 
               class="regular-text">
        <?php
    }

    public function render_checkbox_field($args) {
        $id = $args['id'];
        $value = isset($this->settings[$id]) ? $this->settings[$id] : 'no';
        ?>
        <label>
            <input type="checkbox" 
                   id="eyewearml_<?php echo esc_attr($id); ?>" 
                   name="eyewearml_settings[<?php echo esc_attr($id); ?>]" 
                   value="yes" 
                   <?php checked($value, 'yes'); ?>>
            <?php _e('Enable', 'eyewearml'); ?>
        </label>
        <?php
    }

    public function render_number_field($args) {
        $id = $args['id'];
        $value = isset($this->settings[$id]) ? $this->settings[$id] : '';
        $min = isset($args['min']) ? $args['min'] : 0;
        $max = isset($args['max']) ? $args['max'] : 100;
        ?>
        <input type="number" 
               id="eyewearml_<?php echo esc_attr($id); ?>" 
               name="eyewearml_settings[<?php echo esc_attr($id); ?>]" 
               value="<?php echo esc_attr($value); ?>" 
               min="<?php echo esc_attr($min); ?>" 
               max="<?php echo esc_attr($max); ?>" 
               class="small-text">
        <?php
    }

    public function render_attribute_field($args) {
        $id = $args['id'];
        $value = isset($this->settings[$id]) ? $this->settings[$id] : '';
        $attributes = wc_get_attribute_taxonomies();
        ?>
        <select id="eyewearml_<?php echo esc_attr($id); ?>" 
                name="eyewearml_settings[<?php echo esc_attr($id); ?>]">
            <option value=""><?php _e('Select an attribute', 'eyewearml'); ?></option>
            <?php foreach ($attributes as $attribute) : ?>
                <option value="pa_<?php echo esc_attr($attribute->attribute_name); ?>" 
                        <?php selected($value, 'pa_' . $attribute->attribute_name); ?>>
                    <?php echo esc_html($attribute->attribute_label); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <?php
    }

    /**
     * Get setting value
     */
    public function get_setting($key) {
        return isset($this->settings[$key]) ? $this->settings[$key] : $this->defaults[$key];
    }
}
