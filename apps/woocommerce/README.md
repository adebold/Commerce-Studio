# VARAi for WooCommerce

AI-powered eyewear recommendations and virtual try-on for WooCommerce stores.

## Features

- **Smart Recommendations**: AI-powered product recommendations based on style, brand, and customer behavior
- **Virtual Try-On**: Let customers virtually try on frames before purchasing
- **Style Scoring**: Rank products by style score to highlight trending items
- **Frame Measurements**: Detailed frame measurements and specifications
- **Analytics Integration**: Built-in GA4 tracking and analytics dashboard
- **Style Tagging**: Improve recommendations with custom style tags
- **Product Variations**: Support for frame colors and finishes
- **Product Comparison**: Allow customers to compare multiple products side-by-side
- **WooCommerce Integration**: Seamless integration with your existing store
- **Responsive Design**: All components work on desktop and mobile devices
- **Theme Customization**: Easily customize the appearance to match your store

## Requirements

- WordPress 5.8+
- WooCommerce 5.0+
- PHP 7.4+
- SSL certificate (required for virtual try-on)

## Installation

1. Download the plugin zip file
2. Go to WordPress admin > Plugins > Add New > Upload Plugin
3. Upload the zip file and activate the plugin
4. Go to WooCommerce > Settings > VARAi to configure

## Configuration

### API Setup

1. Sign up for a VARAi account at https://varai.ai
2. Create an API key in your VARAi dashboard
3. Enter the API key in WooCommerce > Settings > VARAi > API Settings

### Product Setup

1. Edit a product in WooCommerce
2. Scroll down to "VARAi Settings"
3. Enter frame measurements and specifications
4. Enable virtual try-on if desired
5. Set style score and add style tags for better recommendations
6. Add to VARAi Products category for filtering
7. For variable products, set color codes and finishes per variation

### Analytics Setup

1. Go to WooCommerce > Settings > VARAi > Analytics
2. Enable analytics tracking
3. Enter your GA4 Measurement ID
4. Configure event tracking preferences

## Usage

### Virtual Try-On

The virtual try-on button appears automatically on product pages when enabled. You can also add it anywhere using a shortcode:

```php
[varai_virtual_try_on product_id="123" button_text="Try These Frames On!" button_class="my-custom-button-class"]
```

To customize the appearance:

```php
// Customize try-on button text
add_filter('varai_try_on_button_text', function($text) {
    return 'Try These Frames On!';
});

// Customize try-on button class
add_filter('varai_try_on_button_class', function($class) {
    return 'my-custom-button-class';
});
```

### Recommendations

Product recommendations appear automatically in configured locations. You can also add them anywhere using a shortcode:

```php
[varai_recommendations product_id="123" limit="4" columns="2" title="Recommended Products"]
```

To customize placement:

```php
// Add recommendations to a custom location
if (function_exists('varai_show_recommendations')) {
    varai_show_recommendations([
        'limit' => 4,
        'columns' => 2,
        'title' => 'You Might Also Like'
    ]);
}
```

### Product Comparison

Allow customers to compare multiple products side-by-side:

```php
[varai_product_comparison products="123,456,789" columns="3" title="Compare Products"]
```

To add a comparison button to product pages:

```php
// Add comparison button to product pages
add_action('woocommerce_after_add_to_cart_button', function() {
    global $product;
    
    echo '<button class="button varai-add-to-compare" data-product-id="' . esc_attr($product->get_id()) . '">';
    echo 'Add to Compare';
    echo '</button>';
});
```

### Analytics Events

The plugin tracks key events automatically:
- Product views
- Virtual try-ons
- Recommendation impressions
- Recommendation clicks
- Add to cart
- Begin checkout
- Purchases
- Product comparisons
- Style score views

To track custom events:

```php
// Track a custom event
if (class_exists('VARAi_Analytics')) {
    $analytics = new VARAi_Analytics();
    $analytics->track_event('custom_event', $product_id, [
        'custom_property' => 'value'
    ]);
}
```

## Hooks and Filters

### Actions

```php
// Before recommendations are rendered
do_action('varai_before_recommendations', $product_id);

// After recommendations are rendered
do_action('varai_after_recommendations', $product_id);

// Before virtual try-on button
do_action('varai_before_try_on_button', $product_id);

// After virtual try-on button
do_action('varai_after_try_on_button', $product_id);

// When a product's embeddings are updated
do_action('varai_product_embeddings_updated', $product_id);

// Before product comparison is rendered
do_action('varai_before_product_comparison', $product_ids);

// After product comparison is rendered
do_action('varai_after_product_comparison', $product_ids);
```

### Filters

```php
// Modify recommendation query
add_filter('varai_recommendation_query', function($query, $product_id) {
    $query['limit'] = 6;
    return $query;
}, 10, 2);

// Modify frame data before API sync
add_filter('varai_frame_data', function($data, $product) {
    $data['custom_field'] = get_post_meta($product->get_id(), '_custom_field', true);
    return $data;
}, 10, 2);

// Modify analytics event data
add_filter('varai_event_data', function($data, $event_type) {
    $data['custom_dimension'] = 'value';
    return $data;
}, 10, 2);

// Modify style score calculation
add_filter('varai_style_score', function($score, $product_id) {
    // Adjust score based on custom logic
    return $score;
}, 10, 2);

// Modify product comparison attributes
add_filter('varai_comparison_attributes', function($attributes) {
    $attributes['custom_attribute'] = 'Custom Attribute';
    return $attributes;
}, 10);
```

## Shortcodes

### Virtual Try-On

```
[varai_virtual_try_on product_id="123" button_text="Try On Virtually" button_class="varai-try-on-button"]
```

Parameters:
- `product_id`: ID of the product (optional, defaults to current product)
- `button_text`: Text for the button (optional)
- `button_class`: CSS class for the button (optional)

### Recommendations

```
[varai_recommendations product_id="123" limit="4" columns="2" title="Recommended Products"]
```

Parameters:
- `product_id`: ID of the product to get recommendations for (optional, defaults to current product)
- `limit`: Number of recommendations to display (optional, defaults to 4)
- `columns`: Number of columns to display (optional, defaults to 2)
- `title`: Title for the recommendations section (optional)

### Product Comparison

```
[varai_product_comparison products="123,456,789" columns="3" title="Compare Products"]
```

Parameters:
- `products`: Comma-separated list of product IDs to compare (required)
- `columns`: Number of columns to display (optional, defaults to 3)
- `title`: Title for the comparison section (optional)

## Troubleshooting

### Virtual Try-On Not Working

1. Verify SSL is properly configured on your site
2. Check browser console for errors
3. Verify 3D model file is accessible
4. Check that frame measurements are entered correctly
5. Ensure the API key is valid

### Recommendations Not Showing

1. Verify API key is correct
2. Check product attributes are mapped correctly
3. Ensure products have style tags
4. Check error logs for API issues
5. Try clearing the cache in VARAi > Settings > Performance

### Analytics Issues

1. Verify GA4 Measurement ID
2. Check for browser tracking blockers
3. Verify events in GA4 debug view
4. Check browser console for errors

### API Connection Issues

1. Verify API key and URL in settings
2. Check server connectivity to VARAi API
3. Enable debug logging in settings
4. Check WordPress error log for detailed information

## Support

For support:
1. Check the [Documentation](https://varai.ai/docs)
2. Contact support@varai.ai
3. Visit our [Community Forum](https://community.varai.ai)

## License

This plugin is licensed under the GPL v2 or later.

```
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
