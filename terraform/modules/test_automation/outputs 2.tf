# Outputs for Test Automation Module

output "test_namespace" {
  description = "The Kubernetes namespace for test resources"
  value       = kubernetes_namespace.test.metadata[0].name
}

output "dashboard_url" {
  description = "The URL for the test dashboard"
  value       = "https://console.cloud.google.com/monitoring/dashboards/custom/${replace(google_monitoring_dashboard.test_dashboard.id, "/", "_")}"
}

output "test_results_bucket" {
  description = "The GCS bucket for test results"
  value       = google_storage_bucket.test_results.name
}

output "smoke_test_status" {
  description = "The status of smoke tests"
  value       = var.enable_smoke_tests ? "Enabled (Schedule: ${var.test_schedule})" : "Disabled"
}

output "integration_test_status" {
  description = "The status of integration tests"
  value       = var.enable_integration_tests ? "Enabled (Schedule: ${var.test_schedule})" : "Disabled"
}

output "performance_test_status" {
  description = "The status of performance tests"
  value       = var.enable_performance_tests ? "Enabled (Schedule: ${var.test_schedule})" : "Disabled"
}

output "security_scan_status" {
  description = "The status of security scans"
  value       = var.enable_security_scans ? "Enabled (Schedule: ${var.security_scan_schedule})" : "Disabled"
}

output "data_validation_status" {
  description = "The status of data validation tests"
  value       = var.enable_data_validation ? "Enabled (Schedule: ${var.test_schedule})" : "Disabled"
}

output "ux_test_status" {
  description = "The status of user experience tests"
  value       = var.enable_ux_tests ? "Enabled (Schedule: ${var.test_schedule})" : "Disabled"
}