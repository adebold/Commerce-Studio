// MongoDB Eyewear Foundation Initialization Script
// Implements the MongoDB schema architecture from spec_phase_mongodb_foundation.md

// Connect to eyewear_ml database
db = db.getSiblingDB('eyewear_ml');

print("Initializing Eyewear ML MongoDB Foundation...");

// Drop existing collections if they exist (for fresh start)
db.products.drop();
db.brands.drop();
db.categories.drop();
db.face_shape_analysis.drop();
db.store_analytics.drop();
db.ai_processing_queue.drop();

// Create collections with validation schemas
print("Creating products collection...");
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sku", "product_id", "name", "description", "brand_id", "category_id", "frame_type", "price", "currency", "active"],
      properties: {
        sku: {
          bsonType: "string",
          description: "Unique SKU from SKU Genie"
        },
        product_id: {
          bsonType: "string",
          description: "Cross-platform identifier"
        },
        name: {
          bsonType: "string",
          description: "Product display name"
        },
        description: {
          bsonType: "string",
          description: "Product description"
        },
        ai_description: {
          bsonType: "string",
          description: "AI-enhanced description"
        },
        brand_id: {
          bsonType: "objectId",
          description: "Reference to brands collection"
        },
        brand_name: {
          bsonType: "string",
          description: "Denormalized brand name for performance"
        },
        category_id: {
          bsonType: "objectId",
          description: "Reference to categories collection"
        },
        category_name: {
          bsonType: "string",
          description: "Denormalized category name for performance"
        },
        frame_type: {
          bsonType: "string",
          enum: ["prescription", "sunglasses", "blue_light", "reading"],
          description: "Type of eyewear frame"
        },
        frame_shape: {
          bsonType: "string",
          enum: ["round", "square", "aviator", "cat_eye", "rectangular", "oval", "wayfarer"],
          description: "Frame shape category"
        },
        frame_material: {
          bsonType: "string",
          enum: ["acetate", "metal", "titanium", "plastic", "wood", "carbon_fiber"],
          description: "Frame material"
        },
        measurements: {
          bsonType: "object",
          properties: {
            lens_width: { bsonType: "number" },
            bridge_width: { bsonType: "number" },
            temple_length: { bsonType: "number" },
            frame_width: { bsonType: "number" },
            frame_height: { bsonType: "number" },
            weight: { bsonType: "number" }
          }
        },
        face_shape_compatibility: {
          bsonType: "object",
          properties: {
            oval: { bsonType: "number", minimum: 0.0, maximum: 1.0 },
            round: { bsonType: "number", minimum: 0.0, maximum: 1.0 },
            square: { bsonType: "number", minimum: 0.0, maximum: 1.0 },
            heart: { bsonType: "number", minimum: 0.0, maximum: 1.0 },
            diamond: { bsonType: "number", minimum: 0.0, maximum: 1.0 },
            oblong: { bsonType: "number", minimum: 0.0, maximum: 1.0 }
          }
        },
        price: {
          bsonType: "number",
          minimum: 0,
          description: "Product price"
        },
        currency: {
          bsonType: "string",
          enum: ["USD", "EUR", "GBP", "CAD"],
          description: "Price currency"
        },
        inventory_quantity: {
          bsonType: "int",
          minimum: 0,
          description: "Available inventory"
        },
        in_stock: {
          bsonType: "bool",
          description: "Stock availability"
        },
        quality_score: {
          bsonType: "number",
          minimum: 0.0,
          maximum: 1.0,
          description: "SKU Genie quality score"
        },
        active: {
          bsonType: "bool",
          description: "Active status"
        },
        created_at: {
          bsonType: "date",
          description: "Creation timestamp"
        },
        updated_at: {
          bsonType: "date",
          description: "Last update timestamp"
        }
      }
    }
  }
});

print("Creating brands collection...");
db.createCollection("brands", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "slug", "active"],
      properties: {
        name: {
          bsonType: "string",
          description: "Brand name"
        },
        slug: {
          bsonType: "string",
          description: "URL-friendly brand name"
        },
        description: {
          bsonType: "string",
          description: "Brand description"
        },
        logo_url: {
          bsonType: "string",
          description: "Brand logo URL"
        },
        positioning: {
          bsonType: "string",
          enum: ["luxury", "affordable", "premium", "mass_market"],
          description: "Brand market positioning"
        },
        active: {
          bsonType: "bool",
          description: "Active status"
        },
        created_at: {
          bsonType: "date",
          description: "Creation timestamp"
        }
      }
    }
  }
});

