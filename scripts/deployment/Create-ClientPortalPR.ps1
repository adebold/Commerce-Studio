# PowerShell script to create a PR for client portal integration

# Create a new branch
git checkout -b feature/client-portal-integration

# Rename updated files
Move-Item -Path "apps/shopify-app/routes/auth-updated.js" -Destination "apps/shopify-app/routes/auth.js" -Force
Move-Item -Path "apps/shopify-app/server-updated.js" -Destination "apps/shopify-app/server.js" -Force
Move-Item -Path "apps/shopify-app/models/Shop-updated.js" -Destination "apps/shopify-app/models/Shop.js" -Force
Move-Item -Path "api-gateway/config/kong-updated.yml" -Destination "api-gateway/config/kong.yml" -Force

# Add all files to git
git add src/client-portal-integration/
git add apps/shopify-app/routes/auth.js
git add apps/shopify-app/server.js
git add apps/shopify-app/models/Shop.js
git add api-gateway/config/kong.yml

# Commit changes
git commit -F client-portal-integration-commit.txt

# Push to remote
git push origin feature/client-portal-integration

# Create PR using GitHub CLI (if installed)
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if ($ghInstalled) {
    gh pr create --title "Client Portal Integration" --body-file client-portal-integration-pr.md
} else {
    Write-Host "GitHub CLI not installed. Please create PR manually using the content in client-portal-integration-pr.md"
}