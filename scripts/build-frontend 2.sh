#!/bin/bash

# Commerce Studio Frontend Build Script
# Secure frontend build with environment-specific configuration

set -euo pipefail

# Configuration
ENVIRONMENT="${ENVIRONMENT:-staging}"
BUILD_DIR="${BUILD_DIR:-dist}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the frontend directory
check_directory() {
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Please run this script from the frontend directory."
        exit 1
    fi
    
    if [[ ! -f "vite.config.ts" ]] && [[ ! -f "vite.config.js" ]]; then
        log_warning "Vite config not found. Using default configuration."
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    if [[ -f "package-lock.json" ]]; then
        npm ci
    else
        npm install
    fi
    
    log_success "Dependencies installed"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    if npm run test --if-present; then
        log_success "Tests passed"
    else
        log_warning "Tests failed or not configured"
    fi
}

# Build the application
build_application() {
    log_info "Building application for $ENVIRONMENT environment..."
    
    # Set environment variables for build
    export NODE_ENV="production"
    export VITE_ENVIRONMENT="$ENVIRONMENT"
    
    # Build the application
    npm run build
    
    if [[ -d "$BUILD_DIR" ]]; then
        log_success "Build completed successfully"
        log_info "Build output directory: $BUILD_DIR"
        
        # Show build statistics
        if command -v du &> /dev/null; then
            BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
            log_info "Build size: $BUILD_SIZE"
        fi
    else
        log_error "Build failed - output directory not found"
        exit 1
    fi
}

# Optimize build
optimize_build() {
    log_info "Optimizing build..."
    
    # Compress static assets if gzip is available
    if command -v gzip &> /dev/null; then
        find "$BUILD_DIR" -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -k {} \;
        log_info "Static assets compressed"
    fi
    
    # Generate file manifest
    if command -v find &> /dev/null; then
        find "$BUILD_DIR" -type f > "$BUILD_DIR/file-manifest.txt"
        log_info "File manifest generated"
    fi
}

# Validate build
validate_build() {
    log_info "Validating build..."
    
    # Check if index.html exists
    if [[ ! -f "$BUILD_DIR/index.html" ]]; then
        log_error "index.html not found in build output"
        exit 1
    fi
    
    # Check if assets directory exists
    if [[ ! -d "$BUILD_DIR/assets" ]]; then
        log_warning "Assets directory not found - this might be expected for some builds"
    fi
    
    # Validate HTML structure
    if command -v grep &> /dev/null; then
        if grep -q "<html" "$BUILD_DIR/index.html" && grep -q "</html>" "$BUILD_DIR/index.html"; then
            log_success "HTML structure validated"
        else
            log_error "Invalid HTML structure in index.html"
            exit 1
        fi
    fi
    
    log_success "Build validation completed"
}

# Main build function
main() {
    log_info "Starting Commerce Studio frontend build for $ENVIRONMENT"
    
    check_directory
    install_dependencies
    run_tests
    build_application
    optimize_build
    validate_build
    
    log_success "Frontend build completed successfully!"
    echo ""
    echo "Build output: $BUILD_DIR"
    echo "Environment: $ENVIRONMENT"
    echo ""
}

# Run main function
main "$@"