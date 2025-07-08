#!/bin/bash

# VARAi Documentation System Deployment Script
# Deploys the HTML documentation system to production

set -e

echo "🚀 Starting VARAi Documentation System Deployment..."

# Configuration
DEPLOY_ENV=${1:-production}
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
ADMIN_PATH="$PROJECT_ROOT/website/admin"
DOCS_PATH="$PROJECT_ROOT/docs"

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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 14+ to continue."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 14 ]; then
        log_error "Node.js version 14+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm to continue."
        exit 1
    fi
    
    # Check if required directories exist
    if [ ! -d "$ADMIN_PATH" ]; then
        log_error "Admin directory not found: $ADMIN_PATH"
        exit 1
    fi
    
    if [ ! -d "$DOCS_PATH" ]; then
        log_error "Documentation directory not found: $DOCS_PATH"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing documentation service dependencies..."
    
    cd "$ADMIN_PATH"
    
    # Create package.json if it doesn't exist
    if [ ! -f "package.json" ]; then
        log_info "Creating package.json..."
        cat > package.json << EOF
{
  "name": "varai-documentation-system",
  "version": "1.0.0",
  "description": "VARAi HTML Documentation System",
  "main": "api/documentation-service.js",
  "scripts": {
    "start": "node api/documentation-service.js",
    "dev": "nodemon api/documentation-service.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "marked": "^4.3.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  },
  "keywords": ["documentation", "varai", "ai-discovery"],
  "author": "VARAi Team",
  "license": "MIT"
}
EOF
    fi
    
    # Install dependencies
    npm install
    
    log_success "Dependencies installed successfully"
}

# Validate documentation files
validate_documentation() {
    log_info "Validating documentation files..."
    
    local error_count=0
    
    # Check critical documentation files
    critical_files=(
        "$DOCS_PATH/master-documentation/AI-DISCOVERY-MASTER-PROJECT-DOCUMENTATION.md"
        "$DOCS_PATH/technical/DEVELOPER-TECHNICAL-GUIDE.md"
        "$DOCS_PATH/user-guides/ADMIN-PANEL-USER-GUIDE.md"
        "$DOCS_PATH/api/API-DOCUMENTATION-INTEGRATION-GUIDE.md"
        "$DOCS_PATH/operations/TROUBLESHOOTING-MAINTENANCE-GUIDE.md"
        "$DOCS_PATH/training/KNOWLEDGE-TRANSFER-TRAINING-GUIDE.md"
    )
    
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_warning "Documentation file not found: $file"
            ((error_count++))
        fi
    done
    
    # Check admin panel files
    admin_files=(
        "$ADMIN_PATH/documentation.html"
        "$ADMIN_PATH/js/documentation-portal.js"
        "$ADMIN_PATH/api/documentation-service.js"
        "$ADMIN_PATH/index.html"
    )
    
    for file in "${admin_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Required admin file not found: $file"
            exit 1
        fi
    done
    
    if [ $error_count -gt 0 ]; then
        log_warning "Found $error_count missing documentation files (non-critical)"
    else
        log_success "All documentation files validated"
    fi
}

# Test documentation service
test_service() {
    log_info "Testing documentation service..."
    
    cd "$ADMIN_PATH"
    
    # Start service in background
    node api/documentation-service.js &
    SERVICE_PID=$!
    
    # Wait for service to start
    sleep 3
    
    # Test health endpoint
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_success "Documentation service health check passed"
    else
        log_error "Documentation service health check failed"
        kill $SERVICE_PID 2>/dev/null || true
        exit 1
    fi
    
    # Test API endpoints
    if curl -f http://localhost:3001/api/docs > /dev/null 2>&1; then
        log_success "Documentation API endpoints responding"
    else
        log_error "Documentation API endpoints not responding"
        kill $SERVICE_PID 2>/dev/null || true
        exit 1
    fi
    
    # Stop test service
    kill $SERVICE_PID 2>/dev/null || true
    
    log_success "Service testing completed successfully"
}

# Create systemd service
create_systemd_service() {
    log_info "Creating systemd service..."
    
    # Create service file
    sudo tee /etc/systemd/system/varai-docs.service > /dev/null << EOF
[Unit]
Description=VARAi Documentation Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$ADMIN_PATH
ExecStart=/usr/bin/node api/documentation-service.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable varai-docs
    
    log_success "Systemd service created and enabled"
}

# Configure web server
configure_web_server() {
    log_info "Configuring web server..."
    
    # Detect web server
    if command -v nginx &> /dev/null; then
        configure_nginx
    elif command -v apache2 &> /dev/null || command -v httpd &> /dev/null; then
        configure_apache
    else
        log_warning "No supported web server detected. Manual configuration required."
        return
    fi
}

