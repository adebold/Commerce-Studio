# PowerShell script to create PR for Personalized Recommendations System
# Exit on error
$ErrorActionPreference = "Stop"

# Variables
$BranchName = "feature/personalized-recommendations"
$CommitMessage = @"
feat(recommendations): Implement personalized recommendations system

- Add personalized product recommendations endpoint
- Add reinforcement learning signal collection endpoint
- Create recommendation service with ML integration
- Add tests and documentation

This implementation provides highly tailored product recommendations
based on customer data, preferences, and behavior using ML embeddings
and reinforcement learning signals.
"@

Write-Host "Creating PR for Personalized Recommendations System..."

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: git is not installed" -ForegroundColor Red
    exit 1
}

# Check for uncommitted changes
$hasChanges = git diff-index --quiet HEAD -- 2>$null
$ChangesStashed = $false

if ($LASTEXITCODE -ne 0) {
    Write-Host "You have uncommitted changes. Stashing them..." -ForegroundColor Yellow
    git stash
    $ChangesStashed = $true
}

# Get current branch
$CurrentBranch = git symbolic-ref --short HEAD

# Create and checkout new branch
Write-Host "Creating new branch: $BranchName" -ForegroundColor Cyan
git checkout -b $BranchName

# Stage the files
Write-Host "Staging files..." -ForegroundColor Cyan

# Modified files
git add src/api/routers/recommendations.py 2>$null
git add src/api/models/recommendations.py 2>$null

# New files
git add src/api/services/recommendation_service.py 2>$null
git add src/api/services/deepseek_service.py 2>$null
git add src/api/services/master_frame_service.py 2>$null
git add src/api/models/opticians_catalog_schemas.py 2>$null
git add tests/api/services/test_recommendation_service.py 2>$null
git add docs/api/personalized-recommendations.md 2>$null
git add docs/api/personalized-recommendations-postman.json 2>$null
git add docs/api/personalized-recommendations-flow.md 2>$null
git add docs/api/personalized-recommendations-next-steps.md 2>$null
git add docs/personalized-recommendations-implementation-plan.md 2>$null
git add docs/pr-personalized-recommendations.md 2>$null
git add scripts/create-personalized-recommendations-pr.sh 2>$null
git add scripts/Create-PersonalizedRecommendationsPR.ps1 2>$null

# Commit the changes
Write-Host "Committing changes..." -ForegroundColor Cyan
git commit -m $CommitMessage

# Push to remote
Write-Host "Pushing to remote..." -ForegroundColor Cyan
git push -u origin $BranchName

# Create PR using github CLI if available
if (Get-Command gh -ErrorAction SilentlyContinue) {
    Write-Host "Creating PR using GitHub CLI..." -ForegroundColor Cyan
    gh pr create --title "Personalized Recommendations System" --body-file docs/pr-personalized-recommendations.md
}
else {
    Write-Host "GitHub CLI not found. Please create PR manually." -ForegroundColor Yellow
    Write-Host "PR description is available at: docs/pr-personalized-recommendations.md" -ForegroundColor Yellow
}

# Switch back to original branch
Write-Host "Switching back to $CurrentBranch" -ForegroundColor Cyan
git checkout $CurrentBranch

# Restore stashed changes if any
if ($ChangesStashed) {
    Write-Host "Restoring stashed changes..." -ForegroundColor Cyan
    git stash pop
}

Write-Host "Done! PR created for the Personalized Recommendations System." -ForegroundColor Green