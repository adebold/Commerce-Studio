# Stripe Terraform Integration Guide

## Overview

This guide provides comprehensive documentation for the Stripe integration module in the VARAi Commerce Studio Terraform infrastructure. The integration creates all necessary Stripe products, pricing, webhook processing, and secure key management for the Connected Apps marketplace with token-based billing.

## Architecture

The Stripe integration consists of several key components:

### 1. Stripe Products and Pricing
- **AI Services**: Virtual Try-On, Face Analysis, Recommendations, PD Calculator, Style Advisor, Inventory Optimizer
- **Token Packages**: Starter (1K tokens), Professional (10K tokens), Enterprise (unlimited)
- **One-time Purchases**: 100, 500, and 1000 token packages

### 2. Infrastructure Components
- **Google Secret Manager**: Secure storage for Stripe API keys
- **Cloud Run Service**: Webhook processing for payment events
- **Monitoring & Alerting**: Comprehensive monitoring for payment processing
- **IAM & Security**: Proper access controls and audit logging

### 3. Integration Points
- **Customer Portal**: Connected Apps marketplace interface
- **Admin Portal**: Customer management and billing administration
- **Webhook Processing**: Automated billing event handling

## File Structure

```
terraform/
├── modules/
│   └── stripe/
│       ├── main.tf          # Main Stripe resources
│       ├── variables.tf     # Input variables
│       └── outputs.tf       # Output values
├── environments/
│   └── prod/
│       ├── main.tf          # Production environment config
│       └── terraform.tfvars # Production variables
└── deploy-stripe.sh         # Deployment script
```

## Stripe Products Configuration

### AI Services (Per-Use Pricing)

| Service | Token Cost | Description |
|---------|------------|-------------|
| Virtual Try-On | 5 tokens | AI-powered virtual eyewear fitting |
| Face Analysis | 3 tokens | Facial feature analysis for recommendations |
| Recommendations | 2 tokens | Personalized eyewear suggestions |
| PD Calculator | 1 token | Pupillary distance measurement |
| Style Advisor | 4 tokens | Style consultation and advice |
| Inventory Optimizer | 10 tokens | Inventory management optimization |

### Subscription Plans

| Plan | Monthly Price | Token Allowance | Target Audience |
|------|---------------|-----------------|-----------------|
| Starter | $29 | 1,000 tokens | Small retailers |
| Professional | $199 | 10,000 tokens | Medium businesses |
| Enterprise | $999 | Unlimited | Large enterprises |

### One-Time Token Packages

| Package | Price | Tokens | Use Case |
|---------|-------|--------|----------|
| Small | $10 | 100 tokens | Trial/testing |
| Medium | $45 | 500 tokens | Short-term projects |
| Large | $80 | 1,000 tokens | Extended usage |

## Deployment Instructions

### Prerequisites

1. **Terraform Installation**
   ```bash
   # Install Terraform (macOS)
   brew install terraform
   
   # Verify installation
   terraform --version
   ```

2. **Google Cloud SDK**
   ```bash
   # Install gcloud CLI
   curl https://sdk.cloud.google.com | bash
   
   # Authenticate
   gcloud auth login
   gcloud config set project varai-commerce-studio
   ```

3. **Stripe Account Setup**
   - Create Stripe account at https://stripe.com
   - Obtain live API keys from Stripe Dashboard
   - Configure webhook endpoints (will be provided after deployment)

### Environment Configuration

1. **Update terraform.tfvars**
   ```hcl
   # Update with your actual values
   stripe_publishable_key = "pk_live_your_publishable_key"
   stripe_secret_key = "rk_live_your_secret_key"
   gcp_project_id = "your-project-id"
   domain_name = "your-domain.com"
   ```

2. **Set Environment Variables (Optional)**
   ```bash
   export STRIPE_PUBLISHABLE_KEY="pk_live_your_publishable_key"
   export STRIPE_SECRET_KEY="rk_live_your_secret_key"
   ```

### Deployment Process

1. **Run Deployment Script**
   ```bash
   cd terraform
   ./deploy-stripe.sh
   ```

2. **Manual Deployment (Alternative)**
   ```bash
   cd terraform/environments/prod
   
   # Initialize Terraform
   terraform init
   
   # Plan deployment
   terraform plan -var-file=terraform.tfvars
   
   # Apply changes
   terraform apply -var-file=terraform.tfvars
   ```

### Post-Deployment Configuration

