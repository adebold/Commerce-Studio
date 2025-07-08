# MongoDB Foundation Service - Technical Implementation Specification
## Detailed Interface Definitions and Implementation Guidelines

### Overview

This document provides the detailed technical specifications for implementing the MongoDB Foundation Service, including exact interface definitions, data structures, error handling patterns, and integration protocols required to bridge the SKU Genie → MongoDB → Store Generation pipeline.

---

## 1. Core Data Models and Types

### 1.1 Product Document Interface

```typescript
interface ProductDocument {
  _id: ObjectId
  
  // Core Identity
  sku: string                     // Unique identifier from SKU Genie
  product_id: string              // Cross-platform identifier
  name: string
  description: string
  ai_description?: string
  
  // Classification
  brand_id: ObjectId
  brand_name: string              // Denormalized for performance
  category_id: ObjectId
  category_name: string           // Denormalized for performance
  
  // Eyewear Specifications
  frame_type: FrameType
  frame_shape: FrameShape
  frame_material: FrameMaterial
  lens_type: LensType
  
  // Physical Measurements
  frame_size: FrameSize
  
  // AI-Generated Compatibility Scores
  face_shape_compatibility: FaceShapeCompatibility
  
  // Styling
  color: string
  color_variants: string[]
  style: ProductStyle
  gender_target: GenderTarget
  
  // Pricing and Inventory
  price: number
  compare_at_price?: number
  currency: string
  cost?: number
  inventory_quantity: number
  in_stock: boolean
  low_stock_threshold: number
  
  // Media Assets
  media: ProductMedia
  
  // SEO Data
  seo: SEOData
  
  // Quality and AI
  quality_score: number           // 0.0 - 1.0
  ai_enhanced: boolean
  ai_tags: string[]
  ai_metadata: AIMetadata
  
  // Engagement Metrics
  rating?: number
  review_count: number
  view_count: number
  conversion_rate?: number
  
  // Store Optimization
  featured: boolean
  sort_order: number
  template_variant?: string
  store_visibility: StoreVisibility
  
  // Platform Integration
  platform_data: PlatformData
  
  // Audit Fields
  source: DataSource
  source_metadata?: Record<string, any>
  active: boolean
  created_at: Date
  updated_at: Date
  last_validated?: Date
  version: number                 // For optimistic locking
}
```

### 1.2 Supporting Type Definitions

