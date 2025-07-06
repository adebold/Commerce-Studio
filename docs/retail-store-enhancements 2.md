# VisionCraft Eyewear Store - Enhancement Plan

## Current Success ✅
- **Store is live and functional** at http://localhost:3002
- **Add to cart functionality working** - customers can add frames
- **Professional retail interface** with AI-enhanced features
- **Live API integration** with EyewearML platform

## Enhancement Requirements

### 1. Shopping Cart Visibility & Management
**Current Issue**: Cart items are added but not visible to customers

**Solution Architecture**:
```
Cart System:
├── Cart UI Component
│   ├── Cart sidebar/modal
│   ├── Cart icon with item count
│   ├── Item list with quantities
│   └── Total price calculation
├── Cart State Management
│   ├── localStorage persistence
│   ├── Add/remove/update items
│   └── Cart data synchronization
└── Cart Integration
    ├── Checkout flow
    ├── Order summary
    └── Store pickup options
```

### 2. In-Store Pickup & Reservation System
**Business Value**: Bridge online-to-offline customer experience

**Architecture Components**:
```
Pickup System:
├── Store Locator
│   ├── Store finder by location
│   ├── Store details & hours
│   └── Inventory availability
├── Reservation Engine
│   ├── Reserve for pickup
│   ├── Hold duration (24-48 hours)
│   └── Pickup notifications
└── Store Management
    ├── Pickup order queue
    ├── Inventory allocation
    └── Customer notifications
```

### 3. Database Schema Enhancement
**Current**: Single-tenant product catalog
**Proposed**: Multi-tenant retailer/store architecture

#### New Database Entities

```sql
-- Retailers (eyewear store chains/brands)
CREATE TABLE retailers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    logo_url TEXT,
    website_url TEXT,
    contact_email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Physical store locations
CREATE TABLE stores (
    id UUID PRIMARY KEY,
    retailer_id UUID REFERENCES retailers(id),
    name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    hours_of_operation JSONB, -- Store hours by day
    services_offered TEXT[], -- ["eye_exams", "frame_fitting", "repairs"]
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Store inventory tracking
CREATE TABLE store_inventory (
    id UUID PRIMARY KEY,
    store_id UUID REFERENCES stores(id),
    frame_id UUID REFERENCES frames(id),
    quantity_available INTEGER DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 5,
    last_restocked TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(store_id, frame_id)
);

-- Customer reservations
CREATE TABLE reservations (
    id UUID PRIMARY KEY,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    store_id UUID REFERENCES stores(id),
    frame_id UUID REFERENCES frames(id),
    quantity INTEGER DEFAULT 1,
    reservation_date TIMESTAMP DEFAULT NOW(),
    pickup_by_date TIMESTAMP NOT NULL, -- Usually 24-48 hours
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, picked_up, expired, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Shopping cart sessions
CREATE TABLE cart_sessions (
    id UUID PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    customer_email VARCHAR(255),
    store_id UUID REFERENCES stores(id), -- For store-specific pricing/inventory
    items JSONB NOT NULL, -- Array of {frame_id, quantity, price, options}
    total_amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Store-specific frame pricing
CREATE TABLE store_pricing (
    id UUID PRIMARY KEY,
    store_id UUID REFERENCES stores(id),
    frame_id UUID REFERENCES frames(id),
    price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    is_on_sale BOOLEAN DEFAULT false,
    effective_from TIMESTAMP DEFAULT NOW(),
    effective_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(store_id, frame_id)
);
```

#### Enhanced API Endpoints

```
Store Management:
GET    /api/v1/retailers/{retailer_id}/stores
GET    /api/v1/stores/{store_id}
GET    /api/v1/stores/nearby?lat={lat}&lng={lng}&radius={km}

Inventory:
GET    /api/v1/stores/{store_id}/inventory
GET    /api/v1/stores/{store_id}/frames/{frame_id}/availability
POST   /api/v1/stores/{store_id}/inventory/reserve

Reservations:
POST   /api/v1/reservations
GET    /api/v1/reservations/{reservation_id}
PUT    /api/v1/reservations/{reservation_id}/status
DELETE /api/v1/reservations/{reservation_id}

Cart Management:
POST   /api/v1/cart/sessions
GET    /api/v1/cart/sessions/{session_id}
PUT    /api/v1/cart/sessions/{session_id}/items
DELETE /api/v1/cart/sessions/{session_id}/items/{item_id}
```

