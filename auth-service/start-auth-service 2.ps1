# PowerShell script to start the Authentication Service

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

# Check if API Gateway network exists
$networkExists = docker network ls --filter name=api-gateway-net -q
if (-not $networkExists) {
    Write-Host "API Gateway network does not exist. Creating api-gateway-net..." -ForegroundColor Yellow
    docker network create api-gateway-net
}

# Start the Authentication Service
Write-Host "Starting Authentication Service..." -ForegroundColor Green
docker-compose up -d

# Wait for services to start
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Check if Keycloak is running
try {
    $keycloakStatus = Invoke-RestMethod -Uri "http://localhost:8080/auth/health" -Method Get
    Write-Host "Keycloak is running!" -ForegroundColor Green
} catch {
    Write-Host "Keycloak is not responding. Check the logs with 'docker-compose logs keycloak'" -ForegroundColor Red
}

# Display access information
Write-Host "`nAuthentication Service is now available at the following URLs:" -ForegroundColor Cyan
Write-Host "- Keycloak Admin Console: http://localhost:8080/auth/admin/" -ForegroundColor Cyan
Write-Host "- Integration Service: http://localhost:8081" -ForegroundColor Cyan
Write-Host "- Admin UI: http://localhost:8082" -ForegroundColor Cyan

Write-Host "`nDefault admin credentials:" -ForegroundColor Cyan
Write-Host "- Username: admin" -ForegroundColor Cyan
Write-Host "- Password: admin (you will be prompted to change this on first login)" -ForegroundColor Cyan

Write-Host "`nTo stop the Authentication Service, run 'stop-auth-service.ps1'" -ForegroundColor Cyan

# Import realm if it doesn't exist
Write-Host "`nChecking if realm exists..." -ForegroundColor Yellow
try {
    $token = Invoke-RestMethod -Uri "http://localhost:8080/auth/realms/master/protocol/openid-connect/token" -Method Post -Body "client_id=admin-cli&username=admin&password=admin&grant_type=password" -ContentType "application/x-www-form-urlencoded"
    
    $headers = @{
        Authorization = "Bearer $($token.access_token)"
    }
    
    $realms = Invoke-RestMethod -Uri "http://localhost:8080/auth/admin/realms" -Method Get -Headers $headers
    
    $realmExists = $false
    foreach ($realm in $realms) {
        if ($realm.realm -eq "varai") {
            $realmExists = $true
            break
        }
    }
    
    if (-not $realmExists) {
        Write-Host "Importing VARAi realm..." -ForegroundColor Yellow
        $realmJson = Get-Content -Path "./keycloak/config/varai-realm.json" -Raw
        Invoke-RestMethod -Uri "http://localhost:8080/auth/admin/realms" -Method Post -Headers $headers -Body $realmJson -ContentType "application/json"
        Write-Host "VARAi realm imported successfully!" -ForegroundColor Green
    } else {
        Write-Host "VARAi realm already exists." -ForegroundColor Green
    }
} catch {
    Write-Host "Error checking or importing realm: $_" -ForegroundColor Red
    Write-Host "You may need to manually import the realm from the Keycloak Admin Console." -ForegroundColor Yellow
    Write-Host "1. Log in to http://localhost:8080/auth/admin/" -ForegroundColor Yellow
    Write-Host "2. Click on 'Add realm'" -ForegroundColor Yellow
    Write-Host "3. Click 'Select file' and choose 'keycloak/config/varai-realm.json'" -ForegroundColor Yellow
    Write-Host "4. Click 'Create'" -ForegroundColor Yellow
}