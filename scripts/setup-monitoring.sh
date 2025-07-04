#!/bin/bash

# Commerce Studio Monitoring & Observability Setup Script
# Phase 8: Monitoring & Observability Setup

set -euo pipefail

# Configuration
PROJECT_ID="${PROJECT_ID:-ml-datadriven-recos}"
REGION="${REGION:-us-central1}"
ENVIRONMENT="${ENVIRONMENT:-staging}"
NOTIFICATION_EMAIL="${NOTIFICATION_EMAIL:-alerts@commerce-studio.com}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Enable required APIs
enable_apis() {
    log_info "Enabling required monitoring APIs..."
    
    gcloud services enable \
        monitoring.googleapis.com \
        logging.googleapis.com \
        clouderrorreporting.googleapis.com \
        cloudtrace.googleapis.com \
        cloudprofiler.googleapis.com \
        secretmanager.googleapis.com
    
    log_success "Required APIs enabled"
}

# Create notification channels
create_notification_channels() {
    log_info "Creating notification channels..."
    
    # Create email notification channel
    cat > /tmp/email-channel.json << EOF
{
  "type": "email",
  "displayName": "Commerce Studio Alerts",
  "description": "Email notifications for Commerce Studio alerts",
  "labels": {
    "email_address": "$NOTIFICATION_EMAIL"
  }
}
EOF
    
    local email_channel_id=$(gcloud alpha monitoring channels create --channel-content-from-file=/tmp/email-channel.json --format="value(name)" 2>/dev/null || echo "")
    
    if [[ -n "$email_channel_id" ]]; then
        log_success "Email notification channel created: $email_channel_id"
        echo "$email_channel_id" > /tmp/email-channel-id.txt
    else
        log_warning "Failed to create email notification channel or it already exists"
        # Try to find existing channel
        local existing_channel=$(gcloud alpha monitoring channels list --filter="labels.email_address=$NOTIFICATION_EMAIL" --format="value(name)" | head -1)
        if [[ -n "$existing_channel" ]]; then
            log_info "Using existing email notification channel: $existing_channel"
            echo "$existing_channel" > /tmp/email-channel-id.txt
        fi
    fi
    
    rm -f /tmp/email-channel.json
}

