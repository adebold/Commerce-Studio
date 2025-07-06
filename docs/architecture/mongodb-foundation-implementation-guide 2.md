# MongoDB Foundation Service - Implementation Guide
## Bridging SKU Genie to Store Generation Pipeline

### Overview

This implementation guide provides the exact specifications for building the MongoDB Foundation Service that bridges the critical gap identified in the specification. The existing [`ProductDataService`](src/store_generation/services/product_data_service.py:1) already expects specific MongoDB collections and schemas - this service will create and populate them.

**Critical Insight**: The store generation pipeline is already built and working, but it expects MongoDB collections (`products`, `brands`, `categories`, `face_shape_compatibility`) that don't exist yet. This service creates that foundation.

---

## 1. Exact MongoDB Schema Implementation

### 1.1 Database and Collections Structure

```javascript
// Database: eyewear_ml
// Collections that ProductDataService expects:
- products                    // Main product catalog
- brands                     // Brand information  
- categories                 // Product categorization
- face_shape_compatibility   // Face shape analysis (referenced but not used in current service)
- user_analytics            // Analytics data (referenced but not used in current service)
```

### 1.2 Products Collection Schema (Aligned with ProductDataService)

```javascript
// Collection: products
// Schema matching ProductDataService aggregation pipelines
{
  _id: ObjectId,
  
  // Core fields used by ProductDataService._build_product_query()
  sku: string,                    // Unique identifier from SKU Genie
  name: string,                   // Product display name
  description: string,            // Product description
  brand_id: ObjectId,             // Reference to brands collection
  category_id: ObjectId,          // Reference to categories collection
  
  // Pricing fields used in aggregation pipelines
  price: number,                  // Current price
  compare_at_price: number,       // Original price for sale displays
  
  // Inventory fields used in filtering
  in_stock: boolean,              // Stock status
  inventory_quantity: number,     // Current inventory
  
  // Status and quality fields
  active: boolean,                // Active status (always filtered in queries)
  featured: boolean,              // Featured product flag
  quality_score: number,          // Quality score (0.0 - 1.0)
  rating: number,                 // Average user rating
  
  // Eyewear-specific fields used in filtering
  frame_type: string,             // "prescription", "sunglasses", "blue_light"
  color: string,                  // Primary color for filtering
  
  // Face shape compatibility object used by get_products_by_face_shape()
  face_shape_compatibility: {
    oval: number,                 // 0.0 - 1.0 compatibility score
    round: number,
    square: number,
    heart: number,
    diamond: number,
    oblong: number
  },
  
  // Timestamps
  created_at: Date,
  updated_at: Date,
  
  // Additional fields for SKU Genie integration
  source: string,                 // "sku_genie", "import", "manual"
  source_metadata: object,        // Source-specific data
  last_validated: Date,           // Last quality validation
  
  // Extended eyewear specifications
  frame_shape: string,            // "round", "square", "aviator", "cat_eye", "rectangular"
  frame_material: string,         // "acetate", "metal", "titanium", "plastic"
  lens_type: string,              // "single_vision", "progressive", "bifocal"
  gender_target: string,          // "unisex", "men", "women", "kids"
  style: string,                  // "modern", "classic", "vintage", "sporty"
  
  // Physical measurements
  frame_size: {
    lens_width: number,           // mm
    bridge_width: number,         // mm
    temple_length: number,        // mm
    frame_width: number,          // mm (calculated)
    frame_height: number,         // mm
    weight: number                // grams
  },
  
  // Media assets
  media: {
    primary_image: string,        // Main product image URL
    gallery_images: [string],     // Additional product angles
    try_on_image: string,         // Virtual try-on compatible image
    optimized_images: {
      webp: [string],             // WebP format variants
      placeholder: string         // Base64 blur placeholder
    }
  },
  
  // AI enhancement
  ai_enhanced: boolean,           // AI processing completion status
  ai_description: string,         // AI-enhanced description
  ai_tags: [string],              // AI-generated product tags
  
  // Store generation optimization
  sort_order: number,            // Custom display sort order
  template_variant: string,       // Specific template variant
  
  // Cross-platform integration
  platform_data: {
    shopify_id: string,           // Shopify product ID
    bigcommerce_id: string,       // BigCommerce product ID
    woocommerce_id: string,       // WooCommerce product ID
  }
}
```

