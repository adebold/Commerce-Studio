#!/bin/bash

# Database Migration Runner for VARAi Webstore Enhanced Ecommerce Schema
# SPARC Implementation - Database Agent Deliverable

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-varai_webstore}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

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

# Check if PostgreSQL is available
check_postgres() {
    log_info "Checking PostgreSQL connection..."
    
    if command -v psql >/dev/null 2>&1; then
        log_success "PostgreSQL client found"
    else
        log_error "PostgreSQL client (psql) not found. Please install PostgreSQL."
        exit 1
    fi
    
    # Test connection
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c '\q' >/dev/null 2>&1; then
        log_success "PostgreSQL connection successful"
    else
        log_error "Cannot connect to PostgreSQL. Please check your connection settings."
        log_info "Host: $DB_HOST, Port: $DB_PORT, User: $DB_USER"
        exit 1
    fi
}

# Create database if it doesn't exist
create_database() {
    log_info "Creating database '$DB_NAME' if it doesn't exist..."
    
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "
        SELECT 'CREATE DATABASE $DB_NAME' 
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
    " >/dev/null 2>&1
    
    log_success "Database '$DB_NAME' is ready"
}

# Run the migration
run_migration() {
    local migration_file="$1"
    
    if [ ! -f "$migration_file" ]; then
        log_error "Migration file not found: $migration_file"
        exit 1
    fi
    
    log_info "Running migration: $(basename "$migration_file")"
    
    # Execute the migration
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file"; then
        log_success "Migration completed successfully"
    else
        log_error "Migration failed"
        exit 1
    fi
}

# Verify migration
verify_migration() {
    log_info "Verifying migration..."
    
    # Check if tables were created
    local tables=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('retailers', 'stores', 'store_inventory', 'reservations', 'cart_sessions', 'store_pricing', 'vto_sessions', 'store_analytics')
        ORDER BY table_name;
    " | tr -d ' ' | grep -v '^$')
    
    local expected_tables="cart_sessions
reservations
retailers
store_analytics
store_inventory
store_pricing
stores
vto_sessions"
    
    if [ "$tables" = "$expected_tables" ]; then
        log_success "All expected tables created successfully"
    else
        log_warning "Some tables may be missing. Created tables:"
        echo "$tables"
    fi
    
    # Check if sample data was inserted
    local retailer_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM retailers;" | tr -d ' ')
    local store_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM stores;" | tr -d ' ')
    
    log_info "Sample data verification:"
    log_info "  - Retailers: $retailer_count"
    log_info "  - Stores: $store_count"
    
    if [ "$retailer_count" -gt 0 ] && [ "$store_count" -gt 0 ]; then
        log_success "Sample data inserted successfully"
    else
        log_warning "Sample data may not have been inserted properly"
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -f, --file FILE         Migration file to run (default: 001_enhanced_ecommerce_schema.sql)"
    echo "  --host HOST             Database host (default: localhost)"
    echo "  --port PORT             Database port (default: 5432)"
    echo "  --database DATABASE     Database name (default: varai_webstore)"
    echo "  --user USER             Database user (default: postgres)"
    echo "  --password PASSWORD     Database password"
    echo "  --dry-run               Show what would be executed without running"
    echo ""
    echo "Environment variables:"
    echo "  DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD"
    echo ""
    echo "Examples:"
    echo "  $0                                          # Run with defaults"
    echo "  $0 --host localhost --user myuser           # Custom host and user"
    echo "  DB_PASSWORD=secret $0                       # Using environment variable"
}

# Main execution
main() {
    local migration_file="$(dirname "$0")/migrations/001_enhanced_ecommerce_schema.sql"
    local dry_run=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -f|--file)
                migration_file="$2"
                shift 2
                ;;
            --host)
                DB_HOST="$2"
                shift 2
                ;;
            --port)
                DB_PORT="$2"
                shift 2
                ;;
            --database)
                DB_NAME="$2"
                shift 2
                ;;
            --user)
                DB_USER="$2"
                shift 2
                ;;
            --password)
                DB_PASSWORD="$2"
                shift 2
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Show configuration
    log_info "Database Migration Configuration:"
    log_info "  Host: $DB_HOST"
    log_info "  Port: $DB_PORT"
    log_info "  Database: $DB_NAME"
    log_info "  User: $DB_USER"
    log_info "  Migration file: $migration_file"
    
    if [ "$dry_run" = true ]; then
        log_info "DRY RUN MODE - No changes will be made"
        log_info "Would execute migration: $migration_file"
        exit 0
    fi
    
    # Execute migration steps
    check_postgres
    create_database
    run_migration "$migration_file"
    verify_migration
    
    log_success "Database migration completed successfully!"
    log_info "Your VARAi Webstore enhanced ecommerce database is ready for BOPIS, Store Locator, and VTO integration."
}

# Run main function with all arguments
main "$@"