```typescript
enum FrameType {
  PRESCRIPTION = "prescription",
  SUNGLASSES = "sunglasses",
  BLUE_LIGHT = "blue_light",
  READING = "reading"
}

enum FrameShape {
  ROUND = "round",
  SQUARE = "square",
  AVIATOR = "aviator",
  CAT_EYE = "cat_eye",
  RECTANGULAR = "rectangular",
  OVAL = "oval",
  WAYFARER = "wayfarer"
}

enum FrameMaterial {
  ACETATE = "acetate",
  METAL = "metal",
  TITANIUM = "titanium",
  PLASTIC = "plastic",
  WOOD = "wood",
  CARBON_FIBER = "carbon_fiber"
}

enum LensType {
  SINGLE_VISION = "single_vision",
  PROGRESSIVE = "progressive",
  BIFOCAL = "bifocal",
  TRIFOCAL = "trifocal",
  NON_PRESCRIPTION = "non_prescription"
}

enum ProductStyle {
  MODERN = "modern",
  CLASSIC = "classic",
  VINTAGE = "vintage",
  SPORTY = "sporty",
  LUXURY = "luxury",
  MINIMALIST = "minimalist"
}

enum GenderTarget {
  UNISEX = "unisex",
  MEN = "men",
  WOMEN = "women",
  KIDS = "kids"
}

enum DataSource {
  SKU_GENIE = "sku_genie",
  IMPORT = "import",
  MANUAL = "manual",
  MIGRATION = "migration"
}

interface FrameSize {
  lens_width: number              // mm
  bridge_width: number            // mm
  temple_length: number           // mm
  frame_width: number             // mm (calculated)
  frame_height: number            // mm
  weight?: number                 // grams
}

interface FaceShapeCompatibility {
  oval: number                    // 0.0 - 1.0
  round: number                   // 0.0 - 1.0
  square: number                  // 0.0 - 1.0
  heart: number                   // 0.0 - 1.0
  diamond: number                 // 0.0 - 1.0
  oblong: number                  // 0.0 - 1.0
}

interface ProductMedia {
  primary_image: string
  gallery_images: string[]
  try_on_image?: string
  video_url?: string
  ar_model_url?: string
  optimized_images: OptimizedImages
  responsive_breakpoints: ResponsiveBreakpoints
}

interface OptimizedImages {
  webp: string[]
  avif: string[]
  placeholder?: string            // Base64 blur placeholder
}

interface ResponsiveBreakpoints {
  mobile: string[]
  tablet: string[]
  desktop: string[]
}

interface SEOData {
  title: string
  description: string
  keywords: string[]
  canonical_url?: string
  structured_data?: Record<string, any>
  open_graph: OpenGraphData
}

interface OpenGraphData {
  title: string
  description: string
  image: string
  type: string
}

interface AIMetadata {
  style_confidence?: number
  face_shape_model_version?: string
  enhancement_timestamp?: Date
  processing_notes: string[]
}

interface StoreVisibility {
  visible: boolean
  hide_out_of_stock: boolean
  minimum_inventory: number
}

interface PlatformData {
  shopify_id?: string
  bigcommerce_id?: string
  woocommerce_id?: string
  sync_status: PlatformSyncStatus
}

interface PlatformSyncStatus {
  shopify?: SyncStatus
  bigcommerce?: SyncStatus
  woocommerce?: SyncStatus
}

interface SyncStatus {
  last_sync: Date
  status: "success" | "failed" | "pending"
  error_message?: string
}
```

---

## 2. Service Interface Specifications

### 2.1 MongoDB Foundation Service Core

```typescript
interface MongoDBFoundationService {
  // Core initialization
  initialize(config: ServiceConfig): Promise<void>
  shutdown(): Promise<void>
  healthCheck(): Promise<HealthCheckResult>
  
  // Collection managers
  readonly products: ProductCollectionManager
  readonly brands: BrandCollectionManager
  readonly categories: CategoryCollectionManager
  readonly faceShapeAnalysis: FaceShapeAnalysisManager
  readonly auditLogs: AuditLogManager
  
  // Service components
  readonly migrationManager: MigrationManager
  readonly syncService: SyncService
  readonly indexManager: IndexManager
  readonly auditLogger: AuditLogger
  
  // Integration connectors
  readonly skuGenieConnector: SKUGenieConnector
  readonly postgresqlBridge: PostgreSQLBridge
  readonly vertexAIConnector: VertexAIConnector
  readonly aiEnhancementPipeline: AIEnhancementPipeline
}

interface ServiceConfig {
  mongodb: MongoDBConfig
  redis: RedisConfig
  skuGenie: SKUGenieConfig
  vertexAI: VertexAIConfig
  postgresql: PostgreSQLConfig
  features: FeatureFlags
}

interface MongoDBConfig {
  connectionString: string
  database: string
  maxPoolSize: number
  minPoolSize: number
  maxIdleTimeMS: number
  serverSelectionTimeoutMS: number
  readPreference: "primary" | "secondary" | "secondaryPreferred"
}

interface RedisConfig {
  host: string
  port: number
  password?: string
  maxConnections: number
  maxRetries: number
  retryDelayOnFailover: number
}

interface FeatureFlags {
  enableAIEnhancement: boolean
  enableRealTimeSync: boolean
  enableFaceShapeAnalysis: boolean
  enableAdvancedCaching: boolean
}
```

### 2.2 Product Collection Manager

