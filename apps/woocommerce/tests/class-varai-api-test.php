<?php
/**
 * VARAi API Test
 *
 * @package VARAi
 */

class VARAi_API_Test extends WP_UnitTestCase {
    /**
     * Test instance
     */
    private $api;
    
    /**
     * Mock product
     */
    private $product;
    
    /**
     * Set up
     */
    public function setUp(): void {
        parent::setUp();
        
        // Create mock settings
        update_option('varai_settings', array(
            'api_key' => 'test_api_key',
            'api_url' => 'https://api.varai.ai/v1',
            'cache_expiration' => 3600,
            'enable_debug_logging' => 'yes',
        ));
        
        // Create mock product
        $this->product = $this->createMockProduct();
        
        // Create API instance
        $this->api = new VARAi_API();
        
        // Mock HTTP requests
        add_filter('pre_http_request', array($this, 'mock_http_request'), 10, 3);
    }
    
    /**
     * Tear down
     */
    public function tearDown(): void {
        // Remove mock settings
        delete_option('varai_settings');
        
        // Remove filter
        remove_filter('pre_http_request', array($this, 'mock_http_request'));
        
        parent::tearDown();
    }
    
    /**
     * Create mock product
     */
    private function createMockProduct() {
        $product = $this->getMockBuilder('WC_Product')
            ->disableOriginalConstructor()
            ->getMock();
        
        // Mock product methods
        $product->method('get_id')->willReturn(123);
        $product->method('get_name')->willReturn('Test Eyewear');
        $product->method('get_price')->willReturn('99.99');
        $product->method('get_image_id')->willReturn(456);
        $product->method('get_attribute')->willReturn('Test Attribute');
        
        return $product;
    }
    
    /**
     * Mock HTTP request
     */
    public function mock_http_request($response, $args, $url) {
        // Mock recommendations response
        if (strpos($url, '/recommendations') !== false) {
            return array(
                'response' => array('code' => 200),
                'body' => json_encode(array(
                    'recommendations' => array(
                        array(
                            'product_id' => 456,
                            'score' => 0.95,
                            'reasoning' => 'Similar style',
                        ),
                        array(
                            'product_id' => 789,
                            'score' => 0.85,
                            'reasoning' => 'Similar color',
                        ),
                    ),
                )),
            );
        }
        
        // Mock embeddings update response
        if (strpos($url, '/embeddings/update') !== false) {
            return array(
                'response' => array('code' => 200),
                'body' => json_encode(array(
                    'success' => true,
                )),
            );
        }
        
        // Mock events response
        if (strpos($url, '/events') !== false) {
            return array(
                'response' => array('code' => 200),
                'body' => json_encode(array(
                    'success' => true,
                )),
            );
        }
        
        // Mock style score response
        if (strpos($url, '/style/score') !== false) {
            return array(
                'response' => array('code' => 200),
                'body' => json_encode(array(
                    'score' => 85,
                )),
            );
        }
        
        // Default response
        return array(
            'response' => array('code' => 404),
            'body' => json_encode(array(
                'error' => 'Not found',
            )),
        );
    }
    
    /**
     * Test get_recommendations
     */
    public function test_get_recommendations() {
        // Mock wc_get_product function
        $this->mockWcGetProduct();
        
        // Mock wp_get_attachment_image_url function
        $this->mockWpGetAttachmentImageUrl();
        
        // Get recommendations
        $recommendations = $this->api->get_recommendations(123);
        
        // Assert recommendations
        $this->assertIsArray($recommendations);
        $this->assertCount(2, $recommendations);
        $this->assertEquals(456, $recommendations[0]['id']);
        $this->assertEquals(0.95, $recommendations[0]['score']);
        $this->assertEquals('Similar style', $recommendations[0]['reasoning']);
    }
    
    /**
     * Test update_product_embeddings
     */
    public function test_update_product_embeddings() {
        // Mock wc_get_product function
        $this->mockWcGetProduct();
        
        // Mock wp_get_attachment_image_url function
        $this->mockWpGetAttachmentImageUrl();
        
        // Update embeddings
        $result = $this->api->update_product_embeddings(123);
        
        // Assert result
        $this->assertTrue($result);
    }
    
    /**
     * Test track_event
     */
    public function test_track_event() {
        // Mock wc_get_product function
        $this->mockWcGetProduct();
        
        // Track event
        $result = $this->api->track_event('view_item', 123);
        
        // Assert result
        $this->assertTrue($result);
    }
    
    /**
     * Test get_style_score
     */
    public function test_get_style_score() {
        // Mock wc_get_product function
        $this->mockWcGetProduct();
        
        // Mock wp_get_attachment_image_url function
        $this->mockWpGetAttachmentImageUrl();
        
        // Get style score
        $score = $this->api->get_style_score(123);
        
        // Assert score
        $this->assertEquals(85, $score);
    }
    
    /**
     * Test cache functionality
     */
    public function test_cache() {
        // Mock wc_get_product function
        $this->mockWcGetProduct();
        
        // Mock wp_get_attachment_image_url function
        $this->mockWpGetAttachmentImageUrl();
        
        // First call should make an API request
        $recommendations1 = $this->api->get_recommendations(123);
        
        // Second call should use cache
        $recommendations2 = $this->api->get_recommendations(123);
        
        // Assert recommendations are the same
        $this->assertEquals($recommendations1, $recommendations2);
    }
    
    /**
     * Test error handling
     */
    public function test_error_handling() {
        // Remove mock HTTP filter
        remove_filter('pre_http_request', array($this, 'mock_http_request'));
        
        // Add error filter
        add_filter('pre_http_request', function() {
            return new WP_Error('http_request_failed', 'Connection failed');
        });
        
        // Mock wc_get_product function
        $this->mockWcGetProduct();
        
        // Get recommendations (should handle error)
        $recommendations = $this->api->get_recommendations(123);
        
        // Assert empty array on error
        $this->assertIsArray($recommendations);
        $this->assertEmpty($recommendations);
        
        // Remove error filter
        remove_filter('pre_http_request', function() {
            return new WP_Error('http_request_failed', 'Connection failed');
        });
    }
    
    /**
     * Mock wc_get_product function
     */
    private function mockWcGetProduct() {
        global $product;
        $product = $this->product;
        
        if (!function_exists('wc_get_product')) {
            function wc_get_product($product_id) {
                global $product;
                return $product;
            }
        }
    }
    
    /**
     * Mock wp_get_attachment_image_url function
     */
    private function mockWpGetAttachmentImageUrl() {
        if (!function_exists('wp_get_attachment_image_url')) {
            function wp_get_attachment_image_url($attachment_id, $size) {
                return 'https://example.com/test-image.jpg';
            }
        }
    }
}