### 1.3 Brands Collection Schema

```javascript
// Collection: brands
// Used in ProductDataService aggregation lookups
{
  _id: ObjectId,
  name: string,                   // Brand name (looked up in aggregations)
  slug: string,                   // URL-friendly brand name
  description: string,            // Brand description
  logo_url: string,               // Brand logo (used in lookups)
  website: string,                // Brand website (used in service)
  
  // Analytics
  product_count: number,          // Cached product count
  
  // Status
  active: boolean,                // Active status (filtered in get_brands())
  sort_order: number,
  created_at: Date,
  updated_at: Date
}
```

### 1.4 Categories Collection Schema

```javascript
// Collection: categories  
// Used in ProductDataService with graph lookups for hierarchy
{
  _id: ObjectId,
  name: string,                   // Category name (looked up in aggregations)
  slug: string,                   // URL-friendly name
  description: string,            // Category description
  
  // Hierarchy support for $graphLookup in get_categories()
  parent_id: ObjectId,            // Parent category (null for root)
  level: number,                  // Hierarchy level (0 = root)
  
  // Display
  sort_order: number,             // Used in sorting
  
  // Status
  active: boolean,                // Active status (filtered in queries)
  created_at: Date,
  updated_at: Date
}
```

---

## 2. Required Indexes for ProductDataService Performance

### 2.1 Products Collection Indexes

```javascript
// Indexes matching ProductDataService query patterns

// Primary key and unique constraints
db.products.createIndex({ sku: 1 }, { unique: true })
db.products.createIndex({ _id: 1 })

// Active status (used in all queries)
db.products.createIndex({ active: 1 })

// Brand and category lookups (used in aggregations)
db.products.createIndex({ brand_id: 1, active: 1 })
db.products.createIndex({ category_id: 1, active: 1 })

// Stock filtering (used in get_products and get_featured_products)
db.products.createIndex({ in_stock: 1, active: 1 })

// Featured products query optimization
db.products.createIndex({ 
  featured: -1, 
  quality_score: -1, 
  rating: -1,
  in_stock: 1,
  active: 1 
})

// Face shape compatibility queries
db.products.createIndex({ "face_shape_compatibility.oval": -1, in_stock: 1, active: 1 })
db.products.createIndex({ "face_shape_compatibility.round": -1, in_stock: 1, active: 1 })
db.products.createIndex({ "face_shape_compatibility.square": -1, in_stock: 1, active: 1 })
db.products.createIndex({ "face_shape_compatibility.heart": -1, in_stock: 1, active: 1 })
db.products.createIndex({ "face_shape_compatibility.diamond": -1, in_stock: 1, active: 1 })
db.products.createIndex({ "face_shape_compatibility.oblong": -1, in_stock: 1, active: 1 })

// Filter combinations used in _build_product_query
db.products.createIndex({ frame_type: 1, active: 1 })
db.products.createIndex({ color: 1, active: 1 })
db.products.createIndex({ price: 1 })
db.products.createIndex({ quality_score: -1 })

// Sorting indexes (used in get_products)
db.products.createIndex({ created_at: -1 })
db.products.createIndex({ updated_at: -1 })

// Text search index (used when search filter is provided)
db.products.createIndex({ 
  name: "text", 
  description: "text",
  ai_description: "text",
  ai_tags: "text"
})

// Compound indexes for complex queries
db.products.createIndex({ 
  brand_id: 1, 
  category_id: 1, 
  in_stock: 1, 
  active: 1 
})
```

### 2.2 Brands Collection Indexes

```javascript
// Indexes for brands collection
db.brands.createIndex({ active: 1, name: 1 })  // Used in get_brands()
db.brands.createIndex({ _id: 1 })               // Used in aggregation lookups
```

