# Outputs for Kubernetes Module

output "namespace" {
  description = "The Kubernetes namespace"
  value       = kubernetes_namespace.varai.metadata[0].name
}

output "api_service_name" {
  description = "The name of the API service"
  value       = kubernetes_service.api.metadata[0].name
}

output "api_service_cluster_ip" {
  description = "The cluster IP of the API service"
  value       = kubernetes_service.api.spec[0].cluster_ip
}

output "ingress_host" {
  description = "The hostname for the Ingress resource"
  value       = var.ingress_host
}

output "ingress_name" {
  description = "The name of the Ingress resource"
  value       = kubernetes_ingress_v1.varai.metadata[0].name
}

output "config_map_name" {
  description = "The name of the ConfigMap resource"
  value       = kubernetes_config_map.varai.metadata[0].name
}

output "secret_name" {
  description = "The name of the Secret resource"
  value       = kubernetes_secret.varai.metadata[0].name
}

output "api_deployment_name" {
  description = "The name of the API deployment"
  value       = kubernetes_deployment.api.metadata[0].name
}

output "api_replicas" {
  description = "The number of replicas for the API service"
  value       = kubernetes_deployment.api.spec[0].replicas
}

output "api_hpa_enabled" {
  description = "Whether Horizontal Pod Autoscaler is enabled for API service"
  value       = var.enable_autoscaling
}

output "api_hpa_min_replicas" {
  description = "The minimum number of replicas for API service when autoscaling is enabled"
  value       = var.enable_autoscaling ? kubernetes_horizontal_pod_autoscaler_v2.api[0].spec[0].min_replicas : null
}

output "api_hpa_max_replicas" {
  description = "The maximum number of replicas for API service when autoscaling is enabled"
  value       = var.enable_autoscaling ? kubernetes_horizontal_pod_autoscaler_v2.api[0].spec[0].max_replicas : null
}