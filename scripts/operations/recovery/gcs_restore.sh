#!/bin/bash
#
# Google Cloud Storage Restore Script for EyewearML Platform
# This script restores data from backup buckets to target buckets,
# with options for point-in-time restores using versioning.
#
# Usage: ./gcs_restore.sh [--config /path/to/config.conf] [--source-bucket name] [--target-bucket name] [--version-date YYYY-MM-DD]
#

set -e

# ==============================================================================
# Configuration
# ==============================================================================

# Default configuration values
PROJECT_ID=""                 # Google Cloud Project ID
BACKUP_BUCKET=""              # Source backup bucket
SOURCE_BUCKET=""              # Original source bucket name (to restore from backup)
TARGET_BUCKET=""              # Target bucket to restore to
VERSION_DATE=""               # Date for point-in-time restore (optional)
CRITICAL_FILES=""             # Comma-separated list of critical files to verify with hash checks
NOTIFY_EMAIL=""               # Email for notifications
NOTIFY_WEBHOOK=""             # Webhook URL for notifications
LOG_FILE="/var/log/eyewearml/gcs_restore.log"
TEST_MODE=false               # Test mode flag

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        --config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        --source-bucket)
            SOURCE_BUCKET="$2"
            shift 2
            ;;
        --target-bucket)
            TARGET_BUCKET="$2"
            shift 2
            ;;
        --version-date)
            VERSION_DATE="$2"
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
if [[ -n "$GCS_PROJECT_ID" ]]; then
    PROJECT_ID="$GCS_PROJECT_ID"
fi

if [[ -n "$GCS_BACKUP_BUCKET" ]]; then
    BACKUP_BUCKET="$GCS_BACKUP_BUCKET"
fi

if [[ -n "$GCS_CRITICAL_FILES" ]]; then
    CRITICAL_FILES="$GCS_CRITICAL_FILES"
fi

# Validate required configuration
if [[ -z "$PROJECT_ID" ]]; then
    echo "Error: Google Cloud Project ID is required. Set GCS_PROJECT_ID environment variable or use --config option."
    exit 1
fi

if [[ -z "$BACKUP_BUCKET" ]]; then
    echo "Error: Backup bucket is required. Set GCS_BACKUP_BUCKET environment variable or use --config option."
    exit 1
fi

if [[ -z "$SOURCE_BUCKET" ]]; then
    echo "Error: Source bucket is required. Use --source-bucket option."
    exit 1
fi

# If target bucket is not specified, use source bucket (with -test suffix in test mode)
if [[ -z "$TARGET_BUCKET" ]]; then
    if [[ "$TEST_MODE" == "true" ]]; then
        TARGET_BUCKET="${SOURCE_BUCKET}-test"
    else
        TARGET_BUCKET="$SOURCE_BUCKET"
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
            echo "$message" | mail -s "EyewearML GCS Restore: $subject ($status)" "$NOTIFY_EMAIL"
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
                -d "{\"text\":\"EyewearML GCS Restore: $subject\", \"attachments\":[{\"text\":\"$message\", \"color\":\"$color\"}]}" \
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
    local source_bucket="$1"
    local backup_bucket="$2"
    local backup_path="${source_bucket}"
    
    log "Checking if backup exists: gs://${backup_bucket}/${backup_path}/"
    
    if gsutil -q ls "gs://${backup_bucket}/${backup_path}/" > /dev/null 2>&1; then
        log "Backup found: gs://${backup_bucket}/${backup_path}/"
        return 0
    else
        log_error "Backup not found: gs://${backup_bucket}/${backup_path}/"
        return 1
    fi
}

validate_backup() {
    local source_bucket="$1"
    local backup_bucket="$2"
    local backup_path="${source_bucket}"
    
    log "Validating backup: gs://${backup_bucket}/${backup_path}/"
    
    # Check for metadata file
    local metadata_path="gs://${backup_bucket}/${backup_path}/backup_metadata.json"
    if gsutil -q stat "$metadata_path" > /dev/null 2>&1; then
        log "Backup validation: Found metadata file"
        
        # Download and check the metadata file
        local temp_file=$(mktemp)
        gsutil cp "$metadata_path" "$temp_file"
        
        # Check if metadata file is valid JSON
        if jq . "$temp_file" > /dev/null 2>&1; then
            log "Backup validation: Valid metadata.json format"
            
            # Display backup information
            log "Backup details:"
            log "  Source bucket: $(jq -r '.source_bucket // "N/A"' "$temp_file")"
            log "  Backup path: $(jq -r '.backup_bucket // "N/A"' "$temp_file")"
            log "  Date: $(jq -r '.date // "N/A"' "$temp_file")"
            log "  Timestamp: $(jq -r '.timestamp // "N/A"' "$temp_file")"
            
            rm -f "$temp_file"
            return 0
        else
            log_error "Backup validation failed: Invalid metadata.json format"
            rm -f "$temp_file"
            return 1
        fi
    else
        log "Backup validation: Metadata file not found, but proceeding with validation"
        
        # Check if there are any files in the backup path
        if gsutil -q ls "gs://${backup_bucket}/${backup_path}/**" > /dev/null 2>&1; then
            log "Backup validation: Backup contains files"
            return 0
        else
            log_error "Backup validation failed: No files found in backup path"
            return 1
        fi
    fi
}

