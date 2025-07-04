#!/bin/bash
#
# MongoDB Restore Script for EyewearML Platform
# This script restores MongoDB databases from backups, supports both full and incremental backups,
# implements validation checks, and provides options for test restores.
#
# Usage: ./mongodb_restore.sh [--config /path/to/config.conf] [--date YYYY-MM-DD] [--hour HH] [--type daily|weekly|monthly|hourly] [--target-db dbname] [--test-mode]
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
TARGET_DB="${DB_NAME}"
IS_ATLAS=false
ENCRYPTION_KEY_FILE="/etc/eyewearml/backup_encryption.key"
NOTIFY_EMAIL=""
NOTIFY_WEBHOOK=""
LOG_FILE="/var/log/eyewearml/mongodb_restore.log"
TEST_MODE=false
RESTORE_DATE=$(date '+%Y-%m-%d')
RESTORE_HOUR=""
RESTORE_TYPE="daily"  # daily, weekly, monthly, hourly

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
        --hour)
            RESTORE_HOUR="$2"
            shift 2
            ;;
        --type)
            RESTORE_TYPE="$2"
            shift 2
            ;;
        --target-db)
            TARGET_DB="$2"
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

# Validate restore type
if [[ ! "$RESTORE_TYPE" =~ ^(daily|weekly|monthly|hourly)$ ]]; then
    echo "Error: Invalid restore type. Must be one of: daily, weekly, monthly, hourly"
    exit 1
fi

# Validate date format
if ! date -d "$RESTORE_DATE" >/dev/null 2>&1; then
    echo "Error: Invalid date format. Please use YYYY-MM-DD format."
    exit 1
fi

# Set target URI for test mode
if [[ "$TEST_MODE" == "true" ]]; then
    TARGET_DB="${DB_NAME}_test"
    
    if [[ "$IS_ATLAS" == "true" ]]; then
        # For Atlas, we'll use the same cluster but a different database name
        TARGET_URI=$(echo "$DB_URI" | sed "s/${DB_NAME}/${TARGET_DB}/")
    else
        # For local MongoDB, we'll use the same server but a different database name
        TARGET_URI="mongodb://localhost:27017/${TARGET_DB}"
    fi
else
    # For production restore, we use the original URI
    TARGET_URI="$DB_URI"
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
            echo "$message" | mail -s "EyewearML MongoDB Restore: $subject ($status)" "$NOTIFY_EMAIL"
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
                -d "{\"text\":\"EyewearML MongoDB Restore: $subject\", \"attachments\":[{\"text\":\"$message\", \"color\":\"$color\"}]}" \
                || log_error "Failed to send webhook notification"
        else
            log_error "curl command not found, cannot send webhook notification"
        fi
    fi
}

# ==============================================================================
# Decryption
# ==============================================================================

