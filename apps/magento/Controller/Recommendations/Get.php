<?php
namespace EyewearML\Core\Controller\Recommendations;

use Magento\Framework\App\Action\HttpGetActionInterface;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\App\RequestInterface;
use EyewearML\Core\Helper\Api as ApiHelper;
use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\Pricing\Helper\Data as PricingHelper;

class Get implements HttpGetActionInterface
{
    /**
     * @var JsonFactory
     */
    private $resultJsonFactory;

    /**
     * @var RequestInterface
     */
    private $request;

    /**
     * @var ApiHelper
     */
    private $apiHelper;

    /**
     * @var ProductRepositoryInterface
     */
    private $productRepository;

    /**
     * @var StoreManagerInterface
     */
    private $storeManager;

    /**
     * @var PricingHelper
     */
    private $pricingHelper;

    /**
     * @param JsonFactory $resultJsonFactory
     * @param RequestInterface $request
     * @param ApiHelper $apiHelper
     * @param ProductRepositoryInterface $productRepository
     * @param StoreManagerInterface $storeManager
     * @param PricingHelper $pricingHelper
     */
    public function __construct(
        JsonFactory $resultJsonFactory,
        RequestInterface $request,
        ApiHelper $apiHelper,
        ProductRepositoryInterface $productRepository,
        StoreManagerInterface $storeManager,
        PricingHelper $pricingHelper
    ) {
        $this->resultJsonFactory = $resultJsonFactory;
        $this->request = $request;
        $this->apiHelper = $apiHelper;
        $this->productRepository = $productRepository;
        $this->storeManager = $storeManager;
        $this->pricingHelper = $pricingHelper;
    }

    /**
     * Execute action
     *
     * @return \Magento\Framework\Controller\Result\Json
     */
    public function execute()
    {
        $result = $this->resultJsonFactory->create();

        try {
            $productId = $this->request->getParam('product_id');
            if (!$productId) {
                throw new \InvalidArgumentException('Product ID is required');
            }

            $type = $this->request->getParam('type', 'similar_items');
            $limit = (int) $this->request->getParam('limit', 4);

            // Get recommendations from API
            $recommendationData = $this->apiHelper->getRecommendations($productId, [
                'type' => $type,
                'limit' => $limit
            ]);

            // Format recommendations with product data
            $recommendations = [];
            foreach ($recommendationData['recommendations'] as $rec) {
                try {
                    $product = $this->productRepository->getById($rec['product_id']);
                    $recommendations[] = [
                        'id' => $product->getId(),
                        'name' => $product->getName(),
                        'sku' => $product->getSku(),
                        'url' => $product->getProductUrl(),
                        'image' => $this->getProductImageUrl($product),
                        'price' => $product->getFinalPrice(),
                        'formatted_price' => $this->pricingHelper->currency($product->getFinalPrice(), true, false),
                        'score' => $rec['score'] ?? null
                    ];
                } catch (NoSuchEntityException $e) {
                    continue; // Skip if product not found
                }
            }

            return $result->setData([
                'success' => true,
                'recommendations' => $recommendations
            ]);
        } catch (\Exception $e) {
            return $result->setData([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get product image URL
     *
     * @param \Magento\Catalog\Model\Product $product
     * @return string
     */
    private function getProductImageUrl($product)
    {
        $store = $this->storeManager->getStore();
        return $store->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_MEDIA)
            . 'catalog/product' . $product->getImage();
    }
}
