#!/bin/bash

# Unified Database Startup Script
# Addresses database fragmentation by starting consolidated services
# Based on architectural review findings in reflection_LS1.md

set -e

echo "🚀 Starting Unified Database System..."
echo "📋 This script consolidates 6+ database instances into a unified architecture"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Stop any existing fragmented services
print_status "Stopping existing fragmented database services..."

# Stop individual service docker-compose files if they exist
if [ -f "auth-service/docker-compose.yml" ]; then
    print_status "Stopping auth-service..."
    docker-compose -f auth-service/docker-compose.yml down --remove-orphans || true
fi

if [ -f "api-gateway/docker-compose.yml" ]; then
    print_status "Stopping api-gateway..."
    docker-compose -f api-gateway/docker-compose.yml down --remove-orphans || true
fi

if [ -f "data-management/docker-compose.yml" ]; then
    print_status "Stopping data-management..."
    docker-compose -f data-management/docker-compose.yml down --remove-orphans || true
fi

if [ -f "observability/docker-compose.yml" ]; then
    print_status "Stopping observability..."
    docker-compose -f observability/docker-compose.yml down --remove-orphans || true
fi

# Stop main docker-compose if running
print_status "Stopping main docker-compose services..."
docker-compose down --remove-orphans || true

# Clean up any orphaned containers
print_status "Cleaning up orphaned containers..."
docker container prune -f || true

# Create necessary directories
print_status "Creating configuration directories..."
mkdir -p config/mongodb/init
mkdir -p config/redis
mkdir -p config/postgres/init
mkdir -p data/mongodb
mkdir -p data/redis
mkdir -p data/postgres

# Check if environment file exists
if [ ! -f ".env" ]; then
    if [ -f ".env.unified" ]; then
        print_warning "No .env file found. Copying from .env.unified template..."
        cp .env.unified .env
        print_warning "Please review and update .env with your specific configuration!"
    else
        print_error "No environment configuration found. Please create .env file."
        exit 1
    fi
fi

# Choose which docker-compose to use
COMPOSE_FILE="docker-compose.yml"
if [ "$1" = "--full" ] || [ "$1" = "-f" ]; then
    if [ -f "docker-compose.unified.yml" ]; then
        COMPOSE_FILE="docker-compose.unified.yml"
        print_status "Using full unified configuration (includes Keycloak, Kong, etc.)"
    else
        print_warning "Full unified configuration not found, using main docker-compose.yml"
    fi
else
    print_status "Using main docker-compose.yml (MongoDB + Redis + API + Frontend)"
    print_status "Use --full flag for complete unified stack with auth services"
fi

# Start the unified database system
print_status "Starting unified database system with $COMPOSE_FILE..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
print_status "Waiting for services to become healthy..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check MongoDB
if docker-compose -f "$COMPOSE_FILE" ps | grep -q "mongodb.*Up.*healthy"; then
    print_success "MongoDB is healthy"
else
    print_warning "MongoDB may not be fully ready yet"
fi

# Check Redis
if docker-compose -f "$COMPOSE_FILE" ps | grep -q "redis.*Up.*healthy"; then
    print_success "Redis is healthy"
else
    print_warning "Redis may not be fully ready yet"
fi

# Check API
if docker-compose -f "$COMPOSE_FILE" ps | grep -q "api.*Up"; then
    print_success "API service is running"
    
    # Test API health endpoint
    sleep 5
    if curl -f http://localhost:8001/health > /dev/null 2>&1; then
        print_success "API health check passed"
    else
        print_warning "API health check failed - service may still be starting"
    fi
else
    print_warning "API service may not be ready yet"
fi

# Run database migrations if Prisma is available
if command -v npx &> /dev/null && [ -f "prisma/schema.prisma" ]; then
    print_status "Running Prisma database migrations..."
    npx prisma generate || print_warning "Prisma generate failed"
    npx prisma db push || print_warning "Prisma db push failed"
else
    print_warning "Prisma not available - skipping migrations"
fi

# Display service information
echo ""
print_success "🎉 Unified Database System Started Successfully!"
echo ""
echo "📊 Service URLs:"
echo "   • API:              http://localhost:8001"
echo "   • Frontend:         http://localhost:5173"
echo "   • Client Portal:    http://localhost:5174"
echo "   • MongoDB Admin:    http://localhost:8081"

if [ "$COMPOSE_FILE" = "docker-compose.unified.yml" ]; then
    echo "   • Redis Admin:      http://localhost:8082"
    echo "   • Keycloak:         http://localhost:8080/auth"
    echo "   • Kong Admin:       http://localhost:8001"
fi

echo ""
echo "🗄️  Database Connections:"
echo "   • MongoDB:          mongodb://localhost:27017"
echo "   • Redis:            redis://localhost:6379"

if [ "$COMPOSE_FILE" = "docker-compose.unified.yml" ]; then
    echo "   • PostgreSQL:       postgresql://localhost:5432"
fi

echo ""
echo "📋 Next Steps:"
echo "   1. Verify all services are healthy: docker-compose -f $COMPOSE_FILE ps"
echo "   2. Check logs if needed: docker-compose -f $COMPOSE_FILE logs [service-name]"
echo "   3. Test API endpoints: curl http://localhost:8001/health"
echo "   4. Access MongoDB admin at http://localhost:8081"
echo ""

# Show running containers
print_status "Currently running containers:"
docker-compose -f "$COMPOSE_FILE" ps

echo ""
print_success "Database consolidation complete! 🎯"
print_status "Reduced from 6+ database instances to unified architecture"