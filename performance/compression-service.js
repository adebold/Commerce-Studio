/**
 * @fileoverview Asset compression and optimization service for faster delivery.
 * Provides middleware for on-the-fly compression and utilities for build-time optimization.
 * @module performance/compression-service
 */

const compression = require('compression');
const zlib = require('zlib');
const { promisify } = require('util');
const sharp = require('sharp'); // For image optimization

const brotliCompress = promisify(zlib.brotliCompress);

class CompressionService {
    /**
     * Initializes the Compression Service.
     */
    constructor() {
        console.log('CompressionService initialized.');
    }

    /**
     * Returns middleware for dynamic Gzip/Brotli compression of responses.
     * This should be one of the first middleware registered in an Express app.
     * @returns {function} Express compression middleware.
     */
    getDynamicCompressionMiddleware() {
        return compression({
            level: 9, // Highest compression level
            filter: (req, res) => {
                if (req.headers['x-no-compression']) {
                    // Don't compress responses with this header
                    return false;
                }
                // Use default compression filter
                return compression.filter(req, res);
            },
        });
    }

    /**
     * Compresses a buffer using Brotli.
     * @param {Buffer} buffer - The buffer to compress.
     * @returns {Promise<Buffer>} The compressed buffer.
     */
    async compressWithBrotli(buffer) {
        try {
            return await brotliCompress(buffer);
        } catch (error) {
            console.error('Brotli compression failed:', error);
            throw error;
        }
    }

    /**
     * Optimizes an image buffer.
     * Converts to a modern format like WebP, resizes, and adjusts quality.
     * @param {Buffer} imageBuffer - The input image buffer.
     * @param {object} options - Optimization options.
     * @param {number} [options.width] - The target width.
     * @param {number} [options.quality=80] - The quality for WebP/JPEG.
     * @returns {Promise<Buffer>} The optimized image buffer.
     */
    async optimizeImage(imageBuffer, { width, quality = 80 }) {
        try {
            let imageProcessor = sharp(imageBuffer);
            if (width) {
                imageProcessor = imageProcessor.resize({ width });
            }
            return await imageProcessor
                .webp({ quality })
                .toBuffer();
        } catch (error) {
            console.error('Image optimization failed:', error);
            // Fallback: return original buffer if optimization fails
            return imageBuffer;
        }
    }

    /**
     * Middleware to serve optimized images on-the-fly.
     * It intercepts image requests, optimizes them, and caches the result.
     * Note: In a production system, this is often handled by a dedicated image CDN.
     * @returns {function} Express middleware.
     */
    imageOptimizationMiddleware() {
        return async (req, res, next) => {
            // Example: /images/my-avatar.png?w=200&q=75
            const isImageRequest = req.path.match(/\.(jpg|jpeg|png)$/);
            if (!isImageRequest) {
                return next();
            }

            const { w: width, q: quality } = req.query;
            if (!width && !quality) {
                return next(); // Serve original image
            }

            try {
                // This is a simplified example. A real implementation needs a way
                // to fetch the original image from storage (e.g., S3).
                // const originalImageBuffer = await fetchImageFromStorage(req.path);
                // const optimizedImage = await this.optimizeImage(originalImageBuffer, {
                //     width: width ? parseInt(width) : undefined,
                //     quality: quality ? parseInt(quality) : undefined,
                // });
                
                // res.set('Content-Type', 'image/webp');
                // res.send(optimizedImage);
                
                // Placeholder for demonstration
                res.status(501).send('On-the-fly image optimization not fully implemented in this example.');

            } catch (error) {
                console.error(`Failed to optimize image ${req.path}:`, error);
                next(); // Serve original on error
            }
        };
    }
}

const compressionService = new CompressionService();

module.exports = compressionService;