```typescript
interface ProductCollectionManager {
  // Basic CRUD operations
  create(product: CreateProductRequest): Promise<ProductDocument>
  update(sku: string, updates: UpdateProductRequest): Promise<ProductDocument>
  delete(sku: string): Promise<boolean>
  findBySku(sku: string): Promise<ProductDocument | null>
  findById(id: ObjectId): Promise<ProductDocument | null>
  
  // Query operations
  getProducts(options: GetProductsOptions): Promise<GetProductsResult>
  countProducts(filters?: ProductFilters): Promise<number>
  getFeaturedProducts(limit?: number): Promise<ProductDocument[]>
  getProductsByFaceShape(
    faceShape: keyof FaceShapeCompatibility, 
    minCompatibility?: number
  ): Promise<ProductDocument[]>
  
  // Bulk operations
  bulkUpsert(products: BulkUpsertRequest[]): Promise<BulkUpsertResult>
  bulkUpdateInventory(updates: InventoryUpdate[]): Promise<BulkUpdateResult>
  bulkDelete(skus: string[]): Promise<BulkDeleteResult>
  
  // Search and filtering
  searchProducts(query: SearchQuery): Promise<SearchResult>
  getProductsByBrand(brandId: ObjectId, options?: PaginationOptions): Promise<ProductDocument[]>
  getProductsByCategory(categoryId: ObjectId, options?: PaginationOptions): Promise<ProductDocument[]>
  
  // Analytics and reporting
  getAnalyticsSummary(): Promise<ProductAnalytics>
  getInventoryReport(): Promise<InventoryReport>
  getQualityReport(): Promise<QualityReport>
  
  // AI enhancement
  enhanceWithAI(sku: string): Promise<AIEnhancementResult>
  batchEnhanceWithAI(skus: string[]): Promise<BatchAIEnhancementResult>
  
  // Validation
  validateProduct(product: Partial<ProductDocument>): Promise<ValidationResult>
}

interface GetProductsOptions {
  filters?: ProductFilters
  pagination?: PaginationOptions
  sort?: SortOptions
  projection?: ProjectionOptions
}

interface ProductFilters {
  brand_ids?: ObjectId[]
  category_ids?: ObjectId[]
  frame_types?: FrameType[]
  frame_shapes?: FrameShape[]
  frame_materials?: FrameMaterial[]
  price_range?: PriceRange
  in_stock?: boolean
  featured?: boolean
  active?: boolean
  quality_score_min?: number
  face_shape_compatibility?: FaceShapeFilter
}

interface FaceShapeFilter {
  shape: keyof FaceShapeCompatibility
  min_compatibility: number
}

interface PriceRange {
  min?: number
  max?: number
}

interface PaginationOptions {
  page: number
  limit: number
}

interface SortOptions {
  field: string
  direction: "asc" | "desc"
}

interface ProjectionOptions {
  include?: string[]
  exclude?: string[]
}

interface GetProductsResult {
  products: ProductDocument[]
  total: number
  page: number
  limit: number
  has_more: boolean
}
```

### 2.3 SKU Genie Connector

