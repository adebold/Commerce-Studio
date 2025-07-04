# PowerShell script to stop the Business Services

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

# Stop the Business Services
Write-Host "Stopping Business Services..." -ForegroundColor Yellow
docker-compose down

Write-Host "`nBusiness Services have been stopped." -ForegroundColor Green
Write-Host "To start the Business Services again, run 'start-business-services.ps1'" -ForegroundColor Cyan