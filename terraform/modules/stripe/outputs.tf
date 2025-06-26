# Outputs for Stripe Integration Module

# Product IDs
output "stripe_product_ids" {
  description = "Map of Stripe product IDs for AI services"
  value = {
    virtual_try_on      = stripe_product.virtual_try_on.id
    face_analysis       = stripe_product.face_analysis.id
    recommendations     = stripe_product.recommendations.id
    pd_calculator       = stripe_product.pd_calculator.id
    style_advisor       = stripe_product.style_advisor.id
    inventory_optimizer = stripe_product.inventory_optimizer.id
    starter_tokens      = stripe_product.starter_tokens.id
    professional_tokens = stripe_product.professional_tokens.id
    enterprise_tokens   = stripe_product.enterprise_tokens.id
  }
}

# Price IDs
output "stripe_price_ids" {
  description = "Map of Stripe price IDs for subscription plans"
  value = {
    starter_monthly      = stripe_price.starter_tokens_price.id
    professional_monthly = stripe_price.professional_tokens_price.id
    enterprise_monthly   = stripe_price.enterprise_tokens_price.id
    tokens_100_onetime   = stripe_price.tokens_100_onetime.id
    tokens_500_onetime   = stripe_price.tokens_500_onetime.id
    tokens_1000_onetime  = stripe_price.tokens_1000_onetime.id
  }
}

# Webhook Configuration
output "stripe_webhook_endpoint" {
  description = "Stripe webhook endpoint configuration"
  value = {
    id     = stripe_webhook_endpoint.varai_webhook.id
    url    = stripe_webhook_endpoint.varai_webhook.url
    secret = stripe_webhook_endpoint.varai_webhook.secret
  }
  sensitive = true
}

# Secret Manager Secret Names
output "stripe_secret_names" {
  description = "Google Secret Manager secret names for Stripe keys"
  value = {
    publishable_key = google_secret_manager_secret.stripe_publishable_key.secret_id
    secret_key      = google_secret_manager_secret.stripe_secret_key.secret_id
    webhook_secret  = google_secret_manager_secret.stripe_webhook_secret.secret_id
  }
}

# Cloud Run Service
output "webhook_processor_service" {
  description = "Stripe webhook processor Cloud Run service details"
  value = {
    name = google_cloud_run_service.stripe_webhook_processor.name
    url  = google_cloud_run_service.stripe_webhook_processor.status[0].url
  }
}

# Monitoring Resources
output "monitoring_resources" {
  description = "Monitoring resources for Stripe integration"
  value = var.enable_monitoring ? {
    webhook_error_alert_policy = google_monitoring_alert_policy.stripe_webhook_errors[0].id
    payment_success_metric     = google_logging_metric.stripe_payment_success[0].id
    payment_failed_metric      = google_logging_metric.stripe_payment_failed[0].id
  } : {}
}

# Token Pricing Configuration
output "token_pricing_config" {
  description = "Token pricing configuration for frontend integration"
  value = {
    ai_service_costs = var.ai_service_costs
    subscription_plans = {
      starter = {
        price_id    = stripe_price.starter_tokens_price.id
        price_cents = var.token_pricing.starter.monthly_price
        tokens      = var.token_pricing.starter.token_count
      }
      professional = {
        price_id    = stripe_price.professional_tokens_price.id
        price_cents = var.token_pricing.professional.monthly_price
        tokens      = var.token_pricing.professional.token_count
      }
      enterprise = {
        price_id    = stripe_price.enterprise_tokens_price.id
        price_cents = var.token_pricing.enterprise.monthly_price
        tokens      = var.token_pricing.enterprise.token_count
      }
    }
    one_time_packages = [
      {
        price_id    = stripe_price.tokens_100_onetime.id
        price_cents = var.token_pricing.one_time_packages[0].price
        tokens      = var.token_pricing.one_time_packages[0].token_count
      },
      {
        price_id    = stripe_price.tokens_500_onetime.id
        price_cents = var.token_pricing.one_time_packages[1].price
        tokens      = var.token_pricing.one_time_packages[1].token_count
      },
      {
        price_id    = stripe_price.tokens_1000_onetime.id
        price_cents = var.token_pricing.one_time_packages[2].price
        tokens      = var.token_pricing.one_time_packages[2].token_count
      }
    ]
  }
}

# Environment Configuration
output "environment_config" {
  description = "Environment-specific configuration for Stripe integration"
  value = {
    environment = var.environment
    domain_name = var.domain_name
    project_id  = var.project_id
    region      = var.region
  }
}

# Integration URLs
output "integration_urls" {
  description = "URLs for Stripe integration endpoints"
  value = {
    webhook_url           = "https://${var.domain_name}/api/stripe/webhook"
    customer_portal_url   = "https://${var.domain_name}/customer/settings.html#connected-apps"
    admin_portal_url      = "https://${var.domain_name}/admin/index.html"
    billing_management_url = "https://${var.domain_name}/api/stripe/billing"
  }
}

# Service Account Information
output "service_account_config" {
  description = "Service account configuration for Stripe integration"
  value = {
    cloud_run_service_account = var.cloud_run_service_account
    authorized_members        = var.service_accounts
  }
}