```typescript
interface SKUGenieConnector {
  // Configuration and connection
  initialize(config: SKUGenieConfig): Promise<void>
  testConnection(): Promise<boolean>
  
  // Data retrieval
  getProducts(filters?: SKUGenieFilters): Promise<SKUGenieProduct[]>
  getProduct(sku: string): Promise<SKUGenieProduct | null>
  getProductsBatch(skus: string[]): Promise<SKUGenieProduct[]>
  
  // Quality data
  getQualityScore(sku: string): Promise<QualityScore>
  getQualityReport(sku: string): Promise<QualityReport>
  
  // Real-time updates
  subscribeToUpdates(callback: SKUGenieUpdateCallback): Promise<void>
  unsubscribeFromUpdates(): Promise<void>
  
  // Data transformation
  transformToMongoDBSchema(skuGenieProduct: SKUGenieProduct): Promise<ProductDocument>
  batchTransformToMongoDBSchema(skuGenieProducts: SKUGenieProduct[]): Promise<ProductDocument[]>
  
  // Webhook management
  registerWebhook(endpoint: string, events: SKUGenieWebhookEvent[]): Promise<WebhookRegistration>
  unregisterWebhook(webhookId: string): Promise<boolean>
  validateWebhookPayload(payload: any, signature: string): boolean
  
  // Sync operations
  syncProduct(sku: string): Promise<SyncResult>
  syncAllProducts(): Promise<BatchSyncResult>
}

interface SKUGenieConfig {
  apiUrl: string
  apiKey: string
  webhook_secret: string
  timeout: number
  retries: number
}

interface SKUGenieFilters {
  updated_since?: Date
  quality_score_min?: number
  active_only?: boolean
  limit?: number
  offset?: number
}

interface SKUGenieProduct {
  sku: string
  name: string
  description: string
  brand: string
  category: string
  frame_type: string
  frame_shape: string
  frame_material: string
  lens_type: string
  measurements: FrameSize
  color: string
  color_variants: string[]
  style: string
  gender: string
  price: number
  cost?: number
  inventory: number
  images: string[]
  quality_score: number
  active: boolean
  created_at: string
  updated_at: string
}

type SKUGenieUpdateCallback = (update: SKUGenieUpdate) => Promise<void>

interface SKUGenieUpdate {
  event_type: "product.created" | "product.updated" | "product.deleted"
  sku: string
  product?: SKUGenieProduct
  timestamp: Date
}

enum SKUGenieWebhookEvent {
  PRODUCT_CREATED = "product.created",
  PRODUCT_UPDATED = "product.updated",
  PRODUCT_DELETED = "product.deleted",
  QUALITY_UPDATED = "quality.updated"
}
```

### 2.4 AI Enhancement Pipeline

```typescript
interface AIEnhancementPipeline {
  // Configuration
  initialize(config: VertexAIConfig): Promise<void>
  
  // Face shape analysis
  analyzeFaceShapeCompatibility(product: ProductDocument): Promise<FaceShapeCompatibility>
  batchAnalyzeFaceShapeCompatibility(products: ProductDocument[]): Promise<FaceShapeCompatibility[]>
  
  // Content enhancement
  generateAIDescription(product: ProductDocument): Promise<string>
  generateSEOContent(product: ProductDocument): Promise<SEOData>
  generateProductTags(product: ProductDocument): Promise<string[]>
  
  // Batch processing
  processProductBatch(products: ProductDocument[]): Promise<BatchEnhancementResult>
  
  // Quality assurance
  validateAIEnhancements(product: ProductDocument): Promise<ValidationResult>
  
  // Model management
  updateAIModels(): Promise<ModelUpdateResult>
  getModelVersions(): Promise<ModelVersion[]>
  
  // Monitoring
  getProcessingMetrics(): Promise<ProcessingMetrics>
}

interface VertexAIConfig {
  projectId: string
  region: string
  credentialsPath: string
  models: {
    faceShapeAnalysis: string
    contentGeneration: string
    seoOptimization: string
  }
}

interface BatchEnhancementResult {
  processed: number
  successful: number
  failed: number
  errors: EnhancementError[]
  processing_time_ms: number
}

interface EnhancementError {
  sku: string
  error_type: string
  error_message: string
}

interface ProcessingMetrics {
  total_processed: number
  average_processing_time_ms: number
  success_rate: number
  error_rate: number
  model_accuracy: number
}
```

---

## 3. Error Handling and Response Patterns

### 3.1 Standard Error Types

```typescript
enum ErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  DUPLICATE_KEY = "DUPLICATE_KEY",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  AI_PROCESSING_ERROR = "AI_PROCESSING_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR"
}

interface ServiceError {
  type: ErrorType
  message: string
  details?: Record<string, any>
  code?: string
  timestamp: Date
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

interface ValidationError {
  field: string
  message: string
  value?: any
}
```

### 3.2 Response Wrappers

