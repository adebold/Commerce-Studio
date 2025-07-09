const axios = require('axios');
const logger = require('../utils/logger');

const tenantServiceUrl = process.env.TENANT_SERVICE_URL || 'http://localhost:3001';

// In a real production environment, this would use a secure vault like HashiCorp Vault or AWS Secrets Manager.
// For now, we'll fetch credentials from the Tenant Management Service.
const getTenantCredentials = async (tenantId, platform) => {
    try {
        const response = await axios.get(`${tenantServiceUrl}/api/tenants/${tenantId}/config`, {
            headers: { Authorization: `Bearer ${process.env.ADMIN_API_KEY}` }
        });

        const config = response.data.data;
        const platformConfig = config.integrations?.[platform];

        if (!platformConfig || !platformConfig.credentials) {
            throw new Error(`No credentials found for platform ${platform} and tenant ${tenantId}`);
        }

        return platformConfig.credentials;

    } catch (error) {
        logger.error(`Failed to get credentials for tenant ${tenantId}:`, error);
        throw error;
    }
};

module.exports = { getTenantCredentials };