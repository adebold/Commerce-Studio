# PowerShell script to stop the Authentication Service

# Navigate to the Authentication Service directory
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

# Stop the Authentication Service
Write-Host "Stopping Authentication Service..." -ForegroundColor Yellow
docker-compose down

Write-Host "`nAuthentication Service has been stopped." -ForegroundColor Green
Write-Host "To start the Authentication Service again, run 'start-auth-service.ps1'" -ForegroundColor Cyan