# Outputs for the Simplified Cloud Run module

output "service_urls" {
  description = "Map of region to service URL"
  value = {
    for region, service in google_cloud_run_service.service : region => service.status[0].url
  }
}

output "service_names" {
  description = "Map of region to service name"
  value = {
    for region, service in google_cloud_run_service.service : region => service.name
  }
}

output "service_statuses" {
  description = "Map of region to service status"
  value = {
    for region, service in google_cloud_run_service.service : region => service.status[0].conditions[0].type
  }
}

output "latest_revisions" {
  description = "Map of region to latest deployed revision"
  value = {
    for region, service in google_cloud_run_service.service : region => service.status[0].latest_created_revision_name
  }
}

output "service_account_email" {
  description = "Email address of the service account"
  value       = google_service_account.service_account.email
}

output "domain_mappings" {
  description = "Map of region to domain mapping status"
  value = var.enable_domain_mapping ? {
    for region, mapping in google_cloud_run_domain_mapping.domain_mapping : region => mapping.status[0].resource_records
  } : {}
}

output "regional_configuration" {
  description = "Summary of regional configuration"
  value = {
    for region, config in var.regions : region => {
      service_url = google_cloud_run_service.service[region].status[0].url
      region      = config.region
      domain      = var.enable_domain_mapping ? "${region}.${var.domain_name}" : null
    }
  }
}

output "compliance_status" {
  description = "Compliance status information"
  value = {
    eu_region_deployed   = contains(keys(var.regions), "eu")
    us_region_deployed   = contains(keys(var.regions), "us")
  }
}