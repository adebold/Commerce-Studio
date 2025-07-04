# MongoDB Database Schema for EyewearML

This document outlines the MongoDB database schema for the EyewearML platform, which serves as the foundation for both the HTML test store and Shopify store, as well as the Hybrid AI Shopping Assistant.

## Overview

The EyewearML database is structured to efficiently store, query, and serve eyewear product data that has been scraped from various sources. The schema is designed to support:

1. Comprehensive product information storage
2. Efficient querying for recommendations
3. Multi-store deployment (HTML and Shopify)
4. AI-powered shopping assistance

## Database Structure

The primary MongoDB database contains the following collections:

### Products Collection

The core collection storing all eyewear product data.

```javascript
{
  "_id": ObjectId(),                     // MongoDB auto-generated ID
  "id": "unique-product-id-12345",       // Product unique identifier (from source)
  "source": "retailer-name",             // Original data source
  "scrape_date": ISODate("2025-02-17"),  // Date when product was scraped
  "last_updated": ISODate("2025-02-17"), // Date of last update

  // Basic Information
  "name": "Model XYZ Sunglasses",        // Product display name
  "brand": "Brand Name",                 // Manufacturer brand
  "model": "XYZ-123",                    // Model number/identifier
  "description": "Detailed description text...", // Full product description
  "short_description": "Brief description...",   // Short summary (for listings)
  
  // Pricing
  "price": 149.99,                       // Current price
  "original_price": 199.99,              // Original price if discounted
  "currency": "USD",                     // Price currency code
  "on_sale": true,                       // Whether product is on sale
  "discount_percentage": 25,             // Percentage discount if on sale
  
  // URLs and References
  "url": "https://source-retailer.com/product/xyz-123", // Original product URL
  "canonical_url": "https://eyewearml.com/product/xyz-123", // Our canonical URL
  
  // Eyewear Specifications
  "specifications": {
    "frame_type": "full-rim",            // full-rim, semi-rimless, rimless
    "frame_shape": "rectangle",          // rectangle, oval, round, cat-eye, etc.
    "frame_material": "acetate",         // acetate, metal, titanium, etc.
    "frame_color": "tortoise",           // Color description
    "frame_finish": "matte",             // matte, glossy, etc.
    "hinges": "standard",                // standard, spring, etc.
    "nose_pads": "integrated",           // integrated, adjustable, etc.
    "temples_material": "acetate",       // Material of temples/arms
    "temples_color": "tortoise",         // Color of temples/arms
  },
  
  // Measurements (in mm)
  "measurements": {
    "lens_width": 52,                    // Width of each lens
    "lens_height": 40,                   // Height of each lens
    "bridge_width": 18,                  // Distance between lenses
    "temples_length": 145,               // Length of arms
    "total_width": 140,                  // Total frame width
    "weight_grams": 28,                  // Weight in grams
  },
  
  // Lens Information
  "lens": {
    "lens_material": "polycarbonate",    // Material of the lenses
    "lens_color": "gray",                // Color of the lenses
    "lens_technology": ["polarized", "UV protection"], // Technologies
    "prescription_ready": true,          // Can accept prescription lenses
    "progressive_ready": true,           // Can accept progressive lenses
  },
  
  // Categorization
  "categories": ["sunglasses", "men", "sports"], // Category classifications
  "tags": ["lightweight", "durable", "polarized"], // Feature tags
  "recommended_use": ["driving", "sports", "everyday"], // Use cases
  "recommended_face_shapes": ["oval", "round"], // Suitable face shapes
  "gender": "unisex",                    // male, female, unisex
  "season": "all-year",                  // spring/summer, fall/winter, all-year
  "style": ["classic", "sporty"],        // Style attributes
  
  // Media Assets
  "images": {
    "main_image": "xyz-123-main.jpg",    // Primary product image
    "thumbnail": "xyz-123-thumb.jpg",    // Thumbnail image
    "alternate_views": [                 // Additional product angles
      "xyz-123-side.jpg", 
      "xyz-123-front.jpg"
    ],
    "color_variants": [                  // Images of different colors
      { "color": "black", "image": "xyz-123-black.jpg" },
      { "color": "tortoise", "image": "xyz-123-tortoise.jpg" }
    ],
    "lifestyle": [                       // Lifestyle/model photos
      "xyz-123-model1.jpg", 
      "xyz-123-model2.jpg"
    ]
  },
  
  // Variants
  "variants": [
    {
      "variant_id": "xyz-123-black",     // Variant identifier
      "color": "black",                  // Variant color
      "sku": "SKU12345-BLK",             // Stock keeping unit
      "price": 149.99,                   // Variant-specific price
      "available": true,                 // Availability status
      "images": ["xyz-123-black-1.jpg", "xyz-123-black-2.jpg"]
    },
    {
      "variant_id": "xyz-123-tortoise",  // Another variant
      "color": "tortoise",
      "sku": "SKU12345-TRT",
      "price": 149.99,
      "available": true,
      "images": ["xyz-123-tortoise-1.jpg", "xyz-123-tortoise-2.jpg"]
    }
  ],
  
  // Inventory and Availability
  "inventory": {
    "in_stock": true,                    // Whether item is in stock
    "quantity": 25,                      // Available quantity (if tracked)
    "backorder_available": false,        // Can be backordered
    "estimated_shipping": "1-2 business days" // Shipping estimate
  },
  
  // Reviews and Ratings
  "reviews": {
    "average_rating": 4.7,               // Average star rating
    "review_count": 42,                  // Number of reviews
    "rating_distribution": {             // Distribution of ratings
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 12,
      "5": 27
    }
  },
  
  // AI-Generated Fields (enhanced data)
  "ai_enhanced": {
    "style_keywords": ["modern", "professional", "versatile"],
    "face_shape_compatibility_scores": {
      "oval": 0.9,
      "round": 0.8,
      "square": 0.5,
      "heart": 0.4,
      "diamond": 0.3,
      "oblong": 0.7
    },
    "feature_summary": "Lightweight titanium frames with adjustable nose pads and spring hinges for comfort and durability.",
    "style_description": "These frames offer a professional look with modern styling that works well in both business and casual settings.",
    "closest_similar_products": ["product-id-1", "product-id-2", "product-id-3"]
  },
  
  // Store-Specific Fields
  "html_store": {
    "url_path": "/products/xyz-123",     // URL path in HTML store
    "featured": true,                    // Whether product is featured
    "display_order": 3                   // Display order in featured section
  },
  
  "shopify": {
    "product_id": "shopify-product-id",  // Shopify product ID
    "handle": "model-xyz-sunglasses",    // Shopify handle (slug)
    "collection_ids": ["coll1", "coll2"] // Shopify collection IDs
  },
  
  // Metadata and Validation
  "metadata": {
    "data_completeness_score": 0.95,     // Calculated completeness (0-1)
    "image_quality_score": 0.88,         // Image quality assessment (0-1)
    "description_quality_score": 0.92,   // Description quality assessment (0-1)
    "validation_status": "validated",    // validated, pending, issues
    "validation_issues": [],             // Any validation issues
    "enhancement_status": "complete"     // Status of AI enhancement
  }
}
```

