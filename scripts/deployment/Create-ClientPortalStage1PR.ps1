# PowerShell script to create a PR for client portal integration - Stage 1

# Set GitHub token as environment variable (will be used by GitHub CLI)
# This is more secure than hardcoding the token in the script
$env:GITHUB_TOKEN = Read-Host -Prompt "Enter your GitHub personal access token"

# Configure GitHub CLI to use the token
Write-Host "Configuring GitHub CLI authentication..."
# Check if branch already exists
$branchExists = git branch --list feature/client-portal-integration-stage1

if ($branchExists) {
    Write-Host "Branch 'feature/client-portal-integration-stage1' already exists. Switching to it..."
    git checkout feature/client-portal-integration-stage1
} else {
    Write-Host "Creating new branch 'feature/client-portal-integration-stage1'..."
    git checkout -b feature/client-portal-integration-stage1
}

# Add all files to git
Write-Host "Adding files to git..."
git add src/client-portal-integration/

# Add test files
git add src/client-portal-integration/tests/

# Check if there are changes to commit
$status = git status --porcelain
if (-not $status) {
    Write-Host "No changes to commit. Please make sure the files exist and have changes."
    exit 1
}
# Commit changes
Write-Host "Committing changes..."
git commit -F client-portal-integration-stage1-commit.txt

# Push to remote
Write-Host "Pushing to remote..."
git push origin feature/client-portal-integration-stage1


# Create PR using GitHub CLI
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if ($ghInstalled) {
    Write-Host "Creating PR using GitHub CLI..."
    
    # Try to use the token directly
    try {
        gh pr create --title "Client Portal Integration - Stage 1" --body-file client-portal-integration-stage1-pr.md
    }
    catch {
        Write-Host "Error creating PR with GitHub CLI. You may need to authenticate manually."
        Write-Host "Run 'gh auth login' to authenticate with GitHub."
        
        # Ask if user wants to authenticate manually
        $manualAuth = Read-Host "Do you want to authenticate manually now? (y/n)"
        if ($manualAuth -eq "y") {
            gh auth login
            gh pr create --title "Client Portal Integration - Stage 1" --body-file client-portal-integration-stage1-pr.md
        }
        else {
            Write-Host "You can create the PR manually using the GitHub web interface."
            Write-Host "Use the content in client-portal-integration-stage1-pr.md for the PR description."
        }
    }
} else {
    Write-Host "GitHub CLI not installed. Please create PR manually using the content in client-portal-integration-stage1-pr.md"
    Write-Host "You can install GitHub CLI from: https://cli.github.com/"
}

# Clean up - remove token from environment
$env:GITHUB_TOKEN = $null
Write-Host "GitHub token removed from environment variables"
Write-Host "PR creation process completed"