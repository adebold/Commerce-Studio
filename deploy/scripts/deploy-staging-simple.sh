#!/bin/bash

# Simple Staging Deployment Script for VARAi AI Discovery Platform
# This script deploys the admin panel and documentation system to GCP Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-us-central1}"
ENVIRONMENT="staging"
ADMIN_USERNAME="${ADMIN_USERNAME:-varai-staging}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-VaraiStaging2025!}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if terraform is installed
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install it first."
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to get project ID
get_project_id() {
    if [ -z "$PROJECT_ID" ]; then
        PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
        if [ -z "$PROJECT_ID" ]; then
            print_error "No GCP project ID found. Please set GCP_PROJECT_ID environment variable or configure gcloud."
            exit 1
        fi
    fi
    print_status "Using GCP Project: $PROJECT_ID"
}

# Function to enable required APIs
enable_apis() {
    print_status "Enabling required GCP APIs..."
    
    local apis=(
        "run.googleapis.com"
        "cloudbuild.googleapis.com"
        "secretmanager.googleapis.com"
        "compute.googleapis.com"
        "containerregistry.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        print_status "Enabling $api..."
        gcloud services enable "$api" --project="$PROJECT_ID"
    done
    
    print_success "All required APIs enabled"
}

# Function to build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."
    
    # Build admin panel image
    print_status "Building admin panel image..."
    docker build -f deploy/staging/Dockerfile.admin -t "gcr.io/$PROJECT_ID/varai-admin-staging:latest" .
    docker push "gcr.io/$PROJECT_ID/varai-admin-staging:latest"
    
    # Build docs API image
    print_status "Building docs API image..."
    docker build -f deploy/staging/Dockerfile.docs-api -t "gcr.io/$PROJECT_ID/varai-docs-api-staging:latest" .
    docker push "gcr.io/$PROJECT_ID/varai-docs-api-staging:latest"
    
    print_success "Docker images built and pushed"
}

# Function to deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying infrastructure with Terraform..."
    
    cd terraform/environments/staging
    
    # Initialize Terraform
    terraform init
    
    # Create terraform.tfvars if it doesn't exist
    if [ ! -f terraform.tfvars ]; then
        print_status "Creating terraform.tfvars..."
        cat > terraform.tfvars <<EOF
gcp_project_id = "$PROJECT_ID"
gcp_region     = "$REGION"
environment    = "$ENVIRONMENT"
admin_username = "$ADMIN_USERNAME"
admin_password = "$ADMIN_PASSWORD"
EOF
    fi
    
    # Plan deployment
    print_status "Planning Terraform deployment..."
    terraform plan -var-file=terraform.tfvars -out=tfplan
    
    # Apply deployment
    print_status "Applying Terraform deployment..."
    terraform apply tfplan
    
    # Get outputs
    ADMIN_URL=$(terraform output -raw admin_panel_url)
    DOCS_URL=$(terraform output -raw docs_api_url)
    STAGING_IP=$(terraform output -raw staging_ip_address)
    
    cd - > /dev/null
    
    print_success "Infrastructure deployed successfully"
}

# Function to update Cloud Run services with custom images
update_cloud_run_services() {
    print_status "Updating Cloud Run services with custom images..."
    
    # Update admin panel service
    print_status "Updating admin panel service..."
    gcloud run deploy varai-admin-staging \
        --image="gcr.io/$PROJECT_ID/varai-admin-staging:latest" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --platform=managed \
        --allow-unauthenticated \
        --set-env-vars="BASIC_AUTH_USERNAME=$ADMIN_USERNAME,BASIC_AUTH_PASSWORD=$ADMIN_PASSWORD" \
        --memory=512Mi \
        --cpu=1 \
        --min-instances=0 \
        --max-instances=10
    
    # Update docs API service
    print_status "Updating docs API service..."
    gcloud run deploy varai-docs-api-staging \
        --image="gcr.io/$PROJECT_ID/varai-docs-api-staging:latest" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --platform=managed \
        --allow-unauthenticated \
        --set-env-vars="NODE_ENV=staging,BASIC_AUTH_USERNAME=$ADMIN_USERNAME,BASIC_AUTH_PASSWORD=$ADMIN_PASSWORD" \
        --memory=512Mi \
        --cpu=1 \
        --min-instances=0 \
        --max-instances=5
    
    print_success "Cloud Run services updated"
}

# Function to display deployment information
display_deployment_info() {
    print_success "Deployment completed successfully!"
    echo
    echo "=== Deployment Information ==="
    echo "Project ID: $PROJECT_ID"
    echo "Region: $REGION"
    echo "Environment: $ENVIRONMENT"
    echo
    echo "=== Service URLs ==="
    echo "Admin Panel: $ADMIN_URL"
    echo "Documentation API: $DOCS_URL"
    echo
    echo "=== Access Credentials ==="
    echo "Username: $ADMIN_USERNAME"
    echo "Password: $ADMIN_PASSWORD"
    echo
    echo "=== DNS Configuration ==="
    echo "Configure the following DNS records:"
    echo "admin-staging.varai.ai -> $STAGING_IP"
    echo "docs-api-staging.varai.ai -> $STAGING_IP"
    echo
    echo "=== Next Steps ==="
    echo "1. Configure DNS records as shown above"
    echo "2. Wait for SSL certificate provisioning (10-60 minutes)"
    echo "3. Test the deployment using the service URLs"
    echo "4. Monitor logs in Google Cloud Console"
    echo
    print_warning "Note: SSL certificates may take up to 60 minutes to provision"
}

# Function to run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Wait a moment for services to start
    sleep 10
    
    # Check admin panel
    if curl -s --max-time 10 "$ADMIN_URL" > /dev/null; then
        print_success "Admin panel is responding"
    else
        print_warning "Admin panel health check failed (this is normal during initial deployment)"
    fi
    
    # Check docs API
    if curl -s --max-time 10 "$DOCS_URL/health" > /dev/null; then
        print_success "Documentation API is responding"
    else
        print_warning "Documentation API health check failed (this is normal during initial deployment)"
    fi
}

# Main deployment function
main() {
    echo "=== VARAi AI Discovery Platform - Staging Deployment ==="
    echo
    
    check_prerequisites
    get_project_id
    enable_apis
    build_and_push_images
    deploy_infrastructure
    update_cloud_run_services
    run_health_checks
    display_deployment_info
    
    print_success "Staging deployment completed successfully!"
}

# Run main function
main "$@"