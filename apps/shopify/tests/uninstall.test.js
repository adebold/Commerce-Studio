const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const { Shopify } = require('@shopify/shopify-api');

// Mock dependencies
jest.mock('fs');
jest.mock('inquirer');
jest.mock('ora');
jest.mock('@shopify/shopify-api');
jest.mock('chalk', () => ({
  bold: jest.fn(text => text),
  green: jest.fn(text => text),
  yellow: jest.fn(text => text),
  red: jest.fn(text => text)
}));

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

describe('Uninstall Script', () => {
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
      options: ['theme', 'env', 'data']
    };
    inquirer.prompt.mockResolvedValue(mockAnswers);
    
    // Mock file system
    fs.existsSync.mockReturnValue(true);
    fs.unlinkSync.mockImplementation(() => {});
    fs.rmSync.mockImplementation(() => {});
    
    // Mock Shopify API
    Shopify.prototype.theme = {
      list: jest.fn().mockResolvedValue([
        { id: '1', role: 'main' }
      ])
    };
    
    Shopify.prototype.asset = {
      delete: jest.fn().mockResolvedValue({})
    };
  });
  
  describe('Uninstallation Confirmation', () => {
    it('should proceed when user confirms', async () => {
      const { confirmUninstall } = require('../scripts/uninstall');
      const options = await confirmUninstall();
      
      expect(options).toEqual(['theme', 'env', 'data']);
      expect(mockExit).not.toHaveBeenCalled();
    });
    
    it('should exit when user cancels', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ proceed: false })
        .mockResolvedValueOnce({ options: [] });
      
      const { confirmUninstall } = require('../scripts/uninstall');
      await confirmUninstall();
      
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });
  
  describe('Theme Component Removal', () => {
    it('should remove theme components successfully', async () => {
      const { removeThemeComponents } = require('../scripts/uninstall');
      await removeThemeComponents();
      
      expect(Shopify.prototype.theme.list).toHaveBeenCalled();
      expect(Shopify.prototype.asset.delete).toHaveBeenCalled();
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Theme components removed');
    });
    
    it('should handle missing theme gracefully', async () => {
      Shopify.prototype.theme.list.mockResolvedValueOnce([
        { id: '1', role: 'unpublished' }
      ]);
      
      const { removeThemeComponents } = require('../scripts/uninstall');
      await removeThemeComponents();
      
      expect(Shopify.prototype.asset.delete).not.toHaveBeenCalled();
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Theme components removed');
    });
    
    it('should handle API errors', async () => {
      Shopify.prototype.theme.list.mockRejectedValueOnce(new Error('API Error'));
      
      const { removeThemeComponents } = require('../scripts/uninstall');
      await removeThemeComponents();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith(expect.stringContaining('Failed to remove theme components'));
    });
  });
  
  describe('Environment File Removal', () => {
    it('should remove .env file', async () => {
      const { removeEnvironmentFiles } = require('../scripts/uninstall');
      await removeEnvironmentFiles();
      
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Environment files removed');
    });
    
    it('should handle missing .env file', async () => {
      fs.existsSync.mockReturnValueOnce(false);
      
      const { removeEnvironmentFiles } = require('../scripts/uninstall');
      await removeEnvironmentFiles();
      
      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Environment files removed');
    });
    
    it('should handle file system errors', async () => {
      fs.unlinkSync.mockImplementationOnce(() => {
        throw new Error('Permission denied');
      });
      
      const { removeEnvironmentFiles } = require('../scripts/uninstall');
      await removeEnvironmentFiles();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith(expect.stringContaining('Failed to remove environment files'));
    });
  });
  
  describe('Generated Data Removal', () => {
    it('should remove data and logs directories', async () => {
      const { removeGeneratedData } = require('../scripts/uninstall');
      await removeGeneratedData();
      
      expect(fs.rmSync).toHaveBeenCalledTimes(2);
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Generated data removed');
    });
    
    it('should handle missing directories', async () => {
      fs.existsSync.mockReturnValue(false);
      
      const { removeGeneratedData } = require('../scripts/uninstall');
      await removeGeneratedData();
      
      expect(fs.rmSync).not.toHaveBeenCalled();
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Generated data removed');
    });
    
    it('should handle file system errors', async () => {
      fs.rmSync.mockImplementationOnce(() => {
        throw new Error('Permission denied');
      });
      
      const { removeGeneratedData } = require('../scripts/uninstall');
      await removeGeneratedData();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith(expect.stringContaining('Failed to remove generated data'));
    });
  });
  
  describe('Dependency Removal', () => {
    it('should remove node_modules and package-lock.json', async () => {
      const { removeDependencies } = require('../scripts/uninstall');
      await removeDependencies();
      
      expect(fs.rmSync).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Dependencies removed');
    });
    
    it('should handle missing files', async () => {
      fs.existsSync.mockReturnValue(false);
      
      const { removeDependencies } = require('../scripts/uninstall');
      await removeDependencies();
      
      expect(fs.rmSync).not.toHaveBeenCalled();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Dependencies removed');
    });
    
    it('should handle file system errors', async () => {
      fs.rmSync.mockImplementationOnce(() => {
        throw new Error('Permission denied');
      });
      
      const { removeDependencies } = require('../scripts/uninstall');
      await removeDependencies();
      
      expect(mockSpinner.fail).toHaveBeenCalledWith(expect.stringContaining('Failed to remove dependencies'));
    });
  });
  
  describe('Complete Uninstallation', () => {
    it('should complete uninstallation successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      const { main } = require('../scripts/uninstall');
      await main();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Uninstallation completed successfully'));
      expect(mockExit).not.toHaveBeenCalled();
    });
    
    it('should handle uninstallation failures', async () => {
      fs.rmSync.mockImplementationOnce(() => {
        throw new Error('Uninstallation error');
      });
      
      const { main } = require('../scripts/uninstall');
      await main();
      
      expect(mockExit).toHaveBeenCalledWith(1);
    });
    
    it('should respect selected options', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ proceed: true })
        .mockResolvedValueOnce({ options: ['env'] });
      
      const { main } = require('../scripts/uninstall');
      await main();
      
      expect(fs.unlinkSync).toHaveBeenCalled(); // env file removal
      expect(fs.rmSync).not.toHaveBeenCalled(); // no data removal
      expect(Shopify.prototype.asset.delete).not.toHaveBeenCalled(); // no theme removal
    });
    
    it('should show debug information when debug flag is set', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('Test Error');
      fs.rmSync.mockImplementationOnce(() => {
        throw error;
      });
      
      const { main } = require('../scripts/uninstall');
      process.argv.push('--debug');
      await main();
      
      expect(consoleSpy).toHaveBeenCalledWith(error);
      expect(mockExit).toHaveBeenCalledWith(1);
      
      // Clean up
      process.argv.pop();
    });
  });
});
