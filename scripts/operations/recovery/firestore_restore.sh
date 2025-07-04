#!/bin/bash
#
# Firestore Restore Script for EyewearML Platform
# This script restores Firestore data from backups stored in Google Cloud Storage,
# provides validation checks, and allows for test restores.
#
# Usage: ./firestore_restore.sh [--config /path/to/config.conf] [--date YYYY-MM-DD] [--target-project project-id] [--test-mode]
#

set -e

# ==============================================================================
# Configuration
# ==============================================================================

# Default configuration values
PROJECT_ID=""                 # Google Cloud Project ID (source)
GCS_BUCKET=""                 # Google Cloud Storage bucket with backups
TARGET_PROJECT_ID=""          # Target project ID (for restore)
NOTIFY_EMAIL=""               # Email for notifications
NOTIFY_WEBHOOK=""             # Webhook URL for notifications
LOG_FILE="/var/log/eyewearml/firestore_restore.log"
TEST_MODE=false
RESTORE_DATE=$(date '+%Y-%m-%d')

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        --config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        --date)
            RESTORE_DATE="$2"
            shift 2
            ;;
        --target-project)
            TARGET_PROJECT_ID="$2"
            shift 2
            ;;
        --test-mode)
            TEST_MODE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate date format
if ! date -d "$RESTORE_DATE" >/dev/null 2>&1; then
    echo "Error: Invalid date format. Please use YYYY-MM-DD format."
    exit 1
fi

# Load configuration from file if provided
if [[ -n "$CONFIG_FILE" ]]; then
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

# Validate required configuration
if [[ -z "$PROJECT_ID" ]]; then
    echo "Error: Google Cloud Project ID is required. Set FIRESTORE_PROJECT_ID environment variable or use --config option."
    exit 1
fi

if [[ -z "$GCS_BUCKET" ]]; then
    echo "Error: Google Cloud Storage bucket is required. Set FIRESTORE_GCS_BUCKET environment variable or use --config option."
    exit 1
fi

# Set target project ID if not specified
if [[ -z "$TARGET_PROJECT_ID" ]]; then
    if [[ "$TEST_MODE" == "true" ]]; then
        TARGET_PROJECT_ID="${PROJECT_ID}-test"
    else
        TARGET_PROJECT_ID="$PROJECT_ID"
    fi
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
            echo "$message" | mail -s "EyewearML Firestore Restore: $subject ($status)" "$NOTIFY_EMAIL"
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
                -d "{\"text\":\"EyewearML Firestore Restore: $subject\", \"attachments\":[{\"text\":\"$message\", \"color\":\"$color\"}]}" \
                || log_error "Failed to send webhook notification"
        else
            log_error "curl command not found, cannot send webhook notification"
        fi
    fi
}

# ==============================================================================
# Validation Functions
# ==============================================================================

check_backup_existence() {
    local backup_date="$1"
    local gcs_path="gs://${GCS_BUCKET}/firestore/${backup_date}"
    
    log "Checking if backup exists: $gcs_path"
    
    if gsutil -q ls "$gcs_path" > /dev/null 2>&1; then
        log "Backup found: $gcs_path"
        return 0
    else
        log_error "Backup not found: $gcs_path"
        return 1
    fi
}