check_target_bucket() {
    local target_bucket="$1"
    
    log "Checking target bucket: gs://${target_bucket}/"
    
    # Check if target bucket exists
    if gsutil -q ls "gs://${target_bucket}" > /dev/null 2>&1; then
        log "Target bucket exists: gs://${target_bucket}/"
        
        # Check if target bucket has content
        if gsutil -q ls "gs://${target_bucket}/**" > /dev/null 2>&1; then
            log "Target bucket is not empty: gs://${target_bucket}/"
            return 1
        else
            log "Target bucket is empty: gs://${target_bucket}/"
            return 0
        fi
    else
        log "Target bucket does not exist: gs://${target_bucket}/"
        log "Attempting to create target bucket..."
        
        if gsutil mb -p "$PROJECT_ID" "gs://${target_bucket}"; then
            log "Created target bucket: gs://${target_bucket}/"
            return 0
        else
            log_error "Failed to create target bucket: gs://${target_bucket}/"
            return 1
        fi
    fi
}

# ==============================================================================
# Restore Functions
# ==============================================================================

create_restore_plan() {
    local source_bucket="$1"
    local backup_bucket="$2"
    local target_bucket="$3"
    local version_date="$4"
    local backup_path="${source_bucket}"
    
    log "Creating restore plan:"
    log "  Source backup: gs://${backup_bucket}/${backup_path}/"
    log "  Target bucket: gs://${target_bucket}/"
    
    if [[ -n "$version_date" ]]; then
        log "  Version date: $version_date (point-in-time restore)"
    else
        log "  Version date: Latest (current version)"
    fi
    
    log "  Test mode: $TEST_MODE"
    
    # Check if target bucket has content in production mode
    if [[ "$TEST_MODE" == "false" ]]; then
        if gsutil -q ls "gs://${target_bucket}/**" > /dev/null 2>&1; then
            log "WARNING: Target bucket is not empty: gs://${target_bucket}/"
            
            echo ""
            echo "⚠️  WARNING: You are about to restore data to a non-empty bucket ⚠️"
            echo "    Target Bucket: $target_bucket"
            echo "    Source Backup: gs://${backup_bucket}/${backup_path}/"
            echo ""
            echo "This will OVERWRITE existing data. Are you sure you want to proceed? (y/N)"
            read -r response
            if [[ ! "$response" =~ ^[Yy]$ ]]; then
                log "Restoration cancelled by user"
                return 1
            fi
        fi
    fi
    
    return 0
}

