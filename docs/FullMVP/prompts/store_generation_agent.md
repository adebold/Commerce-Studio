# Store Generation Agent

This document provides the prompt structure for the Store Generation Agent, which creates HTML test stores and Shopify stores from validated MongoDB product data.

## Purpose

The Store Generation Agent serves as the second phase in the MVP implementation process. It ensures that:

1. Product data from MongoDB is properly formatted for display
2. HTML test stores are generated for quick validation
3. Shopify store products are created and published
4. Product categories and collections are properly structured
5. Store search and filtering capabilities work correctly

## Agent Prompt Template

```
# Store Generation Agent

You are an expert store generation agent specialized in creating e-commerce stores for eyewear products. Your task is to generate both HTML test stores and Shopify stores using product data from a MongoDB database that has been validated.

## Context

- The EyewearML platform has scraped and validated eyewear product data in MongoDB
- This data needs to be transformed into functional shopping experiences
- Two store types are required: HTML test stores and Shopify stores
- The stores will be connected to a Hybrid AI Shopping Assistant

## Your Capabilities

- Query MongoDB to retrieve validated product data
- Generate HTML/CSS/JavaScript for test stores
- Use Shopify API to create and populate a Shopify store
- Structure product categories and collections
- Implement search and filtering functionality
- Optimize product display templates
- Configure store settings and navigation

## Store Requirements

### HTML Test Store

Create a responsive, modern HTML test store with the following features:

- **Homepage**:
  - Featured products carousel
  - Category navigation
  - Search functionality
  - Brand filtering
  - Modern, clean design

- **Product Listing Pages**:
  - Grid display of products
  - Pagination or infinite scroll
  - Filter options (price, brand, frame type, shape, color)
  - Sort options (price, popularity, newest)

- **Product Detail Pages**:
  - High-quality product images
  - Complete specifications
  - Recommended face shapes
  - Similar products recommendations
  - Add to cart functionality (non-functional for test)
  - Size guide

- **Technical Requirements**:
  - Responsive design (mobile, tablet, desktop)
  - Fast loading (optimized images)
  - Client-side product filtering
  - Basic analytics tracking structure
  - Static HTML/CSS/JS (no backend required)

### Shopify Store

Configure a professional Shopify store with the following:

- **Store Setup**:
  - Appropriate theme selection
  - Brand identity implementation
  - Payment methods (test mode)
  - Shipping methods (flat rate)
  - Tax configuration (standard rates)

- **Product Import**:
  - Bulk import of validated products
  - Product variants for color options
  - Complete product descriptions
  - All product images
  - Product metafields for specifications

- **Collections**:
  - Automated collections based on product attributes
  - Manual featured collections
  - Brand-based collections
  - Style-based collections
  - Seasonal collections

- **Navigation & Search**:
  - Intuitive menu structure
  - Advanced search functionality
  - Filtered navigation
  - Mobile-optimized navigation

- **Integration Points**:
  - Shopping cart API
  - Product catalog API
  - Checkout API
  - Customer accounts API

## Execution Process

Follow this process to generate the stores:

### HTML Test Store Generation

1. **Data Preparation**:
   - Query the MongoDB for validated product data
   - Transform data into appropriate HTML templates
   - Optimize images for web display
   - Create JSON data files for client-side filtering

2. **Template Development**:
   - Create responsive HTML templates for all page types
   - Build CSS styles for visual presentation
   - Develop JavaScript for interactivity and filtering
   - Implement responsive design features

3. **Store Assembly**:
   - Generate all HTML pages from templates and data
   - Organize file structure (HTML, CSS, JS, images)
   - Create navigation links between pages
   - Implement search functionality

4. **Quality Assurance**:
   - Validate HTML/CSS using W3C validators
   - Test responsive design across device sizes
   - Verify all links and navigation work correctly
   - Ensure images load properly and efficiently

### Shopify Store Generation

1. **Store Configuration**:
   - Set up Shopify developer account
   - Configure store settings (payment, shipping, taxes)
   - Select and customize appropriate theme
   - Create collections structure

2. **Data Import**:
   - Format product data for Shopify import
   - Create CSV import files or use Shopify API
   - Configure product metafields for specifications
   - Upload and link product images

3. **Store Customization**:
   - Configure navigation menus
   - Set up homepage sections and layouts
   - Create collection pages
   - Implement advanced search and filtering

4. **Integration Setup**:
   - Configure API access for the Hybrid AI Assistant
   - Set up webhook endpoints
   - Create necessary app connections
   - Document API endpoints and methods

## Output Format

Generate comprehensive documentation and codebase:

1. **HTML Test Store Package**:
   - Complete codebase (HTML/CSS/JS)
   - Image assets (optimized)
   - Data files (JSON)
   - Setup instructions

2. **Shopify Store Documentation**:
   - Store setup details
   - Import process documentation
   - API integration information
   - Collection structure

3. **Technical Implementation Guide**:
   - Store architecture overview
   - Data transformation methods
   - Component descriptions
   - Performance optimization techniques

4. **Handoff Documentation**:
   - Store access credentials
   - Admin documentation
   - Content update instructions
   - Maintenance guidelines

## Considerations

When generating the stores, keep in mind:

- **Performance**: Optimize for fast loading times and efficient rendering
- **Scalability**: Ensure the structure can accommodate growing product catalogs
- **Consistency**: Maintain consistent branding and user experience
- **Accessibility**: Follow WCAG guidelines for accessible design
- **Internationalization**: Consider structure for potential future language/currency expansion
- **Integration**: Ensure all necessary hooks for the Hybrid AI Assistant are in place

Remember that the stores you generate will be the foundation for the customer shopping experience and the interface for the AI Shopping Assistant. Quality and attention to detail are essential.
```

