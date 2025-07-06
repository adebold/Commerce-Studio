# Google Cloud Monitoring Configuration for VARAi Commerce Studio
# Provides comprehensive monitoring, alerting, and performance tracking

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "notification_email" {
  description = "Email for alert notifications"
  type        = string
}

# Notification Channel for Alerts
resource "google_monitoring_notification_channel" "email" {
  display_name = "VARAi Commerce Studio Email Alerts"
  type         = "email"
  labels = {
    email_address = var.notification_email
  }
}

# Uptime Check for Frontend
resource "google_monitoring_uptime_check_config" "frontend_uptime" {
  display_name = "VARAi Frontend Uptime Check"
  timeout      = "10s"
  period       = "60s"

  http_check {
    path         = "/"
    port         = "443"
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = "commerce-studio-website-353252826752.us-central1.run.app"
    }
  }

  content_matchers {
    content = "VARAi Commerce Studio"
    matcher = "CONTAINS_STRING"
  }
}

# Uptime Check for API
resource "google_monitoring_uptime_check_config" "api_uptime" {
  display_name = "VARAi API Uptime Check"
  timeout      = "10s"
  period       = "60s"

  http_check {
    path         = "/health"
    port         = "443"
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = "eyewear-ml-api-353252826752.us-central1.run.app"
    }
  }

  content_matchers {
    content = "healthy"
    matcher = "CONTAINS_STRING"
  }
}

# Alert Policy for Frontend Uptime
resource "google_monitoring_alert_policy" "frontend_uptime_alert" {
  display_name = "VARAi Frontend Down Alert"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Frontend Uptime Check Failed"

    condition_threshold {
      filter          = "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND resource.type=\"uptime_url\" AND metric.label.check_id=\"${google_monitoring_uptime_check_config.frontend_uptime.uptime_check_id}\""
      duration        = "300s"
      comparison      = "COMPARISON_EQUAL"
      threshold_value = 0

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_FRACTION_TRUE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Alert Policy for API Uptime
resource "google_monitoring_alert_policy" "api_uptime_alert" {
  display_name = "VARAi API Down Alert"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "API Uptime Check Failed"

    condition_threshold {
      filter          = "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND resource.type=\"uptime_url\" AND metric.label.check_id=\"${google_monitoring_uptime_check_config.api_uptime.uptime_check_id}\""
      duration        = "300s"
      comparison      = "COMPARISON_EQUAL"
      threshold_value = 0

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_FRACTION_TRUE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Alert Policy for High Response Time
resource "google_monitoring_alert_policy" "high_response_time" {
  display_name = "VARAi High Response Time Alert"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "High Response Time"

    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/request_latencies\" AND resource.type=\"cloud_run_revision\""
      duration        = "300s"
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 2000  # 2 seconds

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_MEAN"
        group_by_fields      = ["resource.label.service_name"]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Alert Policy for High Error Rate
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "VARAi High Error Rate Alert"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "High Error Rate"

    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND metric.label.response_code_class=\"5xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 10  # More than 10 errors in 5 minutes

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
        group_by_fields      = ["resource.label.service_name"]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Alert Policy for High CPU Usage
resource "google_monitoring_alert_policy" "high_cpu_usage" {
  display_name = "VARAi High CPU Usage Alert"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "High CPU Usage"

    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/container/cpu/utilizations\" AND resource.type=\"cloud_run_revision\""
      duration        = "600s"
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 0.8  # 80% CPU usage

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_MEAN"
        group_by_fields      = ["resource.label.service_name"]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Alert Policy for High Memory Usage
resource "google_monitoring_alert_policy" "high_memory_usage" {
  display_name = "VARAi High Memory Usage Alert"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "High Memory Usage"

    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/container/memory/utilizations\" AND resource.type=\"cloud_run_revision\""
      duration        = "600s"
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 0.85  # 85% memory usage

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_MEAN"
        group_by_fields      = ["resource.label.service_name"]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Custom Dashboard for Performance Monitoring
resource "google_monitoring_dashboard" "performance_dashboard" {
  dashboard_json = jsonencode({
    displayName = "VARAi Commerce Studio Performance Dashboard"
    mosaicLayout = {
      tiles = [
        {
          width  = 6
          height = 4
          widget = {
            title = "Request Count"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\""
                    aggregation = {
                      alignmentPeriod    = "300s"
                      perSeriesAligner   = "ALIGN_RATE"
                      crossSeriesReducer = "REDUCE_SUM"
                      groupByFields      = ["resource.label.service_name"]
                    }
                  }
                }
                plotType = "LINE"
              }]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Requests/sec"
                scale = "LINEAR"
              }
            }
          }
        },
        {
          width  = 6
          height = 4
          xPos   = 6
          widget = {
            title = "Response Latency"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "metric.type=\"run.googleapis.com/request_latencies\" AND resource.type=\"cloud_run_revision\""
                    aggregation = {
                      alignmentPeriod    = "300s"
                      perSeriesAligner   = "ALIGN_MEAN"
                      crossSeriesReducer = "REDUCE_MEAN"
                      groupByFields      = ["resource.label.service_name"]
                    }
                  }
                }
                plotType = "LINE"
              }]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Latency (ms)"
                scale = "LINEAR"
              }
            }
          }
        },
        {
          width  = 6
          height = 4
          yPos   = 4
          widget = {
            title = "CPU Utilization"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "metric.type=\"run.googleapis.com/container/cpu/utilizations\" AND resource.type=\"cloud_run_revision\""
                    aggregation = {
                      alignmentPeriod    = "300s"
                      perSeriesAligner   = "ALIGN_MEAN"
                      crossSeriesReducer = "REDUCE_MEAN"
                      groupByFields      = ["resource.label.service_name"]
                    }
                  }
                }
                plotType = "LINE"
              }]
              timeshiftDuration = "0s"
              yAxis = {
                label = "CPU Utilization"
                scale = "LINEAR"
              }
            }
          }
        },
        {
          width  = 6
          height = 4
          xPos   = 6
          yPos   = 4
          widget = {
            title = "Memory Utilization"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "metric.type=\"run.googleapis.com/container/memory/utilizations\" AND resource.type=\"cloud_run_revision\""
                    aggregation = {
                      alignmentPeriod    = "300s"
                      perSeriesAligner   = "ALIGN_MEAN"
                      crossSeriesReducer = "REDUCE_MEAN"
                      groupByFields      = ["resource.label.service_name"]
                    }
                  }
                }
                plotType = "LINE"
              }]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Memory Utilization"
                scale = "LINEAR"
              }
            }
          }
        },
        {
          width  = 12
          height = 4
          yPos   = 8
          widget = {
            title = "Error Rate by Service"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND metric.label.response_code_class=\"5xx\""
                    aggregation = {
                      alignmentPeriod    = "300s"
                      perSeriesAligner   = "ALIGN_RATE"
                      crossSeriesReducer = "REDUCE_SUM"
                      groupByFields      = ["resource.label.service_name"]
                    }
                  }
                }
                plotType = "LINE"
              }]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Errors/sec"
                scale = "LINEAR"
              }
            }
          }
        }
      ]
    }
  })
}