restore_bucket() {
    local source_bucket="$1"
    local backup_bucket="$2"
    local target_bucket="$3"
    local version_date="$4"
    local backup_path="${source_bucket}"
    
    log "Restoring from gs://${backup_bucket}/${backup_path}/ to gs://${target_bucket}/"
    
    # Perform restore with versioning if specified
    if [[ -n "$version_date" ]]; then
        log "Performing point-in-time restore for date: $version_date"
        
        # For point-in-time restore, we need to use a different approach
        # First, list all objects with versions
        local temp_file=$(mktemp)
        gsutil ls -la "gs://${backup_bucket}/${backup_path}/**" > "$temp_file"
        
        # Process each object
        while read -r line; do
            # Extract object generation and name
            if [[ "$line" =~ ([0-9]+)[[:space:]]+([0-9-]+)[[:space:]]+([0-9:]+)[[:space:]]+(gs://[^[:space:]]+) ]]; then
                local gen="${BASH_REMATCH[1]}"
                local date="${BASH_REMATCH[2]}"
                local object="${BASH_REMATCH[4]}"
                local object_path="${object#gs://${backup_bucket}/${backup_path}/}"
                
                # Compare dates
                if [[ "$date" < "$version_date" || "$date" == "$version_date" ]]; then
                    log "Restoring object: $object_path (version from $date)"
                    gsutil cp "$object#$gen" "gs://${target_bucket}/${object_path}" || log_error "Failed to restore: $object_path"
                fi
            fi
        done < "$temp_file"
        
        rm -f "$temp_file"
    else
        log "Performing standard restore (latest version)"
        
        # For standard restore, use rsync
        if gsutil -m rsync -r "gs://${backup_bucket}/${backup_path}/" "gs://${target_bucket}/"; then
            log "Synchronization completed successfully"
            return 0
        else
            log_error "Synchronization failed"
            return 1
        fi
    fi
    
    return 0
}

verify_integrity() {
    local source_bucket="$1"
    local backup_bucket="$2"
    local target_bucket="$3"
    local critical_files="$4"
    local backup_path="${source_bucket}"
    local verify_status=0
    
    if [[ -z "$critical_files" ]]; then
        log "No critical files specified for integrity check, skipping verification"
        return 0
    fi
    
    log "Verifying integrity of critical files after restore"
    
    # Convert comma-separated list to array
    IFS=',' read -r -a files_array <<< "$critical_files"
    
    for file_path in "${files_array[@]}"; do
        log "Checking file: $file_path"
        
        # Calculate hash for backup file
        local backup_hash
        if ! backup_hash=$(gsutil hash -h "gs://${backup_bucket}/${backup_path}/${file_path}" 2>/dev/null | grep "Hash (md5):" | awk '{print $3}'); then
            log_error "Failed to calculate hash for backup file: gs://${backup_bucket}/${backup_path}/${file_path}"
            verify_status=1
            continue
        fi
        
        # Calculate hash for restored file
        local restored_hash
        if ! restored_hash=$(gsutil hash -h "gs://${target_bucket}/${file_path}" 2>/dev/null | grep "Hash (md5):" | awk '{print $3}'); then
            log_error "Failed to calculate hash for restored file: gs://${target_bucket}/${file_path}"
            verify_status=1
            continue
        fi
        
        # Compare hashes
        if [[ "$backup_hash" == "$restored_hash" ]]; then
            log "Integrity check passed for file: $file_path"
        else
            log_error "Integrity check failed for file: $file_path (hash mismatch)"
            log_error "Backup hash: $backup_hash"
            log_error "Restored hash: $restored_hash"
            verify_status=1
        fi
    done
    
    if [[ "$verify_status" -eq 0 ]]; then
        log "All integrity checks passed"
    else
        log_error "Some integrity checks failed"
    fi
    
    return $verify_status
}

# ==============================================================================
# Main Execution
# ==============================================================================

main() {
    local restore_status=0
    
    log "=== Starting Google Cloud Storage restore process ==="
    log "Project ID: $PROJECT_ID"
    log "Source bucket (original): $SOURCE_BUCKET"
    log "Backup bucket: $BACKUP_BUCKET"
    log "Target bucket: $TARGET_BUCKET"
    
    if [[ -n "$VERSION_DATE" ]]; then
        log "Version date: $VERSION_DATE (point-in-time restore)"
    fi
    
    if [[ "$TEST_MODE" == "true" ]]; then
        log "Running in TEST MODE"
    else
        log "Running in PRODUCTION MODE"
    fi
    
    # Check if backup exists
    if ! check_backup_existence "$SOURCE_BUCKET" "$BACKUP_BUCKET"; then
        log_error "Cannot proceed with restore: Backup not found"
        send_notification "Restore Failed" "Backup not found for bucket: $SOURCE_BUCKET" "failure"
        exit 1
    fi
    
    # Validate backup
    if ! validate_backup "$SOURCE_BUCKET" "$BACKUP_BUCKET"; then
        log_error "Cannot proceed with restore: Backup validation failed"
        send_notification "Restore Failed" "Backup validation failed for bucket: $SOURCE_BUCKET" "failure"
        exit 1
    fi
    
    # Check and prepare target bucket
    if ! check_target_bucket "$TARGET_BUCKET"; then
        if [[ "$TEST_MODE" == "true" ]]; then
            log "Proceeding with restore to non-empty target bucket in test mode"
        else
            log_error "Target bucket validation failed: gs://${TARGET_BUCKET}/"
            send_notification "Restore Failed" "Target bucket validation failed: gs://${TARGET_BUCKET}/" "failure"
            exit 1
        fi
    fi
    
    # Create restore plan
    if ! create_restore_plan "$SOURCE_BUCKET" "$BACKUP_BUCKET" "$TARGET_BUCKET" "$VERSION_DATE"; then
        log_error "Restore cancelled"
        send_notification "Restore Cancelled" "Restore was cancelled during planning phase" "failure"
        exit 1
    fi
    
    # Perform the restore
    if ! restore_bucket "$SOURCE_BUCKET" "$BACKUP_BUCKET" "$TARGET_BUCKET" "$VERSION_DATE"; then
        log_error "Restore failed during execution"
        send_notification "Restore Failed" "Restore failed during execution" "failure"
        exit 1
    fi
    
    # Verify integrity of critical files
    if ! verify_integrity "$SOURCE_BUCKET" "$BACKUP_BUCKET" "$TARGET_BUCKET" "$CRITICAL_FILES"; then
        log_error "Integrity check failed after restore"
        send_notification "Restore Integrity Failed" "Restore completed but integrity check failed" "failure"
        exit 1
    fi
    
    # Success notification
    log "=== Google Cloud Storage restore process completed successfully ==="
    send_notification "Restore Completed" "Restore from gs://${BACKUP_BUCKET}/${SOURCE_BUCKET}/ to gs://${TARGET_BUCKET}/ completed successfully" "success"
    
    return 0
}

# Execute the main function
main "$@"
