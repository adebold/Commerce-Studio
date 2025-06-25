<?php
namespace EyewearML\Core\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\Helper\Context;
use Magento\Store\Model\ScopeInterface;
use Magento\Framework\View\Asset\Repository;
use Magento\Framework\View\Element\Context as ViewContext;

class Analytics extends AbstractHelper
{
    const XML_PATH_ENABLED = 'eyewearml/analytics/enabled';
    const XML_PATH_GA4_ID = 'eyewearml/analytics/ga4_measurement_id';
    const XML_PATH_TRACK_PRODUCTS = 'eyewearml/analytics/track_product_views';
    const XML_PATH_TRACK_TRY_ONS = 'eyewearml/analytics/track_try_ons';
    const XML_PATH_TRACK_RECOMMENDATIONS = 'eyewearml/analytics/track_recommendations';

    /**
     * @var Repository
     */
    protected $assetRepo;

    /**
     * @var Api
     */
    protected $apiHelper;

    /**
     * @param Context $context
     * @param Repository $assetRepo
     * @param Api $apiHelper
     */
    public function __construct(
        Context $context,
        Repository $assetRepo,
        Api $apiHelper
    ) {
        parent::__construct($context);
        $this->assetRepo = $assetRepo;
        $this->apiHelper = $apiHelper;
    }

    /**
     * Check if analytics is enabled
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
     * Get GA4 Measurement ID
     *
     * @param int|null $storeId
     * @return string
     */
    public function getGA4MeasurementId($storeId = null)
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_GA4_ID,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    /**
     * Check if product tracking is enabled
     *
     * @param int|null $storeId
     * @return bool
     */
    public function isProductTrackingEnabled($storeId = null)
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_TRACK_PRODUCTS,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    /**
     * Check if try-on tracking is enabled
     *
     * @param int|null $storeId
     * @return bool
     */
    public function isTryOnTrackingEnabled($storeId = null)
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_TRACK_TRY_ONS,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    /**
     * Check if recommendation tracking is enabled
     *
     * @param int|null $storeId
     * @return bool
     */
    public function isRecommendationTrackingEnabled($storeId = null)
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_TRACK_RECOMMENDATIONS,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
    }

    /**
     * Get tracking script URL
     *
     * @return string
     */
    public function getTrackingScriptUrl()
    {
        return $this->assetRepo->getUrl('EyewearML_Core::js/analytics.js');
    }

    /**
     * Get tracking configuration
     *
     * @param int|null $storeId
     * @return array
     */
    public function getTrackingConfig($storeId = null)
    {
        return [
            'enabled' => $this->isEnabled($storeId),
            'ga4_measurement_id' => $this->getGA4MeasurementId($storeId),
            'track_products' => $this->isProductTrackingEnabled($storeId),
            'track_try_ons' => $this->isTryOnTrackingEnabled($storeId),
            'track_recommendations' => $this->isRecommendationTrackingEnabled($storeId),
        ];
    }

    /**
     * Track product view
     *
     * @param \Magento\Catalog\Model\Product $product
     * @return void
     */
    public function trackProductView($product)
    {
        if (!$this->isEnabled() || !$this->isProductTrackingEnabled()) {
            return;
        }

        $eventData = [
            'product_id' => $product->getId(),
            'name' => $product->getName(),
            'sku' => $product->getSku(),
            'price' => $product->getFinalPrice(),
            'currency' => $this->_storeManager->getStore()->getCurrentCurrencyCode(),
        ];

        $this->apiHelper->trackEvent('view_item', $eventData);
    }

    /**
     * Track virtual try-on
     *
     * @param \Magento\Catalog\Model\Product $product
     * @return void
     */
    public function trackVirtualTryOn($product)
    {
        if (!$this->isEnabled() || !$this->isTryOnTrackingEnabled()) {
            return;
        }

        $eventData = [
            'product_id' => $product->getId(),
            'name' => $product->getName(),
            'sku' => $product->getSku(),
        ];

        $this->apiHelper->trackEvent('try_on', $eventData);
    }

    /**
     * Track recommendation impression
     *
     * @param \Magento\Catalog\Model\Product $product
     * @param array $recommendationData
     * @return void
     */
    public function trackRecommendationImpression($product, $recommendationData)
    {
        if (!$this->isEnabled() || !$this->isRecommendationTrackingEnabled()) {
            return;
        }

        $eventData = [
            'product_id' => $product->getId(),
            'name' => $product->getName(),
            'sku' => $product->getSku(),
            'price' => $product->getFinalPrice(),
            'currency' => $this->_storeManager->getStore()->getCurrentCurrencyCode(),
            'recommendation_type' => $recommendationData['type'] ?? 'similar_items',
            'recommendation_score' => $recommendationData['score'] ?? null,
        ];

        $this->apiHelper->trackEvent('view_recommendation', $eventData);
    }

    /**
     * Track recommendation click
     *
     * @param \Magento\Catalog\Model\Product $product
     * @param array $recommendationData
     * @return void
     */
    public function trackRecommendationClick($product, $recommendationData)
    {
        if (!$this->isEnabled() || !$this->isRecommendationTrackingEnabled()) {
            return;
        }

        $eventData = [
            'product_id' => $product->getId(),
            'name' => $product->getName(),
            'sku' => $product->getSku(),
            'price' => $product->getFinalPrice(),
            'currency' => $this->_storeManager->getStore()->getCurrentCurrencyCode(),
            'recommendation_type' => $recommendationData['type'] ?? 'similar_items',
            'recommendation_score' => $recommendationData['score'] ?? null,
        ];

        $this->apiHelper->trackEvent('select_recommendation', $eventData);
    }
}
