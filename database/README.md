# VARAi Webstore Enhanced Ecommerce Database
## SPARC Implementation - Database Agent Deliverable

### Overview
This database schema supports a best-in-class ecommerce experience with BOPIS (Buy Online, Pick up In Store), store locator functionality, multi-tenant architecture, and virtual try-on integration.

### Architecture Features
- **Multi-tenant**: Support for multiple retailers and store chains
- **BOPIS Ready**: Complete reservation and pickup workflow
- **GPS Integration**: Store locator with latitude/longitude coordinates
- **VTO Integration**: Virtual try-on session tracking and analytics
- **Real-time Inventory**: Store-level inventory management with reservations
- **Analytics Ready**: Comprehensive metrics and performance tracking

---

## Database Schema

### Core Tables

#### 1. `retailers` - Multi-tenant Retailer Management
```sql
- id (UUID, Primary Key)
- name (VARCHAR(255), NOT NULL)
- brand_name (VARCHAR(255))
- website_url (VARCHAR(255))
- contact_email (VARCHAR(255))
- business_type (VARCHAR(50)) -- retail, franchise, independent
- subscription_tier (VARCHAR(50)) -- basic, premium, enterprise
- is_active (BOOLEAN, DEFAULT true)
- created_at, updated_at (TIMESTAMP)
```

#### 2. `stores` - Physical Store Locations
```sql
- id (UUID, Primary Key)
- retailer_id (UUID, Foreign Key → retailers.id)
- name (VARCHAR(255), NOT NULL)
- store_code (VARCHAR(50), UNIQUE)
- address_line1, address_line2 (VARCHAR(255))
- city, state, postal_code, country (VARCHAR)
- latitude, longitude (DECIMAL) -- GPS coordinates
- phone, email (VARCHAR)
- operating_hours (JSONB) -- Store hours in JSON format
- services_offered (TEXT[]) -- Array: eye_exams, frame_fitting, repairs
- is_active, bopis_enabled (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### 3. `store_inventory` - Real-time Inventory Tracking
```sql
- id (UUID, Primary Key)
- store_id (UUID, Foreign Key → stores.id)
- frame_id (UUID, NOT NULL) -- References frames table
- sku (VARCHAR(100))
- quantity_available, quantity_reserved, quantity_on_order (INTEGER)
- reorder_level, max_stock_level (INTEGER)
- cost_price (DECIMAL(10,2))
- supplier_info (JSONB)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### 4. `reservations` - BOPIS Reservation System
```sql
- id (UUID, Primary Key)
- confirmation_number (VARCHAR(20), UNIQUE) -- Auto-generated (VR + 8 chars)
- customer_email, customer_name (VARCHAR(255), NOT NULL)
- customer_phone (VARCHAR(50))
- store_id (UUID, Foreign Key → stores.id)
- frame_id (UUID, NOT NULL)
- quantity (INTEGER, DEFAULT 1)
- reservation_date (TIMESTAMP, DEFAULT NOW())
- pickup_by_date (TIMESTAMP, NOT NULL) -- Expiration date
- actual_pickup_date (TIMESTAMP)
- status (VARCHAR(50)) -- pending, confirmed, ready, picked_up, expired, cancelled
- special_instructions, staff_notes (TEXT)
- total_amount, deposit_amount (DECIMAL(10,2))
- payment_status (VARCHAR(50)) -- pending, paid, refunded
- created_at, updated_at (TIMESTAMP)
```

#### 5. `cart_sessions` - Enhanced Cart with Store Association
```sql
- id (UUID, Primary Key)
- session_id (VARCHAR(255), UNIQUE)
- customer_email (VARCHAR(255))
- customer_id (UUID) -- If logged in
- store_id (UUID, Foreign Key → stores.id) -- For store-specific pricing
- cart_data (JSONB, NOT NULL) -- Cart items in JSON format
- total_amount (DECIMAL(10,2))
- fulfillment_type (VARCHAR(50)) -- shipping, pickup
- selected_store_id (UUID, Foreign Key → stores.id) -- For pickup orders
- expires_at (TIMESTAMP)
- is_active (BOOLEAN, DEFAULT true)
- created_at, updated_at (TIMESTAMP)
```

