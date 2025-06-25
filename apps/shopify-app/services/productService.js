const { Shopify } = require('@shopify/shopify-api');
const Product = require('../models/Product');
const SyncJob = require('../models/SyncJob');
const logger = require('../utils/logger');
const skuGenieApi = require('./skuGenieApi');

/**
 * Process a Shopify product and sync it to SKU-Genie
 */
async function processShopifyProduct(shop, shopifyProduct, syncJobId) {
  try {
    logger.info(`Processing Shopify product ${shopifyProduct.id} for shop ${shop.shopDomain}`);
    
    // Find or create the product in our database
    let product = await Product.findByShopifyId(shop.shopDomain, shopifyProduct.id.toString());
    
    if (!product) {
      // Create a new product
      product = new Product({
        shopDomain: shop.shopDomain,
        shopifyProductId: shopifyProduct.id.toString(),
        title: shopifyProduct.title,
        description: shopifyProduct.body_html,
        vendor: shopifyProduct.vendor,
        productType: shopifyProduct.product_type,
        tags: shopifyProduct.tags ? shopifyProduct.tags.split(',').map(tag => tag.trim()) : [],
        handle: shopifyProduct.handle,
        status: shopifyProduct.status,
        publishedAt: shopifyProduct.published_at,
        publishedScope: shopifyProduct.published_scope,
        variants: [],
        options: [],
        images: [],
        syncDirection: shop.settings.syncDirection,
        syncStatus: 'pending',
      });
      
      logger.info(`Created new product record for ${shopifyProduct.id}`);
    } else {
      // Update existing product
      product.title = shopifyProduct.title;
      product.description = shopifyProduct.body_html;
      product.vendor = shopifyProduct.vendor;
      product.productType = shopifyProduct.product_type;
      product.tags = shopifyProduct.tags ? shopifyProduct.tags.split(',').map(tag => tag.trim()) : [];
      product.handle = shopifyProduct.handle;
      product.status = shopifyProduct.status;
      product.publishedAt = shopifyProduct.published_at;
      product.publishedScope = shopifyProduct.published_scope;
      product.syncStatus = 'pending';
      
      logger.info(`Updated product record for ${shopifyProduct.id}`);
    }
    
    // Process variants
    product.variants = shopifyProduct.variants.map(variant => ({
      shopifyVariantId: variant.id.toString(),
      title: variant.title,
      price: parseFloat(variant.price),
      sku: variant.sku,
      barcode: variant.barcode,
      inventoryQuantity: variant.inventory_quantity,
      inventoryManagement: variant.inventory_management,
      weight: variant.weight,
      weightUnit: variant.weight_unit,
      requiresShipping: variant.requires_shipping,
      taxable: variant.taxable,
      options: [
        { name: 'Option1', value: variant.option1 },
        { name: 'Option2', value: variant.option2 },
        { name: 'Option3', value: variant.option3 },
      ].filter(option => option.value),
      syncStatus: 'pending',
    }));
    
    // Process options
    product.options = shopifyProduct.options.map(option => ({
      name: option.name,
      values: option.values,
    }));
    
    // Process images
    product.images = shopifyProduct.images.map(image => ({
      shopifyImageId: image.id.toString(),
      position: image.position,
      src: image.src,
      width: image.width,
      height: image.height,
      alt: image.alt,
    }));
    
    // Save the product
    await product.save();
    
    // Sync to SKU-Genie
    await syncToSKUGenie(shop, product, syncJobId);
    
    return product;
  } catch (error) {
    logger.error(`Error processing Shopify product ${shopifyProduct.id}: ${error.message}`);
    
    // Update sync job if provided
    if (syncJobId) {
      const syncJob = await SyncJob.findById(syncJobId);
      if (syncJob) {
        await syncJob.addError(
          shopifyProduct.id.toString(),
          'product',
          error.message,
          'PROCESSING_ERROR'
        );
      }
    }
    
    throw error;
  }
}

/**
 * Sync a product to SKU-Genie
 */
