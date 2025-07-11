# PowerShell script to start the Business Services

# Navigate to the Business Services directory
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

# Check if Data network exists
$dataNetExists = docker network ls --filter name=data-net -q
if (-not $dataNetExists) {
    Write-Host "Data network does not exist. Creating data-net..." -ForegroundColor Yellow
    docker network create data-net
}

# Check if Observability network exists
$observabilityNetExists = docker network ls --filter name=observability-net -q
if (-not $observabilityNetExists) {
    Write-Host "Observability network does not exist. Creating observability-net..." -ForegroundColor Yellow
    docker network create observability-net
}

# Start the Business Services
Write-Host "Starting Business Services..." -ForegroundColor Green
docker-compose up -d

# Wait for services to start
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Check if User Service is running
try {
    $userServiceStatus = Invoke-RestMethod -Uri "http://localhost:3011/health" -Method Get
    Write-Host "User Service is running!" -ForegroundColor Green
    Write-Host "Status: $($userServiceStatus.status)" -ForegroundColor Green
} catch {
    Write-Host "User Service is not responding. Check the logs with 'docker-compose logs user-service'" -ForegroundColor Red
}

# Check if Product Service is running
try {
    $productServiceStatus = Invoke-RestMethod -Uri "http://localhost:3010/health" -Method Get
    Write-Host "Product Service is running!" -ForegroundColor Green
    Write-Host "Status: $($productServiceStatus.status)" -ForegroundColor Green
} catch {
    Write-Host "Product Service is not responding. Check the logs with 'docker-compose logs product-service'" -ForegroundColor Red
}

# Check if Order Service is running
try {
    $orderServiceStatus = Invoke-RestMethod -Uri "http://localhost:3012/health" -Method Get
    Write-Host "Order Service is running!" -ForegroundColor Green
    Write-Host "Status: $($orderServiceStatus.status)" -ForegroundColor Green
} catch {
    Write-Host "Order Service is not responding. Check the logs with 'docker-compose logs order-service'" -ForegroundColor Red
}

# Display access information
Write-Host "`nBusiness Services are now available at the following URLs:" -ForegroundColor Cyan
Write-Host "- Product Service: http://localhost:3010" -ForegroundColor Cyan
Write-Host "- User Service: http://localhost:3011" -ForegroundColor Cyan
Write-Host "- Order Service: http://localhost:3012" -ForegroundColor Cyan
Write-Host "- Inventory Service: http://localhost:3013" -ForegroundColor Cyan
Write-Host "- Search Service: http://localhost:3014" -ForegroundColor Cyan
Write-Host "- API Documentation: http://localhost:3015" -ForegroundColor Cyan

Write-Host "`nTo stop the Business Services, run 'stop-business-services.ps1'" -ForegroundColor Cyan