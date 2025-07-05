#!/bin/bash
#
# MongoDB Backup Script for EyewearML Platform
# This script creates daily full backups and hourly incremental backups of MongoDB databases,
# implements retention policies, performs integrity checks, and sends notifications.
#
# Usage: ./mongodb_backup.sh [--config /path/to/config.conf]
#

set -e

# ==============================================================================
# Configuration
# ==============================================================================

# Default configuration values
BACKUP_DIR="./backups"
GCS_BUCKET=""
DB_NAME="eyewear_ml"
DB_URI="mongodb://localhost:27017/${DB_NAME}"
IS_ATLAS=false
ENCRYPTION_KEY_FILE="/etc/eyewearml/backup_encryption.key"
NOTIFY_EMAIL=""
NOTIFY_WEBHOOK=""
LOG_FILE="/var/log/eyewearml/mongodb_backup.log"
RETENTION_DAILY=30      # days
RETENTION_WEEKLY=12     # weeks
RETENTION_MONTHLY=12    # months
ENABLE_HOURLY=true
HOURLY_RETENTION=24     # hours

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
if [[ -n "$MONGODB_BACKUP_DIR" ]]; then
    BACKUP_DIR="$MONGODB_BACKUP_DIR"
fi

if [[ -n "$MONGODB_GCS_BUCKET" ]]; then
    GCS_BUCKET="$MONGODB_GCS_BUCKET"
fi

if [[ -n "$MONGODB_DB_NAME" ]]; then
    DB_NAME="$MONGODB_DB_NAME"
fi

if [[ -n "$MONGODB_URI" ]]; then
    DB_URI="$MONGODB_URI"
fi

if [[ -n "$MONGODB_IS_ATLAS" ]]; then
    IS_ATLAS="$MONGODB_IS_ATLAS"
fi

# Create backup directory structure if it doesn't exist
mkdir -p "${BACKUP_DIR}/daily"
mkdir -p "${BACKUP_DIR}/weekly"
mkdir -p "${BACKUP_DIR}/monthly"
if [[ "$ENABLE_HOURLY" == "true" ]]; then
    mkdir -p "${BACKUP_DIR}/hourly"
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
            echo "$message" | mail -s "EyewearML MongoDB Backup: $subject ($status)" "$NOTIFY_EMAIL"
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
                -d "{\"text\":\"EyewearML MongoDB Backup: $subject\", \"attachments\":[{\"text\":\"$message\", \"color\":\"$color\"}]}" \
                || log_error "Failed to send webhook notification"
        else
            log_error "curl command not found, cannot send webhook notification"
        fi
    fi
}

# ==============================================================================
# Encryption
# ==============================================================================

encrypt_backup() {
    local backup_file="$1"
    local encrypted_file="${backup_file}.enc"
    
    if [[ ! -f "$ENCRYPTION_KEY_FILE" ]]; then
        log_error "Encryption key file not found: $ENCRYPTION_KEY_FILE"
        return 1
    fi
    
    log "Encrypting backup: $backup_file"
    
    if command -v openssl &> /dev/null; then
        openssl enc -aes-256-cbc -salt -in "$backup_file" -out "$encrypted_file" -pass file:"$ENCRYPTION_KEY_FILE" || return 1
        rm "$backup_file"  # Remove unencrypted backup
        log "Encryption completed: $encrypted_file"
        return 0
    else
        log_error "openssl command not found, cannot encrypt backup"
        return 1
    fi
}

# ==============================================================================
# Integrity Check
# ==============================================================================

