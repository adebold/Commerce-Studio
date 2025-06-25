<?php
namespace EyewearML\Core\Controller\Analytics;

use Magento\Framework\App\Action\HttpPostActionInterface;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\App\RequestInterface;
use EyewearML\Core\Helper\Analytics as AnalyticsHelper;
use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Framework\Exception\NoSuchEntityException;

class Track implements HttpPostActionInterface
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
     * @var AnalyticsHelper
     */
    private $analyticsHelper;

    /**
     * @var ProductRepositoryInterface
     */
    private $productRepository;

    /**
     * @param JsonFactory $resultJsonFactory
     * @param RequestInterface $request
     * @param AnalyticsHelper $analyticsHelper
     * @param ProductRepositoryInterface $productRepository
     */
    public function __construct(
        JsonFactory $resultJsonFactory,
        RequestInterface $request,
        AnalyticsHelper $analyticsHelper,
        ProductRepositoryInterface $productRepository
    ) {
        $this->resultJsonFactory = $resultJsonFactory;
        $this->request = $request;
        $this->analyticsHelper = $analyticsHelper;
        $this->productRepository = $productRepository;
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
            $event = $this->request->getParam('event');
            if (!$event) {
                throw new \InvalidArgumentException('Event type is required');
            }

            $productId = $this->request->getParam('product_id');
            if (!$productId) {
                throw new \InvalidArgumentException('Product ID is required');
            }

            $product = $this->productRepository->getById($productId);
            $eventData = $this->request->getParam('data', []);

            // Track event based on type
            switch ($event) {
                case 'view_item':
                    $this->analyticsHelper->trackProductView($product);
                    break;
                case 'try_on':
                    $this->analyticsHelper->trackVirtualTryOn($product);
                    break;
                case 'view_recommendation':
                    $recommendationData = $eventData['recommendation'] ?? [];
                    $this->analyticsHelper->trackRecommendationImpression($product, $recommendationData);
                    break;
                case 'select_recommendation':
                    $recommendationData = $eventData['recommendation'] ?? [];
                    $this->analyticsHelper->trackRecommendationClick($product, $recommendationData);
                    break;
                default:
                    throw new \InvalidArgumentException('Invalid event type');
            }

            return $result->setData([
                'success' => true
            ]);
        } catch (NoSuchEntityException $e) {
            return $result->setData([
                'success' => false,
                'message' => __('Product not found')
            ]);
        } catch (\Exception $e) {
            return $result->setData([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
}
