# Product Catalog Adapter for Vertex AI Integration

## Overview

The Product Catalog Adapter is a critical component that standardizes product data from different e-commerce platforms (Shopify, WooCommerce) into a format that can be effectively used with Vertex AI's shopping assistant. This component ensures that domain-specific eyewear attributes are preserved and properly mapped regardless of the source platform.

## Adapter Architecture

The adapter follows a multi-stage process to normalize product data:

1. **Source Data Extraction**: Retrieving raw product data from the e-commerce platform
2. **Schema Mapping**: Transforming platform-specific schemas to a standardized structure
3. **Attribute Normalization**: Processing and standardizing domain-specific attributes
4. **Enrichment**: Adding derived attributes and metadata to enhance product discoverability
5. **Vertex AI Formatting**: Structuring data in Vertex AI's expected format

## Implementation Components

### 1. Product Catalog Adapter Core

```javascript
// src/conversational_ai/integrations/vertex_ai/product_catalog_adapter.js
class ProductCatalogAdapter {
  constructor(config) {
    this.platformType = config.platformType; // 'shopify' or 'woocommerce'
    this.apiCredentials = config.apiCredentials;
    this.platformConnector = this.createPlatformConnector(config);
    this.attributeNormalizer = new AttributeNormalizer(config.normalizationRules);
    this.dataCacheManager = new DataCacheManager(config.cacheConfig);
  }
  
  createPlatformConnector(config) {
    switch (this.platformType) {
      case 'shopify':
        return new ShopifyConnector(config.apiCredentials);
      case 'woocommerce':
        return new WooCommerceConnector(config.apiCredentials);
      default:
        throw new Error(`Unsupported platform type: ${this.platformType}`);
    }
  }
  
  async getProductCatalog() {
    // Check cache first
    const cachedData = await this.dataCacheManager.getCachedData();
    if (cachedData && !this.dataCacheManager.isExpired()) {
      return cachedData;
    }
    
    // Fetch products from the appropriate platform
    const rawProducts = await this.platformConnector.fetchProducts();
    
    // Transform to standard format
    const standardizedProducts = this.transformToStandardFormat(rawProducts);
    
    // Cache the standardized data
    await this.dataCacheManager.cacheData(standardizedProducts);
    
    return standardizedProducts;
  }
  
  async getProductById(productId) {
    // Try to get from cache first
    const cachedProduct = await this.dataCacheManager.getCachedProduct(productId);
    if (cachedProduct) {
      return cachedProduct;
    }
    
    // Fetch single product from platform
    const rawProduct = await this.platformConnector.fetchProductById(productId);
    
    // Transform to standard format
    return this.transformToStandardFormat([rawProduct])[0];
  }
  
  async searchProducts(searchCriteria) {
    // Convert domain-specific search criteria to platform-specific filters
    const platformFilters = this.mapSearchCriteria(searchCriteria);
    
    // Execute search against platform
    const rawResults = await this.platformConnector.searchProducts(platformFilters);
    
    // Transform to standard format
    return this.transformToStandardFormat(rawResults);
  }
  
  mapSearchCriteria(searchCriteria) {
    // Map domain-specific search parameters to platform-specific filters
    const platformFilters = {};
    
    // Handle platform-specific filtering approaches
    if (this.platformType === 'shopify') {
      // Shopify uses a different filtering structure than WooCommerce
      if (searchCriteria.frameShape) {
        platformFilters.tag = searchCriteria.frameShape;
      }
      
      if (searchCriteria.faceShape) {
        platformFilters.metafield_query = `face_shape_fit:${searchCriteria.faceShape}`;
      }
      
      // Handle other search criteria
    } else if (this.platformType === 'woocommerce') {
      // WooCommerce uses attribute-based filtering
      if (searchCriteria.frameShape) {
        platformFilters.attribute = 'pa_frame-shape';
        platformFilters.attribute_term = searchCriteria.frameShape;
      }
      
      if (searchCriteria.faceShape) {
        platformFilters.attribute = 'pa_face-shape-fit';
        platformFilters.attribute_term = searchCriteria.faceShape;
      }
      
      // Handle other search criteria
    }
    
    return platformFilters;
  }
  
  transformToStandardFormat(rawProducts) {
    // Transform platform-specific product data to standard format
    return rawProducts.map(rawProduct => {
      // Extract common properties
      const standardProduct = {
        id: this.extractProductId(rawProduct),
        title: this.extractTitle(rawProduct),
        description: this.extractDescription(rawProduct),
        price: this.extractPrice(rawProduct),
        images: this.extractImages(rawProduct),
        url: this.extractProductUrl(rawProduct),
        variants: this.extractVariants(rawProduct),
        attributes: this.extractAttributes(rawProduct)
      };
      
      // Normalize the attributes
      standardProduct.attributes = this.attributeNormalizer.normalize(
        standardProduct.attributes,
        this.platformType
      );
      
      // Enhance with computed attributes
      this.enhanceWithComputedAttributes(standardProduct);
      
      return standardProduct;
    });
  }
  
  extractProductId(rawProduct) {
    if (this.platformType === 'shopify') {
      return rawProduct.id.toString();
    } else if (this.platformType === 'woocommerce') {
      return rawProduct.id.toString();
    }
    return '';
  }
  
  extractTitle(rawProduct) {
    if (this.platformType === 'shopify') {
      return rawProduct.title;
    } else if (this.platformType === 'woocommerce') {
      return rawProduct.name;
    }
    return '';
  }
  
  extractDescription(rawProduct) {
    if (this.platformType === 'shopify') {
      return rawProduct.body_html || '';
    } else if (this.platformType === 'woocommerce') {
      return rawProduct.description || '';
    }
    return '';
  }
  
  extractPrice(rawProduct) {
    let price = {
      amount: 0,
      currency: 'USD', // Default
      compareAtPrice: null
    };
    
    if (this.platformType === 'shopify') {
      // Get the first variant's price or the product's price
      if (rawProduct.variants && rawProduct.variants.length > 0) {
        price.amount = parseFloat(rawProduct.variants[0].price);
        price.compareAtPrice = rawProduct.variants[0].compare_at_price ? 
                              parseFloat(rawProduct.variants[0].compare_at_price) : null;
      }
      // Try to get currency from shop settings or defaults
      price.currency = rawProduct.currency || 'USD';
    } else if (this.platformType === 'woocommerce') {
      price.amount = parseFloat(rawProduct.price);
      price.compareAtPrice = rawProduct.regular_price ? 
                            parseFloat(rawProduct.regular_price) : null;
      // WooCommerce currency is typically set at the store level
      price.currency = 'USD'; // Would need to be fetched from store settings
    }
    
    return price;
  }
  
  extractImages(rawProduct) {
    const images = [];
    
    if (this.platformType === 'shopify') {
      if (rawProduct.images && rawProduct.images.length > 0) {
        rawProduct.images.forEach(image => {
          images.push({
            id: image.id.toString(),
            url: image.src,
            alt: image.alt || '',
            position: image.position || 0
          });
        });
      }
    } else if (this.platformType === 'woocommerce') {
      if (rawProduct.images && rawProduct.images.length > 0) {
        rawProduct.images.forEach(image => {
          images.push({
            id: image.id.toString(),
            url: image.src,
            alt: image.alt || '',
            position: image.position || 0
          });
        });
      }
    }
    
    return images;
  }
  
  extractProductUrl(rawProduct) {
    if (this.platformType === 'shopify') {
      // Typically combines the store URL with the product handle
      return `/products/${rawProduct.handle}`;
    } else if (this.platformType === 'woocommerce') {
      return rawProduct.permalink;
    }
    return '';
  }
  
  extractVariants(rawProduct) {
    const variants = [];
    
    if (this.platformType === 'shopify') {
      if (rawProduct.variants && rawProduct.variants.length > 0) {
        rawProduct.variants.forEach(variant => {
          variants.push({
            id: variant.id.toString(),
            title: variant.title,
            price: {
              amount: parseFloat(variant.price),
              currency: rawProduct.currency || 'USD',
              compareAtPrice: variant.compare_at_price ? 
                            parseFloat(variant.compare_at_price) : null
            },
            sku: variant.sku || '',
            available: variant.available,
            options: this.extractVariantOptions(variant, rawProduct)
          });
        });
      }
    } else if (this.platformType === 'woocommerce') {
      if (rawProduct.variations && rawProduct.variations.length > 0) {
        // WooCommerce variations typically need to be fetched separately
        // This would be handled in the WooCommerceConnector
        rawProduct.variations.forEach(variation => {
          variants.push({
            id: variation.id.toString(),
            title: variation.name || '',
            price: {
              amount: parseFloat(variation.price),
              currency: 'USD', // Would need store currency
              compareAtPrice: variation.regular_price ? 
                            parseFloat(variation.regular_price) : null
            },
            sku: variation.sku || '',
            available: variation.in_stock,
            options: this.extractVariantOptions(variation, rawProduct)
          });
        });
      }
    }
    
    return variants;
  }
  
  extractAttributes(rawProduct) {
    const attributes = {
      general: {},
      eyewear: {}
    };
    
    if (this.platformType === 'shopify') {
      // Extract from Shopify metafields
      if (rawProduct.metafields) {
        rawProduct.metafields.forEach(metafield => {
          if (metafield.namespace === 'eyewear') {
            attributes.eyewear[metafield.key] = metafield.value;
          } else {
            attributes.general[metafield.key] = metafield.value;
          }
        });
      }
      
      // Extract from Shopify tags
      if (rawProduct.tags) {
        attributes.general.tags = rawProduct.tags.split(', ');
        
        // Extract eyewear-specific tags
        // e.g., "frame_shape:rectangle" -> attributes.eyewear.frameShape = "rectangle"
        attributes.general.tags.forEach(tag => {
          const match = tag.match(/^([^:]+):(.+)$/);
          if (match) {
            const [, key, value] = match;
            if (key.startsWith('frame_') || key.startsWith('lens_') || key === 'face_shape') {
              attributes.eyewear[this.camelCase(key)] = value;
            }
          }
        });
      }
    } else if (this.platformType === 'woocommerce') {
      // Extract from WooCommerce attributes
      if (rawProduct.attributes) {
        rawProduct.attributes.forEach(attribute => {
          // Convert to standard format
          const key = attribute.name.toLowerCase().replace(/\s+/g, '_');
          const value = attribute.options && attribute.options.length > 0 ? 
                       attribute.options.join(', ') : '';
          
          // Categorize attributes
          if (key.startsWith('frame_') || key.startsWith('lens_') || key === 'face_shape') {
            attributes.eyewear[this.camelCase(key)] = value;
          } else {
            attributes.general[this.camelCase(key)] = value;
          }
        });
      }
    }
    
    return attributes;
  }
  
  camelCase(str) {
    return str.replace(/[_-]([a-z])/g, (_, letter) => letter.toUpperCase());
  }
  
  enhanceWithComputedAttributes(product) {
    // Add computed and derived attributes
    
    // Calculate a style score based on product attributes
    if (product.attributes.eyewear) {
      const styleScores = {
        modern: 0,
        classic: 0,
        vintage: 0,
        trendy: 0,
        minimalist: 0
      };
      
      // Analyze frame shape
      if (product.attributes.eyewear.frameShape) {
        const shape = product.attributes.eyewear.frameShape.toLowerCase();
        if (['rectangular', 'square', 'geometric'].includes(shape)) {
          styleScores.modern += 1;
          styleScores.minimalist += 0.5;
        } else if (['round', 'oval'].includes(shape)) {
          styleScores.vintage += 0.5;
          if (product.attributes.eyewear.frameMaterial === 'metal') {
            styleScores.vintage += 0.5;
          }
        } else if (['cat-eye', 'butterfly'].includes(shape)) {
          styleScores.vintage += 1;
          styleScores.trendy += 0.5;
        } else if (['aviator', 'navigator'].includes(shape)) {
          styleScores.classic += 1;
        } else if (['wayfarer', 'browline'].includes(shape)) {
          styleScores.classic += 1;
        }
      }
      
      // Analyze frame materials
      if (product.attributes.eyewear.frameMaterial) {
        const material = product.attributes.eyewear.frameMaterial.toLowerCase();
        if (['acetate', 'plastic'].includes(material)) {
          // Neutral for style scoring
        } else if (['titanium', 'carbon fiber'].includes(material)) {
          styleScores.modern += 0.5;
          styleScores.minimalist += 0.5;
        } else if (material === 'wood') {
          styleScores.vintage += 0.5;
          styleScores.trendy += 0.5;
        }
      }
      
      // Add the calculated style scores
      product.attributes.eyewear.styleScores = styleScores;
      
      // Determine primary style based on highest score
      const primaryStyle = Object.entries(styleScores)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0])[0];
      
      product.attributes.eyewear.primaryStyle = primaryStyle;
    }
    
    return product;
  }
}
```

