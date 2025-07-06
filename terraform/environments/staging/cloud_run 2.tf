# Cloud Run deployment for the staging environment

module "frontend_cloud_run" {
  source = "../../modules/simplified_cloud_run"

  service_name = "frontend"
  project_id   = var.gcp_project_id
  container_registry = "gcr.io"
  image_prefix = var.image_prefix
  image_tag    = var.image_tag

  regions = {
    us = {
      region = var.gcp_region
      environment_variables = {
        "API_URL" = "https://api.${var.domain_name}"
        "NODE_ENV" = "staging"
      }
      vpc_connector_cidr = null
    }
  }

  resources = {
    cpu_limit    = "1000m"
    memory_limit = "1Gi"
  }

  container_concurrency = 80
  timeout_seconds       = 300

  ingress_setting = "all"
  environment     = "staging"

  service_account_roles = [
    "roles/run.invoker",
    "roles/cloudtrace.agent",
    "roles/cloudprofiler.agent",
    "roles/secretmanager.secretAccessor"
  ]

  enable_iam_roles = true
  allow_public_access = true
  allowed_invokers    = []

  enable_domain_mapping = true
  domain_name           = var.domain_name
}

module "api_cloud_run" {
  source = "../../modules/simplified_cloud_run"

  service_name = "api"
  project_id   = var.gcp_project_id
  container_registry = "gcr.io"
  image_prefix = var.image_prefix
  image_tag    = var.image_tag

  regions = {
    us = {
      region = var.gcp_region
      environment_variables = {
        "NODE_ENV" = "staging"
        "MONGODB_URI" = "mongodb+srv://${var.mongodb_username}:${var.mongodb_password}@${var.mongodb_atlas_org_id}.mongodb.net/eyewear-ml-staging?retryWrites=true&w=majority"
      }
      vpc_connector_cidr = null
    }
  }

  resources = {
    cpu_limit    = "1000m"
    memory_limit = "1Gi"
  }

  container_concurrency = 80
  timeout_seconds       = 300

  ingress_setting = "all"
  environment     = "staging"

  service_account_roles = [
    "roles/run.invoker",
    "roles/cloudtrace.agent",
    "roles/cloudprofiler.agent",
    "roles/secretmanager.secretAccessor"
  ]

  enable_iam_roles = true
  allow_public_access = true
  allowed_invokers    = []

  enable_domain_mapping = true
  domain_name           = var.domain_name
}

# Outputs
output "cloud_run_frontend_url" {
  description = "The URL for the Frontend Cloud Run service"
  value       = module.frontend_cloud_run.service_urls["us"]
}

output "cloud_run_api_url" {
  description = "The URL for the API Cloud Run service"
  value       = module.api_cloud_run.service_urls["us"]
}

output "cloud_run_frontend_status" {
  description = "The status of the Frontend Cloud Run service"
  value       = module.frontend_cloud_run.service_statuses["us"]
}

output "cloud_run_api_status" {
  description = "The status of the API Cloud Run service"
  value       = module.api_cloud_run.service_statuses["us"]
}

output "cloud_run_frontend_latest_revision" {
  description = "The latest revision of the Frontend Cloud Run service"
  value       = module.frontend_cloud_run.latest_revisions["us"]
}

output "cloud_run_api_latest_revision" {
  description = "The latest revision of the API Cloud Run service"
  value       = module.api_cloud_run.latest_revisions["us"]
}