validate_backup() {
    local backup_date="$1"
    local gcs_path="gs://${GCS_BUCKET}/firestore/${backup_date}"
    
    log "Validating backup: $gcs_path"
    
    # Check if the backup contains metadata.json file
    if gsutil -q stat "${gcs_path}/metadata.json"; then
        log "Backup validation: Found metadata.json"
        
        # Download and check the metadata file
        local temp_file=$(mktemp)
        gsutil cp "${gcs_path}/metadata.json" "$temp_file"
        
        # Check if metadata file is valid JSON
        if jq . "$temp_file" > /dev/null 2>&1; then
            log "Backup validation: Valid metadata.json format"
            
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
            
            # Display backup information
            log "Backup details:"
            log "  Project: $(jq -r '.project // "N/A"' "$temp_file")"
            log "  Date: $(jq -r '.date // "N/A"' "$temp_file")"
            log "  Timestamp: $(jq -r '.timestamp // "N/A"' "$temp_file")"
            log "  Collections: $(jq -r '.collections // "all"' "$temp_file")"
            
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

# ==============================================================================
# Restore Functions
# ==============================================================================

create_restore_plan() {
    local backup_date="$1"
    local gcs_path="gs://${GCS_BUCKET}/firestore/${backup_date}"
    local target_project="$2"
    
    log "Creating restore plan:"
    log "  Source Backup: $gcs_path"
    log "  Target Project: $target_project"
    log "  Test Mode: $TEST_MODE"
    
    # Get backup metadata
    local temp_file=$(mktemp)
    if gsutil cp "${gcs_path}/metadata.json" "$temp_file" > /dev/null 2>&1; then
        local collections=$(jq -r '.collections' "$temp_file")
        log "  Collections to restore: $collections"
        rm -f "$temp_file"
    else
        log "  Collections to restore: All (metadata not found or accessible)"
    fi
    
    # Check if target database exists and has data
    local has_data=false
    if gcloud firestore databases list --project="$target_project" | grep -q 'name:'; then
        log "  Target database exists in project: $target_project"
        
        # Check if there's data in the target database by listing collections
        if [[ $(gcloud firestore operations list --project="$target_project" 2>/dev/null | wc -l) -gt 0 ]]; then
            has_data=true
            log "  WARNING: Target database appears to have existing data"
        else
            log "  Target database appears to be empty"
        fi
    else
        log "  Target database does not exist or is not accessible"
    fi
    
    # Confirmation for production restore
    if [[ "$TEST_MODE" == "false" && "$has_data" == "true" ]]; then
        echo ""
        echo "⚠️  WARNING: You are about to restore data to a production Firestore database ⚠️"
        echo "    Target Project: $target_project"
        echo "    Source Backup: $gcs_path (from $backup_date)"
        echo ""
        echo "This will OVERWRITE existing data. Are you sure you want to proceed? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log "Restoration cancelled by user"
            return 1
        fi
    fi
    
    return 0
}

perform_restore() {
    local backup_date="$1"
    local gcs_path="gs://${GCS_BUCKET}/firestore/${backup_date}"
    local target_project="$2"
    
    log "Performing restore from $gcs_path to project $target_project"
    
    # Check if there are import operations in progress
    if gcloud firestore operations list --project="$target_project" --filter="done=false" 2>/dev/null | grep -q 'name:'; then
        log_error "There are Firestore operations in progress. Please wait for them to complete before starting a restore."
        return 1
    fi
    
    # Perform the import
    log "Running Firestore import from $gcs_path to project $target_project"
    if ! gcloud firestore import "$gcs_path" --project="$target_project"; then
        log_error "Firestore import command failed"
        return 1
    fi
    
    log "Firestore import initiated successfully"
    
    # Wait for the import operation to complete
    log "Waiting for import operation to complete (this may take a while)..."
    
    local max_wait_time=1800  # 30 minutes
    local wait_time=0
    local sleep_interval=30
    
    while [[ "$wait_time" -lt "$max_wait_time" ]]; do
        if ! gcloud firestore operations list --project="$target_project" --filter="done=false" 2>/dev/null | grep -q 'name:'; then
            log "Import operation completed successfully"
            return 0
        fi
        
        log "Import operation still in progress. Waiting $sleep_interval seconds..."
        sleep $sleep_interval
        wait_time=$((wait_time + sleep_interval))
    done
    
    log_error "Import operation timed out after $max_wait_time seconds"
    return 1
}

validate_restore() {
    local target_project="$1"
    
    log "Validating restore to project $target_project"
    
    # Check if there are any collections in the database
    local collections=$(gcloud firestore indexes list --project="$target_project" 2>/dev/null)
    if [[ -z "$collections" ]]; then
        log_error "Validation failed: No collections found in the restored database"
        return 1
    fi
    
    log "Restore validation passed: Database contains collections"
    return 0
}

# ==============================================================================
# Main Execution
# ==============================================================================

main() {
    local restore_status=0
    
    log "=== Starting Firestore restore process ==="
    log "Restore date: $RESTORE_DATE"
    log "Source project: $PROJECT_ID"
    log "Target project: $TARGET_PROJECT_ID"
    
    if [[ "$TEST_MODE" == "true" ]]; then
        log "Running in TEST MODE"
    else
        log "Running in PRODUCTION MODE"
    fi
    
    # Check if backup exists
    if ! check_backup_existence "$RESTORE_DATE"; then
        log_error "Cannot proceed with restore: Backup not found"
        send_notification "Restore Failed" "Backup not found for date: $RESTORE_DATE" "failure"
        exit 1
    fi
    
    # Validate backup
    if ! validate_backup "$RESTORE_DATE"; then
        log_error "Cannot proceed with restore: Backup validation failed"
        send_notification "Restore Failed" "Backup validation failed for date: $RESTORE_DATE" "failure"
        exit 1
    fi
    
    # Create restore plan
    if ! create_restore_plan "$RESTORE_DATE" "$TARGET_PROJECT_ID"; then
        log_error "Restore cancelled"
        send_notification "Restore Cancelled" "Restore was cancelled during planning phase" "failure"
        exit 1
    fi
    
    # Perform the restore
    if ! perform_restore "$RESTORE_DATE" "$TARGET_PROJECT_ID"; then
        log_error "Restore failed during execution"
        send_notification "Restore Failed" "Firestore restore to project $TARGET_PROJECT_ID failed during execution" "failure"
        exit 1
    fi
    
    # Validate the restore
    if ! validate_restore "$TARGET_PROJECT_ID"; then
        log_error "Restore validation failed"
        send_notification "Restore Validation Failed" "Firestore restore completed but validation failed" "failure"
        exit 1
    fi
    
    # Success notification
    log "=== Firestore restore process completed successfully ==="
    send_notification "Restore Completed" "Firestore restore to project $TARGET_PROJECT_ID completed successfully" "success"
    
    return 0
}

# Execute the main function
main "$@"
