// Shopify OAuth callback endpoint
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
        const { code, shop, state, error } = req.query;

        // Check for OAuth errors
        if (error) {
            console.error('Shopify OAuth error:', error);
            return res.redirect(`/shopify-install.html?error=${encodeURIComponent(error)}`);
        }

        // Validate required parameters
        if (!code || !shop) {
            return res.status(400).json({ 
                error: 'Missing required parameters: code and shop' 
            });
        }

        // Validate and decode state parameter
        let stateData = null;
        if (state) {
            try {
                stateData = JSON.parse(Buffer.from(state, 'base64').toString());
            } catch (e) {
                console.warn('Invalid state parameter:', e.message);
            }
        }

        // Normalize shop domain
        let shopDomain = shop;
        if (!shopDomain.includes('.myshopify.com')) {
            shopDomain = shopDomain.replace(/^https?:\/\//, '') + '.myshopify.com';
        }

        console.log('Processing Shopify OAuth callback for shop:', shopDomain);

        // Exchange authorization code for access token
        const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || 'd88807e41a989470ff66177d5cc69c13';
        const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || 'd07c19a9ee98d018f02ccbc9fbd6ea70';

        const tokenResponse = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: SHOPIFY_API_KEY,
                client_secret: SHOPIFY_API_SECRET,
                code: code
            })
        });

        if (!tokenResponse.ok) {
            throw new Error(`Failed to exchange code for token: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        console.log('Successfully obtained access token for shop:', shopDomain);

        // Store the access token and shop information
        // In a real implementation, you would save this to a database
        const installationData = {
            shop: shopDomain,
            accessToken: accessToken,
            scope: tokenData.scope,
            userId: stateData?.user_id || null,
            installedAt: new Date().toISOString()
        };

        console.log('Installation completed:', {
            shop: installationData.shop,
            userId: installationData.userId,
            scope: installationData.scope
        });

        // Create success page URL with installation details
        const successUrl = new URL('/dashboard/index.html', 'https://eyewearml.com');
        successUrl.searchParams.set('installation', 'success');
        successUrl.searchParams.set('shop', shopDomain);
        if (stateData?.user_id) {
            successUrl.searchParams.set('user_id', stateData.user_id);
        }

        // Redirect to dashboard with success message
        res.redirect(302, successUrl.toString());

    } catch (error) {
        console.error('Shopify OAuth callback error:', error);
        
        // Redirect to installation page with error
        const errorUrl = new URL('/shopify-install.html', 'https://eyewearml.com');
        errorUrl.searchParams.set('error', 'installation_failed');
        errorUrl.searchParams.set('message', encodeURIComponent(error.message || 'Installation failed'));
        
        res.redirect(302, errorUrl.toString());
    }
}