configure_nginx() {
    log_info "Configuring Nginx..."
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/varai-admin > /dev/null << EOF
server {
    listen 80;
    server_name admin.varai.local;
    root $ADMIN_PATH;
    index index.html;

    # Documentation portal
    location /admin/ {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
    location /admin/api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/varai-admin /etc/nginx/sites-enabled/
    
    # Test configuration
    if sudo nginx -t; then
        sudo systemctl reload nginx
        log_success "Nginx configured successfully"
    else
        log_error "Nginx configuration test failed"
        exit 1
    fi
}

configure_apache() {
    log_info "Configuring Apache..."
    
    # Create Apache configuration
    sudo tee /etc/apache2/sites-available/varai-admin.conf > /dev/null << EOF
<VirtualHost *:80>
    ServerName admin.varai.local
    DocumentRoot $ADMIN_PATH
    
    # Enable mod_rewrite and mod_proxy
    RewriteEngine On
    
    # API proxy
    ProxyPass /admin/api/ http://localhost:3001/api/
    ProxyPassReverse /admin/api/ http://localhost:3001/api/
    
    # Documentation portal routing
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^/admin/ /index.html [L]
    
    # Static assets caching
    <LocationMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </LocationMatch>
</VirtualHost>
EOF
    
    # Enable required modules
    sudo a2enmod rewrite proxy proxy_http expires
    
    # Enable site
    sudo a2ensite varai-admin
    
    # Test configuration
    if sudo apache2ctl configtest; then
        sudo systemctl reload apache2
        log_success "Apache configured successfully"
    else
        log_error "Apache configuration test failed"
        exit 1
    fi
}

# Set file permissions
set_permissions() {
    log_info "Setting file permissions..."
    
    # Set ownership
    sudo chown -R www-data:www-data "$ADMIN_PATH"
    
    # Set directory permissions
    find "$ADMIN_PATH" -type d -exec chmod 755 {} \;
    
    # Set file permissions
    find "$ADMIN_PATH" -type f -exec chmod 644 {} \;
    
    # Make service executable
    chmod +x "$ADMIN_PATH/api/documentation-service.js"
    
    log_success "File permissions set correctly"
}

# Start services
start_services() {
    log_info "Starting services..."
    
    # Start documentation service
    sudo systemctl start varai-docs
    
    # Check service status
    if sudo systemctl is-active --quiet varai-docs; then
        log_success "Documentation service started successfully"
    else
        log_error "Failed to start documentation service"
        sudo systemctl status varai-docs
        exit 1
    fi
    
    # Restart web server
    if command -v nginx &> /dev/null; then
        sudo systemctl restart nginx
        log_success "Nginx restarted"
    elif command -v apache2 &> /dev/null || command -v httpd &> /dev/null; then
        sudo systemctl restart apache2 || sudo systemctl restart httpd
        log_success "Apache restarted"
    fi
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Wait for services to fully start
    sleep 5
    
    # Test documentation service
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_success "Documentation service is responding"
    else
        log_error "Documentation service is not responding"
        exit 1
    fi
    
    # Test web server (if configured)
    if curl -f http://localhost/admin/ > /dev/null 2>&1; then
        log_success "Web server is serving admin panel"
    else
        log_warning "Web server test failed - manual verification required"
    fi
    
    log_success "Deployment verification completed"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    # Add any cleanup tasks here
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting VARAi Documentation System deployment for environment: $DEPLOY_ENV"
    
    # Run deployment steps
    check_prerequisites
    install_dependencies
    validate_documentation
    test_service
    
    if [ "$DEPLOY_ENV" = "production" ]; then
        create_systemd_service
        configure_web_server
        set_permissions
        start_services
        verify_deployment
    else
        log_info "Development deployment - skipping production configuration"
    fi
    
    cleanup
    
    log_success "🎉 VARAi Documentation System deployment completed successfully!"
    
    # Display access information
    echo ""
    echo "📚 Documentation System Access:"
    echo "   Local: http://localhost:3001"
    echo "   Admin Panel: http://localhost/admin/"
    echo "   Documentation Portal: http://localhost/admin/documentation.html"
    echo ""
    echo "🔧 Service Management:"
    echo "   Status: sudo systemctl status varai-docs"
    echo "   Logs: sudo journalctl -u varai-docs -f"
    echo "   Restart: sudo systemctl restart varai-docs"
    echo ""
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"