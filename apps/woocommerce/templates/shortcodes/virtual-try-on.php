<?php
/**
 * VARAi Virtual Try-On Shortcode Template
 *
 * @package VARAi
 */

if (!defined('ABSPATH')) {
    exit;
}

// Get product data
$product = wc_get_product($product_id);
if (!$product) {
    return;
}

// Get product helper
$product_helper = new VARAi_Product($product);

// Get 3D model URL
$model_url = $product_helper->get_try_on_model();
if (empty($model_url)) {
    return;
}

// Get button text and class
$button_text = !empty($atts['button_text']) ? $atts['button_text'] : __('Try On Virtually', 'varai');
$button_class = !empty($atts['button_class']) ? $atts['button_class'] : 'varai-try-on-button';

// Get product image
$image_id = $product->get_image_id();
$image_url = wp_get_attachment_image_url($image_id, 'full');

// Get product data for try-on
$frame_data = $product_helper->get_frame_data();
?>

<div class="varai-virtual-try-on-container" data-product-id="<?php echo esc_attr($product_id); ?>">
    <button class="<?php echo esc_attr($button_class); ?>" data-model-url="<?php echo esc_url($model_url); ?>" data-product-image="<?php echo esc_url($image_url); ?>">
        <?php echo esc_html($button_text); ?>
    </button>
    
    <div class="varai-try-on-modal" style="display: none;">
        <div class="varai-try-on-modal-content">
            <span class="varai-try-on-close">&times;</span>
            <h2><?php echo esc_html($product->get_name()); ?></h2>
            
            <div class="varai-try-on-container">
                <div class="varai-try-on-preview">
                    <video id="varai-camera-feed" autoplay playsinline></video>
                    <canvas id="varai-try-on-canvas"></canvas>
                    <div class="varai-try-on-controls">
                        <button class="varai-try-on-capture"><?php _e('Capture Photo', 'varai'); ?></button>
                        <button class="varai-try-on-upload"><?php _e('Upload Photo', 'varai'); ?></button>
                        <input type="file" id="varai-photo-upload" accept="image/*" style="display: none;">
                    </div>
                </div>
                
                <div class="varai-try-on-product-info">
                    <div class="varai-try-on-product-image">
                        <?php echo $product->get_image('woocommerce_thumbnail'); ?>
                    </div>
                    
                    <div class="varai-try-on-product-details">
                        <h3><?php echo esc_html($product->get_name()); ?></h3>
                        <p class="price"><?php echo $product->get_price_html(); ?></p>
                        
                        <?php if (!empty($frame_data)) : ?>
                        <div class="varai-try-on-frame-details">
                            <h4><?php _e('Frame Details', 'varai'); ?></h4>
                            <ul>
                                <?php if (!empty($frame_data['width'])) : ?>
                                <li><?php _e('Frame Width:', 'varai'); ?> <?php echo esc_html($frame_data['width']); ?> mm</li>
                                <?php endif; ?>
                                
                                <?php if (!empty($frame_data['bridge'])) : ?>
                                <li><?php _e('Bridge Width:', 'varai'); ?> <?php echo esc_html($frame_data['bridge']); ?> mm</li>
                                <?php endif; ?>
                                
                                <?php if (!empty($frame_data['temple'])) : ?>
                                <li><?php _e('Temple Length:', 'varai'); ?> <?php echo esc_html($frame_data['temple']); ?> mm</li>
                                <?php endif; ?>
                            </ul>
                        </div>
                        <?php endif; ?>
                        
                        <div class="varai-try-on-actions">
                            <a href="<?php echo esc_url($product->add_to_cart_url()); ?>" class="button add_to_cart_button"><?php _e('Add to Cart', 'varai'); ?></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Open modal when button is clicked
    $('.<?php echo esc_js($button_class); ?>').on('click', function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const $modal = $button.closest('.varai-virtual-try-on-container').find('.varai-try-on-modal');
        const modelUrl = $button.data('model-url');
        const productImage = $button.data('product-image');
        
        // Show modal
        $modal.fadeIn();
        
        // Initialize camera
        initCamera();
        
        // Track event
        if (typeof VARAnalytics !== 'undefined') {
            VARAnalytics.trackEvent('try_on');
        }
    });
    
    // Close modal
    $('.varai-try-on-close').on('click', function() {
        const $modal = $(this).closest('.varai-try-on-modal');
        $modal.fadeOut();
        
        // Stop camera
        stopCamera();
    });
    
    // Capture photo
    $('.varai-try-on-capture').on('click', function() {
        capturePhoto();
    });
    
    // Upload photo
    $('.varai-try-on-upload').on('click', function() {
        $('#varai-photo-upload').click();
    });
    
    // Handle file upload
    $('#varai-photo-upload').on('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.getElementById('varai-try-on-canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Apply virtual try-on
                    applyVirtualTryOn();
                };
                
                img.src = e.target.result;
            };
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Initialize camera
    function initCamera() {
        const video = document.getElementById('varai-camera-feed');
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    video.srcObject = stream;
                })
                .catch(function(error) {
                    console.error('Camera error:', error);
                });
        }
    }
    
    // Stop camera
    function stopCamera() {
        const video = document.getElementById('varai-camera-feed');
        
        if (video.srcObject) {
            const tracks = video.srcObject.getTracks();
            
            tracks.forEach(function(track) {
                track.stop();
            });
            
            video.srcObject = null;
        }
    }
    
    // Capture photo
    function capturePhoto() {
        const video = document.getElementById('varai-camera-feed');
        const canvas = document.getElementById('varai-try-on-canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Apply virtual try-on
        applyVirtualTryOn();
    }
    
    // Apply virtual try-on
    function applyVirtualTryOn() {
        const canvas = document.getElementById('varai-try-on-canvas');
        const ctx = canvas.getContext('2d');
        const modelUrl = $('.<?php echo esc_js($button_class); ?>').data('model-url');
        const productImage = $('.<?php echo esc_js($button_class); ?>').data('product-image');
        
        // This is a placeholder for the actual try-on implementation
        // In a real implementation, this would use the VARAi API to apply the virtual try-on
        
        // For demonstration purposes, we'll just overlay the product image
        const img = new Image();
        img.onload = function() {
            // Calculate position to center the glasses on the face
            const x = (canvas.width - img.width) / 2;
            const y = (canvas.height - img.height) / 3; // Position higher up for eyes
            
            ctx.drawImage(img, x, y, img.width, img.height);
        };
        
        img.src = productImage;
    }
});
</script>

