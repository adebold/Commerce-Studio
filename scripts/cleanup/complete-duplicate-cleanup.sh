#!/bin/bash

# 🧹 Complete Duplicate Files Cleanup Script
# This script removes all remaining duplicate files with "2" and "3" suffixes

set -e

echo "🧹 Starting Complete Duplicate File Cleanup..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter for removed files
REMOVED_COUNT=0

# Function to safely remove files
safe_remove() {
    local file="$1"
    if [[ -f "$file" || -d "$file" ]]; then
        echo -e "${YELLOW}Removing:${NC} $file"
        rm -rf "$file"
        ((REMOVED_COUNT++))
    fi
}

# Function to remove files matching pattern
remove_pattern() {
    local pattern="$1"
    local description="$2"
    
    echo -e "\n${BLUE}=== $description ===${NC}"
    
    # Find and remove files matching pattern
    while IFS= read -r -d '' file; do
        safe_remove "$file"
    done < <(find . -name "$pattern" -print0 2>/dev/null)
}

# 1. Remove API router duplicates that were missed
echo -e "\n${BLUE}=== Removing API Router Duplicates ===${NC}"
safe_remove "src/api/routers/bopis 2.py"

# 2. Remove terraform duplicates
remove_pattern "terraform 2.*" "Terraform Binary Duplicates"
remove_pattern "terraform 3.*" "Terraform Binary Duplicates"
remove_pattern "LICENSE 2.*" "License File Duplicates"
remove_pattern "LICENSE 3.*" "License File Duplicates"
remove_pattern "README 2.*" "README File Duplicates"
remove_pattern ".terraform.lock 2.*" "Terraform Lock File Duplicates"
remove_pattern "variables 2.*" "Terraform Variables Duplicates"
remove_pattern "variables 3.*" "Terraform Variables Duplicates"
remove_pattern "main 2.*" "Terraform Main File Duplicates"
remove_pattern "main 3.*" "Terraform Main File Duplicates"
remove_pattern "terraform.tfvars 2.*" "Terraform Vars File Duplicates"
remove_pattern "terraform.tfvars 3.*" "Terraform Vars File Duplicates"
remove_pattern "*.tf 2.*" "Terraform File Duplicates"
remove_pattern "terraform.tfstate 2.*" "Terraform State Duplicates"
remove_pattern "terraform.tfstate 3.*" "Terraform State Duplicates"
remove_pattern "terraform 2.*" "Terraform State File Duplicates"

# 3. Remove environment file duplicates
echo -e "\n${BLUE}=== Removing Environment File Duplicates ===${NC}"
safe_remove ".env 2.dev"
safe_remove ".env 2.unified"
safe_remove ".env.dev"
safe_remove ".env.development"

# 4. Remove database migration duplicates
remove_pattern "migrations 2" "Database Migration Directory Duplicates"

# 5. Remove deploy config duplicates
remove_pattern "blue-green 2" "Blue-Green Deploy Directory Duplicates"
remove_pattern "config 2" "Config Directory Duplicates"

# 6. Remove any remaining "* 2.*" and "* 3.*" files
echo -e "\n${BLUE}=== Removing Any Remaining Duplicates ===${NC}"
find . -name "* 2.*" -o -name "* 3.*" | while read -r file; do
    if [[ -f "$file" || -d "$file" ]]; then
        safe_remove "$file"
    fi
done

# 7. Clean up untracked files that should be ignored
echo -e "\n${BLUE}=== Cleaning Up Untracked Files ===${NC}"
safe_remove ".claude/"
safe_remove ".coverage"

# 8. Update .gitignore to prevent future issues
echo -e "\n${BLUE}=== Updating .gitignore ===${NC}"
cat >> .gitignore << 'EOF'

# Additional ignores to prevent duplicates
*" 2"*
*" 3"*
*.backup
.claude/
.coverage
.env.dev
.env.development
.env.local
.env.test
.env.staging
.env.production

# Terraform duplicates
terraform 2.*
terraform 3.*
*.tf 2.*
*.tf 3.*
*.tfstate 2.*
*.tfstate 3.*
.terraform.lock 2.*
.terraform.lock 3.*

EOF

echo -e "\n${GREEN}✅ Duplicate cleanup completed!${NC}"
echo -e "${GREEN}📊 Total files/directories removed: $REMOVED_COUNT${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Check git status: git status --porcelain | wc -l"
echo "2. Add changes: git add ."
echo "3. Commit: git commit -m 'Complete duplicate file cleanup'"

echo -e "\n${GREEN}🎉 Repository cleanup successful!${NC}"