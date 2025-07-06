# Creating the PR Manually

Since there was an issue with the GitHub CLI authentication, you can create the PR manually by following these steps:

1. Push your changes to the remote repository:
   ```
   git push origin feature/api-usage-tracking
   ```

2. Go to your GitHub repository in a web browser.

3. Click on the "Pull requests" tab.

4. Click the "New pull request" button.

5. Set the following:
   - Base branch: `master`
   - Compare branch: `feature/api-usage-tracking`

6. Click "Create pull request".

7. Use the following title:
   ```
   Personalized Recommendations System
   ```

8. For the description, copy and paste the content from:
   ```
   docs/pr-personalized-recommendations.md
   ```

9. Add any appropriate reviewers, labels, and assignments.

10. Click "Create pull request" to submit it.

The PR description file (`docs/pr-personalized-recommendations.md`) contains a complete overview of the implementation details, which will be helpful for reviewers to understand the changes.