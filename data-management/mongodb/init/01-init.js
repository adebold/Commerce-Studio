// MongoDB Initialization Script

// Connect to admin database
db = db.getSiblingDB('admin');

// Authenticate as admin
db.auth('admin', 'admin_password');

// Create varai database
db = db.getSiblingDB('varai');

// Create application user
db.createUser({
  user: 'varai_app',
  pwd: 'process.env.01_INIT_SECRET',
  roles: [
    { role: 'readWrite', db: 'varai' },
    { role: 'dbAdmin', db: 'varai' }
  ]
});

// Create collections
db.createCollection('products');
db.createCollection('users');
db.createCollection('orders');
db.createCollection('brands');
db.createCollection('categories');
db.createCollection('migrations');

// Create indexes for products collection
db.products.createIndex({ name: 1 });
db.products.createIndex({ brand: 1 });
db.products.createIndex({ categories: 1 });
db.products.createIndex({ 'inventory.sku': 1 }, { unique: true });
db.products.createIndex({ 'ai_enhanced.style_keywords': 1 });
db.products.createIndex({ 'metadata.created_at': -1 });
db.products.createIndex({ 'metadata.updated_at': -1 });
db.products.createIndex({ price: 1 });

// Create indexes for users collection
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ 'metadata.created_at': -1 });
db.users.createIndex({ 'metadata.last_login': -1 });

// Create indexes for orders collection
db.orders.createIndex({ 'user_id': 1 });
db.orders.createIndex({ 'status': 1 });
db.orders.createIndex({ 'created_at': -1 });
db.orders.createIndex({ 'updated_at': -1 });

// Create indexes for brands collection
db.brands.createIndex({ name: 1 }, { unique: true });
db.brands.createIndex({ 'manufacturer_id': 1 });

// Create indexes for categories collection
db.categories.createIndex({ name: 1 }, { unique: true });
db.categories.createIndex({ 'parent_id': 1 });

// Create indexes for migrations collection
db.migrations.createIndex({ version: 1 }, { unique: true });
db.migrations.createIndex({ 'appliedAt': -1 });

// Insert sample brands
db.brands.insertMany([
  {
    name: 'Ray-Ban',
    description: 'Iconic eyewear brand known for classic styles',
    manufacturer_id: 'luxottica',
    website: 'https://www.ray-ban.com',
    founded_year: 1936,
    country_of_origin: 'USA',
    logo_url: 'https://example.com/logos/rayban.png',
    metadata: {
      created_at: new Date(),
      updated_at: new Date()
    }
  },
  {
    name: 'Oakley',
    description: 'Performance eyewear for sports and active lifestyles',
    manufacturer_id: 'luxottica',
    website: 'https://www.oakley.com',
    founded_year: 1975,
    country_of_origin: 'USA',
    logo_url: 'https://example.com/logos/oakley.png',
    metadata: {
      created_at: new Date(),
      updated_at: new Date()
    }
  },
  {
    name: 'Gucci',
    description: 'Luxury fashion brand with distinctive eyewear designs',
    manufacturer_id: 'kering',
    website: 'https://www.gucci.com',
    founded_year: 1921,
    country_of_origin: 'Italy',
    logo_url: 'https://example.com/logos/gucci.png',
    metadata: {
      created_at: new Date(),
      updated_at: new Date()
    }
  }
]);

// Insert sample categories
db.categories.insertMany([
  {
    name: 'Sunglasses',
    description: 'Eyewear designed to protect eyes from sunlight',
    parent_id: null,
    metadata: {
      created_at: new Date(),
      updated_at: new Date()
    }
  },
  {
    name: 'Optical Frames',
    description: 'Frames designed for prescription lenses',
    parent_id: null,
    metadata: {
      created_at: new Date(),
      updated_at: new Date()
    }
  },
  {
    name: 'Sports Eyewear',
    description: 'Specialized eyewear for athletic activities',
    parent_id: null,
    metadata: {
      created_at: new Date(),
      updated_at: new Date()
    }
  },
  {
    name: 'Aviator',
    description: 'Classic teardrop-shaped frames',
    parent_id: 'Sunglasses',
    metadata: {
      created_at: new Date(),
      updated_at: new Date()
    }
  },
  {
    name: 'Wayfarer',
    description: 'Iconic trapezoidal frames',
    parent_id: 'Sunglasses',
    metadata: {
      created_at: new Date(),
      updated_at: new Date()
    }
  }
]);

