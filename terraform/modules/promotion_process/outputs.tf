# Outputs for Promotion Process Module

output "promotion_namespace" {
  description = "The Kubernetes namespace for promotion resources"
  value       = kubernetes_namespace.promotion.metadata[0].name
}

output "dashboard_url" {
  description = "The URL for the promotion dashboard"
  value       = "https://console.cloud.google.com/monitoring/dashboards/custom/${replace(google_monitoring_dashboard.promotion_dashboard.id, "/", "_")}"
}

output "promotion_ui_url" {
  description = "The URL for the promotion UI"
  value       = google_cloud_run_service.promotion_ui.status[0].url
}

output "promotion_artifacts_bucket" {
  description = "The GCS bucket for promotion artifacts"
  value       = google_storage_bucket.promotion_artifacts.name
}

output "promotion_trigger_id" {
  description = "The ID of the Cloud Build trigger for promotion"
  value       = google_cloudbuild_trigger.promotion_trigger.id
}

output "db_migration_function_url" {
  description = "The URL of the Cloud Function for database migration"
  value       = google_cloudfunctions_function.db_migration.https_trigger_url
}

output "promotion_notification_topic" {
  description = "The Pub/Sub topic for promotion notifications"
  value       = google_pubsub_topic.promotion_notifications.name
}

output "promotion_notification_subscription" {
  description = "The Pub/Sub subscription for promotion notifications"
  value       = google_pubsub_subscription.promotion_notifications.name
}

output "promotion_health_check_job" {
  description = "The Cloud Scheduler job for promotion health checks"
  value       = google_cloud_scheduler_job.promotion_health_check.name
}

output "promotion_config" {
  description = "The promotion configuration"
  value = {
    environment                = var.environment
    target_environment         = var.target_environment
    approval_required          = var.approval_required
    approvers                  = var.approvers
    promotion_checklist        = var.promotion_checklist
    artifact_registry          = var.artifact_registry
    config_repository          = var.config_repository
    database_migration_strategy = var.database_migration_strategy
  }
}

output "promotion_status" {
  description = "The status of the promotion process"
  value       = "Configured for ${var.environment} to ${var.target_environment} promotion"
}