## Implementation Plan

### Phase 1: Cart Enhancement (Immediate)
1. **Cart UI Components**
   - Floating cart icon with item count
   - Slide-out cart sidebar
   - Item management (add/remove/quantity)
   - Price calculations

2. **Cart State Management**
   - localStorage for persistence
   - Cart data structure
   - Real-time updates

### Phase 2: Store Locator (Week 1)
1. **Store Finder Interface**
   - Location-based store search
   - Store details display
   - Distance calculations

2. **Store Data Integration**
   - Store information API
   - Inventory availability checks
   - Store hours and services

### Phase 3: Reservation System (Week 2)
1. **Reservation Flow**
   - Reserve for pickup option
   - Customer information capture
   - Confirmation system

2. **Store Management**
   - Reservation queue for stores
   - Inventory allocation
   - Pickup notifications

### Phase 4: Database Migration (Week 3)
1. **Schema Implementation**
   - Create new tables
   - Data migration scripts
   - API endpoint updates

2. **Multi-tenant Support**
   - Retailer onboarding
   - Store configuration
   - Pricing management

## Technical Specifications

### Cart Implementation
```javascript
// Cart state structure
const cartState = {
  items: [
    {
      id: 'frame_123',
      name: 'Classic Rectangle Frame',
      brand: 'VisionCraft',
      price: 149.99,
      quantity: 1,
      image: 'url',
      selectedStore: 'store_456'
    }
  ],
  total: 149.99,
  itemCount: 1,
  selectedStore: null
};

// Cart operations
class CartManager {
  addItem(frame, quantity = 1)
  removeItem(frameId)
  updateQuantity(frameId, quantity)
  clearCart()
  getTotal()
  getItemCount()
}
```

### Store Locator Integration
```javascript
// Store finder functionality
class StoreLocator {
  findNearbyStores(lat, lng, radius = 25)
  getStoreDetails(storeId)
  checkInventory(storeId, frameId)
  calculateDistance(userLocation, storeLocation)
}
```

### Reservation System
```javascript
// Reservation management
class ReservationManager {
  createReservation(customerInfo, storeId, items)
  checkAvailability(storeId, frameId)
  sendConfirmation(reservationId)
  updateStatus(reservationId, status)
}
```

## User Experience Flow

### Enhanced Shopping Journey
1. **Browse Products** → AI recommendations, face shape compatibility
2. **Add to Cart** → Visible cart with running total
3. **View Cart** → Review items, adjust quantities
4. **Choose Fulfillment**:
   - **Ship to Home** → Traditional e-commerce checkout
   - **Reserve for Pickup** → Store locator → Reservation flow
5. **Store Pickup** → Confirmation → Store notification → Customer pickup

### Store Pickup Flow
1. **Select "Reserve for Pickup"** in cart
2. **Find Store** → Location-based store finder
3. **Check Availability** → Real-time inventory check
4. **Reserve Items** → Customer info + pickup timeframe
5. **Confirmation** → Email/SMS confirmation with pickup details
6. **Store Notification** → Store receives reservation alert
7. **Customer Pickup** → Store fulfills reservation

## Business Benefits

### For Retailers
- **Increased Conversion**: Reduce cart abandonment with pickup options
- **Store Traffic**: Drive online customers to physical locations
- **Inventory Optimization**: Better inventory visibility and management
- **Customer Data**: Capture customer preferences and behavior

### For Customers
- **Convenience**: Try before you buy with store pickup
- **Immediate Gratification**: No shipping wait times
- **Expert Service**: Access to in-store fitting and eye exams
- **Local Support**: Build relationship with local store

## Success Metrics

### Technical KPIs
- Cart completion rate improvement
- Reservation conversion rate
- Store pickup fulfillment rate
- API response times < 200ms

### Business KPIs
- Online-to-offline conversion rate
- Average order value increase
- Customer retention improvement
- Store foot traffic increase

## Next Steps

1. **Immediate**: Implement cart visibility and management
2. **Short-term**: Add store locator and basic reservation
3. **Medium-term**: Full database schema migration
4. **Long-term**: Advanced features (virtual try-on, AR, etc.)

This enhancement plan transforms VisionCraft from a simple online catalog into a comprehensive omnichannel eyewear retail platform that bridges digital and physical shopping experiences.