<style>
.varai-virtual-try-on-container {
    margin: 20px 0;
}

.varai-try-on-button {
    background-color: #2271b1;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.varai-try-on-button:hover {
    background-color: #135e96;
}

.varai-try-on-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 9999;
}

.varai-try-on-modal-content {
    position: relative;
    background-color: #fff;
    margin: 5% auto;
    padding: 20px;
    width: 80%;
    max-width: 1000px;
    border-radius: 5px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.varai-try-on-close {
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

.varai-try-on-container {
    display: flex;
    flex-wrap: wrap;
    margin-top: 20px;
}

.varai-try-on-preview {
    flex: 1;
    min-width: 300px;
    margin-right: 20px;
}

.varai-try-on-product-info {
    flex: 1;
    min-width: 300px;
}

#varai-camera-feed,
#varai-try-on-canvas {
    width: 100%;
    max-width: 500px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
}

.varai-try-on-controls {
    margin-top: 10px;
}

.varai-try-on-controls button {
    background-color: #2271b1;
    color: #fff;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 10px;
}

.varai-try-on-controls button:hover {
    background-color: #135e96;
}

.varai-try-on-product-details {
    margin-top: 20px;
}

.varai-try-on-frame-details {
    margin-top: 20px;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 4px;
}

.varai-try-on-frame-details ul {
    list-style: none;
    padding: 0;
    margin: 10px 0 0;
}

.varai-try-on-frame-details li {
    margin-bottom: 5px;
}

.varai-try-on-actions {
    margin-top: 20px;
}

@media (max-width: 768px) {
    .varai-try-on-preview,
    .varai-try-on-product-info {
        flex: 100%;
        margin-right: 0;
        margin-bottom: 20px;
    }
}
</style>