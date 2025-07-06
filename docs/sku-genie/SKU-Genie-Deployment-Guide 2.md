# SKU-Genie Deployment Guide

This guide provides instructions for deploying the SKU-Genie system in a production environment.

## Prerequisites

- Docker and Docker Compose installed
- Git for cloning the repository
- MongoDB instance (can be deployed with Docker Compose)
- Access to the internet for pulling Docker images

## Deployment Options

There are two main deployment options for SKU-Genie:

1. **Docker Compose**: Suitable for single-server deployments or development environments
2. **Kubernetes**: Recommended for production deployments with high availability requirements

This guide focuses on the Docker Compose deployment option.

## Docker Compose Deployment

### Step 1: Clone the Repository

```bash
git clone https://github.com/Answerable/Commerce-Studio.git
cd Commerce-Studio
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# MongoDB Configuration
MONGO_USERNAME=admin
MONGO_PASSWORD=your_secure_password
MONGO_PORT=27017
MONGO_DB=sku_genie

# API Configuration
API_PORT=8000
LOG_LEVEL=info
ENVIRONMENT=production

# Worker Configuration
WORKER_CONCURRENCY=5

# Monitoring Configuration
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
GRAFANA_USER=admin
GRAFANA_PASSWORD=your_secure_password
```

### Step 3: Build and Start the Services

```bash
docker-compose -f docker-compose.sku-genie.yml build
docker-compose -f docker-compose.sku-genie.yml up -d
```

### Step 4: Verify Deployment

Check that all services are running:

```bash
docker-compose -f docker-compose.sku-genie.yml ps
```

Access the API at `http://localhost:8000` (or the port you configured).

Access Grafana at `http://localhost:3000` (or the port you configured).

## Kubernetes Deployment

For Kubernetes deployment, follow these steps:

1. Create Kubernetes configuration files based on the Docker Compose configuration
2. Deploy using `kubectl apply -f kubernetes/`

Detailed Kubernetes deployment instructions are beyond the scope of this guide.

## Monitoring

The SKU-Genie system includes built-in monitoring with Prometheus and Grafana.

### Prometheus

Prometheus is used to collect metrics from the SKU-Genie services. It is accessible at `http://localhost:9090`.

### Grafana

Grafana is used to visualize the metrics collected by Prometheus. It is accessible at `http://localhost:3000`.

The default login credentials are:
- Username: admin
- Password: admin (or the password you configured in the `.env` file)

A pre-configured dashboard is available for monitoring the SKU-Genie system.

## Backup and Restore

### MongoDB Backup

To backup the MongoDB database:

```bash
docker exec sku-genie-mongodb mongodump --username $MONGO_USERNAME --password $MONGO_PASSWORD --db $MONGO_DB --out /data/backup
```

Then copy the backup files from the container:

```bash
docker cp sku-genie-mongodb:/data/backup ./backup
```

### MongoDB Restore

To restore the MongoDB database:

```bash
docker cp ./backup sku-genie-mongodb:/data/backup
docker exec sku-genie-mongodb mongorestore --username $MONGO_USERNAME --password $MONGO_PASSWORD --db $MONGO_DB /data/backup/$MONGO_DB
```

## Scaling

### Horizontal Scaling

To scale the worker service horizontally:

```bash
docker-compose -f docker-compose.sku-genie.yml up -d --scale sku-genie-worker=3
```

### Vertical Scaling

To scale services vertically, update the resource limits in the Docker Compose file or Kubernetes configuration.

## Troubleshooting

### Checking Logs

To check the logs of a specific service:

```bash
docker-compose -f docker-compose.sku-genie.yml logs sku-genie-api
```

To follow the logs in real-time:

```bash
docker-compose -f docker-compose.sku-genie.yml logs -f sku-genie-api
```

### Common Issues

1. **MongoDB Connection Issues**
   - Check that MongoDB is running
   - Verify the connection string in the environment variables
   - Check network connectivity between services

2. **API Not Responding**
   - Check the API logs for errors
   - Verify that the API service is running
   - Check that the API port is not blocked by a firewall

3. **Worker Not Processing Jobs**
   - Check the worker logs for errors
   - Verify that the worker service is running
   - Check that the worker can connect to MongoDB

## Security Considerations

1. **Environment Variables**
   - Use secure passwords for MongoDB and Grafana
   - Do not commit the `.env` file to version control

2. **Network Security**
   - Use a reverse proxy (e.g., Nginx) to secure the API
   - Enable HTTPS for all external access
   - Restrict access to Prometheus and Grafana

3. **Authentication**
   - Enable authentication for MongoDB
   - Use strong passwords for all services
   - Consider implementing OAuth or other authentication mechanisms for the API

## Maintenance

### Updates

To update the SKU-Genie system:

1. Pull the latest changes from the repository
2. Rebuild the Docker images
3. Restart the services

```bash
git pull
docker-compose -f docker-compose.sku-genie.yml build
docker-compose -f docker-compose.sku-genie.yml up -d
```

### Scheduled Maintenance

The SKU-Genie system includes a maintenance module that performs scheduled tasks:

- Cleaning up old jobs
- Optimizing database indexes
- Analyzing performance

These tasks are scheduled automatically and do not require manual intervention.

## Conclusion

This guide provides the basic steps for deploying and maintaining the SKU-Genie system. For more advanced deployment scenarios or custom configurations, please refer to the documentation or contact the development team.