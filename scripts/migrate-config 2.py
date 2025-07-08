#!/usr/bin/env python3
"""
Configuration Migration Tool for EyewearML Platform

This script helps migrate from the old configuration system to the new
Pydantic-based configuration architecture with comprehensive validation.

Author: EyewearML Platform Team
Created: 2025-01-11
"""

import os
import sys
import shutil
import json
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import re

# Add the src directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))


class ConfigMigrator:
    """Configuration migration utility"""
    
    def __init__(self, backup_dir: Optional[str] = None):
        self.project_root = Path(__file__).parent.parent
        self.backup_dir = Path(backup_dir) if backup_dir else self.project_root / "backups" / f"config_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.migration_log: List[Dict[str, Any]] = []
        
    def log_action(self, action: str, details: Dict[str, Any], success: bool = True):
        """Log migration action"""
        self.migration_log.append({
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "details": details,
            "success": success
        })
        
        status = "✅" if success else "❌"
        print(f"{status} {action}: {details.get('message', 'Completed')}")
    
    def create_backup(self) -> bool:
        """Create backup of current configuration files"""
        try:
            self.backup_dir.mkdir(parents=True, exist_ok=True)
            
            # Files to backup
            files_to_backup = [
                "src/api/core/config.py",
                ".env",
                ".env.local",
                ".env.development",
                ".env.production",
                "docker-compose.yml",
                "docker-compose.override.yml"
            ]
            
            backed_up_files = []
            for file_path in files_to_backup:
                source = self.project_root / file_path
                if source.exists():
                    dest = self.backup_dir / file_path
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(source, dest)
                    backed_up_files.append(file_path)
            
            # Create backup manifest
            manifest = {
                "backup_created": datetime.now().isoformat(),
                "files_backed_up": backed_up_files,
                "backup_directory": str(self.backup_dir)
            }
            
            with open(self.backup_dir / "backup_manifest.json", 'w') as f:
                json.dump(manifest, f, indent=2)
            
            self.log_action("Create Backup", {
                "message": f"Backed up {len(backed_up_files)} files",
                "backup_dir": str(self.backup_dir),
                "files": backed_up_files
            })
            
            return True
            
        except Exception as e:
            self.log_action("Create Backup", {
                "message": f"Failed to create backup: {e}"
            }, success=False)
            return False
    
    def analyze_current_config(self) -> Dict[str, Any]:
        """Analyze current configuration setup"""
        analysis = {
            "config_files": {},
            "environment_variables": {},
            "issues": [],
            "recommendations": []
        }
        
        # Check existing config files
        config_files = [
            "src/api/core/config.py",
            ".env",
            ".env.example",
            ".env.local",
            ".env.development",
            ".env.production"
        ]
        
        for file_path in config_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                try:
                    with open(full_path, 'r') as f:
                        content = f.read()
                    
                    analysis["config_files"][file_path] = {
                        "exists": True,
                        "size": len(content),
                        "lines": len(content.splitlines()),
                        "has_secrets": self._detect_secrets(content)
                    }
                except Exception as e:
                    analysis["config_files"][file_path] = {
                        "exists": True,
                        "error": str(e)
                    }
            else:
                analysis["config_files"][file_path] = {"exists": False}
        
        # Check environment variables
        env_vars = [
            "DATABASE_URL", "REDIS_URL", "SECRET_KEY", "API_VERSION",
            "ENVIRONMENT", "DEBUG", "CORS_ORIGINS"
        ]
        
        for var in env_vars:
            value = os.environ.get(var)
            analysis["environment_variables"][var] = {
                "set": value is not None,
                "value_length": len(value) if value else 0,
                "is_secret": var in ["SECRET_KEY", "DATABASE_URL", "REDIS_URL"]
            }
        
        # Detect issues
        if not analysis["config_files"]["src/api/core/config.py"]["exists"]:
            analysis["issues"].append("Main config.py file missing")
        
        if not analysis["config_files"][".env.example"]["exists"]:
            analysis["issues"].append("Environment template (.env.example) missing")
        
        if not analysis["environment_variables"]["SECRET_KEY"]["set"]:
            analysis["issues"].append("SECRET_KEY not set")
        
        # Generate recommendations
        if len(analysis["issues"]) > 0:
            analysis["recommendations"].append("Run configuration setup script")
        
        if not analysis["config_files"][".env"]["exists"]:
            analysis["recommendations"].append("Create .env file from .env.example")
        
        return analysis
    
    def migrate_config_file(self) -> bool:
        """Migrate main config.py file to use new architecture"""
        try:
            old_config_path = self.project_root / "src/api/core/config.py"
            new_config_path = self.project_root / "src/api/core/config_new.py"
            
            if not old_config_path.exists():
                self.log_action("Migrate Config File", {
                    "message": "Original config.py not found, skipping migration"
                })
                return True
            
            if not new_config_path.exists():
                self.log_action("Migrate Config File", {
                    "message": "New config architecture not found"
                }, success=False)
                return False
            
            # Read old config to extract custom settings
            with open(old_config_path, 'r') as f:
                old_content = f.read()
            
            # Extract custom configurations
            custom_settings = self._extract_custom_settings(old_content)
            
            # Create migration config that imports from new architecture
            migration_content = self._generate_migration_config(custom_settings)
            
            # Write migration config
            migration_path = old_config_path.with_suffix('.py.migrated')
            with open(migration_path, 'w') as f:
                f.write(migration_content)
            
            # Replace old config with import from new architecture
            replacement_content = f'''"""
Configuration Module for EyewearML Platform (Migrated)

This module now imports from the new Pydantic-based configuration architecture.
The original configuration has been backed up and custom settings preserved.

Migration Date: {datetime.now().isoformat()}
"""

from .config_new import Settings

# Create settings instance with environment-based configuration
settings = Settings()

# Legacy compatibility - expose settings as module-level variables
API_VERSION = settings.API_VERSION
ENVIRONMENT = settings.ENVIRONMENT
DEBUG = settings.DEBUG
HOST = settings.HOST
PORT = settings.PORT

# Database settings
DATABASE_URL = settings.database.url
MONGODB_DATABASE = settings.database.name

# Redis settings
REDIS_URL = settings.redis.url

# Security settings
SECRET_KEY = settings.security.secret_key
CORS_ORIGINS = settings.security.cors_origins

# API settings
API_RATE_LIMIT = settings.api.rate_limit
API_TIMEOUT = settings.api.timeout

# ML settings
ML_MODEL_PATH = settings.ml.model_path
ML_BATCH_SIZE = settings.ml.batch_size

# Logging settings
LOG_LEVEL = settings.LOG_LEVEL
LOG_FORMAT = settings.LOG_FORMAT

# Export settings instance for new code
__all__ = ['settings'] + [
    'API_VERSION', 'ENVIRONMENT', 'DEBUG', 'HOST', 'PORT',
    'DATABASE_URL', 'MONGODB_DATABASE', 'REDIS_URL', 'SECRET_KEY',
    'CORS_ORIGINS', 'API_RATE_LIMIT', 'API_TIMEOUT',
    'ML_MODEL_PATH', 'ML_BATCH_SIZE', 'LOG_LEVEL', 'LOG_FORMAT'
]
'''
            
            with open(old_config_path, 'w') as f:
                f.write(replacement_content)
            
            self.log_action("Migrate Config File", {
                "message": "Successfully migrated config.py to new architecture",
                "backup_created": str(migration_path),
                "custom_settings_count": len(custom_settings)
            })
            
            return True
            
        except Exception as e:
            self.log_action("Migrate Config File", {
                "message": f"Failed to migrate config file: {e}"
            }, success=False)
            return False
    
    def create_environment_files(self) -> bool:
        """Create environment files if they don't exist"""
        try:
            env_example_path = self.project_root / ".env.example"
            
            if not env_example_path.exists():
                self.log_action("Create Environment Files", {
                    "message": ".env.example not found, cannot create environment files"
                }, success=False)
                return False
            
            # Read template
            with open(env_example_path, 'r') as f:
                template_content = f.read()
            
            # Create environment-specific files
            env_files = {
                ".env": "Local development environment",
                ".env.development": "Development environment",
                ".env.staging": "Staging environment",
                ".env.production": "Production environment"
            }
            
            created_files = []
            for env_file, description in env_files.items():
                env_path = self.project_root / env_file
                
                if not env_path.exists():
                    # Customize content for environment
                    env_content = self._customize_env_content(template_content, env_file)
                    
                    with open(env_path, 'w') as f:
                        f.write(f"# {description}\n")
                        f.write(f"# Generated on {datetime.now().isoformat()}\n\n")
                        f.write(env_content)
                    
                    created_files.append(env_file)
            
            self.log_action("Create Environment Files", {
                "message": f"Created {len(created_files)} environment files",
                "files": created_files
            })
            
            return True
            
        except Exception as e:
            self.log_action("Create Environment Files", {
                "message": f"Failed to create environment files: {e}"
            }, success=False)
            return False
    
    def update_docker_config(self) -> bool:
        """Update Docker configuration for new environment system"""
        try:
            docker_compose_path = self.project_root / "docker-compose.yml"
            
            if not docker_compose_path.exists():
                self.log_action("Update Docker Config", {
                    "message": "docker-compose.yml not found, skipping Docker update"
                })
                return True
            
            # Read current docker-compose.yml
            with open(docker_compose_path, 'r') as f:
                content = f.read()
            
            # Add environment file configuration if not present
            if "env_file:" not in content:
                # Insert env_file configuration
                updated_content = self._add_docker_env_config(content)
                
                with open(docker_compose_path, 'w') as f:
                    f.write(updated_content)
                
                self.log_action("Update Docker Config", {
                    "message": "Added environment file configuration to docker-compose.yml"
                })
            else:
                self.log_action("Update Docker Config", {
                    "message": "Docker configuration already includes environment files"
                })
            
            return True
            
        except Exception as e:
            self.log_action("Update Docker Config", {
                "message": f"Failed to update Docker configuration: {e}"
            }, success=False)
            return False
    
    def validate_migration(self) -> bool:
        """Validate the migration was successful"""
        try:
            # Try to import new configuration
            from api.core.config import settings
            
            # Test basic functionality
            test_results = {
                "config_import": True,
                "settings_accessible": hasattr(settings, 'API_VERSION'),
                "database_config": hasattr(settings, 'database'),
                "redis_config": hasattr(settings, 'redis'),
                "security_config": hasattr(settings, 'security')
            }
            
            all_passed = all(test_results.values())
            
            self.log_action("Validate Migration", {
                "message": "Migration validation completed",
                "all_tests_passed": all_passed,
                "test_results": test_results
            }, success=all_passed)
            
            return all_passed
            
        except Exception as e:
            self.log_action("Validate Migration", {
                "message": f"Migration validation failed: {e}"
            }, success=False)
            return False
    
    def _detect_secrets(self, content: str) -> bool:
        """Detect if content contains secrets"""
        secret_patterns = [
            r'SECRET_KEY\s*=\s*["\'][^"\']+["\']',
            r'PASSWORD\s*=\s*["\'][^"\']+["\']',
            r'API_KEY\s*=\s*["\'][^"\']+["\']',
            r'TOKEN\s*=\s*["\'][^"\']+["\']'
        ]
        
        for pattern in secret_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        return False
    
    def _extract_custom_settings(self, content: str) -> Dict[str, str]:
        """Extract custom settings from old config"""
        custom_settings = {}
        
        # Simple extraction of variable assignments
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                try:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip()
                    
                    # Skip common settings that are handled by new architecture
                    if key not in ['DATABASE_URL', 'REDIS_URL', 'SECRET_KEY', 'DEBUG']:
                        custom_settings[key] = value
                except:
                    continue
        
        return custom_settings
    
    def _generate_migration_config(self, custom_settings: Dict[str, str]) -> str:
        """Generate migration configuration content"""
        content = '''"""
Custom Configuration Settings (Migrated)

This file contains custom settings that were preserved during migration.
Review these settings and integrate them into the new configuration architecture.
"""

# Custom settings preserved from old configuration:
'''
        
        for key, value in custom_settings.items():
            content += f"{key} = {value}\n"
        
        content += '''
# TODO: Review and integrate these settings into the new Pydantic configuration
# in src/api/core/config_new.py
'''
        
        return content
    
    def _customize_env_content(self, template_content: str, env_file: str) -> str:
        """Customize environment content for specific environment"""
        content = template_content
        
        # Environment-specific customizations
        if env_file == ".env":
            content = content.replace("ENVIRONMENT=production", "ENVIRONMENT=local")
            content = content.replace("DEBUG=false", "DEBUG=true")
        elif env_file == ".env.development":
            content = content.replace("ENVIRONMENT=production", "ENVIRONMENT=development")
            content = content.replace("DEBUG=false", "DEBUG=true")
        elif env_file == ".env.staging":
            content = content.replace("ENVIRONMENT=production", "ENVIRONMENT=staging")
            content = content.replace("DEBUG=false", "DEBUG=false")
        
        return content
    
    def _add_docker_env_config(self, docker_content: str) -> str:
        """Add environment file configuration to docker-compose.yml"""
        # Simple insertion - in a real implementation, you'd want to parse YAML properly
        lines = docker_content.split('\n')
        updated_lines = []
        
        for line in lines:
            updated_lines.append(line)
            # Add env_file after service definition
            if 'services:' in line:
                updated_lines.append('    env_file:')
                updated_lines.append('      - .env')
                updated_lines.append('      - .env.local')
        
        return '\n'.join(updated_lines)
    
    def generate_migration_report(self) -> str:
        """Generate migration report"""
        report = f"""
# Configuration Migration Report

**Migration Date:** {datetime.now().isoformat()}
**Backup Directory:** {self.backup_dir}

## Migration Summary

Total Actions: {len(self.migration_log)}
Successful: {sum(1 for log in self.migration_log if log['success'])}
Failed: {sum(1 for log in self.migration_log if not log['success'])}

## Migration Log

"""
        
        for log_entry in self.migration_log:
            status = "✅ SUCCESS" if log_entry['success'] else "❌ FAILED"
            report += f"### {log_entry['action']} - {status}\n"
            report += f"**Time:** {log_entry['timestamp']}\n"
            report += f"**Details:** {log_entry['details']}\n\n"
        
        report += """
## Next Steps

1. Review the migration log above for any failed actions
2. Test the application with the new configuration system
3. Run the validation script: `python scripts/validate-config.py`
4. Run the test script: `python scripts/test-environment.py`
5. Update any custom code that directly imports old configuration variables

## Rollback Instructions

If you need to rollback the migration:

1. Stop the application
2. Restore files from the backup directory: `{backup_dir}`
3. Remove the new configuration files
4. Restart the application

## Support

If you encounter issues, check the backup files and migration log for details.
""".format(backup_dir=self.backup_dir)
        
        return report


