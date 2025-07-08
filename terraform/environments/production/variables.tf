variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "ml-datadriven-recos"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "registry" {
  description = "Container registry URL"
  type        = string
  default     = "gcr.io/ml-datadriven-recos"
}

# VPC Configuration
variable "vpc_config" {
  description = "VPC network configuration"
  type = object({
    name                    = string
    auto_create_subnetworks = bool
    routing_mode           = string
    subnets = list(object({
      name          = string
      ip_cidr_range = string
      region        = string
    }))
  })
  default = {
    name                    = "varai-vpc-prod"
    auto_create_subnetworks = false
    routing_mode           = "GLOBAL"
    subnets = [
      {
        name          = "varai-subnet-prod"
        ip_cidr_range = "10.0.0.0/24"
        region        = "us-central1"
      }
    ]
  }
}

# Database Configuration
variable "database_config" {
  description = "Cloud SQL database configuration"
  type = object({
    tier                   = string
    disk_size             = number
    disk_type             = string
    backup_enabled        = bool
    point_in_time_recovery = bool
    high_availability     = bool
    deletion_protection   = bool
    database_version      = string
  })
  default = {
    tier                   = "db-custom-4-16384"
    disk_size             = 100
    disk_type             = "PD_SSD"
    backup_enabled        = true
    point_in_time_recovery = true
    high_availability     = true
    deletion_protection   = true
    database_version      = "POSTGRES_14"
  }
}

# Redis Configuration
variable "redis_config" {
  description = "Redis cache configuration"
  type = object({
    memory_size_gb     = number
    tier              = string
    redis_version     = string
    auth_enabled      = bool
    transit_encryption = bool
  })
  default = {
    memory_size_gb     = 4
    tier              = "STANDARD_HA"
    redis_version     = "REDIS_7_0"
    auth_enabled      = true
    transit_encryption = true
  }
}

# Service Configurations
variable "service_configs" {
  description = "Configuration for each Cloud Run service"
  type = map(object({
    min_instances = number
    max_instances = number
    cpu          = string
    memory       = string
    concurrency  = number
    timeout      = number
  }))
  default = {
    ai_discovery_service = {
      min_instances = 3
      max_instances = 20
      cpu          = "2"
      memory       = "4Gi"
      concurrency  = 100
      timeout      = 300
    }
    face_analysis_service = {
      min_instances = 2
      max_instances = 15
      cpu          = "4"
      memory       = "8Gi"
      concurrency  = 50
      timeout      = 600
    }
    recommendation_service = {
      min_instances = 3
      max_instances = 25
      cpu          = "2"
      memory       = "4Gi"
      concurrency  = 100
      timeout      = 300
    }
    analytics_service = {
      min_instances = 2
      max_instances = 10
      cpu          = "1"
      memory       = "2Gi"
      concurrency  = 150
      timeout      = 300
    }
    api_gateway = {
      min_instances = 3
      max_instances = 30
      cpu          = "2"
      memory       = "4Gi"
      concurrency  = 200
      timeout      = 300
    }
  }
}

# SSL Configuration
variable "ssl_config" {
  description = "SSL certificate configuration"
  type = object({
    domains = list(string)
    managed = bool
  })
  default = {
    domains = ["api.varai.ai", "cdn.varai.ai"]
    managed = true
  }
}

# CDN Configuration
variable "cdn_config" {
  description = "CDN bucket configuration"
  type = object({
    name          = string
    location      = string
    storage_class = string
    versioning    = bool
    lifecycle_rules = list(object({
      action = object({
        type = string
      })
      condition = object({
        age = number
      })
    }))
  })
  default = {
    name          = "varai-cdn-production"
    location      = "US"
    storage_class = "STANDARD"
    versioning    = true
    lifecycle_rules = [
      {
        action = {
          type = "Delete"
        }
        condition = {
          age = 365
        }
      }
    ]
  }
}

# Monitoring Configuration
variable "monitoring_config" {
  description = "Monitoring and alerting configuration"
  type = object({
    notification_channels = list(string)
    alert_policies = list(object({
      display_name = string
      conditions = list(object({
        display_name = string
        filter       = string
        comparison   = string
        threshold    = number
        duration     = string
      }))
    }))
  })
  default = {
    notification_channels = ["projects/ml-datadriven-recos/notificationChannels/slack-alerts"]
    alert_policies = [
      {
        display_name = "High Error Rate"
        conditions = [
          {
            display_name = "Error rate > 5%"
            filter       = "resource.type=\"cloud_run_revision\""
            comparison   = "COMPARISON_GREATER_THAN"
            threshold    = 0.05
            duration     = "300s"
          }
        ]
      },
      {
        display_name = "High Response Time"
        conditions = [
          {
            display_name = "Response time > 5s"
            filter       = "resource.type=\"cloud_run_revision\""
            comparison   = "COMPARISON_GREATER_THAN"
            threshold    = 5000
            duration     = "300s"
          }
        ]
      },
      {
        display_name = "Low Availability"
        conditions = [
          {
            display_name = "Availability < 99%"
            filter       = "resource.type=\"cloud_run_revision\""
            comparison   = "COMPARISON_LESS_THAN"
            threshold    = 0.99
            duration     = "600s"
          }
        ]
      }
    ]
  }
}

# Security Configuration
variable "security_config" {
  description = "Security configuration"
  type = object({
    enable_binary_authorization = bool
    enable_pod_security_policy  = bool
    enable_network_policy       = bool
    allowed_source_ranges       = list(string)
  })
  default = {
    enable_binary_authorization = true
    enable_pod_security_policy  = true
    enable_network_policy       = true
    allowed_source_ranges       = ["0.0.0.0/0"]
  }
}