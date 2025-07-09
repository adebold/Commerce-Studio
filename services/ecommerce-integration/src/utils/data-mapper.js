/**
 * Data Mapper
 * 
 * This utility transforms data between the Commerce Studio standard format
 * and various e-commerce platform-specific formats.
 */

/**
 * Maps a platform-specific product to the Commerce Studio standard format.
 * @param {object} platformProduct - The product object from the e-commerce platform.
 * @param {string} platform - The name of the platform (e.g., 'shopify', 'woocommerce').
 * @returns {object} The product in Commerce Studio's standard format.
 */
function mapToStandardProduct(platformProduct, platform) {
    if (!platformProduct) return null;

    switch (platform) {
        case 'shopify':
            return {
                id: platformProduct.id,
                name: platformProduct.title,
                description: platformProduct.body_html,
                price: parseFloat(platformProduct.variants?.[0]?.price || 0),
                sku: platformProduct.variants?.[0]?.sku || '',
                images: platformProduct.images?.map(img => ({ id: img.id, src: img.src })) || [],
                vendor: platformProduct.vendor,
                platformData: platformProduct // Keep original data for reference
            };
        case 'woocommerce':
            return {
                id: platformProduct.id,
                name: platformProduct.name,
                description: platformProduct.description,
                price: parseFloat(platformProduct.price || 0),
                sku: platformProduct.sku || '',
                images: platformProduct.images?.map(img => ({ id: img.id, src: img.src })) || [],
                vendor: platformProduct.store?.name || '',
                platformData: platformProduct
            };
        default:
            // Generic mapping for unknown platforms
            return {
                id: platformProduct.id,
                name: platformProduct.name || platformProduct.title,
                description: platformProduct.description || platformProduct.body,
                price: parseFloat(platformProduct.price || 0),
                sku: platformProduct.sku || '',
                images: platformProduct.images?.map(img => ({ src: img.src })) || [],
                platformData: platformProduct
            };
    }
}

/**
 * Maps a Commerce Studio standard product to a platform-specific format.
 * @param {object} standardProduct - The product in Commerce Studio's standard format.
 * @param {string} platform - The name of the platform to map to.
 * @returns {object} The product in the platform-specific format.
 */
function mapFromStandardProduct(standardProduct, platform) {
    if (!standardProduct) return null;

    switch (platform) {
        case 'shopify':
            return {
                title: standardProduct.name,
                body_html: standardProduct.description,
                vendor: standardProduct.vendor,
                variants: [{
                    price: standardProduct.price,
                    sku: standardProduct.sku
                }],
                images: standardProduct.images?.map(img => ({ src: img.src })) || []
            };
        case 'woocommerce':
            return {
                name: standardProduct.name,
                description: standardProduct.description,
                regular_price: String(standardProduct.price),
                sku: standardProduct.sku,
                images: standardProduct.images?.map(img => ({ src: img.src })) || []
            };
        default:
            throw new Error(`Platform '${platform}' is not supported for mapping from standard product.`);
    }
}

module.exports = {
    mapToStandardProduct,
    mapFromStandardProduct
};