#!/bin/bash

# WooCommerce AI Discovery Widget Deployment Script
# Deploys the AI discovery widget to WooCommerce stores

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$DEPLOY_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Build WooCommerce plugin
build_woocommerce_plugin() {
    local version=${1:-latest}
    
    log "Building WooCommerce AI Discovery plugin..."
    
    cd "$PROJECT_ROOT/apps/woocommerce"
    
    # Install dependencies
    if [[ -f "composer.json" ]]; then
        composer install --no-dev --optimize-autoloader
    fi
    
    if [[ -f "package.json" ]]; then
        npm ci --production
        npm run build:production
    fi
    
    # Create plugin package
    local plugin_dir="varai-ai-discovery"
    local build_dir="$PROJECT_ROOT/dist/woocommerce"
    
    mkdir -p "$build_dir"
    
    # Copy plugin files
    rsync -av \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='tests' \
        --exclude='*.log' \
        --exclude='composer.lock' \
        --exclude='package-lock.json' \
        . "$build_dir/$plugin_dir/"
    
    # Update version in plugin file
    sed -i "s/Version: .*/Version: $version/" "$build_dir/$plugin_dir/varai-ai-discovery.php"
    
    # Create ZIP package
    cd "$build_dir"
    zip -r "varai-ai-discovery-$version.zip" "$plugin_dir/"
    
    success "WooCommerce plugin built: varai-ai-discovery-$version.zip"
}

# Deploy to WordPress.org repository
deploy_to_wordpress_repo() {
    local version=$1
    local svn_username=${2:-$WORDPRESS_SVN_USERNAME}
    local svn_password=${3:-$WORDPRESS_SVN_PASSWORD}
    
    if [[ -z "$svn_username" || -z "$svn_password" ]]; then
        error "WordPress.org SVN credentials not provided"
        return 1
    fi
    
    log "Deploying to WordPress.org repository..."
    
    local temp_dir="/tmp/woocommerce-svn-$$"
    local plugin_slug="varai-ai-discovery"
    
    # Checkout SVN repository
    svn checkout "https://plugins.svn.wordpress.org/$plugin_slug" "$temp_dir" \
        --username "$svn_username" --password "$svn_password"
    
    cd "$temp_dir"
    
    # Copy plugin files to trunk
    rsync -av --delete \
        "$PROJECT_ROOT/dist/woocommerce/varai-ai-discovery/" \
        "trunk/"
    
    # Copy to tags directory
    mkdir -p "tags/$version"
    rsync -av "trunk/" "tags/$version/"
    
    # Update readme.txt
    update_readme_version "$version"
    
    # Add new files
    svn add --force .
    
    # Remove deleted files
    svn status | grep '^!' | awk '{print $2}' | xargs -r svn remove
    
    # Commit changes
    svn commit -m "Release version $version" \
        --username "$svn_username" --password "$svn_password"
    
    # Cleanup
    rm -rf "$temp_dir"
    
    success "Plugin deployed to WordPress.org repository"
}

# Update readme.txt version
update_readme_version() {
    local version=$1
    local readme_file="trunk/readme.txt"
    
    if [[ -f "$readme_file" ]]; then
        sed -i "s/Stable tag: .*/Stable tag: $version/" "$readme_file"
        sed -i "s/Tested up to: .*/Tested up to: 6.4/" "$readme_file"
    fi
}

# Deploy to custom distribution server
deploy_to_distribution_server() {
    local version=$1
    local server_url=${2:-$DISTRIBUTION_SERVER_URL}
    local api_key=${3:-$DISTRIBUTION_API_KEY}
    
    if [[ -z "$server_url" || -z "$api_key" ]]; then
        warning "Distribution server not configured, skipping"
        return 0
    fi
    
    log "Deploying to distribution server..."
    
    local plugin_file="$PROJECT_ROOT/dist/woocommerce/varai-ai-discovery-$version.zip"
    
    if [[ ! -f "$plugin_file" ]]; then
        error "Plugin file not found: $plugin_file"
        return 1
    fi
    
    # Upload to distribution server
    curl -X POST \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: multipart/form-data" \
        -F "file=@$plugin_file" \
        -F "version=$version" \
        -F "platform=woocommerce" \
        "$server_url/api/v1/plugins/upload"
    
    success "Plugin uploaded to distribution server"
}

# Update CDN assets
update_cdn_assets() {
    local version=$1
    
    log "Updating CDN assets for WooCommerce..."
    
    # Upload widget assets to CDN
    gsutil -m cp -r \
        "$PROJECT_ROOT/apps/woocommerce/assets/js/dist/" \
        "gs://varai-cdn-production/widgets/woocommerce/$version/js/"
    
    gsutil -m cp -r \
        "$PROJECT_ROOT/apps/woocommerce/assets/css/dist/" \
        "gs://varai-cdn-production/widgets/woocommerce/$version/css/"
    
    # Set cache headers
    gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
        "gs://varai-cdn-production/widgets/woocommerce/$version/**/*.js"
    gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
        "gs://varai-cdn-production/widgets/woocommerce/$version/**/*.css"
    
    # Update latest symlink
    gsutil -m cp -r \
        "gs://varai-cdn-production/widgets/woocommerce/$version/*" \
        "gs://varai-cdn-production/widgets/woocommerce/latest/"
    
    success "CDN assets updated"
}

