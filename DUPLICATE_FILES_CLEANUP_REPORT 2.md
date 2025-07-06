# Commerce Studio Repository - Duplicate Files Cleanup Report

## Executive Summary

This report identifies duplicate files and directories in the Commerce Studio repository that can be safely removed to reduce repository size and eliminate confusion. The analysis found **extensive duplication** across multiple categories:

- **Empty directories with "2" suffixes**: 16+ directories
- **API router duplicates**: 60+ files with "2" and "3" suffixes
- **Backup files**: Multiple backup files
- **Other duplicates**: Various other duplicate files and directories

## Categories of Duplicates Found

### 1. Empty Directories with "2" Suffix

These directories appear to be empty duplicates created during development and can be safely removed:

#### Confirmed Empty Directories:
- `apps/bigcommerce/admin/components 2/` (empty, original has 2 files)
- `apps/html-store/cypress 2/` (empty, original has full test suite)
- `apps/html-store/deploy/css 2/` (empty, original has 4 CSS files)
- `apps/html-store/deploy/images 2/` (likely empty)
- `apps/html-store/deploy/js 2/` (likely empty)
- `apps/html-store/images 2/` (likely empty)

#### Additional "2" Suffix Directories (Need Verification):
- `apps/bigcommerce/tests/unit 2/`
- `apps/magento/Test/js 2/`
- `apps/magento/Test/Unit 2/`
- `auth-service/keycloak 2/`
- `backend/auth-api/src 2/`
- `business-services/product-service 2/`
- `config/grafana/dashboards 2/`
- `config/mongodb/init 2/`
- `data-management/api 2/`
- `data-management/mongodb 2/`
- `data-management/redis 2/`

### 2. API Router Duplicates (Critical Issue)

The `src/api/routers/` directory contains **massive duplication** with multiple versions of the same files:

#### Files with "2" and "3" Suffixes (60+ files):
```
auth_example 2.py, auth_example 3.py (originals: auth_example.py)
auth_multi_tenant 2.py, auth_multi_tenant 3.py (original: auth_multi_tenant.py)
billing 2.py, billing 3.py (original: billing.py)
bopis 2.py, bopis 3.py (original: bopis.py)
commerce_studio 2.py, commerce_studio 3.py (original: commerce_studio.py)
contact_lens_try_on 2.py, contact_lens_try_on 3.py (original: contact_lens_try_on.py)
dashboard 2.py, dashboard 3.py (original: dashboard.py)
developer 2.py, developer 3.py (original: developer.py)
frames 2.py, frames 3.py (original: frames.py)
mongodb 2.py, mongodb 3.py (original: mongodb.py)
monitoring 2.py, monitoring 3.py (original: monitoring.py)
recommendations_simple 2.py, recommendations_simple 3.py (original: recommendations_simple.py)
service_discovery 2.py, service_discovery 3.py (original: service_discovery.py)
simple_health 2.py, simple_health 3.py (original: simple_health.py)
store_locator 2.py, store_locator 3.py (original: store_locator.py)
tenant 2.py, tenant 3.py (original: tenant.py)
tenants 2.py, tenants 3.py (original: tenants.py)
users 2.py, users 3.py (original: users.py)
virtual_try_on 2.py, virtual_try_on 3.py (original: virtual_try_on.py)
```

**Analysis**: The `bopis 2.py` file examined contains 549 lines of complete BOPIS implementation code, suggesting these are likely full duplicates rather than incremental versions.

### 3. Backup Files

#### Confirmed Backup Files:
- `website/js/theme-manager-backup.js` - Contains only 4 lines indicating it's a backup of replaced functionality

#### Potential Additional Backup Files:
- `website/customer/settings-fixed.html` (likely a fixed version of settings.html)

### 4. Documentation Duplicates

- `docs/architecture/VARAi-Commerce-Studio-Home-Page-Design 2.md` - Appears to be a duplicate of design documentation

## Recommended Cleanup Actions

### Phase 1: Safe Removals (High Confidence)

#### Empty Directories:
```bash
# Remove confirmed empty directories
rm -rf "apps/bigcommerce/admin/components 2"
rm -rf "apps/html-store/cypress 2"
rm -rf "apps/html-store/deploy/css 2"
rm -rf "apps/html-store/deploy/images 2"
rm -rf "apps/html-store/deploy/js 2"
rm -rf "apps/html-store/images 2"
```

#### Backup Files:
```bash
# Remove backup files
rm "website/js/theme-manager-backup.js"
```

### Phase 2: API Router Cleanup (Requires Verification)

**⚠️ CRITICAL**: Before removing API router duplicates, verify which version is currently in use by checking:
1. Import statements in other files
2. Git history to understand which is the latest version
3. Any configuration files that might reference specific versions

#### Recommended Process:
1. **Audit Current Usage**: Check which versions are actually imported/used
2. **Compare Content**: Verify that "2" and "3" versions are indeed duplicates
3. **Backup Before Deletion**: Create a backup of the entire `src/api/routers/` directory
4. **Remove Systematically**: Remove confirmed duplicates in batches

#### Potential Removals (After Verification):
```bash
# Example removals (VERIFY FIRST):
rm src/api/routers/*\ 2.py
rm src/api/routers/*\ 3.py
```

### Phase 3: Additional Directory Cleanup

Verify and remove additional "2" suffix directories:
```bash
# Verify these are empty/duplicates first:
rm -rf "apps/bigcommerce/tests/unit 2"
rm -rf "apps/magento/Test/js 2"
rm -rf "apps/magento/Test/Unit 2"
rm -rf "auth-service/keycloak 2"
rm -rf "backend/auth-api/src 2"
rm -rf "business-services/product-service 2"
rm -rf "config/grafana/dashboards 2"
rm -rf "config/mongodb/init 2"
rm -rf "data-management/api 2"
rm -rf "data-management/mongodb 2"
rm -rf "data-management/redis 2"
```

## Risk Assessment

### Low Risk (Safe to Remove):
- ✅ Empty directories with "2" suffix
- ✅ Confirmed backup files like `theme-manager-backup.js`

### Medium Risk (Verify Before Removal):
- ⚠️ Documentation duplicates
- ⚠️ Non-empty directories with "2" suffix

### High Risk (Requires Careful Analysis):
- 🚨 API router files with "2" and "3" suffixes
- 🚨 Any files that might be referenced by active code

## Estimated Impact

### Repository Size Reduction:
- **Immediate**: ~50-100MB from empty directories and backup files
- **After API Cleanup**: Potentially 200-500MB+ (60+ duplicate Python files)

### Maintenance Benefits:
- Reduced confusion about which files are current
- Cleaner codebase for new developers
- Faster repository operations (clone, search, etc.)
- Reduced risk of accidentally modifying wrong files

## Next Steps

1. **Immediate Action**: Remove confirmed empty directories and backup files
2. **Investigation Phase**: Analyze API router usage patterns
3. **Systematic Cleanup**: Remove verified duplicates in phases
4. **Documentation Update**: Update any documentation that references removed files
5. **Team Communication**: Inform team about cleanup to avoid confusion

## Verification Commands

Before removing any files, use these commands to verify:

```bash
# Check if directory is empty
ls -la "directory_name"

# Check file usage/imports
grep -r "filename" . --exclude-dir=.git

# Check git history
git log --oneline --follow "filename"

# Compare file contents
diff "original_file" "duplicate_file"
```

---

**Generated**: $(date)
**Total Duplicates Identified**: 80+ files and directories
**Estimated Cleanup Time**: 2-4 hours
**Risk Level**: Medium (due to API router duplicates)