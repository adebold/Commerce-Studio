# Stripe Webhook Setup Guide for VARAi Commerce Studio

## Overview

This guide provides step-by-step instructions for configuring Stripe webhooks to enable automated billing and token management for the Connected Apps marketplace.

## Prerequisites

- ✅ Stripe products and pricing created (completed via API integration)
- ✅ Live Stripe account with proper API keys
- ✅ VARAi Commerce Studio deployed to production
- ✅ Domain configured: `commerce-studio.varai.com`

## Step-by-Step Webhook Configuration

### Step 1: Access Stripe Dashboard

1. **Login to Stripe Dashboard**
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Login with your Stripe account credentials
   - Ensure you're in **Live mode** (not Test mode)

### Step 2: Navigate to Webhooks Section

1. **Access Webhooks**
   - In the left sidebar, click **"Developers"**
   - Click **"Webhooks"**
   - Click **"+ Add endpoint"** button

### Step 3: Configure Webhook Endpoint

1. **Set Endpoint URL**
   ```
   https://commerce-studio.varai.com/api/stripe/webhook
   ```

2. **Select Events to Listen For**
   
   **Required Events (select all of these):**
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated` 
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `customer.created`
   - ✅ `customer.updated`
   - ✅ `customer.deleted`

3. **Configure Webhook Settings**
   - **Description**: `VARAi Commerce Studio - Connected Apps Billing`
   - **API Version**: Use latest version (2023-10-16 or newer)
   - **Filter events**: Select "Select events" and choose the events listed above

### Step 4: Save and Get Webhook Secret

1. **Create Webhook**
   - Click **"Add endpoint"**
   - Stripe will create the webhook and generate a signing secret

2. **Copy Webhook Signing Secret**
   - After creation, click on your new webhook endpoint
   - In the **"Signing secret"** section, click **"Reveal"**
   - Copy the secret (starts with `whsec_`)
   - **IMPORTANT**: Save this secret securely - you'll need it for configuration

### Step 5: Update Environment Configuration

1. **Update Production Environment Variables**
   
   Add the webhook secret to your environment:
   ```bash
   # In your production environment or .env file
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

2. **Update Terraform Configuration**
   
   If using Terraform deployment, update `terraform/environments/prod/terraform.tfvars`:
   ```hcl
   stripe_webhook_secret = "whsec_your_webhook_secret_here"
   ```

### Step 6: Deploy Webhook Processing Infrastructure

1. **Deploy via Terraform (Recommended)**
   ```bash
   cd terraform
   ./deploy-stripe.sh
   ```

2. **Manual Deployment Alternative**
   
   If not using Terraform, ensure your webhook processing endpoint is deployed:
   - Endpoint: `https://commerce-studio.varai.com/api/stripe/webhook`
   - Method: `POST`
   - Authentication: Webhook signature verification
   - Processing: Handle all selected event types

### Step 7: Test Webhook Configuration

1. **Test from Stripe Dashboard**
   - In your webhook endpoint settings, click **"Send test webhook"**
   - Select `payment_intent.succeeded` event
   - Click **"Send test webhook"**
   - Verify the webhook receives a `200 OK` response

2. **Test with Real Transaction**
   - Go to your Connected Apps marketplace: `https://commerce-studio.varai.com/customer/settings.html#connected-apps`
   - Purchase a token package or subscribe to a plan
   - Verify the webhook processes the payment event

### Step 8: Monitor Webhook Activity

1. **Stripe Dashboard Monitoring**
   - Go to **Developers > Webhooks**
   - Click on your webhook endpoint
   - Monitor the **"Recent deliveries"** section
   - Check for successful deliveries (200 status codes)

2. **Application Logs**
   - Monitor your application logs for webhook processing
   - Check Google Cloud Console for Cloud Run service logs
   - Verify token allocation and customer updates

## Webhook Event Handling

### Subscription Events

**`customer.subscription.created`**
- Grants token allowance based on subscription plan
- Updates customer billing status
- Sends welcome email

**`customer.subscription.updated`**
- Adjusts token allowance for plan changes
- Updates billing cycle information
- Handles plan upgrades/downgrades

**`customer.subscription.deleted`**
- Revokes subscription token allowance
- Maintains purchased token balance
- Sends cancellation confirmation

### Payment Events

**`invoice.payment_succeeded`**
- Resets monthly token allowance for subscriptions
- Adds tokens for one-time purchases
- Updates payment history

**`invoice.payment_failed`**
- Sends payment failure notification
- Implements retry logic
- Suspends service after multiple failures

**`payment_intent.succeeded`**
- Confirms successful one-time token purchases
- Immediately adds tokens to customer account
- Sends purchase confirmation

### Customer Events

**`customer.created`**
- Links Stripe customer to VARAi account
- Sets up initial billing profile
- Configures default payment methods

**`customer.updated`**
- Syncs customer information changes
- Updates billing address and details
- Maintains data consistency

## Webhook URLs Reference

Based on your current infrastructure:

### Primary Webhook Endpoint
```
https://commerce-studio.varai.com/api/stripe/webhook
```

### Related URLs
- **Connected Apps Marketplace**: `https://commerce-studio.varai.com/customer/settings.html#connected-apps`
- **Admin Portal**: `https://commerce-studio.varai.com/admin/index.html`
- **Billing Management**: `https://commerce-studio.varai.com/api/stripe/billing`

## Security Considerations

1. **Webhook Signature Verification**
   - Always verify webhook signatures using the signing secret
   - Reject requests with invalid signatures
   - Use Stripe's official libraries for verification

2. **Idempotency**
   - Handle duplicate webhook deliveries gracefully
   - Use event IDs to prevent duplicate processing
   - Implement proper error handling and retries

3. **Rate Limiting**
   - Implement rate limiting for webhook endpoints
   - Handle high-volume webhook deliveries
   - Use queuing for complex processing

## Troubleshooting

### Common Issues

**Webhook Returns 404**
- Verify the endpoint URL is correct
- Ensure the webhook processing service is deployed
- Check DNS configuration for your domain

**Webhook Returns 500**
- Check application logs for errors
- Verify environment variables are set correctly
- Ensure database connectivity

**Events Not Processing**
- Verify webhook secret configuration
- Check signature verification logic
- Monitor application logs for processing errors

### Testing Commands

**Test Webhook Endpoint**
```bash
curl -X POST https://commerce-studio.varai.com/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

**Verify SSL Certificate**
```bash
curl -I https://commerce-studio.varai.com/api/stripe/webhook
```

## Support

For webhook configuration issues:

1. **Check Stripe Dashboard**
   - Review webhook delivery logs
   - Verify event selection
   - Check endpoint status

2. **Monitor Application Logs**
   - Google Cloud Console > Cloud Run
   - Check webhook processing logs
   - Review error messages

3. **Test Integration**
   - Use Stripe's webhook testing tools
   - Verify with small test transactions
   - Monitor token allocation in admin portal

## Next Steps

After webhook configuration:

1. ✅ **Test Payment Flows**: Verify end-to-end billing functionality
2. ✅ **Monitor Usage**: Track token consumption and billing events
3. ✅ **Set Up Alerts**: Configure monitoring for webhook failures
4. ✅ **Document Processes**: Create operational runbooks for billing management

Your Stripe webhook integration is now ready for production use with automated billing and token management for the Connected Apps marketplace.