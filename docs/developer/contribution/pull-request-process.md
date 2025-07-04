# Pull Request Process

This document outlines the process for submitting and reviewing pull requests (PRs) for the VARAi platform. Following these guidelines ensures a smooth and efficient contribution process.

## Overview

Pull requests are the primary method for contributing code changes to the VARAi platform. The PR process ensures that all changes are reviewed, tested, and meet the project's quality standards before being merged into the main codebase.

## Prerequisites

Before creating a pull request, ensure that:

1. You have a GitHub account
2. You have forked the repository
3. You have set up your [development environment](../environment/local-development-guide.md)
4. You have created a branch for your changes
5. Your changes follow the [code style guide](./code-style-guide.md)
6. Your changes include appropriate tests
7. Your changes include appropriate documentation

## Step-by-Step Process

### 1. Create a Branch

Create a branch for your changes with a descriptive name:

```bash
git checkout -b feature/add-face-shape-detection
```

Branch naming conventions:
- `feature/` - For new features
- `bugfix/` - For bug fixes
- `docs/` - For documentation changes
- `refactor/` - For code refactoring
- `test/` - For adding or modifying tests

### 2. Make Changes

Make your changes following the [code style guide](./code-style-guide.md). Ensure that:

- Your code is well-documented
- You've added appropriate tests
- You've updated any relevant documentation

### 3. Commit Changes

Commit your changes with a descriptive commit message:

```bash
git add .
git commit -m "Add face shape detection algorithm with 95% accuracy"
```

Commit message guidelines:
- Use the imperative mood ("Add" not "Added")
- Start with a capital letter
- Do not end with a period
- Keep the first line under 50 characters
- Provide more details in the commit body if necessary
- Reference issues or tickets in the commit body

### 4. Push Changes

Push your changes to your fork:

```bash
git push origin feature/add-face-shape-detection
```

### 5. Create Pull Request

Create a pull request from your branch to the main repository:

1. Go to the [VARAi repository](https://github.com/varai/varai-platform)
2. Click "Pull requests"
3. Click "New pull request"
4. Click "compare across forks"
5. Select your fork and branch
6. Click "Create pull request"

### 6. Fill Pull Request Template

Fill out the pull request template with the following information:

```markdown
## Description
Brief description of the changes

## Related Issues
Fixes #123

## Type of Change
- [ ] Bug fix
- [x] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
- [x] Unit tests
- [x] Integration tests
- [ ] Manual tests

## Checklist
- [x] My code follows the code style of this project
- [x] I have added tests to cover my changes
- [x] All new and existing tests passed
- [x] I have updated the documentation
- [ ] My changes require a change to the dependencies
```

### 7. Wait for CI/CD

After creating the pull request, the CI/CD pipeline will automatically run to verify your changes. Ensure that all checks pass before requesting a review.

### 8. Request Review

Request a review from the appropriate team members:

1. Click on the "Reviewers" section on the right side of the PR
2. Select the appropriate reviewers based on the code owners file
3. Add any additional reviewers who might have context or expertise

### 9. Address Feedback

After receiving feedback from reviewers:

1. Make the requested changes
2. Push the changes to your branch
3. Respond to the comments indicating that you've addressed the feedback

### 10. Merge Pull Request

Once your pull request has been approved and all checks pass:

1. If you have merge permissions, you can merge the PR yourself
2. If not, a maintainer will merge it for you
3. Choose the appropriate merge strategy (usually "Squash and merge")
4. Delete the branch after merging

## Pull Request Checklist

Use this checklist to ensure your pull request is ready for review:

- [ ] The PR has a descriptive title
- [ ] The PR description includes the purpose of the changes
- [ ] The PR references any related issues
- [ ] The code follows the project's style guide
- [ ] Tests have been added or updated
- [ ] Documentation has been updated
- [ ] The CI/CD pipeline passes
- [ ] The changes have been tested locally
- [ ] The branch is up to date with the target branch

## Pull Request Size Guidelines

To facilitate efficient code reviews, we recommend the following guidelines for PR size:

- **Small PRs (recommended)**: Less than 200 lines of code changed
- **Medium PRs**: 200-500 lines of code changed
- **Large PRs (avoid if possible)**: More than 500 lines of code changed

If your changes require a large PR, consider breaking it down into smaller, logically separated PRs.

## Review Process

The review process typically follows these steps:

1. **Automated Checks**: CI/CD pipeline verifies build, tests, and code quality
2. **Initial Review**: Reviewers provide initial feedback
3. **Revisions**: You address the feedback and push changes
4. **Final Review**: Reviewers approve the changes
5. **Merge**: The PR is merged into the target branch

## Common Pull Request Issues

### 1. Merge Conflicts

If your PR has merge conflicts:

1. Merge the target branch into your branch:
   ```bash
   git fetch upstream
   git merge upstream/main
   ```
2. Resolve the conflicts
3. Commit and push the changes

### 2. Failed CI/CD Checks

If CI/CD checks fail:

1. Review the failure logs
2. Fix the issues locally
3. Push the changes
4. Wait for the checks to run again

### 3. Stale Pull Requests

If your PR becomes stale (no activity for 2+ weeks):

1. Update your branch with the latest changes from the target branch
2. Push the updates
3. Comment on the PR to indicate it's been updated

## Next Steps

After your pull request is merged:

1. Delete your local branch:
   ```bash
   git checkout main
   git branch -d feature/add-face-shape-detection
   ```
2. Keep your fork up to date:
   ```bash
   git fetch upstream
   git merge upstream/main
   git push origin main
   ```
3. Celebrate your contribution to the VARAi platform!

For more information on the code review process, see the [Code Review Guidelines](./code-review-guidelines.md).