### 2.3 Categories Collection Indexes

```javascript
// Indexes for categories collection with hierarchy support
db.categories.createIndex({ active: 1 })                    // Used in get_categories()
db.categories.createIndex({ parent_id: 1 })                 // Used in $graphLookup
db.categories.createIndex({ sort_order: 1, name: 1 })       // Used in sorting
db.categories.createIndex({ _id: 1 })                       // Used in aggregation lookups
```

---

## 3. Service Implementation Specifications

### 3.1 MongoDB Foundation Service Interface

```typescript
interface MongoDBFoundationService {
  // Core initialization matching ProductDataService expectations
  initialize(): Promise<void>
  
  // Collection managers that create/populate the expected collections
  productManager: ProductManager
  brandManager: BrandManager
  categoryManager: CategoryManager
  
  // Integration services that populate the collections
  skuGenieConnector: SKUGenieConnector
  migrationService: MigrationService
  syncService: SyncService
  
  // Validation that ProductDataService will work correctly
  validateProductDataService(): Promise<ValidationResult>
}
```

### 3.2 Product Manager Implementation

```typescript
interface ProductManager {
  // Create products in the format ProductDataService expects
  createProduct(skuGenieProduct: SKUGenieProduct): Promise<ProductDocument>
  
  // Bulk operations for migration
  bulkUpsertProducts(products: SKUGenieProduct[]): Promise<BulkResult>
  
  // Update operations that maintain ProductDataService compatibility
  updateProduct(sku: string, updates: Partial<ProductDocument>): Promise<ProductDocument>
  
  // Validation that the created products work with ProductDataService
  validateProductSchema(product: ProductDocument): Promise<ValidationResult>
  
  // Face shape compatibility calculation
  calculateFaceShapeCompatibility(product: ProductDocument): Promise<FaceShapeCompatibility>
}
```

### 3.3 SKU Genie Data Transformation

```typescript
// Transform SKU Genie data to ProductDataService-compatible format
async function transformSKUGenieToMongoDB(skuGenieProduct: SKUGenieProduct): Promise<ProductDocument> {
  return {
    // Map SKU Genie fields to ProductDataService expected schema
    sku: skuGenieProduct.sku,
    name: skuGenieProduct.name,
    description: skuGenieProduct.description,
    
    // Resolve brand_id from brand name
    brand_id: await resolveBrandId(skuGenieProduct.brand),
    
    // Resolve category_id from category name  
    category_id: await resolveCategoryId(skuGenieProduct.category),
    
    // Direct mappings
    price: skuGenieProduct.price,
    compare_at_price: skuGenieProduct.compare_at_price || skuGenieProduct.price,
    in_stock: skuGenieProduct.inventory > 0,
    inventory_quantity: skuGenieProduct.inventory,
    
    // Status fields
    active: skuGenieProduct.active !== false,
    featured: false, // Will be set based on quality score
    quality_score: skuGenieProduct.quality_score,
    rating: 0, // Will be populated from user feedback
    
    // Eyewear specifics
    frame_type: skuGenieProduct.frame_type,
    frame_shape: skuGenieProduct.frame_shape,
    frame_material: skuGenieProduct.frame_material,
    lens_type: skuGenieProduct.lens_type,
    color: skuGenieProduct.color,
    gender_target: skuGenieProduct.gender,
    style: skuGenieProduct.style,
    
    // Frame measurements
    frame_size: skuGenieProduct.measurements,
    
    // Media
    media: {
      primary_image: skuGenieProduct.images[0],
      gallery_images: skuGenieProduct.images,
      try_on_image: skuGenieProduct.try_on_image,
      optimized_images: {
        webp: [], // Will be generated
        placeholder: "" // Will be generated
      }
    },
    
    // Face shape compatibility (will be calculated by AI)
    face_shape_compatibility: {
      oval: 0.5,
      round: 0.5,
      square: 0.5,
      heart: 0.5,
      diamond: 0.5,
      oblong: 0.5
    },
    
    // AI enhancement flags
    ai_enhanced: false,
    ai_description: "",
    ai_tags: [],
    
    // Metadata
    source: "sku_genie",
    source_metadata: { 
      sku_genie_id: skuGenieProduct.id,
      imported_at: new Date()
    },
    
    // Timestamps
    created_at: new Date(skuGenieProduct.created_at),
    updated_at: new Date(skuGenieProduct.updated_at),
    last_validated: new Date()
  }
}
```

