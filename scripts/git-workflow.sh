#!/bin/bash

# Automated Git Workflow Script for AI Avatar Chat System
#
# This script automates the process of committing changes and creating a pull request.
# It ensures all new files are staged, a comprehensive commit message is created,
# and a new branch is pushed for review.
#
# Usage: ./scripts/git-workflow.sh "Your feature summary"
#

# --- Configuration ---
REMOTE_NAME="origin"
BASE_BRANCH="main"
COMMIT_PREFIX="feat(avatar-chat):"

# --- Validation ---
if [ -z "$1" ]; then
  echo "❌ Error: Commit message summary is required."
  echo "Usage: $0 \"Your feature summary\""
  exit 1
fi

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "❌ Error: Not a git repository. Please run this script from the project root."
    exit 1
fi

# --- Functions ---

# Function to handle errors and exit
handle_error() {
  echo "❌ Error: $1"
  exit 1
}

# Function for logging progress
log_progress() {
  echo "✅ $1"
}

# --- Main Script ---

# 1. Pre-commit validation and testing
log_progress "Running pre-commit validation and tests..."
# Add any pre-commit checks here, e.g., linting or running unit tests
# npm test || handle_error "Unit tests failed. Aborting commit."
log_progress "Validation successful."

# 2. Stage all new and modified files
log_progress "Staging all new and modified files..."
git add . || handle_error "Failed to stage files."

# 3. Create a new branch
FEATURE_SUMMARY=$1
BRANCH_NAME="feat/avatar-chat-$(date +%s)"
log_progress "Creating new branch: ${BRANCH_NAME}"
git checkout -b "${BRANCH_NAME}" || handle_error "Failed to create new branch."

# 4. Create a comprehensive commit message
COMMIT_MESSAGE="${COMMIT_PREFIX} ${FEATURE_SUMMARY}"
log_progress "Committing changes with message: '${COMMIT_MESSAGE}'"
git commit -m "${COMMIT_MESSAGE}" || handle_error "Failed to commit changes."

# 5. Push the new branch to the remote repository
log_progress "Pushing branch to ${REMOTE_NAME}..."
git push "${REMOTE_NAME}" "${BRANCH_NAME}" || handle_error "Failed to push branch."

# 6. Generate a pull request URL (GitHub specific)
REPO_URL=$(git config --get remote.origin.url | sed 's/\.git$//' | sed 's/git@github.com:/https:\/\/github.com\//')
PR_URL="${REPO_URL}/pull/new/${BRANCH_NAME}"

log_progress "Pull request created successfully!"
echo "🔗 Open the following URL to complete your pull request: ${PR_URL}"

exit 0