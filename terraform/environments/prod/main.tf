# Production Environment Terraform Configuration for VARAi Platform

terraform {
  required_version = ">= 1.0.0"
  
  backend "gcs" {
    bucket = "varai-terraform-state-prod"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

provider "google-beta" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

provider "kubernetes" {
  config_path = var.kubernetes_config_path
}

provider "helm" {
  kubernetes {
    config_path = var.kubernetes_config_path
  }
}

provider "mongodbatlas" {
  public_key  = var.mongodb_atlas_public_key
  private_key = var.mongodb_atlas_private_key
}

# Network Module
module "networking" {
  source = "../../modules/networking"
  
  environment        = "prod"
  region             = var.gcp_region
  subnet_cidr        = var.subnet_cidr
  enable_flow_logs   = true
  domain_name        = var.domain_name
  create_dns_zone    = true
  frontend_neg_id    = module.kubernetes.frontend_neg_id
  api_neg_id         = module.kubernetes.api_neg_id
  auth_neg_id        = module.kubernetes.auth_neg_id
}

# Database Module
module "database" {
  source = "../../modules/database"
  
  environment            = "prod"
  atlas_org_id           = var.mongodb_atlas_org_id
  atlas_region           = var.mongodb_atlas_region
  atlas_instance_size    = "M30"
  mongodb_version        = "6.0"
  enable_backups         = true
  mongodb_username       = var.mongodb_username
  mongodb_password       = var.mongodb_password
  mongodb_database_name  = "varai"
  enable_network_peering = true
  gcp_project_id         = var.gcp_project_id
  vpc_network_name       = module.networking.network_name
  vpc_network_id         = module.networking.network_id
  allowed_cidr_blocks    = var.subnet_cidr
  enable_encryption_at_rest = true
  gcp_service_account_key = var.gcp_service_account_key
  gcp_kms_key_version_id = var.gcp_kms_key_version_id
  alert_email            = var.alert_email
  redis_tier             = "STANDARD_HA"
  redis_memory_size_gb   = 5
  gcp_region             = var.gcp_region
  gcp_zone               = var.gcp_zone
  gcp_alternative_zone   = var.gcp_alternative_zone
}

# Kubernetes Module
module "kubernetes" {
  source = "../../modules/kubernetes"
  
  environment       = "prod"
  namespace         = "varai-prod"
  container_registry = "ghcr.io"
  image_prefix      = var.image_prefix
  image_tag         = var.image_tag
  api_replicas      = 3
  auth_replicas     = 3
  frontend_replicas = 3
  api_resources = {
    cpu_limit     = "2000m"
    memory_limit  = "2Gi"
    cpu_request   = "500m"
    memory_request = "1Gi"
  }
  auth_resources = {
    cpu_limit     = "1000m"
    memory_limit  = "1Gi"
    cpu_request   = "250m"
    memory_request = "512Mi"
  }
  frontend_resources = {
    cpu_limit     = "500m"
    memory_limit  = "512Mi"
    cpu_request   = "100m"
    memory_request = "256Mi"
  }
  mongodb_url       = module.database.mongodb_connection_url
  redis_host        = module.database.redis_host
  redis_port        = module.database.redis_port
  api_base_url      = "https://${var.domain_name}/api"
  secret_key        = var.secret_key
  auth_secret       = var.auth_secret
  auth_issuer       = var.auth_issuer
  auth_audience     = var.auth_audience
  deepseek_api_key  = var.deepseek_api_key
  ingress_host      = var.domain_name
  enable_autoscaling = true
  api_autoscaling = {
    min_replicas    = 3
    max_replicas    = 10
    cpu_threshold   = 70
    memory_threshold = 70
  }
  auth_autoscaling = {
    min_replicas    = 3
    max_replicas    = 8
    cpu_threshold   = 70
    memory_threshold = 70
  }
  frontend_autoscaling = {
    min_replicas    = 3
    max_replicas    = 8
    cpu_threshold   = 70
    memory_threshold = 70
  }
}

# Monitoring Module
module "monitoring" {
  source = "../../modules/monitoring"
  
  environment          = "prod"
  kubernetes_namespace = module.kubernetes.namespace
  domain_name          = var.domain_name
  notification_channels = var.notification_channels
  api_memory_limit     = 2147483648  # 2Gi in bytes
  enable_log_export    = true
  gcp_project_id       = var.gcp_project_id
  bigquery_location    = var.gcp_region
  log_retention_days   = 90
  deploy_grafana       = true
  deploy_prometheus    = true
  monitoring_namespace = "monitoring"
  alert_cpu_threshold  = 0.7
  alert_memory_threshold = 0.7
  alert_error_rate_threshold = 0.01
  alert_latency_threshold = 500
  uptime_check_period  = "30s"
  slo_availability_goal = 0.9995
  slo_latency_goal     = 0.99
  slo_latency_threshold = 0.5
}

# Stripe Integration Module
module "stripe" {
  source = "../../modules/stripe"
  
  environment    = "prod"
  project_id     = var.gcp_project_id
  region         = var.gcp_region
  domain_name    = var.domain_name
  
  # Stripe API Keys (stored in Secret Manager)
  stripe_publishable_key = var.stripe_publishable_key
  stripe_secret_key      = var.stripe_secret_key
  
  # Token Pricing Configuration
  token_pricing = {
    starter = {
      monthly_price = 2900  # $29.00 in cents
      token_count   = 1000
    }
    professional = {
      monthly_price = 19900  # $199.00 in cents
      token_count   = 10000
    }
    enterprise = {
      monthly_price = 99900  # $999.00 in cents
      token_count   = -1     # Unlimited
    }
    one_time_packages = [
      {
        token_count = 100
        price       = 1000  # $10.00 in cents
      },
      {
        token_count = 500
        price       = 4500  # $45.00 in cents
      },
      {
        token_count = 1000
        price       = 8000  # $80.00 in cents
      }
    ]
  }
  
  # AI Service Costs (in tokens)
  ai_service_costs = {
    virtual_try_on      = 5
    face_analysis       = 3
    recommendations     = 2
    pd_calculator       = 1
    style_advisor       = 4
    inventory_optimizer = 10
  }
  
  # Webhook Configuration
  webhook_processor_config = {
    memory_limit = "512Mi"
    cpu_limit    = "500m"
    min_replicas = 1
    max_replicas = 5
  }
  
  # Service Account Configuration
  cloud_run_service_account = "stripe-webhook-processor@${var.gcp_project_id}.iam.gserviceaccount.com"
  service_accounts = [
    "serviceAccount:${module.kubernetes.service_account_email}",
    "serviceAccount:stripe-webhook-processor@${var.gcp_project_id}.iam.gserviceaccount.com"
  ]
  
  # Monitoring and Security
  enable_monitoring = true
  enable_audit_logs = true
  
  depends_on = [
    module.networking,
    module.monitoring
  ]
}

# Outputs
output "api_url" {
  description = "The URL for the API service"
  value       = "https://${var.domain_name}/api"
}

output "auth_url" {
  description = "The URL for the Auth service"
  value       = "https://${var.domain_name}/auth"
}

output "frontend_url" {
  description = "The URL for the Frontend service"
  value       = "https://${var.domain_name}"
}

output "mongodb_connection_string" {
  description = "MongoDB connection string"
  value       = module.database.mongodb_connection_string
  sensitive   = true
}

output "redis_connection_string" {
  description = "Redis connection string"
  value       = module.database.redis_connection_string
}

output "load_balancer_ip" {
  description = "The IP address of the load balancer"
  value       = module.networking.load_balancer_ip
}

output "kubernetes_namespace" {
  description = "The Kubernetes namespace"
  value       = module.kubernetes.namespace
}

output "monitoring_dashboard_url" {
  description = "The URL for the monitoring dashboard"
  value       = "https://console.cloud.google.com/monitoring/dashboards/custom/${replace(module.monitoring.dashboard_id, "/", "_")}"
}

output "bigquery_logs_dataset" {
  description = "The BigQuery dataset for logs"
  value       = module.monitoring.bigquery_dataset_id
}

output "api_availability_slo" {
  description = "The API availability SLO"
  value       = "${module.monitoring.api_availability_slo_id} (${var.slo_availability_goal * 100}%)"
}

output "api_latency_slo" {
  description = "The API latency SLO"
  value       = "${module.monitoring.api_latency_slo_id} (${var.slo_latency_goal * 100}% of requests under ${var.slo_latency_threshold}s)"
}

# Stripe Integration Outputs
output "stripe_webhook_url" {
  description = "Stripe webhook endpoint URL"
  value       = module.stripe.webhook_processor_service.url
}

output "stripe_product_ids" {
  description = "Stripe product IDs for AI services"
  value       = module.stripe.stripe_product_ids
}

output "stripe_price_ids" {
  description = "Stripe price IDs for subscription plans"
  value       = module.stripe.stripe_price_ids
}

output "connected_apps_url" {
  description = "Connected Apps marketplace URL"
  value       = module.stripe.integration_urls.customer_portal_url
}

output "admin_portal_url" {
  description = "Admin portal URL for customer management"
  value       = module.stripe.integration_urls.admin_portal_url
}