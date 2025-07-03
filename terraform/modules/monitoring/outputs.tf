# Outputs for Monitoring Module

output "dashboard_name" {
  description = "The name of the monitoring dashboard"
  value       = google_monitoring_dashboard.varai_overview.display_name
}

output "dashboard_id" {
  description = "The ID of the monitoring dashboard"
  value       = google_monitoring_dashboard.varai_overview.id
}

output "api_uptime_check_id" {
  description = "The ID of the API uptime check"
  value       = google_monitoring_uptime_check_config.api_uptime.id
}

output "auth_uptime_check_id" {
  description = "The ID of the Auth uptime check"
  value       = google_monitoring_uptime_check_config.auth_uptime.id
}

output "frontend_uptime_check_id" {
  description = "The ID of the Frontend uptime check"
  value       = google_monitoring_uptime_check_config.frontend_uptime.id
}

output "api_cpu_alert_policy_id" {
  description = "The ID of the API CPU usage alert policy"
  value       = google_monitoring_alert_policy.api_cpu_usage.id
}

output "api_memory_alert_policy_id" {
  description = "The ID of the API memory usage alert policy"
  value       = google_monitoring_alert_policy.api_memory_usage.id
}

output "http_error_rate_alert_policy_id" {
  description = "The ID of the HTTP error rate alert policy"
  value       = google_monitoring_alert_policy.http_error_rate.id
}

output "http_latency_alert_policy_id" {
  description = "The ID of the HTTP latency alert policy"
  value       = google_monitoring_alert_policy.http_latency.id
}

output "log_sink_id" {
  description = "The ID of the log sink"
  value       = var.enable_log_export ? google_logging_project_sink.varai_logs_bigquery[0].id : null
}

output "log_sink_destination" {
  description = "The destination of the log sink"
  value       = var.enable_log_export ? google_logging_project_sink.varai_logs_bigquery[0].destination : null
}

output "bigquery_dataset_id" {
  description = "The ID of the BigQuery dataset for logs"
  value       = var.enable_log_export ? google_bigquery_dataset.varai_logs[0].dataset_id : null
}

output "api_availability_slo_id" {
  description = "The ID of the API availability SLO"
  value       = google_monitoring_slo.api_availability.id
}

output "api_latency_slo_id" {
  description = "The ID of the API latency SLO"
  value       = google_monitoring_slo.api_latency.id
}

output "api_service_id" {
  description = "The ID of the API custom service"
  value       = google_monitoring_custom_service.varai_api.id
}

output "grafana_dashboard_name" {
  description = "The name of the Grafana dashboard ConfigMap"
  value       = var.deploy_grafana ? kubernetes_config_map.grafana_dashboard[0].metadata[0].name : null
}

output "prometheus_rules_name" {
  description = "The name of the Prometheus rules ConfigMap"
  value       = var.deploy_prometheus ? kubernetes_config_map.prometheus_rules[0].metadata[0].name : null
}