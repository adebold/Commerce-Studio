terraform {
  required_providers {
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
      version = "~> 1.8.0" # Assuming a compatible version, might need adjustment
    }
  }
}
# Database Module for VARAi Platform

# MongoDB Atlas Project
resource "mongodbatlas_project" "varai_project" {
  name   = "varai-${var.environment}"
  org_id = var.atlas_org_id
}

# MongoDB Atlas Cluster
resource "mongodbatlas_cluster" "varai_cluster" {
  project_id = mongodbatlas_project.varai_project.id
  name       = "varai-${var.environment}"
  
  # Provider settings
  provider_name               = "GCP"
  provider_region_name        = var.atlas_region
  provider_instance_size_name = var.atlas_instance_size
  
  # Cluster tier
  cluster_type = "REPLICASET"
  
  # MongoDB version
  mongo_db_major_version = var.mongodb_version
  
  # Replication specs
  replication_specs {
    num_shards = 1
    
    regions_config {
      region_name     = var.atlas_region
      electable_nodes = 3
      priority        = 7
      read_only_nodes = 0
    }
  }
  
  # Backup options
  backup_enabled               = var.enable_backups
  pit_enabled                  = var.enable_backups
  auto_scaling_disk_gb_enabled = true
  
  # Advanced configuration
  advanced_configuration {
    javascript_enabled                   = true
    minimum_enabled_tls_protocol         = "TLS1_2"
    no_table_scan                        = false
    oplog_size_mb                        = 1024
    sample_size_bi_connector             = 100
    sample_refresh_interval_bi_connector = 300
  }
}

# MongoDB Atlas Database User
resource "mongodbatlas_database_user" "varai_user" {
  username           = var.mongodb_username
  password           = var.mongodb_password
  project_id         = mongodbatlas_project.varai_project.id
  auth_database_name = "admin"
  
  roles {
    role_name     = "readWrite"
    database_name = var.mongodb_database_name
  }
  
  roles {
    role_name     = "readAnyDatabase"
    database_name = "admin"
  }
  
  scopes {
    name = mongodbatlas_cluster.varai_cluster.name
    type = "CLUSTER"
  }
}

# MongoDB Atlas Network Peering Connection
resource "mongodbatlas_network_peering" "varai_peering" {
  count          = var.enable_network_peering ? 1 : 0
  project_id     = mongodbatlas_project.varai_project.id
  container_id   = mongodbatlas_cluster.varai_cluster.container_id
  provider_name  = "GCP"
  gcp_project_id = var.gcp_project_id
  network_name   = var.vpc_network_name
}

# MongoDB Atlas Network Container
resource "mongodbatlas_network_container" "varai_container" {
  count         = var.enable_network_peering ? 1 : 0
  project_id    = mongodbatlas_project.varai_project.id
  atlas_cidr_block = var.atlas_cidr_block
  provider_name = "GCP"
  region_name   = var.atlas_region
}

# MongoDB Atlas Project IP Access List
resource "mongodbatlas_project_ip_access_list" "varai_ip_list" {
  project_id = mongodbatlas_project.varai_project.id
  cidr_block = var.allowed_cidr_blocks
  comment    = "CIDR block for VARAi Platform - ${var.environment} environment"
}

# MongoDB Atlas Encryption at Rest
resource "mongodbatlas_encryption_at_rest" "varai_encryption" {
  count      = var.enable_encryption_at_rest ? 1 : 0
  project_id = mongodbatlas_project.varai_project.id
  
  google_cloud_kms {
    enabled                 = true
    service_account_key     = var.gcp_service_account_key
    key_version_resource_id = var.gcp_kms_key_version_id
  }
}

# MongoDB Atlas Cloud Backup Schedule
resource "mongodbatlas_cloud_backup_schedule" "varai_backup_schedule" {
  count        = var.enable_backups ? 1 : 0
  project_id   = mongodbatlas_project.varai_project.id
  cluster_name = mongodbatlas_cluster.varai_cluster.name
  
  reference_hour_of_day    = 3
  reference_minute_of_hour = 0
  
  # Daily backup policy
  policy_item_daily {
    frequency_interval = 1
    retention_unit     = "days"
    retention_value    = 7
  }
  
  # Weekly backup policy
  policy_item_weekly {
    frequency_interval = 1
    retention_unit     = "weeks"
    retention_value    = 4
  }
  
  # Monthly backup policy
  policy_item_monthly {
    frequency_interval = 1
    retention_unit     = "months"
    retention_value    = 12
  }
}

# MongoDB Atlas Alerts
resource "mongodbatlas_alert_configuration" "cpu_alert" {
  project_id = mongodbatlas_project.varai_project.id
  
  event_type = "CLUSTER_CPU_HIGH"
  enabled    = true
  
  notification {
    type_name     = "EMAIL"
    email_address = var.alert_email
  }
  
  threshold = {
    operator    = "GREATER_THAN"
    units       = "RAW"
    threshold   = 80
    threshold_2 = 0
  }
}

resource "mongodbatlas_alert_configuration" "memory_alert" {
  project_id = mongodbatlas_project.varai_project.id
  
  event_type = "CLUSTER_MEMORY_HIGH"
  enabled    = true
  
  notification {
    type_name     = "EMAIL"
    email_address = var.alert_email
  }
  
  threshold = {
    operator    = "GREATER_THAN"
    units       = "RAW"
    threshold   = 80
    threshold_2 = 0
  }
}

resource "mongodbatlas_alert_configuration" "disk_alert" {
  project_id = mongodbatlas_project.varai_project.id
  
  event_type = "CLUSTER_STORAGE_HIGH"
  enabled    = true
  
  notification {
    type_name     = "EMAIL"
    email_address = var.alert_email
  }
  
  threshold = {
    operator    = "GREATER_THAN"
    units       = "RAW"
    threshold   = 80
    threshold_2 = 0
  }
}

# Redis Instance (using Google Cloud Memorystore)
resource "google_redis_instance" "varai_redis" {
  name           = "varai-redis-${var.environment}"
  tier           = var.redis_tier
  memory_size_gb = var.redis_memory_size_gb
  
  region                  = var.gcp_region
  location_id             = var.gcp_zone
  alternative_location_id = var.gcp_alternative_zone
  
  authorized_network = var.vpc_network_id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"
  
  redis_version     = var.redis_version
  display_name      = "VARAi Redis - ${var.environment}"
  reserved_ip_range = var.redis_ip_range
  
  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 2
        minutes = 0
      }
    }
  }
  
  labels = {
    environment = var.environment
    managed-by  = "terraform"
  }
}