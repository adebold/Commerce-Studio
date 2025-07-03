# Simplified Cloud Run Module for EyewearML Platform
# This module deploys services to Cloud Run with regional awareness for regulatory compliance

# Service account for Cloud Run services
resource "google_service_account" "service_account" {
  account_id   = "${var.service_name}-sa"
  display_name = "Service Account for ${var.service_name}"
  project      = var.project_id
}

# Grant necessary permissions to the service account (if enabled)
resource "google_project_iam_member" "service_account_roles" {
  for_each = var.enable_iam_roles ? toset(var.service_account_roles) : []
  
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.service_account.email}"
}

# Regional Cloud Run service deployment
resource "google_cloud_run_service" "service" {
  for_each = var.regions

  name     = "${var.service_name}-${each.key}"
  location = each.value.region
  project  = var.project_id
  
  template {
    spec {
      containers {
        image = "${var.container_registry}/${var.image_prefix}/hello-app:${var.image_tag}"
        
        resources {
          limits = {
            cpu    = var.resources.cpu_limit
            memory = var.resources.memory_limit
          }
        }
        
        # Add region as an environment variable
        env {
          name  = "REGION"
          value = each.key
        }
        
        # Region-specific environment variables
        dynamic "env" {
          for_each = each.value.environment_variables
          content {
            name  = env.key
            value = env.value
          }
        }
        
        # Add health check
        startup_probe {
          http_get {
            path = "/health"
          }
          initial_delay_seconds = 10
          timeout_seconds = 3
          period_seconds = 5
          failure_threshold = 3
        }
      }
      
      # Set concurrency for better resource utilization
      container_concurrency = var.container_concurrency
      
      # Set timeout for requests
      timeout_seconds = var.timeout_seconds
      
      # Use the service account
      service_account_name = google_service_account.service_account.email
    }
  }
  
  # Configure traffic routing
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  # Auto-generate revision names
  autogenerate_revision_name = true
  
  # Configure metadata
  metadata {
    annotations = {
      "run.googleapis.com/client-name" = "terraform"
      "run.googleapis.com/ingress"     = var.ingress_setting
    }
    
    labels = {
      "environment" = var.environment
      "service"     = var.service_name
      "region"      = each.key
      "managed-by"  = "terraform"
    }
  }
  
  # No dependencies
}

# IAM policy for Cloud Run service
resource "google_cloud_run_service_iam_policy" "noauth" {
  for_each = var.regions
  
  location    = each.value.region
  project     = var.project_id
  service     = google_cloud_run_service.service[each.key].name
  policy_data = data.google_iam_policy.noauth.policy_data
}

# IAM policy data for public access (if allowed)
data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = var.allow_public_access ? ["allUsers"] : var.allowed_invokers
  }
}

# Regional domain mapping
resource "google_cloud_run_domain_mapping" "domain_mapping" {
  for_each = var.enable_domain_mapping ? var.regions : {}
  
  name     = "${each.key}.${var.domain_name}"
  location = each.value.region
  project  = var.project_id
  
  metadata {
    namespace = var.project_id
  }
  
  spec {
    route_name = google_cloud_run_service.service[each.key].name
  }
}