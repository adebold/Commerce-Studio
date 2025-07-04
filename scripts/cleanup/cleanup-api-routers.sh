#!/bin/bash

echo "🧹 API Router Duplicates Cleanup"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠ WARNING: This will remove API router files with '2' and '3' suffixes${NC}"
echo "Based on analysis of src/api/main.py, only the base router files (without suffixes) are imported."
echo ""

# Show what will be removed
echo "Files to be removed:"
find src/api/routers -name "* 2.py" -o -name "* 3.py" | sort

echo ""
read -p "Do you want to proceed with removing these duplicate API router files? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✓ Proceeding with cleanup...${NC}"
    
    # Remove files with '2' suffix
    echo "Removing files with '2' suffix:"
    find src/api/routers -name "* 2.py" -type f -exec echo "  Removing: {}" \; -delete
    
    # Remove files with '3' suffix  
    echo "Removing files with '3' suffix:"
    find src/api/routers -name "* 3.py" -type f -exec echo "  Removing: {}" \; -delete
    
    # Also remove the additional minimal_main duplicate
    if [ -f "src/api/minimal_main 2.py" ]; then
        echo "  Removing: src/api/minimal_main 2.py"
        rm "src/api/minimal_main 2.py"
    fi
    
    echo -e "${GREEN}✅ API router cleanup completed!${NC}"
    
    # Count remaining files
    remaining_count=$(find src/api/routers -name "*.py" | wc -l)
    echo "Remaining router files: $remaining_count"
    
else
    echo -e "${YELLOW}❌ Cleanup cancelled by user${NC}"
fi
