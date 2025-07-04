#!/usr/bin/env pwsh
# PowerShell script to upload secrets from .env file to Google Cloud Secret Manager

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [Parameter(Mandatory=$false)]
    [string]$EnvFile = ".env",
    
    [Parameter(Mandatory=$false)]
    [string]$Prefix = "eyewear-ml",
    
    [Parameter(Mandatory=$false)]
    [int]$BatchSize = 10
)

Write-Host "Starting secret upload to Google Cloud Secret Manager..."
Write-Host "Project ID: $ProjectId"
Write-Host "Env File: $EnvFile"
Write-Host "Prefix: $Prefix"
Write-Host "Batch Size: $BatchSize"

# Check if .env file exists
if (-not (Test-Path $EnvFile)) {
    Write-Error "Environment file $EnvFile not found!"
    exit 1
}

# Read and parse .env file
$envVars = @{}
$lineCount = 0
Get-Content $EnvFile | ForEach-Object {
    $lineCount++
    $line = $_.Trim()
    
    # Skip empty lines and comments
    if ($line -and -not $line.StartsWith('#')) {
        # Parse KEY=VALUE format
        if ($line -match '^([A-Za-z0-9_]+)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2]
            $envVars[$key] = $value
        }
    }
}

Write-Host "Found $($envVars.Count) environment variables in $EnvFile"

# Function to create or update a secret
function Set-GCPSecret {
    param(
        [string]$SecretName,
        [string]$SecretValue,
        [string]$ProjectId
    )
    
    try {
        # Check if secret exists
        $checkResult = gcloud secrets describe $SecretName --project=$ProjectId 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            # Secret exists, add new version
            Write-Host "Updating existing secret: $SecretName"
            echo $SecretValue | gcloud secrets versions add $SecretName --data-file=- --project=$ProjectId
        } else {
            # Secret doesn't exist, create it
            Write-Host "Creating new secret: $SecretName"
            gcloud secrets create $SecretName --project=$ProjectId
            if ($LASTEXITCODE -eq 0) {
                echo $SecretValue | gcloud secrets versions add $SecretName --data-file=- --project=$ProjectId
            }
        }
        
        if ($LASTEXITCODE -eq 0) {
            return $true
        } else {
            Write-Warning "Failed to create/update secret: $SecretName"
            return $false
        }
    }
    catch {
        Write-Warning "Error processing secret $SecretName : $_"
        return $false
    }
}

# Upload secrets in batches
$successCount = 0
$failureCount = 0
$currentBatch = 0
$totalSecrets = $envVars.Count

$envVars.GetEnumerator() | ForEach-Object {
    $currentBatch++
    $secretName = if ($Prefix) { "$Prefix-$($_.Key)" } else { $_.Key }
    $secretValue = $_.Value
    
    Write-Progress -Activity "Uploading Secrets" -Status "Processing $secretName ($currentBatch of $totalSecrets)" -PercentComplete (($currentBatch / $totalSecrets) * 100)
    
    if (Set-GCPSecret -SecretName $secretName -SecretValue $secretValue -ProjectId $ProjectId) {
        $successCount++
    } else {
        $failureCount++
    }
    
    # Add a small delay between requests to avoid rate limiting
    if ($currentBatch % $BatchSize -eq 0) {
        Write-Host "Processed $currentBatch secrets. Pausing briefly..."
        Start-Sleep -Seconds 2
    }
}

Write-Progress -Activity "Uploading Secrets" -Completed

Write-Host ""
Write-Host "=== Upload Summary ==="
Write-Host "Total secrets processed: $totalSecrets"
Write-Host "Successfully uploaded: $successCount"
Write-Host "Failed uploads: $failureCount"
Write-Host "Success rate: $([math]::Round(($successCount / $totalSecrets) * 100, 2))%"

if ($failureCount -gt 0) {
    Write-Warning "Some secrets failed to upload. Check the output above for details."
    exit 1
} else {
    Write-Host "All secrets uploaded successfully!" -ForegroundColor Green
    exit 0
}