### 2. Platform-Specific Connectors

#### Shopify Connector

```javascript
// src/conversational_ai/integrations/vertex_ai/connectors/shopify_connector.js
class ShopifyConnector {
  constructor(apiCredentials) {
    this.apiKey = apiCredentials.apiKey;
    this.password = apiCredentials.password;
    this.shopName = apiCredentials.shopName;
    this.apiVersion = apiCredentials.apiVersion || '2023-10';
    this.baseUrl = `https://${this.shopName}.myshopify.com/admin/api/${this.apiVersion}`;
    
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: this.apiKey,
        password: this.password
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }
  
  async fetchProducts(options = {}) {
    const params = {
      limit: options.limit || 50,
      page: options.page || 1
    };
    
    if (options.collection) {
      params.collection_id = options.collection;
    }
    
    if (options.productType) {
      params.product_type = options.productType;
    }
    
    // Add other filter options
    
    try {
      const response = await this.httpClient.get('/products.json', { params });
      return response.data.products;
    } catch (error) {
      console.error('Error fetching products from Shopify:', error);
      throw new Error(`Shopify API error: ${error.message}`);
    }
  }
  
  async fetchProductById(productId) {
    try {
      const response = await this.httpClient.get(`/products/${productId}.json`);
      return response.data.product;
    } catch (error) {
      console.error(`Error fetching product ${productId} from Shopify:`, error);
      throw new Error(`Shopify API error: ${error.message}`);
    }
  }
  
  async searchProducts(filters) {
    // Construct Shopify-specific search query
    let query = '';
    
    if (filters.tag) {
      query += `tag:${filters.tag} `;
    }
    
    if (filters.productType) {
      query += `product_type:${filters.productType} `;
    }
    
    if (filters.metafield_query) {
      // For the Shopify GraphQL API which supports metafield filtering
      // This would require a GraphQL implementation
      return this.searchProductsWithMetafields(filters);
    }
    
    // Remove trailing space
    query = query.trim();
    
    if (!query) {
      // If no filters were applied, fetch all products
      return this.fetchProducts();
    }
    
    try {
      const response = await this.httpClient.get('/products.json', {
        params: { q: query }
      });
      return response.data.products;
    } catch (error) {
      console.error('Error searching products in Shopify:', error);
      throw new Error(`Shopify search API error: ${error.message}`);
    }
  }
  
  async searchProductsWithMetafields(filters) {
    // This would use Shopify's GraphQL API for more advanced filtering
    // Implementation depends on the specific metafield structure
    
    // Placeholder for GraphQL implementation
    console.warn('Metafield search not fully implemented, falling back to basic search');
    return this.fetchProducts();
  }
}
```

#### WooCommerce Connector

```javascript
// src/conversational_ai/integrations/vertex_ai/connectors/woocommerce_connector.js
class WooCommerceConnector {
  constructor(apiCredentials) {
    this.url = apiCredentials.url;
    this.consumerKey = apiCredentials.consumerKey;
    this.consumerSecret = apiCredentials.consumerSecret;
    this.version = apiCredentials.version || 'wc/v3';
    
    this.wooCommerce = new WooCommerceRestApi({
      url: this.url,
      consumerKey: this.consumerKey,
      consumerSecret: this.consumerSecret,
      version: this.version
    });
  }
  
