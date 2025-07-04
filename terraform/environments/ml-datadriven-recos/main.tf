# Cloud Run Deployment for ml-datadriven-recos

terraform {
  required_version = ">= 1.0.0"
  
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = "ml-datadriven-recos"
  region  = "us-central1"
}

# Cloud Run Module for ml-datadriven-recos
module "ml_datadriven_recos_cloud_run" {
  source = "../../modules/simplified_cloud_run"

  service_name = "ml-datadriven-recos"
  project_id   = "ml-datadriven-recos"
  container_registry = "gcr.io"
  image_prefix = "google-samples"
  image_tag    = "1.0"

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
  
  enable_iam_roles = false # Disable IAM role assignments due to permission issues

  allow_public_access = true # Allowing public access for now
  allowed_invokers    = []   # No specific invokers if public access is allowed

  enable_domain_mapping = true # Enable domain mapping with verified domain
  domain_name           = "vareye.ai" # Verified domain name for the service
}

# Outputs
output "us_service_url" {
  description = "The URL for the US service"
  value       = module.ml_datadriven_recos_cloud_run.service_urls["us"]
}

output "eu_service_url" {
  description = "The URL for the EU service"
  value       = module.ml_datadriven_recos_cloud_run.service_urls["eu"]
}

output "domain_mappings" {
  description = "Domain mappings for all regions"
  value       = module.ml_datadriven_recos_cloud_run.domain_mappings
}

output "regional_configuration" {
  description = "Summary of regional configuration"
  value       = module.ml_datadriven_recos_cloud_run.regional_configuration
}

output "compliance_status" {
  description = "Compliance status information"
  value       = module.ml_datadriven_recos_cloud_run.compliance_status
}