### Brands Collection

A collection for storing and managing brand information.

```javascript
{
  "_id": ObjectId(),                     // MongoDB auto-generated ID
  "name": "Brand Name",                  // Brand name (indexed, unique)
  "logo": "brand-name-logo.png",         // Brand logo image
  "description": "Brand description...", // Brand description/history
  "website": "https://brand-website.com", // Official brand website
  "founding_year": 1985,                 // Year brand was founded
  "country_of_origin": "Italy",          // Country where brand originated
  "specialties": ["sunglasses", "prescription", "sports"], // Brand specialties
  "price_tier": "premium",               // budget, mid-range, premium, luxury
  "product_count": 125,                  // Number of products in database
  "featured": true,                      // Whether brand should be featured
  "display_order": 2,                    // Order in featured brands section
  "metadata": {
    "last_updated": ISODate("2025-02-17")
  }
}
```

### Categories Collection

A collection for managing product categories and hierarchies.

```javascript
{
  "_id": ObjectId(),                     // MongoDB auto-generated ID
  "name": "Sunglasses",                  // Category name
  "slug": "sunglasses",                  // URL-friendly slug
  "parent_id": null,                     // Parent category ID (null if top-level)
  "description": "Protect your eyes in style with our sunglasses collection.",
  "image": "sunglasses-category.jpg",    // Category image
  "banner": "sunglasses-banner.jpg",     // Category banner image
  "is_active": true,                     // Whether category is active
  "display_order": 1,                    // Display order
  "product_count": 230,                  // Number of products in category
  "subcategories": [                     // Array of subcategory IDs
    ObjectId("subcategory1"),
    ObjectId("subcategory2")
  ],
  "filters": [                           // Available filters for this category
    {
      "name": "Frame Shape",
      "field": "specifications.frame_shape",
      "display_order": 1,
      "values": ["round", "square", "rectangle", "oval", "cat-eye"]
    },
    {
      "name": "Frame Material",
      "field": "specifications.frame_material",
      "display_order": 2,
      "values": ["acetate", "metal", "titanium", "plastic"]
    }
  ],
  "metadata": {
    "last_updated": ISODate("2025-02-17"),
    "seo_title": "Sunglasses Collection | EyewearML",
    "seo_description": "Shop our stylish sunglasses collection with polarized, UV protection options for every face shape."
  }
}
```

