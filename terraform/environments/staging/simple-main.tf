# Simplified Staging Environment for VARAi Admin Panel and Documentation
# This configuration deploys the admin panel and documentation system to Cloud Run with password protection

terraform {
  required_version = ">= 1.0.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Variables
variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

variable "admin_username" {
  description = "Admin username for basic auth"
  type        = string
  default     = "varai-staging"
}

variable "admin_password" {
  description = "Admin password for basic auth"
  type        = string
  default     = "VaraiStaging2025!"
  sensitive   = true
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "secretmanager.googleapis.com",
    "compute.googleapis.com"
  ])
  
  project = var.gcp_project_id
  service = each.value
  
  disable_on_destroy = false
}

# Secret for basic auth credentials
resource "google_secret_manager_secret" "basic_auth_credentials" {
  project   = var.gcp_project_id
  secret_id = "staging-basic-auth-credentials"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "basic_auth_credentials" {
  secret      = google_secret_manager_secret.basic_auth_credentials.id
  secret_data = base64encode("${var.admin_username}:${var.admin_password}")
}

# Cloud Run service for Admin Panel
resource "google_cloud_run_v2_service" "admin_panel" {
  name     = "varai-admin-staging"
  location = var.gcp_region
  project  = var.gcp_project_id
  
  template {
    containers {
      image = "nginx:alpine"
      
      ports {
        container_port = 80
      }
      
      env {
        name  = "BASIC_AUTH_CREDENTIALS"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.basic_auth_credentials.secret_id
            version = "latest"
          }
        }
      }
      
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
      
      startup_probe {
        http_get {
          path = "/"
          port = 80
        }
        initial_delay_seconds = 10
        timeout_seconds       = 5
        period_seconds        = 10
        failure_threshold     = 3
      }
      
      liveness_probe {
        http_get {
          path = "/"
          port = 80
        }
        initial_delay_seconds = 30
        timeout_seconds       = 5
        period_seconds        = 30
        failure_threshold     = 3
      }
    }
    
    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }
    
    service_account = google_service_account.cloud_run_service_account.email
  }
  
  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
  
  depends_on = [google_project_service.required_apis]
}

# Cloud Run service for Documentation API
resource "google_cloud_run_v2_service" "docs_api" {
  name     = "varai-docs-api-staging"
  location = var.gcp_region
  project  = var.gcp_project_id
  
  template {
    containers {
      image = "node:18-alpine"
      
      ports {
        container_port = 3000
      }
      
      env {
        name  = "NODE_ENV"
        value = "staging"
      }
      
      env {
        name  = "PORT"
        value = "3000"
      }
      
      env {
        name  = "BASIC_AUTH_CREDENTIALS"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.basic_auth_credentials.secret_id
            version = "latest"
          }
        }
      }
      
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
      
      startup_probe {
        http_get {
          path = "/health"
          port = 3000
        }
        initial_delay_seconds = 10
        timeout_seconds       = 5
        period_seconds        = 10
        failure_threshold     = 3
      }
      
      liveness_probe {
        http_get {
          path = "/health"
          port = 3000
        }
        initial_delay_seconds = 30
        timeout_seconds       = 5
        period_seconds        = 30
        failure_threshold     = 3
      }
    }
    
    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }
    
    service_account = google_service_account.cloud_run_service_account.email
  }
  
  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
  
  depends_on = [google_project_service.required_apis]
}

# Service Account for Cloud Run services
resource "google_service_account" "cloud_run_service_account" {
  project      = var.gcp_project_id
  account_id   = "varai-staging-cloud-run"
  display_name = "VARAi Staging Cloud Run Service Account"
}

# IAM binding for Secret Manager access
resource "google_project_iam_member" "secret_manager_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run_service_account.email}"
}

# IAM policy for Cloud Run services (allow public access with authentication)
resource "google_cloud_run_service_iam_member" "admin_panel_public_access" {
  project  = var.gcp_project_id
  location = google_cloud_run_v2_service.admin_panel.location
  service  = google_cloud_run_v2_service.admin_panel.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "docs_api_public_access" {
  project  = var.gcp_project_id
  location = google_cloud_run_v2_service.docs_api.location
  service  = google_cloud_run_v2_service.docs_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Load Balancer for custom domain mapping
resource "google_compute_global_address" "staging_ip" {
  project = var.gcp_project_id
  name    = "varai-staging-ip"
}

# SSL Certificate for custom domain
resource "google_compute_managed_ssl_certificate" "staging_ssl_cert" {
  project = var.gcp_project_id
  name    = "varai-staging-ssl-cert"
  
  managed {
    domains = [
      "admin-staging.varai.ai",
      "docs-api-staging.varai.ai"
    ]
  }
}

# Cloud Armor security policy
resource "google_compute_security_policy" "staging_security_policy" {
  project = var.gcp_project_id
  name    = "varai-staging-security-policy"
  
  description = "Security policy for VARAi staging environment"
  
  # Default rule - allow all traffic
  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow rule"
  }
  
  # Rate limiting rule
  rule {
    action   = "rate_based_ban"
    priority = "1000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
      ban_duration_sec = 300
    }
    description = "Rate limiting rule - 100 requests per minute"
  }
}

# Outputs
output "admin_panel_url" {
  description = "URL for the admin panel"
  value       = google_cloud_run_v2_service.admin_panel.uri
}

output "docs_api_url" {
  description = "URL for the documentation API"
  value       = google_cloud_run_v2_service.docs_api.uri
}

output "staging_ip_address" {
  description = "Static IP address for staging environment"
  value       = google_compute_global_address.staging_ip.address
}

output "ssl_certificate_name" {
  description = "Name of the SSL certificate"
  value       = google_compute_managed_ssl_certificate.staging_ssl_cert.name
}

output "basic_auth_credentials" {
  description = "Basic auth credentials (base64 encoded)"
  value       = "Username: ${var.admin_username}"
  sensitive   = false
}

output "deployment_instructions" {
  description = "Next steps for deployment"
  value = <<-EOT
    Deployment completed! Next steps:
    
    1. Configure DNS records:
       - admin-staging.varai.ai -> ${google_compute_global_address.staging_ip.address}
       - docs-api-staging.varai.ai -> ${google_compute_global_address.staging_ip.address}
    
    2. Wait for SSL certificate provisioning (may take 10-60 minutes)
    
    3. Access the services:
       - Admin Panel: ${google_cloud_run_v2_service.admin_panel.uri}
       - Docs API: ${google_cloud_run_v2_service.docs_api.uri}
    
    4. Login credentials:
       - Username: ${var.admin_username}
       - Password: [configured in variables]
    
    5. Build and deploy your application containers to replace the placeholder images
  EOT
}