  async fetchProducts(options = {}) {
    const params = {
      per_page: options.limit || 50,
      page: options.page || 1
    };
    
    if (options.category) {
      params.category = options.category;
    }
    
    if (options.tag) {
      params.tag = options.tag;
    }
    
    try {
      const response = await this.wooCommerce.get('products', params);
      return response.data;
    } catch (error) {
      console.error('Error fetching products from WooCommerce:', error);
      throw new Error(`WooCommerce API error: ${error.message}`);
    }
  }
  
  async fetchProductById(productId) {
    try {
      const response = await this.wooCommerce.get(`products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${productId} from WooCommerce:`, error);
      throw new Error(`WooCommerce API error: ${error.message}`);
    }
  }
  
  async searchProducts(filters) {
    const params = {};
    
    if (filters.attribute && filters.attribute_term) {
      params.attribute = filters.attribute;
      params.attribute_term = filters.attribute_term;
    }
    
    if (filters.category) {
      params.category = filters.category;
    }
    
    if (filters.tag) {
      params.tag = filters.tag;
    }
    
    if (filters.search) {
      params.search = filters.search;
    }
    
    try {
      const response = await this.wooCommerce.get('products', params);
      return response.data;
    } catch (error) {
      console.error('Error searching products in WooCommerce:', error);
      throw new Error(`WooCommerce search API error: ${error.message}`);
    }
  }
}
```

### 3. Attribute Normalizer

```javascript
// src/conversational_ai/integrations/vertex_ai/attribute_normalizer.js
class AttributeNormalizer {
  constructor(normalizationRules) {
    this.normalizationRules = normalizationRules || this.getDefaultRules();
  }
  
