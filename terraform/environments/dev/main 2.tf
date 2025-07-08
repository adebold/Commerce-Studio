# Development Environment Terraform Configuration for VARAi Platform

terraform {
  required_version = ">= 1.0.0"
  
  backend "gcs" {
    bucket = "varai-terraform-state-dev"
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

# Kubernetes and Helm providers removed as we've migrated to Cloud Run

provider "mongodbatlas" {
  public_key  = var.mongodb_atlas_public_key
  private_key = var.mongodb_atlas_private_key
}

# Network Module
module "networking" {
  source = "../../modules/networking"
  
  environment        = "dev"
  region             = var.gcp_region
  subnet_cidr        = var.subnet_cidr
  enable_flow_logs   = false
  domain_name        = var.domain_name
  create_dns_zone    = true
}

# Database Module
module "database" {
  source = "../../modules/database"
  
  environment            = "dev"
  atlas_org_id           = var.mongodb_atlas_org_id
  atlas_region           = var.mongodb_atlas_region
  atlas_instance_size    = "M10"
  mongodb_version        = "6.0"
  enable_backups         = true
  mongodb_username       = var.mongodb_username
  mongodb_password       = var.mongodb_password
  mongodb_database_name  = "varai"
  enable_network_peering = false
  gcp_project_id         = var.gcp_project_id
  vpc_network_name       = module.networking.network_name
  vpc_network_id         = module.networking.network_id
  allowed_cidr_blocks    = var.subnet_cidr
  enable_encryption_at_rest = false
  alert_email            = var.alert_email
  redis_tier             = "BASIC"
  redis_memory_size_gb   = 1
  gcp_region             = var.gcp_region
  gcp_zone               = var.gcp_zone
}

# API Service
module "api_cloud_run" {
  source = "../../modules/cloud_run"

  project_id    = var.gcp_project_id
  service_name  = "api"
  environment   = "dev"
  image_prefix  = var.image_prefix
  image_tag     = var.image_tag
  container_registry = "ghcr.io"

  # Define regions with region-specific configurations
  regions = {
    us = {
      region = "us-central1"
      environment_variables = {
        API_BASE_URL = "https://us-dev.${var.domain_name}/api"
        LOG_LEVEL    = "debug"
      }
      vpc_connector_cidr = "10.8.0.0/28"
    }
    eu = {
      region = "europe-west1"
      environment_variables = {
        API_BASE_URL = "https://eu-dev.${var.domain_name}/api"
        LOG_LEVEL    = "debug"
      }
      vpc_connector_cidr = "10.9.0.0/28"
    }
  }

  # Resource configuration
  resources = {
    cpu_limit    = "1"
    memory_limit = "512Mi"
  }

  # Secrets configuration
  secrets = {
    MONGODB_URI  = module.database.mongodb_connection_string
    AUTH_SECRET  = var.auth_secret
    AUTH_ISSUER  = var.auth_issuer
    AUTH_AUDIENCE = var.auth_audience
  }

  # Service account roles
  service_account_roles = [
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/secretmanager.secretAccessor",
    "roles/datastore.user"
  ]

  # Scaling configuration
  container_concurrency = 80
  timeout_seconds       = 300
  min_instances         = 1
  max_instances         = 5

  # Access configuration
  allow_public_access = false
  allowed_invokers    = [
    "serviceAccount:${var.gcp_project_id}.svc.id.goog[default/frontend]",
    "serviceAccount:cloud-run-invoker@${var.gcp_project_id}.iam.gserviceaccount.com"
  ]
  ingress_setting     = "internal-and-cloud-load-balancing"

  # Domain configuration
  enable_domain_mapping = true
  domain_name           = var.domain_name

  # VPC configuration
  enable_vpc_connector = true
  vpc_network          = module.networking.network_name

  # Regulatory compliance configuration
  regulatory_compliance = {
    enable_gdpr_compliance       = true
    enable_healthcare_compliance = true
    data_residency_required      = true
    audit_logging_enabled        = true
  }
}

# Auth Service
module "auth_cloud_run" {
  source = "../../modules/cloud_run"

  project_id    = var.gcp_project_id
  service_name  = "auth"
  environment   = "dev"
  image_prefix  = var.image_prefix
  image_tag     = var.image_tag
  container_registry = "ghcr.io"

  # Define regions with region-specific configurations
  regions = {
    us = {
      region = "us-central1"
      environment_variables = {
        AUTH_BASE_URL = "https://us-dev.${var.domain_name}/auth"
        LOG_LEVEL     = "debug"
      }
      vpc_connector_cidr = "10.8.0.0/28"
    }
    eu = {
      region = "europe-west1"
      environment_variables = {
        AUTH_BASE_URL = "https://eu-dev.${var.domain_name}/auth"
        LOG_LEVEL     = "debug"
      }
      vpc_connector_cidr = "10.9.0.0/28"
    }
  }

  # Resource configuration
  resources = {
    cpu_limit    = "1"
    memory_limit = "512Mi"
  }

  # Secrets configuration
  secrets = {
    MONGODB_URI  = module.database.mongodb_connection_string
    AUTH_SECRET  = var.auth_secret
    AUTH_ISSUER  = var.auth_issuer
    AUTH_AUDIENCE = var.auth_audience
  }

  # Service account roles
  service_account_roles = [
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/secretmanager.secretAccessor"
  ]

  # Scaling configuration
  container_concurrency = 80
  timeout_seconds       = 300
  min_instances         = 1
  max_instances         = 5

  # Access configuration
  allow_public_access = false
  allowed_invokers    = [
    "serviceAccount:${var.gcp_project_id}.svc.id.goog[default/frontend]",
    "serviceAccount:cloud-run-invoker@${var.gcp_project_id}.iam.gserviceaccount.com"
  ]
  ingress_setting     = "internal-and-cloud-load-balancing"

  # Domain configuration
  enable_domain_mapping = true
  domain_name           = var.domain_name

  # VPC configuration
  enable_vpc_connector = true
  vpc_network          = module.networking.network_name

  # Regulatory compliance configuration
  regulatory_compliance = {
    enable_gdpr_compliance       = true
    enable_healthcare_compliance = true
    data_residency_required      = true
    audit_logging_enabled        = true
  }
}

# Frontend Service
module "frontend_cloud_run" {
  source = "../../modules/cloud_run"

  project_id    = var.gcp_project_id
  service_name  = "frontend"
  environment   = "dev"
  image_prefix  = var.image_prefix
  image_tag     = var.image_tag
  container_registry = "ghcr.io"

  # Define regions with region-specific configurations
  regions = {
    us = {
      region = "us-central1"
      environment_variables = {
        API_URL           = module.api_cloud_run.service_urls["us"]
        AUTH_URL          = module.auth_cloud_run.service_urls["us"]
        RECOMMENDATION_URL = "https://us-dev.${var.domain_name}/recommendation"
        VIRTUAL_TRY_ON_URL = "https://us-dev.${var.domain_name}/virtual-try-on"
        ANALYTICS_URL     = "https://us-dev.${var.domain_name}/analytics"
        REGION            = "us"
        LOG_LEVEL         = "debug"
      }
    }
    eu = {
      region = "europe-west1"
      environment_variables = {
        API_URL           = module.api_cloud_run.service_urls["eu"]
        AUTH_URL          = module.auth_cloud_run.service_urls["eu"]
        RECOMMENDATION_URL = "https://eu-dev.${var.domain_name}/recommendation"
        VIRTUAL_TRY_ON_URL = "https://eu-dev.${var.domain_name}/virtual-try-on"
        ANALYTICS_URL     = "https://eu-dev.${var.domain_name}/analytics"
        REGION            = "eu"
        LOG_LEVEL         = "debug"
      }
    }
  }

  # Resource configuration
  resources = {
    cpu_limit    = "1"
    memory_limit = "512Mi"
  }

  # No secrets for frontend
  secrets = {}

  # Service account roles
  service_account_roles = [
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter"
  ]

  # Scaling configuration
  container_concurrency = 80
  timeout_seconds       = 300
  min_instances         = 1
  max_instances         = 5

  # Access configuration - frontend is public
  allow_public_access = true
  ingress_setting     = "all"

  # Domain configuration
  enable_domain_mapping = true
  domain_name           = var.domain_name

  # No VPC connector needed for frontend
  enable_vpc_connector = false

  # Regulatory compliance configuration
  regulatory_compliance = {
    enable_gdpr_compliance       = true
    enable_healthcare_compliance = false  # Frontend doesn't handle healthcare data directly
    data_residency_required      = true
    audit_logging_enabled        = true
  }
}

# Monitoring Module
module "monitoring" {
  source = "../../modules/monitoring"
  
  environment          = "dev"
  domain_name          = var.domain_name
  notification_channels = var.notification_channels
  api_memory_limit     = 536870912  # 512Mi in bytes
  enable_log_export    = false
  gcp_project_id       = var.gcp_project_id
  deploy_grafana       = true
  deploy_prometheus    = true
  monitoring_namespace = "monitoring"
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

# Cloud Run regional deployment information
output "regional_deployments" {
  description = "Information about regional deployments"
  value = {
    api      = module.api_cloud_run.regional_configuration
    auth     = module.auth_cloud_run.regional_configuration
    frontend = module.frontend_cloud_run.regional_configuration
  }
}

output "api_service_urls" {
  description = "URLs for the API service by region"
  value       = module.api_cloud_run.service_urls
}

output "auth_service_urls" {
  description = "URLs for the Auth service by region"
  value       = module.auth_cloud_run.service_urls
}

output "frontend_service_urls" {
  description = "URLs for the Frontend service by region"
  value       = module.frontend_cloud_run.service_urls
}

output "compliance_status" {
  description = "Compliance status for all services"
  value = {
    api      = module.api_cloud_run.compliance_status
    auth     = module.auth_cloud_run.compliance_status
    frontend = module.frontend_cloud_run.compliance_status
  }
}

output "monitoring_dashboard_url" {
  description = "The URL for the monitoring dashboard"
  value       = "https://console.cloud.google.com/monitoring/dashboards/custom/${replace(module.monitoring.dashboard_id, "/", "_")}"
}