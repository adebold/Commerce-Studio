const path = require('path');
const { jest: jestConfig } = require('@jest/globals');
const axios = require('axios');
const { Shopify } = require('@shopify/shopify-api');
const ora = require('ora');
const chalk = require('chalk');

// Mock environment variables
process.env.SHOP_NAME = 'test-shop';
process.env.SHOPIFY_ACCESS_TOKEN = 'test-token';
process.env.EYEWEAR_ML_API_KEY = 'process.env.API_KEY_235';

// Mock dependencies
jest.mock('axios');
jest.mock('@shopify/shopify-api');
jest.mock('ora');
jest.mock('chalk', () => ({
  bold: jest.fn(text => text),
  blue: jest.fn(text => text),
  green: jest.fn(text => text),
  red: jest.fn(text => text)
}));

// Import the demo script
const demoPath = path.join(__dirname, '../scripts/demo.js');
jest.mock(demoPath, () => require(demoPath));
const demo = require(demoPath);

describe('Shopify Demo Script', () => {
  let mockSpinner;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock ora spinner
    mockSpinner = {
      start: jest.fn().mockReturnThis(),
      text: '',
      succeed: jest.fn(),
      fail: jest.fn()
    };
    ora.mockReturnValue(mockSpinner);
    
    // Mock Shopify API responses
    Shopify.prototype.product = {
      list: jest.fn().mockResolvedValue([
        {
          id: '1',
          title: 'Test Product 1',
          images: [{ src: 'https://example.com/image1.jpg' }],
          variants: [
            {
              sku: 'SKU1',
              price: '99.99',
              inventory_quantity: 10
            }
          ]
        }
      ])
    };
    
    Shopify.prototype.theme = {
      list: jest.fn().mockResolvedValue([
        {
          id: '1',
          role: 'main'
        }
      ])
    };
    
    Shopify.prototype.asset = {
      create: jest.fn().mockResolvedValue({})
    };
  });
  
  describe('importProducts', () => {
    it('should successfully import products', async () => {
      // Mock successful API responses
      axios.post.mockResolvedValueOnce({ data: { job_id: '123' } });
      axios.get
        .mockResolvedValueOnce({ data: { status: 'processing', progress: 50 } })
        .mockResolvedValueOnce({ data: { status: 'completed', result: { total_products: 1 } } });
      
      const result = await demo.importProducts();
      
      expect(result).toEqual({ total_products: 1 });
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Import completed successfully');
    });
    
    it('should handle import failures', async () => {
      // Mock API error
      axios.post.mockRejectedValueOnce(new Error('API Error'));
      
      await expect(demo.importProducts()).rejects.toThrow('API Error');
      expect(mockSpinner.fail).toHaveBeenCalled();
    });
    
    it('should handle job failure', async () => {
      axios.post.mockResolvedValueOnce({ data: { job_id: '123' } });
      axios.get.mockResolvedValueOnce({ 
        data: { 
          status: 'failed',
          error: 'Processing failed'
        }
      });
      
      await expect(demo.importProducts()).rejects.toThrow('Processing failed');
      expect(mockSpinner.fail).toHaveBeenCalled();
    });
  });
  
  describe('generateRecommendations', () => {
    it('should successfully generate recommendations', async () => {
      // Mock successful recommendation generation
      axios.post.mockResolvedValueOnce({
        data: [
          {
            product_title: 'Test Product',
            confidence: 0.95,
            similar_products: [
              { title: 'Similar Product 1' }
            ]
          }
        ]
      });
      
      const result = await demo.generateRecommendations();
      
      expect(result).toHaveLength(1);
      expect(result[0].product_title).toBe('Test Product');
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Recommendations generated successfully');
    });
    
    it('should handle recommendation generation failures', async () => {
      axios.post.mockRejectedValueOnce(new Error('Generation failed'));
      
      await expect(demo.generateRecommendations()).rejects.toThrow('Generation failed');
      expect(mockSpinner.fail).toHaveBeenCalled();
    });
  });
  
  describe('setupVirtualTryOn', () => {
    it('should successfully set up virtual try-on', async () => {
      await demo.setupVirtualTryOn();
      
      expect(Shopify.prototype.asset.create).toHaveBeenCalled();
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Virtual try-on component installed');
    });
    
    it('should handle setup failures', async () => {
      Shopify.prototype.theme.list.mockRejectedValueOnce(new Error('Theme error'));
      
      await expect(demo.setupVirtualTryOn()).rejects.toThrow('Theme error');
      expect(mockSpinner.fail).toHaveBeenCalled();
    });
  });
  
  describe('displayDemoResults', () => {
    it('should display all sections when all features are used', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      demo.displayDemoResults({
        import: {
          total_products: 10,
          processed_images: 20,
          processing_time: 30
        },
        recommendations: [
          {
            product_title: 'Product 1',
            confidence: 0.9,
            similar_products: [{ title: 'Similar 1' }]
          }
        ],
        virtualTryOn: true
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Total products: 10'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Product 1'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Virtual Try-On Setup'));
    });
  });
  
  describe('main', () => {
    it('should run all steps by default', async () => {
      // Mock successful responses for all steps
      axios.post
        .mockResolvedValueOnce({ data: { job_id: '123' } }) // Import
        .mockResolvedValueOnce({ data: [] }); // Recommendations
      
      axios.get.mockResolvedValueOnce({
        data: { status: 'completed', result: { total_products: 1 } }
      });
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      await demo.main();
      
      expect(exitSpy).not.toHaveBeenCalled();
    });
    
    it('should handle errors gracefully', async () => {
      axios.post.mockRejectedValueOnce(new Error('Test error'));
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'error');
      
      await demo.main();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Demo failed'));
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
    
    it('should respect skip flags', async () => {
      // Mock command line arguments
      process.argv = ['node', 'demo.js', '--skip-import', '--skip-recommendations'];
      
      await demo.main();
      
      expect(axios.post).not.toHaveBeenCalled(); // No API calls should be made
      expect(Shopify.prototype.asset.create).toHaveBeenCalled(); // Virtual try-on should still be set up
    });
  });
});
