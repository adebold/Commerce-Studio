# PowerShell script to test the API Gateway

# Navigate to the API Gateway directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

# Function to make API requests and display results
function Test-Endpoint {
    param (
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [string]$Body = ""
    )
    
    Write-Host "`n=== Testing: $Description ===" -ForegroundColor Cyan
    Write-Host "Endpoint: $Method $Endpoint" -ForegroundColor Cyan
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        $params = @{
            Method = $Method
            Uri = $Endpoint
            Headers = $headers
        }
        
        if ($Body -ne "") {
            $params.Add("Body", $Body)
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "Status: Success" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5 | Write-Host
        
        return $true
    } catch {
        Write-Host "Status: Failed" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        
        return $false
    }
}

# Check if API Gateway is running
try {
    $gatewayStatus = Invoke-RestMethod -Uri "http://localhost:8001/status" -Method Get
    Write-Host "Kong API Gateway is running!" -ForegroundColor Green
    Write-Host "Kong version: $($gatewayStatus.version)" -ForegroundColor Green
} catch {
    Write-Host "Kong API Gateway is not running. Please start it with 'start-gateway.ps1'" -ForegroundColor Red
    exit 1
}

# Test endpoints
$testsPassed = 0
$totalTests = 5

# Test 1: Get all products
if (Test-Endpoint -Method "GET" -Endpoint "http://localhost:8000/api/v1/products" -Description "Get all products") {
    $testsPassed++
}

# Test 2: Get a specific product
if (Test-Endpoint -Method "GET" -Endpoint "http://localhost:8000/api/v1/products/product-1" -Description "Get a specific product") {
    $testsPassed++
}

# Test 3: Get all users
if (Test-Endpoint -Method "GET" -Endpoint "http://localhost:8000/api/v1/users" -Description "Get all users") {
    $testsPassed++
}

# Test 4: Get a specific user
if (Test-Endpoint -Method "GET" -Endpoint "http://localhost:8000/api/v1/users/user-1" -Description "Get a specific user") {
    $testsPassed++
}

# Test 5: Authentication
$authBody = '{"username": "john.doe", "password": "password"}'
if (Test-Endpoint -Method "POST" -Endpoint "http://localhost:8000/api/v1/auth/login" -Description "Authentication" -Body $authBody) {
    $testsPassed++
}

# Display test results
Write-Host "`n=== Test Results ===" -ForegroundColor Cyan
Write-Host "Tests passed: $testsPassed/$totalTests" -ForegroundColor $(if ($testsPassed -eq $totalTests) { "Green" } else { "Yellow" })
Write-Host "Success rate: $([math]::Round(($testsPassed / $totalTests) * 100))%" -ForegroundColor $(if ($testsPassed -eq $totalTests) { "Green" } else { "Yellow" })

if ($testsPassed -eq $totalTests) {
    Write-Host "`nAll tests passed! The API Gateway is working correctly." -ForegroundColor Green
} else {
    Write-Host "`nSome tests failed. Please check the API Gateway configuration." -ForegroundColor Yellow
}