# Promotion Process Module for VARAi Platform

This Terraform module sets up a comprehensive promotion process for the VARAi Platform. It creates the necessary infrastructure and resources to safely and reliably promote applications from one environment to another (e.g., from staging to production).

## Features

### Promotion Workflow

The promotion process follows a structured workflow:

1. **Initiation**: The promotion process is initiated either manually or automatically.
2. **Validation**: Pre-promotion checks are performed to ensure the application is ready for promotion.
3. **Approval**: If required, approvers review and approve the promotion.
4. **Configuration**: Configuration changes are applied to the target environment.
5. **Database Migration**: Database changes are migrated to the target environment.
6. **Artifact Promotion**: Container images and other artifacts are promoted to the target environment.
7. **Deployment**: The application is deployed to the target environment.
8. **Verification**: Post-deployment checks are performed to ensure the promotion was successful.
9. **Rollback**: If verification fails, the promotion is automatically rolled back.

### Approval Gates

The module supports configurable approval gates:

- Manual approval by specified approvers
- Automated approval based on test results
- Multi-stage approval process
- Approval history tracking
- Approval notifications

### Configuration Management

The module includes comprehensive configuration management:

- Git-based configuration storage
- Environment-specific configuration
- Configuration validation
- Configuration history
- Configuration diff visualization

### Database Migration

The module supports various database migration strategies:

- Blue-Green: Creates a complete copy of the database with minimal downtime
- Incremental: Migrates only the changes since the last migration
- Schema-First: Migrates schema changes first, then data

### Artifact Promotion

The module handles artifact promotion:

- Container image tagging and promotion
- Artifact versioning
- Artifact metadata
- Artifact scanning
- Artifact signing

## Usage