async function syncToSKUGenie(shop, product, syncJobId) {
  try {
    logger.info(`Syncing product ${product.shopifyProductId} to SKU-Genie`);
    
    // Update sync job if provided
    let syncJob = null;
    if (syncJobId) {
      syncJob = await SyncJob.findById(syncJobId);
      if (syncJob) {
        syncJob.status = 'in_progress';
        syncJob.startedAt = new Date();
        await syncJob.save();
      }
    }
    
    // Map product data according to settings
    const productMapping = shop.settings.productMapping;
    const skuGenieProduct = {
      id: product.skuGenieId, // Will be null for new products
      [productMapping.get('title') || 'title']: product.title,
      [productMapping.get('description') || 'description']: product.description,
      [productMapping.get('vendor') || 'brand']: product.vendor,
      [productMapping.get('productType') || 'frameShape']: product.productType,
      [productMapping.get('tags') || 'tags']: product.tags,
      external_id: product.shopifyProductId,
      external_source: 'shopify',
      variants: product.variants.map(variant => ({
        sku: variant.sku,
        barcode: variant.barcode,
        price: variant.price,
        inventory_quantity: variant.inventoryQuantity,
        options: variant.options.reduce((acc, option) => {
          acc[option.name] = option.value;
          return acc;
        }, {}),
        external_id: variant.shopifyVariantId,
      })),
      images: product.images.map(image => ({
        url: image.src,
        position: image.position,
        alt: image.alt,
        external_id: image.shopifyImageId,
      })),
    };
    
    // Send to SKU-Genie
    let response;
    if (product.skuGenieId) {
      // Update existing product
      response = await skuGenieApi.updateProduct(shop.clientId, product.skuGenieId, skuGenieProduct);
      logger.info(`Updated product ${product.shopifyProductId} in SKU-Genie with ID ${response.id}`);
    } else {
      // Create new product
      response = await skuGenieApi.createProduct(shop.clientId, skuGenieProduct);
      logger.info(`Created product ${product.shopifyProductId} in SKU-Genie with ID ${response.id}`);
      
      // Save SKU-Genie ID
      product.skuGenieId = response.id;
    }
    
    // Update product status
    product.syncStatus = 'synced';
    product.lastSyncedAt = new Date();
    await product.save();
    
    // Update sync job if provided
    if (syncJob) {
      syncJob.results.success.count += 1;
      syncJob.results.success.ids.push(product.shopifyProductId);
      syncJob.progress.current += 1;
      
      if (syncJob.progress.current >= syncJob.progress.total) {
        await syncJob.markAsCompleted();
      } else {
        await syncJob.save();
      }
    }
    
    return response;
  } catch (error) {
    logger.error(`Error syncing product ${product.shopifyProductId} to SKU-Genie: ${error.message}`);
    
    // Update product status
    product.syncStatus = 'failed';
    product.syncError = error.message;
    await product.save();
    
    // Update sync job if provided
    if (syncJobId) {
      const syncJob = await SyncJob.findById(syncJobId);
      if (syncJob) {
        await syncJob.addError(
          product.shopifyProductId,
          'product',
          error.message,
          'SYNC_ERROR'
        );
      }
    }
    
    throw error;
  }
}

/**
 * Delete a product from SKU-Genie
 */
async function deleteProductFromSKUGenie(shop, product) {
  try {
    if (!product.skuGenieId) {
      logger.warn(`Product ${product.shopifyProductId} has no SKU-Genie ID, skipping delete`);
      return;
    }
    
    logger.info(`Deleting product ${product.shopifyProductId} from SKU-Genie`);
    
    // Delete from SKU-Genie
    await skuGenieApi.deleteProduct(shop.clientId, product.skuGenieId);
    logger.info(`Deleted product ${product.shopifyProductId} from SKU-Genie`);
    
    return true;
  } catch (error) {
    logger.error(`Error deleting product ${product.shopifyProductId} from SKU-Genie: ${error.message}`);
    throw error;
  }
}

module.exports = {
  processShopifyProduct,
  syncToSKUGenie,
  deleteProductFromSKUGenie,
};