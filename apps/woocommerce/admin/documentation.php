<?php
/**
 * VARAi Documentation Page
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap varai-documentation">
    <h1><?php _e('VARAi for WooCommerce Documentation', 'varai'); ?></h1>
    
    <div class="varai-documentation-tabs">
        <nav class="nav-tab-wrapper">
            <a href="#getting-started" class="nav-tab nav-tab-active"><?php _e('Getting Started', 'varai'); ?></a>
            <a href="#features" class="nav-tab"><?php _e('Features', 'varai'); ?></a>
            <a href="#shortcodes" class="nav-tab"><?php _e('Shortcodes', 'varai'); ?></a>
            <a href="#api" class="nav-tab"><?php _e('API', 'varai'); ?></a>
            <a href="#troubleshooting" class="nav-tab"><?php _e('Troubleshooting', 'varai'); ?></a>
        </nav>
        
        <div class="tab-content">
            <!-- Getting Started Tab -->
            <div id="getting-started" class="tab-pane active">
                <h2><?php _e('Getting Started with VARAi', 'varai'); ?></h2>
                
                <div class="varai-card">
                    <h3><?php _e('1. Configure API Settings', 'varai'); ?></h3>
                    <p><?php _e('To get started with VARAi, you need to configure your API settings:', 'varai'); ?></p>
                    <ol>
                        <li><?php _e('Go to VARAi > Settings', 'varai'); ?></li>
                        <li><?php _e('Enter your API Key', 'varai'); ?></li>
                        <li><?php _e('Save changes', 'varai'); ?></li>
                    </ol>
                    <p><a href="<?php echo admin_url('admin.php?page=varai-settings'); ?>" class="button button-primary"><?php _e('Configure Settings', 'varai'); ?></a></p>
                </div>
                
                <div class="varai-card">
                    <h3><?php _e('2. Set Up Product Attributes', 'varai'); ?></h3>
                    <p><?php _e('VARAi uses product attributes to provide accurate recommendations:', 'varai'); ?></p>
                    <ul>
                        <li><?php _e('Brand Attribute: Used to identify the brand of the product', 'varai'); ?></li>
                        <li><?php _e('Style Attribute: Used to identify the style of the product', 'varai'); ?></li>
                        <li><?php _e('Material Attribute: Used to identify the material of the product', 'varai'); ?></li>
                        <li><?php _e('Color Attribute: Used to identify the color of the product', 'varai'); ?></li>
                    </ul>
                    <p><?php _e('Configure these in the Product Attributes section of the settings.', 'varai'); ?></p>
                </div>
                
                <div class="varai-card">
                    <h3><?php _e('3. Configure Products', 'varai'); ?></h3>
                    <p><?php _e('For each product you want to enhance with VARAi:', 'varai'); ?></p>
                    <ol>
                        <li><?php _e('Edit the product', 'varai'); ?></li>
                        <li><?php _e('Scroll down to the VARAi Settings section', 'varai'); ?></li>
                        <li><?php _e('Enter frame details', 'varai'); ?></li>
                        <li><?php _e('Enable virtual try-on if desired', 'varai'); ?></li>
                        <li><?php _e('Add style tags for better recommendations', 'varai'); ?></li>
                        <li><?php _e('Save the product', 'varai'); ?></li>
                    </ol>
                </div>
            </div>
            
            <!-- Features Tab -->
            <div id="features" class="tab-pane">
                <h2><?php _e('VARAi Features', 'varai'); ?></h2>
                
                <div class="varai-card">
                    <h3><?php _e('Virtual Try-On', 'varai'); ?></h3>
                    <p><?php _e('Allow customers to virtually try on eyewear products before purchasing:', 'varai'); ?></p>
                    <ul>
                        <li><?php _e('Realistic 3D rendering of frames on customer\'s face', 'varai'); ?></li>
                        <li><?php _e('Works with customer\'s webcam or uploaded photos', 'varai'); ?></li>
                        <li><?php _e('Supports different frame colors and styles', 'varai'); ?></li>
                    </ul>
                    <p><?php _e('Enable this feature in the settings and for individual products.', 'varai'); ?></p>
                </div>
                
                <div class="varai-card">
                    <h3><?php _e('Smart Recommendations', 'varai'); ?></h3>
                    <p><?php _e('AI-powered product recommendations based on:', 'varai'); ?></p>
                    <ul>
                        <li><?php _e('Product style and attributes', 'varai'); ?></li>
                        <li><?php _e('Customer browsing behavior', 'varai'); ?></li>
                        <li><?php _e('Purchase history', 'varai'); ?></li>
                        <li><?php _e('Style compatibility', 'varai'); ?></li>
                    </ul>
                    <p><?php _e('Recommendations appear automatically on product pages and can be added anywhere using shortcodes.', 'varai'); ?></p>
                </div>
                
                <div class="varai-card">
                    <h3><?php _e('Style Scoring', 'varai'); ?></h3>
                    <p><?php _e('Each product can have a style score that affects its ranking in recommendations:', 'varai'); ?></p>
                    <ul>
                        <li><?php _e('Score range: 0-100', 'varai'); ?></li>
                        <li><?php _e('Higher scores indicate more popular or trending styles', 'varai'); ?></li>
                        <li><?php _e('Scores can be set manually or calculated automatically', 'varai'); ?></li>
                    </ul>
                </div>
                
                <div class="varai-card">
                    <h3><?php _e('Analytics', 'varai'); ?></h3>
                    <p><?php _e('Track customer interactions with VARAi features:', 'varai'); ?></p>
                    <ul>
                        <li><?php _e('Virtual try-on usage', 'varai'); ?></li>
                        <li><?php _e('Recommendation clicks and conversions', 'varai'); ?></li>
                        <li><?php _e('Product views and purchases', 'varai'); ?></li>
                    </ul>
                    <p><?php _e('View analytics in the VARAi Analytics dashboard.', 'varai'); ?></p>
                    <p><a href="<?php echo admin_url('admin.php?page=varai-analytics'); ?>" class="button button-secondary"><?php _e('View Analytics', 'varai'); ?></a></p>
                </div>
            </div>
            
            <!-- Shortcodes Tab -->
            <div id="shortcodes" class="tab-pane">
                <h2><?php _e('VARAi Shortcodes', 'varai'); ?></h2>
                
                <div class="varai-card">
                    <h3><?php _e('Virtual Try-On Shortcode', 'varai'); ?></h3>
                    <p><?php _e('Add a virtual try-on button anywhere on your site:', 'varai'); ?></p>
                    <code>[varai_virtual_try_on product_id="123" button_text="Try On Virtually" button_class="custom-button"]</code>
                    <p><?php _e('Parameters:', 'varai'); ?></p>
                    <ul>
                        <li><code>product_id</code>: <?php _e('ID of the product (optional, defaults to current product)', 'varai'); ?></li>
                        <li><code>button_text</code>: <?php _e('Text for the button (optional)', 'varai'); ?></li>
                        <li><code>button_class</code>: <?php _e('CSS class for the button (optional)', 'varai'); ?></li>
                    </ul>
                </div>
                
                <div class="varai-card">
                    <h3><?php _e('Recommendations Shortcode', 'varai'); ?></h3>
                    <p><?php _e('Display product recommendations anywhere:', 'varai'); ?></p>
                    <code>[varai_recommendations product_id="123" limit="4" columns="2" title="Recommended Products"]</code>
                    <p><?php _e('Parameters:', 'varai'); ?></p>
                    <ul>
                        <li><code>product_id</code>: <?php _e('ID of the product to get recommendations for (optional, defaults to current product)', 'varai'); ?></li>
                        <li><code>limit</code>: <?php _e('Number of recommendations to display (optional, defaults to 4)', 'varai'); ?></li>
                        <li><code>columns</code>: <?php _e('Number of columns to display (optional, defaults to 2)', 'varai'); ?></li>
                        <li><code>title</code>: <?php _e('Title for the recommendations section (optional)', 'varai'); ?></li>
                    </ul>
                </div>
                
                <div class="varai-card">
                    <h3><?php _e('Product Comparison Shortcode', 'varai'); ?></h3>
                    <p><?php _e('Display a comparison of multiple products:', 'varai'); ?></p>
                    <code>[varai_product_comparison products="123,456,789" columns="3" title="Compare Products"]</code>
                    <p><?php _e('Parameters:', 'varai'); ?></p>
                    <ul>
                        <li><code>products</code>: <?php _e('Comma-separated list of product IDs to compare (required)', 'varai'); ?></li>
                        <li><code>columns</code>: <?php _e('Number of columns to display (optional, defaults to 3)', 'varai'); ?></li>
                        <li><code>title</code>: <?php _e('Title for the comparison section (optional)', 'varai'); ?></li>
                    </ul>
                </div>
            </div>
            
            <!-- API Tab -->
            <div id="api" class="tab-pane">
                <h2><?php _e('VARAi API Integration', 'varai'); ?></h2>
                
                <div class="varai-card">
                    <h3><?php _e('API Overview', 'varai'); ?></h3>
                    <p><?php _e('VARAi integrates with the VARAi API to provide recommendations, virtual try-on, and analytics:', 'varai'); ?></p>
                    <ul>
                        <li><?php _e('API Base URL: https://api.varai.ai/v1', 'varai'); ?></li>
                        <li><?php _e('Authentication: API Key', 'varai'); ?></li>
                        <li><?php _e('Rate Limits: 1000 requests per hour', 'varai'); ?></li>
                    </ul>
                    <p><?php _e('You can configure the API URL and key in the settings.', 'varai'); ?></p>
                </div>
                
                <div class="varai-card">
                    <h3><?php _e('Webhooks', 'varai'); ?></h3>
                    <p><?php _e('VARAi supports webhooks for real-time updates:', 'varai'); ?></p>
                    <ul>
                        <li><?php _e('Product updates', 'varai'); ?></li>
                        <li><?php _e('Recommendation updates', 'varai'); ?></li>
                        <li><?php _e('Style score updates', 'varai'); ?></li>
                    </ul>
                    <p><?php _e('Configure webhook settings in the API Settings section.', 'varai'); ?></p>
                </div>
                
                <div class="varai-card">
                    <h3><?php _e('Developer Resources', 'varai'); ?></h3>
                    <p><?php _e('For developers looking to extend VARAi functionality:', 'varai'); ?></p>
                    <ul>
                        <li><a href="https://varai.ai/docs/api" target="_blank"><?php _e('API Documentation', 'varai'); ?></a></li>
                        <li><a href="https://varai.ai/docs/webhooks" target="_blank"><?php _e('Webhook Documentation', 'varai'); ?></a></li>
                        <li><a href="https://varai.ai/docs/sdk" target="_blank"><?php _e('SDK Documentation', 'varai'); ?></a></li>
                    </ul>
                </div>
            </div>
            
            <!-- Troubleshooting Tab -->
            <div id="troubleshooting" class="tab-pane">
                <h2><?php _e('Troubleshooting', 'varai'); ?></h2>
                
                <div class="varai-card">
                    <h3><?php _e('Virtual Try-On Issues', 'varai'); ?></h3>
                    <p><?php _e('If virtual try-on is not working:', 'varai'); ?></p>
                    <ol>
                        <li><?php _e('Verify SSL is properly configured on your site', 'varai'); ?></li>
                        <li><?php _e('Check browser console for errors', 'varai'); ?></li>
                        <li><?php _e('Verify 3D model file is accessible', 'varai'); ?></li>
                        <li><?php _e('Check that frame measurements are entered correctly', 'varai'); ?></li>
                        <li><?php _e('Ensure the API key is valid', 'varai'); ?></li>
                    </ol>
                </div>
                
                <div class="varai-card">
                    <h3><?php _e('Recommendation Issues', 'varai'); ?></h3>
                    <p><?php _e('If recommendations are not showing or are inaccurate:', 'varai'); ?></p>
                    <ol>
                        <li><?php _e('Verify API key is correct', 'varai'); ?></li>
                        <li><?php _e('Check product attributes are mapped correctly', 'varai'); ?></li>
                        <li><?php _e('Ensure products have style tags', 'varai'); ?></li>
                        <li><?php _e('Check error logs for API issues', 'varai'); ?></li>
                        <li><?php _e('Try clearing the cache', 'varai'); ?></li>
                    </ol>
                </div>
                
                <div class="varai-card">
                    <h3><?php _e('Analytics Issues', 'varai'); ?></h3>
                    <p><?php _e('If analytics are not tracking correctly:', 'varai'); ?></p>
                    <ol>
                        <li><?php _e('Verify GA4 Measurement ID is correct', 'varai'); ?></li>
                        <li><?php _e('Check for browser tracking blockers', 'varai'); ?></li>
                        <li><?php _e('Verify events in GA4 debug view', 'varai'); ?></li>
                        <li><?php _e('Check browser console for errors', 'varai'); ?></li>
                    </ol>
                </div>
                
                <div class="varai-card">
                    <h3><?php _e('Debug Logging', 'varai'); ?></h3>
                    <p><?php _e('Enable debug logging to troubleshoot issues:', 'varai'); ?></p>
                    <ol>
                        <li><?php _e('Go to VARAi > Settings > Performance', 'varai'); ?></li>
                        <li><?php _e('Enable Debug Logging', 'varai'); ?></li>
                        <li><?php _e('Reproduce the issue', 'varai'); ?></li>
                        <li><?php _e('Check the WordPress error log for detailed information', 'varai'); ?></li>
                    </ol>
                </div>
                
                <div class="varai-card">
                    <h3><?php _e('Support', 'varai'); ?></h3>
                    <p><?php _e('If you need additional help:', 'varai'); ?></p>
                    <ul>
                        <li><a href="https://varai.ai/docs/faq" target="_blank"><?php _e('FAQ', 'varai'); ?></a></li>
                        <li><a href="https://varai.ai/support" target="_blank"><?php _e('Support Portal', 'varai'); ?></a></li>
                        <li><?php _e('Email: support@varai.ai', 'varai'); ?></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Tab navigation
    $('.varai-documentation-tabs .nav-tab').on('click', function(e) {
        e.preventDefault();
        
        // Get the target tab
        var target = $(this).attr('href');
        
        // Remove active class from all tabs and panes
        $('.varai-documentation-tabs .nav-tab').removeClass('nav-tab-active');
        $('.varai-documentation-tabs .tab-pane').removeClass('active');
        
        // Add active class to clicked tab and corresponding pane
        $(this).addClass('nav-tab-active');
        $(target).addClass('active');
    });
});
</script>

<style>
.varai-documentation {
    max-width: 1200px;
    margin: 20px auto;
}

.varai-documentation-tabs .tab-content {
    background: #fff;
    padding: 20px;
    border: 1px solid #ccc;
    border-top: none;
}

.varai-documentation-tabs .tab-pane {
    display: none;
}

.varai-documentation-tabs .tab-pane.active {
    display: block;
}

.varai-card {
    background: #f9f9f9;
    border: 1px solid #e5e5e5;
    border-radius: 3px;
    padding: 15px;
    margin-bottom: 20px;
}

.varai-card h3 {
    margin-top: 0;
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 10px;
}

.varai-card code {
    display: block;
    background: #f1f1f1;
    padding: 10px;
    margin: 10px 0;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
}
</style>