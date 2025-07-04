# Disaster Recovery Developer Guide

This guide provides instructions for developers on how to use, maintain, and extend the disaster recovery and backup system for the EyewearML platform.

## Overview

The EyewearML disaster recovery system consists of:

- A comprehensive backup strategy for all critical data components
- Automated backup scripts for MongoDB, Firestore, and Google Cloud Storage
- Corresponding restore scripts with validation capabilities
- Documentation and agentic prompts for extending the system

## Directory Structure

```
eyewear-ml/
├── docs/
│   └── operations/
│       ├── disaster_recovery_strategy.md         # Overall strategy and policies
│       ├── disaster_recovery_developer_guide.md  # This guide for developers
│       └── agentic_prompts/
│           └── disaster_recovery_implementation.md # Prompts for extending with new scripts
└── scripts/
    └── operations/
        ├── backup/                              # Backup scripts
        │   ├── mongodb_backup.sh
        │   ├── firestore_backup.sh
        │   └── gcs_backup.sh
        └── recovery/                            # Recovery scripts
            ├── mongodb_restore.sh
            ├── firestore_restore.sh
            └── gcs_restore.sh
```

## Setting Up Automated Backups

### Prerequisites

Before setting up automated backups, ensure you have:

1. Proper access credentials for all relevant systems (MongoDB, Google Cloud)
2. Sufficient storage capacity for backups
3. Required tools installed on the backup server:
   - MongoDB tools (`mongodump`, `mongorestore`)
   - Google Cloud SDK (`gcloud`, `gsutil`)
   - Common Unix tools (`jq`, `openssl`, `mail`)

### Configuration Files

All scripts support configuration via environment variables or a configuration file. Create a configuration file for each backup type:

**MongoDB Config Example (`mongodb_backup.conf`):**
```bash
# MongoDB connection details
MONGODB_BACKUP_DIR="/path/to/backup/directory"
MONGODB_DB_NAME="eyewear_ml"
MONGODB_URI="${DISASTER_RECOVERY_DEVELOPER_GUIDE_SECRET_1}"
MONGODB_IS_ATLAS="false"  # Set to true for MongoDB Atlas

# Backup configuration
ENCRYPTION_KEY_FILE="/etc/eyewearml/backup_encryption.key"
RETENTION_DAILY=30      # days
RETENTION_WEEKLY=12     # weeks
RETENTION_MONTHLY=12    # months
ENABLE_HOURLY=true
HOURLY_RETENTION=24     # hours

# Notification configuration
NOTIFY_EMAIL="devops@example.com"
NOTIFY_WEBHOOK="https://hooks.slack.com/services/TXXXXXX/BXXXXXX/XXXXXXXX"
```

**Firestore Config Example (`firestore_backup.conf`):**
```bash
# Google Cloud configuration
FIRESTORE_PROJECT_ID="eyewearml-project"
FIRESTORE_GCS_BUCKET="eyewearml-backups"
FIRESTORE_COLLECTION_IDS="users,products,sessions"  # Leave empty for all collections
FIRESTORE_RETENTION_DAYS=30

# Notification configuration
NOTIFY_EMAIL="devops@example.com"
NOTIFY_WEBHOOK="https://hooks.slack.com/services/TXXXXXX/BXXXXXX/XXXXXXXX"
```

**GCS Config Example (`gcs_backup.conf`):**
```bash
# Google Cloud configuration
GCS_PROJECT_ID="eyewearml-project"
GCS_SOURCE_BUCKETS="eyewearml-assets,eyewearml-models,eyewearml-data"
GCS_BACKUP_BUCKET="eyewearml-backups"
GCS_CRITICAL_FILES="models/face-analysis-v2.0/model.pb,config/production.json"
GCS_RETENTION_DAYS=90

# Notification configuration
NOTIFY_EMAIL="devops@example.com"
NOTIFY_WEBHOOK="https://hooks.slack.com/services/TXXXXXX/BXXXXXX/XXXXXXXX"
```