### FaceShapes Collection

A collection for storing face shape information for recommendations.

```javascript
{
  "_id": ObjectId(),                     // MongoDB auto-generated ID
  "name": "Oval",                        // Face shape name
  "description": "Oval faces have balanced proportions with a slightly narrower forehead and jawline.",
  "characteristics": [
    "Balanced proportions",
    "Slightly narrower forehead and jawline",
    "Defined cheekbones",
    "Gentle chin line"
  ],
  "ideal_frame_shapes": ["rectangle", "square", "geometric"], // Best frame shapes
  "avoid_frame_shapes": ["oversized", "very narrow"],         // Shapes to avoid
  "example_image": "oval-face-shape.jpg",                     // Visual example
  "celebrity_examples": ["Celebrity A", "Celebrity B"],       // Famous examples
  "measurement_ratios": {
    "length_to_width": "approximately 1.5:1",
    "forehead_to_jawline": "similar width",
    "cheekbones": "widest part of face"
  },
  "recommended_products": [
    "product-id-1", 
    "product-id-2"
  ],                                     // Sample recommended products
  "recommendation_rules": {
    "priority_features": ["frame_shape", "frame_width"],
    "compatibility_weights": {
      "frame_shape": 0.5,
      "frame_size": 0.3,
      "style": 0.2
    }
  }
}
```

### Sessions Collection

A collection for storing user sessions and interactions.

