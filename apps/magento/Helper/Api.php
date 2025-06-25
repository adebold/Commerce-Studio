<?php
namespace VARAi\Core\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\Helper\Context;
use Magento\Framework\HTTP\Client\Curl;
use Magento\Store\Model\ScopeInterface;
use Magento\Framework\Serialize\Serializer\Json;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\App\Cache\TypeListInterface;
use Magento\Framework\App\Cache\Frontend\Pool;

class Api extends AbstractHelper
{
    const XML_PATH_ENABLED = 'varai/api/enabled';
    const XML_PATH_API_KEY = 'varai/api/api_key';
    const XML_PATH_API_URL = 'varai/api/api_url';
    const XML_PATH_CACHE_LIFETIME = 'varai/api/cache_lifetime';
    const DEFAULT_API_URL = 'https://api.varai.ai/v1';
    const DEFAULT_CACHE_LIFETIME = 3600; // 1 hour
    const CACHE_TAG = 'varai_api';

    /**
     * @var Curl
     */
    protected $curl;

    /**
     * @var Json
     */
    protected $json;

    /**
     * @var TypeListInterface
     */
    protected $cacheTypeList;

    /**
     * @var Pool
     */
    protected $cacheFrontendPool;

    /**
     * @param Context $context
     * @param Curl $curl
     * @param Json $json
     * @param TypeListInterface $cacheTypeList
     * @param Pool $cacheFrontendPool
     */
    public function __construct(
        Context $context,
        Curl $curl,
        Json $json,
        TypeListInterface $cacheTypeList,
        Pool $cacheFrontendPool
    ) {
        parent::__construct($context);
        $this->curl = $curl;
        $this->json = $json;
        $this->cacheTypeList = $cacheTypeList;
        $this->cacheFrontendPool = $cacheFrontendPool;
    }