---

## 4. Migration Strategy Implementation

### 4.1 SKU Genie to MongoDB Migration Pipeline

```typescript
interface MigrationPipeline {
  // Phase 1: Extract data from SKU Genie
  extractFromSKUGenie(): Promise<SKUGenieProduct[]>
  
  // Phase 2: Transform to MongoDB schema
  transformToMongoDBSchema(products: SKUGenieProduct[]): Promise<ProductDocument[]>
  
  // Phase 3: Create supporting collections
  createBrandsAndCategories(products: ProductDocument[]): Promise<void>
  
  // Phase 4: Load into MongoDB with indexes
  loadIntoMongoDB(products: ProductDocument[]): Promise<void>
  
  // Phase 5: Validate ProductDataService compatibility
  validateCompatibility(): Promise<ValidationResult>
}

// Implementation details
class SKUGenieToMongoDBMigration implements MigrationPipeline {
  async extractFromSKUGenie(): Promise<SKUGenieProduct[]> {
    // Use existing SKU Genie API to extract all products
    const products = await this.skuGenieAPI.getAllProducts({
      quality_score_min: 0.0, // Include all products
      active_only: false       // Include inactive for complete migration
    })
    
    logger.info(`Extracted ${products.length} products from SKU Genie`)
    return products
  }
  
  async transformToMongoDBSchema(products: SKUGenieProduct[]): Promise<ProductDocument[]> {
    const transformed = []
    
    for (const product of products) {
      try {
        const mongoProduct = await transformSKUGenieToMongoDB(product)
        
        // Validate the transformed product matches ProductDataService expectations
        await this.validateProductSchema(mongoProduct)
        
        transformed.push(mongoProduct)
      } catch (error) {
        logger.error(`Failed to transform product ${product.sku}: ${error.message}`)
        // Continue with other products
      }
    }
    
    logger.info(`Transformed ${transformed.length} products to MongoDB schema`)
    return transformed
  }
  
  async createBrandsAndCategories(products: ProductDocument[]): Promise<void> {
    // Extract unique brands
    const brands = new Map()
    const categories = new Map()
    
    for (const product of products) {
      if (!brands.has(product.brand_id)) {
        brands.set(product.brand_id, {
          _id: product.brand_id,
          name: await this.getBrandName(product.brand_id),
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        })
      }
      
      if (!categories.has(product.category_id)) {
        categories.set(product.category_id, {
          _id: product.category_id,
          name: await this.getCategoryName(product.category_id),
          active: true,
          parent_id: null, // Root categories for now
          level: 0,
          sort_order: 0,
          created_at: new Date(),
          updated_at: new Date()
        })
      }
    }
    
    // Bulk insert brands and categories
    await this.db.brands.insertMany(Array.from(brands.values()))
    await this.db.categories.insertMany(Array.from(categories.values()))
    
    logger.info(`Created ${brands.size} brands and ${categories.size} categories`)
  }
  
  async loadIntoMongoDB(products: ProductDocument[]): Promise<void> {
    // Create indexes first for optimal performance
    await this.createIndexes()
    
    // Bulk insert products in batches
    const batchSize = 1000
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      await this.db.products.insertMany(batch, { ordered: false })
      
      logger.info(`Loaded batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(products.length / batchSize)}`)
    }
    
    logger.info(`Loaded ${products.length} products into MongoDB`)
  }
  
  async validateCompatibility(): Promise<ValidationResult> {
    // Test ProductDataService operations against migrated data
    const productService = new ProductDataService(this.mongoClient)
    
    const tests = [
      () => productService.count_products(),
      () => productService.get_products({ limit: 10 }),
      () => productService.get_featured_products(5),
      () => productService.get_products_by_face_shape('oval', 0.7, 10),
      () => productService.get_brands(),
      () => productService.get_categories()
    ]
    
    const results = []
    for (const test of tests) {
      try {
        await test()
        results.push({ test: test.name, success: true })
      } catch (error) {
        results.push({ test: test.name, success: false, error: error.message })
      }
    }
    
    const allPassed = results.every(r => r.success)
    logger.info(`ProductDataService compatibility: ${allPassed ? 'PASSED' : 'FAILED'}`)
    
    return { valid: allPassed, results }
  }
}
```

