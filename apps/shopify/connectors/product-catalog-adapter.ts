/**
 * Product Catalog Adapter for Shopify Integration
 * 
 * This module provides mapping functionality between Shopify product data
 * and the EyewearML platform data model, including support for 
 * brand-manufacturer relationships and AI-enhanced attributes.
 */

import { ProductData, BrandData, ManufacturerData } from '../frontend/types/product-catalog';
import { enhanceWithVertexAI } from './vertex-ai-connector';

interface ShopifyProduct {
  id: string;
  title: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  body_html: string;
  metafields: ShopifyMetafield[];
}

interface ShopifyVariant {
  id: string;
  price: string;
  sku: string;
  option1: string;
  option2: string;
  option3: string;
}

interface ShopifyImage {
  src: string;
  alt: string;
}

interface ShopifyMetafield {
  namespace: string;
  key: string;
  value: string;
  value_type: string;
}

/**
 * Maps Shopify product data to the EyewearML product format
 * with brand-manufacturer relationship support
 */
export async function mapShopifyProductToEyewearML(
  shopifyProduct: ShopifyProduct,
  options = { enhanceWithAI: true }
): Promise<ProductData> {
  // Basic product mapping
  const product: ProductData = {
    id: `shopify_${shopifyProduct.id}`,
    name: shopifyProduct.title,
    brand: shopifyProduct.vendor,
    process.env.PRODUCT_CATALOG_ADAPTER_SECRET: await getBrandIdFromName(shopifyProduct.vendor),
    process.env.PRODUCT_CATALOG_ADAPTER_SECRET_1: await getManufacturerIdFromBrand(shopifyProduct.vendor),
    description: cleanHtmlDescription(shopifyProduct.body_html),
    model: getModelFromTags(shopifyProduct.tags) || shopifyProduct.sku,
    price: parseFloat(shopifyProduct.variants[0]?.price || '0'),
    currency: 'USD', // Default, can be configured
    specifications: extractSpecifications(shopifyProduct),
    images: {
      main_image: shopifyProduct.images[0]?.src || '',
      additional_images: shopifyProduct.images.slice(1).map(img => img.src)
    },
    metadata: {
      shopify_id: shopifyProduct.id,
      shopify_updated_at: new Date().toISOString(),
      tags: shopifyProduct.tags
    }
  };
  
  // Get measurements from metafields
  product.measurements = extractMeasurements(shopifyProduct.metafields);
  
  // Add AI enhancement if enabled
  if (options.enhanceWithAI) {
    try {
      // Use the Vertex AI connector to enhance the product
      const enhancedProduct = await enhanceWithVertexAI(product);
      product.ai_enhanced = enhancedProduct.ai_enhanced;
    } catch (error) {
      console.error('Error enhancing product with AI:', error);
      // Product will still be returned without AI enhancement
    }
  }
  
  return product;
}

/**
 * Maps EyewearML product data to Shopify format 
 * including brand-manufacturer relationships and AI enhancements
 */
export function mapEyewearMLToShopifyProduct(product: ProductData): ShopifyProduct {
  // Basic product mapping
  const shopifyProduct: ShopifyProduct = {
    id: product.metadata?.shopify_id || '',
    title: product.name,
    vendor: product.brand,
    product_type: 'Eyewear',
    tags: createTagsFromProduct(product),
    variants: [
      {
        id: '',
        price: product.price.toString(),
        sku: product.model || '',
        option1: product.specifications?.frame_color || 'Default',
        option2: product.specifications?.frame_material || '',
        option3: ''
      }
    ],
    images: [
      { src: product.images?.main_image || '', alt: product.name }
    ],
    body_html: createRichDescription(product),
    metafields: createMetafieldsFromProduct(product)
  };
  
  // Add all additional images
  if (product.images?.additional_images) {
    shopifyProduct.images.push(
      ...product.images.additional_images.map(src => ({ 
        src, 
        alt: `${product.name} additional view` 
      }))
    );
  }
  
  return shopifyProduct;
}

/**
 * Clean HTML description from Shopify
 */
