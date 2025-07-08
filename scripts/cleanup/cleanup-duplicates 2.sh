#!/bin/bash

# Commerce Studio Repository - Duplicate Files Cleanup Script
# This script removes confirmed duplicate files and directories
# Run with: bash cleanup-duplicates.sh

set -e  # Exit on any error

echo "🧹 Commerce Studio Duplicate Files Cleanup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to safely remove directory if it exists and is empty
safe_remove_empty_dir() {
    local dir="$1"
    if [ -d "$dir" ]; then
        if [ -z "$(ls -A "$dir")" ]; then
            echo -e "${GREEN}✓${NC} Removing empty directory: $dir"
            rm -rf "$dir"
        else
            echo -e "${YELLOW}⚠${NC} Directory not empty, skipping: $dir"
            ls -la "$dir"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Directory not found: $dir"
    fi
}

# Function to safely remove file if it exists
safe_remove_file() {
    local file="$1"
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} Removing file: $file"
        rm "$file"
    else
        echo -e "${YELLOW}⚠${NC} File not found: $file"
    fi
}

# Function to backup directory before cleanup
backup_directory() {
    local dir="$1"
    local backup_name="backup_$(date +%Y%m%d_%H%M%S)_$(basename "$dir")"
    if [ -d "$dir" ]; then
        echo -e "${YELLOW}📦${NC} Creating backup: $backup_name"
        cp -r "$dir" "$backup_name"
    fi
}

echo ""
echo "Phase 1: Removing confirmed empty directories with '2' suffix"
echo "============================================================"

# Confirmed empty directories
safe_remove_empty_dir "apps/bigcommerce/admin/components 2"
safe_remove_empty_dir "apps/html-store/cypress 2"
safe_remove_empty_dir "apps/html-store/deploy/css 2"
safe_remove_empty_dir "apps/html-store/deploy/images 2"
safe_remove_empty_dir "apps/html-store/deploy/js 2"
safe_remove_empty_dir "apps/html-store/images 2"

echo ""
echo "Phase 2: Removing confirmed backup files"
echo "========================================"

safe_remove_file "website/js/theme-manager-backup.js"

echo ""
echo "Phase 3: Additional empty directories (verify first)"
echo "=================================================="

# Additional directories that likely are empty but need verification
directories_to_check=(
    "apps/bigcommerce/tests/unit 2"
    "apps/magento/Test/js 2"
    "apps/magento/Test/Unit 2"
    "auth-service/keycloak 2"
    "backend/auth-api/src 2"
    "business-services/product-service 2"
    "config/grafana/dashboards 2"
    "config/mongodb/init 2"
    "data-management/api 2"
    "data-management/mongodb 2"
    "data-management/redis 2"
)

for dir in "${directories_to_check[@]}"; do
    safe_remove_empty_dir "$dir"
done

echo ""
echo "Phase 4: API Router Duplicates (MANUAL REVIEW REQUIRED)"
echo "======================================================"
echo -e "${RED}⚠ WARNING:${NC} API router duplicates require manual review!"
echo "The following files have '2' and '3' versions that need verification:"
echo ""

# List API router duplicates for manual review
if [ -d "src/api/routers" ]; then
    echo "Files with '2' suffix:"
    find "src/api/routers" -name "* 2.py" -type f | sort
    echo ""
    echo "Files with '3' suffix:"
    find "src/api/routers" -name "* 3.py" -type f | sort
    echo ""
    echo -e "${YELLOW}📋 To review these files:${NC}"
    echo "1. Check which versions are imported in other files:"
    echo "   grep -r 'from.*routers' . --include='*.py'"
    echo ""
    echo "2. Compare file contents:"
    echo "   diff 'src/api/routers/filename.py' 'src/api/routers/filename 2.py'"
    echo ""
    echo "3. Check git history:"
    echo "   git log --oneline --follow 'src/api/routers/filename.py'"
    echo ""
    echo -e "${RED}⚠ DO NOT run the following until manual verification:${NC}"
    echo "   find src/api/routers -name '* 2.py' -delete"
    echo "   find src/api/routers -name '* 3.py' -delete"
fi

echo ""
echo "Phase 5: Documentation Duplicates"
echo "================================"

# Check for documentation duplicates
if [ -f "docs/architecture/VARAi-Commerce-Studio-Home-Page-Design 2.md" ]; then
    echo -e "${YELLOW}📄${NC} Found documentation duplicate:"
    echo "docs/architecture/VARAi-Commerce-Studio-Home-Page-Design 2.md"
    echo ""
    echo "Compare with original:"
    if [ -f "docs/architecture/VARAi-Commerce-Studio-Home-Page-Design.md" ]; then
        echo "diff 'docs/architecture/VARAi-Commerce-Studio-Home-Page-Design.md' 'docs/architecture/VARAi-Commerce-Studio-Home-Page-Design 2.md'"
    else
        echo -e "${YELLOW}⚠${NC} Original file not found, manual review needed"
    fi
fi

echo ""
echo "Phase 6: Summary and Next Steps"
echo "==============================="

# Count remaining potential duplicates
api_duplicates_2=$(find src/api/routers -name "* 2.py" -type f 2>/dev/null | wc -l || echo "0")
api_duplicates_3=$(find src/api/routers -name "* 3.py" -type f 2>/dev/null | wc -l || echo "0")

echo -e "${GREEN}✅ Cleanup completed for safe removals${NC}"
echo ""
echo "Remaining items requiring manual review:"
echo "- API router files with '2' suffix: $api_duplicates_2"
echo "- API router files with '3' suffix: $api_duplicates_3"
echo "- Documentation duplicates: Check manually"
echo ""
echo -e "${YELLOW}📋 Recommended next steps:${NC}"
echo "1. Review the DUPLICATE_FILES_CLEANUP_REPORT.md for detailed analysis"
echo "2. Manually verify API router duplicates before removal"
echo "3. Check git history for any files you're unsure about"
echo "4. Test the application after cleanup to ensure nothing is broken"
echo ""
echo -e "${GREEN}🎉 Safe cleanup completed!${NC}"

# Create a summary file
cat > cleanup_summary.txt << EOF
Commerce Studio Duplicate Cleanup Summary
Generated: $(date)

Directories removed:
- apps/bigcommerce/admin/components 2/
- apps/html-store/cypress 2/
- apps/html-store/deploy/css 2/
- apps/html-store/deploy/images 2/
- apps/html-store/deploy/js 2/
- apps/html-store/images 2/
- Additional empty directories with '2' suffix

Files removed:
- website/js/theme-manager-backup.js

Remaining for manual review:
- API router files: $api_duplicates_2 files with '2' suffix, $api_duplicates_3 files with '3' suffix
- Documentation duplicates

Next steps:
1. Review API router usage patterns
2. Compare duplicate file contents
3. Remove verified duplicates
4. Test application functionality
EOF

echo ""
echo -e "${GREEN}📄 Summary saved to: cleanup_summary.txt${NC}"