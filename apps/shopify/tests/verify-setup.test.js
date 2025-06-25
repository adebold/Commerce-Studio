const path = require('path');
const { jest: jestConfig } = require('@jest/globals');
const axios = require('axios');
const { Shopify } = require('@shopify/shopify-api');
const ora = require('ora');
const chalk = require('chalk');

// Mock environment variables
const mockEnv = {
  SHOP_NAME: 'test-store.myshopify.com',
  SHOPIFY_ACCESS_TOKEN: 'test_token',
  SHOPIFY_API_VERSION: '2024-01',
  EYEWEAR_ML_API_URL: 'http://localhost:8000',
  EYEWEAR_ML_API_KEY: 'process.env.API_KEY_237'
};

// Mock dependencies
jest.mock('axios');
jest.mock('@shopify/shopify-api');
jest.mock('ora');
jest.mock('chalk', () => ({
  bold: jest.fn(text => text),
  red: jest.fn(text => text),
  green: jest.fn(text => text),
  yellow: jest.fn(text => text)
}));

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

describe('Verify Setup Script', () => {
  let mockSpinner;
  let originalEnv;
  
  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Set mock environment variables
    process.env = { ...mockEnv };
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock ora spinner
    mockSpinner = {
      start: jest.fn().mockReturnThis(),
      succeed: jest.fn(),
      fail: jest.fn(),
      text: ''
    };
    ora.mockReturnValue(mockSpinner);
    
    // Mock Shopify API responses
    Shopify.prototype.shop = {
      get: jest.fn().mockResolvedValue({})
    };
    
    Shopify.prototype.accessScope = {
      list: jest.fn().mockResolvedValue({
        data: [
          { handle: 'read_products' },
          { handle: 'write_products' },
          { handle: 'read_themes' },
          { handle: 'write_themes' },
          { handle: 'read_script_tags' },
          { handle: 'write_script_tags' }
        ]
      })
    };
    
    Shopify.prototype.theme = {
      list: jest.fn().mockResolvedValue([
        { id: '1', role: 'main' }
      ])
    };
    
    Shopify.prototype.asset = {
      get: jest.fn().mockResolvedValue({ /* mock asset */ })
    };
    
    // Mock axios response
    axios.get.mockResolvedValue({
      data: { status: 'healthy' }
    });
  });
  
  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });
  
  describe('Environment Variables Check', () => {
    it('should pass when all required variables are present', async () => {
      const { checkEnvironmentVariables } = require('../scripts/verify-setup');
      await checkEnvironmentVariables();
      
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Environment variables verified');
      expect(mockExit).not.toHaveBeenCalled();
    });
    
    it('should fail when required variables are missing', async () => {
      delete process.env.SHOPIFY_ACCESS_TOKEN;
      
      const { checkEnvironmentVariables } = require('../scripts/verify-setup');
      await checkEnvironmentVariables();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith('Missing required environment variables:');
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
  
  describe('Shopify API Access Check', () => {
    it('should pass when API access is valid', async () => {
      const { checkShopifyAccess } = require('../scripts/verify-setup');
      await checkShopifyAccess();
      
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Shopify API access verified');
      expect(mockSpinner.succeed).toHaveBeenCalledWith('API permissions verified');
      expect(mockExit).not.toHaveBeenCalled();
    });
    
    it('should fail when API access is invalid', async () => {
      Shopify.prototype.shop.get.mockRejectedValueOnce(new Error('Invalid token'));
      
      const { checkShopifyAccess } = require('../scripts/verify-setup');
      await checkShopifyAccess();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith('Shopify API error: Invalid token');
      expect(mockExit).toHaveBeenCalledWith(1);
    });
    
    it('should fail when required scopes are missing', async () => {
      Shopify.prototype.accessScope.list.mockResolvedValueOnce({
        data: [{ handle: 'read_products' }] // Missing required scopes
      });
      
      const { checkShopifyAccess } = require('../scripts/verify-setup');
      await checkShopifyAccess();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith('Missing required Shopify API scopes:');
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
  
  describe('EyewearML API Access Check', () => {
    it('should pass when API is healthy', async () => {
      const { checkEyewearMLAccess } = require('../scripts/verify-setup');
      await checkEyewearMLAccess();
      
      expect(mockSpinner.succeed).toHaveBeenCalledWith('EyewearML API access verified');
      expect(mockExit).not.toHaveBeenCalled();
    });
    
    it('should fail when API is unhealthy', async () => {
      axios.get.mockResolvedValueOnce({
        data: { status: 'unhealthy' }
      });
      
      const { checkEyewearMLAccess } = require('../scripts/verify-setup');
      await checkEyewearMLAccess();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith('EyewearML API error: API health check failed');
      expect(mockExit).toHaveBeenCalledWith(1);
    });
    
    it('should fail when API request fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('Connection refused'));
      
      const { checkEyewearMLAccess } = require('../scripts/verify-setup');
      await checkEyewearMLAccess();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith('EyewearML API error: Connection refused');
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
  
  describe('Theme Integration Check', () => {
    it('should pass when virtual try-on component is installed', async () => {
      const { checkThemeIntegration } = require('../scripts/verify-setup');
      await checkThemeIntegration();
      
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Theme integration verified');
      expect(mockExit).not.toHaveBeenCalled();
    });
    
    it('should fail when no main theme is found', async () => {
      Shopify.prototype.theme.list.mockResolvedValueOnce([
        { id: '1', role: 'unpublished' }
      ]);
      
      const { checkThemeIntegration } = require('../scripts/verify-setup');
      await checkThemeIntegration();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith('Theme integration error: No main theme found');
      expect(mockExit).toHaveBeenCalledWith(1);
    });
    
    it('should fail when virtual try-on component is missing', async () => {
      Shopify.prototype.asset.get.mockResolvedValueOnce(null);
      
      const { checkThemeIntegration } = require('../scripts/verify-setup');
      await checkThemeIntegration();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith('Virtual try-on component not found in theme');
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
  
  describe('Complete Verification', () => {
    it('should complete successfully when all checks pass', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      const { verifySetup } = require('../scripts/verify-setup');
      await verifySetup();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Setup verification complete'));
      expect(mockExit).not.toHaveBeenCalled();
    });
    
    it('should fail when any check fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('API Error'));
      
      const { verifySetup } = require('../scripts/verify-setup');
      await verifySetup();
      
      expect(mockExit).toHaveBeenCalledWith(1);
    });
    
    it('should display debug information when debug flag is set', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('Test Error');
      axios.get.mockRejectedValueOnce(error);
      
      const { verifySetup } = require('../scripts/verify-setup');
      process.argv.push('--debug');
      await verifySetup();
      
      expect(consoleSpy).toHaveBeenCalledWith(error);
      expect(mockExit).toHaveBeenCalledWith(1);
      
      // Clean up
      process.argv.pop();
    });
  });
});
