# Staging Environment Terraform Configuration for VARAi Platform

terraform {
  required_version = ">= 1.0.0"

  backend "local" {
    path = "terraform.tfstate"
  }

  required_providers {
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
      version = "~> 1.8.0" # Using the version specified in the previous terraform providers output
    }
    google = {
      source = "hashicorp/google"
      version = "~> 6.0" # Assuming a compatible version
    }
    google-beta = {
      source = "hashicorp/google-beta"
      version = "~> 6.0" # Assuming a compatible version
    }
    kubernetes = {
      source = "hashicorp/kubernetes"
      version = "~> 2.0" # Assuming a compatible version
    }
    helm = {
      source = "hashicorp/helm"
      version = "~> 2.0" # Assuming a compatible version
    }
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

# Secret Manager data sources for sensitive values
data "google_secret_manager_secret_version" "auth_secret" {
  provider = google
  project  = var.gcp_project_id
  secret   = "auth-secret"
}

data "google_secret_manager_secret_version" "deepseek_api_key" {
  provider = google
  project  = var.gcp_project_id
  secret   = "deepseek-api-key"
}

data "google_secret_manager_secret_version" "gcp_kms_key_version_id" {
  provider = google
  project  = var.gcp_project_id
  secret   = "gcp-kms-key-version-id"
}

# Network Module
module "networking" {
  source = "../../modules/networking"
  
  environment        = "staging"
  region             = var.gcp_region
  subnet_cidr        = var.subnet_cidr
  enable_flow_logs   = true
  domain_name        = var.domain_name
  create_dns_zone    = true
  frontend_neg_id    = "placeholder-frontend-neg-id"
  api_neg_id         = "placeholder-api-neg-id"
  auth_neg_id        = "placeholder-auth-neg-id"
}

# Database Module
module "database" {
  source = "../../modules/database"
  
  environment            = "staging"
  atlas_org_id           = var.mongodb_atlas_org_id
  atlas_region           = var.mongodb_atlas_region
  atlas_instance_size    = "M20"  # Medium size for staging
  mongodb_version        = "6.0"
  enable_backups         = true
  mongodb_username       = var.mongodb_username
  mongodb_password       = var.mongodb_password
  mongodb_database_name  = "varai_staging"
  enable_network_peering = true
  gcp_project_id         = var.gcp_project_id
  vpc_network_name       = module.networking.network_name
  vpc_network_id         = module.networking.network_id
  allowed_cidr_blocks    = var.subnet_cidr
  enable_encryption_at_rest = true
  gcp_service_account_key = var.gcp_service_account_key
  gcp_kms_key_version_id = data.google_secret_manager_secret_version.gcp_kms_key_version_id.secret_data
  alert_email            = var.alert_email
  redis_tier             = "STANDARD_HA"  # High availability for staging
  redis_memory_size_gb   = 2  # Moderate memory size
  gcp_region             = var.gcp_region
  gcp_zone               = var.gcp_zone
  gcp_alternative_zone   = var.gcp_alternative_zone
}

# Kubernetes Module
module "kubernetes" {
  source = "../../modules/kubernetes"
  
  environment       = "staging"
  namespace         = "varai-staging"
  container_registry = "ghcr.io"
  image_prefix      = var.image_prefix
  image_tag         = var.image_tag
  api_replicas      = 2  # Moderate number of replicas for staging
  auth_replicas     = 2
  frontend_replicas = 2
  api_resources = {
    cpu_limit     = "1000m"
    memory_limit  = "1Gi"
    cpu_request   = "250m"
    memory_request = "512Mi"
  }
  auth_resources = {
    cpu_limit     = "500m"
    memory_limit  = "512Mi"
    cpu_request   = "125m"
    memory_request = "256Mi"
  }
  frontend_resources = {
    cpu_limit     = "300m"
    memory_limit  = "384Mi"
    cpu_request   = "100m"
    memory_request = "192Mi"
  }
  mongodb_url       = module.database.mongodb_connection_url
  redis_host        = module.database.redis_host
  redis_port        = module.database.redis_port
  api_base_url      = "https://${var.domain_name}/api"
  secret_key        = var.secret_key
  auth_secret       = data.google_secret_manager_secret_version.auth_secret.secret_data
  auth_issuer       = var.auth_issuer
  auth_audience     = var.auth_audience
  deepseek_api_key  = data.google_secret_manager_secret_version.deepseek_api_key.secret_data
  ingress_host      = var.domain_name
  enable_autoscaling = true
  api_autoscaling = {
    min_replicas    = 2
    max_replicas    = 5
    cpu_threshold   = 70
    memory_threshold = 70
  }
  auth_autoscaling = {
    min_replicas    = 2
    max_replicas    = 4
    cpu_threshold   = 70
    memory_threshold = 70
  }
  frontend_autoscaling = {
    min_replicas    = 2
    max_replicas    = 4
    cpu_threshold   = 70
    memory_threshold = 70
  }
  
  # Deployment configuration
  # Note: Blue/Green deployment is configured separately
}

# Monitoring Module
module "monitoring" {
  source = "../../modules/monitoring"
  
  environment          = "staging"
  kubernetes_namespace = module.kubernetes.namespace
  domain_name          = var.domain_name
  notification_channels = var.notification_channels
  api_memory_limit     = 1073741824  # 1Gi in bytes
  enable_log_export    = true
  gcp_project_id       = var.gcp_project_id
  bigquery_location    = var.gcp_region
  log_retention_days   = 30
  deploy_grafana       = true
  deploy_prometheus    = true
  monitoring_namespace = "monitoring"
  alert_cpu_threshold  = 0.7
  alert_memory_threshold = 0.7
  alert_error_rate_threshold = 0.02
  alert_latency_threshold = 800
  uptime_check_period  = "60s"
  slo_availability_goal = 0.995
  slo_latency_goal     = 0.98
  slo_latency_threshold = 0.8
}

# Test Automation Module
module "test_automation" {
  source = "../../modules/test_automation"
  
  environment          = "staging"
  kubernetes_namespace = module.kubernetes.namespace
  domain_name          = var.domain_name
  api_url              = "https://${var.domain_name}/api"
  auth_url             = "https://${var.domain_name}/auth"
  frontend_url         = "https://${var.domain_name}"
  test_schedule        = "0 */4 * * *"  # Run every 4 hours
  notification_channels = var.notification_channels
  enable_smoke_tests   = true
  enable_integration_tests = true
  enable_performance_tests = true
  enable_security_scans = true
  enable_data_validation = true
  enable_ux_tests      = true
  test_results_bucket  = "varai-test-results-staging"
  test_timeout         = 600  # 10 minutes
}

# Promotion Process Module
module "promotion_process" {
  source = "../../modules/promotion_process"

  environment          = "staging"
  target_environment   = "prod"
  kubernetes_namespace = module.kubernetes.namespace
  domain_name          = var.domain_name
  approval_required    = true
  approvers            = var.promotion_approvers
  promotion_checklist  = [
    "All tests passing",
    "Performance metrics within thresholds",
    "Security scan passed",
    "Manual QA approval",
    "Product owner approval"
  ]
  artifact_registry    = "ghcr.io/${var.image_prefix}"
  config_repository    = var.config_repository
  database_migration_strategy = "blue-green"
  notification_channels = var.notification_channels
  gcp_project_id       = var.gcp_project_id
}

# Cloud Run Module for ml-datadriven-recos
module "ml_datadriven_recos_cloud_run" {
  source = "../../modules/cloud_run"

  service_name = "ml-datadriven-recos"
  project_id   = var.gcp_project_id
  container_registry = "ghcr.io" # Assuming ghcr.io as the container registry
  image_prefix = var.image_prefix # Using the same image prefix as other services
  image_tag    = var.image_tag    # Using the same image tag as other services

  regions = {
    us = {
      region = "us-central1" # Using us-central1 for US region
      environment_variables = {} # No region-specific env vars for now
      vpc_connector_cidr = null # Assuming no VPC connector needed for now
    }
    eu = {
      region = "europe-west1" # Using europe-west1 for EU region
      environment_variables = {} # No region-specific env vars for now
      vpc_connector_cidr = null # Assuming no VPC connector needed for now
    }
  }

  resources = {
    cpu_limit    = "1000m" # Default CPU limit
    memory_limit = "1Gi"   # Default memory limit
  }

  container_concurrency = 80 # Default concurrency
  timeout_seconds       = 300 # Default timeout

  ingress_setting = "all" # Allowing all ingress for now
  environment     = "staging"

  service_account_roles = [
    "roles/run.invoker",
    "roles/cloudtrace.agent",
    "roles/cloudprofiler.agent",
    "roles/secretmanager.secretAccessor"
  ] # Default service account roles

  allow_public_access = true # Allowing public access for now
  allowed_invokers    = []   # No specific invokers if public access is allowed

  enable_domain_mapping = true
  domain_name           = var.domain_name # Using the same domain name as other services

  secrets = {} # No specific secrets needed for now

  # Depends on networking module for DNS zone creation
  depends_on = [
    module.networking
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

output "test_dashboard_url" {
  description = "The URL for the test dashboard"
  value       = module.test_automation.dashboard_url
}

output "promotion_dashboard_url" {
  description = "The URL for the promotion dashboard"
  value       = module.promotion_process.dashboard_url
}

output "blue_green_status" {
  description = "Current status of blue/green deployment"
  value       = "Not available"
}

output "api_availability_slo" {
  description = "The API availability SLO"
  value       = "${module.monitoring.api_availability_slo_id} (${var.slo_availability_goal * 100}%)"
}

output "api_latency_slo" {
  description = "The API latency SLO"
  value       = "${module.monitoring.api_latency_slo_id} (${var.slo_latency_goal * 100}% of requests under ${var.slo_latency_threshold}s)"
}