  getDefaultRules() {
    return {
      // Rules for normalizing frame shapes
      frameShape: {
        mappings: {
          // Standardize shape names
          'rect': 'rectangular',
          'rectangle': 'rectangular',
          'square': 'square',
          'round': 'round',
          'circular': 'round',
          'oval': 'oval',
          'cat eye': 'cat-eye',
          'cateye': 'cat-eye',
          'aviator': 'aviator',
          'pilot': 'aviator',
          'wayfarer': 'wayfarer',
          'clubmaster': 'browline',
          'browline': 'browline'
        }
      },
      
      // Rules for normalizing frame materials
      frameMaterial: {
        mappings: {
          'acetate': 'acetate',
          'plastic': 'acetate',
          'metal': 'metal',
          'titanium': 'titanium',
          'stainless steel': 'stainless-steel',
          'stainless-steel': 'stainless-steel',
          'tr-90': 'tr-90',
          'tr90': 'tr-90',
          'memory titanium': 'memory-titanium',
          'wood': 'wood',
          'carbon fiber': 'carbon-fiber'
        }
      },
      
      // Rules for normalizing face shapes
      faceShape: {
        mappings: {
          'round': 'round',
          'oval': 'oval',
          'square': 'square',
          'rectangle': 'rectangular',
          'rectangular': 'rectangular',
          'heart': 'heart',
          'heart shaped': 'heart',
          'heart-shaped': 'heart',
          'diamond': 'diamond'
        }
      },
      
      // Rules for normalizing lens types
      lensType: {
        mappings: {
          'single vision': 'single-vision',
          'progressive': 'progressive',
          'bifocal': 'bifocal',
          'reading': 'reading',
          'sunglasses': 'sun',
          'sun': 'sun',
          'transition': 'photochromic',
          'photochromic': 'photochromic'
        }
      }
    };
  }
  
