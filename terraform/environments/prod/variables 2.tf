# Variables for Production Environment

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
  description = "GCP alternative zone for HA services"
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
  default     = "10.0.0.0/20"
}

variable "domain_name" {
  description = "Domain name for the VARAi Platform"
  type        = string
  default     = "varai.ai"
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

variable "gcp_service_account_key" {
  description = "GCP service account key for MongoDB Atlas encryption at rest"
  type        = string
  sensitive   = true
}

variable "gcp_kms_key_version_id" {
  description = "GCP KMS key version ID for MongoDB Atlas encryption at rest"
  type        = string
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
}

variable "slo_availability_goal" {
  description = "Availability SLO goal (0.0-1.0)"
  type        = number
  default     = 0.9995
}

variable "slo_latency_goal" {
  description = "Latency SLO goal (0.0-1.0)"
  type        = number
  default     = 0.99
}

variable "slo_latency_threshold" {
  description = "Latency threshold for SLO in seconds"
  type        = number
  default     = 0.5
}