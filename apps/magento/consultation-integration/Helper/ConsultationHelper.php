<?php
/**
 * Magento Consultation Integration Helper
 * Commerce Studio Consultation MVP - Magento Integration
 */

namespace CommerceStudio\ConsultationIntegration\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\Helper\Context;
use Magento\Store\Model\ScopeInterface;
use Magento\Framework\HTTP\Client\Curl;
use Magento\Framework\Serialize\Serializer\Json;
use Psr\Log\LoggerInterface;

class ConsultationHelper extends AbstractHelper
{
    const XML_PATH_ENABLED = 'consultation/general/enabled';
    const XML_PATH_API_URL = 'consultation/general/api_url';
    const XML_PATH_API_KEY = 'consultation/general/api_key';
    const XML_PATH_WIDGET_POSITION = 'consultation/widget/position';
    const XML_PATH_FACE_ANALYSIS_ENABLED = 'consultation/features/face_analysis_enabled';
    const XML_PATH_STORE_LOCATOR_ENABLED = 'consultation/features/store_locator_enabled';

    /**
     * @var Curl
     */
    protected $curl;

    /**
     * @var Json
     */
    protected $json;

    /**
     * @var LoggerInterface
     */
    protected $logger;

    /**
     * Constructor
     *
     * @param Context $context
     * @param Curl $curl
     * @param Json $json
     * @param LoggerInterface $logger
     */
    public function __construct(
        Context $context,
        Curl $curl,
        Json $json,
        LoggerInterface $logger
    ) {
        parent::__construct($context);
        $this->curl = $curl;
        $this->json = $json;
        $this->logger = $logger;
    }