  normalize(attributes, platformType) {
    const normalizedAttributes = {
      general: { ...attributes.general },
      eyewear: { ...attributes.eyewear }
    };
    
    // Apply normalization rules to eyewear attributes
    for (const [attrKey, rule] of Object.entries(this.normalizationRules)) {
      const camelCaseKey = this.camelCase(attrKey);
      
      // Skip if the attribute doesn't exist
      if (!normalizedAttributes.eyewear[camelCaseKey]) {
        continue;
      }
      
      // Get the raw value
      let rawValue = normalizedAttributes.eyewear[camelCaseKey];
      
      // Handle array values (e.g., from WooCommerce multiple selections)
      if (Array.isArray(rawValue)) {
        rawValue = rawValue.join(', ').toLowerCase();
      } else if (typeof rawValue === 'string') {
        rawValue = rawValue.toLowerCase();
      }
      
      // Apply mappings
      if (rule.mappings && rule.mappings[rawValue]) {
        normalizedAttributes.eyewear[camelCaseKey] = rule.mappings[rawValue];
      }
    }
    
    // Handle platform-specific normalization needs
    if (platformType === 'shopify') {
      this.normalizeShopifySpecific(normalizedAttributes);
    } else if (platformType === 'woocommerce') {
      this.normalizeWooCommerceSpecific(normalizedAttributes);
    }
    
    return normalizedAttributes;
  }
  
