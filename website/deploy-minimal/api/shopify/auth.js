// Shopify OAuth initiation endpoint
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { shop, user_id } = req.query;

        // Validate required parameters
        if (!shop) {
            return res.status(400).json({ 
                error: 'Missing required parameter: shop' 
            });
        }

        // Normalize shop domain
        let shopDomain = shop;
        if (!shopDomain.includes('.myshopify.com')) {
            shopDomain = shopDomain.replace(/^https?:\/\//, '') + '.myshopify.com';
        }

        // Validate shop domain format
        const shopRegex = /^[a-zA-Z0-9-]+\.myshopify\.com$/;
        if (!shopRegex.test(shopDomain)) {
            return res.status(400).json({ 
                error: 'Invalid shop domain format' 
            });
        }

        // Shopify app credentials
        const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || 'd88807e41a989470ff66177d5cc69c13';
        const SHOPIFY_SCOPES = 'read_products,write_products,read_themes,write_themes,read_customers,read_orders';
        const REDIRECT_URI = 'https://eyewearml-shopify-7quzpkxit-vareye-ai.vercel.app/api/callback';

        // Generate state parameter for security
        const state = Buffer.from(JSON.stringify({
            user_id: user_id || null,
            timestamp: Date.now(),
            nonce: Math.random().toString(36).substr(2, 9)
        })).toString('base64');

        // Build Shopify OAuth URL
        const authUrl = new URL(`https://${shopDomain}/admin/oauth/authorize`);
        authUrl.searchParams.set('client_id', SHOPIFY_API_KEY);
        authUrl.searchParams.set('scope', SHOPIFY_SCOPES);
        authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.set('state', state);

        console.log('Initiating Shopify OAuth for shop:', shopDomain);
        console.log('Redirect URI:', REDIRECT_URI);
        console.log('User ID:', user_id);

        // Redirect to Shopify OAuth
        res.redirect(302, authUrl.toString());

    } catch (error) {
        console.error('Shopify OAuth initiation error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to initiate Shopify authentication. Please try again.'
        });
    }
}