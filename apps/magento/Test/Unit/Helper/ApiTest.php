<?php
namespace VARAi\Core\Test\Unit\Helper;

use Magento\Framework\App\Helper\Context;
use Magento\Framework\HTTP\Client\Curl;
use Magento\Framework\Serialize\Serializer\Json;
use Magento\Framework\App\Cache\TypeListInterface;
use Magento\Framework\App\Cache\Frontend\Pool;
use Magento\Framework\TestFramework\Unit\Helper\ObjectManager;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;
use VARAi\Core\Helper\Api;

class ApiTest extends TestCase
{
    /**
     * @var Api
     */
    private $apiHelper;

    /**
     * @var Context|MockObject
     */
    private $contextMock;

    /**
     * @var Curl|MockObject
     */
    private $curlMock;

    /**
     * @var Json|MockObject
     */
    private $jsonMock;

    /**
     * @var TypeListInterface|MockObject
     */
    private $cacheTypeListMock;

    /**
     * @var Pool|MockObject
     */
    private $cacheFrontendPoolMock;

    /**
     * @var \Magento\Framework\App\Config\ScopeConfigInterface|MockObject
     */
    private $scopeConfigMock;

    /**
     * @var \Psr\Log\LoggerInterface|MockObject
     */
    private $loggerMock;

    /**
     * Set up test environment
     */
    protected function setUp(): void
    {
        $objectManager = new ObjectManager($this);

        $this->contextMock = $this->createMock(Context::class);
        $this->curlMock = $this->createMock(Curl::class);
        $this->jsonMock = $this->createMock(Json::class);
        $this->cacheTypeListMock = $this->createMock(TypeListInterface::class);
        $this->cacheFrontendPoolMock = $this->createMock(Pool::class);
        $this->scopeConfigMock = $this->createMock(\Magento\Framework\App\Config\ScopeConfigInterface::class);
        $this->loggerMock = $this->createMock(\Psr\Log\LoggerInterface::class);

        // Set up context mock
        $this->contextMock->expects($this->any())
            ->method('getScopeConfig')
            ->willReturn($this->scopeConfigMock);
        $this->contextMock->expects($this->any())
            ->method('getLogger')
            ->willReturn($this->loggerMock);

        $this->apiHelper = $objectManager->getObject(
            Api::class,
            [
                'context' => $this->contextMock,
                'curl' => $this->curlMock,
                'json' => $this->jsonMock,
                'cacheTypeList' => $this->cacheTypeListMock,
                'cacheFrontendPool' => $this->cacheFrontendPoolMock
            ]
        );
    }

    /**
     * Test isEnabled method
     */
    public function testIsEnabled()
    {
        $this->scopeConfigMock->expects($this->once())
            ->method('isSetFlag')
            ->with(
                Api::XML_PATH_ENABLED,
                \Magento\Store\Model\ScopeInterface::SCOPE_STORE,
                null
            )
            ->willReturn(true);

        $this->assertTrue($this->apiHelper->isEnabled());
    }

    /**
     * Test getStyleScore method
     */
    public function testGetStyleScore()
    {
        // Mock the API response
        $expectedScore = 85;
        $apiResponse = ['score' => $expectedScore];
        
        // Set up mocks for makeRequest method
        $this->setUpMakeRequestMock('style-score', ['product_id' => 123], 'GET', $apiResponse);
        
        // Call the method
        $result = $this->apiHelper->getStyleScore(123);
        
        // Assert the result
        $this->assertEquals($expectedScore, $result);
    }

    /**
     * Test getRecommendationTags method
     */
    public function testGetRecommendationTags()
    {
        // Mock the API response
        $expectedTags = ['casual', 'modern', 'lightweight'];
        $apiResponse = ['tags' => $expectedTags];
        
        // Set up mocks for makeRequest method
        $this->setUpMakeRequestMock('recommendation-tags', ['product_id' => 123], 'GET', $apiResponse);
        
        // Call the method
        $result = $this->apiHelper->getRecommendationTags(123);
        
        // Assert the result
        $this->assertEquals($expectedTags, $result);
    }

    /**
     * Test getRecommendations method
     */
    public function testGetRecommendations()
    {
        // Mock the API response
        $expectedRecommendations = [
            ['id' => 1, 'name' => 'Product 1', 'style_score' => 90],
            ['id' => 2, 'name' => 'Product 2', 'style_score' => 85]
        ];
        $apiResponse = ['recommendations' => $expectedRecommendations];
        
        // Set up mocks for makeRequest method
        $this->setUpMakeRequestMock('recommendations', ['product_id' => 123], 'POST', $apiResponse);
        
        // Call the method
        $result = $this->apiHelper->getRecommendations(123);
        
        // Assert the result
        $this->assertEquals($apiResponse, $result);
    }

    /**
     * Test error handling in getStyleScore method
     */
    public function testGetStyleScoreErrorHandling()
    {
        // Set up mocks to throw an exception
        $this->scopeConfigMock->expects($this->once())
            ->method('isSetFlag')
            ->willReturn(true);
        
        $this->scopeConfigMock->expects($this->once())
            ->method('getValue')
            ->with(Api::XML_PATH_API_KEY)
            ->willReturn('test_api_key');
            
        $this->curlMock->expects($this->once())
            ->method('get')
            ->willThrowException(new \Exception('API Error'));
            
        $this->loggerMock->expects($this->once())
            ->method('error')
            ->with('Failed to get style score');
        
        // Call the method
        $result = $this->apiHelper->getStyleScore(123);
        
        // Assert the result is null on error
        $this->assertNull($result);
    }

    /**
     * Helper method to set up mocks for makeRequest method
     */
    private function setUpMakeRequestMock($endpoint, $data, $method, $response)
    {
        // Mock isEnabled
        $this->scopeConfigMock->expects($this->once())
            ->method('isSetFlag')
            ->willReturn(true);
        
        // Mock getApiKey
        $this->scopeConfigMock->expects($this->once())
            ->method('getValue')
            ->with(Api::XML_PATH_API_KEY)
            ->willReturn('test_api_key');
        
        // Mock curl request
        if ($method === 'GET') {
            $this->curlMock->expects($this->once())
                ->method('get')
                ->willReturn(null);
        } else {
            $this->curlMock->expects($this->once())
                ->method('post')
                ->willReturn(null);
        }
        
        // Mock getBody
        $this->curlMock->expects($this->once())
            ->method('getBody')
            ->willReturn(json_encode($response));
        
        // Mock getStatus
        $this->curlMock->expects($this->once())
            ->method('getStatus')
            ->willReturn(200);
        
        // Mock json unserialize
        $this->jsonMock->expects($this->once())
            ->method('unserialize')
            ->willReturn($response);
    }
}