  normalizeShopifySpecific(attributes) {
    // Handle Shopify-specific normalization needs
    
    // Example: Parse string values that should be arrays
    if (attributes.eyewear.recommendedFaceShapes && 
        typeof attributes.eyewear.recommendedFaceShapes === 'string') {
      attributes.eyewear.recommendedFaceShapes = 
        attributes.eyewear.recommendedFaceShapes.split(',').map(s => s.trim());
    }
    
    // Handle other Shopify-specific normalizations
  }
  
  normalizeWooCommerceSpecific(attributes) {
    // Handle WooCommerce-specific normalization needs
    
    // Example: Handle serialized data in custom fields
    if (attributes.eyewear.technicalSpecifications && 
        typeof attributes.eyewear.technicalSpecifications === 'string' &&
        attributes.eyewear.technicalSpecifications.startsWith('{')) {
      try {
        attributes.eyewear.technicalSpecifications = 
          JSON.parse(attributes.eyewear.technicalSpecifications);
      } catch (e) {
        console.warn('Failed to parse technical specifications JSON', e);
      }
    }
    
    // Handle other WooCommerce-specific normalizations
  }
  
  camelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }
}
```

### 4. Vertex AI Product Data Transformer

```javascript
// src/conversational_ai/integrations/vertex_ai/vertex_product_transformer.js
class VertexProductTransformer {
  constructor(config) {
    this.retailConfig = config.retailConfig || {};
    this.storeInfo = config.storeInfo || {};
  }
  
  transformForVertexAI(standardProducts) {
    // Transform to Vertex AI Retail format
    return standardProducts.map(product => this.transformProduct(product));
  }
  
  transformProduct(product) {
    // Create Vertex AI compatible product object
    const vertexProduct = {
      id: product.id,
      name: `projects/${this.retailConfig.projectId}/locations/${this.retailConfig.location}/catalogs/${this.retailConfig.catalogId}/branches/${this.retailConfig.branchId}/products/${product.id}`,
      title: product.title,
      description: this.stripHtmlTags(product.description),
      categories: this.extractCategories(product),
      uri: this.buildProductUri(product),
      images: product.images.map(image => ({
        uri: image.url,
        height: 0, // Would need actual dimensions
        width: 0,   // Would need actual dimensions
      })),
      priceInfo: {
        price: product.price.amount,
        originalPrice: product.price.compareAtPrice || product.price.amount,
        currencyCode: product.price.currency,
      },
      attributes: this.transformAttributes(product.attributes)
    };
    
    // Add availability information
    if (product.variants && product.variants.length > 0) {
      vertexProduct.availability = product.variants.some(v => v.available) ? 'IN_STOCK' : 'OUT_OF_STOCK';
    } else {
      vertexProduct.availability = 'AVAILABILITY_UNKNOWN';
    }
    
    return vertexProduct;
  }
  
  stripHtmlTags(html) {
    return html.replace(/<[^>]*>?/gm, '');
  }
  
  extractCategories(product) {
    // Extract product categories/collections
    const categories = [];
    
    // Add from general attributes if available
    if (product.attributes.general.productType) {
      categories.push(product.attributes.general.productType);
    }
    
    if (product.attributes.general.collections) {
      if (Array.isArray(product.attributes.general.collections)) {
        categories.push(...product.attributes.general.collections);
      } else if (typeof product.attributes.general.collections === 'string') {
        categories.push(product.attributes.general.collections);
      }
    }
    
    // Add eyewear-specific categories
    if (product.attributes.eyewear.frameShape) {
      categories.push(`Frame Shape: ${product.attributes.eyewear.frameShape}`);
    }
    
    if (product.attributes.eyewear.frameMaterial) {
      categories.push(`Material: ${product.attributes.eyewear.frameMaterial}`);
    }
    
    if (product.attributes.eyewear.primaryStyle) {
      categories.push(`Style: ${product.attributes.eyewear.primaryStyle}`);
    }
    
    return categories;
  }
  
  buildProductUri(product) {
    // Build the fully qualified product URL
    if (product.url.startsWith('http')) {
      return product.url;
    }
    
    // Otherwise, it's a relative URL
    const baseUrl = this.storeInfo.baseUrl || '';
    return `${baseUrl}${product.url}`;
  }
  
  transformAttributes(attributes) {
    // Transform attributes to Vertex AI format (key-value pairs)
    const vertexAttributes = {};
    
    // Add general attributes
    for (const [key,
