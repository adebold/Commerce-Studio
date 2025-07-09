# Duplicate Files Report - Commerce Studio Project

## Summary
This report identifies duplicate files in the Commerce Studio project based on naming patterns indicating duplicates (files with " 2", " 3", etc. in their names).

## Total Duplicate Files Found
- Files with " 2" suffix: 726 files
- Files with " 3" suffix: 1 file
- Files with " 4" suffix: 0 files

## Duplicate Files by Category

### 1. Configuration Files
| Original File | Duplicate File(s) | Directory |
|---------------|-------------------|-----------|
| .github/dependabot.yml | .github/dependabot 2.yml | .github/ |
| alembic.ini | alembic 2.ini | Root |
| nginx.staging.conf | nginx.staging 2.conf | Root |
| docker-compose.yml | docker-compose 2.yml | Multiple directories |
| package.json | package 2.json | Multiple directories |
| package-lock.json | package-lock 2.json | Multiple directories |
| tsconfig.json | tsconfig 2.json | Multiple directories |

### 2. Documentation Files (Markdown)
| Original File | Duplicate File(s) | Directory |
|---------------|-------------------|-----------|
| aigi.md | aigi 2.md, aigi 3.md | Root |
| README.md | README 2.md | Multiple directories |
| DATABASE.md | DATABASE 2.md | Root |
| DEPLOYMENT.md | DEPLOYMENT 2.md | Root |
| implementation_execution_guide_LS2.md | implementation_execution_guide_LS2 2.md | Root |
| MANUFACTURER_SPARC_ARCHITECTURE_LS7.md | MANUFACTURER_SPARC_ARCHITECTURE_LS7 2.md | Root |

### 3. Scripts and Automation
#### Python Scripts
| Original File | Duplicate File(s) | Directory |
|---------------|-------------------|-----------|
| scripts/validate-config.py | scripts/validate-config 2.py | scripts/ |
| scripts/verify_env_vars.py | scripts/verify_env_vars 2.py | scripts/ |
| scripts/start_api.py | scripts/start_api 2.py | scripts/ |
| scripts/setup.py | scripts/setup 2.py | scripts/ |
| database-scripts/*.py | database-scripts/* 2.py | database-scripts/ |

#### Shell Scripts
| Original File | Duplicate File(s) | Directory |
|---------------|-------------------|-----------|
| scripts/setup-monitoring.sh | scripts/setup-monitoring 2.sh | scripts/ |
| scripts/setup-environment.sh | scripts/setup-environment 2.sh | scripts/ |
| scripts/quick-deploy.sh | scripts/quick-deploy 2.sh | scripts/ |
| deploy/scripts/deploy.sh | deploy/scripts/deploy 2.sh | deploy/scripts/ |

#### PowerShell Scripts
| Original File | Duplicate File(s) | Directory |
|---------------|-------------------|-----------|
| scripts/upload_gcp_secrets.ps1 | scripts/upload_gcp_secrets 2.ps1 | scripts/ |
| scripts/start-unified-database.ps1 | scripts/start-unified-database 2.ps1 | scripts/ |
| api-gateway/start-gateway.ps1 | api-gateway/start-gateway 2.ps1 | api-gateway/ |

### 4. Website/Frontend Files
| Original File | Duplicate File(s) | Directory |
|---------------|-------------------|-----------|
| website/website-screenshot.png | website/website-screenshot 2.png | website/ |
| website/current-website.html | website/current-website 2.html | website/ |
| website/app_marketplace.html | website/app_marketplace 2.html | website/ |
| website/test-*.js | website/test-* 2.js | website/ |

### 5. API and Service Files
#### TypeScript Files
| Original File | Duplicate File(s) | Directory |
|---------------|-------------------|-----------|
| auth/AuthService.ts | auth/AuthService 2.ts | auth/ |
| auth/RoleService.ts | auth/RoleService 2.ts | auth/ |
| auth/TenantService.ts | auth/TenantService 2.ts | auth/ |
| auth/VaraiClient.ts | auth/VaraiClient 2.ts | auth/ |

#### JavaScript Files
| Original File | Duplicate File(s) | Directory |
|---------------|-------------------|-----------|
| auth/AuthService.js | auth/AuthService 2.js | auth/ |
| auth/RoleService.js | auth/RoleService 2.js | auth/ |
| auth/TenantService.js | auth/TenantService 2.js | auth/ |
| auth/VaraiClient.js | auth/VaraiClient 2.js | auth/ |

### 6. GitHub Workflows
| Original File | Duplicate File(s) | Directory |
|---------------|-------------------|-----------|
| .github/workflows/ci.yml | .github/workflows/ci 2.yml | .github/workflows/ |
| .github/workflows/cd.yml | .github/workflows/cd 2.yml | .github/workflows/ |
| .github/workflows/deploy.yml | .github/workflows/deploy 2.yml | .github/workflows/ |
| .github/workflows/dast.yml | .github/workflows/dast 2.yml | .github/workflows/ |

### 7. Documentation Portal
| Original File | Duplicate File(s) | Directory |
|---------------|-------------------|-----------|
| docs/api/index.html | docs/api/index 2.html | docs/api/ |
| docs/api/playground.html | docs/api/playground 2.html | docs/api/ |
| docs/api/swagger-ui.html | docs/api/swagger-ui 2.html | docs/api/ |
| docs/api/components/*.tsx | docs/api/components/* 2.tsx | docs/api/components/ |

### 8. Terraform Configuration
| Original File | Duplicate File(s) | Directory |
|---------------|-------------------|-----------|
| terraform/main.tf | terraform/main 2.tf | terraform/ |
| terraform/environments/*/main.tf | terraform/environments/*/main 2.tf | terraform/environments/ |
| terraform/modules/*/main.tf | terraform/modules/*/main 2.tf | terraform/modules/ |

## Key Observations

1. **Widespread Duplication**: Duplicates exist across all major directories and file types
2. **Multiple Duplicates**: Some files have both " 2" and " 3" versions (e.g., aigi.md)
3. **Critical Files**: Many critical configuration and deployment files have duplicates
4. **Code Duplication**: Both TypeScript and JavaScript versions of the same files exist with duplicates

## Recommendations

1. **Immediate Action Required**:
   - Review critical configuration files (docker-compose, package.json, etc.)
   - Check GitHub workflows for conflicts
   - Verify which version of deployment scripts are being used

2. **Cleanup Strategy**:
   - Create a backup before removing any files
   - Use version control to identify which files are newer
   - Consider using git history to understand why duplicates were created

3. **Prevention**:
   - Implement file naming conventions
   - Use version control branching instead of creating duplicate files
   - Add pre-commit hooks to prevent duplicate file creation

## Most Critical Duplicates to Address

1. **GitHub Actions Workflows** - May cause deployment conflicts
2. **Docker and Deployment Configurations** - Could lead to incorrect deployments
3. **Package Configuration Files** - May cause dependency conflicts
4. **Database Scripts** - Risk of data inconsistency
5. **Authentication Services** - Security implications

## Next Steps

1. Review each duplicate pair to determine which is the current/correct version
2. Check git history for each duplicate to understand creation context
3. Create a cleanup plan prioritizing critical system files
4. Implement preventive measures to avoid future duplications