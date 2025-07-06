#!/bin/bash
# VARAi API Documentation Deployment Script
#
# This script builds and deploys the VARAi API documentation to a static website.
# It performs the following steps:
# 1. Validates the documentation
# 2. Builds the static site
# 3. Optimizes assets
# 4. Deploys to the target environment
#
# Usage:
#   ./deploy_docs.sh [options]
#
# Options:
#   --env <environment>  Target environment (dev, staging, prod) [default: dev]
#   --skip-validation    Skip documentation validation
#   --skip-build         Skip build step (use existing build)
#   --verbose            Enable verbose output
#   --help               Show this help message

set -e

# Default values
ENV="dev"
SKIP_VALIDATION=false
SKIP_BUILD=false
VERBOSE=false
DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="${DOCS_DIR}/build"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Deployment configurations
DEV_URL="https://dev-docs.varai.ai"
STAGING_URL="https://staging-docs.varai.ai"
PROD_URL="https://docs.varai.ai"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      ENV="$2"
      shift 2
      ;;
    --skip-validation)
      SKIP_VALIDATION=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help)
      echo "VARAi API Documentation Deployment Script"
      echo ""
      echo "Usage:"
      echo "  ./deploy_docs.sh [options]"
      echo ""
      echo "Options:"
      echo "  --env <environment>  Target environment (dev, staging, prod) [default: dev]"
      echo "  --skip-validation    Skip documentation validation"
      echo "  --skip-build         Skip build step (use existing build)"
      echo "  --verbose            Enable verbose output"
      echo "  --help               Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Validate environment
if [[ "$ENV" != "dev" && "$ENV" != "staging" && "$ENV" != "prod" ]]; then
  echo "Error: Invalid environment '$ENV'. Must be one of: dev, staging, prod"
  exit 1
fi

# Set target URL based on environment
case "$ENV" in
  dev)
    TARGET_URL="$DEV_URL"
    ;;
  staging)
    TARGET_URL="$STAGING_URL"
    ;;
  prod)
    TARGET_URL="$PROD_URL"
    ;;
esac

# Configure logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

