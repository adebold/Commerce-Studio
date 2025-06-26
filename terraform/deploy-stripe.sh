#!/bin/bash

# Stripe Infrastructure Deployment Script for VARAi Commerce Studio
# This script deploys the Stripe integration module to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="prod"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="${PROJECT_ROOT}/environments/${ENVIRONMENT}"

echo -e "${BLUE}🚀 VARAi Commerce Studio - Stripe Infrastructure Deployment${NC}"
echo -e "${BLUE}================================================================${NC}"

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    print_error "Terraform is not installed. Please install Terraform first."
    exit 1
fi

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    print_error "Google Cloud SDK is not installed. Please install gcloud first."
    exit 1
fi

# Check if user is authenticated with gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_error "Not authenticated with Google Cloud. Please run 'gcloud auth login' first."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$STRIPE_PUBLISHABLE_KEY" ] || [ -z "$STRIPE_SECRET_KEY" ]; then
    print_warning "Stripe API keys not found in environment variables."
    print_warning "Make sure to set STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY"
    print_warning "Or update the terraform.tfvars file with your Stripe keys."
fi

print_status "Prerequisites check completed."

# Navigate to Terraform directory
cd "${TERRAFORM_DIR}"

print_status "Initializing Terraform..."
terraform init

print_status "Validating Terraform configuration..."
terraform validate

print_status "Planning Terraform deployment..."
terraform plan -var-file=terraform.tfvars -out=stripe-deployment.tfplan

echo -e "${YELLOW}================================================================${NC}"
echo -e "${YELLOW}DEPLOYMENT PLAN SUMMARY${NC}"
echo -e "${YELLOW}================================================================${NC}"
echo -e "Environment: ${ENVIRONMENT}"
echo -e "Terraform Directory: ${TERRAFORM_DIR}"
echo -e "Plan File: stripe-deployment.tfplan"
echo -e "${YELLOW}================================================================${NC}"

# Ask for confirmation
read -p "Do you want to apply this deployment plan? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled by user."
    exit 0
fi

print_status "Applying Terraform deployment..."
terraform apply stripe-deployment.tfplan

print_status "Deployment completed successfully!"

# Display important outputs
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}DEPLOYMENT OUTPUTS${NC}"
echo -e "${GREEN}================================================================${NC}"

# Get Terraform outputs
STRIPE_WEBHOOK_URL=$(terraform output -raw stripe_webhook_url 2>/dev/null || echo "Not available")
CONNECTED_APPS_URL=$(terraform output -raw connected_apps_url 2>/dev/null || echo "Not available")
ADMIN_PORTAL_URL=$(terraform output -raw admin_portal_url 2>/dev/null || echo "Not available")

echo -e "Stripe Webhook URL: ${BLUE}${STRIPE_WEBHOOK_URL}${NC}"
echo -e "Connected Apps URL: ${BLUE}${CONNECTED_APPS_URL}${NC}"
echo -e "Admin Portal URL: ${BLUE}${ADMIN_PORTAL_URL}${NC}"

echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}NEXT STEPS${NC}"
echo -e "${GREEN}================================================================${NC}"
echo -e "1. Configure Stripe webhook endpoint in your Stripe dashboard:"
echo -e "   URL: ${STRIPE_WEBHOOK_URL}"
echo -e "   Events: payment_intent.succeeded, payment_intent.payment_failed, customer.subscription.created, etc."
echo -e ""
echo -e "2. Test the Connected Apps marketplace:"
echo -e "   URL: ${CONNECTED_APPS_URL}"
echo -e ""
echo -e "3. Access the admin portal for customer management:"
echo -e "   URL: ${ADMIN_PORTAL_URL}"
echo -e ""
echo -e "4. Monitor the deployment:"
echo -e "   - Check Google Cloud Console for service health"
echo -e "   - Review Cloud Run logs for webhook processing"
echo -e "   - Verify Secret Manager for secure key storage"

# Clean up
rm -f stripe-deployment.tfplan

print_status "Stripe infrastructure deployment completed successfully! 🎉"