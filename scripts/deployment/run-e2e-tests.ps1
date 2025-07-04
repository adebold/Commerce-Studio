# PowerShell script to run end-to-end tests using Docker Compose
# Fixes TensorFlow/Python compatibility issues by using a dedicated Docker setup

# Colors for output
function Write-Color {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

Write-Color "========================================" "Yellow"
Write-Color "   Running EyewearML E2E Test Suite     " "Yellow"
Write-Color "========================================" "Yellow"

# Create test results directory if it doesn't exist
if (-not (Test-Path "test-results")) {
    New-Item -Path "test-results" -ItemType Directory | Out-Null
}

# Function to clean up containers
function Cleanup {
    Write-Color "`nCleaning up containers..." "Yellow"
    docker-compose -f docker-compose.e2e.yml down --volumes
    Write-Color "Cleanup complete." "Green"
}

# Build and start containers
Write-Color "`nBuilding and starting containers..." "Yellow"
docker-compose -f docker-compose.e2e.yml build
docker-compose -f docker-compose.e2e.yml up -d

# Wait for services to be ready
Write-Color "`nWaiting for services to be ready..." "Yellow"
Start-Sleep -Seconds 10

# Check if the API service is running
$apiServiceRunning = docker-compose -f docker-compose.e2e.yml ps | Select-String -Pattern "api.*Up" -Quiet
if (-not $apiServiceRunning) {
    Write-Color "API service is not running. Check logs for errors." "Red"
    docker-compose -f docker-compose.e2e.yml logs api
    Cleanup
    exit 1
}

try {
    # Run specific test or all tests
    if ($args.Count -gt 0) {
        Write-Color "`nRunning specific test: $($args[0])" "Yellow"
        $testResult = docker-compose -f docker-compose.e2e.yml exec -T e2e-test-runner pytest $args[0] -v
    }
    else {
        Write-Color "`nRunning all E2E tests..." "Yellow"
        $testResult = docker-compose -f docker-compose.e2e.yml exec -T e2e-test-runner pytest tests/e2e -v
    }

    # Check test result
    if ($LASTEXITCODE -eq 0) {
        Write-Color "`n[PASS] All tests passed successfully!" "Green"
    }
    else {
        Write-Color "`n[FAIL] Tests failed. Check logs for details." "Red"
        exit 1
    }
}
finally {
    # Always clean up even if tests fail
    Cleanup
}