    /**
     * Check if consultation is enabled
     *
     * @param int|null $storeId
     * @return bool
     */
    public function isEnabled($storeId = null)
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_ENABLED,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    /**
     * Get consultation API URL
     *
     * @param int|null $storeId
     * @return string
     */
    public function getApiUrl($storeId = null)
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_API_URL,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 'http://localhost:3002';
    }

    /**
     * Get consultation API key
     *
     * @param int|null $storeId
     * @return string
     */
    public function getApiKey($storeId = null)
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_API_KEY,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    /**
     * Get widget position
     *
     * @param int|null $storeId
     * @return string
     */
    public function getWidgetPosition($storeId = null)
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_WIDGET_POSITION,
            ScopeInterface::SCOPE_STORE,
            $storeId
        ) ?: 'product-page';
    }

    /**
     * Check if face analysis is enabled
     *
     * @param int|null $storeId
     * @return bool
     */
    public function isFaceAnalysisEnabled($storeId = null)
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_FACE_ANALYSIS_ENABLED,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    /**
     * Check if store locator is enabled
     *
     * @param int|null $storeId
     * @return bool
     */
    public function isStoreLocatorEnabled($storeId = null)
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_STORE_LOCATOR_ENABLED,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    /**
     * Start consultation session
     *
     * @param array $sessionData
     * @return array|false
     */
    public function startConsultation($sessionData = [])
    {
        try {
            $apiUrl = $this->getApiUrl();
            $endpoint = $apiUrl . '/consultation/start';

            $data = [
                'platform' => 'magento',
                'sessionData' => array_merge($sessionData, [
                    'timestamp' => date('c'),
                    'store_id' => $this->_getRequest()->getParam('store')
                ])
            ];

            $response = $this->makeApiRequest($endpoint, 'POST', $data);

            if ($response && isset($response['sessionId'])) {
                return $response;
            }

            return false;

        } catch (\Exception $e) {
            $this->logger->error('Consultation start error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Analyze face shape
     *
     * @param string $sessionId
     * @param string $imageData
     * @return array|false
     */
    public function analyzeFaceShape($sessionId, $imageData)
    {
        try {
            $apiUrl = $this->getApiUrl();
            $endpoint = $apiUrl . '/consultation/face-analysis';

            $data = [
                'sessionId' => $sessionId,
                'imageData' => $imageData
            ];

            $response = $this->makeApiRequest($endpoint, 'POST', $data);

            if ($response && isset($response['faceAnalysis'])) {
                return $response['faceAnalysis'];
            }

            return false;

        } catch (\Exception $e) {
            $this->logger->error('Face analysis error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get recommendations
     *
     * @param string $sessionId
     * @param array $preferences
     * @param array|null $faceAnalysis
     * @param array $productCatalog
     * @return array|false
     */
    public function getRecommendations($sessionId, $preferences, $faceAnalysis = null, $productCatalog = [])
    {
        try {
            $apiUrl = $this->getApiUrl();
            $endpoint = $apiUrl . '/consultation/recommendations';

            $data = [
                'sessionId' => $sessionId,
                'preferences' => $preferences,
                'faceAnalysis' => $faceAnalysis,
                'productCatalog' => $productCatalog,
                'platform' => 'magento'
            ];

            $response = $this->makeApiRequest($endpoint, 'POST', $data);

            if ($response && isset($response['recommendations'])) {
                return $response;
            }

            return false;

        } catch (\Exception $e) {
            $this->logger->error('Recommendations error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Find nearby stores
     *
     * @param string $sessionId
     * @param float $latitude
     * @param float $longitude
     * @param array $selectedProducts
     * @return array|false
     */
    public function findNearbyStores($sessionId, $latitude, $longitude, $selectedProducts = [])
    {
        try {
            $apiUrl = $this->getApiUrl();
            $endpoint = $apiUrl . '/api/stores/nearby';

            $params = [
                'sessionId' => $sessionId,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'products' => implode(',', $selectedProducts)
            ];

            $url = $endpoint . '?' . http_build_query($params);
            $response = $this->makeApiRequest($url, 'GET');

            if ($response && isset($response['stores'])) {
                return $response;
            }

            return false;

        } catch (\Exception $e) {
            $this->logger->error('Store locator error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Transform Magento product to consultation format
     *
     * @param \Magento\Catalog\Model\Product $product
     * @return array
     */
    public function transformProductForConsultation($product)
    {
        try {
            // Extract eyewear attributes
            $eyewearAttributes = $this->extractEyewearAttributes($product);

            return [
                'id' => 'magento_' . $product->getId(),
                'magentoId' => $product->getId(),
                'name' => $product->getName(),
                'sku' => $product->getSku(),
                'brand' => $product->getAttributeText('manufacturer') ?: 'Unknown',
                'category' => $this->categorizeProduct($product),
                'style' => $eyewearAttributes['style'],
                'material' => $eyewearAttributes['material'],
                'color' => $eyewearAttributes['color'],
                'price' => (float)$product->getFinalPrice(),
                'specialPrice' => (float)$product->getSpecialPrice(),
                'measurements' => $eyewearAttributes['measurements'],
                'features' => $eyewearAttributes['features'],
                'suitableFaceShapes' => $eyewearAttributes['suitableFaceShapes'],
                'styleMatch' => $eyewearAttributes['styleMatch'],
                'lifestyleMatch' => $eyewearAttributes['lifestyleMatch'],
                'image' => $this->getProductImageUrl($product),
                'url' => $product->getProductUrl(),
                'inStock' => $product->isAvailable(),
                'rating' => 4.0, // Default - integrate with review system
                'reviews' => 0 // Default - integrate with review system
            ];

        } catch (\Exception $e) {
            $this->logger->error('Product transformation error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Extract eyewear attributes from product
     *
     * @param \Magento\Catalog\Model\Product $product
     * @return array
     */
    protected function extractEyewearAttributes($product)
    {
        // Get frame style
        $style = $product->getAttributeText('frame_style') ?: $this->detectStyleFromName($product->getName());
        
        // Get material
        $material = $product->getAttributeText('frame_material') ?: $this->detectMaterialFromName($product->getName());
        
        // Get color
        $color = $product->getAttributeText('color') ?: $this->detectColorFromName($product->getName());
        
        // Get features from custom attributes
        $features = [];
        if ($product->getData('blue_light_filter')) $features[] = 'blue light filtering';
        if ($product->getData('anti_glare_coating')) $features[] = 'anti-glare coating';
        if ($product->getData('uv_protection')) $features[] = 'UV400 protection';
        if ($product->getData('polarized')) $features[] = 'polarized';
        
        // Map to face shapes
        $suitableFaceShapes = $this->mapStyleToFaceShapes($style);
        
        // Map to style categories
        $styleMatch = $this->mapToStyleCategories($style, $material);
        
        // Map to lifestyle categories
        $lifestyleMatch = $this->mapToLifestyleCategories($product, $features);
        
        // Get measurements from custom attributes or generate mock
        $measurements = $this->getMeasurements($product, $style);

        return [
            'style' => $style,
            'material' => $material,
            'color' => $color,
            'measurements' => $measurements,
            'features' => $features,
            'suitableFaceShapes' => $suitableFaceShapes,
            'styleMatch' => $styleMatch,
            'lifestyleMatch' => $lifestyleMatch
        ];
    }

    /**
     * Detect style from product name
     *
     * @param string $name
     * @return string
     */
    protected function detectStyleFromName($name)
    {
        $name = strtolower($name);
        
        if (strpos($name, 'round') !== false) return 'round';
        if (strpos($name, 'cat-eye') !== false) return 'cat-eye';
        if (strpos($name, 'aviator') !== false) return 'aviator';
        if (strpos($name, 'square') !== false) return 'square';
        if (strpos($name, 'oval') !== false) return 'oval';
        if (strpos($name, 'wrap') !== false) return 'wrap';
        
        return 'rectangular'; // default
    }

    /**
     * Detect material from product name
     *
     * @param string $name
     * @return string
     */
    protected function detectMaterialFromName($name)
    {
        $name = strtolower($name);
        
        if (strpos($name, 'metal') !== false) return 'metal';
        if (strpos($name, 'titanium') !== false) return 'titanium';
        if (strpos($name, 'tr90') !== false) return 'TR90';
        if (strpos($name, 'carbon') !== false) return 'carbon fiber';
        
        return 'acetate'; // default
    }

    /**
     * Detect color from product name
     *
     * @param string $name
     * @return string
     */
    protected function detectColorFromName($name)
    {
        $name = strtolower($name);
        $colors = ['black', 'brown', 'blue', 'red', 'green', 'gold', 'silver', 'tortoiseshell'];
        
        foreach ($colors as $color) {
            if (strpos($name, $color) !== false) {
                return $color;
            }
        }
        
        return 'black'; // default
    }

    /**
     * Get product measurements
     *
     * @param \Magento\Catalog\Model\Product $product
     * @param string $style
     * @return array
     */
    protected function getMeasurements($product, $style)
    {
        // Try to get from custom attributes first
        $measurements = [];
        
        if ($product->getData('lens_width')) {
            $measurements['lensWidth'] = (int)$product->getData('lens_width');
        }
        if ($product->getData('bridge_width')) {
            $measurements['bridgeWidth'] = (int)$product->getData('bridge_width');
        }
        if ($product->getData('temple_length')) {
            $measurements['templeLength'] = (int)$product->getData('temple_length');
        }
        
        // If no measurements available, generate based on style
        if (empty($measurements)) {
            $defaultMeasurements = [
                'rectangular' => ['lensWidth' => 52, 'bridgeWidth' => 18, 'templeLength' => 140],
                'round' => ['lensWidth' => 48, 'bridgeWidth' => 20, 'templeLength' => 145],
                'cat-eye' => ['lensWidth' => 54, 'bridgeWidth' => 16, 'templeLength' => 138],
                'aviator' => ['lensWidth' => 58, 'bridgeWidth' => 14, 'templeLength' => 135],
                'square' => ['lensWidth' => 56, 'bridgeWidth' => 17, 'templeLength' => 142],
                'wrap' => ['lensWidth' => 65, 'bridgeWidth' => 15, 'templeLength' => 125]
            ];
            
            $measurements = $defaultMeasurements[$style] ?? $defaultMeasurements['rectangular'];
        }
        
        return $measurements;
    }

    /**
     * Make API request
     *
     * @param string $url
     * @param string $method
     * @param array|null $data
     * @return array|false
     */
    protected function makeApiRequest($url, $method = 'GET', $data = null)
    {
        try {
            $this->curl->setOption(CURLOPT_TIMEOUT, 30);
            $this->curl->addHeader('Content-Type', 'application/json');
            
            if ($apiKey = $this->getApiKey()) {
                $this->curl->addHeader('Authorization', 'Bearer ' . $apiKey);
            }

            if ($method === 'POST' && $data) {
                $this->curl->post($url, $this->json->serialize($data));
            } else {
                $this->curl->get($url);
            }

            $response = $this->curl->getBody();
            $httpCode = $this->curl->getStatus();

            if ($httpCode >= 200 && $httpCode < 300) {
                return $this->json->unserialize($response);
            }

            $this->logger->warning('API request failed', [
                'url' => $url,
                'http_code' => $httpCode,
                'response' => $response
            ]);

            return false;

        } catch (\Exception $e) {
            $this->logger->error('API request exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Additional helper methods would go here following the same patterns as Shopify integration
     */
    
    protected function categorizeProduct($product) { /* Implementation */ }
    protected function mapStyleToFaceShapes($style) { /* Implementation */ }
    protected function mapToStyleCategories($style, $material) { /* Implementation */ }
    protected function mapToLifestyleCategories($product, $features) { /* Implementation */ }
    protected function getProductImageUrl($product) { /* Implementation */ }
}