// Insert sample products
db.products.insertMany([
  {
    name: 'Ray-Ban Aviator Classic',
    brand: 'Ray-Ban',
    description: 'The iconic Ray-Ban Aviator sunglasses were originally designed for U.S. aviators in 1937.',
    price: 154.00,
    categories: ['Sunglasses', 'Aviator'],
    attributes: {
      frameShape: 'Aviator',
      frameMaterial: 'Metal',
      frameColor: 'Gold',
      lensColor: 'Green',
      polarized: false,
      frameWidth: 140,
      lensWidth: 58,
      bridgeWidth: 14,
      templeLength: 135
    },
    images: [
      {
        url: 'https://example.com/images/rayban-aviator-1.jpg',
        alt: 'Ray-Ban Aviator Classic - Front View',
        isPrimary: true
      },
      {
        url: 'https://example.com/images/rayban-aviator-2.jpg',
        alt: 'Ray-Ban Aviator Classic - Side View',
        isPrimary: false
      }
    ],
    inventory: {
      quantity: 100,
      sku: 'RB3025-L0205-58',
      isInStock: true
    },
    ai_enhanced: {
      face_shape_compatibility: {
        oval: 0.9,
        round: 0.7,
        square: 0.8,
        heart: 0.9,
        diamond: 0.8,
        oblong: 0.7
      },
      style_keywords: [
        'classic',
        'timeless',
        'iconic',
        'sophisticated',
        'versatile'
      ],
      feature_summary: 'Classic aviator sunglasses with gold metal frame and green lenses',
      style_description: 'The Ray-Ban Aviator Classic is an iconic style that has been a favorite for decades. The teardrop shape was originally designed for U.S. aviators in 1937, and has since become a symbol of timeless cool. The thin metal frame and distinctive double bridge create a sophisticated look that complements a wide range of face shapes.'
    },
    metadata: {
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'system',
      updated_by: 'system'
    }
  },
  {
    name: 'Oakley Holbrook',
    brand: 'Oakley',
    description: 'A timeless, classic design inspired by the screen heroes from the 1940s-60s.',
    price: 166.00,
    categories: ['Sunglasses', 'Sports Eyewear'],
    attributes: {
      frameShape: 'Rectangle',
      frameMaterial: 'O Matter',
      frameColor: 'Matte Black',
      lensColor: 'Prizm Ruby',
      polarized: true,
      frameWidth: 137,
      lensWidth: 55,
      bridgeWidth: 18,
      templeLength: 137
    },
    images: [
      {
        url: 'https://example.com/images/oakley-holbrook-1.jpg',
        alt: 'Oakley Holbrook - Front View',
        isPrimary: true
      },
      {
        url: 'https://example.com/images/oakley-holbrook-2.jpg',
        alt: 'Oakley Holbrook - Side View',
        isPrimary: false
      }
    ],
    inventory: {
      quantity: 75,
      sku: 'OO9102-9102E8-55',
      isInStock: true
    },
    ai_enhanced: {
      face_shape_compatibility: {
        oval: 0.9,
        round: 0.6,
        square: 0.8,
        heart: 0.7,
        diamond: 0.8,
        oblong: 0.9
      },
      style_keywords: [
        'sporty',
        'durable',
        'modern',
        'performance',
        'casual'
      ],
      feature_summary: 'Rectangular sports sunglasses with matte black frame and Prizm Ruby polarized lenses',
      style_description: 'The Oakley Holbrook is a versatile, durable sunglass that combines performance features with a classic rectangular design. The O Matter frame material provides durability and comfort, while the Prizm Ruby lenses enhance color and contrast. These sunglasses are perfect for active lifestyles while maintaining a stylish look that works for everyday wear.'
    },
    metadata: {
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'system',
      updated_by: 'system'
    }
  }
]);

// Insert sample user
db.users.insertOne({
  username: 'johndoe',
  email: 'john.doe@example.com',
  password: 'process.env.01_INIT_SECRET_1', // hashed 'password123'
  firstName: 'John',
  lastName: 'Doe',
  role: 'customer',
  profile: {
    face_shape: 'oval',
    preferences: {
      brands: ['Ray-Ban', 'Oakley'],
      styles: ['classic', 'sporty'],
      price_range: {
        min: 100,
        max: 200
      }
    },
    measurements: {
      pupillary_distance: 64,
      face_width: 140
    }
  },
  metadata: {
    created_at: new Date(),
    updated_at: new Date(),
    last_login: new Date()
  }
});

print('MongoDB initialization completed successfully');