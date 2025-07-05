# Test Automation Module for VARAi Platform

locals {
  test_namespace = "varai-test-${var.environment}"
}

# Create a namespace for test resources
resource "kubernetes_namespace" "test" {
  metadata {
    name = local.test_namespace
    labels = {
      environment = var.environment
      component   = "test"
    }
  }
}

# Create a service account for test automation
resource "kubernetes_service_account" "test_automation" {
  metadata {
    name      = "test-automation"
    namespace = local.test_namespace
  }
}

# Create a role for test automation
resource "kubernetes_role" "test_automation" {
  metadata {
    name      = "test-automation"
    namespace = local.test_namespace
  }

  rule {
    api_groups = ["", "apps", "batch"]
    resources  = ["pods", "services", "jobs", "cronjobs", "deployments"]
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
  }
}

# Create a role binding for test automation
resource "kubernetes_role_binding" "test_automation" {
  metadata {
    name      = "test-automation"
    namespace = local.test_namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.test_automation.metadata[0].name
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.test_automation.metadata[0].name
    namespace = local.test_namespace
  }
}

# Create a GCS bucket for test results
resource "google_storage_bucket" "test_results" {
  name     = var.test_results_bucket
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

# Create a ConfigMap for test configuration
resource "kubernetes_config_map" "test_config" {
  metadata {
    name      = "test-config"
    namespace = local.test_namespace
  }

  data = {
    "api_url"              = var.api_url
    "auth_url"             = var.auth_url
    "frontend_url"         = var.frontend_url
    "environment"          = var.environment
    "test_timeout"         = var.test_timeout
    "enable_smoke_tests"   = var.enable_smoke_tests ? "true" : "false"
    "enable_integration_tests" = var.enable_integration_tests ? "true" : "false"
    "enable_performance_tests" = var.enable_performance_tests ? "true" : "false"
    "enable_security_scans" = var.enable_security_scans ? "true" : "false"
    "enable_data_validation" = var.enable_data_validation ? "true" : "false"
    "enable_ux_tests"      = var.enable_ux_tests ? "true" : "false"
    "test_results_bucket"  = google_storage_bucket.test_results.name
  }
}

# Create a Secret for test credentials
resource "kubernetes_secret" "test_credentials" {
  metadata {
    name      = "test-credentials"
    namespace = local.test_namespace
  }

  data = {
    "api_key"     = var.api_key
    "test_user"   = var.test_user
    "test_password" = var.test_password
  }
}

# Create a CronJob for smoke tests
resource "kubernetes_cron_job" "smoke_tests" {
  count = var.enable_smoke_tests ? 1 : 0

  metadata {
    name      = "smoke-tests"
    namespace = local.test_namespace
  }

  spec {
    schedule = var.test_schedule
    job_template {
      metadata {
        name = "smoke-tests"
      }
      spec {
        template {
          metadata {
            name = "smoke-tests"
          }
          spec {
            service_account_name = kubernetes_service_account.test_automation.metadata[0].name
            container {
              name  = "smoke-tests"
              image = "${var.test_image_registry}/${var.test_image_prefix}/smoke-tests:${var.test_image_tag}"
              
              env {
                name = "CONFIG_MAP"
                value_from {
                  config_map_key_ref {
                    name = kubernetes_config_map.test_config.metadata[0].name
                    key  = "api_url"
                  }
                }
              }
              
              env {
                name = "API_KEY"
                value_from {
                  secret_key_ref {
                    name = kubernetes_secret.test_credentials.metadata[0].name
                    key  = "api_key"
                  }
                }
              }
              
              resources {
                limits = {
                  cpu    = "500m"
                  memory = "512Mi"
                }
                requests = {
                  cpu    = "100m"
                  memory = "128Mi"
                }
              }
            }
            restart_policy = "OnFailure"
          }
        }
      }
    }
  }
}

# Create a CronJob for integration tests
resource "kubernetes_cron_job" "integration_tests" {
  count = var.enable_integration_tests ? 1 : 0

  metadata {
    name      = "integration-tests"
    namespace = local.test_namespace
  }

  spec {
    schedule = var.test_schedule
    job_template {
      metadata {
        name = "integration-tests"
      }
      spec {
        template {
          metadata {
            name = "integration-tests"
          }
          spec {
            service_account_name = kubernetes_service_account.test_automation.metadata[0].name
            container {
              name  = "integration-tests"
              image = "${var.test_image_registry}/${var.test_image_prefix}/integration-tests:${var.test_image_tag}"
              
              env_from {
                config_map_ref {
                  name = kubernetes_config_map.test_config.metadata[0].name
                }
              }
              
              env_from {
                secret_ref {
                  name = kubernetes_secret.test_credentials.metadata[0].name
                }
              }
              
              resources {
                limits = {
                  cpu    = "1000m"
                  memory = "1Gi"
                }
                requests = {
                  cpu    = "200m"
                  memory = "256Mi"
                }
              }
            }
            restart_policy = "OnFailure"
          }
        }
      }
    }
  }
}

# Create a CronJob for performance tests
resource "kubernetes_cron_job" "performance_tests" {
  count = var.enable_performance_tests ? 1 : 0

  metadata {
    name      = "performance-tests"
    namespace = local.test_namespace
  }

  spec {
    schedule = var.test_schedule
    job_template {
      metadata {
        name = "performance-tests"
      }
      spec {
        template {
          metadata {
            name = "performance-tests"
          }
          spec {
            service_account_name = kubernetes_service_account.test_automation.metadata[0].name
            container {
              name  = "performance-tests"
              image = "${var.test_image_registry}/${var.test_image_prefix}/performance-tests:${var.test_image_tag}"
              
              env_from {
                config_map_ref {
                  name = kubernetes_config_map.test_config.metadata[0].name
                }
              }
              
              env_from {
                secret_ref {
                  name = kubernetes_secret.test_credentials.metadata[0].name
                }
              }
              
              env {
                name  = "USERS"
                value = var.performance_test_users
              }
              
              resources {
                limits = {
                  cpu    = "2000m"
                  memory = "2Gi"
                }
                requests = {
                  cpu    = "500m"
                  memory = "512Mi"
                }
              }
            }
            restart_policy = "OnFailure"
          }
        }
      }
    }
  }
}

# Create a CronJob for security scans
resource "kubernetes_cron_job" "security_scans" {
  count = var.enable_security_scans ? 1 : 0

  metadata {
    name      = "security-scans"
    namespace = local.test_namespace
  }

  spec {
    schedule = var.security_scan_schedule
    job_template {
      metadata {
        name = "security-scans"
      }
      spec {
        template {
          metadata {
            name = "security-scans"
          }
          spec {
            service_account_name = kubernetes_service_account.test_automation.metadata[0].name
            container {
              name  = "security-scans"
              image = "${var.test_image_registry}/${var.test_image_prefix}/security-scans:${var.test_image_tag}"
              
              env_from {
                config_map_ref {
                  name = kubernetes_config_map.test_config.metadata[0].name
                }
              }
              
              env_from {
                secret_ref {
                  name = kubernetes_secret.test_credentials.metadata[0].name
                }
              }
              
              resources {
                limits = {
                  cpu    = "1000m"
                  memory = "1Gi"
                }
                requests = {
                  cpu    = "200m"
                  memory = "256Mi"
                }
              }
            }
            restart_policy = "OnFailure"
          }
        }
      }
    }
  }
}

# Create a CronJob for data validation
resource "kubernetes_cron_job" "data_validation" {
  count = var.enable_data_validation ? 1 : 0

  metadata {
    name      = "data-validation"
    namespace = local.test_namespace
  }

  spec {
    schedule = var.test_schedule
    job_template {
      metadata {
        name = "data-validation"
      }
      spec {
        template {
          metadata {
            name = "data-validation"
          }
          spec {
            service_account_name = kubernetes_service_account.test_automation.metadata[0].name
            container {
              name  = "data-validation"
              image = "${var.test_image_registry}/${var.test_image_prefix}/data-validation:${var.test_image_tag}"
              
              env_from {
                config_map_ref {
                  name = kubernetes_config_map.test_config.metadata[0].name
                }
              }
              
              env_from {
                secret_ref {
                  name = kubernetes_secret.test_credentials.metadata[0].name
                }
              }
              
              resources {
                limits = {
                  cpu    = "1000m"
                  memory = "1Gi"
                }
                requests = {
                  cpu    = "200m"
                  memory = "256Mi"
                }
              }
            }
            restart_policy = "OnFailure"
          }
        }
      }
    }
  }
}

# Create a CronJob for UX tests
resource "kubernetes_cron_job" "ux_tests" {
  count = var.enable_ux_tests ? 1 : 0

  metadata {
    name      = "ux-tests"
    namespace = local.test_namespace
  }

  spec {
    schedule = var.test_schedule
    job_template {
      metadata {
        name = "ux-tests"
      }
      spec {
        template {
          metadata {
            name = "ux-tests"
          }
          spec {
            service_account_name = kubernetes_service_account.test_automation.metadata[0].name
            container {
              name  = "ux-tests"
              image = "${var.test_image_registry}/${var.test_image_prefix}/ux-tests:${var.test_image_tag}"
              
              env_from {
                config_map_ref {
                  name = kubernetes_config_map.test_config.metadata[0].name
                }
              }
              
              env_from {
                secret_ref {
                  name = kubernetes_secret.test_credentials.metadata[0].name
                }
              }
              
              resources {
                limits = {
                  cpu    = "1000m"
                  memory = "1Gi"
                }
                requests = {
                  cpu    = "200m"
                  memory = "256Mi"
                }
              }
            }
            restart_policy = "OnFailure"
          }
        }
      }
    }
  }
}

# Create a Cloud Monitoring Dashboard for test results
resource "google_monitoring_dashboard" "test_dashboard" {
  dashboard_json = <<EOF
{
  "displayName": "VARAi ${title(var.environment)} Test Dashboard",
  "gridLayout": {
    "widgets": [
      {
        "title": "Smoke Test Success Rate",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"custom.googleapis.com/varai/tests/smoke/success_rate\" resource.type=\"k8s_container\" resource.label.\"namespace_name\"=\"${local.test_namespace}\"",
                  "aggregation": {
                    "alignmentPeriod": "3600s",
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
        "title": "Integration Test Success Rate",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"custom.googleapis.com/varai/tests/integration/success_rate\" resource.type=\"k8s_container\" resource.label.\"namespace_name\"=\"${local.test_namespace}\"",
                  "aggregation": {
                    "alignmentPeriod": "3600s",
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
        "title": "Performance Test Results",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"custom.googleapis.com/varai/tests/performance/response_time\" resource.type=\"k8s_container\" resource.label.\"namespace_name\"=\"${local.test_namespace}\"",
                  "aggregation": {
                    "alignmentPeriod": "3600s",
                    "perSeriesAligner": "ALIGN_MEAN"
                  }
                }
              }
            }
          ],
          "yAxis": {
            "label": "Response Time (ms)",
            "scale": "LINEAR"
          }
        }
      },
      {
        "title": "Security Scan Results",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"custom.googleapis.com/varai/tests/security/vulnerabilities\" resource.type=\"k8s_container\" resource.label.\"namespace_name\"=\"${local.test_namespace}\"",
                  "aggregation": {
                    "alignmentPeriod": "3600s",
                    "perSeriesAligner": "ALIGN_MEAN"
                  }
                }
              }
            }
          ],
          "yAxis": {
            "label": "Vulnerabilities",
            "scale": "LINEAR"
          }
        }
      }
    ]
  }
}
EOF
}

# Create notification channels for test failures
resource "google_monitoring_alert_policy" "test_failure_alert" {
  display_name = "VARAi ${title(var.environment)} Test Failure Alert"
  combiner     = "OR"
  
  conditions {
    display_name = "Smoke Test Failure"
    condition_threshold {
      filter     = "metric.type=\"custom.googleapis.com/varai/tests/smoke/success_rate\" resource.type=\"k8s_container\" resource.label.\"namespace_name\"=\"${local.test_namespace}\""
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
  
  conditions {
    display_name = "Integration Test Failure"
    condition_threshold {
      filter     = "metric.type=\"custom.googleapis.com/varai/tests/integration/success_rate\" resource.type=\"k8s_container\" resource.label.\"namespace_name\"=\"${local.test_namespace}\""
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