function cleanHtmlDescription(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Extract model number from tags
 */
function getModelFromTags(tags: string[]): string | null {
  const modelTag = tags.find(tag => tag.startsWith('model:'));
  if (modelTag) {
    return modelTag.replace('model:', '').trim();
  }
  return null;
}

/**
 * Extract specifications from Shopify product
 */
function extractSpecifications(shopifyProduct: ShopifyProduct): any {
  const specs: any = {
    frame_type: '',
    frame_shape: '',
    frame_material: '',
    frame_color: ''
  };
  
  // Extract from tags
  shopifyProduct.tags.forEach(tag => {
    if (tag.startsWith('frame_type:')) {
      specs.frame_type = tag.replace('frame_type:', '').trim();
    } else if (tag.startsWith('frame_shape:')) {
      specs.frame_shape = tag.replace('frame_shape:', '').trim();
    } else if (tag.startsWith('frame_material:')) {
      specs.frame_material = tag.replace('frame_material:', '').trim();
    } else if (tag.startsWith('frame_color:')) {
      specs.frame_color = tag.replace('frame_color:', '').trim();
    }
  });
  
  // Extract from metafields as backup
  shopifyProduct.metafields.forEach(meta => {
    if (meta.namespace === 'specifications') {
      if (meta.key === 'frame_type' && !specs.frame_type) {
        specs.frame_type = meta.value;
      } else if (meta.key === 'frame_shape' && !specs.frame_shape) {
        specs.frame_shape = meta.value;
      } else if (meta.key === 'frame_material' && !specs.frame_material) {
        specs.frame_material = meta.value;
      } else if (meta.key === 'frame_color' && !specs.frame_color) {
        specs.frame_color = meta.value;
      }
    }
  });
  
  return specs;
}

/**
 * Extract measurements from Shopify metafields
 */
function extractMeasurements(metafields: ShopifyMetafield[]): any {
  const measurements: any = {};
  
  metafields.forEach(meta => {
    if (meta.namespace === 'measurements') {
      if (meta.key === 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_2') {
        measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_2 = parseFloat(meta.value);
      } else if (meta.key === 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_3') {
        measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_3 = parseFloat(meta.value);
      } else if (meta.key === 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_4') {
        measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_4 = parseFloat(meta.value);
      } else if (meta.key === 'lens_height') {
        measurements.lens_height = parseFloat(meta.value);
      } else if (meta.key === 'total_width') {
        measurements.total_width = parseFloat(meta.value);
      }
    }
  });
  
  return Object.keys(measurements).length > 0 ? measurements : undefined;
}

/**
 * Create tags for Shopify from EyewearML product
 */
function createTagsFromProduct(product: ProductData): string[] {
  const tags: string[] = [];
  
  // Add manufacturer tag
  if (product.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_1) {
    tags.push(`manufacturer:${product.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_1}`);
  }
  
  // Add brand tag
  if (product.process.env.PRODUCT_CATALOG_ADAPTER_SECRET) {
    tags.push(`brand:${product.process.env.PRODUCT_CATALOG_ADAPTER_SECRET}`);
  }
  
  // Add model tag
  if (product.model) {
    tags.push(`model:${product.model}`);
  }
  
  // Add specification tags
  if (product.specifications) {
    if (product.specifications.frame_type) {
      tags.push(`frame_type:${product.specifications.frame_type}`);
    }
    if (product.specifications.frame_shape) {
      tags.push(`frame_shape:${product.specifications.frame_shape}`);
    }
    if (product.specifications.frame_material) {
      tags.push(`frame_material:${product.specifications.frame_material}`);
    }
    if (product.specifications.frame_color) {
      tags.push(`frame_color:${product.specifications.frame_color}`);
    }
  }
  
  // Add AI-generated style keywords as tags
  if (product.ai_enhanced && product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_6) {
    product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_6.forEach(keyword => {
      tags.push(`style:${keyword.toLowerCase()}`);
    });
  }
  
  // Add best face shape tag based on compatibility scores
  if (product.ai_enhanced && product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_5_scores) {
    const scores = product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_5_scores;
    const bestFaceShape = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (bestFaceShape && bestFaceShape[1] >= 0.7) {
      tags.push(`best_for:${bestFaceShape[0]}`);
    }
  }
  
  return tags;
}

/**
 * Create rich HTML description for Shopify, incorporating AI-enhanced attributes
 */
function createRichDescription(product: ProductData): string {
  let html = `<p>${product.description}</p>`;
  
  // Add feature summary if available
  if (product.ai_enhanced && product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_7) {
    html += `<p><strong>Features:</strong> ${product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_7}</p>`;
  }
  
  // Add style description if available
  if (product.ai_enhanced && product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_8) {
    html += `<p><strong>Style:</strong> ${product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_8}</p>`;
  }
  
  // Add specifications section
  html += '<div class="specifications">';
  html += '<h4>Specifications</h4>';
  html += '<ul>';
  
  if (product.specifications) {
    if (product.specifications.frame_type) {
      html += `<li>Frame Type: ${product.specifications.frame_type}</li>`;
    }
    if (product.specifications.frame_shape) {
      html += `<li>Frame Shape: ${product.specifications.frame_shape}</li>`;
    }
    if (product.specifications.frame_material) {
      html += `<li>Frame Material: ${product.specifications.frame_material}</li>`;
    }
    if (product.specifications.frame_color) {
      html += `<li>Frame Color: ${product.specifications.frame_color}</li>`;
    }
  }
  
  if (product.measurements) {
    html += '<li>Measurements: ';
    const measurements = [];
    if (product.measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_2) {
      measurements.push(`Lens Width: ${product.measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_2}mm`);
    }
    if (product.measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_3) {
      measurements.push(`Bridge Width: ${product.measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_3}mm`);
    }
    if (product.measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_4) {
      measurements.push(`Temples Length: ${product.measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_4}mm`);
    }
    html += measurements.join(', ');
    html += '</li>';
  }
  
  html += '</ul>';
  html += '</div>';
  
  // Add face shape compatibility if available
  if (product.ai_enhanced && product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_5_scores) {
    html += '<div class="face-shape-compatibility">';
    html += '<h4>Face Shape Compatibility</h4>';
    html += '<ul>';
    
    const scores = product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_5_scores;
    const faceShapes = Object.entries(scores)
      .sort((a, b) => b[1] - a[1]);
    
    faceShapes.forEach(([shape, score]) => {
      // Only include shapes with decent compatibility
      if (score >= 0.6) {
        const percent = Math.round(score * 100);
        html += `<li>${shape.charAt(0).toUpperCase() + shape.slice(1)}: ${percent}% compatibility</li>`;
      }
    });
    
    html += '</ul>';
    html += '</div>';
  }
  
  return html;
}

/**
 * Create metafields for Shopify from EyewearML product
 */
function createMetafieldsFromProduct(product: ProductData): ShopifyMetafield[] {
  const metafields: ShopifyMetafield[] = [];
  
  // Brand and manufacturer metafields
  if (product.process.env.PRODUCT_CATALOG_ADAPTER_SECRET) {
    metafields.push({
      namespace: 'brand',
      key: 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET',
      value: product.process.env.PRODUCT_CATALOG_ADAPTER_SECRET,
      value_type: 'string'
    });
  }
  
  if (product.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_1) {
    metafields.push({
      namespace: 'brand',
      key: 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_1',
      value: product.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_1,
      value_type: 'string'
    });
  }
  
  // Measurements metafields
  if (product.measurements) {
    if (product.measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_2) {
      metafields.push({
        namespace: 'measurements',
        key: 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_2',
        value: product.measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_2.toString(),
        value_type: 'number_decimal'
      });
    }
    
    if (product.measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_3) {
      metafields.push({
        namespace: 'measurements',
        key: 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_3',
        value: product.measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_3.toString(),
        value_type: 'number_decimal'
      });
    }
    
    if (product.measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_4) {
      metafields.push({
        namespace: 'measurements',
        key: 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_4',
        value: product.measurements.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_4.toString(),
        value_type: 'number_decimal'
      });
    }
  }
  
  // AI-enhanced metafields
  if (product.ai_enhanced) {
    // Store face shape compatibility as JSON
    if (product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_5_scores) {
      metafields.push({
        namespace: 'ai_enhanced',
        key: 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_5',
        value: JSON.stringify(product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_5_scores),
        value_type: 'json_string'
      });
    }
    
    // Store style keywords
    if (product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_6 && product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_6.length > 0) {
      metafields.push({
        namespace: 'ai_enhanced',
        key: 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_6',
        value: product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_6.join(', '),
        value_type: 'string'
      });
    }
    
    // Store feature summary
    if (product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_7) {
      metafields.push({
        namespace: 'ai_enhanced',
        key: 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_7',
        value: product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_7,
        value_type: 'string'
      });
    }
    
    // Store style description
    if (product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_8) {
      metafields.push({
        namespace: 'ai_enhanced',
        key: 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_8',
        value: product.ai_enhanced.process.env.PRODUCT_CATALOG_ADAPTER_SECRET_8,
        value_type: 'string'
      });
    }
  }
  
  return metafields;
}

/**
 * Get brand ID from brand name using database lookup
 */
async function getBrandIdFromName(brandName: string): Promise<string> {
  try {
    // In a real implementation, this would query the database
    // For now, we'll use a basic mapping
    const brandMap: {[key: string]: string} = {
      'Ray-Ban': 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_9',
      'Oakley': 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_10',
      'Gucci': 'brand_gucci',
      'Prada': 'brand_prada',
      'Warby Parker': 'brand_warby_parker',
      'Calvin Klein': 'brand_calvin_klein'
    };
    
    return brandMap[brandName] || `brand_${brandName.toLowerCase().replace(/\s+/g, '_')}`;
  } catch (error) {
    console.error('Error getting brand ID:', error);
    return `brand_${brandName.toLowerCase().replace(/\s+/g, '_')}`;
  }
}

/**
 * Get manufacturer ID from brand name using database lookup
 */
async function getManufacturerIdFromBrand(brandName: string): Promise<string> {
  try {
    // In a real implementation, this would fetch the brand
    // and then get its manufacturer ID
    // For now, we'll use a basic mapping
    const manufacturerMap: {[key: string]: string} = {
      'Ray-Ban': 'manufacturer_luxottica_group',
      'Oakley': 'manufacturer_luxottica_group',
      'Gucci': 'manufacturer_kering',
      'Prada': 'manufacturer_luxottica_group',
      'Warby Parker': 'manufacturer_warby_parker',
      'Calvin Klein': 'manufacturer_marcolin'
    };
    
    return manufacturerMap[brandName] || 'manufacturer_unknown';
  } catch (error) {
    console.error('Error getting manufacturer ID:', error);
    return 'manufacturer_unknown';
  }
}

/**
 * Fetch brand data from the database
 */
export async function fetchBrandData(brandId: string): Promise<BrandData | null> {
  // In a real implementation, this would query the MongoDB database
  // For now, return a mock response
  const mockBrands: {[key: string]: BrandData} = {
    'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_9': {
      process.env.PRODUCT_CATALOG_ADAPTER_SECRET: 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_9',
      name: 'Ray-Ban',
      process.env.PRODUCT_CATALOG_ADAPTER_SECRET_1: 'manufacturer_luxottica_group',
      description: 'Ray-Ban is an American-Italian brand of luxury sunglasses and eyeglasses created in 1936.',
      style_categories: ['classic', 'iconic', 'timeless'],
      country_of_origin: 'Italy',
      founded_year: 1936,
      website: 'https://www.ray-ban.com'
    },
    'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_10': {
      process.env.PRODUCT_CATALOG_ADAPTER_SECRET: 'process.env.PRODUCT_CATALOG_ADAPTER_SECRET_10',
      name: 'Oakley',
      process.env.PRODUCT_CATALOG_ADAPTER_SECRET_1: 'manufacturer_luxottica_group',
      description: 'Oakley, Inc. is an American sports performance equipment manufacturer.',
      style_categories: ['sports', 'performance', 'technical'],
      country_of_origin: 'USA',
      founded_year: 1975,
      website: 'https://www.oakley.com'
    }
  };
  
  return mockBrands[brandId] || null;
}

/**
 * Fetch manufacturer data from the database
 */
export async function fetchManufacturerData(manufacturerId: string): Promise<ManufacturerData | null> {
  // In a real implementation, this would query the MongoDB database
  // For now, return a mock response
  const mockManufacturers: {[key: string]: ManufacturerData} = {
    'manufacturer_luxottica_group': {
      process.env.PRODUCT_CATALOG_ADAPTER_SECRET_1: 'manufacturer_luxottica_group',
      name: 'Luxottica Group',
      description: 'Luxottica Group S.p.A. is an Italian eyewear conglomerate and the world\'s largest company in the eyewear industry.',
      country_of_origin: 'Italy',
      founded_year: 1961,
      headquarters: 'Milan, Italy',
      website: 'https://www.luxottica.com'
    },
    'manufacturer_kering': {
      process.env.PRODUCT_CATALOG_ADAPTER_SECRET_1: 'manufacturer_kering',
      name: 'Kering Eyewear',
      description: 'Kering Eyewear is part of the Kering Group, a global luxury group that develops an ensemble of luxury houses in fashion, leather goods, jewelry and watches.',
      country_of_origin: 'France',
      founded_year: 2014,
      headquarters: 'Paris, France',
      website: 'https://www.kering.com'
    }
  };
  
  return mockManufacturers[manufacturerId] || null;
}