### Setting Up Cron Jobs

To automate backups, set up cron jobs on the server:

```bash
# Edit crontab
crontab -e

# Add the following lines (adjust paths as needed):

# MongoDB backups - daily at 1:00 AM
0 1 * * * /path/to/eyewear-ml/scripts/operations/backup/mongodb_backup.sh --config /path/to/mongodb_backup.conf > /var/log/eyewearml/mongodb_backup_cron.log 2>&1

# Firestore backups - daily at 2:00 AM
0 2 * * * /path/to/eyewear-ml/scripts/operations/backup/firestore_backup.sh --config /path/to/firestore_backup.conf > /var/log/eyewearml/firestore_backup_cron.log 2>&1

# GCS backups - daily at 3:00 AM
0 3 * * * /path/to/eyewear-ml/scripts/operations/backup/gcs_backup.sh --config /path/to/gcs_backup.conf > /var/log/eyewearml/gcs_backup_cron.log 2>&1
```

Make sure all scripts have executable permissions:
```bash
chmod +x /path/to/eyewear-ml/scripts/operations/backup/*.sh
chmod +x /path/to/eyewear-ml/scripts/operations/recovery/*.sh
```

## Running Manual Backups

You may need to run manual backups in certain situations:

### MongoDB Manual Backup

```bash
# Run with configuration file
./scripts/operations/backup/mongodb_backup.sh --config /path/to/mongodb_backup.conf

# Run with environment variables
export MONGODB_BACKUP_DIR="/path/to/backup/directory"
export MONGODB_DB_NAME="eyewear_ml"
export MONGODB_URI="${DISASTER_RECOVERY_DEVELOPER_GUIDE_SECRET_1}"
./scripts/operations/backup/mongodb_backup.sh
```

### Firestore Manual Backup

```bash
# Run with configuration file
./scripts/operations/backup/firestore_backup.sh --config /path/to/firestore_backup.conf

# Run with environment variables
export FIRESTORE_PROJECT_ID="eyewearml-project"
export FIRESTORE_GCS_BUCKET="eyewearml-backups"
./scripts/operations/backup/firestore_backup.sh
```

### GCS Manual Backup

```bash
# Run with configuration file
./scripts/operations/backup/gcs_backup.sh --config /path/to/gcs_backup.conf

# Run with environment variables
export GCS_PROJECT_ID="eyewearml-project"
export GCS_SOURCE_BUCKETS="eyewearml-assets,eyewearml-models,eyewearml-data"
export GCS_BACKUP_BUCKET="eyewearml-backups"
./scripts/operations/backup/gcs_backup.sh
```

## Performing Restores

Before performing a restore, especially in production, make sure you:
1. Have a clear understanding of what you're restoring and why
2. Have communicated the restore operation to relevant stakeholders
3. Have a rollback plan if the restore causes issues

### Test Restore vs. Production Restore

All restore scripts support a test mode that lets you validate a backup without affecting production data:

```bash
# Test restore for MongoDB
./scripts/operations/recovery/mongodb_restore.sh --config /path/to/mongodb_backup.conf --date 2025-03-25 --type daily --test-mode

# Test restore for Firestore
./scripts/operations/recovery/firestore_restore.sh --config /path/to/firestore_backup.conf --date 2025-03-25 --test-mode

# Test restore for GCS
./scripts/operations/recovery/gcs_restore.sh --config /path/to/gcs_backup.conf --source-bucket assets-bucket --test-mode
```

### MongoDB Restore

```bash
# Restore from daily backup
./scripts/operations/recovery/mongodb_restore.sh --config /path/to/mongodb_backup.conf --date 2025-03-25 --type daily

# Restore from hourly backup (specific hour)
./scripts/operations/recovery/mongodb_restore.sh --config /path/to/mongodb_backup.conf --date 2025-03-25 --hour 14 --type hourly

# Restore to a different database
./scripts/operations/recovery/mongodb_restore.sh --config /path/to/mongodb_backup.conf --date 2025-03-25 --target-db eyewear_ml_restored
```

