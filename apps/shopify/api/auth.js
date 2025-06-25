import { shopify } from '../config/shopify';
import { withErrorHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get shop parameter
  const shop = req.query?.shop;
  if (!shop) {
    return res.status(400).json({ message: 'Missing shop parameter' });
  }

  logger.info('Starting OAuth for shop:', { shop });

  // Create OAuth URL
  const authPath = await shopify.auth.begin({
    shop,
    callbackPath: '/api/callback',
    isOnline: true,
    rawRequest: req,
    rawResponse: res
  });

  logger.debug('Generated auth path:', { authPath });

  // Redirect to Shopify OAuth page
  res.redirect(authPath);
}

export default withErrorHandler(handler);
