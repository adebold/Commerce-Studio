/**
 * @fileoverview CDN optimization service for avatar streaming and asset delivery.
 * Manages CDN interactions, including cache invalidation and adaptive bitrate streaming logic.
 * @module performance/cdn-optimization-service
 */

const axios = require('axios');
const cachingService = require('./caching-service');

/**
 * @typedef {object} CdnConfig
 * @property {string} apiKey - API key for the CDN provider.
 * @property {string} apiEndpoint - API endpoint for the CDN provider.
 * @property {string} zoneId - The CDN zone ID.
 */

class CdnOptimizationService {
    /**
     * Initializes the CDN Optimization Service.
     * @param {CdnConfig} config - CDN configuration.
     */
    constructor(config) {
        this.config = {
            apiKey: process.env.CDN_API_KEY,
            apiEndpoint: process.env.CDN_API_ENDPOINT || 'https://api.cloudflare.com/v4',
            zoneId: process.env.CDN_ZONE_ID,
            ...config,
        };

        if (!this.config.apiKey || !this.config.zoneId) {
            console.warn('CDN service is not configured. Cache purging will be disabled.');
            this.isConfigured = false;
        } else {
            this.isConfigured = true;
            this.api = axios.create({
                baseURL: this.config.apiEndpoint,
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
        }
        console.log('CdnOptimizationService initialized.');
    }

    /**
     * Purges specific URLs from the CDN cache.
     * @param {string[]} urls - An array of URLs to purge.
     * @returns {Promise<boolean>} True if purge was successful, false otherwise.
     */
    async purgeUrls(urls) {
        if (!this.isConfigured) {
            console.warn('CDN purge skipped: service not configured.');
            return false;
        }

        try {
            await this.api.post(`/zones/${this.config.zoneId}/purge_cache`, {
                files: urls,
            });
            console.log(`CDN cache purged for URLs: ${urls.join(', ')}`);
            return true;
        } catch (error) {
            console.error('Error purging CDN cache:', error.response ? error.response.data : error.message);
            // Graceful degradation: The application can continue even if purging fails.
            return false;
        }
    }

    /**
     * Purges all content from the CDN cache. Use with caution.
     * @returns {Promise<boolean>} True if purge was successful, false otherwise.
     */
    async purgeAll() {
        if (!this.isConfigured) {
            console.warn('CDN purge all skipped: service not configured.');
            return false;
        }

        try {
            await this.api.post(`/zones/${this.config.zoneId}/purge_cache`, {
                purge_everything: true,
            });
            console.log('Purged all CDN cache.');
            return true;
        } catch (error) {
            console.error('Error purging all CDN cache:', error.response ? error.response.data : error.message);
            return false;
        }
    }

    /**
     * Selects the optimal video bitrate based on network conditions.
     * This is a simplified example. A real-world implementation would use more sophisticated network analysis.
     * @param {object} networkInfo - Information about the client's network.
     * @param {string} networkInfo.type - Network type (e.g., '4g', 'wifi').
     * @param {number} networkInfo.downlink - Estimated download speed in Mbps.
     * @returns {number} The selected bitrate in kbps.
     */
    getAdaptiveBitrate(networkInfo) {
        const { type, downlink } = networkInfo;

        if (type === 'wifi' || (type === '4g' && downlink > 5)) {
            return 4000; // High quality (4 Mbps)
        } else if (type === '4g' && downlink > 2) {
            return 2000; // Medium quality (2 Mbps)
        } else if (type === '3g') {
            return 750; // Low quality (750 Kbps)
        } else {
            return 400; // Very low quality for poor connections (400 Kbps)
        }
    }

    /**
     * Generates a manifest for adaptive bitrate streaming (e.g., HLS or DASH).
     * @param {string} assetId - The ID of the avatar video asset.
     * @param {object} networkInfo - Client's network information.
     * @returns {string} A streaming manifest URL.
     */
    getStreamingManifestUrl(assetId, networkInfo) {
        const selectedBitrate = this.getAdaptiveBitrate(networkInfo);
        // In a real system, this would point to a manifest file that lists
        // different stream qualities. Here we simulate selecting one.
        const manifestUrl = `https://cdn.youravatardomain.com/${assetId}/manifest.m3u8?bitrate=${selectedBitrate}`;
        
        console.log(`Serving manifest for ${assetId} at ${selectedBitrate}kbps`);
        return manifestUrl;
    }

    /**
     * Middleware to handle asset updates.
     * When an asset is updated (e.g., avatar model), this middleware purges the
     * corresponding CDN and Redis caches.
     * @param {string} assetIdParam - The name of the route parameter containing the asset ID.
     * @returns {function} Express middleware.
     */
    handleAssetUpdate(assetIdParam) {
        return async (req, res, next) => {
            const assetId = req.params[assetIdParam];
            if (!assetId) {
                return next();
            }

            const assetUrl = `https://cdn.youravatardomain.com/assets/${assetId}`;
            const redisKey = `asset:${assetId}`;

            try {
                // Invalidate caches after the response is sent to avoid delaying the request.
                res.on('finish', async () => {
                    console.log(`Asset ${assetId} updated. Invalidating caches.`);
                    await this.purgeUrls([assetUrl]);
                    await cachingService.invalidate(redisKey);
                });
            } catch (error) {
                console.error(`Error handling asset update for ${assetId}:`, error);
            }
            
            next();
        };
    }
}

const cdnOptimizationService = new CdnOptimizationService();

module.exports = cdnOptimizationService;