```typescript
interface ServiceResponse<T> {
  success: boolean
  data?: T
  error?: ServiceError
  metadata?: ResponseMetadata
}

interface ResponseMetadata {
  request_id: string
  processing_time_ms: number
  cached: boolean
  cache_ttl?: number
}

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy"
  components: ComponentHealth[]
  timestamp: Date
}

interface ComponentHealth {
  name: string
  status: "healthy" | "degraded" | "unhealthy"
  message?: string
  response_time_ms?: number
}
```

---

## 4. Data Migration Specifications

### 4.1 Migration Manager Interface

```typescript
interface MigrationManager {
  // Migration operations
  migrateFromSKUGenie(options: MigrationOptions): Promise<MigrationResult>
  migrateFromPostgreSQL(options: MigrationOptions): Promise<MigrationResult>
  
  // Progress monitoring
  getMigrationStatus(migrationId: string): Promise<MigrationStatus>
  cancelMigration(migrationId: string): Promise<boolean>
  
  // Data validation
  validateMigration(migrationId: string): Promise<ValidationReport>
  compareDatabases(): Promise<ComparisonReport>
  
  // Checkpoint management
  createCheckpoint(description: string): Promise<CheckpointId>
  listCheckpoints(): Promise<Checkpoint[]>
  rollbackToCheckpoint(checkpointId: CheckpointId): Promise<RollbackResult>
  
  // Cleanup operations
  cleanupFailedMigration(migrationId: string): Promise<boolean>
}

interface MigrationOptions {
  batch_size?: number
  parallel_workers?: number
  skip_validation?: boolean
  dry_run?: boolean
  filter?: MigrationFilter
}

interface MigrationFilter {
  updated_since?: Date
  quality_score_min?: number
  skus?: string[]
}

interface MigrationResult {
  migration_id: string
  status: "completed" | "failed" | "cancelled"
  total_records: number
  migrated_records: number
  failed_records: number
  errors: MigrationError[]
  start_time: Date
  end_time?: Date
  duration_ms?: number
}

interface MigrationStatus {
  migration_id: string
  status: "running" | "completed" | "failed" | "cancelled"
  progress: {
    total: number
    processed: number
    failed: number
    percentage: number
  }
  current_batch: number
  estimated_completion?: Date
}

interface MigrationError {
  record_id: string
  error_type: string
  error_message: string
  retry_count: number
}
```

---

## 5. Real-time Synchronization Specifications

### 5.1 Sync Service Interface

```typescript
interface SyncService {
  // Service lifecycle
  start(): Promise<void>
  stop(): Promise<void>
  restart(): Promise<void>
  
  // Real-time synchronization
  startRealTimeSync(): Promise<void>
  stopRealTimeSync(): Promise<void>
  
  // Webhook handlers
  handleSKUGenieWebhook(payload: SKUGenieWebhookPayload): Promise<SyncResult>
  handleProductUpdate(update: ProductUpdatePayload): Promise<SyncResult>
  
  // Manual synchronization
  syncProduct(sku: string): Promise<SyncResult>
  syncProducts(skus: string[]): Promise<BatchSyncResult>
  syncBrands(): Promise<SyncResult>
  syncCategories(): Promise<SyncResult>
  
  // Conflict resolution
  resolveConflicts(conflicts: SyncConflict[]): Promise<ConflictResolution[]>
  
  // Monitoring and metrics
  getSyncStatus(): Promise<SyncServiceStatus>
  getSyncMetrics(): Promise<SyncMetrics>
  getSyncHistory(limit?: number): Promise<SyncHistoryEntry[]>
}

interface SyncResult {
  success: boolean
  operation: "create" | "update" | "delete"
  entity_type: "product" | "brand" | "category"
  entity_id: string
  changes_applied: string[]
  processing_time_ms: number
  error?: ServiceError
}

interface BatchSyncResult {
  total: number
  successful: number
  failed: number
  results: SyncResult[]
  processing_time_ms: number
}

interface SyncConflict {
  entity_type: "product" | "brand" | "category"
  entity_id: string
  conflict_type: "version_mismatch" | "data_conflict" | "business_rule_violation"
  local_data: Record<string, any>
  remote_data: Record<string, any>
  last_modified: {
    local: Date
    remote: Date
  }
}

interface ConflictResolution {
  conflict_id: string
  resolution: "use_local" | "use_remote" | "merge" | "manual_review"
  applied_data?: Record<string, any>
  notes?: string
}
```

