# Stripe Integration Module for VARAi Commerce Studio
# Manages Stripe products, pricing, webhooks, and secrets integration with GCP

terraform {
  required_providers {
    stripe = {
      source  = "franckverrot/stripe"
      version = "~> 1.9.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

# Stripe Products for Connected Apps
resource "stripe_product" "virtual_try_on" {
  name        = "Virtual Try-On AI"
  description = "AI-powered virtual try-on for eyewear with face shape analysis"
  type        = "service"
  
  metadata = {
    service_type = "ai_service"
    token_cost   = "5"
    category     = "virtual_try_on"
    environment  = var.environment
  }
}

resource "stripe_product" "face_analysis" {
  name        = "Face Shape Analysis"
  description = "Advanced facial feature detection and shape analysis"
  type        = "service"
  
  metadata = {
    service_type = "ai_service"
    token_cost   = "3"
    category     = "face_analysis"
    environment  = var.environment
  }
}

resource "stripe_product" "recommendations" {
  name        = "AI Recommendations"
  description = "Personalized eyewear recommendations based on preferences"
  type        = "service"
  
  metadata = {
    service_type = "ai_service"
    token_cost   = "2"
    category     = "recommendations"
    environment  = var.environment
  }
}

resource "stripe_product" "pd_calculator" {
  name        = "PD Calculator"
  description = "Pupillary distance measurement using computer vision"
  type        = "service"
  
  metadata = {
    service_type = "ai_service"
    token_cost   = "1"
    category     = "pd_calculator"
    environment  = var.environment
  }
}

resource "stripe_product" "style_advisor" {
  name        = "Style Advisor"
  description = "AI-powered style consultation and trend analysis"
  type        = "service"
  
  metadata = {
    service_type = "ai_service"
    token_cost   = "4"
    category     = "style_advisor"
    environment  = var.environment
  }
}

resource "stripe_product" "inventory_optimizer" {
  name        = "Inventory Optimizer"
  description = "AI-driven inventory management and demand forecasting"
  type        = "service"
  
  metadata = {
    service_type = "ai_service"
    token_cost   = "10"
    category     = "inventory_optimizer"
    environment  = var.environment
  }
}

# Token Packages
resource "stripe_product" "starter_tokens" {
  name        = "Starter Token Package"
  description = "1,000 AI service tokens for small businesses"
  type        = "service"
  
  metadata = {
    service_type = "token_package"
    token_count  = "1000"
    tier         = "starter"
    environment  = var.environment
  }
}

resource "stripe_product" "professional_tokens" {
  name        = "Professional Token Package"
  description = "10,000 AI service tokens for growing businesses"
  type        = "service"
  
  metadata = {
    service_type = "token_package"
    token_count  = "10000"
    tier         = "professional"
    environment  = var.environment
  }
}

resource "stripe_product" "enterprise_tokens" {
  name        = "Enterprise Token Package"
  description = "Unlimited AI service tokens for enterprise customers"
  type        = "service"
  
  metadata = {
    service_type = "token_package"
    token_count  = "unlimited"
    tier         = "enterprise"
    environment  = var.environment
  }
}

# Pricing for Token Packages
resource "stripe_price" "starter_tokens_price" {
  product     = stripe_product.starter_tokens.id
  unit_amount = 2900  # $29.00
  currency    = "usd"
  
  recurring {
    interval = "month"
  }
  
  metadata = {
    tier        = "starter"
    token_count = "1000"
    environment = var.environment
  }
}

resource "stripe_price" "professional_tokens_price" {
  product     = stripe_product.professional_tokens.id
  unit_amount = 19900  # $199.00
  currency    = "usd"
  
  recurring {
    interval = "month"
  }
  
  metadata = {
    tier        = "professional"
    token_count = "10000"
    environment = var.environment
  }
}

resource "stripe_price" "enterprise_tokens_price" {
  product     = stripe_product.enterprise_tokens.id
  unit_amount = 99900  # $999.00
  currency    = "usd"
  
  recurring {
    interval = "month"
  }
  
  metadata = {
    tier        = "enterprise"
    token_count = "unlimited"
    environment = var.environment
  }
}

# One-time Token Purchases
resource "stripe_price" "tokens_100_onetime" {
  product     = stripe_product.starter_tokens.id
  unit_amount = 500   # $5.00
  currency    = "usd"
  
  metadata = {
    type        = "one_time"
    token_count = "100"
    environment = var.environment
  }
}

resource "stripe_price" "tokens_500_onetime" {
  product     = stripe_product.professional_tokens.id
  unit_amount = 2000  # $20.00
  currency    = "usd"
  
  metadata = {
    type        = "one_time"
    token_count = "500"
    environment = var.environment
  }
}

resource "stripe_price" "tokens_1000_onetime" {
  product     = stripe_product.professional_tokens.id
  unit_amount = 3500  # $35.00
  currency    = "usd"
  
  metadata = {
    type        = "one_time"
    token_count = "1000"
    environment = var.environment
  }
}

# Webhook Endpoint for GCP Cloud Run
resource "stripe_webhook_endpoint" "varai_webhook" {
  url = "https://${var.domain_name}/api/stripe/webhook"
  
  enabled_events = [
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "customer.created",
    "customer.updated",
    "customer.deleted"
  ]
  
  metadata = {
    environment = var.environment
    service     = "varai_commerce_studio"
  }
}

# Store Stripe secrets in Google Secret Manager
resource "google_secret_manager_secret" "stripe_publishable_key" {
  project   = var.project_id
  secret_id = "stripe-publishable-key-${var.environment}"
  
  labels = {
    environment = var.environment
    managed_by  = "terraform"
    service     = "stripe"
  }

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "stripe_publishable_key" {
  secret      = google_secret_manager_secret.stripe_publishable_key.id
  secret_data = var.stripe_publishable_key
}

resource "google_secret_manager_secret" "stripe_secret_key" {
  project   = var.project_id
  secret_id = "stripe-secret-key-${var.environment}"
  
  labels = {
    environment = var.environment
    managed_by  = "terraform"
    service     = "stripe"
  }

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "stripe_secret_key" {
  secret      = google_secret_manager_secret.stripe_secret_key.id
  secret_data = var.stripe_secret_key
}

resource "google_secret_manager_secret" "stripe_webhook_secret" {
  project   = var.project_id
  secret_id = "stripe-webhook-secret-${var.environment}"
  
  labels = {
    environment = var.environment
    managed_by  = "terraform"
    service     = "stripe"
  }

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "stripe_webhook_secret" {
  secret      = google_secret_manager_secret.stripe_webhook_secret.id
  secret_data = stripe_webhook_endpoint.varai_webhook.secret
}

# IAM bindings for Cloud Run to access Stripe secrets
resource "google_secret_manager_secret_iam_binding" "stripe_publishable_key_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.stripe_publishable_key.secret_id
  role      = "roles/secretmanager.secretAccessor"

  members = concat(
    var.service_accounts,
    [
      "serviceAccount:${var.project_id}-compute@developer.gserviceaccount.com",
      "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"
    ]
  )
}

resource "google_secret_manager_secret_iam_binding" "stripe_secret_key_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.stripe_secret_key.secret_id
  role      = "roles/secretmanager.secretAccessor"

  members = concat(
    var.service_accounts,
    [
      "serviceAccount:${var.project_id}-compute@developer.gserviceaccount.com",
      "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"
    ]
  )
}

resource "google_secret_manager_secret_iam_binding" "stripe_webhook_secret_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.stripe_webhook_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"

  members = concat(
    var.service_accounts,
    [
      "serviceAccount:${var.project_id}-compute@developer.gserviceaccount.com",
      "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"
    ]
  )
}

# Cloud Run service for Stripe webhook processing
resource "google_cloud_run_service" "stripe_webhook_processor" {
  name     = "stripe-webhook-processor-${var.environment}"
  location = var.region
  project  = var.project_id

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/stripe-webhook-processor:${var.image_tag}"
        
        ports {
          container_port = 8080
        }
        
        env {
          name = "ENVIRONMENT"
          value = var.environment
        }
        
        env {
          name = "STRIPE_WEBHOOK_SECRET"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.stripe_webhook_secret.secret_id
              key  = "latest"
            }
          }
        }
        
        env {
          name = "STRIPE_SECRET_KEY"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.stripe_secret_key.secret_id
              key  = "latest"
            }
          }
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
          requests = {
            cpu    = "100m"
            memory = "128Mi"
          }
        }
      }
      
      service_account_name = var.cloud_run_service_account
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "10"
        "run.googleapis.com/execution-environment" = "gen2"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_secret_manager_secret_version.stripe_webhook_secret,
    google_secret_manager_secret_version.stripe_secret_key
  ]
}