#### 6. `store_pricing` - Store-specific Pricing
```sql
- id (UUID, Primary Key)
- store_id (UUID, Foreign Key → stores.id)
- frame_id (UUID, NOT NULL)
- price, sale_price (DECIMAL(10,2))
- is_on_sale (BOOLEAN, DEFAULT false)
- sale_start_date, sale_end_date (TIMESTAMP)
- effective_from, effective_until (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

#### 7. `vto_sessions` - Virtual Try-On Tracking
```sql
- id (UUID, Primary Key)
- session_id (VARCHAR(255), UNIQUE) -- From VTO API
- customer_id (UUID)
- frame_id (UUID)
- image_url (VARCHAR(500)) -- Customer's photo
- confidence_score (DECIMAL(3,2)) -- VTO confidence (0.00-1.00)
- face_analysis_data (JSONB) -- Face shape, measurements
- recommendation_data (JSONB) -- Generated recommendations
- user_feedback (JSONB) -- Like/dislike, ratings
- conversion_event (VARCHAR(50)) -- added_to_cart, purchased
- device_type (VARCHAR(50)) -- mobile, desktop, tablet
- store_context (UUID, Foreign Key → stores.id) -- If in-store
- created_at, updated_at (TIMESTAMP)
```

#### 8. `store_analytics` - Performance Metrics
```sql
- id (UUID, Primary Key)
- store_id (UUID, Foreign Key → stores.id)
- date (DATE, NOT NULL)
- metric_type (VARCHAR(100)) -- foot_traffic, reservations, pickups
- metric_value (DECIMAL(15,2))
- metadata (JSONB) -- Additional context
- created_at (TIMESTAMP)
```

---

## Business Logic Functions

### 1. `generate_confirmation_number()` → VARCHAR(20)
Generates unique confirmation numbers for reservations (format: VR + 8 random alphanumeric characters).

### 2. `check_inventory_availability(store_id, frame_id, quantity)` → BOOLEAN
Checks if sufficient inventory is available for reservation.

### 3. `reserve_inventory(store_id, frame_id, quantity)` → BOOLEAN
Reserves inventory for BOPIS orders, updating quantity_reserved.

### 4. `release_inventory(store_id, frame_id, quantity)` → BOOLEAN
Releases reserved inventory (e.g., when reservation expires).

---

## Triggers and Automation

### Auto-updating Timestamps
All tables have `updated_at` triggers that automatically update timestamps on record modification.

### Auto-generating Confirmation Numbers
Reservations automatically generate unique confirmation numbers on insert.

---

## Indexes for Performance

### Location-based Queries
- `idx_stores_lat_lng` - GPS coordinate queries for store locator
- `idx_stores_retailer` - Retailer-specific store queries

### Inventory Management
- `idx_inventory_store_frame` - Store + frame inventory lookups
- `idx_inventory_availability` - Available inventory queries
- `idx_inventory_reorder` - Low stock alerts

### BOPIS Operations
- `idx_reservations_store` - Store-specific reservations
- `idx_reservations_status` - Status-based queries
- `idx_reservations_pickup_date` - Expiration monitoring
- `idx_reservations_confirmation` - Confirmation number lookups

### Cart and Pricing
- `idx_cart_sessions_customer` - Customer cart retrieval
- `idx_store_pricing_store_frame` - Store-specific pricing
- `idx_store_pricing_sale` - Sale item queries

### Analytics
- `idx_store_analytics_store_date` - Time-series analytics
- `idx_vto_sessions_frame` - Frame popularity tracking

---

## Sample Data

The schema includes sample data for **VisionCraft Eyewear** with three store locations:

1. **VisionCraft Downtown** (NYC) - Full service with eye exams
2. **VisionCraft Mall** (Mall District) - Frame fitting and repairs
3. **VisionCraft Westside** (Westside) - Eye exams and frame fitting

Each store has:
- GPS coordinates for store locator
- Operating hours in JSON format
- Service offerings array
- BOPIS enabled by default

---

## Integration Points

### Existing VARAi APIs
- **Virtual Try-On**: `/api/v1/virtual-try-on` endpoints
- **Face Analysis**: `/api/v1/face-analysis` endpoints
- **Products**: `/api/v1/products` and `/api/v1/recommendations`

### New API Endpoints (To Be Implemented)
- **Store Locator**: `/api/v1/stores/nearby`
- **BOPIS**: `/api/v1/reservations`
- **Inventory**: `/api/v1/stores/{id}/inventory`

---

## Usage Examples

### Store Locator Query
```sql
-- Find stores within 10 miles of coordinates
SELECT s.*, r.name as retailer_name
FROM stores s
JOIN retailers r ON s.retailer_id = r.id
WHERE s.is_active = true
  AND s.latitude BETWEEN (40.7128 - 0.145) AND (40.7128 + 0.145)
  AND s.longitude BETWEEN (-74.0060 - 0.145) AND (-74.0060 + 0.145)