---

## 6. Performance Monitoring Specifications

### 6.1 Performance Metrics Interface

```typescript
interface PerformanceMonitor {
  // Query performance
  recordQueryPerformance(operation: string, duration_ms: number, success: boolean): void
  getQueryMetrics(timeframe: TimeFrame): Promise<QueryMetrics>
  
  // Resource utilization
  getResourceMetrics(): Promise<ResourceMetrics>
  
  // Business metrics
  getBusinessMetrics(): Promise<BusinessMetrics>
  
  // Alerting
  checkAlerts(): Promise<Alert[]>
  configureAlert(alert: AlertConfig): Promise<string>
  
  // Historical data
  getHistoricalMetrics(metric: string, timeframe: TimeFrame): Promise<MetricTimeSeries>
}

interface QueryMetrics {
  average_response_time_ms: number
  p50_response_time_ms: number
  p95_response_time_ms: number
  p99_response_time_ms: number
  queries_per_second: number
  error_rate: number
  cache_hit_rate: number
}

interface ResourceMetrics {
  cpu_utilization: number
  memory_utilization: number
  disk_io_utilization: number
  network_io_utilization: number
  connection_pool_utilization: number
  cache_memory_usage: number
}

interface BusinessMetrics {
  total_products: number
  ai_enhanced_products: number
  quality_score_average: number
  sync_success_rate: number
  store_generation_success_rate: number
  face_shape_analysis_accuracy: number
}

enum TimeFrame {
  LAST_HOUR = "1h",
  LAST_DAY = "24h",
  LAST_WEEK = "7d",
  LAST_MONTH = "30d"
}
```

---

## 7. Implementation Guidelines

### 7.1 Development Patterns

```typescript
// Repository pattern for data access
interface Repository<T> {
  create(entity: T): Promise<T>
  findById(id: string): Promise<T | null>
  update(id: string, updates: Partial<T>): Promise<T>
  delete(id: string): Promise<boolean>
  findMany(criteria: SearchCriteria): Promise<T[]>
}

// Service layer pattern
abstract class BaseService {
  protected abstract logger: Logger
  protected abstract metrics: MetricsCollector
  
  protected async executeWithMetrics<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    try {
      const result = await fn()
      this.metrics.recordSuccess(operation, Date.now() - startTime)
      return result
    } catch (error) {
      this.metrics.recordError(operation, Date.now() - startTime)
      this.logger.error(`${operation} failed`, error)
      throw error
    }
  }
}

// Circuit breaker pattern for external APIs
interface CircuitBreaker {
  execute<T>(fn: () => Promise<T>): Promise<T>
  getState(): "closed" | "open" | "half-open"
  reset(): void
}
```

### 7.2 Configuration Management

```typescript
interface ConfigurationSchema {
  mongodb: {
    connection_string: string
    database: string
    pool_settings: PoolSettings
  }
  
  redis: {
    connection_string: string
    pool_settings: PoolSettings
  }
  
  external_apis: {
    sku_genie: APIConfig
    vertex_ai: APIConfig
    postgresql: DatabaseConfig
  }
  
  features: {
    ai_enhancement: boolean
    real_time_sync: boolean
    advanced_caching: boolean
  }
  
  performance: {
    query_timeout_ms: number
    batch_size: number
    cache_ttl_seconds: number
  }
}
```

This technical specification provides the exact interfaces, types, and implementation patterns needed to build the MongoDB Foundation Service. The next step would be to hand this off to the Auto-Coder mode for implementation.