### Firestore Restore

```bash
# Restore from a specific date
./scripts/operations/recovery/firestore_restore.sh --config /path/to/firestore_backup.conf --date 2025-03-25

# Restore to a different project
./scripts/operations/recovery/firestore_restore.sh --config /path/to/firestore_backup.conf --date 2025-03-25 --target-project eyewearml-project-restored
```

### GCS Restore

```bash
# Standard restore
./scripts/operations/recovery/gcs_restore.sh --config /path/to/gcs_backup.conf --source-bucket assets-bucket

# Point-in-time restore (using versioning)
./scripts/operations/recovery/gcs_restore.sh --config /path/to/gcs_backup.conf --source-bucket assets-bucket --version-date 2025-03-25

# Restore to a different target bucket
./scripts/operations/recovery/gcs_restore.sh --config /path/to/gcs_backup.conf --source-bucket assets-bucket --target-bucket assets-bucket-restored
```

## Monitoring Backups

### Logs

All backup and restore scripts generate detailed logs. Check the following locations for logs:

- Script output logs: `/var/log/eyewearml/*.log`
- Cron job logs: `/var/log/eyewearml/*_cron.log`

### Email Notifications

Configure `NOTIFY_EMAIL` in each configuration file to receive email notifications on backup success or failure.

### Webhook Notifications (Slack, Teams, etc.)

Configure `NOTIFY_WEBHOOK` in each configuration file to receive webhook notifications. This works with Slack, Microsoft Teams, or any other platform that supports incoming webhooks.

## Troubleshooting

### Common Backup Issues

1. **Permission Errors**
   - Verify service account permissions
   - Check file system permissions for local backups

2. **Network Issues**
   - Ensure firewalls allow connections to MongoDB, GCS
   - Check for VPN or network restrictions

3. **Storage Issues**
   - Verify sufficient disk space for backups
   - Check quota limits in Google Cloud

### Common Restore Issues

1. **Backup File Not Found**
   - Verify backup path/date/type is correct
   - Check if backup was created successfully

2. **Integrity Check Failures**
   - Backup may be corrupted
   - Check encryption key if using encrypted backups

3. **Permission Issues**
   - Verify service account has write permissions for restore operations

## Security Considerations

### Encryption Key Management

If using encrypted backups, the encryption key is critical:

1. Store the encryption key separately from backups
2. Use a secure key management system if possible
3. Have a secure process for key rotation

### Access Control

Limit access to backup/restore scripts:

1. Only DevOps team members should have access to these scripts
2. Use careful permission management for service accounts
3. Log all access to backup data

## Extending the System

### Adding New Backup Types

To add a new backup type:

1. Use the agentic prompts in `docs/operations/agentic_prompts/disaster_recovery_implementation.md`
2. Create a new backup script based on the templates
3. Create a corresponding restore script
4. Update documentation to include the new scripts

### Modifying Existing Scripts

When modifying existing scripts:

1. Test changes in a test environment first
2. Maintain the same logging and notification structure
3. Update documentation to reflect changes
4. Consider backward compatibility with existing backups

## Recovery Drills

Regular recovery drills should be conducted to ensure the effectiveness of the backup system:

1. Schedule quarterly recovery drills
2. Test restoration of each critical data component
3. Validate data integrity after restore
4. Document any issues or improvements needed
5. Update procedures based on drill findings

## Further Reading

- [Disaster Recovery Strategy](./disaster_recovery_strategy.md)
- [Agentic Prompts for Disaster Recovery](./agentic_prompts/disaster_recovery_implementation.md)
- [MongoDB Backup Documentation](https://docs.mongodb.com/manual/core/backups/)
- [Google Cloud Firestore Export/Import Documentation](https://cloud.google.com/firestore/docs/manage-data/export-import)
- [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs/creating-buckets)
