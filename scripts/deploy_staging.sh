#!/bin/bash

# EyewearML Staging Deployment Script
# This script automates the deployment of EyewearML to the GCP Cloud Run staging environment

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
PROJECT_ID="ml-datadriven-recos"
REGION="us-central1"
SERVICE_NAME="eyewear-ml-staging"
IMAGE_NAME="gcr.io/ml-datadriven-recos/api"
TAG="staging"
ENV_FILE=".env.staging"
MEMORY="2Gi"
CPU="2"
MIN_INSTANCES="0"
MAX_INSTANCES="10"
PORT="8080"
TIMEOUT="300"  # 5 minutes
DB_MIGRATE="false"
DRY_RUN="false"
VERBOSE="false"
INCLUDE_TIMESTAMP="true"

# Display script usage information
function show_usage() {
  cat << EOF
Usage: $0 [options]

This script deploys the EyewearML application to the GCP Cloud Run staging environment.

Options:
  -h, --help                 Display this help message
  -p, --project ID           GCP project ID (default: $PROJECT_ID)
  -r, --region REGION        GCP region (default: $REGION)
  -s, --service NAME         Cloud Run service name (default: $SERVICE_NAME)
  -i, --image NAME           Base image name without tag (default: $IMAGE_NAME)
  -t, --tag TAG              Image tag (default: $TAG)
  -e, --env-file FILE        Environment file (default: $ENV_FILE)
  -m, --memory SIZE          Memory allocation (default: $MEMORY)
  -c, --cpu COUNT            CPU allocation (default: $CPU)
  --min-instances COUNT      Minimum instances (default: $MIN_INSTANCES)
  --max-instances COUNT      Maximum instances (default: $MAX_INSTANCES)
  --port PORT                Container port (default: $PORT)
  --db-migrate               Run database migrations
  --no-timestamp             Don't include timestamp in image tag
  -d, --dry-run              Show commands without executing them
  -v, --verbose              Enable verbose output

Examples:
  $0                         Deploy with default settings
  $0 --db-migrate            Deploy and run database migrations
  $0 --memory 4Gi --cpu 4    Deploy with custom resource allocation

EOF
}

# Parse command line arguments
function parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -h|--help)
        show_usage
        exit 0
        ;;
      -p|--project)
        PROJECT_ID="$2"
        shift 2
        ;;
      -r|--region)
        REGION="$2"
        shift 2
        ;;
      -s|--service)
        SERVICE_NAME="$2"
        shift 2
        ;;
      -i|--image)
        IMAGE_NAME="$2"
        shift 2
        ;;
      -t|--tag)
        TAG="$2"
        shift 2
        ;;
      -e|--env-file)
        ENV_FILE="$2"
        shift 2
        ;;
      -m|--memory)
        MEMORY="$2"
        shift 2
        ;;
      -c|--cpu)
        CPU="$2"
        shift 2
        ;;
      --min-instances)
        MIN_INSTANCES="$2"
        shift 2
        ;;
      --max-instances)
        MAX_INSTANCES="$2"
        shift 2
        ;;
      --port)
        PORT="$2"
        shift 2
        ;;
      --db-migrate)
        DB_MIGRATE="true"
        shift
        ;;
      --no-timestamp)
        INCLUDE_TIMESTAMP="false"
        shift
        ;;
      -d|--dry-run)
        DRY_RUN="true"
        shift
        ;;
      -v|--verbose)
        VERBOSE="true"
        shift
        ;;
      *)
        echo -e "${RED}Error: Unknown option: $1${NC}"
        show_usage
        exit 1
        ;;
    esac
  done
}

# Log a message
function log() {
  local level="$1"
  local message="$2"
  local color="$NC"
  
  case "$level" in
    "INFO")
      color="$BLUE"
      ;;
    "SUCCESS")
      color="$GREEN"
      ;;
    "WARNING")
      color="$YELLOW"
      ;;
    "ERROR")
      color="$RED"
      ;;
  esac
  
  echo -e "${color}[$level] $message${NC}"
}