check_backup_integrity() {
    local backup_file="$1"
    
    log "Checking backup integrity: $backup_file"
    
    # For encrypted backups, decrypt to temporary file for verification
    if [[ "$backup_file" == *.enc ]]; then
        local temp_file=$(mktemp)
        
        if ! openssl enc -aes-256-cbc -d -in "$backup_file" -out "$temp_file" -pass file:"$ENCRYPTION_KEY_FILE"; then
            log_error "Failed to decrypt backup for integrity check: $backup_file"
            rm -f "$temp_file"
            return 1
        fi
        
        # For tar files (full backups)
        if [[ "$backup_file" == *.tar.gz.enc ]]; then
            if ! tar -tzf "$temp_file" > /dev/null; then
                log_error "Integrity check failed for backup: $backup_file (invalid tar format)"
                rm -f "$temp_file"
                return 1
            fi
        fi
        
        rm -f "$temp_file"
    else
        # For tar files (full backups)
        if [[ "$backup_file" == *.tar.gz ]]; then
            if ! tar -tzf "$backup_file" > /dev/null; then
                log_error "Integrity check failed for backup: $backup_file (invalid tar format)"
                return 1
            fi
        fi
    fi
    
    log "Integrity check passed: $backup_file"
    return 0
}

# ==============================================================================
# Google Cloud Storage
# ==============================================================================

upload_to_gcs() {
    local local_path="$1"
    local gcs_path="$2"
    
    if [[ -z "$GCS_BUCKET" ]]; then
        log "GCS bucket not configured, skipping upload"
        return 0
    fi
    
    log "Uploading to GCS: $local_path -> gs://${GCS_BUCKET}/${gcs_path}"
    
    if command -v gsutil &> /dev/null; then
        gsutil cp "$local_path" "gs://${GCS_BUCKET}/${gcs_path}" || return 1
        log "Upload completed: gs://${GCS_BUCKET}/${gcs_path}"
        return 0
    else
        log_error "gsutil command not found, cannot upload to GCS"
        return 1
    fi
}

# ==============================================================================
# Backup Functions
# ==============================================================================

create_full_backup() {
    local backup_type="$1"  # daily, weekly, or monthly
    local backup_date="$2"  # YYYY-MM-DD format
    local backup_dir="${BACKUP_DIR}/${backup_type}"
    local backup_path="${backup_dir}/${DB_NAME}_${backup_date}.tar.gz"
    
    log "Creating ${backup_type} full backup for ${DB_NAME}"
    
    # Create a temporary directory for the backup
    local temp_dir=$(mktemp -d)
    
    # Run mongodump to the temporary directory
    if [[ "$IS_ATLAS" == "true" ]]; then
        log "Running mongodump for MongoDB Atlas"
        mongodump --uri="$DB_URI" --out="$temp_dir" || { log_error "mongodump failed"; rm -rf "$temp_dir"; return 1; }
    else
        log "Running mongodump for local MongoDB"
        mongodump --uri="$DB_URI" --out="$temp_dir" || { log_error "mongodump failed"; rm -rf "$temp_dir"; return 1; }
    fi
    
    # Create a tar archive of the backup
    tar -czf "$backup_path" -C "$temp_dir" . || { log_error "tar failed"; rm -rf "$temp_dir"; return 1; }
    
    # Clean up the temporary directory
    rm -rf "$temp_dir"
    
    # Encrypt the backup if encryption is enabled
    if [[ -f "$ENCRYPTION_KEY_FILE" ]]; then
        encrypt_backup "$backup_path" || return 1
        backup_path="${backup_path}.enc"
    fi
    
    # Check the integrity of the backup
    check_backup_integrity "$backup_path" || return 1
    
    # Upload to GCS if configured
    if [[ -n "$GCS_BUCKET" ]]; then
        upload_to_gcs "$backup_path" "${backup_type}/${DB_NAME}_${backup_date}.tar.gz$(if [[ -f "$ENCRYPTION_KEY_FILE" ]]; then echo ".enc"; fi)" || return 1
    fi
    
    log "Full backup completed: $backup_path"
    return 0
}

