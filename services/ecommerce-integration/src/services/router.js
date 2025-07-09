const express = require('express');
const logger = require('../utils/logger');
const { getAdapter } = require('./adapter-factory');

const router = express.Router();

const handleRequest = async (req, res, next) => {
    const { tenantId, platform } = req.body; // Assuming these are in the request body

    if (!tenantId || !platform) {
        return res.status(400).json({ error: 'tenantId and platform are required' });
    }

    try {
        const adapter = await getAdapter(tenantId, platform);
        
        // Forward the request to the adapter
        // This is a simplified example. A real implementation would be more robust.
        const { method, originalUrl, body } = req;
        const result = await adapter.proxyRequest(method, originalUrl, body);

        res.status(result.status).json(result.data);

    } catch (error) {
        logger.error(`Error routing request for tenant ${tenantId} to platform ${platform}:`, error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};

// Generic catch-all for all integration requests
router.all('/*', handleRequest);

module.exports = { routeToAdapter: router };