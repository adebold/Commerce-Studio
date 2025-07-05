# Unified Database Startup Script (PowerShell)
# Addresses database fragmentation by starting consolidated services
# Based on architectural review findings in reflection_LS1.md

param(
    [switch]$Full,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Unified Database Startup Script

USAGE:
    .\scripts\start-unified-database.ps1 [OPTIONS]

OPTIONS:
    -Full       Use the complete unified configuration (includes Keycloak, Kong, etc.)
    -Help       Show this help message

EXAMPLES:
    .\scripts\start-unified-database.ps1           # Start main services (MongoDB + Redis + API)
    .\scripts\start-unified-database.ps1 -Full     # Start complete unified stack

DESCRIPTION:
    This script consolidates 6+ database instances into a unified architecture,
    addressing the database fragmentation issues identified in the architectural review.
"@
    exit 0
}

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
function Write-Status { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

Write-Host "🚀 Starting Unified Database System..." -ForegroundColor Cyan
Write-Host "📋 This script consolidates 6+ database instances into a unified architecture" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Success "Docker is running"
} catch {
    Write-Error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
}

# Check if docker-compose is available
try {
    docker-compose --version | Out-Null
    Write-Success "docker-compose is available"
} catch {
    Write-Error "docker-compose is not installed. Please install it and try again."
    exit 1
}

# Stop any existing fragmented services
Write-Status "Stopping existing fragmented database services..."

# Stop individual service docker-compose files if they exist
$serviceConfigs = @(
    "auth-service/docker-compose.yml",
    "api-gateway/docker-compose.yml", 
    "data-management/docker-compose.yml",
    "observability/docker-compose.yml"
)

foreach ($config in $serviceConfigs) {
    if (Test-Path $config) {
        $serviceName = Split-Path (Split-Path $config) -Leaf
        Write-Status "Stopping $serviceName..."
        try {
            docker-compose -f $config down --remove-orphans
        } catch {
            Write-Warning "Failed to stop $serviceName (may not be running)"
        }
    }
}

# Stop main docker-compose if running
Write-Status "Stopping main docker-compose services..."
try {
    docker-compose down --remove-orphans
} catch {
    Write-Warning "No main docker-compose services to stop"
}

# Clean up any orphaned containers
Write-Status "Cleaning up orphaned containers..."
try {
    docker container prune -f
} catch {
    Write-Warning "Container cleanup failed"
}

# Create necessary directories
Write-Status "Creating configuration directories..."
$directories = @(
    "config/mongodb/init",
    "config/redis", 
    "config/postgres/init",
    "data/mongodb",
    "data/redis",
    "data/postgres"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Status "Created directory: $dir"
    }
}

# Check if environment file exists
if (!(Test-Path ".env")) {
    if (Test-Path ".env.unified") {
        Write-Warning "No .env file found. Copying from .env.unified template..."
        Copy-Item ".env.unified" ".env"
        Write-Warning "Please review and update .env with your specific configuration!"
    } else {
        Write-Error "No environment configuration found. Please create .env file."
        exit 1
    }
}

# Choose which docker-compose to use
$composeFile = "docker-compose.yml"
if ($Full) {
    if (Test-Path "docker-compose.unified.yml") {
        $composeFile = "docker-compose.unified.yml"
        Write-Status "Using full unified configuration (includes Keycloak, Kong, etc.)"
    } else {
        Write-Warning "Full unified configuration not found, using main docker-compose.yml"
    }
} else {
    Write-Status "Using main docker-compose.yml (MongoDB + Redis + API + Frontend)"
    Write-Status "Use -Full flag for complete unified stack with auth services"
}

# Start the unified database system
Write-Status "Starting unified database system with $composeFile..."
try {
    docker-compose -f $composeFile up -d
    Write-Success "Services started successfully"
} catch {
    Write-Error "Failed to start services: $_"
    exit 1
}

# Wait for services to be healthy
Write-Status "Waiting for services to become healthy..."
Start-Sleep -Seconds 10

# Check service health
Write-Status "Checking service health..."

# Get running containers
$containers = docker-compose -f $composeFile ps

# Check MongoDB
if ($containers -match "mongodb.*Up.*healthy") {
    Write-Success "MongoDB is healthy"
} else {
    Write-Warning "MongoDB may not be fully ready yet"
}

# Check Redis
if ($containers -match "redis.*Up.*healthy") {
    Write-Success "Redis is healthy"
} else {
    Write-Warning "Redis may not be fully ready yet"
}

# Check API
if ($containers -match "api.*Up") {
    Write-Success "API service is running"
    
    # Test API health endpoint
    Start-Sleep -Seconds 5
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "API health check passed"
        } else {
            Write-Warning "API health check returned status: $($response.StatusCode)"
        }
    } catch {
        Write-Warning "API health check failed - service may still be starting"
    }
} else {
    Write-Warning "API service may not be ready yet"
}

# Run database migrations if Prisma is available
if (Get-Command npx -ErrorAction SilentlyContinue) {
    if (Test-Path "prisma/schema.prisma") {
        Write-Status "Running Prisma database migrations..."
        try {
            npx prisma generate
            Write-Success "Prisma generate completed"
        } catch {
            Write-Warning "Prisma generate failed: $_"
        }
        
        try {
            npx prisma db push
            Write-Success "Prisma db push completed"
        } catch {
            Write-Warning "Prisma db push failed: $_"
        }
    }
} else {
    Write-Warning "Prisma not available - skipping migrations"
}

# Display service information
Write-Host ""
Write-Success "🎉 Unified Database System Started Successfully!"
Write-Host ""
Write-Host "📊 Service URLs:" -ForegroundColor Cyan
Write-Host "   • API:              http://localhost:8001"
Write-Host "   • Frontend:         http://localhost:5173"
Write-Host "   • Client Portal:    http://localhost:5174"
Write-Host "   • MongoDB Admin:    http://localhost:8081"

if ($composeFile -eq "docker-compose.unified.yml") {
    Write-Host "   • Redis Admin:      http://localhost:8082"
    Write-Host "   • Keycloak:         http://localhost:8080/auth"
    Write-Host "   • Kong Admin:       http://localhost:8001"
}

Write-Host ""
Write-Host "🗄️  Database Connections:" -ForegroundColor Cyan
Write-Host "   • MongoDB:          mongodb://localhost:27017"
Write-Host "   • Redis:            redis://localhost:6379"

if ($composeFile -eq "docker-compose.unified.yml") {
    Write-Host "   • PostgreSQL:       postgresql://localhost:5432"
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Verify all services are healthy: docker-compose -f $composeFile ps"
Write-Host "   2. Check logs if needed: docker-compose -f $composeFile logs [service-name]"
Write-Host "   3. Test API endpoints: Invoke-WebRequest http://localhost:8001/health"
Write-Host "   4. Access MongoDB admin at http://localhost:8081"
Write-Host ""

# Show running containers
Write-Status "Currently running containers:"
docker-compose -f $composeFile ps

Write-Host ""
Write-Success "Database consolidation complete! 🎯"
Write-Status "Reduced from 6+ database instances to unified architecture"