ORDER BY (
  (s.latitude - 40.7128)^2 + (s.longitude - (-74.0060))^2
) ASC;
```

### BOPIS Reservation
```sql
-- Create a reservation
INSERT INTO reservations (
  customer_email, customer_name, store_id, frame_id, 
  quantity, pickup_by_date, total_amount
) VALUES (
  'customer@example.com', 'John Doe', 
  'store-uuid', 'frame-uuid', 1, 
  NOW() + INTERVAL '7 days', 299.99
);
```

### Inventory Check
```sql
-- Check availability before reservation
SELECT check_inventory_availability(
  'store-uuid', 'frame-uuid', 1
) as available;
```

### VTO Analytics
```sql
-- Get VTO conversion rates by frame
SELECT 
  frame_id,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN conversion_event = 'added_to_cart' THEN 1 END) as cart_adds,
  AVG(confidence_score) as avg_confidence
FROM vto_sessions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY frame_id
ORDER BY cart_adds DESC;
```

---

## Migration and Deployment

### Files
- `001_enhanced_ecommerce_schema.sql` - Complete schema migration
- `run_migration.sh` - Migration execution script
- `test_schema.sql` - Comprehensive test suite

### Execution
```bash
# Make script executable
chmod +x database/run_migration.sh

# Run migration
./database/run_migration.sh

# With custom settings
./database/run_migration.sh --host localhost --user myuser --database mydb
```

### Environment Variables
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=varai_webstore
export DB_USER=postgres
export DB_PASSWORD=your_password
```

---

## Security Considerations

### Data Protection
- Customer emails and personal information
- Payment status and deposit amounts
- Store operational data

### Access Control
- Store-level data isolation
- Retailer-specific access patterns
- Customer data privacy

### Audit Trail
- All tables include created_at/updated_at timestamps
- Reservation status changes tracked
- Inventory movement logging

---

## Performance Optimization

### Query Optimization
- Comprehensive indexing strategy
- Partitioning considerations for analytics tables
- Connection pooling recommendations

### Scaling Considerations
- Read replicas for analytics queries
- Horizontal partitioning by retailer_id
- Caching strategies for store locator

---

## Monitoring and Maintenance

### Key Metrics
- Reservation conversion rates
- Inventory turnover by store
- VTO session success rates
- Store locator query performance

### Maintenance Tasks
- Regular index maintenance
- Analytics data archiving
- Expired reservation cleanup
- Performance monitoring

---

*This database schema is designed to support the complete SPARC implementation for VARAi Webstore's enhanced ecommerce experience, providing the foundation for BOPIS, store locator, and advanced analytics capabilities.*