# Variables for Stripe Integration Module

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud Region"
  type        = string
  default     = "us-central1"
}

variable "domain_name" {
  description = "Domain name for webhook endpoints"
  type        = string
}

variable "stripe_publishable_key" {
  description = "Stripe publishable key"
  type        = string
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "Stripe secret key"
  type        = string
  sensitive   = true
}

variable "service_accounts" {
  description = "List of service accounts that need access to Stripe secrets"
  type        = list(string)
  default     = []
}

variable "cloud_run_service_account" {
  description = "Service account for Cloud Run webhook processor"
  type        = string
  default     = null
}

variable "image_tag" {
  description = "Docker image tag for webhook processor"
  type        = string
  default     = "latest"
}

variable "enable_monitoring" {
  description = "Enable monitoring and alerting for Stripe services"
  type        = bool
  default     = true
}

variable "notification_channels" {
  description = "List of notification channel IDs for alerts"
  type        = list(string)
  default     = []
}

variable "webhook_events" {
  description = "List of Stripe webhook events to listen for"
  type        = list(string)
  default = [
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "customer.created",
    "customer.updated",
    "customer.deleted"
  ]
}

variable "token_pricing" {
  description = "Token pricing configuration"
  type = object({
    starter = object({
      monthly_price = number
      token_count   = number
    })
    professional = object({
      monthly_price = number
      token_count   = number
    })
    enterprise = object({
      monthly_price = number
      token_count   = string
    })
    one_time_packages = list(object({
      price       = number
      token_count = number
    }))
  })
  default = {
    starter = {
      monthly_price = 2900  # $29.00
      token_count   = 1000
    }
    professional = {
      monthly_price = 19900  # $199.00
      token_count   = 10000
    }
    enterprise = {
      monthly_price = 99900  # $999.00
      token_count   = "unlimited"
    }
    one_time_packages = [
      {
        price       = 500   # $5.00
        token_count = 100
      },
      {
        price       = 2000  # $20.00
        token_count = 500
      },
      {
        price       = 3500  # $35.00
        token_count = 1000
      }
    ]
  }
}

variable "ai_service_costs" {
  description = "Token costs for AI services"
  type = map(number)
  default = {
    virtual_try_on      = 5
    face_analysis       = 3
    recommendations     = 2
    pd_calculator       = 1
    style_advisor       = 4
    inventory_optimizer = 10
  }
}

variable "webhook_processor_config" {
  description = "Configuration for webhook processor Cloud Run service"
  type = object({
    cpu_limit      = string
    memory_limit   = string
    cpu_request    = string
    memory_request = string
    min_scale      = number
    max_scale      = number
  })
  default = {
    cpu_limit      = "1000m"
    memory_limit   = "512Mi"
    cpu_request    = "100m"
    memory_request = "128Mi"
    min_scale      = 1
    max_scale      = 10
  }
}

variable "common_labels" {
  description = "Common labels to apply to all resources"
  type        = map(string)
  default = {
    managed_by = "terraform"
    service    = "stripe"
  }
}