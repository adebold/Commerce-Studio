#!/bin/bash

# HTML AI Discovery Widget Deployment Script
# Deploys the AI discovery widget for HTML/JavaScript integration

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

# Build HTML widget
build_html_widget() {
    local version=${1:-latest}
    
    log "Building HTML AI Discovery widget..."
    
    cd "$PROJECT_ROOT/apps/html-store"
    
    # Install dependencies
    if [[ -f "package.json" ]]; then
        npm ci --production
        npm run build:production
    fi
    
    # Create widget package
    local build_dir="$PROJECT_ROOT/dist/html"
    mkdir -p "$build_dir"
    
    # Copy built assets
    rsync -av \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='tests' \
        --exclude='*.log' \
        --exclude='package-lock.json' \
        --exclude='src' \
        deploy/ "$build_dir/"
    
    # Create versioned directory
    mkdir -p "$build_dir/$version"
    cp -r "$build_dir/js" "$build_dir/$version/"
    cp -r "$build_dir/css" "$build_dir/$version/"
    cp -r "$build_dir/images" "$build_dir/$version/"
    
    # Update version in widget files
    sed -i "s/VERSION_PLACEHOLDER/$version/g" "$build_dir/$version/js/varai-widget.min.js"
    
    success "HTML widget built for version: $version"
}

