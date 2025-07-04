#!/bin/bash
# Demo data seeding for VARAi Commerce Studio development/staging environments
# This script creates comprehensive demo data for testing BOPIS and e-commerce functionality

set -e

echo "🚀 VARAi Commerce Studio - Demo Data Seeding"
echo "=============================================="

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:8000}"
DEMO_ENV="${DEMO_ENV:-development}"

# Demo user credentials
DEMO_USERS=(
    "admin@varai.com:SuperAdmin123!:Super Admin:admin"
    "manager@varai.com:Manager123!:Brand Manager:manager" 
    "client@varai.com:Client123!:Client Admin:client"
    "viewer@varai.com:Viewer123!:Viewer:viewer"
)

# Demo store locations with enhanced data
DEMO_STORES=(
    "VARAi Store - Downtown:123 Main Street:New York:NY:10001:40.7128:-74.0060:true:9:00-18:00:Sarah Johnson:(555) 123-4567:eye_exams,frame_fitting,repairs"
    "VARAi Store - Mall:456 Mall Avenue:New York:NY:10002:40.7589:-73.9851:true:10:00-21:00:Michael Chen:(555) 234-5678:frame_fitting,consultations"
    "VARAi Store - Airport:789 Airport Road:New York:NY:10003:40.6892:-74.1745:false:6:00-22:00:Lisa Rodriguez:(555) 345-6789:frame_fitting"
    "VARAi Store - Suburbs:321 Oak Street:New York:NY:10004:40.7282:-74.0776:true:9:00-17:00:David Kim:(555) 456-7890:eye_exams,frame_fitting,repairs,consultations"
    "VARAi Store - Midtown:555 Broadway:New York:NY:10036:40.7580:-73.9855:true:8:00-20:00:Emma Wilson:(555) 567-8901:eye_exams,frame_fitting,repairs"
    "VARAi Store - Brooklyn:789 Atlantic Ave:Brooklyn:NY:11238:40.6782:-73.9442:true:10:00-19:00:James Park:(555) 678-9012:frame_fitting,consultations,repairs"
)

# Demo products with realistic eyewear data
DEMO_PRODUCTS=(
    "Classic Aviator:AVT-001:149.99:Timeless aviator style with premium materials:Sunglasses"
    "Modern Square:MSQ-002:199.99:Contemporary square frames for everyday wear:Prescription"
    "Vintage Round:VRD-003:179.99:Retro-inspired round frames with modern comfort:Prescription"
    "Sport Performance:SPT-004:229.99:High-performance frames for active lifestyles:Sports"
    "Designer Cat-Eye:DCE-005:259.99:Elegant cat-eye design for sophisticated style:Sunglasses"
    "Blue Light Blocker:BLB-006:189.99:Computer glasses with blue light protection:Computer"
    "Titanium Lightweight:TLW-007:299.99:Ultra-light titanium frames for all-day comfort:Prescription"
    "Kids Safety Frame:KSF-008:129.99:Durable and safe frames designed for children:Kids"
)

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Check if API is available
check_api_health() {
    log_info "Checking API health at $API_BASE_URL"
    
    if curl -s -f "$API_BASE_URL/health" > /dev/null 2>&1; then
        log_success "API is healthy and accessible"
        return 0
    else
        log_error "API is not accessible at $API_BASE_URL"
        log_info "Please ensure the backend services are running"
        return 1
    fi
}

