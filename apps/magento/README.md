# VARAi Magento Integration

This module integrates Magento with the VARAi platform, providing advanced eyewear virtual try-on, style recommendations, and analytics capabilities.

## Features

- **Virtual Try-On**: Allow customers to virtually try on eyewear products
- **Style Recommendations**: Provide personalized product recommendations based on style preferences
- **Style Scoring**: Evaluate products based on style metrics
- **Analytics**: Track customer interactions and product performance
- **Caching**: Improved performance with robust caching mechanisms
- **Enhanced Error Handling**: Better error reporting and logging

## Installation

### Manual Installation

1. Copy the module files to your Magento installation:
   ```bash
   cp -r VARAi_Core app/code/VARAi/Core
   ```

2. Enable the module:
   ```bash
   bin/magento module:enable VARAi_Core
   bin/magento setup:upgrade
   bin/magento setup:di:compile
   bin/magento setup:static-content:deploy -f
   bin/magento cache:clean
   ```

3. Configure the module in the Magento admin panel:
   - Go to Stores > Configuration > VARAi > Settings
   - Enter your API key and configure other settings

### Composer Installation

1. Add the repository to your `composer.json`:
   ```bash
   composer config repositories.varai vcs https://github.com/yourusername/varai-magento
   ```

2. Require the module:
   ```bash
   composer require varai/magento-integration
   ```

3. Enable the module:
   ```bash
   bin/magento module:enable VARAi_Core
   bin/magento setup:upgrade
   bin/magento setup:di:compile
   bin/magento setup:static-content:deploy -f
   bin/magento cache:clean
   ```

## Configuration

### API Settings

- **Enable VARAi**: Enable/disable the module
- **API Key**: Your VARAi API key
- **API URL**: VARAi API endpoint (default: https://api.varai.ai/v1)
- **Cache Lifetime**: Duration to cache API responses (in seconds)

### Virtual Try-On Settings

- **Enable Virtual Try-On**: Enable/disable virtual try-on functionality
- **Button Text**: Text to display on the try-on button
- **Button Position**: Where to display the try-on button
- **Enable by Default**: Whether to enable try-on for new products by default

### Recommendations Settings

- **Enable Recommendations**: Enable/disable product recommendations
- **Number of Recommendations**: How many products to recommend
- **Recommendation Type**: Type of recommendations to display
- **Minimum Style Score**: Only recommend products with style score above this value
- **Use Recommendation Tags**: Use tags for improved recommendation matching

### Analytics Settings

- **Enable Analytics**: Enable/disable analytics tracking
- **GA4 Measurement ID**: Google Analytics 4 measurement ID
- **Track Product Views**: Track when products are viewed
- **Track Virtual Try-Ons**: Track when virtual try-on is used
- **Track Recommendations**: Track recommendation impressions and clicks
- **Enable Detailed Logging**: Enable verbose logging for debugging

## AWS Infrastructure

This module is deployed on AWS using:
- ECS (Elastic Container Service) for running Magento
- RDS for MySQL database
- ElastiCache for Redis
- OpenSearch for search functionality
- CloudFormation for infrastructure as code

## Automated Deployment

The module uses GitHub Actions for automated deployment to AWS. The workflow:

1. Triggers on:
   - Push to `main` (production)
   - Push to `staging`
   - Pull requests affecting `apps/magento/**`

2. Deployment Process:
   - Builds Docker image
   - Pushes to ECR
   - Deploys CloudFormation stack
   - Updates ECS service
   - Runs health checks
   - Notifies on Slack

## Required Secrets

Add these to GitHub repository secrets:

```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
DB_PASSWORD=your_db_password
MAGENTO_ADMIN_EMAIL=admin@example.com
MAGENTO_ADMIN_PASSWORD=your_admin_password
SLACK_WEBHOOK_URL=your_slack_webhook
VARAI_API_KEY=your_varai_api_key
```

## Development Workflow

1. Create feature branch:
```bash
git checkout -b feature/your-feature
```

2. Make changes and commit:
```bash
git add .
git commit -m "feat: your feature description"
```

3. Push and create PR:
```bash
git push origin feature/your-feature
# Create PR on GitHub
```

4. Automated steps:
   - GitHub Actions runs tests
   - Deploys to staging ECS cluster
   - Notifies on Slack
   - Rolls back automatically if issues occur

5. After PR approval:
   - Merges to main
   - Deploys to production ECS cluster
   - Verifies deployment
   - Notifies on Slack

## Testing

Run the unit tests:

```bash
cd dev/tests/unit
../../../vendor/bin/phpunit --testsuite "VARAi_Core"
```

Run integration tests:

```bash
cd dev/tests/integration
../../../vendor/bin/phpunit --testsuite "VARAi_Core"
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Verify API key is correct
   - Check network connectivity
   - Ensure API URL is correct

2. **Virtual Try-On Not Displaying**:
   - Check if product has try-on enabled
   - Verify 3D model is available
   - Check browser console for JavaScript errors

3. **Recommendations Not Showing**:
   - Ensure recommendations are enabled
   - Check if product has style score
   - Verify recommendation tags are set

4. **Cache Issues**:
   - Clear Magento cache
   - Flush VARAi API cache
   - Check Redis connection

### Debugging

Enable detailed logging in the VARAi settings to get more information about API calls and errors.

View logs in:
- `var/log/varai.log`
- `var/log/system.log`
- `var/log/exception.log`

## Support

For technical support:
- Email: support@varai.ai
- Documentation: https://docs.varai.ai/magento
- GitHub Issues: https://github.com/varai/magento-integration/issues

## Security

1. Network:
   - VPC with public/private subnets
   - Security groups for each service
   - WAF protection
   - SSL/TLS encryption

2. Access:
   - IAM roles and policies
   - Least privilege principle
   - Encrypted secrets
   - Secure key rotation

3. Monitoring:
   - CloudWatch alarms
   - AWS Config rules
   - GuardDuty enabled
   - Security Hub integration
