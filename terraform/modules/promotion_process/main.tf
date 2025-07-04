# Promotion Process Module for VARAi Platform

locals {
  promotion_namespace = "varai-promotion-${var.environment}"
}

# Create a namespace for promotion resources
resource "kubernetes_namespace" "promotion" {
  metadata {
    name = local.promotion_namespace
    labels = {
      environment = var.environment
      component   = "promotion"
    }
  }
}

# Create a service account for promotion process
resource "kubernetes_service_account" "promotion" {
  metadata {
    name      = "promotion-service"
    namespace = local.promotion_namespace
  }
}

# Create a role for promotion process
resource "kubernetes_role" "promotion" {
  metadata {
    name      = "promotion-role"
    namespace = local.promotion_namespace
  }

  rule {
    api_groups = ["", "apps", "batch"]
    resources  = ["pods", "services", "jobs", "cronjobs", "deployments", "statefulsets", "configmaps", "secrets"]
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
  }
}

# Create a role binding for promotion process
resource "kubernetes_role_binding" "promotion" {
  metadata {
    name      = "promotion-role-binding"
    namespace = local.promotion_namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.promotion.metadata[0].name
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.promotion.metadata[0].name
    namespace = local.promotion_namespace
  }
}

# Create a ConfigMap for promotion configuration
resource "kubernetes_config_map" "promotion_config" {
  metadata {
    name      = "promotion-config"
    namespace = local.promotion_namespace
  }

  data = {
    "environment"          = var.environment
    "target_environment"   = var.target_environment
    "approval_required"    = var.approval_required ? "true" : "false"
    "approvers"            = join(",", var.approvers)
    "promotion_checklist"  = jsonencode(var.promotion_checklist)
    "artifact_registry"    = var.artifact_registry
    "config_repository"    = var.config_repository
    "database_migration_strategy" = var.database_migration_strategy
  }
}

# Create a GCS bucket for promotion artifacts
resource "google_storage_bucket" "promotion_artifacts" {
  name     = "varai-promotion-artifacts-${var.environment}-to-${var.target_environment}"
  location = "US"
  
  uniform_bucket_level_access = true
  
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

# Create a Cloud Build trigger for promotion
resource "google_cloudbuild_trigger" "promotion_trigger" {
  name        = "varai-promotion-${var.environment}-to-${var.target_environment}"
  description = "Trigger for promoting VARAi from ${var.environment} to ${var.target_environment}"
  
  github {
    owner = split("/", replace(var.config_repository, "https://github.com/", ""))[0]
    name  = trimsuffix(split("/", replace(var.config_repository, "https://github.com/", ""))[1], ".git")
    push {
      branch = "^${var.environment}-promotion$"
    }
  }
  
  build {
    step {
      name = "gcr.io/cloud-builders/git"
      args = ["clone", var.config_repository, "."]
    }
    
    step {
      name = "gcr.io/cloud-builders/git"
      args = ["checkout", "${var.target_environment}"]
    }
    
    step {
      name = "gcr.io/cloud-builders/git"
      args = ["merge", "${var.environment}-promotion"]
    }
    
    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["pull", "${var.artifact_registry}:${var.environment}"]
    }
    
    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["tag", "${var.artifact_registry}:${var.environment}", "${var.artifact_registry}:${var.target_environment}"]
    }
    
    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["push", "${var.artifact_registry}:${var.target_environment}"]
    }
    
    step {
      name = "gcr.io/cloud-builders/kubectl"
      args = ["apply", "-k", "kubernetes/overlays/${var.target_environment}"]
      env = [
        {
          name  = "CLOUDSDK_COMPUTE_ZONE"
          value = "us-central1-a"
        },
        {
          name  = "CLOUDSDK_CONTAINER_CLUSTER"
          value = "varai-${var.target_environment}"
        }
      ]
    }
    
    artifacts {
      objects {
        location = "gs://${google_storage_bucket.promotion_artifacts.name}/builds/$BUILD_ID/"
        paths    = ["kubernetes/overlays/${var.target_environment}/**"]
      }
    }
  }
}

# Create a Cloud Function for database migration
resource "google_storage_bucket" "function_source" {
  name     = "varai-db-migration-function-${var.environment}-to-${var.target_environment}"
  location = "US"
}

resource "google_storage_bucket_object" "function_source" {
  name   = "function-source.zip"
  bucket = google_storage_bucket.function_source.name
  source = var.db_migration_function_source
}

resource "google_cloudfunctions_function" "db_migration" {
  name        = "varai-db-migration-${var.environment}-to-${var.target_environment}"
  description = "Function for migrating database from ${var.environment} to ${var.target_environment}"
  runtime     = "python39"
  
  available_memory_mb   = 1024
  source_archive_bucket = google_storage_bucket.function_source.name
  source_archive_object = google_storage_bucket_object.function_source.name
  trigger_http          = true
  entry_point           = "migrate_database"
  
  environment_variables = {
    SOURCE_DB_CONNECTION      = var.source_db_connection
    TARGET_DB_CONNECTION      = var.target_db_connection
    MIGRATION_STRATEGY        = var.database_migration_strategy
    ENVIRONMENT               = var.environment
    TARGET_ENVIRONMENT        = var.target_environment
    NOTIFICATION_TOPIC        = google_pubsub_topic.promotion_notifications.name
  }
}

# Create a Pub/Sub topic for promotion notifications
resource "google_pubsub_topic" "promotion_notifications" {
  name = "varai-promotion-notifications-${var.environment}-to-${var.target_environment}"
}

