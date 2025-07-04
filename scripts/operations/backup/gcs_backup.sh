#!/bin/bash
#
# Google Cloud Storage Backup Script for EyewearML Platform
# This script synchronizes data between primary Google Cloud Storage buckets and backup buckets,
# implements integrity checks, and maintains versioning.
#
# Usage: ./gcs_backup.sh [--config /path/to/config.conf]
#

set -e

# ==============================================================================
# Configuration
# ==============================================================================

# Default configuration values
PROJECT_ID=""                 # Google Cloud Project ID
SOURCE_BUCKETS=""             # Comma-separated list of source buckets
BACKUP_BUCKET=""              # Destination backup bucket
CRITICAL_FILES=""             # Comma-separated list of critical files to verify with hash checks
RETENTION_DAYS=90             # Number of days to keep backup versions
NOTIFY_EMAIL=""               # Email for notifications
NOTIFY_WEBHOOK=""             # Webhook URL for notifications
LOG_FILE="/var/log/eyewearml/gcs_backup.log"

# Load configuration from file if provided
CONFIG_FILE=""
if [[ "$1" == "--config" && -n "$2" ]]; then
    CONFIG_FILE="$2"
    if [[ -f "$CONFIG_FILE" ]]; then
        echo "Loading configuration from $CONFIG_FILE"
        source "$CONFIG_FILE"
    else
        echo "Error: Configuration file not found: $CONFIG_FILE"
        exit 1
    fi
fi

# Load configuration from environment variables if present
if [[ -n "$GCS_PROJECT_ID" ]]; then
    PROJECT_ID="$GCS_PROJECT_ID"
fi

if [[ -n "$GCS_SOURCE_BUCKETS" ]]; then
    SOURCE_BUCKETS="$GCS_SOURCE_BUCKETS"
fi

if [[ -n "$GCS_BACKUP_BUCKET" ]]; then
    BACKUP_BUCKET="$GCS_BACKUP_BUCKET"
fi

if [[ -n "$GCS_CRITICAL_FILES" ]]; then
    CRITICAL_FILES="$GCS_CRITICAL_FILES"
fi

if [[ -n "$GCS_RETENTION_DAYS" ]]; then
    RETENTION_DAYS="$GCS_RETENTION_DAYS"
fi

# Validate required configuration
if [[ -z "$PROJECT_ID" ]]; then
    echo "Error: Google Cloud Project ID is required. Set GCS_PROJECT_ID environment variable or use --config option."
    exit 1
fi

if [[ -z "$SOURCE_BUCKETS" ]]; then
    echo "Error: Source bucket(s) are required. Set GCS_SOURCE_BUCKETS environment variable or use --config option."
    exit 1
fi

if [[ -z "$BACKUP_BUCKET" ]]; then
    echo "Error: Backup bucket is required. Set GCS_BACKUP_BUCKET environment variable or use --config option."
    exit 1
fi

# ==============================================================================
# Logging
# ==============================================================================

log_dir=$(dirname "$LOG_FILE")
mkdir -p "$log_dir"

log() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$message"
    echo "$message" >> "$LOG_FILE"
}

log_error() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1"
    echo "$message" >&2
    echo "$message" >> "$LOG_FILE"
}

# ==============================================================================
# Notification
# ==============================================================================

send_notification() {
    local subject="$1"
    local message="$2"
    local status="$3"  # success or failure
    
    log "Sending notification: $subject ($status)"
    
    # Send email notification if configured
    if [[ -n "$NOTIFY_EMAIL" ]]; then
        if command -v mail &> /dev/null; then
            echo "$message" | mail -s "EyewearML GCS Backup: $subject ($status)" "$NOTIFY_EMAIL"
        else
            log_error "mail command not found, cannot send email notification"
        fi
    fi
    
    # Send webhook notification if configured
    if [[ -n "$NOTIFY_WEBHOOK" ]]; then
        if command -v curl &> /dev/null; then
            local color="good"
            if [[ "$status" == "failure" ]]; then
                color="danger"
            fi
            
            curl -s -X POST "$NOTIFY_WEBHOOK" \
                -H "Content-Type: application/json" \
                -d "{\"text\":\"EyewearML GCS Backup: $subject\", \"attachments\":[{\"text\":\"$message\", \"color\":\"$color\"}]}" \
                || log_error "Failed to send webhook notification"
        else
            log_error "curl command not found, cannot send webhook notification"
        fi
    fi
}

# ==============================================================================
# Backup Functions
# ==============================================================================

# Enable versioning on bucket if not already enabled
check_versioning() {
    local bucket="$1"
    
    log "Checking versioning status for bucket: $bucket"
    
    local versioning_status
    versioning_status=$(gsutil versioning get "gs://${bucket}" | grep -o "Enabled: .*" | cut -d ' ' -f 2)
    
    if [[ "$versioning_status" == "True" ]]; then
        log "Versioning already enabled on bucket: $bucket"
        return 0
    else
        log "Enabling versioning on bucket: $bucket"
        gsutil versioning set on "gs://${bucket}" || return 1
        log "Versioning enabled on bucket: $bucket"
        return 0
    fi
}

# Configure lifecycle policy for backup bucket
configure_lifecycle() {
    local bucket="$1"
    local retention_days="$2"
    
    log "Configuring lifecycle policy for bucket: $bucket (retention: $retention_days days)"
    
    # Create a temporary JSON file for the lifecycle policy
    local temp_file=$(mktemp)
    
    cat > "$temp_file" << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": $retention_days,
          "isLive": false
        }
      }
    ]
  }
}
EOF
    
    # Apply the lifecycle policy
    gsutil lifecycle set "$temp_file" "gs://${bucket}" || { log_error "Failed to set lifecycle policy"; rm -f "$temp_file"; return 1; }
    
    # Clean up
    rm -f "$temp_file"
    
    log "Lifecycle policy applied to bucket: $bucket"
    return 0
}

