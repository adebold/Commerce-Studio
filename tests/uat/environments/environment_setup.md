# VARAi UAT Environment Setup

This document outlines the process for setting up an isolated User Acceptance Testing (UAT) environment for the VARAi platform. The UAT environment is designed to mirror the production environment while providing isolation for testing purposes.

## Table of Contents

1. [Environment Overview](#environment-overview)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Application Deployment](#application-deployment)
4. [Data Seeding](#data-seeding)
5. [User Account Creation](#user-account-creation)
6. [Environment Monitoring](#environment-monitoring)
7. [Environment Management](#environment-management)
8. [Environment Reset](#environment-reset)
9. [Troubleshooting](#troubleshooting)

## Environment Overview

### Architecture

The UAT environment consists of the following components:

1. **Infrastructure**
   - Google Cloud Platform (GCP) resources
   - Kubernetes clusters for application hosting
   - Cloud SQL for database services
   - Cloud Storage for static assets
   - Load balancers and networking components

2. **Application Components**
   - Frontend applications (React)
   - Backend services (Python/FastAPI)
   - Authentication services
   - Integration services
   - Analytics services

3. **External Integrations**
   - Mock e-commerce platforms
   - Mock payment gateways
   - Mock email services
   - Mock analytics services

4. **Monitoring and Management**
   - Prometheus for metrics collection
   - Grafana for visualization
   - Logging infrastructure
   - Environment management tools

### Environment Isolation

The UAT environment is isolated from other environments (development, staging, production) in the following ways:

1. Separate GCP project
2. Separate Kubernetes namespace
3. Separate database instances
4. Separate storage buckets
5. Separate domain (uat.varai.ai)
6. Separate API keys and credentials
## Infrastructure Setup

### Prerequisites

- Google Cloud SDK installed
- Terraform installed
- kubectl installed
- Helm installed
- Access to the VARAi GCP organization
- Appropriate IAM permissions

### Infrastructure as Code

The infrastructure is defined using Terraform. The Terraform configuration is stored in the `terraform/environments/uat` directory.

To set up the infrastructure:

```bash
# Navigate to the Terraform directory
cd terraform/environments/uat

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan -out=uat.tfplan

# Apply the plan
terraform apply uat.tfplan
```

### Kubernetes Configuration

After the infrastructure is provisioned, configure Kubernetes:

```bash
# Get credentials for the UAT cluster
gcloud container clusters get-credentials varai-uat-cluster --region us-central1 --project varai-uat

# Create namespace
kubectl create namespace varai-uat

# Apply resource quotas
kubectl apply -f kubernetes/uat/resource-quotas.yaml

# Set up Helm repositories
helm repo add varai-charts https://charts.varai.ai
helm repo update
```

## Application Deployment

### Deployment Script

The application deployment is automated using the `deploy-uat.sh` script:

```bash
#!/bin/bash
# deploy-uat.sh - Deploy VARAi platform to UAT environment

set -e

# Configuration
ENVIRONMENT="uat"
VERSION="${1:-latest}"
NAMESPACE="varai-uat"

echo "Deploying VARAi platform version ${VERSION} to ${ENVIRONMENT} environment..."

# Deploy frontend
echo "Deploying frontend..."
helm upgrade --install varai-frontend varai-charts/frontend \
  --namespace ${NAMESPACE} \
  --set image.tag=${VERSION} \
  --values kubernetes/uat/frontend-values.yaml

# Deploy backend services
echo "Deploying backend services..."
helm upgrade --install varai-backend varai-charts/backend \
  --namespace ${NAMESPACE} \
  --set image.tag=${VERSION} \
  --values kubernetes/uat/backend-values.yaml

# Deploy authentication services
echo "Deploying authentication services..."
helm upgrade --install varai-auth varai-charts/auth \
  --namespace ${NAMESPACE} \
  --set image.tag=${VERSION} \
  --values kubernetes/uat/auth-values.yaml

# Deploy integration services
echo "Deploying integration services..."
helm upgrade --install varai-integrations varai-charts/integrations \
  --namespace ${NAMESPACE} \
  --set image.tag=${VERSION} \
  --values kubernetes/uat/integrations-values.yaml

# Deploy analytics services
echo "Deploying analytics services..."
helm upgrade --install varai-analytics varai-charts/analytics \
  --namespace ${NAMESPACE} \
## Data Seeding

### Test Data Overview

The UAT environment requires test data for effective testing. The test data includes:

1. Merchant accounts
2. Product catalog
3. Customer accounts
4. Order history
5. Analytics data
6. Configuration data

### Data Seeding Script

The data seeding is automated using the `seed-uat-data.py` script:

```python
#!/usr/bin/env python3
# seed-uat-data.py - Seed test data into the UAT environment

import argparse
import json
import os
import sys
import time
from typing import Dict, List, Any

import requests
from google.cloud import storage
from pymongo import MongoClient

# Configuration
UAT_API_URL = "https://api.uat.varai.ai"
UAT_ADMIN_USERNAME = os.environ.get("UAT_ADMIN_USERNAME")
UAT_ADMIN_PASSWORD = os.environ.get("UAT_ADMIN_PASSWORD")
MONGODB_URI = os.environ.get("UAT_MONGODB_URI")
GCS_BUCKET = "varai-uat-test-data"

def load_json_data(file_path: str) -> Dict[str, Any]:
    """Load JSON data from a file."""
    with open(file_path, "r") as f:
        return json.load(f)

def get_auth_token() -> str:
    """Get authentication token for API requests."""
    response = requests.post(
        f"{UAT_API_URL}/auth/token",
        json={"username": UAT_ADMIN_USERNAME, "${ENVIRONMENT_SETUP_SECRET_1}": UAT_ADMIN_PASSWORD}
    )
    response.raise_for_status()
    return response.json()["access_token"]

def seed_merchants(token: str, merchants_data: List[Dict[str, Any]]) -> None:
    """Seed merchant accounts."""
    print(f"Seeding {len(merchants_data)} merchant accounts...")
    
    for merchant in merchants_data:
        response = requests.post(
            f"{UAT_API_URL}/admin/merchants",
            headers={"Authorization": f"Bearer {token}"},
            json=merchant
        )
        
        if response.status_code == 409:
            print(f"Merchant {merchant['name']} already exists, updating...")
            merchant_id = requests.get(
                f"{UAT_API_URL}/admin/merchants",
                headers={"Authorization": f"Bearer {token}"},
                params={"name": merchant["name"]}
            ).json()[0]["id"]
            
            response = requests.put(
                f"{UAT_API_URL}/admin/merchants/{merchant_id}",
                headers={"Authorization": f"Bearer {token}"},
                json=merchant
            )
        
        response.raise_for_status()
        print(f"Seeded merchant: {merchant['name']}")
        
        # Rate limiting to avoid overwhelming the API
        time.sleep(0.5)
    
    print("Merchant seeding completed!")

def main() -> None:
    """Main function to seed all test data."""
    parser = argparse.ArgumentParser(description="Seed test data into UAT environment")
    parser.add_argument("--merchants-only", action="store_true", help="Seed only merchant data")
    parser.add_argument("--products-only", action="store_true", help="Seed only product data")
    parser.add_argument("--customers-only", action="store_true", help="Seed only customer data")
    parser.add_argument("--orders-only", action="store_true", help="Seed only order data")
    parser.add_argument("--analytics-only", action="store_true", help="Seed only analytics data")
    parser.add_argument("--config-only", action="store_true", help="Seed only configuration data")
    parser.add_argument("--images-only", action="store_true", help="Upload only test images")
    args = parser.parse_args()
    
    # Check required environment variables
    if not all([UAT_ADMIN_USERNAME, UAT_ADMIN_PASSWORD, MONGODB_URI]):
        print("Error: Required environment variables not set.")
        print("Please set UAT_ADMIN_USERNAME, UAT_ADMIN_PASSWORD, and UAT_MONGODB_URI.")
        sys.exit(1)
    
    # Get authentication token
    token = get_auth_token()
    
    # Determine what to seed based on arguments
    seed_all = not any([
        args.merchants_only, args.products_only, args.customers_only,
        args.orders_only, args.analytics_only, args.config_only, args.images_only
    ])
    
    # Load and seed data
    if seed_all or args.merchants_only:
        merchants_data = load_json_data("tests/uat/fixtures/test-data/merchants.json")
        seed_merchants(token, merchants_data)
    
    # Similar implementations for other data types...
    
    print("Data seeding completed successfully!")

if __name__ == "__main__":
    main()
```

To seed the test data:

```bash
# Set required environment variables
export UAT_ADMIN_USERNAME="admin"
export UAT_ADMIN_PASSWORD="${ENVIRONMENT_SETUP_SECRET_1}"
export UAT_MONGODB_URI="mongodb://username:${ENVIRONMENT_SETUP_SECRET_1}@hostname:port/database"

# Make the script executable
chmod +x seed-uat-data.py

# Seed all test data
./seed-uat-data.py

# Or seed specific data
./seed-uat-data.py --merchants-only
```

## User Account Creation

### User Types

The UAT environment requires different types of user accounts:

1. **Admin Users**: For UAT administration
2. **Merchant Users**: For testing merchant features
3. **Customer Users**: For testing customer features
4. **Test Users**: For automated testing

### User Creation Script

The user creation is automated using the `create-uat-users.py` script:

```python
#!/usr/bin/env python3
# create-uat-users.py - Create user accounts for UAT

import argparse
import csv
import json
import os
import sys
from typing import Dict, List, Any

import requests

# Configuration
UAT_API_URL = "https://api.uat.varai.ai"
UAT_ADMIN_USERNAME = os.environ.get("UAT_ADMIN_USERNAME")
UAT_ADMIN_PASSWORD = os.environ.get("UAT_ADMIN_PASSWORD")

def get_auth_token() -> str:
    """Get authentication token for API requests."""
    response = requests.post(
        f"{UAT_API_URL}/auth/token",
        json={"username": UAT_ADMIN_USERNAME, "${ENVIRONMENT_SETUP_SECRET_1}": UAT_ADMIN_PASSWORD}
    )
    response.raise_for_status()
    return response.json()["access_token"]

def create_users_from_csv(token: str, csv_file: str) -> None:
    """Create user accounts from a CSV file."""
    print(f"Creating users from {csv_file}...")
    
    with open(csv_file, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Create user
            response = requests.post(
                f"{UAT_API_URL}/admin/users",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "username": row["username"],
                    "email": row["email"],
                    "${ENVIRONMENT_SETUP_SECRET_1}": row["${ENVIRONMENT_SETUP_SECRET_1}"],
                    "first_name": row["first_name"],
                    "last_name": row["last_name"],
                    "role": row["role"],
                    "organization": row.get("organization", ""),
                    "is_active": True
                }
            )
            
            if response.status_code == 409:
                print(f"User {row['username']} already exists, skipping...")
                continue
            
            response.raise_for_status()
            print(f"Created user: {row['username']} ({row['role']})")
    
    print("User creation completed!")

def main() -> None:
    """Main function to create user accounts."""
    parser = argparse.ArgumentParser(description="Create user accounts for UAT")
    parser.add_argument("--csv", help="CSV file containing user information")
    parser.add_argument("--json", help="JSON file containing user information")
    args = parser.parse_args()
    
    if not args.csv and not args.json:
        print("Error: Either --csv or --json must be specified.")
        sys.exit(1)
    
    # Check required environment variables
    if not all([UAT_ADMIN_USERNAME, UAT_ADMIN_PASSWORD]):
        print("Error: Required environment variables not set.")
        print("Please set UAT_ADMIN_USERNAME and UAT_ADMIN_PASSWORD.")
        sys.exit(1)
    
    # Get authentication token
    token = get_auth_token()
    
    # Create users
    if args.csv:
        create_users_from_csv(token, args.csv)
    
    if args.json:
        create_users_from_json(token, args.json)
    
    print("User account creation completed successfully!")

if __name__ == "__main__":
    main()
```

To create user accounts:

```bash
# Set required environment variables
export UAT_ADMIN_USERNAME="admin"
export UAT_ADMIN_PASSWORD="${ENVIRONMENT_SETUP_SECRET_1}"

# Make the script executable
chmod +x create-uat-users.py

# Create users from CSV file
./create-uat-users.py --csv tests/uat/fixtures/test-data/users.csv

# Or create users from JSON file
./create-uat-users.py --json tests/uat/fixtures/test-data/users.json
```
  --set image.tag=${VERSION} \
  --values kubernetes/uat/analytics-values.yaml

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment --all -n ${NAMESPACE}

echo "Deployment completed successfully!"
## Environment Monitoring

### Monitoring Components

The UAT environment is monitored using the following components:

1. **Prometheus**: For metrics collection
2. **Grafana**: For visualization
3. **Loki**: For log aggregation
4. **Alertmanager**: For alerting

### Monitoring Setup

The monitoring setup is automated using the `setup-uat-monitoring.sh` script:

```bash
#!/bin/bash
# setup-uat-monitoring.sh - Set up monitoring for UAT environment

set -e

# Configuration
NAMESPACE="varai-uat-monitoring"
GRAFANA_ADMIN_PASSWORD="${ENVIRONMENT_SETUP_SECRET_2}"

echo "Setting up monitoring for UAT environment..."

# Create namespace
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Add Helm repositories
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
echo "Installing Prometheus..."
helm upgrade --install prometheus prometheus-community/prometheus \
  --namespace ${NAMESPACE} \
  --set server.persistentVolume.size=10Gi \
  --set server.retention=15d \
  --values kubernetes/uat/prometheus-values.yaml

# Install Loki
echo "Installing Loki..."
helm upgrade --install loki grafana/loki-stack \
  --namespace ${NAMESPACE} \
  --set promtail.enabled=true \
  --set loki.persistence.enabled=true \
  --set loki.persistence.size=10Gi \
  --values kubernetes/uat/loki-values.yaml

# Install Grafana
echo "Installing Grafana..."
helm upgrade --install grafana grafana/grafana \
  --namespace ${NAMESPACE} \
  --set persistence.enabled=true \
  --set persistence.size=5Gi \
  --set adminPassword=${GRAFANA_ADMIN_PASSWORD} \
  --values kubernetes/uat/grafana-values.yaml

# Wait for deployments to be ready
echo "Waiting for monitoring deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment --all -n ${NAMESPACE}

# Get Grafana URL
GRAFANA_URL=$(kubectl get svc -n ${NAMESPACE} grafana -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo "Monitoring setup completed successfully!"
echo "Grafana URL: http://${GRAFANA_URL}"
echo "Grafana Admin Username: admin"
echo "Grafana Admin Password: ${GRAFANA_ADMIN_PASSWORD}"
```

To set up monitoring:

```bash
# Make the script executable
chmod +x setup-uat-monitoring.sh

# Set up monitoring with default admin ${ENVIRONMENT_SETUP_SECRET_1}
./setup-uat-monitoring.sh

# Or set up monitoring with custom admin ${ENVIRONMENT_SETUP_SECRET_1}
./setup-uat-monitoring.sh my-secure-${ENVIRONMENT_SETUP_SECRET_1}
```

## Environment Management

### Management Tools

The UAT environment is managed using the following tools:

1. **UAT Dashboard**: Web interface for environment management
2. **UAT CLI**: Command-line tool for environment management
3. **UAT API**: API for programmatic environment management

### UAT CLI

The UAT CLI is implemented as a Python script:

```python
#!/usr/bin/env python3
# uat-cli.py - Command-line tool for UAT environment management

import argparse
import json
import os
import sys
from typing import Dict, Any

import requests

# Configuration
UAT_API_URL = "https://api.uat.varai.ai"
UAT_ADMIN_USERNAME = os.environ.get("UAT_ADMIN_USERNAME")
UAT_ADMIN_PASSWORD = os.environ.get("UAT_ADMIN_PASSWORD")

def get_auth_token() -> str:
    """Get authentication token for API requests."""
    response = requests.post(
        f"{UAT_API_URL}/auth/token",
        json={"username": UAT_ADMIN_USERNAME, "${ENVIRONMENT_SETUP_SECRET_1}": UAT_ADMIN_PASSWORD}
    )
    response.raise_for_status()
    return response.json()["access_token"]

def get_environment_status(token: str) -> Dict[str, Any]:
    """Get UAT environment status."""
    response = requests.get(
        f"{UAT_API_URL}/admin/environment/status",
        headers={"Authorization": f"Bearer {token}"}
    )
    response.raise_for_status()
    return response.json()

def reset_environment(token: str, components: list = None) -> None:
    """Reset UAT environment."""
    data = {}
    if components:
        data["components"] = components
    
    response = requests.post(
        f"{UAT_API_URL}/admin/environment/reset",
        headers={"Authorization": f"Bearer {token}"},
        json=data
    )
    response.raise_for_status()
    print("Environment reset initiated successfully!")

def backup_environment(token: str, backup_name: str = None) -> None:
    """Backup UAT environment."""
    data = {}
    if backup_name:
        data["backup_name"] = backup_name
    
    response = requests.post(
        f"{UAT_API_URL}/admin/environment/backup",
        headers={"Authorization": f"Bearer {token}"},
        json=data
    )
    response.raise_for_status()
    print(f"Environment backup '{response.json()['backup_name']}' created successfully!")

def restore_environment(token: str, backup_name: str) -> None:
    """Restore UAT environment from backup."""
    response = requests.post(
        f"{UAT_API_URL}/admin/environment/restore",
        headers={"Authorization": f"Bearer {token}"},
        json={"backup_name": backup_name}
    )
    response.raise_for_status()
    print(f"Environment restore from '{backup_name}' initiated successfully!")

def list_backups(token: str) -> None:
    """List available environment backups."""
    response = requests.get(
        f"{UAT_API_URL}/admin/environment/backups",
        headers={"Authorization": f"Bearer {token}"}
    )
    response.raise_for_status()
    backups = response.json()
    
    if not backups:
        print("No backups available.")
        return
    
    print("Available backups:")
    for backup in backups:
        print(f"- {backup['name']} (Created: {backup['created_at']}, Size: {backup['size']})")

def main() -> None:
    """Main function for UAT CLI."""
    parser = argparse.ArgumentParser(description="UAT Environment Management CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Status command
    subparsers.add_parser("status", help="Get UAT environment status")
    
    # Reset command
    reset_parser = subparsers.add_parser("reset", help="Reset UAT environment")
    reset_parser.add_argument("--components", nargs="+", help="Components to reset (default: all)")
    
    # Backup command
    backup_parser = subparsers.add_parser("backup", help="Backup UAT environment")
    backup_parser.add_argument("--name", help="Backup name")
    
    # Restore command
    restore_parser = subparsers.add_parser("restore", help="Restore UAT environment from backup")
    restore_parser.add_argument("backup_name", help="Backup name to restore from")
    
    # List backups command
    subparsers.add_parser("list-backups", help="List available environment backups")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Check required environment variables
    if not all([UAT_ADMIN_USERNAME, UAT_ADMIN_PASSWORD]):
        print("Error: Required environment variables not set.")
        print("Please set UAT_ADMIN_USERNAME and UAT_ADMIN_PASSWORD.")
        sys.exit(1)
    
    # Get authentication token
    token = get_auth_token()
    
    # Execute command
    if args.command == "status":
        status = get_environment_status(token)
        print(json.dumps(status, indent=2))
    
    elif args.command == "reset":
        reset_environment(token, args.components)
    
    elif args.command == "backup":
        backup_environment(token, args.name)
    
    elif args.command == "restore":
        restore_environment(token, args.backup_name)
    
    elif args.command == "list-backups":
        list_backups(token)

if __name__ == "__main__":
    main()
```

To use the UAT CLI:

```bash
# Set required environment variables
export UAT_ADMIN_USERNAME="admin"
export UAT_ADMIN_PASSWORD="${ENVIRONMENT_SETUP_SECRET_1}"

# Make the script executable
chmod +x uat-cli.py

# Get environment status
./uat-cli.py status

# Reset environment
./uat-cli.py reset

# Backup environment
./uat-cli.py backup --name pre-test-run

# Restore environment
./uat-cli.py restore pre-test-run

# List available backups
./uat-cli.py list-backups
```

## Environment Reset

### Reset Process

The environment reset process involves:

1. Resetting the database to a known state
2. Clearing uploaded files
3. Resetting application state
4. Reseeding test data

### Reset Script

The environment reset is automated using the `reset-uat-environment.sh` script:

```bash
#!/bin/bash
# reset-uat-environment.sh - Reset UAT environment to a clean state

set -e

# Configuration
ENVIRONMENT="uat"
NAMESPACE="varai-uat"
BACKUP_NAME="pre-reset-$(date +%Y%m%d%H%M%S)"

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" > /dev/null 2>&1; then
    echo "Error: Not authenticated to Google Cloud. Please run 'gcloud auth login' first."
    exit 1
fi

# Check if kubectl is configured
if ! kubectl get namespace ${NAMESPACE} > /dev/null 2>&1; then
    echo "Error: kubectl not configured for UAT environment. Please run 'gcloud container clusters get-credentials varai-uat-cluster --region us-central1 --project varai-uat' first."
    exit 1
fi

echo "Resetting UAT environment to a clean state..."

# Create backup before reset
echo "Creating backup before reset: ${BACKUP_NAME}"
./uat-cli.py backup --name ${BACKUP_NAME}

# Scale down deployments
echo "Scaling down deployments..."
kubectl scale deployment --all --replicas=0 --namespace=${NAMESPACE}

# Wait for pods to terminate
echo "Waiting for pods to terminate..."
kubectl wait --for=delete pod --all --namespace=${NAMESPACE} --timeout=300s || true

# Reset database
echo "Resetting database..."
kubectl exec -it $(kubectl get pod -l app=mongodb -n ${NAMESPACE} -o jsonpath='{.items[0].metadata.name}') -n ${NAMESPACE} -- mongo admin -u admin -p ${MONGODB_PASSWORD} --eval 'db.getSiblingDB("varai").dropDatabase()'

# Clear uploaded files
echo "Clearing uploaded files..."
gsutil -m rm -r gs://varai-uat-uploads/* || true

# Scale up deployments
echo "Scaling up deployments..."
kubectl scale deployment --all --replicas=1 --namespace=${NAMESPACE}

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment --all -n ${NAMESPACE}

# Reseed test data
echo "Reseeding test data..."
./seed-uat-data.py

echo "Environment reset completed successfully!"
echo "Backup created: ${BACKUP_NAME}"
```

To reset the environment:

```bash
# Make the script executable
chmod +x reset-uat-environment.sh

# Reset the environment
./reset-uat-environment.sh
```

## Troubleshooting

### Common Issues

1. **Infrastructure Provisioning Failures**
   - Check GCP quotas and limits
   - Verify IAM permissions
   - Review Terraform logs

2. **Application Deployment Failures**
   - Check Kubernetes logs
   - Verify Helm chart values
   - Check container image availability

3. **Data Seeding Failures**
   - Check API connectivity
   - Verify authentication credentials
   - Review data format and structure

4. **User Creation Failures**
   - Check API connectivity
   - Verify authentication credentials
   - Check for duplicate users

5. **Monitoring Setup Failures**
   - Check Kubernetes resources
   - Verify Helm chart values
   - Check for port conflicts

### Troubleshooting Commands

```bash
# Check Kubernetes pod status
kubectl get pods -n varai-uat

# Check pod logs
kubectl logs <pod-name> -n varai-uat

# Check Kubernetes events
kubectl get events -n varai-uat

# Check Kubernetes service status
kubectl get services -n varai-uat

# Check Kubernetes deployment status
kubectl get deployments -n varai-uat

# Check MongoDB connection
kubectl exec -it $(kubectl get pod -l app=mongodb -n varai-uat -o jsonpath='{.items[0].metadata.name}') -n varai-uat -- mongo admin -u admin -p ${MONGODB_PASSWORD} --eval 'db.getSiblingDB("varai").stats()'

# Check GCP resources
gcloud compute instances list --project varai-uat
gcloud container clusters list --project varai-uat
gcloud sql instances list --project varai-uat

# Check environment status
./uat-cli.py status
```
```

To deploy the application:

```bash
# Make the script executable
chmod +x deploy-uat.sh

# Deploy the latest version
./deploy-uat.sh

# Or deploy a specific version
./deploy-uat.sh v1.2.3
```