```hcl
module "promotion_process" {
  source = "../../modules/promotion_process"
  
  environment          = "staging"
  target_environment   = "prod"
  kubernetes_namespace = "varai-staging"
  domain_name          = "staging.varai.ai"
  approval_required    = true
  approvers            = [
    "devops@varai.ai",
    "product@varai.ai"
  ]
  promotion_checklist  = [
    "All tests passing",
    "Performance metrics within thresholds",
    "Security scan passed",
    "Manual QA approval",
    "Product owner approval"
  ]
  artifact_registry    = "ghcr.io/varai"
  config_repository    = "https://github.com/varai/config.git"
  database_migration_strategy = "blue-green"
  notification_channels = [
    "projects/your-gcp-project-id/notificationChannels/your-notification-channel-id"
  ]
  gcp_project_id       = "your-gcp-project-id"
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| environment | Source environment name (e.g., dev, staging, prod) | `string` | n/a | yes |
| target_environment | Target environment name (e.g., staging, prod) | `string` | n/a | yes |
| kubernetes_namespace | Kubernetes namespace for the application | `string` | n/a | yes |
| domain_name | Domain name for the application | `string` | n/a | yes |
| approval_required | Whether approval is required for promotion | `bool` | `true` | no |
| approvers | List of email addresses for promotion approvers | `list(string)` | `[]` | no |
| promotion_checklist | List of items to check before promotion | `list(string)` | `[]` | no |
| artifact_registry | Container registry for artifacts | `string` | n/a | yes |
| config_repository | Git repository URL for configuration management | `string` | n/a | yes |
| database_migration_strategy | Strategy for database migration | `string` | `"blue-green"` | no |
| notification_channels | List of notification channel IDs for alerts | `list(string)` | `[]` | no |
| db_migration_function_source | Path to the database migration function source code | `string` | `"functions/db_migration.zip"` | no |
| source_db_connection | Connection string for the source database | `string` | `""` | no |
| target_db_connection | Connection string for the target database | `string` | `""` | no |
| gcp_project_id | GCP project ID | `string` | n/a | yes |
| enable_feature_flag_promotion | Enable feature flag promotion | `bool` | `true` | no |
| feature_flag_service | Feature flag service to use | `string` | `"flagsmith"` | no |
| feature_flag_api_key | API key for feature flag service | `string` | `""` | no |
| enable_rollback | Enable automatic rollback on promotion failure | `bool` | `true` | no |
| rollback_timeout | Timeout for rollback in seconds | `number` | `300` | no |
| enable_canary_promotion | Enable canary promotion | `bool` | `false` | no |
| canary_promotion_percentage | Percentage of traffic for canary promotion | `number` | `10` | no |
| canary_promotion_duration | Duration of canary promotion in seconds | `number` | `3600` | no |
| enable_promotion_metrics | Enable promotion metrics collection | `bool` | `true` | no |
| promotion_metrics_retention_days | Days to retain promotion metrics | `number` | `90` | no |
| enable_promotion_logs | Enable promotion logs collection | `bool` | `true` | no |
| promotion_logs_retention_days | Days to retain promotion logs | `number` | `30` | no |
| enable_promotion_notifications | Enable promotion notifications | `bool` | `true` | no |
| promotion_notification_channels | Notification channels for promotion events | `list(string)` | `[]` | no |
| enable_promotion_audit | Enable promotion audit trail | `bool` | `true` | no |
| promotion_audit_retention_days | Days to retain promotion audit trail | `number` | `365` | no |

## Outputs

| Name | Description |
|------|-------------|
| promotion_namespace | The Kubernetes namespace for promotion resources |
| dashboard_url | The URL for the promotion dashboard |
| promotion_ui_url | The URL for the promotion UI |
| promotion_artifacts_bucket | The GCS bucket for promotion artifacts |
| promotion_trigger_id | The ID of the Cloud Build trigger for promotion |
| db_migration_function_url | The URL of the Cloud Function for database migration |
| promotion_notification_topic | The Pub/Sub topic for promotion notifications |
| promotion_notification_subscription | The Pub/Sub subscription for promotion notifications |
| promotion_health_check_job | The Cloud Scheduler job for promotion health checks |
| promotion_config | The promotion configuration |
| promotion_status | The status of the promotion process |

## Architecture

The promotion process module creates the following resources:

- Kubernetes namespace for promotion resources
- Service account, role, and role binding for promotion process
- ConfigMap for promotion configuration
- GCS bucket for promotion artifacts
- Cloud Build trigger for promotion
- Cloud Function for database migration
- Pub/Sub topic and subscription for promotion notifications
- Cloud Scheduler job for promotion health checks
- Cloud Monitoring dashboard for promotion process
- Alert policy for promotion failures
- Cloud Run service for promotion UI

## Database Migration

The database migration function supports three strategies:

### Blue-Green

The blue-green strategy creates a complete copy of the database with minimal downtime:

1. Create a new database instance
2. Copy all data from the source database to the target database
3. Switch the application to use the new database
4. Verify the new database
5. Decommission the old database

### Incremental

The incremental strategy migrates only the changes since the last migration:

1. Track changes in the source database
2. Apply only the changes to the target database
3. Verify the changes
4. Update the last migration timestamp

### Schema-First

The schema-first strategy migrates schema changes first, then data:

1. Apply schema changes to the target database
2. Verify schema changes
3. Migrate data to match the new schema
4. Verify data migration

## Promotion UI

The promotion UI provides a web interface for managing the promotion process:

- Initiate promotions
- Review and approve promotions
- View promotion history
- Monitor promotion status
- View promotion logs
- Trigger rollbacks

## Monitoring

The module creates a Cloud Monitoring dashboard for the promotion process, which includes:

- Promotion history
- Promotion success rate
- Database migration duration
- Promotion duration

It also creates alert policies for promotion failures, which will send notifications to the specified notification channels.

## Troubleshooting

### Common Issues

1. **Approval Issues**: Ensure that the approvers have the necessary permissions and are receiving notification emails.

2. **Database Migration Failures**: Check the database migration logs for details on why the migration failed.

3. **Artifact Promotion Failures**: Verify that the artifact registry is accessible and that the service account has the necessary permissions.

4. **Deployment Failures**: Check the Cloud Build logs and Kubernetes events for details on deployment failures.

### Getting Help

For additional help, contact the VARAi Platform team at devops@varai.ai.