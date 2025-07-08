output "vpc_id" {
  description = "VPC network ID"
  value       = module.networking.vpc_id
}

output "vpc_self_link" {
  description = "VPC network self link"
  value       = module.networking.vpc_self_link
}

output "subnet_ids" {
  description = "Subnet IDs"
  value       = module.networking.subnet_ids
}

output "database_connection_string" {
  description = "Database connection string"
  value       = module.database.connection_string
  sensitive   = true
}

output "database_instance_name" {
  description = "Database instance name"
  value       = module.database.instance_name
}

output "redis_connection_string" {
  description = "Redis connection string"
  value       = module.redis.connection_string
  sensitive   = true
}

output "redis_instance_id" {
  description = "Redis instance ID"
  value       = module.redis.instance_id
}

output "ai_discovery_service_url" {
  description = "AI Discovery Service URL"
  value       = module.ai_discovery_service.service_url
}

output "face_analysis_service_url" {
  description = "Face Analysis Service URL"
  value       = module.face_analysis_service.service_url
}

output "recommendation_service_url" {
  description = "Recommendation Service URL"
  value       = module.recommendation_service.service_url
}

output "analytics_service_url" {
  description = "Analytics Service URL"
  value       = module.analytics_service.service_url
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = module.api_gateway.service_url
}

output "load_balancer_ip" {
  description = "Load balancer IP address"
  value       = module.load_balancer.ip_address
}

output "load_balancer_url" {
  description = "Load balancer URL"
  value       = module.load_balancer.url
}

output "cdn_bucket_name" {
  description = "CDN bucket name"
  value       = module.cdn.bucket_name
}

output "cdn_url" {
  description = "CDN URL"
  value       = module.cdn.url
}

output "monitoring_dashboard_url" {
  description = "Monitoring dashboard URL"
  value       = module.monitoring.dashboard_url
}

output "service_account_emails" {
  description = "Service account emails for each service"
  value = {
    ai_discovery_service   = module.ai_discovery_service.service_account_email
    face_analysis_service  = module.face_analysis_service.service_account_email
    recommendation_service = module.recommendation_service.service_account_email
    analytics_service      = module.analytics_service.service_account_email
    api_gateway           = module.api_gateway.service_account_email
  }
}

output "deployment_info" {
  description = "Deployment information"
  value = {
    environment = "production"
    region      = var.region
    project_id  = var.project_id
    timestamp   = timestamp()
    services = {
      ai_discovery_service = {
        url    = module.ai_discovery_service.service_url
        config = var.service_configs.ai_discovery_service
      }
      face_analysis_service = {
        url    = module.face_analysis_service.service_url
        config = var.service_configs.face_analysis_service
      }
      recommendation_service = {
        url    = module.recommendation_service.service_url
        config = var.service_configs.recommendation_service
      }
      analytics_service = {
        url    = module.analytics_service.service_url
        config = var.service_configs.analytics_service
      }
      api_gateway = {
        url    = module.api_gateway.service_url
        config = var.service_configs.api_gateway
      }
    }
  }
}