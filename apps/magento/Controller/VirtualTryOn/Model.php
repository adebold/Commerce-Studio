<?php
namespace EyewearML\Core\Controller\VirtualTryOn;

use Magento\Framework\App\Action\HttpGetActionInterface;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\App\RequestInterface;
use EyewearML\Core\Helper\Api as ApiHelper;
use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Framework\Exception\NoSuchEntityException;

class Model implements HttpGetActionInterface
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
     * @param JsonFactory $resultJsonFactory
     * @param RequestInterface $request
     * @param ApiHelper $apiHelper
     * @param ProductRepositoryInterface $productRepository
     */
    public function __construct(
        JsonFactory $resultJsonFactory,
        RequestInterface $request,
        ApiHelper $apiHelper,
        ProductRepositoryInterface $productRepository
    ) {
        $this->resultJsonFactory = $resultJsonFactory;
        $this->request = $request;
        $this->apiHelper = $apiHelper;
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
            $productId = $this->request->getParam('product_id');
            if (!$productId) {
                throw new \InvalidArgumentException('Product ID is required');
            }

            $product = $this->productRepository->getById($productId);
            $modelData = $this->apiHelper->getVirtualTryOnModel($productId);

            return $result->setData([
                'success' => true,
                'model_url' => $modelData['model_url'] ?? null,
                'product_name' => $product->getName(),
                'product_sku' => $product->getSku()
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