1. **Configure Stripe Webhooks**
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Test Integration**
   - Access Connected Apps: `https://your-domain.com/customer/settings.html#connected-apps`
   - Test token purchase flow
   - Verify webhook processing in Cloud Run logs

## Security Considerations

### API Key Management
- Stripe keys stored in Google Secret Manager with KMS encryption
- IAM policies restrict access to authorized service accounts
- Audit logging enabled for all secret access

### Webhook Security
- Webhook signature verification using Stripe webhook secret
- HTTPS-only communication
- Rate limiting and DDoS protection via Cloud Run

### Access Controls
- Service accounts with minimal required permissions
- Network security groups restricting access
- Regular security audits and key rotation

## Monitoring and Alerting

### Metrics Tracked
- Payment success/failure rates
- Webhook processing latency
- Token usage patterns
- Revenue metrics
- Error rates and types

### Alert Policies
- Payment processing failures
- Webhook endpoint downtime
- High error rates
- Unusual usage patterns
- Security incidents

### Dashboards
- Real-time payment processing metrics
- Customer usage analytics
- Revenue tracking
- System health monitoring

## Troubleshooting

### Common Issues

1. **Webhook Failures**
   ```bash
   # Check Cloud Run logs
   gcloud logs read --service=stripe-webhook-processor --limit=50
   
   # Verify webhook endpoint
   curl -X POST https://your-domain.com/api/stripe/webhook
   ```

2. **Authentication Errors**
   ```bash
   # Verify Stripe keys in Secret Manager
   gcloud secrets versions access latest --secret="stripe-secret-key"
   
   # Check IAM permissions
   gcloud projects get-iam-policy varai-commerce-studio
   ```

3. **Terraform Deployment Issues**
   ```bash
   # Check Terraform state
   terraform show
   
   # Refresh state
   terraform refresh
   
   # Force unlock if needed
   terraform force-unlock LOCK_ID
   ```

### Debug Commands

```bash
# Check Stripe products
terraform output stripe_product_ids

# Verify webhook URL
terraform output stripe_webhook_url

# Test connectivity
curl -I https://your-domain.com/api/stripe/webhook

# Check service health
gcloud run services describe stripe-webhook-processor --region=us-central1
```

## Maintenance

### Regular Tasks

1. **Key Rotation** (Quarterly)
   - Generate new Stripe API keys
   - Update Secret Manager secrets
   - Deploy updated configuration

2. **Monitoring Review** (Monthly)
   - Review alert policies
   - Analyze usage patterns
   - Update pricing if needed

3. **Security Audit** (Annually)
   - Review IAM permissions
   - Audit access logs
   - Update security policies

### Backup and Recovery

1. **Terraform State Backup**
   ```bash
   # Backup state file
   gsutil cp gs://varai-terraform-state-prod/terraform/state/default.tfstate ./backup/
   ```

2. **Configuration Backup**
   ```bash
   # Backup Stripe configuration
   terraform output -json > stripe-config-backup.json
   ```

## Cost Optimization

### Resource Optimization
- Cloud Run auto-scaling based on demand
- Secret Manager pay-per-use pricing
- Monitoring costs optimized with retention policies

### Pricing Strategy
- Regular review of token pricing
- Volume discounts for enterprise customers
- Promotional pricing for new customers

## Integration Testing

### Test Scenarios

1. **Payment Flow Testing**
   ```javascript
   // Test token purchase
   const response = await fetch('/api/stripe/create-payment-intent', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       amount: 2900, // $29.00 for Starter plan
       currency: 'usd',
       customer_id: 'cus_test123'
     })
   });
   ```

2. **Webhook Testing**
   ```bash
   # Use Stripe CLI for webhook testing
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   stripe trigger payment_intent.succeeded
   ```

3. **Load Testing**
   ```bash
   # Test webhook endpoint performance
   ab -n 1000 -c 10 https://your-domain.com/api/stripe/webhook
   ```

## Support and Documentation

### Resources
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Google Cloud Terraform Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)

### Contact Information
- **Technical Support**: tech-support@varai.com
- **Billing Questions**: billing@varai.com
- **Emergency Contact**: emergency@varai.com

## Changelog

### Version 1.0.0 (Current)
- Initial Stripe integration implementation
- Complete product and pricing setup
- Webhook processing infrastructure
- Security and monitoring configuration

### Planned Updates
- Multi-currency support
- Advanced analytics dashboard
- Automated pricing optimization
- Enhanced fraud detection

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: VARAi Development Team