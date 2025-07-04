# Database Consolidation Guide

## Overview

This guide addresses the critical database fragmentation issues identified in the architectural review (reflection_LS1.md). The consolidation standardizes on MongoDB with Prisma as the primary data layer, reducing operational complexity from 6+ database instances to a unified architecture.

## Issues Addressed

### Before Consolidation
- **6+ Database Instances**: Multiple MongoDB, PostgreSQL, and SQLite instances
- **Technology Fragmentation**: SQLAlchemy + Prisma + multiple ORMs
- **Configuration Scatter**: Separate docker-compose files for each service
- **Operational Complexity**: Different connection strings, credentials, and management tools

### After Consolidation
- **Unified MongoDB**: Single MongoDB instance with Prisma ORM
- **Shared PostgreSQL**: Single PostgreSQL for auth services (Keycloak/Kong)
- **Centralized Configuration**: Single docker-compose with unified environment
- **Simplified Operations**: Consistent connection patterns and management

## Migration Steps

### 1. Database Layer Migration

#### From SQLAlchemy to Prisma
```python
# OLD: src/api/database.py (SQLAlchemy)
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True)

# NEW: src/api/database.py (Prisma)
from prisma import Prisma
from prisma.models import Recommendation

async def get_db() -> Prisma:
    client = await get_database()
    return client
```

#### Connection String Standardization
```bash
# OLD: Multiple connection strings
DATABASE_URL=sqlite:///./data/app.db
MONGODB_URI=mongodb://mongodb:27017/varai
KEYCLOAK_DB=jdbc:postgresql://postgres:5432/keycloak

# NEW: Unified connection strings
DATABASE_URL=mongodb://admin:password@mongodb:27017/eyewear_ml?authSource=admin
POSTGRES_SHARED_URL=postgresql://postgres:password@postgres-shared:5432/shared_services
```

### 2. Docker Compose Migration

#### Use Unified Configuration
```bash
# Stop existing fragmented services
docker-compose -f auth-service/docker-compose.yml down
docker-compose -f api-gateway/docker-compose.yml down
docker-compose -f data-management/docker-compose.yml down

# Start unified services
docker-compose -f docker-compose.unified.yml up -d
```

#### Or Update Main Configuration
```bash
# Use updated main docker-compose.yml
docker-compose down
docker-compose up -d
```

### 3. Environment Configuration

#### Copy and Customize Environment
```bash
cp .env.unified .env
# Edit .env with your specific passwords and keys
```

#### Required Environment Variables
- `MONGO_ROOT_PASSWORD`: MongoDB admin password
- `POSTGRES_PASSWORD`: PostgreSQL password for shared services
- `SECRET_KEY`: Application secret key
- `DEEPSEEK_API_KEY`: API key for ML services

### 4. Data Migration

#### Export from Existing Databases
```bash
# Export from SQLite (if applicable)
sqlite3 data/app.db .dump > data/sqlite_export.sql

# Export from existing MongoDB instances
mongodump --host localhost:27017 --db varai --out ./data/mongodb_backup
```

#### Import to Unified MongoDB
```bash
# Run Prisma migrations
npx prisma db push

# Import existing data (customize based on your data structure)
mongorestore --host localhost:27017 --db eyewear_ml ./data/mongodb_backup/varai
```

## Configuration Files

### MongoDB Initialization
- `config/mongodb/init/01-init-db.js`: Database and collection setup
- Proper indexing for performance
- Application user creation

### Docker Compose Options
- `docker-compose.yml`: Updated main configuration
- `docker-compose.unified.yml`: Complete unified stack
- Both include health checks and proper dependencies

### Environment Templates
- `.env.unified`: Template with all required variables
- Includes security considerations and production notes

## Verification Steps

### 1. Service Health Checks
```bash
# Check MongoDB connection
docker exec eyewear-mongodb mongosh --eval "db.adminCommand('ping')"

# Check Redis connection
docker exec eyewear-redis redis-cli ping

# Check API health
curl http://localhost:8001/health
```

### 2. Database Connectivity
```bash
# Test Prisma connection
npx prisma db pull

# Verify collections exist
docker exec eyewear-mongodb mongosh eyewear_ml --eval "show collections"
```

### 3. Application Integration
```bash
# Test API endpoints
curl http://localhost:8001/api/recommendations
curl http://localhost:8001/api/health

# Check frontend connectivity
curl http://localhost:5173
```

## Benefits Achieved

### Operational Benefits
- **Reduced Complexity**: From 6+ databases to 2 primary instances
- **Unified Management**: Single set of credentials and connection strings
- **Simplified Monitoring**: Centralized health checks and logging
- **Easier Scaling**: Consistent scaling patterns across services

### Development Benefits
- **Single ORM**: Prisma for all MongoDB operations
- **Type Safety**: Generated TypeScript types from Prisma schema
- **Consistent Patterns**: Unified database access patterns
- **Better Testing**: Simplified test database setup

### Security Benefits
- **Reduced Attack Surface**: Fewer database instances to secure
- **Centralized Credentials**: Single credential management system
- **Network Simplification**: Fewer inter-service connections
- **Audit Trail**: Centralized database access logging

## Rollback Plan

If issues arise during migration:

### 1. Quick Rollback
```bash
# Stop unified services
docker-compose down

# Restore original configurations
git checkout HEAD~1 -- docker-compose.yml src/api/database.py

# Start original services
docker-compose up -d
```

### 2. Data Recovery
```bash
# Restore from backups
mongorestore --host localhost:27017 --db varai ./data/mongodb_backup/varai
```

## Production Considerations

### Security
- Change all default passwords in `.env`
- Use strong, unique passwords for each service
- Enable MongoDB authentication and SSL
- Configure proper network security groups

### Performance
- Monitor MongoDB performance with proper indexing
- Configure Redis memory limits appropriately
- Set up connection pooling for high-traffic scenarios
- Consider MongoDB replica sets for high availability

### Monitoring
- Set up MongoDB monitoring (MongoDB Compass, Ops Manager)
- Configure Redis monitoring
- Implement application-level health checks
- Set up alerting for database connectivity issues

## Support

For issues during migration:
1. Check service logs: `docker-compose logs [service-name]`
2. Verify environment variables are set correctly
3. Ensure all required ports are available
4. Check network connectivity between services

## Next Steps

After successful consolidation:
1. Update CI/CD pipelines to use unified configuration
2. Update documentation and deployment guides
3. Train team on new database patterns
4. Plan for production deployment with proper security
5. Consider implementing database monitoring and alerting