# Execute a command with dry-run support
function exec_cmd() {
  local cmd="$1"
  
  if [[ "$VERBOSE" == "true" ]]; then
    log "INFO" "Executing: $cmd"
  fi
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log "INFO" "Would execute: $cmd"
    return 0
  else
    eval "$cmd"
    return $?
  fi
}

# Check if required tools and configurations are available
function check_prerequisites() {
  log "INFO" "Checking prerequisites..."
  
  # Check for required commands
  for cmd in gcloud docker git; do
    if ! command -v "$cmd" &> /dev/null; then
      log "ERROR" "$cmd could not be found, please install it"
      exit 1
    fi
  done
  
  # Check for environment file
  if [[ ! -f "$ENV_FILE" ]]; then
    log "ERROR" "Environment file $ENV_FILE not found"
    exit 1
  fi
  
  # Check for Dockerfile
  if [[ ! -f "Dockerfile" ]]; then
    log "ERROR" "Dockerfile not found in the current directory"
    exit 1
  fi
  
  # Check GCP authentication
  if ! exec_cmd "gcloud auth print-access-token &>/dev/null"; then
    log "ERROR" "Not authenticated to GCP. Please run 'gcloud auth login' first"
    exit 1
  fi
  
  # Check project configuration
  local current_project
  current_project=$(gcloud config get-value project 2>/dev/null)
  if [[ "$current_project" != "$PROJECT_ID" ]]; then
    log "WARNING" "Current GCP project is $current_project, but deployment target is $PROJECT_ID"
    log "INFO" "Setting project to $PROJECT_ID"
    if ! exec_cmd "gcloud config set project $PROJECT_ID"; then
      log "ERROR" "Failed to set GCP project"
      exit 1
    fi
  fi
  
  log "SUCCESS" "All prerequisites checked"
}

# Build the Docker image
function build_image() {
  log "INFO" "Building Docker image..."
  
  local timestamp=""
  local git_hash
  git_hash=$(git rev-parse --short HEAD 2>/dev/null || echo "nogit")
  
  if [[ "$INCLUDE_TIMESTAMP" == "true" ]]; then
    timestamp="-$(date +%Y%m%d-%H%M%S)"
  fi
  
  local full_image_name="${IMAGE_NAME}:${TAG}${timestamp}-${git_hash}"
  local latest_image_name="${IMAGE_NAME}:${TAG}"
  
  # Build the Docker image
  if ! exec_cmd "docker build -t $full_image_name -t $latest_image_name ."; then
    log "ERROR" "Failed to build Docker image"
    exit 1
  fi
  
  # Set global variables for later use
  FULL_IMAGE_NAME="$full_image_name"
  LATEST_IMAGE_NAME="$latest_image_name"
  
  log "SUCCESS" "Docker image built successfully: $FULL_IMAGE_NAME"
}

# Push the Docker image to Container Registry
function push_image() {
  log "INFO" "Pushing Docker image to Container Registry..."
  
  # Configure Docker to use gcloud as a credential helper
  if ! exec_cmd "gcloud auth configure-docker --quiet"; then
    log "ERROR" "Failed to configure Docker authentication"
    exit 1
  fi
  
  # Push the versioned image
  if ! exec_cmd "docker push $FULL_IMAGE_NAME"; then
    log "ERROR" "Failed to push versioned image to Container Registry"
    exit 1
  fi
  
  # Push the latest tag
  if ! exec_cmd "docker push $LATEST_IMAGE_NAME"; then
    log "ERROR" "Failed to push latest image to Container Registry"
    exit 1
  fi
  
  log "SUCCESS" "Docker image pushed successfully"
}