print("Creating categories collection...");
db.createCollection("categories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "slug", "level", "active"],
      properties: {
        name: {
          bsonType: "string",
          description: "Category name"
        },
        slug: {
          bsonType: "string",
          description: "URL-friendly name"
        },
        level: {
          bsonType: "int",
          minimum: 0,
          description: "Hierarchy level"
        },
        parent_id: {
          bsonType: ["objectId", "null"],
          description: "Parent category ID"
        },
        active: {
          bsonType: "bool",
          description: "Active status"
        },
        visible_in_nav: {
          bsonType: "bool",
          description: "Show in navigation"
        }
      }
    }
  }
});

print("Creating face_shape_analysis collection...");
db.createCollection("face_shape_analysis", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["session_id", "created_at"],
      properties: {
        session_id: {
          bsonType: "string",
          description: "User session identifier"
        },
        user_id: {
          bsonType: "string",
          description: "User identifier if logged in"
        },
        detected_face_shape: {
          bsonType: "object",
          properties: {
            primary: { bsonType: "string" },
            confidence: { bsonType: "number", minimum: 0.0, maximum: 1.0 }
          }
        },
        ai_model_version: {
          bsonType: "string",
          description: "AI model version used"
        },
        created_at: {
          bsonType: "date",
          description: "Analysis timestamp"
        },
        expires_at: {
          bsonType: "date",
          description: "Data expiration date"
        }
      }
    }
  }
});

print("Creating store_analytics collection...");
db.createCollection("store_analytics");

print("Creating ai_processing_queue collection...");
db.createCollection("ai_processing_queue", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["job_type", "status", "created_at"],
      properties: {
        job_type: {
          bsonType: "string",
          enum: ["face_shape_analysis", "product_enhancement", "description_generation"],
          description: "Type of AI processing job"
        },
        status: {
          bsonType: "string",
          enum: ["pending", "processing", "completed", "failed"],
          description: "Job processing status"
        },
        priority: {
          bsonType: "int",
          minimum: 1,
          maximum: 10,
          description: "Job priority"
        },
        created_at: {
          bsonType: "date",
          description: "Job creation timestamp"
        }
      }
    }
  }
});

// Create performance-optimized indexes
print("Creating indexes...");

// Products collection indexes
db.products.createIndex({ "sku": 1 }, { unique: true, name: "idx_products_sku" });
db.products.createIndex({ "brand_id": 1, "active": 1 }, { name: "idx_products_brand_active" });
db.products.createIndex({ "category_id": 1, "active": 1 }, { name: "idx_products_category_active" });
db.products.createIndex({ "frame_type": 1, "active": 1 }, { name: "idx_products_frame_type_active" });
db.products.createIndex({ "in_stock": 1, "active": 1 }, { name: "idx_products_stock_active" });
db.products.createIndex({ "quality_score": -1 }, { name: "idx_products_quality_score" });
db.products.createIndex({ "featured": -1, "sort_order": 1 }, { name: "idx_products_featured_sort" });
db.products.createIndex({ "created_at": -1 }, { name: "idx_products_created" });
db.products.createIndex({ "price": 1, "active": 1 }, { name: "idx_products_price_active" });

// Face shape compatibility indexes
db.products.createIndex({ "face_shape_compatibility.oval": -1 }, { name: "idx_products_face_oval" });
db.products.createIndex({ "face_shape_compatibility.round": -1 }, { name: "idx_products_face_round" });
db.products.createIndex({ "face_shape_compatibility.square": -1 }, { name: "idx_products_face_square" });
db.products.createIndex({ "face_shape_compatibility.heart": -1 }, { name: "idx_products_face_heart" });
db.products.createIndex({ "face_shape_compatibility.diamond": -1 }, { name: "idx_products_face_diamond" });
db.products.createIndex({ "face_shape_compatibility.oblong": -1 }, { name: "idx_products_face_oblong" });

// Text search index for products
db.products.createIndex(
  { 
    "name": "text", 
    "description": "text", 
    "ai_description": "text", 
    "ai_tags": "text" 
  }, 
  { 
    name: "idx_products_text_search",
    weights: {
      "name": 10,
      "ai_description": 5,
      "description": 3,
      "ai_tags": 2
    }
  }
);

