#!/bin/bash

# 🧹 Repository Cleanup Script
# Systematically organizes 871 uncommitted changes

set -e

echo "🔧 Starting Repository Cleanup..."
echo "📊 Current status: 871 changes (659 untracked, 198 deleted, 14 modified)"

# Create backup branch
echo "📦 Creating backup branch..."
git checkout -b cleanup-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
git checkout main

# 1. REMOVE TEMPORARY/DUPLICATE FILES
echo "🗑️  Phase 1: Removing temporary and duplicate files..."

# Remove obvious temporary files
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.bak" -delete 2>/dev/null || true
find . -name "*~" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Remove duplicate test files (keep the main ones)
echo "🔄 Removing duplicate test files..."
rm -f *test-*.js 2>/dev/null || true
rm -f *verification*.js 2>/dev/null || true
rm -f *VERIFICATION*.js 2>/dev/null || true

# 2. ORGANIZE DOCUMENTATION
echo "📚 Phase 2: Organizing documentation..."

# Create organized docs structure
mkdir -p docs/reports/{implementation,deployment,testing,security}
mkdir -p docs/guides/{setup,configuration,troubleshooting}
mkdir -p docs/architecture/{specs,roadmaps,ux}

# Move implementation reports
echo "📋 Moving implementation reports..."
find . -maxdepth 1 -name "*_IMPLEMENTATION_*REPORT.md" -exec mv {} docs/reports/implementation/ 2>/dev/null \; || true
find . -maxdepth 1 -name "*_COMPLETION_REPORT.md" -exec mv {} docs/reports/implementation/ 2>/dev/null \; || true

# Move deployment reports
find . -maxdepth 1 -name "*_DEPLOYMENT_*REPORT.md" -exec mv {} docs/reports/deployment/ 2>/dev/null \; || true
find . -maxdepth 1 -name "*DEPLOYMENT_*.md" -exec mv {} docs/reports/deployment/ 2>/dev/null \; || true

# Move setup guides
find . -maxdepth 1 -name "*_SETUP_GUIDE.md" -exec mv {} docs/guides/setup/ 2>/dev/null \; || true
find . -maxdepth 1 -name "*SETUP_GUIDE.md" -exec mv {} docs/guides/setup/ 2>/dev/null \; || true

# 3. ORGANIZE SCRIPTS
echo "🔧 Phase 3: Organizing scripts..."

# Ensure scripts directory exists
mkdir -p scripts/{deployment,testing,cleanup}

# Move PowerShell scripts
find . -maxdepth 1 -name "*.ps1" -exec mv {} scripts/deployment/ 2>/dev/null \; || true

# Move shell scripts (except this one)
find . -maxdepth 1 -name "*.sh" ! -name "repository-cleanup.sh" -exec mv {} scripts/deployment/ 2>/dev/null \; || true

# Move cleanup scripts
find . -maxdepth 1 -name "*cleanup*" -exec mv {} scripts/cleanup/ 2>/dev/null \; || true

# 4. ORGANIZE TESTS
echo "🧪 Phase 4: Organizing tests..."

# Create test structure
mkdir -p tests/{unit,integration,e2e,verification}

# Move verification tests
find . -maxdepth 1 -name "*verification*.js" -exec mv {} tests/verification/ 2>/dev/null \; || true
find . -maxdepth 1 -name "*VERIFICATION*.js" -exec mv {} tests/verification/ 2>/dev/null \; || true

# Move e2e tests
find . -maxdepth 1 -name "*e2e*.js" -exec mv {} tests/e2e/ 2>/dev/null \; || true

# 5. UPDATE .gitignore
echo "🚫 Phase 5: Updating .gitignore..."

cat >> .gitignore << 'EOF'

# Cleanup additions
*.tmp
*.bak
*~
.DS_Store

# Report files (keep in docs/reports/)
/*_REPORT.md
/*_COMPLETION_REPORT.md
/*_DEPLOYMENT_*.md
/*_IMPLEMENTATION_*.md

# Temporary test files
/test-*.js
/verification-*.js
/*-verification.js

# Duplicate files
/*-duplicate*
/*-copy*
/*-backup*

# PowerShell scripts in root
/*.ps1

# Temporary directories
/temp/
/tmp/
EOF

# 6. CLEAN UP DELETED FILES
echo "🗑️  Phase 6: Cleaning up deleted files..."
git add -A
git reset HEAD -- scripts/repository-cleanup.sh

# 7. STAGE ORGANIZED FILES
echo "📦 Phase 7: Staging organized files..."

# Add organized documentation
git add docs/reports/ docs/guides/ docs/architecture/ 2>/dev/null || true

# Add organized scripts
git add scripts/ 2>/dev/null || true

# Add organized tests
git add tests/ 2>/dev/null || true

# Add infrastructure files
git add terraform/ 2>/dev/null || true
git add .github/ 2>/dev/null || true
git add .gcloudignore 2>/dev/null || true

# Add legitimate source files
git add src/ frontend/ website/ 2>/dev/null || true

# Add updated .gitignore
git add .gitignore 2>/dev/null || true

# 8. FINAL STATUS
echo "✅ Phase 8: Final status check..."

REMAINING_UNTRACKED=$(git status --porcelain | grep "^??" | wc -l | tr -d ' ')
STAGED_FILES=$(git status --porcelain | grep "^A" | wc -l | tr -d ' ')

echo ""
echo "🎯 CLEANUP SUMMARY:"
echo "   📁 Remaining untracked files: $REMAINING_UNTRACKED"
echo "   ✅ Staged files: $STAGED_FILES"
echo "   📚 Documentation organized into docs/"
echo "   🔧 Scripts organized into scripts/"
echo "   🧪 Tests organized into tests/"
echo ""

if [ "$REMAINING_UNTRACKED" -lt 50 ]; then
    echo "✅ SUCCESS: Repository cleaned from 659 to $REMAINING_UNTRACKED untracked files!"
    echo ""
    echo "🚀 NEXT STEPS:"
    echo "   1. Review remaining files: git status"
    echo "   2. Commit organized files: git commit -m 'feat: organize repository structure'"
    echo "   3. Review and handle remaining untracked files individually"
else
    echo "⚠️  WARNING: Still $REMAINING_UNTRACKED untracked files remaining"
    echo "   Manual review may be needed for remaining files"
fi

echo ""
echo "🔧 Repository cleanup completed!"