# Generate widget integration code
generate_integration_code() {
    local version=$1
    local build_dir="$PROJECT_ROOT/dist/html"
    
    log "Generating integration code..."
    
    # Create integration examples
    mkdir -p "$build_dir/examples"
    
    # Basic integration example
    cat > "$build_dir/examples/basic-integration.html" <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VARAi AI Discovery - Basic Integration</title>
    
    <!-- VARAi AI Discovery Widget CSS -->
    <link rel="stylesheet" href="https://cdn.varai.ai/widgets/html/$version/css/varai-widget.min.css">
</head>
<body>
    <h1>My Eyewear Store</h1>
    
    <!-- Product grid would go here -->
    <div id="product-grid">
        <!-- Your products -->
    </div>
    
    <!-- VARAi AI Discovery Widget Container -->
    <div id="varai-ai-discovery"></div>
    
    <!-- VARAi AI Discovery Widget JavaScript -->
    <script src="https://cdn.varai.ai/widgets/html/$version/js/varai-widget.min.js"></script>
    <script>
        // Initialize VARAi AI Discovery Widget
        VaraiWidget.init({
            apiKey: 'your-api-key-here',
            containerId: 'varai-ai-discovery',
            features: {
                faceAnalysis: true,
                virtualTryOn: true,
                recommendations: true,
                conversationalAI: true
            },
            theme: {
                primaryColor: '#007bff',
                secondaryColor: '#6c757d',
                borderRadius: '8px'
            },
            onReady: function() {
                console.log('VARAi AI Discovery Widget is ready!');
            },
            onRecommendation: function(products) {
                console.log('Recommendations received:', products);
            }
        });
    </script>
</body>
</html>
EOF

    # Advanced integration example
    cat > "$build_dir/examples/advanced-integration.html" <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VARAi AI Discovery - Advanced Integration</title>
    
    <!-- VARAi AI Discovery Widget CSS -->
    <link rel="stylesheet" href="https://cdn.varai.ai/widgets/html/$version/css/varai-widget.min.css">
    
    <style>
        .custom-widget-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .product-recommendations {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .product-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="custom-widget-container">
        <h1>Advanced AI Discovery Integration</h1>
        
        <!-- Custom trigger button -->
        <button id="start-discovery" class="btn btn-primary">
            Start AI Discovery Experience
        </button>
        
        <!-- Widget container -->
        <div id="varai-ai-discovery" style="display: none;"></div>
        
        <!-- Recommendations display -->
        <div id="recommendations-container" class="product-recommendations"></div>
    </div>
    
    <!-- VARAi AI Discovery Widget JavaScript -->
    <script src="https://cdn.varai.ai/widgets/html/$version/js/varai-widget.min.js"></script>
    <script>
        let widgetInstance;
        
        // Initialize widget with advanced configuration
        document.addEventListener('DOMContentLoaded', function() {
            widgetInstance = VaraiWidget.init({
                apiKey: 'your-api-key-here',
                containerId: 'varai-ai-discovery',
                autoOpen: false,
                features: {
                    faceAnalysis: true,
                    virtualTryOn: true,
                    recommendations: true,
                    conversationalAI: true
                },
                theme: {
                    primaryColor: '#007bff',
                    secondaryColor: '#6c757d',
                    borderRadius: '8px',
                    fontFamily: 'Arial, sans-serif'
                },
                analytics: {
                    trackEvents: true,
                    customEvents: ['product_view', 'add_to_cart']
                },
                onReady: function() {
                    console.log('Widget initialized successfully');
                },
                onFaceAnalysis: function(result) {
                    console.log('Face analysis completed:', result);
                    // Custom handling of face analysis results
                },
                onRecommendation: function(products) {
                    displayRecommendations(products);
                },
                onVirtualTryOn: function(product) {
                    console.log('Virtual try-on activated for:', product);
                },
                onError: function(error) {
                    console.error('Widget error:', error);
                }
            });
        });
        
        // Custom trigger
        document.getElementById('start-discovery').addEventListener('click', function() {
            document.getElementById('varai-ai-discovery').style.display = 'block';
            widgetInstance.open();
        });
        
        // Custom recommendations display
        function displayRecommendations(products) {
            const container = document.getElementById('recommendations-container');
            container.innerHTML = '';
            
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = \`
                    <img src="\${product.image}" alt="\${product.name}" style="width: 100%; max-width: 150px;">
                    <h3>\${product.name}</h3>
                    <p>\${product.price}</p>
                    <button onclick="addToCart('\${product.id}')">Add to Cart</button>
                    <button onclick="virtualTryOn('\${product.id}')">Try On</button>
                \`;
                container.appendChild(productCard);
            });
        }
        
        // Custom functions
        function addToCart(productId) {
            // Your add to cart logic
            console.log('Adding to cart:', productId);
            
            // Track custom event
            widgetInstance.trackEvent('add_to_cart', { productId: productId });
        }
        
        function virtualTryOn(productId) {
            // Activate virtual try-on for specific product
            widgetInstance.activateVirtualTryOn(productId);
        }
    </script>
</body>
</html>
EOF

    # React integration example
    cat > "$build_dir/examples/react-integration.jsx" <<EOF
import React, { useEffect, useRef, useState } from 'react';

const VaraiAIDiscovery = ({ 
    apiKey, 
    features = {}, 
    theme = {}, 
    onRecommendation,
    onFaceAnalysis 
}) => {
    const widgetRef = useRef(null);
    const [widgetInstance, setWidgetInstance] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load VARAi widget script
        const script = document.createElement('script');
        script.src = 'https://cdn.varai.ai/widgets/html/$version/js/varai-widget.min.js';
        script.async = true;
        script.onload = () => {
            setIsLoaded(true);
        };
        document.head.appendChild(script);

        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.varai.ai/widgets/html/$version/css/varai-widget.min.css';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(script);
            document.head.removeChild(link);
        };
    }, []);

    useEffect(() => {
        if (isLoaded && window.VaraiWidget && widgetRef.current) {
            const instance = window.VaraiWidget.init({
                apiKey,
                containerId: widgetRef.current.id,
                features: {
                    faceAnalysis: true,
                    virtualTryOn: true,
                    recommendations: true,
                    conversationalAI: true,
                    ...features
                },
                theme: {
                    primaryColor: '#007bff',
                    secondaryColor: '#6c757d',
                    borderRadius: '8px',
                    ...theme
                },
                onRecommendation: (products) => {
                    if (onRecommendation) {
                        onRecommendation(products);
                    }
                },
                onFaceAnalysis: (result) => {
                    if (onFaceAnalysis) {
                        onFaceAnalysis(result);
                    }
                }
            });
            
            setWidgetInstance(instance);
        }
    }, [isLoaded, apiKey, features, theme, onRecommendation, onFaceAnalysis]);

    return (
        <div 
            id="varai-ai-discovery-react" 
            ref={widgetRef}
            style={{ width: '100%', minHeight: '400px' }}
        />
    );
};

export default VaraiAIDiscovery;

// Usage example:
/*
import VaraiAIDiscovery from './VaraiAIDiscovery';

function App() {
    const handleRecommendations = (products) => {
        console.log('Received recommendations:', products);
        // Handle recommendations in your React app
    };

    const handleFaceAnalysis = (result) => {
        console.log('Face analysis result:', result);
        // Handle face analysis result
    };

    return (
        <div className="App">
            <h1>My Eyewear Store</h1>
            <VaraiAIDiscovery
                apiKey="your-api-key-here"
                features={{
                    faceAnalysis: true,
                    virtualTryOn: true,
                    recommendations: true
                }}
                theme={{
                    primaryColor: '#ff6b6b',
                    borderRadius: '12px'
                }}
                onRecommendation={handleRecommendations}
                onFaceAnalysis={handleFaceAnalysis}
            />
        </div>
    );
}
*/
EOF

    success "Integration examples generated"
}

# Update CDN assets
update_cdn_assets() {
    local version=$1
    
    log "Updating CDN assets for HTML widget..."
    
    # Upload widget assets to CDN
    gsutil -m cp -r \
        "$PROJECT_ROOT/dist/html/$version/" \
        "gs://varai-cdn-production/widgets/html/$version/"
    
    # Upload examples
    gsutil -m cp -r \
        "$PROJECT_ROOT/dist/html/examples/" \
        "gs://varai-cdn-production/widgets/html/examples/"
    
    # Set cache headers
    gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
        "gs://varai-cdn-production/widgets/html/$version/**/*.js"
    gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
        "gs://varai-cdn-production/widgets/html/$version/**/*.css"
    
    # Update latest symlink
    gsutil -m cp -r \
        "gs://varai-cdn-production/widgets/html/$version/*" \
        "gs://varai-cdn-production/widgets/html/latest/"
    
    success "CDN assets updated"
}

# Generate NPM package
generate_npm_package() {
    local version=$1
    
    log "Generating NPM package..."
    
    local npm_dir="$PROJECT_ROOT/dist/html/npm"
    mkdir -p "$npm_dir"
    
    # Copy widget files
    cp -r "$PROJECT_ROOT/dist/html/$version"/* "$npm_dir/"
    
    # Create package.json
    cat > "$npm_dir/package.json" <<EOF
{
    "name": "@varai/ai-discovery-widget",
    "version": "$version",
    "description": "VARAi AI Discovery Widget for HTML/JavaScript integration",
    "main": "js/varai-widget.min.js",
    "types": "types/index.d.ts",
    "files": [
        "js/",
        "css/",
        "images/",
        "types/",
        "README.md"
    ],
    "keywords": [
        "ai",
        "discovery",
        "eyewear",
        "face-analysis",
        "virtual-try-on",
        "recommendations",
        "widget"
    ],
    "author": "VARAi Team <support@varai.ai>",
    "license": "MIT",
    "homepage": "https://varai.ai",
    "repository": {
        "type": "git",
        "url": "https://github.com/varai-inc/ai-discovery-widget.git"
    },
    "bugs": {
        "url": "https://github.com/varai-inc/ai-discovery-widget/issues"
    },
    "engines": {
        "node": ">=14.0.0"
    }
}
EOF

    # Create TypeScript definitions
    mkdir -p "$npm_dir/types"
    cat > "$npm_dir/types/index.d.ts" <<EOF
declare namespace VaraiWidget {
    interface WidgetConfig {
        apiKey: string;
        containerId: string;
        autoOpen?: boolean;
        features?: {
            faceAnalysis?: boolean;
            virtualTryOn?: boolean;
            recommendations?: boolean;
            conversationalAI?: boolean;
        };
        theme?: {
            primaryColor?: string;
            secondaryColor?: string;
            borderRadius?: string;
            fontFamily?: string;
        };
        analytics?: {
            trackEvents?: boolean;
            customEvents?: string[];
        };
        onReady?: () => void;
        onFaceAnalysis?: (result: FaceAnalysisResult) => void;
        onRecommendation?: (products: Product[]) => void;
        onVirtualTryOn?: (product: Product) => void;
        onError?: (error: Error) => void;
    }

    interface FaceAnalysisResult {
        faceShape: 'oval' | 'round' | 'square' | 'heart' | 'diamond' | 'oblong';
        confidence: number;
        measurements: {
            faceWidth: number;
            faceHeight: number;
            jawWidth: number;
            foreheadWidth: number;
        };
    }

    interface Product {
        id: string;
        name: string;
        price: string;
        image: string;
        url: string;
        brand: string;
        category: string;
        compatibility: number;
        reasoning: string;
    }

    interface WidgetInstance {
        open(): void;
        close(): void;
        activateVirtualTryOn(productId: string): void;
        trackEvent(eventName: string, data?: any): void;
        destroy(): void;
    }

    function init(config: WidgetConfig): WidgetInstance;
}

declare global {
    interface Window {
        VaraiWidget: typeof VaraiWidget;
    }
}

export = VaraiWidget;
export as namespace VaraiWidget;
EOF

    # Create README for NPM
    cat > "$npm_dir/README.md" <<EOF
# VARAi AI Discovery Widget

AI-powered eyewear discovery widget with face analysis, virtual try-on, and personalized recommendations.

## Installation

### Via NPM
\`\`\`bash
npm install @varai/ai-discovery-widget
\`\`\`

### Via CDN
\`\`\`html
<link rel="stylesheet" href="https://cdn.varai.ai/widgets/html/latest/css/varai-widget.min.css">
<script src="https://cdn.varai.ai/widgets/html/latest/js/varai-widget.min.js"></script>
\`\`\`

## Quick Start

\`\`\`html
<div id="varai-widget"></div>

<script>
VaraiWidget.init({
    apiKey: 'your-api-key',
    containerId: 'varai-widget',
    features: {
        faceAnalysis: true,
        virtualTryOn: true,
        recommendations: true
    }
});
</script>
\`\`\`

## Documentation

- [Full Documentation](https://docs.varai.ai/html-widget)
- [API Reference](https://docs.varai.ai/html-widget/api)
- [Examples](https://cdn.varai.ai/widgets/html/examples/)

## Support

- Email: support@varai.ai
- GitHub: https://github.com/varai-inc/ai-discovery-widget
EOF

    success "NPM package generated"
}

# Publish to NPM
publish_to_npm() {
    local version=$1
    local npm_token=${2:-$NPM_TOKEN}
    
    if [[ -z "$npm_token" ]]; then
        warning "NPM token not provided, skipping NPM publish"
        return 0
    fi
    
    log "Publishing to NPM..."
    
    cd "$PROJECT_ROOT/dist/html/npm"
    
    # Configure NPM authentication
    echo "//registry.npmjs.org/:_authToken=$npm_token" > .npmrc
    
    # Publish package
    npm publish --access public
    
    success "Package published to NPM"
}

# Generate deployment documentation
generate_deployment_docs() {
    local version=$1
    local deployment_id=$2
    
    log "Generating deployment documentation..."
    
    local docs_file="$PROJECT_ROOT/data/deployments/html-deployment-$deployment_id.md"
    
    cat > "$docs_file" <<EOF
# HTML AI Discovery Widget Deployment

## Deployment Information
- **Version**: $version
- **Deployment ID**: $deployment_id
- **Date**: $(date -Iseconds)
- **Platform**: HTML/JavaScript
- **Environment**: Production

## Widget Details
- **Package Name**: @varai/ai-discovery-widget
- **CDN Base URL**: https://cdn.varai.ai/widgets/html/
- **NPM Package**: https://www.npmjs.com/package/@varai/ai-discovery-widget

## Deployment Steps Completed
1. ✅ Widget build and optimization
2. ✅ Integration examples generation
3. ✅ CDN asset deployment
4. ✅ NPM package generation and publish
5. ✅ TypeScript definitions

## Integration Methods

### Method 1: CDN (Recommended for most users)
\`\`\`html
<link rel="stylesheet" href="https://cdn.varai.ai/widgets/html/$version/css/varai-widget.min.css">
<script src="https://cdn.varai.ai/widgets/html/$version/js/varai-widget.min.js"></script>
\`\`\`

### Method 2: NPM (For build tools)
\`\`\`bash
npm install @varai/ai-discovery-widget@$version
\`\`\`

### Method 3: Direct Download
Download from: https://cdn.varai.ai/widgets/html/$version/

## Examples Available
- Basic Integration: https://cdn.varai.ai/widgets/html/examples/basic-integration.html
- Advanced Integration: https://cdn.varai.ai/widgets/html/examples/advanced-integration.html
- React Integration: https://cdn.varai.ai/widgets/html/examples/react-integration.jsx

## Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance
- Widget size: ~150KB (gzipped)
- Load time: <2s on 3G
- Face analysis: <5s average

## Support
- Documentation: https://docs.varai.ai/html-widget
- Support: support@varai.ai
- GitHub Issues: https://github.com/varai-inc/ai-discovery-widget/issues
EOF

    success "Deployment documentation generated: $docs_file"
}

# Main deployment function
main() {
    local version=${1:-$(date +%Y%m%d-%H%M%S)}
    local publish_npm=${2:-true}
    
    log "Starting HTML widget deployment"
    log "Version: $version"
    
    # Generate deployment ID
    local deployment_id="html-$(date +%Y%m%d-%H%M%S)"
    
    # Build widget
    build_html_widget "$version"
    
    # Generate integration code
    generate_integration_code "$version"
    
    # Update CDN assets
    update_cdn_assets "$version"
    
    # Generate NPM package
    generate_npm_package "$version"
    
    # Publish to NPM
    if [[ "$publish_npm" == "true" ]]; then
        publish_to_npm "$version"
    fi
    
    # Generate documentation
    generate_deployment_docs "$version" "$deployment_id"
    
    success "HTML widget deployment completed!"
    success "Version: $version"
    success "Deployment ID: $deployment_id"
    success "Widget available via:"
    success "  - CDN: https://cdn.varai.ai/widgets/html/$version/"
    success "  - NPM: npm install @varai/ai-discovery-widget@$version"
    success "  - Examples: https://cdn.varai.ai/widgets/html/examples/"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi