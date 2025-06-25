<?php
/**
 * EyewearML Reporting Class
 *
 * Handles integration with the platform-agnostic reporting module
 */

if (!defined('ABSPATH')) {
    exit;
}

class EyewearML_Reporting {
    /**
     * Constructor
     */
    public function __construct() {
        // Add reporting submenu
        add_action('admin_menu', array($this, 'add_reporting_submenu'), 20);
        
        // Enqueue scripts and styles
        add_action('admin_enqueue_scripts', array($this, 'enqueue_reporting_assets'));
        
        // AJAX handlers
        add_action('wp_ajax_eyewearml_get_report_data', array($this, 'ajax_get_report_data'));
        add_action('wp_ajax_eyewearml_save_report_config', array($this, 'ajax_save_report_config'));
        add_action('wp_ajax_eyewearml_get_report_templates', array($this, 'ajax_get_report_templates'));
    }
    
    /**
     * Add reporting submenu
     */
    public function add_reporting_submenu() {
        add_submenu_page(
            'eyewearml',
            __('Reports', 'eyewearml'),
            __('Reports', 'eyewearml'),
            'manage_options',
            'eyewearml-reports',
            array($this, 'render_reports_page')
        );
    }
    
    /**
     * Enqueue reporting assets
     */
    public function enqueue_reporting_assets($hook) {
        if ('eyewearml_page_eyewearml-reports' !== $hook) {
            return;
        }
        
        // Enqueue React and other dependencies
        wp_enqueue_script('react', 'https://unpkg.com/react@17/umd/react.production.min.js', array(), '17.0.0', true);
        wp_enqueue_script('react-dom', 'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js', array('react'), '17.0.0', true);
        
        // Enqueue Chart.js
        wp_enqueue_script('chartjs', 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js', array(), '3.7.1', true);
        
        // Enqueue our reporting scripts
        wp_enqueue_script(
            'eyewearml-reporting',
            EYEWEARML_PLUGIN_URL . 'assets/js/reporting.js',
            array('jquery', 'react', 'react-dom', 'chartjs'),
            EYEWEARML_VERSION,
            true
        );
        
        // Enqueue our reporting styles
        wp_enqueue_style(
            'eyewearml-reporting',
            EYEWEARML_PLUGIN_URL . 'assets/css/reporting.css',
            array(),
            EYEWEARML_VERSION
        );
        
        // Localize script with data
        wp_localize_script('eyewearml-reporting', 'eyewearml_reporting', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('eyewearml-reporting'),
            'platform' => 'WooCommerce',
            'api_key' => get_option('eyewearml_settings')['api_key'],
            'store_url' => get_site_url()
        ));
    }
    
    /**
     * Render reports page
     */
    public function render_reports_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('EyewearML Reports', 'eyewearml'); ?></h1>
            <div id="eyewearml-report-builder"></div>
        </div>
        <?php
    }
    
    /**
     * AJAX handler for getting report data
     */
    public function ajax_get_report_data() {
        check_ajax_referer('eyewearml-reporting', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permission denied');
        }
        
        $report_config = isset($_POST['report_config']) ? json_decode(stripslashes($_POST['report_config']), true) : null;
        if (!$report_config) {
            wp_send_json_error('Invalid report configuration');
        }
        
        // Get API key from settings
        $settings = get_option('eyewearml_settings');
        $api_key = isset($settings['api_key']) ? $settings['api_key'] : '';
        
        if (empty($api_key)) {
            wp_send_json_error('API key not configured');
        }
        
        // Make API request to get report data
        $api_url = 'https://api.eyewearml.com/v1/reports/generate';
        $response = wp_remote_post($api_url, array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $api_key
            ),
            'body' => json_encode(array(
                'platform' => 'WooCommerce',
                'store_url' => get_site_url(),
                'report_config' => $report_config
            )),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        wp_send_json_success($data);
    }
    
    /**
     * AJAX handler for saving report configuration
     */
    public function ajax_save_report_config() {
        check_ajax_referer('eyewearml-reporting', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permission denied');
        }
        
        $report_config = isset($_POST['report_config']) ? json_decode(stripslashes($_POST['report_config']), true) : null;
        if (!$report_config) {
            wp_send_json_error('Invalid report configuration');
        }
        
        // Get API key from settings
        $settings = get_option('eyewearml_settings');
        $api_key = isset($settings['api_key']) ? $settings['api_key'] : '';
        
        if (empty($api_key)) {
            wp_send_json_error('API key not configured');
        }
        
        // Make API request to save report configuration
        $api_url = 'https://api.eyewearml.com/v1/reports/configurations';
        $response = wp_remote_post($api_url, array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $api_key
            ),
            'body' => json_encode(array(
                'platform' => 'WooCommerce',
                'store_url' => get_site_url(),
                'report_config' => $report_config
            )),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        wp_send_json_success($data);
    }
    
    /**
     * AJAX handler for getting report templates
     */
    public function ajax_get_report_templates() {
        check_ajax_referer('eyewearml-reporting', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permission denied');
        }
        
        // Get API key from settings
        $settings = get_option('eyewearml_settings');
        $api_key = isset($settings['api_key']) ? $settings['api_key'] : '';
        
        if (empty($api_key)) {
            wp_send_json_error('API key not configured');
        }
        
        // Make API request to get report templates
        $api_url = 'https://api.eyewearml.com/v1/reports/templates';
        $response = wp_remote_get($api_url, array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $api_key
            ),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        wp_send_json_success($data);
    }
}

// Initialize reporting
$eyewearml_reporting = new EyewearML_Reporting();