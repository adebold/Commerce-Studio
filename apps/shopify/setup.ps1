$ErrorActionPreference = "Stop"
Push-Location $PSScriptRoot
try {
    Write-Host "Installing dependencies..."
    & npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }

    Write-Host "`nRunning installation script..."
    & node scripts/install.js --debug
    if ($LASTEXITCODE -ne 0) { throw "Installation script failed" }
} catch {
    Write-Error $_.Exception.Message
    exit 1
} finally {
    Pop-Location
}