# Log-based Metrics for Custom Application Metrics
resource "google_logging_metric" "slow_requests" {
  name   = "slow_requests"
  filter = "resource.type=\"cloud_run_revision\" AND jsonPayload.duration>1000"

  metric_descriptor {
    metric_kind = "GAUGE"
    value_type  = "INT64"
    display_name = "Slow Requests"
  }

  value_extractor = "EXTRACT(jsonPayload.duration)"
}

resource "google_logging_metric" "performance_budget_violations" {
  name   = "performance_budget_violations"
  filter = "resource.type=\"cloud_run_revision\" AND jsonPayload.performance_warning=\"slow-response\""

  metric_descriptor {
    metric_kind = "GAUGE"
    value_type  = "INT64"
    display_name = "Performance Budget Violations"
  }

  value_extractor = "1"
}

# Outputs
output "notification_channel_id" {
  description = "ID of the notification channel"
  value       = google_monitoring_notification_channel.email.id
}

output "dashboard_url" {
  description = "URL of the performance dashboard"
  value       = "https://console.cloud.google.com/monitoring/dashboards/custom/${google_monitoring_dashboard.performance_dashboard.id}?project=${var.project_id}"
}

output "uptime_check_ids" {
  description = "IDs of the uptime checks"
  value = {
    frontend = google_monitoring_uptime_check_config.frontend_uptime.uptime_check_id
    api      = google_monitoring_uptime_check_config.api_uptime.uptime_check_id
  }
}