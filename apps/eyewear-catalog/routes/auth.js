/**
 * Authentication Routes
 * 
 * Routes for user authentication and session management.
 * Handles login, logout, and session validation.
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const db = require('../utils/db');

// Middleware to verify user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.shop) {
    return res.status(401).json({
      error: true,
      message: 'Authentication required'
    });
  }
  
  next();
};

/**
 * GET /auth/status
 * Check authentication status
 */
router.get('/status', (req, res) => {
  const isAuthenticated = !!(req.session && req.session.shop);
  
  res.json({
    authenticated: isAuthenticated,
    shop: isAuthenticated ? req.session.shop : null
  });
});

/**
 * POST /auth/logout
 * Logout user
 */
router.post('/logout', (req, res) => {
  try {
    // Get shop before destroying session
    const shop = req.session.shop;
    
    // Destroy session
    req.session.destroy(err => {
      if (err) {
        logger.error('Error destroying session:', err);
        
        return res.status(500).json({
          error: true,
          message: 'Error logging out'
        });
      }
      
      logger.info(`User logged out for shop ${shop}`);
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  } catch (error) {
    logger.error('Error during logout:', error);
    
    res.status(500).json({
      error: true,
      message: 'An error occurred during logout'
    });
  }
});

/**
 * GET /auth/session
 * Get current session data
 */
router.get('/session', ensureAuthenticated, async (req, res) => {
  try {
    const shop = req.session.shop;
    
    // Get shop data from database
    const shopData = await db.getShopByDomain(shop);
    
    if (!shopData) {
      return res.status(404).json({
        error: true,
        message: 'Shop not found'
      });
    }
    
    // Remove sensitive information
    const { accessToken, ...safeShopData } = shopData;
    
    res.json({
      success: true,
      session: {
        shop,
        shopData: safeShopData
      }
    });
  } catch (error) {
    logger.error('Error getting session data:', error);
    
    res.status(500).json({
      error: true,
      message: 'Error retrieving session data'
    });
  }
});

/**
 * GET /auth/check
 * Verify authentication status with redirect
 */
router.get('/check', (req, res) => {
  // If session exists, redirect to app
  if (req.session && req.session.shop) {
    return res.redirect('/');
  }
  
  // Get shop parameter
  const shop = req.query.shop;
  
  if (!shop) {
    return res.status(400).json({
      error: true,
      message: 'Shop parameter required'
    });
  }
  
  // Redirect to Shopify install flow
  res.redirect(`/shopify/install?shop=${encodeURIComponent(shop)}`);
});

/**
 * POST /auth/validate-session
 * Validate session and refresh if needed
 */
router.post('/validate-session', ensureAuthenticated, async (req, res) => {
  try {
    const shop = req.session.shop;
    
    // Get shop data from database
    const shopData = await db.getShopByDomain(shop);
    
    if (!shopData) {
      return res.status(401).json({
        error: true,
        message: 'Shop not found',
        redirectTo: '/auth/login'
      });
    }
    
    // Check if app was uninstalled
    if (shopData.uninstalledAt) {
      // Clear session
      req.session.destroy();
      
      return res.status(401).json({
        error: true,
        message: 'App has been uninstalled',
        redirectTo: '/auth/login'
      });
    }
    
    // Session is valid
    res.json({
      success: true,
      message: 'Session is valid'
    });
  } catch (error) {
    logger.error('Error validating session:', error);
    
    res.status(500).json({
      error: true,
      message: 'Error validating session'
    });
  }
});

module.exports = router;