// Brands collection indexes
db.brands.createIndex({ "slug": 1 }, { unique: true, name: "idx_brands_slug" });
db.brands.createIndex({ "active": 1, "featured": -1 }, { name: "idx_brands_active_featured" });
db.brands.createIndex({ "positioning": 1 }, { name: "idx_brands_positioning" });
db.brands.createIndex({ "name": 1 }, { name: "idx_brands_name" });

// Categories collection indexes
db.categories.createIndex({ "slug": 1 }, { unique: true, name: "idx_categories_slug" });
db.categories.createIndex({ "parent_id": 1 }, { name: "idx_categories_parent" });
db.categories.createIndex({ "level": 1, "sort_order": 1 }, { name: "idx_categories_level_sort" });
db.categories.createIndex({ "active": 1, "visible_in_nav": 1 }, { name: "idx_categories_active_nav" });

// Face shape analysis indexes
db.face_shape_analysis.createIndex({ "session_id": 1 }, { name: "idx_face_analysis_session" });
db.face_shape_analysis.createIndex({ "user_id": 1 }, { name: "idx_face_analysis_user" });
db.face_shape_analysis.createIndex({ "created_at": 1 }, { name: "idx_face_analysis_created" });
db.face_shape_analysis.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0, name: "idx_face_analysis_expiry" });

// Store analytics indexes
db.store_analytics.createIndex({ "store_id": 1, "date": -1 }, { name: "idx_analytics_store_date" });
db.store_analytics.createIndex({ "date": -1 }, { name: "idx_analytics_date" });

// AI processing queue indexes
db.ai_processing_queue.createIndex({ "status": 1, "priority": -1 }, { name: "idx_ai_queue_status_priority" });
db.ai_processing_queue.createIndex({ "job_type": 1, "created_at": -1 }, { name: "idx_ai_queue_type_created" });
db.ai_processing_queue.createIndex({ "created_at": -1 }, { name: "idx_ai_queue_created" });

// Insert sample data for initial testing
print("Inserting sample data...");

// Sample brands
const brandIds = [];
const sampleBrands = [
  {
    name: "RayBan",
    slug: "rayban",
    description: "Iconic eyewear brand known for aviators and wayfarers",
    logo_url: "https://example.com/logos/rayban.png",
    positioning: "premium",
    style_focus: ["classic", "modern"],
    active: true,
    featured: true,
    sort_order: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Oakley",
    slug: "oakley",
    description: "Performance-driven sports eyewear",
    logo_url: "https://example.com/logos/oakley.png",
    positioning: "premium", 
    style_focus: ["sporty", "modern"],
    active: true,
    featured: true,
    sort_order: 2,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Warby Parker",
    slug: "warby-parker",
    description: "Affordable designer eyewear with home try-on",
    logo_url: "https://example.com/logos/warby-parker.png",
    positioning: "affordable",
    style_focus: ["modern", "classic"],
    active: true,
    featured: true,
    sort_order: 3,
    created_at: new Date(),
    updated_at: new Date()
  }
];

for (const brand of sampleBrands) {
  const result = db.brands.insertOne(brand);
  brandIds.push(result.insertedId);
}

// Sample categories
const categoryIds = [];
const sampleCategories = [
  {
    name: "Prescription Glasses",
    slug: "prescription-glasses",
    description: "Prescription eyewear for vision correction",
    level: 0,
    parent_id: null,
    category_type: "frame_type",
    active: true,
    visible_in_nav: true,
    sort_order: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Sunglasses",
    slug: "sunglasses", 
    description: "Protective and stylish sunglasses",
    level: 0,
    parent_id: null,
    category_type: "frame_type",
    active: true,
    visible_in_nav: true,
    sort_order: 2,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Blue Light Glasses",
    slug: "blue-light-glasses",
    description: "Computer glasses for digital eye strain",
    level: 0,
    parent_id: null,
    category_type: "frame_type",
    active: true,
    visible_in_nav: true,
    sort_order: 3,
    created_at: new Date(),
    updated_at: new Date()
  }
];

for (const category of sampleCategories) {
  const result = db.categories.insertOne(category);
  categoryIds.push(result.insertedId);
}

