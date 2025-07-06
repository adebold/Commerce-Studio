# Variables for Staging Environment

variable "environment" {
  description = "Environment name (e.g., development, staging, production)"
  type        = string
}

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "gcp_zone" {
  description = "GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "gcp_alternative_zone" {
  description = "Alternative GCP zone for high availability"
  type        = string
  default     = "us-central1-b"
}

variable "kubernetes_config_path" {
  description = "Path to the Kubernetes config file"
  type        = string
  default     = "~/.kube/config"
}

variable "subnet_cidr" {
  description = "CIDR range for the subnet"
  type        = string
  default     = "10.1.0.0/20"
}

variable "domain_name" {
  description = "Domain name for the VARAi Platform"
  type        = string
  default     = "staging.varai.ai"
}

variable "mongodb_atlas_public_key" {
  description = "MongoDB Atlas public key"
  type        = string
  sensitive   = true
}

variable "mongodb_atlas_private_key" {
  description = "MongoDB Atlas private key"
  type        = string
  sensitive   = true
}

variable "mongodb_atlas_org_id" {
  description = "MongoDB Atlas organization ID"
  type        = string
}

variable "mongodb_atlas_region" {
  description = "MongoDB Atlas region"
  type        = string
  default     = "CENTRAL_US"
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

variable "alert_email" {
  description = "Email address for alerts"
  type        = string
}

variable "image_prefix" {
  description = "Prefix for container images"
  type        = string
  default     = "varai"
}

variable "image_tag" {
  description = "Tag for container images"
  type        = string
  default     = "staging"
}

variable "secret_key" {
  description = "Secret key for API service"
  type        = string
  sensitive   = true
}

variable "auth_secret" {
  description = "Secret for JWT authentication"
  type        = string
  sensitive   = true
}

variable "auth_issuer" {
  description = "Issuer for JWT authentication"
  type        = string
  default     = "varai-auth"
}

variable "auth_audience" {
  description = "Audience for JWT authentication"
  type        = string
  default     = "varai-api"
}

variable "deepseek_api_key" {
  description = "API key for DeepSeek service"
  type        = string
  sensitive   = true
}

variable "notification_channels" {
  description = "List of notification channel IDs for alerts"
  type        = list(string)
  default     = []
}

variable "gcp_service_account_key" {
  description = "GCP service account key for MongoDB Atlas encryption"
  type        = string
  sensitive   = true
}

variable "gcp_kms_key_version_id" {
  description = "GCP KMS key version ID for MongoDB Atlas encryption"
  type        = string
  sensitive   = true
}

variable "slo_availability_goal" {
  description = "Availability SLO goal (0.0-1.0)"
  type        = number
  default     = 0.995
}

variable "slo_latency_goal" {
  description = "Latency SLO goal (0.0-1.0)"
  type        = number
  default     = 0.98
}

variable "slo_latency_threshold" {
  description = "Latency threshold in seconds for SLO"
  type        = number
  default     = 0.8
}

variable "promotion_approvers" {
  description = "List of email addresses for promotion approvers"
  type        = list(string)
  default     = []
}

variable "config_repository" {
  description = "Git repository URL for configuration management"
  type        = string
  default     = "https://github.com/varai/config.git"
}

variable "enable_feature_flags" {
  description = "Enable feature flag system"
  type        = bool
  default     = true
}

variable "feature_flag_service" {
  description = "Feature flag service to use (e.g., 'launchdarkly', 'flagsmith')"
  type        = string
  default     = "flagsmith"
}

variable "feature_flag_api_key" {
  description = "API key for feature flag service"
  type        = string
  sensitive   = true
  default     = ""
}

variable "enable_blue_green_deployment" {
  description = "Enable blue/green deployment"
  type        = bool
  default     = true
}

variable "enable_canary_deployment" {
  description = "Enable canary deployment"
  type        = bool
  default     = false
}

variable "canary_traffic_percentage" {
  description = "Percentage of traffic to route to canary deployment (0-100)"
  type        = number
  default     = 0
}

variable "enable_automated_testing" {
  description = "Enable automated testing"
  type        = bool
  default     = true
}

variable "test_schedule" {
  description = "Cron schedule for automated tests"
  type        = string
  default     = "0 */4 * * *"  # Every 4 hours
}

variable "enable_performance_testing" {
  description = "Enable performance testing"
  type        = bool
  default     = true
}

variable "performance_test_users" {
  description = "Number of simulated users for performance tests"
  type        = number
  default     = 100
}

variable "enable_security_scanning" {
  description = "Enable security scanning"
  type        = bool
  default     = true
}

variable "security_scan_schedule" {
  description = "Cron schedule for security scans"
  type        = string
  default     = "0 0 * * *"  # Daily at midnight
}