# Deploy the application to Cloud Run
function deploy_service() {
  log "INFO" "Deploying to Cloud Run..."
  
  # Basic deployment command
  local deploy_cmd="gcloud run deploy $SERVICE_NAME \
    --image $FULL_IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory $MEMORY \
    --cpu $CPU \
    --min-instances $MIN_INSTANCES \
    --max-instances $MAX_INSTANCES \
    --port $PORT \
    --timeout ${TIMEOUT}s"
  
  # Execute deployment
  if ! exec_cmd "$deploy_cmd"; then
    log "ERROR" "Failed to deploy to Cloud Run"
    exit 1
  fi
  
  log "SUCCESS" "Deployed to Cloud Run successfully"
  
  # Set environment variables from file
  log "INFO" "Setting environment variables from $ENV_FILE..."
  
  # Create a comma-separated list of KEY=VALUE pairs from the env file
  # excluding comments and empty lines
  local env_vars
  env_vars=$(grep -v '^#' "$ENV_FILE" | grep -v '^$' | sed 's/^/--set-env-vars=/' | tr '\n' ',' | sed 's/,$//')
  
  local update_cmd="gcloud run services update $SERVICE_NAME \
    --platform managed \
    --region $REGION \
    $env_vars"
  
  if ! exec_cmd "$update_cmd"; then
    log "ERROR" "Failed to set environment variables"
    exit 1
  fi
  
  log "SUCCESS" "Environment variables set successfully"
}

# Run database migrations if requested
function run_migrations() {
  if [[ "$DB_MIGRATE" == "true" ]]; then
    log "INFO" "Running database migrations..."
    
    if ! exec_cmd "alembic upgrade head"; then
      log "ERROR" "Failed to run database migrations"
      exit 1
    fi
    
    log "SUCCESS" "Database migrations completed successfully"
  else
    log "INFO" "Skipping database migrations"
  fi
}

# Verify the deployment
function verify_deployment() {
  log "INFO" "Verifying deployment..."
  
  # Get the service URL
  local service_url
  if [[ "$DRY_RUN" == "true" ]]; then
    service_url="https://example-dry-run-url.a.run.app"
  else
    service_url=$(gcloud run services describe "$SERVICE_NAME" \
      --platform managed \
      --region "$REGION" \
      --format="value(status.url)")
  fi
  
  log "INFO" "Service URL: $service_url"
  
  # Check if we're in dry-run mode
  if [[ "$DRY_RUN" == "true" ]]; then
    log "INFO" "Skipping health check in dry-run mode"
    return 0
  fi
  
  # Simple health check (adjust based on your application)
  log "INFO" "Performing health check..."
  
  local max_attempts=5
  local attempt=1
  local health_endpoint="${service_url}/health"
  
  while [[ $attempt -le $max_attempts ]]; do
    log "INFO" "Health check attempt $attempt of $max_attempts..."
    
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$health_endpoint")
    
    if [[ "$status_code" == "200" ]]; then
      log "SUCCESS" "Health check passed! Status code: $status_code"
      break
    else
      log "WARNING" "Health check returned status code: $status_code"
      
      if [[ $attempt -eq $max_attempts ]]; then
        log "ERROR" "Health check failed after $max_attempts attempts"
        log "WARNING" "The service may still be starting up. Check manually later."
      else
        log "INFO" "Waiting 10 seconds before next attempt..."
        sleep 10
      fi
    fi
    
    ((attempt++))
  done
  
  # Display deployment information
  log "INFO" "Getting deployment details..."
  if ! exec_cmd "gcloud run services describe $SERVICE_NAME --platform managed --region $REGION"; then
    log "WARNING" "Failed to retrieve service details"
  fi
}

# Main script execution
function main() {
  log "INFO" "Starting deployment of EyewearML to GCP Cloud Run staging environment"
  
  # Execute deployment steps
  check_prerequisites
  build_image
  push_image
  deploy_service
  run_migrations
  verify_deployment
  
  log "SUCCESS" "Deployment process completed!"
  log "INFO" "Remember to check the logs and monitoring for any issues."
}

# Parse command line arguments
parse_args "$@"

# Execute main function
main
