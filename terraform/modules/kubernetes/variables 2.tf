# Variables for Kubernetes Module

variable "environment" {
  description = "Environment name (e.g., development, staging, production)"
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace for VARAi resources"
  type        = string
}

variable "container_registry" {
  description = "Container registry URL"
  type        = string
  default     = "ghcr.io"
}

variable "image_prefix" {
  description = "Prefix for container images"
  type        = string
}

variable "image_tag" {
  description = "Tag for container images"
  type        = string
}

variable "api_replicas" {
  description = "Number of replicas for API service"
  type        = number
  default     = 1
}

variable "auth_replicas" {
  description = "Number of replicas for Auth service"
  type        = number
  default     = 1
}

variable "frontend_replicas" {
  description = "Number of replicas for Frontend service"
  type        = number
  default     = 1
}

variable "api_resources" {
  description = "Resource limits and requests for API service"
  type = object({
    cpu_limit     = string
    memory_limit  = string
    cpu_request   = string
    memory_request = string
  })
  default = {
    cpu_limit     = "500m"
    memory_limit  = "512Mi"
    cpu_request   = "100m"
    memory_request = "128Mi"
  }
}

variable "auth_resources" {
  description = "Resource limits and requests for Auth service"
  type = object({
    cpu_limit     = string
    memory_limit  = string
    cpu_request   = string
    memory_request = string
  })
  default = {
    cpu_limit     = "300m"
    memory_limit  = "256Mi"
    cpu_request   = "100m"
    memory_request = "128Mi"
  }
}

variable "frontend_resources" {
  description = "Resource limits and requests for Frontend service"
  type = object({
    cpu_limit     = string
    memory_limit  = string
    cpu_request   = string
    memory_request = string
  })
  default = {
    cpu_limit     = "200m"
    memory_limit  = "256Mi"
    cpu_request   = "100m"
    memory_request = "128Mi"
  }
}

variable "mongodb_url" {
  description = "MongoDB connection URL"
  type        = string
}

variable "redis_host" {
  description = "Redis host"
  type        = string
}

variable "redis_port" {
  description = "Redis port"
  type        = string
  default     = "6379"
}

variable "api_base_url" {
  description = "Base URL for API service"
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
}

variable "auth_audience" {
  description = "Audience for JWT authentication"
  type        = string
}

variable "deepseek_api_key" {
  description = "API key for DeepSeek service"
  type        = string
  sensitive   = true
}

variable "ingress_host" {
  description = "Hostname for Ingress resource"
  type        = string
}

variable "enable_autoscaling" {
  description = "Enable Horizontal Pod Autoscaler"
  type        = bool
  default     = false
}

variable "api_autoscaling" {
  description = "Autoscaling configuration for API service"
  type = object({
    min_replicas    = number
    max_replicas    = number
    cpu_threshold   = number
    memory_threshold = number
  })
  default = {
    min_replicas    = 1
    max_replicas    = 5
    cpu_threshold   = 80
    memory_threshold = 80
  }
}

variable "auth_autoscaling" {
  description = "Autoscaling configuration for Auth service"
  type = object({
    min_replicas    = number
    max_replicas    = number
    cpu_threshold   = number
    memory_threshold = number
  })
  default = {
    min_replicas    = 1
    max_replicas    = 3
    cpu_threshold   = 80
    memory_threshold = 80
  }
}

variable "frontend_autoscaling" {
  description = "Autoscaling configuration for Frontend service"
  type = object({
    min_replicas    = number
    max_replicas    = number
    cpu_threshold   = number
    memory_threshold = number
  })
  default = {
    min_replicas    = 1
    max_replicas    = 3
    cpu_threshold   = 80
    memory_threshold = 80
  }
}