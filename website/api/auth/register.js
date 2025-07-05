// User registration API endpoint for Shopify installation flow
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, firstName, lastName, source } = req.body;

        // Validate required fields
        if (!email || !firstName || !lastName) {
            return res.status(400).json({ 
                error: 'Missing required fields: email, firstName, lastName' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid email format' 
            });
        }

        // Generate a unique user ID
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create user object
        const userData = {
            userId,
            email,
            firstName,
            lastName,
            source: source || 'web',
            createdAt: new Date().toISOString(),
            status: 'pending_shopify_auth'
        };

        // In a real implementation, you would save this to a database
        // For now, we'll simulate success and return the user data
        console.log('Creating user account:', userData);

        // Simulate account creation delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            userId: userData.userId,
            email: userData.email,
            nextStep: 'shopify_oauth'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to create account. Please try again.'
        });
    }
}