    /**
     * Check if module is enabled
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
     * Get API key
     *
     * @param int|null $storeId
     * @return string
     */
    protected function getApiKey($storeId = null)
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_API_KEY,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    /**
     * Get API URL
     *
     * @param int|null $storeId
     * @return string
     */
    protected function getApiUrl($storeId = null)
    {
        $url = $this->scopeConfig->getValue(
            self::XML_PATH_API_URL,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
        return $url ?: self::DEFAULT_API_URL;
    }

    /**
     * Get cache lifetime
     *
     * @param int|null $storeId
     * @return int
     */
    protected function getCacheLifetime($storeId = null)
    {
        $lifetime = (int)$this->scopeConfig->getValue(
            self::XML_PATH_CACHE_LIFETIME,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
        return $lifetime ?: self::DEFAULT_CACHE_LIFETIME;
    }

    /**
     * Generate cache key
     *
     * @param string $endpoint
     * @param array $data
     * @param string $method
     * @return string
     */
    protected function generateCacheKey($endpoint, $data, $method)
    {
        $key = 'varai_' . $method . '_' . $endpoint;
        if (!empty($data)) {
            $key .= '_' . md5($this->json->serialize($data));
        }
        return $key;
    }

    /**
     * Make API request
     *
     * @param string $endpoint
     * @param array $data
     * @param string $method
     * @param int|null $storeId
     * @param bool $useCache
     * @return array
     * @throws LocalizedException
     */
    protected function makeRequest($endpoint, $data = [], $method = 'POST', $storeId = null, $useCache = true)
    {
        if (!$this->isEnabled($storeId)) {
            throw new LocalizedException(__('VARAi is not enabled'));
        }

        $apiKey = $this->getApiKey($storeId);
        if (!$apiKey) {
            throw new LocalizedException(__('VARAi API key is not configured'));
        }

        // Check cache for GET requests
        if ($useCache && $method === 'GET') {
            $cacheKey = $this->generateCacheKey($endpoint, $data, $method);
            $cache = $this->cacheFrontendPool->get('config')->load($cacheKey);
            if ($cache) {
                return $this->json->unserialize($cache);
            }
        }

        $url = rtrim($this->getApiUrl($storeId), '/') . '/' . ltrim($endpoint, '/');

        // Set headers
        $this->curl->addHeader('Authorization', 'Bearer ' . $apiKey);
        $this->curl->addHeader('Content-Type', 'application/json');
        $this->curl->addHeader('Accept', 'application/json');
        $this->curl->addHeader('User-Agent', 'VARAi-Magento/1.1.0');

        // Make request
        try {
            if ($method === 'GET') {
                if (!empty($data)) {
                    $url .= '?' . http_build_query($data);
                }
                $this->curl->get($url);
            } else {
                $this->curl->post($url, $this->json->serialize($data));
            }

            $response = $this->curl->getBody();
            $decodedResponse = $this->json->unserialize($response);

            if ($this->curl->getStatus() >= 400) {
                $this->logApiError($endpoint, $data, $this->curl->getStatus(), $decodedResponse);
                throw new LocalizedException(
                    __('API Error: %1', $decodedResponse['message'] ?? 'Unknown error')
                );
            }

            // Cache successful GET responses
            if ($useCache && $method === 'GET') {
                $cacheKey = $this->generateCacheKey($endpoint, $data, $method);
                $this->cacheFrontendPool->get('config')->save(
                    $this->json->serialize($decodedResponse),
                    $cacheKey,
                    [self::CACHE_TAG],
                    $this->getCacheLifetime($storeId)
                );
            }

            return $decodedResponse;
        } catch (\Exception $e) {
            $this->logApiError($endpoint, $data, $this->curl->getStatus() ?? 0, ['exception' => $e->getMessage()]);
            throw new LocalizedException(__('API Request failed: %1', $e->getMessage()));
        }
    }

    /**
     * Log API error
     *
     * @param string $endpoint
     * @param array $data
     * @param int $statusCode
     * @param array $response
     * @return void
     */
    protected function logApiError($endpoint, $data, $statusCode, $response)
    {
        $this->_logger->error('VARAi API Error', [
            'endpoint' => $endpoint,
            'data' => $data,
            'status_code' => $statusCode,
            'response' => $response
        ]);
    }

    /**
     * Clear API cache
     *
     * @return void
     */
    public function clearCache()
    {
        $this->cacheTypeList->cleanType('config');
    }

    /**
     * Get product recommendations
     *
     * @param int $productId
     * @param array $options
     * @param int|null $storeId
     * @return array
     */
    public function getRecommendations($productId, $options = [], $storeId = null)
    {
        $data = array_merge(['product_id' => $productId], $options);
        return $this->makeRequest('recommendations', $data, 'POST', $storeId);
    }

    /**
     * Update product embeddings
     *
     * @param array $productData
     * @param int|null $storeId
     * @return array
     */
    public function updateProductEmbeddings($productData, $storeId = null)
    {
        return $this->makeRequest('embeddings/update', $productData, 'POST', $storeId);
    }

    /**
     * Track event
     *
     * @param string $eventType
     * @param array $eventData
     * @param int|null $storeId
     * @return array
     */
    public function trackEvent($eventType, $eventData = [], $storeId = null)
    {
        $data = array_merge(
            ['event_type' => $eventType],
            $eventData,
            ['timestamp' => date('c')]
        );
        return $this->makeRequest('events', $data, 'POST', $storeId, false);
    }

    /**
     * Get virtual try-on model
     *
     * @param int $productId
     * @param int|null $storeId
     * @return array
     */
    public function getVirtualTryOnModel($productId, $storeId = null)
    {
        return $this->makeRequest(
            'virtual-try-on/model',
            ['product_id' => $productId],
            'GET',
            $storeId
        );
    }

    /**
     * Upload virtual try-on model
     *
     * @param int $productId
     * @param string $modelFile
     * @param int|null $storeId
     * @return array
     */
    public function uploadVirtualTryOnModel($productId, $modelFile, $storeId = null)
    {
        $data = [
            'product_id' => $productId,
            'model_file' => base64_encode(file_get_contents($modelFile))
        ];
        return $this->makeRequest('virtual-try-on/model/upload', $data, 'POST', $storeId, false);
    }

    /**
     * Get style tags
     *
     * @param string $query
     * @param int|null $storeId
     * @return array
     */
    public function getStyleTags($query = '', $storeId = null)
    {
        return $this->makeRequest(
            'style-tags',
            ['query' => $query],
            'GET',
            $storeId
        );
    }

    /**
     * Get style score for product
     *
     * @param int $productId
     * @param int|null $storeId
     * @return int|null
     */
    public function getStyleScore($productId, $storeId = null)
    {
        try {
            $result = $this->makeRequest(
                'style-score',
                ['product_id' => $productId],
                'GET',
                $storeId
            );
            return isset($result['score']) ? (int)$result['score'] : null;
        } catch (\Exception $e) {
            $this->_logger->error('Failed to get style score', [
                'product_id' => $productId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get recommendation tags
     *
     * @param int $productId
     * @param int|null $storeId
     * @return array
     */
    public function getRecommendationTags($productId, $storeId = null)
    {
        try {
            $result = $this->makeRequest(
                'recommendation-tags',
                ['product_id' => $productId],
                'GET',
                $storeId
            );
            return isset($result['tags']) ? $result['tags'] : [];
        } catch (\Exception $e) {
            $this->_logger->error('Failed to get recommendation tags', [
                'product_id' => $productId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }
}