```javascript
{
  "_id": ObjectId(),                     // MongoDB auto-generated ID
  "session_id": "unique-session-id",     // Unique session identifier
  "user_id": "user-id",                  // User ID (if authenticated)
  "device_info": {
    "device_type": "mobile",             // mobile, tablet, desktop
    "browser": "Chrome",                 // Browser used
    "operating_system": "iOS"            // OS used
  },
  "store_type": "shopify",               // html or shopify
  "start_time": ISODate("2025-03-22T10:15:30Z"), // Session start
  "end_time": ISODate("2025-03-22T10:35:12Z"),   // Session end
  "duration_seconds": 1182,              // Session duration
  "pages_viewed": [
    {
      "page": "/collection/sunglasses",
      "timestamp": ISODate("2025-03-22T10:15:30Z"),
      "duration_seconds": 45
    },
    {
      "page": "/product/xyz-123",
      "timestamp": ISODate("2025-03-22T10:16:15Z"),
      "duration_seconds": 120
    }
  ],
  "products_viewed": [
    {
      "product_id": "product-id-1",
      "timestamp": ISODate("2025-03-22T10:16:15Z"),
      "view_duration_seconds": 120,
      "source": "direct_navigation"      // How user reached product
    },
    {
      "product_id": "product-id-2",
      "timestamp": ISODate("2025-03-22T10:19:30Z"),
      "view_duration_seconds": 90,
      "source": "recommendation"         // From recommendation
    }
  ],
  "search_queries": [
    {
      "query": "blue light glasses",
      "timestamp": ISODate("2025-03-22T10:25:12Z"),
      "results_count": 28,
      "clicked_result_position": 3
    }
  ],
  "ai_assistant_interactions": [
    {
      "interaction_id": "interaction-123",
      "timestamp": ISODate("2025-03-22T10:28:45Z"),
      "user_query": "Do you have sunglasses for oval faces?",
      "assistant_response": "Yes, we have several options...",
      "products_recommended": ["product-id-3", "product-id-4"],
      "products_clicked": ["product-id-3"],
      "interaction_duration_seconds": 180
    }
  ],
  "cart_actions": [
    {
      "action": "add",
      "product_id": "product-id-3",
      "variant_id": "variant-123",
      "quantity": 1,
      "timestamp": ISODate("2025-03-22T10:32:10Z"),
      "source": "ai_recommendation"      // Where add came from
    }
  ],
  "checkout_started": true,
  "purchase_completed": true,
  "metadata": {
    "ip_address": "127.0.0.1",           // Anonymized or hashed for privacy
    "referrer": "google.com",            // Where user came from
    "utm_parameters": {
      "source": "email",
      "medium": "newsletter",
      "campaign": "spring_sale"
    }
  }
}
```

### AIAssistantLogs Collection

A collection for storing and analyzing AI assistant interactions.

```javascript
{
  "_id": ObjectId(),                     // MongoDB auto-generated ID
  "interaction_id": "interaction-123",   // Unique interaction ID
  "session_id": "session-id",            // Linked session ID
  "user_id": "user-id",                  // User ID if available
  "store_type": "shopify",               // html or shopify
  "timestamp": ISODate("2025-03-22T10:28:45Z"), // When interaction occurred
  
  "conversation": [
    {
      "role": "user",
      "content": "Do you have sunglasses for oval faces?",
      "timestamp": ISODate("2025-03-22T10:28:45Z")
    },
    {
      "role": "assistant",
      "content": "Yes, we have several options that would look great on an oval face shape...",
      "timestamp": ISODate("2025-03-22T10:28:48Z"),
      "processing_time_ms": 2245,        // Time to generate response
      "products_referenced": [
        "product-id-3", 
        "product-id-4", 
        "product-id-5"
      ]
    },
    {
      "role": "user",
      "content": "I prefer tortoise shell frames",
      "timestamp": ISODate("2025-03-22T10:29:12Z")
    },
    {
      "role": "assistant",
      "content": "Great choice! Here are some tortoise shell options that work well for oval faces...",
      "timestamp": ISODate("2025-03-22T10:29:15Z"),
      "processing_time_ms": 1850,
      "products_referenced": [
        "product-id-6", 
        "product-id-7"
      ]
    }
  ],
  
  "intent_recognition": {
    "primary_intent": "product_recommendation",
    "secondary_intent": "filter_by_face_shape",
    "entities": [
      {
        "type": "face_shape",
        "value": "oval"
      },
      {
        "type": "product_category",
        "value": "sunglasses"
      },
      {
        "type": "frame_color",
        "value": "tortoise shell"
      }
    ],
    "confidence_score": 0.92
  },
  
  "product_recommendations": [
    {
      "product_id": "product-id-6",
      "relevance_score": 0.95,
      "recommendation_factors": ["frame_shape", "color", "face_shape_match"],
      "position_in_response": 1,
      "user_clicked": true,
      "time_to_click_seconds": 12
    },
    {
      "product_id": "product-id-7",
      "relevance_score": 0.87,
      "recommendation_factors": ["frame_shape", "color", "face_shape_match"],
      "position_in_response": 2,
      "user_clicked": false
    }
  ],
  
  "conversation_metrics": {
    "total_duration_seconds": 180,
    "number_of_turns": 4,
    "average_user_response_time_seconds": 24,
    "average_assistant_response_time_seconds": 2.8,
    "abandonment_point": null,           // Where user abandoned (if applicable)
    "user_sentiment": "positive",        // Estimated sentiment
    "satisfaction_indicators": ["direct_purchase", "positive_language"]
  },
  
  "outcome": {
    "successful_recommendation": true,
    "led_to_product_view": true,
    "led_to_cart_add": true,
    "led_to_purchase": true,
    "converted_products": ["product-id-6"]
  },
  
  "feedback": {
    "explicit_rating": 5,                // User provided rating (if any)
    "comments": "Very helpful suggestion!"
  },
  
  "performance": {
    "vertex_ai_model": "gemini-pro",
    "total_tokens": 850,
    "prompt_tokens": 325,
    "completion_tokens": 525,
    "latency_ms": {
      "db_query": 120,
      "vertex_ai_call": 2050,
      "post_processing": 75,
      "total": 2245
    }
  }
}
```

