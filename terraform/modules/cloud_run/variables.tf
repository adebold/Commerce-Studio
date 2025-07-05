# Variables for the Cloud Run module

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "service_name" {
  description = "The name of the service to deploy"
  type        = string
}

variable "environment" {
  description = "The environment (dev, staging, prod)"
  type        = string
}

variable "container_registry" {
  description = "The container registry to use (e.g., gcr.io, us-docker.pkg.dev)"
  type        = string
  default     = "gcr.io"
}

variable "image_prefix" {
  description = "The prefix for the container image (usually the project ID)"
  type        = string
}

variable "image_tag" {
  description = "The tag for the container image"
  type        = string
  default     = "latest"
}

variable "regions" {
  description = "Map of regions to deploy to with region-specific configurations"
  type = map(object({
    region                = string
    environment_variables = map(string)
    vpc_connector_cidr    = optional(string)
  }))
  default = {
    us = {
      region                = "us-central1"
      environment_variables = {}
      vpc_connector_cidr    = "10.8.0.0/28"
    }
  }
}

variable "resources" {
  description = "Resource limits for the service"
  type = object({
    cpu_limit     = string
    memory_limit  = string
  })
  default = {
    cpu_limit     = "1"
    memory_limit  = "512Mi"
  }
}

variable "secrets" {
  description = "Map of secret names to their values"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "service_account_roles" {
  description = "List of IAM roles to assign to the service account"
  type        = list(string)
  default     = [
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/secretmanager.secretAccessor"
  ]
}

variable "container_concurrency" {
  description = "The maximum number of concurrent requests per container instance"
  type        = number
  default     = 80
}

variable "timeout_seconds" {
  description = "The maximum amount of time a request has to complete"
  type        = number
  default     = 300
}

variable "min_instances" {
  description = "The minimum number of container instances to keep running"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "The maximum number of container instances to scale to"
  type        = number
  default     = 100
}

variable "allow_public_access" {
  description = "Whether to allow public access to the service"
  type        = bool
  default     = false
}

variable "allowed_invokers" {
  description = "List of members that can invoke the service (if not public)"
  type        = list(string)
  default     = []
}

variable "ingress_setting" {
  description = "The ingress settings for the service"
  type        = string
  default     = "all"
  validation {
    condition     = contains(["all", "internal", "internal-and-cloud-load-balancing"], var.ingress_setting)
    error_message = "Ingress setting must be one of: all, internal, internal-and-cloud-load-balancing."
  }
}

variable "enable_domain_mapping" {
  description = "Whether to enable domain mapping for the service"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "The domain name to map to the service"
  type        = string
  default     = ""
}

variable "enable_vpc_connector" {
  description = "Whether to enable VPC connector for the service"
  type        = bool
  default     = false
}

variable "vpc_network" {
  description = "The VPC network to connect to"
  type        = string
  default     = "default"
}

variable "enable_encryption_at_rest" {
  description = "Whether to enable CMEK encryption for secrets"
  type        = bool
  default     = false
}

variable "encryption_key" {
  description = "The KMS key to use for encryption"
  type        = string
  default     = ""
}

variable "regulatory_compliance" {
  description = "Regulatory compliance settings"
  type = object({
    enable_gdpr_compliance      = bool
    enable_healthcare_compliance = bool
    data_residency_required     = bool
    audit_logging_enabled       = bool
  })
  default = {
    enable_gdpr_compliance      = false
    enable_healthcare_compliance = false
    data_residency_required     = false
    audit_logging_enabled       = true
  }
}