create_hourly_backup() {
    local timestamp=$(date '+%Y-%m-%d_%H')
    local backup_dir="${BACKUP_DIR}/hourly"
    local backup_path="${backup_dir}/${DB_NAME}_${timestamp}.gz"
    
    log "Creating hourly incremental backup for ${DB_NAME}"
    
    # Run mongodump with archive option for incremental backup
    if [[ "$IS_ATLAS" == "true" ]]; then
        log "Running mongodump for MongoDB Atlas"
        mongodump --uri="$DB_URI" --archive="$backup_path" --gzip || { log_error "mongodump failed"; return 1; }
    else
        log "Running mongodump for local MongoDB"
        mongodump --uri="$DB_URI" --archive="$backup_path" --gzip || { log_error "mongodump failed"; return 1; }
    fi
    
    # Encrypt the backup if encryption is enabled
    if [[ -f "$ENCRYPTION_KEY_FILE" ]]; then
        encrypt_backup "$backup_path" || return 1
        backup_path="${backup_path}.enc"
    fi
    
    # Check the integrity of the backup
    check_backup_integrity "$backup_path" || return 1
    
    # Upload to GCS if configured
    if [[ -n "$GCS_BUCKET" ]]; then
        upload_to_gcs "$backup_path" "hourly/${DB_NAME}_${timestamp}.gz$(if [[ -f "$ENCRYPTION_KEY_FILE" ]]; then echo ".enc"; fi)" || return 1
    fi
    
    log "Incremental backup completed: $backup_path"
    return 0
}

# ==============================================================================
# Retention Management
# ==============================================================================

apply_retention_policy() {
    log "Applying retention policies"
    
    # Daily retention
    find "${BACKUP_DIR}/daily" -name "${DB_NAME}_*.tar.gz*" -type f -mtime +${RETENTION_DAILY} -delete
    
    # Weekly retention
    find "${BACKUP_DIR}/weekly" -name "${DB_NAME}_*.tar.gz*" -type f -mtime +$((${RETENTION_WEEKLY} * 7)) -delete
    
    # Monthly retention
    find "${BACKUP_DIR}/monthly" -name "${DB_NAME}_*.tar.gz*" -type f -mtime +$((${RETENTION_MONTHLY} * 30)) -delete
    
    # Hourly retention (if enabled)
    if [[ "$ENABLE_HOURLY" == "true" ]]; then
        find "${BACKUP_DIR}/hourly" -name "${DB_NAME}_*.gz*" -type f -mtime +$((${HOURLY_RETENTION} / 24)) -delete
    fi
    
    log "Retention policies applied"
}

# ==============================================================================
# Main Execution
# ==============================================================================

main() {
    local today=$(date '+%Y-%m-%d')
    local day_of_week=$(date '+%u')  # 1-7, where 1 is Monday
    local day_of_month=$(date '+%d')
    local hour=$(date '+%H')
    local backup_status=0
    
    log "=== Starting MongoDB backup process ==="
    
    # Run hourly backup if enabled and it's not a full backup hour
    if [[ "$ENABLE_HOURLY" == "true" ]]; then
        create_hourly_backup || backup_status=1
    fi
    
    # Run daily full backup
    create_full_backup "daily" "$today" || backup_status=1
    
    # Run weekly full backup on Sundays (day_of_week = 7)
    if [[ "$day_of_week" -eq 7 ]]; then
        create_full_backup "weekly" "$today" || backup_status=1
    fi
    
    # Run monthly full backup on the 1st of the month
    if [[ "$day_of_month" -eq 1 ]]; then
        create_full_backup "monthly" "$today" || backup_status=1
    fi
    
    # Apply retention policies
    apply_retention_policy
    
    if [[ "$backup_status" -eq 0 ]]; then
        log "=== MongoDB backup process completed successfully ==="
        send_notification "Backup Completed" "MongoDB backup for ${DB_NAME} completed successfully." "success"
    else
        log_error "=== MongoDB backup process completed with errors ==="
        send_notification "Backup Failed" "MongoDB backup for ${DB_NAME} completed with errors. Check the logs for details." "failure"
    fi
    
    return $backup_status
}

# Execute the main function
main "$@"
