import { shopify } from '../config/shopify';
import { withErrorHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { shop, host } = req.query;
  let isAuthenticated = false;
  let currentShop = shop || '';

  logger.info('Processing request', { shop, host });

  if (shop) {
    // Try to load session for the shop
    const sessions = await shopify.config.sessionStorage.findSessionsByShop(shop);
    isAuthenticated = sessions.length > 0;
    
    logger.debug('Session status', { 
      shop,
      isAuthenticated,
      sessionCount: sessions.length 
    });
  }

  // Return a simple HTML page with improved styling
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>EyewearML Shopify App</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              padding: 2rem;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.6;
            }
            .success-message {
              color: #0070f3;
              background-color: #f3f4f6;
              padding: 1rem;
              border-radius: 0.5rem;
              margin: 1rem 0;
            }
            .auth-button {
              display: inline-block;
              background-color: #0070f3;
              color: white;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              text-decoration: none;
              margin: 1rem 0;
            }
            .auth-button:hover {
              background-color: #0051a2;
            }
            .status-section {
              background-color: #f3f4f6;
              padding: 1.5rem;
              border-radius: 0.5rem;
              margin: 2rem 0;
            }
            .feature-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 1.5rem;
              margin: 2rem 0;
            }
            .feature-card {
              background-color: white;
              padding: 1.5rem;
              border-radius: 0.5rem;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <h1>EyewearML Shopify App</h1>
          ${host ? '<div class="success-message">✅ Embedded app loaded</div>' : ''}
          
          <div class="status-section">
            <h2>Status</h2>
            ${isAuthenticated 
              ? `<p>✅ Connected to shop: ${currentShop}</p>` 
              : `<p>❌ Not connected to any shop</p>
                 <a href="/api/auth?shop=${shop || 'varai-test.myshopify.com'}" class="auth-button">Connect Your Shopify Store</a>`
            }
          </div>

          <div class="feature-grid">
            <div class="feature-card">
              <h3>Virtual Try-On</h3>
              <p>Let customers try on glasses virtually using our advanced ML models.</p>
              ${isAuthenticated ? '<a href="/api/try-on" class="auth-button">Configure Try-On</a>' : ''}
            </div>

            <div class="feature-card">
              <h3>Product Recommendations</h3>
              <p>AI-powered product recommendations based on customer preferences.</p>
              ${isAuthenticated ? '<a href="/api/recommendations" class="auth-button">View Recommendations</a>' : ''}
            </div>

            <div class="feature-card">
              <h3>Product Management</h3>
              <p>Manage your eyewear products and their virtual try-on settings.</p>
              ${isAuthenticated ? '<a href="/api/products" class="auth-button">Manage Products</a>' : ''}
            </div>
          </div>

          ${!isAuthenticated ? `
            <div style="margin-top: 2rem; text-align: center;">
              <h2>Get Started</h2>
              <p>Connect your Shopify store to access all features:</p>
              <a href="/api/auth?shop=${shop || 'varai-test.myshopify.com'}" class="auth-button">Connect Your Shopify Store</a>
            </div>
          ` : ''}

          <div style="margin-top: 2rem; font-size: 0.8rem; color: #666;">
            Debug Info:
            <pre>${JSON.stringify({ shop, host }, null, 2)}</pre>
          </div>
        </body>
      </html>
    `);
}

export default withErrorHandler(handler);
