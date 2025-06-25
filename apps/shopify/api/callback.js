import { shopify } from '../config/shopify';
import { withErrorHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { ShopifyError } from '../middleware/errorHandler';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  logger.info('Processing OAuth callback');

  // Handle OAuth callback
  const callbackResponse = await shopify.auth.callback({
    rawRequest: req,
    rawResponse: res
  });

  // Get session
  const session = await shopify.config.sessionStorage.loadSession(callbackResponse.session.id);
  
  if (!session) {
    throw new ShopifyError(
      'Failed to load session',
      'SESSION_NOT_FOUND',
      404
    );
  }

  logger.info('OAuth callback successful', {
    shop: callbackResponse.session.shop,
    sessionId: session.id
  });

  // Redirect to app home with success
  const redirectUrl = `/?shop=${callbackResponse.session.shop}&success=true`;
  res.redirect(redirectUrl);
}

export default withErrorHandler(handler);
