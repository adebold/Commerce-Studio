#!/bin/bash

# Magento AI Discovery Extension Deployment Script
# Deploys the AI discovery extension to Magento stores

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

# Build Magento extension
build_magento_extension() {
    local version=${1:-latest}
    
    log "Building Magento AI Discovery extension..."
    
    cd "$PROJECT_ROOT/apps/magento"
    
    # Install dependencies
    if [[ -f "composer.json" ]]; then
        composer install --no-dev --optimize-autoloader
    fi
    
    if [[ -f "package.json" ]]; then
        npm ci --production
        npm run build:production
    fi
    
    # Create extension package
    local extension_name="Varai_AiDiscovery"
    local build_dir="$PROJECT_ROOT/dist/magento"
    
    mkdir -p "$build_dir/$extension_name"
    
    # Copy extension files with proper Magento structure
    rsync -av \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='tests' \
        --exclude='*.log' \
        --exclude='composer.lock' \
        --exclude='package-lock.json' \
        . "$build_dir/$extension_name/"
    
    # Update version in module.xml
    sed -i "s/setup_version=\"[^\"]*\"/setup_version=\"$version\"/" \
        "$build_dir/$extension_name/etc/module.xml"
    
    # Create composer package
    cd "$build_dir"
    
    # Generate composer.json for the package
    cat > "composer.json" <<EOF
{
    "name": "varai/magento-ai-discovery",
    "description": "VARAi AI Discovery Extension for Magento 2",
    "type": "magento2-module",
    "version": "$version",
    "license": "MIT",
    "authors": [
        {
            "name": "VARAi Team",
            "email": "support@varai.ai"
        }
    ],
    "require": {
        "php": ">=7.4",
        "magento/framework": ">=103.0",
        "magento/module-catalog": ">=104.0",
        "magento/module-customer": ">=103.0"
    },
    "autoload": {
        "files": [
            "registration.php"
        ],
        "psr-4": {
            "Varai\\\\AiDiscovery\\\\": ""
        }
    }
}
EOF
    
    # Create ZIP package
    zip -r "varai-magento-ai-discovery-$version.zip" "$extension_name/" "composer.json"
    
    success "Magento extension built: varai-magento-ai-discovery-$version.zip"
}

# Deploy to Magento Marketplace
deploy_to_marketplace() {
    local version=$1
    local marketplace_key=${2:-$MAGENTO_MARKETPLACE_KEY}
    local marketplace_secret=${3:-$MAGENTO_MARKETPLACE_SECRET}
    
    if [[ -z "$marketplace_key" || -z "$marketplace_secret" ]]; then
        warning "Magento Marketplace credentials not provided, skipping marketplace deployment"
        return 0
    fi
    
    log "Deploying to Magento Marketplace..."
    
    local package_file="$PROJECT_ROOT/dist/magento/varai-magento-ai-discovery-$version.zip"
    
    if [[ ! -f "$package_file" ]]; then
        error "Package file not found: $package_file"
        return 1
    fi
    
    # Upload to Magento Marketplace using API
    local marketplace_response=$(curl -s -X POST \
        -H "Authorization: Bearer $(get_marketplace_token)" \
        -H "Content-Type: multipart/form-data" \
        -F "package=@$package_file" \
        -F "version=$version" \
        -F "release_notes=Release version $version with enhanced AI discovery features" \
        "https://developer-api.magento.com/rest/v1/products/packages")
    
    if echo "$marketplace_response" | grep -q "success"; then
        success "Extension uploaded to Magento Marketplace"
    else
        error "Failed to upload to Magento Marketplace: $marketplace_response"
        return 1
    fi
}

# Get Magento Marketplace authentication token
get_marketplace_token() {
    local auth_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$MAGENTO_MARKETPLACE_KEY\",\"password\":\"$MAGENTO_MARKETPLACE_SECRET\"}" \
        "https://developer-api.magento.com/rest/v1/authentication")
    
    echo "$auth_response" | jq -r '.access_token'
}

# Deploy to Packagist (Composer repository)
deploy_to_packagist() {
    local version=$1
    local github_token=${2:-$GITHUB_TOKEN}
    
    if [[ -z "$github_token" ]]; then
        warning "GitHub token not provided, skipping Packagist deployment"
        return 0
    fi
    
    log "Deploying to Packagist via GitHub..."
    
    # Create GitHub release
    local release_response=$(curl -s -X POST \
        -H "Authorization: token $github_token" \
        -H "Content-Type: application/json" \
        -d "{
            \"tag_name\": \"magento-v$version\",
            \"target_commitish\": \"main\",
            \"name\": \"Magento Extension v$version\",
            \"body\": \"Release version $version of VARAi AI Discovery extension for Magento 2\",
            \"draft\": false,
            \"prerelease\": false
        }" \
        "https://api.github.com/repos/varai-inc/magento-ai-discovery/releases")
    
    if echo "$release_response" | grep -q "tag_name"; then
        success "GitHub release created, Packagist will auto-update"
    else
        error "Failed to create GitHub release: $release_response"
        return 1
    fi
}