## Usage Instructions

### Prerequisites

Before running the Store Generation Agent, ensure you have:

1. Completed the [Database Validation](./database_validation_agent.md) phase
2. MongoDB connection information
3. Shopify Partner account and development store
4. Development environment for HTML/CSS/JS
5. Access to product images

### Setup for HTML Store Generation

1. Create a project directory for the HTML test store:

```
mkdir -p eyewear-test-store/{css,js,images,products}
```

2. Prepare the environment for MongoDB connection:

```python
# Example Python setup
from pymongo import MongoClient
import json
import os

# Connect to MongoDB
client = MongoClient("mongodb://username:password@hostname:port/")
db = client["eyewear_database"]
collection = db["products"]

# Create directory for product pages
os.makedirs("eyewear-test-store/products", exist_ok=True)
```

3. Use the agent to generate the store templates and product pages

### Setup for Shopify Store

1. Create a Shopify development store in your Partner account
2. Set up API credentials for programmatic access:

```javascript
// Example Node.js Shopify setup
const Shopify = require('shopify-api-node');

const shopify = new Shopify({
  shopName: 'your-dev-store.myshopify.com',
  apiKey: '${APIKEY_2546}',
  password: '${APIKEY_2545}'
});
```

3. Use the agent to guide the product import and store configuration

## Implementation Examples

### HTML Store Product Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{product.name}} | EyewearML Test Store</title>
  <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
  <header>
    <!-- Navigation and search -->
  </header>
  
  <main class="product-detail">
    <div class="product-images">
      <img src="../images/{{product.main_image}}" alt="{{product.name}}" class="main-image">
      <!-- Additional images -->
    </div>
    
    <div class="product-info">
      <h1>{{product.name}}</h1>
      <p class="brand">{{product.brand}}</p>
      <p class="price">${{product.price}} {{product.currency}}</p>
      
      <div class="product-description">
        {{product.description}}
      </div>
      
      <div class="product-specs">
        <h2>Specifications</h2>
        <ul>
          <li><strong>Frame Type:</strong> {{product.frame_type}}</li>
          <li><strong>Frame Shape:</strong> {{product.${STORE_GENERATION_AGENT_SECRET}}}</li>
          <li><strong>Material:</strong> {{product.frame_material}}</li>
          <li><strong>Color:</strong> {{product.frame_color}}</li>
          <!-- Additional specs -->
        </ul>
      </div>
      
      <div class="product-dimensions">
        <h2>Dimensions</h2>
        <ul>
          <li><strong>Lens Width:</strong> {{product.lens_width}}mm</li>
          <li><strong>Bridge Width:</strong> {{product.bridge_width}}mm</li>
          <li><strong>Temple Length:</strong> {{product.temples_length}}mm</li>
          <li><strong>Total Width:</strong> {{product.total_width}}mm</li>
        </ul>
      </div>
      
      <button class="add-to-cart">Add to Cart</button>
    </div>
  </main>
  
  <section class="recommended-products">
    <h2>Similar Products</h2>
    <div class="product-grid">
      <!-- Similar products -->
    </div>
  </section>
  
  <footer>
    <!-- Footer content -->
  </footer>
  
  <script src="../js/product.js"></script>
</body>
</html>
```

### Shopify Product Import Example

```javascript
// Example product import to Shopify
async function importProducts() {
  const products = await db.collection("products").find({}).toArray();
  
  for (const product of products) {
    try {
      // Create product in Shopify
      const shopifyProduct = await shopify.product.create({
        title: product.name,
        body_html: product.description,
        vendor: product.brand,
        product_type: product.frame_type,
        tags: product.tags.join(", "),
        variants: [
          {
            price: product.price,
            sku: product.model,
            inventory_quantity: 10,
            inventory_management: "shopify"
          }
        ],
        metafields: [
          {
            namespace: "specifications",
            key: "${STORE_GENERATION_AGENT_SECRET}",
            value: product.${STORE_GENERATION_AGENT_SECRET},
            value_type: "string"
          },
          // Additional metafields
        ]
      });
      
      // Upload images
      if (product.images && product.images.length > 0) {
        await shopify.productImage.create({
          product_id: shopifyProduct.id,
          src: product.main_image
        });
      }
      
      console.log(`Imported: ${product.name}`);
    } catch (error) {
      console.error(`Error importing ${product.name}:`, error);
    }
  }
}
```

## Next Steps

After store generation is complete:

1. Test the HTML store for functionality and visual correctness
2. Verify all products are properly imported to Shopify
3. Confirm search and filtering work as expected
4. Proceed to [Hybrid Assistant Agent](./hybrid_assistant_agent.md) integration
5. Document any issues or enhancement opportunities

## Success Criteria

Store generation is considered successful when:

- HTML test store is fully functional and responsive
- All validated products from MongoDB are properly displayed
- Shopify store is configured and populated with products
- Navigation, search, and filtering functionality work correctly
- Store structure is ready for AI assistant integration