# Create demo users
create_demo_users() {
    log_info "Creating demo user accounts..."
    
    for user_data in "${DEMO_USERS[@]}"; do
        IFS=':' read -r email password name role <<< "$user_data"
        
        log_info "Creating user: $email ($role)"
        
        # Create user payload
        user_payload=$(cat <<EOF
{
    "email": "$email",
    "password": "$password",
    "name": "$name",
    "role": "$role",
    "is_demo": true,
    "created_by": "demo-seeder"
}
EOF
)
        
        # Make API call to create user
        response=$(curl -s -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$user_payload" \
            "$API_BASE_URL/api/v1/users" \
            -o /tmp/user_response.json)
        
        if [[ "$response" == "201" || "$response" == "200" ]]; then
            log_success "Created user: $email"
        else
            log_warning "User $email may already exist or creation failed (HTTP: $response)"
        fi
    done
}

# Create demo store locations
create_demo_stores() {
    log_info "Creating demo store locations..."
    
    for store_data in "${DEMO_STORES[@]}"; do
        IFS=':' read -r name address lat lng bopis_enabled <<< "$store_data"
        
        log_info "Creating store: $name"
        
        # Create store payload
        store_payload=$(cat <<EOF
{
    "name": "$name",
    "address": "$address",
    "latitude": $lat,
    "longitude": $lng,
    "bopis_enabled": $bopis_enabled,
    "is_active": true,
    "phone": "+1-555-0${RANDOM:0:3}-${RANDOM:0:4}",
    "email": "store${RANDOM:0:2}@varai.com",
    "hours": {
        "monday": "9:00-21:00",
        "tuesday": "9:00-21:00", 
        "wednesday": "9:00-21:00",
        "thursday": "9:00-21:00",
        "friday": "9:00-22:00",
        "saturday": "10:00-22:00",
        "sunday": "11:00-20:00"
    },
    "is_demo": true
}
EOF
)
        
        # Make API call to create store
        response=$(curl -s -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$store_payload" \
            "$API_BASE_URL/api/v1/stores" \
            -o /tmp/store_response.json)
        
        if [[ "$response" == "201" || "$response" == "200" ]]; then
            log_success "Created store: $name"
            # Store the store ID for inventory seeding
            store_id=$(jq -r '.id' /tmp/store_response.json 2>/dev/null || echo "store-${RANDOM}")
            echo "$store_id:$name" >> /tmp/demo_stores.txt
        else
            log_warning "Store $name may already exist or creation failed (HTTP: $response)"
        fi
    done
}

# Create demo products
create_demo_products() {
    log_info "Creating demo product catalog..."
    
    for product_data in "${DEMO_PRODUCTS[@]}"; do
        IFS=':' read -r name sku price description category <<< "$product_data"
        
        log_info "Creating product: $name"
        
        # Create product payload
        product_payload=$(cat <<EOF
{
    "name": "$name",
    "sku": "$sku",
    "price": $price,
    "description": "$description",
    "category": "$category",
    "brand": "VARAi Collection",
    "is_active": true,
    "specifications": {
        "frame_material": "Premium Acetate",
        "lens_material": "CR-39 Plastic",
        "frame_width": "140mm",
        "lens_width": "52mm",
        "bridge_width": "18mm",
        "temple_length": "145mm"
    },
    "images": [
        "https://via.placeholder.com/400x300/667eea/ffffff?text=$sku",
        "https://via.placeholder.com/400x300/764ba2/ffffff?text=$sku-Side"
    ],
    "tags": ["demo", "eyewear", "varai"],
    "is_demo": true
}
EOF
)
        
        # Make API call to create product
        response=$(curl -s -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$product_payload" \
            "$API_BASE_URL/api/v1/products" \
            -o /tmp/product_response.json)
        
        if [[ "$response" == "201" || "$response" == "200" ]]; then
            log_success "Created product: $name"
            # Store the product ID for inventory seeding
            product_id=$(jq -r '.id' /tmp/product_response.json 2>/dev/null || echo "product-${RANDOM}")
            echo "$product_id:$sku:$name" >> /tmp/demo_products.txt
        else
            log_warning "Product $name may already exist or creation failed (HTTP: $response)"
        fi
    done
}

# Seed inventory across stores
seed_store_inventory() {
    log_info "Seeding inventory across demo stores..."
    
    if [[ ! -f /tmp/demo_stores.txt ]] || [[ ! -f /tmp/demo_products.txt ]]; then
        log_warning "Store or product data not found, skipping inventory seeding"
        return
    fi
    
    while IFS=':' read -r store_id store_name; do
        log_info "Adding inventory to: $store_name"
        
        while IFS=':' read -r product_id sku product_name; do
            # Random inventory quantity between 5-25
            quantity=$((RANDOM % 21 + 5))
            
            inventory_payload=$(cat <<EOF
{
    "store_id": "$store_id",
    "product_id": "$product_id",
    "sku": "$sku",
    "quantity_available": $quantity,
    "quantity_reserved": 0,
    "reorder_level": 5,
    "max_stock": 50,
    "is_active": true,
    "last_updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
)
            
            response=$(curl -s -w "%{http_code}" -X POST \
                -H "Content-Type: application/json" \
                -d "$inventory_payload" \
                "$API_BASE_URL/api/v1/inventory" \
                -o /dev/null)
            
            if [[ "$response" == "201" || "$response" == "200" ]]; then
                log_info "  ✓ $sku: $quantity units"
            fi
            
        done < /tmp/demo_products.txt
        
    done < /tmp/demo_stores.txt
    
    log_success "Inventory seeding completed"
}

# Create demo BOPIS reservations
create_demo_reservations() {
    log_info "Creating demo BOPIS reservations..."
    
    if [[ ! -f /tmp/demo_stores.txt ]] || [[ ! -f /tmp/demo_products.txt ]]; then
        log_warning "Store or product data not found, skipping reservation creation"
        return
    fi
    
    # Create 10 demo reservations with various statuses
    for i in {1..10}; do
        # Random store and product
        store_line=$(shuf -n 1 /tmp/demo_stores.txt)
        product_line=$(shuf -n 1 /tmp/demo_products.txt)
        
        IFS=':' read -r store_id store_name <<< "$store_line"
        IFS=':' read -r product_id sku product_name <<< "$product_line"
        
        # Random customer data
        customer_email="customer${i}@example.com"
        customer_name="Demo Customer ${i}"
        customer_phone="+1-555-0${RANDOM:0:3}-${RANDOM:0:4}"
        
        # Random status
        statuses=("pending" "confirmed" "ready" "picked_up")
        status=${statuses[$((RANDOM % ${#statuses[@]}))]}
        
        # Future pickup date (1-7 days from now)
        pickup_days=$((RANDOM % 7 + 1))
        pickup_date=$(date -u -d "+${pickup_days} days" +%Y-%m-%dT%H:%M:%SZ)
        
        reservation_payload=$(cat <<EOF
{
    "customer_email": "$customer_email",
    "customer_name": "$customer_name",
    "customer_phone": "$customer_phone",
    "store_id": "$store_id",
    "frame_id": "$product_id",
    "quantity": $((RANDOM % 3 + 1)),
    "pickup_by_date": "$pickup_date",
    "special_instructions": "Demo reservation #${i} - Please handle with care"
}
EOF
)
        
        response=$(curl -s -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$reservation_payload" \
            "$API_BASE_URL/api/v1/bopis/reservations" \
            -o /tmp/reservation_response.json)
        
        if [[ "$response" == "201" || "$response" == "200" ]]; then
            confirmation=$(jq -r '.confirmation_number' /tmp/reservation_response.json 2>/dev/null || echo "DEMO${i}")
            log_success "Created reservation: $confirmation ($status)"
            
            # Update status if not pending
            if [[ "$status" != "pending" ]]; then
                update_payload=$(cat <<EOF
{
    "status": "$status",
    "staff_notes": "Demo status update for testing"
}
EOF
)
                curl -s -X PATCH \
                    -H "Content-Type: application/json" \
                    -d "$update_payload" \
                    "$API_BASE_URL/api/v1/bopis/reservations/$confirmation" \
                    -o /dev/null
            fi
        else
            log_warning "Failed to create reservation #${i} (HTTP: $response)"
        fi
    done
}

# Create demo analytics data
create_demo_analytics() {
    log_info "Generating demo analytics data..."
    
    # This would typically involve creating historical data
    # For now, we'll create some sample metrics
    
    analytics_payload=$(cat <<EOF
{
    "date": "$(date -u +%Y-%m-%d)",
    "metrics": {
        "total_reservations": 47,
        "pending_reservations": 12,
        "ready_for_pickup": 8,
        "completed_pickups": 25,
        "expired_reservations": 2,
        "pickup_rate": 89.3,
        "average_wait_time": "2.4 hours",
        "customer_satisfaction": 4.7,
        "revenue_generated": 12847.50
    },
    "is_demo": true
}
EOF
)
    
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$analytics_payload" \
        "$API_BASE_URL/api/v1/analytics/daily" \
        -o /dev/null)
    
    if [[ "$response" == "201" || "$response" == "200" ]]; then
        log_success "Demo analytics data created"
    else
        log_warning "Failed to create analytics data (HTTP: $response)"
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f /tmp/demo_stores.txt /tmp/demo_products.txt
    rm -f /tmp/user_response.json /tmp/store_response.json /tmp/product_response.json /tmp/reservation_response.json
}

# Reset demo data (optional)
reset_demo_data() {
    if [[ "$1" == "--reset" ]]; then
        log_warning "Resetting demo data..."
        
        # Delete demo data
        curl -s -X DELETE "$API_BASE_URL/api/v1/demo/reset" -o /dev/null
        
        log_success "Demo data reset completed"
    fi
}

# Main execution
main() {
    echo
    log_info "Starting demo data seeding for environment: $DEMO_ENV"
    echo
    
    # Check for reset flag
    reset_demo_data "$1"
    
    # Check API health
    if ! check_api_health; then
        exit 1
    fi
    
    echo
    log_info "Creating demo data..."
    echo
    
    # Create all demo data
    create_demo_users
    echo
    
    create_demo_stores
    echo
    
    create_demo_products
    echo
    
    seed_store_inventory
    echo
    
    create_demo_reservations
    echo
    
    create_demo_analytics
    echo
    
    # Cleanup
    cleanup
    
    echo
    log_success "Demo data seeding completed successfully!"
    echo
    log_info "Demo Login Credentials:"
    echo "  • Super Admin: admin@varai.com / SuperAdmin123!"
    echo "  • Brand Manager: manager@varai.com / Manager123!"
    echo "  • Client Admin: client@varai.com / Client123!"
    echo "  • Viewer: viewer@varai.com / Viewer123!"
    echo
    log_info "Demo stores and products have been created with realistic inventory"
    log_info "BOPIS reservations are available for testing pickup workflows"
    echo
}

# Run main function with all arguments
main "$@"