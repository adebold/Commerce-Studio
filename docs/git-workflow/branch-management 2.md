# Branch Management Guidelines

## Branch Strategy

Our repository follows a branching strategy with the following branches:

- `main`: The production branch containing stable code
- `master`: The main development branch (synchronized with `main`)
- Feature branches: Created for specific features or fixes

## Branch Cleanup Process

To maintain a clean repository, we periodically clean up merged branches. We've created scripts to automate this process:

### Using the Cleanup Scripts

1. **For Windows users:**
   ```powershell
   ./cleanup-branches.ps1
   ```

2. **For Linux/macOS users:**
   ```bash
   ./cleanup-branches.sh
   ```

These scripts will:
1. Identify branches that have been merged into master
2. Exclude protected branches (main, master)
3. Prompt for confirmation before deletion
4. Delete the branches locally
5. Optionally delete the branches from the remote repository

### Manual Branch Cleanup

If you prefer to clean up branches manually:

1. List merged branches:
   ```bash
   git branch --merged master
   ```

2. Delete a local branch:
   ```bash
   git branch -d branch-name
   ```

3. Delete a remote branch:
   ```bash
   git push origin --delete branch-name
   ```

4. Force delete a branch (use with caution):
   ```bash
   git branch -D branch-name
   ```

## Best Practices

1. Keep the repository clean by regularly removing merged branches
2. Always ensure branches are fully merged before deletion
3. Never delete protected branches (main, master)
4. Create meaningful branch names following the convention:
   - `feature/feature-name` for new features
   - `fix/issue-description` for bug fixes
   - `docs/documentation-update` for documentation changes
5. Regularly sync your local repository with the remote to keep branch information up-to-date