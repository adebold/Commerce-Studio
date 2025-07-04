# Variables for Monitoring Module

variable "environment" {
  description = "Environment name (e.g., development, staging, production)"
  type        = string
}

variable "kubernetes_namespace" {
  description = "Kubernetes namespace for VARAi resources"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the VARAi Platform"
  type        = string
}

variable "notification_channels" {
  description = "List of notification channel IDs for alerts"
  type        = list(string)
  default     = []
}

variable "api_memory_limit" {
  description = "Memory limit for API service in bytes"
  type        = number
  default     = 536870912  # 512Mi in bytes
}

variable "enable_log_export" {
  description = "Enable exporting logs to BigQuery"
  type        = bool
  default     = false
}

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "bigquery_location" {
  description = "BigQuery dataset location"
  type        = string
  default     = "US"
}

variable "log_retention_days" {
  description = "Number of days to retain logs in BigQuery"
  type        = number
  default     = 30
}

variable "deploy_grafana" {
  description = "Deploy Grafana dashboard"
  type        = bool
  default     = false
}

variable "deploy_prometheus" {
  description = "Deploy Prometheus rules"
  type        = bool
  default     = false
}

variable "monitoring_namespace" {
  description = "Kubernetes namespace for monitoring resources"
  type        = string
  default     = "monitoring"
}

variable "alert_cpu_threshold" {
  description = "CPU usage threshold for alerts (0.0-1.0)"
  type        = number
  default     = 0.8
}

variable "alert_memory_threshold" {
  description = "Memory usage threshold for alerts (0.0-1.0)"
  type        = number
  default     = 0.8
}

variable "alert_error_rate_threshold" {
  description = "HTTP error rate threshold for alerts (0.0-1.0)"
  type        = number
  default     = 0.05
}

variable "alert_latency_threshold" {
  description = "HTTP latency threshold for alerts in milliseconds"
  type        = number
  default     = 1000
}

variable "uptime_check_period" {
  description = "Period for uptime checks in seconds"
  type        = string
  default     = "60s"
}

variable "uptime_check_timeout" {
  description = "Timeout for uptime checks in seconds"
  type        = string
  default     = "10s"
}

variable "slo_availability_goal" {
  description = "Availability SLO goal (0.0-1.0)"
  type        = number
  default     = 0.99
}

variable "slo_latency_goal" {
  description = "Latency SLO goal (0.0-1.0)"
  type        = number
  default     = 0.95
}

variable "slo_latency_threshold" {
  description = "Latency threshold for SLO in seconds"
  type        = number
  default     = 1
}

variable "slo_rolling_period_days" {
  description = "Rolling period for SLOs in days"
  type        = number
  default     = 30
}