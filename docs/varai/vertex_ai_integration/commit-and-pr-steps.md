# Git Commands for Committing Changes and Creating a PR

Follow these commands to commit your changes, push them to GitHub, and create a pull request.

## Step 1: Create a Feature Branch

First, create a new branch for your changes:

```bash
# Ensure you're starting from the main branch
git checkout main

# Pull the latest changes
git pull origin main

# Create and checkout a new feature branch
git checkout -b feat/monitoring-testing
```

## Step 2: Add the Changes

Add all the modified files to the staging area:

```bash
# Add the new files
git add src/varai/vertex_ai_integration/tests/utils/test-helpers.ts
git add src/varai/vertex_ai_integration/tests/hybrid-orchestrator.test.ts
git add src/varai/vertex_ai_integration/tests/domain-handlers.test.ts
git add src/varai/vertex_ai_integration/utils/logger.ts
git add src/varai/vertex_ai_integration/middleware/monitoring.ts
git add src/varai/vertex_ai_integration/utils/metrics-dashboard/index.html
git add src/varai/vertex_ai_integration/utils/interactive-demo.ts

# Add modified files
git add src/varai/vertex_ai_integration/package.json
git add src/varai/vertex_ai_integration/index.ts

# Verify that all changes are staged
git status
```

## Step 3: Commit the Changes

Commit the changes with a descriptive message:

```bash
# Copy the commit message from the prepared file
git commit -m "$(cat docs/varai/vertex_ai_integration/commit-message.md)"

# Alternatively, you can use the message directly
git commit -m "feat(monitoring): Add comprehensive testing, monitoring, and demo capabilities

Implement robust monitoring, testing, and demonstration features for the Vertex AI Integration project:

- Add structured logging system with Winston
- Create performance metrics middleware for API monitoring
- Implement interactive CLI demo with rich visual formatting
- Build real-time metrics dashboard with visualizations
- Add comprehensive tests for hybrid orchestrator and domain handlers
- Enhance error handling and implement graceful degradation
- Update dependencies and add required type definitions

This PR significantly improves observability, developer experience, and production readiness. It allows for better debugging, performance tracking, and demonstration of the integration's capabilities.

Implements #XXX - Monitoring and Testing requirements"
```

## Step 4: Push the Changes to GitHub

Push your branch to the remote repository:

```bash
git push -u origin feat/monitoring-testing
```

## Step 5: Create a Pull Request

1. Go to the GitHub repository in your browser
2. You should see a notification about your recently pushed branch with a "Compare & pull request" button
3. Click that button
4. Fill in the PR details:
   - Title: "Add comprehensive testing, monitoring, and demo capabilities"
   - Description: Copy the content from `docs/varai/vertex_ai_integration/pr-monitoring-testing.md`
5. Assign reviewers if applicable
6. Click "Create pull request"

## Optional: Update the PR Number

After creating the PR, GitHub will assign it a number. You may want to update your commit message with the actual PR number:

```bash
# Replace XXX with the actual PR number in your documentation
sed -i 's/#XXX/#123/g' docs/varai/vertex_ai_integration/pr-monitoring-testing.md
git add docs/varai/vertex_ai_integration/pr-monitoring-testing.md
git commit --amend --no-edit
git push -f origin feat/monitoring-testing
```

Note: This will modify your commit and require a force push, which should be used with caution, especially on shared branches.
