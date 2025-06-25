/**
 * Settings Routes
 * 
 * Handles API endpoints for application settings and configuration.
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const db = require('../utils/db');
const logger = require('../utils/logger');
const { eyewearService } = require('../services/eyewear-service');

// Get all settings for a shop
router.get('/', verifyToken, async (req, res) => {
  try {
    // Get settings from database
    const settings = await db.getShopSettings(req.shop);
    
    // If no settings exist yet, return defaults
    if (!settings) {
      const defaultSettings = {
        integration: {
          type: 'eyewear-database',
          useLocalData: false,
          apiUrl: '',
          apiKey: ''
        },
        display: {
          productListView: 'grid',
          itemsPerPage: 20,
          defaultSort: 'name',
          defaultOrder: 'asc'
        },
        notifications: {
          syncCompletionEmail: true,
          syncFailureEmail: true,
          lowInventoryAlert: true,
          lowInventoryThreshold: 5
        },
        branding: {
          useCustomBranding: false,
          logoUrl: '',
          primaryColor: '#000000',
          secondaryColor: '#ffffff'
        }
      };
      
      res.status(200).json(defaultSettings);
      return;
    }
    
    res.status(200).json(settings);
  } catch (error) {
    logger.error('Error getting shop settings:', error);
    res.status(500).json({ error: 'Failed to get shop settings' });
  }
});

// Update settings for a shop
router.put('/', verifyToken, async (req, res) => {
  try {
    const { integration, display, notifications, branding } = req.body;
    
    // Get existing settings
    let settings = await db.getShopSettings(req.shop);
    
    if (!settings) {
      settings = {
        integration: {
          type: 'eyewear-database',
          useLocalData: false,
          apiUrl: '',
          apiKey: ''
        },
        display: {
          productListView: 'grid',
          itemsPerPage: 20,
          defaultSort: 'name',
          defaultOrder: 'asc'
        },
        notifications: {
          syncCompletionEmail: true,
          syncFailureEmail: true,
          lowInventoryAlert: true,
          lowInventoryThreshold: 5
        },
        branding: {
          useCustomBranding: false,
          logoUrl: '',
          primaryColor: '#000000',
          secondaryColor: '#ffffff'
        }
      };
    }
    
    // Update settings
    if (integration) settings.integration = { ...settings.integration, ...integration };
    if (display) settings.display = { ...settings.display, ...display };
    if (notifications) settings.notifications = { ...settings.notifications, ...notifications };
    if (branding) settings.branding = { ...settings.branding, ...branding };
    
    // Save updated settings
    await db.saveShopSettings(req.shop, settings);
    
    // If integration settings were updated, reinitialize the integration
    if (integration) {
      try {
        await eyewearService.reinitializeIntegration(req.shop);
      } catch (integrationError) {
        logger.error('Error reinitializing integration:', integrationError);
        // Still return success, but with a warning
        return res.status(200).json({
          settings,
          warning: 'Settings saved but integration could not be reinitialized. Please check integration settings.'
        });
      }
    }
    
    res.status(200).json({ settings });
  } catch (error) {
    logger.error('Error updating shop settings:', error);
    res.status(500).json({ error: 'Failed to update shop settings' });
  }
});

// Get integration settings
router.get('/integration', verifyToken, async (req, res) => {
  try {
    // Get settings from database
    const settings = await db.getShopSettings(req.shop);
    
    // If no settings exist yet, return defaults
    if (!settings || !settings.integration) {
      const defaultIntegration = {
        type: 'eyewear-database',
        useLocalData: false,
        apiUrl: '',
        apiKey: ''
      };
      
      res.status(200).json(defaultIntegration);
      return;
    }
    
    res.status(200).json(settings.integration);
  } catch (error) {
    logger.error('Error getting integration settings:', error);
    res.status(500).json({ error: 'Failed to get integration settings' });
  }
});

// Update integration settings
router.put('/integration', verifyToken, async (req, res) => {
  try {
    const { type, apiUrl, apiKey, useLocalData } = req.body;
    
    // Validate inputs
    if (type && type !== 'eyewear-database') {
      return res.status(400).json({ error: 'Invalid integration type' });
    }
    
    // Get existing settings
    let settings = await db.getShopSettings(req.shop);
    
    if (!settings) {
      settings = {
        integration: {
          type: 'eyewear-database',
          useLocalData: false,
          apiUrl: '',
          apiKey: ''
        },
        display: {
          productListView: 'grid',
          itemsPerPage: 20,
          defaultSort: 'name',
          defaultOrder: 'asc'
        },
        notifications: {
          syncCompletionEmail: true,
          syncFailureEmail: true,
          lowInventoryAlert: true,
          lowInventoryThreshold: 5
        },
        branding: {
          useCustomBranding: false,
          logoUrl: '',
          primaryColor: '#000000',
          secondaryColor: '#ffffff'
        }
      };
    }
    
    // If API URL or key are provided, test the connection
    if ((apiUrl && apiUrl !== settings.integration.apiUrl) || 
        (apiKey && apiKey !== settings.integration.apiKey)) {
      try {
        const testUrl = apiUrl || settings.integration.apiUrl;
        const testKey = apiKey || settings.integration.apiKey;
        
        // Skip test if using local data
        if (!(useLocalData === true || (useLocalData === undefined && settings.integration.useLocalData === true))) {
          await eyewearService.testConnection(testUrl, testKey);
        }
      } catch (testError) {
        logger.error('Integration test failed:', testError);
        return res.status(400).json({ 
          error: 'Integration test failed. Please check your API URL and API Key.',
          details: testError.message 
        });
      }
    }
    
    // Update integration settings
    settings.integration = {
      ...settings.integration,
      ...(type && { type }),
      ...(apiUrl && { apiUrl }),
      ...(apiKey && { apiKey }),
      ...(useLocalData !== undefined && { useLocalData })
    };
    
    // Save updated settings
    await db.saveShopSettings(req.shop, settings);
    
    // Reinitialize integration
    try {
      await eyewearService.reinitializeIntegration(req.shop);
    } catch (integrationError) {
      logger.error('Error reinitializing integration:', integrationError);
      return res.status(200).json({
        integration: settings.integration,
        warning: 'Settings saved but integration could not be reinitialized. Please check integration settings.'
      });
    }
    
    res.status(200).json({ integration: settings.integration });
  } catch (error) {
    logger.error('Error updating integration settings:', error);
    res.status(500).json({ error: 'Failed to update integration settings' });
  }
});

// Get display settings
router.get('/display', verifyToken, async (req, res) => {
  try {
    // Get settings from database
    const settings = await db.getShopSettings(req.shop);
    
    // If no settings exist yet, return defaults
    if (!settings || !settings.display) {
      const defaultDisplay = {
        productListView: 'grid',
        itemsPerPage: 20,
        defaultSort: 'name',
        defaultOrder: 'asc'
      };
      
      res.status(200).json(defaultDisplay);
      return;
    }
    
    res.status(200).json(settings.display);
  } catch (error) {
    logger.error('Error getting display settings:', error);
    res.status(500).json({ error: 'Failed to get display settings' });
  }
});

// Update display settings
router.put('/display', verifyToken, async (req, res) => {
  try {
    const { productListView, itemsPerPage, defaultSort, defaultOrder } = req.body;
    
    // Validate inputs
    if (productListView && !['grid', 'list'].includes(productListView)) {
      return res.status(400).json({ error: 'Invalid productListView value' });
    }
    
    if (itemsPerPage && (typeof itemsPerPage !== 'number' || itemsPerPage < 1 || itemsPerPage > 100)) {
      return res.status(400).json({ error: 'itemsPerPage must be a number between 1 and 100' });
    }
    
    if (defaultSort && !['name', 'price', 'relevance'].includes(defaultSort)) {
      return res.status(400).json({ error: 'Invalid defaultSort value' });
    }
    
    if (defaultOrder && !['asc', 'desc'].includes(defaultOrder)) {
      return res.status(400).json({ error: 'Invalid defaultOrder value' });
    }
    
    // Get existing settings
    let settings = await db.getShopSettings(req.shop);
    
    if (!settings) {
      settings = {
        integration: {
          type: 'eyewear-database',
          useLocalData: false,
          apiUrl: '',
          apiKey: ''
        },
        display: {
          productListView: 'grid',
          itemsPerPage: 20,
          defaultSort: 'name',
          defaultOrder: 'asc'
        },
        notifications: {
          syncCompletionEmail: true,
          syncFailureEmail: true,
          lowInventoryAlert: true,
          lowInventoryThreshold: 5
        },
        branding: {
          useCustomBranding: false,
          logoUrl: '',
          primaryColor: '#000000',
          secondaryColor: '#ffffff'
        }
      };
    }
    
    // Update display settings
    settings.display = {
      ...settings.display,
      ...(productListView && { productListView }),
      ...(itemsPerPage && { itemsPerPage }),
      ...(defaultSort && { defaultSort }),
      ...(defaultOrder && { defaultOrder })
    };
    
    // Save updated settings
    await db.saveShopSettings(req.shop, settings);
    
    res.status(200).json({ display: settings.display });
  } catch (error) {
    logger.error('Error updating display settings:', error);
    res.status(500).json({ error: 'Failed to update display settings' });
  }
});

// Get notification settings
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    // Get settings from database
    const settings = await db.getShopSettings(req.shop);
    
    // If no settings exist yet, return defaults
    if (!settings || !settings.notifications) {
      const defaultNotifications = {
        syncCompletionEmail: true,
        syncFailureEmail: true,
        lowInventoryAlert: true,
        lowInventoryThreshold: 5
      };
      
      res.status(200).json(defaultNotifications);
      return;
    }
    
    res.status(200).json(settings.notifications);
  } catch (error) {
    logger.error('Error getting notification settings:', error);
    res.status(500).json({ error: 'Failed to get notification settings' });
  }
});

// Update notification settings
router.put('/notifications', verifyToken, async (req, res) => {
  try {
    const { 
      syncCompletionEmail, 
      syncFailureEmail, 
      lowInventoryAlert, 
      lowInventoryThreshold 
    } = req.body;
    
    // Validate inputs
    if (lowInventoryThreshold !== undefined && 
        (typeof lowInventoryThreshold !== 'number' || 
         lowInventoryThreshold < 0)) {
      return res.status(400).json({ error: 'lowInventoryThreshold must be a non-negative number' });
    }
    
    // Get existing settings
    let settings = await db.getShopSettings(req.shop);
    
    if (!settings) {
      settings = {
        integration: {
          type: 'eyewear-database',
          useLocalData: false,
          apiUrl: '',
          apiKey: ''
        },
        display: {
          productListView: 'grid',
          itemsPerPage: 20,
          defaultSort: 'name',
          defaultOrder: 'asc'
        },
        notifications: {
          syncCompletionEmail: true,
          syncFailureEmail: true,
          lowInventoryAlert: true,
          lowInventoryThreshold: 5
        },
        branding: {
          useCustomBranding: false,
          logoUrl: '',
          primaryColor: '#000000',
          secondaryColor: '#ffffff'
        }
      };
    }
    
    // Update notification settings
    settings.notifications = {
      ...settings.notifications,
      ...(syncCompletionEmail !== undefined && { syncCompletionEmail }),
      ...(syncFailureEmail !== undefined && { syncFailureEmail }),
      ...(lowInventoryAlert !== undefined && { lowInventoryAlert }),
      ...(lowInventoryThreshold !== undefined && { lowInventoryThreshold })
    };
    
    // Save updated settings
    await db.saveShopSettings(req.shop, settings);
    
    res.status(200).json({ notifications: settings.notifications });
  } catch (error) {
    logger.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// Get branding settings
router.get('/branding', verifyToken, async (req, res) => {
  try {
    // Get settings from database
    const settings = await db.getShopSettings(req.shop);
    
    // If no settings exist yet, return defaults
    if (!settings || !settings.branding) {
      const defaultBranding = {
        useCustomBranding: false,
        logoUrl: '',
        primaryColor: '#000000',
        secondaryColor: '#ffffff'
      };
      
      res.status(200).json(defaultBranding);
      return;
    }
    
    res.status(200).json(settings.branding);
  } catch (error) {
    logger.error('Error getting branding settings:', error);
    res.status(500).json({ error: 'Failed to get branding settings' });
  }
});

// Update branding settings
router.put('/branding', verifyToken, async (req, res) => {
  try {
    const { useCustomBranding, logoUrl, primaryColor, secondaryColor } = req.body;
    
    // Get existing settings
    let settings = await db.getShopSettings(req.shop);
    
    if (!settings) {
      settings = {
        integration: {
          type: 'eyewear-database',
          useLocalData: false,
          apiUrl: '',
          apiKey: ''
        },
        display: {
          productListView: 'grid',
          itemsPerPage: 20,
          defaultSort: 'name',
          defaultOrder: 'asc'
        },
        notifications: {
          syncCompletionEmail: true,
          syncFailureEmail: true,
          lowInventoryAlert: true,
          lowInventoryThreshold: 5
        },
        branding: {
          useCustomBranding: false,
          logoUrl: '',
          primaryColor: '#000000',
          secondaryColor: '#ffffff'
        }
      };
    }
    
    // Update branding settings
    settings.branding = {
      ...settings.branding,
      ...(useCustomBranding !== undefined && { useCustomBranding }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(primaryColor && { primaryColor }),
      ...(secondaryColor && { secondaryColor })
    };
    
    // Save updated settings
    await db.saveShopSettings(req.shop, settings);
    
    res.status(200).json({ branding: settings.branding });
  } catch (error) {
    logger.error('Error updating branding settings:', error);
    res.status(500).json({ error: 'Failed to update branding settings' });
  }
});

// Reset all settings to defaults
router.post('/reset', verifyToken, async (req, res) => {
  try {
    // Default settings
    const defaultSettings = {
      integration: {
        type: 'eyewear-database',
        useLocalData: false,
        apiUrl: '',
        apiKey: ''
      },
      display: {
        productListView: 'grid',
        itemsPerPage: 20,
        defaultSort: 'name',
        defaultOrder: 'asc'
      },
      notifications: {
        syncCompletionEmail: true,
        syncFailureEmail: true,
        lowInventoryAlert: true,
        lowInventoryThreshold: 5
      },
      branding: {
        useCustomBranding: false,
        logoUrl: '',
        primaryColor: '#000000',
        secondaryColor: '#ffffff'
      }
    };
    
    // Save default settings
    await db.saveShopSettings(req.shop, defaultSettings);
    
    // Reinitialize integration with default settings
    try {
      await eyewearService.reinitializeIntegration(req.shop);
    } catch (integrationError) {
      logger.error('Error reinitializing integration after reset:', integrationError);
      return res.status(200).json({
        settings: defaultSettings,
        warning: 'Settings reset but integration could not be reinitialized.'
      });
    }
    
    res.status(200).json({ 
      settings: defaultSettings,
      message: 'All settings have been reset to defaults'
    });
  } catch (error) {
    logger.error('Error resetting settings:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

module.exports = router;