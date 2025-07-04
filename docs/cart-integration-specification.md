# Cart Integration Specification for VisionCraft Eyewear Store

## Overview
This document specifies the integration of shopping cart functionality into the VisionCraft Eyewear HTML store. The cart system is already implemented in `apps/html-store/js/cart.js` and needs to be integrated into the main `index.html` file.

## Current Status
- ✅ **Cart Logic Complete**: `apps/html-store/js/cart.js` contains full cart management functionality
- ✅ **Cart Persistence**: localStorage-based cart persistence implemented
- ✅ **Cart Notifications**: Toast notifications for cart actions
- ❌ **Cart UI Integration**: Missing cart icon, sidebar, and UI components in HTML
- ❌ **Script Reference**: cart.js not included in index.html

## Required HTML Modifications

### 1. Navigation Bar Cart Icon
**Location**: Inside the navbar, after the existing nav items
**Requirements**:
- Cart icon with Bootstrap Icons (`bi-cart`)
- Cart badge showing item count (hidden when empty)
- Click handler class `cart-toggle`
- Responsive design for mobile

```html
<li class="nav-item">
    <a class="nav-link cart-toggle" href="#" role="button">
        <i class="bi bi-cart"></i>
        <span class="cart-badge badge bg-danger rounded-pill">0</span>
    </a>
</li>
```

### 2. Cart Sidebar Component
**Location**: Before closing `</body>` tag
**Requirements**:
- Slide-in sidebar from right side
- Cart header with close button
- Empty cart state
- Cart items container
- Cart total and checkout button
- Overlay for mobile

```html
<div id="cartSidebar" class="cart-sidebar">
    <div class="cart-header">
        <h5>Shopping Cart</h5>
        <button class="btn-close cart-close"></button>
    </div>
    
    <div id="cartEmpty" class="cart-empty">
        <i class="bi bi-cart-x"></i>
        <p>Your cart is empty</p>
    </div>
    
    <div id="cartContent" class="cart-content">
        <div id="cartItems" class="cart-items"></div>
        <div class="cart-footer">
            <div class="cart-total">
                Total: <span id="cartTotal">$0.00</span>
            </div>
            <button class="btn btn-primary-custom w-100">
                Proceed to Checkout
            </button>
        </div>
    </div>
</div>
<div class="cart-overlay"></div>
```

### 3. CSS Styles for Cart Components
**Location**: Inside `<style>` tag in `<head>`
**Requirements**:
- Cart badge positioning and styling
- Sidebar slide animation
- Cart item layout
- Mobile responsiveness
- Overlay styling

```css
/* Cart Badge */
.cart-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    font-size: 0.7rem;
    min-width: 18px;
    height: 18px;
    display: none;
}

/* Cart Sidebar */
.cart-sidebar {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100vh;
    background: white;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    transition: right 0.3s ease;
    z-index: 1050;
    display: flex;
    flex-direction: column;
}

.cart-sidebar.show {
    right: 0;
}

/* Cart Items */
.cart-item {
    display: flex;
    padding: 1rem;
    border-bottom: 1px solid #eee;
    gap: 1rem;
}

.cart-item-image img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
    .cart-sidebar {
        width: 100vw;
        right: -100vw;
    }
}
```

### 4. Script Integration
**Location**: Before closing `</body>` tag, after existing scripts
**Requirements**:
- Include cart.js after main.js
- Ensure proper loading order

```html
<script src="js/cart.js"></script>
```

## Integration Points

### 1. Product Card "Add to Cart" Buttons
**Current State**: Buttons exist but don't have cart functionality
**Required Changes**:
- Add `data-product-*` attributes to buttons
- Add click event handlers in main.js
- Pass product data to cart manager

### 2. Cart Manager Integration
**Location**: `apps/html-store/js/main.js`
**Requirements**:
- Initialize cart manager after DOM load
- Connect "Add to Cart" buttons to cart.addItem()
- Handle product data transformation

```javascript
// Add to existing main.js
document.addEventListener('DOMContentLoaded', function() {
    // Existing code...
    
    // Setup cart functionality
    setupCartIntegration();
});

function setupCartIntegration() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-to-cart-btn')) {
            e.preventDefault();
            const button = e.target.closest('.add-to-cart-btn');
            const productCard = button.closest('.product-card');
            
            // Extract product data from card
            const product = extractProductData(productCard);
            
            // Add to cart
            if (window.cartManager) {
                window.cartManager.addItem(product);
            }
        }
    });
}
```

## User Experience Flow

### 1. Adding Items to Cart
1. User clicks "Add to Cart" on product card
2. Product data extracted and passed to cart manager
3. Cart badge updates with new item count
4. Toast notification confirms addition
5. Cart persists to localStorage

### 2. Viewing Cart
1. User clicks cart icon in navigation
2. Cart sidebar slides in from right
3. Shows all cart items with images, names, prices
4. Displays total amount
5. Provides quantity controls and remove options

### 3. Managing Cart Items
1. User can increase/decrease quantities
2. User can remove items completely
3. Cart total updates in real-time
4. Changes persist to localStorage
5. Empty state shown when no items

## Technical Architecture

### Component Responsibilities

#### CartManager Class (`cart.js`)
- **State Management**: Cart items, totals, persistence
- **Business Logic**: Add, remove, update operations
- **UI Updates**: Badge, sidebar content, notifications
- **Event Handling**: Click events, quantity changes

#### HTML Structure (`index.html`)
- **Navigation Integration**: Cart icon and badge
- **Sidebar Layout**: Cart display and controls
- **Styling**: CSS for animations and responsiveness

#### Main Application (`main.js`)
- **Product Integration**: Connect products to cart
- **Data Transformation**: Format product data for cart
- **Event Coordination**: Bridge UI events to cart manager

### Data Flow
1. **Product Display** → Product cards rendered with "Add to Cart" buttons
2. **User Interaction** → Click events captured by main.js
3. **Data Extraction** → Product information extracted from DOM
4. **Cart Operation** → CartManager processes add/remove/update
5. **UI Update** → Badge, sidebar, and notifications updated
6. **Persistence** → Cart state saved to localStorage

## Implementation Priority

### Phase 1: Core Integration (Current Task)
1. Add cart icon to navigation with badge
2. Create cart sidebar HTML structure
3. Add CSS styles for cart components
4. Include cart.js script reference
5. Test basic cart visibility

### Phase 2: Product Integration
1. Connect "Add to Cart" buttons to cart manager
2. Implement product data extraction
3. Test add/remove functionality
4. Verify cart persistence

### Phase 3: Enhancement
1. Add checkout flow placeholder
2. Implement cart item quantity controls
3. Add cart clearing functionality
4. Mobile optimization testing

## Success Criteria
- ✅ Cart icon visible in navigation
- ✅ Cart badge shows correct item count
- ✅ Cart sidebar opens/closes smoothly
- ✅ Products can be added to cart
- ✅ Cart items display correctly
- ✅ Cart persists across page reloads
- ✅ Mobile responsive design
- ✅ Toast notifications work

## Next Steps
1. Switch to Code mode for implementation
2. Apply HTML modifications to index.html
3. Test cart functionality locally
4. Deploy updated store to production
5. Validate end-to-end cart experience

## Related Files
- `apps/html-store/index.html` - Main HTML file requiring updates
- `apps/html-store/js/cart.js` - Complete cart management system
- `apps/html-store/js/main.js` - Main application logic
- `apps/html-store/js/api-client.js` - API integration for products