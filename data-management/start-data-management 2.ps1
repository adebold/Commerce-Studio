# PowerShell script to start the Data Management Layer

# Navigate to the Data Management directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

# Check if Docker is running
try {
    $dockerStatus = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker is not running. Please start Docker and try again." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error checking Docker status: $_" -ForegroundColor Red
    exit 1
}

# Check if API Gateway network exists
$apiGatewayNetExists = docker network ls --filter name=api-gateway-net -q
if (-not $apiGatewayNetExists) {
    Write-Host "API Gateway network does not exist. Creating api-gateway-net..." -ForegroundColor Yellow
    docker network create api-gateway-net
}

# Check if Service network exists
$serviceNetExists = docker network ls --filter name=service-net -q
if (-not $serviceNetExists) {
    Write-Host "Service network does not exist. Creating service-net..." -ForegroundColor Yellow
    docker network create service-net
}

# Start the Data Management Layer
Write-Host "Starting Data Management Layer..." -ForegroundColor Green
docker-compose up -d

# Wait for services to start
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Check if MongoDB is running
try {
    $mongoStatus = docker exec data-mongodb mongo --eval "db.adminCommand('ping')"
    if ($mongoStatus -match "ok") {
        Write-Host "MongoDB is running!" -ForegroundColor Green
    } else {
        Write-Host "MongoDB is not responding. Check the logs with 'docker-compose logs mongodb'" -ForegroundColor Red
    }
} catch {
    Write-Host "Error checking MongoDB status: $_" -ForegroundColor Red
}

# Check if Redis is running
try {
    $redisStatus = docker exec data-redis redis-cli ping
    if ($redisStatus -eq "PONG") {
        Write-Host "Redis is running!" -ForegroundColor Green
    } else {
        Write-Host "Redis is not responding. Check the logs with 'docker-compose logs redis'" -ForegroundColor Red
    }
} catch {
    Write-Host "Error checking Redis status: $_" -ForegroundColor Red
}

# Display access information
Write-Host "`nData Management Layer is now available at the following URLs:" -ForegroundColor Cyan
Write-Host "- MongoDB: mongodb://localhost:27017" -ForegroundColor Cyan
Write-Host "- Redis: localhost:6379" -ForegroundColor Cyan
Write-Host "- MongoDB Express (Admin UI): http://localhost:8081" -ForegroundColor Cyan
Write-Host "- Redis Commander (Admin UI): http://localhost:8082" -ForegroundColor Cyan
Write-Host "- Data API: http://localhost:3002" -ForegroundColor Cyan

Write-Host "`nDefault credentials:" -ForegroundColor Cyan
Write-Host "- MongoDB: admin / admin_password" -ForegroundColor Cyan
Write-Host "- MongoDB Express: admin / admin_password" -ForegroundColor Cyan
Write-Host "- Redis Commander: admin / admin_password" -ForegroundColor Cyan

Write-Host "`nTo stop the Data Management Layer, run 'stop-data-management.ps1'" -ForegroundColor Cyan