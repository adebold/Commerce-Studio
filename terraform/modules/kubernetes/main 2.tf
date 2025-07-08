# Kubernetes Module for VARAi Platform

resource "kubernetes_namespace" "varai" {
  metadata {
    name = var.namespace
    
    labels = {
      environment = var.environment
      managed-by = "terraform"
    }
  }
}

# Kubernetes deployments for VARAi services
resource "kubernetes_deployment" "api" {
  metadata {
    name      = "api"
    namespace = kubernetes_namespace.varai.metadata[0].name
    
    labels = {
      app         = "api"
      environment = var.environment
      managed-by  = "terraform"
    }
  }
  
  spec {
    replicas = var.api_replicas
    
    selector {
      match_labels = {
        app = "api"
      }
    }
    
    template {
      metadata {
        labels = {
          app = "api"
        }
      }
      
      spec {
        container {
          name  = "api"
          image = "${var.container_registry}/${var.image_prefix}/api:${var.image_tag}"
          
          port {
            container_port = 3000
          }
          
          resources {
            limits = {
              cpu    = var.api_resources.cpu_limit
              memory = var.api_resources.memory_limit
            }
            requests = {
              cpu    = var.api_resources.cpu_request
              memory = var.api_resources.memory_request
            }
          }
          
          env_from {
            config_map_ref {
              name = kubernetes_config_map.varai.metadata[0].name
            }
          }
          
          env_from {
            secret_ref {
              name = kubernetes_secret.varai.metadata[0].name
            }
          }
          
          liveness_probe {
            http_get {
              path = "/health"
              port = 3000
            }
            
            initial_delay_seconds = 30
            period_seconds        = 10
          }
          
          readiness_probe {
            http_get {
              path = "/health"
              port = 3000
            }
            
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }
      }
    }
  }
}

# Similar deployment resources for auth, frontend, etc.

# Kubernetes services for VARAi services
resource "kubernetes_service" "api" {
  metadata {
    name      = "api"
    namespace = kubernetes_namespace.varai.metadata[0].name
    
    labels = {
      app         = "api"
      environment = var.environment
      managed-by  = "terraform"
    }
  }
  
  spec {
    selector = {
      app = "api"
    }
    
    port {
      port        = 80
      target_port = 3000
    }
    
    type = "ClusterIP"
  }
}

# Similar service resources for auth, frontend, etc.

# Kubernetes ConfigMap for VARAi configuration
resource "kubernetes_config_map" "varai" {
  metadata {
    name      = "varai-config"
    namespace = kubernetes_namespace.varai.metadata[0].name
    
    labels = {
      environment = var.environment
      managed-by  = "terraform"
    }
  }
  
  data = {
    NODE_ENV     = var.environment
    MONGODB_URL  = var.mongodb_url
    REDIS_HOST   = var.redis_host
    REDIS_PORT   = var.redis_port
    API_BASE_URL = var.api_base_url
  }
}

# Kubernetes Secret for VARAi sensitive configuration
resource "kubernetes_secret" "varai" {
  metadata {
    name      = "varai-secrets"
    namespace = kubernetes_namespace.varai.metadata[0].name
    
    labels = {
      environment = var.environment
      managed-by  = "terraform"
    }
  }
  
  data = {
    SECRET_KEY      = var.secret_key
    AUTH_SECRET     = var.auth_secret
    AUTH_ISSUER     = var.auth_issuer
    AUTH_AUDIENCE   = var.auth_audience
    DEEPSEEK_API_KEY = var.deepseek_api_key
  }
  
  type = "Opaque"
}

# Kubernetes Ingress for VARAi services
resource "kubernetes_ingress_v1" "varai" {
  metadata {
    name      = "varai-ingress"
    namespace = kubernetes_namespace.varai.metadata[0].name
    
    labels = {
      environment = var.environment
      managed-by  = "terraform"
    }
    
    annotations = {
      "kubernetes.io/ingress.class"                 = "nginx"
      "nginx.ingress.kubernetes.io/ssl-redirect"    = "true"
      "nginx.ingress.kubernetes.io/proxy-body-size" = "50m"
    }
  }
  
  spec {
    rule {
      host = var.ingress_host
      
      http {
        path {
          path      = "/api"
          path_type = "Prefix"
          
          backend {
            service {
              name = kubernetes_service.api.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
        
        # Similar path blocks for auth, frontend, etc.
      }
    }
    
    tls {
      hosts       = [var.ingress_host]
      secret_name = "varai-tls"
    }
  }
}

# Horizontal Pod Autoscaler for API service
resource "kubernetes_horizontal_pod_autoscaler_v2" "api" {
  count = var.enable_autoscaling ? 1 : 0
  
  metadata {
    name      = "api-hpa"
    namespace = kubernetes_namespace.varai.metadata[0].name
  }
  
  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.api.metadata[0].name
    }
    
    min_replicas = var.api_autoscaling.min_replicas
    max_replicas = var.api_autoscaling.max_replicas
    
    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = var.api_autoscaling.cpu_threshold
        }
      }
    }
    
    metric {
      type = "Resource"
      resource {
        name = "memory"
        target {
          type                = "Utilization"
          average_utilization = var.api_autoscaling.memory_threshold
        }
      }
    }
  }
}

# Similar HPA resources for auth, frontend, etc.