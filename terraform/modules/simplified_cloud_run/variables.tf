# Variables for the Simplified Cloud Run module

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
      vpc_connector_cidr    = null
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

variable "service_account_roles" {
  description = "List of IAM roles to assign to the service account"
  type        = list(string)
  default     = [
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/secretmanager.secretAccessor"
  ]
}

variable "enable_iam_roles" {
  description = "Whether to enable IAM role assignments for the service account"
  type        = bool
  default     = true
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