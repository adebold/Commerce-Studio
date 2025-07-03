# Main Terraform configuration for VARAi Platform

terraform {
  required_version = ">= 1.0.0"
  
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0.0"
    }
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
      version = "~> 1.8.0" # Use the same version as in the module
    }
  }
  
  backend "gcs" {
    bucket = "varai-terraform-state-dev"
    prefix = "terraform/state" # Optional: Add a prefix to organize state files
  }
}

# Provider configurations will be set in environment-specific files

variable "environment" {
  description = "Environment name (e.g., development, staging, production)"
  type        = string
}