decrypt_backup() {
    local encrypted_file="$1"
    local decrypted_file="${encrypted_file%.enc}"
    
    if [[ ! -f "$ENCRYPTION_KEY_FILE" ]]; then
        log_error "Encryption key file not found: $ENCRYPTION_KEY_FILE"
        return 1
    fi
    
    log "Decrypting backup: $encrypted_file"
    
    if command -v openssl &> /dev/null; then
        openssl enc -aes-256-cbc -d -in "$encrypted_file" -out "$decrypted_file" -pass file:"$ENCRYPTION_KEY_FILE" || return 1
        log "Decryption completed: $decrypted_file"
        echo "$decrypted_file"
        return 0
    else
        log_error "openssl command not found, cannot decrypt backup"
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

download_from_gcs() {
    local gcs_path="$1"
    local local_path="$2"
    
    if [[ -z "$GCS_BUCKET" ]]; then
        log_error "GCS bucket not configured, cannot download backup"
        return 1
    fi
    
    log "Downloading from GCS: gs://${GCS_BUCKET}/${gcs_path} -> $local_path"
    
    # Create the local directory if it doesn't exist
    mkdir -p "$(dirname "$local_path")"
    
    if command -v gsutil &> /dev/null; then
        gsutil cp "gs://${GCS_BUCKET}/${gcs_path}" "$local_path" || return 1
        log "Download completed: $local_path"
        return 0
    else
        log_error "gsutil command not found, cannot download from GCS"
        return 1
    fi
}

# ==============================================================================
# Restore Functions
# ==============================================================================

get_backup_path() {
    local backup_type="$1"  # daily, weekly, monthly, hourly
    local backup_date="$2"  # YYYY-MM-DD format
    local backup_hour="$3"  # HH format (optional, for hourly backups)
    
    if [[ "$backup_type" == "hourly" && -n "$backup_hour" ]]; then
        echo "${BACKUP_DIR}/${backup_type}/${DB_NAME}_${backup_date}_${backup_hour}.gz"
    else
        echo "${BACKUP_DIR}/${backup_type}/${DB_NAME}_${backup_date}.tar.gz"
    fi
}

get_gcs_path() {
    local backup_type="$1"  # daily, weekly, monthly, hourly
    local backup_date="$2"  # YYYY-MM-DD format
    local backup_hour="$3"  # HH format (optional, for hourly backups)
    
    if [[ "$backup_type" == "hourly" && -n "$backup_hour" ]]; then
        echo "${backup_type}/${DB_NAME}_${backup_date}_${backup_hour}.gz$(if [[ -f "$ENCRYPTION_KEY_FILE" ]]; then echo ".enc"; fi)"
    else
        echo "${backup_type}/${DB_NAME}_${backup_date}.tar.gz$(if [[ -f "$ENCRYPTION_KEY_FILE" ]]; then echo ".enc"; fi)"
    fi
}

restore_from_full_backup() {
    local backup_file="$1"
    local target_uri="$2"
    local target_db="$3"
    local is_encrypted=false
    local restoration_status=0
    
    if [[ "$backup_file" == *.enc ]]; then
        is_encrypted=true
    fi
    
    log "Starting restoration from full backup: $backup_file to $target_db"
    
    # Check backup integrity
    check_backup_integrity "$backup_file" || return 1
    
    # Create a temporary directory for extraction
    local temp_dir=$(mktemp -d)
    
    # Prepare backup file for restoration
    local extract_file="$backup_file"
    if [[ "$is_encrypted" == "true" ]]; then
        extract_file=$(decrypt_backup "$backup_file")
        if [[ $? -ne 0 ]]; then
            log_error "Failed to decrypt backup: $backup_file"
            rm -rf "$temp_dir"
            return 1
        fi
    fi
    
    # Extract the backup
    tar -xzf "$extract_file" -C "$temp_dir" || { log_error "Failed to extract backup"; rm -rf "$temp_dir"; return 1; }
    
    # Clean up decrypted file if needed
    if [[ "$is_encrypted" == "true" && "$extract_file" != "$backup_file" ]]; then
        rm -f "$extract_file"
    fi
    
    # Create restore plan
    if [[ -d "$temp_dir/$DB_NAME" ]]; then
        local collection_count=$(find "$temp_dir/$DB_NAME" -name "*.bson" | wc -l)
        log "Restore plan: Restoring $collection_count collections from $backup_file to $target_db"
    else
        log_error "Backup structure is invalid, cannot find database directory in extracted backup"
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Request confirmation if not in test mode
    if [[ "$TEST_MODE" == "false" ]]; then
        echo "WARNING: You are about to restore data to the production database: $target_db"
        echo "This will OVERWRITE existing data. Are you sure you want to proceed? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log "Restoration cancelled by user"
            rm -rf "$temp_dir"
            return 1
        fi
    fi
    
    # Perform the restore
    log "Running mongorestore to $target_uri"
    
    if [[ "$IS_ATLAS" == "true" ]]; then
        mongorestore --uri="$target_uri" --nsFrom="$DB_NAME.*" --nsTo="$target_db.*" --drop "$temp_dir" || restoration_status=1
    else
        mongorestore --uri="$target_uri" --nsFrom="$DB_NAME.*" --nsTo="$target_db.*" --drop "$temp_dir" || restoration_status=1
    fi
    
    # Clean up
    rm -rf "$temp_dir"
    
    if [[ "$restoration_status" -eq 0 ]]; then
        log "Restoration completed successfully to $target_db"
        return 0
    else
        log_error "Restoration failed"
        return 1
    fi
}

restore_from_hourly_backup() {
    local backup_file="$1"
    local target_uri="$2"
    local target_db="$3"
    local is_encrypted=false
    local restoration_status=0
    
    if [[ "$backup_file" == *.enc ]]; then
        is_encrypted=true
    fi
    
    log "Starting restoration from hourly backup: $backup_file to $target_db"
    
    # Check backup integrity
    check_backup_integrity "$backup_file" || return 1
    
    # Prepare backup file for restoration
    local restore_file="$backup_file"
    if [[ "$is_encrypted" == "true" ]]; then
        restore_file=$(decrypt_backup "$backup_file")
        if [[ $? -ne 0 ]]; then
            log_error "Failed to decrypt backup: $backup_file"
            return 1
        fi
    fi
    
    # Request confirmation if not in test mode
    if [[ "$TEST_MODE" == "false" ]]; then
        echo "WARNING: You are about to restore data to the production database: $target_db"
        echo "This will OVERWRITE existing data. Are you sure you want to proceed? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log "Restoration cancelled by user"
            if [[ "$is_encrypted" == "true" && "$restore_file" != "$backup_file" ]]; then
                rm -f "$restore_file"
            fi
            return 1
        fi
    fi
    
    # Perform the restore
    log "Running mongorestore to $target_uri"
    
    if [[ "$IS_ATLAS" == "true" ]]; then
        mongorestore --uri="$target_uri" --nsFrom="$DB_NAME.*" --nsTo="$target_db.*" --drop --gzip --archive="$restore_file" || restoration_status=1
    else
        mongorestore --uri="$target_uri" --nsFrom="$DB_NAME.*" --nsTo="$target_db.*" --drop --gzip --archive="$restore_file" || restoration_status=1
    fi
    
    # Clean up decrypted file if needed
    if [[ "$is_encrypted" == "true" && "$restore_file" != "$backup_file" ]]; then
        rm -f "$restore_file"
    fi
    
    if [[ "$restoration_status" -eq 0 ]]; then
        log "Restoration completed successfully to $target_db"
        return 0
    else
        log_error "Restoration failed"
        return 1
    fi
}

validate_restored_database() {
    local target_uri="$1"
    local target_db="$2"
    
    log "Validating restored database: $target_db"
    
    # Connect to MongoDB and run validation
    if command -v mongosh &> /dev/null; then
        log "Running collection validation"
        
        # Run validation script
        mongosh "$target_uri" --eval "
            db.getCollectionNames().forEach(function(collName) {
                print('Validating collection: ' + collName);
                var result = db.runCommand({validate: collName, full: true});
                if (result.valid) {
                    print('  - Valid: true');
                    print('  - Objects: ' + result.nrecords);
                } else {
                    print('  - Valid: false');
                    print('  - Error: ' + result.errors);
                }
            });
        " || return 1
        
        # Run a basic count query on main collections to ensure data is present
        mongosh "$target_uri" --eval "
            print('Checking collection counts:');
            var collections = ['products', 'frames', 'brands', 'categories', 'sessions'];
            collections.forEach(function(collName) {
                if (db.getCollectionNames().includes(collName)) {
                    var count = db[collName].countDocuments({});
                    print('  - ' + collName + ': ' + count + ' documents');
                    if (count === 0) {
                        print('    WARNING: Collection is empty');
                    }
                } else {
                    print('  - ' + collName + ': Not found in database');
                }
            });
        " || return 1
        
        log "Database validation completed"
        return 0
    else
        log_error "mongosh command not found, cannot validate restored database"
        return 1
    fi
}

# ==============================================================================
# Main Execution
# ==============================================================================

main() {
    local restore_status=0
    local backup_file=""
    local gcs_path=""
    
    log "=== Starting MongoDB restore process ==="
    log "Restore type: $RESTORE_TYPE"
    log "Restore date: $RESTORE_DATE"
    
    if [[ "$RESTORE_TYPE" == "hourly" ]]; then
        if [[ -z "$RESTORE_HOUR" ]]; then
            log_error "Hour parameter is required for hourly restore"
            exit 1
        fi
        log "Restore hour: $RESTORE_HOUR"
    fi
    
    if [[ "$TEST_MODE" == "true" ]]; then
        log "Running in TEST MODE - Target DB: $TARGET_DB"
    else
        log "Running in PRODUCTION MODE - Target DB: $TARGET_DB"
    fi
    
    # Determine backup file path
    backup_file=$(get_backup_path "$RESTORE_TYPE" "$RESTORE_DATE" "$RESTORE_HOUR")
    log "Backup file path: $backup_file"
    
    # Check if backup exists locally
    if [[ ! -f "$backup_file" && ! -f "${backup_file}.enc" ]]; then
        # If not found locally, try to download from GCS
        if [[ -n "$GCS_BUCKET" ]]; then
            gcs_path=$(get_gcs_path "$RESTORE_TYPE" "$RESTORE_DATE" "$RESTORE_HOUR")
            log "Backup not found locally, attempting to download from GCS: $gcs_path"
            
            # Check if we need to use the encrypted path
            if [[ -f "$ENCRYPTION_KEY_FILE" ]]; then
                download_from_gcs "$gcs_path" "${backup_file}.enc" || restore_status=1
                if [[ "$restore_status" -eq 0 ]]; then
                    backup_file="${backup_file}.enc"
                fi
            else
                download_from_gcs "$gcs_path" "$backup_file" || restore_status=1
            fi
            
            if [[ "$restore_status" -ne 0 ]]; then
                log_error "Failed to download backup from GCS"
                send_notification "Restore Failed" "Failed to download backup from GCS: $gcs_path" "failure"
                exit 1
            fi
        else
            log_error "Backup file not found: $backup_file"
            if [[ -f "$ENCRYPTION_KEY_FILE" ]]; then
                log_error "Encrypted backup file not found: ${backup_file}.enc"
            fi
            send_notification "Restore Failed" "Backup file not found: $backup_file" "failure"
            exit 1
        fi
    elif [[ ! -f "$backup_file" && -f "${backup_file}.enc" ]]; then
        backup_file="${backup_file}.enc"
    fi
    
    # Create a restore plan
    log "Restore Plan:"
    log "  Backup Type: $RESTORE_TYPE"
    log "  Backup Date: $RESTORE_DATE"
    if [[ "$RESTORE_TYPE" == "hourly" ]]; then
        log "  Backup Hour: $RESTORE_HOUR"
    fi
    log "  Source Backup: $backup_file"
    log "  Target Database: $TARGET_DB"
    log "  Target URI: $TARGET_URI"
    log "  Test Mode: $TEST_MODE"
    
    # Perform the restore
    if [[ "$RESTORE_TYPE" == "hourly" ]]; then
        restore_from_hourly_backup "$backup_file" "$TARGET_URI" "$TARGET_DB" || restore_status=1
    else
        restore_from_full_backup "$backup_file" "$TARGET_URI" "$TARGET_DB" || restore_status=1
    fi
    
    # Validate the restored database
    if [[ "$restore_status" -eq 0 ]]; then
        validate_restored_database "$TARGET_URI" "$TARGET_DB" || restore_status=1
    fi
    
    # Send notifications
    if [[ "$restore_status" -eq 0 ]]; then
        log "=== MongoDB restore process completed successfully ==="
        send_notification "Restore Completed" "MongoDB restore to $TARGET_DB completed successfully." "success"
    else
        log_error "=== MongoDB restore process completed with errors ==="
        send_notification "Restore Failed" "MongoDB restore to $TARGET_DB completed with errors. Check the logs for details." "failure"
    fi
    
    return $restore_status
}

# Execute the main function
main "$@"
