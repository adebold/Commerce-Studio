# Database Deployment and Configuration Guide

This document provides comprehensive information about the database deployment, configuration, and maintenance for the Eyewear ML project.

## Database Architecture

The Eyewear ML project uses MongoDB as its primary database, with two deployment options:

1. **Local MongoDB** - For development and testing
2. **MongoDB Atlas** - For production

### Local MongoDB Deployment

The local MongoDB deployment is configured using Docker Compose and includes:

- MongoDB container running on port 27018
- MongoDB Express admin interface accessible at http://localhost:8081

### MongoDB Atlas Deployment

The MongoDB Atlas deployment is a fully managed cloud database service that provides:

- High availability with replica sets
- Automated backups and point-in-time recovery
- Advanced security features
- Monitoring and alerting

## Connection Information

### Local MongoDB

- **Connection String**: `mongodb://localhost:27018`
- **Database Name**: `eyewear_database`
- **Admin Interface**: http://localhost:8081
- **Admin Credentials**: 
  - Username: `admin`
  - Password: `prod-secure-password`

### MongoDB Atlas

- **Connection String**: `mongodb+srv://eyewear:figYy2upx1NblxVi@cluster0.kqhnm.mongodb.net/eyewear?retryWrites=true&w=majority`
- **Database Name**: `eyewear`
- **User Credentials**:
  - Username: `eyewear`
  - Password: `figYy2upx1NblxVi`

## Database Schema

The database schema includes the following collections:

### eyewear_database (Local)

- **brands**: Information about eyewear brands
- **manufacturers**: Information about eyewear manufacturers
- **clients**: Information about clients
- **products**: Information about eyewear products
- **validation_logs**: Logs for data validation

### eyewear (MongoDB Atlas)

- **eyewear**: Main collection for eyewear data
- **frames**: Information about eyewear frames
- **manufacturers**: Information about eyewear manufacturers
- **brands**: Information about eyewear brands

## Configuration Files

The database configuration is defined in the following files:

### docker-compose.yml

This file defines the local MongoDB deployment:

```yaml
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27018:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - eyewear_network

  mongo-express:
    image: mongo-express
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongodb
      - ME_CONFIG_MONGODB_PORT=27017
      - ME_CONFIG_BASICAUTH_USERNAME=${MONGO_EXPRESS_USER:-admin}
      - ME_CONFIG_BASICAUTH_PASSWORD=${MONGO_EXPRESS_PASSWORD:-pass}
    depends_on:
      - mongodb
    networks:
      - eyewear_network
```

### .env.production

This file defines the MongoDB Atlas connection string for production:

```
# MongoDB
MONGODB_URL=mongodb+srv://eyewear:figYy2upx1NblxVi@cluster0.kqhnm.mongodb.net/eyewear?retryWrites=true&w=majority&connectTimeoutMS=30000&socketTimeoutMS=45000&maxPoolSize=50&minPoolSize=5
MONGODB_DB_NAME=eyewear
```

### src/api/core/config.py

This file defines the database configuration for the API:

```python
# Database
MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME: str = "eyewear_ml"
MONGODB_DB_NAME: str = "eyewear_ml"
```

## Utility Scripts

The following utility scripts are available for database management:

### migrate_to_atlas.py

This script migrates data from the local MongoDB to MongoDB Atlas:

```bash
python migrate_to_atlas.py
```

### db_health_check.py

This script checks the health of both the local MongoDB and MongoDB Atlas:

```bash
python db_health_check.py
```

### setup_db_monitoring.sh

This script sets up a cron job to run the database health check script regularly:

```bash
./setup_db_monitoring.sh
```

## Maintenance Procedures

### Backup and Restore

#### Local MongoDB Backup

```bash
mongodump --host localhost --port 27018 --db eyewear_database --out ./backups/$(date +%Y-%m-%d)
```

#### Local MongoDB Restore

```bash
mongorestore --host localhost --port 27018 --db eyewear_database ./backups/YYYY-MM-DD/eyewear_database
```

#### MongoDB Atlas Backup

MongoDB Atlas provides automated backups. You can also create on-demand backups from the MongoDB Atlas dashboard.

### Monitoring

The database health check script (`db_health_check.py`) monitors the following metrics:

#### Local MongoDB

- Response time
- Connection count
- Memory usage

#### MongoDB Atlas

- Response time
- Database statistics (collections, objects, data size, etc.)

### Troubleshooting

#### Common Issues

1. **Connection Failures**
   - Check if the MongoDB service is running
   - Verify the connection string
   - Check network connectivity
   - Verify authentication credentials

2. **Performance Issues**
   - Check the database load
   - Review slow queries
   - Check for missing indexes
   - Monitor memory usage

3. **Authentication Issues**
   - Verify the username and password
   - Check user permissions
   - Ensure the user has access to the required database

## Security Considerations

### Local MongoDB

- The local MongoDB instance is not exposed to the internet
- Basic authentication is enabled for the MongoDB Express admin interface
- Data is persisted in a Docker volume

### MongoDB Atlas

- TLS/SSL encryption is enabled for all connections
- IP whitelisting is configured to restrict access
- Role-based access control is implemented
- Database credentials are stored securely in environment variables

## Migration Strategy

When migrating from development to production, follow these steps:

1. Run the data migration script:
   ```bash
   python migrate_to_atlas.py
   ```

2. Update the application configuration to use the MongoDB Atlas connection string:
   ```
   MONGODB_URL=mongodb+srv://eyewear:figYy2upx1NblxVi@cluster0.kqhnm.mongodb.net/eyewear?retryWrites=true&w=majority
   ```

3. Verify the migration by running the database health check script:
   ```bash
   python db_health_check.py
   ```

4. Set up regular monitoring:
   ```bash
   ./setup_db_monitoring.sh
   ```

## Conclusion

This document provides a comprehensive guide to the database deployment, configuration, and maintenance for the Eyewear ML project. For any questions or issues, please contact the database administrator.