## Indexes

To ensure optimal performance, the following indexes are defined:

### Products Collection

```javascript
// Primary lookup indexes
db.products.createIndex({ "id": 1 }, { unique: true });
db.products.createIndex({ "brand": 1 });
db.products.createIndex({ "specifications.frame_shape": 1 });
db.products.createIndex({ "specifications.frame_material": 1 });
db.products.createIndex({ "specifications.frame_color": 1 });
db.products.createIndex({ "recommended_face_shapes": 1 });
db.products.createIndex({ "categories": 1 });
db.products.createIndex({ "tags": 1 });
db.products.createIndex({ "price": 1 });

// Compound indexes for common queries
db.products.createIndex({ "brand": 1, "specifications.frame_shape": 1 });
db.products.createIndex({ "categories": 1, "price": 1 });
db.products.createIndex({ "recommended_face_shapes": 1, "specifications.frame_shape": 1 });

// Text search index
db.products.createIndex({ 
  "name": "text", 
  "description": "text", 
  "brand": "text",
  "specifications.frame_material": "text",
  "specifications.frame_color": "text"
});

// Shopify-specific indexes
db.products.createIndex({ "shopify.product_id": 1 });
db.products.createIndex({ "shopify.handle": 1 });

// HTML store indexes
db.products.createIndex({ "html_store.url_path": 1 });
db.products.createIndex({ "html_store.featured": 1, "html_store.display_order": 1 });
```

### Brands Collection

```javascript
db.brands.createIndex({ "name": 1 }, { unique: true });
db.brands.createIndex({ "featured": 1, "display_order": 1 });
```

### Categories Collection

```javascript
db.categories.createIndex({ "name": 1 });
db.categories.createIndex({ "slug": 1 }, { unique: true });
db.categories.createIndex({ "parent_id": 1 });
db.categories.createIndex({ "is_active": 1, "display_order": 1 });
```

### FaceShapes Collection

```javascript
db.faceShapes.createIndex({ "name": 1 }, { unique: true });
```

### Sessions Collection

```javascript
db.sessions.createIndex({ "session_id": 1 }, { unique: true });
db.sessions.createIndex({ "user_id": 1 });
db.sessions.createIndex({ "start_time": 1 });
db.sessions.createIndex({ "products_viewed.product_id": 1 });
db.sessions.createIndex({ "ai_assistant_interactions.interaction_id": 1 });
```

### AIAssistantLogs Collection