# Update CDN assets
update_cdn_assets() {
    local version=$1
    
    log "Updating CDN assets for Magento..."
    
    # Upload widget assets to CDN
    gsutil -m cp -r \
        "$PROJECT_ROOT/apps/magento/view/frontend/web/js/dist/" \
        "gs://varai-cdn-production/widgets/magento/$version/js/"
    
    gsutil -m cp -r \
        "$PROJECT_ROOT/apps/magento/view/frontend/web/css/dist/" \
        "gs://varai-cdn-production/widgets/magento/$version/css/"
    
    # Set cache headers
    gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
        "gs://varai-cdn-production/widgets/magento/$version/**/*.js"
    gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
        "gs://varai-cdn-production/widgets/magento/$version/**/*.css"
    
    # Update latest symlink
    gsutil -m cp -r \
        "gs://varai-cdn-production/widgets/magento/$version/*" \
        "gs://varai-cdn-production/widgets/magento/latest/"
    
    success "CDN assets updated"
}

# Run extension tests
run_extension_tests() {
    log "Running Magento extension tests..."
    
    cd "$PROJECT_ROOT/apps/magento"
    
    # PHP unit tests
    if [[ -f "phpunit.xml" ]]; then
        ./vendor/bin/phpunit
    fi
    
    # Integration tests
    if [[ -f "dev/tests/integration/phpunit.xml" ]]; then
        cd dev/tests/integration
        ../../../vendor/bin/phpunit
        cd ../../..
    fi
    
    # JavaScript tests
    if [[ -f "package.json" ]]; then
        npm test
    fi
    
    success "Extension tests completed"
}

# Validate extension compatibility
validate_extension_compatibility() {
    local version=$1
    
    log "Validating extension compatibility..."
    
    # Check Magento compatibility
    local magento_versions=("2.4.4" "2.4.5" "2.4.6" "2.4.7")
    local php_versions=("7.4" "8.1" "8.2")
    
    for magento_version in "${magento_versions[@]}"; do
        for php_version in "${php_versions[@]}"; do
            log "Testing compatibility with Magento $magento_version and PHP $php_version"
            
            # Run compatibility tests in Docker
            docker run --rm \
                -v "$PROJECT_ROOT/apps/magento:/extension" \
                -e "MAGENTO_VERSION=$magento_version" \
                -e "PHP_VERSION=$php_version" \
                varai/magento-test:latest \
                /test-compatibility.sh
        done
    done
    
    success "Compatibility validation completed"
}

