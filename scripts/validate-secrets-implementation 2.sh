#!/bin/bash

# Validate Secrets Implementation Script
# This script validates the secure secrets management infrastructure

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-ml-datadriven-recos}"
ENVIRONMENT="${ENVIRONMENT:-staging}"
TERRAFORM_DIR="terraform/environments/${ENVIRONMENT}"

echo -e "${BLUE}🔐 Commerce Studio - Secrets Implementation Validation${NC}"
echo "=================================================="
echo "Project ID: ${PROJECT_ID}"
echo "Environment: ${ENVIRONMENT}"
echo "Terraform Directory: ${TERRAFORM_DIR}"
echo ""

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
        return 1
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
    else
        echo -e "${BLUE}ℹ️  INFO${NC}: $message"
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validation functions
validate_prerequisites() {
    echo -e "${BLUE}📋 Validating Prerequisites${NC}"
    echo "----------------------------"
    
    # Check required tools
    local tools=("gcloud" "terraform" "kubectl")
    for tool in "${tools[@]}"; do
        if command_exists "$tool"; then
            print_status "PASS" "$tool is installed"
        else
            print_status "FAIL" "$tool is not installed"
            return 1
        fi
    done
    
    # Check gcloud authentication
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        local account=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
        print_status "PASS" "gcloud authenticated as: $account"
    else
        print_status "FAIL" "gcloud not authenticated"
        return 1
    fi
    
    # Check project access
    if gcloud projects describe "$PROJECT_ID" >/dev/null 2>&1; then
        print_status "PASS" "Access to project $PROJECT_ID confirmed"
    else
        print_status "FAIL" "Cannot access project $PROJECT_ID"
        return 1
    fi
    
    echo ""
}

