# Variables for Test Automation Module

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
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

variable "api_url" {
  description = "URL for the API service"
  type        = string
}

variable "auth_url" {
  description = "URL for the Auth service"
  type        = string
}

variable "frontend_url" {
  description = "URL for the Frontend service"
  type        = string
}

variable "test_schedule" {
  description = "Cron schedule for automated tests"
  type        = string
  default     = "0 */4 * * *"  # Every 4 hours
}

variable "notification_channels" {
  description = "List of notification channel IDs for alerts"
  type        = list(string)
  default     = []
}

variable "enable_smoke_tests" {
  description = "Enable smoke tests"
  type        = bool
  default     = true
}

variable "enable_integration_tests" {
  description = "Enable integration tests"
  type        = bool
  default     = true
}

variable "enable_performance_tests" {
  description = "Enable performance tests"
  type        = bool
  default     = true
}

variable "enable_security_scans" {
  description = "Enable security scans"
  type        = bool
  default     = true
}

variable "enable_data_validation" {
  description = "Enable data validation tests"
  type        = bool
  default     = true
}

variable "enable_ux_tests" {
  description = "Enable user experience tests"
  type        = bool
  default     = true
}

variable "test_results_bucket" {
  description = "GCS bucket name for test results"
  type        = string
}

variable "test_timeout" {
  description = "Timeout for tests in seconds"
  type        = number
  default     = 600  # 10 minutes
}

variable "api_key" {
  description = "API key for testing"
  type        = string
  default     = ""
  sensitive   = true
}

variable "test_user" {
  description = "Username for testing"
  type        = string
  default     = "test-user"
  sensitive   = true
}

variable "test_password" {
  description = "Password for testing"
  type        = string
  default     = ""
  sensitive   = true
}

variable "test_image_registry" {
  description = "Container registry for test images"
  type        = string
  default     = "ghcr.io"
}

variable "test_image_prefix" {
  description = "Prefix for test container images"
  type        = string
  default     = "varai"
}

variable "test_image_tag" {
  description = "Tag for test container images"
  type        = string
  default     = "latest"
}

variable "performance_test_users" {
  description = "Number of simulated users for performance tests"
  type        = number
  default     = 100
}

variable "security_scan_schedule" {
  description = "Cron schedule for security scans"
  type        = string
  default     = "0 0 * * *"  # Daily at midnight
}