```javascript
db.aiAssistantLogs.createIndex({ "interaction_id": 1 }, { unique: true });
db.aiAssistantLogs.createIndex({ "session_id": 1 });
db.aiAssistantLogs.createIndex({ "user_id": 1 });
db.aiAssistantLogs.createIndex({ "timestamp": 1 });
db.aiAssistantLogs.createIndex({ "intent_recognition.primary_intent": 1 });
db.aiAssistantLogs.createIndex({ "product_recommendations.product_id": 1 });
```

## Data Flow

![Data Flow Diagram](./images/data_flow.png)

The database serves as the central hub for all components of the EyewearML platform:

1. **Data Ingestion Phase**
   - Web scraping tools populate the Products collection
   - Data validation processes verify consistency and completeness
   - AI enhancement adds value to existing product data

2. **Store Generation Phase**
   - HTML Test Store reads from the database to generate static pages
   - Shopify connector imports data to create Shopify products
   - User interactions are logged back to Sessions collection

3. **AI Assistant Phase**
   - Vertex AI integration accesses Products collection for recommendations
   - User-assistant conversations are logged to AIAssistantLogs
   - Product recommendations are tracked and analyzed

## Query Examples

### Finding products for a specific face shape

```javascript
db.products.find({
  "recommended_face_shapes": "oval",
  "categories": "sunglasses",
  "specifications.frame_material": "acetate",
  "price": { $lt: 200 }
}).sort({ "reviews.average_rating": -1 }).limit(10);
```

### Aggregating sales data by brand and category

```javascript
db.sessions.aggregate([
  { $match: { "purchase_completed": true } },
  { $unwind: "$cart_actions" },
  { $match: { "cart_actions.action": "add" } },
  { $lookup: {
      from: "products",
      localField: "cart_actions.product_id",
      foreignField: "id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  { $group: {
      _id: { brand: "$product.brand", category: "$product.categories" },
      total_sales: { $sum: 1 },
      total_revenue: { $sum: "$product.price" }
    }
  },
  { $sort: { "total_revenue": -1 } }
]);
```

### Analyzing AI assistant effectiveness

```javascript
db.aiAssistantLogs.aggregate([
  { $match: { 
      "timestamp": { 
        $gte: ISODate("2025-03-01"), 
        $lt: ISODate("2025-04-01") 
      } 
    }
  },
  { $group: {
      _id: "$intent_recognition.primary_intent",
      total_interactions: { $sum: 1 },
      successful_recommendations: { $sum: { $cond: ["$outcome.successful_recommendation", 1, 0] } },
      led_to_purchase: { $sum: { $cond: ["$outcome.led_to_purchase", 1, 0] } },
      avg_response_time: { $avg: "$conversation_metrics.average_assistant_response_time_seconds" },
      avg_satisfaction: { $avg: "$feedback.explicit_rating" }
    }
  },
  { $sort: { "total_interactions": -1 } }
]);
```

## Maintenance Considerations

### Data Validation

Regular validation checks should be performed to ensure data integrity:

- Completeness of required fields
- Consistency of pricing information
- Validity of image URLs
- Accuracy of product specifications

### Performance Monitoring

Regular monitoring of database performance is essential:

- Index efficiency evaluation
- Query performance optimization
- Storage utilization tracking
- Connection pool management

### Backup Strategy

A comprehensive backup strategy includes:

- Daily full backups
- Hourly incremental backups
- Point-in-time recovery capability
- Regular restore testing

## Future Enhancements

The database schema is designed to be extensible for future enhancements:

1. **Personalization Data**
   - User preferences
   - Browsing history
   - Purchase patterns

2. **Inventory Integration**
   - Real-time stock levels
   - Supply chain tracking
   - Back-in-stock notifications

3. **Analytics Expansion**
   - Conversion funnel analysis
   - A/B testing results
   - Seasonal trend detection

4. **Multi-tenant Support**
   - Client-specific data partitioning
   - White-label store customization
   - Client-specific product catalogs