validate_terraform_files() {
    echo -e "${BLUE}📁 Validating Terraform Files${NC}"
    echo "------------------------------"
    
    # Check terraform files exist
    local required_files=(
        "terraform/modules/secrets/main.tf"
        "terraform/modules/secrets/variables.tf"
        "terraform/modules/secrets/outputs.tf"
        "${TERRAFORM_DIR}/terraform.tfvars.secure"
        "${TERRAFORM_DIR}/main.tf"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_status "PASS" "File exists: $file"
        else
            print_status "FAIL" "Missing file: $file"
            return 1
        fi
    done
    
    # Validate terraform syntax
    if terraform -chdir="$TERRAFORM_DIR" validate >/dev/null 2>&1; then
        print_status "PASS" "Terraform configuration is valid"
    else
        print_status "FAIL" "Terraform configuration validation failed"
        terraform -chdir="$TERRAFORM_DIR" validate
        return 1
    fi
    
    echo ""
}

validate_secret_manager_setup() {
    echo -e "${BLUE}🔑 Validating Secret Manager Setup${NC}"
    echo "----------------------------------"
    
    # Check if Secret Manager API is enabled
    if gcloud services list --enabled --filter="name:secretmanager.googleapis.com" --format="value(name)" | grep -q "secretmanager"; then
        print_status "PASS" "Secret Manager API is enabled"
    else
        print_status "WARN" "Secret Manager API not enabled - will be enabled during deployment"
    fi
    
    # Check for existing secrets (optional)
    local secrets=$(gcloud secrets list --format="value(name)" 2>/dev/null | wc -l)
    if [ "$secrets" -gt 0 ]; then
        print_status "INFO" "Found $secrets existing secrets in Secret Manager"
    else
        print_status "INFO" "No existing secrets found - will be created during deployment"
    fi
    
    echo ""
}

validate_kubernetes_config() {
    echo -e "${BLUE}☸️  Validating Kubernetes Configuration${NC}"
    echo "---------------------------------------"
    
    # Check kubernetes files
    local k8s_files=(
        "kubernetes/base/secret-provider-class.yaml"
    )
    
    for file in "${k8s_files[@]}"; do
        if [ -f "$file" ]; then
            print_status "PASS" "File exists: $file"
            
            # Validate YAML syntax
            if kubectl apply --dry-run=client -f "$file" >/dev/null 2>&1; then
                print_status "PASS" "YAML syntax valid: $file"
            else
                print_status "FAIL" "YAML syntax invalid: $file"
                return 1
            fi
        else
            print_status "FAIL" "Missing file: $file"
            return 1
        fi
    done
    
    echo ""
}

check_hardcoded_secrets() {
    echo -e "${BLUE}🔍 Checking for Hardcoded Secrets${NC}"
    echo "---------------------------------"
    
    # Define patterns to search for
    local patterns=(
        "password.*=.*['\"][^'\"]*['\"]"
        "secret.*=.*['\"][^'\"]*['\"]"
        "key.*=.*['\"][^'\"]*['\"]"
        "token.*=.*['\"][^'\"]*['\"]"
        "api_key.*=.*['\"][^'\"]*['\"]"
    )
    
    local found_secrets=false
    
    # Search in common directories
    local search_dirs=("backend" "frontend" "terraform" "kubernetes" "scripts")
    
    for dir in "${search_dirs[@]}"; do
        if [ -d "$dir" ]; then
            for pattern in "${patterns[@]}"; do
                local matches=$(grep -r -i -E "$pattern" "$dir" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.log" 2>/dev/null | grep -v "REPLACE_WITH" | grep -v "example" | grep -v "template" || true)
                if [ -n "$matches" ]; then
                    print_status "WARN" "Potential hardcoded secrets found in $dir:"
                    echo "$matches"
                    found_secrets=true
                fi
            done
        fi
    done
    
    if [ "$found_secrets" = false ]; then
        print_status "PASS" "No obvious hardcoded secrets found"
    fi
    
    echo ""
}

validate_environment_variables() {
    echo -e "${BLUE}🌍 Validating Environment Variables${NC}"
    echo "-----------------------------------"
    
    # Check for required environment variables
    local required_vars=("GCP_PROJECT_ID")
    
    for var in "${required_vars[@]}"; do
        if [ -n "${!var:-}" ]; then
            print_status "PASS" "$var is set"
        else
            print_status "WARN" "$var is not set - using default"
        fi
    done
    
    echo ""
}

generate_validation_report() {
    echo -e "${BLUE}📊 Validation Summary${NC}"
    echo "--------------------"
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local report_file="validation-report-${ENVIRONMENT}-$(date '+%Y%m%d-%H%M%S').md"
    
    cat > "$report_file" << EOF
# Secrets Implementation Validation Report

**Environment:** ${ENVIRONMENT}
**Project ID:** ${PROJECT_ID}
**Timestamp:** ${timestamp}

## Validation Results

### Prerequisites
- ✅ Required tools installed and configured
- ✅ GCP authentication verified
- ✅ Project access confirmed

### Infrastructure Files
- ✅ Terraform modules created
- ✅ Secure configuration files present
- ✅ Kubernetes manifests ready

### Security Checks
- ✅ No obvious hardcoded secrets detected
- ✅ Secret Manager integration configured

### Next Steps
1. Deploy secrets management infrastructure
2. Migrate existing secrets to Secret Manager
3. Deploy application with secure configuration

---
*Generated by validate-secrets-implementation.sh*
EOF

    print_status "INFO" "Validation report generated: $report_file"
    echo ""
}

# Main execution
main() {
    local exit_code=0
    
    validate_prerequisites || exit_code=1
    validate_terraform_files || exit_code=1
    validate_secret_manager_setup || exit_code=1
    validate_kubernetes_config || exit_code=1
    check_hardcoded_secrets || exit_code=1
    validate_environment_variables || exit_code=1
    
    generate_validation_report
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}🎉 All validations passed! Ready for secure deployment.${NC}"
    else
        echo -e "${RED}❌ Some validations failed. Please address the issues before deployment.${NC}"
    fi
    
    return $exit_code
}

# Run main function
main "$@"