---

## 5. AI Enhancement Pipeline

### 5.1 Face Shape Compatibility Calculation

```typescript
interface FaceShapeAnalyzer {
  // Calculate compatibility scores for all face shapes
  analyzeFaceShapeCompatibility(product: ProductDocument): Promise<FaceShapeCompatibility>
  
  // Batch processing for migration
  batchAnalyzeFaceShapeCompatibility(products: ProductDocument[]): Promise<void>
}

class VertexAIFaceShapeAnalyzer implements FaceShapeAnalyzer {
  async analyzeFaceShapeCompatibility(product: ProductDocument): Promise<FaceShapeCompatibility> {
    // Use Vertex AI to analyze frame characteristics and calculate compatibility
    const frameFeatures = {
      shape: product.frame_shape,
      material: product.frame_material,
      style: product.style,
      measurements: product.frame_size
    }
    
    const prediction = await this.vertexAI.predict({
      model: 'face-shape-compatibility-v1',
      input: frameFeatures
    })
    
    return {
      oval: prediction.compatibility.oval,
      round: prediction.compatibility.round,
      square: prediction.compatibility.square,
      heart: prediction.compatibility.heart,
      diamond: prediction.compatibility.diamond,
      oblong: prediction.compatibility.oblong
    }
  }
  
  async batchAnalyzeFaceShapeCompatibility(products: ProductDocument[]): Promise<void> {
    const batchSize = 100
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      
      const compatibilityUpdates = await Promise.all(
        batch.map(async (product) => {
          const compatibility = await this.analyzeFaceShapeCompatibility(product)
          return {
            updateOne: {
              filter: { sku: product.sku },
              update: { 
                $set: { 
                  face_shape_compatibility: compatibility,
                  ai_enhanced: true,
                  updated_at: new Date()
                }
              }
            }
          }
        })
      )
      
      await this.db.products.bulkWrite(compatibilityUpdates)
      logger.info(`Updated face shape compatibility for batch ${Math.floor(i / batchSize) + 1}`)
    }
  }
}
```

---

## 6. Real-time Synchronization

### 6.1 SKU Genie Webhook Handler

```typescript
interface SKUGenieWebhookHandler {
  handleProductUpdate(webhook: SKUGenieWebhook): Promise<void>
}

class ProductSyncHandler implements SKUGenieWebhookHandler {
  async handleProductUpdate(webhook: SKUGenieWebhook): Promise<void> {
    const { event_type, sku, product } = webhook
    
    switch (event_type) {
      case 'product.created':
      case 'product.updated':
        await this.upsertProduct(product)
        break
        
      case 'product.deleted':
        await this.deactivateProduct(sku)
        break
        
      case 'quality.updated':
        await this.updateQualityScore(sku, product.quality_score)
        break
    }
    
    // Invalidate ProductDataService caches if any
    await this.invalidateProductCaches(sku)
  }
  
  private async upsertProduct(skuGenieProduct: SKUGenieProduct): Promise<void> {
    const mongoProduct = await transformSKUGenieToMongoDB(skuGenieProduct)
    
    await this.db.products.updateOne(
      { sku: mongoProduct.sku },
      { 
        $set: {
          ...mongoProduct,
          updated_at: new Date()
        }
      },
      { upsert: true }
    )
    
    // Trigger AI enhancement if needed
    if (!mongoProduct.ai_enhanced) {
      await this.queueForAIEnhancement(mongoProduct.sku)
    }
  }
}
```