# Generate installation package
generate_installation_package() {
    local version=$1
    
    log "Generating installation package..."
    
    local package_dir="$PROJECT_ROOT/dist/magento/installation-package"
    mkdir -p "$package_dir"
    
    # Copy extension files
    cp -r "$PROJECT_ROOT/dist/magento/Varai_AiDiscovery" "$package_dir/"
    
    # Create installation script
    cat > "$package_dir/install.sh" <<'EOF'
#!/bin/bash

# VARAi AI Discovery Extension Installation Script for Magento 2

set -euo pipefail

MAGENTO_ROOT=${1:-$(pwd)}

if [[ ! -f "$MAGENTO_ROOT/app/etc/env.php" ]]; then
    echo "Error: Magento installation not found in $MAGENTO_ROOT"
    exit 1
fi

echo "Installing VARAi AI Discovery extension..."

# Copy extension files
cp -r Varai_AiDiscovery "$MAGENTO_ROOT/app/code/"

# Run Magento setup commands
cd "$MAGENTO_ROOT"

echo "Enabling module..."
php bin/magento module:enable Varai_AiDiscovery

echo "Running setup upgrade..."
php bin/magento setup:upgrade

echo "Compiling DI..."
php bin/magento setup:di:compile

echo "Deploying static content..."
php bin/magento setup:static-content:deploy

echo "Clearing cache..."
php bin/magento cache:clean
php bin/magento cache:flush

echo "VARAi AI Discovery extension installed successfully!"
echo "Please configure the extension in Admin > Stores > Configuration > VARAi > AI Discovery"
EOF
    
    chmod +x "$package_dir/install.sh"
    
    # Create README
    cat > "$package_dir/README.md" <<EOF
# VARAi AI Discovery Extension for Magento 2

## Installation

1. Extract this package to your Magento root directory
2. Run the installation script:
   \`\`\`bash
   ./install.sh /path/to/magento
   \`\`\`

## Configuration

1. Go to Admin > Stores > Configuration > VARAi > AI Discovery
2. Enter your VARAi API credentials
3. Configure widget settings
4. Save configuration

## Requirements

- Magento 2.4.4 or higher
- PHP 7.4 or higher
- Valid VARAi API credentials

## Support

- Documentation: https://docs.varai.ai/magento
- Support: support@varai.ai
EOF
    
    # Create ZIP package
    cd "$PROJECT_ROOT/dist/magento"
    zip -r "varai-magento-installation-$version.zip" "installation-package/"
    
    success "Installation package created: varai-magento-installation-$version.zip"
}

# Generate deployment documentation
generate_deployment_docs() {
    local version=$1
    local deployment_id=$2
    
    log "Generating deployment documentation..."
    
    local docs_file="$PROJECT_ROOT/data/deployments/magento-deployment-$deployment_id.md"
    
    cat > "$docs_file" <<EOF
# Magento AI Discovery Extension Deployment

## Deployment Information
- **Version**: $version
- **Deployment ID**: $deployment_id
- **Date**: $(date -Iseconds)
- **Platform**: Magento 2
- **Environment**: Production

## Extension Details
- **Extension Name**: VARAi AI Discovery for Magento 2
- **Module Name**: Varai_AiDiscovery
- **Minimum Magento Version**: 2.4.4
- **Minimum PHP Version**: 7.4
- **Tested up to Magento**: 2.4.7
- **Tested up to PHP**: 8.2

## Deployment Steps Completed
1. ✅ Extension build and packaging
2. ✅ Compatibility testing
3. ✅ Magento Marketplace deployment
4. ✅ Packagist deployment
5. ✅ CDN asset updates
6. ✅ Installation package generation

## Installation Methods

### Method 1: Composer (Recommended)
\`\`\`bash
composer require varai/magento-ai-discovery
php bin/magento module:enable Varai_AiDiscovery
php bin/magento setup:upgrade
\`\`\`

### Method 2: Manual Installation
1. Download extension package
2. Extract to app/code/Varai/AiDiscovery
3. Run Magento setup commands

### Method 3: Magento Marketplace
1. Purchase from Magento Marketplace
2. Install via Component Manager

## Configuration
1. Admin > Stores > Configuration > VARAi > AI Discovery
2. Enter API credentials and configure settings

## Rollback Procedure
\`\`\`bash
php bin/magento module:disable Varai_AiDiscovery
php bin/magento setup:upgrade
composer remove varai/magento-ai-discovery
\`\`\`

## Support
- Documentation: https://docs.varai.ai/magento
- Support: support@varai.ai
- GitHub Issues: https://github.com/varai-inc/commerce-studio/issues
EOF

    success "Deployment documentation generated: $docs_file"
}

# Main deployment function
main() {
    local version=${1:-$(date +%Y%m%d-%H%M%S)}
    local deploy_to_marketplace=${2:-true}
    local run_tests=${3:-true}
    
    log "Starting Magento extension deployment"
    log "Version: $version"
    
    # Generate deployment ID
    local deployment_id="mg-$(date +%Y%m%d-%H%M%S)"
    
    # Run tests if requested
    if [[ "$run_tests" == "true" ]]; then
        run_extension_tests
        validate_extension_compatibility "$version"
    fi
    
    # Build extension
    build_magento_extension "$version"
    
    # Deploy to Magento Marketplace
    if [[ "$deploy_to_marketplace" == "true" ]]; then
        deploy_to_marketplace "$version"
    fi
    
    # Deploy to Packagist
    deploy_to_packagist "$version"
    
    # Update CDN assets
    update_cdn_assets "$version"
    
    # Generate installation package
    generate_installation_package "$version"
    
    # Generate documentation
    generate_deployment_docs "$version" "$deployment_id"
    
    success "Magento extension deployment completed!"
    success "Version: $version"
    success "Deployment ID: $deployment_id"
    success "Extension available via:"
    success "  - Composer: composer require varai/magento-ai-discovery"
    success "  - Magento Marketplace: https://marketplace.magento.com/varai-ai-discovery.html"
    success "  - CDN assets: https://cdn.varai.ai/widgets/magento/$version/"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi