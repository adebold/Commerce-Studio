# Stripe Setup Guide for VARAi Connected Apps

## Prerequisites

1. **Stripe Account**: Create a Stripe account at https://stripe.com
2. **Stripe Dashboard Access**: You'll need access to create products, prices, and webhooks

## Step 1: Create Stripe Products and Prices

### 1.1 Create Subscription Products

In your Stripe Dashboard:

1. Go to **Products** → **Add Product**
2. Create these three subscription products:

**Starter Plan**
- Name: "VARAi Starter Plan"
- Description: "1,000 tokens per month"
- Pricing: $29/month recurring
- Product ID: `prod_starter_tokens`
- Price ID: `price_starter_monthly`

**Professional Plan**
- Name: "VARAi Professional Plan"
- Description: "10,000 tokens per month"
- Pricing: $199/month recurring
- Product ID: `prod_professional_tokens`
- Price ID: `price_professional_monthly`

**Enterprise Plan**
- Name: "VARAi Enterprise Plan"
- Description: "Unlimited tokens per month"
- Pricing: $999/month recurring
- Product ID: `prod_enterprise_tokens`
- Price ID: `price_enterprise_monthly`

### 1.2 Create One-Time Token Packages

Create these one-time purchase products:

**1,000 Token Package**
- Name: "1,000 AI Tokens"
- Description: "One-time purchase of 1,000 tokens"
- Pricing: $39 one-time
- Price ID: `price_tokens_1k`

**5,000 Token Package**
- Name: "5,000 AI Tokens"
- Description: "One-time purchase of 5,000 tokens"
- Pricing: $179 one-time
- Price ID: `price_tokens_5k`

**10,000 Token Package**
- Name: "10,000 AI Tokens"
- Description: "One-time purchase of 10,000 tokens"
- Pricing: $329 one-time
- Price ID: `price_tokens_10k`

## Step 2: Get Your API Keys

1. Go to **Developers** → **API Keys**
2. Copy your **Publishable Key** (starts with `pk_`)
3. Copy your **Secret Key** (starts with `sk_`)
4. For production, use live keys; for testing, use test keys

## Step 3: Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. Set endpoint URL to: `https://your-domain.com/api/stripe/webhook`
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Copy the **Webhook Secret** (starts with `whsec_`)

## Step 4: Configure Environment Variables

1. Copy [`website/.env.example`](website/.env.example) to `website/.env`
2. Fill in your actual Stripe values:

```bash
# Copy the example file
cp website/.env.example website/.env

# Edit with your values
nano website/.env
```

Update these values in your `.env` file:
- `STRIPE_PUBLISHABLE_KEY`: Your publishable key from Step 2
- `STRIPE_SECRET_KEY`: Your secret key from Step 2
- `STRIPE_WEBHOOK_SECRET`: Your webhook secret from Step 3
- All the product and price IDs from Step 1

## Step 5: Test the Integration

### 5.1 Test Mode Setup
1. Use test API keys (starting with `pk_test_` and `sk_test_`)
2. Use test card numbers:
   - Success: `4242424242424242`
   - Decline: `4000000000000002`

### 5.2 Test Scenarios
1. **Subscription Creation**: Test signing up for each plan
2. **Token Purchase**: Test buying token packages
3. **Webhook Processing**: Verify webhooks are received and processed
4. **Usage Tracking**: Test token consumption and balance updates

## Step 6: Production Deployment

### 6.1 Switch to Live Mode
1. Replace test keys with live keys in your `.env` file
2. Update webhook endpoint to production URL
3. Verify all product IDs match your live products

### 6.2 Security Checklist
- [ ] Environment variables are properly secured
- [ ] Webhook signatures are verified
- [ ] API keys are not exposed in client-side code
- [ ] HTTPS is enabled for all endpoints
- [ ] Database connections are encrypted

## Step 7: Monitoring and Maintenance

### 7.1 Stripe Dashboard Monitoring
- Monitor subscription metrics
- Track failed payments
- Review webhook delivery status
- Analyze revenue trends

### 7.2 Application Monitoring
- Monitor token usage patterns
- Track API response times
- Set up alerts for failed payments
- Monitor webhook processing errors

## Troubleshooting

### Common Issues

**Webhook Not Receiving Events**
- Verify endpoint URL is correct and accessible
- Check webhook secret matches your environment variable
- Ensure your server responds with 200 status code

**Payment Failures**
- Check customer's payment method is valid
- Verify subscription is active
- Review Stripe logs for detailed error messages

**Token Balance Issues**
- Verify webhook processing is working correctly
- Check database token balance updates
- Ensure usage tracking is accurate

### Support Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [VARAi Technical Support](mailto:support@varai.com)

## Next Steps

After completing this setup:

1. **Test thoroughly** in test mode before going live
2. **Monitor closely** during initial production deployment
3. **Set up alerts** for critical payment events
4. **Review regularly** to optimize pricing and features

The Connected Apps marketplace is now ready for production use with full Stripe integration!