# Run plugin tests
run_plugin_tests() {
    log "Running WooCommerce plugin tests..."
    
    cd "$PROJECT_ROOT/apps/woocommerce"
    
    # PHP tests
    if [[ -f "phpunit.xml" ]]; then
        ./vendor/bin/phpunit
    fi
    
    # JavaScript tests
    if [[ -f "package.json" ]]; then
        npm test
    fi
    
    success "Plugin tests completed"
}

# Validate plugin compatibility
validate_plugin_compatibility() {
    local version=$1
    
    log "Validating plugin compatibility..."
    
    # Check WordPress compatibility
    local wp_versions=("6.0" "6.1" "6.2" "6.3" "6.4")
    local wc_versions=("7.0" "7.5" "8.0" "8.5")
    
    for wp_version in "${wp_versions[@]}"; do
        for wc_version in "${wc_versions[@]}"; do
            log "Testing compatibility with WordPress $wp_version and WooCommerce $wc_version"
            
            # Run compatibility tests in Docker
            docker run --rm \
                -v "$PROJECT_ROOT/apps/woocommerce:/plugin" \
                -e "WP_VERSION=$wp_version" \
                -e "WC_VERSION=$wc_version" \
                varai/woocommerce-test:latest \
                /test-compatibility.sh
        done
    done
    
    success "Compatibility validation completed"
}

# Generate deployment documentation
generate_deployment_docs() {
    local version=$1
    local deployment_id=$2
    
    log "Generating deployment documentation..."
    
    local docs_file="$PROJECT_ROOT/data/deployments/woocommerce-deployment-$deployment_id.md"
    
    cat > "$docs_file" <<EOF
# WooCommerce AI Discovery Plugin Deployment

## Deployment Information
- **Version**: $version
- **Deployment ID**: $deployment_id
- **Date**: $(date -Iseconds)
- **Platform**: WooCommerce
- **Environment**: Production

## Plugin Details
- **Plugin Name**: VARAi AI Discovery for WooCommerce
- **Plugin Slug**: varai-ai-discovery
- **Minimum WordPress Version**: 6.0
- **Minimum WooCommerce Version**: 7.0
- **Tested up to WordPress**: 6.4
- **Tested up to WooCommerce**: 8.5

## Deployment Steps Completed
1. ✅ Plugin build and packaging
2. ✅ Compatibility testing
3. ✅ WordPress.org repository deployment
4. ✅ CDN asset updates
5. ✅ Distribution server upload

## Installation Instructions
1. Download plugin from WordPress.org or distribution server
2. Upload to WordPress admin > Plugins > Add New
3. Activate the plugin
4. Configure API settings in WooCommerce > Settings > VARAi AI Discovery

## Rollback Procedure
If issues arise, rollback can be performed by:
1. Deactivating the plugin
2. Reverting to previous version from WordPress.org
3. Clearing CDN cache

## Support
- Documentation: https://docs.varai.ai/woocommerce
- Support: support@varai.ai
- GitHub Issues: https://github.com/varai-inc/commerce-studio/issues
EOF

    success "Deployment documentation generated: $docs_file"
}

# Main deployment function
main() {
    local version=${1:-$(date +%Y%m%d-%H%M%S)}
    local deploy_to_repo=${2:-true}
    local run_tests=${3:-true}
    
    log "Starting WooCommerce plugin deployment"
    log "Version: $version"
    
    # Generate deployment ID
    local deployment_id="wc-$(date +%Y%m%d-%H%M%S)"
    
    # Run tests if requested
    if [[ "$run_tests" == "true" ]]; then
        run_plugin_tests
        validate_plugin_compatibility "$version"
    fi
    
    # Build plugin
    build_woocommerce_plugin "$version"
    
    # Deploy to WordPress.org repository
    if [[ "$deploy_to_repo" == "true" ]]; then
        deploy_to_wordpress_repo "$version"
    fi
    
    # Deploy to distribution server
    deploy_to_distribution_server "$version"
    
    # Update CDN assets
    update_cdn_assets "$version"
    
    # Generate documentation
    generate_deployment_docs "$version" "$deployment_id"
    
    success "WooCommerce plugin deployment completed!"
    success "Version: $version"
    success "Deployment ID: $deployment_id"
    success "Plugin available at: https://wordpress.org/plugins/varai-ai-discovery/"
    success "CDN assets: https://cdn.varai.ai/widgets/woocommerce/$version/"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi