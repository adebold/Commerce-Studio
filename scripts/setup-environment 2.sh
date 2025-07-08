#!/bin/bash

# =============================================================================
# EyewearML Environment Setup Automation Script
# =============================================================================
# This script automates the setup of environment configuration for the
# EyewearML platform across different environments (local, development,
# staging, production, test).
#
# Usage:
#   ./scripts/setup-environment.sh [environment] [options]
#
# Examples:
#   ./scripts/setup-environment.sh local
#   ./scripts/setup-environment.sh development --docker
#   ./scripts/setup-environment.sh production --validate-only
# =============================================================================

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/logs/environment-setup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="${1:-local}"
DOCKER_MODE=false
VALIDATE_ONLY=false
FORCE_OVERWRITE=false
VERBOSE=false

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Create logs directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Log to file
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    # Log to console with colors
    case "$level" in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        *)
            echo "[$level] $message"
            ;;
    esac
}

error_exit() {
    log "ERROR" "$1"
    exit 1
}

check_dependencies() {
    log "INFO" "Checking dependencies..."
    
    local missing_deps=()
    
    # Check for required commands
    for cmd in python3 node npm docker docker-compose; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_deps+=("$cmd")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        error_exit "Missing dependencies: ${missing_deps[*]}"
    fi
    
    log "SUCCESS" "All dependencies are available"
}

validate_environment() {
    local env="$1"
    local valid_envs=("local" "development" "staging" "production" "test")
    
    for valid_env in "${valid_envs[@]}"; do
        if [[ "$env" == "$valid_env" ]]; then
            return 0
        fi
    done
    
    error_exit "Invalid environment: $env. Valid options: ${valid_envs[*]}"
}

# =============================================================================
# ENVIRONMENT CONFIGURATION FUNCTIONS
# =============================================================================

generate_secret_key() {
    python3 -c "import secrets; print(secrets.token_urlsafe(32))"
}

create_env_file() {
    local env="$1"
    local env_file="$PROJECT_ROOT/.env"
    local env_example="$PROJECT_ROOT/.env.example"
    
    log "INFO" "Creating .env file for $env environment..."
    
    # Check if .env already exists
    if [[ -f "$env_file" && "$FORCE_OVERWRITE" != "true" ]]; then
        log "WARN" ".env file already exists. Use --force to overwrite."
        return 0
    fi
    
    # Copy from .env.example
    if [[ ! -f "$env_example" ]]; then
        error_exit ".env.example file not found. Please ensure it exists."
    fi
    
    cp "$env_example" "$env_file"
    
    # Environment-specific customizations
    case "$env" in
        "local")
            setup_local_environment "$env_file"
            ;;
        "development")
            setup_development_environment "$env_file"
            ;;
        "staging")
            setup_staging_environment "$env_file"
            ;;
        "production")
            setup_production_environment "$env_file"
            ;;
        "test")
            setup_test_environment "$env_file"
            ;;
    esac
    
    log "SUCCESS" ".env file created for $env environment"
}

setup_local_environment() {
    local env_file="$1"
    
    log "INFO" "Configuring local environment..."
    
    # Generate secure secret key
    local secret_key=$(generate_secret_key)
    
    # Update environment variables
    sed -i.bak \
        -e "s|ENVIRONMENT=development|ENVIRONMENT=local|g" \
        -e "s|SECRET_KEY=your-super-secret-key-change-this-in-production|SECRET_KEY=$secret_key|g" \
        -e "s|MONGODB_CONNECTION_STRING=mongodb://localhost:27017|MONGODB_CONNECTION_STRING=mongodb://localhost:27017|g" \
        -e "s|DATABASE_URL=mongodb://localhost:27017/eyewear_ml|DATABASE_URL=mongodb://localhost:27017/eyewear_ml|g" \
        -e "s|REDIS_URL=redis://localhost:6379/0|REDIS_URL=redis://localhost:6379/0|g" \
        -e "s|REACT_APP_API_BASE_URL=http://localhost:8000/api/v1|REACT_APP_API_BASE_URL=http://localhost:8000/api/v1|g" \
        "$env_file"
    
    # Remove backup file
    rm -f "$env_file.bak"
}

setup_development_environment() {
    local env_file="$1"
    
    log "INFO" "Configuring development environment..."
    
    local secret_key=$(generate_secret_key)
    
    sed -i.bak \
        -e "s|ENVIRONMENT=development|ENVIRONMENT=development|g" \
        -e "s|SECRET_KEY=your-super-secret-key-change-this-in-production|SECRET_KEY=$secret_key|g" \
        -e "s|LOG_LEVEL=INFO|LOG_LEVEL=DEBUG|g" \
        -e "s|ENABLE_METRICS=true|ENABLE_METRICS=true|g" \
        "$env_file"
    
    rm -f "$env_file.bak"
}

setup_staging_environment() {
    local env_file="$1"
    
    log "INFO" "Configuring staging environment..."
    
    local secret_key=$(generate_secret_key)
    
    sed -i.bak \
        -e "s|ENVIRONMENT=development|ENVIRONMENT=staging|g" \
        -e "s|SECRET_KEY=your-super-secret-key-change-this-in-production|SECRET_KEY=$secret_key|g" \
        -e "s|MONGODB_DATABASE=eyewear_ml|MONGODB_DATABASE=eyewear_ml_staging|g" \
        -e "s|DATABASE_URL=mongodb://localhost:27017/eyewear_ml|DATABASE_URL=mongodb://staging-mongodb:27017/eyewear_ml_staging|g" \
        -e "s|REDIS_URL=redis://localhost:6379/0|REDIS_URL=redis://staging-redis:6379/0|g" \
        "$env_file"
    
    rm -f "$env_file.bak"
}

setup_production_environment() {
    local env_file="$1"
    
    log "INFO" "Configuring production environment..."
    
    local secret_key=$(generate_secret_key)
    
    sed -i.bak \
        -e "s|ENVIRONMENT=development|ENVIRONMENT=production|g" \
        -e "s|SECRET_KEY=your-super-secret-key-change-this-in-production|SECRET_KEY=$secret_key|g" \
        -e "s|MONGODB_DATABASE=eyewear_ml|MONGODB_DATABASE=eyewear_ml_prod|g" \
        -e "s|DATABASE_URL=mongodb://localhost:27017/eyewear_ml|DATABASE_URL=mongodb://prod-mongodb:27017/eyewear_ml_prod|g" \
        -e "s|REDIS_URL=redis://localhost:6379/0|REDIS_URL=redis://prod-redis:6379/0|g" \
        -e "s|LOG_LEVEL=INFO|LOG_LEVEL=WARNING|g" \
        -e "s|FORCE_HTTPS=false|FORCE_HTTPS=true|g" \
        "$env_file"
    
    rm -f "$env_file.bak"
    
    log "WARN" "Production environment configured. Please update API keys and database URLs manually."
}

setup_test_environment() {
    local env_file="$1"
    
    log "INFO" "Configuring test environment..."
    
    local secret_key=$(generate_secret_key)
    
    sed -i.bak \
        -e "s|ENVIRONMENT=development|ENVIRONMENT=test|g" \
        -e "s|SECRET_KEY=your-super-secret-key-change-this-in-production|SECRET_KEY=$secret_key|g" \
        -e "s|MONGODB_DATABASE=eyewear_ml|MONGODB_DATABASE=eyewear_ml_test|g" \
        -e "s|DATABASE_URL=mongodb://localhost:27017/eyewear_ml|DATABASE_URL=mongodb://localhost:27017/eyewear_ml_test|g" \
        -e "s|REDIS_URL=redis://localhost:6379/0|REDIS_URL=redis://localhost:6379/1|g" \
        -e "s|USE_REDIS_CACHE=true|USE_REDIS_CACHE=false|g" \
        -e "s|RATE_LIMIT_REQUESTS_PER_MINUTE=60|RATE_LIMIT_REQUESTS_PER_MINUTE=1000|g" \
        -e "s|LOG_LEVEL=INFO|LOG_LEVEL=DEBUG|g" \
        "$env_file"
    
    rm -f "$env_file.bak"
}

# =============================================================================
# DOCKER SETUP FUNCTIONS
# =============================================================================

setup_docker_environment() {
    local env="$1"
    
    log "INFO" "Setting up Docker environment for $env..."
    
    # Create docker-compose override file
    local docker_override="$PROJECT_ROOT/docker-compose.$env.yml"
    
    case "$env" in
        "local"|"development")
            create_development_docker_compose "$docker_override"
            ;;
        "staging")
            create_staging_docker_compose "$docker_override"
            ;;
        "production")
            create_production_docker_compose "$docker_override"
            ;;
        "test")
            create_test_docker_compose "$docker_override"
            ;;
    esac
    
    log "SUCCESS" "Docker configuration created: $docker_override"
}

create_development_docker_compose() {
    local file="$1"
    
    cat > "$file" << 'EOF'
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: eyewear-ml-mongodb-dev
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: eyewear_ml
    volumes:
      - mongodb_data_dev:/data/db
      - ./scripts/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
    networks:
      - eyewear-ml-network

  redis:
    image: redis:7.2-alpine
    container_name: eyewear-ml-redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis_data_dev:/data
    networks:
      - eyewear-ml-network

  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: eyewear-ml-api-dev
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - mongodb
      - redis
    networks:
      - eyewear-ml-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: eyewear-ml-frontend-dev
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_ENVIRONMENT=development
      - REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - api
    networks:
      - eyewear-ml-network

volumes:
  mongodb_data_dev:
  redis_data_dev:

networks:
  eyewear-ml-network:
    driver: bridge
EOF
}

create_test_docker_compose() {
    local file="$1"
    
    cat > "$file" << 'EOF'
version: '3.8'

services:
  mongodb-test:
    image: mongo:7.0
    container_name: eyewear-ml-mongodb-test
    ports:
      - "27018:27017"
    environment:
      MONGO_INITDB_DATABASE: eyewear_ml_test
    tmpfs:
      - /data/db
    networks:
      - eyewear-ml-test-network

  redis-test:
    image: redis:7.2-alpine
    container_name: eyewear-ml-redis-test
    ports:
      - "6380:6379"
    tmpfs:
      - /data
    networks:
      - eyewear-ml-test-network

networks:
  eyewear-ml-test-network:
    driver: bridge
EOF
}