# Allow unauthenticated access to webhook endpoint
resource "google_cloud_run_service_iam_binding" "stripe_webhook_public" {
  location = google_cloud_run_service.stripe_webhook_processor.location
  project  = google_cloud_run_service.stripe_webhook_processor.project
  service  = google_cloud_run_service.stripe_webhook_processor.name
  role     = "roles/run.invoker"
  
  members = [
    "allUsers"
  ]
}

# Monitoring for Stripe webhook processing
resource "google_monitoring_alert_policy" "stripe_webhook_errors" {
  count = var.enable_monitoring ? 1 : 0
  
  display_name = "${var.environment} - Stripe Webhook Processing Errors"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "High error rate in Stripe webhook processing"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${google_cloud_run_service.stripe_webhook_processor.name}\" AND metric.type=\"run.googleapis.com/request_count\" AND metric.labels.response_code_class=\"5xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 5

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = var.notification_channels

  alert_strategy {
    auto_close = "1800s"
  }
}

# Log-based metric for Stripe payment events
resource "google_logging_metric" "stripe_payment_success" {
  count = var.enable_monitoring ? 1 : 0
  
  name   = "stripe_payment_success_${var.environment}"
  filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${google_cloud_run_service.stripe_webhook_processor.name}\" AND jsonPayload.event_type=\"payment_intent.succeeded\""

  metric_descriptor {
    metric_kind = "GAUGE"
    value_type  = "INT64"
    display_name = "Stripe Payment Success Events"
  }

  value_extractor = "1"
}

resource "google_logging_metric" "stripe_payment_failed" {
  count = var.enable_monitoring ? 1 : 0
  
  name   = "stripe_payment_failed_${var.environment}"
  filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${google_cloud_run_service.stripe_webhook_processor.name}\" AND jsonPayload.event_type=\"payment_intent.payment_failed\""

  metric_descriptor {
    metric_kind = "GAUGE"
    value_type  = "INT64"
    display_name = "Stripe Payment Failed Events"
  }

  value_extractor = "1"
}