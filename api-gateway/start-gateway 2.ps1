# PowerShell script to start the API Gateway

# Navigate to the API Gateway directory
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

# Start the API Gateway
Write-Host "Starting API Gateway..." -ForegroundColor Green
docker-compose up -d

# Wait for services to start
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if Kong is running
try {
    $kongStatus = Invoke-RestMethod -Uri "http://localhost:8001/status" -Method Get
    Write-Host "Kong API Gateway is running!" -ForegroundColor Green
    Write-Host "Kong version: $($kongStatus.version)" -ForegroundColor Green
    Write-Host "Database: $($kongStatus.database.reachable)" -ForegroundColor Green
} catch {
    Write-Host "Kong API Gateway is not responding. Check the logs with 'docker-compose logs kong'" -ForegroundColor Red
}

# Display access information
Write-Host "`nAPI Gateway is now available at the following URLs:" -ForegroundColor Cyan
Write-Host "- Kong Admin API: http://localhost:8001" -ForegroundColor Cyan
Write-Host "- Kong Manager UI: http://localhost:1337" -ForegroundColor Cyan
Write-Host "- Kong Proxy (API Gateway): http://localhost:8000" -ForegroundColor Cyan

Write-Host "`nTest the API Gateway with the following commands:" -ForegroundColor Cyan
Write-Host "- Get all products: curl http://localhost:8000/api/v1/products" -ForegroundColor Cyan
Write-Host "- Get a specific product: curl http://localhost:8000/api/v1/products/product-1" -ForegroundColor Cyan
Write-Host "- Get all users: curl http://localhost:8000/api/v1/users" -ForegroundColor Cyan
Write-Host "- Get a specific user: curl http://localhost:8000/api/v1/users/user-1" -ForegroundColor Cyan

Write-Host "`nTo stop the API Gateway, run 'stop-gateway.ps1'" -ForegroundColor Cyan