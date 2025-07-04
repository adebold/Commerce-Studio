# Variables for Networking Module

variable "environment" {
  description = "Environment name (e.g., development, staging, production)"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "subnet_cidr" {
  description = "CIDR range for the subnet"
  type        = string
  default     = "10.0.0.0/20"
}

variable "enable_flow_logs" {
  description = "Enable VPC flow logs"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Domain name for the VARAi Platform"
  type        = string
}

variable "create_dns_zone" {
  description = "Create a new DNS zone"
  type        = bool
  default     = false
}

variable "dns_zone_name" {
  description = "Existing DNS zone name (if create_dns_zone is false)"
  type        = string
  default     = ""
}

variable "frontend_neg_id" {
  description = "Network Endpoint Group ID for frontend service"
  type        = string
}

variable "api_neg_id" {
  description = "Network Endpoint Group ID for API service"
  type        = string
}

variable "auth_neg_id" {
  description = "Network Endpoint Group ID for Auth service"
  type        = string
}