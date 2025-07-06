terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
  
  backend "gcs" {
    bucket = "varai-terraform-state-prod"
    prefix = "ai-discovery/production"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Local variables
locals {
  environment = "production"
  labels = {
    environment = local.environment
    project     = "ai-discovery"
    managed-by  = "terraform"
  }
}

# VPC Network
module "networking" {
  source = "../../modules/networking"
  
  project_id  = var.project_id
  environment = local.environment
  region      = var.region
  
  vpc_config = var.vpc_config
  labels     = local.labels
}

# Cloud SQL Database
module "database" {
  source = "../../modules/database"
  
  project_id     = var.project_id
  environment    = local.environment
  region         = var.region
  network_id     = module.networking.vpc_id
  
  database_config = var.database_config
  labels         = local.labels
}

# Redis Cache
module "redis" {
  source = "../../modules/redis"
  
  project_id  = var.project_id
  environment = local.environment
  region      = var.region
  network_id  = module.networking.vpc_id
  
  redis_config = var.redis_config
  labels      = local.labels
}

# AI Discovery Service
module "ai_discovery_service" {
  source = "../../modules/cloud-run-service"
  
  service_name = "ai-discovery-service"
  project_id   = var.project_id
  region       = var.region
  environment  = local.environment
  
  image = "${var.registry}/ai-discovery-service:latest"
  
  service_config = var.service_configs.ai_discovery_service
  
  environment_variables = {
    NODE_ENV     = "production"
    ENVIRONMENT  = local.environment
    DATABASE_URL = module.database.connection_string
    REDIS_URL    = module.redis.connection_string
  }
  
  secret_environment_variables = {
    VERTEX_AI_CREDENTIALS = {
      secret_name = "vertex-ai-credentials"
      version     = "latest"
    }
    JWT_SECRET = {
      secret_name = "jwt-secret"
      version     = "latest"
    }
  }
  
  labels = local.labels
}

# Face Analysis Service
module "face_analysis_service" {
  source = "../../modules/cloud-run-service"
  
  service_name = "face-analysis-service"
  project_id   = var.project_id
  region       = var.region
  environment  = local.environment
  
  image = "${var.registry}/face-analysis-service:latest"
  
  service_config = var.service_configs.face_analysis_service
  
  environment_variables = {
    NODE_ENV    = "production"
    ENVIRONMENT = local.environment
    REDIS_URL   = module.redis.connection_string
  }
  
  secret_environment_variables = {
    MEDIAPIPE_API_KEY = {
      secret_name = "mediapipe-api-key"
      version     = "latest"
    }
  }
  
  labels = local.labels
}

# Recommendation Service
module "recommendation_service" {
  source = "../../modules/cloud-run-service"
  
  service_name = "recommendation-service"
  project_id   = var.project_id
  region       = var.region
  environment  = local.environment
  
  image = "${var.registry}/recommendation-service:latest"
  
  service_config = var.service_configs.recommendation_service
  
  environment_variables = {
    NODE_ENV     = "production"
    ENVIRONMENT  = local.environment
    DATABASE_URL = module.database.connection_string
    REDIS_URL    = module.redis.connection_string
  }
  
  secret_environment_variables = {
    VERTEX_AI_CREDENTIALS = {
      secret_name = "vertex-ai-credentials"
      version     = "latest"
    }
    ML_MODEL_API_KEY = {
      secret_name = "ml-model-api-key"
      version     = "latest"
    }
  }
  
  labels = local.labels
}

# Analytics Service
module "analytics_service" {
  source = "../../modules/cloud-run-service"
  
  service_name = "analytics-service"
  project_id   = var.project_id
  region       = var.region
  environment  = local.environment
  
  image = "${var.registry}/analytics-service:latest"
  
  service_config = var.service_configs.analytics_service
  
  environment_variables = {
    NODE_ENV     = "production"
    ENVIRONMENT  = local.environment
    DATABASE_URL = module.database.connection_string
    REDIS_URL    = module.redis.connection_string
  }
  
  secret_environment_variables = {
    ANALYTICS_API_KEY = {
      secret_name = "analytics-api-key"
      version     = "latest"
    }
  }
  
  labels = local.labels
}

# API Gateway
module "api_gateway" {
  source = "../../modules/cloud-run-service"
  
  service_name = "api-gateway"
  project_id   = var.project_id
  region       = var.region
  environment  = local.environment
  
  image = "${var.registry}/api-gateway:latest"
  
  service_config = var.service_configs.api_gateway
  
  environment_variables = {
    NODE_ENV                    = "production"
    ENVIRONMENT                 = local.environment
    AI_DISCOVERY_SERVICE_URL    = module.ai_discovery_service.service_url
    FACE_ANALYSIS_SERVICE_URL   = module.face_analysis_service.service_url
    RECOMMENDATION_SERVICE_URL  = module.recommendation_service.service_url
    ANALYTICS_SERVICE_URL       = module.analytics_service.service_url
    REDIS_URL                   = module.redis.connection_string
  }
  
  secret_environment_variables = {
    JWT_SECRET = {
      secret_name = "jwt-secret"
      version     = "latest"
    }
    API_GATEWAY_SECRET = {
      secret_name = "api-gateway-secret"
      version     = "latest"
    }
  }
  
  labels = local.labels
}

# Load Balancer
module "load_balancer" {
  source = "../../modules/load-balancer"
  
  project_id  = var.project_id
  environment = local.environment
  region      = var.region
  
  backend_services = {
    api-gateway = {
      service_url = module.api_gateway.service_url
      health_check = {
        path                = "/health"
        port                = 8080
        check_interval_sec  = 30
        timeout_sec         = 10
        healthy_threshold   = 2
        unhealthy_threshold = 3
      }
    }
  }
  
  ssl_config = var.ssl_config
  labels     = local.labels
}

# CDN for Widget Assets
module "cdn" {
  source = "../../modules/cdn"
  
  project_id  = var.project_id
  environment = local.environment
  
  bucket_config = var.cdn_config
  labels       = local.labels
}

# Monitoring and Alerting
module "monitoring" {
  source = "../../modules/monitoring"
  
  project_id  = var.project_id
  environment = local.environment
  
  services = [
    module.ai_discovery_service.service_name,
    module.face_analysis_service.service_name,
    module.recommendation_service.service_name,
    module.analytics_service.service_name,
    module.api_gateway.service_name
  ]
  
  monitoring_config = var.monitoring_config
  labels           = local.labels
}

# Security Configuration
module "security" {
  source = "../../modules/security"
  
  project_id  = var.project_id
  environment = local.environment
  
  security_config = var.security_config
  labels         = local.labels
}