def main():
    """Main migration function"""
    print("🔄 Starting Configuration Migration")
    print("="*60)
    
    migrator = ConfigMigrator()
    
    # Step 1: Analyze current configuration
    print("📊 Analyzing current configuration...")
    analysis = migrator.analyze_current_config()
    
    print(f"Found {len(analysis['config_files'])} config files")
    print(f"Found {len(analysis['issues'])} issues")
    
    if analysis['issues']:
        print("⚠️  Issues found:")
        for issue in analysis['issues']:
            print(f"  - {issue}")
    
    # Step 2: Create backup
    print("\n💾 Creating backup...")
    if not migrator.create_backup():
        print("❌ Backup failed. Aborting migration.")
        sys.exit(1)
    
    # Step 3: Migrate configuration
    print("\n🔄 Migrating configuration...")
    success = True
    
    success &= migrator.migrate_config_file()
    success &= migrator.create_environment_files()
    success &= migrator.update_docker_config()
    
    # Step 4: Validate migration
    print("\n✅ Validating migration...")
    success &= migrator.validate_migration()
    
    # Step 5: Generate report
    print("\n📋 Generating migration report...")
    report = migrator.generate_migration_report()
    
    report_path = migrator.project_root / "migration_report.md"
    with open(report_path, 'w') as f:
        f.write(report)
    
    print(f"Migration report saved to: {report_path}")
    
    # Summary
    print("\n" + "="*60)
    if success:
        print("✅ Migration completed successfully!")
        print(f"📁 Backup created at: {migrator.backup_dir}")
        print("📋 Next steps:")
        print("  1. Review the migration report")
        print("  2. Test your application")
        print("  3. Run: python scripts/validate-config.py")
        print("  4. Run: python scripts/test-environment.py")
    else:
        print("❌ Migration completed with errors!")
        print("📋 Please review the migration log and fix any issues.")
        print(f"📁 Backup available at: {migrator.backup_dir}")
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()