debug() {
  if [[ "$VERBOSE" == true ]]; then
    echo "[DEBUG] $1"
  fi
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check required dependencies
check_dependencies() {
  log "Checking dependencies..."
  
  local missing_deps=()
  
  # Check for Python
  if ! command_exists python3; then
    missing_deps+=("python3")
  fi
  
  # Check for Node.js
  if ! command_exists node; then
    missing_deps+=("node")
  fi
  
  # Check for npm
  if ! command_exists npm; then
    missing_deps+=("npm")
  fi
  
  # Check for AWS CLI (for deployment)
  if ! command_exists aws; then
    missing_deps+=("aws-cli")
  fi
  
  # Report missing dependencies
  if [[ ${#missing_deps[@]} -gt 0 ]]; then
    log "Error: Missing required dependencies: ${missing_deps[*]}"
    log "Please install the missing dependencies and try again."
    exit 1
  fi
  
  debug "All dependencies are installed"
}

# Validate documentation
validate_docs() {
  if [[ "$SKIP_VALIDATION" == true ]]; then
    log "Skipping documentation validation"
    return 0
  fi
  
  log "Validating documentation..."
  
  # Run the validation script
  python3 "${SCRIPT_DIR}/validate_docs.py" \
    --openapi-file "${DOCS_DIR}/openapi/openapi.yaml" \
    --docs-dir "${DOCS_DIR}" \
    --report-file "${DOCS_DIR}/validation-report.json" \
    $(if [[ "$VERBOSE" == true ]]; then echo "--verbose"; fi)
  
  # Check if validation passed
  if [[ $? -ne 0 ]]; then
    log "Error: Documentation validation failed"
    log "See validation report for details: ${DOCS_DIR}/validation-report.json"
    exit 1
  fi
  
  log "Documentation validation passed"
}

# Install dependencies
install_dependencies() {
  log "Installing dependencies..."
  
  # Create a temporary package.json if it doesn't exist
  if [[ ! -f "${DOCS_DIR}/package.json" ]]; then
    debug "Creating temporary package.json"
    cat > "${DOCS_DIR}/package.json" << EOF
{
  "name": "varai-api-docs",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "docusaurus build",
    "serve": "docusaurus serve"
  }
}
EOF
  fi
  
  # Install dependencies
  (cd "${DOCS_DIR}" && npm install --no-audit --no-fund)
  
  log "Dependencies installed"
}

# Build the documentation site
build_docs() {
  if [[ "$SKIP_BUILD" == true ]]; then
    log "Skipping documentation build"
    return 0
  fi
  
  log "Building documentation site..."
  
  # Clean build directory
  if [[ -d "${BUILD_DIR}" ]]; then
    debug "Cleaning build directory"
    rm -rf "${BUILD_DIR}"
  fi
  
  # Create build directory
  mkdir -p "${BUILD_DIR}"
  
  # Copy static files
  debug "Copying static files"
  cp -r "${DOCS_DIR}/assets" "${BUILD_DIR}/"
  
  # Copy HTML files
  debug "Copying HTML files"
  find "${DOCS_DIR}" -name "*.html" -not -path "${BUILD_DIR}/*" -exec cp {} "${BUILD_DIR}/" \;
  
  # Copy OpenAPI files
  debug "Copying OpenAPI files"
  mkdir -p "${BUILD_DIR}/openapi"
  cp -r "${DOCS_DIR}/openapi" "${BUILD_DIR}/"
  
  # Copy guides
  debug "Copying guides"
  mkdir -p "${BUILD_DIR}/guides"
  cp -r "${DOCS_DIR}/guides" "${BUILD_DIR}/"
  
  # Copy SDKs documentation
  debug "Copying SDK documentation"
  mkdir -p "${BUILD_DIR}/sdks"
  cp -r "${DOCS_DIR}/sdks" "${BUILD_DIR}/"
  
  # Generate index.html if it doesn't exist
  if [[ ! -f "${BUILD_DIR}/index.html" && -f "${DOCS_DIR}/index.html" ]]; then
    debug "Copying index.html"
    cp "${DOCS_DIR}/index.html" "${BUILD_DIR}/"
  fi
  
  log "Documentation site built successfully"
}

# Optimize assets
optimize_assets() {
  log "Optimizing assets..."
  
  # Install optimization tools if needed
  if ! command_exists html-minifier; then
    debug "Installing html-minifier"
    npm install -g html-minifier
  fi
  
  if ! command_exists cleancss; then
    debug "Installing clean-css-cli"
    npm install -g clean-css-cli
  fi
  
  if ! command_exists uglifyjs; then
    debug "Installing uglify-js"
    npm install -g uglify-js
  fi
  
  # Optimize HTML files
  debug "Optimizing HTML files"
  find "${BUILD_DIR}" -name "*.html" -exec html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true -o {} {} \;
  
  # Optimize CSS files
  debug "Optimizing CSS files"
  find "${BUILD_DIR}" -name "*.css" -exec cleancss -o {} {} \;
  
  # Optimize JavaScript files
  debug "Optimizing JavaScript files"
  find "${BUILD_DIR}" -name "*.js" -not -path "*/node_modules/*" -exec uglifyjs -c -m -o {} {} \;
  
  log "Assets optimized"
}

# Deploy to target environment
deploy_docs() {
  log "Deploying documentation to ${ENV} environment (${TARGET_URL})..."
  
  # Set AWS S3 bucket based on environment
  local s3_bucket
  
  case "$ENV" in
    dev)
      s3_bucket="dev-docs.varai.ai"
      ;;
    staging)
      s3_bucket="staging-docs.varai.ai"
      ;;
    prod)
      s3_bucket="docs.varai.ai"
      ;;
  esac
  
  # Deploy to S3
  debug "Syncing to S3 bucket: ${s3_bucket}"
  aws s3 sync "${BUILD_DIR}" "s3://${s3_bucket}" --delete
  
  # Invalidate CloudFront cache if in staging or prod
  if [[ "$ENV" == "staging" || "$ENV" == "prod" ]]; then
    local cloudfront_distribution_id
    
    if [[ "$ENV" == "staging" ]]; then
      cloudfront_distribution_id="EXAMPLESTAGEDISTID"
    else
      cloudfront_distribution_id="EXAMPLEPRODISTID"
    fi
    
    debug "Invalidating CloudFront cache: ${cloudfront_distribution_id}"
    aws cloudfront create-invalidation --distribution-id "${cloudfront_distribution_id}" --paths "/*"
  fi
  
  log "Deployment complete"
  log "Documentation is now available at: ${TARGET_URL}"
}

# Main execution
main() {
  log "Starting VARAi API documentation deployment to ${ENV} environment"
  
  # Check dependencies
  check_dependencies
  
  # Validate documentation
  validate_docs
  
  # Install dependencies
  install_dependencies
  
  # Build documentation
  build_docs
  
  # Optimize assets
  optimize_assets
  
  # Deploy documentation
  deploy_docs
  
  log "Deployment process completed successfully"
}

# Run the main function
main