# Synchronize a source bucket to the backup bucket
sync_bucket() {
    local source_bucket="$1"
    local backup_bucket="$2"
    local backup_path="${source_bucket}"
    
    log "Synchronizing bucket: gs://${source_bucket}/ -> gs://${backup_bucket}/${backup_path}/"
    
    # Perform the rsync operation
    if gsutil -m rsync -r "gs://${source_bucket}" "gs://${backup_bucket}/${backup_path}"; then
        log "Synchronization completed successfully for bucket: $source_bucket"
        return 0
    else
        log_error "Synchronization failed for bucket: $source_bucket"
        return 1
    fi
}

# Verify integrity of critical files
verify_integrity() {
    local source_bucket="$1"
    local backup_bucket="$2"
    local backup_path="${source_bucket}"
    local critical_files="$3"
    local verify_status=0
    
    if [[ -z "$critical_files" ]]; then
        log "No critical files specified for integrity check, skipping verification"
        return 0
    fi
    
    log "Verifying integrity of critical files for bucket: $source_bucket"
    
    # Convert comma-separated list to array
    IFS=',' read -r -a files_array <<< "$critical_files"
    
    for file_path in "${files_array[@]}"; do
        log "Checking file: $file_path"
        
        # Calculate hash for source file
        local source_hash
        if ! source_hash=$(gsutil hash -h "gs://${source_bucket}/${file_path}" 2>/dev/null | grep "Hash (md5):" | awk '{print $3}'); then
            log_error "Failed to calculate hash for source file: gs://${source_bucket}/${file_path}"
            verify_status=1
            continue
        fi
        
        # Calculate hash for backup file
        local backup_hash
        if ! backup_hash=$(gsutil hash -h "gs://${backup_bucket}/${backup_path}/${file_path}" 2>/dev/null | grep "Hash (md5):" | awk '{print $3}'); then
            log_error "Failed to calculate hash for backup file: gs://${backup_bucket}/${backup_path}/${file_path}"
            verify_status=1
            continue
        fi
        
        # Compare hashes
        if [[ "$source_hash" == "$backup_hash" ]]; then
            log "Integrity check passed for file: $file_path"
        else
            log_error "Integrity check failed for file: $file_path (hash mismatch)"
            log_error "Source hash: $source_hash"
            log_error "Backup hash: $backup_hash"
            verify_status=1
        fi
    done
    
    if [[ "$verify_status" -eq 0 ]]; then
        log "All integrity checks passed for bucket: $source_bucket"
    else
        log_error "Some integrity checks failed for bucket: $source_bucket"
    fi
    
    return $verify_status
}

# Add backup metadata file
add_metadata() {
    local source_bucket="$1"
    local backup_bucket="$2"
    local backup_path="${source_bucket}"
    
    log "Adding backup metadata for bucket: $source_bucket"
    
    # Create a temporary JSON file for metadata
    local temp_file=$(mktemp)
    local timestamp=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    local date=$(date '+%Y-%m-%d')
    
    cat > "$temp_file" << EOF
{
  "backup_type": "gcs_bucket",
  "source_bucket": "${source_bucket}",
  "backup_bucket": "${backup_bucket}/${backup_path}",
  "timestamp": "${timestamp}",
  "date": "${date}",
  "project": "${PROJECT_ID}",
  "created_by": "gcs_backup.sh"
}
EOF
    
    # Upload metadata file
    gsutil cp "$temp_file" "gs://${backup_bucket}/${backup_path}/backup_metadata.json" || { log_error "Failed to upload metadata file"; rm -f "$temp_file"; return 1; }
    
    # Clean up
    rm -f "$temp_file"
    
    log "Metadata added for bucket: $source_bucket"
    return 0
}

# ==============================================================================
# Main Execution
# ==============================================================================

main() {
    local today=$(date '+%Y-%m-%d')
    local backup_status=0
    
    log "=== Starting Google Cloud Storage backup process ==="
    log "Project ID: $PROJECT_ID"
    log "Source buckets: $SOURCE_BUCKETS"
    log "Backup bucket: $BACKUP_BUCKET"
    
    # Check and enable versioning on backup bucket
    check_versioning "$BACKUP_BUCKET" || backup_status=1
    
    # Configure lifecycle policy on backup bucket
    configure_lifecycle "$BACKUP_BUCKET" "$RETENTION_DAYS" || backup_status=1
    
    # Convert comma-separated list to array
    IFS=',' read -r -a buckets_array <<< "$SOURCE_BUCKETS"
    
    # Process each source bucket
    for source_bucket in "${buckets_array[@]}"; do
        log "Processing bucket: $source_bucket"
        
        # Synchronize bucket
        if ! sync_bucket "$source_bucket" "$BACKUP_BUCKET"; then
            backup_status=1
            continue
        fi
        
        # Verify integrity of critical files
        if ! verify_integrity "$source_bucket" "$BACKUP_BUCKET" "$CRITICAL_FILES"; then
            backup_status=1
        fi
        
        # Add metadata
        add_metadata "$source_bucket" "$BACKUP_BUCKET" || backup_status=1
    done
    
    # Send notifications
    if [[ "$backup_status" -eq 0 ]]; then
        log "=== Google Cloud Storage backup process completed successfully ==="
        send_notification "Backup Completed" "GCS backup of ${#buckets_array[@]} bucket(s) completed successfully." "success"
    else
        log_error "=== Google Cloud Storage backup process completed with errors ==="
        send_notification "Backup Failed" "GCS backup completed with errors. Check the logs for details." "failure"
    fi
    
    return $backup_status
}

# Execute the main function
main "$@"
