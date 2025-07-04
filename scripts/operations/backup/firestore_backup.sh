#!/bin/bash
#
# Firestore Backup Script for EyewearML Platform
# This script creates daily exports of the Firestore database to Google Cloud Storage,
# implements retention policies, performs integrity checks, and sends notifications.
#
# Usage: ./firestore_backup.sh [--config /path/to/config.conf]
#

set -e

# ==============================================================================
# Configuration
# ==============================================================================

# Default configuration values
PROJECT_ID=""                 # Google Cloud Project ID
GCS_BUCKET=""                 # Google Cloud Storage bucket for backups
COLLECTION_IDS=""             # Comma-separated list of collections to include (empty for all)
RETENTION_DAYS=30             # Number of days to keep backups
NOTIFY_EMAIL=""               # Email for notifications
NOTIFY_WEBHOOK=""             # Webhook URL for notifications
LOG_FILE="/var/log/eyewearml/firestore_backup.log"

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
if [[ -n "$FIRESTORE_PROJECT_ID" ]]; then
    PROJECT_ID="$FIRESTORE_PROJECT_ID"
fi

if [[ -n "$FIRESTORE_GCS_BUCKET" ]]; then
    GCS_BUCKET="$FIRESTORE_GCS_BUCKET"
fi

if [[ -n "$FIRESTORE_COLLECTION_IDS" ]]; then
    COLLECTION_IDS="$FIRESTORE_COLLECTION_IDS"
fi

if [[ -n "$FIRESTORE_RETENTION_DAYS" ]]; then
    RETENTION_DAYS="$FIRESTORE_RETENTION_DAYS"
fi

# Validate required configuration
if [[ -z "$PROJECT_ID" ]]; then
    echo "Error: Google Cloud Project ID is required. Set FIRESTORE_PROJECT_ID environment variable or use --config option."
    exit 1
fi

if [[ -z "$GCS_BUCKET" ]]; then
    echo "Error: Google Cloud Storage bucket is required. Set FIRESTORE_GCS_BUCKET environment variable or use --config option."
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
            echo "$message" | mail -s "EyewearML Firestore Backup: $subject ($status)" "$NOTIFY_EMAIL"
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
                -d "{\"text\":\"EyewearML Firestore Backup: $subject\", \"attachments\":[{\"text\":\"$message\", \"color\":\"$color\"}]}" \
                || log_error "Failed to send webhook notification"
        else
            log_error "curl command not found, cannot send webhook notification"
        fi
    fi
}

# ==============================================================================
# Backup Functions
# ==============================================================================

validate_backup() {
    local gcs_path="$1"
    
    log "Validating backup: $gcs_path"
    
    # Check if the backup contains metadata.json file
    if gsutil -q stat "${gcs_path}/metadata.json"; then
        log "Backup validation passed: Found metadata.json"
        
        # Download and check the metadata file
        local temp_file=$(mktemp)
        gsutil cp "${gcs_path}/metadata.json" "$temp_file"
        
        # Check if metadata file is valid JSON
        if jq . "$temp_file" > /dev/null 2>&1; then
            log "Backup validation passed: Valid metadata.json format"
            
            # Check if metadata contains expected fields
            local status=0
            if ! jq -e '.database' "$temp_file" > /dev/null 2>&1; then
                log_error "Backup validation failed: Missing database field in metadata"
                status=1
            fi
            
            if ! jq -e '.timestamp' "$temp_file" > /dev/null 2>&1; then
                log_error "Backup validation failed: Missing timestamp field in metadata"
                status=1
            fi
            
            rm -f "$temp_file"
            return $status
        else
            log_error "Backup validation failed: Invalid metadata.json format"
            rm -f "$temp_file"
            return 1
        fi
    else
        log_error "Backup validation failed: metadata.json not found"
        return 1
    fi
}

create_backup() {
    local backup_date="$1"  # YYYY-MM-DD format
    local gcs_path="gs://${GCS_BUCKET}/firestore/${backup_date}"
    local backup_status=0
    
    log "Creating Firestore backup for ${backup_date}"
    
    # Additional export options
    local collection_option=""
    if [[ -n "$COLLECTION_IDS" ]]; then
        # Transform comma-separated list to gcloud format
        collection_option="--collection-ids=${COLLECTION_IDS}"
    fi
    
    # Run the export command
    log "Running Firestore export to $gcs_path"
    if ! gcloud firestore export "$gcs_path" --project="$PROJECT_ID" $collection_option; then
        log_error "Firestore export command failed"
        return 1
    fi
    
    # Add metadata file about the backup
    log "Adding backup metadata"
    local temp_file=$(mktemp)
    cat > "$temp_file" << EOF
{
  "database": "firestore",
  "project": "${PROJECT_ID}",
  "timestamp": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "date": "${backup_date}",
  "collections": ${COLLECTION_IDS:-"\"all\""},
  "created_by": "firestore_backup.sh"
}
EOF
    
    # Upload metadata file
    if ! gsutil cp "$temp_file" "${gcs_path}/metadata.json"; then
        log_error "Failed to upload metadata file"
        rm -f "$temp_file"
        return 1
    fi
    rm -f "$temp_file"
    
    # Validate the backup
    if ! validate_backup "$gcs_path"; then
        log_error "Backup validation failed"
        return 1
    fi
    
    log "Firestore backup completed: $gcs_path"
    return 0
}

apply_retention_policy() {
    log "Applying retention policy: Keeping backups for $RETENTION_DAYS days"
    
    # List all backup folders
    local backups=$(gsutil ls "gs://${GCS_BUCKET}/firestore/" | grep -v "metadata.json")
    
    # Get the cutoff date
    local cutoff_date=$(date -d "-${RETENTION_DAYS} days" '+%Y-%m-%d')
    
    for backup in $backups; do
        # Extract date from backup path (format: gs://bucket/firestore/YYYY-MM-DD/)
        local backup_date=$(basename "${backup%/}")
        
        # Skip if it's not a date-formatted folder
        if ! [[ "$backup_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
            continue
        fi
        
        # Compare with cutoff date
        if [[ "$backup_date" < "$cutoff_date" ]]; then
            log "Deleting old backup: $backup (older than $cutoff_date)"
            gsutil -m rm -r "$backup"
        fi
    done
    
    log "Retention policy applied"
}

# ==============================================================================
# Main Execution
# ==============================================================================

main() {
    local today=$(date '+%Y-%m-%d')
    local backup_status=0
    
    log "=== Starting Firestore backup process ==="
    log "Project ID: $PROJECT_ID"
    log "Backup destination: gs://${GCS_BUCKET}/firestore/${today}"
    
    # Create the backup
    create_backup "$today" || backup_status=1
    
    # Apply retention policy
    if [[ "$backup_status" -eq 0 ]]; then
        apply_retention_policy || log_error "Failed to apply retention policy"
    fi
    
    # Send notifications
    if [[ "$backup_status" -eq 0 ]]; then
        log "=== Firestore backup process completed successfully ==="
        send_notification "Backup Completed" "Firestore backup completed successfully." "success"
    else
        log_error "=== Firestore backup process completed with errors ==="
        send_notification "Backup Failed" "Firestore backup completed with errors. Check the logs for details." "failure"
    fi
    
    return $backup_status
}

# Execute the main function
main "$@"
