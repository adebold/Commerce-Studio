# Variables for Promotion Process Module

variable "environment" {
  description = "Source environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "target_environment" {
  description = "Target environment name (e.g., staging, prod)"
  type        = string
}

variable "kubernetes_namespace" {
  description = "Kubernetes namespace for the application"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "approval_required" {
  description = "Whether approval is required for promotion"
  type        = bool
  default     = true
}

variable "approvers" {
  description = "List of email addresses for promotion approvers"
  type        = list(string)
  default     = []
}

variable "promotion_checklist" {
  description = "List of items to check before promotion"
  type        = list(string)
  default     = []
}

variable "artifact_registry" {
  description = "Container registry for artifacts"
  type        = string
}

variable "config_repository" {
  description = "Git repository URL for configuration management"
  type        = string
}

variable "database_migration_strategy" {
  description = "Strategy for database migration (e.g., 'blue-green', 'incremental')"
  type        = string
  default     = "blue-green"
}

variable "notification_channels" {
  description = "List of notification channel IDs for alerts"
  type        = list(string)
  default     = []
}

variable "db_migration_function_source" {
  description = "Path to the database migration function source code"
  type        = string
  default     = "functions/db_migration.zip"
}

variable "source_db_connection" {
  description = "Connection string for the source database"
  type        = string
  sensitive   = true
  default     = ""
}

variable "target_db_connection" {
  description = "Connection string for the target database"
  type        = string
  sensitive   = true
  default     = ""
}

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "enable_feature_flag_promotion" {
  description = "Enable feature flag promotion"
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

variable "enable_rollback" {
  description = "Enable automatic rollback on promotion failure"
  type        = bool
  default     = true
}

variable "rollback_timeout" {
  description = "Timeout for rollback in seconds"
  type        = number
  default     = 300  # 5 minutes
}

variable "enable_canary_promotion" {
  description = "Enable canary promotion"
  type        = bool
  default     = false
}

variable "canary_promotion_percentage" {
  description = "Percentage of traffic to route to new version during canary promotion (0-100)"
  type        = number
  default     = 10
}

variable "canary_promotion_duration" {
  description = "Duration of canary promotion in seconds"
  type        = number
  default     = 3600  # 1 hour
}

variable "enable_promotion_metrics" {
  description = "Enable promotion metrics collection"
  type        = bool
  default     = true
}

variable "promotion_metrics_retention_days" {
  description = "Number of days to retain promotion metrics"
  type        = number
  default     = 90
}

variable "enable_promotion_logs" {
  description = "Enable promotion logs collection"
  type        = bool
  default     = true
}

variable "promotion_logs_retention_days" {
  description = "Number of days to retain promotion logs"
  type        = number
  default     = 30
}

variable "enable_promotion_notifications" {
  description = "Enable promotion notifications"
  type        = bool
  default     = true
}

variable "promotion_notification_channels" {
  description = "List of notification channels for promotion events"
  type        = list(string)
  default     = []
}

variable "enable_promotion_audit" {
  description = "Enable promotion audit trail"
  type        = bool
  default     = true
}

variable "promotion_audit_retention_days" {
  description = "Number of days to retain promotion audit trail"
  type        = number
  default     = 365  # 1 year
}