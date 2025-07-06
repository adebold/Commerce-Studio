#!/bin/bash
# Shell script to create PR for Personalized Recommendations System
set -e # Exit on error

# Variables
BRANCH_NAME="feature/personalized-recommendations"
COMMIT_MESSAGE="feat(recommendations): Implement personalized recommendations system

- Add personalized product recommendations endpoint
- Add reinforcement learning signal collection endpoint
- Create recommendation service with ML integration
- Add tests and documentation

This implementation provides highly tailored product recommendations
based on customer data, preferences, and behavior using ML embeddings
and reinforcement learning signals."

echo "Creating PR for Personalized Recommendations System..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "You have uncommitted changes. Stashing them..."
    git stash
    CHANGES_STASHED=true
else
    CHANGES_STASHED=false
fi

# Get current branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

# Create and checkout new branch
echo "Creating new branch: $BRANCH_NAME"
git checkout -b $BRANCH_NAME

# Stage the files
echo "Staging files..."

# Modified files
git add src/api/routers/recommendations.py 2>/dev/null || true
git add src/api/models/recommendations.py 2>/dev/null || true

# New files
git add src/api/services/recommendation_service.py 2>/dev/null || true
git add tests/api/services/test_recommendation_service.py 2>/dev/null || true
git add docs/api/personalized-recommendations.md 2>/dev/null || true
git add docs/api/personalized-recommendations-postman.json 2>/dev/null || true
git add docs/api/personalized-recommendations-flow.md 2>/dev/null || true
git add docs/api/personalized-recommendations-next-steps.md 2>/dev/null || true
git add docs/personalized-recommendations-implementation-plan.md 2>/dev/null || true
git add docs/pr-personalized-recommendations.md 2>/dev/null || true
git add scripts/create-personalized-recommendations-pr.sh 2>/dev/null || true
git add scripts/Create-PersonalizedRecommendationsPR.ps1 2>/dev/null || true

# Commit the changes
echo "Committing changes..."
git commit -m "$COMMIT_MESSAGE"

# Push to remote
echo "Pushing to remote..."
git push -u origin $BRANCH_NAME

# Create PR using github CLI if available
if command -v gh &> /dev/null; then
    echo "Creating PR using GitHub CLI..."
    gh pr create --title "Personalized Recommendations System" --body-file docs/pr-personalized-recommendations.md
else
    echo "GitHub CLI not found. Please create PR manually."
    echo "PR description is available at: docs/pr-personalized-recommendations.md"
fi

# Switch back to original branch
echo "Switching back to $CURRENT_BRANCH"
git checkout $CURRENT_BRANCH

# Restore stashed changes if any
if [ "$CHANGES_STASHED" = true ]; then
    echo "Restoring stashed changes..."
    git stash pop
fi

echo "Done! PR created for the Personalized Recommendations System."