# Create a Pub/Sub subscription for promotion notifications
resource "google_pubsub_subscription" "promotion_notifications" {
  name  = "varai-promotion-notifications-${var.environment}-to-${var.target_environment}-sub"
  topic = google_pubsub_topic.promotion_notifications.name
  
  message_retention_duration = "604800s"  # 7 days
  retain_acked_messages      = true
  
  ack_deadline_seconds = 20
  
  expiration_policy {
    ttl = "2592000s"  # 30 days
  }
}

# Create a Cloud Scheduler job for promotion health checks
resource "google_cloud_scheduler_job" "promotion_health_check" {
  name        = "varai-promotion-health-check-${var.environment}-to-${var.target_environment}"
  description = "Health check for promotion from ${var.environment} to ${var.target_environment}"
  schedule    = "0 */6 * * *"  # Every 6 hours
  
  http_target {
    uri         = "https://${var.domain_name}/api/promotion/health"
    http_method = "GET"
    headers = {
      "Content-Type" = "application/json"
    }
  }
}

# Create a Cloud Monitoring Dashboard for promotion process
resource "google_monitoring_dashboard" "promotion_dashboard" {
  dashboard_json = <<EOF
{
  "displayName": "VARAi Promotion Dashboard (${title(var.environment)} to ${title(var.target_environment)})",
  "gridLayout": {
    "widgets": [
      {
        "title": "Promotion Status",
        "text": {
          "content": "This dashboard shows the status of the promotion process from ${title(var.environment)} to ${title(var.target_environment)}."
        }
      },
      {
        "title": "Promotion History",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"custom.googleapis.com/varai/promotion/count\" resource.type=\"global\" metadata.user_labels.\"environment\"=\"${var.environment}\" metadata.user_labels.\"target_environment\"=\"${var.target_environment}\"",
                  "aggregation": {
                    "alignmentPeriod": "86400s",
                    "perSeriesAligner": "ALIGN_SUM"
                  }
                }
              }
            }
          ],
          "yAxis": {
            "label": "Promotions",
            "scale": "LINEAR"
          }
        }
      },
      {
        "title": "Promotion Success Rate",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"custom.googleapis.com/varai/promotion/success_rate\" resource.type=\"global\" metadata.user_labels.\"environment\"=\"${var.environment}\" metadata.user_labels.\"target_environment\"=\"${var.target_environment}\"",
                  "aggregation": {
                    "alignmentPeriod": "86400s",
                    "perSeriesAligner": "ALIGN_MEAN"
                  }
                }
              }
            }
          ],
          "yAxis": {
            "label": "Success Rate",
            "scale": "LINEAR"
          }
        }
      },
      {
        "title": "Database Migration Duration",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"custom.googleapis.com/varai/promotion/db_migration_duration\" resource.type=\"global\" metadata.user_labels.\"environment\"=\"${var.environment}\" metadata.user_labels.\"target_environment\"=\"${var.target_environment}\"",
                  "aggregation": {
                    "alignmentPeriod": "86400s",
                    "perSeriesAligner": "ALIGN_MEAN"
                  }
                }
              }
            }
          ],
          "yAxis": {
            "label": "Duration (seconds)",
            "scale": "LINEAR"
          }
        }
      }
    ]
  }
}
EOF
}

# Create notification channels for promotion failures
resource "google_monitoring_alert_policy" "promotion_failure_alert" {
  display_name = "VARAi Promotion Failure Alert (${title(var.environment)} to ${title(var.target_environment)})"
  combiner     = "OR"
  
  conditions {
    display_name = "Promotion Failure"
    condition_threshold {
      filter     = "metric.type=\"custom.googleapis.com/varai/promotion/success_rate\" resource.type=\"global\" metadata.user_labels.\"environment\"=\"${var.environment}\" metadata.user_labels.\"target_environment\"=\"${var.target_environment}\""
      duration   = "0s"
      comparison = "COMPARISON_LT"
      threshold_value = 1.0
      
      trigger {
        count = 1
      }
      
      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }
  
  notification_channels = var.notification_channels
}

# Create a Cloud Run service for promotion UI
resource "google_cloud_run_service" "promotion_ui" {
  name     = "varai-promotion-ui-${var.environment}-to-${var.target_environment}"
  location = "us-central1"
  
  template {
    spec {
      containers {
        image = "${var.artifact_registry}/promotion-ui:latest"
        
        env {
          name  = "ENVIRONMENT"
          value = var.environment
        }
        
        env {
          name  = "TARGET_ENVIRONMENT"
          value = var.target_environment
        }
        
        env {
          name  = "APPROVAL_REQUIRED"
          value = var.approval_required ? "true" : "false"
        }
        
        env {
          name  = "APPROVERS"
          value = join(",", var.approvers)
        }
        
        env {
          name  = "PROMOTION_CHECKLIST"
          value = jsonencode(var.promotion_checklist)
        }
        
        env {
          name  = "ARTIFACT_REGISTRY"
          value = var.artifact_registry
        }
        
        env {
          name  = "CONFIG_REPOSITORY"
          value = var.config_repository
        }
        
        env {
          name  = "DATABASE_MIGRATION_STRATEGY"
          value = var.database_migration_strategy
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Create an IAM policy for the promotion UI
resource "google_cloud_run_service_iam_policy" "promotion_ui" {
  location    = google_cloud_run_service.promotion_ui.location
  project     = google_cloud_run_service.promotion_ui.project
  service     = google_cloud_run_service.promotion_ui.name
  
  policy_data = jsonencode({
    bindings = [
      {
        role    = "roles/run.invoker"
        members = concat(
          ["serviceAccount:${kubernetes_service_account.promotion.metadata[0].name}@${var.gcp_project_id}.iam.gserviceaccount.com"],
          [for approver in var.approvers : "user:${approver}"]
        )
      }
    ]
  })
}