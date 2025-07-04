# PowerShell script to stop the API Gateway

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

# Stop the API Gateway
Write-Host "Stopping API Gateway..." -ForegroundColor Yellow
docker-compose down

Write-Host "`nAPI Gateway has been stopped." -ForegroundColor Green
Write-Host "To start the API Gateway again, run 'start-gateway.ps1'" -ForegroundColor Cyan