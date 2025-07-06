# VARAi Commerce Studio - Staging Deployment Guide

This comprehensive guide provides detailed instructions for deploying the VARAi Commerce Studio platform to the staging environment. It is intended for developers and DevOps engineers responsible for managing the deployment process.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Infrastructure Deployment](#infrastructure-deployment)
4. [Service Deployment](#service-deployment)
5. [Database Migrations](#database-migrations)
6. [Verification and Testing](#verification-and-testing)
7. [Monitoring](#monitoring)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before beginning the deployment process, ensure you have the following:

### Access Requirements

- Google Cloud Platform account with access to the `commerce-studio` project
- Kubernetes cluster access credentials
- GitHub repository access
- MongoDB Atlas account (if using cloud-hosted MongoDB)
- Docker Hub or Google Container Registry access

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Google Cloud SDK | 440.0.0+ | GCP resource management |
| Terraform | 1.5.0+ | Infrastructure as Code |
| kubectl | 1.27.0+ | Kubernetes management |
| Docker | 24.0.0+ | Container management |
| Node.js | 18.0.0+ | Running scripts and tools |
| Python | 3.9.0+ | Running scripts and tools |

### Environment Variables

Create a `.env.staging` file with the following variables:

```
# GCP Configuration
GCP_PROJECT_ID=commerce-studio
GCP_REGION=us-central1
GCP_ZONE=us-central1-a

# Kubernetes Configuration
K8S_CLUSTER_NAME=commerce-studio-staging
K8S_NAMESPACE=varai-staging

# Database Configuration
MONGODB_URI=${STAGING_DEPLOYMENT_GUIDE_SECRET}
POSTGRES_HOST=postgres-staging.commerce-studio.internal
POSTGRES_USER=varai_staging
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=varai_staging

# Service Configuration
API_GATEWAY_URL=https://api-staging.varai-commerce.com
AUTH_SERVICE_URL=https://auth-staging.varai-commerce.com
CLIENT_SERVICE_URL=https://client-staging.varai-commerce.com
STORE_SERVICE_URL=https://store-staging.varai-commerce.com
INVENTORY_SERVICE_URL=https://inventory-staging.varai-commerce.com
PLUGIN_SERVICE_URL=https://plugin-staging.varai-commerce.com
REPORTING_SERVICE_URL=https://reporting-staging.varai-commerce.com
INTEGRATION_SERVICE_URL=https://integration-staging.varai-commerce.com

# Monitoring Configuration
GRAFANA_URL=https://grafana.staging.varai-commerce.com
PROMETHEUS_URL=https://prometheus.staging.varai-commerce.com
KIBANA_URL=https://kibana.staging.varai-commerce.com
```

## Environment Setup

### 1. Authentication

```bash
# Login to Google Cloud
gcloud auth login

# Set the active project
gcloud config set project commerce-studio

# Configure Docker to use gcloud as a credential helper
gcloud auth configure-docker

# Set up application default credentials
gcloud auth application-default login

# Verify authentication
gcloud auth list
```

### 2. Clone Repository

```bash
# Clone the repository if you haven't already
git clone https://github.com/varai/commerce-studio.git
cd commerce-studio

# Checkout the staging branch
git checkout staging

# Pull the latest changes
git pull origin staging
```

### 3. Load Environment Variables

```bash
# Load environment variables
source .env.staging
```

## Infrastructure Deployment

### 1. Terraform Initialization

```bash
# Navigate to the Terraform directory
cd terraform/environments/staging

# Initialize Terraform
terraform init

# Verify the Terraform version
terraform version
```

### 2. Create Terraform Variables

```bash
# Create terraform.tfvars from example
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with appropriate values
# Use your preferred editor to modify the file
nano terraform.tfvars
```

Example `terraform.tfvars` content:

```hcl
project_id         = "commerce-studio"
region             = "us-central1"
zone               = "us-central1-a"
cluster_name       = "commerce-studio-staging"
node_count         = 3
machine_type       = "e2-standard-4"
disk_size_gb       = 100
mongodb_uri        = "${STAGING_DEPLOYMENT_GUIDE_SECRET}"
postgres_instance  = "postgres-staging"
postgres_tier      = "db-custom-2-4096"
domain_name        = "staging.varai-commerce.com"
api_domain_name    = "api-staging.varai-commerce.com"
```

### 3. Terraform Plan and Apply

```bash
# Generate Terraform plan
terraform plan -out=tfplan

# Review the plan
# Ensure all resources are being created/updated as expected

# Apply the Terraform plan
terraform apply tfplan

# Verify the infrastructure deployment
terraform output
```

### 4. Configure Kubernetes

```bash
# Get credentials for the Kubernetes cluster
gcloud container clusters get-credentials $K8S_CLUSTER_NAME --region $GCP_REGION

# Verify connection to the cluster
kubectl cluster-info

# Create namespace if it doesn't exist
kubectl create namespace $K8S_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Set the default namespace
kubectl config set-context --current --namespace=$K8S_NAMESPACE
```

## Service Deployment

### 1. Build and Push Docker Images

For each service in the architecture, build and push the Docker image:

```bash
# Navigate to the service directory
cd services/api-gateway

# Build the Docker image
docker build -t gcr.io/$GCP_PROJECT_ID/api-gateway:staging .

# Push the image to Container Registry
docker push gcr.io/$GCP_PROJECT_ID/api-gateway:staging

# Repeat for each service:
# - authentication-service
# - client-service
# - store-service
# - inventory-service
# - plugin-service
# - reporting-service
# - integration-service
```

Alternatively, use the automated build script:

```bash
# Navigate to the scripts directory
cd scripts

# Run the build script
./build-and-push-images.sh staging
```

### 2. Deploy Services to Kubernetes

```bash
# Navigate to the Kubernetes directory
cd kubernetes/overlays/staging

# Update the kustomization.yaml file with new image tags if needed
# This can be automated with kustomize edit set image

# Apply Kubernetes manifests
kubectl apply -k .

# Verify deployments
kubectl get deployments

# Verify services
kubectl get services

# Verify pods
kubectl get pods
```

### 3. Configure API Gateway

```bash
# Apply API Gateway configuration
kubectl apply -f kubernetes/api-gateway/staging/kong-config.yaml

# Verify API Gateway configuration
kubectl get kongplugin
kubectl get kongconsumer
kubectl get kongingress
```

## Database Migrations

### 1. PostgreSQL Migrations

```bash
# Navigate to the database migrations directory
cd database/migrations/postgres

# Run migrations
npm run migrate:up -- --env staging

# Verify migrations
npm run migrate:status -- --env staging
```

### 2. MongoDB Migrations

```bash
# Navigate to the MongoDB migrations directory
cd database/migrations/mongodb

# Run migrations
npm run migrate:mongodb -- --env staging

# Verify migrations
npm run migrate:mongodb:status -- --env staging
```

## Verification and Testing

### 1. Service Health Checks

```bash
# Check the health of all services
kubectl get pods -o wide

# Check logs for any service
kubectl logs deployment/api-gateway

# Check the health endpoints
curl https://api-staging.varai-commerce.com/health
curl https://auth-staging.varai-commerce.com/health
# Repeat for other services
```

### 2. Run Integration Tests

```bash
# Navigate to the integration tests directory
cd tests/integration

# Create a .env file for staging tests
cat > .env.staging << EOL
API_URL=https://api-staging.varai-commerce.com
# Add other required environment variables
EOL

# Run tests against staging
NODE_ENV=staging npm run test
```

### 3. Run End-to-End Tests

```bash
# Navigate to the E2E tests directory
cd tests/e2e

# Create a .env file for staging tests
cat > .env << EOL
BASE_URL=https://staging.varai-commerce.com
EYEWEAR_ML_API_URL=https://api-staging.varai-commerce.com
# Add other required environment variables
EOL

# Run E2E tests against staging
pytest -v
```

### 4. Manual Verification

Perform manual verification of key functionality:

- User authentication and authorization
- Client management
- Store configuration
- Product catalog and inventory
- Plugin functionality
- Reporting and analytics
- External system integration

## Monitoring

### 1. Access Monitoring Dashboards

```bash
# Open Grafana dashboard
echo "Grafana Dashboard: $GRAFANA_URL"

# Open Kibana for logs
echo "Kibana Logs: $KIBANA_URL"

# Open Prometheus for metrics
echo "Prometheus: $PROMETHEUS_URL"
```

### 2. Set Up Alerts

```bash
# Apply alert configurations
kubectl apply -f kubernetes/monitoring/alerts/staging-alerts.yaml

# Verify alert configurations
kubectl get prometheusrule
```

### 3. Check System Health

```bash
# Check node status
kubectl get nodes

# Check resource usage
kubectl top nodes
kubectl top pods

# Check persistent volumes
kubectl get pv,pvc
```

## Rollback Procedures

### 1. Rollback Kubernetes Deployments

If issues are detected, you can roll back to a previous version:

```bash
# List deployment revisions
kubectl rollout history deployment/api-gateway

# Rollback to the previous revision
kubectl rollout undo deployment/api-gateway

# Or rollback to a specific revision
kubectl rollout undo deployment/api-gateway --to-revision=2
```

### 2. Rollback Database Migrations

```bash
# For PostgreSQL
cd database/migrations/postgres
npm run migrate:down -- --env staging

# For MongoDB
cd database/migrations/mongodb
npm run migrate:mongodb:down -- --env staging
```

### 3. Rollback Infrastructure Changes

```bash
# Navigate to the Terraform directory
cd terraform/environments/staging

# Restore from a previous state
terraform apply -var-file=terraform.tfvars -state=terraform.tfstate.backup
```

## Troubleshooting

### Common Issues

#### 1. Pod Startup Failures

```bash
# Check pod status
kubectl get pods

# Describe the pod for more details
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs <pod-name>
```

#### 2. Service Connectivity Issues

```bash
# Check service endpoints
kubectl get endpoints

# Test connectivity between services
kubectl exec -it <pod-name> -- curl <service-name>:<port>/health
```

#### 3. Database Connection Issues

```bash
# Check database connection from a pod
kubectl exec -it <pod-name> -- env | grep DB_
kubectl exec -it <pod-name> -- curl <database-service>:<port>
```

#### 4. Resource Constraints

```bash
# Check resource usage
kubectl top nodes
kubectl top pods

# Describe the node for resource pressure
kubectl describe node <node-name>
```

### Getting Help

If you encounter issues that you cannot resolve:

1. Check the logs in Kibana for detailed error messages
2. Review the monitoring dashboards in Grafana for anomalies
3. Consult the troubleshooting guide in the documentation
4. Contact the DevOps team at devops@varai.com
5. Create an issue in the GitHub repository

---

## Appendix

### A. Service Dependencies

| Service | Dependencies |
|---------|--------------|
| API Gateway | None |
| Authentication Service | PostgreSQL (Identity DB) |
| Client Service | PostgreSQL (Client DB) |
| Store Service | PostgreSQL (Store DB), Object Storage |
| Inventory Service | MongoDB (Inventory DB), Object Storage |
| Plugin Service | MongoDB (Plugin DB), Object Storage |
| Reporting Service | TimescaleDB (Analytics DB) |
| Integration Service | PostgreSQL (Integration DB) |

### B. Resource Requirements

| Service | CPU | Memory | Replicas |
|---------|-----|--------|----------|
| API Gateway | 1 | 1Gi | 2 |
| Authentication Service | 1 | 1Gi | 2 |
| Client Service | 1 | 1Gi | 2 |
| Store Service | 1 | 1Gi | 2 |
| Inventory Service | 1 | 2Gi | 2 |
| Plugin Service | 1 | 2Gi | 2 |
| Reporting Service | 1 | 2Gi | 2 |
| Integration Service | 1 | 1Gi | 2 |

### C. Environment Variables Reference

See the [Environment Variables Documentation](../configuration/environment-variables.md) for a complete reference of all environment variables used by the services.