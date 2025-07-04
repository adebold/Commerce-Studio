# PowerShell script to stop the Data Management Layer

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

# Stop the Data Management Layer
Write-Host "Stopping Data Management Layer..." -ForegroundColor Yellow
docker-compose down

Write-Host "`nData Management Layer has been stopped." -ForegroundColor Green
Write-Host "To start the Data Management Layer again, run 'start-data-management.ps1'" -ForegroundColor Cyan