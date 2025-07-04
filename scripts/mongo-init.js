// MongoDB initialization script for VARAi Platform

// Create database
db = db.getSiblingDB('varai');

// Create collections
db.createCollection('users');
db.createCollection('tenants');
db.createCollection('roles');
db.createCollection('frames');
db.createCollection('recommendations');
db.createCollection('analytics');
db.createCollection('user_interactions');
db.createCollection('user_preferences');
db.createCollection('user_profiles');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "tenantId": 1 });
db.tenants.createIndex({ "name": 1 }, { unique: true });
db.roles.createIndex({ "name": 1, "tenantId": 1 }, { unique: true });
db.frames.createIndex({ "sku": 1 }, { unique: true });
db.recommendations.createIndex({ "userId": 1 });
db.analytics.createIndex({ "timestamp": 1 });
db.analytics.createIndex({ "tenantId": 1 });
db.user_interactions.createIndex({ "userId": 1 });
db.user_interactions.createIndex({ "timestamp": 1 });
db.user_preferences.createIndex({ "userId": 1 }, { unique: true });
db.user_profiles.createIndex({ "userId": 1 }, { unique: true });

// Create admin user if not exists
if (db.users.countDocuments({ "email": "admin@varai.com" }) === 0) {
  db.users.insertOne({
    "email": "admin@varai.com",
    "password": "$2b$12$1234567890123456789012.1234567890123456789012345678901234",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "tenantId": "system",
    "createdAt": new Date(),
    "updatedAt": new Date()
  });
}

// Create default tenant if not exists
if (db.tenants.countDocuments({ "name": "Default" }) === 0) {
  db.tenants.insertOne({
    "name": "Default",
    "displayName": "Default Tenant",
    "status": "active",
    "createdAt": new Date(),
    "updatedAt": new Date()
  });
}

// Create default roles if not exist
const defaultRoles = [
  {
    "name": "admin",
    "tenantId": "system",
    "permissions": ["*"],
    "description": "System administrator with full access",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "name": "tenant_admin",
    "tenantId": "system",
    "permissions": ["tenant.*", "user.*", "role.*"],
    "description": "Tenant administrator with full access to tenant resources",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "name": "user",
    "tenantId": "system",
    "permissions": ["user.read", "user.update", "recommendation.read"],
    "description": "Regular user with limited access",
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
];

for (const role of defaultRoles) {
  db.roles.updateOne(
    { "name": role.name, "tenantId": role.tenantId },
    { $setOnInsert: role },
    { upsert: true }
  );
}

print("MongoDB initialization completed successfully");