---

## 7. Implementation Checklist

### 7.1 Phase 1: Foundation Setup
- [ ] Create MongoDB cluster with proper configuration
- [ ] Implement collection schemas matching ProductDataService expectations
- [ ] Create all required indexes for optimal query performance
- [ ] Implement MongoDB Foundation Service core

### 7.2 Phase 2: Data Migration
- [ ] Implement SKU Genie data extraction
- [ ] Build transformation pipeline to MongoDB schema
- [ ] Create brands and categories collections
- [ ] Load products with bulk operations
- [ ] Validate ProductDataService compatibility

### 7.3 Phase 3: AI Enhancement
- [ ] Implement face shape compatibility calculation
- [ ] Batch process existing products for AI enhancement
- [ ] Set up real-time AI processing for new products

### 7.4 Phase 4: Real-time Sync
- [ ] Implement SKU Genie webhook handling
- [ ] Build real-time synchronization service
- [ ] Add conflict resolution mechanisms
- [ ] Implement cache invalidation strategies

### 7.5 Phase 5: Validation and Monitoring
- [ ] Test all ProductDataService operations
- [ ] Validate query performance (<100ms)
- [ ] Implement monitoring and alerting
- [ ] Document operational procedures

---

## 8. Success Validation

### 8.1 ProductDataService Compatibility Tests

```typescript
// Test suite to validate ProductDataService works correctly
async function validateProductDataServiceCompatibility(): Promise<boolean> {
  const productService = new ProductDataService(mongoClient)
  
  // Test 1: Basic product count
  const count = await productService.count_products()
  assert(count > 0, "Products collection should contain data")
  
  // Test 2: Product retrieval with filters
  const products = await productService.get_products({
    limit: 10,
    filters: { in_stock: true, active: true }
  })
  assert(products.length > 0, "Should retrieve active, in-stock products")
  
  // Test 3: Featured products
  const featured = await productService.get_featured_products(5)
  assert(featured.length > 0, "Should retrieve featured products")
  
  // Test 4: Face shape compatibility
  const faceShapeProducts = await productService.get_products_by_face_shape('oval', 0.7, 10)
  assert(faceShapeProducts.length > 0, "Should retrieve face shape compatible products")
  
  // Test 5: Brands and categories
  const brands = await productService.get_brands()
  const categories = await productService.get_categories()
  assert(brands.length > 0 && categories.length > 0, "Should retrieve brands and categories")
  
  // Test 6: Query performance
  const startTime = Date.now()
  await productService.get_products({ limit: 100 })
  const queryTime = Date.now() - startTime
  assert(queryTime < 100, `Query should be <100ms, was ${queryTime}ms`)
  
  return true
}
```

### 8.2 End-to-End Pipeline Test

```typescript
// Test the complete SKU Genie → MongoDB → Store Generation pipeline
async function validateEndToEndPipeline(): Promise<boolean> {
  // 1. Extract data from SKU Genie
  const skuGenieProducts = await skuGenieConnector.getProducts({ limit: 10 })
  
  // 2. Transform and load into MongoDB
  const mongoProducts = await Promise.all(
    skuGenieProducts.map(p => transformSKUGenieToMongoDB(p))
  )
  await productManager.bulkUpsertProducts(mongoProducts)
  
  // 3. Test ProductDataService can access the data
  const productService = new ProductDataService(mongoClient)
  const retrievedProducts = await productService.get_products({ limit: 10 })
  
  // 4. Test store generation can use the data
  const storeController = new StoreGenerationController()
  const storeRequest = {
    store_name: "Test Store",
    theme_name: "modern-minimal",
    product_filters: { active: true }
  }
  
  const jobId = await storeController.generate_store(storeRequest)
  assert(jobId, "Store generation should start successfully")
  
  return true
}
```

This implementation guide provides the exact specifications needed to build the MongoDB Foundation Service that bridges SKU Genie data to the existing store generation pipeline. The key insight is that the ProductDataService already defines the exact MongoDB schema and query patterns required - the foundation service just needs to create and populate those collections.