# Product Catalog Adapter

The Product Catalog Adapter is a critical component of the Vertex AI Shopping Assistant integration. It transforms Shopify product data into a standardized format that can be used by the Vertex AI system for intelligent product recommendations.

## Overview

The Product Catalog Adapter serves as a bridge between the Shopify e-commerce platform and the EyewearML AI system. It ensures that product data is properly structured, enriched with eyewear-specific attributes, and optimized for AI-powered search and recommendations.

## Implementation

The adapter is implemented in TypeScript and is located at `apps/shopify/connectors/product-catalog-adapter.ts`. It provides methods for:

- Fetching product data from Shopify
- Transforming products into a standardized format
- Enriching products with eyewear-specific attributes
- Filtering and sorting products based on various criteria

## Data Model

The adapter transforms Shopify products into a `StandardProduct` format defined in `apps/shopify/frontend/types/product-catalog.ts`:

```typescript
export interface StandardProduct {
  id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currencyCode: string;
    compareAtPrice?: number;
  };
  url: string;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: {
    general: {
      tags: string[];
      vendor: string;
      productType: string;
      collections: string[];
    };
    eyewear: EyewearAttributes;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    shopifyId: string;
    shopDomain: string;
  };
}
```

### Eyewear-Specific Attributes

The adapter extracts and structures eyewear-specific attributes that are essential for accurate recommendations:

```typescript
export interface EyewearAttributes {
  frameShape?: string;
  frameMaterial?: string;
  frameStyle?: string;
  frameColor?: string;
  frameWidth?: string | number;
  frameHeight?: string | number;
  bridgeWidth?: string | number;
  templeLength?: string | number;
  lensDiameter?: string | number;
  lensHeight?: string | number;
  lensWidth?: string | number;
  lensColor?: string;
  lensMaterial?: string;
  lensCoating?: string[];
  lensType?: string;
  lensCategory?: string;
  uvProtection?: boolean;
  polarized?: boolean;
  recommendedFaceShapes?: string[];
  gender?: string;
  weight?: string | number;
  hingeType?: string;
  adjustableNosePads?: boolean;
  prescription?: {
    available: boolean;
    types?: string[];
    minSphere?: number;
    maxSphere?: number;
    minCylinder?: number;
    maxCylinder?: number;
  };
  virtualTryOn?: boolean;
  sustainabilityFeatures?: string[];
  warranty?: string;
  bestseller?: boolean;
  new?: boolean;
  onSale?: boolean;
}
```

## Key Functions

### Product Transformation

The adapter transforms Shopify product data by:

1. Extracting basic product information (ID, title, description, etc.)
2. Normalizing pricing information
3. Processing product images
4. Extracting variant information
5. Mapping Shopify metafields to eyewear-specific attributes
6. Organizing general product attributes (tags, vendor, etc.)

### Attribute Mapping

The adapter maps Shopify attributes to the standardized format:

| Shopify Attribute | Standard Attribute | Notes |
|-------------------|---------------------|-------|
| Product ID | id | Prefixed with 'shopify-' |
| Title | title | Direct mapping |
| Body HTML | description | HTML stripped for clean text |
| Product Type | attributes.general.productType | Direct mapping |
| Vendor | attributes.general.vendor | Direct mapping |
| Tags | attributes.general.tags | Split into array |
| Variants | variants | Transformed to StandardVariant format |
| Images | images | Processed for different sizes |
| Metafields | attributes.eyewear.* | Mapped to specific eyewear attributes |

### Metafield Mapping

Shopify metafields are mapped to specialized eyewear attributes:

| Metafield Namespace:Key | EyewearAttribute |
|------------------------|-----------------|
| eyewear:frame_shape | frameShape |
| eyewear:frame_material | frameMaterial |
| eyewear:frame_color | frameColor |
| eyewear:face_shapes | recommendedFaceShapes |
| eyewear:lens_type | lensType |
| eyewear:lens_color | lensColor |
| eyewear:polarized | polarized |
| eyewear:gender | gender |
| eyewear:prescription_available | prescription.available |

## Usage Examples

### Basic Product Transformation

```typescript
import { ProductCatalogAdapter } from '../connectors/product-catalog-adapter';

// Initialize the adapter
const adapter = new ProductCatalogAdapter({
  shopDomain: 'your-store.myshopify.com',
  apiKey: process.env.SHOPIFY_API_KEY,
  apiPassword: process.env.SHOPIFY_API_PASSWORD
});

// Get products
const products = await adapter.getProducts();

// Get a specific product
const product = await adapter.getProductById('shopify-123456789');

// Search products
const sunglasses = await adapter.searchProducts('sunglasses');
```

### Integration with Vertex AI

```typescript
import { ProductCatalogAdapter } from '../connectors/product-catalog-adapter';
import { VertexAIConnector } from '../connectors/vertex-ai-connector';

// Initialize adapters
const productAdapter = new ProductCatalogAdapter({
  shopDomain: 'your-store.myshopify.com'
});

const vertexAI = new VertexAIConnector('your-store.myshopify.com');

// Get product recommendations based on query
async function getRecommendations(query, sessionId) {
  // Get AI recommendations
  const result = await vertexAI.getProductRecommendation(query, {
    sessionId,
    maxResults: 5
  });
  
  // Enhance the recommendations with full product data
  if (result.products && result.products.length > 0) {
    const enhancedProducts = await Promise.all(
      result.products.map(product => 
        productAdapter.getProductById(product.id)
      )
    );
    result.products = enhancedProducts;
  }
  
  return result;
}
```

## Error Handling

The adapter implements robust error handling for common issues:

1. **API Connection Errors**: Retries with exponential backoff
2. **Missing Data**: Provides sensible defaults for missing attributes
3. **Data Format Issues**: Normalizes inconsistent data formats
4. **Rate Limiting**: Respects Shopify API rate limits

## Performance Optimization

To ensure optimal performance:

1. **Caching**: Products are cached to reduce API calls
2. **Batch Processing**: Products are processed in batches
3. **Incremental Updates**: Only changed products are refreshed
4. **Data Minimization**: Only required fields are requested

## Implementation Considerations

When working with the Product Catalog Adapter:

1. **Initialize Early**: Set up the adapter during application startup
2. **Handle Authentication**: Ensure Shopify API credentials are properly configured
3. **Monitor API Usage**: Watch for rate limit issues
4. **Regular Syncs**: Schedule periodic full catalog synchronization

## Related Components

The Product Catalog Adapter works closely with:

- [Vertex AI Connector](./vertex-ai-connector.md): Uses the standardized product data for AI recommendations
- [API Endpoints](./api-endpoints.md): Provides product data to frontend components
- [Shopping Assistant UI](./chat-interface.md): Displays product recommendations from the adapter