# Create alerting policies
create_alerting_policies() {
    log_info "Creating alerting policies..."
    
    local email_channel_id=$(cat /tmp/email-channel-id.txt 2>/dev/null || echo "")
    
    # High error rate alert
    cat > /tmp/high-error-rate-policy.json << EOF
{
  "displayName": "Commerce Studio - High Error Rate",
  "documentation": {
    "content": "Alert when error rate exceeds 5% for Commerce Studio services"
  },
  "conditions": [
    {
      "displayName": "High error rate condition",
      "conditionThreshold": {
        "filter": "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"commerce-studio-.*\"",
        "comparison": "COMPARISON_GREATER_THAN",
        "thresholdValue": 0.05,
        "duration": "300s",
        "aggregations": [
          {
            "alignmentPeriod": "60s",
            "perSeriesAligner": "ALIGN_RATE",
            "crossSeriesReducer": "REDUCE_MEAN",
            "groupByFields": ["resource.labels.service_name"]
          }
        ]
      }
    }
  ],
  "combiner": "OR",
  "enabled": true,
  "notificationChannels": ["$email_channel_id"]
}
EOF
    
    if [[ -n "$email_channel_id" ]]; then
        gcloud alpha monitoring policies create --policy-from-file=/tmp/high-error-rate-policy.json 2>/dev/null || log_warning "Failed to create high error rate policy"
        log_success "High error rate alerting policy created"
    fi
    
    # High latency alert
    cat > /tmp/high-latency-policy.json << EOF
{
  "displayName": "Commerce Studio - High Latency",
  "documentation": {
    "content": "Alert when response latency exceeds 5 seconds for Commerce Studio services"
  },
  "conditions": [
    {
      "displayName": "High latency condition",
      "conditionThreshold": {
        "filter": "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"commerce-studio-.*\" AND metric.type=\"run.googleapis.com/request_latencies\"",
        "comparison": "COMPARISON_GREATER_THAN",
        "thresholdValue": 5000,
        "duration": "300s",
        "aggregations": [
          {
            "alignmentPeriod": "60s",
            "perSeriesAligner": "ALIGN_DELTA",
            "crossSeriesReducer": "REDUCE_PERCENTILE_95",
            "groupByFields": ["resource.labels.service_name"]
          }
        ]
      }
    }
  ],
  "combiner": "OR",
  "enabled": true,
  "notificationChannels": ["$email_channel_id"]
}
EOF
    
    if [[ -n "$email_channel_id" ]]; then
        gcloud alpha monitoring policies create --policy-from-file=/tmp/high-latency-policy.json 2>/dev/null || log_warning "Failed to create high latency policy"
        log_success "High latency alerting policy created"
    fi
    
    # Secret Manager access monitoring
    cat > /tmp/secret-access-policy.json << EOF
{
  "displayName": "Commerce Studio - Unusual Secret Access",
  "documentation": {
    "content": "Alert on unusual Secret Manager access patterns"
  },
  "conditions": [
    {
      "displayName": "High secret access rate",
      "conditionThreshold": {
        "filter": "resource.type=\"secretmanager.googleapis.com/Secret\" AND protoPayload.serviceName=\"secretmanager.googleapis.com\"",
        "comparison": "COMPARISON_GREATER_THAN",
        "thresholdValue": 100,
        "duration": "300s",
        "aggregations": [
          {
            "alignmentPeriod": "60s",
            "perSeriesAligner": "ALIGN_RATE",
            "crossSeriesReducer": "REDUCE_SUM"
          }
        ]
      }
    }
  ],
  "combiner": "OR",
  "enabled": true,
  "notificationChannels": ["$email_channel_id"]
}
EOF
    
    if [[ -n "$email_channel_id" ]]; then
        gcloud alpha monitoring policies create --policy-from-file=/tmp/secret-access-policy.json 2>/dev/null || log_warning "Failed to create secret access policy"
        log_success "Secret access monitoring policy created"
    fi
    
    # Service health monitoring
    cat > /tmp/service-health-policy.json << EOF
{
  "displayName": "Commerce Studio - Service Down",
  "documentation": {
    "content": "Alert when Commerce Studio services are down or unhealthy"
  },
  "conditions": [
    {
      "displayName": "Service down condition",
      "conditionThreshold": {
        "filter": "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"commerce-studio-.*\" AND metric.type=\"run.googleapis.com/container/instance_count\"",
        "comparison": "COMPARISON_LESS_THAN",
        "thresholdValue": 1,
        "duration": "300s",
        "aggregations": [
          {
            "alignmentPeriod": "60s",
            "perSeriesAligner": "ALIGN_MEAN",
            "crossSeriesReducer": "REDUCE_SUM",
            "groupByFields": ["resource.labels.service_name"]
          }
        ]
      }
    }
  ],
  "combiner": "OR",
  "enabled": true,
  "notificationChannels": ["$email_channel_id"]
}
EOF
    
    if [[ -n "$email_channel_id" ]]; then
        gcloud alpha monitoring policies create --policy-from-file=/tmp/service-health-policy.json 2>/dev/null || log_warning "Failed to create service health policy"
        log_success "Service health monitoring policy created"
    fi
    
    # Cleanup temporary files
    rm -f /tmp/*-policy.json /tmp/email-channel-id.txt
}

# Create custom dashboards
create_dashboards() {
    log_info "Creating monitoring dashboards..."
    
    # Commerce Studio Overview Dashboard
    cat > /tmp/commerce-studio-dashboard.json << EOF
{
  "displayName": "Commerce Studio - Overview",
  "mosaicLayout": {
    "tiles": [
      {
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Request Rate",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"commerce-studio-.*\" AND metric.type=\"run.googleapis.com/request_count\"",
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "perSeriesAligner": "ALIGN_RATE",
                      "crossSeriesReducer": "REDUCE_SUM",
                      "groupByFields": ["resource.labels.service_name"]
                    }
                  }
                }
              }
            ],
            "timeshiftDuration": "0s",
            "yAxis": {
              "label": "Requests/sec",
              "scale": "LINEAR"
            }
          }
        }
      },
      {
        "width": 6,
        "height": 4,
        "xPos": 6,
        "widget": {
          "title": "Response Latency",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"commerce-studio-.*\" AND metric.type=\"run.googleapis.com/request_latencies\"",
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "perSeriesAligner": "ALIGN_DELTA",
                      "crossSeriesReducer": "REDUCE_PERCENTILE_95",
                      "groupByFields": ["resource.labels.service_name"]
                    }
                  }
                }
              }
            ],
            "timeshiftDuration": "0s",
            "yAxis": {
              "label": "Latency (ms)",
              "scale": "LINEAR"
            }
          }
        }
      },
      {
        "width": 12,
        "height": 4,
        "yPos": 4,
        "widget": {
          "title": "Error Rate",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"commerce-studio-.*\" AND metric.type=\"logging.googleapis.com/log_entry_count\" AND metric.labels.severity=\"ERROR\"",
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "perSeriesAligner": "ALIGN_RATE",
                      "crossSeriesReducer": "REDUCE_SUM",
                      "groupByFields": ["resource.labels.service_name"]
                    }
                  }
                }
              }
            ],
            "timeshiftDuration": "0s",
            "yAxis": {
              "label": "Errors/sec",
              "scale": "LINEAR"
            }
          }
        }
      }
    ]
  }
}
EOF
    
    gcloud monitoring dashboards create --config-from-file=/tmp/commerce-studio-dashboard.json 2>/dev/null || log_warning "Failed to create overview dashboard"
    log_success "Commerce Studio overview dashboard created"
    
    rm -f /tmp/commerce-studio-dashboard.json
}

# Setup log-based metrics
setup_log_metrics() {
    log_info "Setting up log-based metrics..."
    
    # Error rate metric
    gcloud logging metrics create commerce_studio_error_rate \
        --description="Error rate for Commerce Studio services" \
        --log-filter='resource.type="cloud_run_revision" AND resource.labels.service_name=~"commerce-studio-.*" AND severity="ERROR"' \
        --value-extractor="" 2>/dev/null || log_warning "Error rate metric already exists or failed to create"
    
    # Authentication failures metric
    gcloud logging metrics create commerce_studio_auth_failures \
        --description="Authentication failures for Commerce Studio" \
        --log-filter='resource.type="cloud_run_revision" AND resource.labels.service_name="commerce-studio-auth" AND (textPayload:"authentication failed" OR textPayload:"login failed")' \
        --value-extractor="" 2>/dev/null || log_warning "Auth failures metric already exists or failed to create"
    
    # Secret access metric
    gcloud logging metrics create commerce_studio_secret_access \
        --description="Secret Manager access for Commerce Studio" \
        --log-filter='protoPayload.serviceName="secretmanager.googleapis.com" AND protoPayload.resourceName=~"projects/'"$PROJECT_ID"'/secrets/commerce-studio-.*"' \
        --value-extractor="" 2>/dev/null || log_warning "Secret access metric already exists or failed to create"
    
    log_success "Log-based metrics created"
}

# Setup uptime checks
setup_uptime_checks() {
    log_info "Setting up uptime checks..."
    
    # Get service URLs
    local api_url=$(gcloud run services describe commerce-studio-api --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "")
    local auth_url=$(gcloud run services describe commerce-studio-auth --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "")
    local frontend_url=$(gcloud run services describe commerce-studio-frontend --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "")
    
    if [[ -n "$api_url" ]]; then
        # Extract hostname from URL
        local api_host=$(echo "$api_url" | sed 's|https\?://||' | sed 's|/.*||')
        
        cat > /tmp/api-uptime-check.json << EOF
{
  "displayName": "Commerce Studio API Uptime",
  "httpCheck": {
    "path": "/health",
    "port": 443,
    "useSsl": true,
    "validateSsl": true
  },
  "monitoredResource": {
    "type": "uptime_url",
    "labels": {
      "project_id": "$PROJECT_ID",
      "host": "$api_host"
    }
  },
  "timeout": "10s",
  "period": "300s"
}
EOF
        
        gcloud monitoring uptime create --config-from-file=/tmp/api-uptime-check.json 2>/dev/null || log_warning "API uptime check already exists or failed to create"
        rm -f /tmp/api-uptime-check.json
    fi
    
    if [[ -n "$auth_url" ]]; then
        local auth_host=$(echo "$auth_url" | sed 's|https\?://||' | sed 's|/.*||')
        
        cat > /tmp/auth-uptime-check.json << EOF
{
  "displayName": "Commerce Studio Auth Uptime",
  "httpCheck": {
    "path": "/health",
    "port": 443,
    "useSsl": true,
    "validateSsl": true
  },
  "monitoredResource": {
    "type": "uptime_url",
    "labels": {
      "project_id": "$PROJECT_ID",
      "host": "$auth_host"
    }
  },
  "timeout": "10s",
  "period": "300s"
}
EOF
        
        gcloud monitoring uptime create --config-from-file=/tmp/auth-uptime-check.json 2>/dev/null || log_warning "Auth uptime check already exists or failed to create"
        rm -f /tmp/auth-uptime-check.json
    fi
    
    if [[ -n "$frontend_url" ]]; then
        local frontend_host=$(echo "$frontend_url" | sed 's|https\?://||' | sed 's|/.*||')
        
        cat > /tmp/frontend-uptime-check.json << EOF
{
  "displayName": "Commerce Studio Frontend Uptime",
  "httpCheck": {
    "path": "/",
    "port": 443,
    "useSsl": true,
    "validateSsl": true
  },
  "monitoredResource": {
    "type": "uptime_url",
    "labels": {
      "project_id": "$PROJECT_ID",
      "host": "$frontend_host"
    }
  },
  "timeout": "10s",
  "period": "300s"
}
EOF
        
        gcloud monitoring uptime create --config-from-file=/tmp/frontend-uptime-check.json 2>/dev/null || log_warning "Frontend uptime check already exists or failed to create"
        rm -f /tmp/frontend-uptime-check.json
    fi
    
    log_success "Uptime checks configured"
}

# Main setup function
main() {
    log_info "Setting up monitoring and observability for Commerce Studio"
    
    enable_apis
    create_notification_channels
    create_alerting_policies
    create_dashboards
    setup_log_metrics
    setup_uptime_checks
    
    log_success "Monitoring and observability setup completed!"
    echo ""
    echo "Monitoring Configuration:"
    echo "  Project ID: $PROJECT_ID"
    echo "  Environment: $ENVIRONMENT"
    echo "  Notification Email: $NOTIFICATION_EMAIL"
    echo ""
    echo "Access your monitoring dashboard at:"
    echo "  https://console.cloud.google.com/monitoring/dashboards?project=$PROJECT_ID"
    echo ""
}

# Run main function
main "$@"