# PowerShell script to upload environment variables to Google Cloud Secret Manager
# This script reads the .env file and creates secrets in Google Cloud Secret Manager.

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [Parameter(Mandatory=$true)]
    [string]$EnvFile,
    
    [Parameter(Mandatory=$false)]
    [string]$Prefix = "eyewear-ml"
)

# Check if the environment file exists
if (-not (Test-Path $EnvFile)) {
    Write-Error "Environment file $EnvFile not found."
    exit 1
}

# Read the environment file
$envVars = @{}
Get-Content $EnvFile | ForEach-Object {
    # Skip comments and empty lines
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2]
        $envVars[$key] = $value
    }
}

Write-Host "Found $($envVars.Count) environment variables in $EnvFile"

# Upload secrets to Google Cloud Secret Manager
$successCount = 0
foreach ($key in $envVars.Keys) {
    $secretName = "$Prefix-$key"
    $secretValue = $envVars[$key]
    
    # Always create the secret first (will fail if it exists, but we'll ignore that)
    Write-Host "Creating secret $secretName (if it doesn't exist)"
    try {
        gcloud secrets create $secretName --project $ProjectId 2>&1 | Out-Null
    } catch {
        Write-Host "Secret $secretName already exists"
    }
    
    # Add a new version to the secret
    Write-Host "Adding new version to secret $secretName"
    $secretValue | gcloud secrets versions add $secretName --data-file=- --project $ProjectId
    
    $successCount++
}

Write-Host "Successfully created/updated $successCount of $($envVars.Count) secrets"

# Grant service account access to secrets
Write-Host "Granting Secret Manager Secret Accessor role to service account"
gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:ml-datadriven-recos-sa@ml-datadriven-recos.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"

Write-Host "Secret upload completed successfully"