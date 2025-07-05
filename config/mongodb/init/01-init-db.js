// MongoDB initialization script for unified database
// Consolidates database setup to address fragmentation issues

// Switch to the unified database
db = db.getSiblingDB('eyewear_ml');

// Create collections with proper indexing for performance
db.createCollection('recommendations');
db.createCollection('feedback');
db.createCollection('clients');
db.createCollection('tenants');
db.createCollection('opticians_stores');
db.createCollection('opticians_products');
db.createCollection('product_requests');
db.createCollection('usage_records');

// Create indexes for recommendations collection
db.recommendations.createIndex({ "tenant_id": 1 });
db.recommendations.createIndex({ "user_id": 1 });
db.recommendations.createIndex({ "session_id": 1 });
db.recommendations.createIndex({ "recommendation_type": 1 });
db.recommendations.createIndex({ "timestamp": 1 });

// Create indexes for feedback collection
db.feedback.createIndex({ "tenant_id": 1 });
db.feedback.createIndex({ "user_id": 1 });
db.feedback.createIndex({ "session_id": 1 });
db.feedback.createIndex({ "product_id": 1 });
db.feedback.createIndex({ "recommendation_id": 1 });
db.feedback.createIndex({ "timestamp": 1 });

// Create indexes for opticians stores
db.opticians_stores.createIndex({ "client_id": 1 });
db.opticians_stores.createIndex({ "subdomain": 1 }, { unique: true });
db.opticians_stores.createIndex({ "custom_domain": 1 }, { unique: true, sparse: true });
db.opticians_stores.createIndex({ "is_active": 1 });

// Create indexes for products
db.opticians_products.createIndex({ "store_id": 1 });
db.opticians_products.createIndex({ "frame_id": 1 });
db.opticians_products.createIndex({ "is_active": 1 });
db.opticians_products.createIndex({ "is_featured": 1 });

// Create indexes for product requests
db.product_requests.createIndex({ "store_id": 1 });
db.product_requests.createIndex({ "product_id": 1 });
db.product_requests.createIndex({ "status": 1 });
db.product_requests.createIndex({ "created_at": 1 });

// Create indexes for usage records
db.usage_records.createIndex({ "tenant_id": 1 });
db.usage_records.createIndex({ "feature": 1 });
db.usage_records.createIndex({ "recorded_at": 1 });

// Create a user for the application
db.createUser({
  user: "eyewear_app",
  pwd: "eyewear_app_password",
  roles: [
    {
      role: "readWrite",
      db: "eyewear_ml"
    }
  ]
});

print("MongoDB unified database initialized successfully");
print("Collections created with proper indexing");
print("Application user created with readWrite permissions");