# =============================================================================
# VALIDATION FUNCTIONS
# =============================================================================

validate_configuration() {
    local env_file="$PROJECT_ROOT/.env"
    
    log "INFO" "Validating environment configuration..."
    
    if [[ ! -f "$env_file" ]]; then
        error_exit ".env file not found. Run setup first."
    fi
    
    # Run Python validation script
    if [[ -f "$PROJECT_ROOT/scripts/validate-config.py" ]]; then
        python3 "$PROJECT_ROOT/scripts/validate-config.py" "$env_file"
    else
        log "WARN" "Configuration validation script not found. Skipping detailed validation."
    fi
    
    # Basic validation
    local required_vars=("ENVIRONMENT" "SECRET_KEY" "DATABASE_URL" "REDIS_URL")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" "$env_file"; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        error_exit "Missing required environment variables: ${missing_vars[*]}"
    fi
    
    log "SUCCESS" "Environment configuration validation passed"
}

# =============================================================================
# SERVICE MANAGEMENT FUNCTIONS
# =============================================================================

start_services() {
    local env="$1"
    
    log "INFO" "Starting services for $env environment..."
    
    if [[ "$DOCKER_MODE" == "true" ]]; then
        start_docker_services "$env"
    else
        start_local_services "$env"
    fi
}

start_docker_services() {
    local env="$1"
    local compose_file="docker-compose.$env.yml"
    
    if [[ -f "$PROJECT_ROOT/$compose_file" ]]; then
        cd "$PROJECT_ROOT"
        docker-compose -f "$compose_file" up -d
        log "SUCCESS" "Docker services started for $env environment"
    else
        log "WARN" "Docker compose file not found: $compose_file"
    fi
}

start_local_services() {
    local env="$1"
    
    log "INFO" "Starting local services..."
    
    # Start MongoDB if not running
    if ! pgrep -x "mongod" > /dev/null; then
        log "INFO" "Starting MongoDB..."
        mongod --fork --logpath /tmp/mongodb.log --dbpath /tmp/mongodb-data || true
    fi
    
    # Start Redis if not running
    if ! pgrep -x "redis-server" > /dev/null; then
        log "INFO" "Starting Redis..."
        redis-server --daemonize yes || true
    fi
    
    log "SUCCESS" "Local services started"
}

# =============================================================================
# MAIN SCRIPT LOGIC
# =============================================================================

show_usage() {
    cat << EOF
Usage: $0 [environment] [options]

Environments:
  local       - Local development setup
  development - Development environment
  staging     - Staging environment
  production  - Production environment
  test        - Test environment

Options:
  --docker           Use Docker for service setup
  --validate-only    Only validate existing configuration
  --force            Force overwrite existing files
  --verbose          Enable verbose output
  --help             Show this help message

Examples:
  $0 local
  $0 development --docker
  $0 production --validate-only
  $0 test --force
EOF
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --docker)
                DOCKER_MODE=true
                shift
                ;;
            --validate-only)
                VALIDATE_ONLY=true
                shift
                ;;
            --force)
                FORCE_OVERWRITE=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            -*)
                error_exit "Unknown option: $1"
                ;;
            *)
                # Positional argument (environment)
                if [[ -z "${ENVIRONMENT:-}" ]]; then
                    ENVIRONMENT="$1"
                fi
                shift
                ;;
        esac
    done
}

main() {
    log "INFO" "Starting EyewearML environment setup..."
    log "INFO" "Environment: $ENVIRONMENT"
    log "INFO" "Docker mode: $DOCKER_MODE"
    log "INFO" "Validate only: $VALIDATE_ONLY"
    
    # Parse remaining arguments
    parse_arguments "$@"
    
    # Validate environment
    validate_environment "$ENVIRONMENT"
    
    # Check dependencies
    check_dependencies
    
    if [[ "$VALIDATE_ONLY" == "true" ]]; then
        validate_configuration
        exit 0
    fi
    
    # Create environment configuration
    create_env_file "$ENVIRONMENT"
    
    # Setup Docker if requested
    if [[ "$DOCKER_MODE" == "true" ]]; then
        setup_docker_environment "$ENVIRONMENT"
    fi
    
    # Validate configuration
    validate_configuration
    
    # Start services
    start_services "$ENVIRONMENT"
    
    log "SUCCESS" "Environment setup completed successfully!"
    log "INFO" "Next steps:"
    log "INFO" "  1. Review and update .env file with your specific values"
    log "INFO" "  2. Update API keys and external service credentials"
    log "INFO" "  3. Run tests to verify the setup"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log "WARN" "PRODUCTION SETUP CHECKLIST:"
        log "WARN" "  - Update all API keys and secrets"
        log "WARN" "  - Configure SSL certificates"
        log "WARN" "  - Set up monitoring and alerting"
        log "WARN" "  - Review security settings"
        log "WARN" "  - Test backup and recovery procedures"
    fi
}

# Run main function with all arguments
main "$@"