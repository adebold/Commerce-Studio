"""
Unit tests for disaster recovery scenarios.

These tests cover disaster recovery workflows for System Administrators,
including data backup, restoration, and system resilience during failures.
"""

import unittest
from unittest.mock import MagicMock, patch, mock_open
import json
import os
import tempfile
from datetime import datetime, timedelta
import uuid

from src.auth.tenant import (
    TenantManager, Tenant, TenantSettings, 
    JSONFileStorageBackend, AuditLogEntry
)


class TestDisasterRecoveryBackup(unittest.TestCase):
    """Test cases for disaster recovery backup operations."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Create temporary files for testing
        self.temp_dir = tempfile.TemporaryDirectory()
        self.tenants_file = os.path.join(self.temp_dir.name, "tenants.json")
        self.audit_logs_file = os.path.join(self.temp_dir.name, "audit_logs.json")
        
        # Create storage backend
        self.storage_backend = JSONFileStorageBackend(
            tenants_file=self.tenants_file,
            audit_logs_file=self.audit_logs_file
        )
        
        # Create tenant manager
        self.tenant_manager = TenantManager(storage_backend=self.storage_backend)
        
        # Create test tenants
        self.tenant1 = self.tenant_manager.create_tenant(
            name="Tenant 1",
            domain="tenant1.example.com",
            admin_email="admin@tenant1.example.com",
            plan="basic"
        )
        
        self.tenant2 = self.tenant_manager.create_tenant(
            name="Tenant 2",
            domain="tenant2.example.com",
            admin_email="admin@tenant2.example.com",
            plan="premium"
        )
        
        # Create some audit logs
        for i in range(5):
            self.tenant_manager._add_audit_log(
                tenant_id=self.tenant1.id,
                user_id="test-admin",
                action=f"test.action.{i}",
                details={"test": f"detail {i}"}
            )
    
    def tearDown(self):
        """Clean up after tests."""
        self.temp_dir.cleanup()
    
    def test_backup_to_json_files(self):
        """Test backing up tenant data to JSON files."""
        # Verify tenant data was saved to file
        self.assertTrue(os.path.exists(self.tenants_file))
        self.assertTrue(os.path.exists(self.audit_logs_file))
        
        # Read tenant data from file
        with open(self.tenants_file, 'r') as f:
            tenants_data = json.load(f)
            
        # Verify tenant data
        self.assertEqual(len(tenants_data), 2)
        self.assertIn(self.tenant1.id, tenants_data)
        self.assertIn(self.tenant2.id, tenants_data)
        self.assertEqual(tenants_data[self.tenant1.id]["name"], "Tenant 1")
        self.assertEqual(tenants_data[self.tenant2.id]["name"], "Tenant 2")
        
        # Read audit logs from file
        with open(self.audit_logs_file, 'r') as f:
            logs_data = json.load(f)
            
        # Verify audit logs
        self.assertEqual(len(logs_data), 7)  # 5 test logs + 2 tenant creation logs
        
    def test_create_backup_snapshot(self):
        """Test creating a backup snapshot of tenant data."""
        # Create backup directory
        backup_dir = os.path.join(self.temp_dir.name, "backup")
        os.makedirs(backup_dir, exist_ok=True)
        
        # Create backup timestamp
        backup_timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        
        # Create backup files
        tenants_backup = os.path.join(backup_dir, f"tenants_{backup_timestamp}.json")
        logs_backup = os.path.join(backup_dir, f"audit_logs_{backup_timestamp}.json")
        
        # Copy current files to backup
        with open(self.tenants_file, 'r') as src, open(tenants_backup, 'w') as dst:
            dst.write(src.read())
            
        with open(self.audit_logs_file, 'r') as src, open(logs_backup, 'w') as dst:
            dst.write(src.read())
            
        # Verify backup files exist
        self.assertTrue(os.path.exists(tenants_backup))
        self.assertTrue(os.path.exists(logs_backup))
        
        # Verify backup files contain the same data
        with open(self.tenants_file, 'r') as f1, open(tenants_backup, 'r') as f2:
            self.assertEqual(f1.read(), f2.read())
            
        with open(self.audit_logs_file, 'r') as f1, open(logs_backup, 'r') as f2:
            self.assertEqual(f1.read(), f2.read())


class TestDisasterRecoveryRestore(unittest.TestCase):
    """Test cases for disaster recovery restore operations."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Create temporary files for testing
        self.temp_dir = tempfile.TemporaryDirectory()
        self.tenants_file = os.path.join(self.temp_dir.name, "tenants.json")
        self.audit_logs_file = os.path.join(self.temp_dir.name, "audit_logs.json")
        
        # Create backup files
        self.backup_dir = os.path.join(self.temp_dir.name, "backup")
        os.makedirs(self.backup_dir, exist_ok=True)
        
        self.tenants_backup = os.path.join(self.backup_dir, "tenants_backup.json")
        self.logs_backup = os.path.join(self.backup_dir, "audit_logs_backup.json")
        
        # Create test data for backup files
        tenant_id1 = str(uuid.uuid4())
        tenant_id2 = str(uuid.uuid4())
        
        tenants_data = {
            tenant_id1: {
                "id": tenant_id1,
                "name": "Backup Tenant 1",
                "domain": "backup-tenant1.example.com",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "settings": {
                    "sso_enabled": False,
                    "sso_providers": [],
                    "mfa_enabled": True,
                    "mfa_required": False,
                    "password_policy": {
                        "min_length": 8,
                        "require_uppercase": True,
                        "require_lowercase": True,
                        "require_numbers": True,
                        "require_special_chars": True,
                        "password_expiry_days": 90,
                        "prevent_password_reuse": 5
                    },
                    "session_timeout_minutes": 60,
                    "allowed_domains": [],
                    "custom_branding": {},
                    "api_rate_limits": {"requests_per_minute": 60, "burst_limit": 100},
                    "feature_flags": {}
                },
                "status": "active",
                "plan": "basic",
                "billing_email": "admin@backup-tenant1.example.com",
                "technical_contact_email": "admin@backup-tenant1.example.com"
            },
            tenant_id2: {
                "id": tenant_id2,
                "name": "Backup Tenant 2",
                "domain": "backup-tenant2.example.com",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "settings": {
                    "sso_enabled": True,
                    "sso_providers": [],
                    "mfa_enabled": True,
                    "mfa_required": True,
                    "password_policy": {
                        "min_length": 12,
                        "require_uppercase": True,
                        "require_lowercase": True,
                        "require_numbers": True,
                        "require_special_chars": True,
                        "password_expiry_days": 60,
                        "prevent_password_reuse": 10
                    },
                    "session_timeout_minutes": 30,
                    "allowed_domains": [],
                    "custom_branding": {},
                    "api_rate_limits": {"requests_per_minute": 120, "burst_limit": 200},
                    "feature_flags": {}
                },
                "status": "active",
                "plan": "enterprise",
                "billing_email": "admin@backup-tenant2.example.com",
                "technical_contact_email": "admin@backup-tenant2.example.com"
            }
        }
        
        log_id1 = str(uuid.uuid4())
        log_id2 = str(uuid.uuid4())
        
        logs_data = {
            log_id1: {
                "id": log_id1,
                "tenant_id": tenant_id1,
                "user_id": "system",
                "action": "tenant.create",
                "details": {"name": "Backup Tenant 1", "domain": "backup-tenant1.example.com"},
                "timestamp": datetime.utcnow().isoformat()
            },
            log_id2: {
                "id": log_id2,
                "tenant_id": tenant_id2,
                "user_id": "system",
                "action": "tenant.create",
                "details": {"name": "Backup Tenant 2", "domain": "backup-tenant2.example.com"},
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        # Write test data to backup files
        with open(self.tenants_backup, 'w') as f:
            json.dump(tenants_data, f, indent=2)
            
        with open(self.logs_backup, 'w') as f:
            json.dump(logs_data, f, indent=2)
    
    def tearDown(self):
        """Clean up after tests."""
        self.temp_dir.cleanup()
    
    def test_restore_from_backup(self):
        """Test restoring tenant data from backup files."""
        # Copy backup files to main files
        with open(self.tenants_backup, 'r') as src, open(self.tenants_file, 'w') as dst:
            dst.write(src.read())
            
        with open(self.logs_backup, 'r') as src, open(self.audit_logs_file, 'w') as dst:
            dst.write(src.read())
        
        # Create storage backend with restored files
        storage_backend = JSONFileStorageBackend(
            tenants_file=self.tenants_file,
            audit_logs_file=self.audit_logs_file
        )
        
        # Create tenant manager and load from storage
        tenant_manager = TenantManager(storage_backend=storage_backend)
        tenant_manager.load_from_storage()
        
        # Verify tenants were loaded
        self.assertEqual(len(tenant_manager._tenants), 2)
        
        # Get tenant IDs from backup data
        with open(self.tenants_backup, 'r') as f:
            backup_data = json.load(f)
            tenant_ids = list(backup_data.keys())
        
        # Verify tenant data
        for tenant_id in tenant_ids:
            tenant = tenant_manager.get_tenant(tenant_id)
            self.assertIsNotNone(tenant)
            self.assertEqual(tenant.id, tenant_id)
            
            backup_tenant = backup_data[tenant_id]
            self.assertEqual(tenant.name, backup_tenant["name"])
            self.assertEqual(tenant.domain, backup_tenant["domain"])
            self.assertEqual(tenant.plan, backup_tenant["plan"])
            
        # Verify domain mappings
        for tenant_id in tenant_ids:
            backup_tenant = backup_data[tenant_id]
            domain = backup_tenant["domain"]
            self.assertEqual(tenant_manager._domains[domain], tenant_id)
            
        # Verify audit logs
        for tenant_id in tenant_ids:
            self.assertIn(tenant_id, tenant_manager._audit_logs)
            self.assertEqual(len(tenant_manager._audit_logs[tenant_id]), 1)  # One creation log per tenant


class TestSystemResilience(unittest.TestCase):
    """Test cases for system resilience during failures."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.storage_backend = MagicMock()
        self.tenant_manager = TenantManager(storage_backend=self.storage_backend)
        
        # Create a test tenant
        self.test_tenant = self.tenant_manager.create_tenant(
            name="Test Tenant",
            domain="test-tenant.example.com",
            admin_email="admin@test-tenant.example.com",
            plan="basic"
        )
        
        # Reset the mock to clear the create_tenant call
        self.storage_backend.reset_mock()
    
    def test_handle_storage_failure_during_save(self):
        """Test handling storage failures during save operations."""
        # Configure storage backend to fail on save
        self.storage_backend.save_tenant.side_effect = Exception("Storage failure")
        
        # Update tenant (should not raise exception despite storage failure)
        try:
            updated_tenant = self.tenant_manager.update_tenant(
                tenant_id=self.test_tenant.id,
                user_id="test-admin",
                updates={"name": "Updated Name"}
            )
            
            # Verify tenant was updated in memory
            self.assertEqual(updated_tenant.name, "Updated Name")
            
            # Verify storage backend was called
            self.storage_backend.save_tenant.assert_called_once()
        except Exception as e:
            self.fail(f"update_tenant raised exception: {str(e)}")
    
    def test_handle_storage_failure_during_delete(self):
        """Test handling storage failures during delete operations."""
        # Configure storage backend to fail on delete
        self.storage_backend.delete_tenant.side_effect = Exception("Storage failure")
        
        # Delete tenant (should not raise exception despite storage failure)
        try:
            result = self.tenant_manager.delete_tenant(
                tenant_id=self.test_tenant.id,
                user_id="test-admin"
            )
            
            # Verify tenant was deleted from memory
            self.assertTrue(result)
            self.assertNotIn(self.test_tenant.id, self.tenant_manager._tenants)
            
            # Verify storage backend was called
            self.storage_backend.delete_tenant.assert_called_once_with(self.test_tenant.id)
        except Exception as e:
            self.fail(f"delete_tenant raised exception: {str(e)}")
    
    def test_handle_storage_failure_during_load(self):
        """Test handling storage failures during load operations."""
        # Configure storage backend to fail on load
        self.storage_backend.load_tenants.side_effect = Exception("Storage failure")
        self.storage_backend.load_audit_logs.side_effect = Exception("Storage failure")
        
        # Load from storage (should not raise exception despite storage failure)
        try:
            self.tenant_manager.load_from_storage()
            
            # Verify storage backend was called
            self.storage_backend.load_tenants.assert_called_once()
            self.storage_backend.load_audit_logs.assert_called_once()
        except Exception as e:
            self.fail(f"load_from_storage raised exception: {str(e)}")


if __name__ == "__main__":
    unittest.main()