// Sample products
const sampleProducts = [
  {
    sku: "RB3025-001-58",
    product_id: "rayban-aviator-classic",
    name: "Ray-Ban Aviator Classic",
    description: "The original pilot sunglasses with timeless appeal",
    ai_description: "Iconic aviator sunglasses with gold-tone metal frame and classic green lenses. Perfect for oval, heart, and oblong face shapes.",
    brand_id: brandIds[0],
    brand_name: "RayBan",
    category_id: categoryIds[1],
    category_name: "Sunglasses",
    frame_type: "sunglasses",
    frame_shape: "aviator",
    frame_material: "metal",
    lens_type: "single_vision",
    measurements: {
      lens_width: 58,
      bridge_width: 14,
      temple_length: 135,
      frame_width: 130,
      frame_height: 47,
      weight: 31
    },
    face_shape_compatibility: {
      oval: 0.95,
      round: 0.85,
      square: 0.90,
      heart: 0.92,
      diamond: 0.88,
      oblong: 0.93
    },
    color: "Gold",
    color_variants: ["Gold", "Silver", "Black"],
    style: "classic",
    gender_target: "unisex",
    price: 154.00,
    compare_at_price: 180.00,
    currency: "USD",
    inventory_quantity: 50,
    in_stock: true,
    low_stock_threshold: 10,
    media: {
      primary_image: "https://example.com/products/rb3025-001-58-main.jpg",
      gallery_images: [
        "https://example.com/products/rb3025-001-58-side.jpg",
        "https://example.com/products/rb3025-001-58-front.jpg"
      ],
      try_on_image: "https://example.com/products/rb3025-001-58-tryon.jpg"
    },
    seo: {
      title: "Ray-Ban Aviator Classic RB3025 - Gold Frame Green Lens",
      description: "Shop the iconic Ray-Ban Aviator Classic sunglasses. Timeless design with gold frame and green lenses. Free shipping and returns.",
      keywords: ["ray-ban", "aviator", "sunglasses", "classic", "gold", "green lenses"]
    },
    quality_score: 0.95,
    ai_enhanced: true,
    ai_tags: ["iconic", "classic", "aviator", "timeless", "gold-tone"],
    rating: 4.6,
    review_count: 1250,
    featured: true,
    sort_order: 1,
    active: true,
    source: "catalog_import",
    created_at: new Date(),
    updated_at: new Date(),
    last_validated: new Date()
  },
  {
    sku: "OO9102-01",
    product_id: "oakley-holbrook-matte-black",
    name: "Oakley Holbrook Matte Black",
    description: "Modern interpretation of a classic American frame design",
    ai_description: "Sporty square-shaped sunglasses with matte black frame and Prizm lenses. Ideal for square, oval, and round face shapes.",
    brand_id: brandIds[1],
    brand_name: "Oakley",
    category_id: categoryIds[1],
    category_name: "Sunglasses",
    frame_type: "sunglasses",
    frame_shape: "square",
    frame_material: "plastic",
    lens_type: "single_vision",
    measurements: {
      lens_width: 55,
      bridge_width: 18,
      temple_length: 137,
      frame_width: 128,
      frame_height: 43,
      weight: 25
    },
    face_shape_compatibility: {
      oval: 0.90,
      round: 0.92,
      square: 0.88,
      heart: 0.85,
      diamond: 0.87,
      oblong: 0.89
    },
    color: "Matte Black",
    color_variants: ["Matte Black", "Polished Black", "Woodgrain"],
    style: "sporty",
    gender_target: "unisex",
    price: 156.00,
    currency: "USD",
    inventory_quantity: 75,
    in_stock: true,
    low_stock_threshold: 15,
    media: {
      primary_image: "https://example.com/products/oo9102-01-main.jpg",
      gallery_images: [
        "https://example.com/products/oo9102-01-side.jpg",
        "https://example.com/products/oo9102-01-angle.jpg"
      ],
      try_on_image: "https://example.com/products/oo9102-01-tryon.jpg"
    },
    seo: {
      title: "Oakley Holbrook Matte Black OO9102-01 Sunglasses",
      description: "Oakley Holbrook sunglasses in matte black with Prizm lenses. Modern classic design with superior lens technology.",
      keywords: ["oakley", "holbrook", "matte black", "prizm", "sunglasses", "sporty"]
    },
    quality_score: 0.92,
    ai_enhanced: true,
    ai_tags: ["sporty", "modern", "square", "performance", "prizm"],
    rating: 4.4,
    review_count: 890,
    featured: true,
    sort_order: 2,
    active: true,
    source: "catalog_import",
    created_at: new Date(),
    updated_at: new Date(),
    last_validated: new Date()
  }
];

db.products.insertMany(sampleProducts);

print("MongoDB Eyewear Foundation initialization completed successfully!");
print("Collections created: products, brands, categories, face_shape_analysis, store_analytics, ai_processing_queue");
print("Indexes optimized for eyewear-specific queries and face shape compatibility");
print("Sample data inserted for testing and validation");