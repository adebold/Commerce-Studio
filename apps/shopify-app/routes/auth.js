const express = require('express');
const { Shopify } = require('@shopify/shopify-api');
const Shop = require('../models/Shop');
const logger = require('../utils/logger');
const clientPortalIntegrationService = require('../../src/client-portal-integration/services/clientPortalIntegrationService');

const router = express.Router();

/**
 * Start OAuth flow
 */
router.get('/', (req, res) => {
  // Check if we have a shop query parameter
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).json({ error: 'Missing shop parameter' });
  }

  // Build the OAuth URL
  const authRoute = `${process.env.SHOPIFY_APP_URL}/auth/callback`;
  const redirectUrl = Shopify.Auth.beginAuth(
    req,
    res,
    shop,
    authRoute,
    process.env.SCOPES.split(',')
  );

  // Redirect to Shopify's OAuth page
  res.redirect(redirectUrl);
});

/**
 * OAuth callback
 */
router.get('/callback', async (req, res) => {
  try {
    // Complete the OAuth process
    const session = await Shopify.Auth.validateAuthCallback(
      req,
      res,
      req.query
    );

    // Get shop details
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    const shopResponse = await client.get({
      path: 'shop',
    });

    const shopData = shopResponse.body.shop;

    // Check if shop exists in database
    let shop = await Shop.findOne({ shopDomain: session.shop });

    if (shop) {
      // Update existing shop
      shop.accessToken = session.accessToken;
      shop.scope = session.scope;
      shop.isActive = true;
      shop.shopName = shopData.name;
      shop.email = shopData.email;
      shop.plan = shopData.plan_name;
      shop.shopId = shopData.id.toString();
      await shop.save();
      logger.info(`Updated shop: ${session.shop}`);
    } else {
      // Create new shop
      shop = new Shop({
        shopDomain: session.shop,
        accessToken: session.accessToken,
        scope: session.scope,
        isActive: true,
        shopName: shopData.name,
        email: shopData.email,
        plan: shopData.plan_name,
        shopId: shopData.id.toString(),
        contactName: shopData.shop_owner,
        settings: {
          syncDirection: 'shopify_to_skugenie',
          productMapping: new Map([
            ['title', 'title'],
            ['description', 'description'],
            ['vendor', 'brand'],
            ['productType', 'frameShape'],
            ['tags', 'tags'],
          ]),
        },
      });
      await shop.save();
      logger.info(`Created new shop: ${session.shop}`);
    }

    // Register shop with client portal
    try {
      await clientPortalIntegrationService.syncShopifyShop(shop);
      logger.info(`Registered shop with client portal: ${session.shop}`);
    } catch (error) {
      logger.error(`Failed to register shop with client portal: ${error.message}`);
      // Continue with installation even if client portal registration fails
    }

    // Redirect to app
    res.redirect(`/?shop=${session.shop}`);
  } catch (error) {
    logger.error(`Error in auth callback: ${error.message}`);
    res.status(500).json({ error: 'Error completing OAuth process' });
  }
});

/**
 * Uninstall webhook handler
 */
router.post('/uninstall', async (req, res) => {
  try {
    // Verify webhook
    const hmac = req.headers['x-shopify-hmac-sha256'];
    const topic = req.headers['x-shopify-topic'];
    const shop = req.headers['x-shopify-shop-domain'];

    if (topic !== 'app/uninstalled') {
      return res.status(400).json({ error: 'Invalid webhook topic' });
    }

    // Find shop in database
    const shopRecord = await Shop.findOne({ shopDomain: shop });
    if (!shopRecord) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Mark shop as inactive
    shopRecord.isActive = false;
    await shopRecord.save();
    logger.info(`Marked shop as inactive: ${shop}`);

    // Update client portal
    try {
      if (shopRecord.clientPortalClientId && shopRecord.clientPortalAccountId) {
        // Update platform account status
        await clientPortalApi.updatePlatformAccount(shopRecord.clientPortalAccountId, {
          status: 'inactive',
        });
        logger.info(`Updated platform account status in client portal: ${shopRecord.clientPortalAccountId}`);
      }
    } catch (error) {
      logger.error(`Failed to update client portal: ${error.message}`);
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    logger.error(`Error in uninstall webhook: ${error.message}`);
    res.status(500).json({ error: 'Error processing webhook' });
  }
});

module.exports = router;