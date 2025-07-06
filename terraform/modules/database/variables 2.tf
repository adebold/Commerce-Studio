# Variables for Database Module

variable "environment" {
  description = "Environment name (e.g., development, staging, production)"
  type        = string
}

variable "atlas_org_id" {
  description = "MongoDB Atlas organization ID"
  type        = string
}

variable "atlas_region" {
  description = "MongoDB Atlas region"
  type        = string
  default     = "CENTRAL_US"
}

variable "atlas_instance_size" {
  description = "MongoDB Atlas instance size"
  type        = string
  default     = "M10"
}

variable "mongodb_version" {
  description = "MongoDB version"
  type        = string
  default     = "6.0"
}

variable "enable_backups" {
  description = "Enable MongoDB Atlas backups"
  type        = bool
  default     = true
}

variable "mongodb_username" {
  description = "MongoDB Atlas database username"
  type        = string
  sensitive   = true
}

variable "mongodb_password" {
  description = "MongoDB Atlas database password"
  type        = string
  sensitive   = true
}

variable "mongodb_database_name" {
  description = "MongoDB Atlas database name"
  type        = string
  default     = "varai"
}

variable "enable_network_peering" {
  description = "Enable MongoDB Atlas network peering"
  type        = bool
  default     = false
}

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "vpc_network_name" {
  description = "VPC network name"
  type        = string
}

variable "vpc_network_id" {
  description = "VPC network ID"
  type        = string
}

variable "atlas_cidr_block" {
  description = "CIDR block for MongoDB Atlas network container"
  type        = string
  default     = "10.8.0.0/18"
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access MongoDB Atlas"
  type        = string
  default     = "0.0.0.0/0"
}

variable "enable_encryption_at_rest" {
  description = "Enable MongoDB Atlas encryption at rest"
  type        = bool
  default     = false
}

variable "gcp_service_account_key" {
  description = "GCP service account key for MongoDB Atlas encryption at rest"
  type        = string
  sensitive   = true
  default     = ""
}

variable "gcp_kms_key_version_id" {
  description = "GCP KMS key version ID for MongoDB Atlas encryption at rest"
  type        = string
  default     = ""
}

variable "alert_email" {
  description = "Email address for MongoDB Atlas alerts"
  type        = string
}

variable "redis_tier" {
  description = "Redis tier (BASIC or STANDARD_HA)"
  type        = string
  default     = "BASIC"
}

variable "redis_memory_size_gb" {
  description = "Redis memory size in GB"
  type        = number
  default     = 1
}

variable "gcp_region" {
  description = "GCP region for Redis instance"
  type        = string
}

variable "gcp_zone" {
  description = "GCP zone for Redis instance"
  type        = string
}

variable "gcp_alternative_zone" {
  description = "GCP alternative zone for Redis instance (for HA)"
  type        = string
  default     = ""
}

variable "redis_version" {
  description = "Redis version"
  type        = string
  default     = "REDIS_6_X"
}

variable "redis_ip_range" {
  description = "IP range for Redis instance"
  type        = string
  default     = "10.0.0.0/29"
}