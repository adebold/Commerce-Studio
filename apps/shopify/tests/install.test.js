const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');

// Mock dependencies
jest.mock('child_process');
jest.mock('fs');
jest.mock('inquirer');
jest.mock('ora');
jest.mock('chalk', () => ({
  bold: jest.fn(text => text),
  green: jest.fn(text => text),
  yellow: jest.fn(text => text),
  red: jest.fn(text => text)
}));

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

describe('Installation Script', () => {
  let mockSpinner;
  let mockAnswers;
  
  beforeEach(() => {
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
    
    // Mock inquirer responses
    mockAnswers = {
      proceed: true,
      shopName: 'test-store.myshopify.com',
      accessToken: 'test_token',
      eyewearMLApiKey: 'process.env.APIKEY_2531',
      analytics: true,
      automaticSync: true
    };
    inquirer.prompt.mockResolvedValue(mockAnswers);
    
    // Mock file system
    fs.writeFileSync.mockImplementation(() => {});
    
    // Mock execSync
    execSync.mockImplementation(() => {});
  });
  
  describe('Introduction', () => {
    it('should proceed when user confirms prerequisites', async () => {
      const { showIntro } = require('../scripts/install');
      await showIntro();
      
      expect(mockExit).not.toHaveBeenCalled();
    });
    
    it('should exit when user lacks prerequisites', async () => {
      inquirer.prompt.mockResolvedValueOnce({ proceed: false });
      
      const { showIntro } = require('../scripts/install');
      await showIntro();
      
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });
  
  describe('Credential Gathering', () => {
    it('should validate and return credentials', async () => {
      const { gatherCredentials } = require('../scripts/install');
      const credentials = await gatherCredentials();
      
      expect(credentials).toEqual(mockAnswers);
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Credentials validated successfully');
    });
    
    it('should fail with invalid Shopify credentials', async () => {
      // Mock validation failure
      const { validateShopifyCredentials } = require('../scripts/install');
      jest.spyOn(validateShopifyCredentials, 'mockReturnValueOnce').mockResolvedValueOnce(false);
      
      const { gatherCredentials } = require('../scripts/install');
      await gatherCredentials();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith(expect.stringContaining('Invalid Shopify credentials'));
      expect(mockExit).toHaveBeenCalledWith(1);
    });
    
    it('should fail with invalid EyewearML API key', async () => {
      // Mock validation failure
      const { validateEyewearMLApiKey } = require('../scripts/install');
      jest.spyOn(validateEyewearMLApiKey, 'mockReturnValueOnce').mockResolvedValueOnce(false);
      
      const { gatherCredentials } = require('../scripts/install');
      await gatherCredentials();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith(expect.stringContaining('Invalid EyewearML API key'));
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
  
  describe('Environment Setup', () => {
    it('should create .env file with credentials', async () => {
      const { setupEnvironment } = require('../scripts/install');
      await setupEnvironment(mockAnswers);
      
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Environment configuration created');
    });
    
    it('should handle file system errors', async () => {
      fs.writeFileSync.mockImplementationOnce(() => {
        throw new Error('Write error');
      });
      
      const { setupEnvironment } = require('../scripts/install');
      await setupEnvironment(mockAnswers);
      
      expect(mockSpinner.fail).toHaveBeenCalledWith(expect.stringContaining('Environment setup failed'));
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
  
  describe('Dependency Installation', () => {
    it('should install npm packages', async () => {
      const { installDependencies } = require('../scripts/install');
      await installDependencies();
      
      expect(execSync).toHaveBeenCalledWith('npm install', expect.any(Object));
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Dependencies installed successfully');
    });
    
    it('should handle installation errors', async () => {
      execSync.mockImplementationOnce(() => {
        throw new Error('Installation error');
      });
      
      const { installDependencies } = require('../scripts/install');
      await installDependencies();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith(expect.stringContaining('Dependency installation failed'));
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
  
  describe('Setup Verification', () => {
    it('should verify setup successfully', async () => {
      const { verifySetup } = require('../scripts/install');
      await verifySetup();
      
      expect(execSync).toHaveBeenCalledWith('npm run verify', expect.any(Object));
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Setup verified successfully');
    });
    
    it('should handle verification failures', async () => {
      execSync.mockImplementationOnce(() => {
        throw new Error('Verification error');
      });
      
      const { verifySetup } = require('../scripts/install');
      await verifySetup();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith(expect.stringContaining('Verification failed'));
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
  
  describe('Component Deployment', () => {
    it('should deploy theme components', async () => {
      const { deployComponents } = require('../scripts/install');
      await deployComponents();
      
      expect(execSync).toHaveBeenCalledWith('npm run demo:try-on-only', expect.any(Object));
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Theme components installed successfully');
    });
    
    it('should handle deployment failures', async () => {
      execSync.mockImplementationOnce(() => {
        throw new Error('Deployment error');
      });
      
      const { deployComponents } = require('../scripts/install');
      await deployComponents();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith(expect.stringContaining('Deployment failed'));
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
  
  describe('Complete Installation', () => {
    it('should complete installation successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      const { main } = require('../scripts/install');
      await main();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Installation completed successfully'));
      expect(mockExit).not.toHaveBeenCalled();
    });
    
    it('should handle installation failures', async () => {
      execSync.mockImplementationOnce(() => {
        throw new Error('Installation error');
      });
      
      const { main } = require('../scripts/install');
      await main();
      
      expect(mockExit).toHaveBeenCalledWith(1);
    });
    
    it('should show debug information when debug flag is set', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('Test Error');
      execSync.mockImplementationOnce(() => {
        throw error;
      });
      
      const { main } = require('../scripts/install');
      process.argv.push('--debug');
      await main();
      
      expect(consoleSpy).toHaveBeenCalledWith(error);
      expect(mockExit).toHaveBeenCalledWith(1);
      
      // Clean up
      process.argv.pop();
    });
  });
  
  describe('Environment File Generation', () => {
    it('should generate correct environment content', () => {
      const { generateEnvContent } = require('../scripts/install');
      const envContent = generateEnvContent(mockAnswers);
      
      expect(envContent).toContain(`SHOP_NAME=${mockAnswers.shopName}`);
      expect(envContent).toContain(`SHOPIFY_ACCESS_TOKEN=${mockAnswers.accessToken}`);
      expect(envContent).toContain(`EYEWEAR_ML_API_KEY=${mockAnswers.eyewearMLApiKey}`);
      expect(envContent).toContain(`ANALYTICS_ENABLED=${mockAnswers.analytics}`);
      expect(envContent).toContain(`AUTOMATIC_SYNC_ENABLED=${mockAnswers.automaticSync}`);
    });
  });
});
